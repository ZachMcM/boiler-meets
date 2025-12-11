import { Server } from "socket.io";
import { roomFinderHandler } from "./room-finder";
import { videoChatHandler } from "./video-chat";
import { messagingHandler } from "./messaging";
import { directCallHandler } from "./direct-call";
import { userStatusHandler } from "./user-status";

export function socketServer(io: Server) {
  io.of("/room-finder").on("connection", roomFinderHandler);
  io.of("/video-chat").on("connection", videoChatHandler);
  io.of("/messaging").on("connection", messagingHandler);
  io.of("/direct-call").on("connection", directCallHandler); // handle direct call between matched users
  io.of("/user-status").on("connection", userStatusHandler);
}