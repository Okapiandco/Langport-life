import { defineField, defineType } from "sanity";

export const activity = defineType({
  name: "activity",
  title: "Activity",
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Exploring the Wild", value: "exploring" },
          { title: "Walking & Cycling", value: "walking-cycling" },
          { title: "The Outdoor Life", value: "outdoor" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Short Description",
      type: "text",
      rows: 3,
      description: "Shown on the Things To Do listing page and in cards",
    }),
    defineField({
      name: "heroImage",
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
      name: "content",
      title: "Main Content",
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
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
    }),

    // Route / walk info (optional, for walking routes)
    defineField({
      name: "distance",
      title: "Distance",
      type: "string",
      description: "e.g. 5.7 to 7km (3.55 to 4.3 miles)",
    }),
    defineField({
      name: "duration",
      title: "Estimated Duration",
      type: "string",
      description: "e.g. 2-3 hours",
    }),
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Easy", value: "easy" },
          { title: "Moderate", value: "moderate" },
          { title: "Challenging", value: "challenging" },
        ],
      },
    }),
    defineField({
      name: "routeMapImage",
      title: "Route Map Image",
      type: "image",
      description: "Static map image showing the route",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),

    // Gallery
    defineField({
      name: "gallery",
      title: "Photo Gallery",
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
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
    }),

    // Wildlife / feature tags
    defineField({
      name: "highlights",
      title: "Highlights / Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "e.g. wildlife species, features you might see",
    }),

    // Callout / notice boxes
    defineField({
      name: "notices",
      title: "Notice Boxes",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Info", value: "info" },
                  { title: "Warning", value: "warning" },
                  { title: "Tip", value: "tip" },
                ],
              },
              initialValue: "info",
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "type" },
          },
        },
      ],
    }),

    // External links / resources
    defineField({
      name: "externalLinks",
      title: "External Links & Resources",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Link Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "url" },
          },
        },
      ],
    }),

    // YouTube embed
    defineField({
      name: "youtubeUrl",
      title: "YouTube Video URL",
      type: "url",
      description: "Full YouTube URL — the embed will be generated automatically",
    }),

    // Ordering
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first within their category",
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Category, then Order",
      name: "categoryOrder",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      published: "published",
      media: "heroImage",
    },
    prepare({ title, category, published, media }) {
      const categoryLabels: Record<string, string> = {
        exploring: "Exploring the Wild",
        "walking-cycling": "Walking & Cycling",
        outdoor: "The Outdoor Life",
      };
      return {
        title,
        subtitle: `${categoryLabels[category] || category}${published ? "" : " (Draft)"}`,
        media,
      };
    },
  },
});
