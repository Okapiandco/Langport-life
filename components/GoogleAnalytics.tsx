"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import {
  getCookieConsent,
  getCookieConsentServerSnapshot,
  subscribeToCookieConsent,
} from "@/lib/cookieConsent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GoogleAnalytics — Google Consent Mode v2.
 *
 * GA loads on every page but starts in a cookieless "denied" state, so no
 * analytics cookies are set until the visitor accepts (UK GDPR / PECR), while
 * Google still receives cookieless pings and models the traffic. The reactive
 * consent store upgrades or holds the state in the same session; a returning
 * visitor's stored choice is applied as the default on their first hit.
 */
export default function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsent,
    getCookieConsentServerSnapshot
  );

  useEffect(() => {
    if (!measurementId || !consent) return;
    window.gtag?.("consent", "update", {
      analytics_storage: consent === "accepted" ? "granted" : "denied",
    });
  }, [consent, measurementId]);

  if (!measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          var stored = null;
          try { stored = localStorage.getItem('cookie-consent'); } catch (e) {}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: stored === 'accepted' ? 'granted' : 'denied',
            wait_for_update: 500,
          });
          gtag('set', 'url_passthrough', true);

          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
