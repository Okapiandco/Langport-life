import { defineField, defineType } from "sanity";

/**
 * A short-lived note from the Studio asking the server to email an edit link.
 *
 * It exists because the Studio runs in the editor's browser and cannot reach
 * Neon or Resend. Writing this document is itself the proof of authority: the
 * dataset is public to read but writable only with a token, so only a signed-in
 * editor can create one. The server reads it, sends the link, and deletes it.
 */
export const editLinkRequest = defineType({
  name: "editLinkRequest",
  title: "Edit Link Request",
  type: "document",
  // Housekeeping only — never created or edited by hand
  __experimental_omnisearch_visibility: false,
  fields: [
    defineField({ name: "targetId", title: "Listing ID", type: "string" }),
    defineField({ name: "targetType", title: "Listing type", type: "string" }),
    defineField({ name: "email", title: "Send to", type: "string" }),
    defineField({ name: "recipientName", title: "Recipient name", type: "string" }),
    defineField({ name: "requestedAt", title: "Requested at", type: "datetime" }),
  ],
  preview: {
    select: { title: "email", subtitle: "targetId" },
  },
});
