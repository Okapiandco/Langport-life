import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Walking & Cycling",
  description: "Walking routes, cycling trails, and paths around Langport and the Somerset Levels.",
};

const routes = [
  { title: "Cycling", image: "/things-to-do/cycling.jpg" },
  { title: "North Street Moor", image: "/things-to-do/butterfly.jpg" },
  { title: "Parrett Drove & Cocklemoor Walk", image: "/things-to-do/explore-wild.jpg" },
  { title: "Muchelney Route", image: "/things-to-do/muchelney.jpg" },
  { title: "Short Town Walks", image: "/things-to-do/hanging-chapel.jpg" },
];

export default function WalkingCyclingPage() {
  return (
    <>
      <PageHero
        title="Walking & Cycling"
        subtitle="Langport is surrounded by interesting landscape and countryside. We have compiled a selection of walks to suit your ability and needs."
        section="things-to-do"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>
          {" / "}
          <span className="text-gray-900">Walking & Cycling</span>
        </nav>

        {/* Hero image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl mb-10">
          <Image
            src="/things-to-do/walks-cycling-hero.jpg"
            alt="Walking and cycling around Langport"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose max-w-none mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            All walks start and end at the Whatley Car Park.
          </p>
          <p className="text-gray-600 leading-relaxed">
            In wet weather the paths and tracks can be very muddy and, except in prolonged dry weather,
            you will need hiking boots or wellies. In very wet weather there will probably be flooding.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Be careful if there are cattle with calves in fields that you cross. Keep dogs well under
            control and please leave gates as you found them.
          </p>
          <p className="text-gray-600 leading-relaxed">
            There are several very pleasant pubs, restaurants and cafes in Langport town centre if
            you feel like some refreshments after your walk.
          </p>
        </div>

        {/* Route cards */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Routes & Walks</h2>
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {routes.map((route) => (
            <div
              key={route.title}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={route.image}
                  alt={route.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-heading text-sm font-semibold text-gray-900">
                  {route.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
