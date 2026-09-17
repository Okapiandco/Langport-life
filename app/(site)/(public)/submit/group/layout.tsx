import type { Metadata } from "next";

// The form page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Add a Community Group",
  description:
    "List your community group, club or society on Langport Life so local people can find and join you. Free for groups in and around Langport, Somerset.",
  alternates: { canonical: "/submit/group" },
};

export default function SubmitGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
