import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Town Council",
  description: "Langport Town Council information, members, and documents.",
};

const sections = [
  {
    heading: "Councillor Information",
    items: [
      { name: "Town Councillors", href: "/council/members", desc: "Meet your elected councillors." },
      { name: "Somerset Councillors", href: "/council/somerset-councillors", desc: "Your county-level representatives." },
      { name: "Staff & Volunteers", href: "/council/staff-and-volunteers", desc: "Council staff and volunteer roles." },
    ],
  },
  {
    heading: "Governance & Transparency",
    items: [
      { name: "Finance", href: "/council/finance", desc: "Budgets, annual returns, asset register and grants." },
      { name: "Governance & Transparency", href: "/council/governance", desc: "Standing orders, policies and procedures." },
    ],
  },
  {
    heading: "Agendas & Minutes",
    items: [
      { name: "All Committees", href: "/council/documents", desc: "Browse all committee agendas and minutes." },
      { name: "Full Council", href: "/council/documents/full-council", desc: "Full Council meeting documents." },
      { name: "Finance & Personnel", href: "/council/documents/finance-personnel", desc: "Finance & Personnel Committee." },
      { name: "Tourism & Marketing", href: "/council/documents/tourism-marketing", desc: "Tourism & Marketing Committee." },
      { name: "Joint Committee", href: "/council/documents/joint-committee", desc: "Joint Council Committee." },
      { name: "Annual Assembly", href: "/council/documents/annual-assembly", desc: "Annual Town Assembly." },
      { name: "Archived Minutes", href: "/council/documents/archived", desc: "Compiled annual minutes." },
    ],
  },
  {
    heading: "Our Work",
    items: [
      { name: "What We Do", href: "/council/what-we-do", desc: "The council's role and responsibilities." },
      { name: "Services", href: "/council/services", desc: "Services provided by the council." },
    ],
  },
];

export default function CouncilPage() {
  return (
    <>
      <PageHero
        section="council"
        title="Langport Town Council"
        subtitle="Information about your local council, elected members, meetings, and official documents."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-heading text-xl font-bold text-green border-b-2 border-green/20 pb-2">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block rounded-lg bg-green/5 p-4 no-underline hover:bg-green/10 transition-colors border border-green/10"
                  >
                    <h3 className="font-heading text-base font-semibold text-gray-900 group-hover:text-green">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
