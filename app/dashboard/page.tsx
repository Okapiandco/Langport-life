"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Welcome, {user?.name || "User"}
      </h1>
      <p className="mt-2 text-gray-600">
        Role: <span className="capitalize font-medium">{user?.role || "public"}</span>
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/my-events"
          className="rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="font-heading text-xl font-bold text-gray-900">My Events</h2>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your submitted events.
          </p>
        </Link>

        <Link
          href="/dashboard/my-events/new"
          className="rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="font-heading text-xl font-bold text-gray-900">Submit Event</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a new event for the community.
          </p>
        </Link>

        {user?.role === "businessOwner" && (
          <Link
            href="/dashboard/my-listings"
            className="rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="font-heading text-xl font-bold text-gray-900">My Listing</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your business listing.
            </p>
          </Link>
        )}

        {user?.role === "venueOwner" && (
          <Link
            href="/dashboard/venue/approvals"
            className="rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="font-heading text-xl font-bold text-gray-900">Event Approvals</h2>
            <p className="mt-2 text-sm text-gray-600">
              Review events submitted at your venue.
            </p>
          </Link>
        )}

        {user?.role === "clerk" && (
          <>
            <Link
              href="/dashboard/admin/approvals"
              className="rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="font-heading text-xl font-bold text-gray-900">Approvals</h2>
              <p className="mt-2 text-sm text-gray-600">
                Review all pending events and listings.
              </p>
            </Link>
            <Link
              href="/studio"
              className="rounded-lg border-2 border-primary bg-primary/5 p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="font-heading text-xl font-bold text-primary">Sanity Studio</h2>
              <p className="mt-2 text-sm text-gray-600">
                Full content management — edit pages, documents, members.
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
