import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { formatDateTime } from "@/lib/utils";

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    slug: { current: string };
    date: string;
    eventType?: string;
    isFree?: boolean;
    tags?: string[];
    image?: { asset: { url: string }; alt?: string };
    venue?: { title: string };
  };
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug.current}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
    >
      {event.image?.asset && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={urlFor(event.image).width(400).height(240).url()}
            alt={event.image.alt || event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <p className="text-sm font-medium text-primary">
          {formatDateTime(event.date)}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
          {event.title}
        </h3>
        {event.venue && (
          <p className="mt-1 text-sm text-gray-600">{event.venue.title}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {event.eventType && (
            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {event.eventType}
            </span>
          )}
          {event.isFree && (
            <span className="inline-block rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
              Free
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
