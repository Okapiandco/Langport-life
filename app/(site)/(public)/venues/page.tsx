import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allVenuesQuery } from "@/lib/queries";
import VenueCard from "@/components/VenueCard";
import PageHero from "@/components/PageHero";
import MapView from "@/components/MapView";

export const metadata: Metadata = {
  title: "Venues",
  description: "Discover venues in Langport — pubs, halls, gardens, and more.",
};

export const revalidate = 3600;

export default async function VenuesPage() {
  const venues = await client.fetch(allVenuesQuery);

  return (
    <>
      <PageHero
        section="things-to-do"
        title="Venues"
        subtitle="Find the perfect venue for your next event in Langport."
      />
      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <MapView
          pins={venues
            .filter((v: { coordinates?: { lat: number; lng: number } }) => v.coordinates?.lat)
            .map((v: { _id: string; title: string; slug: { current: string }; coordinates: { lat: number; lng: number }; street?: string; town?: string }) => ({
              id: v._id,
              title: v.title,
              href: `/venues/${v.slug.current}`,
              lat: v.coordinates.lat,
              lng: v.coordinates.lng,
              address: [v.street, v.town].filter(Boolean).join(", "),
            }))}
          height="400px"
        />
      </section>

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
