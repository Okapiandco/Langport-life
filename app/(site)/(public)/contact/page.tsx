"use client";

import { useState } from "react";
import PageHero from "@/components/PageHero";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
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
      setSuccess(true);
      setSubmitting(false);
      e.currentTarget.reset();
    } catch (err) {
      console.error("Contact submit error:", err);
      setError("Unable to reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero
        section="about"
        title="Contact Us"
        subtitle="Get in touch with the Langport Town Council team."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-gray-700 leading-relaxed">
          Have a question, suggestion, or something to share with the council? Send us a
          message using the form below and we&apos;ll get back to you as soon as we can.
        </p>

        {success ? (
          <div className="mt-8 rounded-lg bg-green-50 border border-green-200 p-6 text-green-800">
            <h2 className="font-heading text-lg font-semibold">Thanks — message sent.</h2>
            <p className="mt-2 text-sm">
              We&apos;ve received your message and will be in touch soon.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-8 mb-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </>
        )}

        {/* TODO: Replace placeholders with the real Town Council contact details. */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <h2 className="font-heading text-xl font-bold text-gray-900">Langport Town Council</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-700">
            <div>
              <dt className="font-medium text-gray-900">Address</dt>
              <dd>[address]</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Phone</dt>
              <dd>[phone]</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Email</dt>
              <dd>[email]</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
