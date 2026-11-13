import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">That page doesn&apos;t exist, or it has moved.</p>
      <Link href="/blog" className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">
        Browse all guides
      </Link>
    </div>
  );
}
