/**
 * Controller: Dispute
 *
 * Handles loading dispute data, post-tree navigation, and all permission
 * gates for US2 (challenge), US3 (answer / counter-challenge),
 * US4 (offers, crickets), US5 (agreement-based answering).
 */

import * as gh from '../api/github-client.js';
import * as cache from '../api/cache.js';
import { Post, Challenge, Answer, POST_TYPE_CHALLENGE, POST_TYPE_ANSWER }
  from '../model/post.js';
import { Dispute, DISPUTE_STATUS_ACTIVE } from '../model/dispute.js';
import { CricketsConditions, CricketsEvent } from '../model/agreement.js';

export class DisputeController {
  /**
   * @param {{ config: object, token: string|null, currentUser: object|null }} opts
   */
  constructor({ config, token, currentUser }) {
    this._config      = config;
    this._token       = token;
    this._currentUser = currentUser;
    this._dataRepo    = config.dataRepo;
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  /**
   * Load a single Dispute by issue number.
   * @param {number} disputeId
   * @returns {Promise<Dispute|null>}
   */
  async loadDispute(disputeId) {
    const url   = gh.issueUrl(this._dataRepo, disputeId);
    const issue = await gh.get(url, this._token);
    return Dispute.fromIssue(issue);
  }

  /**
   * Load the full post-tree rooted at `rootId`.
   * Returns all Posts sharing that rootId, sorted by createdAt ascending.
   *
   * @param {number} rootId  Root assertion issue number
   * @returns {Promise<import('../model/post.js').Post[]>}
   */
  async loadPostTree(rootId) {
    // GitHub Issues search by body content is unreliable — query by label trios
    // and filter by rootId.
    const labels   = ['dsp:assertion', 'dsp:challenge', 'dsp:answer'];
    const allPosts = [];

    for (const label of labels) {
      const url = `${gh.issuesUrl(this._dataRepo)}?labels=${encodeURIComponent(label)}&state=open&per_page=100`;
      const issues = await gh.get(url, this._token);
      for (const iss of issues) {
        const post = Post.fromIssue(iss);
        if (post && (post.meta?.rootId === rootId || post.id === rootId)) {
          allPosts.push(post);
        }
      }
    }

    allPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return allPosts;
  }

  /**
   * Load the active CricketsConditions for a dispute (latest Issue wins).
   * @param {number} disputeId
   * @returns {Promise<CricketsConditions|null>}
   */
  async loadCricketsConditions(disputeId) {
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=dsp%3Acrickets-conditions&state=open&per_page=100`;
    const issues = await gh.get(url, this._token);
    const matched = issues
      .map(i => CricketsConditions.fromIssue(i))
      .filter(c => c && c.disputeId === disputeId && c.isAgreed)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return matched[0] ?? null;
  }

  /**
   * Load the CricketsEvent for a dispute (if any).
   * @param {number} disputeId
   * @returns {Promise<CricketsEvent|null>}
   */
  async loadCricketsEvent(disputeId) {
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=dsp%3Acrickets-event&state=open&per_page=100`;
    const issues = await gh.get(url, this._token);
    const matched = issues
      .map(i => CricketsEvent.fromIssue(i))
      .filter(e => e && e.disputeId === disputeId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return matched[0] ?? null;
  }

  // ---------------------------------------------------------------------------
  // US2: Challenge within an existing dispute
  // ---------------------------------------------------------------------------

  /**
   * Can the person add a further challenge within an active dispute?
   * Only the original challenger may add more challenges; cannot challenge own posts.
   */
  canChallenge(person, post, dispute, postTree) {
    if (!person) return { allowed: false, reason: 'Sign in to challenge.' };
    if (dispute.status !== DISPUTE_STATUS_ACTIVE) {
      return { allowed: false, reason: 'Dispute is not active.' };
    }
    if (person.id !== dispute.challengerId) {
      return { allowed: false, reason: 'Only the original challenger can add challenges.' };
    }
    if (post.authorId === person.id) {
      return { allowed: false, reason: 'Cannot challenge your own post.' };
    }
    const alreadyChallenged = postTree.some(
      p => p.type === POST_TYPE_CHALLENGE && p.meta?.parentId === post.id
    );
    if (alreadyChallenged) {
      return { allowed: false, reason: 'Post already challenged.' };
    }
    return { allowed: true, reason: '' };
  }

  /**
   * Submit a challenge within an existing dispute (no new Dispute issue created).
   */
  async submitChallenge(person, post, dispute, { challengeType, text }) {
    const meta = {
      type:          'challenge',
      version:       1,
      appId:         gh.APP_ID,
      parentId:      post.id,
      rootId:        post.meta?.rootId ?? post.id,
      disputeId:     dispute.id,
      challengeType,
    };
    const challenge = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Challenge to #${post.id} in dispute #${dispute.id}: ${text.slice(0, 60)}`,
      body:   gh.buildBody(meta, text),
      labels: ['dsp:challenge'],
    }, this._token);
    cache.invalidatePattern(gh.issueUrl(this._dataRepo, dispute.rootPostId));
    cache.invalidatePattern(gh.issueUrl(this._dataRepo, dispute.id));
    return challenge;
  }

