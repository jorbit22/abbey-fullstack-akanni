// src/auth/auth.service.ts

// This file is the "back office" for all login and registration work.
// It does the real important jobs: checking if email is already used, hashing passwords, saving users, checking login details, creating login keys, and handling logout.
// It never talks directly to the user — it only does the behind-the-scenes work when asked by the front desk (controller/routes).

import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import type { RegisterDTO, LoginDTO } from "./auth.dto.js";
import { generateAccessToken, generateRefreshToken } from "./auth.utils.js";
import { AppError } from "../../middlewares/error.middleware.js";
import jwt from "jsonwebtoken";

// This class holds all the important login/registration jobs
export class AuthService {
  // Job 1: Create a new user (registration)
  static async register(data: RegisterDTO) {
    // Step 1: Check if this email is already used by someone else
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error("EMAIL_TAKEN");
    }

    // Step 2: Turn the password into a secret code (hash) so it's safe to store
    // 12 rounds = strong protection (takes a tiny bit longer but much harder to crack)
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Step 3: Prepare the data to save (email + secret code + name or nothing)
    const createData = {
      email: data.email,
      passwordHash,
      name: data.name ?? null, // If no name given, save null (database likes null better than undefined)
    };

    // Step 4: Save the new user in the database
    // Only save safe info back (never return the secret password code)
    return prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  // Job 2: Let someone sign in (login)
  static async login(data: LoginDTO) {
    // Step 1: Look for the user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true, // Need this to check password
      },
    });

    // Step 2: If no user found OR password doesn't match → say "wrong details" (same message for both to keep hackers guessing)
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Step 3: Create two login keys
    // Access token — short key (expires fast) for using the app right now
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Refresh token — long key (expires slow) for quietly getting new access keys later
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Step 4: Delete any old refresh keys for this user (rotation — keeps things fresh and safe)
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    // Step 5: Save the new refresh key in database (so we can check it later)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    // Step 6: Send back the keys and safe user info
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Job 3: Refresh — quietly get new access key when old one expires
  static async refresh(refreshToken: string) {
    // If no refresh key → say "log in again"
    if (!refreshToken) {
      throw new AppError("No refresh token", 401);
    }

    // Check if the refresh key is real and not expired
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as { userId: string };

    // Look for this exact refresh key in database
    const stored = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() }, // still valid (not expired)
      },
    });

    // If key not found or expired → say "invalid key"
    if (!stored) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    // Rotation: delete old refresh key
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    // Create new keys
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    // Save new refresh key
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send back new keys
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Job 4: Logout — kill the session
  static async logout(refreshToken: string) {
    // If there is a refresh key, delete it from database so it can't be used again
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    // Note: we don't delete access token here — it will die naturally when it expires (short life)
  }
}
