// src/modules/user/user.routes.ts

// This file maps HTTP endpoints to user profile operations.
// It applies authentication protection and input validation.
// All routes in this module are related to the "User" domain.

import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  updateOwnProfile,
  getOwnProfile,
  getPublicProfile,
  getUsers,
} from "./user.controller.js";
import { updateProfileSchema } from "./user.dto.js";
import { authGuard } from "../auth/auth.guard.js"; // adjust path if needed

const router = express.Router();

// Update own profile (partial update — PATCH is correct REST choice)
router.patch("/me", authGuard, validate(updateProfileSchema), updateOwnProfile);

// Get own profile (convenient alias for /auth/me)
router.get("/me", authGuard, getOwnProfile);

router.get("/:id", getPublicProfile);

router.get("/", getUsers);

export default router;
