# Langport Life — Site Overview

_Last reviewed: 19 June 2026_

A reference document describing what the Langport Life website is, how it is
built, what every part does, how email notifications flow, and the current
security posture. Written for whoever maintains or updates the site.

---

## 1. What it is

Langport Life is the community website for Langport, Somerset. It carries:

- **Events** — one-off and recurring, with list and calendar views
- **Venues** — places events happen, with maps
- **Business listings** — a local shops & services directory, with maps
- **Community groups** — clubs, societies and groups
- **Things to do** — activities, walks and cycle routes
- **History** — historic sites around the town
- **News** — articles
- **Town Council** — councillors, documents (agendas/minutes/finance/governance), services
- **Information pages** — About, Getting Here, Environment, Contact, plus arbitrary CMS pages

The public can **submit** events, venues, listings and groups through forms.
Nothing appears on the site until a moderator approves it in the CMS. Submitters
get a private "magic link" to edit their own submission later.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Hosting | Vercel |
| CMS / database | Sanity (project `8ecf405k`, dataset `production`) |
| Styling | Tailwind CSS v4 |
| Maps | Leaflet / react-leaflet (OpenStreetMap tiles) |
| Calendar | react-big-calendar |
| Recurring events | `rrule` (RFC 5545 RRULE strings) |
| Transactional email | Resend |
| Image uploads | Sanity asset store |
| Geocoding | Nominatim (OpenStreetMap) + postcodes.io — both free, no key |

The CMS (Sanity Studio) is embedded in the same app at **`/studio`**.

---

## 3. Site structure (public pages)

Route groups `(site)` and `(public)` do not appear in the URL.

### Core
- `/` — homepage: hero, upcoming events, nav cards, community stats, latest news, "did you know"
- `/about` — about Langport (CMS-driven)
- `/contact` — contact form + council contact details
- `/search` — full-site search across all content types
- `/getting-here` — transport guide (train, bus, parking, cycling)
- `/environment` — flooding / environment / wildlife info
- `/[...slug]` — catch-all for arbitrary CMS pages

### Events
- `/events` — list view with search and filters
- `/events/calendar` — calendar view
- `/events/[slug]` — single event detail (venue, map, contact, related events)

### Venues
- `/venues` — map + cards
- `/venues/[slug]` — venue detail with events held there

### Listings (shops & services)
- `/listings` — directory with map, search, category filters
- `/listings/[slug]` — single business listing (hours, contact, map)

### History
- `/history` — historic sites gallery
- `/history/[slug]` — historic site detail

### Things to do
- `/things-to-do` — activities grouped by category
- `/things-to-do/[slug]` — activity detail (route map, gallery, YouTube, links)

### Community groups
- `/community-groups` — list of groups (redirected from old `/join-a-group`)
- `/community-groups/[slug]` — group detail

### News
- `/news` — articles list with category filter
- `/news/[slug]` — article detail

### Town Council
- `/council` — hub
- `/council/members` — town councillors
- `/council/members/[slug]` — councillor profile
- `/council/somerset-councillors` — county/district councillors
- `/council/documents` — agendas & minutes by committee
- `/council/documents/[slug]` — committee page or single document
- `/council/finance` — finance documents
- `/council/governance` — governance documents
- `/council/services` — council-run services
- `/council/staff-and-volunteers` — staff and volunteers

### Submit & edit
- `/submit` — hub linking the four forms
- `/submit/event`, `/submit/venue`, `/submit/listing`, `/submit/group` — submission forms
- `/submit/thank-you` — confirmation
- `/edit/[token]` — private edit page reached via the magic link emailed to submitters

---

## 4. Content types (Sanity schemas)

Singletons: `siteSettings`, `navigation`.

Content: `event`, `venue`, `businessListing`, `listingCategory`, `activity`,
`transportOption`, `article`, `articleCategory`, `historicSite`, `page`, `group`.

Council: `councilMember`, `councilDocument`, `staffMember`.

Submissions inbox: `submission`.

**Status fields gate publication.** Public list queries only return approved
records:
- events: `status == "published"`
- venues: `status == "active"`
- listings: `status == "published"`
- groups: `status == "approved"`
- articles / pages / activities: `published == true`
- council documents: `visibility == "public"`

---

## 5. How submissions work (moderation flow)

