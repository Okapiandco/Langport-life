import { neon } from "@neondatabase/serverless";
import { createClient } from "@sanity/client";
import fs from "fs";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split(/\r?\n/).filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,"")]}));
const sql = neon(env.DATABASE_URL);
const rows = await sql`SELECT doc_type, count(*) AS n, count(submitter_email) AS with_email, min(created_at) AS oldest, max(created_at) AS newest FROM edit_tokens GROUP BY doc_type ORDER BY doc_type`;
console.log("edit_tokens by type:", rows);
const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'edit_tokens' ORDER BY ordinal_position`;
console.log("columns:", cols.map(c => c.column_name).join(", "));
const ids = (await sql`SELECT doc_id FROM edit_tokens WHERE doc_type = 'businessListing'`).map(r => r.doc_id);
const c = createClient({projectId:"8ecf405k",dataset:"production",apiVersion:"2024-01-01",useCdn:false,token:env.SANITY_API_TOKEN,perspective:"published"});
const stats = await c.fetch(`{
  "listings": count(*[_type=="businessListing" && status=="published"]),
  "withHash": count(*[_type=="businessListing" && status=="published" && defined(editTokenHash)]),
  "plaintextLeft": count(*[_type=="businessListing" && defined(editToken)]),
  "hashNoNeonRow": *[_type=="businessListing" && status=="published" && defined(editTokenHash) && !(_id in $ids)]{title}[0...10],
  "neonRowNoDoc": count(*[_id in $ids])
}`, { ids });
console.log("sanity:", JSON.stringify(stats, null, 1));
console.log("neon businessListing token rows:", ids.length);
