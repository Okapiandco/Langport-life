# Langport Life — security review

**Date:** 13 October 2026
**Scope:** `C:\Users\jim\Langport-life` @ `9be75ff` — all API routes, data access, headers, secrets handling, dependency tree
**Verified against live:** yes (unauthenticated requests to the Sanity API only)

---

## TL;DR

The application code is in good shape. Input caps, honeypots, URL sanitising, status gating on every public query, hashed edit tokens with PII held in Neon, correctly escaped JSON-LD, no hardcoded secrets, GA behind Consent Mode v2. Nothing here is an open door into the site.

The one real problem is underneath the app: **the Sanity dataset is publicly readable**, so every status filter in `lib/queries.ts` is a presentation choice, not a security control. 11 unapproved submissions' contact details are readable by anyone right now.

Dependencies are noisier than they are dangerous: 19 advisories, but the high-severity ones that reach production are all `undici` pulled in by the Sanity client, and `npm audit fix` clears them with patch and minor bumps only — no majors, no `--force`.

| Priority | Finding |
| --- | --- |
| High | Sanity `production` dataset is world-readable |
| Medium | No Content-Security-Policy beyond `frame-ancestors` |
| Medium | Unauthenticated image upload trusts client-declared content type |
| Medium | Rate limiting is in-memory, so near-ineffective on Vercel |
| Low | `GET /api/edit/[token]` is unthrottled while `PATCH` is not |
| Low | Edit tokens never expire |
| Low | Revalidate secret travels in the query string, and errors echo back |
| Housekeeping | `npm audit fix` + `npm install` (installed tree is behind the lockfile) |

---

## High — the Sanity dataset is publicly readable

**Confirmed live.** An unauthenticated GROQ query against the production dataset returns data:

```
curl "https://8ecf405k.api.sanity.io/v2024-01-01/data/query/production?query=count(*[_type==%22event%22])"
→ 200 {"result":28}
```

Every `status == "published"` filter in `lib/queries.ts` is therefore a convention the site follows, not a boundary anyone is held to. Anyone who knows the project ID (it is in the client bundle, by necessity) can read every field of every document.

What is actually sitting there today. I first counted these as "11 unapproved submissions", then looked at them individually, and they are three different things that need three different answers:

| Count | What | Status | Neon has a copy? | Public on the site? |
| --- | --- | --- | --- | --- |
| 1 | business listing | `pendingApproval` | yes | no |
| 2 | business listings | `draft` | 1 of 2 | no |
| 2 | events | `cancelled` | yes | **yes** — `eventBySlugQuery` allows `cancelled` |
| 5 | business listings | `closed` | no | no |
| 1 | venue | `inactive` | no | no |

Plus 26 published events carrying contact details, which are public by intent (the "who to ask about this event" line), 55 documents carrying `editTokenHash` (harmless — SHA-256, useless without the original), and 0 drafts, 0 non-public council documents and 0 `editLinkRequest` documents.

**Only 4 of the 11 have a Neon row**, checked against `edit_tokens` by document id. The other 7 are the migrated WordPress business directory — trade phone numbers that were public on the old site, where **Sanity now holds the only copy**. Deleting those fields would be irreversible data loss, not a fix, so I have left all 11 in place.

The genuine exposure is therefore narrower than the raw count suggests, and sharpest for **the 3 listings that were submitted and never approved** — someone typed their email and phone into a town council form and it became world-readable before any editor looked at it. The 2 `cancelled` events are the same data the site publishes anyway. The 7 legacy directory records are business landlines that were already public for years on the old WordPress site; worth tidying, but not a disclosure.

Credit where it is due: the build already knows about this. `lib/editTokens.server.ts` and the comments in `app/api/submit/route.ts` explain that tokens are hashed and submitter contact details live in Neon *precisely because the dataset is public*. That half of the job was done properly. What was missed is that `writeClient.create` still writes `contactName` / `contactEmail` / `contactPhone` onto the event document, and `email` / `phone` onto listings and venues.

### There is no setting to flip

The obvious fix — make the dataset private — is not available on this project. Checked against the management API:

```
GET /v2021-06-07/projects/8ecf405k/datasets
→ [{"name":"production","aclMode":"public",...}]

GET /v2021-06-07/projects/8ecf405k/features
→ ["automaticDatasetFreezing","contentSourceMapping","noVersionRevival",
   "roleEditorRobots","roleViewer","supportCommunity", ...]
```