1. Visitor completes a form at `/submit/{event|venue|listing|group}`.
2. `POST /api/submit` validates required fields, generates a random `editToken`
   (UUID v4), and creates a real Sanity document with status **pending**.
   - Venues/listings are auto-geocoded (Nominatim) as a starting pin; an editor
     verifies it in Studio. Listings can also carry a submitter-confirmed pin
     from the map picker.
   - Venue submissions are checked against a catchment radius (default 5 miles
     from Langport centre, configurable in `siteSettings`) and flagged if outside.
   - Recurring events: the friendly "repeats weekly/monthly/etc." picker is
     translated into an RFC 5545 RRULE string.
3. Two emails are sent (best-effort — failures are logged, never block the form):
   - **Moderator** notification → `MODERATION_RECIPIENT` (default `office@langport.life`)
     with a deep link to the document in Studio.
   - **Submitter** confirmation → the email they entered, containing their
     private edit link (`/edit/<token>`).
4. Moderator opens Studio, reviews, sets status to Published/Active/Approved, Publishes.
5. A Sanity webhook hits `POST /api/revalidate` and the relevant pages refresh
   within a minute.

Submitters can revisit `/edit/<token>` any time. Editing a previously-approved
item sends it **back to pending** for re-approval. The edit endpoint only allows
a fixed allow-list of fields per type (it cannot change status, token, owner, etc.).

See `docs/MODERATION.md` for the plain-English moderator guide.

---

## 6. Email notifications (Resend)

All transactional email goes through **Resend**. There are four senders:

| Trigger | Function / route | Recipient | Env var |
|---|---|---|---|
| New submission (event/venue/listing/group) | `notifyModerator` in `/api/submit` | `office@langport.life` | `MODERATION_RECIPIENT` |
| Submission confirmation + edit link | `notifySubmitter` in `/api/submit` | the submitter | — |
| Contact form message | `/api/contact` | `office@langport.life` | `CONTACT_RECIPIENT` |
| Recurring series expiring in 30 days | cron `/api/cron/series-expiry-reminders` | `office@langport.life` | `MODERATION_RECIPIENT` |

- **From address**: `RESEND_FROM_EMAIL` (currently `Langport Life <noreply@langport.life>`).
  For this to deliver, **`langport.life` must be a verified domain in Resend**
  (SPF/DKIM records). If it is not verified, sends fail.
- If `RESEND_API_KEY` is missing, moderator/submitter emails are skipped and
  logged. **The contact form, however, returns "success" to the visitor even
  when no key is configured — so a misconfiguration silently loses messages.**
  See finding S3 below.

---

## 7. Scheduled jobs (Vercel Cron)

Defined in `vercel.json`. Both require `Authorization: Bearer ${CRON_SECRET}`
and fail closed (401) if `CRON_SECRET` is unset.

| Path | Schedule | Job |
|---|---|---|
| `/api/cron/purge-past-events` | `0 3 * * *` (03:00 daily) | Deletes events more than 30 days past their end date; recurring series kept until 30 days past `recurrenceEndDate`. |
| `/api/cron/series-expiry-reminders` | `0 4 * * *` (04:00 daily) | Emails the moderator about recurring series whose end date is ~30 days away; stamps `expiryReminderSentAt` to avoid duplicates. |

`CRON_SECRET` must be set in the Vercel project for these to run.

---

## 8. API routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/submit` | POST | none (public) | Create a pending submission |
| `/api/upload-image` | POST | none (public) | Upload an image to Sanity (≤8 MB, JPEG/PNG/WebP/GIF) |
| `/api/edit/[token]` | GET/PATCH | edit token | Read / update own submission |
| `/api/contact` | POST | none (public) | Send contact-form email |
| `/api/events`, `/api/listings`, `/api/venues` | GET | none | Published data as JSON (used by client filters) |
| `/api/search` | GET | none | Search (min 2 chars) |
| `/api/revalidate` | POST | `SANITY_REVALIDATE_SECRET` | Sanity webhook → on-demand cache refresh |
| `/api/cron/*` | GET | `CRON_SECRET` | Scheduled jobs (see above) |

---

## 9. Environment variables

Set in `.env.local` (local) and in the **Vercel project settings** (production).

