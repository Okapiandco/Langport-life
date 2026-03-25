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

  const users = await client.fetch(
    `*[_type == "siteUser"] | order(name asc) {
      _id, userId, name, email, role, status
    }`
  );

  return NextResponse.json(users);
}
