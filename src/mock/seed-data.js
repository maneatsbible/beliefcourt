/**
 * Mock seed data — GitHub-Issue-shaped objects covering the full range of
 * disputable.io use cases:
 *
 *  A. Active dispute, interrogatory challenge, multi-round Q&A
 *  B. Active dispute, objection challenge on a factual assertion
 *  C. Resolved dispute — defender accepted an offer reassertion
 *  D. Crickets dispute — challenger declared no-response
 *  E. Counter-challenge scenario — defender challenges the challenge
 *  F. Offer scenario — defender makes a concession offer
 *  G. Multi-participant feed (several unrelated assertions)
 *
 * Issue numbers:
 *   1–99    Assertions
 *   100–199 Challenges
 *   200–299 Answers
 *   300–399 Disputes
 *   400–499 Agreements
 *   500–599 CricketsConditions
 *   600–699 CricketsEvents
 *
 * All meta blocks carry  "appId": "disputable.io"  so parseBody() accepts them.
 */

const APP_ID = 'disputable.io';

function meta(obj) {
  return `<!-- DSP:META\n${JSON.stringify({ appId: APP_ID, ...obj }, null, 2)}\n-->`;
}

function issue(number, labels, user, createdAt, body, title = '') {
  return {
    number,
    title:      title || labels[0] || '',
    body,
    state:      'open',
    labels:     labels.map(n => ({ name: n })),
    user:       typeof user === 'string' ? { login: user, id: _userId(user) } : user,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

const USERS = {
  'alice':        { login: 'alice',        id: 1001 },
  'bob':          { login: 'bob',          id: 1002 },
  'carol':        { login: 'carol',        id: 1003 },
  'dave':         { login: 'dave',         id: 1004 },
  'eve':          { login: 'eve',          id: 1005 },
  'frank':        { login: 'frank',        id: 1006 },
  // admin: has is_super_admin flag and blog_author role for UI testing admin surfaces
  'admin':        { login: 'admin',        id: 1007, is_super_admin: true, is_blog_author: true },
  'herald':       { login: 'herald',      id: 1 },
};

function _userId(login) {
  return USERS[login]?.id ?? 9999;
}

// Exported convenience list of mock users so the dev toolbar can offer a picker.
export const MOCK_USERS = Object.values(USERS).filter(u => u.login !== 'herald');

// ---------------------------------------------------------------------------
// SCENARIO A — Active dispute, interrogatory challenge, multi-round Q&A
// Topic: "TypeScript is strictly better than JavaScript for large teams"
// Challenger: alice  |  Defender: bob
// ---------------------------------------------------------------------------

const A_ASSERT = issue(
  1, ['dsp:assertion'],
  USERS.bob, '2026-04-01T10:00:00Z',
  meta({ type: 'assertion', rootId: 1, parentId: null }) +
  '\n\nTypeScript is strictly better than plain JavaScript for any team with more than 5 engineers.',
  'TypeScript vs JavaScript',
);

const A_CHALL = issue(
  101, ['dsp:challenge'],
  USERS.alice, '2026-04-01T11:00:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 1, parentId: 1, disputeId: 301 }) +
  '\n\nDoes "strictly better" hold even when the team has zero TypeScript experience and a deadline in two weeks?',
);

const A_ANSWER1 = issue(
  201, ['dsp:answer'],
  USERS.bob, '2026-04-01T12:00:00Z',
  meta({ type: 'answer', rootId: 1, parentId: 101, disputeId: 301 }) +
  '\n\nYes — the upfront ramp-up cost is typically recovered within a sprint because of reduced runtime errors.',
);

const A_CHALL2 = issue(
  102, ['dsp:challenge'],
  USERS.alice, '2026-04-01T13:00:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 1, parentId: 201, disputeId: 301 }) +
  '\n\nCan you cite empirical data showing that TypeScript reduces runtime errors more than strong linting rules + JSDoc would?',
);

const A_ANSWER2 = issue(
  202, ['dsp:answer'],
  USERS.bob, '2026-04-01T14:30:00Z',
  meta({ type: 'answer', rootId: 1, parentId: 102, disputeId: 301 }) +
  '\n\nThe 2022 Stripe engineering blog post and the Microsoft internal study both cite ~15% reduction in production bugs after TypeScript migration.',
);

const A_DISPUTE = issue(
  301, ['dsp:dispute'],
  USERS.alice, '2026-04-01T11:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.alice.id, challengerLogin: 'alice',
    defenderId:   USERS.bob.id,   defenderLogin:   'bob',
    rootPostId:   1,
    triggerChallengeId: 101,
  }),
  'Dispute #301 — TypeScript vs JS',
);

