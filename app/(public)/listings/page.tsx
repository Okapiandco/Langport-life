import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { allListingsQuery, listingCategoriesQuery } from "@/lib/queries";
import ListingSearch from "@/components/ListingSearch";
import PageHero from "@/components/PageHero";
import MapView from "@/components/MapView";

export const metadata: Metadata = {
  title: "Shops & Services — Langport Life",
  description: "Find shops, services, food & drink, and more in Langport and the surrounding area.",
};

export const revalidate = 3600;

export default async function ListingsPage() {
  const [listings, categories] = await Promise.all([
    client.fetch(allListingsQuery),
    client.fetch(listingCategoriesQuery),
  ]);

  return (
    <>
      <PageHero
        section="listings"
        title="Shops & Services"
        subtitle="Discover local shops, services, and places to eat in Langport and the surrounding area."
      />

      {/* Intro section */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            Langport and the surrounding villages are home to a wonderful mix of independent
            shops, cafes, pubs, professional services, and local businesses. Whether you&apos;re
            a resident or a visitor, you&apos;ll find everything you need right here.
          </p>
          <p className="mt-4 text-gray-600">
            Run a local business? Get listed for free so customers can find you.
            If you need to update your listing, just email the town clerk.
          </p>
          <Link
            href="/submit/listing"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-white no-underline hover:bg-primary/90 transition-colors"
          >
            Add Your Business
          </Link>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <MapView
          pins={listings
            .filter((l: { coordinates?: { lat: number; lng: number } }) => l.coordinates?.lat)
            .map((l: { _id: string; title: string; slug: { current: string }; coordinates: { lat: number; lng: number }; street?: string; town?: string; category?: { name?: string } }) => ({
              id: l._id,
              title: l.title,
              href: `/listings/${l.slug.current}`,
              lat: l.coordinates.lat,
              lng: l.coordinates.lng,
              category: l.category?.name,
              address: [l.street, l.town].filter(Boolean).join(", "),
            }))}
          height="400px"
        />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ListingSearch listings={listings} categories={categories} />
      </div>
    </>
  );
}
