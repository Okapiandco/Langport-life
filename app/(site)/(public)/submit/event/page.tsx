"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageHero from "@/components/PageHero";

// "YYYY-MM-DDTHH:mm" is the format <input type="datetime-local"> expects.
function toDatetimeLocalString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "YYYY-MM-DD" for <input type="date">. Default recurrence end = start + 1 year.
function defaultRecurrenceEnd(startIso: string): string {
  if (!startIso) return "";
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type RecurrenceFreq = "none" | "weekly" | "biweekly" | "monthly-date" | "monthly-weekday" | "yearly";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINALS = ["", "1st", "2nd", "3rd", "4th"];

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function recurrenceHint(freq: RecurrenceFreq, startIso: string): string {
  if (freq === "none" || !startIso) return "";
  const d = new Date(startIso);
  if (isNaN(d.getTime())) return "";
  const dayName = DAY_NAMES[d.getDay()];
  const weekNum = Math.min(Math.ceil(d.getDate() / 7), 4);
  const ordinal = ORDINALS[weekNum];
  switch (freq) {
    case "weekly":          return `Every ${dayName}`;
    case "biweekly":        return `Every other ${dayName}`;
    case "monthly-date":    return `On the ${ordinalSuffix(d.getDate())} of every month`;
    case "monthly-weekday": return `On the ${ordinal} ${dayName} of every month`;
    case "yearly":          return `Every year on ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  }
}

export default function SubmitEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Image picker
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Linked start/end. End auto-fills from start until the user edits it directly,
  // after which start changes shift end by the same delta (preserves duration).
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTouched, setEndTouched] = useState(false);

  // Recurrence picker. Server side translates frequency + start date into an RRULE.
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFreq>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceEndTouched, setRecurrenceEndTouched] = useState(false);

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = e.target.value;

    if (!endTouched || !endDate) {
      // User hasn't deliberately set a different end yet (or has cleared it).
      // Mirror the start so single-day events don't need both fields filled.
      setEndDate(newStart);
    } else if (startDate && newStart) {
      // Multi-day event: keep the same duration by shifting end by the start delta.
      const oldStartMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      const newStartMs = new Date(newStart).getTime();
      if (
        Number.isFinite(oldStartMs) &&
        Number.isFinite(endMs) &&
        Number.isFinite(newStartMs)
      ) {
        const duration = endMs - oldStartMs;
        setEndDate(toDatetimeLocalString(new Date(newStartMs + duration)));
      }
    }

    // If recurrence is on and the user hasn't pinned a recurrence end date yet,
    // re-derive it from the new start (default = start + 1 year).
    if (recurrenceFrequency !== "none" && !recurrenceEndTouched) {
      setRecurrenceEndDate(defaultRecurrenceEnd(newStart));
    }

    setStartDate(newStart);
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setEndDate(value);
    // Treat clearing end as un-touching, so the next start change re-mirrors.
    setEndTouched(value !== "");
  }

  function handleFrequencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as RecurrenceFreq;
    setRecurrenceFrequency(value);
    if (value !== "none" && !recurrenceEndTouched && startDate) {
      setRecurrenceEndDate(defaultRecurrenceEnd(startDate));
    }
  }

  function handleRecurrenceEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setRecurrenceEndDate(value);
    setRecurrenceEndTouched(value !== "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Upload image first if one has been selected.
    let imageAssetId: string | undefined;
    if (imageFile) {
      try {
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await fetch("/api/upload-image", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error || "Image upload failed.");
          setSubmitting(false);
          return;
        }
        imageAssetId = uploadData.assetId;
      } catch {
        setError("Image upload failed. Please check your connection and try again.");
        setSubmitting(false);
        return;
      }
    }

    const form = new FormData(e.currentTarget);

    const body = {
      type: "event",
      submitterName: form.get("submitterName"),
      submitterEmail: form.get("submitterEmail"),
      submitterPhone: form.get("submitterPhone") || undefined,
      title: form.get("title"),
      description: form.get("description") || undefined,
      eventDate: form.get("eventDate") || undefined,
      eventEndDate: form.get("eventEndDate") || undefined,
      eventType: form.get("eventType") || undefined,
      eventVenue: form.get("eventVenue") || undefined,
      eventIsFree: form.get("eventIsFree") === "on",
      ticketsUrl: form.get("ticketsUrl") || undefined,
      organiser: form.get("organiser") || undefined,
      // Recurrence: server translates frequency + start date into an RRULE.
      // Frequency = "" for one-off events.
      recurrenceFrequency: form.get("recurrenceFrequency") || undefined,
      recurrenceEndDate: form.get("recurrenceEndDate") || undefined,
      imageAssetId,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push("/submit/thank-you");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Unable to reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero
        section="events"
        title="Submit an Event"
        subtitle="Tell us about your event and we'll add it to the listings."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Submit", href: "/submit" },
          { label: "Event" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Your details */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Your Details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="submitterName" className="block text-sm font-medium text-gray-700">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="submitterName"
                  name="submitterName"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="submitterEmail" className="block text-sm font-medium text-gray-700">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="submitterEmail"
                  name="submitterEmail"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="submitterPhone" className="block text-sm font-medium text-gray-700">
                Your Phone <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                id="submitterPhone"
                name="submitterPhone"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary sm:max-w-xs"
              />
            </div>
          </fieldset>

          {/* Event details */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Event Details</legend>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Tell people what the event is about..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="eventDate"
                  name="eventDate"
                  required
                  value={startDate}
                  onChange={handleStartChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-700">
                  End Date & Time <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  id="eventEndDate"
                  name="eventEndDate"
                  value={endDate}
                  onChange={handleEndChange}
                  min={startDate || undefined}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Recurrence */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Does this event repeat?</p>
              <p className="mt-1 text-xs text-gray-500">
                For weekly clubs, monthly markets, annual festivals. Leave on &quot;No&quot; for a one-off event.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="recurrenceFrequency" className="block text-sm font-medium text-gray-700">
                    Repeats
                  </label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    value={recurrenceFrequency}
                    onChange={handleFrequencyChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="none">No — one-off event</option>
                    <option value="weekly">Weekly — same day each week</option>
                    <option value="biweekly">Every 2 weeks — same day</option>
                    <option value="monthly-date">Monthly — same date (e.g. every 15th)</option>
                    <option value="monthly-weekday">Monthly — same weekday (e.g. every 3rd Tuesday)</option>
                    <option value="yearly">Yearly — same date each year</option>
                  </select>
                  {recurrenceFrequency !== "none" && startDate && (
                    <p className="mt-1.5 text-xs text-primary font-medium">
                      {recurrenceHint(recurrenceFrequency, startDate)}
                    </p>
                  )}
                </div>
                {recurrenceFrequency !== "none" && (
                  <div>
                    <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700">
                      Repeats until
                    </label>
                    <input
                      type="date"
                      id="recurrenceEndDate"
                      name="recurrenceEndDate"
                      value={recurrenceEndDate}
                      onChange={handleRecurrenceEndChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Defaults to 1 year. Approval covers occurrences in the next 12 months.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="eventVenue" className="block text-sm font-medium text-gray-700">
                  Venue Name
                </label>
                <input
                  type="text"
                  id="eventVenue"
                  name="eventVenue"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="e.g. The Old Kelways, Langport Town Hall"
                />
              </div>
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                  Event Type
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select type...</option>
                  <option value="social">Social</option>
                  <option value="community">Community</option>
                  <option value="market">Market</option>
                  <option value="performance">Performance</option>
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="organiser" className="block text-sm font-medium text-gray-700">
                  Organiser
                </label>
                <input
                  type="text"
                  id="organiser"
                  name="organiser"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="ticketsUrl" className="block text-sm font-medium text-gray-700">
                  Tickets URL <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  id="ticketsUrl"
                  name="ticketsUrl"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="eventIsFree"
                name="eventIsFree"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="eventIsFree" className="text-sm text-gray-700">
                This event is free
              </label>
            </div>
          </fieldset>

          {/* Image */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Event Image <span className="text-gray-400">(optional)</span>
            </p>

            {imagePreview ? (
              <div className="relative">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center hover:border-primary transition-colors">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload a photo
                </span>
                <span className="text-xs text-gray-400">JPEG, PNG or WebP — max 8 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (imageFile ? "Uploading image…" : "Submitting...") : "Submit Event"}
          </button>
        </form>
      </section>
    </>
  );
}
