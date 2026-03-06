// src/index.ts

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { prisma } from "./lib/prisma.js"; // Prisma singleton
import authRouter from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/api/v1/health", async (req, res) => {
  try {
    await prisma.$connect();
    await prisma.$disconnect();

    res.status(200).json({
      status: "ok",
      message: "Abbey challenge backend running, DB connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("DB health check failed:", err);
    res.status(500).json({
      status: "error",
      message: "Backend running but DB connection failed",
    });
  }
});

// Mount auth routes
app.use("/api/v1/auth", authRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
    path: req.originalUrl,
  });
});

// Global error handler (centralized)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
