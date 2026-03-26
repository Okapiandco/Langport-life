import { defineField, defineType } from "sanity";

export const councilMember = defineType({
  name: "councilMember",
  title: "Council Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
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
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Councillor", value: "councillor" },
          { title: "Clerk", value: "clerk" },
          { title: "Officer", value: "officer" },
          { title: "Chair", value: "chair" },
          { title: "Vice Chair", value: "viceChair" },
        ],
      },
    }),
    defineField({
      name: "councilLevel",
      title: "Council Level",
      type: "string",
      options: {
        list: [
          { title: "Town Council", value: "town" },
          { title: "Somerset Council", value: "somerset" },
          { title: "District Council", value: "district" },
        ],
      },
      initialValue: "town",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Photo",
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
      name: "biography",
      title: "Biography",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "ward",
      title: "Ward",
      type: "string",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "platform", title: "Platform", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      role: "role",
      media: "image",
    },
    prepare({ title, role, media }) {
      return {
        title,
        subtitle: role || "Council Member",
        media,
      };
    },
  },
});
