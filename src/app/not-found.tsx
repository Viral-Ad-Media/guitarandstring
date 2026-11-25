import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-[15px] font-medium text-muted">Error 404</p>
      <h1 className="mt-2 font-serif text-[40px] font-semibold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-lg text-ink-soft">That page doesn&apos;t exist, or it has moved.</p>
      <Link href="/blog" className="btn btn--primary mt-8">
        Browse all guides
      </Link>
    </div>
  );
}
