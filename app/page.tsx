import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";
import { homepageQuery, siteSettingsQuery } from "@/lib/queries";
import EventCard from "@/components/EventCard";

export const revalidate = 3600;

// Fallback cards when siteSettings hasn't been configured yet
const defaultNavCards = [
  { title: "What's on", href: "/events", color: "primary", image: "/nav-whats-on.jpg" },
  { title: "Things to do", href: "/things-to-do", color: "copper", image: "/nav-things-to-do.jpg" },
  { title: "Shops & Services", href: "/listings", color: "light-blue", image: "/nav-shops.jpg" },
  { title: "History", href: "/history", color: "green", image: "/nav-history.jpg" },
  { title: "Environment", href: "/environment", color: "maroon", image: "/nav-environment.jpg" },
  { title: "Town Council", href: "/council", color: "dark-green", image: "/nav-council.jpg" },
];

export default async function HomePage() {
  const [data, settings] = await Promise.all([
    client.fetch(homepageQuery),
    client.fetch(siteSettingsQuery),
  ]);

  const navCards = settings?.homepageCards?.length
    ? settings.homepageCards
    : defaultNavCards;

  const didYouKnow =
    settings?.didYouKnow ||
    "Langport was once one of the most important towns in Somerset, serving as a major inland port and mint town in Saxon times. The Hanging Chapel on the hill is one of only a handful of such structures remaining in England.";

  return (
    <>
      {/* Hero */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0">
          {settings?.homepageHero?.image?.asset ? (
            <Image
              src={urlFor(settings.homepageHero.image).width(1600).height(900).url()}
              alt="Langport"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <Image
              src="/hero-langport.jpg"
              alt="A view down the historic main street of Langport, Somerset"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Decorative flourish */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[240px] opacity-[0.07]"
          viewBox="0 0 600 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M300,100 C300,100 240,30 160,50 C80,70 60,140 120,160 C180,180 220,140 200,100 C180,60 120,40 80,80" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M300,100 C300,100 360,30 440,50 C520,70 540,140 480,160 C420,180 380,140 400,100 C420,60 480,40 520,80" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>

        {/* Wave */}
        <svg className="absolute bottom-0 left-0 w-full text-white" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,64 C240,110 480,20 720,64 C960,108 1200,20 1440,64 L1440,120 L0,120 Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M0,80 C320,120 640,40 960,80 C1120,100 1280,60 1440,80 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-36 sm:px-6 sm:pt-36 sm:pb-44 lg:px-8 lg:pt-44 lg:pb-52 text-center">
          <h1 className="font-heading text-4xl font-bold drop-shadow-lg sm:text-5xl lg:text-6xl">
            {settings?.homepageHero?.heading || "Welcome to Langport Life"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 drop-shadow">
            {settings?.homepageHero?.subheading ||
              "Your community hub for events, venues, businesses, and council information in Langport, Somerset."}
          </p>
        </div>
      </section>

      {/* Events */}
      {data.upcomingEvents?.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-3xl font-bold text-gray-900">What&apos;s On</h2>
              <Link href="/events" className="text-sm font-medium text-primary hover:text-primary-dark no-underline">
                View all events &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.upcomingEvents.slice(0, 8).map((event: any) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation Cards */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-gray-900 text-center">Explore Langport</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-gray-600">
            Discover everything our historic Somerset town has to offer.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {navCards.map((card: any) => {
              const color = card.color || "primary";
              const imageSrc = card.image?.asset?.url
                || card.image
                || "/nav-whats-on.jpg";

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group block overflow-hidden rounded-lg no-underline shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className={`bg-${color} px-5 py-4`}>
                    <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
                      {card.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="relative overflow-hidden bg-copper text-white">
        <svg className="absolute -right-16 top-1/2 -translate-y-1/2 h-72 w-72 text-white/10" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="100" fill="currentColor" />
        </svg>
        <svg className="absolute -right-8 top-1/2 -translate-y-1/2 h-48 w-48 text-white/5" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="100" fill="currentColor" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold">List your business or event</h2>
              <p className="mt-4 text-lg text-white/90 leading-relaxed">
                Langport Life is the community hub for our historic Somerset town. We help local businesses, venues, and event organisers connect with residents and visitors alike.
              </p>
              <Link
                href="/submit"
                className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-white bg-transparent px-6 py-3 font-medium text-white no-underline transition-colors hover:bg-white hover:text-copper"
              >
                Find out more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-heading text-4xl font-bold">{data.eventCount || 0}</p>
                <p className="mt-1 text-sm text-white/80">Upcoming events</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold">{data.venueCount || 0}</p>
                <p className="mt-1 text-sm text-white/80">Local venues</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold">{data.listingCount || 0}</p>
                <p className="mt-1 text-sm text-white/80">Shops &amp; services</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold">{data.siteCount || 0}</p>
                <p className="mt-1 text-sm text-white/80">Historic sites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {data.latestArticles?.length > 0 && (
        <section className="relative overflow-hidden">
          <svg className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[500px] w-[500px] text-light-blue/20" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="100" fill="currentColor" />
          </svg>
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-gray-900">Featured Articles</h2>
                <p className="mt-2 text-gray-600">News and stories from the Langport community.</p>
              </div>
              <Link href="/news" className="hidden text-sm font-medium text-primary hover:text-primary-dark sm:block">
                View all &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.latestArticles.map((article: any, i: number) => (
                <Link
                  key={article._id}
                  href={`/news/${article.slug.current}`}
                  className={`group relative block overflow-hidden rounded-xl no-underline shadow-md transition-shadow hover:shadow-xl ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
                >
                  <div className={`relative w-full overflow-hidden ${i === 0 ? "aspect-[3/2]" : "aspect-[4/3]"}`}>
                    {article.image?.asset ? (
                      <Image
                        src={urlFor(article.image).width(i === 0 ? 800 : 400).height(i === 0 ? 533 : 300).url()}
                        alt={article.image.alt || article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                      {article.category?.name && (
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                          {article.category.name}
                        </span>
                      )}
                      <h3 className={`mt-2 font-heading font-bold text-white drop-shadow ${i === 0 ? "text-2xl sm:text-3xl" : "text-lg"}`}>
                        {article.title}
                      </h3>
                      {i === 0 && article.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-white/80">{article.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Historic Sites */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-3xl font-bold text-gray-900">Historic Langport</h2>
            <Link href="/history" className="text-sm font-medium text-primary hover:text-primary-dark">
              Explore history &rarr;
            </Link>
          </div>
          {data.historicSites?.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                    <h3 className="font-heading text-base font-semibold text-gray-900 group-hover:text-primary">{site.title}</h3>
                    {site.heritage && <p className="mt-1 text-xs text-copper">{site.heritage}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Did You Know */}
      <section className="border-t border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <h3 className="font-heading text-lg font-bold text-gray-900">Did you know?</h3>
          <p className="mt-2 text-gray-600 leading-relaxed">{didYouKnow}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold">Got an event to share?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Submit your event and reach the Langport community. It&apos;s free and easy to get listed.
          </p>
          <Link
            href="/submit"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-medium text-primary no-underline hover:bg-gray-100 transition-colors"
          >
            Submit an Event
          </Link>
        </div>
      </section>
    </>
  );
}
