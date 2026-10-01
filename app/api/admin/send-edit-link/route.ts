import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { writeClient } from "@/lib/sanity.server";
import { createEditToken, deleteTokensForDocs, hashToken } from "@/lib/editTokens.server";
import { checkRateLimit, clientIp } from "@/lib/rateLimit.server";

/**
 * Emails a business, organiser or group their edit link.
 *
 * Authority comes from the request document: the Studio writes an
 * `editLinkRequest`, which needs a write token, so only a signed-in editor can
 * create one. This route reads it with the server's own token, sends the link
 * and deletes the request. Requests older than five minutes are refused.
 */

const REQUEST_MAX_AGE_MS = 5 * 60 * 1000;

const TYPE_LABELS: Record<string, string> = {
  businessListing: "business listing",
  event: "event",
  venue: "venue",
  group: "group",
};

export async function POST(req: NextRequest) {
  // Generous for a clerk working through a list, tight enough to be no use to anyone else
  if (!checkRateLimit(`send-edit-link:${clientIp(req)}`, 30, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const requestId = body?.requestId;
  if (typeof requestId !== "string" || !requestId) {
    return NextResponse.json({ error: "Missing request id." }, { status: 400 });
  }

  const request = await writeClient
    .fetch<{
      _id: string;
      _type: string;
      targetId?: string;
      targetType?: string;
      email?: string;
      recipientName?: string;
      requestedAt?: string;
    } | null>(`*[_id == $id][0]{_id, _type, targetId, targetType, email, recipientName, requestedAt}`, {
      id: requestId,
    })
    .catch(() => null);

  if (!request || request._type !== "editLinkRequest") {
    return NextResponse.json({ error: "That request is no longer valid." }, { status: 404 });
  }

  // Always clear the request, whatever happens next — it is single use
  const cleanUp = () => writeClient.delete(request._id).catch(() => {});

  const age = Date.now() - new Date(request.requestedAt ?? 0).getTime();
  if (!request.requestedAt || Number.isNaN(age) || age > REQUEST_MAX_AGE_MS || age < -60_000) {
    await cleanUp();
    return NextResponse.json({ error: "That request has expired. Please try again." }, { status: 410 });
  }

  const email = (request.email ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    await cleanUp();
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  const target = await writeClient
    .fetch<{ _id: string; _type: string; title?: string; name?: string } | null>(
      `*[_id == $id][0]{_id, _type, title, name}`,
      { id: request.targetId }
    )
    .catch(() => null);

  if (!target || !TYPE_LABELS[target._type]) {
    await cleanUp();
    return NextResponse.json({ error: "That listing no longer exists." }, { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_key_here") {
    await cleanUp();
    return NextResponse.json(
      { error: "Email is not configured on the server, so no link was sent." },
      { status: 500 }
    );
  }

  const token = randomUUID();
  const listingName = target.title ?? target.name ?? "your listing";
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL || "https://langport.life";
  const editUrl = `${siteBase}/edit/${token}`;

  try {
    // A new link replaces any previous one, so a link that has gone astray
    // stops working as soon as a replacement is sent.
    await deleteTokensForDocs([target._id]);
    await createEditToken(token, {
      docId: target._id,
      docType: target._type,
      submitterName: request.recipientName ?? null,
      submitterEmail: email,
      submitterPhone: null,
    });
    await writeClient.patch(target._id).set({ editTokenHash: hashToken(token) }).commit();
  } catch (err) {
    console.error("[send-edit-link] Could not store the token:", err);
    await cleanUp();
    return NextResponse.json(
      { error: "Could not create the link. Please try again." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL || "Langport Life <onboarding@resend.dev>";
    const greeting = request.recipientName ? `Hi ${request.recipientName},` : "Hello,";
    await resend.emails.send({
      from,
      to: email,
      replyTo: process.env.MODERATION_RECIPIENT?.split(",")[0].trim(),
      subject: `Your edit link for ${listingName} — Langport Life`,
      text: [
        greeting,
        ``,
        `Here is your link to update "${listingName}" on Langport Life:`,
        editUrl,
        ``,
        `Open it to change your description, photo, opening details and contact information. Changes come back to us for a quick check before they appear on the site.`,
        ``,
        `Please keep this link safe — anyone with it can edit your ${TYPE_LABELS[target._type]}. If you have had a link before, it no longer works and this one replaces it.`,
        ``,
        `If you did not ask for this, let us know at office@langport.life and we will cancel it.`,
        ``,
        `— Langport Life`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[send-edit-link] Email failed:", err);
    await cleanUp();
    return NextResponse.json(
      { error: "The link was created but the email would not send. Please try again." },
      { status: 502 }
    );
  }

  await cleanUp();
  return NextResponse.json({ sent: true, email, listing: listingName });
}
