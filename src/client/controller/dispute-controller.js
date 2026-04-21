/**
 * Controller: Duel (Case + Duel)
 * Loads case and duel data from the API and manages permission gates.
 */

import { apiGet, apiPost } from '../api/client.js';
import { Case }   from '../model/case.js';
import { Duel }   from '../model/duel.js';
import { Record } from '../model/record.js';

export class DuelController {
  /** @param {{ id: string, handle: string }|null} currentUser */
  constructor(currentUser) {
    this._user = currentUser;
  }

  /**
   * Load a case by ID, including its claim and duels.
   * @param {string} caseId
   * @returns {Promise<{ case: Case, claim: Record|null, duels: Duel[] }>}
   */
  async loadCase(caseId) {
    const data = await apiGet(`/api/cases/${encodeURIComponent(caseId)}`);
    const caseObj = Case.fromApi(data);
    const claim   = data.claim ? Record.fromApi(data.claim) : null;
    const duels   = (data.duels ?? []).map(d => Duel.fromApi(d));
    return { case: caseObj, claim, duels };
  }

  /**
   * Load a single duel and its associated records.
   * @param {string} duelId
   * @returns {Promise<{ duel: Duel, records: Record[] }>}
   */
  async loadDuel(duelId) {
    const data    = await apiGet(`/api/duels/${encodeURIComponent(duelId)}`);
    const duel    = Duel.fromApi(data);
    const records = (data.records ?? []).map(r => Record.fromApi(r));
    return { duel, records };
  }

  /**
   * Submit an answer record to a duel.
   * @param {string} duelId
   * @param {string} text
   */
  async submitAnswer(duelId, text) {
    return apiPost(`/api/duels/${encodeURIComponent(duelId)}/turns`, { type: 'answer', text });
  }

  /**
   * Submit a judgment record.
   * @param {string} duelId
   * @param {string} text
   */
  async submitJudgment(duelId, text) {
    return apiPost(`/api/duels/${encodeURIComponent(duelId)}/turns`, { type: 'judgment', text });
  }

  // ---------------------------------------------------------------------------
  // Permission gates
  // ---------------------------------------------------------------------------

  /** Can the current user answer in this duel? */
  canAnswer(duel, caseObj) {
    const user = this._user;
    if (!user) return { allowed: false, reason: 'Sign in to answer.' };
    if (!duel.isActive) return { allowed: false, reason: 'Duel is not active.' };
    if (duel.answerRecordId) return { allowed: false, reason: 'Answer already submitted.' };
    if (user.id !== caseObj.respondentId)
      return { allowed: false, reason: 'Only the respondent can answer.' };
    return { allowed: true };
  }

  /** Can the current user judge this duel? */
  canJudge(duel) {
    const user = this._user;
    if (!user) return { allowed: false, reason: 'Sign in to judge.' };
    if (duel.isActive) return { allowed: false, reason: 'Duel must be resolved before judgment.' };
    return { allowed: true };
  }
}

// Backward-compatible export during BELIEF COURT refactor.
export { DuelController as DisputeController };
