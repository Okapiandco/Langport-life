import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Roboto } from "next/font/google";
import { client } from "@/lib/sanity";
import { navigationQuery, siteSettingsQuery } from "@/lib/queries";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Langport Life — Community Hub for Langport, Somerset",
    template: "%s | Langport Life",
  },
  description:
    "Your community hub for events, venues, businesses, and council information in Langport, Somerset.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, settings] = await Promise.all([
    client.fetch(navigationQuery).catch(() => null),
    client.fetch(siteSettingsQuery).catch(() => null),
  ]);

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} ${roboto.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <Header
          sanityNav={nav?.mainMenu}
          socialLinks={settings?.socialLinks}
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
      </body>
    </html>
  );
}
