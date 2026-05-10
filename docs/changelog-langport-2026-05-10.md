# Langport Life — Changelog

**Date:** 2026-05-10
**Branch:** `main` (working tree, not yet committed)
**Build:** passes (Next.js 16.2.1 production build, all 43 routes generate)
**Lint:** see "Known limitations" below — `next lint` was removed in Next.js 16, separate task to wire up ESLint v9 flat config

---

## Quick wins

- Removed the QR code from each venue's detail page (added no value; was simply linking back to its own page).
- Removed the "Historic Langport" scroll-in banner from the homepage.
- Removed the "Got an Event to Share?" CTA section from the homepage.
- Removed the now-unused `historicSites` projection from the homepage Sanity query.
- Made the brown "List your business or event" banner readable: heading + button text now properly white on copper.
- Fixed a long-standing global CSS bug — link styling rule was overriding navigation/card/CTA colours. Scoped to `.prose` user-content only, so Tailwind utilities now win where they should.

## Navigation & branding

- Replaced the X / Twitter link with Instagram across the site (header, footer, Sanity schema, seed script). New URL: `https://www.instagram.com/langportwhereitsto?igsh=cWNmY24wcHdidzBk`.
- Updated the Facebook URL to `https://www.facebook.com/share/1EbPeasW4k/?mibextid=wwXIfr`.
- Renamed the nav item **News** to **Town News**. URL slug `/news` is preserved (links and SEO unaffected). Page heading and browser tab title also updated to match.
- Reordered the main nav so it now reads: **What's On → Shops & Services → History → Environment → Town News → Town Council → Contact Us**.
- New **Contact Us** page at `/contact` with a name/email/subject/message form. Submissions POST to a new `/api/contact` route. Currently logs to the dev console (TODO: forward to Resend or Sanity — see "TODOs to address" below).
- Added a third **Groups** column to the **What's On** dropdown.
- Applied all four nav changes directly to the live Sanity navigation document so they appear on the public site immediately.

## Search

