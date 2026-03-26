"use client";

import { useState, useMemo } from "react";
import EventCard from "./EventCard";

interface EventSearchProps {
  events: any[];
  venues: string[];
  eventTypes: string[];
}

export default function EventSearch({
  events,
  venues,
  eventTypes,
}: EventSearchProps) {
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      if (
        search &&
        !event.title.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (venueFilter && event.venue?.title !== venueFilter) return false;
      if (typeFilter && event.eventType !== typeFilter) return false;
      if (freeOnly && !event.isFree) return false;

      // Date range filter takes priority over time presets
      if (dateFrom || dateTo) {
        const eventDate = new Date(event.date);
        if (dateFrom && eventDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59);
          if (eventDate > to) return false;
        }
        return true;
      }

      if (timeFilter === "upcoming" && new Date(event.date) < now)
        return false;
      if (timeFilter === "past" && new Date(event.date) >= now) return false;
      if (timeFilter === "thisMonth") {
        const d = new Date(event.date);
        if (
          d.getMonth() !== now.getMonth() ||
          d.getFullYear() !== now.getFullYear()
        )
          return false;
      }
      if (timeFilter === "thisWeek") {
        const d = new Date(event.date);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (d < now || d > weekEnd) return false;
      }
      return true;
    });
  }, [events, search, venueFilter, typeFilter, freeOnly, timeFilter, dateFrom, dateTo]);

  const activeFilters = [
    venueFilter,
    typeFilter,
    freeOnly,
    timeFilter !== "upcoming",
    dateFrom,
    dateTo,
    search,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch("");
    setVenueFilter("");
    setTypeFilter("");
    setFreeOnly(false);
    setTimeFilter("upcoming");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div>
      {/* Search & filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        {/* Search bar */}
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
            placeholder="Search events by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Search events"
          />
        </div>

        {/* Filter row */}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              When
            </label>
            <select
              value={dateFrom || dateTo ? "custom" : timeFilter}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setTimeFilter(e.target.value);
                  setDateFrom("");
                  setDateTo("");
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Filter by time"
            >
              <option value="upcoming">Upcoming</option>
              <option value="thisWeek">This week</option>
              <option value="thisMonth">This month</option>
              <option value="all">All dates</option>
              <option value="past">Past events</option>
              {(dateFrom || dateTo) && (
                <option value="custom">Custom dates</option>
              )}
            </select>
          </div>

          {venues.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Venue
              </label>
              <select
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Filter by venue"
              >
                <option value="">All venues</option>
                {venues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

          {eventTypes.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Filter by event type"
              >
                <option value="">All types</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date range pickers */}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="flex items-center gap-2 py-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Free only
          </label>

          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              className="py-2 text-sm font-medium text-copper hover:text-copper-dark"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="mt-6 text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? "event" : "events"} found
      </p>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event: any) => (
            <EventCard key={event._id} event={event} />
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">
            No events match your filters. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
}
