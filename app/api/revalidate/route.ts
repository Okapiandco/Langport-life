import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Sanity webhook → on-demand revalidation
// Set up a webhook in Sanity at: https://www.sanity.io/manage
// pointing to https://your-domain.com/api/revalidate
// with a secret matching SANITY_REVALIDATE_SECRET in your .env

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body?._type;

    // Map document types to the paths that need revalidating
    const pathMap: Record<string, string[]> = {
      event: ["/", "/events"],
      venue: ["/", "/venues", "/events"],
      businessListing: ["/", "/listings"],
      listingCategory: ["/listings"],
      activity: ["/things-to-do"],
      transportOption: ["/getting-here"],
      article: ["/", "/news"],
      articleCategory: ["/news"],
      historicSite: ["/", "/history"],
      councilMember: ["/council", "/council/members", "/council/somerset-councillors"],
      councilDocument: ["/council", "/council/documents", "/council/finance", "/council/governance"],
      page: ["/"],
      siteSettings: ["/"],
      navigation: ["/"],
    };

    const paths = pathMap[type] || ["/"];

    // Revalidate all affected paths
    for (const path of paths) {
      revalidatePath(path);
    }

    // If the document has a slug, also revalidate the detail page
    const slug = body?.slug?.current;
    if (slug) {
      const detailPathMap: Record<string, string> = {
        event: `/events/${slug}`,
        venue: `/venues/${slug}`,
        businessListing: `/listings/${slug}`,
        activity: `/things-to-do/${slug}`,
        article: `/news/${slug}`,
        historicSite: `/history/${slug}`,
        councilMember: `/council/members/${slug}`,
        councilDocument: `/council/documents/${slug}`,
      };
      const detailPath = detailPathMap[type];
      if (detailPath) {
        revalidatePath(detailPath);
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      type,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 }
    );
  }
}
