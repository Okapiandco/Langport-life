import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Guides",
  description: "Helpful guides for getting the most out of Langport Life — how to submit listings, content standards, and more.",
};

const guides = [
  {
    href: "/guides/how-to-list",
    title: "How to Submit, Edit & Claim a Listing",
    description:
      "Step-by-step guide to adding your event, business, venue, or community group to Langport Life — and how to keep it up to date using your personal edit link.",
    tags: ["Events", "Businesses", "Venues", "Groups"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: "/guides/submission-guidelines",
    title: "Content Standards & Guidelines",
    description:
      "What makes a good listing — guidance on writing titles and descriptions, choosing photos, and what to include for each listing type so your submission gets approved quickly.",
    tags: ["Content", "Photos", "Best Practice"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function GuidesPage() {
  return (
    <>
      <PageHero
        section="things-to-do"
        title="Guides"
        subtitle="Everything you need to know about adding and managing your listing on Langport Life."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm no-underline hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {guide.icon}
              </div>
              <h2 className="font-heading text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                {guide.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">
                {guide.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {guide.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 max-w-4xl">
          <h3 className="font-heading text-base font-bold text-gray-900 mb-2">Need more help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you can&rsquo;t find what you&rsquo;re looking for, or something isn&rsquo;t working as expected, get in touch with the team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary/90 transition"
          >
            Contact us
          </Link>
        </div>
      </div>
    </>
  );
}
