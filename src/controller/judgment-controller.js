/**
 * Controller: Judgment (US6)
 *
 * Handles Analysis submission and Judgment rendering for completed Duels.
 *
 * Rules (from spec):
 * - Person must NOT be a party in the Duel to analyze or judge.
 * - Duel must have a Disposition (not active) before Analysis/Judgment is possible.
 * - Analysis must be submitted before Judgment.
 * - Person must have a declared BaseOfTruth before judging.
 * - One Judgment per Person per Duel.
 *
 * Also manages BaseOfTruth declaration for Persons.
 */

import * as gh from '../api/github-client.js';
import * as cache from '../api/cache.js';
import {
  Judgment, Analysis, BaseOfTruth,
  JUDGMENT_VERDICT_CHALLENGER,
  JUDGMENT_VERDICT_DEFENDER,
  JUDGMENT_VERDICT_INCONCLUSIVE,
} from '../model/judgment.js';

export { JUDGMENT_VERDICT_CHALLENGER, JUDGMENT_VERDICT_DEFENDER, JUDGMENT_VERDICT_INCONCLUSIVE };

export class JudgmentController {
  /**
   * @param {{ config: object, token: string|null, currentUser: object|null }} opts
   */
  constructor({ config, token, currentUser }) {
    this._config   = config;
    this._token    = token;
    this._user     = currentUser;
    this._dataRepo = config.dataRepo;
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  /**
   * Load all Analyses for a Duel.
   * @param {number} duelId
   * @returns {Promise<Analysis[]>}
   */
  async loadAnalyses(duelId) {
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=dsp%3Aanalysis&state=open&per_page=100`;
    const issues = await gh.get(url, this._token);
    return issues
      .map(i => Analysis.fromIssue(i))
      .filter(a => a && a.duelId === duelId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  /**
   * Load all Judgments for a Duel.
   * @param {number} duelId
   * @returns {Promise<Judgment[]>}
   */
  async loadJudgments(duelId) {
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=dsp%3Ajudgment&state=open&per_page=100`;
    const issues = await gh.get(url, this._token);
    return issues
      .map(i => Judgment.fromIssue(i))
      .filter(j => j && j.duelId === duelId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  /**
   * Load the BaseOfTruth for a given person id.
   * Returns the most recently declared one (person may update).
   * @param {number} personId
   * @returns {Promise<BaseOfTruth|null>}
   */
  async loadBaseOfTruth(personId) {
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=dsp%3Abase-of-truth&state=open&per_page=100`;
    const issues = await gh.get(url, this._token);
    const matched = issues
      .map(i => BaseOfTruth.fromIssue(i))
      .filter(b => b && b.personId === personId)
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    return matched[0] ?? null;
  }

  // ---------------------------------------------------------------------------
  // Permission gates
  // ---------------------------------------------------------------------------

  /**
   * Can this person submit Analysis on this Duel?
   * @param {{ id: number }|null} person
   * @param {import('../model/dispute.js').Dispute} dispute
   * @returns {{ allowed: boolean, reason: string }}
   */
  canAnalyze(person, dispute) {
    if (!person) return { allowed: false, reason: 'Sign in to submit Analysis.' };
    if (dispute.isActive) {
      return { allowed: false, reason: 'The Duel must reach a Disposition before Analysis.' };
    }
    const isParty = person.id === dispute.challengerId || person.id === dispute.defenderId;
    if (isParty) {
      return { allowed: false, reason: 'Duel parties cannot submit Analysis.' };
    }
    return { allowed: true, reason: '' };
  }

  /**
   * Can this person render Judgment on this Duel?
   * @param {{ id: number }|null}   person
   * @param {import('../model/dispute.js').Dispute} dispute
   * @param {Analysis[]}            analyses          All analyses for this Duel
   * @param {BaseOfTruth|null}      baseOfTruth       This person's declared BoT
   * @param {Judgment[]}            existingJudgments All judgments for this Duel
   * @returns {{ allowed: boolean, reason: string }}
   */
  canJudge(person, dispute, analyses, baseOfTruth, existingJudgments) {
    if (!person) return { allowed: false, reason: 'Sign in to render Judgment.' };
    if (dispute.isActive) {
      return { allowed: false, reason: 'The Duel must reach a Disposition first.' };
    }
    const isParty = person.id === dispute.challengerId || person.id === dispute.defenderId;
    if (isParty) {
      return { allowed: false, reason: 'Duel parties cannot render Judgment.' };
    }
    const hasAnalysis = analyses.some(a => a.authorPersonId === person.id);
    if (!hasAnalysis) {
      return { allowed: false, reason: 'Submit Analysis before rendering Judgment.' };
    }
    if (!baseOfTruth?.isDeclared) {
      return { allowed: false, reason: 'Declare your Base of Truth first.' };
    }
    const alreadyJudged = existingJudgments.some(j => j.judgePersonId === person.id);
    if (alreadyJudged) {
      return { allowed: false, reason: 'You have already rendered Judgment on this Duel.' };
    }
    return { allowed: true, reason: '' };
  }

  // ---------------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------------

  /**
   * Submit Analysis for a Duel.
   * @param {{ id: number, login: string }} person
   * @param {import('../model/dispute.js').Dispute} dispute
   * @param {{ summary: string, momentRefs?: object[] }} opts
   * @returns {Promise<object>}
   */
  async submitAnalysis(person, dispute, { summary, momentRefs = [] }) {
    const { allowed, reason } = this.canAnalyze(person, dispute);
    if (!allowed) throw new Error(reason);

    const meta = {
      type:           'analysis',
      version:        1,
      appId:          gh.APP_ID,
      duelId:         dispute.id,
      authorPersonId: person.id,
      momentRefs,
    };

    const issue = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Analysis of Duel #${dispute.id} by @${person.login}`,
      body:   await gh.buildBodyWithHash(meta, summary),
      labels: ['dsp:analysis'],
    }, this._token);

    cache.invalidatePattern(gh.issuesUrl(this._dataRepo));
    return issue;
  }

  /**
   * Render Judgment on a Duel.
   * @param {{ id: number, login: string }} person
   * @param {import('../model/dispute.js').Dispute} dispute
   * @param {{
   *   verdict:            string,
   *   reasoning:          string,
   *   analysisId:         number,
   *   baseOfTruthClaimId: number|null
   * }} opts
   * @returns {Promise<object>}
   */
  async submitJudgment(person, dispute, { verdict, reasoning, analysisId, baseOfTruthClaimId }) {
    const meta = {
      type:               'judgment',
      version:            1,
      appId:              gh.APP_ID,
      duelId:             dispute.id,
      judgePersonId:      person.id,
      verdict,
      analysisId,
      baseOfTruthClaimId: baseOfTruthClaimId ?? null,
    };

    const issue = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Judgment on Duel #${dispute.id} by @${person.login}: ${verdict}`,
      body:   await gh.buildBodyWithHash(meta, reasoning),
      labels: ['dsp:judgment'],
    }, this._token);

    cache.invalidatePattern(gh.issuesUrl(this._dataRepo));
    return issue;
  }

  /**
   * Declare or update a Person's Base of Truth.
   * @param {{ id: number, login: string }} person
   * @param {{ declarationText: string, anchorClaimId?: number|null }} opts
   * @returns {Promise<object>}
   */
  async setBaseOfTruth(person, { declarationText, anchorClaimId = null }) {
    if (!person) throw new Error('Must be signed in.');
    if (!declarationText?.trim()) throw new Error('Declaration text is required.');

    const meta = {
      type:           'base-of-truth',
      version:        1,
      appId:          gh.APP_ID,
      personId:       person.id,
      anchorClaimId:  anchorClaimId ?? null,
    };

    const issue = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Base of Truth — @${person.login}`,
      body:   await gh.buildBodyWithHash(meta, declarationText),
      labels: ['dsp:base-of-truth'],
    }, this._token);

    cache.invalidatePattern(gh.issuesUrl(this._dataRepo));
    return issue;
  }
}
