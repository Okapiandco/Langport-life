import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { eventBySlugQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export const revalidate = 60;

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

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await client.fetch(eventBySlugQuery, { slug });
  if (!event) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {event.image?.asset && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg sm:h-96">
          <Image
            src={urlFor(event.image).width(900).height(500).url()}
            alt={event.image.alt || event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <header>
        <p className="text-sm font-medium text-primary">
          {formatDateTime(event.date)}
          {event.endDate && ` — ${formatDateTime(event.endDate)}`}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-gray-900">
          {event.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
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
          {event.status === "cancelled" && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              Cancelled
            </span>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {event.description && (
            <div className="prose max-w-none">
              <PortableText value={event.description} />
            </div>
          )}
          {event.accessibilityInfo && (
            <div className="mt-6 rounded-lg bg-light-blue/30 p-4">
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Accessibility
              </h3>
              <p className="mt-1 text-sm text-gray-700">{event.accessibilityInfo}</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {event.venue && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Venue
              </h3>
              <Link
                href={`/venues/${event.venue.slug?.current}`}
                className="mt-1 block font-medium text-primary"
              >
                {event.venue.title}
              </Link>
              {event.venue.street && (
                <p className="mt-1 text-sm text-gray-600">
                  {event.venue.street}, {event.venue.town} {event.venue.postcode}
                </p>
              )}
              {event.venue.phone && (
                <p className="mt-1 text-sm text-gray-600">{event.venue.phone}</p>
              )}
            </div>
          )}

          {(event.organiser || event.contactEmail) && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                Contact
              </h3>
              {event.organiser && (
                <p className="mt-1 text-sm text-gray-700">
                  Organised by: {event.organiser}
                </p>
              )}
              {event.contactName && (
                <p className="mt-1 text-sm text-gray-700">{event.contactName}</p>
              )}
              {event.contactEmail && (
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="mt-1 block text-sm text-primary"
                >
                  {event.contactEmail}
                </a>
              )}
              {event.contactPhone && (
                <p className="mt-1 text-sm text-gray-600">{event.contactPhone}</p>
              )}
            </div>
          )}

          {event.ticketsUrl && (
            <a
              href={event.ticketsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md bg-copper px-4 py-3 text-center font-medium text-white no-underline hover:bg-copper-dark transition-colors"
            >
              Get Tickets
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}
