// One-off: delete the older "Eli's" venue duplicate (the one with no
// structured fields). Keeps the newer doc with full address/email/phone.
//
// SAFETY: refuses to delete if any document references it.
//
// Run: node --use-system-ca scripts/delete-elis-old-duplicate.mjs
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const TARGET_ID = "C7PrLWXsqvO6uFqMjJAC6R"; // older Eli's duplicate, town=Langport, no structured fields
const KEEP_ID = "XM6dzjX4C4HUlEZz4a9LTn";   // newer Eli's, town=Huish Episcopi, full data — for reference only

const target = await client.fetch(`*[_id == $id][0]{ _id, title, town, status }`, { id: TARGET_ID });
if (!target) {
  console.log(`Target ${TARGET_ID} not found — already deleted?`);
  process.exit(0);
}

const refCount = await client.fetch(`count(*[references($id)])`, { id: TARGET_ID });
if (refCount > 0) {
  console.error(`✗ Refusing to delete: ${refCount} document(s) reference ${TARGET_ID}`);
  process.exit(1);
}

console.log(`About to delete:`);
console.log(`  ${target._id}  "${target.title}"  town=${target.town}  status=${target.status}`);
console.log(`Keeping:`);
console.log(`  ${KEEP_ID}  (newer entry with full address/email/phone)`);
console.log();

await client.delete(TARGET_ID);
console.log(`✓ Deleted ${TARGET_ID}.`);
