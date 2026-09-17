import type { Metadata } from "next";

// The form page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Submit an Event",
  description:
    "Add your event to the Langport Life what's on guide. Free listings for community events in and around Langport, Somerset.",
  alternates: { canonical: "/submit/event" },
};

export default function SubmitEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
