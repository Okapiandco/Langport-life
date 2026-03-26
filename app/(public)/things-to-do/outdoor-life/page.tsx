import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "The Outdoor Life",
  description: "Water sports, fishing, golf, and outdoor activities on the River Parrett in Langport, Somerset.",
};

const activities = [
  { title: "Golf", href: "/things-to-do/outdoor-life", image: "/things-to-do/golf.png" },
  { title: "Wild Swimming", href: "/things-to-do/outdoor-life", image: "/things-to-do/wild-swimming.jpg" },
  { title: "Kayaking & Canoeing", href: "/things-to-do/outdoor-life", image: "/things-to-do/kayaking.jpg" },
  { title: "Paddleboarding", href: "/things-to-do/outdoor-life", image: "/things-to-do/paddleboarding.jpg" },
  { title: "Boating", href: "/things-to-do/outdoor-life", image: "/things-to-do/boating.jpg" },
  { title: "Fishing", href: "/things-to-do/outdoor-life", image: "/things-to-do/fishing.jpg" },
  { title: "North Street Moor", href: "/things-to-do/outdoor-life", image: "/things-to-do/butterfly.jpg" },
  { title: "Parrett Drove & Cocklemoor Walk", href: "/things-to-do/outdoor-life", image: "/things-to-do/explore-wild.jpg" },
  { title: "Muchelney Route", href: "/things-to-do/outdoor-life", image: "/things-to-do/muchelney.jpg" },
  { title: "Short Town Walks", href: "/things-to-do/outdoor-life", image: "/things-to-do/hanging-chapel.jpg" },
];

export default function OutdoorLifePage() {
  return (
    <>
      <PageHero
        title="The Outdoor Life"
        subtitle="Langport's stretch of the River Parrett offers ideal conditions for fun on and off the water, with delightful footpaths linking the midsection of the River Parrett Trail."
        section="things-to-do"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>
          {" / "}
          <span className="text-gray-900">The Outdoor Life</span>
        </nav>

        {/* Hero image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl mb-10">
          <Image
            src="/things-to-do/outdoor-life.jpg"
            alt="Outdoor life on the River Parrett in Langport"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose max-w-none mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            Our beautiful river is more active than it&apos;s been in over a century. You can launch your own
            craft, hire canoes or kayaks, or take a leisurely scenic trip on a restored River Dart
            ferry &mdash; The Duchess of Cocklemoor.
          </p>
          <p className="text-gray-600 leading-relaxed">
            4 pontoons for mooring to and swimming from and, if you are an angler, you can cast a line
            from fishing platforms and accessible riverbanks. Along the riverbank there are picnic areas
            and fitness apparatus, with interpretation boards crammed with fascinating information about
            this unique countryside.
          </p>
        </div>

        {/* YouTube video */}
        <div className="mb-12">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src="https://www.youtube.com/embed/gW_88XbKlhg"
              title="Langport Outdoor Life"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        {/* Activity cards */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Activities</h2>
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-heading text-sm font-semibold text-gray-900">
                  {activity.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
