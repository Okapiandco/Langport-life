import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Exploring the Wild",
  description: "Wildlife, nature reserves, birdwatching, and the ecology of the Somerset Levels near Langport.",
};

const gallery = [
  { src: "/things-to-do/levels-3878.jpg", alt: "Somerset Levels landscape" },
  { src: "/things-to-do/langport-somerset.jpg", alt: "Langport and the Somerset Levels" },
  { src: "/things-to-do/levels-3872.jpg", alt: "Wetlands on the Levels" },
  { src: "/things-to-do/levels-3923.jpg", alt: "River and fields on the Levels" },
  { src: "/things-to-do/levels-3939.jpg", alt: "Somerset Levels wildlife habitat" },
  { src: "/things-to-do/levels-4001.jpg", alt: "Levels waterways" },
  { src: "/things-to-do/levels-4099.jpg", alt: "Somerset Levels at dusk" },
];

const wildlife = [
  "Cranes & herons",
  "Willows",
  "Bulrushes",
  "Eels",
  "Otters",
  "Water voles",
  "Dragonflies",
  "White egrets",
  "Kingfishers",
  "Damselflies",
  "Fish",
  "Swans and Moorhens",
];

const routes = [
  { title: "Cycling", href: "/things-to-do/cycling", image: "/things-to-do/cycling.jpg" },
  { title: "North Street Moor", href: "/things-to-do/north-street-moor", image: "/things-to-do/butterfly.jpg" },
  { title: "Parrett Drove & Cocklemoor", href: "/things-to-do/parrett-drove-and-cocklemoor-walk", image: "/things-to-do/explore-wild.jpg" },
  { title: "Muchelney Route", href: "/things-to-do/muchelney-route", image: "/things-to-do/muchelney.jpg" },
  { title: "Short Town Walks", href: "/things-to-do/short-town-walks", image: "/things-to-do/hanging-chapel.jpg" },
];

export default function ExploringTheWildPage() {
  return (
    <>
      <PageHero
        title="Exploring the Wild"
        subtitle="On foot, cycle or by boat, roam freely along this delightful river and its picturesque riverbank paths to experience the glories of our corner of Somerset."
        section="things-to-do"
        image="/things-to-do/explore-wild.jpg"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>
          {" / "}
          <span className="text-gray-900">Exploring the Wild</span>
        </nav>

        <div className="prose max-w-none mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            The River Parrett flows lazily past Langport as it crosses one of the most important
            wetlands in Europe. Whether you are looking from bridge, bank or boat, there is such a
            variety of creatures to spot, in the air, on the water, or teeming just under the surface.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Not forgetting the treasury of plants that line the river and rhynes and cluster on the
            meadows. This stretch of the river is an important central point in the renewed River
            Parrett Trail that runs from source to sea.
          </p>
        </div>

        {/* Wildlife grid */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">Wildlife to Spot</h2>
        <div className="mb-12 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {wildlife.map((item) => (
            <div key={item} className="rounded-lg bg-green/5 border border-green/10 px-3 py-2 text-center text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>

        {/* Photo gallery - Bill Bradshaw Somerset Levels */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">The Somerset Levels</h2>
        <p className="text-sm text-gray-500 mb-6">Photos by Bill Bradshaw</p>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 mb-12">
          {gallery.map((photo) => (
            <div key={photo.src} className="mb-3 break-inside-avoid overflow-hidden rounded-lg">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={400}
                className="w-full h-auto"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>

        {/* Route cards */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Walks & Routes</h2>
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {routes.map((route) => (
            <Link
              key={route.title}
              href={route.href}
              className="group block overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm hover:shadow-md transition-shadow"
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
                <h3 className="font-heading text-sm font-semibold text-gray-900 group-hover:text-primary">
                  {route.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
