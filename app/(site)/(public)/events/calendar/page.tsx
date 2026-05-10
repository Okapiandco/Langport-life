import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allEventsQuery } from "@/lib/queries";
import { expandEvents, MAX_EXPANSION_MONTHS } from "@/lib/recurrence";
import EventsCalendar from "@/components/EventsCalendar";
import EventsViewTabs from "@/components/EventsViewTabs";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Events Calendar",
  description: "Calendar view of events in and around Langport, Somerset.",
};

export const revalidate = 3600;

interface CalendarEventData {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  endDate?: string;
  isFree?: boolean;
  eventType?: string;
}

export default async function EventsCalendarPage() {
  const rawEvents = await client.fetch(allEventsQuery);
  // Expand recurring events to occurrences so each repeat shows on the calendar.
  const now = new Date();
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + MAX_EXPANSION_MONTHS);
  const events: CalendarEventData[] = expandEvents(rawEvents, now, horizon).map(
    (occ) => ({ ...(occ.event as unknown as CalendarEventData), _id: occ.occurrenceId })
  );

  return (
    <>
      <PageHero
        section="events"
        title="What's On"
        subtitle="Calendar view of upcoming and past events."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EventsViewTabs active="calendar" />
        <EventsCalendar events={events} />
      </div>
    </>
  );
}
