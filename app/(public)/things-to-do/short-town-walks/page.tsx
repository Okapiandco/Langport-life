import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Short Town Walks",
  description: "Short walking routes around Langport town centre, Somerset.",
};

export default function ShortTownWalksPage() {
  return (
    <>
      <PageHero title="Short Town Walks" subtitle="Several short walks starting and ending at Whatley Car Park" section="things-to-do" image="/things-to-do/hanging-chapel.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>{" / "}
          <Link href="/things-to-do/walking-and-cycling" className="hover:text-green no-underline">Walking & Cycling</Link>{" / "}
          <span className="text-gray-900">Short Town Walks</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Head south from Whatley Car Park to the Parrett Trail along the river bank, cross a
              footbridge after approximately 450 metres, then ascend to the road (250m). Pass the
              Hanging Chapel, on the site of the Saxon hill fort, before reaching All Saints Church (250m).
            </p>
            <h3>Three return options</h3>
            <ul>
              <li><strong>Via Bush Place and Whatley Lane</strong> &mdash; 300m</li>
              <li><strong>Via the Hill and Langport Arms</strong> &mdash; 350m</li>
              <li><strong>Via Priest Lane and North Street</strong> &mdash; 550m</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Don&apos;t miss Walter Bagehot&apos;s grave and the views across the Levels southward at the cemetery.
            </p>
          </div>
          <div className="space-y-4">
            <Image src="/things-to-do/walks-map.png" alt="Map of walks around Langport" width={800} height={800} className="w-full h-auto rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
