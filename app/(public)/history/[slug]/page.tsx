import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { historicSiteBySlugQuery, allHistoricSitesQuery } from "@/lib/queries";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await client.fetch(historicSiteBySlugQuery, { slug });
  if (!site) return { title: "Historic Site Not Found" };
  return { title: site.title, description: `Learn about ${site.title} in Langport` };
}

export default async function HistoricSitePage({ params }: Props) {
  const { slug } = await params;
  const [site, allSites] = await Promise.all([
    client.fetch(historicSiteBySlugQuery, { slug }),
    client.fetch(allHistoricSitesQuery),
  ]);
  if (!site) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related = allSites.filter((s: any) => s.slug.current !== slug);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero image */}
      {site.image?.asset && (
        <div className="relative mb-8 h-72 w-full overflow-hidden rounded-2xl sm:h-[28rem]">
          <Image
            src={urlFor(site.image).width(1000).height(600).url()}
            alt={site.image.alt || site.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="font-heading text-4xl font-bold text-gray-900">
        {site.title}
      </h1>

      {/* Meta badges */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
        {site.heritage && (
          <span className="rounded-full bg-copper/10 px-3 py-1 font-medium text-copper">
            {site.heritage}
          </span>
        )}
        {site.constructedYear && (
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Constructed: {site.constructedYear}
          </span>
        )}
        {site.currentUse && (
          <span className="rounded-full bg-gray-100 px-3 py-1">
            {site.currentUse}
          </span>
        )}
        {site.openToPublic !== undefined && (
          <span className={`rounded-full px-3 py-1 ${site.openToPublic ? "bg-green/10 text-green" : "bg-red-50 text-red-600"}`}>
            {site.openToPublic ? "Open to public" : "Not open to public"}
          </span>
        )}
      </div>

      {/* Description */}
      {site.description && (
        <div className="prose mt-8 max-w-none">
          <PortableText value={site.description} />
        </div>
      )}

      {/* Historical Significance */}
      {site.historicalSignificance && (
        <div className="mt-10">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            Historical Significance
          </h2>
          <div className="prose mt-4 max-w-none">
            <PortableText value={site.historicalSignificance} />
          </div>
        </div>
      )}

      {/* Address */}
      {site.address && (
        <p className="mt-8 text-sm text-gray-600">
          <strong>Address:</strong> {site.address}
        </p>
      )}

      {/* Gallery */}
      {site.images && site.images.length > 0 && (
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            Gallery
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 auto-rows-[200px] sm:auto-rows-[240px]">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {site.images.map((img: any, i: number) => {
              // First image spans 2 cols if there are 3+ images
              const isFeature = i === 0 && site.images.length >= 3;
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-xl ${isFeature ? "col-span-2 row-span-2" : ""}`}
                >
                  <Image
                    src={urlFor(img).width(isFeature ? 800 : 400).height(isFeature ? 600 : 300).url()}
                    alt={img.alt || `${site.title} photo ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Historic Sites */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            More Historic Sites
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {related.map((s: any) => (
              <Link
                key={s._id}
                href={`/history/${s.slug.current}`}
                className="group block overflow-hidden rounded-xl no-underline shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {s.image?.asset ? (
                    <Image
                      src={urlFor(s.image).width(300).height(225).url()}
                      alt={s.image.alt || s.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-dark-green/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-2 left-3 right-3 font-heading text-sm font-bold text-white drop-shadow">
                    {s.title}
                  </h3>
                </div>
                {s.heritage && (
                  <div className="bg-dark-green px-3 py-1.5">
                    <span className="text-xs font-medium text-white/90">{s.heritage}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
