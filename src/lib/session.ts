import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Read the session for this request. Call only from dynamic (request-time) code. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Redirects to /login when there is no signed-in user. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
