import express from "express";

export const routes = express.Router();

routes.get("/", async (_req, res) => {
  res.json({ message: "Index route" })
})

routes.get("/login", async (_req, res) => {
  // Redirect to the client-side dashboard after verification
  res.redirect("http://localhost:3000/login");
})