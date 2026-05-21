/**
 * Creates one dummy "approved" group in Sanity so you can see the listing layout.
 * Run with:  npx tsx scripts/seed-dummy-group.ts
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
const env: Record<string, string> = {};
try {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("Could not read .env.local — make sure you run this from the project root.");
  process.exit(1);
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k",
  dataset:   env.NEXT_PUBLIC_SANITY_DATASET   || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

async function main() {
  const doc = await client.create({
    _type: "group",
    name: "Langport Crafters Circle",
    slug: { _type: "slug", current: "langport-crafters-circle" },
    organiser: "Sue Bradley",
    description: [
      {
        _type: "block",
        _key: "intro",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "A friendly group for anyone who loves crafting — knitting, crochet, sewing, card-making and more. All skill levels are welcome and there is no need to book. Just turn up with your project and enjoy good company over a cup of tea.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
    location: "Langport Library, Bow Street, Langport",
    meetingTime: "1st and 3rd Wednesday of the month, 10am – 12pm",
    cost: "£2 per session",
    website: undefined,
    contactName: "Sue Bradley",
    contactEmail: "crafters@example.com",
    contactPhone: "07700 900456",
    tags: ["crafts", "social", "wellbeing"],
    submittedBy: "seed script",
    status: "approved",
  });

  console.log(`✓ Created group "${doc.name}" (id: ${doc._id})`);
  console.log(`  View at: https://langport.life/join-a-group/langport-crafters-circle`);
  console.log(`  Studio:  https://langport.life/studio/structure/group;${doc._id}`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
