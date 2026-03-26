import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Getting Here - Langport Life",
  description:
    "How to get to Langport, Somerset by train, bus, car, and bicycle. Parking information and travel tips.",
};

const trainStations = [
  {
    name: "Castle Cary",
    distance: "15 miles",
    line: "Great Western Railway main line",
    note: "Direct trains from London Paddington (approx. 1hr 40min)",
  },
  {
    name: "Taunton",
    distance: "14 miles",
    line: "Great Western Railway main line",
    note: "Major interchange with frequent services from London, Bristol, and Exeter",
  },
  {
    name: "Bridgwater",
    distance: "12 miles",
    line: "Great Western Railway main line",
    note: "Services from Bristol Temple Meads and Exeter",
  },
  {
    name: "Yeovil Pen Mill",
    distance: "13 miles",
    line: "Heart of Wessex line",
    note: "Services from Weymouth, Bath Spa, and Bristol",
  },
];

const busRoutes = [
  {
    number: "54",
    operator: "First Bus",
    route: "Taunton \u2013 Langport \u2013 Somerton \u2013 Yeovil",
    frequency: "Approximately hourly, Mon\u2013Sat",
    note: "The main bus service through Langport",
  },
  {
    number: "55",
    operator: "First Bus",
    route: "Wrantage \u2013 Langport \u2013 Somerton \u2013 Street",
    frequency: "Limited service, Mon\u2013Sat",
    note: "Connects to Street and Glastonbury area",
  },
  {
    number: "16",
    operator: "Hatch Green Coaches",
    route: "Bridgwater \u2013 Langport",
    frequency: "Limited service",
    note: "Links to Bridgwater rail station",
  },
];

const parkingLocations = [
  {
    name: "Cocklemoor Car Park",
    postcode: "TA10 9PD",
    type: "Free",
    details:
      "Short stay (2hrs max, no return within 1hr) and long stay (24hrs) in designated areas. 24-hour access, no height restriction. EV charging points available.",
  },
  {
    name: "Stacey\u2019s Court Car Park",
    postcode: "TA10 9PB",
    type: "Free",
    details: "Convenient for the town centre and Bow Street shops.",
  },
  {
    name: "Westover",
    postcode: "TA10 9PR",
    type: "Free on-road",
    details:
      "On-road parking available along Westover. Useful overflow when other car parks are busy.",
  },
];

function TrainIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2C8 2 5 3 5 5v11a3 3 0 003 3h1l-2 3h2l1-1.5h4L15 22h2l-2-3h1a3 3 0 003-3V5c0-2-3-3-7-3zM8 16.5a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2zM7 10V6h10v4H7z"
      />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 21h1.5m5 0H16M6 3h12s2 0 2 2v10a3 3 0 01-3 3H7a3 3 0 01-3-3V5s0-2 2-2zm1 5h10M8.5 16a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z"
      />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 17h14M5 17a2 2 0 01-2-2v-3a1 1 0 011-1l2-4h12l2 4a1 1 0 011 1v3a2 2 0 01-2 2M5 17a2 2 0 002 2h1a2 2 0 002-2M14 17a2 2 0 002 2h1a2 2 0 002-2M7.5 14a.5.5 0 110-1 .5.5 0 010 1zm9 0a.5.5 0 110-1 .5.5 0 010 1z"
      />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17V7h4a3 3 0 010 6H9"
      />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h2l3 11.5M5.5 17.5l3-8h5l2 4.5" />
      <circle cx="16" cy="5.5" r="1.5" />
    </svg>
  );
}

