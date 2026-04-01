import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Council Services",
  description:
    "Services and facilities owned and managed by Langport Town Council and the Langport Town Trust.",
};

const services = [
  {
    name: "Public Conveniences",
    description:
      "Located in the town square, the Town Council assumed responsibility from South Somerset District Council in 2009. The facilities have been recently updated.",
  },
  {
    name: "Memorial Field",
    description:
      "A playing field where Langport Town Council serves as joint custodian trustee alongside Huish Episcopi Parish Council.",
  },
  {
    name: "Cricket Pavilion",
    description:
      "Located on Field Road and owned by Langport Town Council, the pavilion has historically served as home to the Huish and Langport cricket teams.",
  },
  {
    name: "All Saints Churchyard",
    description:
      "The Town Council maintains the churchyard, including grounds upkeep, wall and gate maintenance.",
  },
  {
    name: "Cocklemoor",
    description:
      "An unspoilt riverside area between the main car park and the River Parrett. Popular with walkers and families.",
  },
  {
    name: "Langport Cemetery",
    description:
      "Acquired by the Town Council in 1880 and recently improved through significant maintenance work.",
  },
];

const emergencyContacts = [
  { name: "Langport Town Council", phone: "01458 259700" },
  { name: "Avon and Somerset Police", phone: "999" },
  { name: "Somerset Council", phone: "0300 123 2224" },
];

export default function CouncilServicesPage() {
  return (
    <>
      <PageHero
        section="council"
        breadcrumbs={[
          { label: "Council", href: "/council" },
          { label: "Services" },
        ]}
        title="Council Services"
        subtitle="Langport Town Council and the Langport Town Trust own and manage several community sites and services throughout Langport."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h2 className="font-heading text-lg font-semibold text-gray-900">
                {service.name}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-green/5 border border-green/10 p-6">
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            Useful Contacts
          </h3>
          <div className="mt-4 space-y-2">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{contact.name}</span>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
