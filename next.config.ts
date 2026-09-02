import type { NextConfig } from "next";
// Old WordPress news posts lived at the root (e.g. /wildlife) — these 233 slugs
// have an exact matching article at /news/<slug>. Generated from the pre-cutover
// crawl (docs/old-site-crawl/), regenerate via the diff in redirect-diff.json.
import newsRedirectSlugs from "./lib/news-redirects.generated.json";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Block iframing everywhere except /studio, which Sanity manages itself
      {
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'none'" }],
      },
    ];
  },
  async redirects() {
    return [
      // Internal renames
      { source: "/join-a-group", destination: "/community-groups", permanent: true },
      { source: "/join-a-group/:slug", destination: "/community-groups/:slug", permanent: true },

      // Old WordPress site (same domain): GeoDirectory business directory.
      // Explicit misses first (deleted during migration), then category
      // archives (two segments, so before the one-segment wildcard).
      { source: "/directory/koleman-creative-picture-framing-2", destination: "/listings", permanent: true },
      { source: "/directory/category/:path*", destination: "/listings", permanent: true },
      { source: "/directory", destination: "/listings", permanent: true },
      { source: "/directory/:slug", destination: "/listings/:slug", permanent: true },

      // Old GeoDirectory venues: /venue/<slug> -> /venues/<slug>
      { source: "/venue/cocklemoor-park", destination: "/venues", permanent: true },
      { source: "/venue/category/:path*", destination: "/venues", permanent: true },
      { source: "/venue", destination: "/venues", permanent: true },
      { source: "/venue/:slug", destination: "/venues/:slug", permanent: true },

      // Old GeoDirectory event pages (all past events) and category archives
      { source: "/events/category/:path*", destination: "/events", permanent: true },
      { source: "/events/illustrated-talk-west-moor-its-hidden-stories", destination: "/events", permanent: true },
      { source: "/events/illustrated-talk-smallpox-benjamin-jesty", destination: "/events", permanent: true },
      { source: "/events/cambodian-food-at-the-angel-cafe", destination: "/events", permanent: true },

      // Old WP blog category/tag archives
      { source: "/category/:path*", destination: "/news", permanent: true },
      { source: "/tag/:path*", destination: "/news", permanent: true },

      // Old root-level news posts with an exact new home at /news/<slug>
      ...newsRedirectSlugs.map((slug: string) => ({
        source: `/${slug}`,
        destination: `/news/${slug}`,
        permanent: true,
      })),

      // Old WordPress: committee agendas & minutes (old paths recorded in lib/committees.ts;
      // "finance-and-personel" is the old site's genuine spelling)
      { source: "/town-council/agendas-minutes/full-council", destination: "/council/documents/full-council", permanent: true },
      { source: "/town-council/agendas-minutes/finance-and-personel", destination: "/council/documents/finance-personnel", permanent: true },
      { source: "/town-council/agendas-minutes/tourism-and-marketing", destination: "/council/documents/tourism-marketing", permanent: true },
      { source: "/town-council/agendas-minutes/annual-town-assembly", destination: "/council/documents/annual-assembly", permanent: true },
      { source: "/town-council/agendas-minutes/joint-council-committee", destination: "/council/documents/joint-committee", permanent: true },
      { source: "/town-council/agendas-minutes/archived-minutes", destination: "/council/documents/archived", permanent: true },

      // Old WordPress: council section parents + safety net for any other old sub-page
      { source: "/town-council/agendas-minutes", destination: "/council/documents", permanent: true },
      { source: "/town-council/:path*", destination: "/council", permanent: true },
      { source: "/town-council", destination: "/council", permanent: true },

      // Old WordPress /wp-content/uploads/* media is handled by the route
      // handler at app/wp-content/[...path]/route.ts, which looks each file up
      // in Sanity by original filename and redirects to its document page.
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
