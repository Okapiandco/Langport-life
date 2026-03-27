import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { allListingsQuery } from "@/lib/queries";

export async function GET() {
  const listings = await client.fetch(allListingsQuery);
  return NextResponse.json(listings);
}
