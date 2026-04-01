import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allTransportQuery, pageBySlugQuery } from "@/lib/queries";
import { PortableText } from "@portabletext/react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Getting Here — Langport Life",
  description: "How to get to Langport, Somerset by train, bus, car, and bicycle. Parking information and travel tips.",
};

export const revalidate = 3600;

function TrainIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 5 3 5 5v11a3 3 0 003 3h1l-2 3h2l1-1.5h4L15 22h2l-2-3h1a3 3 0 003-3V5c0-2-3-3-7-3zM8 16.5a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2zM7 10V6h10v4H7z" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h1.5m5 0H16M6 3h12s2 0 2 2v10a3 3 0 01-3 3H7a3 3 0 01-3-3V5s0-2 2-2zm1 5h10M8.5 16a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7h4a3 3 0 010 6H9" />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h2l3 11.5M5.5 17.5l3-8h5l2 4.5" />
      <circle cx="16" cy="5.5" r="1.5" />
    </svg>
  );
}

interface TransportOption {
  _id: string;
  title: string;
  type: string;
  distance?: string;
  railLine?: string;
  journeyNotes?: string;
  routeNumber?: string;
  operator?: string;
  routeDescription?: string;
  frequency?: string;
  postcode?: string;
  isFree?: boolean;
  description?: string;
  website?: string;
}

export default async function GettingHerePage() {
  const [transport, page] = await Promise.all([
    client.fetch(allTransportQuery),
    client.fetch(pageBySlugQuery, { slug: "getting-here" }),
  ]);

  const trains = transport.filter((t: TransportOption) => t.type === "train");
  const buses = transport.filter((t: TransportOption) => t.type === "bus");
  const parking = transport.filter((t: TransportOption) => t.type === "parking");
  const cycling = transport.filter((t: TransportOption) => t.type === "cycling");

  return (
    <>
      <PageHero
        section="getting-here"
        title="Getting Here"
        subtitle="Langport is nestled in the heart of the Somerset Levels, easy to reach by road, rail, and bus."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Intro from Sanity page (if exists) */}
        {page?.content ? (
          <div className="mx-auto max-w-3xl text-center mb-16 prose">
            <PortableText value={page.content} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-lg text-gray-600 leading-relaxed">
              Langport sits on the A372 between Bridgwater and the A303, making it
              easily accessible from all directions. Whether you&apos;re arriving
              by train, bus, or car, you&apos;ll find your way to our beautiful
              market town with ease.
            </p>
          </div>
        )}

        {/* By Train */}
        {trains.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-copper/10 text-copper">
                <TrainIcon />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">By Train</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Nearest stations are 12&ndash;15 miles away, with onward bus or taxi connections
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trains.map((station: TransportOption) => (
                <div key={station._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-copper/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-gray-900">{station.title}</h3>
                      {station.distance && (
                        <span className="inline-block mt-1 rounded-full bg-copper/10 px-3 py-0.5 text-xs font-semibold text-copper">
                          {station.distance}
                        </span>
                      )}
                    </div>
                  </div>
                  {station.railLine && <p className="mt-3 text-sm text-gray-500">{station.railLine}</p>}
                  {station.journeyNotes && <p className="mt-1 text-sm text-gray-700">{station.journeyNotes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* By Bus */}
        {buses.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BusIcon />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">By Bus</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Regular services connect Langport to Taunton, Yeovil, and surrounding towns
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {buses.map((bus: TransportOption) => (
                <div key={bus._id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
                  {bus.routeNumber && (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-xl font-bold text-white">
                      {bus.routeNumber}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-heading text-lg font-bold text-gray-900">
                        {bus.routeDescription || bus.title}
                      </h3>
                      {bus.operator && (
                        <span className="text-xs font-medium text-gray-400">{bus.operator}</span>
                      )}
                    </div>
                    {bus.description && <p className="mt-1 text-sm text-gray-700">{bus.description}</p>}
                    {bus.frequency && <p className="mt-0.5 text-xs text-gray-500">{bus.frequency}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Parking */}
        {parking.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 text-green">
                <ParkingIcon />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">Parking</h2>
                <p className="text-sm text-gray-500 mt-0.5">Free parking is available throughout the town</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {parking.map((loc: TransportOption) => (
                <div key={loc._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-green/40">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-lg font-bold text-gray-900">{loc.title}</h3>
                    <span className="rounded-full bg-green/10 px-3 py-0.5 text-xs font-bold text-green">
                      {loc.isFree ? "Free" : "Paid"}
                    </span>
                  </div>
                  {loc.postcode && <p className="text-xs font-medium text-gray-400 mb-2">{loc.postcode}</p>}
                  {loc.description && <p className="text-sm text-gray-700 leading-relaxed">{loc.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cycling */}
        {cycling.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
                <CycleIcon />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">By Bicycle</h2>
                <p className="text-sm text-gray-500 mt-0.5">Flat terrain makes the Somerset Levels ideal for cycling</p>
              </div>
            </div>
            {cycling.map((c: TransportOption) => (
              <div key={c._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {c.description && <p className="text-sm text-gray-700 leading-relaxed">{c.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Fallback if no transport data yet */}
        {transport.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            Transport information coming soon.
          </p>
        )}
      </div>
    </>
  );
}
