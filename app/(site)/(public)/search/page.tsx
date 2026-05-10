import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";
import { searchQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Langport Life for events, venues, businesses, news and more.",
};

// Don't cache search pages — results depend on user input.
export const dynamic = "force-dynamic";

interface SearchResult {
  _id: string;
  _type: string;
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  image?: { asset?: { url: string }; alt?: string };
}

const TYPE_LABEL: Record<string, string> = {
  event: "Event",
  venue: "Venue",
  businessListing: "Business",
  article: "News",
  page: "Page",
  historicSite: "Historic Site",
  activity: "Activity",
  group: "Group",
};

function resultHref(r: SearchResult): string | null {
  const slug = r.slug?.current;
  if (!slug) return null;
  switch (r._type) {
    case "event": return `/events/${slug}`;
    case "venue": return `/venues/${slug}`;
    case "businessListing": return `/listings/${slug}`;
    case "article": return `/news/${slug}`;
    case "historicSite": return `/history/${slug}`;
    case "activity": return `/things-to-do/${slug}`;
    case "group": return `/join-a-group/${slug}`;
    case "page": return `/${slug}`;
    default: return null;
  }
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQuery } = await searchParams;
  const q = (rawQuery || "").trim();

  let results: SearchResult[] = [];
  let queryRan = false;
  if (q.length >= 2) {
    queryRan = true;
    // Append `*` so GROQ does prefix matching (e.g. "eli" → matches "Eli's Inn").
    results = await client.fetch(searchQuery, { query: `${q}*` } as Record<string, unknown>);
  }

  return (
    <>
      <PageHero
        section="about"
        title={q ? `Search: "${q}"` : "Search"}
        subtitle={
          queryRan
            ? `${results.length} result${results.length === 1 ? "" : "s"} found`
            : "Enter a word or phrase to search across the site."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Search" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {!q && (
          <p className="text-gray-600">
            Use the search box in the header to look across events, venues, businesses, news, council documents and more.
          </p>
        )}

        {q && q.length < 2 && (
          <p className="text-gray-600">Please enter at least 2 characters.</p>
        )}

        {queryRan && results.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <p className="font-medium text-gray-900">No matches for &quot;{q}&quot;.</p>
            <p className="mt-2 text-sm text-gray-600">
              Try a different spelling, a shorter word, or browse from the main navigation.
            </p>
          </div>
        )}

        {queryRan && results.length > 0 && (
          <ul className="space-y-4">
            {results.map((r) => {
              const href = resultHref(r);
              const label = TYPE_LABEL[r._type] || r._type;
              const inner = (
                <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
                  {r.image?.asset?.url ? (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={urlFor(r.image).width(160).height(160).url()}
                        alt={r.image.alt || r.title || ""}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-primary/5">
                      <span className="text-2xl font-heading font-bold text-primary/30">
                        {r.title?.[0] || "?"}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {label}
                    </span>
                    <h2 className="mt-1 font-heading text-lg font-semibold text-gray-900">
                      {r.title || "(untitled)"}
                    </h2>
                    {r.excerpt && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{r.excerpt}</p>
                    )}
                  </div>
                </div>
              );

              return (
                <li key={r._id}>
                  {href ? (
                    <Link href={href} className="block no-underline">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
