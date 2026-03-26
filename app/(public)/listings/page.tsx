import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allListingsQuery, listingCategoriesQuery } from "@/lib/queries";
import ListingSearch from "@/components/ListingSearch";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Business Listings",
  description: "Find shops, services, food & drink, and more in Langport.",
};

export const revalidate = 60;

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
        subtitle="Discover local shops, services, and places to eat in Langport."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ListingSearch listings={listings} categories={categories} />
      </div>
    </>
  );
}
