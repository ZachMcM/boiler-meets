import { Router } from "express";
import { authMiddleware } from "../middleware";
import multer from "multer";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../utils/r2";
import { logger } from "../logger";

export const imagesRoute = Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

imagesRoute.post("/images/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const userId = res.locals.userId;
    const file = req.file;

    if (!userId) return res.status(401).json({ error: "unauthorized" });
    if (!file) return res.status(400).json({ error: "no image provided" });

    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `images/${userId}-${timestamp}${ext}`;

    logger.info(`Uploading image to R2: ${filename}`);

    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await r2.send(uploadCommand);

    const imageUrl = `${R2_PUBLIC_URL}/${filename}`;

    res.status(201).json({ imageUrl });
  } catch (error) {
    logger.error("Error uploading image:", error);
    res.status(500).json({ error: "failed to upload image" });
  }
});
