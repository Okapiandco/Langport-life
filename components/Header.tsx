"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface NavChild { name: string; href: string; }
interface MegaCard { name: string; href: string; image?: string; description?: string; }
interface NavGroup { heading: string; items: NavChild[]; image?: string; }
interface MegaMenu {
  groups?: NavGroup[];
  cards?: MegaCard[];
  cardsHeading?: string;
  cardsImage?: string;
  footerLink?: { label: string; href: string };
  showFeaturedEvents?: boolean;
  columnLayout?: boolean;
}
interface NavItem { name: string; href: string; children?: NavChild[]; mega?: MegaMenu; }
interface FeaturedEvent {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  image?: { asset?: { url?: string }; alt?: string };
}

const navigation: NavItem[] = [
  {
    name: "What's On",
    href: "/events",
    mega: {
      columnLayout: true,
      groups: [
        { heading: "Events", image: "/nav-whats-on.jpg", items: [{ name: "What's On", href: "/events" }, { name: "Submit an Event", href: "/submit/event" }] },
        { heading: "Venues", image: "/nav-shops.jpg", items: [{ name: "All Venues", href: "/venues" }, { name: "Add a Venue", href: "/submit/venue" }] },
        { heading: "Groups", image: "/things-to-do/kayaking.jpg", items: [{ name: "Community Groups", href: "/community-groups" }, { name: "Add a Group", href: "/submit/group" }] },
      ],
      cardsHeading: "Things to Do",
      cardsImage: "/nav-things-to-do.jpg",
      cards: [
        { name: "The Outdoor Life", href: "/things-to-do/outdoor-life" },
        { name: "Walking & Cycling", href: "/things-to-do/walking-and-cycling" },
        { name: "Exploring the Wild", href: "/things-to-do/exploring-the-wild" },
      ],
      footerLink: { label: "View all events", href: "/events" },
    },
  },
  { name: "Shops & Services", href: "/listings", children: [{ name: "All Listings", href: "/listings" }, { name: "Add Your Business", href: "/submit/listing" }] },
  { name: "History", href: "/history" },
  {
    name: "Outdoor Life",
    href: "/things-to-do",
    mega: {
      cardsHeading: "Explore the Outdoors",
      cards: [
        { name: "The Outdoor Life", href: "/things-to-do/outdoor-life", image: "/things-to-do/outdoor-life.jpg", description: "Water sports, fishing, golf and activities on the River Parrett" },
        { name: "Walking & Cycling", href: "/things-to-do/walking-and-cycling", image: "/things-to-do/walking-cycling.jpg", description: "Routes and trails through the Somerset Levels" },
        { name: "Exploring the Wild", href: "/things-to-do/exploring-the-wild", image: "/things-to-do/explore-wild.jpg", description: "Wildlife and wild places on your doorstep" },
      ],
    },
  },
  { name: "Town News", href: "/news" },
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
  { name: "Contact Us", href: "/contact" },
];

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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

