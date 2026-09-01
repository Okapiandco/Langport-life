import { client } from "@/lib/sanity";
import { navigationQuery, siteSettingsQuery, upcomingEventsQuery, navCategoryImagesQuery } from "@/lib/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AccessibilityWidget from "@/components/AccessibilityWidget";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, settings, featuredEvents, navImages] = await Promise.all([
    client.fetch(navigationQuery).catch(() => null),
    client.fetch(siteSettingsQuery).catch(() => null),
    client.fetch(upcomingEventsQuery, { limit: 4 }).catch(() => []),
    client.fetch(navCategoryImagesQuery).catch(() => null),
  ]);

  return (
    <>
      <div className="site-content flex min-h-screen flex-col">
        <Header
          sanityNav={nav?.mainMenu}
          socialLinks={settings?.socialLinks}
          featuredEvents={featuredEvents ?? []}
          navImages={{
            events:        navImages?.manual?.events        ?? navImages?.auto?.events,
            venues:        navImages?.manual?.venues        ?? navImages?.auto?.venues,
            groups:        navImages?.manual?.groups        ?? navImages?.auto?.any,
            thingsToDo:    navImages?.manual?.thingsToDo,
            accommodation: navImages?.manual?.accommodation ?? navImages?.auto?.accommodation,
            shops:         navImages?.manual?.shops         ?? navImages?.auto?.shops,
            foodDrink:     navImages?.manual?.foodDrink     ?? navImages?.auto?.foodDrink,
            browseAll:     navImages?.manual?.browseAll     ?? navImages?.auto?.any,
            any:           navImages?.auto?.any,
          }}
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

      {/* Floating overlays live outside .site-content so the accessibility
          widget's own text-size zoom never scales itself. */}
      <AccessibilityWidget />
      <CookieConsentBanner />
      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    </>
  );
}
