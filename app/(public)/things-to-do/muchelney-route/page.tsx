import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Muchelney Route",
  description: "A 5.7 to 7km walk to Muchelney via the old railway line from Langport.",
};

export default function MuchelneyRoutePage() {
  return (
    <>
      <PageHero title="Muchelney Route" subtitle="Distance: 5.7 to 7km (3.55 to 4.3 miles)" section="things-to-do" image="/things-to-do/muchelney.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>{" / "}
          <Link href="/things-to-do/walking-and-cycling" className="hover:text-green no-underline">Walking & Cycling</Link>{" / "}
          <span className="text-gray-900">Muchelney Route</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Starts and ends at Whatley Car Park. Follow the Parrett Drove walk until the bike gates
              (1.6km), then turn left onto a cycle path built on an old railway line (1.5km).
            </p>
            <p className="text-gray-600 leading-relaxed">
              The path is elevated, enclosed and straight with vegetation including trees, dog roses,
              brambles and sloes. After descending to the road and turning left (300m), cross a stile
              and return along the Parrett Trail with the river on your right to Huish Bridge (1.6km),
              then retrace back to the car park.
            </p>
            <h3>Abbey Extension</h3>
            <p className="text-gray-600 leading-relaxed">
              An optional detour visits Muchelney Abbey, a 10th Century Benedictine site, plus St Peter
              and Paul Church with Saxon origins but largely dating from the 15th century (700m from
              the main route).
            </p>
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Note:</strong> Paths become very muddy in wet weather; hiking boots or wellies
              required. Be careful with cattle and calves, control dogs, and leave gates as you found them.
            </div>
          </div>
          <Image src="/things-to-do/walks-map.png" alt="Map of walks around Langport" width={800} height={800} className="w-full h-auto rounded-lg" />
        </div>
      </div>
    </>
  );
}
