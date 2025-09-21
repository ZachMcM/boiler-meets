import express from "express";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketServer } from "./sockets";
import cors from "cors";
import { routes } from "./routes";
import morgan from "morgan";
import { logger } from "./logger";
import { auth } from "./utils/auth";

const port = process.env.PORT;

const app = express();

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

socketServer(io);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "10mb" }));
app.use("/", routes);

httpServer.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
