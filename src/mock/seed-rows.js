/**
 * Mock seed data in DB-row format.
 * Used by MockAdapter in USE_MOCK_DB=true mode.
 *
 * Scenarios:
 *   A. Active case — TypeScript vs JavaScript debate (bob's claim, alice challenges)
 *   B. Resolved case — AI safety claim
 *   C. Un-challenged claims (open for challenging)
 *   D. Multiple users with various roles
 */

// ─── Persons ──────────────────────────────────────────────────────────────────

const P_ALICE  = 'person-alice';
const P_BOB    = 'person-bob';
const P_CAROL  = 'person-carol';
const P_DAVE   = 'person-dave';
const P_EVE    = 'person-eve';
const P_FRANK  = 'person-frank';
const P_ADMIN  = 'person-admin';
const P_HERALD = 'person-herald';

const PERSONS = [
  { id: P_ALICE,  display_name: 'Alice',  is_herald: 0, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: P_BOB,    display_name: 'Bob',    is_herald: 0, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: P_CAROL,  display_name: 'Carol',  is_herald: 0, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: P_DAVE,   display_name: 'Dave',   is_herald: 0, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: P_EVE,    display_name: 'Eve',    is_herald: 0, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: P_FRANK,  display_name: 'Frank',  is_herald: 0, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: P_ADMIN,  display_name: 'Admin',  is_herald: 0, is_ai: 0, is_super_admin: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: P_HERALD, display_name: 'Herald', is_herald: 1, is_ai: 0, is_super_admin: 0, created_at: '2026-01-01T00:00:00Z' },
];

// ─── Linked Identities ────────────────────────────────────────────────────────

