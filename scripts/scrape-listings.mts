/**
 * Scrape business listings from old site and update Sanity.
 * Run with: SANITY_API_TOKEN=xxx npx tsx scripts/scrape-listings.mts
 */
import { createClient } from "next-sanity";

const sanity = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const URLS = [
  "https://langport.life/directory/harrys-cider-company/",
  "https://langport.life/directory/huish-episcopi-leisure-centre/",
  "https://langport.life/directory/wild-rose-holistic-centre-and-art-gallery/",
  "https://langport.life/directory/the-old-bank/",
  "https://langport.life/directory/the-lodge-old-kelways/",
  "https://langport.life/directory/the-hanging-gallery/",
  "https://langport.life/directory/the-black-swan/",
  "https://langport.life/directory/the-angel/",
  "https://langport.life/directory/sweet-liberty-belle/",
  "https://langport.life/directory/sutton-upholsterers/",
  "https://langport.life/directory/sticks-stones/",
  "https://langport.life/directory/st-margarets-hospice-shop/",
  "https://langport.life/directory/south-somerset-district-council/",
  "https://langport.life/directory/luke-penketh-design/",
  "https://langport.life/directory/the-rose-crown-inn-elis/",
  "https://langport.life/directory/overthrow-traditional-sieve-and-riddle-makers/",
  "https://langport.life/directory/somerset-and-avon-police/",
  "https://langport.life/directory/smith-cottages-langport/",
  "https://langport.life/directory/smith-and-evans-wine/",
  "https://langport.life/directory/slade-house/",
  "https://langport.life/directory/bere-cider/",
  "https://langport.life/directory/sjh-carpets-and-flooring/",
  "https://langport.life/directory/art-tea-zen/",
  "https://langport.life/directory/shires-garage-and-auto-services/",
  "https://langport.life/directory/langport-leveller/",
  "https://langport.life/directory/a-joy-to-groom/",
  "https://langport.life/directory/langport-counselling-practice/",
  "https://langport.life/directory/thorney-lakes-caravan-camping-park/",
  "https://langport.life/directory/greenslade-taylor-hunt/",
  "https://langport.life/directory/withy-cottages-self-catering-holidays/",
  "https://langport.life/directory/langport-arms-hotel/",
  "https://langport.life/directory/brainwave/",
  "https://langport.life/directory/langport-veterinary-centre/",
  "https://langport.life/directory/seed-factory/",
  "https://langport.life/directory/beeline-bookkeeping/",
  "https://langport.life/directory/r-j-business-solutions/",
  "https://langport.life/directory/portcullis-end-cottage/",
  "https://langport.life/directory/parrett-deli-dine/",
  "https://langport.life/directory/nv-health-fitness/",
  "https://langport.life/directory/pendras-fish-chip-shop/",
  "https://langport.life/directory/langport-clocks/",
  "https://langport.life/directory/parrett-trail-bikes/",
  "https://langport.life/directory/bow-house-physiotherapy-practice/",
  "https://langport.life/directory/welcome-to-milo-jones/",
  "https://langport.life/directory/heartwood/",
  "https://langport.life/directory/lucy-jorge-hair-and-beauty/",
  "https://langport.life/directory/little-bakery/",
  "https://langport.life/directory/the-great-bow-wharf/",
  "https://langport.life/directory/langport-youth-club/",
  "https://langport.life/directory/granary-barn-bed-breakfast/",
  "https://langport.life/directory/koleman-creative-picture-framing/",
  "https://langport.life/directory/kitchen-at-the-wharf/",
  "https://langport.life/directory/gosh-group-properties/",
  "https://langport.life/directory/kelways/",
  "https://langport.life/directory/hurds-hill/",
  "https://langport.life/directory/huish-episcopi-academy/",
  "https://langport.life/directory/helping-hands-sw/",
  "https://langport.life/directory/helen-izzard/",
  "https://langport.life/directory/george-james-properties/",
  "https://langport.life/directory/fosters-newsagents/",
  "https://langport.life/directory/flagstone-restoration/",
  "https://langport.life/directory/ellis-pottery-of-high-ham/",
  "https://langport.life/directory/diana-c-taylor-f-m-a-a-t/",
  "https://langport.life/directory/david-neal-dental/",
  "https://langport.life/directory/cracknells-farm/",
  "https://langport.life/directory/costgard/",
  "https://langport.life/directory/clive-miller-associates/",
  "https://langport.life/directory/chalmers-co-chartered-accountants/",
  "https://langport.life/directory/cardamom-indian-restaurant/",
  "https://langport.life/directory/bill-bradshaw-photography/",
  "https://langport.life/directory/bibic/",
  "https://langport.life/directory/all-saints-churchyard/",
  "https://langport.life/directory/langport-cemetary/",
  "https://langport.life/directory/huish-episcopi-langport-cricket-club/",
  "https://langport.life/directory/langport-surgery/",
  "https://langport.life/directory/village-agents/",
  "https://langport.life/directory/huish-episcopy-primary-school/",
  "https://langport.life/directory/the-levels-childrens-play-centre/",
  "https://langport.life/directory/langport-library/",
  "https://langport.life/directory/repera/",
];

