import Link from "next/link";
import { LeadPostCard, PostCard, PostGrid } from "@/components/post-card";
import { getContentCounts, getPostsBySlugs, getPublishedPosts } from "@/lib/content";

const topics = [
  {
    href: "/acoustic",
    slug: "acoustic",
    title: "Acoustic",
    text: "Guitars, strings, capos and basses for unplugged players.",
    image: "/uploads/2023/01/best-acoustic-guitar.jpg",
  },
  {
    href: "/electric",
    slug: "electric",
    title: "Electric",
    text: "Guitars, amps, strings and wireless systems.",
    image: "/uploads/2023/01/best-electric-guitar.jpg",
  },
  {
    href: "/reviews",
    slug: "reviews",
    title: "Reviews",
    text: "Roundups of the gear we would buy, with who each pick suits.",
    image: "/uploads/2023/01/capo-for-guitar.jpg",
  },
  {
    href: "/spanish",
    slug: "spanish",
    title: "Español",
    text: "Guías de guitarras, cuerdas y amplificadores.",
    image: "/uploads/2023/01/capos-de-guitarra.jpg",
    lang: "es",
  },
];

const stringCare = [
  "how-to-change-guitar-strings-beginners",
  "how-to-change-guitar-strings",
  "how-to-choose-guitar-string-gauge",
  "coated-vs-uncoated-guitar-strings",
];

function Arrow() {
  return (
    <svg className="m-arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export default async function HomePage() {
  const [latest, spanish, care, counts] = await Promise.all([
    getPublishedPosts({ lang: "en", limit: 7 + stringCare.length }),
    getPublishedPosts({ lang: "es", limit: 3 }),
    getPostsBySlugs(stringCare),
    getContentCounts(),
  ]);
  // The how-tos get their own list below, so the latest grid skips them and no picture shows twice.
  const [lead, ...rest] = latest.filter((p) => !stringCare.includes(p.slug)).slice(0, 7);

  return (
    <>
      {/* Hero: what the site is, for whom, one hard fact, two actions, and real photographs. */}
      <section
        data-enter
        aria-labelledby="hero-h"
        className="wrap grid items-center gap-12 py-12 md:py-16 lg:min-h-[calc(100svh-var(--nav))] lg:grid-cols-12 lg:gap-16"
      >
        <div className="lg:col-span-6">
          <h1
            id="hero-h"
            className="enter-line font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[56px] lg:text-[64px]"
          >
            Guitar gear guides and string advice for every player
          </h1>
          <p className="enter-line measure mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl">
            Which guitar, amp or capo to buy, which strings suit the way you play, and how to fit them yourself. Every
            pick says who it suits.
          </p>
          <div className="enter-line btn-row mt-9 flex flex-wrap gap-3">
            <Link href="/blog" className="btn btn--primary">
              Read the latest guides
              <Arrow />
            </Link>
            <Link href="/how-to-change-guitar-strings-beginners" className="btn btn--secondary">
              Learn to change strings
            </Link>
          </div>
          <p className="enter-line mt-8 text-[15px] text-muted">
            {counts.total} guides, {counts.en} in English and {counts.es} in Spanish
          </p>
        </div>

        <div className="enter-media grid h-[340px] grid-cols-5 grid-rows-2 gap-3 sm:h-[480px] lg:col-span-6 lg:h-[min(620px,calc(100svh-var(--nav)-128px))]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/2023/01/acoustic-guitar-strings.jpg"
            alt="Close-up of the strings crossing the soundhole of an acoustic guitar"
            className="col-span-3 row-span-2 h-full w-full rounded-[var(--r-lg)] object-cover"
            fetchPriority="high"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/2023/01/cuerdas-de-guitarra-electrica.jpg"
            alt="A new string being threaded through the bridge of an electric guitar"
            className="col-span-2 h-full w-full rounded-[var(--r-lg)] object-cover"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/2023/01/acoustic-bass-guitar.jpg"
            alt="A player fingerpicking an acoustic bass guitar"
            className="col-span-2 h-full w-full rounded-[var(--r-lg)] object-cover"
          />
        </div>
      </section>

      {/* Topics as photo tiles. */}
      <section aria-labelledby="topics-h" className="wrap pt-16 md:pt-24">
        <h2 id="topics-h" className="font-serif text-[32px] font-semibold tracking-tight md:text-[40px]">
          Guides by topic
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {topics.map((t) => (
            <article key={t.href} className="card" lang={t.lang}>
              <div className="m-zoom aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="card__title flex items-baseline justify-between gap-3 font-serif text-2xl font-semibold tracking-tight">
                  <Link href={t.href} className="card__link">
                    {t.title}
                  </Link>
                  <span className="font-sans text-[13px] font-medium text-muted">
                    {counts.byCategory[t.slug] ?? 0} {t.lang === "es" ? "guías" : "guides"}
                  </span>
                </h3>
                <p className="text-base leading-relaxed text-ink-soft">{t.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Latest: one lead story, then a grid. */}
      {lead ? (
        <section aria-labelledby="latest-h" className="wrap pt-24 md:pt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="latest-h" className="font-serif text-[32px] font-semibold tracking-tight md:text-[40px]">
              Latest guides
            </h2>
            <Link href="/blog" className="link text-base">
              See all {counts.total} guides
            </Link>
          </div>
          <div className="mt-8 md:mt-12">
            <LeadPostCard post={lead} />
          </div>
          <div className="mt-6">
            <PostGrid posts={rest} />
          </div>
        </section>
      ) : null}

      {/* String care: a list, not another grid. */}
      {care.length > 0 ? (
        <section aria-labelledby="care-h" className="mt-24 bg-surface py-20 md:mt-32 md:py-28">
          <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 id="care-h" className="font-serif text-[32px] font-semibold tracking-tight md:text-[40px]">
                String care how-tos
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                Fresh strings are the cheapest way to make any guitar sound better. These guides cover fitting them,
                picking a gauge and whether a coating is worth paying for.
              </p>
            </div>
            <ol className="lg:col-span-8">
              {care.map((p) => (
                <li key={p.id} className="border-t border-border last:border-b">
                  <Link href={`/${p.slug}`} className="group grid grid-cols-[96px_1fr] items-center gap-5 py-5 sm:grid-cols-[160px_1fr_auto] sm:gap-8">
                    <span className="m-zoom block aspect-[3/2] rounded-[var(--r-md)] bg-white">
                      {p.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.featuredImage} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-[1.025]" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block font-serif text-xl font-semibold leading-snug tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 sm:text-[22px]">
                        {p.title}
                      </span>
                      <span className="mt-1 line-clamp-2 hidden text-base leading-relaxed text-ink-soft sm:block">{p.excerpt}</span>
                    </span>
                    <span className="hidden text-muted transition-transform duration-150 group-hover:translate-x-[3px] sm:block">
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {spanish.length > 0 ? (
        <section aria-labelledby="es-h" lang="es" className="wrap pt-24 md:pt-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="es-h" className="font-serif text-[32px] font-semibold tracking-tight md:text-[40px]">
              Guías en español
            </h2>
            <Link href="/spanish" className="link text-base">
              Ver las {counts.es} guías
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
            {spanish.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
