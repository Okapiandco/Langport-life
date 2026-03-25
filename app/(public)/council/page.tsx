import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Council",
  description: "Langport Town Council information, members, and documents.",
};

export default function CouncilPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        Langport Town Council
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Information about your local council, elected members, meetings, and
        official documents.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/council/members"
          className="group rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="font-heading text-xl font-bold text-gray-900 group-hover:text-primary">
            Council Members
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Meet your elected councillors and council officers.
          </p>
        </Link>

        <Link
          href="/council/documents"
          className="group rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="font-heading text-xl font-bold text-gray-900 group-hover:text-primary">
            Documents
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access meeting agendas, minutes, policies, and reports.
          </p>
        </Link>

        <Link
          href="/environment"
          className="group rounded-lg border border-gray-200 bg-white p-6 no-underline shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="font-heading text-xl font-bold text-gray-900 group-hover:text-primary">
            Environment
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Flooding information and environmental signposting.
          </p>
        </Link>
      </div>
    </div>
  );
}
