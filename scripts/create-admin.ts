/**
 * Creates an admin account. Public sign-up is disabled on the site, so this is
 * the only way to add an editor.
 *
 *   pnpm admin:create --email you@example.com --name "Your Name"
 *   (you'll be asked for the password, or set ADMIN_PASSWORD)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createInterface } from "node:readline/promises";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg("email");
  const name = arg("name") ?? "Admin";
  if (!email) throw new Error("Pass --email");

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password (12+ characters): ");
    rl.close();
  }

  const { db } = await import("../src/db");
  const schema = await import("../src/db/schema");
  // Same database and schema as the site, but with sign-up enabled for this one call.
  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
  });
  await auth.api.signUpEmail({ body: { email, password, name } });
  console.log(`Admin ${email} created.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e?.body?.message ?? e);
  process.exit(1);
});
