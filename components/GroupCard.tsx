import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface GroupCardProps {
  group: {
    _id: string;
    name: string;
    slug: { current: string };
    location?: string;
    meetingTime?: string;
    cost?: string;
    organiser?: string;
    tags?: string[];
    image?: { asset: { url: string }; alt?: string };
  };
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/community-groups/${group.slug.current}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-copper/10">
        {group.image?.asset ? (
          <Image
            src={urlFor(group.image).width(600).height(300).url()}
            alt={group.image.alt || group.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-6xl font-bold text-copper/25">
              {group.name?.[0]}
            </span>
          </div>
        )}
        {group.cost && (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm">
            {group.cost}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
          {group.name}
        </h3>

        {group.organiser && (
          <p className="mt-1 text-xs font-medium text-copper">{group.organiser}</p>
        )}

        {group.location && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-500">
            <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {group.location}
          </p>
        )}

        {group.meetingTime && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-500">
            <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {group.meetingTime}
          </p>
        )}

        {group.tags && group.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {group.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
