import type { Metadata } from "next";

// The form page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Add Your Business",
  description:
    "Get your shop, service or business listed for free on Langport Life so customers in Langport and the surrounding villages can find you.",
  alternates: { canonical: "/submit/listing" },
};

export default function SubmitListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
