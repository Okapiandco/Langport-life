import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { client } from "@/lib/sanity";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;

  if (!user || user.role !== "clerk") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const listings = await client.fetch(
    `*[_type == "businessListing" && status == "pendingApproval"] | order(_createdAt desc) {
      _id, title,
      category->{ name }
    }`
  );

  return NextResponse.json(listings);
}
