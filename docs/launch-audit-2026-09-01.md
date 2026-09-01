# Launch Audit: langport.life — 1 September 2026

## Verdict

Not ready to launch today, but close. Two things must happen before DNS cutover: rotate the Sanity write token that is sitting in your public GitHub history, and fix the one-line query bug that makes clerk-only council documents publicly readable. Alongside those, the WordPress redirect map needs wiring in before cutover because the old site is on the same domain — every old URL will 404 the moment you switch unless the redirects exist first. Everything else is important but can follow launch.

## Summary

- Critical: 3
- High: 7
- Medium: 10
- Low: 7

Stack detected: Next.js 16.2.1 (App Router), Sanity v5 (CMS, no database), Resend (email), no user auth system (public site + Sanity Studio's own login), deployed on Vercel. This is not the standard Okapi Neon/Prisma/Better Auth stack; advice below is adapted accordingly.

---

## Critical

### 1. Live Sanity write token in public git history — rotate now

**What:** A real Sanity write token was hardcoded in `lib/run-migration.ts` and pushed to `origin/main` on 26 March 2026 (commit `b9792e0`). The file was deleted the next day, but the token is still readable in history, and the repo (`Okapiandco/Langport-life`) is public.

**Why it matters:** Anyone can read that token and gain full write access to the production Sanity dataset — every page, event, listing and council document on the site. It has been exposed for over five months. This is a different token from the `NEXT_PUBLIC_` incident already logged in SITE-OVERVIEW.md; that fix does not cover this one.

**Fix:**
1. Sanity dashboard → project `8ecf405k` → API → Tokens → revoke the exposed token, create a new one.
2. Update `SANITY_API_TOKEN` in `.env.local` and in Vercel env vars (all environments).
3. Skim the dataset's recent history for writes you don't recognise.
4. Optional cleanup afterwards: purge the blob from history with `git filter-repo`. Rotation is the step that actually closes the hole — history rewriting alone does not, because forks and clones may exist.

### 2. Clerk-only council documents are publicly readable

**What:** `documentBySlugQuery` in [lib/queries.ts:155](../lib/queries.ts) has no visibility filter, so any `councilDocument` marked "Clerk Only" is fully rendered — title, content, and a direct PDF download link — at `/council/documents/<slug>`. Slugs are derived from titles, so they are guessable.

**Why it matters:** The visibility toggle is the council's only confidentiality control in the CMS, and right now it only hides documents from lists and the sitemap, not from the public. For a town council this is a data-protection problem, not just a bug. Worse, Sanity CDN file URLs are unauthenticated and permanent — any clerk-only PDF whose URL has already been served stays downloadable even after the fix.

**Fix:**
```groq
// lib/queries.ts — documentBySlugQuery
*[_type == "councilDocument" && slug.current == $slug && visibility == "public"][0] { ... }
```
Then check in Sanity whether any documents are currently marked `clerksOnly`; if any have been live, re-upload those files so they get fresh CDN URLs.

### 3. No WordPress redirects — every old URL 404s at cutover

**What:** The old WordPress site runs on the same domain. Only two redirects exist (`/join-a-group` → `/community-groups`), and they are internal renames, not WP mappings. The 80 old `/directory/…` business URLs, six committee agenda/minutes URLs, and the `/town-council/…` section all die at cutover.

**Why it matters:** Those URLs hold whatever Google ranking the old site has, plus every inbound link from Facebook posts, newsletters and other sites. 404ing them throws that equity away and gives residents dead links for months.

**Fix:** paste into `next.config.ts` `redirects()` (full block in fixes.md):
- `/directory` and `/directory/:slug` → `/listings` / `/listings/:slug`
- The six committee paths recorded in `lib/committees.ts` `oldPath` (note the old WP typo `finance-and-personel`) → `/council/documents/<tag>`
- `/town-council` → `/council`, `/town-council/agendas-minutes` → `/council/documents`, `/town-council/:path*` → `/council` as a safety net
- `/wp-content/:path*` → `/council/documents` (old uploaded PDF links; see gap below)

**Two things the repo cannot answer, do before cutover:**
1. **News article slugs** — no migration script exists for articles, so nobody knows whether `/news/<slug>` matches the old WP post slugs. Crawl the old site's post URLs (Screaming Frog, or the old sitemap.xml) and diff against Sanity article slugs.
2. **Old PDF URLs** — 384 council PDFs were re-uploaded into Sanity, and the original `/wp-content/uploads/...` paths were never recorded. Crawl the old site before it is switched off; the filenames in `council-docs/` are the join key if you ever want exact per-file redirects. Otherwise accept the catch-all above.

Also worth a pre-cutover GROQ sweep of article/page bodies in Sanity for hardcoded `langport.life/directory` or `/town-council` links typed in by editors.

---

## High

### 4. No spam protection on any public endpoint

**What:** `/api/submit`, `/api/contact` and `/api/upload-image` have no rate limiting, no honeypot, no CAPTCHA, and no origin check. `/api/submit` writes directly into production Sanity and sends two emails per request — one of them to an attacker-supplied address with attacker-controlled text in the subject line.

**Why it matters:** A trivial script can flood the moderation queue, burn your Resend quota, fill Sanity storage with images, and use langport.life to send unsolicited mail to third parties, which is how domains end up on spam blocklists.

**Fix (layered, in order of value):** add a honeypot field to all public forms and reject on the server when filled; add per-IP rate limiting (Vercel Firewall rules are the zero-code option; Upstash Ratelimit if you want it in code); cap field lengths server-side; consider Cloudflare Turnstile on submit and contact. Snippets in fixes.md.

### 5. No security headers at all

**What:** `next.config.ts` defines no `headers()` — no Content-Security-Policy, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`, no frame-ancestors protection. The site, including `/studio`, can be iframed by any page (clickjacking).

**Fix:** paste-ready `headers()` block in fixes.md — static headers for everything plus a frame-ancestors CSP that excludes `/studio` (the Studio needs its own carve-outs).

### 6. `.gitignore` does not cover bare `.env`

**What:** Only `.env*.local` is ignored. A file named `.env` would be committed by `git add .` — which is exactly the class of accident that produced finding 1.

**Fix:** add `.env`, `.env.production`, `.env.development` to `.gitignore`, and commit a `.env.example` with blank values.

### 7. npm vulnerabilities: 1 critical, 17 high

**What:** `npm audit` reports 34 advisories: critical in `tar` (via `sharp`), highs in `vite` and `ws` chains. Next.js 16.2.1 itself is clean.

**Fix:** run `npm audit fix` (no `--force`), rebuild, retest. Then add `.github/dependabot.yml` (in fixes.md) so patches stop lagging — the repo currently has no `.github/` directory at all.

### 8. `/search` is indexable

**What:** The search results page has no `noindex` and is not disallowed in robots. Every `?q=` permutation is a crawlable thin page.

**Fix:** `robots: { index: false, follow: true }` in the search page metadata.

### 9. No canonical URLs anywhere

**What:** Nothing sets `alternates.canonical`, and `/listings` and `/events` accept filter query strings — crawlable duplicates with no canonical pointing home.

**Fix:** add `alternates: { canonical: "/..." }` per page (now resolves correctly since `metadataBase` was added this run). Prioritise the filterable indexes.

### 10. Sanity write client is one rename from shipping to browsers

**What:** `lib/sanity.ts` builds the `writeClient` in a module imported by three client components. The token value does not leak today (non-`NEXT_PUBLIC_` vars resolve to undefined in the browser), but the constructor call is in the client bundle, and one well-meaning env rename would expose the write token to every visitor.

**Fix:** move `writeClient` to `lib/sanity.server.ts` with `import "server-only"` at the top — makes the mistake a build error instead of a breach.

---

## Medium

### 11. Homepage has no page-level metadata
The most valuable URL on the site falls back to the root defaults. Add a dedicated `metadata` export to `app/(site)/page.tsx` with a hand-written title and description.

### 12. No favicon or app icons of any kind
Browser tabs show a blank globe. `public/Images/logo/Langport-Life-Black-Logo-002.png` exists but is unused. Add `app/icon.png` (Next.js wires the tags automatically) plus an `app/apple-icon.png`.

### 13. No custom 404 or error page
Nine routes call `notFound()` (expired events do it routinely) and land on Next's unstyled white default with no navigation. Same for runtime errors — and every page fetches from Sanity, so an outage has no branded fallback. Add `app/not-found.tsx` and `app/(site)/error.tsx`.

### 14. Structured data barely used
One `Organization` block on group pages is the sitewide total. The big miss is `Event` schema on event pages — that is what feeds Google's events carousel, the exact surface a town events hub competes for, and the page already fetches every needed field. Also worth adding: `LocalBusiness` on listings (opening hours are already in hand), `Article` on news, `BreadcrumbList` (visible breadcrumbs already exist site-wide).

### 15. Sitemap gaps
The six committee pages (`/council/documents/full-council` etc.) and all catch-all Sanity pages (e.g. `/council/policies`) are missing. The sitemap correctly excludes clerk-only documents.

### 16. Title double-branding on seven pages
Pages like `/listings` hardcode "— Langport Life" while the root template appends "| Langport Life", producing "Shops & Services — Langport Life | Langport Life". Strip the hardcoded suffixes.

### 17. `<html lang="en">` should be `en-GB`

### 18. robots.ts trailing-slash gaps
`Disallow: /studio/` does not block `/studio` (same for `/submit`). Drop the trailing slashes, or accept `/submit` as an indexable landing page and add it to the sitemap — currently it is neither.

### 19. Revalidate webhook hardening
The secret travels in the URL query string (lands in logs) and uses a non-constant-time compare. Switch to Sanity's signed webhooks (`@sanity/webhook` `isValidSignature` on the `sanity-webhook-signature` header). The cron endpoints are done properly by comparison.

### 20. Public council documents missing from site search
`searchQuery` omits `councilDocument` from its type list, so minutes and agendas never appear in site search. Functional gap rather than a bug — add the type with a `visibility == "public"` filter.

---

## Low / nice to have

- **Edit tokens never expire** — magic edit links emailed to submitters grant permanent edit rights. Consider an expiry field checked on PATCH.
- **JSON-LD `<` escaping** — `JSON.stringify` in the group schema block doesn't escape `</script>`; add `.replace(/</g, "\\u003c")`. Requires editor access to exploit, hence Low.
- **`/events/print` throws a 500** on malformed `from`/`to` dates (`.toISOString()` on Invalid Date). Guard with `isNaN(date.getTime())`.
- **`visionTool()` enabled in production Studio** — gate behind `NODE_ENV !== "production"` by convention.
- **Page weight** — `public/things-to-do/golf.png` is 1.5 MB; compress it (and the 1.1 MB walk-map PDF is fine as a download, but the PNG is rendered).
- **Stale branch** — `origin/security-and-docs-review` was merged; delete it.
- **Sitemap homepage inconsistency** — emitted as `https://langport.life/` with trailing slash while every other URL has none.

---

## Go-live day checklist (in order)

1. **Rotate the exposed Sanity token** (finding 1) — do this today regardless of launch date.
2. Fix the clerk-only document query (finding 2) and check no clerk-only PDFs have already-public CDN URLs.
3. Wire in the redirect map (finding 3); crawl the old site first for article slugs and PDF URLs while it is still up.
4. Commit outstanding work: the accessibility widget files are still uncommitted; nothing uncommitted deploys.
5. Vercel env vars set for Production: `SANITY_API_TOKEN` (the NEW one), `SANITY_REVALIDATE_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `MODERATION_RECIPIENT`, `CRON_SECRET`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `NEXT_PUBLIC_GA_MEASUREMENT_ID` (you said you'd add the GA ID at go-live — this is that moment; the consent banner is already built and GA stays dark until this is set).
6. **Sanity CORS**: add `https://langport.life` (and the www variant if used) to allowed origins in the Sanity project settings, or Studio login at `/studio` will fail in production.
7. **Sanity webhook**: point the revalidate webhook at `https://langport.life/api/revalidate?secret=...` so content edits actually refresh the live site.
8. **Seed the drag-and-drop order**: open each committee list in Studio (Council → Documents → By Committee) and use "Reset order" once per committee — until then the new manual ordering has no values to sort by.
9. DNS cutover, then immediately: submit `https://langport.life/sitemap.xml` in Google Search Console, request re-crawl of the homepage, and spot-check the top 10 old URLs redirect correctly.
10. Post-launch smoke test: submit a test event, use the contact form, check the confirmation emails arrive, check a council PDF downloads, share the homepage on WhatsApp/Facebook and confirm the new preview card shows.

---

## Already solid

- `robots.ts` and a comprehensive dynamic `sitemap.ts` exist with the correct production domain; sitemap correctly filters clerk-only documents.
- No `.env` file has ever been committed; all current tracked source reads secrets from env vars; the 128 MB `council-docs/` folder is correctly untracked.
- All GROQ queries are parameterised — no injection anywhere, including search.
- CMS rich text renders through PortableText (escaped); the single `dangerouslySetInnerHTML` is controlled JSON-LD.
- The magic-link edit flow is well designed: UUID tokens, strict field allowlist, re-moderation on edit of published content.
- Both cron endpoints properly check `CRON_SECRET` including the unset-var case.
- Cookie consent banner with consent-gated Google Analytics is already built and verified; GA stays off until the measurement ID is set.
- `/join-a-group` renames are already redirected with `permanent: true`.
- `next/image` is used with a correctly scoped `cdn.sanity.io` remote pattern.
- 33 of 39 public pages have real titles and descriptions; detail pages use `generateMetadata` correctly.
- Studio relies on Sanity's own auth with nothing in the repo weakening it.

## Fixes applied this run

- Generated `app/opengraph-image.tsx` (1200x630, site palette: teal `#68ABB4`, copper accent `#C8845A`) — verified rendering and correct `og:image` / `twitter:image` tags with width, height and alt.
- Added `metadataBase`, `openGraph` (siteName, `en_GB` locale) and `twitter.card: summary_large_image` to the root layout — required for the image and any future canonical URLs to resolve absolutely.

Everything else in this report is deliberately left as findings. Paste-ready code for the top fixes is in `launch-audit-fixes.md` alongside this file.
