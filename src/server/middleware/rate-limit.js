/**
 * Rate-limit middleware.
 * Sliding window: 200 requests per minute per IP.
 * Returns 429 with Retry-After header when exceeded.
 */

const WINDOW_MS  = 60_000;
const MAX_REQ    = 200;

/** @type {Map<string, { count: number, resetAt: number }>} */
const _buckets = new Map();

// Clean up stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, b] of _buckets) {
    if (b.resetAt < now) _buckets.delete(ip);
  }
}, 5 * 60_000).unref?.();

export function rateLimitMiddleware(c, next) {
  const ip = c.req.header('X-Forwarded-For')?.split(',')[0].trim()
    ?? c.env?.remoteAddr
    ?? 'unknown';

  const now = Date.now();
  let bucket = _buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    _buckets.set(ip, bucket);
  }

  bucket.count++;
  if (bucket.count > MAX_REQ) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    c.header('Retry-After', String(retryAfter));
    return c.json({ error: 'Too many requests' }, 429);
  }

  return next();
}
