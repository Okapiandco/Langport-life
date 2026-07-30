"use client";

import { clearCookieConsent } from "@/lib/cookieConsent";

export default function ManageCookiesLink() {
  return (
    <button
      type="button"
      onClick={() => clearCookieConsent()}
      className="text-gray-400 no-underline hover:text-white"
    >
      Cookie Preferences
    </button>
  );
}
