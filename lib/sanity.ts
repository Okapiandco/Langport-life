import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

type SanityImageSource = any;

// Fallback to the known project id (as sanity.config.ts does) so builds in
// environments without the env var set (e.g. Vercel Preview) don't throw
// "Configuration must contain `projectId`" at module load.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
