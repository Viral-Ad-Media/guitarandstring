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
    <div className="wrap pt-12 md:pt-20">
      <header data-enter className="max-w-3xl">
        <p className="enter-line text-[15px] font-medium text-muted">{posts.length} guides in English and Spanish</p>
        <h1 className="enter-line mt-2 font-serif text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[56px]">
          All guitar guides
        </h1>
        <p className="enter-line mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
          Gear roundups, string advice and how-tos, newest first.
        </p>
      </header>
      <div className="mt-12 md:mt-16">
        <PostGrid posts={posts} />
      </div>
    </div>
  );
}
