"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function MyListingsPage() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;

  if (user?.role !== "businessOwner" && user?.role !== "clerk") {
    return (
      <div>
        <h1 className="font-heading text-3xl font-bold text-gray-900">My Listings</h1>
        <p className="mt-4 text-gray-600">
          You need a Business Owner account to manage listings.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        My Business Listing
      </h1>
      <p className="mt-2 text-gray-600">
        Manage your business listing details. Changes require clerk approval.
      </p>
      <div className="mt-8">
        <Link
          href="/dashboard/my-listings/edit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors"
        >
          Edit My Listing
        </Link>
      </div>
    </div>
  );
}
