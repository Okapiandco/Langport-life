import type { SectionKey } from "@/lib/sections";
import { sectionThemes } from "@/lib/sections";

interface PageHeroProps {
  section: SectionKey;
  title: string;
  subtitle?: string;
}

export default function PageHero({ section, title, subtitle }: PageHeroProps) {
  const theme = sectionThemes[section];

  return (
    <div className={`relative ${theme.bg} ${theme.text} overflow-hidden`}>
      {/* Decorative swirl SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full text-white"
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,64 C240,110 480,20 720,64 C960,108 1200,20 1440,64 L1440,120 L0,120 Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path
          d="M0,80 C320,120 640,40 960,80 C1120,100 1280,60 1440,80 L1440,120 L0,120 Z"
          fill="currentColor"
        />
      </svg>

      {/* Subtle ornamental flourish behind title */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] opacity-[0.06]"
        viewBox="0 0 600 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M300,100 C300,100 240,30 160,50 C80,70 60,140 120,160 C180,180 220,140 200,100 C180,60 120,40 80,80"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M300,100 C300,100 360,30 440,50 C520,70 540,140 480,160 C420,180 380,140 400,100 C420,60 480,40 520,80"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-3xl text-lg opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
