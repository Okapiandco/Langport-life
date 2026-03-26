import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

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
  "Cranes & herons", "Willows", "Bulrushes", "Eels", "Otters", "Water voles",
  "Dragonflies", "White egrets", "Kingfishers", "Damselflies", "Fish", "Swans and Moorhens",
];

export default function ExploringTheWildPage() {
  return (
    <>
      <PageHero
        title="Exploring the Wild"
        subtitle="On foot, cycle or by boat, roam freely along this delightful river and its picturesque riverbank paths to experience the glories of our corner of Somerset."
        section="things-to-do" breadcrumbs={[{ label: "Things to Do", href: "/things-to-do" }, { label: "Exploring the Wild" }]}
        image="/things-to-do/explore-wild.jpg"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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

        {/* Photo gallery - moved below activities */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">The Somerset Levels</h2>
        <p className="text-sm text-gray-500 mb-6">Photos by Bill Bradshaw</p>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
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

        <RelatedActivities current="/things-to-do/exploring-the-wild" />
      </div>
    </>
  );
}
