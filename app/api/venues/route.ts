import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { allVenuesQuery } from "@/lib/queries";

export async function GET() {
  const venues = await client.fetch(allVenuesQuery);
  return NextResponse.json(venues);
}
