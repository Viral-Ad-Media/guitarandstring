import type { Metadata } from "next";
import { PostGrid } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "All guitar guides",
  description: "Every guide on Guitar and String: gear roundups, string advice and how-tos.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 font-serif text-4xl font-semibold">All guides</h1>
      <PostGrid posts={posts} />
    </div>
  );
}
