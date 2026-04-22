/**
 * Unit tests: Model classes
 * Person, Post hierarchy, Case, Agreement, CricketsConditions, CricketsEvent
 */

import { describe, it, expect } from '../../runner.js';
import { APP_ID } from '../../../src/api/github-client.js';
import { Person } from '../../../src/model/person.js';
import {
  Post, Assertion, Challenge, Answer,
  POST_TYPE_ASSERTION, POST_TYPE_CHALLENGE, POST_TYPE_ANSWER,
} from '../../../src/model/post.js';
import { Case, CASE_STATUS_ACTIVE, CASE_STATUS_RESOLVED, CASE_STATUS_CRICKETS }
  from '../../../src/model/case.js';
import { Agreement, CricketsConditions, CricketsEvent }
  from '../../../src/model/agreement.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeIssue(number, type, meta, extraMeta = {}) {
  const fullMeta = { type, version: 'v0.0.1-pre-alpha', appId: APP_ID, ...meta, ...extraMeta };
  const body = `<!-- DSP:META\n${JSON.stringify(fullMeta)}\n-->\n\nTest content`;
  return {
    number,
    user:        { login: 'alice', id: 1001 },
    body,
    created_at:  '2026-04-18T12:00:00Z',
    labels:      [],
  };
}

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

describe('Person', () => {
  it('constructs with id/login/profilePicUrl', () => {
    const p = new Person(1001, 'alice', 'https://example.com/avatar.jpg');
    expect(p.id).toBe(1001);
    expect(p.login).toBe('alice');
    expect(p.profilePicUrl).toBe('https://example.com/avatar.jpg');
  });

  it('fromGitHubUser factory maps correctly', () => {
    const ghUser = { id: 42, login: 'bob', avatar_url: 'https://img.example.com/b' };
    const p = Person.fromGitHubUser(ghUser);
    expect(p.id).toBe(42);
    expect(p.login).toBe('bob');
    expect(p.profilePicUrl).toBe('https://img.example.com/b');
  });

  it('isHerald returns true for matching login (case-insensitive)', () => {
    const p = new Person(99, 'HERALD', '');
    expect(p.isHerald('herald')).toBe(true);
    expect(p.isHerald('Herald')).toBe(true);
    expect(p.isHerald('alice')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Post & subclasses
// ---------------------------------------------------------------------------

describe('Post.fromIssue', () => {
  it('returns null for an issue without DSP:META', () => {
    const issue = { number: 1, user: { login: 'a', id: 1 }, body: 'no meta', created_at: '', labels: [] };
    expect(Post.fromIssue(issue)).toBeNull();
  });

  it('creates Assertion from assertion-typed issue', () => {
    const issue = makeIssue(10, POST_TYPE_ASSERTION, { parentId: null, rootId: 10, isOffer: false, offeredInDisputeId: null, proxyAuthor: null });
    const post  = Post.fromIssue(issue);
    expect(post instanceof Assertion).toBe(true);
    expect(post.id).toBe(10);
    expect(post.isOffer).toBe(false);
    expect(post.rootId).toBe(10);
  });

  it('creates Challenge from challenge-typed issue', () => {
    const issue = makeIssue(20, POST_TYPE_CHALLENGE, { parentId: 10, rootId: 10, disputeId: 5, challengeType: 'interrogatory' });
    const post  = Post.fromIssue(issue);
    expect(post instanceof Challenge).toBe(true);
    expect(post.disputeId).toBe(5);
    expect(post.challengeType).toBe('interrogatory');
  });

  it('creates Answer from answer-typed issue', () => {
    const issue = makeIssue(30, POST_TYPE_ANSWER, { parentId: 20, rootId: 10, disputeId: 5, yesNo: true, counterChallengeId: null });
    const post  = Post.fromIssue(issue);
    expect(post instanceof Answer).toBe(true);
    expect(post.yesNo).toBe(true);
    expect(post.counterChallengeId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Case
// ---------------------------------------------------------------------------

describe('Case.fromIssue', () => {
  it('derives active status from dsp:active label', () => {
    const issue = makeIssue(1, 'dispute', {
      challengerId: 10, defenderId: 20, rootPostId: 5, triggerChallengeId: 8,
    });
    issue.labels = [{ name: 'dsp:dispute' }, { name: 'dsp:active' }];
    const c = Case.fromIssue(issue);
    expect(c.status).toBe(CASE_STATUS_ACTIVE);
    expect(d.isActive).toBe(true);
  });

  it('derives resolved status from dsp:resolved label', () => {
    const issue = makeIssue(2, 'dispute', {
      challengerId: 10, defenderId: 20, rootPostId: 5, triggerChallengeId: 8,
    });
    issue.labels = [{ name: 'dsp:dispute' }, { name: 'dsp:resolved' }];
    const c = Case.fromIssue(issue);
    expect(c.status).toBe(CASE_STATUS_RESOLVED);
    expect(d.isResolved).toBe(true);
  });

  it('derives crickets status from dsp:crickets-event label', () => {
    const issue = makeIssue(3, 'dispute', {
      challengerId: 10, defenderId: 20, rootPostId: 5, triggerChallengeId: 8,
    });
    issue.labels = [{ name: 'dsp:dispute' }, { name: 'dsp:active' }, { name: 'dsp:crickets-event' }];
    const c = Case.fromIssue(issue);
    expect(c.status).toBe(CASE_STATUS_CRICKETS);
    expect(d.isCrickets).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Agreement
// ---------------------------------------------------------------------------

describe('Agreement.fromIssue', () => {
  it('parses an agreement issue', () => {
    const issue = makeIssue(50, 'agreement', { assertionId: 10, personId: 1001 });
    const a = Agreement.fromIssue(issue, 'alice');
    expect(a.assertionId).toBe(10);
    expect(a.personId).toBe(1001);
    expect(a.login).toBe('alice');
  });
});

// ---------------------------------------------------------------------------
// CricketsConditions
// ---------------------------------------------------------------------------

describe('CricketsConditions.fromIssue', () => {
  it('parses proposed-but-unagreed conditions', () => {
    const issue = makeIssue(60, 'crickets-conditions', {
      disputeId: 1, proposedByPersonId: 10, agreedByPersonId: null,
      durationMs: 86400000, currentDeadlineIso: null,
    });
    const cc = CricketsConditions.fromIssue(issue);
    expect(cc.isAgreed).toBe(false);
    expect(cc.durationMs).toBe(86400000);
  });

  it('isAgreed=true when agreedByPersonId is set', () => {
    const issue = makeIssue(61, 'crickets-conditions', {
      disputeId: 1, proposedByPersonId: 10, agreedByPersonId: 20,
      durationMs: 3600000, currentDeadlineIso: '2026-04-20T12:00:00Z',
    });
    const cc = CricketsConditions.fromIssue(issue);
    expect(cc.isAgreed).toBe(true);
    expect(cc.currentDeadlineIso).toBe('2026-04-20T12:00:00Z');
  });
});

// ---------------------------------------------------------------------------
// CricketsEvent
// ---------------------------------------------------------------------------

describe('CricketsEvent.fromIssue', () => {
  it('parses a crickets event', () => {
    const issue = makeIssue(70, 'crickets-event', {
      disputeId: 1, challengeId: 20, triggeredByPersonId: 10,
      detectedAtIso: '2026-04-20T12:01:00Z',
    });
    const ev = CricketsEvent.fromIssue(issue);
    expect(ev.disputeId).toBe(1);
    expect(ev.challengeId).toBe(20);
    expect(ev.detectedAtIso).toBe('2026-04-20T12:01:00Z');
  });
});
