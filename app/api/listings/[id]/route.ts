import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const user = session.user as { role?: string; sanityId?: string };

  // Clerk can update anything; business owner can only update their own
  if (user.role !== "clerk") {
    // For non-clerk: would need ownership check here
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await writeClient.patch(id).set(body).commit();
  return NextResponse.json(updated);
}
