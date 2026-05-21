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
    {
      title: "Date, Oldest",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
    {
      title: "Meeting Date, Newest",
      name: "meetingDateDesc",
      by: [{ field: "meetingDate", direction: "desc" }],
    },
    {
      title: "Type, then Date",
      name: "typeDate",
      by: [
        { field: "documentType", direction: "asc" },
        { field: "date", direction: "desc" },
      ],
    },
    {
      title: "Title A–Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      type: "documentType",
      date: "date",
      tags: "tags",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({ title, type, date, tags }: any) {
      const typeLabels: Record<string, string> = {
        agenda: "Agenda",
        minutes: "Minutes",
        policy: "Policy",
        decision: "Decision",
        agm: "AGM",
        financial: "Financial Report",
        other: "Other",
      };
      const committeeValues = [
        "full-council",
        "finance-personnel",
        "tourism-marketing",
        "annual-assembly",
        "joint-committee",
        "governance",
        "finance",
      ];
      const committeeLabels: Record<string, string> = {
        "full-council": "Full Council",
        "finance-personnel": "Finance & Personnel",
        "tourism-marketing": "Tourism & Marketing",
        "annual-assembly": "Annual Assembly",
        "joint-committee": "Joint Committee",
        governance: "Governance",
        finance: "Finance",
        archived: "Archived",
      };
      const committees = ((tags || []) as string[])
        .filter((t: string) => committeeValues.includes(t))
        .map((t: string) => committeeLabels[t] || t);
      return {
        title,
        subtitle: [typeLabels[type] || type, date, committees.join(", ")]
          .filter(Boolean)
          .join(" — "),
      };
    },
  },
});
