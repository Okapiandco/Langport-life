import { defineField, defineType } from "sanity";

export const siteUser = defineType({
  name: "siteUser",
  title: "Site User",
  type: "document",
  fields: [
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      description: "Unique ID from NextAuth",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Public", value: "public" },
          { title: "Venue Owner", value: "venueOwner" },
          { title: "Business Owner", value: "businessOwner" },
          { title: "Clerk", value: "clerk" },
        ],
      },
      initialValue: "public",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "venue",
      title: "Managed Venue",
      type: "reference",
      to: [{ type: "venue" }],
      hidden: ({ parent }) => parent?.role !== "venueOwner",
    }),
    defineField({
      name: "businessListing",
      title: "Managed Business",
      type: "reference",
      to: [{ type: "businessListing" }],
      hidden: ({ parent }) => parent?.role !== "businessOwner",
    }),
    defineField({
      name: "passwordHash",
      title: "Password Hash",
      type: "string",
      hidden: true,
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
      title: "name",
      email: "email",
      role: "role",
    },
    prepare({ title, email, role }) {
      return {
        title: title || email,
        subtitle: role || "public",
      };
    },
  },
});
