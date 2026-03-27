import { defineField, defineType } from "sanity";

export const transportOption = defineType({
  name: "transportOption",
  title: "Transport Option",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. Castle Cary, Route 54, Cocklemoor Car Park",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Transport Type",
      type: "string",
      options: {
        list: [
          { title: "Train Station", value: "train" },
          { title: "Bus Route", value: "bus" },
          { title: "Parking", value: "parking" },
          { title: "Cycling", value: "cycling" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Train-specific
    defineField({
      name: "distance",
      title: "Distance from Langport",
      type: "string",
      description: "e.g. 15 miles",
      hidden: ({ parent }) => parent?.type !== "train",
    }),
    defineField({
      name: "railLine",
      title: "Rail Line",
      type: "string",
      description: "e.g. Great Western Main Line",
      hidden: ({ parent }) => parent?.type !== "train",
    }),
    defineField({
      name: "journeyNotes",
      title: "Journey Notes",
      type: "text",
      rows: 3,
      description: "How to get from this station to Langport",
      hidden: ({ parent }) => parent?.type !== "train",
    }),

    // Bus-specific
    defineField({
      name: "routeNumber",
      title: "Route Number",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "bus",
    }),
    defineField({
      name: "operator",
      title: "Operator",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "bus",
    }),
    defineField({
      name: "routeDescription",
      title: "Route Description",
      type: "string",
      description: "e.g. Taunton → Langport → Yeovil",
      hidden: ({ parent }) => parent?.type !== "bus",
    }),
    defineField({
      name: "frequency",
      title: "Frequency",
      type: "string",
      description: "e.g. Hourly on weekdays",
      hidden: ({ parent }) => parent?.type !== "bus",
    }),

    // Parking-specific
    defineField({
      name: "postcode",
      title: "Postcode",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "parking",
    }),
    defineField({
      name: "isFree",
      title: "Free Parking?",
      type: "boolean",
      initialValue: true,
      hidden: ({ parent }) => parent?.type !== "parking",
    }),

    // Common fields
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "geopoint",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first within their type",
    }),
  ],
  orderings: [
    {
      title: "Type, then Order",
      name: "typeOrder",
      by: [
        { field: "type", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      routeNumber: "routeNumber",
    },
    prepare({ title, type, routeNumber }) {
      const typeLabels: Record<string, string> = {
        train: "Train",
        bus: "Bus",
        parking: "Parking",
        cycling: "Cycling",
      };
      const icon: Record<string, string> = {
        train: "🚂",
        bus: "🚌",
        parking: "🅿️",
        cycling: "🚲",
      };
      return {
        title: routeNumber ? `${routeNumber} — ${title}` : title,
        subtitle: `${icon[type] || ""} ${typeLabels[type] || type}`,
      };
    },
  },
});
