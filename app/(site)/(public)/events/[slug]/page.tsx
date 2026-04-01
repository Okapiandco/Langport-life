import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { eventBySlugQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import EventCard from "@/components/EventCard";
import { groq } from "next-sanity";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await client.fetch(eventBySlugQuery, { slug });
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: `${event.title} at ${event.venue?.title || "Langport"} on ${formatDateTime(event.date)}`,
  };
}

const relatedEventsQuery = groq`
  *[_type == "event" && status == "published" && date >= now() && _id != $id] | order(date asc) [0...3] {
    _id, title, slug, date, eventType, isFree,
    image { asset->{url}, alt },
    venue->{ title }
  }
`;

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await client.fetch(eventBySlugQuery, { slug });
  if (!event) notFound();

  const relatedEvents = await client.fetch(relatedEventsQuery, {
    id: event._id,
  });

  const hasCoordinates =
    event.venue?.coordinates?.lat && event.venue?.coordinates?.lng;

  return (
    <>
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Title & accent bar */}
        <header>
          <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          <div className="mt-3 h-1 w-20 rounded-full bg-primary" />
          {event.status === "cancelled" && (
            <p className="mt-4 inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
              This event has been cancelled
            </p>
          )}
        </header>

        {/* Two-column: image + content left, sidebar right */}
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero image */}
            {event.image?.asset && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                <Image
                  src={urlFor(event.image).width(900).height(506).url()}
                  alt={event.image.alt || event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-3">
              {event.eventType && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {event.eventType}
                </span>
              )}
              {event.isFree && (
                <span className="rounded-full bg-green/10 px-3 py-1 text-sm font-medium text-green">
                  Free Entry
                </span>
              )}
              {event.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            {event.description && (
              <div className="prose prose-gray max-w-none prose-headings:font-heading prose-a:text-primary">
                <PortableText value={event.description} />
              </div>
            )}

            {/* Accessibility */}
            {event.accessibilityInfo && (
              <div className="rounded-xl bg-light-blue/20 border border-light-blue/40 p-5">
                <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-gray-900">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </svg>
                  Accessibility
                </h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  {event.accessibilityInfo}
                </p>
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
                    title={`Map showing ${event.venue.title}`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.venue.coordinates.lng - 0.005}%2C${event.venue.coordinates.lat - 0.003}%2C${event.venue.coordinates.lng + 0.005}%2C${event.venue.coordinates.lat + 0.003}&layer=mapnik&marker=${event.venue.coordinates.lat}%2C${event.venue.coordinates.lng}`}
                  />
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${event.venue.coordinates.lat}&mlon=${event.venue.coordinates.lng}#map=17/${event.venue.coordinates.lat}/${event.venue.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 px-4 py-2 text-center text-sm text-primary hover:text-primary-dark"
                  >
                    View larger map
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Venue area label */}
            {event.venue && (
              <p className="font-heading text-lg font-bold text-primary">
                {event.venue.town || "Langport"}
              </p>
            )}

            {/* Date */}
            <div className="flex items-start gap-3">
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
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              <p className="text-sm text-gray-700">
                {formatDateTime(event.date)}
                {event.endDate && (
                  <>
                    {" "}
                    &ndash; {formatDateTime(event.endDate)}
                  </>
                )}
              </p>
            </div>

            {/* Venue & address */}
            {event.venue && (
              <div className="flex items-start gap-3">
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
                <div className="text-sm text-gray-700">
                  <Link
                    href={`/venues/${event.venue.slug?.current}`}
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    {event.venue.title}
                  </Link>
                  {event.venue.street && (
                    <p className="mt-0.5">
                      {event.venue.street}, {event.venue.town}{" "}
                      {event.venue.postcode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ticket info */}
            <div className="flex items-start gap-3">
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
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                />
              </svg>
              <p className="text-sm text-gray-700">
                {event.isFree
                  ? "Free entry"
                  : event.ticketsUrl
                    ? "See website for ticket info"
                    : "Contact organiser for details"}
              </p>
            </div>

            {/* Book / Get Tickets button */}
            {event.ticketsUrl && (
              <a
                href={event.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-copper px-4 py-3 text-center font-medium text-white no-underline transition-colors hover:bg-copper-dark"
              >
                Book now
              </a>
            )}

            <div className="border-t border-gray-200" />

            {/* Contact */}
            {(event.organiser || event.contactEmail) && (
              <div>
                <h3 className="font-heading text-base font-bold text-primary">
                  Contact
                </h3>
                <div className="mt-2 space-y-1.5 text-sm text-gray-700">
                  {event.organiser && <p>Organised by {event.organiser}</p>}
                  {event.contactName && <p>{event.contactName}</p>}
                  {event.contactEmail && (
                    <a
                      href={`mailto:${event.contactEmail}`}
                      className="block text-primary hover:text-primary-dark"
                    >
                      {event.contactEmail}
                    </a>
                  )}
                  {event.contactPhone && (
                    <a
                      href={`tel:${event.contactPhone}`}
                      className="block text-primary hover:text-primary-dark"
                    >
                      {event.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>

      {/* Related Events */}
      {relatedEvents?.length > 0 && (
        <section className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Events you may be interested in&hellip;
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-copper" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((ev: any) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
