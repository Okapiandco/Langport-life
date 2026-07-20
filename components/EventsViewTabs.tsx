import Link from "next/link";

const baseClass =
  "px-4 py-2 text-sm font-medium rounded-md no-underline transition-colors";
const activeClass = "bg-primary text-white hover:bg-primary/90";
const inactiveClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";

export default function EventsViewTabs({ active }: { active: "list" | "calendar" }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Link
        href="/events"
        className={`${baseClass} ${active === "list" ? activeClass : inactiveClass}`}
        aria-current={active === "list" ? "page" : undefined}
      >
        List
      </Link>
      <Link
        href="/events/calendar"
        className={`${baseClass} ${active === "calendar" ? activeClass : inactiveClass}`}
        aria-current={active === "calendar" ? "page" : undefined}
      >
        Calendar
      </Link>
      <Link
        href="/submit/event"
        className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary/90 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Submit Your Event
      </Link>
    </div>
  );
}
