// prisma.config.ts - Prisma 7 config for CLI and migrations
import "dotenv/config"; // loads .env automatically
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // or "./prisma/schema.prisma" if path differs
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
