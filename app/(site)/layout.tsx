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

  // Sitewide structured data — identifies the site and enables the
  // sitelinks search box in Google results.
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://langport.life/#website",
        url: "https://langport.life",
        name: "Langport Life",
        description:
          "Community hub for events, venues, businesses, and council information in Langport, Somerset.",
        inLanguage: "en-GB",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://langport.life/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://langport.life/#organization",
        name: "Langport Life",
        url: "https://langport.life",
        areaServed: {
          "@type": "Place",
          name: "Langport, Somerset, UK",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
