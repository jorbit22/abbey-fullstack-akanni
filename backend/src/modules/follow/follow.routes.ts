// src/modules/follow/follow.routes.ts

// This file defines all follow-related endpoints.
// All are protected by authGuard.

import express from "express";
import { authGuard } from "../auth/auth.guard.js";
import {
  followUser,
  unfollowUser,
  getMyFollowing,
  getMyFollowers,
  getFollowStatus,
} from "./follow.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { paginationSchema } from "./follow.dto.js";

const router = express.Router();

// Follow a user
router.post("/follows/:userId", authGuard, followUser);

// Unfollow a user
router.delete("/follows/:userId", authGuard, unfollowUser);

// List who I follow (paginated)
router.get(
  "/users/me/following",
  authGuard,
  validate(paginationSchema, "query"),
  getMyFollowing,
);

// List who follows me (paginated)
router.get(
  "/users/me/followers",
  authGuard,
  validate(paginationSchema, "query"),
  getMyFollowers,
);

// Check follow status for a specific user
router.get("/users/:id/follow-status", authGuard, getFollowStatus);

export default router;
