// src/auth/auth.controller.ts

// This file is the "front door" for login and registration requests.
// It takes what the user sent (email, password, name), calls the right helper functions,
// and sends back a nice reply.
// It does NOT do the heavy work (like checking passwords or saving to database) — it just organizes everything.

import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { cookieOptions } from "./auth.utils.js";

// This function runs when someone tries to register (create new account)
export const register = async (
  req: Request, // What the user sent (email, password, name)
  res: Response, // The reply we will send back
  next: NextFunction, // If something goes wrong, pass the problem here
) => {
  try {
    const user = await AuthService.register(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// This function runs when someone tries to log in
export const login = async (
  req: Request, // What the user sent (email + password)
  res: Response, // The reply we send back
  next: NextFunction, // Pass problems here if something fails
) => {
  try {
    const result = await AuthService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, cookieOptions);

    res.json({
      message: "Login successful",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};
