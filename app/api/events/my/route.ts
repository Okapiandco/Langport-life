import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const events = await client.fetch(
    `*[_type == "event" && submittedBy._ref == $userId] | order(_createdAt desc) {
      _id, title, date, status
    }`,
    { userId }
  );

  return NextResponse.json(events);
}
