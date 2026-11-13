import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Guitar and String editors only.</p>
        <LoginForm />
      </div>
    </div>
  );
}
