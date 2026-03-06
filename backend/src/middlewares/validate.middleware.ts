// src/middlewares/validate.middleware.ts

// This file is like a "gatekeeper" for every request that sends data to the server.
// It checks if the data the user sent is in the correct format and has all required parts.
// If something is wrong (example: email looks fake, password too short), it stops the request and says "fix this" — before the app tries to use bad data.

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// This function creates a "checker" for any specific kind of data (like registration or login)
// You give it a Zod schema (the rules), and it returns a middleware function Express can use
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => issue.message),
      });
    }

    req.body = result.data;

    next();
  };
};