| Variable | Purpose | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project | Public (safe) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset | Public (safe) |
| `SANITY_API_TOKEN` | Server-side write token | **Secret.** Used by API routes and scripts |
| `SANITY_REVALIDATE_SECRET` | Verify Sanity revalidation webhook | Secret |
| `CRON_SECRET` | Authorise Vercel cron calls | Secret. Must be set in Vercel |
| `RESEND_API_KEY` | Resend email | Secret |
| `RESEND_FROM_EMAIL` | From address | Domain must be verified in Resend |
| `MODERATION_RECIPIENT` | Moderator inbox | Defaults to `office@langport.life` |
| `CONTACT_RECIPIENT` | Contact-form inbox | Defaults to `office@langport.life` |
| `NEXT_PUBLIC_SITE_URL` | Base URL for edit links | Defaults to `https://langport.life` |
| `NEXT_PUBLIC_STUDIO_URL` | Studio base for deep links | Defaults to `https://langport.life/studio` |

> Note: a stray `NEXT_PUBLIC_SANITY_API_TOKEN` (a secret write token under a
> public name) was removed from `.env.local` during this review. The token value
> itself should still be **revoked/rotated in Sanity** since it existed in
> plaintext. See finding S1 below.

---

## 10. Security posture (as of this review)

Overall the design is sound: public read queries filter by status, the edit
endpoint uses unguessable tokens with a strict field allow-list, cron and
revalidate routes are authenticated, and image uploads are type/size limited.
The findings below are the gaps worth addressing, in priority order.

| # | Severity | Status | Finding |
|---|---|---|---|
| **S1** | High (footgun) | ✅ Fixed in code · ⚠️ rotate token | `NEXT_PUBLIC_SANITY_API_TOKEN` (a secret write token under a public name) removed from `.env.local`. **Still revoke/rotate the token in Sanity** — it existed in plaintext. |
| **S2** | Medium | ✅ Fixed | Detail pages rendered **unapproved** submissions: `eventBySlugQuery` / `venueBySlugQuery` / `listingBySlugQuery` had no status filter, so a pending/rejected item was viewable by URL (slugs are guessable), exposing submitter email & phone. Status filters now added (events: published/cancelled; venues: active; listings: published). |
| **S3** | Medium | ✅ Fixed | Contact form silently returned success when `RESEND_API_KEY` was missing. Now returns a 500 error instead of dropping the message silently. |
| **S4** | Medium | ⬜ Outstanding | No spam protection on public POST endpoints (`/api/submit`, `/api/upload-image`, `/api/contact`). No rate limit, CAPTCHA or honeypot — open to bot floods (junk pending docs, image-store abuse, inbox spam). Suggested fix: honeypot field + simple rate limit, or Cloudflare Turnstile. |
| **S5** | Low | ✅ Fixed in code · ⚠️ update Vercel + Sanity | `SANITY_REVALIDATE_SECRET` was guessable. A strong random value is now in `.env.local`. **Update the same value in Vercel env and the Sanity webhook config** or production revalidation breaks. |
| **S6** | Low | ⬜ Verify | Confirm `CRON_SECRET` is set in Vercel. If unset, both cron jobs return 401 and silently never run. |
| **S7** | Info | — | Edit tokens never expire and travel in plaintext email. UUIDs are unguessable, but a forwarded email grants permanent edit access to that one submission. Acceptable; add expiry only if desired. |
| **S8** | Info | — | `/studio` is publicly reachable but gated by Sanity login. Keep project membership limited and enable 2FA on Sanity accounts. |

---

## 11. Key files

| Area | File |
|---|---|
| Sanity clients (read + write) | `lib/sanity.ts` |
| All GROQ queries | `lib/queries.ts` |
| Submission handling + email | `app/api/submit/route.ts` |
| Self-edit endpoint | `app/api/edit/[token]/route.ts` |
| Contact form handler | `app/api/contact/route.ts` |
| Image upload | `app/api/upload-image/route.ts` |
| Cron jobs | `app/api/cron/*/route.ts` |
| Cache revalidation webhook | `app/api/revalidate/route.ts` |
| Schemas | `sanity/schemaTypes/*` |
| Studio config | `sanity.config.ts` |
| Recurrence expansion | `lib/recurrence.ts` |
| Moderator guide | `docs/MODERATION.md` |

---

## 12. Local development

```bash
# TLS on this machine requires the system CA store
NODE_OPTIONS=--use-system-ca npm run dev
```

The dev server runs at `http://localhost:3000`, Studio at `/studio`. Production
deploys automatically from `main` via Vercel.
</content>
</invoke>
