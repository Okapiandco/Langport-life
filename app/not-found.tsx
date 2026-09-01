import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 font-heading text-4xl font-bold text-gray-900 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-gray-600">
        This page may have moved when we rebuilt the site, or the event may have
        passed. Try one of these instead:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary/90 transition-colors"
        >
          Home
        </Link>
        <Link
          href="/events"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 transition-colors"
        >
          What&apos;s On
        </Link>
        <Link
          href="/council"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 transition-colors"
        >
          Town Council
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 transition-colors"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
