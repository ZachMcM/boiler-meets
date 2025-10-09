import { Server } from "socket.io";
import { roomFinderHandler } from "./room-finder";
import { videoChatHandler } from "./video-chat";
import { messagingHandler } from "./messaging";

export function socketServer(io: Server) {
  io.of("/room-finder").on("connection", roomFinderHandler);
  io.of("/video-chat").on("connection", videoChatHandler);
  io.of("/messaging").on("connection", messagingHandler);
}