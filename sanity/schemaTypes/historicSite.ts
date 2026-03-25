import { defineField, defineType } from "sanity";

export const historicSite = defineType({
  name: "historicSite",
  title: "Historic Site",
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
      name: "images",
      title: "Historical Gallery",
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
      name: "address",
      title: "Address",
      type: "string",
    }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "geopoint",
    }),
    defineField({
      name: "constructedYear",
      title: "Year Constructed",
      type: "string",
    }),
    defineField({
      name: "heritage",
      title: "Heritage Status",
      type: "string",
      description: "e.g. Grade I Listed, Grade II Listed",
    }),
    defineField({
      name: "historicalSignificance",
      title: "Historical Significance",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "currentUse",
      title: "Current Use",
      type: "string",
    }),
    defineField({
      name: "openToPublic",
      title: "Open to Public",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      heritage: "heritage",
      media: "image",
    },
    prepare({ title, heritage, media }) {
      return {
        title,
        subtitle: heritage || "Historic Site",
        media,
      };
    },
  },
});
