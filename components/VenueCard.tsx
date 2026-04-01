import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { getFacilityLabel } from "@/lib/utils";

interface VenueCardProps {
  venue: {
    _id: string;
    title: string;
    slug: { current: string };
    town?: string;
    capacity?: number;
    facilities?: string[];
    image?: { asset: { url: string }; alt?: string };
  };
}

export default function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link
      href={`/venues/${venue.slug.current}`}
      className="group block break-inside-avoid mb-5 overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
    >
      {venue.image?.asset ? (
        <div className="relative w-full overflow-hidden">
          <Image
            src={urlFor(venue.image).width(600).url()}
            alt={venue.image.alt || venue.title}
            width={600}
            height={400}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-primary/5">
          <span className="text-4xl font-heading font-bold text-primary/20">
            {venue.title?.[0]}
          </span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
          {venue.title}
        </h3>
        {venue.town && (
          <p className="mt-1 text-sm text-gray-600">{venue.town}</p>
        )}
        {venue.capacity && (
          <p className="mt-1 text-sm text-gray-500">
            Capacity: {venue.capacity}
          </p>
        )}
        {venue.facilities && venue.facilities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {venue.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="inline-block rounded-full bg-light-blue/50 px-2 py-0.5 text-xs text-gray-700"
              >
                {getFacilityLabel(f)}
              </span>
            ))}
            {venue.facilities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{venue.facilities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
