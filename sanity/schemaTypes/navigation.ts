import { defineField, defineType } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({
      name: "mainMenu",
      title: "Main Menu",
      type: "array",
      of: [
        {
          type: "object",
          name: "menuItem",
          title: "Menu Item",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link URL",
              type: "string",
              description: "e.g. /events, /things-to-do, or leave blank for dropdown-only items",
            }),
            defineField({
              name: "children",
              title: "Dropdown Items",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "subMenuItem",
                  fields: [
                    defineField({
                      name: "groupTitle",
                      title: "Group Title",
                      type: "string",
                      description: "Optional heading for a group of links (e.g. 'Committees')",
                    }),
                    defineField({
                      name: "links",
                      title: "Links",
                      type: "array",
                      of: [
                        {
                          type: "object",
                          fields: [
                            defineField({
                              name: "title",
                              title: "Title",
                              type: "string",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "href",
                              title: "Link URL",
                              type: "string",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "description",
                              title: "Description",
                              type: "string",
                              description: "Optional short description shown in mega menus",
                            }),
                          ],
                          preview: {
                            select: { title: "title", subtitle: "href" },
                          },
                        },
                      ],
                    }),
                  ],
                  preview: {
                    select: { title: "groupTitle", links: "links" },
                    prepare({ title, links }) {
                      return {
                        title: title || "Link Group",
                        subtitle: `${links?.length || 0} links`,
                      };
                    },
                  },
                },
              ],
            }),
            defineField({
              name: "cards",
              title: "Image Cards",
              type: "array",
              description: "Optional image cards shown alongside the link groups in the mega menu",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "title",
                      title: "Title",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "description",
                      title: "Description",
                      type: "string",
                    }),
                    defineField({
                      name: "href",
                      title: "Link URL",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "image",
                      title: "Image",
                      type: "image",
                      options: { hotspot: true },
                    }),
                  ],
                  preview: {
                    select: { title: "title", media: "image" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "title", children: "children" },
            prepare({ title, children }) {
              return {
                title,
                subtitle: children?.length
                  ? `${children.length} group(s)`
                  : "Direct link",
              };
            },
          },
        },
      ],
    }),

    defineField({
      name: "footerColumns",
      title: "Footer Link Columns",
      type: "array",
      of: [
        {
          type: "object",
          name: "footerColumn",
          fields: [
            defineField({
              name: "title",
              title: "Column Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "title",
                      title: "Title",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "href",
                      title: "Link URL",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: { title: "title", subtitle: "href" },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "title", links: "links" },
            prepare({ title, links }) {
              return {
                title,
                subtitle: `${links?.length || 0} links`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Navigation" };
    },
  },
});
