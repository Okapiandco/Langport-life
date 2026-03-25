import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import { allCouncilMembersQuery } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Council Members",
  description: "Meet the elected councillors and officers of Langport Town Council.",
};

export const revalidate = 60;

export default async function CouncilMembersPage() {
  const members = await client.fetch(allCouncilMembersQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        Council Members
      </h1>
      <p className="mt-2 text-gray-600">
        Meet the people who represent Langport Town Council.
      </p>

      {members.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member: any) => (
            <Link
              key={member._id}
              href={`/council/members/${member.slug.current}`}
              className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 no-underline shadow-sm hover:shadow-md transition-shadow"
            >
              {member.image?.asset ? (
                <Image
                  src={urlFor(member.image).width(80).height(80).url()}
                  alt={member.image.alt || member.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {member.name?.[0]}
                </div>
              )}
              <div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
                  {member.name}
                </h3>
                <p className="text-sm capitalize text-copper">{member.role}</p>
                {member.ward && (
                  <p className="text-sm text-gray-500">Ward: {member.ward}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-gray-600">Council member profiles coming soon.</p>
      )}
    </div>
  );
}
