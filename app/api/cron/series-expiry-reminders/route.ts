/**
 * Daily cron — email reminders for recurring series approaching their
 * recurrence end date.
 *
 * Finds events where:
 *   - status == "published"
 *   - recurrenceRule is set
 *   - recurrenceEndDate is in [now+29d, now+31d]
 *   - expiryReminderSentAt is unset
 *
 * Sends one email per series via Resend, then stamps `expiryReminderSentAt`
 * to prevent duplicate sends if the cron fires multiple times in the window.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` header.
 * Schedule via Vercel Cron in vercel.json:
 *   { "path": "/api/cron/series-expiry-reminders", "schedule": "0 4 * * *" }
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { writeClient } from "@/lib/sanity";

interface SeriesDoc {
  _id: string;
  title: string;
  recurrenceEndDate?: string;
  contactEmail?: string;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lower = new Date();
  lower.setDate(lower.getDate() + 29);
  const upper = new Date();
  upper.setDate(upper.getDate() + 31);

  const candidates: SeriesDoc[] = await writeClient.fetch(
    `*[_type == "event"
        && status == "published"
        && defined(recurrenceRule)
        && defined(recurrenceEndDate)
        && recurrenceEndDate >= $lower
        && recurrenceEndDate <= $upper
        && !defined(expiryReminderSentAt)
      ]{ _id, title, recurrenceEndDate, contactEmail }`,
    { lower: isoDate(lower), upper: isoDate(upper) }
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_key_here") {
    console.warn("[cron series-expiry-reminders] RESEND_API_KEY not configured — would have notified", candidates.length);
    return NextResponse.json({ skipped: true, reason: "no API key", candidates: candidates.length });
  }

  const to = process.env.MODERATION_RECIPIENT || "office@langport.life";
  const from = process.env.RESEND_FROM_EMAIL || "Langport Life <onboarding@resend.dev>";
  const studioBase = process.env.NEXT_PUBLIC_STUDIO_URL || "https://langport.life/studio";

  const resend = new Resend(apiKey);
  const sent: string[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const series of candidates) {
    try {
      const reviewUrl = `${studioBase}/structure/event;${series._id}`;
      await resend.emails.send({
        from,
        to,
        subject: `[Langport Life] Recurring event "${series.title}" expires in 30 days`,
        text: [
          `The recurring event "${series.title}" reaches its recurrence end date on ${series.recurrenceEndDate}.`,
          ``,
          `If you'd like the series to continue, open it in the Studio and either extend the "Recurrence End Date" field or remove it.`,
          ``,
          `Review in Studio:`,
          reviewUrl,
          ``,
          `(After the end date, occurrences stop appearing on the public site.)`,
        ].join("\n"),
      });
      await writeClient
        .patch(series._id)
        .set({ expiryReminderSentAt: new Date().toISOString() })
        .commit();
      sent.push(series._id);
    } catch (err) {
      errors.push({ id: series._id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  console.log(
    `[cron series-expiry-reminders] Candidates ${candidates.length}, sent ${sent.length}, errors ${errors.length}`
  );

  return NextResponse.json({
    candidates: candidates.length,
    sent: sent.length,
    errors,
  });
}
