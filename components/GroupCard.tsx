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
    image?: { asset: { url: string }; alt?: string };
  };
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/join-a-group/${group.slug.current}`}
      className="group block break-inside-avoid mb-5 overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
    >
      {group.image?.asset ? (
        <div className="relative w-full overflow-hidden">
          <Image
            src={urlFor(group.image).width(600).url()}
            alt={group.image.alt || group.name}
            width={600}
            height={400}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-primary/5">
          <span className="text-4xl font-heading font-bold text-primary/20">
            {group.name?.[0]}
          </span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-primary">
          {group.name}
        </h3>
        {group.location && (
          <p className="mt-1 text-sm text-gray-600">{group.location}</p>
        )}
        {group.meetingTime && (
          <p className="mt-1 text-sm text-gray-500">{group.meetingTime}</p>
        )}
        {group.cost && (
          <p className="mt-2 inline-block rounded-full bg-light-blue/50 px-2 py-0.5 text-xs text-gray-700">
            {group.cost}
          </p>
        )}
      </div>
    </Link>
  );
}
