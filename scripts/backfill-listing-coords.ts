/**
 * Backfill `coordinates` for any business listing currently missing them.
 *
 * Geocodes street + town + postcode via Nominatim (OpenStreetMap), writes
 * the result to Sanity with `coordinatesVerified: false` so editors are
 * prompted to verify each pin in Studio (the ⚠ flag in the listings list).
 *
 * Defaults to DRY RUN. Use --apply to actually patch Sanity.
 *
 * Run:
 *   NODE_OPTIONS=--use-system-ca npx tsx scripts/backfill-listing-coords.ts
 *   NODE_OPTIONS=--use-system-ca npx tsx scripts/backfill-listing-coords.ts --apply
 *   NODE_OPTIONS=--use-system-ca npx tsx scripts/backfill-listing-coords.ts --apply --limit 5
 *
 * Rate-limited to 1 request/sec to respect Nominatim's usage policy.
 */
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const limitIndex = args.indexOf("--limit");
const LIMIT =
  limitIndex >= 0 ? parseInt(args[limitIndex + 1] ?? "0", 10) || Infinity : Infinity;

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

interface Listing {
  _id: string;
  title: string;
  street?: string;
  town?: string;
  postcode?: string;
}

async function geocode(parts: {
  street?: string;
  town?: string;
  postcode?: string;
}): Promise<{ lat: number; lng: number } | null> {
  const query = [parts.street, parts.town, parts.postcode]
    .filter(Boolean)
    .join(", ");
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "langport.life listing backfill (clerk@langport.life)",
    },
  });
  if (!res.ok) return null;
  const results = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!results.length) return null;
  const lat = parseFloat(results[0].lat);
  const lng = parseFloat(results[0].lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(APPLY ? "🟢 APPLY MODE — will write to Sanity" : "🟡 DRY RUN — no writes (pass --apply to commit)");
  console.log(LIMIT === Infinity ? "" : `Limited to first ${LIMIT} listings`);
  console.log();

  const listings: Listing[] = await client.fetch(`
    *[_type == "businessListing" && !defined(coordinates)] | order(title asc) {
      _id, title, street, town, postcode
    }
  `);

  console.log(`Found ${listings.length} listings missing coordinates.\n`);

  let geocoded = 0;
  let skipped = 0;
  let patched = 0;
  let errored = 0;

  const slice = listings.slice(0, LIMIT);
  for (let i = 0; i < slice.length; i++) {
    const l = slice[i];
    const addr = [l.street, l.town, l.postcode].filter(Boolean).join(", ");
    process.stdout.write(`[${i + 1}/${slice.length}] ${l.title}`);
    if (!addr) {
      console.log("  ↳ SKIP: no address");
      skipped += 1;
      continue;
    }

    try {
      const point = await geocode({ street: l.street, town: l.town, postcode: l.postcode });
      if (!point) {
        console.log(`  ↳ NO RESULT (${addr})`);
        skipped += 1;
      } else {
        geocoded += 1;
        const url = `https://www.google.com/maps?q=${point.lat},${point.lng}`;
        console.log(`  ↳ ${point.lat}, ${point.lng}  ${url}`);

        if (APPLY) {
          await client
            .patch(l._id)
            .set({
              coordinates: { _type: "geopoint", lat: point.lat, lng: point.lng },
              coordinatesVerified: false,
            })
            .commit();
          patched += 1;
        }
      }
    } catch (err) {
      console.log(`  ↳ ERROR: ${(err as Error).message}`);
      errored += 1;
    }

    // Nominatim usage policy: max 1 request per second.
    if (i < slice.length - 1) await sleep(1100);
  }

  console.log("\n────────────────────────────────────────");
  console.log(`Total candidates: ${slice.length}`);
  console.log(`Geocoded:         ${geocoded}`);
  console.log(`Skipped:          ${skipped}`);
  console.log(`Errored:          ${errored}`);
  if (APPLY) {
    console.log(`Patched in Sanity: ${patched}`);
  } else {
    console.log(`(Dry run — re-run with --apply to commit ${geocoded} patch${geocoded === 1 ? "" : "es"})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
