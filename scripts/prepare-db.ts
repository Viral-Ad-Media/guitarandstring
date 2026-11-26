/**
 * Runs before `next build` on Vercel: applies pending migrations, then loads any articles from
 * content/ that are not in the database yet. The build prerenders pages from the database, so the
 * tables and posts must exist first.
 *
 * With Vercel's Neon integration, Production uses the main Neon branch and each Preview deployment
 * gets its own Neon branch, so both are prepared by their own build. Both steps are safe to repeat:
 * applied migrations are skipped, and the seed never overwrites posts edited in /admin.
 *
 * Locally this does nothing; use `pnpm db:migrate` and `pnpm db:seed`.
 */
import { execFileSync } from "node:child_process";

async function main() {
  if (!process.env.VERCEL) return;
  // Migrations run DDL, so use the direct (unpooled) connection when Neon provides one.
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) return; // src/db/index.ts reports the missing variable during the build.

  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
    console.log("Database migrations applied.");
  } finally {
    await pool.end();
  }

  execFileSync(process.execPath, ["--import", "tsx", "scripts/seed.ts"], { stdio: "inherit" });
}

main().catch((e) => {
  console.error("Database preparation failed:", e);
  process.exit(1);
});
