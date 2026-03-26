import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Fishing",
  description: "Fishing on the River Parrett and local lakes near Langport, Somerset.",
};

export default function FishingPage() {
  return (
    <>
      <PageHero title="Fishing" subtitle="River Parrett and local lakes" section="things-to-do" image="/things-to-do/wild-swimming.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>{" / "}
          <Link href="/things-to-do/outdoor-life" className="hover:text-green no-underline">The Outdoor Life</Link>{" / "}
          <span className="text-gray-900">Fishing</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              The Langport &amp; District Angling Association operates a fishing lake at Combe available
              to season ticket holders year-round. Day ticket holders may fish the River Parrett.
            </p>
            <p>
              <a href="http://www.langportaa.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors">
                Langport Angling Association &rarr;
              </a>
            </p>
            <h3>Ticket Outlets</h3>
            <ul>
              <li><strong>Fosters Newsagents</strong> &mdash; Bow Street, Langport, Somerset TA10 9PQ</li>
              <li><strong>TackleUK</strong> &mdash; 27 Forest Hill, Yeovil, Somerset BA20 2PH &mdash; 01935 476777</li>
              <li><strong>Viaduct Fisheries Ltd</strong> &mdash; Cary Valley, Somerton, Somerset TA11 6LJ &mdash; 01458 274022</li>
            </ul>
          </div>
          <div className="space-y-4">
            <Image src="/things-to-do/fishing.jpg" alt="Fishing in Langport" width={800} height={820} className="w-full h-auto rounded-lg" />
            <Image src="/things-to-do/fishing-map.png" alt="Map of fishing spots in Langport" width={800} height={500} className="w-full h-auto rounded-lg" />
          </div>
        </div>

        <RelatedActivities current="/things-to-do/fishing" />
      </div>
    </>
  );
}
