import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/lib/sanity";
import { documentBySlugQuery, documentsByTagQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { COMMITTEES, getCommitteeByTag } from "@/lib/committees";
import PageHero from "@/components/PageHero";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check if this is a committee page
  const committee = getCommitteeByTag(slug);
  if (committee) {
    return {
      title: committee.name,
      description: committee.description,
    };
  }

  const doc = await client.fetch(documentBySlugQuery, { slug });
  if (!doc) return { title: "Document Not Found" };
  return { title: doc.title };
}

// Generate static params for committee pages
export async function generateStaticParams() {
  return COMMITTEES.map((c) => ({ slug: c.tag }));
}

export default async function CouncilDocumentOrCommitteePage({ params }: Props) {
  const { slug } = await params;

  // Check if this is a committee page
  const committee = getCommitteeByTag(slug);
  if (committee) {
    return <CommitteePage tag={committee.tag} name={committee.name} description={committee.description} />;
  }

  // Otherwise render individual document
  const doc = await client.fetch(documentBySlugQuery, { slug });
  if (!doc) notFound();

  return <DocumentPage doc={doc} />;
}

/* ── Committee listing ── */
async function CommitteePage({ tag, name, description }: { tag: string; name: string; description: string }) {
  const documents = await client.fetch(documentsByTagQuery, { tag } as any);

  // Group documents by month/year
  const grouped = new Map<string, any[]>();
  for (const doc of documents) {
    const d = new Date(doc.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const list = grouped.get(key) || [];
    list.push(doc);
    grouped.set(key, list);
  }

  return (
    <>
      <PageHero
        section="council"
        title={name}
        subtitle={description}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/council" className="hover:text-green no-underline">Council</Link>
          {" / "}
          <Link href="/council/documents" className="hover:text-green no-underline">Agendas & Minutes</Link>
          {" / "}
          <span className="text-gray-900">{name}</span>
        </nav>

        {documents.length === 0 ? (
          <p className="text-gray-600">No documents available yet.</p>
        ) : (
          <div className="space-y-10">
            {Array.from(grouped.entries()).map(([monthKey, docs]) => {
              const [year, month] = monthKey.split("-");
              const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

              return (
                <section key={monthKey}>
                  <h2 className="font-heading text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    {monthName}
                  </h2>
                  <div className="space-y-2">
                    {docs.map((doc: any) => (
                      <div key={doc._id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:border-green/20 hover:bg-green/5 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary whitespace-nowrap">
                            {doc.documentType}
                          </span>
                          <Link
                            href={`/council/documents/${doc.slug.current}`}
                            className="text-sm font-medium text-gray-900 no-underline hover:text-green truncate"
                          >
                            {doc.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                          <span className="text-xs text-gray-500">{formatDate(doc.date)}</span>
                          {doc.file?.asset?.url && (
                            <a
                              href={`${doc.file.asset.url}?dl=`}
                              download
                              className="text-xs font-medium text-green hover:text-green/80 no-underline whitespace-nowrap"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Individual document detail ── */
function DocumentPage({ doc }: { doc: any }) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/council" className="hover:text-green no-underline">Council</Link>
        {" / "}
        <Link href="/council/documents" className="hover:text-green no-underline">Agendas & Minutes</Link>
        {doc.tags?.[0] && (
          <>
            {" / "}
            <Link href={`/council/documents/${doc.tags[0]}`} className="hover:text-green no-underline capitalize">
              {doc.tags[0].replace(/-/g, " ")}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-gray-900">{doc.title}</span>
      </nav>

      <header>
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium capitalize text-primary">
          {doc.documentType}
        </span>
        <h1 className="mt-3 font-heading text-4xl font-bold text-gray-900">
          {doc.title}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Date: {formatDate(doc.date)}
          {doc.meetingDate && ` | Meeting: ${formatDate(doc.meetingDate)}`}
        </p>
      </header>

      {doc.description && (
        <div className="prose mt-6 max-w-none">
          <PortableText value={doc.description} />
        </div>
      )}

      {doc.htmlContent && (
        <div className="prose mt-6 max-w-none">
          <PortableText value={doc.htmlContent} />
        </div>
      )}

      {doc.file?.asset?.url && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="font-heading text-lg font-semibold text-gray-900">
            Download Document
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {doc.file.asset.originalFilename}
            {doc.file.asset.size && (
              <span className="ml-2 text-gray-400">
                ({(doc.file.asset.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </p>
          <a
            href={`${doc.file.asset.url}?dl=`}
            download
            className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors"
          >
            Download PDF
          </a>
        </div>
      )}

      {doc.tags && doc.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {doc.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
