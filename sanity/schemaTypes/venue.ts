import { defineField, defineType } from "sanity";

export const venue = defineType({
  name: "venue",
  title: "Venue",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Name",
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
      name: "image",
      title: "Main Image",
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
      name: "street",
      title: "Street Address",
      type: "string",
    }),
    defineField({
      name: "town",
      title: "Town",
      type: "string",
      initialValue: "Langport",
    }),
    defineField({
      name: "postcode",
      title: "Postcode",
      type: "string",
    }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "geopoint",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "ownerName",
      title: "Owner Name",
      type: "string",
    }),
    defineField({
      name: "ownerEmail",
      title: "Owner Email",
      type: "string",
      description: "Contact email for the venue owner (not displayed publicly)",
    }),
    defineField({
      name: "facilities",
      title: "Facilities",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "WiFi", value: "wifi" },
          { title: "Parking", value: "parking" },
          { title: "Wheelchair Accessible", value: "accessible" },
          { title: "Kitchen", value: "kitchen" },
          { title: "Stage", value: "stage" },
          { title: "PA System", value: "pa" },
          { title: "Outdoor Space", value: "outdoor" },
          { title: "Toilets", value: "toilets" },
        ],
      },
    }),
    defineField({
      name: "capacity",
      title: "Capacity",
      type: "number",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "images",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
        ],
      },
      initialValue: "active",
    }),
  ],
  preview: {
    select: {
      title: "title",
      town: "town",
      media: "image",
    },
    prepare({ title, town, media }) {
      return {
        title,
        subtitle: town || "Langport",
        media,
      };
    },
  },
});
