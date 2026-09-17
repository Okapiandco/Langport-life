import "server-only";

// Lightweight per-IP fixed-window rate limiter for the public POST endpoints.
// In-memory, so on Vercel it only counts requests that land on the same warm
// instance — not a hard guarantee, but it stops the cheap attacks (form spam,
// upload floods, email bombing via the confirmation mail) without adding an
// external store. Swap for Upstash/Vercel KV if it ever needs to be strict.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

// Drop expired windows occasionally so the map can't grow unbounded.
let lastSweep = Date.now();
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, win] of windows) {
    if (win.resetAt <= now) windows.delete(key);
  }
}

export function clientIp(request: Request): string {
  // Vercel sets x-forwarded-for; the first entry is the client.
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns true when the caller identified by `key` is within `limit` requests
 * per `windowMs`, and records this request. Scope the key per endpoint, e.g.
 * `submit:${ip}`.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  sweep(now);
  const win = windows.get(key);
  if (!win || win.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  win.count += 1;
  return win.count <= limit;
}
