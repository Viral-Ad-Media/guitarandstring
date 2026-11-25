import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/post-card";
import { getAllPublicSlugs, getCategoryWithPosts, getPublishedBySlug, getRelatedPosts, readingMinutes } from "@/lib/content";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const { posts, categories } = await getAllPublicSlugs();
  return [...posts, ...categories].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBySlug(slug);
  if (post) {
    return {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      alternates: { canonical: `/${post.slug}` },
      openGraph: {
        type: post.type === "post" ? "article" : "website",
        title: post.title,
        description: post.seoDescription ?? post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : undefined,
        locale: post.lang === "es" ? "es_ES" : "en_US",
      },
    };
  }
  const cat = await getCategoryWithPosts(slug);
  if (cat) {
    return {
      title: cat.category.name,
      description: cat.category.description || `${cat.category.name} guides from ${site.name}.`,
      alternates: { canonical: `/${slug}` },
    };
  }
  return {};
}

function formatDate(d: Date | null, lang: "en" | "es") {
  if (!d) return null;
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(d);
}

export default async function SlugPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;

  const post = await getPublishedBySlug(slug);
  if (post) {
    const jsonLd =
      post.type === "post"
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.seoDescription ?? post.excerpt,
            image: post.featuredImage ? new URL(post.featuredImage, site.url).toString() : undefined,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            inLanguage: post.lang,
            publisher: { "@type": "Organization", name: site.name },
          }
        : null;

    // Related guides come from the post's subject (acoustic or electric), not the broad "reviews" or language buckets.
    const subjects = post.categories.map((c) => c.slug).filter((s) => s !== "reviews" && s !== "spanish");
    const related =
      post.type === "post"
        ? await getRelatedPosts(post.id, subjects.length > 0 ? subjects : post.categories.map((c) => c.slug), post.lang)
        : [];
    const es = post.lang === "es";
    const minutes = readingMinutes(post.contentHtml);

    return (
      <>
        <article lang={post.lang}>
          {jsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
          ) : null}
          <header data-enter className="wrap pt-12 md:pt-20">
            <div className="mx-auto max-w-3xl">
              {post.categories.length > 0 ? (
                <nav aria-label={es ? "Temas" : "Topics"} className="enter-line flex flex-wrap gap-x-5 text-[15px] font-medium">
                  {post.categories.map((c) => (
                    <Link key={c.slug} href={`/${c.slug}`} className="nav-link !text-accent">
                      {c.name}
                    </Link>
                  ))}
                </nav>
              ) : null}
              <h1 className="enter-line mt-2 font-serif text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[48px] lg:text-[56px]">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="enter-line mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">{post.excerpt}</p>
              ) : null}
              {post.type === "post" ? (
                <p className="enter-line mt-6 flex flex-wrap gap-x-3 text-[15px] text-muted">
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, post.lang)}</time>
                  ) : null}
                  {post.publishedAt ? <span aria-hidden="true">·</span> : null}
                  <span>{es ? `${minutes} min de lectura` : `${minutes} min read`}</span>
                </p>
              ) : null}
            </div>
            {post.featuredImage && post.type === "post" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featuredImage}
                alt=""
                fetchPriority="high"
                className="enter-media mx-auto mt-10 aspect-[3/2] w-full max-w-5xl rounded-[var(--r-lg)] bg-white object-cover md:mt-14"
              />
            ) : null}
          </header>
          <div className="wrap mt-12 md:mt-16">
            <div
              className="article-body prose prose-stone mx-auto max-w-3xl dark:prose-invert prose-headings:font-serif prose-headings:tracking-tight prose-h2:mt-14 prose-h2:text-[30px] prose-h3:text-[22px] prose-p:text-ink-soft prose-li:text-ink-soft prose-a:text-accent prose-a:font-medium prose-strong:text-foreground"
              // Content is sanitized with sanitizePostHtml before it is stored.
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>
        </article>

        {related.length > 0 ? (
          <section aria-labelledby="related-h" lang={post.lang} className="wrap mt-24 border-t border-border pt-16 md:mt-32 md:pt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-h" className="font-serif text-[28px] font-semibold tracking-tight md:text-[36px]">
                {es ? "Más guías como esta" : "More guides like this"}
              </h2>
              <Link href={es ? "/spanish" : "/blog"} className="link text-base">
                {es ? "Ver todas las guías" : "See all guides"}
              </Link>
            </div>
            <div className="mt-8 md:mt-12">
              <PostGrid posts={related} />
            </div>
          </section>
        ) : null}
      </>
    );
  }

  const cat = await getCategoryWithPosts(slug);
  if (cat) {
    const es = slug === "spanish";
    return (
      <div className="wrap pt-12 md:pt-20">
        <header data-enter className="max-w-3xl" lang={es ? "es" : undefined}>
          <p className="enter-line text-[15px] font-medium text-muted">
            {cat.posts.length} {es ? "guías" : cat.posts.length === 1 ? "guide" : "guides"}
          </p>
          <h1 className="enter-line mt-2 font-serif text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[56px]">
            {cat.category.name}
          </h1>
          {cat.category.description ? (
            <p className="enter-line mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">{cat.category.description}</p>
          ) : null}
        </header>
        <div className="mt-12 md:mt-16">
          <PostGrid posts={cat.posts} />
        </div>
      </div>
    );
  }

  notFound();
}
