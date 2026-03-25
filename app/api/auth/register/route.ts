import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
import { userByEmailQuery } from "@/lib/queries";
import { client } from "@/lib/sanity";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (!["public", "businessOwner"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role." },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existing = await client.fetch(userByEmailQuery, { email });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  // Hash password with crypto (built-in, no extra dep needed)
  // In production, consider bcrypt
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  const userId = crypto.randomUUID();

  await writeClient.create({
    _type: "siteUser",
    userId,
    name,
    email,
    role,
    status: "active",
    // Store password hash — in a separate field we'll add
    passwordHash: `${salt}:${hash}`,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
