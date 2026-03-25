"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const user = session?.user as { sanityId?: string } | undefined;
      if (!user?.sanityId) { setLoading(false); return; }

      const res = await fetch(`/api/events/my?userId=${user.sanityId}`);
      if (res.ok) {
        setEvents(await res.json());
      }
      setLoading(false);
    }
    if (session) fetchEvents();
  }, [session]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-gray-900">
          My Events
        </h1>
        <Link
          href="/dashboard/my-events/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors"
        >
          Submit New Event
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : events.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Title</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event: any) => (
                <tr key={event._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {event.date ? new Date(event.date).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.status === "published" ? "bg-green-100 text-green-700" :
                      event.status === "pendingApproval" ? "bg-yellow-100 text-yellow-700" :
                      event.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-8 text-gray-600">
          You haven&apos;t submitted any events yet.{" "}
          <Link href="/dashboard/my-events/new" className="text-primary">
            Submit your first event
          </Link>
        </p>
      )}
    </div>
  );
}
