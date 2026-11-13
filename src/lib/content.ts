import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, postCategories, posts } from "@/db/schema";

export const CONTENT_TAG = "content";

const listColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  featuredImage: posts.featuredImage,
  lang: posts.lang,
  publishedAt: posts.publishedAt,
  updatedAt: posts.updatedAt,
};

export type PostListItem = Awaited<ReturnType<typeof getPublishedPosts>>[number];

export async function getPublishedPosts(opts: { lang?: "en" | "es"; limit?: number } = {}) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const where = and(
    eq(posts.status, "published"),
    eq(posts.type, "post"),
    opts.lang ? eq(posts.lang, opts.lang) : undefined,
  );
  const q = db.select(listColumns).from(posts).where(where).orderBy(desc(posts.publishedAt), desc(posts.id));
  return opts.limit ? q.limit(opts.limit) : q;
}

export async function getPublishedBySlug(slug: string) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);
  if (!post) return null;
  const cats = await db
    .select({ slug: categories.slug, name: categories.name })
    .from(postCategories)
    .innerJoin(categories, eq(categories.id, postCategories.categoryId))
    .where(eq(postCategories.postId, post.id));
  return { ...post, categories: cats };
}

export async function getCategoryWithPosts(slug: string) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!category) return null;
  const ids = db
    .select({ id: postCategories.postId })
    .from(postCategories)
    .where(eq(postCategories.categoryId, category.id));
  const items = await db
    .select(listColumns)
    .from(posts)
    .where(and(eq(posts.status, "published"), eq(posts.type, "post"), inArray(posts.id, ids)))
    .orderBy(desc(posts.publishedAt), desc(posts.id));
  return { category, posts: items };
}

export async function getAllCategories() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return db.select().from(categories).orderBy(categories.name);
}

/** Every public URL slug: published posts, pages and categories. */
export async function getAllPublicSlugs() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const p = await db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.status, "published"));
  const c = await db.select({ slug: categories.slug }).from(categories);
  return { posts: p, categories: c };
}
