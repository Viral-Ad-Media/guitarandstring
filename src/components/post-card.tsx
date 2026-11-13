import Link from "next/link";
import type { PostListItem } from "@/lib/content";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg">
      <Link href={`/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-white">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.lang === "es" ? (
          <span className="w-fit rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Español</span>
        ) : null}
        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link href={`/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm text-muted">{post.excerpt}</p>
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
