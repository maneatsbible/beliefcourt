/**
 * Model: Rescission
 *
 * A Person's append-only public withdrawal of a Record they authored.
 * Does NOT delete the original — it annotates it with a [RESCINDED] notice.
 * The author is no longer obligated to defend the Record going forward.
 * Active Duels on a rescinded Record continue to their Disposition unchanged.
 *
 * Label: dsp:rescission
 */

import { parseBody } from '../api/github-client.js';

export class Rescission {
  /**
   * @param {number}      id
   * @param {number}      recordId       The Record being rescinded
   * @param {number}      authorPersonId Must equal the original Record's authorId
   * @param {string}      authorLogin
   * @param {string|null} reason         Stated reason (may be empty)
   * @param {string}      createdAt
   * @param {object}      meta
   */
  constructor(id, recordId, authorPersonId, authorLogin, reason, createdAt, meta) {
    this.id             = id;
    this.recordId       = recordId;
    this.authorPersonId = authorPersonId;
    this.authorLogin    = authorLogin;
    this.reason         = reason ?? '';
    this.createdAt      = createdAt;
    this.meta           = meta;
  }

  /** @param {object} issue @returns {Rescission|null} */
  static fromIssue(issue) {
    const meta = parseBody(issue.body);
    if (!meta || meta.type !== 'rescission') return null;
    return new Rescission(
      issue.number,
      meta.recordId,
      meta.authorPersonId,
      issue.user?.login ?? '',
      _extractContent(issue.body),
      issue.created_at,
      meta
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
