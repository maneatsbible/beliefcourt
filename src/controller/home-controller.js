/**
 * Controller: Home Feed
 *
 * Responsible for loading the Assertions feed, composing new Assertions,
 * and all US1 / US2 / US5 permission gates that operate at the feed level.
 */

import * as gh       from '../api/github-client.js';
import * as cache    from '../api/cache.js';
import { Post, Assertion, POST_TYPE_ASSERTION } from '../model/post.js';

const PER_PAGE = 30;

export class HomeController {
  /**
   * @param {{ config: object, token: string|null, currentUser: object|null }} opts
   *   config      — parsed CONFIG object
   *   token       — GitHub access token or null
   *   currentUser — { login, id } or null
   */
  constructor({ config, token, currentUser }) {
    this._config      = config;
    this._token       = token;
    this._currentUser = currentUser;
    this._dataRepo    = config.dataRepo;
  }

  // ---------------------------------------------------------------------------
  // Feed loading
  // ---------------------------------------------------------------------------

  /**
   * Load a page of Assertions from the data repo.
   * Returns only Issues whose DSP:META type is "assertion" (excludes offers).
   *
   * @param {number} [page=1]
   * @returns {Promise<Assertion[]>}
   */
  async loadFeed(page = 1) {
    const url =
      `${gh.issuesUrl(this._dataRepo)}` +
      `?labels=dsp%3Aassertion&state=open&per_page=${PER_PAGE}&page=${page}` +
      `&sort=created&direction=desc`;

    const issues = await gh.get(url, this._token);
    return issues
      .map(i => Post.fromIssue(i))
      .filter(p => p instanceof Assertion && !p.isOffer);
  }

  // ---------------------------------------------------------------------------
  // Compose — permission gates
  // ---------------------------------------------------------------------------

  /**
   * Can the given person compose a new top-level Assertion?
   * @param {{ id: number, login: string }|null} person
   * @returns {{ allowed: boolean, reason: string }}
   */
  canCompose(person) {
    if (!person) {
      return { allowed: false, reason: 'Sign in to start an Assertion.' };
    }
    return { allowed: true, reason: '' };
  }

  /**
   * Can the given person use the @herald option to import external content?
   * Any authenticated user may plant a herald claim.
   *
   * @param {{ id: number, login: string }|null} person
   * @returns {{ allowed: boolean, reason: string }}
   */
  canPostAsHerald(person) {
    if (!person) {
      return { allowed: false, reason: 'Sign in to use the @herald option.' };
    }
    return { allowed: true, reason: '' };
  }

  // ---------------------------------------------------------------------------
  // Compose — Assertions
  // ---------------------------------------------------------------------------

  /**
   * Submit a new top-level Assertion.
   *
   * @param {{ id: number, login: string }} person
   * @param {string}      text       Assertion text
   * @param {string|null} imageUrl   Optional image URL
   * @param {boolean}     asHerald Post on behalf of @herald placeholder
   * @returns {Promise<object>}  Created GitHub Issue object
   */
  async submitAssertion(person, text, imageUrl = null, asHerald = false) {
    const { allowed } = this.canCompose(person);
    if (!allowed) throw new Error('Permission denied.');

    // Build DSP:META
    const meta = {
      type:               POST_TYPE_ASSERTION,
      version:            1,
      appId:              gh.APP_ID,
      parentId:           null,
      rootId:             null,   // will be self-referential — updated after creation
      isOffer:            false,
      offeredInDisputeId: null,
      proxyAuthor:        asHerald ? `@${this._config.heraldLogin}` : null,
    };

    const content = imageUrl
      ? `![assertion image](${imageUrl})`
      : text;

    const title = (text || 'Assertion').slice(0, 80);

    const created = await gh.post(gh.issuesUrl(this._dataRepo), {
      title,
      body:   await gh.buildBodyWithHash(meta, content),
      labels: ['dsp:assertion'],
    }, this._token);

    // Patch rootId to self-reference once we have the issue number.
    const patchedMeta = { ...meta, rootId: created.number };
    await gh.patch(gh.issueUrl(this._dataRepo, created.number), {
      body: await gh.buildBodyWithHash(patchedMeta, content),
    }, this._token);

    // Invalidate feed cache so next load picks up the new post.
    cache.invalidatePattern(gh.issuesUrl(this._dataRepo));

    // When posting as @herald, automatically create a challenge+dispute so the
    // current user is immediately disputing their own planted herald claim.
    if (asHerald) {
      const assertionPost = {
        id:         created.number,
        authorId:   person.id,
        authorLogin: person.login,
        meta:       { ...patchedMeta, rootId: created.number },
      };
      await this.submitChallenge(person, assertionPost, {
        challengeType: 'objection',
        text:          `I challenge this position: ${text.slice(0, 120)}`,
      });
    }

    return { ...created, number: created.number };
  }

  // ---------------------------------------------------------------------------
  // US2: Challenge gate
  // ---------------------------------------------------------------------------

