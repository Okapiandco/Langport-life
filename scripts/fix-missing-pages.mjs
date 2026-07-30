/**
 * Creates three missing documents that cause nav 404s:
 *   /council/policies      → page document, slug "council/policies"
 *   /council/what-we-do   → page document, slug "council/what-we-do"
 *   /things-to-do/outdoor-life → activity document, slug "outdoor-life"
 *
 * Run with:
 *   NODE_OPTIONS=--use-system-ca node --env-file=.env.local scripts/fix-missing-pages.mjs
 */

import { createClient } from "next-sanity";

const client = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function block(text) {
  const key = () => Math.random().toString(36).slice(2, 10);
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

function heading(text, level = "h2") {
  const key = () => Math.random().toString(36).slice(2, 10);
  return {
    _type: "block",
    _key: key(),
    style: level,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

async function run() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("SANITY_API_TOKEN is not set. Load .env.local first.");
    process.exit(1);
  }

  // ── 1. Council Policies page ─────────────────────────────────────────────
  console.log("Creating /council/policies page...");
  await client.createOrReplace({
    _id: "page-council-policies",
    _type: "page",
    title: "Policies & Procedures",
    slug: { _type: "slug", current: "council/policies" },
    description: "Langport Town Council's policies, standing orders, and procedures.",
    published: true,
    content: [
      block(
        "Langport Town Council operates in accordance with a set of policies and standing orders that govern how meetings are conducted, how decisions are made, and how the Council fulfils its responsibilities to residents."
      ),
      heading("Standing Orders"),
      block(
        "Standing Orders set out the rules and procedures for council meetings, including how agendas are set, how voting works, and how members of the public can participate. The Council's Standing Orders are reviewed and adopted annually."
      ),
      heading("Financial Regulations"),
      block(
        "The Council's Financial Regulations govern how public money is managed, authorised, and accounted for. They ensure transparency and compliance with the Accounts and Audit Regulations."
      ),
      heading("Code of Conduct"),
      block(
        "All elected members are required to register and declare interests in accordance with the Localism Act 2011. The Code of Conduct is adopted from the National Association of Local Councils (NALC) model."
      ),
      heading("Privacy Notice"),
      block(
        "Langport Town Council is committed to protecting personal data in accordance with UK GDPR and the Data Protection Act 2018. Full details are available from the Town Clerk at office@langport.life."
      ),
      heading("Contact"),
      block(
        "Copies of any policy document are available on request from the Town Clerk. Email office@langport.life or call 01458 259700."
      ),
    ],
  });
  console.log("  ✓ /council/policies created");

  // ── 2. What We Do page ───────────────────────────────────────────────────
  console.log("Creating /council/what-we-do page...");
  await client.createOrReplace({
    _id: "page-council-what-we-do",
    _type: "page",
    title: "What We Do",
    slug: { _type: "slug", current: "council/what-we-do" },
    description: "An overview of the services and responsibilities of Langport Town Council.",
    published: true,
    content: [
      block(
        "Langport Town Council is the most local tier of government, serving the town of Langport and its residents. The Council works to maintain and improve local facilities, represent the views of residents to higher-tier councils, and support community life."
      ),
      heading("Council Services"),
      block(
        "The Town Council is responsible for the following services and facilities in Langport:"
      ),
      block("Public toilets in the town square"),
      block("Memorial Field — a recreational open space for residents"),
      block("Cricket Pavilion on the Memorial Field"),
      block("All Saints Churchyard — maintenance and upkeep"),
      block(
        "Cocklemoor — the unspoilt riverside area between the main car park and the River Parrett"
      ),
      block("Langport Cemetery — maintenance and burials"),
      heading("Representing Residents"),
      block(
        "The Council responds to planning applications, liaises with Somerset Council on highways, public transport, and local infrastructure, and raises issues of concern on behalf of residents. Councillors are elected every four years."
      ),
      heading("Meetings"),
      block(
        "The Full Council meets monthly. The Finance & Personnel, Tourism & Marketing, and other committees meet regularly throughout the year. All meetings are open to the public. Agendas and minutes are published on this website."
      ),
      heading("Grant Funding"),
      block(
        "The Town Council administers a small grants programme supporting local organisations and events. Contact the Town Clerk for details."
      ),
      heading("Get Involved"),
      block(
        "Residents are welcome to attend council meetings and address the council during the public participation period. To speak at a meeting, contact the Town Clerk in advance at office@langport.life or 01458 259700."
      ),
    ],
  });
  console.log("  ✓ /council/what-we-do created");

  // ── 3. Outdoor Life activity ─────────────────────────────────────────────
  console.log("Creating /things-to-do/outdoor-life activity...");
  await client.createOrReplace({
    _id: "activity-outdoor-life",
    _type: "activity",
    title: "The Outdoor Life",
    slug: { _type: "slug", current: "outdoor-life" },
    category: "outdoor",
    excerpt:
      "Langport sits on the River Parrett in the heart of the Somerset Levels — perfect territory for water sports, fishing, golf, and outdoor adventures.",
    highlights: [
      "Wild swimming",
      "Paddleboarding",
      "Kayaking",
      "Fishing",
      "Golf",
      "Boating",
      "River Parrett",
    ],
    published: true,
    order: 1,
    content: [
      block(
        "Langport's position on the River Parrett and the Somerset Levels makes it a natural base for outdoor activity. Whether you're on the water, casting a line, or teeing off, there's something here for every pace."
      ),
      heading("On the Water"),
      block(
        "The River Parrett flows gently past Langport, making it ideal for paddleboarding, kayaking, and open-water swimming. The wide, calm stretches between Langport and Muchelney are particularly popular with paddlers. Always check conditions before getting in — the river can rise quickly after heavy rain on the Levels."
      ),
      heading("Fishing"),
      block(
        "The Parrett and its surrounding drains and rhynes hold good stocks of roach, bream, perch, and pike. The Somerset Levels have a long tradition of angling. Fishing is managed by local clubs — contact the Langport & District Angling Club for day tickets and access information."
      ),
      heading("Golf"),
      block(
        "Langport Golf Club offers a welcoming 9-hole course with views across the Somerset Levels. Visitors are welcome. The course is relaxed and family-friendly — a great way to spend a few hours with the Levels spread out below you."
      ),
      heading("Getting Out on the Levels"),
      block(
        "Beyond the river, the surrounding moors and rhynes offer quiet paddling by canoe or kayak. Muchelney and Aller Moor are particularly atmospheric in the early morning. Keep an eye on the tides — tidal influence reaches inland further than you'd expect."
      ),
    ],
    notices: [
      {
        _type: "object",
        _key: Math.random().toString(36).slice(2, 10),
        type: "warning",
        title: "River safety",
        text: "Always check the Environment Agency flood alerts before swimming or paddling. The River Parrett can rise rapidly after rain on the Levels.",
      },
    ],
    externalLinks: [
      {
        _type: "object",
        _key: Math.random().toString(36).slice(2, 10),
        title: "Environment Agency — River Levels",
        url: "https://check-for-flooding.service.gov.uk/",
        description: "Check current river levels before heading out",
      },
      {
        _type: "object",
        _key: Math.random().toString(36).slice(2, 10),
        title: "Langport Golf Club",
        url: "https://www.langportgolfclub.co.uk/",
        description: "9-hole course, visitors welcome",
      },
    ],
  });
  console.log("  ✓ /things-to-do/outdoor-life created");

  console.log("\n✅ Done. All three pages are now live (Published: true).");
  console.log("   Pages will appear within 1 hour via ISR, or immediately after a Sanity publish triggers revalidation.");
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
