import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import { homepageQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import EventCard from "@/components/EventCard";

export const revalidate = 60;

export default async function HomePage() {
  const data = await client.fetch(homepageQuery);

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl font-bold sm:text-5xl lg:text-6xl">
            Welcome to Langport Life
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Your community hub for events, venues, businesses, and council
            information in Langport, Somerset.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-md bg-white px-6 py-3 font-medium text-primary no-underline hover:bg-gray-100 transition-colors"
            >
              Explore Events
            </Link>
            <Link
              href="/listings"
              className="rounded-md border-2 border-white px-6 py-3 font-medium text-white no-underline hover:bg-white/10 transition-colors"
            >
              Find a Business
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl font-bold text-gray-900">
            Upcoming Events
          </h2>
          <Link href="/events" className="text-sm font-medium text-primary">
            View all events &rarr;
          </Link>
        </div>
        {data.upcomingEvents?.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.upcomingEvents.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-gray-600">
            No upcoming events at the moment. Check back soon!
          </p>
        )}
      </section>

      {/* Historic Sites */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-3xl font-bold text-gray-900">
              Historic Langport
            </h2>
            <Link href="/history" className="text-sm font-medium text-primary">
              Explore history &rarr;
            </Link>
          </div>
          {data.historicSites?.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.historicSites.map((site: any) => (
                <Link
                  key={site._id}
                  href={`/history/${site.slug.current}`}
                  className="group block overflow-hidden rounded-lg bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
                >
                  {site.image?.asset && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={urlFor(site.image).width(300).height(200).url()}
                        alt={site.image.alt || site.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-heading text-base font-semibold text-gray-900 group-hover:text-primary">
                      {site.title}
                    </h3>
                    {site.heritage && (
                      <p className="mt-1 text-xs text-copper">{site.heritage}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest News */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-gray-900">
          Latest News
        </h2>
        {data.latestArticles?.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.latestArticles.map((article: any) => (
              <Link
                key={article._id}
                href={`/council/${article.slug.current}`}
                className="group block rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md"
              >
                <p className="text-sm text-gray-500">
                  {article.category?.name}
                </p>
                <h3 className="mt-1 font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {article.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-gray-600">No news articles yet.</p>
        )}
      </section>

      {/* CTA */}
      <section className="bg-copper text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold">
            Got an event to share?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Submit your event and reach the Langport community.
          </p>
          <Link
            href="/dashboard/my-events/new"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-medium text-copper no-underline hover:bg-gray-100 transition-colors"
          >
            Submit an Event
          </Link>
        </div>
      </section>
    </>
  );
}
