"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHero from "@/components/PageHero";
import ImageUploadField from "@/components/ImageUploadField";

export default function SubmitGroupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    let imageAssetId: string | undefined;
    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const uploadRes = await fetch("/api/upload-image", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json();
        setError(uploadData.error || "Image upload failed.");
        setSubmitting(false);
        return;
      }
      const uploadData = await uploadRes.json();
      imageAssetId = uploadData.assetId;
    }

    const body = {
      type: "group",
      submitterName: form.get("submitterName"),
      submitterEmail: form.get("submitterEmail"),
      submitterPhone: form.get("submitterPhone") || undefined,
      title: form.get("name"),   // API validates `title` across all types
      organiser: form.get("organiser") || undefined,
      description: form.get("description") || undefined,
      location: form.get("location") || undefined,
      meetingTime: form.get("meetingTime") || undefined,
      cost: form.get("cost") || undefined,
      website: form.get("website") || undefined,
      contactName: form.get("contactName") || undefined,
      contactEmail: form.get("contactEmail") || undefined,
      contactPhone: form.get("contactPhone") || undefined,
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

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <>
      <PageHero
        section="submit"
        title="Add a Group"
        subtitle="Tell us about your group and we'll add it to the listings."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Community Groups", href: "/community-groups" },
          { label: "Add a Group" },
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
            <p className="text-sm text-gray-500">Who is submitting this listing? We may contact you if we have questions.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="submitterName" className={labelClass}>Your Name *</label>
                <input type="text" id="submitterName" name="submitterName" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="submitterEmail" className={labelClass}>Your Email *</label>
                <input type="email" id="submitterEmail" name="submitterEmail" required className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="submitterPhone" className={labelClass}>Your Phone <span className="text-gray-400">(optional)</span></label>
              <input type="tel" id="submitterPhone" name="submitterPhone" className={`${inputClass} sm:max-w-xs`} />
            </div>
          </fieldset>

          {/* Group details */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">About the Group</legend>

            <div>
              <label htmlFor="name" className={labelClass}>Group Name *</label>
              <input type="text" id="name" name="name" required className={inputClass} placeholder="e.g. Langport Bowls Club" />
            </div>

            <div>
              <label htmlFor="organiser" className={labelClass}>Organiser <span className="text-gray-400">(optional)</span></label>
              <input type="text" id="organiser" name="organiser" className={inputClass} placeholder="Name of the person or organisation who runs it" />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>What does the group do? <span className="text-gray-400">(optional)</span></label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={inputClass}
                placeholder="Tell people what to expect — activities, atmosphere, who it's for..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="location" className={labelClass}>Where does it meet? <span className="text-gray-400">(optional)</span></label>
                <input type="text" id="location" name="location" className={inputClass} placeholder="e.g. Langport Town Hall" />
              </div>
              <div>
                <label htmlFor="meetingTime" className={labelClass}>When does it meet? <span className="text-gray-400">(optional)</span></label>
                <input type="text" id="meetingTime" name="meetingTime" className={inputClass} placeholder="e.g. Every Tuesday, 7pm – 9pm" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cost" className={labelClass}>Cost <span className="text-gray-400">(optional)</span></label>
                <input type="text" id="cost" name="cost" className={inputClass} placeholder="e.g. Free, or £5 per session" />
              </div>
              <div>
                <label htmlFor="website" className={labelClass}>Website <span className="text-gray-400">(optional)</span></label>
                <input type="url" id="website" name="website" className={inputClass} placeholder="https://..." />
              </div>
            </div>

          </fieldset>

          {/* Public contact */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-900">Public Contact Details</legend>
            <p className="text-sm text-gray-500">These will be shown on the group&apos;s listing page so people can get in touch.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactName" className={labelClass}>Contact Name <span className="text-gray-400">(optional)</span></label>
                <input type="text" id="contactName" name="contactName" className={inputClass} />
              </div>
              <div>
                <label htmlFor="contactEmail" className={labelClass}>Contact Email <span className="text-gray-400">(optional)</span></label>
                <input type="email" id="contactEmail" name="contactEmail" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="contactPhone" className={labelClass}>Contact Phone <span className="text-gray-400">(optional)</span></label>
              <input type="tel" id="contactPhone" name="contactPhone" className={`${inputClass} sm:max-w-xs`} />
            </div>
          </fieldset>

          <ImageUploadField label="Group Photo or Logo" onFileChange={setImageFile} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (imageFile ? "Uploading image…" : "Submitting...") : "Submit Group"}
          </button>
        </form>
      </section>
    </>
  );
}
