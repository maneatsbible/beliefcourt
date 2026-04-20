/**
 * Unit tests: HomeController permission gates
 */

import { describe, it, expect, beforeEach } from '../../runner.js';
import { HomeController } from '../../../src/controller/home-controller.js';

// Minimal stub config
const CONFIG = {
  githubClientId: 'test-client-id',
  dataRepo:       'owner/repo',
  heraldLogin:   'herald',
  appVersion:     '1.0.0-test',
};

let ctrl;

describe('HomeController', () => {
  beforeEach(() => {
    ctrl = new HomeController({ config: CONFIG, token: null, currentUser: null });
  });

  // ── canCompose ──────────────────────────────────────────────────────────────

  describe('canCompose', () => {
    it('returns allowed=false when no person (not signed in)', () => {
      const r = ctrl.canCompose(null);
      expect(r.allowed).toBe(false);
    });

    it('returns allowed=true for an authenticated person', () => {
      const r = ctrl.canCompose({ id: 1, login: 'alice' });
      expect(r.allowed).toBe(true);
    });
  });

  // ── canPostAsHerald ────────────────────────────────────────────────────────────

  describe('canPostAsHerald', () => {
    it('returns allowed=false for unauthenticated person', () => {
      expect(ctrl.canPostAsHerald(null).allowed).toBe(false);
    });

    it('returns allowed=true for any authenticated user', () => {
      expect(ctrl.canPostAsHerald({ id: 2, login: 'alice' }).allowed).toBe(true);
    });

    it('returns allowed=true for the configured herald login (case-insensitive)', () => {
      expect(ctrl.canPostAsHerald({ id: 99, login: 'HERALD' }).allowed).toBe(true);
    });
  });

  // ── canChallenge ────────────────────────────────────────────────────────────

  describe('canChallenge', () => {
    const post = { id: 10, authorId: 5, authorLogin: 'bob', meta: { rootId: 10 } };

    it('denies when person is null', () => {
      expect(ctrl.canChallenge(null, post).allowed).toBe(false);
    });

    it('denies when person is the author', () => {
      expect(ctrl.canChallenge({ id: 5, login: 'bob' }, post).allowed).toBe(false);
    });

    it('allows a different person with no existing disputes', () => {
      expect(ctrl.canChallenge({ id: 7, login: 'alice' }, post).allowed).toBe(true);
    });

    it('denies when person already challenged the root', () => {
      const disputes = [{ challengerId: 7, rootPostId: 10 }];
      expect(ctrl.canChallenge({ id: 7, login: 'alice' }, post, disputes).allowed).toBe(false);
    });
  });

  // ── canAgree ────────────────────────────────────────────────────────────────

  describe('canAgree', () => {
    const assertion = { id: 10, authorId: 5, meta: {} };

    it('denies unauthenticated', () => {
      expect(ctrl.canAgree(null, assertion).allowed).toBe(false);
    });

    it('denies the author agreeing with their own assertion', () => {
      expect(ctrl.canAgree({ id: 5, login: 'bob' }, assertion).allowed).toBe(false);
    });

    it('allows a fresh person', () => {
      expect(ctrl.canAgree({ id: 7, login: 'alice' }, assertion).allowed).toBe(true);
    });

    it('denies if already agreed', () => {
      const agreements = [{ personId: 7, assertionId: 10 }];
      expect(ctrl.canAgree({ id: 7, login: 'alice' }, assertion, agreements).allowed).toBe(false);
    });

    it('denies if already challenged this assertion', () => {
      const disputes = [{ challengerId: 7, rootPostId: 10 }];
      expect(ctrl.canAgree({ id: 7, login: 'alice' }, assertion, [], disputes).allowed).toBe(false);
    });
  });
});
