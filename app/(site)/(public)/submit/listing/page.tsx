"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PageHero from "@/components/PageHero";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false }
);

const LANGPORT_CENTRE = { lat: 51.0374, lng: -2.8287 };

export default function SubmitListingPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState("");

  async function findOnMap() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const street = (fd.get("street") as string) || "";
    const town = (fd.get("town") as string) || "Langport";
    const postcode = (fd.get("postcode") as string) || "";
    const query = [street, town, postcode].filter(Boolean).join(", ");

    if (!query) {
      setGeocodeMsg("Enter at least a street or postcode first.");
      setPin(LANGPORT_CENTRE);
      return;
    }

    setGeocoding(true);
    setGeocodeMsg("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`,
        { headers: { "User-Agent": "langport.life/listing-submit" } }
      );
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (results.length) {
        setPin({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
        setGeocodeMsg("Found! Drag the pin or click the map to fine-tune the position.");
      } else {
        setPin(LANGPORT_CENTRE);
        setGeocodeMsg("Address not found — showing Langport town centre. Drag the pin to your exact location.");
      }
    } catch {
      setPin(LANGPORT_CENTRE);
      setGeocodeMsg("Could not look up the address. Drag the pin to your exact location.");
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    const body = {
      type: "listing",
      submitterName: form.get("submitterName"),
      submitterEmail: form.get("submitterEmail"),
      submitterPhone: form.get("submitterPhone") || undefined,
      title: form.get("title"),
      description: form.get("description") || undefined,
      street: form.get("street") || undefined,
      town: form.get("town") || "Langport",
      postcode: form.get("postcode") || undefined,
      phone: form.get("phone") || undefined,
      email: form.get("email") || undefined,
      website: form.get("website") || undefined,
      // Pass confirmed pin coordinates if the user set them
      lat: pin?.lat,
      lng: pin?.lng,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push("/submit/thank-you");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <>
      <PageHero
        section="listings"
        title="Add a Business"
        subtitle="Get your business listed on Langport Life."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Submit", href: "/submit" },
          { label: "Business Listing" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Your details */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Your Details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="submitterName" className="block text-sm font-medium text-gray-700">Your Name *</label>
                <input type="text" id="submitterName" name="submitterName" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="submitterEmail" className="block text-sm font-medium text-gray-700">Your Email *</label>
                <input type="email" id="submitterEmail" name="submitterEmail" required className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="submitterPhone" className="block text-sm font-medium text-gray-700">
                Your Phone <span className="text-gray-400">(optional)</span>
              </label>
              <input type="tel" id="submitterPhone" name="submitterPhone" className={`${inputClass} sm:max-w-xs`} />
            </div>
          </fieldset>

          {/* Business details */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Business Details</legend>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Business Name *</label>
              <input type="text" id="title" name="title" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" rows={4} className={inputClass}
                placeholder="What does your business do? What can customers expect?" />
            </div>
          </fieldset>

          {/* Address + map pin */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Address & Map Location</legend>
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
              <input type="text" id="street" name="street" className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="town" className="block text-sm font-medium text-gray-700">Town</label>
                <input type="text" id="town" name="town" defaultValue="Langport" className={inputClass} />
              </div>
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">Postcode</label>
                <input type="text" id="postcode" name="postcode" className={inputClass} />
              </div>
            </div>

            {/* Map pin section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Pin Location <span className="text-gray-400">(optional but recommended)</span>
                </p>
                <button
                  type="button"
                  onClick={findOnMap}
                  disabled={geocoding}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-50 transition"
                >
                  {geocoding ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Finding…
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      Find on map
                    </>
                  )}
                </button>
              </div>

              {geocodeMsg && (
                <p className={`text-xs ${geocodeMsg.startsWith("Found") ? "text-green-600" : "text-amber-600"}`}>
                  {geocodeMsg}
                </p>
              )}

              {pin ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <LocationPickerMap
                    lat={pin.lat}
                    lng={pin.lng}
                    onMove={(lat, lng) => setPin({ lat, lng })}
                  />
                  <p className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Drag the pin or click the map to set the exact location.
                    {pin && ` (${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)})`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Enter your address above then click &ldquo;Find on map&rdquo; — you can then drag the pin to your exact location.
                </p>
              )}
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Business Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" id="phone" name="phone" className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Business Email</label>
                <input type="email" id="email" name="email" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
              <input type="url" id="website" name="website" className={inputClass} placeholder="https://..." />
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Submitting..." : "Submit Business Listing"}
          </button>
        </form>
      </section>
    </>
  );
}
