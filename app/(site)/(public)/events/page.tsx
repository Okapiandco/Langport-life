import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allEventsQuery } from "@/lib/queries";
import { expandEvents, MAX_EXPANSION_MONTHS } from "@/lib/recurrence";
import EventSearch from "@/components/EventSearch";
import EventsViewTabs from "@/components/EventsViewTabs";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover events happening in and around Langport, Somerset.",
};

export const revalidate = 3600;

export default async function EventsPage() {
  const rawEvents = await client.fetch(allEventsQuery);

  // Expand RRULE-based events into per-occurrence rows so the list shows every
  // future date a recurring event runs. Window: now -> 12 months out.
  const now = new Date();
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + MAX_EXPANSION_MONTHS);
  const events = expandEvents(rawEvents, now, horizon).map((occ) => ({
    ...occ.event,
    _occurrenceKey: occ.occurrenceId,
  }));

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
        <EventsViewTabs active="list" />
        <EventSearch events={events} venues={venues} eventTypes={eventTypes} />
      </div>
    </>
  );
}
