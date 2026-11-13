"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Category, Post } from "@/db/schema";
import { deletePost, savePost, type SaveState } from "../../actions";

const input = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2";

export function PostEditor({
  post,
  categories,
  selectedCategoryIds,
}: {
  post: Post;
  categories: Category[];
  selectedCategoryIds: number[];
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(savePost.bind(null, post.id), {});
  const [html, setHtml] = useState(post.contentHtml);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">← All posts</Link>
          {post.status === "published" ? (
            <Link href={`/${post.slug}`} target="_blank" className="text-sm text-accent">View live ↗</Link>
          ) : null}
        </div>
        <label className="block text-sm font-medium">
          Title
          <input name="title" defaultValue={post.title} required className={`${input} text-lg`} />
        </label>
        <label className="block text-sm font-medium">
          Excerpt
          <textarea name="excerpt" defaultValue={post.excerpt} rows={2} className={input} />
        </label>
        <div>
          <div className="mb-1 flex gap-2 text-sm">
            <button type="button" onClick={() => setTab("edit")} className={tab === "edit" ? "font-semibold" : "text-muted"}>HTML</button>
            <button type="button" onClick={() => setTab("preview")} className={tab === "preview" ? "font-semibold" : "text-muted"}>Preview</button>
          </div>
          <textarea
            name="contentHtml"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={28}
            className={`${input} font-mono text-xs ${tab === "edit" ? "" : "hidden"}`}
          />
          {tab === "preview" ? (
            <div
              className="prose prose-stone max-w-none rounded-lg border border-border bg-card p-6 dark:prose-invert"
              // Preview only. The server sanitizes this HTML again on save.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}
          <p className="mt-1 text-xs text-muted">Scripts, iframes and unsafe links are removed when you save.</p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="block text-sm font-medium">
            Status
            <select name="status" defaultValue={post.status} className={input}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <button disabled={pending} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-strong disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          {state.error ? <p role="alert" className="mt-2 text-sm text-red-600">{state.error}</p> : null}
          {state.saved ? <p className="mt-2 text-sm text-green-700 dark:text-green-400">Saved.</p> : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <label className="block text-sm font-medium">
            Slug
            <input name="slug" defaultValue={post.slug} required className={input} />
          </label>
          <label className="block text-sm font-medium">
            Type
            <select name="type" defaultValue={post.type} className={input}>
              <option value="post">Post</option>
              <option value="page">Page</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Language
            <select name="lang" defaultValue={post.lang} className={input}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Featured image
            <input name="featuredImage" defaultValue={post.featuredImage ?? ""} placeholder="/uploads/…" className={input} />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Categories</legend>
            <div className="mt-1 space-y-1">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="categories" value={c.id} defaultChecked={selectedCategoryIds.includes(c.id)} />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <label className="block text-sm font-medium">
            SEO title
            <input name="seoTitle" defaultValue={post.seoTitle ?? ""} className={input} />
          </label>
          <label className="block text-sm font-medium">
            SEO description
            <textarea name="seoDescription" defaultValue={post.seoDescription ?? ""} rows={3} className={input} />
          </label>
        </div>

        <button
          type="button"
          onClick={async () => {
            if (confirm(`Delete "${post.title}"? This cannot be undone.`)) await deletePost(post.id);
          }}
          className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </aside>
    </form>
  );
}
