"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import {
  getCookieConsent,
  getCookieConsentServerSnapshot,
  subscribeToCookieConsent,
} from "@/lib/cookieConsent";

export default function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsent,
    getCookieConsentServerSnapshot
  );

  if (!measurementId || consent !== "accepted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
