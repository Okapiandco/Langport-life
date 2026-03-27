import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

// Singleton types that should not appear in "Create new document" menu
const singletonTypes = new Set(["siteSettings", "navigation"]);

export default defineConfig({
  name: "langport-life",
  title: "Langport Life",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action &&
              ["publish", "discardChanges", "restore"].includes(action)
          )
        : input,
  },
  basePath: "/studio",
});
