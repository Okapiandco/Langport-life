/**
 * One-off migration: move magic edit-link tokens and submitter PII out of the
 * (publicly readable) Sanity dataset into Neon.
 *
 * For every document with a plaintext `editToken`:
 *   1. Insert a row into Neon: sha256(token) → doc id + submitter contact
 *      details (parsed from `submittedBy: "Name (email)"` / venue ownerEmail)
 *   2. Set `editTokenHash` on the document, unset `editToken`
 *   3. Rewrite `submittedBy` to the name only; unset venue `ownerEmail`
 *
 * Existing emailed edit links keep working: the raw token is unchanged, only
 * where it is stored and how it is looked up.
 *
 * Idempotent — docs already migrated (no editToken) are skipped, and Neon
 * inserts use ON CONFLICT DO NOTHING. Also strips emails from `submittedBy`
 * on docs that never had a token.
 *
 * Run with:
 *   NODE_OPTIONS=--use-system-ca node --env-file=.env.local scripts/migrate-edit-tokens.mjs
 * Requires SANITY_API_TOKEN (write) and DATABASE_URL (Neon) in .env.local.
 */

import { createHash } from "crypto";
import { createClient } from "next-sanity";
import { neon } from "@neondatabase/serverless";

const sanity = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function hashToken(raw) {
  return createHash("sha256").update(raw).digest("hex");
}

// "Jane Smith (jane@example.com)" -> { name: "Jane Smith", email: "jane@example.com" }
function parseSubmittedBy(value) {
  if (!value) return { name: null, email: null };
  const m = value.match(/^(.*?)\s*\(([^)]+@[^)]+)\)\s*$/);
  if (m) return { name: m[1].trim() || null, email: m[2].trim() };
  return { name: value.trim() || null, email: null };
}

async function run() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("SANITY_API_TOKEN is not set.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set — create the Neon database first.");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  console.log("Ensuring edit_tokens table exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS edit_tokens (
      token_hash       TEXT PRIMARY KEY,
      doc_id           TEXT NOT NULL,
      doc_type         TEXT NOT NULL,
      submitter_name   TEXT,
      submitter_email  TEXT,
      submitter_phone  TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS edit_tokens_doc_id_idx ON edit_tokens (doc_id)`;

  // ── 1. Docs with a plaintext token ────────────────────────────────────────
  const tokenDocs = await sanity.fetch(
    `*[defined(editToken)]{ _id, _type, editToken, submittedBy, ownerName, ownerEmail, contactPhone }`
  );
  console.log(`\n${tokenDocs.length} documents with a plaintext editToken`);

  let migrated = 0;
  for (const doc of tokenDocs) {
    const parsed = parseSubmittedBy(doc.submittedBy);
    const name = parsed.name || doc.ownerName || null;
    const email = parsed.email || doc.ownerEmail || null;

    await sql`
      INSERT INTO edit_tokens (token_hash, doc_id, doc_type, submitter_name, submitter_email, submitter_phone)
      VALUES (${hashToken(doc.editToken)}, ${doc._id}, ${doc._type}, ${name}, ${email}, ${doc.contactPhone ?? null})
      ON CONFLICT (token_hash) DO NOTHING
    `;

    let patch = sanity
      .patch(doc._id)
      .set({ editTokenHash: hashToken(doc.editToken) })
      .unset(["editToken"]);
    if (parsed.email) patch = patch.set({ submittedBy: parsed.name ?? "" });
    if (doc.ownerEmail) patch = patch.unset(["ownerEmail"]);
    await patch.commit();

    migrated++;
    console.log(`  ✓ ${doc._type} ${doc._id}`);
  }

  // ── 2. Remaining docs with an email inside submittedBy (no token) ─────────
  const piiDocs = await sanity.fetch(
    `*[!defined(editToken) && defined(submittedBy) && submittedBy match "*(*"]{ _id, _type, submittedBy }`
  );
  console.log(`\n${piiDocs.length} further documents with an email in submittedBy`);
  for (const doc of piiDocs) {
    const parsed = parseSubmittedBy(doc.submittedBy);
    if (!parsed.email) continue;
    await sanity.patch(doc._id).set({ submittedBy: parsed.name ?? "" }).commit();
    console.log(`  ✓ ${doc._type} ${doc._id}`);
  }

  // ── 3. Any remaining venue ownerEmail values ──────────────────────────────
  const ownerDocs = await sanity.fetch(
    `*[defined(ownerEmail)]{ _id, _type }`
  );
  console.log(`\n${ownerDocs.length} documents still carrying ownerEmail`);
  for (const doc of ownerDocs) {
    await sanity.patch(doc._id).unset(["ownerEmail"]).commit();
    console.log(`  ✓ ${doc._type} ${doc._id}`);
  }

  // ── Verify ────────────────────────────────────────────────────────────────
  const remaining = await sanity.fetch(
    `{ "tokens": count(*[defined(editToken)]),
       "emails": count(*[defined(submittedBy) && submittedBy match "*(*"]),
       "owners": count(*[defined(ownerEmail)]) }`
  );
  const rows = await sql`SELECT count(*)::int AS n FROM edit_tokens`;
  console.log(
    `\nDone. Migrated ${migrated} tokens. Neon rows: ${rows[0].n}.` +
      `\nRemaining in Sanity — plaintext tokens: ${remaining.tokens}, submittedBy emails: ${remaining.emails}, ownerEmail: ${remaining.owners} (all should be 0).`
  );
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
