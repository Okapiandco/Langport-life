import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import RelatedActivities from "@/components/RelatedActivities";

export const metadata: Metadata = {
  title: "Paddleboarding",
  description: "Paddleboarding on the River Parrett at Langport, Somerset.",
};

export default function PaddleboardingPage() {
  return (
    <>
      <PageHero title="Paddleboarding" subtitle="Our beautiful river is more active than it's been in over a century!" section="things-to-do" breadcrumbs={[{ label: "Things to Do", href: "/things-to-do" }, { label: "The Outdoor Life", href: "/things-to-do/outdoor-life" }, { label: "Paddleboarding" }]} image="/things-to-do/paddleboarding.jpg" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Visitors can launch personal craft or take scenic trips on the Duchess of Cocklemoor,
              a lovingly restored River Dart ferry.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Modern pontoons for launching are available at four summer locations: Muchelney Bridge,
              Huish Bridge, Cocklemoor, and Great Bow Bridge.
            </p>
          </div>
          <Image src="/things-to-do/paddleboarding-kids.jpg" alt="Paddleboarding on the River Parrett" width={800} height={500} className="w-full h-auto rounded-lg" />
        </div>

        <RelatedActivities current="/things-to-do/paddleboarding" />
      </div>
    </>
  );
}
