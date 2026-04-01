import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import { allHistoricSitesQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "History",
  description: "Explore the historic sites and heritage of Langport, Somerset.",
};

export const revalidate = 3600;

// Mosaic pattern: alternates between tall/wide/square cards
const mosaicPatterns = [
  "sm:col-span-2 sm:row-span-2", // large featured
  "",                              // standard
  "",                              // standard
  "sm:col-span-2",                // wide
  "",                              // standard
  "sm:row-span-2",                // tall
  "",                              // standard
  "sm:col-span-2",                // wide
  "",                              // standard
  "",                              // standard
];

export default async function HistoryPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sites: any[] = await client.fetch(allHistoricSitesQuery);

  return (
    <>
      <PageHero
        section="history"
        title="Historic Langport"
        subtitle="One of the oldest towns in Somerset, with a rich history stretching back over a thousand years."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {sites.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[280px]">
            {sites.map((site, i) => {
              const pattern = mosaicPatterns[i % mosaicPatterns.length];
              const isLarge = pattern.includes("col-span-2") && pattern.includes("row-span-2");
              const imgWidth = isLarge ? 800 : 500;
              const imgHeight = isLarge ? 600 : 400;

              return (
                <Link
                  key={site._id}
                  href={`/history/${site.slug.current}`}
                  className={`group relative block overflow-hidden rounded-xl no-underline shadow-sm hover:shadow-xl transition-shadow ${pattern}`}
                >
                  {site.image?.asset ? (
                    <Image
                      src={urlFor(site.image).width(imgWidth).height(imgHeight).url()}
                      alt={site.image.alt || site.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-dark-green/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className={`font-heading font-bold text-white drop-shadow-lg ${isLarge ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
                      {site.title}
                    </h2>
                    {site.heritage && (
                      <span className="mt-2 inline-block rounded-full bg-white/20 backdrop-blur-sm px-3 py-0.5 text-xs font-semibold text-white">
                        {site.heritage}
                      </span>
                    )}
                    {isLarge && site.constructedYear && (
                      <p className="mt-2 text-sm text-white/80">
                        Constructed: {site.constructedYear}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">Historic sites information coming soon.</p>
        )}
      </div>
    </>
  );
}
