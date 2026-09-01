import type { NextConfig } from "next";

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

      // Old WordPress site (same domain): GeoDirectory business directory
      { source: "/directory", destination: "/listings", permanent: true },
      { source: "/directory/:slug", destination: "/listings/:slug", permanent: true },

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

      // Old WordPress: uploaded media (exact per-file map not recoverable — see docs/launch-audit-2026-09-01.md)
      { source: "/wp-content/:path*", destination: "/council/documents", permanent: true },
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
