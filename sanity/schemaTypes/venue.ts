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
      name: "coordinatesVerified",
      title: "Coordinates Verified",
      type: "boolean",
      description:
        "Tick once you've confirmed the pin sits in the right place. New submissions arrive with auto-geocoded coords and this field unset — venues stay flagged as 'unverified' in the Studio list until ticked.",
      initialValue: false,
    }),
    defineField({
      name: "outsideCatchment",
      title: "Outside Catchment Area",
      type: "boolean",
      description:
        "Set automatically at submission if the venue's postcode is further from the catchment centre than the radius defined in Site Settings. Warning only — submission is still saved as pending. Read-only.",
      readOnly: true,
    }),
    defineField({
      name: "distanceFromCentreMiles",
      title: "Distance From Centre (miles)",
      type: "number",
      description:
        "Distance in miles from the catchment centre, derived from the postcode at submission time via postcodes.io. Read-only.",
      readOnly: true,
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
          { title: "Pending Approval", value: "pendingApproval" },
          { title: "Inactive", value: "inactive" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "editToken",
      title: "Edit Token",
      type: "string",
      description: "Unique token for the submitter's magic edit link. Do not share.",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      town: "town",
      media: "image",
      coordinates: "coordinates",
      coordinatesVerified: "coordinatesVerified",
      outsideCatchment: "outsideCatchment",
      distanceFromCentreMiles: "distanceFromCentreMiles",
    },
    prepare({ title, town, media, coordinates, coordinatesVerified, outsideCatchment, distanceFromCentreMiles }) {
      const hasCoords = !!(coordinates?.lat && coordinates?.lng);
      const pinFlag = hasCoords && !coordinatesVerified ? " ⚠ unverified pin" : "";
      const catchmentFlag = outsideCatchment
        ? ` ⚠ outside catchment${typeof distanceFromCentreMiles === "number" ? ` (${distanceFromCentreMiles.toFixed(1)} mi)` : ""}`
        : "";
      return {
        title,
        subtitle: `${town || "Langport"}${pinFlag}${catchmentFlag}`,
        media,
      };
    },
  },
});
