"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface NavChild {
  name: string;
  href: string;
}

interface MegaCard {
  name: string;
  href: string;
  image?: string;
  description?: string;
}

interface NavGroup {
  heading: string;
  items: NavChild[];
}

interface MegaMenu {
  groups?: NavGroup[];
  cards?: MegaCard[];
  footerLink?: { label: string; href: string };
}

interface NavItem {
  name: string;
  href: string;
  children?: NavChild[];
  mega?: MegaMenu;
}

const navigation: NavItem[] = [
  {
    name: "What's On",
    href: "/events",
    mega: {
      groups: [
        {
          heading: "Events",
          items: [
            { name: "Events Calendar", href: "/events" },
            { name: "Submit an Event", href: "/dashboard/my-events/new" },
          ],
        },
      ],
      cards: [
        {
          name: "The Outdoor Life",
          href: "/things-to-do/outdoor-life",
          image: "/things-to-do/outdoor-life.jpg",
          description: "Water sports, fishing, golf and activities on the River Parrett",
        },
        {
          name: "Walking & Cycling",
          href: "/things-to-do/walking-and-cycling",
          image: "/things-to-do/walking-cycling.jpg",
          description: "Routes and trails through the Somerset Levels",
        },
        {
          name: "Exploring the Wild",
          href: "/things-to-do/exploring-the-wild",
          image: "/things-to-do/explore-wild.jpg",
          description: "Wildlife and wild places on your doorstep",
        },
      ],
      footerLink: { label: "View all events", href: "/events" },
    },
  },
  { name: "Venues", href: "/venues" },
  { name: "Shops & Services", href: "/listings" },
  { name: "History", href: "/history" },
  {
    name: "Town Council",
    href: "/council",
    mega: {
      groups: [
        {
          heading: "Councillor Information",
          items: [
            { name: "Town Councillors", href: "/council/members" },
            {
              name: "Somerset Councillors",
              href: "/council/somerset-councillors",
            },
            {
              name: "Staff & Volunteers",
              href: "/council/staff-and-volunteers",
            },
          ],
        },
        {
          heading: "Governance & Transparency",
          items: [
            { name: "Finance", href: "/council/finance" },
            { name: "Policies & Procedures", href: "/council/policies" },
            { name: "Governance", href: "/council/governance" },
          ],
        },
        {
          heading: "Agendas & Minutes",
          items: [
            { name: "All Committees", href: "/council/documents" },
            { name: "Full Council", href: "/council/documents/full-council" },
            { name: "Finance & Personnel", href: "/council/documents/finance-personnel" },
            { name: "Tourism & Marketing", href: "/council/documents/tourism-marketing" },
            { name: "Joint Committee", href: "/council/documents/joint-committee" },
            { name: "Annual Assembly", href: "/council/documents/annual-assembly" },
            { name: "Archived Minutes", href: "/council/documents/archived" },
          ],
        },
        {
          heading: "Our Work",
          items: [
            { name: "What We Do", href: "/council/what-we-do" },
            { name: "Services", href: "/council/services" },
          ],
        },
      ],
      footerLink: {
        label: "Town Council Overview",
        href: "/council",
      },
    },
  },
  { name: "News", href: "/news" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleDropdown(name: string) {
    setOpenDropdown(openDropdown === name ? null : name);
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
        ref={dropdownRef}
      >
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="font-heading text-2xl font-bold text-primary">
              Langport Life
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) =>
              item.mega ? (
                /* Mega menu */
                <div key={item.name} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors ${
                      pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-expanded={openDropdown === item.name}
                    aria-haspopup="true"
                  >
                    {item.name}
                    <svg
                      className={`ml-1 inline h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full z-20 mt-2 w-[56rem] rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5">
                      <div className="flex gap-10">
                        {/* Groups column */}
                        {item.mega.groups && item.mega.groups.length > 0 && (
                          <div
                            className={
                              item.mega.cards
                                ? "w-1/3 space-y-6"
                                : "flex-1 grid grid-cols-2 gap-x-10 gap-y-8"
                            }
                          >
                            {item.mega.groups.map((group) => (
                              <div key={group.heading}>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-copper">
                                  {group.heading}
                                </h3>
                                <ul className="mt-3 space-y-1.5">
                                  {group.items.map((child) => (
                                    <li key={child.href}>
                                      <Link
                                        href={child.href}
                                        className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 no-underline hover:bg-primary/5 hover:text-primary transition-colors"
                                        onClick={() => setOpenDropdown(null)}
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Image cards */}
                        {item.mega.cards && (
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            {item.mega.cards.map((card) => (
                              <Link
                                key={card.href}
                                href={card.href}
                                className="group block overflow-hidden rounded-xl no-underline"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
                                  {card.image ? (
                                    <Image
                                      src={card.image}
                                      alt={card.name}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-primary/10" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <span className="absolute bottom-2.5 left-3 right-3 text-sm font-bold text-white drop-shadow">
                                    {card.name}
                                  </span>
                                </div>
                                {card.description && (
                                  <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">
                                    {card.description}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer link */}
                      {item.mega.footerLink && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                          <Link
                            href={item.mega.footerLink.href}
                            className="text-sm font-semibold text-primary no-underline hover:text-primary-dark"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {item.mega.footerLink.label} &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : item.children ? (
                /* Standard dropdown */
                <div key={item.name} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors ${
                      pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-expanded={openDropdown === item.name}
                    aria-haspopup="true"
                  >
                    {item.name}
                    <svg
                      className={`ml-1 inline h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 hover:text-primary"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Simple link */
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
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 max-h-[80vh] overflow-y-auto">
            {navigation.map((item) =>
              item.mega ? (
                <div
                  key={item.name}
                  className="border-t border-gray-100 pt-2 mt-2"
                >
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-bold text-gray-900"
                  >
                    {item.name}
                    <svg
                      className={`h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <>
                      {item.mega.groups?.map((group) => (
                        <div key={group.heading} className="mb-2">
                          <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-copper">
                            {group.heading}
                          </span>
                          {group.items.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block pl-6 py-1.5 text-sm text-gray-700 no-underline hover:bg-gray-100"
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                      {item.mega.cards?.map((card) => (
                        <Link
                          key={card.href}
                          href={card.href}
                          className="flex items-center gap-3 px-3 py-2 no-underline hover:bg-gray-100"
                          onClick={() => setMobileOpen(false)}
                        >
                          {card.image && (
                            <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={card.image}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {card.name}
                            </span>
                            {card.description && (
                              <p className="text-xs text-gray-500">
                                {card.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              ) : item.children ? (
                <div key={item.name}>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-500"
                  >
                    {item.name}
                    <svg
                      className={`h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openDropdown === item.name &&
                    item.children.map((child) => (
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
