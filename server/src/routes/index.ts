import express from "express";
import { usersRoute } from "./users";
import { messagesRoute } from "./messages";

export const routes = express.Router();

routes.use(usersRoute);
routes.use(messagesRoute);