const LINKED_IDENTITIES = [
  { id: 'li-alice',  person_id: P_ALICE,  platform: 'github', platform_user_id: 'gh-alice',  handle: 'alice',  display_name: 'Alice',  profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-bob',    person_id: P_BOB,    platform: 'github', platform_user_id: 'gh-bob',    handle: 'bob',    display_name: 'Bob',    profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-carol',  person_id: P_CAROL,  platform: 'github', platform_user_id: 'gh-carol',  handle: 'carol',  display_name: 'Carol',  profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-dave',   person_id: P_DAVE,   platform: 'github', platform_user_id: 'gh-dave',   handle: 'dave',   display_name: 'Dave',   profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-eve',    person_id: P_EVE,    platform: 'github', platform_user_id: 'gh-eve',    handle: 'eve',    display_name: 'Eve',    profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-frank',  person_id: P_FRANK,  platform: 'github', platform_user_id: 'gh-frank',  handle: 'frank',  display_name: 'Frank',  profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-admin',  person_id: P_ADMIN,  platform: 'github', platform_user_id: 'gh-admin',  handle: 'admin',  display_name: 'Admin',  profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
  { id: 'li-herald', person_id: P_HERALD, platform: 'github', platform_user_id: 'gh-herald', handle: 'herald', display_name: 'Herald', profile_pic_url: '', created_at: '2026-01-01T00:00:00Z' },
];

// ─── Records ──────────────────────────────────────────────────────────────────

const R_A_CLAIM     = 'rec-a-claim';
const R_B_CLAIM     = 'rec-b-claim';
const R_C_CLAIM     = 'rec-c-claim';
const R_D_CLAIM     = 'rec-d-claim';
const R_E_CLAIM     = 'rec-e-claim';
const R_A_CHALLENGE = 'rec-a-challenge';
const R_A_ANSWER    = 'rec-a-answer';
const R_B_CHALLENGE = 'rec-b-challenge';

const RECORDS = [
  // Scenario A: TypeScript debate — bob claims, alice challenges
  {
    id:             R_A_CLAIM,
    type:           'claim',
    author_id:      P_BOB,
    case_id:        null,
    text:           'TypeScript is strictly better than plain JavaScript for any team with more than 5 engineers.',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-01T10:00:00Z',
  },
  {
    id:             R_A_CHALLENGE,
    type:           'challenge',
    author_id:      P_ALICE,
    case_id:        'case-a',
    text:           'Does TypeScript\'s type system always prevent runtime errors in large codebases?',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-01T11:00:00Z',
  },
  {
    id:             R_A_ANSWER,
    type:           'answer',
    author_id:      P_BOB,
    case_id:        'case-a',
    text:           'No, it does not prevent all runtime errors — it catches most type-related ones at compile time, which significantly reduces error rates. The team productivity gain is the primary benefit.',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-01T12:00:00Z',
  },

  // Scenario B: AI safety claim — carol claims, dave challenges (resolved)
  {
    id:             R_B_CLAIM,
    type:           'claim',
    author_id:      P_CAROL,
    case_id:        null,
    text:           'Current AI safety research is fundamentally inadequate to address AGI risks within this decade.',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-05T09:00:00Z',
  },
  {
    id:             R_B_CHALLENGE,
    type:           'challenge',
    author_id:      P_DAVE,
    case_id:        'case-b',
    text:           'Is there published evidence showing these safety techniques fail under adversarial conditions?',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-05T10:00:00Z',
  },

  // Scenario C: Un-challenged claims
  {
    id:             R_C_CLAIM,
    type:           'claim',
    author_id:      P_EVE,
    case_id:        null,
    text:           'Open-source software is more secure than proprietary software due to public code review.',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-10T08:00:00Z',
  },
  {
    id:             R_D_CLAIM,
    type:           'claim',
    author_id:      P_FRANK,
    case_id:        null,
    text:           'Remote work increases individual developer productivity for most software roles.',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-12T14:00:00Z',
  },
  {
    id:             R_E_CLAIM,
    type:           'claim',
    author_id:      P_ALICE,
    case_id:        null,
    text:           'Code reviews improve software quality more than automated testing alone.',
    url:            null,
    integrity_hash: null,
    created_at:     '2026-04-15T16:00:00Z',
  },
];

// ─── Cases ────────────────────────────────────────────────────────────────────

const CASES = [
  {
    id:             'case-a',
    claim_id:       R_A_CLAIM,
    challenger_id:  P_ALICE,
    respondent_id:  P_BOB,
    status:         'open',
    opened_at:      '2026-04-01T11:00:00Z',
    closed_at:      null,
  },
  {
    id:             'case-b',
    claim_id:       R_B_CLAIM,
    challenger_id:  P_DAVE,
    respondent_id:  P_CAROL,
    status:         'closed',
    opened_at:      '2026-04-05T10:00:00Z',
    closed_at:      '2026-04-10T09:00:00Z',
  },
];

// ─── Duels ────────────────────────────────────────────────────────────────────

const DUELS = [
  {
    id:                   'duel-a1',
    case_id:              'case-a',
    status:               'active',
    round:                1,
    challenge_record_id:  R_A_CHALLENGE,
    answer_record_id:     R_A_ANSWER,
    disposition_record_id: null,
    started_at:           '2026-04-01T11:00:00Z',
    ended_at:             null,
  },
  {
    id:                   'duel-b1',
    case_id:              'case-b',
    status:               'resolved',
    round:                1,
    challenge_record_id:  R_B_CHALLENGE,
    answer_record_id:     null,
    disposition_record_id: null,
    started_at:           '2026-04-05T10:00:00Z',
    ended_at:             '2026-04-10T09:00:00Z',
  },
];

// ─── Export ───────────────────────────────────────────────────────────────────

export const SEED_ROWS = {
  persons:          PERSONS,
  linked_identities: LINKED_IDENTITIES,
  records:          RECORDS,
  cases:            CASES,
  duels:            DUELS,
};

/** Convenience list for mock toolbar user picker. */
export const MOCK_USERS = LINKED_IDENTITIES
  .filter(li => li.handle !== 'herald')
  .map(li => ({
    handle:         li.handle,
    person_id:      li.person_id,
    is_super_admin: PERSONS.find(p => p.id === li.person_id)?.is_super_admin ?? 0,
  }));
