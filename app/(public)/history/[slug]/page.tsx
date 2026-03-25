import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { historicSiteBySlugQuery } from "@/lib/queries";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await client.fetch(historicSiteBySlugQuery, { slug });
  if (!site) return { title: "Historic Site Not Found" };
  return { title: site.title, description: `Learn about ${site.title} in Langport` };
}

export default async function HistoricSitePage({ params }: Props) {
  const { slug } = await params;
  const site = await client.fetch(historicSiteBySlugQuery, { slug });
  if (!site) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {site.image?.asset && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg sm:h-96">
          <Image
            src={urlFor(site.image).width(900).height(500).url()}
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

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        {site.heritage && (
          <span className="rounded-full bg-copper/10 px-3 py-1 font-medium text-copper">
            {site.heritage}
          </span>
        )}
        {site.constructedYear && <span>Constructed: {site.constructedYear}</span>}
        {site.currentUse && <span>Current use: {site.currentUse}</span>}
        {site.openToPublic !== undefined && (
          <span>{site.openToPublic ? "Open to public" : "Not open to public"}</span>
        )}
      </div>

      <div className="mt-8">
        {site.description && (
          <div className="prose max-w-none">
            <PortableText value={site.description} />
          </div>
        )}

        {site.historicalSignificance && (
          <div className="mt-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Historical Significance
            </h2>
            <div className="prose mt-4 max-w-none">
              <PortableText value={site.historicalSignificance} />
            </div>
          </div>
        )}
      </div>

      {site.address && (
        <p className="mt-6 text-sm text-gray-600">
          <strong>Address:</strong> {site.address}
        </p>
      )}

      {site.images && site.images.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            Gallery
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {site.images.map((img: any, i: number) => (
              <div key={i} className="relative h-48 overflow-hidden rounded-lg">
                <Image
                  src={urlFor(img).width(400).height(300).url()}
                  alt={img.alt || `${site.title} photo ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
