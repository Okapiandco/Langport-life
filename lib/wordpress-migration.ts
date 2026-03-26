/**
 * WordPress to Sanity Migration Script
 *
 * Usage: npx tsx lib/wordpress-migration.ts path/to/langportlife_WordPress_2026-03-25.xml
 *
 * This script:
 * 1. Parses the WordPress XML export
 * 2. Maps content types to Sanity document types
 * 3. Downloads and uploads media files to Sanity
 * 4. Creates all documents in Sanity
 * 5. Links references (events to venues, etc.)
 */

import "dotenv/config";
import { createClient } from "@sanity/client";
import { readFileSync, createWriteStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import https from "https";
import http from "http";

// Configure Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Simple XML parser for WordPress export
function parseWPXml(xmlContent: string) {
  const items: any[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlContent)) !== null) {
    const itemXml = match[1];
    const item: any = {};

    // Extract standard fields
    item.title = extractTag(itemXml, "title");
    item.link = extractTag(itemXml, "link");
    item.pubDate = extractTag(itemXml, "pubDate");
    item.creator = extractCdata(itemXml, "dc:creator");
    item.description = extractCdata(itemXml, "description");
    item.content = extractCdata(itemXml, "content:encoded");
    item.excerpt = extractCdata(itemXml, "excerpt:encoded");
    item.postId = extractTag(itemXml, "wp:post_id");
    item.postDate = extractTag(itemXml, "wp:post_date");
    item.postType = extractTag(itemXml, "wp:post_type");
    item.postStatus = extractTag(itemXml, "wp:status");
    item.slug = extractTag(itemXml, "wp:post_name");
    item.attachmentUrl = extractTag(itemXml, "wp:attachment_url");

    // Extract categories/tags
    item.categories = [];
    item.tags = [];
    const catRegex = /<category domain="(category|post_tag|gd_placecategory|gd_place_tags)" nicename="([^"]*)"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(itemXml)) !== null) {
      const domain = catMatch[1];
      const value = catMatch[3];
      if (domain === "category" || domain === "gd_placecategory") {
        item.categories.push(value);
      } else {
        item.tags.push(value);
      }
    }

    // Extract custom fields (post meta)
    item.meta = {};
    const metaRegex = /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g;
    let metaMatch;
    while ((metaMatch = metaRegex.exec(itemXml)) !== null) {
      item.meta[metaMatch[1]] = metaMatch[2];
    }

    items.push(item);
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  // Try CDATA first, then plain text
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const plainRegex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
  const plainMatch = plainRegex.exec(xml);
  return plainMatch ? plainMatch[1].trim() : "";
}

function extractCdata(xml: string, tag: string): string {
  return extractTag(xml, tag);
}

// Convert HTML to Portable Text blocks (simplified)
function htmlToPortableText(html: string): any[] {
  if (!html) return [];

  // Strip tags and create simple block
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();

  if (!text) return [];

  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return paragraphs.map((para) => ({
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: Math.random().toString(36).slice(2, 10),
        text: para.trim(),
        marks: [],
      },
    ],
  }));
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96);
}

// Download file from URL
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);
    protocol
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            downloadFile(redirectUrl, dest).then(resolve).catch(reject);
            return;
          }
        }
        response.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      })
      .on("error", (err) => { reject(err); });
  });
}

// Upload media to Sanity
async function uploadToSanity(filePath: string, filename: string) {
  const buffer = readFileSync(filePath);
  const type = filename.match(/\.(jpe?g|png|gif|webp|svg)$/i) ? "image" : "file";

  const asset = await sanityClient.assets.upload(type, buffer, {
    filename,
  });

  return asset;
}