`privateDataset` is absent from the feature list, and `supportCommunity` plus `automaticDatasetFreezing` are free-plan markers. Private datasets are a paid-plan feature, which matches the conclusion of the September audit across the other Okapi Sanity projects. So this is a build-level fix, not a dashboard toggle — unless you want to upgrade the plan, which is a real option worth pricing given this is a council site holding residents' data.

### The fix: finish the migration that is already half done

The pattern is established in this very repo. `lib/editTokens.server.ts` already holds `submitter_name`, `submitter_email` and `submitter_phone` in the Neon `edit_tokens` table against the token hash. The contact fields on the Sanity documents are **duplication of data Neon already has** — so for submitted events, listings and venues, the Sanity copy can go without losing anything.

1. In `app/api/submit/route.ts`, drop `contactName` / `contactEmail` / `contactPhone` from the `event` create, and `email` / `phone` from the `venue` and `listing` creates. Neon already receives all of it via `createEditToken`.
2. Same in `PATCH /api/edit/[token]` — remove those keys from `EDITABLE_FIELDS` and write them to Neon instead, or the next edit puts them straight back.
3. Point the Studio approval view at Neon for contact details. `sanity/tools/ApprovalsTool` is where an editor reads them, so it needs a small server route that takes a document id and returns the submitter row.
4. Deal with the existing documents, which is **not** a blanket purge — see the table above. The 3 unapproved listings can have their contact fields cleared once the approvals view reads from Neon (backfill the one that has no Neon row first). The 7 legacy directory records need a decision, not a delete, because Sanity holds the only copy: either backfill them into Neon and clear Sanity, or accept them as already-public trade numbers and leave them.

Step 4 also needs a judgement call on the published events. The 26 published and 2 cancelled events' contact details are public *by intent* — the "who to ask about this event" line on the event page. That is a different thing from a pending submission's details being readable before anyone approved them. Worth asking the council whether organiser contact details should appear on published event pages at all, and if yes, whether that should be a separate "public contact" field the submitter opts into rather than a silent reuse of the address they submitted with.

Interim mitigation, available today: have the moderation step clear `contactEmail` / `contactPhone` when a submission is rejected rather than leaving the document in place. That stops the set growing while the migration waits on the decisions above.

One piece of good news about the eventual shape of this: no browser-side code queries Sanity. The three client components that import from `@/lib/sanity` (`EventCard`, `Gallery`, `NewsSearch`) use only `urlFor`, which is pure string building — no network call, no token. Every GROQ query in this repo already runs server-side, and the browser goes through `/api/events`, `/api/listings`, `/api/venues` and `/api/search`. So if you do upgrade the plan later, flipping the dataset to private is a two-line change (`SANITY_API_READ_TOKEN` passed to `client` in `lib/sanity.ts`, shipped in the same deploy as the toggle) rather than a refactor.

---

## Medium — no Content-Security-Policy beyond `frame-ancestors`

`next.config.ts` sets `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` and `Permissions-Policy`, all correct, plus `frame-ancestors 'none'` everywhere except `/studio`. Good as far as it goes.

What is missing is `script-src`, `style-src`, `img-src`, `connect-src` and `form-action`. I found no XSS to exploit — all five JSON-LD blocks escape `<` properly, PortableText renders safely, there is no `eval` or `new Function`, and submitter URLs go through `sanitizeHttpUrl` on both `POST /api/submit` and `PATCH /api/edit/[token]`. But the site renders content typed in by members of the public, and a CSP is the layer that holds when one of those paths is later changed by someone who does not know why the sanitiser is there.

