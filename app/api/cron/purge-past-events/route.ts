/**
 * Daily cron — purge past events.
 *
 * Deletes any event document whose effective end date is more than
 * GRACE_DAYS in the past. Recurring series are kept until their
 * `recurrenceEndDate + grace` is in the past — until then the series is
 * still useful for future occurrences.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` header.
 * Schedule via Vercel Cron in vercel.json:
 *   { "path": "/api/cron/purge-past-events", "schedule": "0 3 * * *" }
 */
import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

const GRACE_DAYS = 30;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GRACE_DAYS);
  const cutoffIso = cutoff.toISOString();

  // Past one-off events: no recurrence rule AND effective end < cutoff.
  // Past recurring series: have recurrenceRule AND recurrenceEndDate < cutoff (date-only).
  const cutoffDate = cutoffIso.slice(0, 10);
  const targets: Array<{ _id: string; title: string; date?: string; recurrenceEndDate?: string }> =
    await writeClient.fetch(
      `*[_type == "event" && (
          (!defined(recurrenceRule) && coalesce(endDate, date) < $cutoffIso) ||
          (defined(recurrenceRule) && defined(recurrenceEndDate) && recurrenceEndDate < $cutoffDate)
        )]{ _id, title, date, recurrenceEndDate }`,
      { cutoffIso, cutoffDate }
    );

  const deleted: string[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const doc of targets) {
    try {
      await writeClient.delete(doc._id);
      deleted.push(doc._id);
    } catch (err) {
      errors.push({ id: doc._id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  console.log(
    `[cron purge-past-events] Considered ${targets.length}, deleted ${deleted.length}, errors ${errors.length}`
  );

  return NextResponse.json({
    cutoffIso,
    considered: targets.length,
    deleted: deleted.length,
    errors,
  });
}
