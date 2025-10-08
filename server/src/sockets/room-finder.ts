import { Socket } from "socket.io";
import { logger } from "../logger";
import { redis } from "../redis";
import { v4 as uuidv4 } from "uuid";
import { io } from "..";

export async function addToQueue(userId: string, matchType: "friend" | "romantic") {
  await redis.rPush(`room-finder:queue:${matchType}`, userId);
}

export async function removeFromQueue(userId: string, matchType: "friend" | "romantic") {
  await redis.lRem(`room-finder:queue:${matchType}`, 0, userId);
}

export async function getPair(matchType: "friend" | "romantic"): Promise<{
  user1: string;
  user2: string;
} | null> {
  const queue = await redis.lRange(`room-finder:queue:${matchType}`, 0, -1);

  for (let i = 0; i < queue.length; i++) {
    const user1 = queue[i];

    for (let j = i + 1; j < queue.length; j++) {
      const user2 = queue[j];

      // TODO check if user1 information matches user2 information and only return if match

      await removeFromQueue(user1, matchType);
      await removeFromQueue(user2, matchType);

      return { user1, user2 };
    }
  }

  return null;
}

export async function roomFinderHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string | undefined;
  const matchType = socket.handshake.auth.matchType as "friend" | "romantic" | undefined;

  if (userId == undefined || typeof userId !== "string") {
    logger.warn(`Rejected connection - Invalid userId: ${userId}`);
    socket.emit("error", { message: "Invalid or missing userId" });
    socket.disconnect();
    return;
  }

  if (!matchType || (matchType !== "friend" && matchType !== "romantic")) {
    logger.warn(`Rejected connection - Invalid matchType: ${matchType}`);
    socket.emit("error", { message: "Invalid or missing matchType" });
    socket.disconnect();
    return;
  }

  logger.info(`User connected to room-finder namespace with matchType: ${matchType}`);

  socket.join(userId);

  await addToQueue(userId, matchType);

  const tryFindRoom = async () => {
    const pair = await getPair(matchType);

    if (pair) {
      const { user1, user2 } = pair;

      const roomId = uuidv4();

      await redis.hSet(
        "room",
        roomId,
        JSON.stringify({ user1, user2, matchType, createdAt: Date.now() })
      );

      io.of("room-finder").to(user1).emit("room-found", { roomId });
      io.of("room-finder").to(user2).emit("room-found", { roomId });

      logger.info(`Room found between users ${user1} and ${user2} for ${matchType}: ${roomId}`);
    }
  };

  tryFindRoom();

  socket.on("disconnect", () => {
    logger.info(`User ${userId} disconnected`);
    removeFromQueue(userId, matchType);
  });

  socket.on("cancel-find-room", () => {
    logger.info(`User ${userId} cancelled the room finder`);
    removeFromQueue(userId, matchType);
    socket.disconnect();
  });
}
