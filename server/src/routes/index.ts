import express from "express";
import { usersRoute } from "./users";
import { messagesRoute } from "./messages";
import { unitTestsRoute } from "./unit_tests";
import { reportsRoute } from "./reports";

export const routes = express.Router();

routes.use(usersRoute);
routes.use(messagesRoute);
routes.use(unitTestsRoute);
routes.use(reportsRoute)

routes.get("/login", async (_req, res) => {
  res.redirect(`${process.env.CLIENT_URL!}/login`);
});
