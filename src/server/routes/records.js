/**
 * Routes: /api/records  and  /api/claims
 */

import { Hono }           from 'hono';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { createRecord, getRecordById, getClaims } from '../models/record.js';
import { getPersonById }  from '../models/person.js';
import { getCasesByClaimId } from '../models/case.js';

export const recordsRouter = new Hono();

// GET /api/claims — public, paginated
recordsRouter.get('/api/claims', optionalAuth, c => {
  const limit  = Math.min(Number(c.req.query('limit')  ?? 30), 100);
  const offset = Number(c.req.query('offset') ?? 0);
  const rows   = getClaims({ limit, offset });
  return c.json({ claims: rows, limit, offset });
});

// POST /api/claims — create a new Claim
recordsRouter.post('/api/claims', authMiddleware, async c => {
  const body = await c.req.json().catch(() => ({}));
  const text = String(body.text ?? '').trim();
  if (!text) return c.json({ error: 'text is required' }, 400);

  const record = createRecord({
    type:     'claim',
    authorId: c.get('personId'),
    text,
    imageUrl:           body.imageUrl,
    sourceUrl:          body.sourceUrl,
    attributedHandle:   body.attributedHandle,
    attributedPlatform: body.attributedPlatform,
  });

  return c.json(record, 201);
});

// GET /api/records/:id
recordsRouter.get('/api/records/:id', optionalAuth, c => {
  const record = getRecordById(c.req.param('id'));
  if (!record) return c.json({ error: 'Not found' }, 404);

  // Attach author info
  const author = getPersonById(record.author_id);
  const cases  = record.type === 'claim' ? getCasesByClaimId(record.id) : [];
  return c.json({ ...record, author, cases });
});

// POST /api/records — generic record creation (challenge, answer, offer, response)
recordsRouter.post('/api/records', authMiddleware, async c => {
  const body = await c.req.json().catch(() => ({}));
  const allowedTypes = ['challenge', 'answer', 'offer', 'response'];
  const type = body.type;
  if (!allowedTypes.includes(type)) {
    return c.json({ error: `type must be one of: ${allowedTypes.join(', ')}` }, 400);
  }
  if (type === 'challenge' && !body.parentId) {
    return c.json({ error: 'parentId required for challenge' }, 400);
  }

  const record = createRecord({
    type,
    authorId:      c.get('personId'),
    parentId:      body.parentId,
    caseId:        body.caseId,
    text:          String(body.text ?? '').trim() || null,
    imageUrl:      body.imageUrl,
    challengeType: body.challengeType,
    yesNo:         body.yesNo,
  });

  return c.json(record, 201);
});
