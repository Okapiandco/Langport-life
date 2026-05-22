"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ImageUploadField from "@/components/ImageUploadField";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────────────────

interface Doc {
  _id: string;
  _type: "event" | "businessListing" | "venue" | "group";
  status: string;
  title?: string;
  name?: string;
  description?: Array<{ children: Array<{ text: string }> }>;
  // event
  date?: string;
  endDate?: string;
  eventType?: string;
  venueName?: string;
  isFree?: boolean;
  ticketsUrl?: string;
  organiser?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  recurrenceRule?: string;
  // listing / venue
  street?: string;
  town?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  website?: string;
  coordinates?: { lat: number; lng: number };
  // group
  location?: string;
  meetingTime?: string;
  cost?: string;
  // image
  image?: { asset?: { url?: string }; alt?: string };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function descriptionText(doc: Doc): string {
  if (!doc.description) return "";
  return doc.description
    .map((block) => block.children?.map((c) => c.text).join("") ?? "")
    .join("\n");
}

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary";

// ─── Main page ───────────────────────────────────────────────────────────────

export default function EditPage() {
  const { token } = useParams<{ token: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // ── Load document ──
  useEffect(() => {
    if (!token) return;
    fetch(`/api/edit/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setLoadError(d.error ?? "This link is not valid.");
          return;
        }
        const data: Doc = await res.json();
        setDoc(data);
        if (data.coordinates?.lat && data.coordinates?.lng) {
          setPin({ lat: data.coordinates.lat, lng: data.coordinates.lng });
        }
      })
      .catch(() => setLoadError("Could not load your submission. Please try again."));
  }, [token]);

  // ── Geocode helper for listing/venue ──
  async function findOnMap() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const street = (fd.get("street") as string) || "";
    const town = (fd.get("town") as string) || "Langport";
    const postcode = (fd.get("postcode") as string) || "";
    const query = [street, town, postcode].filter(Boolean).join(", ");
    if (!query) { setGeocodeMsg("Enter an address first."); return; }
    setGeocoding(true); setGeocodeMsg("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`,
        { headers: { "User-Agent": "langport.life/edit" } }
      );
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (results.length) {
        setPin({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
        setGeocodeMsg("Found! Drag the pin to fine-tune.");
      } else {
        setPin({ lat: 51.0374, lng: -2.8287 });
        setGeocodeMsg("Address not found — showing Langport centre. Drag the pin.");
      }
    } catch {
      setGeocodeMsg("Could not look up address.");
    } finally {
      setGeocoding(false);
    }
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(""); setSaving(true); setSaved(false);
    const fd = new FormData(e.currentTarget);

    // Upload new image if provided
    let imageAssetId: string | undefined;
    if (imageFile) {
      const uploadFd = new FormData();
      uploadFd.append("image", imageFile);
      const uploadRes = await fetch("/api/upload-image", { method: "POST", body: uploadFd });
      if (!uploadRes.ok) {
        const d = await uploadRes.json().catch(() => ({}));
        setSaveError(d.error ?? "Image upload failed.");
        setSaving(false);
        return;
      }
      const uploadData = await uploadRes.json();
      imageAssetId = uploadData.assetId;
    }

    const type = doc!._type;
    let body: Record<string, unknown> = {};

    const descValue = fd.get("description") as string;
    const descBlock = descValue
      ? [{ _type: "block", _key: "desc", children: [{ _type: "span", _key: "s", text: descValue }] }]
      : undefined;

    if (type === "event") {
      body = {
        title: fd.get("title"),
        description: descBlock,
        date: fd.get("date") || undefined,
        endDate: fd.get("endDate") || undefined,
        eventType: fd.get("eventType") || undefined,
        venueName: fd.get("venueName") || undefined,
        isFree: fd.get("isFree") === "true",
        ticketsUrl: fd.get("ticketsUrl") || undefined,
        organiser: fd.get("organiser") || undefined,
        contactName: fd.get("contactName") || undefined,
        contactEmail: fd.get("contactEmail") || undefined,
        contactPhone: fd.get("contactPhone") || undefined,
      };
    } else if (type === "businessListing") {
      body = {
        title: fd.get("title"),
        description: descBlock,
        street: fd.get("street") || undefined,
        town: fd.get("town") || "Langport",
        postcode: fd.get("postcode") || undefined,
        phone: fd.get("phone") || undefined,
        email: fd.get("email") || undefined,
        website: fd.get("website") || undefined,
        coordinates: pin ? { _type: "geopoint", lat: pin.lat, lng: pin.lng } : undefined,
      };
    } else if (type === "venue") {
      body = {
        title: fd.get("title"),
        description: descBlock,
        street: fd.get("street") || undefined,
        town: fd.get("town") || "Langport",
        postcode: fd.get("postcode") || undefined,
        phone: fd.get("phone") || undefined,
        email: fd.get("email") || undefined,
        website: fd.get("website") || undefined,
      };
    } else if (type === "group") {
      body = {
        name: fd.get("name"),
        description: descBlock,
        location: fd.get("location") || undefined,
        meetingTime: fd.get("meetingTime") || undefined,
        cost: fd.get("cost") || undefined,
        organiser: fd.get("organiser") || undefined,
        website: fd.get("website") || undefined,
        contactName: fd.get("contactName") || undefined,
        contactEmail: fd.get("contactEmail") || undefined,
        contactPhone: fd.get("contactPhone") || undefined,
      };
    }

    if (imageAssetId) {
      body.image = { _type: "image", asset: { _type: "reference", _ref: imageAssetId } };
    }

    try {
      const res = await fetch(`/api/edit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error ?? "Could not save changes.");
        setSaving(false);
        return;
      }
      setSaved(true);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render states ──
  if (loadError) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-2xl font-semibold text-gray-900 mb-3">Link not found</p>
        <p className="text-gray-500">{loadError}</p>
        <p className="mt-4 text-sm text-gray-400">
          If you think this is a mistake, email{" "}
          <a href="mailto:office@langport.life" className="underline">office@langport.life</a>.
        </p>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-gray-500 animate-pulse">Loading your submission…</p>
      </main>
    );
  }

  const typeLabel: Record<string, string> = {
    event: "Event",
    businessListing: "Business Listing",
    venue: "Venue",
    group: "Community Group",
  };

  const displayTitle = doc.title ?? doc.name ?? "Your submission";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary uppercase tracking-wide mb-1">
          Edit {typeLabel[doc._type] ?? doc._type}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
        {(doc.status === "pendingApproval" || doc.status === "pending") && (
          <p className="mt-2 text-sm text-amber-600">
            This submission is currently pending approval. Your changes will also be reviewed before going live.
          </p>
        )}
        {(doc.status === "published" || doc.status === "active" || doc.status === "approved") && (
          <p className="mt-2 text-sm text-green-700">
            This is currently live. Saving changes will send it back for a quick review before re-publishing.
          </p>
        )}
      </div>

      {saved && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
          ✓ Your changes have been saved and will be reviewed shortly.
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {saveError}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">

        {/* ── EVENT ── */}
        {doc._type === "event" && (
          <>
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Event Details</legend>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title *</label>
                <input type="text" id="title" name="title" required defaultValue={doc.title} className={inputClass} />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={descriptionText(doc)} className={inputClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Start Date & Time *</label>
                  <input type="datetime-local" id="date" name="date" required defaultValue={toDatetimeLocal(doc.date)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date & Time <span className="text-gray-400">(optional)</span>
                  </label>
                  <input type="datetime-local" id="endDate" name="endDate" defaultValue={toDatetimeLocal(doc.endDate)} className={inputClass} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">Event Type</label>
                  <input type="text" id="eventType" name="eventType" defaultValue={doc.eventType} className={inputClass} placeholder="e.g. Music, Sport, Community…" />
                </div>
                <div>
                  <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">Venue Name</label>
                  <input type="text" id="venueName" name="venueName" defaultValue={doc.venueName} className={inputClass} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="organiser" className="block text-sm font-medium text-gray-700">Organiser</label>
                  <input type="text" id="organiser" name="organiser" defaultValue={doc.organiser} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="isFree" className="block text-sm font-medium text-gray-700">Entry</label>
                  <select id="isFree" name="isFree" defaultValue={doc.isFree ? "true" : "false"} className={inputClass}>
                    <option value="true">Free entry</option>
                    <option value="false">Tickets / paid</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="ticketsUrl" className="block text-sm font-medium text-gray-700">Tickets URL</label>
                <input type="url" id="ticketsUrl" name="ticketsUrl" defaultValue={doc.ticketsUrl} className={inputClass} placeholder="https://…" />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Your Contact Details</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" id="contactName" name="contactName" defaultValue={doc.contactName} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="contactEmail" name="contactEmail" defaultValue={doc.contactEmail} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Phone <span className="text-gray-400">(optional)</span></label>
                <input type="tel" id="contactPhone" name="contactPhone" defaultValue={doc.contactPhone} className={`${inputClass} sm:max-w-xs`} />
              </div>
            </fieldset>
          </>
        )}

        {/* ── BUSINESS LISTING ── */}
        {doc._type === "businessListing" && (
          <>
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Business Details</legend>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Business Name *</label>
                <input type="text" id="title" name="title" required defaultValue={doc.title} className={inputClass} />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={descriptionText(doc)} className={inputClass} />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Address & Location</legend>
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" id="street" name="street" defaultValue={doc.street} className={inputClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="town" className="block text-sm font-medium text-gray-700">Town</label>
                  <input type="text" id="town" name="town" defaultValue={doc.town ?? "Langport"} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">Postcode</label>
                  <input type="text" id="postcode" name="postcode" defaultValue={doc.postcode} className={inputClass} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Pin Location <span className="text-gray-400">(optional)</span></p>
                  <button type="button" onClick={findOnMap} disabled={geocoding}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-50 transition">
                    {geocoding ? "Finding…" : "Find on map"}
                  </button>
                </div>
                {geocodeMsg && <p className="text-xs text-amber-600">{geocodeMsg}</p>}
                {pin ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <LocationPickerMap lat={pin.lat} lng={pin.lng} onMove={(lat, lng) => setPin({ lat, lng })} />
                    <p className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Drag the pin to your exact location. ({pin.lat.toFixed(5)}, {pin.lng.toFixed(5)})
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Enter your address then click &ldquo;Find on map&rdquo;.</p>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Contact</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" id="phone" name="phone" defaultValue={doc.phone} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" name="email" defaultValue={doc.email} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                <input type="url" id="website" name="website" defaultValue={doc.website} className={inputClass} placeholder="https://…" />
              </div>
            </fieldset>
          </>
        )}

        {/* ── VENUE ── */}
        {doc._type === "venue" && (
          <>
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Venue Details</legend>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Venue Name *</label>
                <input type="text" id="title" name="title" required defaultValue={doc.title} className={inputClass} />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={descriptionText(doc)} className={inputClass} />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Address</legend>
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" id="street" name="street" defaultValue={doc.street} className={inputClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="town" className="block text-sm font-medium text-gray-700">Town</label>
                  <input type="text" id="town" name="town" defaultValue={doc.town ?? "Langport"} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">Postcode</label>
                  <input type="text" id="postcode" name="postcode" defaultValue={doc.postcode} className={inputClass} />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Contact</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" id="phone" name="phone" defaultValue={doc.phone} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" name="email" defaultValue={doc.email} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                <input type="url" id="website" name="website" defaultValue={doc.website} className={inputClass} placeholder="https://…" />
              </div>
            </fieldset>
          </>
        )}

        {/* ── GROUP ── */}
        {doc._type === "group" && (
          <>
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Group Details</legend>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name *</label>
                <input type="text" id="name" name="name" required defaultValue={doc.name} className={inputClass} />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows={4} defaultValue={descriptionText(doc)} className={inputClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Where you meet</label>
                  <input type="text" id="location" name="location" defaultValue={doc.location} className={inputClass} placeholder="e.g. Langport Town Hall" />
                </div>
                <div>
                  <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700">When you meet</label>
                  <input type="text" id="meetingTime" name="meetingTime" defaultValue={doc.meetingTime} className={inputClass} placeholder="e.g. Every Tuesday, 7pm" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost</label>
                  <input type="text" id="cost" name="cost" defaultValue={doc.cost} className={inputClass} placeholder="e.g. Free or £5/session" />
                </div>
                <div>
                  <label htmlFor="organiser" className="block text-sm font-medium text-gray-700">Organiser</label>
                  <input type="text" id="organiser" name="organiser" defaultValue={doc.organiser} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website <span className="text-gray-400">(optional)</span></label>
                <input type="url" id="website" name="website" defaultValue={doc.website} className={inputClass} placeholder="https://…" />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">Contact</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input type="text" id="contactName" name="contactName" defaultValue={doc.contactName} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input type="email" id="contactEmail" name="contactEmail" defaultValue={doc.contactEmail} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone <span className="text-gray-400">(optional)</span></label>
                <input type="tel" id="contactPhone" name="contactPhone" defaultValue={doc.contactPhone} className={`${inputClass} sm:max-w-xs`} />
              </div>
            </fieldset>
          </>
        )}

        {/* ── Image upload (all types) ── */}
        <div>
          <ImageUploadField
            label={`Update Photo ${doc.image?.asset?.url ? "(leave blank to keep current photo)" : ""}`}
            onFileChange={setImageFile}
          />
          {doc.image?.asset?.url && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Current photo:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.image.asset.url}
                alt={doc.image.alt ?? "Current photo"}
                className="h-32 w-auto rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        <p className="text-xs text-center text-gray-400">
          Bookmark this page — it&apos;s your personal link to edit this submission.
        </p>
      </form>
    </main>
  );
}
