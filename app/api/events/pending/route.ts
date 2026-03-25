import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { client } from "@/lib/sanity";
import { pendingEventsQuery } from "@/lib/queries";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;

  if (!user || user.role !== "clerk") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const events = await client.fetch(pendingEventsQuery);
  return NextResponse.json(events);
}
