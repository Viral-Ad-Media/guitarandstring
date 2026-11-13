import Link from "next/link";
import { PostGrid } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/content";

const topics = [
  { href: "/acoustic", title: "Acoustic", text: "Guitars, strings, capos and basses for unplugged players." },
  { href: "/electric", title: "Electric", text: "Guitars, amps, strings and wireless gear." },
  { href: "/reviews", title: "Reviews", text: "Our roundups of the best gear in every category." },
  { href: "/spanish", title: "Español", text: "Guías de guitarras, cuerdas y amplificadores en español." },
];

export default async function HomePage() {
  const [latest, spanish] = await Promise.all([
    getPublishedPosts({ lang: "en", limit: 9 }),
    getPublishedPosts({ lang: "es", limit: 3 }),
  ]);

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Guitar and String</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Honest guides to guitars, strings and the gear around them.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Pick the right instrument, choose strings that suit your playing, and keep your guitar sounding its best.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong">
              Browse all guides
            </Link>
            <Link href="/how-to-change-guitar-strings-beginners" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-card">
              How to change strings
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-2xl border border-border bg-card p-5 hover:border-accent">
              <h2 className="font-serif text-xl font-semibold">{t.title}</h2>
              <p className="mt-1 text-sm text-muted">{t.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-6 font-serif text-2xl font-semibold">Latest guides</h2>
        <PostGrid posts={latest} />
      </section>

      {spanish.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-semibold">En español</h2>
            <Link href="/spanish" className="text-sm font-semibold text-accent">Ver todo</Link>
          </div>
          <PostGrid posts={spanish} />
        </section>
      ) : null}
    </>
  );
}
