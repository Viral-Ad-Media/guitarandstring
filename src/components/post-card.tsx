import Link from "next/link";
import type { PostListItem } from "@/lib/content";

function formatShortDate(d: Date | null, lang: "en" | "es") {
  if (!d) return null;
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function Meta({ post }: { post: PostListItem }) {
  const date = formatShortDate(post.publishedAt, post.lang);
  return (
    <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
      {post.lang === "es" ? <span lang="es">Español</span> : null}
      {post.lang === "es" && date ? <span aria-hidden="true">·</span> : null}
      {date ? <time dateTime={post.publishedAt?.toISOString()}>{date}</time> : null}
    </p>
  );
}

export function PostCard({ post, headingLevel = "h3" }: { post: PostListItem; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="card h-full" lang={post.lang}>
      <div className="m-zoom aspect-[3/2] bg-white">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <Meta post={post} />
        <Heading className="card__title font-serif text-[21px] font-semibold leading-snug tracking-tight">
          <Link href={`/${post.slug}`} className="card__link">
            {post.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-base leading-relaxed text-ink-soft">{post.excerpt}</p>
      </div>
    </article>
  );
}

/** A wide card for the newest guide: picture left, words right (stacked on a phone). */
export function LeadPostCard({ post }: { post: PostListItem }) {
  return (
    <article className="card md:grid md:grid-cols-12" lang={post.lang}>
      <div className="m-zoom aspect-[3/2] bg-white md:col-span-7 md:aspect-auto md:min-h-[420px]">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 md:col-span-5 md:p-12">
        <Meta post={post} />
        <h3 className="card__title font-serif text-3xl font-semibold leading-tight tracking-tight md:text-[34px]">
          <Link href={`/${post.slug}`} className="card__link">
            {post.title}
          </Link>
        </h3>
        <p className="text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostListItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
