import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { searchQuery } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await client.fetch(searchQuery, { query: `${q}*` } as Record<string, unknown>);
  return NextResponse.json(results);
}
