/** Europe/London time helpers that work the same on the server (UTC) and in the browser */

/** Minutes Europe/London is ahead of UTC at the given instant (0 in winter, 60 in summer) */
export function londonOffsetMinutes(ms: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(ms));
  const n = (t: string) => Number(parts.find((x) => x.type === t)?.value);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"));
  return Math.round((asUtc - Math.floor(ms / 60000) * 60000) / 60000);
}

/** London wall-clock time as a fake-UTC Date (for calendar maths) */
export const toLondonWall = (d: Date) => new Date(d.getTime() + londonOffsetMinutes(d.getTime()) * 60000);

/** Reverse of toLondonWall */
export function fromLondonWall(d: Date): Date {
  const guess = d.getTime() - londonOffsetMinutes(d.getTime()) * 60000;
  return new Date(d.getTime() - londonOffsetMinutes(guess) * 60000);
}

/** "2026-09-24T19:30" typed as UK time -> UTC ISO string. Strings with a zone are kept as-is. */
export function londonLocalToUtcIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (/(Z|[+-]\d{2}:\d{2})$/.test(value)) return value;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const wall = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return fromLondonWall(wall).toISOString();
}

/** YYYY-MM-DD of the London calendar day an instant falls on */
export const londonDateKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
