import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { venueBySlugQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venue = await client.fetch(venueBySlugQuery, { slug });
  if (!venue) return { title: "Venue Not Found" };
  return { title: venue.title, description: `${venue.title} in ${venue.town || "Langport"}` };
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const venue = await client.fetch(venueBySlugQuery, { slug });
  if (!venue) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {venue.image?.asset && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg sm:h-96">
          <Image
            src={urlFor(venue.image).width(900).height(500).url()}
            alt={venue.image.alt || venue.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="font-heading text-4xl font-bold text-gray-900">
        {venue.title}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {venue.description && (
            <div className="prose max-w-none">
              <PortableText value={venue.description} />
            </div>
          )}

          {/* Gallery */}
          {venue.images && venue.images.length > 0 && (
            <div className="mt-8">
              <h2 className="font-heading text-2xl font-bold text-gray-900">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {venue.images.map((img: any, i: number) => (
                  <div key={i} className="relative h-40 overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(img).width(300).height(200).url()}
                      alt={img.alt || `${venue.title} photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming events at this venue */}
          {venue.events && venue.events.length > 0 && (
            <div className="mt-8">
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Upcoming Events
              </h2>
              <ul className="mt-4 divide-y divide-gray-200">
                {venue.events.map((event: any) => (
                  <li key={event._id} className="py-3">
                    <Link
                      href={`/events/${event.slug.current}`}
                      className="flex items-center justify-between no-underline hover:text-primary"
                    >
                      <span className="font-medium text-gray-900">{event.title}</span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(event.date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-heading text-lg font-semibold text-gray-900">
              Details
            </h3>
            {venue.street && (
              <p className="mt-2 text-sm text-gray-700">
                {venue.street}, {venue.town} {venue.postcode}
              </p>
            )}
            {venue.phone && (
              <p className="mt-2 text-sm">
                <span className="text-gray-500">Phone:</span>{" "}
                <a href={`tel:${venue.phone}`} className="text-primary">{venue.phone}</a>
              </p>
            )}
            {venue.email && (
              <p className="mt-1 text-sm">
                <span className="text-gray-500">Email:</span>{" "}
                <a href={`mailto:${venue.email}`} className="text-primary">{venue.email}</a>
              </p>
            )}
            {venue.website && (
              <p className="mt-1 text-sm">
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                  Visit website
                </a>
              </p>
            )}
            {venue.capacity && (
              <p className="mt-2 text-sm text-gray-700">
                Capacity: {venue.capacity}
              </p>
            )}
          </div>

          {venue.facilities && venue.facilities.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Facilities
              </h3>
              <ul className="mt-2 space-y-1">
                {venue.facilities.map((f: string) => (
                  <li key={f} className="text-sm text-gray-700">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
