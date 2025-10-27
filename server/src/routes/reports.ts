import { Router } from "express";
import { authMiddleware } from "../middleware";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../utils/r2";
import { db } from "../db";
import { report } from "../db/schema";
import { logger } from "../logger";

export const reportsRoute = Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

reportsRoute.post(
  "/reports",
  authMiddleware,
  upload.single("audio"),
  async (req, res) => {
    try {
      const { submissionDetails, incomingUserId, outgoingUserId } = req.body;
      const audioFile = req.file;

      // Validate required fields
      if (!submissionDetails || !incomingUserId || !outgoingUserId) {
        return res.status(400).json({
          error: "Missing required fields: submissionDetails, incomingUserId, outgoingUserId",
        });
      }

      if (!audioFile) {
        return res.status(400).json({
          error: "No audio file provided",
        });
      }

      // Generate unique filename for R2
      const timestamp = Date.now();
      const filename = `reports/${outgoingUserId}-${incomingUserId}-${timestamp}.webm`;

      // Upload to Cloudflare R2
      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: audioFile.buffer,
        ContentType: audioFile.mimetype,
      });

      await r2.send(uploadCommand);
      logger.info(`Audio file uploaded to R2: ${filename}`);

      // Construct public URL for the audio file
      const audioFileUrl = `${R2_PUBLIC_URL}/${filename}`;

      // Insert report into database
      const [newReport] = await db
        .insert(report)
        .values({
          submissionDetails,
          incomingUserId,
          outgoingUserId,
          audioFileUrl,
        })
        .returning();

      logger.info(`Report created with ID: ${newReport.id}`);

      res.status(201).json({
        message: "Report submitted successfully",
        reportId: newReport.id,
      });
    } catch (error) {
      logger.error("Error submitting report:", error);
      res.status(500).json({
        error: "Failed to submit report",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
