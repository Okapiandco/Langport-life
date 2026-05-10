/**
 * Audit business-listing map pins.
 *
 * Coordinates on `businessListing` are MANUALLY set in Sanity (geopoint field).
 * There is no auto-geocoder. This script fetches every listing and writes a CSV
 * so you can visually verify each pin against the address it claims to be at.
 *
 * Run: npx tsx scripts/audit-listings.ts
 *      (add NODE_OPTIONS=--use-system-ca if you hit TLS errors)
 *
 * Output: scripts/listings-audit.csv (overwritten on each run).
 */
import { createClient } from "next-sanity";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

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
  status?: string;
  street?: string;
  town?: string;
  postcode?: string;
  coordinates?: { lat: number; lng: number };
  slug?: { current: string };
}

function csvEscape(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fullAddress(l: Listing): string {
  return [l.street, l.town, l.postcode].filter(Boolean).join(", ");
}

async function main() {
const listings: Listing[] = await client.fetch(`
  *[_type == "businessListing"] | order(title asc) {
    _id, title, status, street, town, postcode, slug, coordinates
  }
`);

const rows: string[] = [];
rows.push(
  [
    "name",
    "status",
    "address",
    "lat",
    "lng",
    "has_coords",
    "maps_pin_link",
    "maps_address_link",
    "studio_link",
  ].join(",")
);

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const studioBase = `http://localhost:3000/studio/structure/businessListing;`;

let missing = 0;
for (const l of listings) {
  const addr = fullAddress(l);
  const lat = l.coordinates?.lat;
  const lng = l.coordinates?.lng;
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  if (!hasCoords) missing += 1;

  const pinLink = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : "";
  const addressLink = addr
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
    : "";
  const studioLink = `${studioBase}${l._id}`;

  rows.push(
    [
      csvEscape(l.title),
      csvEscape(l.status ?? ""),
      csvEscape(addr),
      csvEscape(lat),
      csvEscape(lng),
      hasCoords ? "Y" : "N",
      csvEscape(pinLink),
      csvEscape(addressLink),
      csvEscape(studioLink),
    ].join(",")
  );
}

const outPath = resolve("scripts/listings-audit.csv");
writeFileSync(outPath, rows.join("\n") + "\n", "utf8");

console.log(`Audited ${listings.length} listings.`);
console.log(`  ${listings.length - missing} have coordinates`);
console.log(`  ${missing} are MISSING coordinates (will not appear on the map)`);
console.log(`\nCSV written to: ${outPath}`);
console.log(
  "\nOpen each row's pin link and address link in tabs — if they don't land in the same place, the listing's saved coordinates are wrong. Fix in /studio."
);

// Project/dataset info is unused for now but kept for future Studio deep-link improvements.
void projectId;
void dataset;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
