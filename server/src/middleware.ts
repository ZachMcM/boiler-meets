import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import { auth } from "./utils/auth";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Check if user is banned
  if (session.user.isBanned) {
    res.status(403).json({ error: "Account has been banned" });
    return;
  }

  res.locals.userId = session.user.id;
  next();
};
