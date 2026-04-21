/**
 * CORS middleware.
 * Allows judgmental.io and localhost origins only.
 */

const ALLOWED_ORIGINS = [
  'https://judgmental.io',
  'https://www.judgmental.io',
];

const LOCAL_RE = /^http:\/\/localhost(:\d+)?$/;

export function corsMiddleware(c, next) {
  const origin = c.req.header('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || LOCAL_RE.test(origin);

  if (allowed) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Mock-User');
    c.header('Vary', 'Origin');
  }

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  return next();
}
