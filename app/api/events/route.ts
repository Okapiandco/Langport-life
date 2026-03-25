import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { client, writeClient } from "@/lib/sanity";
import { allEventsQuery } from "@/lib/queries";

export async function GET() {
  const events = await client.fetch(allEventsQuery);
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, date, endDate, venueId, description, eventType, organiser, contactName, contactEmail, contactPhone, isFree, accessibilityInfo, tags } = body;

  if (!title || !date || !venueId) {
    return NextResponse.json(
      { error: "Title, date, and venue are required." },
      { status: 400 }
    );
  }

  const user = session.user as { sanityId?: string };

  const event = await writeClient.create({
    _type: "event",
    title,
    slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") },
    date,
    endDate: endDate || undefined,
    venue: { _type: "reference", _ref: venueId },
    description: description || undefined,
    eventType: eventType || undefined,
    organiser: organiser || undefined,
    contactName: contactName || undefined,
    contactEmail: contactEmail || undefined,
    contactPhone: contactPhone || undefined,
    isFree: isFree ?? true,
    accessibilityInfo: accessibilityInfo || undefined,
    tags: tags || [],
    status: "pendingApproval",
    submittedBy: user.sanityId
      ? { _type: "reference", _ref: user.sanityId }
      : undefined,
  });

  return NextResponse.json(event, { status: 201 });
}
