import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { pageBySlugQuery } from "@/lib/queries";
import { PortableText } from "@portabletext/react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Exploring the Wild",
  description: "Wildlife, nature reserves, birdwatching, and the ecology of the Somerset Levels near Langport.",
};

export const revalidate = 60;

export default async function ExploringTheWildPage() {
  const page = await client.fetch(pageBySlugQuery, { slug: "exploring-the-wild" });

  return (
    <>
      <PageHero
        title="Exploring the Wild"
        subtitle="Wildlife, nature reserves, birdwatching, and the ecology of the Somerset Levels."
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
            The Somerset Levels surrounding Langport are one of England&apos;s most
            important wetland habitats. This unique landscape supports an extraordinary
            range of wildlife throughout the seasons.
          </p>
          <h2>Nature Reserves</h2>
          <ul>
            <li><strong>RSPB Ham Wall</strong> — Starling murmurations in winter, bitterns, and marsh harriers</li>
            <li><strong>Shapwick Heath NNR</strong> — Ancient peatland with otters, dragonflies, and rare plants</li>
            <li><strong>Westhay Moor</strong> — Reedbeds and open water, excellent for birdwatching</li>
          </ul>
          <h2>Wildlife to Spot</h2>
          <ul>
            <li><strong>Winter</strong> — Starling murmurations, short-eared owls, wintering wildfowl</li>
            <li><strong>Spring</strong> — Great white egrets, bitterns booming, migrant warblers</li>
            <li><strong>Summer</strong> — Dragonflies, otters, hobby falcons</li>
            <li><strong>Autumn</strong> — Kingfishers, deer, fungi walks</li>
          </ul>
          <p>
            <em>This page can be edited in Sanity Studio — create a page with slug &quot;exploring-the-wild&quot; to replace this default content.</em>
          </p>
        </div>
      )}
      </div>
    </>
  );
}