  // ---------------------------------------------------------------------------
  // US3: Answer permission + submission
  // ---------------------------------------------------------------------------

  /**
   * Can the person answer this challenge?
   *
   * @param {{ id: number }|null}                    person
   * @param {Challenge}                              challenge
   * @param {Dispute}                                dispute
   * @param {import('../model/post.js').Post[]}       postTree
   * @param {{ personId: number, assertionId: number }[]} agreements
   * @returns {{ allowed: boolean, reason: string }}
   */
  canAnswer(person, challenge, dispute, postTree, agreements = []) {
    if (!person) return { allowed: false, reason: 'Sign in to answer.' };
    if (challenge.type !== 'challenge') {
      return { allowed: false, reason: 'Not a challenge.' };
    }
    if (dispute.status !== DISPUTE_STATUS_ACTIVE) {
      return { allowed: false, reason: 'Dispute is not active.' };
    }

    // Person must be the defender OR have an agreement on the root assertion.
    const isDefender = dispute.defenderId === person.id;
    const hasAgreement = agreements.some(
      a => a.personId === person.id && a.assertionId === dispute.rootPostId
    );
    if (!isDefender && !hasAgreement) {
      return { allowed: false, reason: 'You are not the defender.' };
    }

    // Challenge must not already have an answer.
    const alreadyAnswered = postTree.some(
      p => p.type === POST_TYPE_ANSWER && p.meta?.parentId === challenge.id
    );
    if (alreadyAnswered) {
      return { allowed: false, reason: 'This challenge has already been answered.' };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * Submit an Answer (and optional counter-challenge).
   *
   * @param {{ id: number, login: string }} person
   * @param {Challenge}   challenge
   * @param {Dispute}     dispute
   * @param {{ yesNo: boolean|null, text: string, counterChallenge: object|null }} opts
   * @returns {Promise<{ answer: object, counterChallenge: object|null }>}
   */
  async submitAnswer(person, challenge, dispute, { yesNo, text, counterChallenge }) {
    const answerMeta = {
      type:               POST_TYPE_ANSWER,
      version:            1,
      appId:              gh.APP_ID,
      parentId:           challenge.id,
      rootId:             challenge.rootId,
      disputeId:          dispute.id,
      yesNo:              yesNo,
      counterChallengeId: null,
    };

    const answer = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Answer to #${challenge.id} in dispute #${dispute.id}`,
      body:   gh.buildBody(answerMeta, text ?? ''),
      labels: ['dsp:answer'],
    }, this._token);

    let ccIssue = null;
    if (counterChallenge) {
      const ccMeta = {
        type:          POST_TYPE_CHALLENGE,
        version:       1,
        appId:         gh.APP_ID,
        parentId:      answer.number,
        rootId:        challenge.rootId,
        disputeId:     dispute.id,
        challengeType: counterChallenge.challengeType ?? 'interrogatory',
      };
      ccIssue = await gh.post(gh.issuesUrl(this._dataRepo), {
        title:  `Counter-challenge in dispute #${dispute.id}`,
        body:   gh.buildBody(ccMeta, counterChallenge.text),
        labels: ['dsp:challenge'],
      }, this._token);

      // Backfill counterChallengeId into the Answer.
      const patchedMeta = { ...answerMeta, counterChallengeId: ccIssue.number };
      await gh.patch(gh.issueUrl(this._dataRepo, answer.number), {
        body: gh.buildBody(patchedMeta, text ?? ''),
      }, this._token);
    }

    cache.invalidatePattern(gh.issueUrl(this._dataRepo, dispute.rootPostId));
    cache.invalidatePattern(gh.issueUrl(this._dataRepo, dispute.id));
    return { answer, counterChallenge: ccIssue };
  }

  /**
   * Can the person add a counter-challenge to their answer?
   * @param {{ id: number }|null} person
   * @param {Answer}              answer
   * @returns {{ allowed: boolean, reason: string }}
   */
  canCounterChallenge(person, answer) {
    if (!person) return { allowed: false, reason: 'Sign in.' };
    if (answer.authorId !== person.id) {
      return { allowed: false, reason: 'Only the answerer can add a counter-challenge.' };
    }
    if (answer.counterChallengeId) {
      return { allowed: false, reason: 'Counter-challenge already exists.' };
    }
    return { allowed: true, reason: '' };
  }

