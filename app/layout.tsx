import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Roboto } from "next/font/google";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} ${roboto.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
