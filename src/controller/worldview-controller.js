/**
 * Controller: Worldview
 *
 * Derives and serves the Worldview Renderer for a given Person.
 * Deterministic — no AI, no inference. Queries the Belief Ledger directly.
 *
 * Worldview components derived:
 *   - Claims filed (top-level Assertions, excluding offers)
 *   - Challenges issued
 *   - Answers given
 *   - Duels (as challenger + as defender)
 *   - Agreements (ClaimAccords)
 *   - Judgments rendered
 *   - Rescissions posted
 *   - BaseOfTruth declared
 */

import * as gh from '../api/github-client.js';
import { Post, Assertion } from '../model/post.js';
import { Dispute } from '../model/dispute.js';
import { Agreement } from '../model/agreement.js';
import { Judgment, BaseOfTruth } from '../model/judgment.js';
import { Rescission } from '../model/rescission.js';

export class WorldviewController {
  /**
   * @param {{ config: object, token: string|null }} opts
   */
  constructor({ config, token }) {
    this._config   = config;
    this._token    = token;
    this._dataRepo = config.dataRepo;
  }

  /**
   * Load and derive the full worldview for a given person login.
   * @param {string} login  GitHub login (no @)
   * @returns {Promise<WorldviewProfile>}
   */
  async loadProfile(login) {
    // Fetch all relevant label buckets in parallel — filter client-side.
    const [
      assertIssues, challengeIssues, answerIssues,
      disputeIssues, agreementIssues, judgmentIssues,
      rescissionIssues, botIssues,
    ] = await Promise.all([
      this._fetch('dsp:assertion'),
      this._fetch('dsp:challenge'),
      this._fetch('dsp:answer'),
      this._fetch('dsp:dispute'),
      this._fetch('dsp:agreement'),
      this._fetch('dsp:judgment'),
      this._fetch('dsp:rescission'),
      this._fetch('dsp:base-of-truth'),
    ]);

    // Claims filed by this person (not offers)
    const claims = assertIssues
      .filter(i => i.user?.login === login)
      .map(i => Post.fromIssue(i))
      .filter(p => p instanceof Assertion && !p.isOffer);

    // Challenges and Answers authored by this person
    const challenges = challengeIssues
      .filter(i => i.user?.login === login)
      .map(i => Post.fromIssue(i))
      .filter(Boolean);

    const answers = answerIssues
      .filter(i => i.user?.login === login)
      .map(i => Post.fromIssue(i))
      .filter(Boolean);

    // All disputes, separated by role
    const allDisputes = disputeIssues
      .map(i => Dispute.fromIssue(i))
      .filter(Boolean);

    const duelsAsChallenger = allDisputes.filter(d => d.challengerLogin === login);
    const duelsAsDefender   = allDisputes.filter(d => d.defenderLogin   === login);

    // Agreements filed by this person
    const agreements = agreementIssues
      .filter(i => i.user?.login === login)
      .map(i => Agreement.fromIssue(i))
      .filter(Boolean);

    // Judgments rendered by this person
    const judgments = judgmentIssues
      .filter(i => i.user?.login === login)
      .map(i => Judgment.fromIssue(i))
      .filter(Boolean);

    // Rescissions posted by this person
    const rescissions = rescissionIssues
      .filter(i => i.user?.login === login)
      .map(i => Rescission.fromIssue(i))
      .filter(Boolean);

    const rescindedIds = new Set(rescissions.map(r => r.recordId));

    // BaseOfTruth declared by this person (most recent wins)
    const baseOfTruth = botIssues
      .filter(i => i.user?.login === login)
      .map(i => BaseOfTruth.fromIssue(i))
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))[0] ?? null;

    return new WorldviewProfile({
      login,
      claims,
      challenges,
      answers,
      duelsAsChallenger,
      duelsAsDefender,
      agreements,
      judgments,
      rescissions,
      rescindedIds,
      baseOfTruth,
    });
  }

  // ---------------------------------------------------------------------------

  async _fetch(label) {
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=${encodeURIComponent(label)}&state=open&per_page=100`;
    return gh.get(url, this._token).catch(() => []);
  }
}

// ---------------------------------------------------------------------------
// WorldviewProfile — derived, in-memory
// ---------------------------------------------------------------------------

export class WorldviewProfile {
  constructor({
    login, claims, challenges, answers,
    duelsAsChallenger, duelsAsDefender,
    agreements, judgments, rescissions, rescindedIds, baseOfTruth,
  }) {
    this.login             = login;
    this.claims            = claims;
    this.challenges        = challenges;
    this.answers           = answers;
    this.duelsAsChallenger = duelsAsChallenger;
    this.duelsAsDefender   = duelsAsDefender;
    this.agreements        = agreements;
    this.judgments         = judgments;
    this.rescissions       = rescissions;
    this.rescindedIds      = rescindedIds;
    this.baseOfTruth       = baseOfTruth;
  }

  get allDuels()     { return [...this.duelsAsChallenger, ...this.duelsAsDefender]; }
  get totalDuels()   { return this.allDuels.length; }
  get activeCount()  { return this.allDuels.filter(d => d.isActive).length; }
  get accordCount()  { return this.allDuels.filter(d => d.isResolved).length; }
  get defendedCount(){ return this.duelsAsDefender.filter(d => d.isDefended).length; }
  get standingClaims() {
    return this.claims.filter(c =>
      !this.rescindedIds.has(c.id) &&
      this.duelsAsDefender.some(d => d.rootPostId === c.id && d.isDefended)
    );
  }
}
