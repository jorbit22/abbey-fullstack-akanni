// src/auth/auth.utils.ts

import jwt from "jsonwebtoken";

// Generates short-lived JWT access token (15 min expiry)
// Used in Authorization: Bearer header for protected routes
export const generateAccessToken = (payload: {
  userId: string;
  email: string;
}) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
};

// Generates long-lived refresh token (7 days)
// Stored in httpOnly cookie, used only for token refresh
export const generateRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

// Verifies access token from header
// Returns payload if valid, null if invalid/expired/tampered
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
};

// Cookie settings for refresh token
// httpOnly + secure + strict sameSite = strong protection against XSS/CSRF
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
