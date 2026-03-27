import { defineField, defineType } from "sanity";

export const submission = defineType({
  name: "submission",
  title: "Submission",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Submission Type",
      type: "string",
      options: {
        list: [
          { title: "Event", value: "event" },
          { title: "Business Listing", value: "listing" },
          { title: "Venue", value: "venue" },
        ],
      },
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending Review", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
    }),

    // Submitter contact
    defineField({
      name: "submitterName",
      title: "Submitter Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submitterEmail",
      title: "Submitter Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submitterPhone",
      title: "Submitter Phone",
      type: "string",
    }),

    // The actual submitted data (stored as JSON-like object)
    defineField({
      name: "title",
      title: "Submitted Title",
      type: "string",
      description: "Event name, business name, or venue name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 6,
    }),

    // Event-specific
    defineField({
      name: "eventDate",
      title: "Event Date",
      type: "datetime",
      hidden: ({ parent }) => parent?.type !== "event",
    }),
    defineField({
      name: "eventEndDate",
      title: "Event End Date",
      type: "datetime",
      hidden: ({ parent }) => parent?.type !== "event",
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
      hidden: ({ parent }) => parent?.type !== "event",
    }),
    defineField({
      name: "eventVenue",
      title: "Venue",
      type: "string",
      description: "Name of the venue (clerk will link to actual venue record)",
      hidden: ({ parent }) => parent?.type !== "event",
    }),
    defineField({
      name: "eventIsFree",
      title: "Is this event free?",
      type: "boolean",
      initialValue: true,
      hidden: ({ parent }) => parent?.type !== "event",
    }),
    defineField({
      name: "ticketsUrl",
      title: "Tickets URL",
      type: "url",
      hidden: ({ parent }) => parent?.type !== "event",
    }),
    defineField({
      name: "organiser",
      title: "Organiser",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "event",
    }),

    // Listing / venue shared fields
    defineField({
      name: "street",
      title: "Street Address",
      type: "string",
      hidden: ({ parent }) => parent?.type === "event",
    }),
    defineField({
      name: "town",
      title: "Town",
      type: "string",
      initialValue: "Langport",
      hidden: ({ parent }) => parent?.type === "event",
    }),
    defineField({
      name: "postcode",
      title: "Postcode",
      type: "string",
      hidden: ({ parent }) => parent?.type === "event",
    }),
    defineField({
      name: "phone",
      title: "Business/Venue Phone",
      type: "string",
      hidden: ({ parent }) => parent?.type === "event",
    }),
    defineField({
      name: "email",
      title: "Business/Venue Email",
      type: "string",
      hidden: ({ parent }) => parent?.type === "event",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      hidden: ({ parent }) => parent?.type === "event",
    }),

    // Admin notes
    defineField({
      name: "clerkNotes",
      title: "Clerk Notes",
      type: "text",
      rows: 4,
      description: "Internal notes — not shown to the submitter",
    }),
    defineField({
      name: "rejectionReason",
      title: "Rejection Reason",
      type: "text",
      rows: 3,
      description: "If rejected, why? This can be emailed to the submitter",
      hidden: ({ parent }) => parent?.status !== "rejected",
    }),

    // Reference to the created document (set when approved)
    defineField({
      name: "createdDocument",
      title: "Created Document",
      type: "reference",
      to: [
        { type: "event" },
        { type: "businessListing" },
        { type: "venue" },
      ],
      description: "Links to the actual document created from this submission",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      status: "status",
      submitter: "submitterName",
    },
    prepare({ title, type, status, submitter }) {
      const statusIcon: Record<string, string> = {
        pending: "🟡",
        approved: "✅",
        rejected: "❌",
      };
      const typeLabels: Record<string, string> = {
        event: "Event",
        listing: "Business",
        venue: "Venue",
      };
      return {
        title: `${statusIcon[status] || "⚪"} ${title}`,
        subtitle: `${typeLabels[type] || type} from ${submitter || "Unknown"}`,
      };
    },
  },
});
