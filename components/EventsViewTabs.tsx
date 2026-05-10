import Link from "next/link";

const baseClass =
  "px-4 py-2 text-sm font-medium rounded-md no-underline transition-colors";
const activeClass = "bg-primary text-white hover:bg-primary/90";
const inactiveClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";

export default function EventsViewTabs({ active }: { active: "list" | "calendar" }) {
  return (
    <div className="mb-6 flex gap-2">
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
    </div>
  );
}
