import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              Langport Life
            </h3>
            <p className="mt-2 text-sm">
              Your community hub for events, venues, businesses, and council
              information in Langport, Somerset.
            </p>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/events" className="text-sm text-gray-300 no-underline hover:text-white">Events</Link></li>
              <li><Link href="/venues" className="text-sm text-gray-300 no-underline hover:text-white">Venues</Link></li>
              <li><Link href="/listings" className="text-sm text-gray-300 no-underline hover:text-white">Business Listings</Link></li>
              <li><Link href="/history" className="text-sm text-gray-300 no-underline hover:text-white">History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-white">
              Council
            </h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/council" className="text-sm text-gray-300 no-underline hover:text-white">Overview</Link></li>
              <li><Link href="/council/members" className="text-sm text-gray-300 no-underline hover:text-white">Members</Link></li>
              <li><Link href="/council/documents" className="text-sm text-gray-300 no-underline hover:text-white">Documents</Link></li>
              <li><Link href="/environment" className="text-sm text-gray-300 no-underline hover:text-white">Environment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-white">
              About
            </h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="text-sm text-gray-300 no-underline hover:text-white">About Langport</Link></li>
              <li><Link href="/getting-here" className="text-sm text-gray-300 no-underline hover:text-white">Getting Here</Link></li>
              <li><Link href="/auth/signin" className="text-sm text-gray-300 no-underline hover:text-white">Sign In</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-gray-300 no-underline hover:text-white">Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Langport Town Council. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
