import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { client } from "@/lib/sanity";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; sanityId?: string } | undefined;

  if (!user || user.role !== "venueOwner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Find the venue owned by this user, then find pending events for that venue
  const events = await client.fetch(
    `*[_type == "event" && status == "pendingApproval" && venue->owner._ref == $userId] | order(_createdAt desc) {
      _id, title, date, eventType,
      submittedBy->{ name, email }
    }`,
    { userId: user.sanityId }
  );

  return NextResponse.json(events);
}
