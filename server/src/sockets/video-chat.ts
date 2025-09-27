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
  const roomId = socket.handshake.query.roomId as string | undefined;

  if (!userId || typeof userId !== "string") {
    socket.emit("error", { message: "Invalid or missing userId" });
    socket.disconnect();
    return;
  }

  if (!roomId || typeof roomId !== "string") {
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

  // Notify the other user that someone joined
  socket.to(roomId).emit("user-joined", { userId });

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

  socket.on("ready", () => {
    logger.info(`User ${userId} is ready for WebRTC in room ${roomId}`);
    socket.to(roomId).emit("user-ready", { userId });
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