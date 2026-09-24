/**
 * One-off: collapse the business directory's 19 categories into four broad ones
 * (Accommodation, Food & Drink, Services, Shops) and repoint every listing.
 *
 *   node scripts/recategorise-listings.mjs           # dry run
 *   node scripts/recategorise-listings.mjs --apply   # write to Sanity
 */
import { createClient } from "@sanity/client";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const client = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
  perspective: "raw",
});

const apply = process.argv.includes("--apply");

const CATEGORIES = [
  { _id: "category-accommodation", name: "Accommodation", slug: "accommodation" },
  { _id: "category-food-drink", name: "Food & Drink", slug: "food-drink" },
  { _id: "category-services", name: "Services", slug: "services" },
  { _id: "category-shops", name: "Shops", slug: "shops" },
];

const ACC = "category-accommodation";
const FOOD = "category-food-drink";
const SERV = "category-services";
const SHOP = "category-shops";

/** Default for each old category, used when a listing isn't named below */
const BY_OLD_CATEGORY = {
  Accommodation: ACC,
  Hotel: ACC,
  Cafe: FOOD,
  Drink: FOOD,
  Pub: FOOD,
  Restauraunt: FOOD,
  Takeaway: FOOD,
  Accountant: SERV,
  "Business Services": SERV,
  "Council Services": SERV,
  Garage: SERV,
  Health: SERV,
  "IT Services": SERV,
  "Interior Design": SERV,
  Pets: SERV,
  Property: SERV,
  Services: SERV,
  Venues: SERV,
  Education: SERV,
  "Education/Health/Community": SERV,
  Outdoor: SHOP,
  Upholstery: SERV,
  Gallery: SHOP,
  Shops: SHOP,
};

/** Listings whose old category points the wrong way, decided from their description */
const BY_TITLE = {
  // makers and retailers that sat under Gallery / Interior Design
  "Slade House": SHOP,
  "Sticks & Stones": SHOP,
  "Sweet Liberty Belle": SHOP,
  "The Hanging Gallery": SHOP,
  "Ellis Pottery of High Ham": SHOP,
  Lafleur: SHOP,
  "Wild Rose Holistic Centre and Art Gallery": SERV,
  // services that sat under Shops
  Brainwave: SERV,
  "Lucy Jorge Hair and Beauty": SERV,
  // food producers filed elsewhere
  "Cracknell's Farm": FOOD,
  // uncategorised listings
  "Hill Farm Langport": ACC,
  "The Red Cabin at Hill Farm": ACC,
  "Ant & Decks": SERV,
  "O2i Design Ltd": SERV,
  "Okapi and Co Limited": SERV,
  "Okapi and co": SERV,
  "Langport Town Council": SERV,
  "Jaipur Joy": SHOP,
  "Langport Vintage": SHOP,
  "MAKE Emporium": SHOP,
  "The Handmade Gallery - 369 Bow St": SHOP,
};

/** Obvious test entries: left alone rather than deleted */
const SKIP_TITLES = new Set(["Test", "TEst"]);

const listings = await client.fetch(
  `*[_type == "businessListing"]{_id, title, "old": category->name, "categoryRef": category._ref}`
);

const plan = [];
const unmapped = [];
for (const l of listings) {
  // some titles carry a trailing space from the old site
  const title = (l.title ?? "").trim();
  if (!title || SKIP_TITLES.has(title)) continue;
  l.title = title;
  const target = BY_TITLE[title] ?? (l.old ? BY_OLD_CATEGORY[l.old] : undefined);
  if (!target) {
    unmapped.push(l);
    continue;
  }
  if (l.categoryRef === target) continue;
  plan.push({ ...l, target });
}

const label = (id) => CATEGORIES.find((c) => c._id === id).name;
const byTarget = {};
for (const p of plan) (byTarget[p.target] ||= []).push(p);

for (const cat of CATEGORIES) {
  const rows = byTarget[cat._id] ?? [];
  console.log(`\n${cat.name} (${rows.length})`);
  for (const r of rows) {
    const draft = r._id.startsWith("drafts.") ? " [draft]" : "";
    console.log(`  ${r.title}${draft}  ←  ${r.old ?? "uncategorised"}`);
  }
}
if (unmapped.length) {
  console.log(`\nNot mapped (${unmapped.length}):`);
  for (const u of unmapped) console.log(`  ${u.title} (${u.old ?? "uncategorised"})`);
}
console.log(`\n${plan.length} listings to update. ${label(SERV)} check: ${(byTarget[SERV] ?? []).length}`);

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
  process.exit(0);
}

for (const cat of CATEGORIES) {
  await client.createOrReplace({
    _id: cat._id,
    _type: "listingCategory",
    name: cat.name,
    slug: { _type: "slug", current: cat.slug },
  });
}
console.log("\nFour categories in place.");

let done = 0;
for (const p of plan) {
  await client
    .patch(p._id)
    .set({ category: { _type: "reference", _ref: p.target }, title: p.title })
    .commit();
  done++;
  if (done % 20 === 0) console.log(`  ${done}/${plan.length}`);
}
console.log(`${done} listings repointed.`);

// Remove the old categories now nothing references them
const old = await client.fetch(
  `*[_type == "listingCategory" && !(_id in $keep)]{_id, name, "refs": count(*[references(^._id)])}`,
  { keep: CATEGORIES.map((c) => c._id) }
);
for (const o of old) {
  if (o.refs > 0) {
    console.log(`kept ${o.name} (${o._id}) — still referenced ${o.refs}x`);
    continue;
  }
  await client.delete(o._id);
}
console.log(`Old categories removed: ${old.filter((o) => o.refs === 0).length}`);
