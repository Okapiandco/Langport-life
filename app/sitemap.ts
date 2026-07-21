import type { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity";

const BASE = "https://langport.life";

const dynamicQuery = groq`{
  "events": *[_type == "event" && status == "published" && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "listings": *[_type == "businessListing" && status == "published" && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "venues": *[_type == "venue" && status == "active" && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "groups": *[_type == "group" && status == "approved" && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "articles": *[_type == "article" && published == true && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "historicSites": *[_type == "historicSite" && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "activities": *[_type == "activity" && published == true && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "councilMembers": *[_type == "councilMember" && !defined(endDate) && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  },
  "documents": *[_type == "councilDocument" && visibility == "public" && defined(slug.current)] {
    "slug": slug.current, _updatedAt
  }
}`;

type SanitySlug = { slug: string; _updatedAt: string };
type DynamicData = Record<
  "events" | "listings" | "venues" | "groups" | "articles" | "historicSites" | "activities" | "councilMembers" | "documents",
  SanitySlug[]
>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await client.fetch<DynamicData>(dynamicQuery);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                                    priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/events`,                              priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/events/calendar`,                     priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/listings`,                            priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/venues`,                              priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/community-groups`,                    priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/news`,                                priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/history`,                             priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/things-to-do`,                        priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/getting-here`,                        priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/guides`,                              priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/guides/how-to-list`,                  priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/guides/submission-guidelines`,        priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/environment`,                         priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/about`,                               priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/contact`,                             priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/council`,                             priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE}/council/members`,                     priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/council/somerset-councillors`,        priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/council/documents`,                   priority: 0.5, changeFrequency: "weekly" },
    { url: `${BASE}/council/finance`,                     priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/council/governance`,                  priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/council/services`,                    priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/council/staff-and-volunteers`,        priority: 0.5, changeFrequency: "monthly" },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...data.events.map((e) => ({
      url: `${BASE}/events/${e.slug}`,
      lastModified: e._updatedAt,
      priority: 0.7 as number,
      changeFrequency: "weekly" as const,
    })),
    ...data.listings.map((l) => ({
      url: `${BASE}/listings/${l.slug}`,
      lastModified: l._updatedAt,
      priority: 0.7 as number,
      changeFrequency: "monthly" as const,
    })),
    ...data.venues.map((v) => ({
      url: `${BASE}/venues/${v.slug}`,
      lastModified: v._updatedAt,
      priority: 0.7 as number,
      changeFrequency: "monthly" as const,
    })),
    ...data.groups.map((g) => ({
      url: `${BASE}/community-groups/${g.slug}`,
      lastModified: g._updatedAt,
      priority: 0.6 as number,
      changeFrequency: "monthly" as const,
    })),
    ...data.articles.map((a) => ({
      url: `${BASE}/news/${a.slug}`,
      lastModified: a._updatedAt,
      priority: 0.6 as number,
      changeFrequency: "yearly" as const,
    })),
    ...data.historicSites.map((h) => ({
      url: `${BASE}/history/${h.slug}`,
      lastModified: h._updatedAt,
      priority: 0.5 as number,
      changeFrequency: "yearly" as const,
    })),
    ...data.activities.map((a) => ({
      url: `${BASE}/things-to-do/${a.slug}`,
      lastModified: a._updatedAt,
      priority: 0.6 as number,
      changeFrequency: "yearly" as const,
    })),
    ...data.councilMembers.map((m) => ({
      url: `${BASE}/council/members/${m.slug}`,
      lastModified: m._updatedAt,
      priority: 0.4 as number,
      changeFrequency: "monthly" as const,
    })),
    ...data.documents.map((d) => ({
      url: `${BASE}/council/documents/${d.slug}`,
      lastModified: d._updatedAt,
      priority: 0.4 as number,
      changeFrequency: "yearly" as const,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
