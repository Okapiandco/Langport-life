import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/lib/sanity";
import { documentBySlugQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await client.fetch(documentBySlugQuery, { slug });
  if (!doc) return { title: "Document Not Found" };
  return { title: doc.title };
}

export default async function CouncilDocumentPage({ params }: Props) {
  const { slug } = await params;
  const doc = await client.fetch(documentBySlugQuery, { slug });
  if (!doc) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
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
