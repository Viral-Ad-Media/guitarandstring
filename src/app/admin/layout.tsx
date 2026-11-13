import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-serif text-lg font-semibold">Guitar &amp; String admin</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted hover:text-foreground">View site</Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>{children}</Suspense>
      </div>
    </div>
  );
}
