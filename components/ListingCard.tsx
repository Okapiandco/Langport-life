import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface ListingCardProps {
  listing: {
    _id: string;
    title: string;
    slug: { current: string };
    town?: string;
    phone?: string;
    image?: { asset: { url: string }; alt?: string };
    category?: { name: string; icon?: string; color?: string };
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.slug.current}`}
      className="group block break-inside-avoid mb-5 overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
    >
      {listing.image?.asset ? (
        <div className="relative w-full overflow-hidden">
          <Image
            src={urlFor(listing.image).width(600).url()}
            alt={listing.image.alt || listing.title}
            width={600}
            height={400}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-primary/5">
          <span className="text-4xl font-heading font-bold text-primary/20">
            {listing.title?.[0]}
          </span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
          {listing.title}
        </h3>
        {listing.category && (
          <p className="mt-1 text-sm text-copper font-medium">
            {listing.category.icon && <span className="mr-1">{listing.category.icon}</span>}
            {listing.category.name}
          </p>
        )}
        {listing.town && (
          <p className="mt-1 text-sm text-gray-600">{listing.town}</p>
        )}
        {listing.phone && (
          <p className="mt-1 text-sm text-gray-500">{listing.phone}</p>
        )}
      </div>
    </Link>
  );
}
