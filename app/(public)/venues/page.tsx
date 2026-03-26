import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allVenuesQuery } from "@/lib/queries";
import VenueCard from "@/components/VenueCard";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Venues",
  description: "Discover venues in Langport — pubs, halls, gardens, and more.",
};

export const revalidate = 60;

export default async function VenuesPage() {
  const venues = await client.fetch(allVenuesQuery);

  return (
    <>
      <PageHero
        section="things-to-do"
        title="Venues"
        subtitle="Find the perfect venue for your next event in Langport."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {venues.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {venues.map((venue: any) => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No venues listed yet.</p>
        )}
      </div>
    </>
  );
}
