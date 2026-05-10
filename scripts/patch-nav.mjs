// One-off Sanity nav patch: brings the live Navigation singleton in sync with
// the four queued changes (add Groups inside What's On, rename News → Town News,
// move Town Council after Town News, append Contact Us).
// Run: node --use-system-ca scripts/patch-nav.mjs
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

const current = await client.fetch(`*[_id == "navigation"][0]{ mainMenu }`);
if (!current) {
  console.error("No navigation document found");
  process.exit(1);
}

const items = (current.mainMenu ?? []).map((item) => ({ ...item }));
const byKey = (k) => items.find((i) => i._key === k);

// 1. Add Groups column to What's On (n1)
const whatsOn = byKey("n1");
if (!whatsOn) throw new Error("n1 (What's On) not found");
const childrenList = whatsOn.children ?? [];
if (!childrenList.some((g) => g.groupTitle === "Groups")) {
  childrenList.push({
    _key: "n1g3",
    groupTitle: "Groups",
    links: [{ _key: "n1g3l1", title: "Join a Group", href: "/join-a-group" }],
  });
}
whatsOn.children = childrenList;

// 2. Rename News (n7) → Town News
const news = byKey("n7");
if (news) news.title = "Town News";

// 3. Reorder so Town Council (n6) sits after Town News (n7), and append Contact Us.
//    Existing order from inspection: [n1, n3, n4, n5, n6, n7]
//    Target order: [n1, n3, n4, n5, n7, n6, contact]
const desiredOrder = ["n1", "n3", "n4", "n5", "n7", "n6"];
const reordered = desiredOrder
  .map((k) => byKey(k))
  .filter(Boolean);

// Carry over any items we didn't account for (defensive — keeps unknown keys at the end)
for (const item of items) {
  if (!desiredOrder.includes(item._key) && item._key !== "n8") {
    reordered.push(item);
  }
}

// 4. Append Contact Us if not already present
if (!reordered.some((i) => i.href === "/contact")) {
  reordered.push({ _key: "n8", title: "Contact Us", href: "/contact" });
}

console.log("New main-menu order:");
for (const i of reordered) {
  console.log(`  ${i._key}: ${i.title} → ${i.href}`);
  if (i.children?.length) {
    for (const g of i.children) console.log(`     · ${g.groupTitle || "(no title)"} (${g.links?.length || 0} link${g.links?.length === 1 ? "" : "s"})`);
  }
}

await client.patch("navigation").set({ mainMenu: reordered }).commit();
console.log("\n✓ Sanity nav updated.");
