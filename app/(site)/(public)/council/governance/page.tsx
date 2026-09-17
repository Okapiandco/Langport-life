import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { documentsByTagQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";
import CollapsibleSection from "@/components/CollapsibleSection";

export const metadata: Metadata = {
  title: "Governance & Transparency",
  alternates: { canonical: "/council/governance" },
  description: "Langport Town Council standing orders, financial regulations, policies and procedures.",
};

export const revalidate = 3600;

export default async function GovernancePage() {
  // The calendar of meetings has its own page, so leave it out here
  const documents = (await client.fetch(documentsByTagQuery, { tag: "governance" } as any)).filter(
    (doc: any) => !doc.tags?.includes("calendar-of-meetings")
  );

  // Group by document type
  const grouped = new Map<string, any[]>();
  for (const doc of documents) {
    const typeMap: Record<string, string> = {
      policy: "Council Policies",
      decision: "Council Procedures",
      other: "Other Documents",
    };
    const type = typeMap[doc.documentType] || "Council Procedures";
    const list = grouped.get(type) || [];
    list.push(doc);
    grouped.set(type, list);
  }

  return (
    <>
      <PageHero
        section="council" breadcrumbs={[{ label: "Council", href: "/council" }, { label: "Governance & Transparency" }]}
        title="Governance & Transparency"
        subtitle="Standing orders, financial regulations, policies and procedures governing how the council operates."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {documents.length === 0 ? (
          <p className="text-gray-600">No documents available yet.</p>
        ) : (
          <div>
            {Array.from(grouped.entries()).map(([section, docs], index) => (
              <CollapsibleSection key={section} title={section} count={docs.length} defaultOpen={index === 0}>
                {docs.map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:border-green/20 hover:bg-green/5 transition-colors">
                    <Link
                      href={`/council/documents/${doc.slug.current}`}
                      className="text-sm font-medium text-gray-900 no-underline hover:text-green"
                    >
                      {doc.title}
                    </Link>
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
            ))}
          </div>
        )}
      </div>
    </>
  );
}
