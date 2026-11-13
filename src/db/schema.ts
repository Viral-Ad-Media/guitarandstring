import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";

export const contentType = pgEnum("content_type", ["post", "page"]);
export const contentStatus = pgEnum("content_status", ["draft", "published"]);
export const lang = pgEnum("lang", ["en", "es"]);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    wpId: integer("wp_id").unique(),
    type: contentType("type").notNull().default("post"),
    status: contentStatus("status").notNull().default("draft"),
    lang: lang("lang").notNull().default("en"),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    /** Sanitized HTML. Only ever written through `sanitizePostHtml`. */
    contentHtml: text("content_html").notNull().default(""),
    featuredImage: text("featured_image"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("posts_status_type_idx").on(t.status, t.type)],
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
});

export const postCategories = pgTable(
  "post_categories",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.categoryId] })],
);

export const postsRelations = relations(posts, ({ many }) => ({
  postCategories: many(postCategories),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories),
}));
export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;
