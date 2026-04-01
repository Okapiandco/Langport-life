import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

// Convert datetime-local value (e.g. "2026-04-15T19:00") to full ISO 8601
function toISODateTime(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) return value;
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    let doc;

    if (type === "event") {
      if (!eventDate) {
        return NextResponse.json(
          { error: "Event date is required." },
          { status: 400 }
        );
      }

      // Create a real event document with pendingApproval status
      doc = await writeClient.create({
        _type: "event",
        title,
        slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
        date: toISODateTime(eventDate),
        endDate: toISODateTime(eventEndDate),
        eventType: eventType || undefined,
        venueName: eventVenue || undefined,
        isFree: eventIsFree ?? true,
        ticketsUrl: ticketsUrl || undefined,
        organiser: organiser || undefined,
        contactName: submitterName,
        contactEmail: submitterEmail,
        contactPhone: submitterPhone || undefined,
        submittedBy: `${submitterName} (${submitterEmail})`,
        status: "pendingApproval",
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    } else if (type === "venue") {
      // Create a real venue document with inactive status (admin activates)
      doc = await writeClient.create({
        _type: "venue",
        title,
        slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
        street: street || undefined,
        town: town || "Langport",
        postcode: postcode || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        ownerName: submitterName,
        ownerEmail: submitterEmail,
        status: "pendingApproval",
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    } else if (type === "listing") {
      // Create a real business listing with pendingApproval status
      doc = await writeClient.create({
        _type: "businessListing",
        title,
        slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
        street: street || undefined,
        town: town || "Langport",
        postcode: postcode || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        submittedBy: `${submitterName} (${submitterEmail})`,
        status: "pendingApproval",
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    }

    return NextResponse.json(
      { success: true, id: doc!._id },
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
