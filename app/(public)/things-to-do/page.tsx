import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Things to Do",
  description: "Discover outdoor activities, walks, cycling routes, and wildlife around Langport and the Somerset Levels.",
};

const sections = [
  {
    title: "Exploring the Wild",
    href: "/things-to-do/exploring-the-wild",
    description: "Wildlife, nature reserves, birdwatching, and the unique ecology of the Levels.",
    image: "/things-to-do/explore-wild.jpg",
    color: "bg-green",
  },
  {
    title: "Walking & Cycling",
    href: "/things-to-do/walking-and-cycling",
    description: "Routes and trails through the Somerset Levels and surrounding countryside.",
    image: "/things-to-do/walking-cycling.jpg",
    color: "bg-copper",
  },
  {
    title: "The Outdoor Life",
    href: "/things-to-do/outdoor-life",
    description: "Water sports, fishing, golf, and outdoor activities on the River Parrett.",
    image: "/things-to-do/outdoor-life.jpg",
    color: "bg-primary",
  },
];

export default function ThingsToDoPage() {
  return (
    <>
      <PageHero
        section="things-to-do"
        title="Things to Do"
        subtitle="Langport and the surrounding area has a wealth of groups and organisations to help with all your lifestyle needs. There are some outstanding venues, amazing arts groups and established sporting clubs to get involved in."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group relative overflow-hidden rounded-lg no-underline shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-heading text-2xl font-bold text-white drop-shadow-lg">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className={`h-1.5 ${section.color}`} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
