import { defineField, defineType } from "sanity";

export const councilDocument = defineType({
  name: "councilDocument",
  title: "Council Document",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "documentType",
      title: "Document Type",
      type: "string",
      options: {
        list: [
          { title: "Agenda", value: "agenda" },
          { title: "Minutes", value: "minutes" },
          { title: "Policy", value: "policy" },
          { title: "Decision", value: "decision" },
          { title: "AGM Notes", value: "agm" },
          { title: "Financial Report", value: "financial" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Document Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "meetingDate",
      title: "Meeting Date",
      type: "date",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "file",
      title: "File (PDF/Word)",
      type: "file",
      options: {
        accept: ".pdf,.doc,.docx",
      },
    }),
    defineField({
      name: "htmlContent",
      title: "Content (if not uploading file)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "visibility",
      title: "Visibility",
      type: "string",
      options: {
        list: [
          { title: "Public", value: "public" },
          { title: "Clerk Only", value: "clerksOnly" },
        ],
      },
      initialValue: "public",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [
        {
          type: "string",
          options: {
            list: [
              { title: "Full Council", value: "full-council" },
              { title: "Finance & Personnel", value: "finance-personnel" },
              { title: "Tourism & Marketing", value: "tourism-marketing" },
              { title: "Annual Assembly", value: "annual-assembly" },
              { title: "Joint Committee", value: "joint-committee" },
              { title: "Archived", value: "archived" },
              { title: "Governance", value: "governance" },
              { title: "Finance", value: "finance" },
            ],
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Date, Newest",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      type: "documentType",
      date: "date",
    },
    prepare({ title, type, date }) {
      return {
        title,
        subtitle: `${type || "Document"} — ${date || "No date"}`,
      };
    },
  },
});