  /**
   * Can the person challenge this post?
   *
   * Rules:
   *  - Must be signed in.
   *  - Must not be the author.
   *  - Must not have already challenged this post.
   *  - Must not already have an Agreement on this assertion's root.
   *
   * Note: disputes list is resolved lazily by the view layer and passed in.
   *
   * @param {{ id: number, login: string }|null}  person
   * @param {import('../model/post.js').Post}      post
   * @param {{ challengerId: number, rootPostId: number }[]} existingDisputes
   * @returns {{ allowed: boolean, reason: string }}
   */
  canChallenge(person, post, existingDisputes = []) {
    if (!person) {
      return { allowed: false, reason: 'Sign in to challenge.' };
    }
    if (post.authorId === person.id) {
      return { allowed: false, reason: 'You cannot challenge your own post.' };
    }
    const alreadyChallenged = existingDisputes.some(
      d => d.challengerId === person.id && d.rootPostId === (post.meta?.rootId ?? post.id)
    );
    if (alreadyChallenged) {
      return { allowed: false, reason: 'You have already challenged this post.' };
    }
    return { allowed: true, reason: '' };
  }

  /**
   * Submit a new Challenge and create the associated Dispute.
   *
   * @param {{ id: number, login: string }} person
   * @param {import('../model/post.js').Post} post
   * @param {{ challengeType: string, text: string }} opts
   * @returns {Promise<{ challenge: object, dispute: object }>}
   */
  async submitChallenge(person, post, { challengeType, text }) {
    const challengeMeta = {
      type:          'challenge',
      version:       1,
      appId:         gh.APP_ID,
      parentId:      post.id,
      rootId:        post.meta?.rootId ?? post.id,
      disputeId:     null,   // backfilled after dispute creation
      challengeType,
    };

    const challenge = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Challenge to #${post.id}: ${text.slice(0, 60)}`,
      body:   await gh.buildBodyWithHash(challengeMeta, text),
      labels: ['dsp:challenge'],
    }, this._token);

    const disputeMeta = {
      type:               'dispute',
      version:            1,
      appId:              gh.APP_ID,
      challengerId:       person.id,
      defenderId:         post.authorId,
      rootPostId:         post.meta?.rootId ?? post.id,
      triggerChallengeId: challenge.number,
    };

    const disputeTitle =
      `Dispute: @${person.login} vs @${post.authorLogin} over #${post.meta?.rootId ?? post.id}`;

    const dispute = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  disputeTitle,
      body:   await gh.buildBodyWithHash(disputeMeta, disputeTitle),
      labels: ['dsp:dispute', 'dsp:active'],
    }, this._token);

    // Backfill disputeId into the Challenge.
    const patchedChallengeMeta = { ...challengeMeta, disputeId: dispute.number };
    await gh.patch(gh.issueUrl(this._dataRepo, challenge.number), {
      body: await gh.buildBodyWithHash(patchedChallengeMeta, text),
    }, this._token);

    cache.invalidatePattern(gh.issuesUrl(this._dataRepo));

    return { challenge, dispute };
  }

  // ---------------------------------------------------------------------------
  // US5: Agreement gate
  // ---------------------------------------------------------------------------

  /**
   * @param {{ id: number }|null}                         person
   * @param {import('../model/post.js').Assertion}         assertion
   * @param {{ personId: number, assertionId: number }[]} existingAgreements
   * @param {{ challengerId: number, rootPostId: number }[]} existingDisputes
   * @returns {{ allowed: boolean, reason: string }}
   */
  canAgree(person, assertion, existingAgreements = [], existingDisputes = []) {
    if (!person) return { allowed: false, reason: 'Sign in to agree.' };

    if (assertion.authorId === person.id) {
      return { allowed: false, reason: 'You cannot agree with your own assertion.' };
    }

    const alreadyAgreed = existingAgreements.some(
      a => a.personId === person.id && a.assertionId === assertion.id
    );
    if (alreadyAgreed) {
      return { allowed: false, reason: 'You have already agreed with this assertion.' };
    }

    const alreadyChallenged = existingDisputes.some(
      d => d.challengerId === person.id && d.rootPostId === assertion.id
    );
    if (alreadyChallenged) {
      return { allowed: false, reason: 'You cannot agree after challenging this assertion.' };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * Submit an Agreement.
   * @param {{ id: number, login: string }} person
   * @param {import('../model/post.js').Assertion} assertion
   * @returns {Promise<object>}
   */
  async submitAgreement(person, assertion) {
    const meta = {
      type:        'agreement',
      version:     1,
      appId:       gh.APP_ID,
      assertionId: assertion.id,
      personId:    person.id,
    };

    const body    = `I agree with #${assertion.id}.`;
    const created = await gh.post(gh.issuesUrl(this._dataRepo), {
      title:  `Agreement: @${person.login} agrees with #${assertion.id}`,
      body:   await gh.buildBodyWithHash(meta, body),
      labels: ['dsp:agreement'],
    }, this._token);

    cache.invalidatePattern(gh.issueUrl(this._dataRepo, assertion.id));
    return created;
  }
}
