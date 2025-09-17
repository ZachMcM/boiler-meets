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

  res.locals.userId = session.user.id;
  next();
};
