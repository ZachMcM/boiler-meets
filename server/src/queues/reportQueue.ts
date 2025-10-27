import { Queue, Worker } from "bullmq";
import { logger } from "../logger";
import { handleReport } from "../workers/reportWorker";

const connection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PW,
};

export const reportQueue = new Queue("report-handler", {
  connection,
});

const reportWorker = new Worker(
  "report-handler",
  async (job) => {
    const { reportId } = job.data as { reportId?: number };

    if (!reportId) {
      return;
    }

    logger.info(`Worker handling report ${reportId}`);

    try {
      await handleReport(reportId);
    } catch (error) {
      logger.error(`There was an error handling a report ${error}`,);
    }
  },
  {
    connection,
  }
);

reportWorker.on("completed", (job) => {
  logger.info(`Report handler job ${job.id} completed`);
});

reportWorker.on("failed", (job, err) => {
  logger.error(`Report handler job ${job?.id} failed:`, err);
});

process.on("SIGTERM", async () => {
  await reportWorker.close();
  await reportWorker.close();
});
