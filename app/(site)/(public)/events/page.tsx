import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allEventsQuery } from "@/lib/queries";
import EventSearch from "@/components/EventSearch";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover events happening in and around Langport, Somerset.",
};

export const revalidate = 3600;

export default async function EventsPage() {
  const events = await client.fetch(allEventsQuery);

  const venues = [...new Set(events.map((e: any) => e.venue?.title).filter(Boolean))].sort() as string[];
  const eventTypes = [...new Set(events.map((e: any) => e.eventType).filter(Boolean))].sort() as string[];

  return (
    <>
      <PageHero
        section="events"
        title="What's On"
        subtitle="Discover events happening in and around Langport."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EventSearch events={events} venues={venues} eventTypes={eventTypes} />
      </div>
    </>
  );
}
