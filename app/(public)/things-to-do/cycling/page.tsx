import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Cycling",
  description: "Cycling routes around Langport and the Somerset Levels.",
};

export default function CyclingPage() {
  return (
    <>
      <PageHero title="Cycling" subtitle="The flat landscape makes the area hugely popular with cyclists of all ages" section="things-to-do" breadcrumbs={[{ label: "Things to Do", href: "/things-to-do" }, { label: "Walking & Cycling", href: "/things-to-do/walking-and-cycling" }, { label: "Cycling" }]} image="/things-to-do/cycling.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Huish Drove and the Old Railway Line form part of a circular route when combined with
              the Muchelney to Huish road.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The flat landscape makes the area hugely popular with cyclists of all ages, attracted to
              Langport by the cafes and the bicycle &lsquo;pit-stop&rsquo;, alongside the public toilets,
              where water bottles may also be refilled.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Somerset Council have produced some maps to help you.
            </p>
            <p>
              <a href="https://www.somerset.gov.uk/waste-planning-and-land/walking-and-cycling-maps" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors">
                Somerset Council Cycling Maps &rarr;
              </a>
            </p>
          </div>
          <Image src="/things-to-do/walks-map.png" alt="Map of cycling routes around Langport" width={800} height={800} className="w-full h-auto rounded-lg" />
        </div>

        <RelatedActivities current="/things-to-do/cycling" />
      </div>
    </>
  );
}
