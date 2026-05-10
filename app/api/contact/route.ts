import { NextRequest, NextResponse } from "next/server";

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

    // TODO: forward to email provider (Resend) or write to Sanity. For now, just log.
    console.log("[contact] new message", { name, email, subject, message });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Contact form error:", err);
    const messageText =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
