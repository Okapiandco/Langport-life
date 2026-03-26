import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { documentTagCountsQuery } from "@/lib/queries";
import { COMMITTEES } from "@/lib/committees";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Agendas & Minutes",
  description: "Access Langport Town Council meeting agendas, minutes and supporting papers.",
};

export const revalidate = 60;

export default async function AgendasMinutesPage() {
  const counts = await client.fetch(documentTagCountsQuery);

  return (
    <>
      <PageHero
        section="council"
        title="Agendas & Minutes"
        subtitle="Council meetings are open to the public. Agendas are published in advance and minutes after each meeting."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMMITTEES.map((committee) => (
            <Link
              key={committee.tag}
              href={`/council/documents/${committee.tag}`}
              className="group block rounded-lg border border-green/10 bg-green/5 p-6 no-underline hover:bg-green/10 transition-colors"
            >
              <h2 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-green">
                {committee.shortName}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{committee.description}</p>
              <p className="mt-3 text-xs font-medium text-green">
                {counts[committee.tag] || 0} documents
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">Other Council Documents</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/council/governance"
              className="group block rounded-lg border border-green/10 bg-green/5 p-6 no-underline hover:bg-green/10 transition-colors"
            >
              <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-green">
                Governance & Transparency
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Standing orders, financial regulations, policies and procedures.
              </p>
              <p className="mt-3 text-xs font-medium text-green">
                {counts["governance"] || 0} documents
              </p>
            </Link>
            <Link
              href="/council/finance"
              className="group block rounded-lg border border-green/10 bg-green/5 p-6 no-underline hover:bg-green/10 transition-colors"
            >
              <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-green">
                Finance
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Budgets, annual returns, asset register and grant information.
              </p>
              <p className="mt-3 text-xs font-medium text-green">
                {counts["finance"] || 0} documents
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
