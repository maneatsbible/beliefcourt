/**
 * Server model: Record (Claim, Challenge, Answer, Offer, Response)
 */

import { v4 as uuid }    from 'uuid';
import { createHash }    from 'crypto';
import { getDb }         from '../../../db/db.js';

export function getRecordById(id) {
  const db = getDb();
  return db.get('SELECT * FROM records WHERE id = ?', [id]);
}

export function getRecordsByCase(caseId) {
  const db = getDb();
  return db.query(
    'SELECT * FROM records WHERE case_id = ? ORDER BY created_at ASC',
    [caseId]
  );
}

/**
 * Returns all Claims (paginated) for the home feed.
 * Uses sequential simple queries for MockAdapter compatibility —
 * avoids JOINs and subqueries for compatibility with all adapters.
 */
export function getClaims({ limit = 30, offset = 0 } = {}) {
  const db = getDb();

  const claims = db.query(
    `SELECT * FROM records WHERE type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    ['claim', limit, offset]
  );

  // Augment each claim with author info + case/agreement counts.
  return claims.map(r => {
    // Author identity
    const identity = db.get(
      `SELECT * FROM linked_identities WHERE person_id = ? LIMIT 1`,
      [r.author_id]
    );
    r.author_handle          = identity?.handle          ?? null;
    r.author_platform        = identity?.platform        ?? null;
    r.author_profile_pic_url = identity?.profile_pic_url ?? '';

    // Open case count
    const openCases = db.query(
      `SELECT * FROM cases WHERE claim_id = ? AND status = ?`,
      [r.id, 'open']
    );
    r.open_case_count = openCases.length;

    // ClaimAgreement count (claim_agreements rows)
    const agreements = db.query(
      `SELECT * FROM claim_agreements WHERE claim_id = ?`,
      [r.id]
    );
    r.claim_agreement_count = agreements.length;

    return r;
  });
}

export function createRecord({ type, authorId, parentId = null, caseId = null, text, imageUrl, sourceUrl, attributedHandle, attributedPlatform, challengeType, yesNo }) {
  const db = getDb();
  const id   = uuid();
  const now  = new Date().toISOString();
  const hash = _integrityHash({ id, type, authorId, text, createdAt: now });

  db.run(
    `INSERT INTO records
       (id, type, author_id, parent_id, case_id, challenge_type, yes_no,
        text, image_url, source_url, attributed_handle, attributed_platform, integrity_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, type, authorId, parentId ?? null, caseId ?? null,
      challengeType ?? null, yesNo ?? null,
      text ?? null, imageUrl ?? null, sourceUrl ?? null,
      attributedHandle ?? null, attributedPlatform ?? null,
      hash, now,
    ]
  );

  return getRecordById(id);
}

function _integrityHash(fields) {
  const canonical = JSON.stringify(fields, Object.keys(fields).sort());
  return createHash('sha256').update(canonical).digest('hex');
}
