/**
 * Route: GET /auth/me
 *        POST /maintenance/submit
 */

import { Hono }        from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getPersonById }  from '../models/person.js';
import { getDb }          from '../../../db/db.js';
import { v4 as uuid }     from 'uuid';
import { createHash }     from 'crypto';

export const authRouter = new Hono();

authRouter.get('/auth/me', authMiddleware, c => {
  const person = getPersonById(c.get('personId'));
  if (!person) return c.json({ error: 'Person not found' }, 404);
  return c.json(person);
});

authRouter.post('/maintenance/submit', async c => {
  const body    = await c.req.json().catch(() => ({}));
  const contact = String(body.contact ?? '').slice(0, 320);
  const message = String(body.message ?? '').slice(0, 500);
  const rawIp   = c.req.header('X-Forwarded-For')?.split(',')[0] ?? '';
  const ipHash  = createHash('sha256').update(rawIp).digest('hex');

  try {
    const db = getDb();
    db.run(
      'INSERT INTO maintenance_submissions (contact, message, ip_hash) VALUES (?, ?, ?)',
      [contact, message, ipHash]
    );
  } catch {
    // DB may be unavailable during maintenance — silently swallow
  }

  return c.json({ ok: true });
});
