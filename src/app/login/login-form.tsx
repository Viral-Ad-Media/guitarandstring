"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) {
      setError(error.message || "Invalid email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
      </label>
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      <button disabled={pending} className="w-full rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-strong disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
