// Read-only: dump the current Sanity navigation doc so we can see what mega-menu groups exist.
// Run: node --use-system-ca scripts/inspect-nav.mjs
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

const nav = await client.fetch(`*[_type == "navigation"][0]{
  _id,
  mainMenu[]{
    _key, title, href,
    children[]{ _key, groupTitle, links[]{ _key, title, href } }
  }
}`);
console.log(JSON.stringify(nav, null, 2));
