export type CookieConsent = "accepted" | "rejected";

const STORAGE_KEY = "cookie-consent";
const COOKIE_CONSENT_EVENT = "cookie-consent-change";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function getCookieConsentServerSnapshot(): CookieConsent | null {
  return null;
}

export function subscribeToCookieConsent(callback: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
}

export function setCookieConsent(consent: CookieConsent) {
  window.localStorage.setItem(STORAGE_KEY, consent);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}

export function clearCookieConsent() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}
