"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labelMap: Record<string, string> = {
  events: "Events",
  venues: "Venues",
  listings: "Business Directory",
  history: "History",
  council: "Town Council",
  members: "Members",
  documents: "Documents",
  about: "About",
  environment: "Environment",
  "things-to-do": "Things to Do",
  "outdoor-life": "Outdoor Life",
  "walking-and-cycling": "Walking & Cycling",
  "exploring-the-wild": "Exploring the Wild",
  dashboard: "Dashboard",
  "my-events": "My Events",
  "my-listings": "My Listings",
  venue: "Venue",
  admin: "Admin",
  approvals: "Approvals",
  users: "Users",
  new: "New",
  edit: "Edit",
  auth: "Account",
  signin: "Sign In",
  signup: "Register",
  "somerset-councillors": "Somerset Councillors",
  "staff-and-volunteers": "Staff & Volunteers",
  finance: "Finance",
  policies: "Policies & Procedures",
  governance: "Governance",
  committees: "Committees",
  groups: "Groups",
  "what-we-do": "What We Do",
  services: "Services",
};

function prettify(segment: string): string {
  return labelMap[segment] || segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/studio")) return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: prettify(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <Link href="/" className="text-gray-500 no-underline hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1">
              <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {i === crumbs.length - 1 ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="text-gray-500 no-underline hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
