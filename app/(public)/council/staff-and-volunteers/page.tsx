import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Staff & Volunteers",
  description: "Meet the staff and volunteers who support Langport Town Council.",
};

const staff = [
  {
    name: "Gerard Tucker",
    role: "Town Clerk",
    description:
      "The Town Clerk is the council's principal officer and is responsible for ensuring the council acts within the law and follows proper procedures.",
  },
  {
    name: "Morag Kelly",
    role: "Deputy Clerk",
    description:
      "The Deputy Clerk supports the Town Clerk in the day-to-day running of the council.",
  },
  {
    name: "Peter Frome",
    role: "Part-time Caretaker",
    description: "Peter works part time as a council caretaker.",
  },
  {
    name: "Callum Montgomery",
    role: "Lengthsperson",
    description: "Callum works as the council's Lengthsperson.",
  },
];

export default function StaffAndVolunteersPage() {
  return (
    <>
      <PageHero
        section="council"
        breadcrumbs={[
          { label: "Council", href: "/council" },
          { label: "Staff & Volunteers" },
        ]}
        title="Staff & Volunteers"
        subtitle="Meet the people who keep the council running day to day."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Staff */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          Council Staff
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((person) => (
            <div
              key={person.name}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 mb-4">
                <span className="text-2xl font-heading font-bold text-primary/30">
                  {person.name[0]}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-gray-900">
                {person.name}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-copper">
                {person.role}
              </p>
              <p className="mt-2 text-sm text-gray-600">{person.description}</p>
            </div>
          ))}
        </div>

        {/* Volunteers */}
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Volunteers
          </h2>
          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-gray-700">
              Langport Town Council is supported by a loyal group of volunteers
              who help with the Information Centre and Lorry Watch scheme.
            </p>
            <p className="mt-4 text-gray-700">
              If you are interested in volunteering, please contact the Town
              Clerk on{" "}
              <a href="tel:01458259700" className="text-primary hover:text-primary-dark font-medium">
                01458 259700
              </a>.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-lg bg-green/5 border border-green/10 p-6">
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            Contact the Council Office
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Phone:{" "}
            <a href="tel:01458259700" className="text-primary hover:text-primary-dark font-medium">
              01458 259700
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
