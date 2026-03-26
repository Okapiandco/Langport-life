import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Wild Swimming",
  description: "Wild swimming in the River Parrett at Langport, Somerset.",
};

export default function WildSwimmingPage() {
  return (
    <>
      <PageHero title="Wild Swimming" subtitle="Take to the water on warm summer days" section="things-to-do" image="/things-to-do/wild-swimming-hero.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/things-to-do" className="hover:text-green no-underline">Things to Do</Link>{" / "}
          <Link href="/things-to-do/outdoor-life" className="hover:text-green no-underline">The Outdoor Life</Link>{" / "}
          <span className="text-gray-900">Wild Swimming</span>
        </nav>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Not everyone&apos;s cup of tea but adults and children (under supervision) do take to the
            water on warm summer days.
          </p>
          <p className="text-gray-600 leading-relaxed">
            There are 4 pontoons along the river for mooring to and swimming from during the summer months,
            located at Muchelney Bridge, Huish Bridge, Cocklemoor, and Great Bow Bridge.
          </p>
        </div>

        <RelatedActivities current="/things-to-do/wild-swimming" />
      </div>
    </>
  );
}
