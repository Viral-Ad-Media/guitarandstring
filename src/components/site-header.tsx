"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Escape closes the sheet; the page behind it does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="wrap relative flex h-[var(--nav)] items-center justify-between gap-6">
        <a className="skip-link" href="#top">
          Skip to content
        </a>
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-serif text-[21px] font-semibold tracking-tight">
          <Mark />
          <span>
            Guitar <span className="text-accent">&amp;</span> String
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] font-medium md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn--secondary !px-0 md:hidden"
          style={{ width: 44 }}
          aria-expanded={open}
          aria-controls="menu-sheet"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div id="menu-sheet" className="menu-sheet md:hidden">
          <nav aria-label="Main" className="wrap pt-2">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/about-author" onClick={() => setOpen(false)}>
              About
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/** The site's mark: a soundhole ring, drawn in the ink with the accent at its centre. */
function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="11.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="13" r="5.5" fill="var(--accent)" />
    </svg>
  );
}
