import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/studio/",
          "/submit/",
          "/edit/",
          "/events/print",
          "/api/",
        ],
      },
    ],
    sitemap: "https://langport.life/sitemap.xml",
  };
}
