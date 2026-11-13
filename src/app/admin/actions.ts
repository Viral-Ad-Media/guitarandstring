"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { postCategories, posts } from "@/db/schema";
import { CONTENT_TAG } from "@/lib/content";
import { isSafeImagePath, sanitizePostHtml } from "@/lib/sanitize";
import { requireAdmin } from "@/lib/session";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(["admin", "login", "api", "blog", "uploads", "sitemap.xml", "robots.txt"]);

function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export type SaveState = { error?: string; saved?: boolean };

export async function savePost(id: number, _prev: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();

  const slug = str(form, "slug");
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return { error: "Slug must be lowercase words separated by dashes, and not a reserved path." };
  const title = str(form, "title");
  if (!title) return { error: "Title is required." };
  const featuredImage = str(form, "featuredImage") || null;
  if (featuredImage && !isSafeImagePath(featuredImage)) return { error: "Featured image must be a /uploads/… path or an https URL." };

  const status = str(form, "status") === "published" ? "published" : "draft";
  const lang = str(form, "lang") === "es" ? "es" : "en";
  const type = str(form, "type") === "page" ? "page" : "post";
  const categoryIds = form.getAll("categories").map(Number).filter(Number.isInteger);

  const [existing] = await db.select({ publishedAt: posts.publishedAt }).from(posts).where(eq(posts.id, id));
  if (!existing) return { error: "Post not found." };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(posts)
        .set({
          title,
          slug,
          status,
          lang,
          type,
          excerpt: str(form, "excerpt"),
          contentHtml: sanitizePostHtml(String(form.get("contentHtml") ?? "")),
          featuredImage,
          seoTitle: str(form, "seoTitle") || null,
          seoDescription: str(form, "seoDescription") || null,
          publishedAt: status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt,
        })
        .where(eq(posts.id, id));
      await tx.delete(postCategories).where(eq(postCategories.postId, id));
      if (categoryIds.length) {
        await tx.insert(postCategories).values(categoryIds.map((categoryId) => ({ postId: id, categoryId })));
      }
    });
  } catch (e) {
    if (String(e).includes("posts_slug_unique")) return { error: "Another post already uses that slug." };
    throw e;
  }

  updateTag(CONTENT_TAG);
  return { saved: true };
}

export async function createPost() {
  await requireAdmin();
  const [row] = await db
    .insert(posts)
    .values({ title: "Untitled draft", slug: `draft-${Date.now()}`, status: "draft" })
    .returning({ id: posts.id });
  redirect(`/admin/posts/${row.id}`);
}

export async function deletePost(id: number) {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, id));
  updateTag(CONTENT_TAG);
  redirect("/admin");
}
