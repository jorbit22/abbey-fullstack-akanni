// src/types/express.d.ts

import { User } from "@prisma/client";

// Extend Express Request type so req.user is typed and safe to use
declare module "express-serve-static-core" {
  interface Request {
    // Optional user object attached after auth middleware
    // Explicitly exclude passwordHash to prevent accidental exposure
    user?: Omit<User, "passwordHash">;
  }
}
