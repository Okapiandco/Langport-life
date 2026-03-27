import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { activityBySlugQuery, allActivitiesQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await client.fetch(activityBySlugQuery, { slug });
  if (!activity) return {};
  return {
    title: `${activity.title} — Things to Do — Langport Life`,
    description: activity.excerpt || undefined,
  };
}

export default async function ActivityPage({ params }: Props) {
  const { slug } = await params;
  const [activity, allActivities] = await Promise.all([
    client.fetch(activityBySlugQuery, { slug }),
    client.fetch(allActivitiesQuery),
  ]);

  if (!activity) notFound();

  const categoryLabels: Record<string, string> = {
    exploring: "Exploring the Wild",
    "walking-cycling": "Walking & Cycling",
    outdoor: "The Outdoor Life",
  };

  // Related activities (same category first, then others, excluding current)
  const related = allActivities
    .filter((a: { slug: { current: string } }) => a.slug.current !== slug)
    .sort((a: { category: string }, b: { category: string }) => {
      if (a.category === activity.category && b.category !== activity.category) return -1;
      if (b.category === activity.category && a.category !== activity.category) return 1;
      return 0;
    })
    .slice(0, 10);

  return (
    <>
      <PageHero
        section="things-to-do"
        title={activity.title}
        subtitle={activity.excerpt || undefined}
        image={activity.heroImage?.asset ? urlFor(activity.heroImage).width(1600).height(800).url() : undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Things to Do", href: "/things-to-do" },
          { label: categoryLabels[activity.category] || activity.category, href: `/things-to-do?category=${activity.category}` },
          { label: activity.title },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Route info bar */}
        {(activity.distance || activity.duration || activity.difficulty) && (
          <div className="mb-8 flex flex-wrap gap-4 rounded-xl bg-copper/5 border border-copper/20 p-4">
            {activity.distance && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-copper">Distance:</span>
                <span className="text-gray-700">{activity.distance}</span>
              </div>
            )}
            {activity.duration && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-copper">Duration:</span>
                <span className="text-gray-700">{activity.duration}</span>
              </div>
            )}
            {activity.difficulty && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-copper">Difficulty:</span>
                <span className="text-gray-700 capitalize">{activity.difficulty}</span>
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        {activity.content && (
          <div className="prose max-w-none">
            <PortableText
              value={activity.content}
              components={{
                types: {
                  image: ({ value }: { value: { asset?: object; alt?: string; caption?: string } }) =>
                    value.asset ? (
                      <figure className="my-8">
                        <Image
                          src={urlFor(value).width(800).height(500).url()}
                          alt={value.alt || ""}
                          width={800}
                          height={500}
                          className="rounded-lg"
                        />
                        {value.caption && (
                          <figcaption className="mt-2 text-center text-sm text-gray-500">
                            {value.caption}
                          </figcaption>
                        )}
                      </figure>
                    ) : null,
                },
              }}
            />
          </div>
        )}

        {/* Route map */}
        {activity.routeMapImage?.asset && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Route Map</h2>
            <Image
              src={urlFor(activity.routeMapImage).width(800).height(600).url()}
              alt={activity.routeMapImage.alt || "Route map"}
              width={800}
              height={600}
              className="rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* Highlights / tags */}
        {activity.highlights?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">What You Might See</h2>
            <div className="flex flex-wrap gap-2">
              {activity.highlights.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-green/10 px-3 py-1 text-sm font-medium text-green"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {activity.gallery?.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Gallery</h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {activity.gallery.map((img: { asset?: object; alt?: string; caption?: string }, i: number) =>
                img.asset ? (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(img).width(400).height(400).url()}
                      alt={img.alt || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Notice boxes */}
        {activity.notices?.length > 0 && (
          <div className="mt-8 space-y-4">
            {activity.notices.map((notice: { type: string; title?: string; text: string }, i: number) => {
              const styles: Record<string, string> = {
                info: "bg-primary/5 border-primary/20 text-primary",
                warning: "bg-amber-50 border-amber-200 text-amber-800",
                tip: "bg-green/5 border-green/20 text-green",
              };
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-5 ${styles[notice.type] || styles.info}`}
                >
                  {notice.title && (
                    <h3 className="font-semibold mb-1">{notice.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed">{notice.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* YouTube embed */}
        {activity.youtubeUrl && (
          <div className="mt-8">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <iframe
                src={activity.youtubeUrl
                  .replace("watch?v=", "embed/")
                  .replace("youtu.be/", "youtube.com/embed/")}
                title={activity.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        {/* External links */}
        {activity.externalLinks?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Useful Links</h2>
            <div className="space-y-3">
              {activity.externalLinks.map((link: { title: string; url: string; description?: string }, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-gray-200 p-4 no-underline hover:bg-gray-50 transition"
                >
                  <h3 className="font-semibold text-primary">{link.title}</h3>
                  {link.description && (
                    <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Related activities */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
              More Things to Do
            </h2>
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 8).map((a: { _id: string; title: string; slug: { current: string }; heroImage?: { asset?: object; alt?: string } }) => (
                <Link
                  key={a._id}
                  href={`/things-to-do/${a.slug.current}`}
                  className="group block overflow-hidden rounded-lg no-underline shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden">
                    {a.heroImage?.asset ? (
                      <Image
                        src={urlFor(a.heroImage).width(400).height(267).url()}
                        alt={a.heroImage.alt || a.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-copper/10" />
                    )}
                  </div>
                  <div className="bg-copper px-4 py-3">
                    <h3 className="font-heading text-sm font-bold text-white">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
