// src/modules/follow/follow.service.ts

// This file contains the business rules for following/unfollowing users.
// It enforces no self-follows, prevents duplicates, and provides safe queries
// for follower/following lists and status checks.

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type { PaginationDTO } from "./follow.dto.js";

export class FollowService {
  static async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError("Cannot follow yourself", 400);
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existing) {
      throw new AppError("Already following this user", 409);
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { message: "Now following", following: true };
  }

  static async unfollow(followerId: string, followingId: string) {
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (!existing) {
      throw new AppError("Not following this user", 404);
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    return { message: "Unfollowed", following: false };
  }

  static async getFollowing(
    userId: string,
    pagination: PaginationDTO = { page: 1, limit: 10 },
  ) {
    // Ensure numbers (important because query params arrive as strings)
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;

    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        select: {
          following: {
            select: {
              id: true,
              name: true,
              bio: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      following: following.map((f) => f.following),
      total,
      page,
      limit,
    };
  }

  static async getFollowers(
    userId: string,
    pagination: PaginationDTO = { page: 1, limit: 10 },
  ) {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;

    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        select: {
          follower: {
            select: {
              id: true,
              name: true,
              bio: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      followers: followers.map((f) => f.follower),
      total,
      page,
      limit,
    };
  }

  static async getFollowStatus(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return { isFollowing: false, isFollowedBy: false };
    }

    const [isFollowing, isFollowedBy] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: targetUserId,
            followingId: currentUserId,
          },
        },
      }),
    ]);

    return {
      isFollowing: !!isFollowing,
      isFollowedBy: !!isFollowedBy,
    };
  }
}
