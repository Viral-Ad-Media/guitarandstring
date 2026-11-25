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

/** Published posts with the given slugs, in the order the slugs are listed. */
export async function getPostsBySlugs(slugs: string[]) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  if (slugs.length === 0) return [];
  const rows = await db
    .select(listColumns)
    .from(posts)
    .where(and(eq(posts.status, "published"), eq(posts.type, "post"), inArray(posts.slug, slugs)));
  return slugs.flatMap((s) => rows.filter((r) => r.slug === s));
}

/** Post counts for the home page: total, per language and per category slug. */
export async function getContentCounts() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const rows = await db
    .select({ id: posts.id, lang: posts.lang })
    .from(posts)
    .where(and(eq(posts.status, "published"), eq(posts.type, "post")));
  const links = await db
    .select({ postId: postCategories.postId, slug: categories.slug })
    .from(postCategories)
    .innerJoin(categories, eq(categories.id, postCategories.categoryId));
  const published = new Set(rows.map((r) => r.id));
  const byCategory: Record<string, number> = {};
  for (const l of links) {
    if (published.has(l.postId)) byCategory[l.slug] = (byCategory[l.slug] ?? 0) + 1;
  }
  return {
    total: rows.length,
    en: rows.filter((r) => r.lang === "en").length,
    es: rows.filter((r) => r.lang === "es").length,
    byCategory,
  };
}

/** Up to `limit` other published posts in the same language that share a category. */
export async function getRelatedPosts(postId: number, categorySlugs: string[], lang: "en" | "es", limit = 3) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  if (categorySlugs.length === 0) return [];
  const catIds = db.select({ id: categories.id }).from(categories).where(inArray(categories.slug, categorySlugs));
  const ids = db
    .select({ id: postCategories.postId })
    .from(postCategories)
    .where(inArray(postCategories.categoryId, catIds));
  const items = await db
    .select(listColumns)
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        eq(posts.type, "post"),
        eq(posts.lang, lang),
        inArray(posts.id, ids),
      ),
    )
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit + 1);
  return items.filter((p) => p.id !== postId).slice(0, limit);
}

/** Rough reading time in minutes, from the stored HTML. */
export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
