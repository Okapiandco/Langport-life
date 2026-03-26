import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Kayaking & Canoeing",
  description: "Kayaking and canoeing on the River Parrett at Langport, Somerset.",
};

export default function KayakingPage() {
  return (
    <>
      <PageHero title="Kayaking & Canoeing" subtitle="Launch your own craft or hire canoes and kayaks on the River Parrett" section="things-to-do" breadcrumbs={[{ label: "Things to Do", href: "/things-to-do" }, { label: "The Outdoor Life", href: "/things-to-do/outdoor-life" }, { label: "Kayaking & Canoeing" }]} image="/things-to-do/kayaking.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Our beautiful river is more active than it&apos;s been for over a century. You can launch
              your own craft, hire canoes, kayaks and paddleboards, or take a leisurely scenic trip on
              the Duchess of Cocklemoor (a restored River Dart ferry).
            </p>
            <p className="text-gray-600 leading-relaxed">
              Small boats may be launched from a slipway at Huish Bridge. There are strict speed limits
              on the river and boaters are advised to observe river levels and bridge heights very carefully.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you fancy learning to row, the{" "}
              <a href="https://somersetcrc.co.uk/index.html#" target="_blank" rel="noopener noreferrer">
                Somerset Community Rowing Club
              </a>{" "}
              will be happy to teach you.
            </p>
          </div>
          <div className="space-y-4">
            <Image src="/things-to-do/river-sports.jpg" alt="River sports on the Parrett" width={800} height={500} className="w-full h-auto rounded-lg" />
            <Image src="/things-to-do/outdoor-life.jpg" alt="Outdoor life on the river" width={800} height={500} className="w-full h-auto rounded-lg" />
          </div>
        </div>

        <RelatedActivities current="/things-to-do/kayaking" />
      </div>
    </>
  );
}
