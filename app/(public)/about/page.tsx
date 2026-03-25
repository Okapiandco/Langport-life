import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { pageBySlugQuery } from "@/lib/queries";
import { PortableText } from "@portabletext/react";

export const metadata: Metadata = {
  title: "About Langport",
  description: "Learn about Langport, a historic market town in Somerset.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const page = await client.fetch(pageBySlugQuery, { slug: "about" });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        {page?.title || "About Langport"}
      </h1>
      {page?.content ? (
        <div className="prose mt-8 max-w-none">
          <PortableText value={page.content} />
        </div>
      ) : (
        <div className="prose mt-8 max-w-none">
          <p>
            Langport is a small historic market town in Somerset, England,
            situated on the River Parrett. With a rich history dating back to
            Saxon times, Langport serves as a hub for the surrounding
            communities of the Somerset Levels.
          </p>
          <p>
            The town is home to several notable historic buildings, including the
            Hanging Chapel, Great Bow Bridge, the Town Hall, and the Church of
            All Saints.
          </p>
          <p>
            This site serves as a community hub for residents and visitors,
            providing information about local events, venues, businesses, and
            council services.
          </p>
        </div>
      )}
    </div>
  );
}
