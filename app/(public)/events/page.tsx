import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allEventsQuery } from "@/lib/queries";
import EventCard from "@/components/EventCard";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover events happening in and around Langport, Somerset.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const events = await client.fetch(allEventsQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">Events</h1>
      <p className="mt-2 text-gray-600">
        Discover what&apos;s happening in and around Langport.
      </p>

      {events.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event: any) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-600">
          No events scheduled at the moment. Check back soon!
        </p>
      )}
    </div>
  );
}
