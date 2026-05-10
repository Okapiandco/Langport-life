# Recurring Events — Scoping Document

**Status:** Scoping. Decisions ratified by site owner 2026-05-10. No code change yet.
**Audience:** Site owner + future implementer.
**Question:** How should Langport Life support events that repeat (weekly yoga, monthly farmers' market, annual festival)?

---

## TL;DR

Three storage approaches considered. Going with **Approach A (single doc + RRULE)** with the following site-owner-confirmed constraints baked in:

- **Public submitters can set recurrence**, not just admins. v1 must include a guided non-technical recurrence UI (not raw RRULE strings).
- **One approval = approves all occurrences for the next 12 months.** The expansion window is hard-capped at 12 months from `now()`.
- **Homepage shows at most one occurrence per series** (the next upcoming one) — no flooding the "Upcoming events" panel with weekly yoga.
- **Past events auto-delete** after a grace period (default 30 days). The venue-page "past events at this venue" section will no longer have content to show.
- **Email reminder fires 1 month before `recurrenceEndDate`** so Morag can re-approve in time.
- Single-occurrence overrides remain out of scope for v1.

Estimated **~7 dev-days for v1**, up from the original 4 to cover the public submitter UX, expiry-reminder cron, and past-event-purge cron.

---

## 1. Storage approaches

### Approach A — Single document with an RRULE string

The event is one Sanity document. The recurrence is described by a single `recurrenceRule` field holding an RFC 5545 RRULE string (e.g. `FREQ=WEEKLY;BYDAY=TU;UNTIL=20271231T235959Z`). Plus an optional `excludedDates: string[]` array for one-off cancellations.

**Pros**
- One document covers any number of occurrences. 52 weekly occurrences = 1 doc, not 52.
- Series-wide edits are a single edit. Change the venue, change the time — done.
- RFC 5545 is a real standard. Mature library exists ([rrule.js](https://github.com/jkbrzt/rrule), ~30KB) so we're not inventing the parser.
- Approval works once per series, which suits a one-person moderator.

**Cons**
- GROQ cannot expand RRULEs. Expansion has to happen in JS at request time (or during ISR build).
- Per-occurrence overrides (different speaker on one Tuesday) get awkward — you end up with a parallel `overrides[]` array keyed by date, which is fiddly to author in Studio.
- A single occurrence has no native URL — you'd need synthetic slugs like `/events/yoga-class-2026-04-15` if you want them linkable. Or you skip it and link to the series page.

### Approach B — Expanded child documents

The user enters the series once; a generator (cron, on-publish hook, or a Studio action) creates N actual `event` documents — one per occurrence. They optionally point back at a `parentSeries` reference for bulk operations.

**Pros**
- Existing event schema works almost unchanged.
- Each occurrence has its own slug/URL/SEO/social-share metadata for free.
- Editing or cancelling one occurrence = editing that document. No special UX.
- All current GROQ queries stay as they are.

**Cons**
- Storage: weekly yoga for one year = 52 documents in Sanity, sat there mostly identical.
- Series-wide edits touch every child. Needs a "propagate to series" Studio action, which is custom code.
- **Approval becomes painful.** Morag would face 52 pending events for one yoga series unless we build a bulk-approve UI. That's the dealbreaker for this site's moderation model.
- Generation timing is a new design question (when do we generate? what about future-dated extensions?).

### Approach C — Parent + override hybrid

A `eventSeries` parent document holds the RRULE + defaults. The frontend expands occurrences from the parent at request time (like A). For occurrences that need to differ (cancellation, venue change for one date), an `eventOccurrence` child document is created and stitched in at expansion time — keyed by date.

**Pros**
- Cheap by default (just the parent), expensive only when overrides are needed.
- Series-wide edits update the parent. Per-occurrence edits create an override.
- Approval can be per-series for the default, per-occurrence for overrides.
- Each override gets a real Sanity document with its own URL, SEO, etc.

**Cons**
- Most complex of the three: two document types, expansion logic, override stitching, conflict resolution.
- More to test (parent ↔ child consistency edge cases).
- Studio UX needs an "Edit just this occurrence" action that spawns the child doc with sensible defaults — that's not free.
- Easy to ship subtle bugs (an override that references a wrong date shows the original; a deleted parent leaves orphan overrides).

### Side-by-side

| Dimension | A — RRULE | B — Expanded | C — Hybrid |
|---|---|---|---|
| Sanity docs for 52 weekly events | 1 | 52 | 1 + N (only as needed) |
| Series-wide edit | trivial | needs propagate action | trivial (edit parent) |
| Single-occurrence edit | awkward (overrides array) | trivial | clean (spawn override) |
| Single-occurrence cancellation | add to `excludedDates` | set status `cancelled` | spawn override w/ status |
| Approval clicks per series | 1 | N (or build bulk UI) | 1 + per-override |
| Per-occurrence URLs / SEO | needs synthetic slugs | free | free for overrides |
| GROQ change required | major (expand in JS) | none | major (expand + stitch) |
| Frontend complexity | medium | low | high |
| Schema complexity | low (1 type, 2 fields) | low (1 type, 1 ref) | high (2 types) |
| Risk of subtle bugs | low | low | medium-high |

---

## 2. Frontend rendering

### List view (`/events`)

- **A:** Server page fetches all series + standalone events. JS expansion: for each series, generate occurrences inside the visible window (e.g. next 90 days), filter out `excludedDates`, merge with standalone events, sort by date. Cache aggressively (`revalidate: 3600`). ~80 lines including the rrule lib wiring.
- **B:** No change. Existing `allEventsQuery` already returns one row per occurrence.
- **C:** Like A, plus a join: for each occurrence date, look for a matching `eventOccurrence` override and replace the projected occurrence with the override's fields.

### Calendar view (`/events/calendar`)

In all three approaches, the calendar receives `{ start, end, title }` items. The expansion work in A or C happens upstream of the existing `EventsCalendar` component — no calendar code changes. The number of items the calendar receives is the same: one per occurrence in view.

The calendar's `views=["month", "week", "agenda"]` already handles the visualization; we just need the right expanded list.

### Detail page (`/events/[slug]`)

- **A:** The slug routes to the series. The page shows "next occurrences" + the series details. There is no per-date URL by default; if needed, add a `?date=YYYY-MM-DD` parameter that renders the page with that occurrence highlighted.
- **B:** Each occurrence has its own slug — no change.
- **C:** Series slug for default, override slug for any occurrence with an override. Routing logic decides which to render.

---

## 3. Interaction with the moderation queue (item 3.4)

This is where the three diverge most.

### A — single doc

Morag approves the series document once. All future occurrences are visible immediately. If she later wants to reject a specific date (e.g. cancelled due to weather), she edits the series and adds the date to `excludedDates`.

→ **One approval per series.** Best fit for the current moderation model.

### B — expanded child docs

Morag faces N pending events per series. Without intervention, that's 52 clicks per yoga series.

Mitigation: build a "Bulk approve series" Studio action — select a parent, hit a button, all child occurrences flip from `pendingApproval` → `published`. That's ~half a day of Studio plugin work on top.

Even with the bulk button, Morag is reviewing the same content 52 times. Not a great experience.

### C — hybrid

Morag approves the series once (covers the default). For any one-off override (different speaker, different venue), the override doc enters its own pending queue and Morag reviews just that one. Best of both — but requires the most code to support.

---

## 4. Edits / cancellations of a single occurrence

| Scenario | A | B | C |
|---|---|---|---|
| Cancel one date | Add to `excludedDates: string[]` | Set that doc's `status: "cancelled"` | Spawn override with `status: "cancelled"` |
| Different venue for one date | Add object to `overrides[]: { date, venueOverride, ... }` — gets ugly fast | Edit that doc | Spawn override with the changed field |
| Reschedule one date | Override array entry with new datetime | Edit doc's `date` | Override with new datetime |
| Cancel all future dates from now | Set `UNTIL` in the RRULE to today | Manually set status on each remaining doc, OR delete them | Set `UNTIL` on parent |

Approach A is fine for cancellations (one field). It gets unpleasant once overrides get richer than a date-shift, because Sanity's array editing UX for ad-hoc objects isn't great.

---

## 5. Estimated dev time

Rough engineering estimates assuming the existing codebase, single dev, including tests + Studio polish.

Note: v1 estimates revised upward from the original draft because the site owner has confirmed **public submitters set recurrence rules**, which means v1 must include a guided non-technical recurrence form (not just an admin-facing RRULE string field).

| Approach | v1 (admin-only RRULE) | v1 + public submitter UX | v2 (per-occurrence overrides) | Total to "complete" |
|---|---|---|---|---|
| **A** | ~4 days | **~5-6 days** | +2 days | ~7-8 days |
| **B** | ~3 days + bulk-approve UI | n/a — moderation model rejected | +0 | n/a |
| **C** | ~7 days | ~8-9 days | +2 days | ~10-11 days |

What's in v1 for **Approach A** (the chosen path):
- Schema additions: `recurrenceRule: string` + `excludedDates: date[]` + `recurrenceEndDate: date` (auto-defaulted to `start + 1 year` on save).
- `rrule.js` dependency.
- JS expansion helper in `lib/` capped at 12 months from `now()`.
- Wire expansion into all event-list consumers: `/events`, `/events/calendar`, homepage `upcomingEvents`.
- **Homepage dedupe**: in the homepage query consumer, group occurrences by series ID and emit only the earliest upcoming one per series.
- **Public submitter form**: a non-technical recurrence picker on `/submit/event` that emits an RRULE string under the hood. Recommended fields:
  - "Does this event repeat?" — Yes / No radio.
  - If Yes: "How often?" — `Weekly | Every 2 weeks | Monthly | Yearly` dropdown.
  - For weekly/biweekly: a day-of-week multi-select.
  - For monthly: `Day of month (15th)` vs `Pattern (first Tuesday)` toggle.
  - "Until" date picker, default = start date + 1 year.
  - The form serialises this to RRULE on submit; the schema stores the string.
- Studio: read-only display of expanded next-N occurrences as a Sanity preview, with a "Cancel one date" action that adds to `excludedDates`.
- Update `docs/MODERATION.md` with a "Recurring events" section explaining the 12-month approval semantics.
- Unit tests for expansion against ~5 representative RRULE samples (weekly, biweekly, monthly day-of-month, monthly Nth-weekday, yearly).

DST, midnight-crossing, leap-year, all-day events eat real time. Budget already includes +1 day of testing buffer.

---

## 6. Recommendation

**Pick Approach A. Do not implement single-occurrence overrides in v1.**

Reasoning:

1. **Moderation fit.** Morag is one person; a single "approve the series" click is materially better than approving 52 yoga sessions. Approach A and C give her this; B does not without building extra Studio tooling.
2. **Scale match.** This is a community site that probably has fewer than ~30 active series. The complexity of C is hard to justify for that.
3. **Standards leverage.** RFC 5545 + rrule.js is a one-import, well-tested foundation. We're not inventing date math.
4. **Reversible.** If overrides become a real need later, we can layer Approach C's override docs onto an Approach A schema — the parent document survives.
5. **Cost.** ~4 days vs ~7-9 for C, with the 80% feature value.

### Explicit non-goals for v1

To keep scope tight, the following are deferred:
- **Per-occurrence URLs.** Everything links to the series, with optional `?date=YYYY-MM-DD` for deep-linking a specific occurrence.
- **Per-occurrence overrides beyond cancellation.** Cannot say "this Tuesday only, the venue changes." If a session needs different content for one date, model it as a separate one-off event for now.
- **iCal feed export.** Trivial to add later once expansion logic exists.
- **Recurrence past 12 months.** The expansion window is capped at 12 months from `now()`. If a series should run longer, the editor either sets a longer `recurrenceEndDate` and re-approves annually, or accepts that the visible horizon is one year.

### Approval semantics — owner-confirmed

- Approving a series document = the series is publicly visible for **all occurrences in the next 12 months**, less anything in `excludedDates`.
- If a series's `recurrenceEndDate` is more than 12 months out, the public site still only renders the first 12 months. The expansion is bounded at the query layer.
- There is no per-occurrence approval. To "reject" one date, edit the series and add the date to `excludedDates`.

### Phased delivery

1. **Day 1-2** — Schema fields (`recurrenceRule`, `excludedDates`, `recurrenceEndDate`). Add rrule.js dep. Write expansion helper in `lib/`. Unit tests against ~5 representative RRULE samples.
2. **Day 3** — Wire expansion into `allEventsQuery` consumers. Implement homepage dedupe (one occurrence per series). Verify list + calendar + homepage all show the right occurrences.
3. **Day 4** — Studio polish (help text on the recurrence field, `excludedDates` as a date-array field, "next 5 occurrences" preview). Update `docs/MODERATION.md`.
4. **Day 5-6** — Public submitter form: guided recurrence picker on `/submit/event`. Form serialises to RRULE on submit. Test all five common patterns (weekly, biweekly, monthly day-of-month, monthly Nth-weekday, yearly).

### Resolved questions (from site owner, 2026-05-10)

- ~~Are there current events that should be recurring?~~ → No existing events. Implementation will seed 2-3 fixtures for testing.
- ~~Cap homepage to one occurrence per series?~~ → **Yes.** Dedupe by series ID, take the earliest upcoming.
- ~~Public submitters allowed to set recurrence, or admin-only for v1?~~ → **Both.** v1 includes a guided non-technical recurrence picker on the public form; raw RRULE editing remains available in Studio for admins.

### Resolved questions (continued, 2026-05-10)

- ~~12-month boundary — how is Morag prompted to re-approve?~~ → **Email reminder 1 month before `recurrenceEndDate`.** Sent to `office@langport.life` via the existing Resend setup. Subject: "[Langport Life] Recurring event '<name>' expires in 30 days — renew?" with a one-click link to the series in Studio. Implemented as a daily scheduled job (Vercel Cron) that scans for series whose `recurrenceEndDate` is within `[now+29d, now+31d]` and sends one email per series found. Stamp `expiryReminderSentAt` on the doc to avoid duplicate sends.
- ~~Past events / past occurrences — keep historically or delete?~~ → **Past events auto-delete.** Two follow-on decisions for the implementer to confirm before coding (default proposed in brackets):
  1. **Grace period [30 days]** — events deleted N days after their effective end date, not at the stroke of midnight on the date itself. Avoids "what happened last Saturday" links breaking the same morning.
  2. **What "past" means for recurring series** — a series is considered past when `recurrenceEndDate + grace < now()`. Until then the series document survives even though all its occurrences are in the past, because Morag may extend it.
  3. **What "past" means for one-off events** — `date + grace < now()` (or `endDate + grace < now()` if `endDate` is set).

### Implications worth surfacing

- **Venue-page "past events" goes away.** The current `venueBySlugQuery` returns up to 6 `pastEvents` for each venue. Auto-delete makes this section render empty. Decision needed: (a) remove the section, (b) cache the past-events block elsewhere before deletion, (c) extend the grace period for venue display only. Recommend (a) — least code, matches the "past events delete themselves" stance.
- **Search index loses past events.** `searchQuery` covers past events today; after auto-delete, only future ones are searchable. That's consistent with the stance, but worth knowing.
- **Two new scheduled jobs** become part of the operational surface: an expiry-reminder cron and a past-event-purge cron. Both are small (~30 lines each) but they need monitoring — if they silently stop, Morag won't get reminders and stale events will linger. Vercel Cron's failure-notification setting should be enabled for both.

### Implementation additions to the phased plan

These extend the original phased delivery with the two scheduled jobs.

| Day | Work |
|---|---|
| Day 1-2 | Schema + rrule.js + expansion helper + unit tests *(unchanged)* |
| Day 3 | Wire expansion into queries + homepage dedupe *(unchanged)* |
| Day 4 | Studio polish + `MODERATION.md` updates *(unchanged)* |
| Day 5-6 | Public submitter form *(unchanged)* |
| **Day 6.5** | **Past-event purge cron** — Vercel Cron daily, calls `/api/cron/purge-past-events`. Deletes any `event` doc where the effective end is more than `GRACE_DAYS` ago. Skips series whose `recurrenceEndDate` is still in the future. |
| **Day 7** | **Expiry-reminder cron** — Vercel Cron daily, calls `/api/cron/series-expiry-reminders`. Finds series with `recurrenceEndDate` in the [29-31] day window, sends one email per series via Resend, stamps `expiryReminderSentAt` to prevent duplicates. |

Revised total: **~7 dev-days for v1** (up from 5-6). The two crons are small but do require Vercel project config + a `CRON_SECRET` env var to authenticate the inbound requests, and a brief test against a clock-shifted dataset.
