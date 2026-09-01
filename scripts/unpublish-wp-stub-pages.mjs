/**
 * Unpublishes leftover WordPress-migration stub pages (cart, login, GD-*
 * scaffolding, and old WP nav/council pages superseded by real routes).
 *
 * Sets published: false — fully reversible in Studio. Does NOT touch
 * content-bearing pages (community-plan, the-river, waste, water, weather,
 * walking pages, policy pages) — review those by hand.
 *
 * Run with:
 *   NODE_OPTIONS=--use-system-ca node --env-file=.env.local scripts/unpublish-wp-stub-pages.mjs
 */

import { createClient } from "next-sanity";

const client = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// WP/WooCommerce/GeoDirectory scaffolding and test pages
const SCAFFOLDING = [
  "account", "add", "add-business-listing", "add-listing", "add-your-own-event",
  "all-venues", "cart", "change", "checkout", "forgot",
  "gd-archive", "gd-archive-item", "gd-details", "gd-events-archive", "gd-location-page",
  "home", "join", "list-your-event", "location", "login",
  "profile", "reset", "sample-page", "shop", "single-event-name",
  "test-2", "user-list-item", "users",
];

// Old WP pages superseded by real routes on the new site
const SUPERSEDED = [
  "whats-on", "shops-services", "directory", "news", "history",
  "environment", "things-to-do", "groups", "contact-us",
  "town-council", "agendas-minutes", "committees-meetings", "council-services",
  "councilor-information", "district-and-county-councillors", "district-county",
  "governance-transparency", "staff-volunteers-information",
  "full-council", "finance", "finance-and-personel", "tourism-and-marketing",
  "annual-town-assembly", "joint-council-committee", "archived-minutes",
];

const slugs = [...SCAFFOLDING, ...SUPERSEDED];

async function run() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("SANITY_API_TOKEN is not set.");
    process.exit(1);
  }

  const docs = await client.fetch(
    `*[_type == "page" && published == true && slug.current in $slugs]{ _id, title, "slug": slug.current }`,
    { slugs }
  );

  console.log(`Found ${docs.length} published stub pages to unpublish.`);
  for (const doc of docs) {
    await client.patch(doc._id).set({ published: false }).commit();
    console.log(`  ✓ unpublished /${doc.slug} (${doc.title}) [${doc._id}]`);
  }

  const remaining = await client.fetch(
    `*[_type == "page" && published == true]{ "slug": slug.current } | order(slug asc)`
  );
  console.log(`\nStill published (${remaining.length}) — review these in Studio:`);
  console.log([...new Set(remaining.map((r) => r.slug))].join(", "));
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
