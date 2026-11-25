import Link from "next/link";
import { cacheLife } from "next/cache";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const footerColumns = [
  {
    title: "Topics",
    links: [
      { href: "/acoustic", label: "Acoustic" },
      { href: "/electric", label: "Electric" },
      { href: "/reviews", label: "Reviews" },
      { href: "/spanish", label: "Español" },
    ],
  },
  {
    title: "String care",
    links: [
      { href: "/how-to-change-guitar-strings", label: "Change your strings" },
      { href: "/how-to-choose-guitar-string-gauge", label: "Choose a string gauge" },
      { href: "/coated-vs-uncoated-guitar-strings", label: "Coated or uncoated" },
    ],
  },
  {
    title: "Site",
    links: [
      { href: "/blog", label: "All guides" },
      { href: "/about-author", label: "About" },
    ],
  },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="top" className="flex-1">
        {children}
      </main>
      <footer className="mt-24 border-t border-border bg-surface">
        <div className="wrap grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-2xl font-semibold tracking-tight">
              Guitar <span className="text-accent">&amp;</span> String
            </p>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-ink-soft">{site.description}</p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="md:col-span-2 md:last:col-span-3">
              <h2 className="text-[13px] font-medium text-muted">{col.title}</h2>
              <ul className="mt-3 flex flex-col">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="nav-link text-[15px]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="wrap flex flex-col gap-1 border-t border-border py-6 text-[13px] text-muted sm:flex-row sm:justify-between">
          <p>
            © <CurrentYear /> {site.name}
          </p>
          <p>Guides in English and Spanish</p>
        </div>
      </footer>
    </div>
  );
}
