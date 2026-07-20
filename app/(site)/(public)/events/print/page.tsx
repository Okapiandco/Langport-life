import type { Metadata } from "next";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity";
import { expandEvents, type BaseEvent, type Occurrence } from "@/lib/recurrence";
import PrintControls from "./PrintControls";

export const metadata: Metadata = {
  title: "Events Print View — Langport Life",
  robots: "noindex,nofollow",
};

const printEventsQuery = groq`
  *[_type == "event" && status == "published" && (
    (date >= $from && date <= $to) ||
    (defined(recurrenceRule) && (!defined(recurrenceEndDate) || recurrenceEndDate >= $from))
  )] | order(date asc) {
    _id, title, date, endDate, eventType, isFree, organiser,
    recurrenceRule, recurrenceEndDate, excludedDates,
    "venueName": venue->title,
    "venueTown": venue->town
  }
`;

interface PrintEvent extends BaseEvent {
  title: string;
  eventType?: string;
  isFree?: boolean;
  organiser?: string;
  venueName?: string;
  venueTown?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  social: "Social",
  class: "Class",
  workshop: "Workshop",
  market: "Market",
  performance: "Performance",
  meeting: "Meeting",
  other: "Other",
};

function toLocalDateKey(iso: string) {
  // YYYY-MM-DD in Europe/London — avoids UTC-midnight edge cases
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/London" }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDayHeading(dateKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateKey + "T12:00:00"));
}

function formatShortDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default async function EventsPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from: fromParam, to: toParam } = await searchParams;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const defaultTo = new Date(today);
  defaultTo.setMonth(defaultTo.getMonth() + 2);

  const fromStr = fromParam ?? toLocalDateKey(today.toISOString());
  const toStr = toParam ?? toLocalDateKey(defaultTo.toISOString());

  const fromDate = new Date(fromStr + "T00:00:00");
  const toDate = new Date(toStr + "T23:59:59");

  const rawEvents = await client.fetch<PrintEvent[]>(printEventsQuery, {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  });

  const occurrences = expandEvents(rawEvents, fromDate, toDate) as Occurrence<PrintEvent>[];

  // Group by local date
  const grouped = new Map<string, Occurrence<PrintEvent>[]>();
  for (const occ of occurrences) {
    const key = toLocalDateKey(occ.date);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(occ);
  }
  const sortedDays = Array.from(grouped.keys()).sort();

  return (
    <>
      <style>{`
        @media print {
          header, footer, [data-print-hide] { display: none !important; }
          .print-header { display: block !important; }
          .day-section { page-break-inside: avoid; }
          .event-row { page-break-inside: avoid; }
          body { font-size: 11pt; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">

        {/* Screen controls — hidden when printing */}
        <div data-print-hide>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Events Print View</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a date range, click Load Events, then Print / Save as PDF.
          </p>
          <PrintControls from={fromStr} to={toStr} count={occurrences.length} />
        </div>

        {/* Print-only header */}
        <div className="print-header hidden border-b-2 border-gray-800 pb-4 mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Langport Life</p>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-sm text-gray-600 mt-1">
            {formatShortDate(fromDate)} to {formatShortDate(toDate)}
            &ensp;&bull;&ensp;
            {occurrences.length} event{occurrences.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Events list */}
        {sortedDays.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">No events found in this date range.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {sortedDays.map((dateKey) => {
              const occs = grouped.get(dateKey)!;
              return (
                <div key={dateKey} className="day-section">
                  <h2 className="font-heading text-sm font-bold text-primary uppercase tracking-wide border-b border-primary/30 pb-2 mb-2">
                    {formatDayHeading(dateKey)}
                  </h2>
                  <div className="divide-y divide-gray-100">
                    {occs.map((occ) => {
                      const ev = occ.event;
                      const venue = [ev.venueName, ev.venueTown].filter(Boolean).join(", ");
                      return (
                        <div key={occ.occurrenceId} className="event-row flex gap-4 py-2.5">
                          {/* Time column */}
                          <div className="flex-shrink-0 w-24 text-sm font-mono text-gray-500 pt-0.5">
                            {formatTime(occ.date)}
                            {occ.endDate && (
                              <span className="block text-xs text-gray-400">
                                &ndash;{formatTime(occ.endDate)}
                              </span>
                            )}
                          </div>
                          {/* Title + venue */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm leading-snug">{ev.title}</p>
                            {venue && (
                              <p className="text-xs text-gray-500 mt-0.5">{venue}</p>
                            )}
                          </div>
                          {/* Badges */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-1 pt-0.5">
                            {ev.eventType && EVENT_TYPE_LABELS[ev.eventType] && (
                              <span className="inline-block text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 whitespace-nowrap">
                                {EVENT_TYPE_LABELS[ev.eventType]}
                              </span>
                            )}
                            {ev.isFree && (
                              <span className="inline-block text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-0.5 font-medium">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Print footer */}
        <div className="print-header hidden mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400">
          Printed from langport.life &bull; {formatShortDate(new Date())}
        </div>
      </div>
    </>
  );
}
