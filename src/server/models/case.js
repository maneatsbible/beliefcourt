/**
 * Server model: Case + Duel
 */

import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { getDb }      from '../../../db/db.js';

// ---- Case -------------------------------------------------------------------

export function getCaseById(id) {
  const db = getDb();
  const c = db.get('SELECT * FROM cases WHERE id = ?', [id]);
  if (!c) return null;
  c.duels = getDuelsByCaseId(id);
  return c;
}

export function getCasesByClaimId(claimId) {
  const db = getDb();
  return db.query(
    'SELECT * FROM cases WHERE subject_record_id = ? ORDER BY created_at DESC',
    [claimId]
  );
}

/**
 * Open a new Case against a Record, create the first Duel,
 * and insert the opening Challenge Turn as a record.
 * All done in a logical transaction.
 *
 * @returns {{ caseId, duelId, challengeRecordId }}
 */
export function openCase({ subjectRecordId, openedByPersonId, defenderId, challengeText, challengeType }) {
  const db     = getDb();
  const caseId = uuid();
  const duelId = uuid();

  const challengeId = uuid();
  // createHash imported at top of file
  const hash = createHash('sha256').update(JSON.stringify({ id: challengeId, type: 'challenge', authorId: openedByPersonId, text: challengeText })).digest('hex');

  db.transaction(() => {
    db.run(
      `INSERT INTO cases (id, subject_record_id, opened_by_person_id, trigger_challenge_id, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [caseId, subjectRecordId, openedByPersonId, challengeId]
    );
    db.run(
      `INSERT INTO duels (id, case_id, challenger_id, defender_id, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [duelId, caseId, openedByPersonId, defenderId]
    );
    db.run(
      `INSERT INTO records
         (id, type, author_id, parent_id, case_id, challenge_type, text, integrity_hash)
       VALUES (?, 'challenge', ?, ?, ?, ?, ?, ?)`,
      [challengeId, openedByPersonId, subjectRecordId, caseId, challengeType ?? 'objection', challengeText, hash]
    );
  });

  return { caseId, duelId, challengeRecordId: challengeId };
}

// ---- Duel -------------------------------------------------------------------

export function getDuelById(id) {
  const db = getDb();
  return db.get('SELECT * FROM duels WHERE id = ?', [id]);
}

export function getDuelsByCaseId(caseId) {
  const db = getDb();
  return db.query('SELECT * FROM duels WHERE case_id = ? ORDER BY created_at ASC', [caseId]);
}
