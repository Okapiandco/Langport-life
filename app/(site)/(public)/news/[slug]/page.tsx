import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "@/lib/sanity";
import { articleBySlugQuery } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { groq } from "next-sanity";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await client.fetch(articleBySlugQuery, { slug });
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt || `${article.title} — Langport Life News`,
  };
}

const relatedArticlesQuery = groq`
  *[_type == "article" && published == true && _id != $id] | order(publishedAt desc) [0...3] {
    _id, title, slug, excerpt, publishedAt,
    image { asset->{url}, alt },
    category->{ name }
  }
`;

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await client.fetch(articleBySlugQuery, { slug });
  if (!article) notFound();

  const related = await client.fetch(relatedArticlesQuery, {
    id: article._id,
  });

  return (
    <>
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header>
          {article.category?.name && (
            <span className="inline-block rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
              {article.category.name}
            </span>
          )}
          <h1 className="mt-3 font-heading text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <div className="mt-3 h-1 w-20 rounded-full bg-copper" />
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            )}
            {article.author && <span>By {article.author}</span>}
          </div>
        </header>

        {/* Hero image */}
        {article.image?.asset && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={urlFor(article.image).width(900).height(506).url()}
              alt={article.image.alt || article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-8 text-lg font-medium text-gray-700 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Content */}
        {article.content && (
          <div className="mt-8 prose prose-gray max-w-none prose-headings:font-heading prose-a:text-primary">
            <PortableText value={article.content} />
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-200 pt-6">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/news"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            &larr; Back to all news
          </Link>
        </div>
      </article>

      {/* Related articles */}
      {related?.length > 0 && (
        <section className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900">
              More news
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-copper" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/news/${item.slug.current}`}
                  className="group block overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
                >
                  {item.image?.asset && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={urlFor(item.image).width(400).height(220).url()}
                        alt={item.image.alt || item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {item.category?.name && (
                      <span className="text-xs font-semibold text-copper">
                        {item.category.name}
                      </span>
                    )}
                    <h3 className="mt-1 font-heading text-base font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
                      {item.title}
                    </h3>
                    {item.publishedAt && (
                      <p className="mt-1.5 text-xs text-gray-400">
                        {formatDate(item.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
