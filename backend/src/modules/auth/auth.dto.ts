// src/auth/auth.dto.ts

// This file is like a "checklist" for what the user must send when registering or logging in.
// It makes sure the data (email, password, name) is in the right shape and format.
// If something is missing or wrong, it stops the request early and tells the user exactly what to fix.
// This prevents bad or dangerous data from reaching the database.

import { z } from "zod";

// Checklist for when someone wants to create a new account (register)
export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),

  name: z.string().optional(),
});

// Checklist for when someone wants to log in
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),

  password: z.string().min(1, { message: "Password required" }),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
