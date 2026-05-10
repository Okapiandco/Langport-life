import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { groupBySlugQuery } from "@/lib/queries";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://langport.life";

type Props = { params: Promise<{ slug: string }> };

interface Group {
  _id: string;
  name: string;
  slug: { current: string };
  description?: unknown;
  location?: string;
  meetingTime?: string;
  cost?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  image?: { asset: { url: string }; alt?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const group: Group | null = await client.fetch(groupBySlugQuery, { slug });
  if (!group) return { title: "Group Not Found" };
  return {
    title: group.name,
    description:
      `${group.name} — local group in Langport.` +
      (group.location ? ` Meets at ${group.location}.` : ""),
  };
}

export default async function GroupDetailPage({ params }: Props) {
  const { slug } = await params;
  const group: Group | null = await client.fetch(groupBySlugQuery, { slug });
  if (!group) notFound();

  const hasContact = group.contactName || group.contactEmail || group.contactPhone;

  // JSON-LD Organization schema for SEO
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: group.name,
    url: `${SITE_URL}/join-a-group/${group.slug.current}`,
  };
  if (group.image?.asset?.url) jsonLd.image = group.image.asset.url;
  if (group.location) jsonLd.location = group.location;
  if (group.contactEmail) jsonLd.email = group.contactEmail;
  if (group.contactPhone) jsonLd.telephone = group.contactPhone;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Title & accent bar */}
      <header>
        <h1 className="font-heading text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
          {group.name}
        </h1>
        <div className="mt-3 h-1 w-20 rounded-full bg-primary" />
        {group.location && (
          <p className="mt-3 text-sm text-gray-500">{group.location}</p>
        )}
      </header>

      {/* Two-column layout */}
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {group.image?.asset && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
              <Image
                src={urlFor(group.image).width(1000).height(562).url()}
                alt={group.image.alt || group.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {group.description ? (
            <div className="prose prose-gray max-w-none prose-headings:font-heading prose-a:text-primary">
              <PortableText value={group.description as never} />
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* When / Where / Cost */}
          {(group.location || group.meetingTime || group.cost) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-primary">
                Group Details
              </h3>
              <dl className="mt-3 space-y-3 text-sm">
                {group.location && (
                  <div>
                    <dt className="font-medium text-gray-900">Where</dt>
                    <dd className="text-gray-700">{group.location}</dd>
                  </div>
                )}
                {group.meetingTime && (
                  <div>
                    <dt className="font-medium text-gray-900">When</dt>
                    <dd className="text-gray-700">{group.meetingTime}</dd>
                  </div>
                )}
                {group.cost && (
                  <div>
                    <dt className="font-medium text-gray-900">Cost</dt>
                    <dd className="text-gray-700">{group.cost}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Contact */}
          {hasContact && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-primary">
                Contact
              </h3>
              <dl className="mt-3 space-y-3 text-sm">
                {group.contactName && (
                  <div>
                    <dt className="font-medium text-gray-900">Name</dt>
                    <dd className="text-gray-700">{group.contactName}</dd>
                  </div>
                )}
                {group.contactEmail && (
                  <div>
                    <dt className="font-medium text-gray-900">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${group.contactEmail}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        {group.contactEmail}
                      </a>
                    </dd>
                  </div>
                )}
                {group.contactPhone && (
                  <div>
                    <dt className="font-medium text-gray-900">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${group.contactPhone}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        {group.contactPhone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
