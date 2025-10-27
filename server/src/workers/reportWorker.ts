import { eq } from "drizzle-orm";
import { db } from "../db";
import { logger } from "../logger";
import { reportQueue } from "../queues/reportQueue";
import { report, reportInvestigations, user, session } from "../db/schema";
import { openaiClient } from "../utils/openai";
import { toFile as openaiToFile } from "openai";
import { io } from "../index";

export const REPORT_HANDLER_ID = (reportId: number) =>
  `report-${reportId}-handler`;

const MIN_REPORTS_FOR_INVESTIGATION = 3;

const INVESTIGATION_PROMPT = `
You are a report investigation bot for a
meeting / dating app called Boilermeets, 
designed for Purdue university students. Boilermeets 
involves Purdue students joining randomized video calls
to find dates or friends instead of just swiping left or right.
You will be given a audio transcription, the number of previous reports 
for a user, the comments on the previous reports and the details that 
the reporting user submitted in the report. Your job is to determine 
the severity of the offense and if they should be banned and also 
provide comments on your investigation.
`;

export async function enqueueReportHandlerWorker(reportId: number) {
  const jobId = REPORT_HANDLER_ID(reportId);

  const existingJob = await reportQueue.getJob(jobId);
  if (existingJob) {
    await existingJob.remove();
  }

  await reportQueue.add(
    "report-handler",
    {
      reportId,
    },
    {
      jobId,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(`Enqueued report handler worker for report ${reportId}`);
}

export async function handleReport(reportId: number) {
  const reportData = await db.query.report.findFirst({
    where: eq(report.id, reportId),
  });

  if (!reportData) {
    logger.warn(`Invalid reportId ${reportId}`);
    return;
  }

  const offendingUserReports = await db.query.report.findMany({
    where: eq(report.incomingUserId, reportData.incomingUserId),
    with: {
      reportInvestigation: true,
    },
  });

  if (offendingUserReports.length < MIN_REPORTS_FOR_INVESTIGATION) {
    logger.info(
      `User ${reportData.incomingUserId} only has ${offendingUserReports.length} reports, ${MIN_REPORTS_FOR_INVESTIGATION} are needed for investigation.`
    );
    return;
  }

  const audioFileRes = await fetch(reportData.audioFileUrl);
  const audioFileBuffer = Buffer.from(await audioFileRes.arrayBuffer());

  const audioFile = await openaiToFile(audioFileBuffer, "audio.webm", {
    type: "audio/webm",
  });

  const transcription = await openaiClient.audio.transcriptions.create({
    model: "gpt-4o-mini-transcribe",
    file: audioFile,
  });

  const openaiChatBotInvestigation = await openaiClient.chat.completions.create(
    {
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: INVESTIGATION_PROMPT,
        },
        {
          role: "user",
          content: `
          Previous reports: ${offendingUserReports.length}. 
          Previous report investigations: ${JSON.stringify(
            offendingUserReports.map((r) => {
              return {
                botComments: r.reportInvestigation?.botComments,
                severity: r.reportInvestigation?.severity,
              };
            })
          )}
          Audio File transcription: ${transcription.text}
        `,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "report_investigation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              severity: {
                type: "string",
                enum: ["none", "low", "medium", "high", "ban"],
              },
              botComments: { type: "string" },
            },
            required: ["severity", "botComments"],
            additionalProperties: false,
          },
        },
      },
    }
  );

  if (!openaiChatBotInvestigation.choices[0].message.content) {
    logger.error(
      `There was an error in chatbot investigation for report ${reportId}`
    );
    return;
  }

  const investigationResult = JSON.parse(
    openaiChatBotInvestigation.choices[0].message.content
  ) as { botComments: string; severity: string };

  const [investigation] = await db
    .insert(reportInvestigations)
    .values({
      reportId,
      botComments: investigationResult.botComments,
      severity: investigationResult.severity as any,
      aiTranscription: transcription.text,
    })
    .returning();

  if (investigation.severity == "ban") {
    const [bannedUser] = await db
      .update(user)
      .set({
        isBanned: true,
      })
      .where(eq(user.id, reportData.incomingUserId))
      .returning();

    // Invalidate all sessions for the banned user
    await db.delete(session).where(eq(session.userId, bannedUser.id));

    // Emit Socket.IO event to disconnect the banned user immediately
    io.emit("user-banned", { userId: bannedUser.id });

    logger.info(
      `Bot decided on banning ${bannedUser.id} due to report ${reportId}. Investigation ID: ${investigation.id}. Sessions invalidated and disconnect event emitted.`
    );
  }
}
