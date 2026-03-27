/**
 * Upload local images to Sanity and link them to activity documents.
 * Run with: SANITY_API_TOKEN=xxx npx tsx scripts/upload-images.mts
 */
import { createClient } from "next-sanity";
import { createReadStream } from "fs";
import { resolve } from "path";

const client = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const imgDir = resolve("public/things-to-do");

async function uploadImage(filename: string, altText: string) {
  const filePath = resolve(imgDir, filename);
  console.log(`  Uploading ${filename}...`);
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename,
  });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
    alt: altText,
  };
}

async function uploadGalleryImage(filename: string, altText: string) {
  const img = await uploadImage(filename, altText);
  return { ...img, _key: Math.random().toString(36).slice(2, 10) };
}

async function run() {
  console.log("📸 Uploading images to Sanity...\n");

  // Get all activities
  const activities = await client.fetch(
    '*[_type == "activity"]{ _id, title, slug }'
  );

  // Map slug to image file + gallery
  const imageMap: Record<string, { hero: string; heroAlt: string; gallery?: { file: string; alt: string }[] }> = {
    "exploring-the-wild": {
      hero: "explore-wild.jpg",
      heroAlt: "Wildlife and nature on the Somerset Levels",
      gallery: [
        { file: "levels-3878.jpg", alt: "Somerset Levels landscape" },
        { file: "langport-somerset.jpg", alt: "Langport and the Somerset Levels" },
        { file: "levels-3872.jpg", alt: "Wetlands on the Levels" },
        { file: "levels-3923.jpg", alt: "River and fields on the Levels" },
        { file: "levels-3939.jpg", alt: "Somerset Levels wildlife habitat" },
        { file: "levels-4001.jpg", alt: "Levels waterways" },
        { file: "levels-4099.jpg", alt: "Somerset Levels at dusk" },
      ],
    },
    "outdoor-life": { hero: "outdoor-life.jpg", heroAlt: "Outdoor activities on the River Parrett" },
    "walking-and-cycling": { hero: "walks-cycling-hero.jpg", heroAlt: "Walking and cycling on the Somerset Levels" },
    kayaking: { hero: "kayaking.jpg", heroAlt: "Kayaking on the River Parrett" },
    paddleboarding: { hero: "paddleboarding.jpg", heroAlt: "Paddleboarding on the River Parrett" },
    "wild-swimming": { hero: "wild-swimming.jpg", heroAlt: "Wild swimming in the River Parrett" },
    boating: { hero: "boating.jpg", heroAlt: "Boating on the River Parrett" },
    fishing: { hero: "fishing.jpg", heroAlt: "Fishing on the River Parrett" },
    golf: { hero: "golf.png", heroAlt: "Long Sutton Golf and Country Club" },
    cycling: { hero: "cycling.jpg", heroAlt: "Cycling on the Somerset Levels" },
    "parrett-drove-and-cocklemoor-walk": { hero: "explore-wild.jpg", heroAlt: "Parrett Drove and Cocklemoor riverside walk" },
    "muchelney-route": { hero: "muchelney.jpg", heroAlt: "Walking route to Muchelney" },
    "north-street-moor": { hero: "butterfly.jpg", heroAlt: "North Street Moor nature walk" },
    "short-town-walks": { hero: "hanging-chapel.jpg", heroAlt: "The Hanging Chapel, Langport" },
  };

  for (const activity of activities) {
    const slug = activity.slug.current;
    const mapping = imageMap[slug];
    if (!mapping) {
      console.log(`⏭️  No image mapping for "${activity.title}" (${slug})`);
      continue;
    }

    console.log(`\n🖼️  ${activity.title}`);

    // Upload hero image
    const heroImage = await uploadImage(mapping.hero, mapping.heroAlt);

    // Upload gallery if present
    let gallery;
    if (mapping.gallery?.length) {
      console.log(`  Uploading ${mapping.gallery.length} gallery images...`);
      gallery = [];
      for (const g of mapping.gallery) {
        gallery.push(await uploadGalleryImage(g.file, g.alt));
      }
    }

    // Patch the activity document
    const patch = client.patch(activity._id).set({ heroImage });
    if (gallery) {
      patch.set({ gallery });
    }
    await patch.commit();
    console.log(`  ✅ Linked to ${activity.title}`);
  }

  console.log("\n🎉 All images uploaded and linked!");
}

run().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
