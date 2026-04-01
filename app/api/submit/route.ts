import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

// Convert datetime-local value (e.g. "2026-04-15T19:00") to full ISO 8601
function toISODateTime(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  // Already has timezone info
  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) return value;
  // Append seconds if missing, then treat as UTC
  const normalized = value.includes("T")
    ? value.length <= 16 ? `${value}:00Z` : `${value}Z`
    : undefined;
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      submitterName,
      submitterEmail,
      submitterPhone,
      title,
      description,
      // Event fields
      eventDate,
      eventEndDate,
      eventType,
      eventVenue,
      eventIsFree,
      ticketsUrl,
      organiser,
      // Listing/venue fields
      street,
      town,
      postcode,
      phone,
      email,
      website,
    } = body;

    // Validate required fields
    if (!type || !["event", "listing", "venue"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid submission type." },
        { status: 400 }
      );
    }
    if (!submitterName || !submitterEmail || !title) {
      return NextResponse.json(
        { error: "Name, email, and title are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Validate event date
    if (type === "event" && !eventDate) {
      return NextResponse.json(
        { error: "Event date is required." },
        { status: 400 }
      );
    }

    // Build the submission document
    const doc = await writeClient.create({
      _type: "submission",
      type,
      status: "pending",
      submitterName,
      submitterEmail,
      submitterPhone: submitterPhone || undefined,
      title,
      description: description || undefined,
      // Event fields
      ...(type === "event" && {
        eventDate: toISODateTime(eventDate),
        eventEndDate: toISODateTime(eventEndDate),
        eventType: eventType || undefined,
        eventVenue: eventVenue || undefined,
        eventIsFree: eventIsFree ?? true,
        ticketsUrl: ticketsUrl || undefined,
        organiser: organiser || undefined,
      }),
      // Listing/venue fields
      ...((type === "listing" || type === "venue") && {
        street: street || undefined,
        town: town || "Langport",
        postcode: postcode || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
      }),
    });

    return NextResponse.json(
      { success: true, id: doc._id },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Submission error:", err);
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
