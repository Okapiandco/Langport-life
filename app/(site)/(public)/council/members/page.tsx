import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import { allCouncilMembersQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Town Councillors",
  description: "Meet the elected councillors and officers of Langport Town Council.",
};

export const revalidate = 3600;

export default async function CouncilMembersPage() {
  const members = await client.fetch(allCouncilMembersQuery);

  // Group by role
  const chair = members.filter((m: any) => m.role === "chair");
  const viceChair = members.filter((m: any) => m.role === "viceChair");
  const clerk = members.filter((m: any) => m.role === "clerk");
  const officers = members.filter((m: any) => m.role === "officer");
  const councillors = members.filter(
    (m: any) => !m.role || m.role === "councillor"
  );

  function MemberCard({ member }: { member: any }) {
    return (
      <Link
        href={`/council/members/${member.slug.current}`}
        className="group block overflow-hidden rounded-xl bg-white no-underline shadow-sm hover:shadow-md transition-all border border-gray-100"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          {member.image?.asset ? (
            <Image
              src={urlFor(member.image).width(400).height(530).url()}
              alt={member.image.alt || member.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/5">
              <span className="text-5xl font-heading font-bold text-primary/30">
                {member.name?.[0]}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 text-center">
          <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
            {member.name}
          </h3>
          {member.role && (
            <p className="mt-0.5 text-sm font-medium capitalize text-copper">
              {member.role === "viceChair" ? "Vice Chair" : member.role}
            </p>
          )}
          {member.ward && (
            <p className="mt-0.5 text-xs text-gray-500">Ward: {member.ward}</p>
          )}
          {member.email && (
            <p className="mt-2 text-xs text-gray-400 truncate">{member.email}</p>
          )}
        </div>
      </Link>
    );
  }

  function MemberSection({ title, members: sectionMembers }: { title: string; members: any[] }) {
    if (sectionMembers.length === 0) return null;
    return (
      <div className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          {title}
        </h2>
        <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sectionMembers.map((member: any) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        section="council"
        title="Town Councillors"
        subtitle="Meet the people who represent Langport Town Council."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {members.length > 0 ? (
        <>
          <MemberSection title="Chair" members={chair} />
          <MemberSection title="Vice Chair" members={viceChair} />
          <MemberSection title="Town Clerk" members={clerk} />
          <MemberSection title="Officers" members={officers} />
          <MemberSection title="Councillors" members={councillors} />
        </>
      ) : (
        <p className="mt-8 text-gray-600">Council member profiles coming soon.</p>
      )}
    </div>
    </>
  );
}
