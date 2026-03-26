import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Golf",
  description: "Long Sutton Golf and Country Club near Langport, Somerset.",
};

export default function GolfPage() {
  return (
    <>
      <PageHero title="Golf" subtitle="Long Sutton Golf and Country Club" section="things-to-do" breadcrumbs={[{ label: "Things to Do", href: "/things-to-do" }, { label: "The Outdoor Life", href: "/things-to-do/outdoor-life" }, { label: "Golf" }]} image="/things-to-do/golf.png" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">        <div className="grid gap-8 lg:grid-cols-2 items-start mb-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Long Sutton Golf and Country Club is a privately owned, gently undulating, parkland golf
              course, set on the edge of the levels in the heart of South Somerset.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Opened in 1991 and under new ownership since September 2019, the course was designed by
              Patrick Dawson. Set on 130 acres, 6352 yards in length, par 71 for men and par 72 for
              ladies, it has matured and continues to evolve to create an even more exciting and
              pleasurable golf experience.
            </p>
            <p>
              <a href="https://www.longsuttongolf.com/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors">
                Visit Long Sutton Golf &rarr;
              </a>
            </p>
          </div>
          <div className="space-y-4">
            <Image src="/things-to-do/golf-course-1.jpg" alt="Long Sutton Golf Course" width={800} height={260} className="w-full h-auto rounded-lg" />
            <Image src="/things-to-do/golf-course-2.jpg" alt="Golf course fairway" width={800} height={420} className="w-full h-auto rounded-lg" />
            <Image src="/things-to-do/golf-course-3.jpg" alt="Golf course aerial view" width={800} height={260} className="w-full h-auto rounded-lg" />
          </div>
        </div>

        <RelatedActivities current="/things-to-do/golf" />
      </div>
    </>
  );
}
