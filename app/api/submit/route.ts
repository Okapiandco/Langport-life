import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

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
        eventDate,
        eventEndDate: eventEndDate || undefined,
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
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
