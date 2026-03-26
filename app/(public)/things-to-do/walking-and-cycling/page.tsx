import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { pageBySlugQuery } from "@/lib/queries";
import { PortableText } from "@portabletext/react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Walking & Cycling",
  description: "Walking routes, cycling trails, and paths around Langport and the Somerset Levels.",
};

export const revalidate = 60;

export default async function WalkingCyclingPage() {
  const page = await client.fetch(pageBySlugQuery, { slug: "walking-and-cycling" });

  return (
    <>
      <PageHero
        title="Walking & Cycling"
        subtitle="Routes and trails through the Somerset Levels and surrounding countryside."
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
            The flat, open landscape of the Somerset Levels makes Langport an ideal
            base for walking and cycling. Whether you prefer gentle riverside strolls
            or longer cross-country routes, there&apos;s a path for you.
          </p>
          <h2>Walking Routes</h2>
          <ul>
            <li><strong>River Parrett Trail</strong> — Follow the river from Langport through the Levels</li>
            <li><strong>Cocklemoor &amp; Muchelney Walk</strong> — Circular route via the ancient abbey</li>
            <li><strong>Hurds Hill Loop</strong> — Short walk with panoramic views of Langport and beyond</li>
          </ul>
          <h2>Cycling</h2>
          <ul>
            <li><strong>Parrett Trail Cycle Route</strong> — Flat, traffic-free sections along the river</li>
            <li><strong>Levels Loop</strong> — Quiet lanes through Aller, High Ham, and back via Huish Episcopi</li>
          </ul>
          <p>
            <em>This page can be edited in Sanity Studio — create a page with slug &quot;walking-and-cycling&quot; to replace this default content.</em>
          </p>
        </div>
      )}
      </div>
    </>
  );
}
