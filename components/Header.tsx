"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface NavChild { name: string; href: string; }
interface MegaCard { name: string; href: string; image?: string; description?: string; }
interface NavGroup { heading: string; items: NavChild[]; }
interface MegaMenu { groups?: NavGroup[]; cards?: MegaCard[]; footerLink?: { label: string; href: string }; }
interface NavItem { name: string; href: string; children?: NavChild[]; mega?: MegaMenu; }

const navigation: NavItem[] = [
  {
    name: "What's On",
    href: "/events",
    mega: {
      groups: [{ heading: "Events", items: [{ name: "Events Calendar", href: "/events" }, { name: "Submit an Event", href: "/dashboard/my-events/new" }] }],
      cards: [
        { name: "The Outdoor Life", href: "/things-to-do/outdoor-life", image: "/things-to-do/outdoor-life.jpg", description: "Water sports, fishing, golf and activities on the River Parrett" },
        { name: "Walking & Cycling", href: "/things-to-do/walking-and-cycling", image: "/things-to-do/walking-cycling.jpg", description: "Routes and trails through the Somerset Levels" },
        { name: "Exploring the Wild", href: "/things-to-do/exploring-the-wild", image: "/things-to-do/explore-wild.jpg", description: "Wildlife and wild places on your doorstep" },
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
        { heading: "Councillor Information", items: [{ name: "Town Councillors", href: "/council/members" }, { name: "Somerset Councillors", href: "/council/somerset-councillors" }, { name: "Staff & Volunteers", href: "/council/staff-and-volunteers" }] },
        { heading: "Governance & Transparency", items: [{ name: "Finance", href: "/council/finance" }, { name: "Policies & Procedures", href: "/council/policies" }, { name: "Governance", href: "/council/governance" }] },
        { heading: "Agendas & Minutes", items: [{ name: "All Committees", href: "/council/documents" }, { name: "Full Council", href: "/council/documents/full-council" }, { name: "Finance & Personnel", href: "/council/documents/finance-personnel" }, { name: "Tourism & Marketing", href: "/council/documents/tourism-marketing" }, { name: "Joint Committee", href: "/council/documents/joint-committee" }, { name: "Annual Assembly", href: "/council/documents/annual-assembly" }, { name: "Archived Minutes", href: "/council/documents/archived" }] },
        { heading: "Our Work", items: [{ name: "What We Do", href: "/council/what-we-do" }, { name: "Services", href: "/council/services" }] },
      ],
      footerLink: { label: "Town Council Overview", href: "/council" },
    },
  },
  { name: "News", href: "/news" },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  function toggleDropdown(name: string) {
    setOpenDropdown(openDropdown === name ? null : name);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className={`sticky top-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Top bar - social + search (visible when not scrolled) */}
      <div className={`border-b border-gray-100 transition-all duration-300 overflow-hidden ${scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/langportlife/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href="https://x.com/LangportLife" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors" aria-label="X (Twitter)">
              <XIcon className="h-4 w-4" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 rounded-full border border-gray-200 bg-gray-50 py-1 pl-8 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
            <Link href="/auth/signin" className="text-xs font-medium text-gray-500 no-underline hover:text-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation" ref={dropdownRef}>
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center no-underline flex-shrink-0">
            <Image
              src="/Images/logo/Langport-Life-Black-Logo-002.png"
              alt="Langport Life"
              width={scrolled ? 180 : 220}
              height={scrolled ? 40 : 50}
              className="transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) =>
              item.mega ? (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors ${
                      pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-expanded={openDropdown === item.name}
                    aria-haspopup="true"
                  >
                    {item.name}
                    <svg className={`ml-1 inline h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <div className={`absolute left-1/2 -translate-x-1/2 top-full z-20 mt-2 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5 ${item.mega.cards ? "w-[72rem]" : "w-[56rem]"}`}>
                      <div className="flex gap-8">
                        {item.mega.groups && item.mega.groups.length > 0 && (
                          <div className={item.mega.cards ? "w-48 flex-shrink-0 space-y-6" : "flex-1 grid grid-cols-2 gap-x-10 gap-y-8"}>
                            {item.mega.groups.map((group) => (
                              <div key={group.heading}>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-copper">{group.heading}</h3>
                                <ul className="mt-3 space-y-1.5">
                                  {group.items.map((child) => (
                                    <li key={child.href}>
                                      <Link href={child.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 no-underline hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setOpenDropdown(null)}>
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.mega.cards && (
                          <div className="flex-1 grid grid-cols-3 gap-5">
                            {item.mega.cards.map((card) => (
                              <Link key={card.href} href={card.href} className="group block overflow-hidden rounded-xl no-underline" onClick={() => setOpenDropdown(null)}>
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                                  {card.image ? (
                                    <Image src={card.image} alt={card.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                  ) : (
                                    <div className="h-full w-full bg-primary/10" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <span className="absolute bottom-3 left-3 right-3 text-base font-bold text-white drop-shadow">{card.name}</span>
                                </div>
                                {card.description && <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{card.description}</p>}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.mega.footerLink && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                          <Link href={item.mega.footerLink.href} className="text-sm font-semibold text-primary no-underline hover:text-primary-dark" onClick={() => setOpenDropdown(null)}>
                            {item.mega.footerLink.label} &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : item.children ? (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`px-3 py-2 text-sm font-medium rounded-md no-underline transition-colors ${
                      pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-expanded={openDropdown === item.name}
                    aria-haspopup="true"
                  >
                    {item.name}
                    <svg className={`ml-1 inline h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} className="block px-4 py-2.5 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 hover:text-primary" onClick={() => setOpenDropdown(null)}>
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
                    pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}

            {/* Search + social icons (compact, visible when scrolled) */}
            <div className={`flex items-center gap-2 ml-3 transition-all duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-400 hover:text-primary rounded-md hover:bg-gray-100 transition-colors" aria-label="Search">
                <SearchIcon className="h-4 w-4" />
              </button>
              <a href="https://www.facebook.com/langportlife/" target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="https://x.com/LangportLife" target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-black transition-colors" aria-label="X (Twitter)">
                <XIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Mobile: search + hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md" aria-label="Search">
              <SearchIcon className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Langport Life..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 max-h-[80vh] overflow-y-auto">
            {/* Mobile social */}
            <div className="flex items-center gap-4 px-3 py-3 border-b border-gray-100 mb-2">
              <a href="https://www.facebook.com/langportlife/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2]" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://x.com/LangportLife" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black" aria-label="X (Twitter)">
                <XIcon className="h-5 w-5" />
              </a>
            </div>

            {navigation.map((item) =>
              item.mega ? (
                <div key={item.name} className="border-t border-gray-100 pt-2 mt-2">
                  <button onClick={() => toggleDropdown(item.name)} className="flex w-full items-center justify-between px-3 py-2 text-sm font-bold text-gray-900">
                    {item.name}
                    <svg className={`h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <>
                      {item.mega.groups?.map((group) => (
                        <div key={group.heading} className="mb-2">
                          <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-copper">{group.heading}</span>
                          {group.items.map((child) => (
                            <Link key={child.href} href={child.href} className="block pl-6 py-1.5 text-sm text-gray-700 no-underline hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                      {item.mega.cards?.map((card) => (
                        <Link key={card.href} href={card.href} className="flex items-center gap-3 px-3 py-2 no-underline hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                          {card.image && (
                            <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded">
                              <Image src={card.image} alt={card.name} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900">{card.name}</span>
                            {card.description && <p className="text-xs text-gray-500">{card.description}</p>}
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              ) : item.children ? (
                <div key={item.name}>
                  <button onClick={() => toggleDropdown(item.name)} className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-500">
                    {item.name}
                    <svg className={`h-4 w-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.name && item.children.map((child) => (
                    <Link key={child.href} href={child.href} className="block pl-6 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.name} href={item.href} className={`block px-3 py-2 text-sm font-medium rounded-md no-underline ${pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"}`} onClick={() => setMobileOpen(false)}>
                  {item.name}
                </Link>
              )
            )}
            <Link href="/auth/signin" className="block mx-3 mt-2 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white no-underline" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
