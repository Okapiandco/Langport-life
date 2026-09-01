# Launch audit — paste-ready fixes

Companion to `launch-audit-2026-09-01.md`. Grouped by file. Apply in the order they appear in the report.

---

## lib/queries.ts — clerk-only document leak (Critical 2)

```groq
export const documentBySlugQuery = groq`
  *[_type == "councilDocument" && slug.current == $slug && visibility == "public"][0] {
    _id, title, slug, documentType, date, meetingDate, description,
    htmlContent, visibility, tags,
    file { asset->{url, originalFilename, size} }
  }
`;
```

Also add council documents to site search (Medium 20) — in `searchQuery`, extend the type list and guard:

```groq
_type in ["event", "venue", "businessListing", "article", "page", "historicSite", "activity", "group", "councilDocument"] &&
...
select(
  ...
  _type == "councilDocument" => visibility == "public",
  true
)
```

---

## next.config.ts — WordPress redirects (Critical 3) + security headers (High 5)

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Internal renames (existing)
      { source: "/join-a-group", destination: "/community-groups", permanent: true },
      { source: "/join-a-group/:slug", destination: "/community-groups/:slug", permanent: true },

      // Old WordPress: GeoDirectory business directory
      { source: "/directory", destination: "/listings", permanent: true },
      { source: "/directory/:slug", destination: "/listings/:slug", permanent: true },

      // Old WordPress: committee agendas & minutes (paths from lib/committees.ts oldPath)
      { source: "/town-council/agendas-minutes/full-council", destination: "/council/documents/full-council", permanent: true },
      { source: "/town-council/agendas-minutes/finance-and-personel", destination: "/council/documents/finance-personnel", permanent: true },
      { source: "/town-council/agendas-minutes/tourism-and-marketing", destination: "/council/documents/tourism-marketing", permanent: true },
      { source: "/town-council/agendas-minutes/annual-town-assembly", destination: "/council/documents/annual-assembly", permanent: true },
      { source: "/town-council/agendas-minutes/joint-council-committee", destination: "/council/documents/joint-committee", permanent: true },
      { source: "/town-council/agendas-minutes/archived-minutes", destination: "/council/documents/archived", permanent: true },

      // Old WordPress: council section parents + safety net
      { source: "/town-council/agendas-minutes", destination: "/council/documents", permanent: true },
      { source: "/town-council/:path*", destination: "/council", permanent: true },
      { source: "/town-council", destination: "/council", permanent: true },

      // Old WordPress: uploaded media (exact per-file map not recoverable; see report)
      { source: "/wp-content/:path*", destination: "/council/documents", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // frame-ancestors everywhere except /studio (Studio needs its own carve-outs)
      {
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'none'" }],
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
```

Note: redirect `source` paths match with or without a trailing slash in Next.js, so the old WP trailing-slash URLs are covered.

---

## .gitignore — env coverage (High 6)

```
# local env files
.env
.env.development
.env.production
.env*.local
```

And commit a `.env.example`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
SANITY_REVALIDATE_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
MODERATION_RECIPIENT=
CRON_SECRET=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

---

## .github/dependabot.yml — new file (High 7)

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
    open-pull-requests-limit: 5
```

Dashboard settings to confirm (cannot verify from code): Dependabot alerts + security updates ON; secret scanning + push protection ON (free — the repo is public); branch protection on `main` blocking force-pushes; 2FA on the GitHub account.

---

## app/(site)/(public)/search/page.tsx — noindex (High 8)

```tsx
export const metadata: Metadata = {
  title: "Search",
  description: "Search events, venues, businesses and news across Langport Life.",
  robots: { index: false, follow: true },
};
```

---

## lib/sanity.server.ts — new file, and remove writeClient from lib/sanity.ts (High 10)

```ts
import "server-only";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./sanity";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
```

Export `projectId`, `dataset`, `apiVersion` from `lib/sanity.ts`, delete `writeClient` from it, and update the imports in `app/api/submit/route.ts`, `app/api/upload-image/route.ts`, `app/api/edit/[token]/route.ts`, and the cron routes to `@/lib/sanity.server`.

---

## Spam protection starter — honeypot + length caps (High 4)

Server side, at the top of `app/api/contact/route.ts` and `app/api/submit/route.ts` POST handlers:

```ts
// Honeypot: real users never fill this hidden field
if (typeof body.website === "string" && body.website.trim() !== "") {
  // Pretend success so bots don't learn
  return NextResponse.json({ ok: true });
}

// Length caps
const MAX = { title: 200, subject: 200, name: 120, email: 254, message: 5000, description: 10000 };
for (const [field, cap] of Object.entries(MAX)) {
  if (typeof body[field] === "string" && body[field].length > cap) {
    return NextResponse.json({ error: `${field} too long` }, { status: 400 });
  }
}
```

Client side, in `components/ContactForm.tsx` and each submit form, add inside the `<form>`:

```tsx
<input
  type="text"
  name="website"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  className="absolute -left-[9999px] h-0 w-0 opacity-0"
/>
```

For rate limiting without new dependencies, add a Vercel Firewall rule (dashboard → project → Firewall) limiting POSTs to `/api/contact` and `/api/submit` per IP. Turnstile is the upgrade path if spam appears anyway.

---

## app/(site)/page.tsx — homepage metadata (Medium 11)

```tsx
export const metadata: Metadata = {
  title: "Langport Life — What's On, Shops & Town Council News in Langport, Somerset",
  description:
    "Find events, local shops and services, community groups, and Langport Town Council agendas, minutes and news. The official community hub for Langport, Somerset.",
  alternates: { canonical: "/" },
};
```

(When set via a page-level `title` string it bypasses the template, so no double branding.)

---

## app/icon — favicon (Medium 12)

Export a square crop of the logo as `app/icon.png` (512x512) and `app/apple-icon.png` (180x180). Next.js generates all the tags automatically; no code needed.

---

## app/not-found.tsx — new file (Medium 13)

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-heading text-5xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-4 text-gray-600">
        This page may have moved when we rebuilt the site, or the event may have passed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary/90">Home</Link>
        <Link href="/events" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50">What's On</Link>
        <Link href="/search" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50">Search</Link>
      </div>
    </div>
  );
}
```

Note: `app/not-found.tsx` sits outside the `(site)` group, so it renders without header/footer. If you want the full chrome, also add `app/(site)/[...catchall]` handling or accept the standalone page above.

---

## app/(site)/(public)/events/[slug]/page.tsx — Event schema (Medium 14)

Inside the page component, after fetching the event:

```tsx
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.title,
  startDate: event.date,
  ...(event.endDate && { endDate: event.endDate }),
  eventStatus:
    event.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
  location: event.venue && {
    "@type": "Place",
    name: event.venue.title,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.venue.street,
      addressLocality: event.venue.town || "Langport",
      postalCode: event.venue.postcode,
      addressCountry: "GB",
    },
  },
  ...(event.image?.asset?.url && { image: [event.image.asset.url] }),
  ...(event.isFree && {
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  }),
  organizer: { "@type": "Organization", name: event.organiser || "Langport Life" },
};

