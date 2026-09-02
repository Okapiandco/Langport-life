import { NextResponse, type NextRequest } from "next/server";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity";

// Old WordPress media URLs (/wp-content/uploads/YYYY/MM/File-Name.pdf) were
// re-uploaded into Sanity, so the CDN URLs are unmappable — but the original
// filename survives on the asset. Look it up and send the visitor to the
// document's page; fall back to the documents index when nothing matches.
const docByFilenameQuery = groq`
  *[_type == "councilDocument" && visibility == "public" && file.asset->originalFilename == $filename][0] {
    "slug": slug.current
  }
`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filename = decodeURIComponent(path[path.length - 1] ?? "");

  if (filename && /\.(pdf|docx?|xlsx?)$/i.test(filename)) {
    const doc = await client
      .fetch<{ slug?: string } | null>(docByFilenameQuery, { filename })
      .catch(() => null);
    if (doc?.slug) {
      return NextResponse.redirect(
        new URL(`/council/documents/${doc.slug}`, request.url),
        308
      );
    }
  }

  return NextResponse.redirect(new URL("/council/documents", request.url), 308);
}
