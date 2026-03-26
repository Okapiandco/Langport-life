import { createClient } from "@sanity/client";
import { readFileSync, createWriteStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import https from "https";
import http from "http";

const TOKEN = "sk6AyMMvgh8jRzDeT6yXpmSXhoby9B6Go7vvjuRzEK9aBZXbpqDuaqE4wAVYGbY5rEiQc8ueyfllNLpSXAHR727vKPB5qqUwHHvFWMudOiWlFE9Jd1A5kTSi9NYx98yD3CafZ7WyrUPlTZUsBkMFA0FO5ht4nJjMi1rInUgw26jV4iSUh06o";

const sanityClient = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: TOKEN,
  useCdn: false,
});

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainRegex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
  const plainMatch = plainRegex.exec(xml);
  return plainMatch ? plainMatch[1].trim() : "";
}

function htmlToPortableText(html: string): any[] {
  if (!html) return [];
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ")
    .trim();
  if (!text) return [];
  return text.split(/\n\n+/).filter(Boolean).map((para) => ({
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 10), text: para.trim(), marks: [] }],
  }));
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 96);
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) { downloadFile(redirectUrl, dest).then(resolve).catch(reject); return; }
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

function parseWPXml(xmlContent: string) {
  const items: any[] = [];
  // Use string splitting instead of regex to avoid catastrophic backtracking on large files
  const parts = xmlContent.split("<item>");
  for (let i = 1; i < parts.length; i++) {
    const endIdx = parts[i].indexOf("</item>");
    if (endIdx === -1) continue;
    const itemXml = parts[i].substring(0, endIdx);
    const item: any = {
      title: extractTag(itemXml, "title"),
      link: extractTag(itemXml, "link"),
      pubDate: extractTag(itemXml, "pubDate"),
      creator: extractTag(itemXml, "dc:creator"),
      description: extractTag(itemXml, "description"),
      content: extractTag(itemXml, "content:encoded"),
      excerpt: extractTag(itemXml, "excerpt:encoded"),
      postId: extractTag(itemXml, "wp:post_id"),
      postDate: extractTag(itemXml, "wp:post_date"),
      postType: extractTag(itemXml, "wp:post_type"),
      postStatus: extractTag(itemXml, "wp:status"),
      slug: extractTag(itemXml, "wp:post_name"),
      attachmentUrl: extractTag(itemXml, "wp:attachment_url"),
      categories: [] as string[],
      tags: [] as string[],
      meta: {} as Record<string, string>,
    };

    const catRegex = /<category domain="(category|post_tag|gd_placecategory|gd_place_tags)" nicename="([^"]*)"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(itemXml)) !== null) {
      if (catMatch[1] === "category" || catMatch[1] === "gd_placecategory") {
        item.categories.push(catMatch[3]);
      } else {
        item.tags.push(catMatch[3]);
      }
    }

    const metaParts = itemXml.split("<wp:postmeta>");
    for (let m = 1; m < metaParts.length; m++) {
      const keyMatch = metaParts[m].match(/<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>/);
      const valMatch = metaParts[m].match(/<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
      if (keyMatch && valMatch) item.meta[keyMatch[1]] = valMatch[2];
    }

    items.push(item);
  }
  return items;
}

const COUNCILLOR_CATEGORIES = ["councillors", "personal-profiles"];

async function migrate(xmlPath: string) {
  console.log("Reading WordPress XML export...");
  const xmlContent = readFileSync(xmlPath, "utf-8");

  console.log("Parsing XML...");
  const allItems = parseWPXml(xmlContent);
  console.log(`Found ${allItems.length} items total`);

  const posts = allItems.filter((i) => i.postType === "post" && i.postStatus === "publish");
  const pages = allItems.filter((i) => i.postType === "page" && i.postStatus === "publish");
  const places = allItems.filter((i) => i.postType === "gd_place" && i.postStatus === "publish");
  const venues = allItems.filter((i) => i.postType === "gd_venue" && i.postStatus === "publish");
  const events = allItems.filter((i) => i.postType === "gd_event" && i.postStatus === "publish");
  const attachments = allItems.filter((i) => i.postType === "attachment");

  console.log(`Posts: ${posts.length}, Pages: ${pages.length}, Places: ${places.length}, Venues: ${venues.length}, Events: ${events.length}, Attachments: ${attachments.length}`);

  // Skip media upload — already done in previous run
  console.log("\n--- Skipping media upload (already completed) ---");
  const mediaCount = 0;

  // 2. Create article categories
  console.log("\n--- Creating article categories ---");
  const uniqueCategories = [...new Set(posts.flatMap((p) => p.categories))];
  const categoryMap: Record<string, string> = {};
  for (const catName of uniqueCategories) {
    const doc = await sanityClient.create({ _type: "articleCategory", name: catName, slug: { _type: "slug", current: toSlug(catName) } });
    categoryMap[catName] = doc._id;
    console.log(`  Created: ${catName}`);
  }

  // 3. Create listing categories
  console.log("\n--- Creating listing categories ---");
  const placeCategories = [...new Set(places.flatMap((p) => p.categories))];
  const listingCategoryMap: Record<string, string> = {};
  for (const catName of placeCategories) {
    const doc = await sanityClient.create({ _type: "listingCategory", name: catName, slug: { _type: "slug", current: toSlug(catName) } });
    listingCategoryMap[catName] = doc._id;
    console.log(`  Created: ${catName}`);
  }

  // 4. Create venues
  console.log("\n--- Creating venues ---");
  const venueMap: Record<string, string> = {};
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
    console.log(`  Created: ${v.title}`);
  }

  // 5. Create events
  console.log("\n--- Creating events ---");
  for (const ev of events) {
    const venueName = (ev.meta.geodir_venue || "").toLowerCase();
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
    console.log(`  Created: ${ev.title}`);
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
    console.log(`  Created: ${place.title}`);
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
    console.log(`  Created: ${page.title}`);
  }

  // 8. Create articles and council members
  console.log("\n--- Creating articles and council members ---");
  for (const post of posts) {
    const catSlugs = post.categories.map((c: string) => toSlug(c));
    if (catSlugs.some((s: string) => COUNCILLOR_CATEGORIES.includes(s))) {
      await sanityClient.create({
        _type: "councilMember",
        name: post.title,
        slug: { _type: "slug", current: toSlug(post.slug || post.title) },
        biography: htmlToPortableText(post.content),
        role: "councillor",
      });
      console.log(`  Council member: ${post.title}`);
      continue;
    }
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
    console.log(`  Article: ${post.title}`);
  }

  // 9. Historic sites
  console.log("\n--- Creating historic site shells ---");
  for (const site of [
    { title: "Hanging Chapel", slug: "hanging-chapel" },
    { title: "Great Bow Bridge", slug: "great-bow-bridge" },
    { title: "Town Hall", slug: "town-hall" },
    { title: "Church of All Saints", slug: "church-of-all-saints" },
  ]) {
    await sanityClient.create({ _type: "historicSite", title: site.title, slug: { _type: "slug", current: site.slug }, openToPublic: true });
    console.log(`  Created: ${site.title}`);
  }

  console.log("\n=== Migration complete! ===");
  console.log(`Summary: ${posts.length} posts, ${pages.length} pages, ${places.length} listings, ${venues.length} venues, ${events.length} events, ${mediaCount} media files`);
}

const xmlPath = process.argv[2] || "C:/Users/jim/Downloads/langportlife.WordPress.2026-03-25.xml";
migrate(xmlPath).catch((err) => { console.error("Migration failed:", err.message || err); process.exit(1); });