// ---------------------------------------------------------------------------
// SCENARIO B — Active dispute, objection challenge on a factual assertion
// Topic: "The Great Wall of China is visible from space"
// Challenger: carol  |  Defender: dave
// ---------------------------------------------------------------------------

const B_ASSERT = issue(
  2, ['dsp:assertion'],
  USERS.dave, '2026-04-02T09:00:00Z',
  meta({ type: 'assertion', rootId: 2, parentId: null }) +
  '\n\nThe Great Wall of China is visible to the naked eye from low Earth orbit.',
);

const B_CHALL = issue(
  103, ['dsp:challenge'],
  USERS.carol, '2026-04-02T09:30:00Z',
  meta({ type: 'challenge', challengeType: 'objection', rootId: 2, parentId: 2, disputeId: 302 }) +
  '\n\nThis assertion is factually wrong. Every NASA astronaut who has commented on the subject, including Ed Lu and Chris Hadfield, has explicitly stated the wall is too narrow to be seen without optical aids.',
);

const B_ANSWER = issue(
  203, ['dsp:answer'],
  USERS.dave, '2026-04-02T10:00:00Z',
  meta({ type: 'answer', rootId: 2, parentId: 103, disputeId: 302 }) +
  '\n\nChina\'s own astronaut Yang Liwei reported in 2003 that he could not see it either — but the wall\'s length compensates for its narrowness under certain light and atmospheric conditions.',
);

const B_DISPUTE = issue(
  302, ['dsp:dispute'],
  USERS.carol, '2026-04-02T09:30:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.carol.id, challengerLogin: 'carol',
    defenderId:   USERS.dave.id,  defenderLogin:   'dave',
    rootPostId:   2,
    triggerChallengeId: 103,
  }),
  'Dispute #302 — Great Wall visible from space',
);

// ---------------------------------------------------------------------------
// SCENARIO C — Resolved dispute through offer/concession
// Topic: "Pineapple belongs on pizza"
// Challenger: eve  |  Defender: frank  — frank made an offer that eve accepted
// ---------------------------------------------------------------------------

const C_ASSERT = issue(
  3, ['dsp:assertion'],
  USERS.frank, '2026-03-15T18:00:00Z',
  meta({ type: 'assertion', rootId: 3, parentId: null }) +
  '\n\nPineapple belongs on pizza. Sweet-savoury combinations are culinarily valid and widely popular.',
);

const C_CHALL = issue(
  104, ['dsp:challenge'],
  USERS.eve, '2026-03-15T18:20:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 3, parentId: 3, disputeId: 303 }) +
  '\n\nDoes popularity alone make something culinarily valid? Many popular foods are nutritionally questionable.',
);

const C_OFFER_ASSERT = issue(
  4, ['dsp:assertion'],
  USERS.frank, '2026-03-15T19:00:00Z',
  meta({
    type: 'assertion', rootId: 3, parentId: 3,
    isOffer: true, offeredInDisputeId: 303,
    proxyAuthor: null,
  }) +
  '\n\nPineapple belongs on pizza when requested by the diner — popularity signals genuine demand, and culinary validity is ultimately subjective.',
);

const C_ANSWER = issue(
  204, ['dsp:answer'],
  USERS.eve, '2026-03-15T19:30:00Z',
  meta({ type: 'answer', rootId: 3, parentId: 104, disputeId: 303, acceptedOfferId: 4 }) +
  '\n\nI accept the revised framing — personal preference is a legitimate basis for culinary choice.',
);

const C_DISPUTE = issue(
  303, ['dsp:dispute'],
  USERS.eve, '2026-03-15T18:20:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.eve.id,   challengerLogin: 'eve',
    defenderId:   USERS.frank.id, defenderLogin:   'frank',
    rootPostId:   3,
    triggerChallengeId: 104,
  }),
  'Dispute #303 — Pineapple on pizza (resolved)',
  // Resolved via accepted offer
);
// Mark it resolved
C_DISPUTE.labels = [{ name: 'dsp:dispute' }, { name: 'dsp:resolved' }];