A starting policy for this build (GA, Google Fonts if used, Sanity CDN, Leaflet/OSM tiles, Nominatim and postcodes.io are the external origins in play):

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://cdn.sanity.io https://*.tile.openstreetmap.org https://www.googletagmanager.com;
font-src 'self' data:;
connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io https://www.google-analytics.com https://api.postcodes.io https://nominatim.openstreetmap.org;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
object-src 'none'
```

`'unsafe-inline'` on `script-src` is needed for the inline GA bootstrap and the JSON-LD blocks; removing it means nonces, which is a bigger change than this review is recommending. Apply the policy in `Report-Only` mode for a few days first, watch the console on `/studio`, `/events`, `/listings` and the map pages, then enforce.

---

## Medium — unauthenticated upload trusts the client's content type

`app/api/upload-image/route.ts` is open to the internet by design (submitters attach a photo before they have any credential) and writes straight into the Sanity media library. It checks `file.type` against a four-entry allowlist and caps size at 8 MB.

`file.type` is whatever the browser was told to send. A script can declare `image/png` and post an arbitrary payload, which then sits on `cdn.sanity.io` under the council's project. Two consequences: the project's asset quota can be filled by anyone, and the council's CDN can be used to host someone else's file.

Sanity does process uploads as images and will reject some malformed input, so this is not a free file host — but do not rely on an upstream side effect as the control.

Fix: read the first few bytes and check the magic number matches the declared type before calling `writeClient.assets.upload`.

```ts
const buffer = Buffer.from(await file.arrayBuffer());

