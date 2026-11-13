import type { NextConfig } from "next";

/** Old WordPress URLs that moved. Keeps links and search rankings working. */
const legacySlugs: Record<string, string> = {
  "best-guitar-amps-2023": "best-guitar-amps-2026",
  "best-electric-guitars-2023": "best-electric-guitars-2026",
  "best-acoustic-guitars-2023": "best-acoustic-guitars-2026",
  "best-capo-for-guitar-2023": "best-capo-for-guitar-2026",
  "electric-guitar-strings-2023": "electric-guitar-strings-2026",
  "guitar-wireless-systems-2023": "guitar-wireless-systems-202",
  "best-acoustic-bass-guitar": "best-acoustic-bass-guitars",
  "best-acoustic-guitar-strings-for-beginners": "best-acoustic-guitar-strings-2026",
  "mejores-guitarras-acusticas-2023": "mejores-guitarras-acusticas-2026",
};

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // WordPress date permalinks: /2023/01/13/slug/ -> /slug
      { source: "/:y(\\d{4})/:m(\\d{2})/:d(\\d{2})/:slug", destination: "/:slug", permanent: true },
      { source: "/category/:slug", destination: "/:slug", permanent: true },
      { source: "/wp-content/uploads/:path*", destination: "/uploads/:path*", permanent: true },
      { source: "/feed", destination: "/blog", permanent: false },
      ...Object.entries(legacySlugs).map(([from, to]) => ({ source: `/${from}`, destination: `/${to}`, permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
