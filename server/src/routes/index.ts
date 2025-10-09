import express from "express";
import { usersRoute } from "./users";
import { unitTestsRoute } from "./unit_tests";

export const routes = express.Router();

routes.use(usersRoute);
routes.use(unitTestsRoute);