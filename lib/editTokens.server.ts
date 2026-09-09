import "server-only";
import { createHash } from "crypto";
import { neon } from "@neondatabase/serverless";

// Magic edit-link tokens and submitter contact details live in Neon, NOT in
// Sanity: the Sanity dataset is public, so anything stored on a document is
// world-readable. Sanity keeps only a SHA-256 hash of the token (useless
// without the original), and the raw token exists only in the submitter's
// email. See scripts/migrate-edit-tokens.mjs for the table DDL and the
// migration of pre-existing documents.

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — edit tokens require the Neon database.");
  return neon(url);
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export interface EditTokenRecord {
  docId: string;
  docType: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
}

export async function createEditToken(
  rawToken: string,
  record: EditTokenRecord
): Promise<void> {
  await sql()`
    INSERT INTO edit_tokens (token_hash, doc_id, doc_type, submitter_name, submitter_email, submitter_phone)
    VALUES (${hashToken(rawToken)}, ${record.docId}, ${record.docType},
            ${record.submitterName}, ${record.submitterEmail}, ${record.submitterPhone})
    ON CONFLICT (token_hash) DO NOTHING
  `;
}

export async function lookupEditToken(
  rawToken: string
): Promise<EditTokenRecord | null> {
  const rows = await sql()`
    SELECT doc_id, doc_type, submitter_name, submitter_email, submitter_phone
    FROM edit_tokens
    WHERE token_hash = ${hashToken(rawToken)}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    docId: r.doc_id as string,
    docType: r.doc_type as string,
    submitterName: (r.submitter_name as string) ?? null,
    submitterEmail: (r.submitter_email as string) ?? null,
    submitterPhone: (r.submitter_phone as string) ?? null,
  };
}

// Housekeeping: called by the purge cron so token rows don't outlive the
// documents they point at.
export async function deleteTokensForDocs(docIds: string[]): Promise<void> {
  if (docIds.length === 0) return;
  await sql()`DELETE FROM edit_tokens WHERE doc_id = ANY(${docIds})`;
}
