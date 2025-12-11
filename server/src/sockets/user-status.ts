import { Server, Socket } from "socket.io";
import { redis } from "../redis";
import { logger } from "../logger";

interface UserStatus {
  userId: string;
  status: "online" | "in-call" | "offline";
  lastSeen: number;
}

export async function userStatusHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string;

  if (!userId) {
    socket.disconnect();
    return;
  }

  logger.info(`User ${userId} connected (status set to online)`);
  await setUserStatus(userId, "online");
  
  socket.broadcast.emit("user-status-changed", {
    userId,
    status: "online",
  });

  socket.on("update-status", async ({ status }: { status: "online" | "in-call" }) => {
    logger.info(`User ${userId} status changed to ${status}`);
    await setUserStatus(userId, status);
    socket.broadcast.emit("user-status-changed", { userId, status });
  });

  socket.on("disconnect", async () => {
    logger.info(`User ${userId} disconnected (status set to offline)`);
    await setUserStatus(userId, "offline");
    socket.broadcast.emit("user-status-changed", {
      userId,
      status: "offline",
    });
  });

  socket.on("request-statuses", async ({ userIds }: { userIds: string[] }) => {
    const statuses = await getUserStatuses(userIds);
    socket.emit("statuses-batch", statuses);
  });
}

async function setUserStatus(userId: string, status: "online" | "in-call" | "offline") {
  const userStatus: UserStatus = {
    userId,
    status,
    lastSeen: Date.now(),
  };
  
  await redis.set(`user-status:${userId}`, JSON.stringify(userStatus), {
    EX: 3600,
  });
}

async function getUserStatuses(userIds: string[]): Promise<Record<string, UserStatus>> {
  const statuses: Record<string, UserStatus> = {};
  
  for (const userId of userIds) {
    const statusStr = await redis.get(`user-status:${userId}`);
    if (statusStr) {
      const status = JSON.parse(statusStr) as UserStatus;
      statuses[userId] = status;
    } else {
      statuses[userId] = {
        userId,
        status: "offline",
        lastSeen: Date.now(),
      };
    }
  }
  
  return statuses;
}

export async function updateUserCallStatus(io: Server, userId: string, inCall: boolean) {
  const status = inCall ? "in-call" : "online";
  await setUserStatus(userId, status);
  io.of("/user-status").emit("user-status-changed", { userId, status });
}