import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
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
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "date",
      title: "Start Date & Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End Date & Time",
      type: "datetime",
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
      name: "venue",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      options: {
        list: [
          { title: "Meeting", value: "meeting" },
          { title: "Social", value: "social" },
          { title: "Workshop", value: "workshop" },
          { title: "Market", value: "market" },
          { title: "Performance", value: "performance" },
          { title: "Community", value: "community" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "organiser",
      title: "Organiser",
      type: "string",
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
      title: "Contact Phone",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Pending Approval", value: "pendingApproval" },
          { title: "Published", value: "published" },
          { title: "Rejected", value: "rejected" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "isFree",
      title: "Is this event free?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "accessibilityInfo",
      title: "Accessibility Information",
      type: "text",
    }),
    defineField({
      name: "maxAttendees",
      title: "Max Attendees",
      type: "number",
    }),
    defineField({
      name: "ticketsUrl",
      title: "Tickets URL",
      type: "url",
    }),
    defineField({
      name: "submittedBy",
      title: "Submitted By",
      type: "reference",
      to: [{ type: "siteUser" }],
    }),
    defineField({
      name: "approvedBy",
      title: "Approved By",
      type: "reference",
      to: [{ type: "siteUser" }],
    }),
    defineField({
      name: "approvedAt",
      title: "Approved At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      venue: "venue.title",
      media: "image",
    },
    prepare({ title, date, venue, media }) {
      return {
        title,
        subtitle: `${venue || "No venue"} — ${date ? new Date(date).toLocaleDateString() : "No date"}`,
        media,
      };
    },
  },
});
