import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Thank You — Langport Life",
};

export default function ThankYouPage() {
  return (
    <>
      <PageHero
        section="submit"
        title="Thank You!"
        subtitle="Your submission has been received."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Submit", href: "/submit" },
          { label: "Thank You" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8">
          <p className="text-lg text-gray-700">
            Your submission will be reviewed by the town clerk. Once approved,
            it will appear on the site and you&apos;ll receive a confirmation
            email.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            This usually takes 1–2 working days.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/submit"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 no-underline"
          >
            Submit Another
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 no-underline"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
