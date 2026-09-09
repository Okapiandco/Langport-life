import { NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity";
import { writeClient } from "@/lib/sanity.server";
import { lookupEditToken } from "@/lib/editTokens.server";

// Fields the submitter is allowed to edit on each document type.
// Deliberately excludes: _id, _type, slug, editToken, status, approvedAt,
// submittedBy, ownerName/ownerEmail, coordinatesVerified, outsideCatchment.
const EDITABLE_FIELDS: Record<string, string[]> = {
  event: [
    "title", "description", "date", "endDate", "eventType", "venueName",
    "isFree", "ticketsUrl", "organiser", "contactName", "contactEmail",
    "contactPhone", "image", "recurrenceRule", "recurrenceEndDate",
  ],
  businessListing: [
    "title", "description", "street", "town", "postcode",
    "phone", "email", "website", "coordinates", "image",
  ],
  venue: [
    "title", "description", "street", "town", "postcode",
    "phone", "email", "website", "coordinates", "image",
  ],
  group: [
    "name", "description", "location", "meetingTime", "cost",
    "organiser", "website", "contactName", "contactEmail", "contactPhone", "image",
  ],
};

// The token itself never touches Sanity: it is hashed and looked up in Neon,
// which returns the document id. The Sanity dataset is public, so a queryable
// plaintext token would let anyone edit any submission.
const docByIdQuery = groq`*[_id == $id][0]{
  _id, _type, status,
  title, name,
  description,
  date, endDate, eventType, venueName, isFree, ticketsUrl, organiser,
  contactName, contactEmail, contactPhone,
  recurrenceRule, recurrenceEndDate,
  street, town, postcode, coordinates, phone, email, website,
  location, meetingTime, cost,
  image { asset->{ _id, url }, alt }
}`;

const docStatusByIdQuery = groq`*[_id == $id][0]{ _id, _type, status }`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const record = await lookupEditToken(token).catch(() => null);
  if (!record) {
    return NextResponse.json(
      { error: "This edit link is not valid or has been revoked." },
      { status: 404 }
    );
  }

  const doc = await client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .fetch(docByIdQuery, { id: record.docId } as any)
    .catch(() => null);

  if (!doc) {
    return NextResponse.json(
      { error: "This edit link is not valid or has been revoked." },
      { status: 404 }
    );
  }

  return NextResponse.json(doc);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  // Verify the token via Neon, then confirm the document still exists
  const record = await lookupEditToken(token).catch(() => null);
  if (!record) {
    return NextResponse.json(
      { error: "This edit link is not valid or has been revoked." },
      { status: 404 }
    );
  }

  const existing = await client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .fetch(docStatusByIdQuery, { id: record.docId } as any)
    .catch(() => null);

  if (!existing) {
    return NextResponse.json(
      { error: "This edit link is not valid or has been revoked." },
      { status: 404 }
    );
  }

  const body = await req.json();
  const allowed = EDITABLE_FIELDS[existing._type] ?? [];

  // Split allowed fields into set (non-null) and unset (null — caller wants to clear the field)
  const patch: Record<string, unknown> = {};
  const unsetKeys: string[] = [];
  for (const key of allowed) {
    if (!(key in body)) continue;
    if (body[key] === null) unsetKeys.push(key);
    else patch[key] = body[key];
  }

  if (Object.keys(patch).length === 0 && unsetKeys.length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  // If previously published, send it back for review
  if (existing.status === "published" || existing.status === "active" || existing.status === "approved") {
    patch.status = existing._type === "group" ? "pending" : "pendingApproval";
  }

  try {
    let p = writeClient.patch(existing._id);
    if (Object.keys(patch).length > 0) p = p.set(patch);
    if (unsetKeys.length > 0) p = p.unset(unsetKeys);
    await p.commit();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Edit patch error:", err);
    return NextResponse.json(
      { error: "Could not save your changes. Please try again." },
      { status: 500 }
    );
  }
}
