import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allVenuesQuery } from "@/lib/queries";
import VenueCard from "@/components/VenueCard";

export const metadata: Metadata = {
  title: "Venues",
  description: "Discover venues in Langport — pubs, halls, gardens, and more.",
};

export const revalidate = 60;

export default async function VenuesPage() {
  const venues = await client.fetch(allVenuesQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">Venues</h1>
      <p className="mt-2 text-gray-600">
        Find the perfect venue for your next event in Langport.
      </p>

      {venues.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue: any) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-600">No venues listed yet.</p>
      )}
    </div>
  );
}
