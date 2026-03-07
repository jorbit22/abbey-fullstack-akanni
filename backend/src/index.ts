import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { prisma } from "./lib/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import followRouter from "./modules/follow/follow.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://abbeyfrontend.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1", followRouter);

const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/v1")) {
    return res.status(404).json({
      message: "API route not found",
      path: req.originalUrl,
    });
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
