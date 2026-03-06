// src/modules/follow/follow.controller.ts

// This file handles HTTP requests for follow-related actions.
// It extracts the current user from authGuard and delegates to the service.

import type { Request, Response, NextFunction } from "express";
import { FollowService } from "./follow.service.js";
import type { PaginationDTO } from "./follow.dto.js";

/**
 * Utility to safely extract a string param from Express params
 */
const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) {
    if (!param[0]) {
      throw new Error("Missing required parameter");
    }
    return param[0];
  }

  if (!param) {
    throw new Error("Missing required parameter");
  }

  return param;
};

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const followerId = req.user!.id;
    const followingId = getParam(req.params.userId);

    const result = await FollowService.follow(followerId, followingId);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const followerId = req.user!.id;
    const followingId = getParam(req.params.userId);

    const result = await FollowService.unfollow(followerId, followingId);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    // Query params validated earlier in route layer
    const pagination = req.query as unknown as PaginationDTO;

    const data = await FollowService.getFollowing(userId, pagination);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getMyFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const pagination = req.query as unknown as PaginationDTO;

    const data = await FollowService.getFollowers(userId, pagination);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getFollowStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = req.user!.id;
    const targetUserId = getParam(req.params.id);

    const status = await FollowService.getFollowStatus(
      currentUserId,
      targetUserId,
    );

    res.json(status);
  } catch (err) {
    next(err);
  }
};
