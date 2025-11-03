import { Router } from "express";
import { authMiddleware } from "../middleware";
import { db } from "../db";
import { eq, and, or, desc, SQL } from "drizzle-orm";
import { callHistory } from "../db/schema";
import type { Request, Response } from "express";

export const callsRoute = Router();

// Save a call record
callsRoute.post("/calls", authMiddleware, async (req, res) => {
  try {
    const { calledUserId, callType, callDuration, wasMatched } = req.body;
    const callerUserId = res.locals.userId;

    if (!calledUserId || !callType || callDuration === undefined || !callerUserId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (callType !== "friend" && callType !== "romantic") {
      return res.status(400).json({ error: "Invalid call type" });
    }

    const [newCall] = await db
      .insert(callHistory)
      .values({
        callerUserId: callerUserId as string,
        calledUserId,
        callType: callType as "friend" | "romantic",
        callDuration,
        wasMatched: wasMatched || false,
      })
      .returning();

    res.status(201).json(newCall);
  } catch (error) {
    console.error("create call record error:", error);
    res.status(500).json({ error: "server error" });
  }
});

// Get call history between current user and another user
callsRoute.get("/calls/:otherUserId", authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = res.locals.userId;

    if (!otherUserId || !userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const calls = await db
      .select()
      .from(callHistory)
      .where(
        or(
          and(
            eq(callHistory.callerUserId, userId as string),
            eq(callHistory.calledUserId, otherUserId)
          ),
          and(
            eq(callHistory.callerUserId, otherUserId),
            eq(callHistory.calledUserId, userId as string)
          )
        )
      )
      .orderBy(desc(callHistory.callTimestamp));

    res.json(calls);
  } catch (error) {
    console.error("get calls error:", error);
    res.status(500).json({ error: "server error" });
  }
});

type CallType = "friend" | "romantic";

// Get all calls for current user
callsRoute.get("/calls", authMiddleware, async (req: Request<{}, any, any, { type?: CallType }>, res: Response) => {
  try {
    const userId = res.locals.userId;
    const { type } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }
    
    let query = db
      .select()
      .from(callHistory)
      .where(
        or(
          eq(callHistory.callerUserId, userId as string),
          eq(callHistory.calledUserId, userId as string)
        )
      );

    if (type === "friend" || type === "romantic") {
      const typeFilter = eq(callHistory.callType, type);
      query = db.select().from(callHistory).where(and(
        or(
          eq(callHistory.callerUserId, userId as string),
          eq(callHistory.calledUserId, userId as string)
        ),
        typeFilter
      ));
    }

    const calls = await query.orderBy(desc(callHistory.callTimestamp));
    res.json(calls);
  } catch (error) {
    console.error("get all calls error:", error);
    res.status(500).json({ error: "server error" });
  }
});