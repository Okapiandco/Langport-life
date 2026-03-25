import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import { allHistoricSitesQuery } from "@/lib/queries";

export const metadata: Metadata = {
  title: "History",
  description: "Explore the historic sites and heritage of Langport, Somerset.",
};

export const revalidate = 60;

export default async function HistoryPage() {
  const sites = await client.fetch(allHistoricSitesQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        Historic Langport
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Langport is one of the oldest towns in Somerset, with a rich history
        stretching back over a thousand years. Explore our key historic sites.
      </p>

      {sites.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {sites.map((site: any) => (
            <Link
              key={site._id}
              href={`/history/${site.slug.current}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md sm:flex-row"
            >
              {site.image?.asset && (
                <div className="relative h-48 w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-48">
                  <Image
                    src={urlFor(site.image).width(300).height(300).url()}
                    alt={site.image.alt || site.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center p-6">
                <h2 className="font-heading text-xl font-bold text-gray-900 group-hover:text-primary">
                  {site.title}
                </h2>
                {site.heritage && (
                  <p className="mt-1 text-sm text-copper">{site.heritage}</p>
                )}
                {site.constructedYear && (
                  <p className="mt-1 text-sm text-gray-500">
                    Constructed: {site.constructedYear}
                  </p>
                )}
                {site.currentUse && (
                  <p className="mt-1 text-sm text-gray-500">
                    Current use: {site.currentUse}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-600">
          Historic sites information coming soon.
        </p>
      )}
    </div>
  );
}
