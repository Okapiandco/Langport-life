import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Boating",
  description: "Boating on the River Parrett at Langport, Somerset.",
};

export default function BoatingPage() {
  return (
    <>
      <PageHero title="Boating" subtitle="Explore the River Parrett by boat" section="things-to-do" breadcrumbs={[{ label: "Things to Do", href: "/things-to-do" }, { label: "The Outdoor Life", href: "/things-to-do/outdoor-life" }, { label: "Boating" }]} image="/things-to-do/boating.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Small boats may be launched from a slipway at Huish Bridge. There are strict speed limits
            on the river and boaters are advised to observe river levels and bridge heights very carefully.
          </p>
        </div>

        <RelatedActivities current="/things-to-do/boating" />
      </div>
    </>
  );
}
