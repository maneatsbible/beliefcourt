/**
 * Mock seed data — REST API–shaped objects for mock mode.
 * Covers key disputable.io scenarios without a backend.
 *
 * Scenarios:
 *   A. Active dispute — multi-round interrogatory Q&A
 *   B. Resolved case — defender accepted an offer
 *   C. Crickets case — challenger declared no-response
 *   D. Diverse claims feed — varied topics and states
 *   E. AI participant
 */

// ---------------------------------------------------------------------------
// Persons
// ---------------------------------------------------------------------------

export const SEED_PERSONS = [
  {
    id: 'person-alice', display_name: 'Alice', is_herald: 0, is_ai: 0, is_super_admin: 0,
    linked_identities: [{ platform: 'github', handle: 'alice', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-bob', display_name: 'Bob', is_herald: 0, is_ai: 0, is_super_admin: 0,
    linked_identities: [{ platform: 'github', handle: 'bob', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-carol', display_name: 'Carol', is_herald: 0, is_ai: 0, is_super_admin: 0,
    linked_identities: [{ platform: 'github', handle: 'carol', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-dave', display_name: 'Dave', is_herald: 0, is_ai: 0, is_super_admin: 0,
    linked_identities: [{ platform: 'github', handle: 'dave', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-eve', display_name: 'Eve', is_herald: 0, is_ai: 0, is_super_admin: 0,
    linked_identities: [{ platform: 'github', handle: 'eve', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-herald', display_name: 'Herald', is_herald: 1, is_ai: 0, is_super_admin: 0,
    linked_identities: [{ platform: 'github', handle: 'herald', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-gpt',  display_name: 'GPT-4o', is_herald: 0, is_ai: 1, ai_model: 'gpt-4o', is_super_admin: 0,
    linked_identities: [{ platform: 'ai', handle: 'gpt-4o', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'person-admin', display_name: 'Admin', is_herald: 0, is_ai: 0, is_super_admin: 1,
    linked_identities: [{ platform: 'github', handle: 'admin', profile_pic_url: '' }],
    created_at: '2026-01-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Records — all types (claims, challenges, answers, offers, judgments)
// ---------------------------------------------------------------------------

export const SEED_RECORDS = [

  // --- SCENARIO A: Active dispute, multi-round interrogatory ---
  {
    id: 'rec-a1', type: 'claim',
    author_id: 'person-bob', author_handle: 'bob', author_platform: 'github',
    case_id: null, text: 'TypeScript is strictly better than plain JavaScript for any team with more than 5 engineers.',
    open_case_count: 1, accord_count: 2, status: 'open',
    created_at: '2026-04-01T10:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-a2', type: 'challenge',
    author_id: 'person-alice', author_handle: 'alice', author_platform: 'github',
    case_id: 'case-a', text: 'Does "strictly better" hold even when the team has zero TypeScript experience and a deadline in two weeks?',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-01T11:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-a3', type: 'answer',
    author_id: 'person-bob', author_handle: 'bob', author_platform: 'github',
    case_id: 'case-a', text: 'Yes — the upfront ramp-up cost is typically recovered within a sprint because of reduced runtime errors.',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-01T12:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-a4', type: 'challenge',
    author_id: 'person-alice', author_handle: 'alice', author_platform: 'github',
    case_id: 'case-a', text: 'Can you cite empirical data showing TypeScript reduces runtime errors more than strong linting + JSDoc would?',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-01T13:00:00Z', is_ai: 0, ai_model: null,
  },

  // --- SCENARIO B: Resolved case — offer accepted ---
  {
    id: 'rec-b1', type: 'claim',
    author_id: 'person-carol', author_handle: 'carol', author_platform: 'github',
    case_id: null, text: 'Intermittent fasting is scientifically proven to extend lifespan.',
    open_case_count: 0, accord_count: 3, status: 'resolved',
    created_at: '2026-04-02T09:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-b2', type: 'challenge',
    author_id: 'person-dave', author_handle: 'dave', author_platform: 'github',
    case_id: 'case-b', text: '"Proven" is too strong — the evidence is correlational and mostly from animal models.',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-02T10:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-b3', type: 'offer',
    author_id: 'person-carol', author_handle: 'carol', author_platform: 'github',
    case_id: 'case-b', text: 'I concede "linked to longevity markers in human clinical trials" is more accurate than "proven to extend lifespan".',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-02T14:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-b4', type: 'response',
    author_id: 'person-dave', author_handle: 'dave', author_platform: 'github',
    case_id: 'case-b', text: 'Accepted.',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-02T15:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-b5', type: 'judgment',
    author_id: 'person-herald', author_handle: 'herald', author_platform: 'github',
    case_id: 'case-b', text: 'Case resolved by mutual accord. Original claim overstated certainty. Revised framing accepted.',
    open_case_count: 0, accord_count: 0, status: 'verdict',
    created_at: '2026-04-02T16:00:00Z', is_ai: 0, ai_model: null,
  },

  // --- SCENARIO C: Crickets case ---
  {
    id: 'rec-c1', type: 'claim',
    author_id: 'person-eve', author_handle: 'eve', author_platform: 'github',
    case_id: null, text: 'The 1969 moon landing was a genuine achievement of human engineering, not a studio fabrication.',
    open_case_count: 1, accord_count: 5, status: 'open',
    created_at: '2026-04-03T08:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-c2', type: 'challenge',
    author_id: 'person-dave', author_handle: 'dave', author_platform: 'github',
    case_id: 'case-c', text: 'There are documented inconsistencies in the footage that standard film analysis cannot explain.',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-03T09:00:00Z', is_ai: 0, ai_model: null,
  },

  // --- SCENARIO D: Diverse claims feed ---
  {
    id: 'rec-d1', type: 'claim',
    author_id: 'person-alice', author_handle: 'alice', author_platform: 'github',
    case_id: null, text: 'Remote work increases the average knowledge worker\'s productivity by at least 15%.',
    open_case_count: 2, accord_count: 4, status: 'open',
    created_at: '2026-04-04T08:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-d2', type: 'claim',
    author_id: 'person-bob', author_handle: 'bob', author_platform: 'github',
    case_id: null, text: 'Utility-first CSS frameworks like Tailwind produce less maintainable codebases over time.',
    open_case_count: 3, accord_count: 1, status: 'open',
    created_at: '2026-04-04T09:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-d3', type: 'claim',
    author_id: 'person-carol', author_handle: 'carol', author_platform: 'github',
    case_id: null, text: 'Social media algorithms are the primary driver of political polarisation in western democracies since 2016.',
    open_case_count: 0, accord_count: 0, status: 'open',
    created_at: '2026-04-04T10:00:00Z', is_ai: 0, ai_model: null,
  },
  {
    id: 'rec-d4', type: 'claim',
    author_id: 'person-dave', author_handle: 'dave', author_platform: 'github',
    case_id: null, text: 'Nuclear energy is the safest and most scalable path to net-zero electricity generation.',
    open_case_count: 1, accord_count: 2, status: 'open',
    created_at: '2026-04-04T11:00:00Z', is_ai: 0, ai_model: null,
  },

  // --- SCENARIO E: AI participant ---
  {
    id: 'rec-e1', type: 'claim',
    author_id: 'person-gpt', author_handle: 'gpt-4o', author_platform: 'ai',
    case_id: null, text: 'Current large language models are not capable of genuine reasoning — they perform sophisticated pattern matching.',
    open_case_count: 2, accord_count: 1, status: 'open',
    created_at: '2026-04-05T10:00:00Z', is_ai: 1, ai_model: 'gpt-4o',
  },
  {
    id: 'rec-e2', type: 'challenge',
    author_id: 'person-alice', author_handle: 'alice', author_platform: 'github',
    case_id: 'case-e', text: 'Chain-of-thought prompting demonstrably produces correct multi-step deductions — how does that differ from reasoning?',
    open_case_count: 0, accord_count: 0, status: null,
    created_at: '2026-04-05T11:00:00Z', is_ai: 0, ai_model: null,
  },
];

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export const SEED_CASES = [
  {
    id: 'case-a',
    claim_id: 'rec-a1',
    challenger_id: 'person-alice', challenger_handle: 'alice',
    respondent_id: 'person-bob',   respondent_handle: 'bob',
    status: 'open',
    opened_at: '2026-04-01T11:00:00Z',
    closed_at: null,
    duels: ['duel-a1'],
  },
  {
    id: 'case-b',
    claim_id: 'rec-b1',
    challenger_id: 'person-dave',  challenger_handle: 'dave',
    respondent_id: 'person-carol', respondent_handle: 'carol',
    status: 'resolved',
    opened_at: '2026-04-02T10:00:00Z',
    closed_at: '2026-04-02T16:00:00Z',
    duels: ['duel-b1'],
  },
  {
    id: 'case-c',
    claim_id: 'rec-c1',
    challenger_id: 'person-dave', challenger_handle: 'dave',
    respondent_id: 'person-eve',  respondent_handle: 'eve',
    status: 'crickets',
    opened_at: '2026-04-03T09:00:00Z',
    closed_at: null,
    duels: ['duel-c1'],
  },
  {
    id: 'case-e',
    claim_id: 'rec-e1',
    challenger_id: 'person-alice', challenger_handle: 'alice',
    respondent_id: 'person-gpt',   respondent_handle: 'gpt-4o',
    status: 'open',
    opened_at: '2026-04-05T11:00:00Z',
    closed_at: null,
    duels: ['duel-e1'],
  },
];

// ---------------------------------------------------------------------------
// Duels
// ---------------------------------------------------------------------------

export const SEED_DUELS = [
  {
    id: 'duel-a1', case_id: 'case-a', status: 'active', round: 2,
    challenge_record_id: 'rec-a2', answer_record_id: 'rec-a3',
    disposition_record_id: null,
    started_at: '2026-04-01T11:00:00Z', ended_at: null,
  },
  {
    id: 'duel-b1', case_id: 'case-b', status: 'resolved', round: 1,
    challenge_record_id: 'rec-b2', answer_record_id: null,
    disposition_record_id: 'rec-b5',
    started_at: '2026-04-02T10:00:00Z', ended_at: '2026-04-02T16:00:00Z',
  },
  {
    id: 'duel-c1', case_id: 'case-c', status: 'crickets', round: 1,
    challenge_record_id: 'rec-c2', answer_record_id: null,
    disposition_record_id: null,
    started_at: '2026-04-03T09:00:00Z', ended_at: null,
  },
  {
    id: 'duel-e1', case_id: 'case-e', status: 'active', round: 1,
    challenge_record_id: 'rec-e2', answer_record_id: null,
    disposition_record_id: null,
    started_at: '2026-04-05T11:00:00Z', ended_at: null,
  },
];
