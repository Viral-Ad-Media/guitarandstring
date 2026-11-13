import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/post-card";
import { getAllPublicSlugs, getCategoryWithPosts, getPublishedBySlug } from "@/lib/content";
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

    return (
      <article lang={post.lang} className="mx-auto max-w-3xl px-4 py-12">
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          />
        ) : null}
        <header className="mb-8">
          {post.categories.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.categories.map((c) => (
                <Link key={c.slug} href={`/${c.slug}`} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null}
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
          {post.type === "post" && post.publishedAt ? (
            <p className="mt-3 text-sm text-muted">{formatDate(post.publishedAt, post.lang)}</p>
          ) : null}
        </header>
        {post.featuredImage && post.type === "post" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImage} alt="" className="mb-10 w-full rounded-2xl border border-border bg-white object-cover" />
        ) : null}
        <div
          className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-accent"
          // Content is sanitized with sanitizePostHtml before it is stored.
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    );
  }

  const cat = await getCategoryWithPosts(slug);
  if (cat) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">{cat.category.name}</h1>
        {cat.category.description ? <p className="mt-2 max-w-2xl text-muted">{cat.category.description}</p> : null}
        <div className="mt-8">
          <PostGrid posts={cat.posts} />
        </div>
      </div>
    );
  }

  notFound();
}
