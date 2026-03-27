import { defineField, defineType } from "sanity";

export const businessListing = defineType({
  name: "businessListing",
  title: "Business Listing",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Business Name",
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
      name: "ownerName",
      title: "Owner Name",
      type: "string",
    }),
    defineField({
      name: "ownerEmail",
      title: "Owner Email",
      type: "string",
      description: "Contact email for the business owner (not displayed publicly)",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "listingCategory" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "mondayOpen",
      title: "Monday Open",
      type: "string",
    }),
    defineField({
      name: "mondayClose",
      title: "Monday Close",
      type: "string",
    }),
    defineField({
      name: "tuesdayOpen",
      title: "Tuesday Open",
      type: "string",
    }),
    defineField({
      name: "tuesdayClose",
      title: "Tuesday Close",
      type: "string",
    }),
    defineField({
      name: "wednesdayOpen",
      title: "Wednesday Open",
      type: "string",
    }),
    defineField({
      name: "wednesdayClose",
      title: "Wednesday Close",
      type: "string",
    }),
    defineField({
      name: "thursdayOpen",
      title: "Thursday Open",
      type: "string",
    }),
    defineField({
      name: "thursdayClose",
      title: "Thursday Close",
      type: "string",
    }),
    defineField({
      name: "fridayOpen",
      title: "Friday Open",
      type: "string",
    }),
    defineField({
      name: "fridayClose",
      title: "Friday Close",
      type: "string",
    }),
    defineField({
      name: "saturdayOpen",
      title: "Saturday Open",
      type: "string",
    }),
    defineField({
      name: "saturdayClose",
      title: "Saturday Close",
      type: "string",
    }),
    defineField({
      name: "sundayOpen",
      title: "Sunday Open",
      type: "string",
    }),
    defineField({
      name: "sundayClose",
      title: "Sunday Close",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Published", value: "published" },
          { title: "Draft", value: "draft" },
          { title: "Pending Approval", value: "pendingApproval" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "approvedAt",
      title: "Approved At",
      type: "datetime",
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
  ],
  preview: {
    select: {
      title: "title",
      category: "category.name",
      media: "image",
    },
    prepare({ title, category, media }) {
      return {
        title,
        subtitle: category || "Uncategorised",
        media,
      };
    },
  },
});
