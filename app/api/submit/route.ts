import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { client, writeClient } from "@/lib/sanity";

// Convert datetime-local value (e.g. "2026-04-15T19:00") to full ISO 8601
function toISODateTime(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) return value;
  const normalized = value.includes("T")
    ? value.length <= 16 ? `${value}:00Z` : `${value}Z`
    : undefined;
  return normalized;
}

// Best-effort moderation notification. Fires after a successful submission;
// any failure is logged and swallowed so it never blocks the response.
async function notifyModerator(args: {
  type: "event" | "venue" | "listing" | "group";
  title: string;
  submitterName: string;
  submitterEmail: string;
  docId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_key_here") {
    console.warn(`[notifyModerator] RESEND_API_KEY not configured — skipping email for ${args.docId}`);
    return;
  }
  const to =
    process.env.MODERATION_RECIPIENT || "office@langport.life";
  const from =
    process.env.RESEND_FROM_EMAIL || "Langport Life <onboarding@resend.dev>";
  const studioBase =
    process.env.NEXT_PUBLIC_STUDIO_URL || "https://langport.life/studio";
  const reviewUrl = `${studioBase}/structure/${args.type};${args.docId}`;

  try {
    const resend = new Resend(apiKey);
    const subjectByType = {
      event: "New event awaiting approval",
      venue: "New venue awaiting approval",
      listing: "New business listing awaiting approval",
      group: "New group awaiting approval",
    } as const;

    await resend.emails.send({
      from,
      to,
      subject: `[Langport Life] ${subjectByType[args.type]}: ${args.title}`,
      text: [
        `A new ${args.type} has been submitted to Langport Life and is awaiting your approval.`,
        ``,
        `Title: ${args.title}`,
        `Submitted by: ${args.submitterName} <${args.submitterEmail}>`,
        ``,
        `Review and approve in the Studio:`,
        reviewUrl,
        ``,
        `Approval steps: open the document → set Status to "Published" → Publish.`,
      ].join("\n"),
    });
  } catch (err) {
    console.error(`[notifyModerator] Email send failed for ${args.docId}:`, err);
  }
}

// Translate the form's frequency picker + start date into an RFC 5545 RRULE.
// Returns undefined for one-offs or invalid input. The frontend collects only
// `frequency` and `until`; we derive the BYDAY / BYMONTHDAY / BYMONTH from the
// start date so non-technical submitters don't have to.
function buildRRule(args: {
  frequency: string | undefined;
  startIso: string | undefined;
  untilIso: string | undefined;
}): string | undefined {
  const { frequency, startIso, untilIso } = args;
  if (!frequency || frequency === "none" || !startIso) return undefined;

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return undefined;

  // RRULE UNTIL is in UTC, formatted YYYYMMDDTHHMMSSZ. Use end-of-day so the
  // last occurrence on the until date isn't skipped by timezone rounding.
  let untilPart = "";
  if (untilIso) {
    const until = new Date(untilIso);
    if (!Number.isNaN(until.getTime())) {
      until.setUTCHours(23, 59, 59, 0);
      const pad = (n: number) => String(n).padStart(2, "0");
      untilPart = `;UNTIL=${until.getUTCFullYear()}${pad(until.getUTCMonth() + 1)}${pad(until.getUTCDate())}T235959Z`;
    }
  }

  const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const dayCode = dayCodes[start.getDay()];
  const dayOfMonth = start.getDate();
  const month = start.getMonth() + 1;
  // Cap at week 4 so months with fewer than 5 occurrences always have a match.
  const weekNum = Math.min(Math.ceil(dayOfMonth / 7), 4);

  switch (frequency) {
    case "weekly":
      return `FREQ=WEEKLY;BYDAY=${dayCode}${untilPart}`;
    case "biweekly":
      return `FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayCode}${untilPart}`;
    case "monthly":         // legacy label — treat as monthly-date
    case "monthly-date":
      return `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}${untilPart}`;
    case "monthly-weekday":
      return `FREQ=MONTHLY;BYDAY=${weekNum}${dayCode}${untilPart}`;
    case "yearly":
      return `FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${dayOfMonth}${untilPart}`;
    default:
      return undefined;
  }
}

// Langport town centre — fallback when siteSettings.catchmentCentre is unset.
const DEFAULT_CATCHMENT_CENTRE = { lat: 51.0374, lng: -2.8287 };
const DEFAULT_CATCHMENT_RADIUS_MILES = 5;

// Look up a UK postcode via postcodes.io (free, no API key) and return its
// lat/lng. Returns null on any failure — caller treats as "no warning".
async function lookupPostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
    if (!cleaned) return null;
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: { latitude?: number; longitude?: number };
    };
    const lat = data.result?.latitude;
    const lng = data.result?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

