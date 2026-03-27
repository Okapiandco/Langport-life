import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { listingBySlugQuery } from "@/lib/queries";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await client.fetch(listingBySlugQuery, { slug });
  if (!listing) return { title: "Listing Not Found" };
  return { title: listing.title, description: `${listing.title} in ${listing.town || "Langport"}` };
}

const DAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
] as const;

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await client.fetch(listingBySlugQuery, { slug });
  if (!listing) notFound();

  const hasHours = DAYS.some((d) => listing[`${d}Open`]);
  const hasCoordinates = listing.coordinates?.lat && listing.coordinates?.lng;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {listing.image?.asset && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg sm:h-96">
          <Image
            src={urlFor(listing.image).width(900).height(500).url()}
            alt={listing.image.alt || listing.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <header>
        {listing.category && (
          <p className="text-sm font-medium text-copper">
            {listing.category.icon && <span className="mr-1">{listing.category.icon}</span>}
            {listing.category.name}
          </p>
        )}
        <h1 className="mt-1 font-heading text-4xl font-bold text-gray-900">
          {listing.title}
        </h1>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {listing.description && (
            <div className="prose max-w-none">
              <PortableText value={listing.description} />
            </div>
          )}

          {listing.images && listing.images.length > 0 && (
            <div className="mt-8">
              <h2 className="font-heading text-2xl font-bold text-gray-900">Photos</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {listing.images.map((img: any, i: number) => (
                  <div key={i} className="relative h-40 overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(img).width(300).height(200).url()}
                      alt={img.alt || `${listing.title} photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-heading text-lg font-semibold text-gray-900">
              Contact
            </h3>
            {listing.street && (
              <p className="mt-2 text-sm text-gray-700">
                {listing.street}, {listing.town} {listing.postcode}
              </p>
            )}
            {listing.phone && (
              <p className="mt-2 text-sm">
                <a href={`tel:${listing.phone}`} className="text-primary">{listing.phone}</a>
              </p>
            )}
            {listing.email && (
              <p className="mt-1 text-sm">
                <a href={`mailto:${listing.email}`} className="text-primary">{listing.email}</a>
              </p>
            )}
            {listing.website && (
              <p className="mt-1 text-sm">
                <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                  Visit website
                </a>
              </p>
            )}
          </div>

          {hasCoordinates && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <iframe
                title={`Map showing ${listing.title}`}
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.coordinates.lng - 0.005}%2C${listing.coordinates.lat - 0.003}%2C${listing.coordinates.lng + 0.005}%2C${listing.coordinates.lat + 0.003}&layer=mapnik&marker=${listing.coordinates.lat}%2C${listing.coordinates.lng}`}
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${listing.coordinates.lat}&mlon=${listing.coordinates.lng}#map=17/${listing.coordinates.lat}/${listing.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 px-4 py-2 text-center text-xs text-primary hover:text-primary-dark no-underline"
              >
                View larger map
              </a>
            </div>
          )}

          {hasHours && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Opening Hours
              </h3>
              <dl className="mt-2 space-y-1">
                {DAYS.map((day) => {
                  const open = listing[`${day}Open`];
                  const close = listing[`${day}Close`];
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <dt className="capitalize text-gray-700">{day}</dt>
                      <dd className="text-gray-600">
                        {open ? `${open} — ${close}` : "Closed"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-light-blue/50 px-2 py-0.5 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
