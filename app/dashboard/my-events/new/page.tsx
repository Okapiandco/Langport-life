"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: "",
    endDate: "",
    venueId: "",
    eventType: "",
    organiser: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    isFree: true,
    accessibilityInfo: "",
    tags: "",
  });

  useEffect(() => {
    fetch("/api/venues")
      .then((res) => res.json())
      .then(setVenues)
      .catch(() => {});
  }, []);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit event.");
      return;
    }

    router.push("/dashboard/my-events?submitted=true");
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Submit New Event
      </h1>
      <p className="mt-2 text-gray-600">
        Your event will be reviewed before it appears on the site.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Start Date & Time *
            </label>
            <input
              id="date"
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date & Time
            </label>
            <input
              id="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
        </div>

        <div>
          <label htmlFor="venueId" className="block text-sm font-medium text-gray-700">
            Venue *
          </label>
          <select
            id="venueId"
            required
            value={form.venueId}
            onChange={(e) => update("venueId", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">Select a venue...</option>
            {venues.map((v: any) => (
              <option key={v._id} value={v._id}>{v.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            id="eventType"
            value={form.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">Select type...</option>
            <option value="meeting">Meeting</option>
            <option value="social">Social</option>
            <option value="workshop">Workshop</option>
            <option value="market">Market</option>
            <option value="performance">Performance</option>
            <option value="community">Community</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isFree"
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => update("isFree", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-green"
          />
          <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
            This event is free
          </label>
        </div>

        <div>
          <label htmlFor="organiser" className="block text-sm font-medium text-gray-700">
            Organiser
          </label>
          <input
            id="organiser"
            type="text"
            value={form.organiser}
            onChange={(e) => update("organiser", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700">Contact Details</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Name"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              aria-label="Contact name"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              aria-label="Contact email"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              aria-label="Contact phone"
            />
          </div>
        </fieldset>

        <div>
          <label htmlFor="accessibilityInfo" className="block text-sm font-medium text-gray-700">
            Accessibility Information
          </label>
          <textarea
            id="accessibilityInfo"
            rows={2}
            value={form.accessibilityInfo}
            onChange={(e) => update("accessibilityInfo", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            placeholder="e.g. Wheelchair accessible, hearing loop available"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            placeholder="e.g. Music, Family, Outdoor"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-6 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting..." : "Submit Event for Review"}
        </button>
      </form>
    </div>
  );
}
