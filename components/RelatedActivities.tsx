import Link from "next/link";
import Image from "next/image";

export interface Activity {
  title: string;
  href: string;
  image: string;
}

export const ALL_ACTIVITIES: Activity[] = [
  { title: "Golf", href: "/things-to-do/golf", image: "/things-to-do/golf.png" },
  { title: "Wild Swimming", href: "/things-to-do/wild-swimming", image: "/things-to-do/wild-swimming.jpg" },
  { title: "Kayaking & Canoeing", href: "/things-to-do/kayaking", image: "/things-to-do/kayaking.jpg" },
  { title: "Paddleboarding", href: "/things-to-do/paddleboarding", image: "/things-to-do/paddleboarding.jpg" },
  { title: "Boating", href: "/things-to-do/boating", image: "/things-to-do/boating.jpg" },
  { title: "Fishing", href: "/things-to-do/fishing", image: "/things-to-do/fishing.jpg" },
  { title: "North Street Moor", href: "/things-to-do/north-street-moor", image: "/things-to-do/butterfly.jpg" },
  { title: "Parrett Drove & Cocklemoor", href: "/things-to-do/parrett-drove-and-cocklemoor-walk", image: "/things-to-do/explore-wild.jpg" },
  { title: "Muchelney Route", href: "/things-to-do/muchelney-route", image: "/things-to-do/muchelney.jpg" },
  { title: "Short Town Walks", href: "/things-to-do/short-town-walks", image: "/things-to-do/hanging-chapel.jpg" },
  { title: "Cycling", href: "/things-to-do/cycling", image: "/things-to-do/cycling.jpg" },
];

interface RelatedActivitiesProps {
  /** Current page href to exclude from the list */
  current: string;
  /** Heading text */
  heading?: string;
}

export default function RelatedActivities({ current, heading = "More Things to Do" }: RelatedActivitiesProps) {
  const related = ALL_ACTIVITIES.filter((a) => a.href !== current);

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">{heading}</h2>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {related.map((activity) => (
          <Link
            key={activity.title}
            href={activity.href}
            className="group block overflow-hidden rounded-lg border border-gray-200 bg-white no-underline shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={activity.image}
                alt={activity.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="font-heading text-sm font-semibold text-gray-900 group-hover:text-primary">
                {activity.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
