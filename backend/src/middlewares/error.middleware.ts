// src/middlewares/error.middleware.ts

// This file catches ALL mistakes that happen while the app is running.
// Instead of the app crashing or showing scary messages to users,
// we handle every error nicely and send a clean reply.

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

// This is the main function that catches every error in the app.
// Express automatically calls this when something goes wrong in any route.
export const errorHandler = (
  err: unknown, // The error that happened (could be anything)
  req: Request, // Information about what the user asked for
  res: Response, // The reply we will send back to the user
  next: NextFunction, // We don't use this here, but Express needs it
) => {
  // Print the error in the terminal so we (developers) can see what went wrong
  console.error("Global error:", err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => issue.message),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { error: err.stack }),
    });
  }

  res.status(500).json({ message: "Internal server error" });
};
