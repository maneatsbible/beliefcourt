/**
 * Auth middleware — JWT verification or mock user passthrough.
 *
 * In mock mode (USE_MOCK_DB=true):
 *   Reads X-Mock-User header (set by client from ?u= URL param).
 *   Looks up person by handle in the DB, sets c.var.personId.
 *   Falls back to first person in DB if header missing.
 *
 * In production:
 *   Extracts Authorization: Bearer <token>, verifies HS256 JWT,
 *   sets c.var.personId to the payload personId.
 *   Returns 401 on missing or invalid token.
 */

import { verifyJwt } from '../auth/jwt.js';
import { getDb }     from '../../../db/db.js';

const useMock = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'test';

export async function authMiddleware(c, next) {
  if (useMock) {
    const handle = c.req.header('X-Mock-User') ?? 'alice';
    const db = getDb();
    // Find person by handle in linked_identities
    const identity = db.get(
      'SELECT * FROM linked_identities WHERE handle = ?',
      [handle]
    );
    if (!identity) {
      return c.json({ error: `Mock user '${handle}' not found in seed data` }, 401);
    }
    c.set('personId', identity.person_id);
    await next();
    return;
  }

  const authHeader = c.req.header('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { personId } = await verifyJwt(token);
    c.set('personId', personId);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
}

/**
 * Optional auth — sets personId if token present, does not reject if absent.
 */
export async function optionalAuth(c, next) {
  if (useMock) {
    const handle = c.req.header('X-Mock-User');
    if (handle) {
      const db = getDb();
      const identity = db.get('SELECT * FROM linked_identities WHERE handle = ?', [handle]);
      if (identity) c.set('personId', identity.person_id);
    }
    await next();
    return;
  }

  const authHeader = c.req.header('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      const { personId } = await verifyJwt(token);
      c.set('personId', personId);
    } catch { /* ignore */ }
  }
  await next();
}
