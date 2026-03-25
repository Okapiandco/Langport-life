import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
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
      title: "Short Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
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
      name: "image",
      title: "Hero Image",
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
      name: "seoDescription",
      title: "SEO Description",
      type: "string",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "parentPage",
      title: "Parent Page",
      type: "reference",
      to: [{ type: "page" }],
    }),
    defineField({
      name: "order",
      title: "Menu Order",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "title",
      published: "published",
      media: "image",
    },
    prepare({ title, published, media }) {
      return {
        title,
        subtitle: published ? "Published" : "Draft",
        media,
      };
    },
  },
});
