// src/auth/auth.guard.ts

// This file is the "security guard" for protected parts of the app.
// It checks if the person making the request is really logged in.
// If not, it says "No entry" and stops them from seeing private info.
// It runs before any protected route (like /me or future profile changes).

import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.utils.js";
import { prisma } from "../../lib/prisma.js";

// This function is the guard itself — Express calls it automatically before protected routes
export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Malformed token" });
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;

  next();
};
