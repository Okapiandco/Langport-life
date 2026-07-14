import { client } from "@/lib/sanity";
import { navigationQuery, siteSettingsQuery, upcomingEventsQuery, navCategoryImagesQuery } from "@/lib/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, settings, featuredEvents, navImages] = await Promise.all([
    client.fetch(navigationQuery).catch(() => null),
    client.fetch(siteSettingsQuery).catch(() => null),
    client.fetch(upcomingEventsQuery, { limit: 4 }).catch(() => []),
    client.fetch(navCategoryImagesQuery).catch(() => ({})),
  ]);

  return (
    <div className="site-content flex min-h-screen flex-col">
      <Header
        sanityNav={nav?.mainMenu}
        socialLinks={settings?.socialLinks}
        featuredEvents={featuredEvents ?? []}
        navImages={navImages}
      />
      <Breadcrumbs />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer
        columns={nav?.footerColumns}
        footerText={settings?.footerText}
        socialLinks={settings?.socialLinks}
      />
    </div>
  );
}
