// src/middlewares/validate.middleware.ts

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: z.ZodSchema, part: RequestPart = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[part];

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return res.status(400).json({
        message: `Invalid ${part} parameters`,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Only overwrite body (allowed)
    if (part === "body") {
      req.body = result.data;
    }

    next();
  };
