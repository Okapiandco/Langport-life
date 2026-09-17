import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/lib/sanity";
import { documentBySlugQuery, documentsByTagQuery, meetingNoticesByCommitteeQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { COMMITTEES, getCommitteeByTag } from "@/lib/committees";
import PageHero from "@/components/PageHero";
import CollapsibleSection from "@/components/CollapsibleSection";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check if this is a committee page
  const committee = getCommitteeByTag(slug);
  if (committee) {
    return {
      title: `${committee.name} Agendas & Minutes`,
      description: committee.description,
      alternates: { canonical: `/council/documents/${slug}` },
    };
  }

  const doc = await client.fetch(documentBySlugQuery, { slug });
  if (!doc) return { title: "Document Not Found" };
  return {
    title: doc.title,
    description: `${doc.title} — Langport Town Council document.`,
    alternates: { canonical: `/council/documents/${slug}` },
  };
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
const TYPE_RANK: Record<string, number> = { agenda: 0, minutes: 2 };

/** Agenda first, supporting papers next, minutes last; then by title */
function sortWithinMeeting(a: any, b: any) {
  const rank = (TYPE_RANK[a.documentType] ?? 1) - (TYPE_RANK[b.documentType] ?? 1);
  if (rank !== 0) return rank;
  return String(a.title).localeCompare(String(b.title), "en-GB", { numeric: true });
}

function formatNewMeeting(iso: string) {
  const d = new Date(iso);
  const day = d
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })
    .replace(",", "");
  // "7:30pm", or "7pm" on the hour
  const time = d
    .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Europe/London" })
    .replace(/\s/g, "")
    .replace(":00", "")
    .toLowerCase();
  return `${day} at ${time}`;
}

function MeetingNotice({ notice }: { notice: any }) {
  const headline =
    notice.noticeType === "cancelled"
      ? "This meeting has been cancelled"
      : notice.noticeType === "rearranged"
        ? notice.newDateTime
          ? `Meeting rearranged to ${formatNewMeeting(notice.newDateTime)}`
          : "This meeting has been rearranged"
        : null;

  return (
    <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {headline && <p className="font-semibold">{headline}</p>}
      {notice.message && <p className={`whitespace-pre-line ${headline ? "mt-1" : ""}`}>{notice.message}</p>}
    </div>
  );
}

async function CommitteePage({ tag, name, description }: { tag: string; name: string; description: string }) {
  const [documents, notices] = await Promise.all([
    client.fetch(documentsByTagQuery, { tag } as any),
    client.fetch(meetingNoticesByCommitteeQuery, { tag } as any),
  ]);

  // One folder per month, filed by the meeting the papers belong to
  // (falling back to the document date for uploads without a meeting date)
  const grouped = new Map<string, { docs: any[]; notices: any[] }>();
  const folder = (key: string) => {
    if (!grouped.has(key)) grouped.set(key, { docs: [], notices: [] });
    return grouped.get(key)!;
  };
  for (const doc of documents) {
    const when: string | undefined = doc.meetingDate || doc.date;
    if (when) folder(when.slice(0, 7)).docs.push(doc);
  }
  for (const notice of notices) folder(notice.originalDate.slice(0, 7)).notices.push(notice);

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

        {grouped.size === 0 ? (
          <p className="text-gray-600">No documents available yet.</p>
        ) : (
          <div>
            {Array.from(grouped.entries())
              .sort(([a], [b]) => (a < b ? 1 : -1))
              .map(([monthKey, { docs, notices: monthNotices }], index) => {
                const [year, month] = monthKey.split("-");
                const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

                return (
                  <CollapsibleSection
                    key={monthKey}
                    title={monthName}
                    count={docs.length}
                    defaultOpen={index === 0}
                    notice={
                      monthNotices.length > 0 && (
                        <div className="space-y-2">
                          {monthNotices.map((n: any) => (
                            <MeetingNotice key={n._id} notice={n} />
                          ))}
                        </div>
                      )
                    }
                  >
                    {docs.length === 0 && (
                      <p className="text-sm text-gray-600">Papers for this meeting will be published here.</p>
                    )}
                    {docs.sort(sortWithinMeeting).map((doc: any) => (
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
                  </CollapsibleSection>
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
            Download
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
