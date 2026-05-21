import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body ?? {};

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are all required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "your_resend_key_here") {
      console.warn("[contact] RESEND_API_KEY not configured — message not delivered");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const to = process.env.CONTACT_RECIPIENT || "office@langport.life";
    const from = process.env.RESEND_FROM_EMAIL || "Langport Life <noreply@langport.life>";

    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Langport Life] ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        ``,
        message,
      ].join("\n"),
    });

    if (sendError) {
      console.error("Contact form email error:", sendError);
      return NextResponse.json(
        { error: "Your message could not be delivered right now. Please email office@langport.life directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Your message could not be delivered right now. Please email office@langport.life directly." },
      { status: 500 }
    );
  }
}