interface SanityNavItem {
  title: string;
  href?: string;
  children?: { groupTitle?: string; links?: { title: string; href: string; description?: string }[] }[];
  cards?: { title: string; description?: string; href: string; image?: { asset?: { url?: string } } }[];
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

function sanityToNav(items: SanityNavItem[]): NavItem[] {
  return items.map((item) => {
    const nav: NavItem = { name: item.title, href: item.href || "#" };
    if (item.children?.length) {
      const groups: NavGroup[] = item.children.map((child) => ({
        heading: child.groupTitle || "",
        items: (child.links || []).map((l) => ({ name: l.title, href: l.href })),
      }));
      nav.mega = { groups };
      if (item.href && item.href !== "#") {
        nav.mega.footerLink = { label: `View all ${item.title}`, href: item.href };
      }
      if (item.cards?.length) {
        nav.mega.cards = item.cards.map((card) => ({
          name: card.title,
          href: card.href,
          description: card.description,
          image: card.image?.asset?.url,
        }));
      }
    }
    return nav;
  });
}

export default function Header({
  sanityNav,
  socialLinks,
  featuredEvents,
}: {
  sanityNav?: SanityNavItem[];
  socialLinks?: SocialLinks;
  featuredEvents?: FeaturedEvent[];
}) {
  const navItems: NavItem[] = sanityNav?.length ? sanityToNav(sanityNav) : navigation;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleScroll() {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else if (window.scrollY === 0) {
        setScrolled(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Auto-advance the featured event thumbnail while What's On is open
  useEffect(() => {
    if (openDropdown === "What's On" && featuredEvents && featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIdx((i) => (i + 1) % featuredEvents.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [openDropdown, featuredEvents]);

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

  const events = featuredEvents ?? [];

  return (
    <header className={`sticky top-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Top bar */}
      {!scrolled && (
        <div className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
            <div className="flex items-center gap-3">
              <a href={socialLinks?.facebook || "https://www.facebook.com/share/1EbPeasW4k/?mibextid=wwXIfr"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href={socialLinks?.instagram || "https://www.instagram.com/langportwhereitsto?igsh=cWNmY24wcHdidzBk"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-4 w-4" />
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
              <Link href="/submit" className="text-xs font-medium text-gray-500 no-underline hover:text-primary">
                Submit
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation" ref={dropdownRef}>
        <div className={`flex items-center justify-between ${scrolled ? "h-14" : "h-20"}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center no-underline flex-shrink-0">
            <Image
              src="/Images/logo/Langport-Life-Black-Logo-002.png"
              alt="Langport Life"
              width={scrolled ? 160 : 220}
              height={scrolled ? 36 : 50}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-1 relative">
            {navItems.map((item) =>
              item.mega ? (
                <div key={item.name}>
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

                  {openDropdown === item.name && (() => {
                    // 4-column layout: image + heading + links per column
                    if (item.mega.columnLayout) {
                      return (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full z-20 mt-2 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5 w-[72rem]">
                          <div className="grid grid-cols-4 gap-6">
                            {item.mega.groups?.map((group) => (
                              <div key={group.heading}>
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                                  {group.image ? (
                                    <Image src={group.image} alt={group.heading} fill className="object-cover" />
                                  ) : (
                                    <div className="h-full w-full bg-primary/10" />
                                  )}
                                </div>
                                <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-copper">{group.heading}</h3>
                                <ul className="mt-2 space-y-0.5">
                                  {group.items.map((child) => (
                                    <li key={child.href}>
                                      <Link href={child.href} className="block rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 no-underline hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setOpenDropdown(null)}>
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            {item.mega.cards && (
                              <div>
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                                  {item.mega.cardsImage ? (
                                    <Image src={item.mega.cardsImage} alt={item.mega.cardsHeading ?? "Things to Do"} fill className="object-cover" />
                                  ) : (
                                    <div className="h-full w-full bg-primary/10" />
                                  )}
                                </div>
                                <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-copper">
                                  {item.mega.cardsHeading ?? "Things to Do"}
                                </h3>
                                <ul className="mt-2 space-y-0.5">
                                  {item.mega.cards.map((card) => (
                                    <li key={card.href}>
                                      <Link href={card.href} className="block rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 no-underline hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setOpenDropdown(null)}>
                                        {card.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
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
                      );
                    }

                    // Standard layout: groups sidebar + thumbnail cards (Outdoor Life etc)
                    const hasFeatured = !!(item.mega.showFeaturedEvents && events.length > 0);
                    const dropdownWidth = item.mega.cards ? "w-[72rem]" : hasFeatured ? "w-[54rem]" : "w-[56rem]";
                    const hasSidePanel = !!(item.mega.cards || hasFeatured);
                    const currentEvent = hasFeatured ? events[currentEventIdx % events.length] : null;

                    return (
                      <div className={`absolute left-1/2 -translate-x-1/2 top-full z-20 mt-2 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5 ${dropdownWidth}`}>
                        <div className={hasSidePanel ? "flex gap-8" : ""}>
                          {item.mega.groups && item.mega.groups.length > 0 && (
                            <div className={item.mega.cards ? "w-48 flex-shrink-0 space-y-6" : "flex-1 flex gap-8"}>
                              {item.mega.groups.map((group) => (
                                <div key={group.heading}>
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-copper">{group.heading}</h3>
                                  <ul className="mt-3 space-y-1">
                                    {group.items.map((child) => (
                                      <li key={child.href}>
                                        <Link href={child.href} className="block rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 no-underline hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setOpenDropdown(null)}>
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
                            <div className="flex-1">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-copper mb-4">
                                {item.mega.cardsHeading ?? "Things to Do"}
                              </h3>
                              <div className="grid grid-cols-3 gap-5">
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
                            </div>
                          )}
                          {hasFeatured && currentEvent && (
                            <div className="w-56 flex-shrink-0">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-copper mb-4">Coming up</h3>
                              <Link href={`/events/${currentEvent.slug.current}`} className="group block no-underline" onClick={() => setOpenDropdown(null)}>
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                                  {currentEvent.image?.asset?.url ? (
                                    <Image src={currentEvent.image.asset.url} alt={currentEvent.image.alt || currentEvent.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                  ) : (
                                    <div className="h-full w-full bg-primary/10" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-sm font-bold text-white leading-snug line-clamp-2">{currentEvent.title}</p>
                                    <p className="mt-0.5 text-xs text-white/80">{formatEventDate(currentEvent.date)}</p>
                                  </div>
                                </div>
                              </Link>
                              {events.length > 1 && (
                                <div className="mt-3 flex justify-center gap-1.5">
                                  {events.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentEventIdx(i)}
                                      className={`rounded-full transition-all duration-200 ${i === currentEventIdx % events.length ? "h-1.5 w-4 bg-primary" : "h-1.5 w-1.5 bg-gray-300 hover:bg-gray-400"}`}
                                      aria-label={`Show event ${i + 1}`}
                                    />
                                  ))}
                                </div>
                              )}
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
                    );
                  })()}
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

            {/* Compact search + social (visible when scrolled) */}
            <div className={`flex items-center gap-2 ml-3 transition-all duration-300 ${scrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-400 hover:text-primary rounded-md hover:bg-gray-100 transition-colors" aria-label="Search">
                <SearchIcon className="h-4 w-4" />
              </button>
              <a href={socialLinks?.facebook || "https://www.facebook.com/share/1EbPeasW4k/?mibextid=wwXIfr"} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href={socialLinks?.instagram || "https://www.instagram.com/langportwhereitsto?igsh=cWNmY24wcHdidzBk"} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-[#E4405F] transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-4 w-4" />
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
            <div className="flex items-center gap-4 px-3 py-3 border-b border-gray-100 mb-2">
              <a href={socialLinks?.facebook || "https://www.facebook.com/share/1EbPeasW4k/?mibextid=wwXIfr"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2]" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href={socialLinks?.instagram || "https://www.instagram.com/langportwhereitsto?igsh=cWNmY24wcHdidzBk"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F]" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>

            {navItems.map((item) =>
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
                      {item.mega.cards && (
                        <div className="mb-2">
                          {item.mega.cardsHeading && (
                            <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-copper">{item.mega.cardsHeading}</span>
                          )}
                          {item.mega.cards.map((card) => (
                            <Link key={card.href} href={card.href} className="flex items-center gap-3 pl-6 py-1.5 no-underline hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                              {card.image && (
                                <div className="relative h-8 w-12 flex-shrink-0 overflow-hidden rounded">
                                  <Image src={card.image} alt={card.name} fill className="object-cover" />
                                </div>
                              )}
                              <span className="text-sm text-gray-700">{card.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {item.mega.showFeaturedEvents && events.length > 0 && (
                        <div className="px-3 py-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-copper">Coming up</span>
                          {events.slice(0, 3).map((ev) => (
                            <Link key={ev._id} href={`/events/${ev.slug.current}`} className="flex items-center gap-3 py-2 no-underline hover:bg-gray-100 rounded-lg px-1" onClick={() => setMobileOpen(false)}>
                              {ev.image?.asset?.url && (
                                <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded">
                                  <Image src={ev.image.asset.url} alt={ev.image.alt || ev.title} fill className="object-cover" />
                                </div>
                              )}
                              <div>
                                <span className="text-sm font-medium text-gray-900 line-clamp-1">{ev.title}</span>
                                <p className="text-xs text-gray-500">{formatEventDate(ev.date)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
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
            <Link href="/submit" className="block mx-3 mt-2 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white no-underline" onClick={() => setMobileOpen(false)}>
              Submit
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
