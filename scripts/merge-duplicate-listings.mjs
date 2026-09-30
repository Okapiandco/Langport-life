/**
 * One-off: remove duplicate business listings and the two test entries.
 *
 * Where a business submitted itself again, the newer record has their own
 * current details but no photo, and the older imported record has the photo.
 * So the photo (and the tidy slug) move to the keeper before the old one goes.
 *
 * Every document is written to a backup file before anything is deleted.
 *
 *   node scripts/merge-duplicate-listings.mjs           # dry run
 *   node scripts/merge-duplicate-listings.mjs --apply
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

/** keep: the record that stays. take: fields lifted from the one being removed. remove: ids to delete. */
const JOBS = [
  {
    what: "Koleman Creative Picture Framing",
    keep: "opaKfpLPVvBu6ZqIRpkDyk", // their own submission: description, phone, email, website
    take: ["image"], // the imported record has the only photo
    slug: "koleman-creative-picture-framing",
    remove: ["l88nfuAJ60OpvBtzaUSbpl"],
  },
  {
    what: "Parrett Trail Bikes",
    keep: "opaKfpLPVvBu6ZqIRr0tTv", // their own submission: current phone, email, website
    take: ["image"],
    slug: "parrett-trail-bikes",
    remove: ["AbqF3RbZI5GYtUoKbd4l8v"],
  },
  {
    what: "Langport Town Council",
    keep: "UWAyg3ZUg8cfCgxka7iDc1", // the only one with any description
    take: [],
    slug: "langport-town-council",
    remove: ["9PAidMj5mCF3r2aProxHye", "drafts.9PAidMj5mCF3r2aProxHye"],
  },
  {
    what: "Test entries",
    keep: null,
    take: [],
    remove: ["cT6xNUEXcySjCQYbm4MQeu", "vg4Ai6725FcFP486JUdsmc", "drafts.vg4Ai6725FcFP486JUdsmc"],
  },
];

const allIds = JOBS.flatMap((j) => [j.keep, ...j.remove].filter(Boolean));
const docs = await client.fetch(`*[_id in $ids]`, { ids: allIds });
const byId = Object.fromEntries(docs.map((d) => [d._id, d]));

// Anything pointing at a document being removed would break, so check first
const removing = JOBS.flatMap((j) => j.remove);
const referenced = await client.fetch(
  `*[references($ids)]{_id, _type, title}`,
  { ids: removing }
);

for (const job of JOBS) {
  console.log(`\n${job.what}`);
  for (const id of job.remove) {
    const d = byId[id];
    console.log(`  remove  ${id}  ${d ? `"${d.title}" (${d.status ?? "no status"})` : "— not found"}`);
  }
  if (job.keep) {
    const k = byId[job.keep];
    console.log(`  keep    ${job.keep}  "${k?.title}"  slug -> ${job.slug}`);
    for (const field of job.take) {
      const source = job.remove.map((id) => byId[id]).find((d) => d && d[field]);
      console.log(`    take ${field} from ${source?._id ?? "nothing — none of the removed records has one"}`);
    }
  }
}

if (referenced.length) {
  console.log(`\nSomething still points at a record being removed — stopping:`);
  for (const r of referenced) console.log(`  ${r._type} ${r._id} ${r.title ?? ""}`);
  process.exit(1);
}
console.log(`\nNothing references the records being removed.`);

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
  process.exit(0);
}

const stamp = new Date().toISOString().slice(0, 10);
const backup = `${process.env.USERPROFILE}/Downloads/langport-listings-removed-${stamp}.json`;
fs.writeFileSync(backup, JSON.stringify(docs, null, 2));
console.log(`\nBackup of all ${docs.length} documents involved: ${backup}`);

for (const job of JOBS) {
  if (job.keep) {
    const patch = {};
    for (const field of job.take) {
      const source = job.remove.map((id) => byId[id]).find((d) => d && d[field]);
      if (source) patch[field] = source[field];
    }
    if (job.slug) patch.slug = { _type: "slug", current: job.slug };
    // the old record holds the slug, so it has to go before the keeper can take it
    for (const id of job.remove) await client.delete(id).catch((e) => console.log(`  ${id}: ${e.message}`));
    if (Object.keys(patch).length) await client.patch(job.keep).set(patch).commit();
    console.log(`${job.what}: removed ${job.remove.length}, updated keeper`);
  } else {
    for (const id of job.remove) await client.delete(id).catch((e) => console.log(`  ${id}: ${e.message}`));
    console.log(`${job.what}: removed ${job.remove.length}`);
  }
}