  // ---------------------------------------------------------------------------
  // US4 — Offers
  // ---------------------------------------------------------------------------

  /**
   * @param {{ id: number }|null} person
   * @param {Dispute}             dispute
   * @returns {{ allowed: boolean, reason: string }}
   */
  canOffer(person, dispute) {
    if (!person) return { allowed: false, reason: 'Sign in to make an offer.' };
    if (dispute.status !== DISPUTE_STATUS_ACTIVE) {
      return { allowed: false, reason: 'Dispute is already resolved.' };
    }
    const isParty = person.id === dispute.challengerId || person.id === dispute.defenderId;
    if (!isParty) return { allowed: false, reason: 'Only dispute parties can make offers.' };
    return { allowed: true, reason: '' };
  }

  /**
   * Submit a resolution offer (written as a special Assertion with isOffer=true).
   * @param {{ id: number, login: string }} person
   * @param {Dispute}                       dispute
   * @param {{ text: string, imageUrl: string|null }} opts
   * @returns {Promise<object>}
   */
  async submitOffer(person, dispute, { text, imageUrl = null }) {
    const meta = {
      type:               'assertion',
      version:            1,
      appId:              gh.APP_ID,
      parentId:           dispute.rootPostId,
      rootId:             dispute.rootPostId,
      isOffer:            true,
      offeredInDisputeId: dispute.id,
      proxyAuthor:        null,
    };

    const content = imageUrl ? `![offer image](${imageUrl})` : text;
    const offer   = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Offer in dispute #${dispute.id}: ${text.slice(0, 60)}`,
      body:   gh.buildBody(meta, content),
      labels: ['dsp:assertion', 'dsp:offer'],
    }, this._token);

    cache.invalidatePattern(gh.issueUrl(this._dataRepo, dispute.id));
    return offer;
  }

  /**
   * @param {{ id: number }|null}                            person
   * @param {import('../model/post.js').Assertion}            offer
   * @param {Dispute}                                         dispute
   * @returns {{ allowed: boolean, reason: string }}
   */
  canAcceptOffer(person, offer, dispute) {
    if (!person) return { allowed: false, reason: 'Sign in.' };
    if (!offer.isOffer) return { allowed: false, reason: 'Not an offer.' };
    // The OTHER party must accept (not the one who made the offer).
    if (offer.authorId === person.id) {
      return { allowed: false, reason: 'You cannot accept your own offer.' };
    }
    const isParty = person.id === dispute.challengerId || person.id === dispute.defenderId;
    if (!isParty) return { allowed: false, reason: 'Only dispute parties can accept.' };
    return { allowed: true, reason: '' };
  }

  /**
   * Accept an offer → resolve the Dispute by patching its labels.
   * @param {{ id: number }} person
   * @param {Dispute}         dispute
   * @returns {Promise<void>}
   */
  async acceptOffer(person, dispute) {
    await gh.patch(gh.issueUrl(this._dataRepo, dispute.id), {
      labels: ['dsp:dispute', 'dsp:resolved'],
    }, this._token);

    cache.invalidate(gh.issueUrl(this._dataRepo, dispute.id));
  }

  // ---------------------------------------------------------------------------
  // US4 — Crickets
  // ---------------------------------------------------------------------------

  /**
   * @param {{ id: number }|null} person
   * @param {Dispute}             dispute
   * @returns {{ allowed: boolean, reason: string }}
   */
  canProposeCrickets(person, dispute) {
    if (!person) return { allowed: false, reason: 'Sign in.' };
    if (dispute.status !== DISPUTE_STATUS_ACTIVE) {
      return { allowed: false, reason: 'Dispute is not active.' };
    }
    const isParty = person.id === dispute.challengerId || person.id === dispute.defenderId;
    if (!isParty) return { allowed: false, reason: 'Only dispute parties can propose crickets.' };
    return { allowed: true, reason: '' };
  }

  /**
   * Write a CricketsConditions proposal Issue.
   * @param {{ id: number }}  person
   * @param {Dispute}          dispute
   * @param {number}           durationMs
   * @returns {Promise<object>}
   */
  async submitCricketsProposal(person, dispute, durationMs) {
    const meta = {
      type:               'crickets-conditions',
      version:            1,
      appId:              gh.APP_ID,
      disputeId:          dispute.id,
      proposedByPersonId: person.id,
      agreedByPersonId:   null,
      durationMs,
      currentDeadlineIso: null,
    };

    const body = `Crickets conditions proposed: ${_humanDuration(durationMs)} per challenge. Dispute #${dispute.id}.`;
    return gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Crickets proposal for dispute #${dispute.id}`,
      body:   gh.buildBody(meta, body),
      labels: ['dsp:crickets-conditions'],
    }, this._token);
  }

  /**
   * Can the app declare crickets for this dispute?
   *
   * @param {Dispute}                 dispute
   * @param {CricketsConditions|null} conditions
   * @param {CricketsEvent|null}      existingEvent
   * @returns {boolean}
   */
  canDeclareCrickets(dispute, conditions, existingEvent) {
    if (dispute.status !== DISPUTE_STATUS_ACTIVE) return false;
    if (!conditions || !conditions.isAgreed || !conditions.currentDeadlineIso) return false;
    if (existingEvent) return false;
    return Date.now() > new Date(conditions.currentDeadlineIso).getTime();
  }

  /**
   * Write a CricketsEvent Issue.
   * De-duplication is provided by the append-only nature: the first-created
   * event for a disputeId/challengeId pair is canonical.
   *
   * @param {{ id: number }}  person
   * @param {Dispute}          dispute
   * @param {Challenge}        challenge  The unanswered challenge
   * @returns {Promise<object>}
   */
  async triggerCricketsEvent(person, dispute, challenge) {
    const nowIso = new Date().toISOString();
    const meta   = {
      type:                 'crickets-event',
      version:              1,
      appId:                gh.APP_ID,
      disputeId:            dispute.id,
      challengeId:          challenge.id,
      triggeredByPersonId:  person.id,
      detectedAtIso:        nowIso,
    };

    const body = `🦗 Crickets! @${this._currentUser?.login ?? 'someone'} failed to answer challenge #${challenge.id} in Dispute #${dispute.id}.`;

    const event = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Crickets in dispute #${dispute.id}`,
      body:   gh.buildBody(meta, body),
      labels: ['dsp:crickets-event'],
    }, this._token);

    // Add dsp:crickets-event label to the Dispute issue.
    const currentLabels = dispute.labelNames ?? ['dsp:dispute', 'dsp:active'];
    const newLabels = [...new Set([...currentLabels, 'dsp:crickets-event'])];
    await gh.patch(gh.issueUrl(this._dataRepo, dispute.id), {
      labels: newLabels,
    }, this._token);

    cache.invalidate(gh.issueUrl(this._dataRepo, dispute.id));
    return event;
  }

  /**
   * @param {{ id: number }|null} person
   * @param {CricketsEvent}        event
   * @returns {{ allowed: boolean, reason: string }}
   */
  canDisputeCrickets(person, event) {
    if (!person) return { allowed: false, reason: 'Sign in.' };
    // The party who was supposed to answer can dispute the crickets ruling.
    return { allowed: true, reason: '' };
  }

  /**
   * Create a new Dispute seeded on a CricketsEvent (to contest the ruling).
   * Writes a new dispute Issue referencing the original dispute.
   *
   * @param {{ id: number, login: string }} person
   * @param {Dispute}                        originalDispute
   * @param {CricketsEvent}                  cricketsEvent
   * @returns {Promise<object>}
   */
  async disputeCricketsEvent(person, originalDispute, cricketsEvent) {
    const meta = {
      type:               'dispute',
      version:            1,
      appId:              gh.APP_ID,
      challengerId:       person.id,
      defenderId:         cricketsEvent.triggeredByPersonId,
      rootPostId:         originalDispute.rootPostId,
      triggerChallengeId: cricketsEvent.id,
    };

    const title = `Dispute of crickets ruling in #${originalDispute.id}`;
    return gh.post(gh.issuesUrl(this._dataRepo), {
      title,
      body:   gh.buildBody(meta, title),
      labels: ['dsp:dispute', 'dsp:active'],
    }, this._token);
  }

  // ---------------------------------------------------------------------------
  // US6 — Notifications
  // ---------------------------------------------------------------------------

  /**
   * Load all active Disputes where currentUser is the defender.
   * Used to generate pending-challenge notifications.
   *
   * @returns {Promise<Dispute[]>}
   */
  async loadPendingDisputes() {
    if (!this._currentUser) return [];
    const url = `${gh.issuesUrl(this._dataRepo)}?labels=dsp%3Adispute%2Cdsp%3Aactive&state=open&per_page=100`;
    const issues = await gh.get(url, this._token);
    return issues
      .map(i => Dispute.fromIssue(i))
      .filter(d => d && d.defenderId === this._currentUser.id);
  }
}

// ---------------------------------------------------------------------------

function _humanDuration(ms) {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}