// ---------------------------------------------------------------------------
// SCENARIO D — Crickets dispute (no response from defender)
// Topic: "Remote work permanently reduces productivity"
// Challenger: alice  |  Defender: dave (never responded)
// ---------------------------------------------------------------------------

const D_ASSERT = issue(
  5, ['dsp:assertion'],
  USERS.dave, '2026-03-20T08:00:00Z',
  meta({ type: 'assertion', rootId: 5, parentId: null }) +
  '\n\nRemote work permanently and measurably reduces individual productivity for knowledge workers.',
);

const D_CHALL = issue(
  105, ['dsp:challenge'],
  USERS.alice, '2026-03-20T09:00:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 5, parentId: 5, disputeId: 304 }) +
  '\n\nStanford professor Nicholas Bloom\'s 2023 meta-analysis found no significant productivity difference for remote vs in-office — how do you reconcile that with your assertion?',
);

const D_CRICKETS_COND = issue(
  501, ['dsp:crickets-conditions'],
  USERS.alice, '2026-03-21T09:00:00Z',
  meta({
    type: 'crickets-conditions',
    disputeId: 304,
    proposedByPersonId: USERS.alice.id,
    agreedByPersonId:   USERS.dave.id,
    durationMs:         86400000,
    currentDeadlineIso: '2026-03-22T09:00:00Z',
  }),
);

const D_CRICKETS_EVENT = issue(
  601, ['dsp:crickets-event'],
  USERS.alice, '2026-03-22T09:05:00Z',
  meta({
    type: 'crickets-event',
    disputeId: 304,
    challengeId: 105,
    triggeredByPersonId: USERS.alice.id,
    detectedAtIso: '2026-03-22T09:05:00Z',
  }),
);

const D_DISPUTE = issue(
  304, ['dsp:dispute', 'dsp:crickets-event'],
  USERS.alice, '2026-03-20T09:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.alice.id, challengerLogin: 'alice',
    defenderId:   USERS.dave.id,  defenderLogin:   'dave',
    rootPostId:   5,
    triggerChallengeId: 105,
  }),
  'Dispute #304 — Remote work productivity (crickets)',
);

// ---------------------------------------------------------------------------
// SCENARIO E — Counter-challenge (defender challenges the challenge)
// Topic: "Veganism is the only ethical diet"
// Challenger: carol  |  Defender: bob
// Flow: carol objects → bob answers + counter-challenges → carol answers counter
// ---------------------------------------------------------------------------

const E_ASSERT = issue(
  6, ['dsp:assertion'],
  USERS.bob, '2026-04-05T12:00:00Z',
  meta({ type: 'assertion', rootId: 6, parentId: null }) +
  '\n\nVeganism is the only diet that is fully ethically consistent given what we know about animal sentience.',
);

const E_CHALL = issue(
  106, ['dsp:challenge'],
  USERS.carol, '2026-04-05T13:00:00Z',
  meta({ type: 'challenge', challengeType: 'objection', rootId: 6, parentId: 6, disputeId: 305 }) +
  '\n\nThis ignores the environmental destruction caused by monoculture farming of staple vegan crops. Locally-raised, small-scale animal agriculture can have a lower net ecological footprint.',
);

// Bob answers carol's objection and includes a counter-challenge (issue 107).
const E_ANSWER = issue(
  205, ['dsp:answer'],
  USERS.bob, '2026-04-05T14:00:00Z',
  meta({ type: 'answer', rootId: 6, parentId: 106, disputeId: 305, counterChallengeId: 107 }) +
  '\n\nSmall-scale animal agriculture is the exception, not the rule. Global vegan supply chains are still far less carbon-intensive per calorie than global meat supply chains when you account for land use.',
);

// The counter-challenge: bob challenges carol on her empirical assertion (parentId = answer 205).
const E_COUNTER_CHALL = issue(
  107, ['dsp:challenge'],
  USERS.bob, '2026-04-05T14:05:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 6, parentId: 205, disputeId: 305 }) +
  '\n\nCan you cite a peer-reviewed LCA study showing that any animal-product supply chain has a lower carbon equivalent per gram of protein than legumes at the same production scale?',
);

