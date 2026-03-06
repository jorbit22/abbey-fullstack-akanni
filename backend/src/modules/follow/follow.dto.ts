// src/modules/follow/follow.dto.ts

// This file defines validation schemas for follow-related query parameters (pagination, etc.)
// For now it's minimal — we can expand later if needed.

import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(50).default(10).optional(),
});

export type PaginationDTO = z.infer<typeof paginationSchema>;
