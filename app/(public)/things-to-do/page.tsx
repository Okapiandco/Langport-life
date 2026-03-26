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
    title: "Outdoor Life",
    href: "/things-to-do/outdoor-life",
    description: "Parks, gardens, sports, and outdoor spaces in and around Langport.",
    image: "/nav-things-to-do.jpg",
    color: "bg-primary",
  },
  {
    title: "Walking & Cycling",
    href: "/things-to-do/walking-and-cycling",
    description: "Routes and trails through the Somerset Levels and surrounding countryside.",
    image: "/nav-environment.jpg",
    color: "bg-copper",
  },
  {
    title: "Exploring the Wild",
    href: "/things-to-do/exploring-the-wild",
    description: "Wildlife, nature reserves, birdwatching, and the unique ecology of the Levels.",
    image: "/nav-history.jpg",
    color: "bg-green",
  },
  {
    title: "Venues",
    href: "/venues",
    description: "Pubs, halls, gardens, and spaces for events and gatherings.",
    image: "/nav-whats-on.jpg",
    color: "bg-dark-green",
  },
];

export default function ThingsToDoPage() {
  return (
    <>
      <PageHero
        section="things-to-do"
        title="Things to Do"
        subtitle="From riverside walks to wildlife spotting, there's plenty to explore in and around Langport and the Somerset Levels."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group relative overflow-hidden rounded-lg no-underline shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
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
