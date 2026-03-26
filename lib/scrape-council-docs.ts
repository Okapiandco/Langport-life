/**
 * Council Document Scraper & Uploader
 *
 * Scrapes all PDF/DOC links from the live Langport Life council pages,
 * downloads them, and uploads to Sanity as councilDocument records.
 *
 * Usage:
 *   npx tsx lib/scrape-council-docs.ts              # Full run: scrape + download + upload to Sanity
 *   npx tsx lib/scrape-council-docs.ts --dry-run     # Just list what would be downloaded
 *   npx tsx lib/scrape-council-docs.ts --download-only # Download to local folder, don't upload
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@sanity/client";
import { readFileSync, createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import https from "https";
import http from "http";

const DRY_RUN = process.argv.includes("--dry-run");
const DOWNLOAD_ONLY = process.argv.includes("--download-only");
const DOWNLOAD_DIR = join(process.cwd(), "council-docs");

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// All council pages to scrape
const COUNCIL_PAGES = [
  "/town-council/agendas-minutes/full-council/",
  "/town-council/agendas-minutes/finance-and-personel/",
  "/town-council/agendas-minutes/tourism-and-marketing/",
  "/town-council/agendas-minutes/annual-town-assembly/",
  "/town-council/agendas-minutes/joint-council-committee/",
  "/town-council/agendas-minutes/archived-minutes/",
  "/town-council/agendas-minutes/groups/",
  "/town-council/agendas-minutes/",
  "/town-council/governance-transparency/",
  "/town-council/finance/",
];

const BASE_URL = "https://langport.life";

// Committee/section tag derived from page URL
function getCommitteeTag(pagePath: string): string {
  if (pagePath.includes("full-council")) return "full-council";
  if (pagePath.includes("finance-and-personel")) return "finance-personnel";
  if (pagePath.includes("tourism-and-marketing")) return "tourism-marketing";
  if (pagePath.includes("annual-town-assembly")) return "annual-assembly";
  if (pagePath.includes("joint-council-committee")) return "joint-committee";
  if (pagePath.includes("archived-minutes")) return "archived";
  if (pagePath.includes("groups")) return "groups";
  if (pagePath.includes("governance-transparency")) return "governance";
  if (pagePath.includes("finance")) return "finance";
  return "council";
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 96);
}

function determineDocumentType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("agenda")) return "agenda";
  if (t.includes("minute")) return "minutes";
  if (t.includes("polic")) return "policy";
  if (t.includes("agm") || t.includes("annual-town") || t.includes("annual town")) return "agm";
  if (
    t.includes("financial") || t.includes("budget") || t.includes("balances") ||
    t.includes("payment") || t.includes("receipt") || t.includes("income") ||
    t.includes("expenditure") || t.includes("agar") || t.includes("audit") ||
    t.includes("bank-reconciliation") || t.includes("asset-register") ||
    t.includes("grant")
  ) return "financial";
  return "other";
}

function extractDateFromUrl(url: string): string | undefined {
  // URLs like /wp-content/uploads/2025/03/filename.pdf -> extract YYYY/MM
  const uploadsMatch = url.match(/\/uploads\/(\d{4})\/(\d{2})\//);
  if (uploadsMatch) return `${uploadsMatch[1]}-${uploadsMatch[2]}-01`;
  return undefined;
}

function extractDateFromTitle(title: string): string | undefined {
  // DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = title.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // YYYY-MM-DD
  const ymdMatch = title.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) return ymdMatch[0];
  return undefined;
}

function fetchPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0 LangportLifeMigration/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        if (loc) return fetchPage(loc.startsWith("http") ? loc : BASE_URL + loc).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);
    protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0 LangportLifeMigration/1.0" } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          return downloadFile(redirectUrl.startsWith("http") ? redirectUrl : BASE_URL + redirectUrl, dest).then(resolve).catch(reject);
        }
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => { file.close(); reject(err); });
  });
}

interface DocInfo {
  url: string;
  title: string;
  filename: string;
  date: string;
  documentType: string;
  committee: string;
}

function extractDocLinks(html: string, pagePath: string): DocInfo[] {
  const docs: DocInfo[] = [];
  const seen = new Set<string>();
  const committee = getCommitteeTag(pagePath);

  // Match links to documents (pdf, doc, docx, xlsx, xls)
  const linkRegex = /<a[^>]*href="([^"]*\.(?:pdf|docx?|xlsx?)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let url = match[1];
    let title = match[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

    // Make URL absolute
    if (!url.startsWith("http")) {
      url = BASE_URL + (url.startsWith("/") ? url : "/" + url);
    }

    // Skip duplicates
    if (seen.has(url)) continue;
    seen.add(url);

    const filename = decodeURIComponent(url.split("/").pop() || "document.pdf");

    // Use filename as title if link text is empty or generic
    if (!title || title.length < 3 || title === "Download") {
      title = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    }

    const date = extractDateFromTitle(title) || extractDateFromTitle(filename) || extractDateFromUrl(url) || new Date().toISOString().split("T")[0];
    const documentType = determineDocumentType(title) || determineDocumentType(filename);

    docs.push({ url, title, filename, date, documentType, committee });
  }

  return docs;
}

async function main() {
  console.log("=== Council Document Scraper ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : DOWNLOAD_ONLY ? "DOWNLOAD ONLY" : "FULL (download + upload to Sanity)"}\n`);

  if (!DRY_RUN && !DOWNLOAD_ONLY) {
    // Check for existing documents to avoid duplicates
    const existing = await sanityClient.fetch<string[]>(
      `*[_type == "councilDocument"]{ "fileUrl": file.asset->url }.fileUrl`
    );
    console.log(`Found ${existing.length} existing council documents in Sanity\n`);
  }

  // Create download directory
  if (!DRY_RUN) {
    mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  const allDocs: DocInfo[] = [];

  // Scrape each page
  for (const pagePath of COUNCIL_PAGES) {
    const url = BASE_URL + pagePath;
    console.log(`Scraping: ${url}`);

    try {
      const html = await fetchPage(url);
      const docs = extractDocLinks(html, pagePath);
      console.log(`  Found ${docs.length} documents`);
      allDocs.push(...docs);
    } catch (err) {
      console.error(`  ERROR fetching page: ${(err as Error).message}`);
    }
  }

  // Deduplicate by URL across pages
  const uniqueByUrl = new Map<string, DocInfo>();
  for (const doc of allDocs) {
    if (!uniqueByUrl.has(doc.url)) {
      uniqueByUrl.set(doc.url, doc);
    }
  }
  const uniqueDocs = Array.from(uniqueByUrl.values());

  console.log(`\n=== Total: ${uniqueDocs.length} unique documents found ===\n`);

  if (DRY_RUN) {
    // Just print the list
    const byCommittee = new Map<string, DocInfo[]>();
    for (const doc of uniqueDocs) {
      const list = byCommittee.get(doc.committee) || [];
      list.push(doc);
      byCommittee.set(doc.committee, list);
    }

    for (const [committee, docs] of byCommittee) {
      console.log(`\n--- ${committee} (${docs.length} docs) ---`);
      for (const doc of docs) {
        console.log(`  [${doc.documentType}] ${doc.title}`);
        console.log(`    ${doc.url}`);
        console.log(`    Date: ${doc.date}`);
      }
    }
    return;
  }

  // Check which docs already exist in Sanity (by original filename)
  let existingFilenames = new Set<string>();
  if (!DOWNLOAD_ONLY) {
    const existing = await sanityClient.fetch<Array<{ fn: string }>>(
      `*[_type == "councilDocument" && defined(file)]{ "fn": file.asset->originalFilename }`
    );
    existingFilenames = new Set(existing.map((e) => e.fn).filter(Boolean));
    console.log(`${existingFilenames.size} documents already in Sanity (will skip these)\n`);
  }

  let downloaded = 0;
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < uniqueDocs.length; i++) {
    const doc = uniqueDocs[i];
    const progress = `[${i + 1}/${uniqueDocs.length}]`;

    // Skip if already in Sanity
    if (!DOWNLOAD_ONLY && existingFilenames.has(doc.filename)) {
      console.log(`${progress} SKIP (exists): ${doc.filename}`);
      skipped++;
      continue;
    }

    // Create committee subfolder
    const committeeDir = join(DOWNLOAD_DIR, doc.committee);
    mkdirSync(committeeDir, { recursive: true });

    const localPath = join(committeeDir, doc.filename);

    try {
      // Download if not already on disk
      if (!existsSync(localPath)) {
        console.log(`${progress} Downloading: ${doc.filename}`);
        await downloadFile(doc.url, localPath);
        downloaded++;
      } else {
        console.log(`${progress} Already on disk: ${doc.filename}`);
      }

      // Upload to Sanity
      if (!DOWNLOAD_ONLY) {
        const buffer = readFileSync(localPath);
        const asset = await sanityClient.assets.upload("file", buffer, { filename: doc.filename });

        await sanityClient.create({
          _type: "councilDocument",
          title: doc.title,
          slug: { _type: "slug", current: toSlug(doc.title) },
          documentType: doc.documentType,
          date: doc.date,
          file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
          visibility: "public",
          tags: [doc.committee],
        });
        uploaded++;
        console.log(`${progress} Uploaded: ${doc.title}`);
      }
    } catch (err) {
      console.error(`${progress} FAILED: ${doc.filename} - ${(err as Error).message}`);
      failed++;
    }

    // Small delay to avoid hammering the server
    if (i % 5 === 4) await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n=== Done! ===");
  console.log(`Downloaded: ${downloaded}`);
  if (!DOWNLOAD_ONLY) console.log(`Uploaded to Sanity: ${uploaded}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Script failed:", err.message || err);
  process.exit(1);
});
