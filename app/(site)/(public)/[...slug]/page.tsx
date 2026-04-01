import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { pageBySlugQuery } from "@/lib/queries";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug.join("/");
  const page = await client.fetch(pageBySlugQuery, { slug: pageSlug });
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.seoDescription || page.description,
  };
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;
  const pageSlug = slug.join("/");
  const page = await client.fetch(pageBySlugQuery, { slug: pageSlug });
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {page.image?.asset && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg">
          <Image
            src={urlFor(page.image).width(900).height(400).url()}
            alt={page.image.alt || page.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <h1 className="font-heading text-4xl font-bold text-gray-900">
        {page.title}
      </h1>
      {page.content && (
        <div className="prose mt-8 max-w-none">
          <PortableText value={page.content} />
        </div>
      )}
    </article>
  );
}
