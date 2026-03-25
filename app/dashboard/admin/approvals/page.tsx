"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AdminApprovalsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    async function fetchPending() {
      const [eventsRes, listingsRes] = await Promise.all([
        fetch("/api/events/pending"),
        fetch("/api/listings/pending"),
      ]);
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (listingsRes.ok) setListings(await listingsRes.json());
      setLoading(false);
    }
    if (user?.role === "clerk") fetchPending();
  }, [user?.role]);

  async function handleApproval(type: string, id: string, action: "published" | "rejected") {
    const endpoint = type === "event" ? `/api/events/${id}` : `/api/listings/${id}`;
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });

    if (res.ok) {
      if (type === "event") {
        setEvents((prev) => prev.filter((e) => e._id !== id));
      } else {
        setListings((prev) => prev.filter((l) => l._id !== id));
      }
    }
  }

  if (user?.role !== "clerk") {
    return <p className="text-gray-600">Access denied. Clerk role required.</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Pending Approvals
      </h1>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold text-gray-900">
              Events ({events.length})
            </h2>
            {events.length > 0 ? (
              <div className="mt-4 space-y-3">
                {events.map((event: any) => (
                  <div key={event._id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {event.venue?.title} — {event.date ? new Date(event.date).toLocaleDateString("en-GB") : ""}
                      </p>
                      {event.submittedBy && (
                        <p className="text-xs text-gray-400">
                          Submitted by: {event.submittedBy.name || event.submittedBy.email}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproval("event", event._id, "published")}
                        className="rounded-md bg-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval("event", event._id, "rejected")}
                        className="rounded-md bg-maroon px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No pending events.</p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold text-gray-900">
              Business Listings ({listings.length})
            </h2>
            {listings.length > 0 ? (
              <div className="mt-4 space-y-3">
                {listings.map((listing: any) => (
                  <div key={listing._id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="font-medium text-gray-900">{listing.title}</p>
                      <p className="text-sm text-gray-500">{listing.category?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproval("listing", listing._id, "published")}
                        className="rounded-md bg-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval("listing", listing._id, "rejected")}
                        className="rounded-md bg-maroon px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No pending listings.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
