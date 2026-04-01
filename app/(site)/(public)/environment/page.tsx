import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { siteSettingsQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Environment & Flooding",
  description:
    "Flooding information, environmental resources, and conservation for Langport and the Somerset Levels.",
};

export const revalidate = 3600;

function WaterIcon() {
  return (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M3 12h18M3 16.5h18" />
    </svg>
  );
}

function WeatherIcon() {
  return (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  );
}

function WasteIcon() {
  return (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
  );
}

export default async function EnvironmentPage() {
  const settings = await client.fetch(siteSettingsQuery);

  const emergencyContacts = settings?.emergencyContacts || [
    { name: "Environment Agency Floodline", phone: "0345 988 1188" },
    { name: "Somerset Council", phone: "0300 123 2224" },
  ];

  return (
    <>
      {/* Hero — full-width image with overlay text */}
      <section className="relative text-white overflow-hidden">
        <Image
          src="/Images/environment/levels-hero.jpg"
          alt="Langport and the Somerset Levels"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <svg className="absolute bottom-0 left-0 w-full text-white" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,80 C320,120 640,40 960,80 C1120,100 1280,60 1440,80 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <h1 className="font-heading text-4xl font-bold drop-shadow-lg sm:text-5xl max-w-2xl">
            Langport and the Somerset Levels
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 leading-relaxed drop-shadow">
            Langport is at the heart of the rich and scientifically valued Somerset Levels.
            Formed hundreds of years ago, the manmade landscapes of the Levels have become
            some of the most extensive areas of wetland in Europe. They have always been
            vulnerable, but climate change will pose specific threats of both flood and drought
            to this low lying area where communities, farmers and landowners, businesses,
            government and water management experts will need to be resilient to the
            challenges ahead.
          </p>
        </div>
      </section>

      {/* Landscape section */}
      <section className="bg-maroon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src="/Images/environment/landscape.jpg"
                alt="Somerset Levels landscape"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold">Landscape</h2>
              <p className="mt-4 text-white/90 leading-relaxed">
                The Levels are an internationally recognised RAMSAR area with Sites of
                Special Scientific Interest (SSSI). They are one of the largest and richest
                areas of traditionally managed wet grassland and fen habitats in lowland UK.
                The majority of the site is only a few metres above mean sea level and drains
                through a large network of ditches, rhynes, drains and rivers. Flooding may
                affect large areas in winter depending on rainfall and tidal conditions.
              </p>
              <a
                href="https://www.somersetlevels.co.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-md border-2 border-white px-6 py-2.5 text-sm font-medium text-white no-underline hover:bg-white hover:text-maroon transition-colors"
              >
                More info
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Flood Plan section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold text-gray-900">Flood Plan</h2>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Langport itself has not flooded since the 1950s. The town, which is bordered
                on two sides by the River Parrett, is now protected by a water management
                system, designed and operated by the Environment Agency, using flood banks,
                pumps, water storage on nearby fields, and careful monitoring.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Langport&apos;s flood plan brings together the community to enable it to respond
                quickly when/if flooding happens. It brings together practical actions to take
                before and during a flood, helping reduce the damage flooding can cause.
              </p>
              <a
                href="https://check-for-flooding.service.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-md bg-maroon px-6 py-2.5 text-sm font-medium text-white no-underline hover:bg-maroon/90 transition-colors"
              >
                Flood Action Guide
              </a>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src="/Images/environment/flood.jpg"
                alt="River Parrett and flood defences"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Water, Weather and Waste */}
      <section className="bg-maroon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold">Water, Weather and Waste</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <a
              href="https://www.somersetrivers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-white/10 backdrop-blur p-8 no-underline hover:bg-white/20 transition-colors"
            >
              <WaterIcon />
              <h3 className="mt-4 font-heading text-xl font-bold text-white">Water</h3>
            </a>
            <a
              href="https://www.metoffice.gov.uk/weather/forecast/gcl2n2k15"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-white/10 backdrop-blur p-8 no-underline hover:bg-white/20 transition-colors"
            >
              <WeatherIcon />
              <h3 className="mt-4 font-heading text-xl font-bold text-white">Weather</h3>
            </a>
            <a
              href="https://www.somerset.gov.uk/waste-and-recycling/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-white/10 backdrop-blur p-8 no-underline hover:bg-white/20 transition-colors"
            >
              <WasteIcon />
              <h3 className="mt-4 font-heading text-xl font-bold text-white">Waste</h3>
            </a>
          </div>
        </div>
      </section>

      {/* Transition Langport */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex justify-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-green/10">
                <div className="text-center">
                  <svg className="mx-auto h-20 w-20 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 009-9c0-3-2-5.5-4-7l-1 3-2-4c-1 2-2 3.5-2 5a3 3 0 006 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9c0-3 2-5.5 4-7l1 3 2-4c1 2 2 3.5 2 5a3 3 0 01-6 0" />
                  </svg>
                  <p className="mt-2 font-heading text-lg font-bold text-green">Transition<br/>Langport</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-gray-900">
                Transition Langport
              </h2>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Transition Langport was formed in 2010 and has spear-headed the environment
                movement in Langport. The group fundraises and organises environmental projects.
              </p>
              <a
                href="https://transitionlangport.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-md bg-maroon px-6 py-2.5 text-sm font-medium text-white no-underline hover:bg-maroon/90 transition-colors"
              >
                More info
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Flora and Fauna */}
      <section className="bg-maroon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold">Flora and Fauna</h2>
              <p className="mt-4 text-white/90 leading-relaxed">
                The area around Langport is rich in flora and fauna. The West Sedgemoor SSSI
                is located nearby and is part of England&apos;s largest remaining wet meadow system.
                It is home to large populations of breeding waders in the summer and wildfowl
                in winter. The area is well known for the re-introduction of cranes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://www.rspb.org.uk/reserves-and-events/reserves-a-z/west-sedgemoor/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-md border-2 border-white px-6 py-2.5 text-sm font-medium text-white no-underline hover:bg-white hover:text-maroon transition-colors"
                >
                  West Sedgemoor
                </a>
                <a
                  href="https://transitionlangport.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-md border-2 border-white px-6 py-2.5 text-sm font-medium text-white no-underline hover:bg-white hover:text-maroon transition-colors"
                >
                  Get involved
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src="/Images/environment/flora-fauna.jpg"
                alt="Flora and fauna of the Somerset Levels"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Climate Forum */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src="/Images/environment/climate-forum.jpg"
                alt="Langport Town Hall"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-gray-900">Climate Forum</h2>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Langport Town Council is working with neighbouring parishes and organisations
                to work towards becoming a zero carbon community. The forum convenes regular
                meetings to share initiatives like &apos;parish online&apos;, Langport Town
                Council&apos;s Green Charter, sustainable housing.
              </p>
              <Link
                href="/council"
                className="mt-6 inline-block rounded-md bg-maroon px-6 py-2.5 text-sm font-medium text-white no-underline hover:bg-maroon/90 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            Emergency Contacts
          </h2>
          <ul className="mt-4 space-y-2 text-gray-700">
            {emergencyContacts.map(
              (contact: { name: string; phone?: string; url?: string; description?: string }) => (
                <li key={contact.name}>
                  <strong>{contact.name}:</strong>{" "}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="text-maroon font-medium"
                    >
                      {contact.phone}
                    </a>
                  )}
                  {contact.url && !contact.phone && (
                    <a href={contact.url} target="_blank" rel="noopener noreferrer" className="text-maroon">
                      Website
                    </a>
                  )}
                  {contact.description && (
                    <span className="text-sm text-gray-500 ml-2">— {contact.description}</span>
                  )}
                </li>
              )
            )}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://check-for-flooding.service.gov.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50"
            >
              Check for Flooding (Gov.uk)
            </a>
            <a
              href="https://www.somersetrivers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50"
            >
              Somerset Rivers Authority
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
