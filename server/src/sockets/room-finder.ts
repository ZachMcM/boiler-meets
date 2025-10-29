import { Socket } from "socket.io";
import { logger } from "../logger";
import { redis } from "../redis";
import { v4 as uuidv4 } from "uuid";
import { io } from "..";
import { db } from "../db";
import { inArray } from "drizzle-orm";
import { user } from "../db/schema";
import { computeCompatibility } from "../lib/algorithm";

export async function addToQueue(
  userId: string,
  matchType: "friend" | "romantic"
) {
  await redis.rPush(`room-finder:queue:${matchType}`, userId);
}

export async function removeFromQueue(
  userId: string,
  matchType: "friend" | "romantic"
) {
  await redis.lRem(`room-finder:queue:${matchType}`, 0, userId);
}

const MAX_CANDIDATES = 100;

export async function getPair(matchType: "friend" | "romantic"): Promise<{
  user1: string;
  user2: string;
} | null> {
  const queueKey = `room-finder:queue:${matchType}`;

  // simple pairing for friendships, anyone can be friends 😁
  if (matchType === "friend") {
    const user1 = await redis.lPop(queueKey);
    if (!user1) return null;

    const user2 = await redis.lPop(queueKey);
    if (!user2) {
      await redis.lPush(queueKey, user1);
      return null;
    }

    return { user1, user2 };
  }

  const user1 = await redis.lPop(queueKey);
  if (!user1) return null;

  try {
    const queue = await redis.lRange(queueKey, 0, MAX_CANDIDATES - 1);

    if (queue.length === 0) {
      await redis.lPush(queueKey, user1);
      return null;
    }

    // Batch fetch all users at once for performance
    const allUserIds = [user1, ...queue];
    const allUsers = await db.query.user.findMany({
      where: inArray(user.id, allUserIds),
    });

    // Create a map for O(1) lookups
    const userMap = new Map(allUsers.map((u) => [u.id, u]));
    const user1Data = userMap.get(user1)!;

    const compatibilityScores = [] as { userId: string; score: number }[];

    for (const user2Id of queue) {
      const user2Data = userMap.get(user2Id)!;

      const score = await computeCompatibility(user1Data, user2Data);
      if (score >= 0) {
        compatibilityScores.push({ userId: user2Id, score });
      }
    }

    if (compatibilityScores.length === 0) {
      await redis.lPush(queueKey, user1);
      return null;
    }

    compatibilityScores.sort((a, b) => b.score - a.score);

    for (const candidate of compatibilityScores) {
      const removed = await redis.lRem(queueKey, 1, candidate.userId);
      if (removed > 0) {
        logger.info(
          `Matched ${user1} with ${candidate.userId} (score: ${candidate.score})`
        );
        return { user1, user2: candidate.userId };
      }

      logger.debug(
        `User ${candidate.userId} already claimed, trying next match`
      );
    }

    await redis.lPush(queueKey, user1);
    return null;
  } catch (error) {
    logger.error(`Error in getPair: ${error}`);
    // Put user1 back on error
    await redis.lPush(queueKey, user1);
    return null;
  }
}

export async function roomFinderHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string | undefined;
  const matchType = socket.handshake.auth.matchType as
    | "friend"
    | "romantic"
    | undefined;

  if (userId === undefined || typeof userId !== "string") {
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

  logger.info(
    `User connected to room-finder namespace with matchType: ${matchType}`
  );

  socket.join(userId);

  await addToQueue(userId, matchType);

  const tryFindRoom = async () => {
    try {
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

        logger.info(
          `Room found between users ${user1} and ${user2} for ${matchType}: ${roomId}`
        );
      }
    } catch (error) {
      logger.error(`There was an error finding a room, error: ${error}`);
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
