"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { formatDate } from "@/lib/utils";

interface NewsSearchProps {
  articles: any[];
  categories: string[];
}

export default function NewsSearch({ articles, categories }: NewsSearchProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (
        search &&
        !article.title.toLowerCase().includes(search.toLowerCase()) &&
        !(article.excerpt || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (category && article.category?.name !== category) return false;
      if (dateFrom || dateTo) {
        const pubDate = new Date(article.publishedAt);
        if (dateFrom && pubDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59);
          if (pubDate > to) return false;
        }
      }
      return true;
    });
  }, [articles, search, category, dateFrom, dateTo]);

  const activeFilters = [search, category, dateFrom, dateTo].filter(
    Boolean
  ).length;

  const clearAll = () => {
    setSearch("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div>
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search news articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-copper focus:outline-none focus:ring-1 focus:ring-copper"
            aria-label="Search news"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          {/* Category */}
          {categories.length > 0 && (
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-copper focus:outline-none focus:ring-1 focus:ring-copper"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date from */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-copper focus:outline-none focus:ring-1 focus:ring-copper"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-copper focus:outline-none focus:ring-1 focus:ring-copper"
            />
          </div>

          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              className="py-2 text-sm font-medium text-copper hover:text-copper-dark"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="mt-6 text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? "article" : "articles"} found
      </p>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article: any) => (
            <Link
              key={article._id}
              href={`/news/${article.slug.current}`}
              className="group block overflow-hidden rounded-xl border border-gray-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {article.image?.asset ? (
                  <Image
                    src={urlFor(article.image).width(400).height(240).url()}
                    alt={article.image.alt || article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-copper/5 text-copper/30">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5"
                      />
                    </svg>
                  </div>
                )}
                {article.publishedAt && (
                  <div className="absolute top-3 left-3 z-10 rounded-lg bg-white px-2.5 py-1.5 text-center shadow-md">
                    <span className="font-heading text-xl font-bold leading-tight text-gray-900">
                      {new Date(article.publishedAt).getDate()}
                    </span>
                    <br />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-copper">
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-GB",
                        { month: "short" }
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                {article.category?.name && (
                  <span className="text-xs font-semibold text-copper">
                    {article.category.name}
                  </span>
                )}
                <h3 className="mt-1 font-heading text-lg font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5"
            />
          </svg>
          <p className="mt-4 text-gray-500">
            No articles match your filters. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
}
