// src/modules/user/user.service.ts

// This file contains the core business logic for user profile operations.
// It enforces ownership rules, sanitizes input, and performs safe database updates.
// No HTTP or request-specific concerns live here — only domain logic.

import { prisma } from "../../lib/prisma.js";
import type { UpdateProfileDTO } from "./user.dto.js";
import { AppError } from "../../middlewares/error.middleware.js";

export class UserService {
  static async updateProfile(userId: string, data: UpdateProfileDTO) {
    // Prevent empty updates (no fields sent)
    if (Object.keys(data).length === 0) {
      throw new AppError("No fields provided to update", 400);
    }

    // Explicitly destructure allowed fields (prevents over-posting / mass assignment)
    const { name, bio } = data;

    // Build clean update object — omit any undefined fields
    // This avoids TS errors with exactOptionalPropertyTypes and lets Prisma leave omitted fields unchanged
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // If somehow nothing survived (shouldn't happen), throw
    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  static async getOwnProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  static async getPublicProfile(userId: string) {
    const [user, followerCount, followingCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.follow.count({
        where: { followingId: userId },
      }),
      prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      ...user,
      followerCount,
      followingCount,
    };
  }
}
