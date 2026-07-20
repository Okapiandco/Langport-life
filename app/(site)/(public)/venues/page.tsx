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
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-sm">
            {venues.length > 0
              ? `${venues.length} venue${venues.length === 1 ? "" : "s"} listed`
              : "Be the first to add your venue"}
          </p>
          <a
            href="/submit/venue"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary/90 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Submit Your Venue
          </a>
        </div>
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
