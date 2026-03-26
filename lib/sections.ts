export type SectionKey =
  | "events"
  | "things-to-do"
  | "listings"
  | "history"
  | "environment"
  | "council"
  | "news"
  | "about"
  | "getting-here"
  | "default";

export interface SectionTheme {
  bg: string;       // Tailwind bg class
  text: string;     // Text on colored bg
  accent: string;   // For badges/tags on white bg
  accentBg: string; // Light tinted bg
  border: string;   // Border accent
}

export const sectionThemes: Record<SectionKey, SectionTheme> = {
  events: {
    bg: "bg-primary",
    text: "text-white",
    accent: "text-primary",
    accentBg: "bg-primary/10",
    border: "border-primary",
  },
  "things-to-do": {
    bg: "bg-copper",
    text: "text-white",
    accent: "text-copper",
    accentBg: "bg-copper/10",
    border: "border-copper",
  },
  listings: {
    bg: "bg-light-blue",
    text: "text-gray-900",
    accent: "text-primary",
    accentBg: "bg-light-blue/30",
    border: "border-light-blue",
  },
  history: {
    bg: "bg-dark-green",
    text: "text-white",
    accent: "text-dark-green",
    accentBg: "bg-dark-green/10",
    border: "border-dark-green",
  },
  environment: {
    bg: "bg-maroon",
    text: "text-white",
    accent: "text-maroon",
    accentBg: "bg-maroon/10",
    border: "border-maroon",
  },
  council: {
    bg: "bg-green",
    text: "text-white",
    accent: "text-green",
    accentBg: "bg-green/10",
    border: "border-green",
  },
  news: {
    bg: "bg-copper",
    text: "text-white",
    accent: "text-copper",
    accentBg: "bg-copper/10",
    border: "border-copper",
  },
  about: {
    bg: "bg-primary",
    text: "text-white",
    accent: "text-primary",
    accentBg: "bg-primary/10",
    border: "border-primary",
  },
  "getting-here": {
    bg: "bg-copper",
    text: "text-white",
    accent: "text-copper",
    accentBg: "bg-copper/10",
    border: "border-copper",
  },
  default: {
    bg: "bg-primary",
    text: "text-white",
    accent: "text-primary",
    accentBg: "bg-primary/10",
    border: "border-primary",
  },
};

export function getSectionFromPath(pathname: string): SectionKey {
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/things-to-do") || pathname.startsWith("/venues")) return "things-to-do";
  if (pathname.startsWith("/listings")) return "listings";
  if (pathname.startsWith("/history")) return "history";
  if (pathname.startsWith("/environment")) return "environment";
  if (pathname.startsWith("/council")) return "council";
  if (pathname.startsWith("/news")) return "news";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/getting-here")) return "getting-here";
  return "default";
}
