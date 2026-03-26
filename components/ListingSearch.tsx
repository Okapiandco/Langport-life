"use client";

import { useState, useMemo } from "react";
import ListingCard from "./ListingCard";

interface ListingSearchProps {
  listings: any[];
  categories: any[];
}

export default function ListingSearch({ listings, categories }: ListingSearchProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filtered = useMemo(() => {
    let result = listings.filter((listing) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = listing.title?.toLowerCase().includes(q);
        const matchTags = listing.tags?.some((t: string) => t.toLowerCase().includes(q));
        const matchCategory = listing.category?.name?.toLowerCase().includes(q);
        if (!matchTitle && !matchTags && !matchCategory) return false;
      }
      if (categoryFilter && listing.category?.name !== categoryFilter) return false;
      return true;
    });

    if (sortBy === "name") {
      result.sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "category") {
      result.sort((a: any, b: any) => (a.category?.name || "").localeCompare(b.category?.name || ""));
    }

    return result;
  }, [listings, search, categoryFilter, sortBy]);

  const activeFilters = [categoryFilter, search].filter(Boolean).length;

  return (
    <div>
      {/* Search bar */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search businesses, services, shops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Search business listings"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((cat: any) => (
            <option key={cat._id} value={cat.name}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Sort by"
        >
          <option value="name">Sort: A-Z</option>
          <option value="category">Sort: Category</option>
        </select>

        {activeFilters > 0 && (
          <button
            onClick={() => { setSearch(""); setCategoryFilter(""); }}
            className="text-sm text-copper hover:text-copper-dark"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Category pills - quick filter */}
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("")}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              !categoryFilter
                ? "bg-primary text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {categories.filter((c: any) => c.count > 0).map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setCategoryFilter(categoryFilter === cat.name ? "" : cat.name)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                categoryFilter === cat.name
                  ? "bg-primary text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="mt-4 text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? "business" : "businesses"} found
      </p>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="mt-4 columns-1 sm:columns-2 lg:columns-3 gap-5">
          {filtered.map((listing: any) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-500">
          No businesses match your search. Try a different term or category.
        </p>
      )}
    </div>
  );
}
