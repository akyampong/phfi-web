import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * The database: Postgres. In development, the one in Docker (`bun run db:up`, see
 * docker-compose.yml); live, whichever DATABASE_URL points at.
 * One pool per server process: in development, kept on globalThis so reloading code doesn't
 * open a new pool each time.
 */
if (!process.env.DATABASE_URL) console.warn("DATABASE_URL isn't set: copy it from .env.example into .env.local.");

const globalForDb = globalThis as unknown as { pool?: Pool };
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
