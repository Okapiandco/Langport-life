"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getCookieConsent,
  getCookieConsentServerSnapshot,
  setCookieConsent,
  subscribeToCookieConsent,
} from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsent,
    getCookieConsentServerSnapshot
  );

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-2xl sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          We use cookies to understand how visitors use this site and help us improve it. See our{" "}
          <Link href="/cookie-policy" className="text-primary underline hover:text-primary/80">
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex flex-shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setCookieConsent("rejected")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("accepted")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
