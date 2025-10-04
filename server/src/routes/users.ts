import { Router } from "express";
import { authMiddleware } from "../middleware";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { user } from "../db/schema";

export const usersRoute = Router()

usersRoute.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const userResult = await db.query.user.findFirst({
      where: eq(user.id, req.params.id),
      columns: {
        username: true,
        image: true,
        name: true
      }
    })

    res.json(userResult)
  } catch (error) {
    res.status(500).json({ error: error ?? "Server Eerror" })
  }
})