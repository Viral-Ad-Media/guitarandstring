/**
 * Loads the articles in content/ into the database.
 *
 *   pnpm db:seed           insert missing posts only (never overwrites edits made in /admin)
 *   pnpm db:seed --force   overwrite posts that already exist with the content/ version
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { eq } from "drizzle-orm";

const CATEGORIES = [
  { slug: "acoustic", name: "Acoustic", description: "Acoustic guitars, strings, capos and basses." },
  { slug: "electric", name: "Electric", description: "Electric guitars, amps, strings and wireless gear." },
  { slug: "reviews", name: "Reviews", description: "Our roundups of the best guitar gear." },
  { slug: "spanish", name: "Español", description: "Guías de guitarras, cuerdas y accesorios en español." },
];

async function main() {
  const force = process.argv.includes("--force");
  const { db } = await import("../src/db");
  const { categories, postCategories, posts } = await import("../src/db/schema");
  const { markdownToSafeHtml } = await import("../src/lib/markdown");

  for (const c of CATEGORIES) {
    await db.insert(categories).values(c).onConflictDoUpdate({ target: categories.slug, set: { name: c.name, description: c.description } });
  }
  const catRows = await db.select().from(categories);
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));

  const sources = [
    { dir: "content/posts", type: "post" as const },
    { dir: "content/pages", type: "page" as const },
  ];
  let inserted = 0, updated = 0, skipped = 0;

  for (const { dir, type } of sources) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
      const slug = path.basename(file, ".md");
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const values = {
        slug,
        type,
        status: "published" as const,
        lang: (data.lang === "es" ? "es" : "en") as "en" | "es",
        title: String(data.title),
        excerpt: String(data.excerpt ?? ""),
        contentHtml: markdownToSafeHtml(content),
        featuredImage: data.featuredImage ?? null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      };

      const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
      let id: number;
      if (existing && !force) {
        skipped++;
        continue;
      } else if (existing) {
        await db.update(posts).set(values).where(eq(posts.id, existing.id));
        id = existing.id;
        updated++;
      } else {
        [{ id }] = await db.insert(posts).values(values).returning({ id: posts.id });
        inserted++;
      }

      await db.delete(postCategories).where(eq(postCategories.postId, id));
      const ids = ((data.categories as string[]) ?? []).map((s) => {
        const cid = catId.get(s);
        if (!cid) throw new Error(`${file}: unknown category "${s}"`);
        return cid;
      });
      if (ids.length) await db.insert(postCategories).values(ids.map((categoryId) => ({ postId: id, categoryId })));
    }
  }

  console.log(`Seed done: ${inserted} inserted, ${updated} updated, ${skipped} skipped (already exist).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
