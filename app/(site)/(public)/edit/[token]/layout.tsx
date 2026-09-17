import type { Metadata } from "next";

// Private token-based edit pages must never be indexed. The page itself is a
// client component, so the robots directive lives here.
export const metadata: Metadata = {
  title: "Edit Your Submission",
  robots: { index: false, follow: false },
};

export default function EditSubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
