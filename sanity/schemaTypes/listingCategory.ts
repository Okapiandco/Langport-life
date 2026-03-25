import { defineField, defineType } from "sanity";

export const listingCategory = defineType({
  name: "listingCategory",
  title: "Listing Category",
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
      type: "string",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Emoji or icon name",
    }),
    defineField({
      name: "color",
      title: "Colour (hex)",
      type: "string",
    }),
  ],
});
