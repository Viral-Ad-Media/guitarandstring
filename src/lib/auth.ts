import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { site } from "@/lib/site";

export const auth = betterAuth({
  // Set BETTER_AUTH_SECRET (openssl rand -hex 32) in .env.local and in Vercel. Better Auth refuses
  // to sign anyone in on a production server without it.
  secret: process.env.BETTER_AUTH_SECRET,
  // The public origin used for callbacks and redirects. Falls back to the site URL.
  baseURL: process.env.BETTER_AUTH_URL ?? site.url,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // Only admins created with `pnpm admin:create` can sign in. No public sign-up.
    disableSignUp: true,
    minPasswordLength: 12,
  },
  plugins: [nextCookies()],
});