// Simple HTML text extractor
function extractText(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

async function scrapeListing(url: string): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract structured data from GeoDirectory markup
    const title = extractText(html, /<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([^<]+)/i)
      || extractText(html, /<title>([^<|]+)/i);

    // Look for JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let structured: Record<string, unknown> = {};
    if (jsonLdMatch) {
      try {
        structured = JSON.parse(jsonLdMatch[1]);
      } catch { /* ignore */ }
    }

    // Extract from meta and visible content
    const phone = extractText(html, /href="tel:([^"]+)"/i)
      || (structured as { telephone?: string }).telephone || "";
    const email = extractText(html, /href="mailto:([^"]+)"/i) || "";
    const website = extractText(html, /class="[^"]*geodir-i-website[^"]*"[^>]*><a[^>]+href="([^"]+)"/i) || "";

    // Address from structured data or HTML
    const addr = (structured as { address?: { streetAddress?: string; addressLocality?: string; postalCode?: string } }).address;
    const street = addr?.streetAddress || extractText(html, /street-address[^>]*>([^<]+)/i) || "";
    const town = addr?.addressLocality || extractText(html, /locality[^>]*>([^<]+)/i) || "";
    const postcode = addr?.postalCode || extractText(html, /postal-code[^>]*>([^<]+)/i) || "";

    // Description
    const descMatch = html.match(/class="[^"]*geodir-post-meta-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500) : "";

    return {
      title: title.trim(),
      phone: phone.replace(/\s+/g, " ").trim(),
      email: email.trim(),
      website: website.trim(),
      street: street.trim(),
      town: town.trim(),
      postcode: postcode.trim(),
      description: description.trim(),
      url,
    };
  } catch (e) {
    console.error(`  Error scraping ${url}:`, (e as Error).message);
    return null;
  }
}

async function run() {
  console.log(`📡 Scraping ${URLS.length} listings from old site...\n`);

  // Get existing listings from Sanity
  const existing = await sanity.fetch('*[_type == "businessListing"]{ _id, title }');
  console.log(`Existing Sanity listings: ${existing.length}\n`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    console.log(`[${i + 1}/${URLS.length}] Scraping: ${url.split("/directory/")[1]?.replace("/", "")}`);

    const data = await scrapeListing(url);
    if (!data || !data.title) {
      console.log("  ⏭️  No data found");
      skipped++;
      continue;
    }

    // Match to existing Sanity listing by title (fuzzy)
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = existing.find(
      (e: { title: string }) =>
        normalise(e.title) === normalise(data.title) ||
        normalise(e.title).includes(normalise(data.title)) ||
        normalise(data.title).includes(normalise(e.title))
    );

    const updates: Record<string, string | undefined> = {};
    if (data.phone) updates.phone = data.phone;
    if (data.email) updates.email = data.email;
    if (data.website) updates.website = data.website;
    if (data.street) updates.street = data.street;
    if (data.town) updates.town = data.town;
    if (data.postcode) updates.postcode = data.postcode;

    if (match && Object.keys(updates).length > 0) {
      await sanity.patch(match._id).set(updates).commit();
      console.log(`  ✅ Updated: ${data.title} (${Object.keys(updates).join(", ")})`);
      updated++;
    } else if (!match) {
      // Create new listing
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await sanity.create({
        _type: "businessListing",
        title: data.title,
        slug: { _type: "slug", current: slug },
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        street: data.street || undefined,
        town: data.town || "Langport",
        postcode: data.postcode || undefined,
        status: "published",
      });
      console.log(`  🆕 Created: ${data.title}`);
      updated++;
    } else {
      console.log(`  ⏭️  No new contact data for: ${data.title}`);
      skipped++;
    }

    // Small delay to be nice to the old server
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n🎉 Done! Updated/created: ${updated}, Skipped: ${skipped}`);
}

run().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
