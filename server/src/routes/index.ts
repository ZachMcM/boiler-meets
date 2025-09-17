import express from "express";

export const routes = express.Router();

routes.get("/", async (_req, res) => {
  res.json({ message: "Index route" })
})