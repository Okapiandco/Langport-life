"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

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

function DateStamp({ date }: { date: string }) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-center rounded-lg bg-white px-2.5 py-1.5 text-center shadow-md">
      <span className="font-heading text-xl font-bold leading-tight text-gray-900">
        {day}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
        {month}
      </span>
    </div>
  );
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug.current}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <DateStamp date={event.date} />
        {event.image?.asset ? (
          <Image
            src={urlFor(event.image).width(400).height(240).url()}
            alt={event.image.alt || event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-gray-300">
            <svg
              className="h-12 w-12"
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
          <span className="absolute top-3 right-3 z-10 rounded-full bg-green px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            Free
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
          {event.title}
        </h3>
        {event.venue && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0"
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
            {event.venue.title}
          </p>
        )}
        {event.eventType && (
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {event.eventType}
          </span>
        )}
      </div>
    </Link>
  );
}
