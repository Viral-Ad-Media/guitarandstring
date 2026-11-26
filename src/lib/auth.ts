import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { site } from "@/lib/site";

/**
 * BETTER_AUTH_URL wins. On Vercel without it, previews use their own deployment URL and production
 * uses the project's production domain, so sign-in works before a custom domain is attached.
 */
function authBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return site.url;
}

export const auth = betterAuth({
  // Set BETTER_AUTH_SECRET (openssl rand -hex 32) in .env.local and in Vercel. Better Auth refuses
  // to sign anyone in on a production server without it.
  secret: process.env.BETTER_AUTH_SECRET,
  // The public origin used for callbacks and redirects.
  baseURL: authBaseURL(),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // Only admins created with `pnpm admin:create` can sign in. No public sign-up.
    disableSignUp: true,
    minPasswordLength: 12,
  },
  plugins: [nextCookies()],
});
