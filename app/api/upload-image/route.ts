import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity.server";
import { checkRateLimit, clientIp } from "@/lib/rateLimit.server";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// `file.type` is whatever the browser chose to send, so it says nothing about
// the bytes. This endpoint is unauthenticated and writes into the Sanity media
// library, so each allowed type must also prove itself by its magic number —
// otherwise anyone can host an arbitrary file on the project's CDN by
// declaring it as a PNG.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const ALLOWED_TYPES: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(PNG_SIGNATURE),
  "image/gif": (b) => b.subarray(0, 3).toString("ascii") === "GIF",
  // RIFF....WEBP — the four bytes between are the file length.
  "image/webp": (b) =>
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP",
};

export async function POST(request: NextRequest) {
  try {
    // 10 uploads per IP per 10 minutes — this endpoint is unauthenticated and
    // writes straight into the Sanity media library.
    if (!checkRateLimit(`upload:${clientIp(request)}`, 10, 10 * 60_000)) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }
    const matchesSignature = ALLOWED_TYPES[file.type];
    if (!matchesSignature) {
      return NextResponse.json(
        { error: "Image must be a JPEG, PNG, WebP or GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 8 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesSignature(buffer)) {
      return NextResponse.json(
        { error: "That file is not a valid image. Please upload a JPEG, PNG, WebP or GIF." },
        { status: 400 }
      );
    }

    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ assetId: asset._id }, { status: 200 });
  } catch (err: unknown) {
    console.error("Image upload error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
