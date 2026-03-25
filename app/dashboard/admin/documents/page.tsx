"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminDocumentsPage() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;

  if (user?.role !== "clerk") {
    return <p className="text-gray-600">Access denied.</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Council Documents
      </h1>
      <p className="mt-2 text-gray-600">
        Use Sanity Studio to create, edit, and manage council documents.
      </p>
      <div className="mt-6">
        <Link
          href="/studio/structure/councilDocument"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors"
        >
          Open in Sanity Studio
        </Link>
      </div>
    </div>
  );
}
