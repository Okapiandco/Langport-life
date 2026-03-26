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

export const revalidate = 60;

export default async function HistoryPage() {
  const sites = await client.fetch(allHistoricSitesQuery);

  return (
    <>
      <PageHero
        section="history"
        title="Historic Langport"
        subtitle="One of the oldest towns in Somerset, with a rich history stretching back over a thousand years."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {sites.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2">
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
                  <h2 className="font-heading text-xl font-bold text-gray-900 group-hover:text-dark-green">
                    {site.title}
                  </h2>
                  {site.heritage && (
                    <p className="mt-1 text-sm text-dark-green font-medium">{site.heritage}</p>
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
          <p className="text-gray-600">Historic sites information coming soon.</p>
        )}
      </div>
    </>
  );
}