// Carol answers bob's counter-challenge, completing the two-lane round.
const E_ANSWER2 = issue(
  206, ['dsp:answer'],
  USERS.carol, '2026-04-05T15:00:00Z',
  meta({ type: 'answer', rootId: 6, parentId: 107, disputeId: 305 }) +
  '\n\nPoore & Nemecek (2018, Science) show pasture-raised beef in certain low-productivity regions has comparable land-use efficiency to soy monocultures when accounting for marginal land. The global average hides significant variance.',
);

const E_DISPUTE = issue(
  305, ['dsp:dispute'],
  USERS.carol, '2026-04-05T13:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.carol.id, challengerLogin: 'carol',
    defenderId:   USERS.bob.id,   defenderLogin:   'bob',
    rootPostId:   6,
    triggerChallengeId: 106,
  }),
  'Dispute #305 — Veganism ethics (counter-challenge)',
);

// ---------------------------------------------------------------------------
// SCENARIO F — Agreement (non-dispute): several people agree with an assertion
// Topic: "Compilers catch bugs that unit tests miss"
// ---------------------------------------------------------------------------

const F_ASSERT = issue(
  7, ['dsp:assertion'],
  USERS.frank, '2026-04-10T08:00:00Z',
  meta({ type: 'assertion', rootId: 7, parentId: null }) +
  '\n\nStatic type checks and compilers reliably catch entire classes of bugs that even high-coverage unit test suites routinely miss.',
);

const F_AGREE_ALICE = issue(
  401, ['dsp:agreement'],
  USERS.alice, '2026-04-10T09:00:00Z',
  meta({ type: 'agreement', assertionId: 7, personId: USERS.alice.id }),
);

const F_AGREE_CAROL = issue(
  402, ['dsp:agreement'],
  USERS.carol, '2026-04-10T09:10:00Z',
  meta({ type: 'agreement', assertionId: 7, personId: USERS.carol.id }),
);

// ---------------------------------------------------------------------------
// SCENARIO G — Fresh standalone assertions (no disputes yet — feed variety)
// ---------------------------------------------------------------------------

const G1 = issue(
  8, ['dsp:assertion'],
  USERS.eve, '2026-04-15T07:00:00Z',
  meta({ type: 'assertion', rootId: 8, parentId: null }) +
  '\n\nOpen-plan offices measurably reduce deep-work output for software engineers, regardless of noise-cancelling headphone availability.',
);

const G2 = issue(
  9, ['dsp:assertion'],
  USERS.dave, '2026-04-16T11:00:00Z',
  meta({ type: 'assertion', rootId: 9, parentId: null }) +
  '\n\nThe Fermi Paradox is best explained by the "Great Filter" already being behind us — complex multicellular life is the filter.',
);

const G3 = issue(
  10, ['dsp:assertion'],
  USERS.carol, '2026-04-17T15:30:00Z',
  meta({ type: 'assertion', rootId: 10, parentId: null }) +
  '\n\nCode review\'s primary value is knowledge transfer, not defect detection. Automated tooling already catches most real bugs.',
);

const G4 = issue(
  11, ['dsp:assertion'],
  USERS.alice, '2026-04-18T09:00:00Z',
  meta({ type: 'assertion', rootId: 11, parentId: null }) +
  '\n\nDemocratic elections in their current form systematically disadvantage long-term policy thinking because the incentive horizon is a 4-year election cycle.',
);

const G5 = issue(
  12, ['dsp:assertion'],
  USERS.bob, '2026-04-19T08:00:00Z',
  meta({ type: 'assertion', rootId: 12, parentId: null }) +
  '\n\nThe most effective way to combat misinformation is algorithmic friction at the point of re-share, not content removal.',
);

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const SEED_ISSUES = [
  // Scenario A
  A_ASSERT, A_CHALL, A_CHALL2, A_ANSWER1, A_ANSWER2, A_DISPUTE,
  // Scenario B
  B_ASSERT, B_CHALL, B_ANSWER, B_DISPUTE,
  // Scenario C
  C_ASSERT, C_CHALL, C_OFFER_ASSERT, C_ANSWER, C_DISPUTE,
  // Scenario D
  D_ASSERT, D_CHALL, D_CRICKETS_COND, D_CRICKETS_EVENT, D_DISPUTE,
  // Scenario E
  E_ASSERT, E_CHALL, E_ANSWER, E_COUNTER_CHALL, E_ANSWER2, E_DISPUTE,
  // Scenario F
  F_ASSERT, F_AGREE_ALICE, F_AGREE_CAROL,
  // Scenario G
  G1, G2, G3, G4, G5,
];
