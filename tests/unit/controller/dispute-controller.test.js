/**
 * Unit tests: CaseController permission gates
 * (pure logic only; no network calls)
 */

import { describe, it, expect, beforeEach } from '../../runner.js';
import { CaseController } from '../../../src/controller/case-controller.js';
import { DISPUTE_STATUS_ACTIVE, DISPUTE_STATUS_RESOLVED } from '../../../src/model/dispute.js';

const CONFIG = {
  githubClientId: 'test-client-id',
  dataRepo:       'owner/repo',
  heraldLogin:    'herald',
  appVersion:     'v0.0.1-pre-alpha',
};

let ctrl;

describe('CaseController', () => {
  beforeEach(() => {
    ctrl = new CaseController({ config: CONFIG, token: null, currentUser: null });
  });

  // ── canOffer ─────────────────────────────────────────────────────────────

  describe('canOffer', () => {
    const activeDispute = {
      id: 1, challengerId: 10, defenderId: 20, status: DISPUTE_STATUS_ACTIVE,
      isActive: true, isResolved: false, isCrickets: false, labelNames: [],
    };
    const resolvedDispute = {
      id: 1, challengerId: 10, defenderId: 20, status: DISPUTE_STATUS_RESOLVED,
      isActive: false, isResolved: true, isCrickets: false, labelNames: [],
    };

    it('denies unauthenticated user', () => {
      expect(ctrl.canOffer(null, activeDispute).allowed).toBe(false);
    });

    it('denies on resolved dispute', () => {
      expect(ctrl.canOffer({ id: 10 }, resolvedDispute).allowed).toBe(false);
    });

    it('denies a non-party person', () => {
      expect(ctrl.canOffer({ id: 99 }, activeDispute).allowed).toBe(false);
    });

    it('allows a party to an active dispute', () => {
      expect(ctrl.canOffer({ id: 10 }, activeDispute).allowed).toBe(true);
      expect(ctrl.canOffer({ id: 20 }, activeDispute).allowed).toBe(true);
    });
  });

  // ── canProposeCrickets ────────────────────────────────────────────────────

  describe('canProposeCrickets', () => {
    const activeDispute = {
      id: 2, challengerId: 10, defenderId: 20, status: DISPUTE_STATUS_ACTIVE,
      isActive: true,
    };

    it('denies unauthenticated', () => {
      expect(ctrl.canProposeCrickets(null, activeDispute).allowed).toBe(false);
    });

    it('allows a party', () => {
      expect(ctrl.canProposeCrickets({ id: 10 }, activeDispute).allowed).toBe(true);
    });

    it('denies a non-party', () => {
      expect(ctrl.canProposeCrickets({ id: 99 }, activeDispute).allowed).toBe(false);
    });
  });

  // ── canDeclareCrickets ────────────────────────────────────────────────────

  describe('canDeclareCrickets', () => {
    const activeDispute = { status: DISPUTE_STATUS_ACTIVE, isActive: true };
    const pastDeadline  = new Date(Date.now() - 1000).toISOString();
    const futureDeadline = new Date(Date.now() + 60_000).toISOString();
    const agreedConditions = {
      isAgreed: true,
      agreedByPersonId: 20,
      currentDeadlineIso: pastDeadline,
    };

    it('returns false when no conditions', () => {
      expect(ctrl.canDeclareCrickets(activeDispute, null, null)).toBe(false);
    });

    it('returns false when existing event', () => {
      expect(ctrl.canDeclareCrickets(activeDispute, agreedConditions, {})).toBe(false);
    });

    it('returns false when deadline is in the future', () => {
      const futureConditions = { ...agreedConditions, currentDeadlineIso: futureDeadline };
      expect(ctrl.canDeclareCrickets(activeDispute, futureConditions, null)).toBe(false);
    });

    it('returns true when deadline is past and no existing event', () => {
      expect(ctrl.canDeclareCrickets(activeDispute, agreedConditions, null)).toBe(true);
    });
  });

  // ── canAcceptOffer ────────────────────────────────────────────────────────

  describe('canAcceptOffer', () => {
    const dispute = {
      id: 1, challengerId: 10, defenderId: 20, status: DISPUTE_STATUS_ACTIVE, isActive: true,
    };
    const offer = { id: 5, isOffer: true, authorId: 10 };

    it('denies unauthenticated', () => {
      expect(ctrl.canAcceptOffer(null, offer, dispute).allowed).toBe(false);
    });

    it('denies the offer author from accepting their own offer', () => {
      expect(ctrl.canAcceptOffer({ id: 10 }, offer, dispute).allowed).toBe(false);
    });

    it('allows the other party', () => {
      expect(ctrl.canAcceptOffer({ id: 20 }, offer, dispute).allowed).toBe(true);
    });

    it('denies a non-party', () => {
      expect(ctrl.canAcceptOffer({ id: 99 }, offer, dispute).allowed).toBe(false);
    });
  });
});
