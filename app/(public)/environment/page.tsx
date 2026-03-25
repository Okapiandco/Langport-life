import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { pageBySlugQuery } from "@/lib/queries";
import { PortableText } from "@portabletext/react";

export const metadata: Metadata = {
  title: "Environment & Flooding",
  description: "Flooding information and environmental resources for Langport and the Somerset Levels.",
};

export const revalidate = 60;

export default async function EnvironmentPage() {
  const page = await client.fetch(pageBySlugQuery, { slug: "environment" });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        {page?.title || "Environment & Flooding"}
      </h1>

      {page?.content ? (
        <div className="prose mt-8 max-w-none">
          <PortableText value={page.content} />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Flooding Information
            </h2>
            <p className="mt-2 text-gray-600">
              Langport sits on the Somerset Levels, an area historically prone to
              flooding. Below are key resources for flood preparation and response.
            </p>
            <div className="mt-4 space-y-3">
              <a
                href="https://check-for-flooding.service.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 p-4 no-underline hover:bg-gray-50"
              >
                <h3 className="font-semibold text-primary">Check for Flooding (Gov.uk)</h3>
                <p className="text-sm text-gray-600">
                  Check current flood warnings, river levels, and rainfall data.
                </p>
              </a>
              <a
                href="https://www.somersetrivers.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 p-4 no-underline hover:bg-gray-50"
              >
                <h3 className="font-semibold text-primary">Somerset Rivers Authority</h3>
                <p className="text-sm text-gray-600">
                  Local flood risk management and prevention updates.
                </p>
              </a>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              Emergency Contacts
            </h2>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>
                <strong>Environment Agency Floodline:</strong>{" "}
                <a href="tel:03459881188" className="text-primary">0345 988 1188</a>
              </li>
              <li>
                <strong>Somerset Council:</strong>{" "}
                <a href="tel:03001232224" className="text-primary">0300 123 2224</a>
              </li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
