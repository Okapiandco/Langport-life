import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { calendarOfMeetingsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Calendar of Meetings",
  alternates: { canonical: "/council/calendar-of-meetings" },
  description: "Dates of Langport Town Council and committee meetings for the municipal year.",
};

export const revalidate = 3600;

export default async function CalendarOfMeetingsPage() {
  const [current, ...previous] = await client.fetch(calendarOfMeetingsQuery);
  const pdfUrl: string | undefined = current?.file?.asset?.url;

  return (
    <>
      <PageHero
        section="council"
        title="Calendar of Meetings"
        subtitle="When Full Council and its committees meet this municipal year. Meetings are open to the public."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!current ? (
          <p className="text-gray-600">The calendar of meetings will be published here soon.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4 rounded-lg border border-green/10 bg-green/5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-gray-900">{current.title}</h2>
                <p className="mt-1 text-sm text-gray-600">Published {formatDate(current.date)}</p>
              </div>
              {pdfUrl && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary no-underline hover:bg-primary/5 transition-colors"
                  >
                    Open in new tab
                  </a>
                  <a
                    href={`${pdfUrl}?dl=`}
                    download
                    className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>

            {pdfUrl?.toLowerCase().includes(".pdf") && (
              // Phones mostly can't show inline PDFs, so the embed is desktop-only
              <iframe
                src={pdfUrl}
                title={current.title}
                className="mt-6 hidden h-[80vh] w-full rounded-lg border border-gray-200 md:block"
              />
            )}

            <p className="mt-6 text-sm text-gray-600">
              Dates can occasionally change. Any rearranged or cancelled meeting is shown on that
              committee&apos;s{" "}
              <Link href="/council/documents" className="text-green">
                agendas and minutes
              </Link>{" "}
              page.
            </p>

            {previous.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-8">
                <h2 className="font-heading text-lg font-bold text-gray-900 mb-4">Previous calendars</h2>
                <div className="space-y-2">
                  {previous.map((doc: any) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3"
                    >
                      <Link
                        href={`/council/documents/${doc.slug.current}`}
                        className="text-sm font-medium text-gray-900 no-underline hover:text-green"
                      >
                        {doc.title}
                      </Link>
                      <span className="ml-4 text-xs text-gray-500">{formatDate(doc.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
