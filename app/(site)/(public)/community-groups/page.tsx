import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity";
import { allGroupsQuery } from "@/lib/queries";
import GroupCard from "@/components/GroupCard";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Community Groups",
  description:
    "Find local groups, clubs and societies in and around Langport, Somerset.",
};

export const revalidate = 3600;

interface GroupListItem {
  _id: string;
  name: string;
  slug: { current: string };
  location?: string;
  meetingTime?: string;
  cost?: string;
  organiser?: string;
  tags?: string[];
  image?: { asset: { url: string }; alt?: string };
}

export default async function CommunityGroupsPage() {
  const groups: GroupListItem[] = await client.fetch(allGroupsQuery);

  return (
    <>
      <PageHero
        section="things-to-do"
        title="Community Groups"
        subtitle="Local groups, clubs and societies in and around Langport — find one to join."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Community Groups" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-sm">
            {groups.length > 0
              ? `${groups.length} group${groups.length === 1 ? "" : "s"} listed`
              : "Be the first to add your group"}
          </p>
          <Link
            href="/submit/group"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary/90 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add a Group
          </Link>
        </div>

        {groups.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
            <p className="text-gray-500">No groups listed yet.</p>
            <Link
              href="/submit/group"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-primary/90 transition"
            >
              Add the first group
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