// Extract document links from page content
function extractDocumentLinks(html: string): Array<{url: string, title: string, date?: string}> {
  const documents: Array<{url: string, title: string, date?: string}> = [];

  // Find all links to PDF/DOC files
  const linkRegex = /<a[^>]*href="([^"]*\.(?:pdf|doc|docx)[^"]*)"[^>]*>([^<]*)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    let title = match[2].trim();

    // Clean up title - remove extra whitespace and HTML entities
    title = title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();

    // Try to extract date from URL or title - improved regex
    let date: string | undefined;
    const urlDateMatch = url.match(/(\d{4}[-\/]\d{2}[-\/]\d{2})/);
    const titleDateMatch = title.match(/(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/);

    if (urlDateMatch) {
      date = urlDateMatch[1].replace(/\//g, '-');
    } else if (titleDateMatch) {
      date = titleDateMatch[1].replace(/\//g, '-').replace(/\./g, '-');
    }

    documents.push({ url, title, date });
  }

  return documents;
}

// Determine document type from title
function determineDocumentType(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('agenda')) return 'agenda';
  if (lowerTitle.includes('minute')) return 'minutes';
  if (lowerTitle.includes('polic')) return 'policy';
  if (lowerTitle.includes('agm')) return 'agm';
  if (lowerTitle.includes('financial') || lowerTitle.includes('budget') || lowerTitle.includes('balances') || lowerTitle.includes('payment') || lowerTitle.includes('receipt')) return 'financial';
  return 'other';
}

const COUNCILLOR_CATEGORIES = ["councillors", "personal-profiles"];
const COUNCIL_DOCUMENT_CATEGORIES = ["agendas", "minutes", "policies", "agm", "financial"];

async function migrate(xmlPath: string) {
  console.log("Reading WordPress XML export...");
  const xmlContent = readFileSync(xmlPath, "utf-8");

  console.log("Parsing XML...");
  const allItems = parseWPXml(xmlContent);
  console.log(`Found ${allItems.length} items total`);

  // Filter by type
  const posts = allItems.filter((i) => i.postType === "post" && i.postStatus === "publish");
  const pages = allItems.filter((i) => i.postType === "page" && i.postStatus === "publish");
  const places = allItems.filter((i) => i.postType === "gd_place" && i.postStatus === "publish");
  const venues = allItems.filter((i) => i.postType === "gd_venue" && i.postStatus === "publish");
  const events = allItems.filter((i) => i.postType === "gd_event" && i.postStatus === "publish");
  const attachments = allItems.filter((i) => i.postType === "attachment");

  console.log(`Posts: ${posts.length}, Pages: ${pages.length}, Places: ${places.length}, Venues: ${venues.length}, Events: ${events.length}, Attachments: ${attachments.length}`);

  // Track media mapping: WP attachment URL -> Sanity asset ID
  const mediaMap: Record<string, string> = {};

  // 1. Upload media
  console.log("\n--- Uploading media ---");
  let mediaCount = 0;
  for (const att of attachments) {
    if (!att.attachmentUrl) continue;
    try {
      const filename = att.attachmentUrl.split("/").pop() || "file";
      const tmpPath = join(tmpdir(), filename);
      await downloadFile(att.attachmentUrl, tmpPath);
      const asset = await uploadToSanity(tmpPath, filename);
      mediaMap[att.attachmentUrl] = asset._id;
      mediaCount++;
      if (mediaCount % 50 === 0) console.log(`  Uploaded ${mediaCount} media files...`);
    } catch (err) {
      console.error(`  Failed to upload: ${att.attachmentUrl}`, (err as Error).message);
    }
  }
  console.log(`  Total uploaded: ${mediaCount}`);

  // 2. Create article categories
  console.log("\n--- Creating article categories ---");
  const uniqueCategories = [...new Set(posts.flatMap((p) => p.categories))];
  const categoryMap: Record<string, string> = {};

  for (const catName of uniqueCategories) {
    const slug = toSlug(catName);
    const doc = await sanityClient.create({
      _type: "articleCategory",
      name: catName,
      slug: { _type: "slug", current: slug },
    });
    categoryMap[catName] = doc._id;
    console.log(`  Created category: ${catName}`);
  }

  // 3. Create listing categories
  console.log("\n--- Creating listing categories ---");
  const placeCategories = [...new Set(places.flatMap((p) => p.categories))];
  const listingCategoryMap: Record<string, string> = {};

  for (const catName of placeCategories) {
    const slug = toSlug(catName);
    const doc = await sanityClient.create({
      _type: "listingCategory",
      name: catName,
      slug: { _type: "slug", current: slug },
    });
    listingCategoryMap[catName] = doc._id;
    console.log(`  Created listing category: ${catName}`);
  }

  // 4. Create venues
  console.log("\n--- Creating venues ---");
  const venueMap: Record<string, string> = {}; // title -> _id

  for (const v of venues) {
    const doc = await sanityClient.create({
      _type: "venue",
      title: v.title,
      slug: { _type: "slug", current: toSlug(v.slug || v.title) },
      description: htmlToPortableText(v.content),
      street: v.meta.geodir_street || undefined,
      town: v.meta.geodir_city || "Langport",
      postcode: v.meta.geodir_zip || undefined,
      phone: v.meta.geodir_phone || undefined,
      email: v.meta.geodir_email || undefined,
      website: v.meta.geodir_website || undefined,
      status: "active",
      ...(v.meta.geodir_latitude && v.meta.geodir_longitude
        ? { coordinates: { _type: "geopoint", lat: parseFloat(v.meta.geodir_latitude), lng: parseFloat(v.meta.geodir_longitude) } }
        : {}),
    });
    venueMap[v.title.toLowerCase()] = doc._id;
    console.log(`  Created venue: ${v.title}`);
  }

  // 5. Create events
  console.log("\n--- Creating events ---");
  for (const ev of events) {
    const venueName = ev.meta.geodir_venue?.toLowerCase() || "";
    const venueRef = venueMap[venueName] || Object.values(venueMap)[0];

    await sanityClient.create({
      _type: "event",
      title: ev.title,
      slug: { _type: "slug", current: toSlug(ev.slug || ev.title) },
      description: htmlToPortableText(ev.content),
      date: ev.meta.geodir_event_dates ? new Date(ev.meta.geodir_event_dates).toISOString() : new Date(ev.postDate).toISOString(),
      venue: venueRef ? { _type: "reference", _ref: venueRef } : undefined,
      status: "published",
      tags: ev.tags,
    });
    console.log(`  Created event: ${ev.title}`);
  }

  // 6. Create business listings
  console.log("\n--- Creating business listings ---");
  for (const place of places) {
    const catRef = place.categories[0] ? listingCategoryMap[place.categories[0]] : undefined;

    await sanityClient.create({
      _type: "businessListing",
      title: place.title,
      slug: { _type: "slug", current: toSlug(place.slug || place.title) },
      description: htmlToPortableText(place.content),
      street: place.meta.geodir_street || undefined,
      town: place.meta.geodir_city || "Langport",
      postcode: place.meta.geodir_zip || undefined,
      phone: place.meta.geodir_phone || undefined,
      email: place.meta.geodir_email || undefined,
      website: place.meta.geodir_website || undefined,
      category: catRef ? { _type: "reference", _ref: catRef } : undefined,
      tags: place.tags,
      status: "published",
      ...(place.meta.geodir_latitude && place.meta.geodir_longitude
        ? { coordinates: { _type: "geopoint", lat: parseFloat(place.meta.geodir_latitude), lng: parseFloat(place.meta.geodir_longitude) } }
        : {}),
    });
    console.log(`  Created listing: ${place.title}`);
  }

  // 7. Create pages
  console.log("\n--- Creating pages ---");
  for (const page of pages) {
    await sanityClient.create({
      _type: "page",
      title: page.title,
      slug: { _type: "slug", current: toSlug(page.slug || page.title) },
      content: htmlToPortableText(page.content),
      published: true,
    });
    console.log(`  Created page: ${page.title}`);
  }

  // 8. Create articles (+ council members from profile posts)
  console.log("\n--- Creating articles and council members ---");
  for (const post of posts) {
    const catSlugs = post.categories.map((c: string) => toSlug(c));

    // Check if this is a councillor profile
    if (catSlugs.some((s: string) => COUNCILLOR_CATEGORIES.includes(s))) {
      await sanityClient.create({
        _type: "councilMember",
        name: post.title,
        slug: { _type: "slug", current: toSlug(post.slug || post.title) },
        biography: htmlToPortableText(post.content),
        role: "councillor",
      });
      console.log(`  Created council member: ${post.title}`);
      continue;
    }

    // Regular article
    const catRef = post.categories[0] ? categoryMap[post.categories[0]] : undefined;

    await sanityClient.create({
      _type: "article",
      title: post.title,
      slug: { _type: "slug", current: toSlug(post.slug || post.title) },
      content: htmlToPortableText(post.content),
      excerpt: post.excerpt || undefined,
      category: catRef ? { _type: "reference", _ref: catRef } : undefined,
      tags: post.tags,
      author: post.creator || undefined,
      published: true,
      publishedAt: post.pubDate ? new Date(post.pubDate).toISOString() : new Date(post.postDate).toISOString(),
    });
    console.log(`  Created article: ${post.title}`);
  }

  // 9. Create council documents from posts
  console.log("\n--- Creating council documents from posts ---");
  for (const post of posts) {
    const catSlugs = post.categories.map((c: string) => toSlug(c));

    if (!catSlugs.some((s: string) => COUNCIL_DOCUMENT_CATEGORIES.includes(s))) continue;

    // Find attachments for this post
    const postAttachments = attachments.filter((att) => att.postId === post.postId);

    for (const att of postAttachments) {
      if (!att.attachmentUrl) continue;

      // Determine document type from category or title
      let documentType = "other";
      if (catSlugs.includes("agendas") || post.title.toLowerCase().includes("agenda")) documentType = "agenda";
      else if (catSlugs.includes("minutes") || post.title.toLowerCase().includes("minute")) documentType = "minutes";
      else if (catSlugs.includes("policies") || post.title.toLowerCase().includes("polic")) documentType = "policy";
      else if (catSlugs.includes("agm") || post.title.toLowerCase().includes("agm")) documentType = "agm";
      else if (catSlugs.includes("financial") || post.title.toLowerCase().includes("financial") || post.title.toLowerCase().includes("budget")) documentType = "financial";

      // Parse date from title or use post date
      let docDate = post.postDate;
      const dateMatch = post.title.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) docDate = dateMatch[1];

      // Upload file
      const filename = att.attachmentUrl.split("/").pop() || "file";
      const tmpPath = join(tmpdir(), filename);
      await downloadFile(att.attachmentUrl, tmpPath);
      const asset = await uploadToSanity(tmpPath, filename);

      await sanityClient.create({
        _type: "councilDocument",
        title: post.title,
        slug: { _type: "slug", current: toSlug(post.slug || post.title) },
        documentType,
        date: new Date(docDate).toISOString().split('T')[0],
        description: htmlToPortableText(post.content),
        file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
        visibility: "public",
        tags: post.tags,
      });
      console.log(`  Created council document: ${post.title}`);
    }

    // If no attachments but has content, create with htmlContent
    if (postAttachments.length === 0 && post.content) {
      let documentType = "other";
      const catSlugs = post.categories.map((c: string) => toSlug(c));
      if (catSlugs.includes("agendas") || post.title.toLowerCase().includes("agenda")) documentType = "agenda";
      else if (catSlugs.includes("minutes") || post.title.toLowerCase().includes("minute")) documentType = "minutes";
      else if (catSlugs.includes("policies") || post.title.toLowerCase().includes("polic")) documentType = "policy";

      let docDate = post.postDate;
      const dateMatch = post.title.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) docDate = dateMatch[1];

      await sanityClient.create({
        _type: "councilDocument",
        title: post.title,
        slug: { _type: "slug", current: toSlug(post.slug || post.title) },
        documentType,
        date: new Date(docDate).toISOString().split('T')[0],
        htmlContent: htmlToPortableText(post.content),
        visibility: "public",
        tags: post.tags,
      });
      console.log(`  Created council document (no file): ${post.title}`);
    }
  }

  // 9.5. Extract council documents from page content
  console.log("\n--- Extracting council documents from pages ---");
  for (const page of pages) {
    // Check if this page contains council documents (based on slug or title)
    const slug = page.slug || "";
    const title = page.title || "";
    const isCouncilPage = slug.includes('council') || slug.includes('agendas') || slug.includes('minutes') ||
                         title.toLowerCase().includes('council') || title.toLowerCase().includes('agendas') || title.toLowerCase().includes('minutes');

    if (!isCouncilPage) continue;

    console.log(`  Processing page: ${page.title}`);

    // Extract document links from page content
    const documents = extractDocumentLinks(page.content);

    for (const doc of documents) {
      try {
        // Download the document
        const filename = doc.url.split("/").pop() || "document.pdf";
        const tmpPath = join(tmpdir(), filename);
        await downloadFile(doc.url, tmpPath);

        // Upload to Sanity
        const asset = await uploadToSanity(tmpPath, filename);

        // Determine document type
        const documentType = determineDocumentType(doc.title);

        // Create document record
        await sanityClient.create({
          _type: "councilDocument",
          title: doc.title,
          slug: { _type: "slug", current: toSlug(doc.title) },
          documentType,
          date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: [{ _type: "block", _key: Math.random().toString(36).slice(2, 10), style: "normal", markDefs: [], children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 10), text: `Document from ${page.title}`, marks: [] }] }],
          file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
          visibility: "public",
          tags: [`from-page-${toSlug(page.title)}`],
        });

        console.log(`    Created document: ${doc.title}`);
      } catch (error) {
        console.error(`    Failed to process document ${doc.title}:`, (error as Error).message);
      }
    }
  }

  // 10. Create historic sites (shells for the 4 key sites)
  console.log("\n--- Creating historic site shells ---");
  const historicSites = [
    { title: "Hanging Chapel", slug: "hanging-chapel" },
    { title: "Great Bow Bridge", slug: "great-bow-bridge" },
    { title: "Town Hall", slug: "town-hall" },
    { title: "Church of All Saints", slug: "church-of-all-saints" },
  ];

  for (const site of historicSites) {
    await sanityClient.create({
      _type: "historicSite",
      title: site.title,
      slug: { _type: "slug", current: site.slug },
      openToPublic: true,
    });
    console.log(`  Created historic site: ${site.title}`);
  }

  console.log("\n=== Migration complete! ===");
  console.log("Next steps:");
  console.log("1. Review content in Sanity Studio (/studio)");
  console.log("2. Fill in historic site details");
  console.log("3. Verify media references and council documents");
  console.log("4. Check categories and tags");
}

// Run
const xmlPath = process.argv[2];
if (!xmlPath) {
  console.error("Usage: npx tsx lib/wordpress-migration.ts <path-to-xml>");
  process.exit(1);
}

migrate(xmlPath).catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
