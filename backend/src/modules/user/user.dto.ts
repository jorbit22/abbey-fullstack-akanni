// src/modules/user/user.dto.ts

// This file defines the allowed shape of data when a user updates their profile.
// It uses Zod to validate and clean incoming requests before they reach the service layer.
// All fields are optional — the user can send only the fields they want to change.

import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .optional(),
  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters" })
    .optional(),
  // Future fields can be added here — e.g. jobTitle, interests, avatarUrl
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
