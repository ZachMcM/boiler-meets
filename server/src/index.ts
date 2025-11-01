import express from "express";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketServer } from "./sockets";
import cors from "cors";
import { routes } from "./routes";
import morgan from "morgan";
import { logger } from "./logger";
import { auth } from "./utils/auth";
import { redis } from "./redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { RoomManager } from "./utils/room-manager";

const port = process.env.PORT;

const app = express();

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL!,
    credentials: true,
  },
});

// Configure Redis adapter for Socket.IO
const pubClient = redis.duplicate();
const subClient = redis.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("Socket.IO Redis adapter configured");
  })
  .catch((error) => {
    logger.error("Failed to configure Socket.IO Redis adapter:", error);
  });

socketServer(io);

app.use(
  cors({
    origin: process.env.CLIENT_URL!,
    credentials: true,
  })
);
app.use(morgan("combined"));
app.all("/api/auth/*splat", toNodeHandler(auth));
// app.all("/api/auth/reset-password/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "10mb" }));
app.use("/", routes);

httpServer.listen(port, () => {
  logger.info(`Server is running on port ${port}`);

  // Start room cleanup interval (runs every hour)
  RoomManager.startCleanupInterval();
});
