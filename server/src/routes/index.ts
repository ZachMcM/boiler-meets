import express from "express";
import { usersRoute } from "./users";
import { messagesRoute } from "./messages";
import { unitTestsRoute } from "./unit_tests";
import { reportsRoute } from "./reports";
import { callsRoute } from "./calls";
import recommendationsRoute from "./recommendations";

export const routes = express.Router();

routes.use(usersRoute);
routes.use(messagesRoute);
routes.use(unitTestsRoute);
routes.use(reportsRoute);
routes.use(callsRoute);
routes.use(recommendationsRoute);

routes.get("/login", async (_req, res) => {
    res.redirect(`${process.env.CLIENT_URL!}/login`);
});

routes.get("/reset_password", async (_req, res) => {
  const token = _req.url.split("reset_password")[1]; // Have to find the token like this b/c of CSP on browsers with http
  if (token) {
    res.redirect(`${process.env.CLIENT_URL!}/reset_password_final${token}`);
  } else {
    res.redirect(`${process.env.CLIENT_URL!}/login`);
  }
});

routes.get("/delete-account", async (_req, res) => {
  const token = _req.query.token as string;
  if (token) {
    res.redirect(`${process.env.CLIENT_URL!}/delete-account?token=${token}`);
  } else {
    res.redirect(`${process.env.CLIENT_URL!}/login`);
  }
});
