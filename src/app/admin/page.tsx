import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { createPost } from "./actions";

export default async function AdminHome() {
  await requireAdmin();
  const rows = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug, status: posts.status, lang: posts.lang, type: posts.type, updatedAt: posts.updatedAt })
    .from(posts)
    .orderBy(desc(posts.updatedAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Posts and pages</h1>
        <form action={createPost}>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong">New post</button>
        </form>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Lang</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${r.id}`} className="font-medium hover:text-accent">{r.title}</Link>
                  <div className="text-xs text-muted">/{r.slug}</div>
                </td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3 uppercase">{r.lang}</td>
                <td className="px-4 py-3">
                  <span className={r.status === "published" ? "text-green-700 dark:text-green-400" : "text-muted"}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-muted">{r.updatedAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
