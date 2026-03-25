import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { client, writeClient } from "@/lib/sanity";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const event = await client.fetch(`*[_type == "event" && _id == $id][0]`, { id });
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(event);
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const user = session.user as { role?: string; sanityId?: string };

  // Only clerk or the submitter can edit
  if (user.role !== "clerk") {
    const event = await client.fetch(`*[_type == "event" && _id == $id][0]{ submittedBy->{_id} }`, { id });
    if (event?.submittedBy?._id !== user.sanityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await writeClient.patch(id).set(body).commit();
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "clerk") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await writeClient.delete(id);
  return NextResponse.json({ success: true });
}
