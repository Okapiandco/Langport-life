// One-off: delete the 13 scraped listings (no image + contains "&#" in title)
// plus the Koleman Creative Picture Framing duplicate that has no image.
//
// SAFETY: refuses to delete any document with inbound references (so this
// can't break event references etc.). Dry-run by default — pass --apply to commit.
//
// Run:
//   node --use-system-ca scripts/delete-bad-listings.mjs           (dry run)
//   node --use-system-ca scripts/delete-bad-listings.mjs --apply   (commit)

import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const APPLY = process.argv.includes("--apply");

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

// Hardcoded IDs — derived from scripts/find-bad-listings.mjs run on 2026-05-10.
// 13 scraped (entity in title + no image) + 1 Koleman duplicate (no image).
const TARGETS = [
  // Scraped: " - Langport Life" suffix, &#xxx; entities, no image, all created within
  // a 90-second window on 2026-03-27.
  ["UpXiOGaDjn3bUcqqGU2J6B", "Chalmers &#038; Co Chartered Accountants - Langport Life"],
  ["e6kXL4KFxzhvSqwli2xoA8", "Cracknell&#8217;s Farm - Langport Life"],
  ["e6kXL4KFxzhvSqwli2xS8S", "Granary Barn Bed &#038; Breakfast - Langport Life"],
  ["UpXiOGaDjn3bUcqqGU2NWg", "Huish Episcopi &#038; Langport Cricket Club - Langport Life"],
  ["gHOdciabZkjNb7UPNOfllB", "NV Health &#038; Fitness - Langport Life"],
  ["XM6dzjX4C4HUlEZz4ag0Xp", "Parrett Deli &#038; Dine - Langport Life"],
  ["gHOdciabZkjNb7UPNOfn65", "Pendra&#8217;s Fish &#038; Chip Shop - Langport Life"],
  ["UpXiOGaDjn3bUcqqGU1mxq", "R &#038; J Business Solutions - Langport Life"],
  ["gHOdciabZkjNb7UPNOfYSI", "St Margaret&#8217;s Hospice Shop - Langport Life"],
  ["gnDMFkwOP2ZAXmZ8kDWt6F", "Sticks &#038; Stones - Langport Life"],
  ["XM6dzjX4C4HUlEZz4afqFl", "The Rose &#038; Crown Inn (Eli's) - Langport Life"],
  ["e6kXL4KFxzhvSqwli2wtum", "Thorney Lakes Caravan &#038; Camping Park - Langport Life"],
  ["e6kXL4KFxzhvSqwli2xJkC", "Welcome to Milo &#038; Jones - Langport Life"],
  // Koleman Creative Picture Framing — duplicate without image
  ["l88nfuAJ60OpvBtzaUSbcH", "Koleman Creative Picture Framing (no-image dup)"],
];

console.log(APPLY ? "🟢 APPLY MODE — will delete from Sanity" : "🟡 DRY RUN — no writes (pass --apply to commit)");
console.log(`Targets: ${TARGETS.length}\n`);

let deleted = 0;
let blocked = 0;
let missing = 0;

for (const [id, label] of TARGETS) {
  const doc = await client.fetch(`*[_id == $id][0]{ _id, title }`, { id });
  if (!doc) {
    console.log(`  - ${id}  ${label}  ↳ not found (already deleted?)`);
    missing += 1;
    continue;
  }

  const refCount = await client.fetch(`count(*[references($id)])`, { id });
  if (refCount > 0) {
    console.log(`  ⚠ ${id}  ${doc.title}  ↳ BLOCKED: ${refCount} inbound reference(s)`);
    blocked += 1;
    continue;
  }

  if (APPLY) {
    await client.delete(id);
    console.log(`  ✓ ${id}  ${doc.title}  ↳ deleted`);
    deleted += 1;
  } else {
    console.log(`  · ${id}  ${doc.title}  ↳ would delete`);
  }
}

console.log("\n────────────────────────────────────────");
console.log(`Targets:        ${TARGETS.length}`);
console.log(`Already gone:   ${missing}`);
console.log(`Blocked (refs): ${blocked}`);
if (APPLY) {
  console.log(`Deleted:        ${deleted}`);
} else {
  console.log(`(Dry run — re-run with --apply to commit)`);
}
