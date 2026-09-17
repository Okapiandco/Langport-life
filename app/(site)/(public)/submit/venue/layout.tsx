import type { Metadata } from "next";

// The form page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Add a Venue",
  description:
    "List your venue on Langport Life — halls, pubs, gardens and event spaces in and around Langport, Somerset. Free to add.",
  alternates: { canonical: "/submit/venue" },
};

export default function SubmitVenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
