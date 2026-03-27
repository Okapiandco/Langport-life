import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { allEventsQuery } from "@/lib/queries";

export async function GET() {
  const events = await client.fetch(allEventsQuery);
  return NextResponse.json(events);
}
