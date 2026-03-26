import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "North Street Moor Walk",
  description: "A 2-3.4km walk through North Street Moor from Whatley Car Park, Langport.",
};

export default function NorthStreetMoorPage() {
  return (
    <>
      <PageHero title="North Street Moor" subtitle="Distance: 2.0 to 3.4km (1.25 to 2.11 miles)" section="things-to-do" image="/things-to-do/butterfly.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>{" / "}
          <Link href="/things-to-do/walking-and-cycling" className="hover:text-green no-underline">Walking & Cycling</Link>{" / "}
          <span className="text-gray-900">North Street Moor</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Starts and ends at Whatley Car Park. The route proceeds north through Walter Bagehot Town
              Gardens, follows rhynes (water channels) past a Tesco footbridge, traverses railway arches,
              and reaches an old sluice with a handrail.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Continue along the river bank under a railway bridge through a metal gate, and return via
              rhynes to the town hall.
            </p>
            <h3>Monks Lease Clyse Side Walk</h3>
            <p className="text-gray-600 leading-relaxed">
              An alternate 750m extension that follows the Parrett River to Monks Lease Clyse and the
              Sowey River overflow.
            </p>
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Note:</strong> Routes require hiking boots or wellies due to muddy conditions.
              Flooding occurs in very wet weather. Exercise caution around cattle with calves, control
              dogs, and leave gates as you found them.
            </div>
          </div>
          <Image src="/things-to-do/walks-map.png" alt="Map of walks around Langport" width={800} height={800} className="w-full h-auto rounded-lg" />
        </div>

        <RelatedActivities current="/things-to-do/north-street-moor" />
      </div>
    </>
  );
}
