import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, postCategories, posts } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { PostEditor } from "./post-editor";

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) notFound();
  const allCategories = await db.select().from(categories).orderBy(categories.name);
  const selected = await db
    .select({ id: postCategories.categoryId })
    .from(postCategories)
    .where(eq(postCategories.postId, id));

  return (
    <PostEditor
      post={post}
      categories={allCategories}
      selectedCategoryIds={selected.map((s) => s.id)}
    />
  );
}
