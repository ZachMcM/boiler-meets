import { Server } from "socket.io";
import { roomFinderHandler } from "./room-finder";
import { videoChatHandler } from "./video-chat";

export function socketServer(io: Server) {
  io.of("/room-finder").on("connection", roomFinderHandler);
  io.of("/video-chat").on("connection", videoChatHandler);
}