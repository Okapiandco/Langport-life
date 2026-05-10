import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allGroupsQuery } from "@/lib/queries";
import GroupCard from "@/components/GroupCard";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Join a Group",
  description:
    "Find local groups, clubs and societies to join in and around Langport, Somerset.",
};

export const revalidate = 3600;

interface GroupListItem {
  _id: string;
  name: string;
  slug: { current: string };
  location?: string;
  meetingTime?: string;
  cost?: string;
  image?: { asset: { url: string }; alt?: string };
}

export default async function JoinAGroupPage() {
  const groups: GroupListItem[] = await client.fetch(allGroupsQuery);

  return (
    <>
      <PageHero
        section="things-to-do"
        title="Join a Group"
        subtitle="Local groups, clubs and societies in and around Langport — find one to join."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {groups.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No groups listed yet.</p>
        )}
      </div>
    </>
  );
}
