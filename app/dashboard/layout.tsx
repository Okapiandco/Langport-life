"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const user = session.user as { name?: string; role?: string };
  const role = user.role || "public";

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Events", href: "/dashboard/my-events" },
  ];

  if (role === "businessOwner") {
    navItems.push({ name: "My Listings", href: "/dashboard/my-listings" });
  }
  if (role === "venueOwner") {
    navItems.push(
      { name: "My Venue", href: "/dashboard/venue" },
      { name: "Event Approvals", href: "/dashboard/venue/approvals" }
    );
  }
  if (role === "clerk") {
    navItems.push(
      { name: "Approvals", href: "/dashboard/admin/approvals" },
      { name: "Users", href: "/dashboard/admin/users" },
      { name: "Documents", href: "/dashboard/admin/documents" }
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
