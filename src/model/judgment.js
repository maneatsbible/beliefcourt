/**
 * Model: Judgment, Analysis, BaseOfTruth
 *
 * Judgment    — a Person's verdict on a completed Duel, grounded in their
 *               declared BaseOfTruth. Requires Analysis first.
 * Analysis    — a structured reading of a Duel, required before Judgment.
 * BaseOfTruth — a Person's declared epistemic anchor: what they count as
 *               evidence and how they decide what is true.
 *
 * Labels used:
 *   dsp:judgment      — Judgment issues
 *   dsp:analysis      — Analysis issues
 *   dsp:base-of-truth — BaseOfTruth issues
 */

import { parseBody } from '../api/github-client.js';

// ---------------------------------------------------------------------------
// Verdict constants
// ---------------------------------------------------------------------------

export const JUDGMENT_VERDICT_CHALLENGER  = 'challenger';   // challenger made stronger case
export const JUDGMENT_VERDICT_DEFENDER    = 'defender';     // defender held position
export const JUDGMENT_VERDICT_INCONCLUSIVE = 'inconclusive'; // judge cannot decide

// ---------------------------------------------------------------------------
// Judgment
// ---------------------------------------------------------------------------

export class Judgment {
  /**
   * @param {number}      id
   * @param {number}      duelId
   * @param {number}      judgePersonId
   * @param {string}      judgeLogin
   * @param {string}      verdict         JUDGMENT_VERDICT_*
   * @param {string}      reasoning       Human-readable reasoning text
   * @param {number|null} analysisId      The Analysis this Judgment is grounded in
   * @param {number|null} baseOfTruthClaimId  Anchor Claim id from Base of Truth
   * @param {string}      createdAt
   * @param {object}      meta
   */
  constructor(id, duelId, judgePersonId, judgeLogin, verdict, reasoning,
              analysisId, baseOfTruthClaimId, createdAt, meta) {
    this.id                  = id;
    this.duelId              = duelId;
    this.judgePersonId       = judgePersonId;
    this.judgeLogin          = judgeLogin;
    this.verdict             = verdict;
    this.reasoning           = reasoning;
    this.analysisId          = analysisId;
    this.baseOfTruthClaimId  = baseOfTruthClaimId;
    this.createdAt           = createdAt;
    this.meta                = meta;
  }

  get favoursChallenger()  { return this.verdict === JUDGMENT_VERDICT_CHALLENGER;   }
  get favoursDefender()    { return this.verdict === JUDGMENT_VERDICT_DEFENDER;     }
  get isInconclusive()     { return this.verdict === JUDGMENT_VERDICT_INCONCLUSIVE; }

  /** @param {object} issue @returns {Judgment|null} */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'judgment') return null;
    return new Judgment(
      issue.number,
      meta.duelId,
      meta.judgePersonId,
      issue.user?.login ?? '',
      meta.verdict,
      _extractContent(issue.body),
      meta.analysisId    ?? null,
      meta.baseOfTruthClaimId ?? null,
      issue.created_at,
      meta
    );
  }
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export class Analysis {
  /**
   * @param {number}   id
   * @param {number}   duelId
   * @param {number}   authorPersonId
   * @param {string}   authorLogin
   * @param {object[]} momentRefs   [{ momentId?, note }]
   * @param {string}   summary      Human-readable analysis text
   * @param {string}   createdAt
   * @param {object}   meta
   */
  constructor(id, duelId, authorPersonId, authorLogin, momentRefs, summary, createdAt, meta) {
    this.id             = id;
    this.duelId         = duelId;
    this.authorPersonId = authorPersonId;
    this.authorLogin    = authorLogin;
    this.momentRefs     = momentRefs ?? [];
    this.summary        = summary;
    this.createdAt      = createdAt;
    this.meta           = meta;
  }

  /** @param {object} issue @returns {Analysis|null} */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'analysis') return null;
    return new Analysis(
      issue.number,
      meta.duelId,
      meta.authorPersonId,
      issue.user?.login ?? '',
      meta.momentRefs ?? [],
      _extractContent(issue.body),
      issue.created_at,
      meta
    );
  }
}

// ---------------------------------------------------------------------------
// BaseOfTruth
// ---------------------------------------------------------------------------

export class BaseOfTruth {
  /**
   * A Person's declared epistemic anchor.
   * @param {number}      personId
   * @param {number|null} anchorClaimId   Issue number of the anchor Claim (null = not set)
   * @param {string}      declarationText Free-text declaration of epistemology
   * @param {string}      personLogin
   */
  constructor(personId, anchorClaimId, declarationText, personLogin = '') {
    this.personId        = personId;
    this.anchorClaimId   = anchorClaimId;
    this.declarationText = declarationText;
    this.personLogin     = personLogin;
  }

  get isDeclared() { return !!(this.declarationText || this.anchorClaimId !== null); }

  /** @param {object} issue @returns {BaseOfTruth|null} */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'base-of-truth') return null;
    return new BaseOfTruth(
      meta.personId,
      meta.anchorClaimId ?? null,
      _extractContent(issue.body),
      issue.user?.login ?? ''
    );
  }
}

// ---------------------------------------------------------------------------

function _extractContent(body) {
  if (!body) return '';
  const idx = body.indexOf('-->');
  if (idx === -1) return body.trim();
  return body.slice(idx + 3).trim();
}
