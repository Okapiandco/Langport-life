import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { client, writeClient } from "@/lib/sanity";
import { allListingsQuery } from "@/lib/queries";

export async function GET() {
  const listings = await client.fetch(allListingsQuery);
  return NextResponse.json(listings);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, street, town, postcode, phone, email, website, categoryId, tags } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const user = session.user as { sanityId?: string };

  const listing = await writeClient.create({
    _type: "businessListing",
    title,
    slug: { _type: "slug", current: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") },
    description: description || undefined,
    street: street || undefined,
    town: town || "Langport",
    postcode: postcode || undefined,
    phone: phone || undefined,
    email: email || undefined,
    website: website || undefined,
    category: categoryId ? { _type: "reference", _ref: categoryId } : undefined,
    tags: tags || [],
    status: "pendingApproval",
    owner: user.sanityId
      ? { _type: "reference", _ref: user.sanityId }
      : undefined,
  });

  return NextResponse.json(listing, { status: 201 });
}
