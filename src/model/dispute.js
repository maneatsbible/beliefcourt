/**
 * Model: Dispute
 *
 * Represents a dispute between two GitHub users over an Assertion.
 * Status is derived from the issue's label set (append-only storage).
 */

import { parseBody } from '../api/github-client.js';
import { DUEL_CONTEXT_STANDARD } from './duel-context.js';

export const DISPUTE_STATUS_ACTIVE    = 'active';
export const DISPUTE_STATUS_RESOLVED  = 'resolved';
export const DISPUTE_STATUS_CRICKETS  = 'crickets';
export const DISPUTE_STATUS_DEFENDED  = 'defended';
export const DISPUTE_STATUS_CONTESTED = 'contested';

export class Dispute {
  /**
   * @param {number}   id                GitHub issue number
   * @param {number}   challengerId       GitHub user id
   * @param {string}   challengerLogin    GitHub login
   * @param {number}   defenderId         GitHub user id
   * @param {string}   defenderLogin      GitHub login
   * @param {number}   rootPostId         Assertion issue number at root of tree
   * @param {number}   triggerChallengeId First challenge that created this dispute
   * @param {string}   status             DISPUTE_STATUS_*
   * @param {string}   createdAt          ISO 8601 string
   * @param {object}   meta               Parsed DSP:META object
   * @param {string[]} labelNames         Current label names on the issue
   * @param {string}   context            Duel context (DUEL_CONTEXT_*)
   */
  constructor(
    id,
    challengerId,  challengerLogin,
    defenderId,    defenderLogin,
    rootPostId,    triggerChallengeId,
    status,        createdAt,
    meta,          labelNames = [],
    context        = DUEL_CONTEXT_STANDARD
  ) {
    this.id                  = id;
    this.challengerId        = challengerId;
    this.challengerLogin     = challengerLogin;
    this.defenderId          = defenderId;
    this.defenderLogin       = defenderLogin;
    this.rootPostId          = rootPostId;
    this.triggerChallengeId  = triggerChallengeId;
    this.status              = status;
    this.createdAt           = createdAt;
    this.meta                = meta;
    this.labelNames          = labelNames;
    this.context             = context ?? DUEL_CONTEXT_STANDARD;
  }

  /** True when this dispute is still open. */
  get isActive()    { return this.status === DISPUTE_STATUS_ACTIVE;    }
  get isResolved()  { return this.status === DISPUTE_STATUS_RESOLVED;  }
  get isCrickets()  { return this.status === DISPUTE_STATUS_CRICKETS;  }
  /** Assertion stood — challenger's position failed / was conceded. */
  get isDefended()  { return this.status === DISPUTE_STATUS_DEFENDED;  }
  /** Verdict is itself under challenge — judgment contested. */
  get isContested() { return this.status === DISPUTE_STATUS_CONTESTED; }

  /**
   * Factory: create from a GitHub Issue response object.
   * Requires issue.labels to be the full label objects array.
   *
   * @param {object} issue
   * @param {{ login: string }|null} challengerUser  resolved user (or null)
   * @param {{ login: string }|null} defenderUser    resolved user (or null)
   * @returns {Dispute|null}
   */
  static fromIssue(issue, challengerUser = null, defenderUser = null) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'dispute') return null;

    const labelNames = (issue.labels ?? []).map(l =>
      typeof l === 'string' ? l : l.name
    );

    const status = _deriveStatus(labelNames);

    return new Dispute(
      issue.number,
      meta.challengerId,
      challengerUser?.login ?? `#${meta.challengerId}`,
      meta.defenderId,
      defenderUser?.login   ?? `#${meta.defenderId}`,
      meta.rootPostId,
      meta.triggerChallengeId,
      status,
      issue.created_at,
      meta,
      labelNames,
      meta.context ?? DUEL_CONTEXT_STANDARD
    );
  }
}

// ---------------------------------------------------------------------------

function _deriveStatus(labelNames) {
  if (labelNames.includes('dsp:verdict-contested')) return DISPUTE_STATUS_CONTESTED;
  if (labelNames.includes('dsp:verdict-defended'))  return DISPUTE_STATUS_DEFENDED;
  if (labelNames.includes('dsp:crickets-event'))    return DISPUTE_STATUS_CRICKETS;
  if (labelNames.includes('dsp:resolved'))          return DISPUTE_STATUS_RESOLVED;
  return DISPUTE_STATUS_ACTIVE;
}
