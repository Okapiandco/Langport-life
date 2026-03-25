"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function VenueApprovalsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user as { role?: string; sanityId?: string } | undefined;

  useEffect(() => {
    async function fetchPending() {
      const res = await fetch("/api/events/venue-pending");
      if (res.ok) setEvents(await res.json());
      setLoading(false);
    }
    if (user?.role === "venueOwner") fetchPending();
    else setLoading(false);
  }, [user?.role]);

  async function handleApproval(id: string, action: "published" | "rejected") {
    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e._id !== id));
    }
  }

  if (user?.role !== "venueOwner") {
    return <p className="text-gray-600">Access denied. Venue Owner role required.</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Event Approvals
      </h1>
      <p className="mt-2 text-gray-600">
        Review events submitted at your venue.
      </p>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : events.length > 0 ? (
        <div className="mt-6 space-y-3">
          {events.map((event: any) => (
            <div key={event._id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {event.date ? new Date(event.date).toLocaleDateString("en-GB") : ""}
                  {event.eventType && ` — ${event.eventType}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproval(event._id, "published")}
                  className="rounded-md bg-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(event._id, "rejected")}
                  className="rounded-md bg-maroon px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-600">No pending events for your venue.</p>
      )}
    </div>
  );
}
