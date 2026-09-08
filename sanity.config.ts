import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { CheckmarkCircleIcon, HelpCircleIcon, UploadIcon } from "@sanity/icons";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { ApprovalsTool } from "./sanity/tools/ApprovalsTool";
import { BulkUploadTool } from "./sanity/tools/BulkUploadTool";
import { HelpTool } from "./sanity/tools/HelpTool";

// Singleton types that should not appear in "Create new document" menu
const singletonTypes = new Set(["siteSettings", "navigation"]);

export default defineConfig({
  name: "langport-life",
  title: "Langport Life",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8ecf405k",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({ structure }),
    // Vision is a raw GROQ console — dev convenience only
    ...(process.env.NODE_ENV !== "production" ? [visionTool()] : []),
  ],
  tools: (prev) => [
    {
      name: "approvals",
      title: "Approvals",
      icon: CheckmarkCircleIcon,
      component: ApprovalsTool,
    },
    {
      name: "bulk-upload",
      title: "Bulk Upload",
      icon: UploadIcon,
      component: BulkUploadTool,
    },
    {
      name: "how-to",
      title: "How To",
      icon: HelpCircleIcon,
      component: HelpTool,
    },
    ...prev,
  ],
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
