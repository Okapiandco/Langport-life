// Read-only diagnostic: find business listings that contain HTML entities (&#)
// in any text field, have no image, or are duplicates of another listing.
// Run: node --use-system-ca scripts/find-bad-listings.mjs
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

const listings = await client.fetch(`
  *[_type == "businessListing"] | order(title asc) {
    _id, _createdAt, title, status,
    "slug": slug.current,
    street, town, postcode, phone, email, website,
    "hasImage": defined(image.asset),
    "hasGallery": count(images) > 0,
    "descriptionText": pt::text(description)
  }
`);

const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "").trim();

function fieldsWithEntity(l) {
  const fields = ["title", "street", "town", "postcode", "phone", "email", "website", "descriptionText"];
  return fields.filter((f) => typeof l[f] === "string" && l[f].includes("&#"));
}

const titleGroups = new Map();
for (const l of listings) {
  const key = norm(l.title);
  if (!key) continue;
  if (!titleGroups.has(key)) titleGroups.set(key, []);
  titleGroups.get(key).push(l);
}

const duplicates = [...titleGroups.values()].filter((g) => g.length > 1);
const withEntity = listings.filter((l) => fieldsWithEntity(l).length > 0);
const noImage = listings.filter((l) => !l.hasImage && !l.hasGallery);
const noImageAndEntity = listings.filter(
  (l) => !l.hasImage && !l.hasGallery && fieldsWithEntity(l).length > 0
);

console.log(`Total listings: ${listings.length}`);
console.log(`Listings containing "&#" (HTML entity): ${withEntity.length}`);
console.log(`Listings with no image (no main + no gallery): ${noImage.length}`);
console.log(`Listings BOTH with no image AND containing "&#": ${noImageAndEntity.length}`);
console.log(`Title groups with duplicates: ${duplicates.length}`);
console.log();

if (noImageAndEntity.length) {
  console.log("=== Candidates for deletion (no image AND contains \"&#\") ===\n");
  for (const l of noImageAndEntity) {
    const flagged = fieldsWithEntity(l);
    const dupGroup = titleGroups.get(norm(l.title)) || [];
    const sibling = dupGroup.find((s) => s._id !== l._id);
    console.log(`  ${l._id}`);
    console.log(`    title:    ${JSON.stringify(l.title)}`);
    console.log(`    slug:     ${l.slug}`);
    console.log(`    status:   ${l.status}`);
    console.log(`    created:  ${l._createdAt}`);
    console.log(`    fields w/ entity: ${flagged.join(", ")}`);
    if (sibling) {
      console.log(`    has duplicate: ${sibling._id} ("${sibling.title}", image=${sibling.hasImage || sibling.hasGallery ? "Y" : "N"})`);
    } else {
      console.log(`    has duplicate: NO (only listing with this title)`);
    }
    console.log();
  }
}

if (duplicates.length) {
  console.log("=== All duplicate title groups (for context) ===\n");
  for (const group of duplicates) {
    console.log(`"${group[0].title}" (${group.length} entries):`);
    for (const l of group) {
      const ent = fieldsWithEntity(l).length > 0 ? " ⚠entity" : "";
      const img = l.hasImage || l.hasGallery ? "" : " 📷none";
      console.log(`  - ${l._id}  status=${l.status}${img}${ent}`);
    }
    console.log();
  }
}
