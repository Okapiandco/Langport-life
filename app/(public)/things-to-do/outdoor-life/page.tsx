import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { pageBySlugQuery } from "@/lib/queries";
import { PortableText } from "@portabletext/react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Outdoor Life",
  description: "Parks, gardens, sports, and outdoor spaces in and around Langport, Somerset.",
};

export const revalidate = 60;

export default async function OutdoorLifePage() {
  const page = await client.fetch(pageBySlugQuery, { slug: "outdoor-life" });

  return (
    <>
      <PageHero
        title="Outdoor Life"
        subtitle="Parks, gardens, sports, and outdoor spaces in and around Langport."
        section="things-to-do"
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {page?.content ? (
        <div className="prose mt-8 max-w-none">
          <PortableText value={page.content} />
        </div>
      ) : (
        <div className="prose mt-8 max-w-none">
          <p>
            Langport and the surrounding Somerset Levels offer a wealth of outdoor activities
            for all ages. From the tranquil Cocklemoor Park along the River Parrett to the
            Memorial Field sports facilities, there&apos;s something for everyone.
          </p>
          <h2>Parks &amp; Green Spaces</h2>
          <ul>
            <li><strong>Cocklemoor Park</strong> — Riverside meadow perfect for picnics and dog walking</li>
            <li><strong>Walter Bagehot Memorial Gardens</strong> — Beautiful town gardens in the centre of Langport</li>
            <li><strong>Hurds Hill</strong> — Panoramic views across the Levels</li>
          </ul>
          <h2>Sports &amp; Recreation</h2>
          <ul>
            <li><strong>Huish Episcopi Leisure Centre</strong> — Swimming, gym, and fitness classes</li>
            <li><strong>Memorial Field</strong> — Cricket, football, and social club</li>
            <li><strong>Langport Fishing</strong> — River Parrett and local lakes</li>
          </ul>
          <p>
            <em>This page can be edited in Sanity Studio — create a page with slug &quot;outdoor-life&quot; to replace this default content.</em>
          </p>
        </div>
      )}
      </div>
    </>
  );
}
