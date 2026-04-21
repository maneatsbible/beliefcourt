/**
 * Routes: /api/cases
 */

import { Hono }          from 'hono';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { getCaseById, getCasesByClaimId, openCase } from '../models/case.js';
import { getRecordById } from '../models/record.js';

export const casesRouter = new Hono();

// GET /api/cases?claim_id=...
casesRouter.get('/api/cases', optionalAuth, c => {
  const claimId = c.req.query('claim_id');
  if (!claimId) return c.json({ error: 'claim_id query param required' }, 400);
  return c.json({ cases: getCasesByClaimId(claimId) });
});

// GET /api/cases/:id
casesRouter.get('/api/cases/:id', optionalAuth, c => {
  const kase = getCaseById(c.req.param('id'));
  if (!kase) return c.json({ error: 'Not found' }, 404);
  return c.json(kase);
});

// POST /api/cases — open a Case against a Claim
casesRouter.post('/api/cases', authMiddleware, async c => {
  const body = await c.req.json().catch(() => ({}));
  const { claimId, text, challengeType } = body;

  if (!claimId)   return c.json({ error: 'claimId required' }, 400);
  if (!text?.trim()) return c.json({ error: 'text required' }, 400);

  const claim = getRecordById(claimId);
  if (!claim)                              return c.json({ error: 'Claim not found' }, 404);
  if (claim.type !== 'claim')              return c.json({ error: 'Target must be a claim' }, 400);
  if (claim.author_id === c.get('personId')) {
    return c.json({ error: 'Cannot challenge your own claim' }, 403);
  }

  const result = openCase({
    subjectRecordId:  claimId,
    openedByPersonId: c.get('personId'),
    defenderId:       claim.author_id,
    challengeText:    text.trim(),
    challengeType:    challengeType ?? 'objection',
  });

  return c.json(result, 201);
});
