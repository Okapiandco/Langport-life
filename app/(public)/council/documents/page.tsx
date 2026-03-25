import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { allDocumentsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Council Documents",
  description: "Access Langport Town Council agendas, minutes, policies, and reports.",
};

export const revalidate = 60;

export default async function CouncilDocumentsPage() {
  const documents = await client.fetch(allDocumentsQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        Council Documents
      </h1>
      <p className="mt-2 text-gray-600">
        Access meeting agendas, minutes, policies, and financial reports.
      </p>

      {documents.length > 0 ? (
        <div className="mt-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-semibold text-gray-900">Title</th>
                <th className="pb-3 text-sm font-semibold text-gray-900">Type</th>
                <th className="pb-3 text-sm font-semibold text-gray-900">Date</th>
                <th className="pb-3 text-sm font-semibold text-gray-900">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc: any) => (
                <tr key={doc._id}>
                  <td className="py-3">
                    <Link
                      href={`/council/documents/${doc.slug.current}`}
                      className="font-medium text-gray-900 no-underline hover:text-primary"
                    >
                      {doc.title}
                    </Link>
                  </td>
                  <td className="py-3">
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {formatDate(doc.date)}
                  </td>
                  <td className="py-3">
                    {doc.file?.asset?.url && (
                      <a
                        href={`${doc.file.asset.url}?dl=`}
                        className="text-sm font-medium text-primary"
                        download
                      >
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-8 text-gray-600">No documents available yet.</p>
      )}
    </div>
  );
}
