"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function VenueDashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  if (user?.role !== "venueOwner") {
    return <p className="text-gray-600">Access denied.</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        My Venue
      </h1>
      <p className="mt-2 text-gray-600">
        Manage your venue details and review event submissions.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link
          href="/dashboard/venue/approvals"
          className="rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="font-heading text-xl font-bold text-gray-900">Event Approvals</h2>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve events submitted at your venue.
          </p>
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-heading text-xl font-bold text-gray-900">Edit Venue</h2>
          <p className="mt-2 text-sm text-gray-600">
            To edit your venue details, please contact the town clerk or use Sanity Studio.
          </p>
        </div>
      </div>
    </div>
  );
}
