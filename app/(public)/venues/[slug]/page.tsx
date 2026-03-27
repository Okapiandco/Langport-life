import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { venueBySlugQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import Gallery from "@/components/Gallery";
import VenueQRCode from "@/components/VenueQRCode";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venue = await client.fetch(venueBySlugQuery, { slug });
  if (!venue) return { title: "Venue Not Found" };
  return {
    title: venue.title,
    description: `${venue.title} in ${venue.town || "Langport"}`,
  };
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const venue = await client.fetch(venueBySlugQuery, { slug });
  if (!venue) notFound();

  const hasContact = venue.street || venue.phone || venue.email || venue.website;
  const hasCoordinates = venue.coordinates?.lat && venue.coordinates?.lng;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Title & accent bar */}
      <header>
        <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
          {venue.title}
        </h1>
        <div className="mt-3 h-1 w-20 rounded-full bg-primary" />
        {venue.town && (
          <p className="mt-3 text-sm text-gray-500">{venue.town}</p>
        )}
      </header>

      {/* Two-column layout */}
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero image */}
          {venue.image?.asset && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
              <Image
                src={urlFor(venue.image).width(1000).height(562).url()}
                alt={venue.image.alt || venue.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Description */}
          {venue.description && (
            <div className="prose prose-gray max-w-none prose-headings:font-heading prose-a:text-primary">
              <PortableText value={venue.description} />
            </div>
          )}

          {/* Map */}
          {hasCoordinates && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Map
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-copper" />
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                <iframe
                  title={`Map showing ${venue.title}`}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${venue.coordinates.lng - 0.005}%2C${venue.coordinates.lat - 0.003}%2C${venue.coordinates.lng + 0.005}%2C${venue.coordinates.lat + 0.003}&layer=mapnik&marker=${venue.coordinates.lat}%2C${venue.coordinates.lng}`}
                />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${venue.coordinates.lat}&mlon=${venue.coordinates.lng}#map=17/${venue.coordinates.lat}/${venue.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 px-4 py-2 text-center text-sm text-primary hover:text-primary-dark"
                >
                  View larger map
                </a>
              </div>
            </div>
          )}

          {/* Gallery */}
          <Gallery images={venue.images || []} title={venue.title} />

          {/* Events at this venue */}
          {venue.allEvents && venue.allEvents.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Events at {venue.title}
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-copper" />

              {/* Upcoming */}
              {venue.upcomingEvents && venue.upcomingEvents.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-green">
                    Upcoming
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {venue.upcomingEvents.map((event: any) => (
                      <Link
                        key={event._id}
                        href={`/events/${event.slug.current}`}
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                          {event.image?.asset ? (
                            <Image
                              src={urlFor(event.image)
                                .width(400)
                                .height(180)
                                .url()}
                              alt={event.image.alt || event.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-300">
                              <svg
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          {event.isFree && (
                            <span className="absolute top-2 right-2 rounded-full bg-green px-2 py-0.5 text-xs font-medium text-white">
                              Free
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-medium text-primary">
                            {formatDateTime(event.date)}
                          </p>
                          <p className="mt-1 font-heading text-base font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
                            {event.title}
                          </p>
                          {event.eventType && (
                            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary capitalize">
                              {event.eventType}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {venue.pastEvents && venue.pastEvents.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Past Events
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {venue.pastEvents.map((event: any) => (
                      <Link
                        key={event._id}
                        href={`/events/${event.slug.current}`}
                        className="group flex gap-3 rounded-lg border border-gray-100 bg-white p-3 no-underline hover:border-gray-200 hover:shadow-sm transition-all"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {event.image?.asset ? (
                            <Image
                              src={urlFor(event.image)
                                .width(64)
                                .height(64)
                                .url()}
                              alt={event.image.alt || event.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-300">
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            {formatDateTime(event.date)}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-gray-700 group-hover:text-primary line-clamp-2">
                            {event.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Contact Details */}
          {hasContact && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-primary">
                Contact Details
              </h3>

              {venue.street && (
                <div className="mt-3 flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                  <p className="text-sm text-gray-700">
                    {venue.street}
                    {venue.town && <>, {venue.town}</>}
                    {venue.postcode && <> {venue.postcode}</>}
                  </p>
                </div>
              )}

              {venue.phone && (
                <div className="mt-3 flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                  <a
                    href={`tel:${venue.phone}`}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    {venue.phone}
                  </a>
                </div>
              )}

              {venue.email && (
                <div className="mt-3 flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                  <a
                    href={`mailto:${venue.email}`}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    {venue.email}
                  </a>
                </div>
              )}

              {venue.website && (
                <div className="mt-3 flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Venue Key Features */}
          {venue.facilities && venue.facilities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-primary">
                Venue Key Features
              </h3>
              <ul className="mt-3 space-y-2">
                {venue.facilities.map((f: string) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Capacity */}
          {venue.capacity && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-primary">
                Capacity
              </h3>
              <p className="mt-2 text-sm text-gray-700">{venue.capacity}</p>
            </div>
          )}

          {/* Event count stat */}
          {venue.allEvents && venue.allEvents.length > 0 && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 text-center">
              <p className="font-heading text-3xl font-bold text-primary">
                {venue.allEvents.length}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                events at this venue
              </p>
            </div>
          )}

          {/* QR Code */}
          <VenueQRCode
            venueUrl={`https://langport.life/venues/${slug}`}
            venueName={venue.title}
          />
        </aside>
      </div>
    </article>
  );
}
