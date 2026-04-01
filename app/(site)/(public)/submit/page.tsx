import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Submit — Langport Life",
  description: "Submit an event, business listing, or venue to Langport Life.",
};

const cards = [
  {
    title: "Submit an Event",
    description:
      "Got an event coming up in the Langport area? Let us know and we'll add it to the listings.",
    href: "/submit/event",
    icon: "📅",
  },
  {
    title: "Add a Business",
    description:
      "Run a local business? Get listed on Langport Life so visitors and residents can find you.",
    href: "/submit/listing",
    icon: "🏪",
  },
  {
    title: "Add a Venue",
    description:
      "Manage a hall, pub, or community space? Add your venue so event organisers can find it.",
    href: "/submit/venue",
    icon: "🏛️",
  },
];

export default function SubmitPage() {
  return (
    <>
      <PageHero
        section="submit"
        title="Submit to Langport Life"
        subtitle="Help us keep the community informed. All submissions are reviewed before publishing."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Submit" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border border-gray-200 p-6 transition hover:border-primary hover:shadow-lg no-underline"
            >
              <span className="text-4xl">{card.icon}</span>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-primary">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{card.description}</p>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-gray-500">
          All submissions are reviewed by the town clerk before being published.
        </p>
      </section>
    </>
  );
}
