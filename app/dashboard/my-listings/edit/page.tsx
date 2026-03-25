"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    street: "",
    town: "Langport",
    postcode: "",
    phone: "",
    email: "",
    website: "",
    tags: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/listings", {
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
      setError(data.error || "Failed to submit listing.");
      return;
    }

    router.push("/dashboard/my-listings?submitted=true");
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Submit / Edit Business Listing
      </h1>
      <p className="mt-2 text-gray-600">
        Changes will be reviewed by the town clerk before publishing.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Business Name *
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
            <input id="street" type="text" value={form.street} onChange={(e) => update("street", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
          </div>
          <div>
            <label htmlFor="town" className="block text-sm font-medium text-gray-700">Town</label>
            <input id="town" type="text" value={form.town} onChange={(e) => update("town", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
          </div>
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">Postcode</label>
            <input id="postcode" type="text" value={form.postcode} onChange={(e) => update("postcode", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
            <input id="website" type="url" value={form.website} onChange={(e) => update("website", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input id="tags" type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="e.g. Food, Drink, Takeaway" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green focus:outline-none focus:ring-1 focus:ring-green" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-6 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
