// src/lib/prisma.ts

// This file creates and manages our connection to the database.
// It makes sure we only have ONE connection at a time (singleton pattern).
// This prevents wasting resources and crashing when the app reloads during development.

import { PrismaClient } from "../generated/prisma/client.js";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set in .env file. Please check your settings.",
  );
}

const pool = new Pool({ connectionString });

// Tell Prisma to use this pool to connect to our PostgreSQL database
const adapter = new PrismaPg(pool);

// This part makes sure we only create ONE Prisma connection object
// If we make many, the app becomes slow and can crash (especially when saving code in development)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create or reuse the existing Prisma connection
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // Use our PostgreSQL pool
    log: ["query", "info", "warn", "error"], // Show useful messages in the terminal during development
  });

// In development mode only, remember this connection so the next reload reuses it
// This prevents creating too many connections when we save and reload the code
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
