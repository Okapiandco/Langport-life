import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import { somersetCouncillorsQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Somerset Councillors",
  description: "Meet your Somerset and District councillors representing the Langport area.",
};

export const revalidate = 60;

export default async function SomersetCouncillorsPage() {
  const members = await client.fetch(somersetCouncillorsQuery);

  const somerset = members.filter((m: any) => m.councilLevel === "somerset");
  const district = members.filter((m: any) => m.councilLevel === "district");

  function MemberCard({ member }: { member: any }) {
    const levelLabel = member.councilLevel === "somerset" ? "Somerset Councillor" : "District Councillor";

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
          <p className="mt-0.5 text-sm font-medium text-copper">{levelLabel}</p>
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

  return (
    <>
      <PageHero
        section="council"
        title="Somerset Councillors"
        subtitle="Meet your Somerset and District councillors representing the Langport area."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/council" className="hover:text-green no-underline">Council</Link>
          {" / "}
          <span className="text-gray-900">Somerset Councillors</span>
        </nav>

        {members.length > 0 ? (
          <>
            {somerset.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  Somerset Councillors
                </h2>
                <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {somerset.map((member: any) => (
                    <MemberCard key={member._id} member={member} />
                  ))}
                </div>
              </div>
            )}
            {district.length > 0 && (
              <div className="mt-10">
                <h2 className="font-heading text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  District Councillors
                </h2>
                <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {district.map((member: any) => (
                    <MemberCard key={member._id} member={member} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-8 text-gray-600">
            Somerset and District councillor profiles coming soon.
          </p>
        )}
      </div>
    </>
  );
}
