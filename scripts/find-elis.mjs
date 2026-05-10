// One-off read-only query to find Eli's venue duplicates.
// Run: node scripts/find-elis.mjs
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";

// Tiny .env.local loader (only what we need)
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

const query = `*[_type == "venue" && (title match "Eli*" || slug.current match "eli*")] | order(_createdAt asc) {
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  status,
  street, town, postcode, phone, email, website,
  "hasMainImage": defined(image),
  "galleryCount": count(images),
  "descriptionText": pt::text(description),
  "referencedByEvents": count(*[_type == "event" && references(^._id)])
}`;

const rows = await client.fetch(query);
console.log(JSON.stringify(rows, null, 2));
