/** Display helpers for event dates, always in UK time */

import { londonDateKey } from "./londonTime";

const TZ = "Europe/London";

/** Link to an event; repeating events link to the specific date shown */
export function eventHref(event: { slug: { current: string }; date?: string; recurrenceRule?: string | null }): string {
  const base = `/events/${event.slug.current}`;
  return event.recurrenceRule && event.date ? `${base}?date=${londonDateKey(event.date)}` : base;
}

const DAY_NAMES: Record<string, string> = {
  MO: "Monday", TU: "Tuesday", WE: "Wednesday", TH: "Thursday",
  FR: "Friday", SA: "Saturday", SU: "Sunday",
};
const ORDINALS: Record<string, string> = {
  "1": "first", "2": "second", "3": "third", "4": "fourth", "-1": "last",
};

/** "Thursday 24 September 2026" */
export function formatLongDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ })
    .replace(",", "");
}

/** "7pm" or "7:30pm" */
export function formatTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ })
    .replace(/\s/g, "")
    .replace(":00", "")
    .toLowerCase();
}

const sameUkDay = (a: string, b: string) =>
  new Date(a).toLocaleDateString("en-GB", { timeZone: TZ }) ===
  new Date(b).toLocaleDateString("en-GB", { timeZone: TZ });

/** "5pm – 8pm", or "5pm – 2 October 2026 at 8pm" when it runs past midnight */
export function formatTimeRange(start: string, end?: string | null): string {
  if (!end) return formatTime(start);
  if (sameUkDay(start, end)) return `${formatTime(start)} – ${formatTime(end)}`;
  return `${formatTime(start)} – ${formatLongDate(end)} at ${formatTime(end)}`;
}

/** Plain-English repeat pattern, e.g. "Every Thursday until 23 July 2027" */
export function describeRecurrence(rule?: string | null, endDate?: string | null): string | null {
  if (!rule) return null;
  const parts = Object.fromEntries(
    rule.replace(/^RRULE:/i, "").split(";").map((p) => p.split("=") as [string, string])
  );
  const interval = Number(parts.INTERVAL || 1);
  const days = (parts.BYDAY || "").split(",").filter(Boolean);

  let pattern: string | null = null;
  if (parts.FREQ === "DAILY") {
    pattern = interval === 1 ? "Every day" : `Every ${interval} days`;
  } else if (parts.FREQ === "WEEKLY") {
    const names = days.map((d) => DAY_NAMES[d.slice(-2)]).filter(Boolean);
    const list = names.length ? names.join(", ").replace(/, ([^,]*)$/, " and $1") : "week";
    pattern = interval === 1 ? `Every ${list}` : interval === 2 ? `Every other ${list}` : `Every ${interval} weeks on ${list}`;
  } else if (parts.FREQ === "MONTHLY") {
    const m = days[0]?.match(/^(-?\d)?([A-Z]{2})$/);
    const setPos = parts.BYSETPOS;
    if (m && (m[1] || setPos) && DAY_NAMES[m[2]]) {
      pattern = `The ${ORDINALS[m[1] || setPos] ?? m[1]} ${DAY_NAMES[m[2]]} of every month`;
    } else if (parts.BYMONTHDAY) {
      pattern = `Monthly on day ${parts.BYMONTHDAY}`;
    } else {
      pattern = "Every month";
    }
  } else if (parts.FREQ === "YEARLY") {
    pattern = "Every year";
  }
  if (!pattern) return "Repeats regularly";

  let until: Date | null = null;
  if (parts.UNTIL) {
    const u = parts.UNTIL.match(/^(\d{4})(\d{2})(\d{2})/);
    if (u) until = new Date(Date.UTC(+u[1], +u[2] - 1, +u[3], 12));
  }
  if (endDate) {
    const e = new Date(`${endDate.slice(0, 10)}T12:00:00Z`);
    if (!until || e < until) until = e;
  }
  return until
    ? `${pattern} until ${until.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TZ })}`
    : pattern;
}
