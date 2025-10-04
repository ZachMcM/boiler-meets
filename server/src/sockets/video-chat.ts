import { Socket } from "socket.io";
import { logger } from "../logger";
import { io } from "..";
import {
  WebRTCOffer,
  WebRTCAnswer,
  WebRTCIceCandidate,
} from "../types/webrtc";
import { RoomManager } from "../utils/room-manager";

export async function videoChatHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId as string | undefined;
  let roomId = socket.handshake.auth.roomId as string | string[] | undefined;

  logger.info(`Video chat connection - userId: ${userId}, roomId: ${JSON.stringify(roomId)}, type: ${typeof roomId}`);

  if (!userId || typeof userId !== "string") {
    socket.emit("error", { message: "Invalid or missing userId" });
    socket.disconnect();
    return;
  }

  if (!roomId || typeof roomId !== "string") {
    logger.warn(`Invalid roomId after processing - value: ${JSON.stringify(roomId)}, type: ${typeof roomId}`);
    socket.emit("error", { message: "Invalid or missing roomId" });
    socket.disconnect();
    return;
  }

  // Verify user is part of this room
  const isAuthorized = await RoomManager.isUserInRoom(userId, roomId);
  if (!isAuthorized) {
    socket.emit("error", { message: "Room not found or user not authorized" });
    socket.disconnect();
    return;
  }

  logger.info(`User ${userId} joined video chat room ${roomId}`);

  // Join the room
  socket.join(roomId);

  // Get all sockets currently in the room (before this user joined)
  const socketsInRoom = await io.of("/video-chat").in(roomId).fetchSockets();
  const otherUsers = socketsInRoom
    .map(s => s.handshake.auth.userId as string)
    .filter(id => id !== userId);

  // Tell the new user about existing users
  if (otherUsers.length > 0) {
    logger.info(`Notifying ${userId} about existing users: ${otherUsers.join(", ")}`);
    for (const otherUserId of otherUsers) {
      socket.emit("user-ready", { userId: otherUserId });
    }
  }

  // Notify other users that this user joined and is ready
  socket.to(roomId).emit("user-ready", { userId });

  // Handle WebRTC signaling events
  socket.on("offer", (data: WebRTCOffer) => {
    logger.info(`Offer received from ${userId} in room ${roomId}`);
    socket.to(roomId).emit("offer", { offer: data.offer, from: userId });
  });

  socket.on("answer", (data: WebRTCAnswer) => {
    logger.info(`Answer received from ${userId} in room ${roomId}`);
    socket.to(roomId).emit("answer", { answer: data.answer, from: userId });
  });

  socket.on("ice-candidate", (data: WebRTCIceCandidate) => {
    logger.info(`ICE candidate received from ${userId} in room ${roomId}`);
    socket.to(roomId).emit("ice-candidate", { candidate: data.candidate, from: userId });
  });

  socket.on("disconnect", async () => {
    logger.info(`User ${userId} disconnected from video chat room ${roomId}`);

    // Notify the other user
    socket.to(roomId).emit("user-left", { userId });

    // Check if room is empty and clean up
    const socketsInRoom = await io.of("/video-chat").in(roomId).fetchSockets();
    if (socketsInRoom.length === 0) {
      logger.info(`Room ${roomId} is empty, cleaning up`);
      await RoomManager.deleteRoom(roomId);
    }
  });

  socket.on("leave-room", async () => {
    logger.info(`User ${userId} left video chat room ${roomId}`);

    // Notify the other user
    socket.to(roomId).emit("user-left", { userId });

    // Remove user from room
    socket.leave(roomId);

    // Check if room is empty and clean up
    const socketsInRoom = await io.of("/video-chat").in(roomId).fetchSockets();
    if (socketsInRoom.length === 0) {
      logger.info(`Room ${roomId} is empty, cleaning up`);
      await RoomManager.deleteRoom(roomId);
    }

    socket.disconnect();
  });
}