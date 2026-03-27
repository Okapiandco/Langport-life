import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      initialValue: "Langport Life",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short tagline shown under the site name",
    }),
    defineField({
      name: "seoDescription",
      title: "Default SEO Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "logo",
      title: "Site Logo",
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
      name: "ogImage",
      title: "Default Social Share Image",
      type: "image",
      description: "Used when pages are shared on social media and no specific image is set",
    }),

    // Contact details
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    }),
    defineField({
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 3,
    }),

    // Social links
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      type: "object",
      fields: [
        defineField({
          name: "facebook",
          title: "Facebook URL",
          type: "url",
        }),
        defineField({
          name: "twitter",
          title: "X (Twitter) URL",
          type: "url",
        }),
        defineField({
          name: "instagram",
          title: "Instagram URL",
          type: "url",
        }),
        defineField({
          name: "youtube",
          title: "YouTube URL",
          type: "url",
        }),
      ],
    }),

    // Homepage sections
    defineField({
      name: "homepageHero",
      title: "Homepage Hero",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
        }),
        defineField({
          name: "subheading",
          title: "Subheading",
          type: "text",
          rows: 2,
        }),
        defineField({
          name: "image",
          title: "Hero Image",
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "homepageCards",
      title: "Homepage Navigation Cards",
      description: "The main category cards shown on the homepage",
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
              description: "e.g. /events or /things-to-do",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "image",
              title: "Card Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "color",
              title: "Accent Colour",
              type: "string",
              description: "Tailwind colour class e.g. amber-400, emerald-500",
            }),
          ],
          preview: {
            select: { title: "title", media: "image" },
          },
        },
      ],
    }),
    defineField({
      name: "didYouKnow",
      title: "Did You Know? Fact",
      type: "text",
      rows: 3,
      description: "Fun fact shown on the homepage",
    }),

    // Footer
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "text",
      rows: 2,
      description: "Copyright / legal text shown in the footer",
    }),

    // Emergency / important contacts
    defineField({
      name: "emergencyContacts",
      title: "Emergency Contacts",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "phone",
              title: "Phone Number",
              type: "string",
            }),
            defineField({
              name: "url",
              title: "Website",
              type: "url",
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "phone" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
