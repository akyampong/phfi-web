import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// The same .env files Next reads (.env.local and the rest), for DATABASE_URL
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