export default function GettingHerePage() {
  return (
    <>
      <PageHero
        section="getting-here"
        title="Getting Here"
        subtitle="Langport is nestled in the heart of the Somerset Levels, easy to reach by road, rail, and bus."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-lg text-gray-600 leading-relaxed">
            Langport sits on the A372 between Bridgwater and the A303, making it
            easily accessible from all directions. Whether you&apos;re arriving
            by train, bus, or car, you&apos;ll find your way to our beautiful
            market town with ease.
          </p>
        </div>

        {/* By Train */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-copper/10 text-copper">
              <TrainIcon />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                By Train
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Nearest stations are 12&ndash;15 miles away, with onward bus or
                taxi connections
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trainStations.map((station) => (
              <div
                key={station.name}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-copper/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-gray-900">
                      {station.name}
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-copper/10 px-3 py-0.5 text-xs font-semibold text-copper">
                      {station.distance}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">{station.line}</p>
                <p className="mt-1 text-sm text-gray-700">{station.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-copper/5 border border-copper/20 p-6">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
              Onward Travel from the Station
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              From <strong>Taunton</strong>, take the{" "}
              <strong>First Bus 54</strong> which runs directly through Langport
              (approximately hourly). From <strong>Castle Cary</strong> or{" "}
              <strong>Yeovil</strong>, a taxi is the most convenient option
              (around 20&ndash;25 minutes). Most local taxi firms are happy to
              meet trains by arrangement.
            </p>
          </div>
        </section>

        {/* By Bus */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BusIcon />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                By Bus
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Regular services connect Langport to Taunton, Yeovil, and
                surrounding towns
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {busRoutes.map((bus) => (
              <div
                key={bus.number}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-xl font-bold text-white">
                  {bus.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-heading text-lg font-bold text-gray-900">
                      {bus.route}
                    </h3>
                    <span className="text-xs font-medium text-gray-400">
                      {bus.operator}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{bus.note}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {bus.frequency}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Tip:</strong> The main bus stop in Langport is on{" "}
              <strong>Bow Street</strong>, right in the heart of town. Check the{" "}
              <a
                href="https://www.firstbus.co.uk/somerset"
                target="_blank"
                rel="noopener noreferrer"
              >
                First Bus website
              </a>{" "}
              or the{" "}
              <a
                href="https://bustimes.org/localities/langport"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bus Times website
              </a>{" "}
              for live departure information and timetables. No buses run on
              Sundays.
            </p>
          </div>
        </section>

        {/* By Car */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dark-green/10 text-dark-green">
              <CarIcon />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                By Car
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Langport is well connected by road, sitting just off the A372
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3">
                From the East / London
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Take the <strong>M3</strong> then <strong>A303</strong> west.
                Exit at <strong>Podimore roundabout</strong> (junction with
                A372/A37) and follow the <strong>A372</strong> west for
                approximately 6 miles into Langport.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3">
                From the North / Bristol
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Take the <strong>M5</strong> south to{" "}
                <strong>Junction 23</strong> (Bridgwater). Follow the{" "}
                <strong>A39</strong> towards Glastonbury, then pick up the{" "}
                <strong>A372</strong> south to Langport. Approximately 30
                minutes from the motorway.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3">
                From the West / Taunton
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Follow the <strong>A378</strong> east from Taunton through Curry
                Rivel, or take the <strong>A358</strong> to Ilminster and join
                the <strong>A303</strong> east briefly before taking the A372.
                Around 25&ndash;30 minutes drive.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-dark-green/5 border border-dark-green/20 p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Sat Nav:</strong> Use postcode{" "}
              <strong>TA10 9PD</strong> for the main Cocklemoor Car Park, or{" "}
              <strong>TA10 9PB</strong> for the town centre. Langport is
              approximately 30 minutes from both{" "}
              <strong>Taunton</strong> and <strong>Yeovil</strong>, and around 50
              minutes from <strong>Bristol</strong>.
            </p>
          </div>
        </section>

        {/* Parking */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green/10 text-green">
              <ParkingIcon />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                Parking
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Free parking is available throughout the town
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {parkingLocations.map((loc) => (
              <div
                key={loc.name}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-green/40"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-lg font-bold text-gray-900">
                    {loc.name}
                  </h3>
                  <span className="rounded-full bg-green/10 px-3 py-0.5 text-xs font-bold text-green">
                    {loc.type}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-400 mb-2">
                  {loc.postcode}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {loc.details}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-green/5 border border-green/20 p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Tip:</strong> Parking is free in Langport but spaces can
              fill up during busy weekends and events. Arriving early is
              recommended, especially for Saturday markets. Electric vehicle
              charging points are available at Cocklemoor Car Park.
            </p>
          </div>
        </section>

        {/* Cycling */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
              <CycleIcon />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                By Bicycle
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Flat terrain makes the Somerset Levels ideal for cycling
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed">
              The Somerset Levels offer some of the flattest and most scenic
              cycling in the South West. Langport is accessible via quiet
              country lanes from Somerton, Curry Rivel, and Muchelney. The
              towpath along the River Parrett provides a lovely off-road route
              towards Oath and Burrowbridge. Bike racks are available in the
              town centre near Bow Street.
            </p>
          </div>
        </section>

        {/* Quick-reference distances */}
        <section className="rounded-3xl bg-gradient-to-br from-copper/10 via-primary/5 to-green/10 p-8 sm:p-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 text-center mb-8 sm:text-3xl">
            Distance &amp; Drive Times
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { place: "Taunton", distance: "14 miles", time: "~30 min" },
              { place: "Yeovil", distance: "13 miles", time: "~25 min" },
              { place: "Glastonbury", distance: "12 miles", time: "~20 min" },
              { place: "Bristol", distance: "42 miles", time: "~50 min" },
              { place: "London", distance: "135 miles", time: "~2hr 30" },
            ].map((d) => (
              <div
                key={d.place}
                className="rounded-2xl bg-white/80 backdrop-blur p-5 text-center shadow-sm"
              >
                <p className="font-heading text-lg font-bold text-gray-900">
                  {d.place}
                </p>
                <p className="text-2xl font-bold text-copper mt-1">
                  {d.distance}
                </p>
                <p className="text-xs text-gray-500 mt-1">{d.time} by car</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
