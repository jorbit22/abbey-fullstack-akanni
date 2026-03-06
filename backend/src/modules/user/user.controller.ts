// src/modules/user/user.controller.ts

// This file handles the HTTP layer for user profile endpoints.
// It extracts the authenticated user from the guard, calls the service layer,
// and formats the response. It stays thin — no business rules here.

import type { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const updateOwnProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const updated = await UserService.updateProfile(userId, req.body);

    res.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const getOwnProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const profile = await UserService.getOwnProfile(userId);

    res.json({
      message: "Own profile retrieved",
      user: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const targetUserId = req.params.id;

    // Guard: make sure it's a single string (not array or missing)
    if (!targetUserId || Array.isArray(targetUserId)) {
      throw new AppError("Invalid or missing user ID", 400);
    }

    const profile = await UserService.getPublicProfile(targetUserId);

    res.json({
      message: "Public profile retrieved",
      user: profile,
    });
  } catch (err) {
    next(err);
  }
};
