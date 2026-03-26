import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Parrett Drove & Cocklemoor Walk",
  description: "A 2.5km riverside and drove walk from Cocklemoor, Langport.",
};

export default function ParrettDrovePage() {
  return (
    <>
      <PageHero title="The Parrett, Drove & Cocklemoor Walk" subtitle="Approximately 2.5km / 1.5 miles" section="things-to-do" image="/things-to-do/explore-wild.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>{" / "}
          <Link href="/things-to-do/walking-and-cycling" className="hover:text-green no-underline">Walking & Cycling</Link>{" / "}
          <span className="text-gray-900">Parrett Drove & Cocklemoor</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              A delightful option combining riverside and drove views. Begin at Cocklemoor heading south
              to the Parrett Trail riverbank path, proceeding to Huish Bridge (700m).
            </p>
            <p className="text-gray-600 leading-relaxed">
              At the bridge, you can observe a tributary joining the River Parrett &mdash; the Yeo which
              comes from Ilchester, a Roman Town. After crossing Huish Bridge, turn right onto Huish Drove
              for 900m, then right through bike gates along an industrial estate path (400m), passing
              Shakspeare Glass before returning via Whatley footbridge.
            </p>
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Note:</strong> In wet weather the paths and tracks can be very muddy &mdash; you
              will need hiking boots or wellies. In very wet weather there will probably be flooding.
            </div>
            <p className="mt-4">
              <a href="/things-to-do/walk-map.pdf" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors">
                Download Walk Map (PDF) &rarr;
              </a>
            </p>
          </div>
          <div className="space-y-4">
            <Image src="/things-to-do/langport-without-wheels.jpg" alt="Langport without wheels map" width={724} height={1024} className="w-full h-auto rounded-lg" />
          </div>
        </div>

        <RelatedActivities current="/things-to-do/parrett-drove-and-cocklemoor-walk" />
      </div>
    </>
  );
}
