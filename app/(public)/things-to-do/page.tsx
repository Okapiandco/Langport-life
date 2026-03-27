import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";
import { allActivitiesQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Things to Do — Langport Life",
  description: "Discover outdoor activities, walks, cycling routes, and wildlife around Langport and the Somerset Levels.",
};

export const revalidate = 3600;

const categoryMeta: Record<string, { label: string; color: string; description: string }> = {
  exploring: {
    label: "Exploring the Wild",
    color: "bg-green",
    description: "Wildlife, nature reserves, birdwatching, and the unique ecology of the Levels.",
  },
  "walking-cycling": {
    label: "Walking & Cycling",
    color: "bg-copper",
    description: "Routes and trails through the Somerset Levels and surrounding countryside.",
  },
  outdoor: {
    label: "The Outdoor Life",
    color: "bg-primary",
    description: "Water sports, fishing, golf, and outdoor activities on the River Parrett.",
  },
};

export default async function ThingsToDoPage() {
  const activities = await client.fetch(allActivitiesQuery);

  // Group by category
  const grouped: Record<string, typeof activities> = {};
  for (const a of activities) {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  }

  // Order categories
  const categoryOrder = ["exploring", "walking-cycling", "outdoor"];

  return (
    <>
      <PageHero
        section="things-to-do"
        title="Things to Do"
        subtitle="Langport and the surrounding area has a wealth of groups and organisations to help with all your lifestyle needs. There are some outstanding venues, amazing arts groups and established sporting clubs to get involved in."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {categoryOrder.map((cat) => {
          const meta = categoryMeta[cat];
          const items = grouped[cat];
          if (!items?.length) return null;

          return (
            <section key={cat} className="mb-16">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 sm:text-3xl">
                  {meta.label}
                </h2>
                <p className="mt-1 text-gray-600">{meta.description}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((activity: {
                  _id: string;
                  title: string;
                  slug: { current: string };
                  excerpt?: string;
                  distance?: string;
                  difficulty?: string;
                  heroImage?: { asset?: object; alt?: string };
                }) => (
                  <Link
                    key={activity._id}
                    href={`/things-to-do/${activity.slug.current}`}
                    className="group block overflow-hidden rounded-lg no-underline shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      {activity.heroImage?.asset ? (
                        <Image
                          src={urlFor(activity.heroImage).width(600).height(400).url()}
                          alt={activity.heroImage.alt || activity.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-copper/10" />
                      )}
                    </div>
                    <div className="bg-copper px-5 py-4">
                      <h3 className="font-heading text-lg font-bold text-white">
                        {activity.title}
                      </h3>
                      {(activity.distance || activity.difficulty) && (
                        <div className="mt-1.5 flex gap-3">
                          {activity.distance && (
                            <span className="text-xs text-white/80">
                              {activity.distance}
                            </span>
                          )}
                          {activity.difficulty && (
                            <span className="text-xs text-white/80 capitalize">
                              {activity.difficulty}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            Activities coming soon. Check back later!
          </p>
        )}
      </div>
    </>
  );
}
