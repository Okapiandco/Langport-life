import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "langport-life",
  title: "Langport Life",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
  basePath: "/studio",
  auth: {
    token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  },
});
