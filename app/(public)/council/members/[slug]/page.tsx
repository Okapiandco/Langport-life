import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { councilMemberBySlugQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await client.fetch(councilMemberBySlugQuery, { slug });
  if (!member) return { title: "Member Not Found" };
  return { title: member.name, description: `${member.name} — ${member.role || "Council Member"}` };
}

export default async function CouncilMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await client.fetch(councilMemberBySlugQuery, { slug });
  if (!member) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {member.image?.asset ? (
          <Image
            src={urlFor(member.image).width(200).height(200).url()}
            alt={member.image.alt || member.name}
            width={200}
            height={200}
            className="h-48 w-48 flex-shrink-0 rounded-full object-cover"
            priority
          />
        ) : (
          <div className="flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-5xl font-bold text-primary">
            {member.name?.[0]}
          </div>
        )}
        <div>
          <h1 className="font-heading text-4xl font-bold text-gray-900">
            {member.name}
          </h1>
          {member.role && (
            <p className="mt-1 text-lg capitalize text-copper">{member.role}</p>
          )}
          {member.ward && (
            <p className="mt-1 text-sm text-gray-600">Ward: {member.ward}</p>
          )}
          {member.startDate && (
            <p className="mt-1 text-sm text-gray-500">
              In office since {formatDate(member.startDate)}
            </p>
          )}
          <div className="mt-3 space-y-1">
            {member.email && (
              <p className="text-sm">
                <a href={`mailto:${member.email}`} className="text-primary">{member.email}</a>
              </p>
            )}
            {member.phone && (
              <p className="text-sm">
                <a href={`tel:${member.phone}`} className="text-primary">{member.phone}</a>
              </p>
            )}
          </div>
        </div>
      </div>

      {member.biography && (
        <div className="prose mt-8 max-w-none">
          <PortableText value={member.biography} />
        </div>
      )}

      {member.socialLinks && member.socialLinks.length > 0 && (
        <div className="mt-6 flex gap-4">
          {member.socialLinks.map((link: any, i: number) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary"
            >
              {link.platform}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
