/**
 * Recurring-event expansion.
 *
 * Approach A from docs/recurring-events-scoping.md: events store an RFC 5545
 * RRULE string. At query time we expand each event into a list of concrete
 * occurrences inside a bounded window (capped at 12 months from now per the
 * "approve once = 12 months public" decision).
 */
import { RRule, rrulestr } from "rrule";

export const MAX_EXPANSION_MONTHS = 12;

export interface BaseEvent {
  _id: string;
  date?: string; // ISO datetime
  endDate?: string;
  recurrenceRule?: string | null;
  recurrenceEndDate?: string | null; // ISO date (yyyy-mm-dd)
  excludedDates?: string[] | null; // ISO dates
  // …other fields are passed through unchanged in the occurrence
  [key: string]: unknown;
}

export interface Occurrence<E extends BaseEvent = BaseEvent> {
  /** Stable id per occurrence. For one-offs equals the doc _id. */
  occurrenceId: string;
  /** Series id — same as the doc _id. Used by homepage dedupe. */
  seriesId: string;
  /** ISO datetime of this occurrence's start. */
  date: string;
  /** ISO datetime of this occurrence's end (when the source has duration). */
  endDate?: string;
  /** True if this occurrence comes from an RRULE expansion. */
  isRecurring: boolean;
  /** The original Sanity document, with date/endDate replaced for this occurrence. */
  event: E;
}

function toIsoDate(d: Date): string {
  // ISO-8601 with offset, suitable for `new Date(...)` round-tripping
  return d.toISOString();
}

function toDateOnly(d: Date): string {
  // YYYY-MM-DD for excludedDates comparison
  return d.toISOString().slice(0, 10);
}

/**
 * Expand a single event into one or more occurrences within [windowStart, windowEnd].
 * - One-off events: returns the event itself (or empty if outside window).
 * - Recurring events: expands the RRULE, applies excludedDates, clips to recurrenceEndDate.
 *
 * windowEnd is hard-clamped to 12 months from now regardless of caller intent,
 * matching the "approve once = 12 months public" semantics.
 */
export function expandEvent<E extends BaseEvent>(
  event: E,
  windowStart: Date,
  windowEnd: Date
): Occurrence<E>[] {
  if (!event.date) return [];

  const startMs = new Date(event.date).getTime();
  const endMs = event.endDate ? new Date(event.endDate).getTime() : startMs;
  const durationMs = Math.max(0, endMs - startMs);

  // Hard cap: never expand past 12 months from now.
  const hardMax = new Date();
  hardMax.setMonth(hardMax.getMonth() + MAX_EXPANSION_MONTHS);
  const effectiveEnd = new Date(
    Math.min(windowEnd.getTime(), hardMax.getTime())
  );

  // One-off path
  if (!event.recurrenceRule) {
    if (startMs < windowStart.getTime() || startMs > effectiveEnd.getTime()) {
      return [];
    }
    return [
      {
        occurrenceId: event._id,
        seriesId: event._id,
        date: event.date,
        endDate: event.endDate,
        isRecurring: false,
        event,
      },
    ];
  }

  // Recurring path
  let rule: RRule;
  try {
    // RRULEs are typically supplied without DTSTART; supply it from event.date.
    const dtstart = new Date(event.date);
    const baseRule =
      event.recurrenceRule.toUpperCase().startsWith("RRULE:")
        ? event.recurrenceRule
        : `RRULE:${event.recurrenceRule}`;
    rule = rrulestr(baseRule, { dtstart }) as RRule;
  } catch (err) {
    console.error(`[recurrence] Bad RRULE on event ${event._id}:`, err);
    // Degrade to one-off rather than dropping the event entirely
    if (startMs < windowStart.getTime() || startMs > effectiveEnd.getTime()) return [];
    return [
      {
        occurrenceId: event._id,
        seriesId: event._id,
        date: event.date,
        endDate: event.endDate,
        isRecurring: false,
        event,
      },
    ];
  }

  // Clamp series end date too, if set
  let seriesUntil = effectiveEnd;
  if (event.recurrenceEndDate) {
    const recurEnd = new Date(event.recurrenceEndDate);
    // recurrenceEndDate is a date-only field; treat as end-of-day
    recurEnd.setHours(23, 59, 59, 999);
    if (recurEnd.getTime() < seriesUntil.getTime()) seriesUntil = recurEnd;
  }

  const excluded = new Set((event.excludedDates ?? []).map((d) => d.slice(0, 10)));

  const dates = rule.between(windowStart, seriesUntil, true);

  return dates
    .filter((d) => !excluded.has(toDateOnly(d)))
    .map((d, i) => {
      const occStart = d;
      const occEnd = new Date(d.getTime() + durationMs);
      return {
        occurrenceId: `${event._id}::${toDateOnly(d)}`,
        seriesId: event._id,
        date: toIsoDate(occStart),
        endDate: durationMs > 0 ? toIsoDate(occEnd) : undefined,
        isRecurring: true,
        // Project per-occurrence date/endDate onto the event copy so consumers
        // can use the same shape as one-offs.
        event: {
          ...event,
          date: toIsoDate(occStart),
          endDate: durationMs > 0 ? toIsoDate(occEnd) : undefined,
        } as E,
        _occurrenceIndex: i,
      };
    });
}

/**
 * Expand many events into a flat, date-sorted occurrence list.
 */
export function expandEvents<E extends BaseEvent>(
  events: E[],
  windowStart: Date,
  windowEnd: Date
): Occurrence<E>[] {
  return events
    .flatMap((e) => expandEvent(e, windowStart, windowEnd))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Take the first upcoming occurrence per series. Used by the homepage to avoid
 * "weekly yoga" dominating the Upcoming Events panel.
 */
export function dedupeBySeries<E extends BaseEvent>(
  occurrences: Occurrence<E>[]
): Occurrence<E>[] {
  const seen = new Set<string>();
  const out: Occurrence<E>[] = [];
  for (const o of occurrences) {
    if (seen.has(o.seriesId)) continue;
    seen.add(o.seriesId);
    out.push(o);
  }
  return out;
}