- Fixed site-wide search — the header search box had been pushing to `/search?q=...` but no search results page existed (every search 404'd). Built the missing page at `/search/page.tsx`.
- Updated the search GROQ to include the new `group` document type, match `name` (groups don't have `title`), search across `excerpt`, and surface the right title/image for each type.

## Events

- New **calendar view** at `/events/calendar` (react-big-calendar, month/week/agenda). Added a List/Calendar toggle at the top of the events section.
- Submission form: when the user picks a start date, the end date auto-fills to match. If they then edit end manually, subsequent start changes shift end by the same delta (multi-day events keep their duration). Clearing end re-enables auto-mirror.
- **Moderation queue** now in place: every event submission lands in Sanity as `pendingApproval` and is invisible to the public until Morag approves. The Studio "Events" sidebar leads with a ⚑ Pending Approval list. An email is sent to `office@langport.life` on every new submission with a deep-link to the document.
- **Recurring events** end-to-end:
  - Public submitter form has a guided recurrence picker (None / Weekly / Every 2 weeks / Monthly / Yearly + a "Repeats until" date defaulting to start + 1 year).
  - API translates the picker into an RFC 5545 RRULE on submit.
  - Frontend expands recurring events into individual occurrences on the events list, calendar, homepage, and venue detail pages — capped at 12 months from now.
  - Homepage dedupes to one upcoming occurrence per series (so weekly yoga doesn't dominate the panel).
  - Approving a series approves all 12 months of occurrences in a single click.
  - Editor can cancel a single date by adding it to the new "Excluded Dates" field.
- Two new daily background jobs (Vercel Cron):
  - **Purge past events** — deletes events more than 30 days past their date (30-day grace). For recurring series, deletes only after the series's `recurrenceEndDate` is more than 30 days past.
  - **Series expiry reminders** — emails Morag 30 days before each recurring series's end date, so she has time to renew or let it lapse.

## Venues

- New auto-geocode at submission via Nominatim (free OpenStreetMap geocoder). New listings arrive with a starting pin instead of empty coordinates.
- New `coordinatesVerified` boolean: editors tick this in Studio after dragging the pin to the right place. Until ticked, the venue shows `⚠ unverified pin` in the Studio venue list.
- New **catchment-area check** on submission via postcodes.io: venues whose postcode is more than 5 miles (configurable in Site Settings) from Langport town centre are tagged `outsideCatchment` with a recorded distance. Warning only — submission is still saved as pending. New "⚠ Outside Catchment" sidebar filter in Studio for triage.
- "All listings are reviewed before going live" reassurance banner added to the public venue submission form.
- Removed the duplicate "The Rose & Crown (Eli's Inn)" venue document — the older entry with no structured fields was deleted, the newer one with full address kept.
- Removed the "Past Events at this venue" block from the venue detail page (per the "past events delete themselves" decision in `recurring-events-scoping.md` — section would render empty).

## Business listings

- Same auto-geocode + `coordinatesVerified` pattern applied for consistency.
- One-off cleanup: deleted 13 scraped listings (HTML entities like `&#038;` in title, no image, all imported in a 90-second window — looked like a botched WordPress page-title scrape) and the no-image duplicate of "Koleman Creative Picture Framing".
- Audit and backfill scripts available in `/scripts` for ongoing maintenance:
  - `audit-listings.ts` — produces a CSV of every listing with Google Maps links to spot-check pin vs address.
  - `backfill-listing-coords.ts` — geocodes any listing missing coordinates, dry-run by default.

## Groups (new feature)

- New **Join a Group** section at `/join-a-group` listing community groups, with detail pages mirroring the venue detail layout.
- New `group` schema in Sanity (name, description, location, meeting time, cost, contact details, image, status pending/approved/rejected).
- Approval flow matches events (Studio sidebar with Approved / Pending / Rejected lists; only `approved` groups appear publicly).
- Each detail page includes JSON-LD `Organization` schema for SEO.

## Maps & accuracy

- Diagnosed the "Art Tea Zen pinning to NatWest" bug — coordinates were correct for the saved address; the address itself was wrong. Audit script surfaces this kind of mismatch for editor review.
- Added a "⚠ Outside Catchment" tag (see Venues section) so venues from outside Langport don't disappear silently.

## Studio (Sanity) improvements for moderators

- "Events" sidebar now leads with **⚑ Pending Approval**.
- New "Groups" sidebar section with Approved / Pending / Rejected sub-lists.
- "Venues" sidebar gains an **⚠ Outside Catchment** filter for triage.
- Document previews surface flags: `⚠ unverified pin`, `⚠ outside catchment (X mi)`.
- New site-settings fields: `catchmentCentre` (geopoint), `catchmentRadiusMiles` (number, default 5).

## New environment variables

The following env vars were introduced. Add to Vercel project settings before the next deploy:

| Var | Purpose | Required? |
|---|---|---|
| `RESEND_API_KEY` | Resend API key (for moderation emails + expiry reminders). | Yes — without it, emails silently skip. |
| `RESEND_FROM_EMAIL` | From address for outgoing email. Defaults to `Langport Life <onboarding@resend.dev>` until the langport.life domain is verified in Resend. | Optional |
| `MODERATION_RECIPIENT` | Where moderation emails go. Defaults to `office@langport.life`. | Optional |
| `NEXT_PUBLIC_STUDIO_URL` | Base URL used in email "review in Studio" links. Set to `https://langport.life/studio` in production. | Optional |
| `NEXT_PUBLIC_SITE_URL` | Used in JSON-LD `url` fields on group detail pages. Defaults to `https://langport.life`. | Optional |
| `CRON_SECRET` | Long random string. Both cron routes refuse to run without `Authorization: Bearer $CRON_SECRET`. Generate with `openssl rand -hex 32`. | **Yes** — without it, the daily jobs return 401 and never run. |

## Documentation added

- [`docs/MODERATION.md`](MODERATION.md) — short walkthrough for Morag covering the moderation queue, recurring events, and what to do when a submission goes wrong.
- [`docs/recurring-events-scoping.md`](recurring-events-scoping.md) — the original scoping document (three storage approaches considered, decisions ratified, phased delivery plan).
- This changelog.

## TODOs to address before handover

There are two intentional placeholders left in the contact-us flow for the client to fill in:

1. [`app/api/contact/route.ts:21`](../app/api/contact/route.ts) — `// TODO: forward to email provider (Resend) or write to Sanity. For now, just log.`
   The /api/contact endpoint currently `console.log`s the submission. Wire it to Resend (mirror the pattern in `app/api/submit/route.ts`'s `notifyModerator`) so contact-form messages reach `office@langport.life` like the other moderation emails do.
2. [`app/(site)/(public)/contact/page.tsx:144`](../app/%28site%29/%28public%29/contact/page.tsx) — `{/* TODO: Replace placeholders with the real Town Council contact details. */}`
   The Town Council details block at the bottom of the contact page currently shows `[address]`, `[phone]`, `[email]`. Fill these in.

## Build & lint status

- **`npm run build`**: passes after two TypeScript fixes (loose `BaseEvent` cast on calendar page, `Record<string, unknown>` cast on search page params). All 43 routes build cleanly.
- **`npm run lint`**: **passes** (0 errors, 0 warnings).
  - Migrated from the now-removed `next lint` to ESLint v9 flat config in `eslint.config.mjs`.
  - Lint script changed from `"next lint"` → `"eslint ."`.
  - Fixed three pre-existing React-Compiler-era rule violations rather than downgrading them:
    - **`council/members/page.tsx`** — hoisted nested `MemberCard` and `MemberSection` components to module scope.
    - **`EventSearch.tsx`** — removed a manual `useMemo` the React Compiler couldn't preserve (recomputing on each render is trivially cheap at the site's scale, and Compiler will memoize automatically when enabled). Also fixed a duplicate-`key` bug where recurring-event occurrences were colliding on the underlying series ID — now uses `_occurrenceKey ?? _id`.
    - **`MapView.tsx`** — replaced the `useState(false)` + `useEffect(() => setMounted(true))` SSR-skip pattern with a `useSyncExternalStore`-based `useIsClient()` hook. Same behaviour, no setState-in-effect, lint-clean.

## Known operational gaps to flag to the client

- No automated tests yet (the recurrence expansion logic in particular has DST/midnight/leap-year edge cases worth covering — budget ~1 day for a Vitest setup).
- The Resend "from" address still falls back to `onboarding@resend.dev` because the `langport.life` domain isn't verified in Resend yet. Verify the domain to send from `noreply@langport.life`.
- Cron schedules are UTC (3am/4am). Fine for a community site but worth knowing if anyone asks why the timestamp is an hour off in summer.
- Vercel `CRON_SECRET` env var must be set before the daily jobs will run — they intentionally 401 without it.