// Declared content types come from the browser, so verify the bytes.
const SIGNATURES: Array<[string, (b: Buffer) => boolean]> = [
  ["image/jpeg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["image/png",  (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ["image/gif",  (b) => b.subarray(0, 3).toString("ascii") === "GIF"],
  ["image/webp", (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP"],
];

const match = SIGNATURES.find(([type]) => type === file.type);
if (!match || !match[1](buffer)) {
  return NextResponse.json({ error: "That file is not a valid image." }, { status: 400 });
}
```

---

## Medium — rate limiting is in-memory

`lib/rateLimit.server.ts` is a fixed-window counter in a module-level `Map`. The file's own comment is honest about the limitation: on Vercel it only counts requests that land on the same warm instance.

In practice a concurrent attacker gets spread across instances and the limit barely applies. That matters most on the endpoints where each request costs real money or real noise:

- `POST /api/contact` — every call is a Resend send
- `POST /api/submit` — creates a Sanity document and sends two emails, one of them to an address the caller supplies, which makes it a usable email-bombing relay
- `POST /api/upload-image` — writes to the media library
- `POST /api/admin/send-edit-link` — sends email

The honeypot fields on contact and submit catch naive bots, and the 5-per-10-minutes intent is right. It is the storage that does not hold.

Fix: move the counter to a shared store. Vercel KV or Upstash Redis, same function signature, roughly a 20-line change to `rateLimit.server.ts` with no call-site changes. If you would rather not add a dependency, Vercel's own WAF rate limiting on these four paths would do the job from the edge and needs no code at all — given this is a low-traffic town site, that is probably the better value.

---

## Low — `GET /api/edit/[token]` is unthrottled

`PATCH` on that route calls `checkRateLimit`, with a comment noting it "also slows brute-force token guessing". `GET` on the same route has no limit, and `GET` is the one that returns the document including `contactEmail` and `contactPhone`.

Tokens are `randomUUID()`, so 122 bits of entropy — brute force is not realistically on. But the asymmetry is unintentional and the fix is three lines, so close it while you are in the file.

## Low — edit tokens never expire

A token issued at submission works forever, is a bearer credential with no second factor, and travels in the URL path. The mitigations in place are good: `Referrer-Policy: strict-origin-when-cross-origin` means cross-origin requests leak only the origin, `/edit/` is `robots`-disallowed, and `app/(site)/(public)/edit/[token]/layout.tsx` sets `robots: { index: false, follow: false }`. `POST /api/admin/send-edit-link` also revokes the previous token when a replacement is sent, which is the right behaviour.

What remains is longevity. A link in a business owner's inbox in 2026 still edits their listing in 2030, after the business has changed hands. Add an `expires_at` column to `edit_tokens`, default 12 months, and check it in `lookupEditToken`. The "request a new link" path already exists, so an expired link is a dead end for the user, not a support ticket.

## Low — revalidate secret in the query string, and error text echoed back

`app/api/revalidate/route.ts` reads its secret from `req.nextUrl.searchParams`. Query strings get written to Vercel's request logs and to any proxy in between, so the shared secret ends up in logs that have a wider audience than the secret does. Sanity webhooks can send a custom header — move it to one and compare that instead.

The same route's catch block returns `error: String(err)` in the 500 body. Every other route in the codebase returns a generic message and logs the detail server-side (the comment in `app/api/submit/route.ts` says exactly why). Make this one match.

## Note — `target="_blank"` without `rel="noopener"`

18 links across the public pages. Every current browser implies `noopener` for `target="_blank"`, so there is no live exposure. Mentioned only so it is not reported as a finding by the next scanner that looks.

---

## Dependencies

`npm audit`: **19 advisories — 14 high, 5 moderate.** 17 of them are in the production tree.

### What actually reaches production

Every high-severity advisory in the production tree is **`undici`**, reached through `@sanity/client` → `get-it`, at 7.29.0 (vulnerable range `7.0.0–7.29.0`) and 6.28.0 (`<= 6.28.0`):

- DoS via WebSocket `permessage-deflate`, unrequested subprotocols, `WebSocketStream` unclean close
- Response splitting via the retry interceptor
- TLS certificate validation bypass in `BalancedPool`
- `Set-Cookie` caching in shared caches, unbounded decompression, response truncation

Read the preconditions before worrying: all of these need a hostile or compromised upstream HTTP server. The only upstream `@sanity/client` talks to is Sanity's own API. Practical risk here is low. Patch it because the fix is free, not because the site is in danger.

### The fix is clean

`npm audit fix --dry-run` produces **patch and minor bumps only** — no majors, no `--force`, nothing that needs a code change:

```
undici 7.29.0 → 7.30.0, 6.28.0 → 6.29.0
next 16.3.4 → 16.3.8
react / react-dom 19.2.8 → 19.3.0
resend 6.26.0 → 6.32.0
@sanity/client 8.4.0 → 8.6.2
dompurify 3.4.14 → 3.4.16
brace-expansion, autoprefixer, tsx, sharp, @sanity/ui, @sanity/vision, …
```

Note that **the installed `node_modules` is behind the lockfile**. The last four commits are merged Dependabot PRs (`moment`, `dompurify`, `brace-expansion`, and a 6-package minor group) that were never installed locally, so part of what looks like a fix is just the tree catching up. Run `npm install` first, then `npm audit` again, and the real remainder will be smaller than 19.

```bash
npm install && npm audit fix && npm run build
```

### What will still be flagged afterwards, and why to leave it

The `braces` → `micromatch` → `fast-glob` chain (high, stack-exhaustion DoS on deeply nested glob patterns) arrives twice:

- via `eslint-config-next` → `@next/eslint-plugin-next`
- via `sanity` → `@sanity/cli` → `@sanity/codegen` → `globby` / `chokidar`

Both are **dev and build tooling — none of it is in the deployed bundle**, and the attack needs someone to feed a malicious glob pattern to your local linter. npm's suggested remediations are worse than the problem: it offers `eslint-config-next@14.2.35`, a two-major downgrade from the Next 16 this project runs, and `sanity@5.7.0`, a downgrade from 5.31.2. Both would break the build to silence a dev-only advisory. Leave them, and let Dependabot pick up the real fixes when Sanity and Next ship them.

Same for `js-yaml` / `argparse` / `sprintf-js` (moderate) under `@vercel/frameworks` — there is already an `override` pinning `js-yaml` in `package.json`, and what remains is inside the Sanity CLI's own tree.

### Majors to defer, deliberately

| Package | Current | Latest | Call |
| --- | --- | --- | --- |
| `sanity` + `@sanity/vision` | 5.31.2 | 6.18.0 | Defer. Studio major, needs a schema and plugin check, and `@sanity/orderable-document-list` must support v6 first. |
| `next-sanity` | 12.4.5 | 13.3.4 | Defer, and move together with `sanity` 6. |
| `@portabletext/react` | 6.2.0 | 8.0.1 | Defer. Two majors; every custom component in the PortableText renderer needs retesting. |
| `typescript` | 5.9.3 | 7.0.2 | Defer. |
| `eslint` | 9.39.4 | 10.12.0 | Defer — `eslint-config-next` 16.4.0 still expects 9.x. |
| `next` | 16.3.4 | 16.4.0 | Take it, it is a minor and `audit fix` includes it. |

Worth noting: `@sanity/orderable-document-list` is currently installed at 2.0.23 while `package.json` asks for `^2.0.25`, so `npm ls` reports it `invalid`. `npm install` resolves that too.

---

## What the review found to be sound

Recording this so the next review does not re-litigate it:

- **No secrets in the repository.** A pattern scan across all tracked files for API keys, Postgres URLs, AWS keys and JWTs came back empty. `.env.example` holds names and blank values with an explicit "real values live in Vercel env vars" note. `.gitignore` covers `.env*`, `*.pem`, `.vercel` and the council document staging folder.
- **Write token isolation.** `lib/sanity.server.ts` carries `import "server-only"`, so pulling `writeClient` into a client component is a build error rather than a silent token leak. Same guard on `editTokens.server.ts`, `rateLimit.server.ts` and `validateUrl.server.ts`.
- **Every public query is status-gated.** Events on `status == "published"`, venues on `"active"`, listings on `"published"`, council documents on `visibility == "public"`, and the detail-page queries match their list queries, so a guessable slug does not reach a pending submission *through the app*. (The dataset finding above is what undermines this, not the queries.)
- **No SQL or GROQ injection.** Every Neon call uses the tagged-template parameter binding in `@neondatabase/serverless`; every GROQ call passes `$`-parameters, including the search route's user-supplied `q`.
- **Correct JSON-LD escaping.** All five `dangerouslySetInnerHTML` sites are JSON-LD and all five apply `.replace(/</g, "\\u003c")`. No other raw-HTML injection anywhere, no `eval`, no `new Function`.
- **Stored-XSS vector closed at both ends.** `sanitizeHttpUrl` rejects `javascript:`, `data:` and every other non-http(s) scheme, and it is applied on submission *and* on edit — the usual mistake is to guard one and forget the other.
- **Cron routes are authenticated.** Both compare a bearer token against `CRON_SECRET` and refuse outright when the variable is unset, so a missing env var fails closed rather than leaving a public delete endpoint.
- **`send-edit-link` derives authority correctly.** It takes no credential from the caller; it reads a Studio-written `editLinkRequest`, which requires a write token to create. Single use, deleted on every path including failure, 5-minute expiry, negative-clock-skew guard, and it revokes the previous token before issuing a new one.
- **Submission rollback.** If the Neon token write fails, `POST /api/submit` deletes the Sanity document rather than leaving a submission with a dead edit link.
- **No path traversal in the WordPress media route.** `app/wp-content/[...path]/route.ts` takes only the last path segment, matches it against an extension allowlist, and uses it as a GROQ parameter for a filename lookup — it never touches the filesystem, and both outcomes are a redirect.
- **GA matches the Okapi Consent Mode v2 standard.** Denied by default including `ad_storage` and `ad_user_data`, `wait_for_update: 500`, upgraded on accept via a reactive store, `anonymize_ip`, and a returning visitor's stored choice applied as the default on first hit.
- **Edit pages are kept out of search.** `robots.ts` disallows `/edit/`, `/submit/`, `/studio`, `/api/` and `/search`, and the edit layout sets `index: false, follow: false` — so tokens in URLs do not end up in an index.
- **Vision tool is dev-only.** `sanity.config.ts` gates the raw GROQ console behind `NODE_ENV !== "production"`.

---

## Suggested order of work

**Done 13 Oct 2026** (branch `fix/security-review-oct-2026`, not pushed):

- ✅ Dependency update — `npm install && npm audit fix`, lockfile only, 19 advisories → 13, every `undici` advisory cleared
- ✅ Magic-byte verification on `POST /api/upload-image`
- ✅ Rate limit on `GET /api/edit/[token]`
- ✅ Revalidate secret moved to the `x-revalidate-secret` header, error text made generic
- ⛔ Contact-field purge **not done** — 7 of the 11 records have no Neon copy, so it would have been data loss. See the High finding.

Remaining, in order:

1. **Update the Sanity revalidate webhook** to send the secret as a header. Must happen with the deploy of the above, or content edits stop refreshing the site.
2. **Decide the two content questions** in the High finding: should published event pages carry organiser contact details, and what happens to the 7 legacy directory records.
3. **Stop writing submitter contact details to Sanity** — the migration in the High finding. Half a day, mostly the Studio approvals view, and blocked on (2).
4. CSP in `Report-Only`, watch for a few days, then enforce.
5. Shared-store rate limiting, or Vercel WAF rules on the four POST paths.
6. `expires_at` on `edit_tokens`.

Separately, worth pricing a Sanity paid plan for this project. Private datasets would turn the whole class of problem into a two-line change here and on every other Okapi Sanity build, and a council site holding residents' submissions is the strongest case in the portfolio for spending that money.
