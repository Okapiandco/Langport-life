import "server-only";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./sanity";

// Write-enabled client. Lives in its own server-only module so it can never be
// pulled into a client bundle — importing it from a "use client" file is a
// build error rather than a silent token exposure.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
