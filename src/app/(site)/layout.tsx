import Link from "next/link";
import { cacheLife } from "next/cache";
import { site } from "@/lib/site";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
            Guitar <span className="text-accent">&amp;</span> String
          </Link>
          <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© <CurrentYear /> {site.name}</p>
          <div className="flex gap-4">
            <Link href="/about-author" className="hover:text-foreground">About</Link>
            <Link href="/blog" className="hover:text-foreground">All articles</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
