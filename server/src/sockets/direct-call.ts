import { Socket } from "socket.io";
import { logger } from "../logger";
import { io } from "..";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../redis";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

export async function directCallHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string | undefined;

  if (!userId || typeof userId !== "string") {
    logger.warn(`Rejected direct-call connection - Invalid userId: ${userId}`);
    socket.emit("error", { message: "Invalid or missing userId" });
    socket.disconnect();
    return;
  }

  logger.info(`User ${userId} connected to direct-call namespace`);

  // join the user's personal room so we can send them direct calls
  socket.join(userId);

  socket.on("initiate-call", async ({ targetUserId, matchType }: { targetUserId: string; matchType: string }) => {
    try {
      logger.info(`User ${userId} initiating call to ${targetUserId}`);

      // check if target user is online
      const targetSockets = await io.of("/direct-call").in(targetUserId).fetchSockets();
      if (targetSockets.length === 0) {
        socket.emit("user-offline");
        return;
      }

      // get caller's name from database
      const callerData = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { name: true },
      });

      if (!callerData) {
        socket.emit("error", { message: "Caller not found" });
        return;
      }

      // create a new room for this call
      const roomId = uuidv4();
      await redis.hSet(
        "room",
        roomId,
        JSON.stringify({ user1: userId, user2: targetUserId, matchType, createdAt: Date.now() })
      );

      logger.info(`Created room ${roomId} for direct call between ${userId} and ${targetUserId}`);

      // send call request to the target user
      io.of("/direct-call").to(targetUserId).emit("incoming-call", {
        callerId: userId,
        callerName: callerData.name,
        roomId,
        matchType,
      });

      // store caller's socket for response
      socket.join(`pending-call:${roomId}`);
    } catch (error) {
      logger.error("Error initiating call:", error);
      socket.emit("error", { message: "Failed to initiate call" });
    }
  });

  socket.on("accept-call", async ({ roomId }: { roomId: string }) => {
    try {
      logger.info(`User ${userId} accepted call in room ${roomId}`);

      // get room data to find the caller
      const roomDataStr = await redis.hGet("room", roomId);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        const callerId = roomData.user1 === userId ? roomData.user2 : roomData.user1;

        // notify caller that call was accepted
        io.of("/direct-call").to(callerId).emit("call-accepted", { roomId });
      }
    } catch (error) {
      logger.error("Error accepting call:", error);
    }
  });

  socket.on("decline-call", async ({ roomId }: { roomId: string }) => {
    try {
      logger.info(`User ${userId} declined call in room ${roomId}`);

      // get room data to find the caller
      const roomDataStr = await redis.hGet("room", roomId);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        const callerId = roomData.user1 === userId ? roomData.user2 : roomData.user1;

        // notify caller that call was declined
        io.of("/direct-call").to(callerId).emit("call-declined");
      }

      // clean up the room since call was declined
      await redis.hDel("room", roomId);
    } catch (error) {
      logger.error("Error declining call:", error);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User ${userId} disconnected from direct-call namespace`);
  });
}
