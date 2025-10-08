import { redis } from "../redis";
import { logger } from "../logger";
import { RoomData } from "../types/webrtc";

export class RoomManager {
  static async getRoomData(roomId: string): Promise<RoomData | null> {
    const roomDataStr = await redis.hGet("room", roomId);
    if (!roomDataStr) {
      return null;
    }
    return JSON.parse(roomDataStr) as RoomData;
  }

  static async deleteRoom(roomId: string): Promise<void> {
    await redis.hDel("room", roomId);
    logger.info(`Room ${roomId} deleted`);
  }

  static async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
    const roomData = await this.getRoomData(roomId);
    if (!roomData) {
      return false;
    }
    return roomData.user1 === userId || roomData.user2 === userId;
  }

  static async cleanupExpiredRooms(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const allRooms = await redis.hGetAll("room");

    let cleanedCount = 0;

    for (const [roomId, roomDataStr] of Object.entries(allRooms)) {
      try {
        const roomData: RoomData = JSON.parse(roomDataStr);
        if (now - roomData.createdAt > maxAgeMs) {
          await this.deleteRoom(roomId);
          cleanedCount++;
        }
      } catch (error) {
        logger.error(`Error parsing room data for ${roomId}:`, error);
        await this.deleteRoom(roomId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired rooms`);
    }
  }

  static async getAllActiveRooms(): Promise<{ [roomId: string]: RoomData }> {
    const allRooms = await redis.hGetAll("room");
    const result: { [roomId: string]: RoomData } = {};

    for (const [roomId, roomDataStr] of Object.entries(allRooms)) {
      try {
        result[roomId] = JSON.parse(roomDataStr) as RoomData;
      } catch (error) {
        logger.error(`Error parsing room data for ${roomId}:`, error);
        await this.deleteRoom(roomId);
      }
    }

    return result;
  }

  static startCleanupInterval(intervalMs: number = 60 * 60 * 1000): NodeJS.Timeout {
    logger.info("Starting room cleanup interval");
    return setInterval(() => {
      this.cleanupExpiredRooms().catch((error) => {
        logger.error("Error during room cleanup:", error);
      });
    }, intervalMs);
  }

  static async setCallAgainState(roomId: string, userId: string, state: boolean): Promise<void> {
    const roomData = await this.getRoomData(roomId);
    if (!roomData) {
      throw new Error(`Room ${roomId} not found`);
    }

    const callAgainKey = `call-again:${roomId}`;
    await redis.hSet(callAgainKey, userId, state.toString());
  }

  static async getCallAgainState(roomId: string): Promise<{ [userId: string]: boolean }> {
    const callAgainKey = `call-again:${roomId}`;
    const state = await redis.hGetAll(callAgainKey);
    return Object.fromEntries(
      Object.entries(state).map(([userId, value]) => [userId, value === 'true'])
    );
  }

  static async resetCallAgainState(roomId: string): Promise<void> {
    const callAgainKey = `call-again:${roomId}`;
    await redis.del(callAgainKey);
  }

  static async setMatchState(roomId: string, userId: string, state: boolean): Promise<void> {
    const roomData = await this.getRoomData(roomId);
    if (!roomData) {
      throw new Error(`Room ${roomId} not found`);
    }

    const matchKey = `match:${roomId}`;
    await redis.hSet(matchKey, userId, state.toString());
  }

  static async getMatchState(roomId: string): Promise<{ [userId: string]: boolean }> {
    const matchKey = `match:${roomId}`;
    const state = await redis.hGetAll(matchKey);
    return Object.fromEntries(
      Object.entries(state).map(([userId, value]) => [userId, value === 'true'])
    );
  }
}