// in the JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
/>
```

The `.replace(/</g, "\\u003c")` also fixes the escaping gap in the existing group-page JSON-LD (Low) — apply it there too.

---

## app/sitemap.ts — committee pages + CMS pages (Medium 15)

```ts
import { COMMITTEES } from "@/lib/committees";

// inside sitemap(): add to the GROQ projection
// "pages": *[_type == "page" && published == true && defined(slug.current)]{ "slug": slug.current, _updatedAt }

// and to the returned array:
...COMMITTEES.map((c) => ({
  url: `${BASE}/council/documents/${c.tag}`,
  lastModified: new Date(),
})),
...data.pages.map((p: { slug: string; _updatedAt: string }) => ({
  url: `${BASE}/${p.slug}`,
  lastModified: new Date(p._updatedAt),
})),
```

(Dedupe against the hardcoded static list — `/about`, `/privacy-policy` etc. are `page` documents too.)

---

## app/layout.tsx — lang (Medium 17)

```tsx
<html lang="en-GB" className={...}>
```

---

## app/robots.ts — trailing slashes (Medium 18)

```ts
disallow: ["/studio", "/submit/", "/edit/", "/events/print", "/api/", "/search"],
```

(Keep `/submit/` with the slash if the submit landing page should stay indexable — then also add `/submit` to the sitemap. Drop to `/submit` to block the lot.)

---

## Title double-branding (Medium 16)

Strip the hardcoded ` — Langport Life` suffix from the `title` in: `listings/page.tsx`, `things-to-do/page.tsx`, `things-to-do/[slug]/page.tsx` (generateMetadata), `getting-here/page.tsx`, `submit/page.tsx`, `submit/thank-you/page.tsx`, `events/print/page.tsx`. The root template appends the brand automatically.

---

## app/api/revalidate/route.ts — signed webhook (Medium 19)

```ts
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

export async function POST(req: NextRequest) {
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);
  const body = await req.text();

  if (
    !process.env.SANITY_REVALIDATE_SECRET ||
    !signature ||
    !(await isValidSignature(body, signature, process.env.SANITY_REVALIDATE_SECRET))
  ) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  // ... existing revalidatePath logic, validating payload._type against a known list
}
```

Requires `npm i @sanity/webhook` and switching the Sanity webhook config to use the secret as its signing secret (no `?secret=` in the URL).

---

## Low fixes

`app/(site)/(public)/events/print/page.tsx` — guard invalid dates:

```ts
const fromDate = new Date(fromStr + "T00:00:00");
const toDate = new Date(toStr + "T23:59:59");
if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) notFound();
```

`sanity.config.ts` — gate Vision in production:

```ts
plugins: [
  structureTool({ structure }),
  ...(process.env.NODE_ENV !== "production" ? [visionTool()] : []),
],
```

Compress `public/things-to-do/golf.png` (1.5 MB → target under 200 KB):

```bash
npx --yes sharp-cli --input public/things-to-do/golf.png --output public/things-to-do/golf.png resize 1600
```

Delete the merged remote branch:

```bash
git push origin --delete security-and-docs-review
```
