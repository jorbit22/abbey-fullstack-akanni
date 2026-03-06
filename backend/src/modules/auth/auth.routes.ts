// src/modules/auth/auth.routes.ts

// This file is the "sign-in desk" of the app.
// It decides what happens when someone tries to register, log in, refresh their session, log out, or see their own info.
// Each "route" is like a different button on the desk — register button, login button, etc.
// It uses helpers (validate, controllers, service) to do the real work safely.

import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { login, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.dto.js";
import { authGuard } from "./auth.guard.js";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { cookieOptions, generateAccessToken } from "./auth.utils.js";
import { AuthService } from "./auth.service.js";

const router = express.Router();

// Button 1: Register (create new account)
router.post("/register", validate(registerSchema), register);

// Button 2: Login (sign in with existing account)
router.post("/login", validate(loginSchema), login);

// Button 3: Refresh (get new access key when old one expires)
router.post("/refresh", async (req, res, next) => {
  try {
    // Get the secret refresh key from the cookie (browser sends it automatically)
    const refreshToken = req.cookies.refreshToken;

    // If no cookie → say "You need to log in again"
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Ask service to check and refresh the session
    const result = await AuthService.refresh(refreshToken);

    // Send new refresh cookie (rotation — old one is deleted)
    res.cookie("refreshToken", result.refreshToken, cookieOptions);

    // Send new short access key
    res.json({
      message: "Token refreshed",
      accessToken: result.accessToken,
    });
  } catch (err) {
    // If something goes wrong (expired token, bad cookie), pass to safety net
    next(err);
  }
});

// Button 4: Logout (sign out)
router.post("/logout", async (req, res, next) => {
  try {
    // Get the refresh key from cookie
    const refreshToken = req.cookies.refreshToken;

    // Tell service to delete this key from database (so it can't be used again)
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    // Tell browser to delete the cookie
    res.clearCookie("refreshToken", { path: "/" });

    // Say "You're signed out"
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

// Button 5: Me (see my own info) — protected by security guard
router.get("/me", authGuard, (req, res) => {
  // Only reaches here if guard said "okay"
  // req.user is already attached by the guard
  res.json({
    message: "Current user info",
    user: req.user,
  });
});

export default router;
