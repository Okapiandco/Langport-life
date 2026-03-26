import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { documentsByTagQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Finance",
  description: "Langport Town Council budgets, annual returns, asset register and grant information.",
};

export const revalidate = 60;

export default async function FinancePage() {
  const documents = await client.fetch(documentsByTagQuery, { tag: "finance" } as any);

  // Group by document type for better organization
  const sectionOrder = ["financial", "agenda", "minutes", "other"];
  const sectionNames: Record<string, string> = {
    financial: "Financial Reports & Annual Returns",
    agenda: "Agendas",
    minutes: "Minutes",
    other: "Other Documents",
  };

  const grouped = new Map<string, any[]>();
  for (const doc of documents) {
    const type = sectionOrder.includes(doc.documentType) ? doc.documentType : "other";
    const list = grouped.get(type) || [];
    list.push(doc);
    grouped.set(type, list);
  }

  return (
    <>
      <PageHero
        section="council" breadcrumbs={[{ label: "Council", href: "/council" }, { label: "Finance" }]}
        title="Finance"
        subtitle="Budgets, precepts, annual returns, asset register and grant information."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {documents.length === 0 ? (
          <p className="text-gray-600">No documents available yet.</p>
        ) : (
          <div className="space-y-10">
            {sectionOrder.map((type) => {
              const docs = grouped.get(type);
              if (!docs || docs.length === 0) return null;
              return (
                <section key={type}>
                  <h2 className="font-heading text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    {sectionNames[type]}
                  </h2>
                  <div className="space-y-2">
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
