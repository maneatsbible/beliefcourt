/**
 * Controller: Home Feed
 * Loads claims from the API and manages permission gates.
 */

import { apiGet, apiPost } from '../api/client.js';
import { Record }          from '../model/record.js';

const PER_PAGE = 30;

export class HomeController {
  /** @param {{ id: string, handle: string }|null} currentUser */
  constructor(currentUser) {
    this._user = currentUser;
  }

  /**
   * Load a page of claims.
   * @param {number} [page=1]
   * @returns {Promise<Record[]>}
   */
  async loadClaims(page = 1) {
    const offset = (page - 1) * PER_PAGE;
    const data = await apiGet(`/api/claims?limit=${PER_PAGE}&offset=${offset}`);
    return (data.claims ?? data ?? []).map(r => Record.fromApi(r));
  }

  /**
   * Submit a new top-level claim.
   * @param {string} text
   */
  async submitClaim(text) {
    return apiPost('/api/claims', { text });
  }

  /**
   * Open a case (challenge a claim).
   * @param {string} claimId
   * @param {string} text
   */
  async submitChallenge(claimId, text) {
    return apiPost('/api/cases', { claimId, challengeText: text });
  }

  /**
   * Record an accord with a claim (agreeing publicly).
   * @param {string} claimId
   */
  async submitAccord(claimId) {
    return apiPost('/api/records', { type: 'accord', claimId });
  }

  // ---------------------------------------------------------------------------
  // Permission gates
  // ---------------------------------------------------------------------------

  canChallenge(user, record) {
    if (!user)   return { allowed: false, reason: 'Sign in to challenge.' };
    if (!record.isClaim) return { allowed: false, reason: 'Only claims can be challenged.' };
    if (record.authorId === user.id)
      return { allowed: false, reason: 'You cannot challenge your own claim.' };
    return { allowed: true, reason: '' };
  }

  canAgree(user, record) {
    if (!user) return { allowed: false, reason: 'Sign in to accord.' };
    if (!record.isClaim) return { allowed: false, reason: 'Only claims can be accorded.' };
    return { allowed: true, reason: '' };
  }
}
