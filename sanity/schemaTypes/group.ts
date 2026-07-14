import { defineField, defineType } from "sanity";

export const group = defineType({
  name: "group",
  title: "Group",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "location",
      title: "Where",
      type: "string",
      description: "Where the group meets (e.g. \"Langport Town Hall, main room\").",
    }),
    defineField({
      name: "meetingTime",
      title: "When",
      type: "string",
      description: "When the group meets (e.g. \"Every Tuesday, 7pm – 9pm\").",
    }),
    defineField({
      name: "cost",
      title: "Cost",
      type: "string",
      description: "Cost to attend (e.g. \"Free\" or \"£5 per session\").",
    }),
    defineField({
      name: "organiser",
      title: "Organiser",
      type: "string",
      description: "Name of the person or organisation that runs the group.",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "e.g. sport, arts, wellbeing, social",
    }),
    defineField({
      name: "submittedBy",
      title: "Submitted By",
      type: "string",
      description: "Name / email of the person who submitted this group.",
      readOnly: true,
    }),
    defineField({
      name: "contactName",
      title: "Contact Name",
      type: "string",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone (optional)",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "linkedEvent",
      title: "Linked Calendar Event",
      type: "reference",
      to: [{ type: "event" }],
      description:
        "Link to a recurring event that represents this group's regular meetings. Once set, upcoming sessions will appear on the group's page and in the What's On calendar.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "editToken",
      title: "Edit Token",
      type: "string",
      description: "Unique token for the submitter's magic edit link. Do not share.",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "location",
      status: "status",
      media: "image",
    },
    prepare({ title, subtitle, status, media }) {
      const statusLabel =
        status === "approved" ? "" : ` — ${status ?? "pending"}`;
      return {
        title,
        subtitle: `${subtitle || ""}${statusLabel}`.trim() || statusLabel.replace(/^ — /, ""),
        media,
      };
    },
  },
});
