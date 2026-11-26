import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // Without this check pg silently falls back to localhost:5432 and the build or request
  // fails later with a confusing ECONNREFUSED.
  throw new Error(
    "DATABASE_URL is not set. Add your Neon pooled connection string (postgres://…-pooler…/neondb?sslmode=require) " +
      "to .env.local for local work, or in Vercel under Project Settings → Environment Variables for Production and Preview. " +
      "The build reads posts from the database, so it is needed at build time too.",
  );
}

const globalForDb = globalThis as unknown as { pool?: Pool };

// Works with Neon (pooled connection string) and with a local Postgres for development.
const pool = globalForDb.pool ?? new Pool({ connectionString, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
