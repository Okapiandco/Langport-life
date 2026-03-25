"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Venues", href: "/venues" },
  { name: "Listings", href: "/listings" },
  { name: "History", href: "/history" },
  {
    name: "Council",
    href: "/council",
    children: [
      { name: "Overview", href: "/council" },
      { name: "Members", href: "/council/members" },
      { name: "Documents", href: "/council/documents" },
    ],
  },
  { name: "About", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [councilOpen, setCouncilOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="font-heading text-2xl font-bold text-primary">
              Langport Life
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => setCouncilOpen(!councilOpen)}
                    onBlur={() => setTimeout(() => setCouncilOpen(false), 150)}
                    className={`px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors ${
                      pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-expanded={councilOpen}
                    aria-haspopup="true"
                  >
                    {item.name}
                    <svg className="ml-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {councilOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100"
                          onClick={() => setCouncilOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
            <Link
              href="/auth/signin"
              className="ml-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary-dark transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name}>
                  <span className="block px-3 py-2 text-sm font-medium text-gray-500">
                    {item.name}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block pl-6 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md no-underline ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
            <Link
              href="/auth/signin"
              className="block mx-3 mt-2 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
