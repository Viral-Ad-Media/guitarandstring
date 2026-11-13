import type { MetadataRoute } from "next";
import { getAllPublicSlugs } from "@/lib/content";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, categories } = await getAllPublicSlugs();
  return [
    { url: `${site.url}/` },
    { url: `${site.url}/blog` },
    ...posts.map((p) => ({ url: `${site.url}/${p.slug}`, lastModified: p.updatedAt })),
    ...categories.map((c) => ({ url: `${site.url}/${c.slug}` })),
  ];
}
