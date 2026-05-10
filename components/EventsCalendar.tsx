"use client";

import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import { useRouter } from "next/navigation";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface CalendarEventData {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  endDate?: string;
  isFree?: boolean;
  eventType?: string;
}

interface RBCEvent extends Event {
  resource: CalendarEventData;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales: { "en-GB": enGB },
});

export default function EventsCalendar({ events }: { events: CalendarEventData[] }) {
  const router = useRouter();

  const calendarEvents: RBCEvent[] = events
    .filter((e) => e.date)
    .map((e) => {
      const start = new Date(e.date);
      const end = e.endDate ? new Date(e.endDate) : new Date(e.date);
      // If no endDate provided, treat as a 1-hour block so the event is visible.
      const safeEnd = end.getTime() === start.getTime()
        ? new Date(start.getTime() + 60 * 60 * 1000)
        : end;
      return {
        title: e.title,
        start,
        end: safeEnd,
        resource: e,
      };
    });

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 [&_.rbc-event]:!bg-primary [&_.rbc-event]:!border-primary [&_.rbc-event]:!rounded-md [&_.rbc-today]:!bg-primary/5 [&_.rbc-active]:!bg-primary [&_.rbc-active]:!text-white [&_.rbc-toolbar_button]:!rounded-md [&_.rbc-btn-group_button]:!border-gray-300 [&_.rbc-toolbar]:!mb-4"
      style={{ minHeight: 720 }}
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        onSelectEvent={(event) =>
          router.push(`/events/${(event as RBCEvent).resource.slug.current}`)
        }
        views={["month", "week", "agenda"]}
        defaultView="month"
        culture="en-GB"
        popup
      />
    </div>
  );
}
