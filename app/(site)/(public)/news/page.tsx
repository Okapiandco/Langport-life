import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allArticlesQuery, articleCategoriesQuery } from "@/lib/queries";
import NewsSearch from "@/components/NewsSearch";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news and stories from the Langport community in Somerset.",
};

export const revalidate = 3600;

export default async function NewsPage() {
  const [articles, categories] = await Promise.all([
    client.fetch(allArticlesQuery),
    client.fetch(articleCategoriesQuery),
  ]);

  const categoryNames = categories
    .filter((c: any) => c.count > 0)
    .map((c: any) => c.name) as string[];

  return (
    <>
      <PageHero
        section="news"
        title="News"
        subtitle="Latest news and stories from the Langport community."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <NewsSearch articles={articles} categories={categoryNames} />
      </div>
    </>
  );
}