// Great-circle distance in miles between two points (haversine formula).
function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Run the catchment check. Returns { outsideCatchment, distanceMiles } where
// distance is null if the postcode couldn't be resolved.
async function checkCatchment(postcode: string | undefined): Promise<{
  outsideCatchment: boolean;
  distanceMiles: number | null;
}> {
  if (!postcode) return { outsideCatchment: false, distanceMiles: null };

  // Pull centre + radius from siteSettings, falling back to defaults if absent.
  const settings = await client
    .fetch<{ catchmentCentre?: { lat: number; lng: number }; catchmentRadiusMiles?: number } | null>(
      `*[_type == "siteSettings"][0]{ catchmentCentre, catchmentRadiusMiles }`
    )
    .catch(() => null);

  const centre = settings?.catchmentCentre ?? DEFAULT_CATCHMENT_CENTRE;
  const radius = settings?.catchmentRadiusMiles ?? DEFAULT_CATCHMENT_RADIUS_MILES;

  const point = await lookupPostcode(postcode);
  if (!point) return { outsideCatchment: false, distanceMiles: null };

  const distance = haversineMiles(centre, point);
  return {
    outsideCatchment: distance > radius,
    distanceMiles: Math.round(distance * 10) / 10,
  };
}

// Auto-geocode a UK address via Nominatim (OpenStreetMap). Free, no API key.
// Returns undefined on no-result or any failure — geocoding is best-effort and
// must never block a submission. Editors verify and adjust the pin in Studio.
async function geocodeAddress(parts: {
  street?: string;
  town?: string;
  postcode?: string;
}): Promise<{ _type: "geopoint"; lat: number; lng: number } | undefined> {
  const query = [parts.street, parts.town, parts.postcode]
    .filter(Boolean)
    .join(", ");
  if (!query) return undefined;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "langport.life listing submissions (clerk@langport.life)",
      },
    });
    if (!res.ok) return undefined;
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return undefined;
    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { _type: "geopoint", lat, lng };
  } catch {
    return undefined;
  }
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
      recurrenceFrequency,
      recurrenceEndDate,
      imageAssetId,
      // Listing/venue fields
      street,
      town,
      postcode,
      phone,
      email,
      website,
      // Submitter-verified pin (from the map picker on the listing form)
      lat,
      lng,
    } = body;

    // Validate required fields
    if (!type || !["event", "listing", "venue", "group"].includes(type)) {
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

      // Translate the friendly frequency picker into an RRULE string.
      const recurrenceRule = buildRRule({
        frequency: recurrenceFrequency,
        startIso: toISODateTime(eventDate),
        untilIso: recurrenceEndDate || undefined,
      });

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
        image: imageAssetId
          ? { _type: "image", asset: { _type: "reference", _ref: imageAssetId } }
          : undefined,
        submittedBy: `${submitterName} (${submitterEmail})`,
        status: "pendingApproval",
        recurrenceRule,
        recurrenceEndDate: recurrenceRule ? recurrenceEndDate || undefined : undefined,
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    } else if (type === "venue") {
      // Auto-geocode the address as a starting suggestion. Editor verifies and
      // ticks `coordinatesVerified` in Studio.
      const [coordinates, catchment] = await Promise.all([
        geocodeAddress({
          street,
          town: town || "Langport",
          postcode,
        }),
        checkCatchment(postcode),
      ]);

      doc = await writeClient.create({
        _type: "venue",
        title,
        slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
        street: street || undefined,
        town: town || "Langport",
        postcode: postcode || undefined,
        coordinates,
        coordinatesVerified: false,
        outsideCatchment: catchment.outsideCatchment,
        distanceFromCentreMiles: catchment.distanceMiles ?? undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        image: imageAssetId
          ? { _type: "image", asset: { _type: "reference", _ref: imageAssetId } }
          : undefined,
        ownerName: submitterName,
        ownerEmail: submitterEmail,
        status: "pendingApproval",
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    } else if (type === "listing") {
      // Use submitter-confirmed pin if provided; otherwise auto-geocode as a
      // starting suggestion. Editor still verifies in Studio either way.
      const coordinates =
        typeof lat === "number" && typeof lng === "number"
          ? { _type: "geopoint" as const, lat, lng }
          : await geocodeAddress({ street, town: town || "Langport", postcode });

      doc = await writeClient.create({
        _type: "businessListing",
        title,
        slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
        street: street || undefined,
        town: town || "Langport",
        postcode: postcode || undefined,
        coordinates,
        coordinatesVerified: false,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        submittedBy: `${submitterName} (${submitterEmail})`,
        status: "pendingApproval",
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    } else if (type === "group") {
      const { location, meetingTime, cost, contactName, contactEmail, contactPhone } = body;
      doc = await writeClient.create({
        _type: "group",
        name: title,
        slug: { _type: "slug", current: (title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
        organiser: organiser || undefined,
        location: location || undefined,
        meetingTime: meetingTime || undefined,
        cost: cost || undefined,
        website: website || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        image: imageAssetId
          ? { _type: "image", asset: { _type: "reference", _ref: imageAssetId } }
          : undefined,
        submittedBy: `${submitterName} (${submitterEmail})`,
        status: "pending",
        description: description
          ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: description }] }]
          : undefined,
      });
    }

    // Best-effort moderation notification (non-blocking).
    notifyModerator({
      type: type as "event" | "venue" | "listing" | "group",
      title,
      submitterName,
      submitterEmail,
      docId: doc!._id,
    });

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
