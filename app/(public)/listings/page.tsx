import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allListingsQuery, listingCategoriesQuery } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        Business Directory
      </h1>
      <p className="mt-2 text-gray-600">
        Discover local shops, services, and places to eat in Langport.
      </p>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((cat: any) => (
            <span
              key={cat._id}
              className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
              <span className="ml-1 text-gray-400">({cat.count})</span>
            </span>
          ))}
        </div>
      )}

      {listings.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: any) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-600">
          No business listings yet. Check back soon!
        </p>
      )}
    </div>
  );
}
