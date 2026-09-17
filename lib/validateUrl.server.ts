import "server-only";

// Submitter-supplied URLs (ticketsUrl, website) are rendered straight into
// href attributes on the public site, so only http(s) may get through —
// anything else (javascript:, data:, vbscript:, ...) is a stored-XSS vector
// that moderation is unlikely to catch.

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Normalise a user-typed URL. Returns:
 * - undefined for empty input (field not set),
 * - the URL (with https:// prepended when the user typed a bare domain),
 * - null when the value carries a non-http(s) scheme and must be rejected.
 */
export function sanitizeHttpUrl(value: unknown): string | null | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (HAS_SCHEME.test(trimmed)) return null;
  // Bare domain like "www.example.com" — assume https.
  return `https://${trimmed}`;
}
