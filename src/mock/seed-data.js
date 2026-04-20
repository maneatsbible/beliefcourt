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

const APP_ID = 'judgmental.io';

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
// SCENARIO H — Defended verdict (challenger conceded after strong answer)
// Topic: "Compilers eliminate entire bug categories that tests cannot"
// Challenger: dave  |  Defender: alice
// alice's argument was so strong that dave withdrew — verdict: DEFENDED
// ---------------------------------------------------------------------------

const H_ASSERT = issue(
  13, ['dsp:assertion'],
  USERS.alice, '2026-03-01T10:00:00Z',
  meta({ type: 'assertion', rootId: 13, parentId: null }) +
  '\n\nType-checked compilers eliminate entire categories of runtime errors that no amount of unit-test coverage can catch — because they prove properties about all possible inputs, not just sampled ones.',
  'Compilers vs tests — bug coverage',
);

const H_CHALL = issue(
  108, ['dsp:challenge'],
  USERS.dave, '2026-03-01T11:00:00Z',
  meta({ type: 'challenge', challengeType: 'objection', rootId: 13, parentId: 13, disputeId: 306 }) +
  '\n\nProperty-based testing (e.g. Hypothesis, QuickCheck) also proves properties about all possible inputs without requiring a type system.',
);

const H_ANSWER = issue(
  207, ['dsp:answer'],
  USERS.alice, '2026-03-01T12:00:00Z',
  meta({ type: 'answer', rootId: 13, parentId: 108, disputeId: 306 }) +
  '\n\nProperty-based testing still only tests a sampled subset of the input space — it approximates universal quantification. A type-checker guarantees it for every value the type admits, with no sampling. These are fundamentally different epistemic claims.',
);

const H_DISPUTE = issue(
  306, ['dsp:dispute', 'dsp:verdict-defended'],
  USERS.dave, '2026-03-01T11:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.dave.id,  challengerLogin: 'dave',
    defenderId:   USERS.alice.id, defenderLogin:   'alice',
    rootPostId:   13,
    triggerChallengeId: 108,
  }),
  'Dispute #306 — Compilers vs tests (DEFENDED)',
);

// ---------------------------------------------------------------------------
// SCENARIO I — Contested verdict (judgment itself is under challenge)
// Topic: "Null references are a billion-dollar mistake"
// Challenger: eve  |  Defender: carol
// Resolved = carol conceded, but carol now contests the judgment was rushed
// ---------------------------------------------------------------------------

const I_ASSERT = issue(
  14, ['dsp:assertion'],
  USERS.carol, '2026-02-15T09:00:00Z',
  meta({ type: 'assertion', rootId: 14, parentId: null }) +
  '\n\nNull references, as implemented in C, Java, and C#, represent the most costly single language-design mistake in history — Hoare\'s "billion-dollar mistake" framing is not hyperbole.',
  'Null references — billion-dollar mistake',
);

const I_CHALL = issue(
  109, ['dsp:challenge'],
  USERS.eve, '2026-02-15T10:00:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 14, parentId: 14, disputeId: 307 }) +
  '\n\nBy what methodology are you quantifying "most costly" relative to other mistakes like buffer overflows, integer overflows, or the C memory model itself?',
);

const I_ANSWER = issue(
  208, ['dsp:answer'],
  USERS.carol, '2026-02-15T11:00:00Z',
  meta({ type: 'answer', rootId: 14, parentId: 109, disputeId: 307 }) +
  '\n\nI accept the epistemic problem: the claim requires a cost comparison methodology I cannot provide. I withdraw my assertion that nulls are specifically the worst single mistake.',
);

const I_DISPUTE = issue(
  307, ['dsp:dispute', 'dsp:verdict-contested'],
  USERS.eve, '2026-02-15T10:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.eve.id,   challengerLogin: 'eve',
    defenderId:   USERS.carol.id, defenderLogin:   'carol',
    rootPostId:   14,
    triggerChallengeId: 109,
  }),
  'Dispute #307 — Null references (VERDICT CONTESTED)',
);

// ---------------------------------------------------------------------------
// SCENARIO J — Judgment flow (defended Duel gets analyzed + judged)
// Topic: "True conditionals don't require material implication"
// Challenger: frank  |  Defender: bob
// Dispute is DEFENDED. carol analyzes, judges in favour of defender.
// ---------------------------------------------------------------------------

const J_ASSERT = issue(
  15, ['dsp:assertion'],
  USERS.bob, '2026-03-10T08:00:00Z',
  meta({ type: 'assertion', rootId: 15, parentId: null }) +
  '\n\nThe material-conditional interpretation of "if-then" in classical logic fails as an account of natural-language conditionals — true conditionals express a genuine inferential connection, not merely the absence of a true antecedent and false consequent.',
  'Conditionals: more than material implication',
);

const J_CHALL = issue(
  110, ['dsp:challenge'],
  USERS.frank, '2026-03-10T09:30:00Z',
  meta({ type: 'challenge', challengeType: 'objection', rootId: 15, parentId: 15, disputeId: 308 }) +
  '\n\nStrawson and Lewis\'s work notwithstanding, classical logic\'s material conditional is extensionally adequate for every formal proof we care about. The demand for an "inferential connection" is a natural-language intuition, not a logical requirement.',
);

const J_ANSWER = issue(
  209, ['dsp:answer'],
  USERS.bob, '2026-03-10T10:45:00Z',
  meta({ type: 'answer', rootId: 15, parentId: 110, disputeId: 308 }) +
  '\n\nExtensional adequacy for formal proofs is precisely what is not at issue. The claim is about what conditionals *mean* — and "P→Q is true when P is false" renders every false antecedent conditional vacuously true, which is a semantic absurdity in ordinary discourse.',
);

const J_DISPUTE = issue(
  308, ['dsp:dispute', 'dsp:verdict-defended'],
  USERS.frank, '2026-03-10T09:30:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.frank.id, challengerLogin: 'frank',
    defenderId:   USERS.bob.id,   defenderLogin:   'bob',
    rootPostId:   15,
    triggerChallengeId: 110,
    context: 'standard',
  }),
  'Dispute #308 — Material implication debate (DEFENDED)',
);

// carol's Analysis and Judgment on Dispute #308
const J_ANALYSIS = issue(
  701, ['dsp:analysis'],
  USERS.carol, '2026-03-12T14:00:00Z',
  meta({
    type:     'analysis',
    duelId:   308,
    momentRefs: [110, 209],
  }) +
  '\n\nFrank\'s objection conflates extensional adequacy with semantic correctness. Bob correctly distinguishes formal proof calculus from the semantics of natural-language conditionals. Frank never addressed the vacuous-truth absurdity directly. Bob\'s position held throughout.',
  'Analysis of Dispute #308',
);

const J_JUDGMENT = issue(
  801, ['dsp:judgment'],
  USERS.carol, '2026-03-12T15:00:00Z',
  meta({
    type:               'judgment',
    duelId:             308,
    verdict:            'defender',
    analysisId:         701,
    baseOfTruthClaimId: 901,
  }) +
  '\n\nBob\'s distinction between formal adequacy and semantic meaning is philosophically sound and went unanswered. Verdict: Defender.',
  'Judgment on Dispute #308 — Defender',
);

const J_BOT = issue(
  901, ['dsp:base-of-truth'],
  USERS.carol, '2026-03-05T10:00:00Z',
  meta({
    type:            'base-of-truth',
    personLogin:     'carol',
    anchorClaimId:   14,
  }) +
  '\n\nMy epistemic foundation is coherentism grounded in analytic philosophy: claims must be internally consistent, engage seriously with the strongest objections, and track the best available philosophical literature. I defer to conceptual precision over intuitive plausibility.',
  'Base of Truth — carol',
);

// ---------------------------------------------------------------------------
// SCENARIO K — Dating context
// Topic: "Shared financial goals matter more than income level in a partner"
// Challenger: dave  |  Defender: alice
// Active dispute in dating context
// ---------------------------------------------------------------------------

const K_ASSERT = issue(
  16, ['dsp:assertion'],
  USERS.alice, '2026-03-15T09:00:00Z',
  meta({ type: 'assertion', rootId: 16, parentId: null }) +
  '\n\nIn long-term romantic compatibility, alignment on financial goals and spending philosophies matters far more than the absolute income level of either partner.',
  'Financial compatibility: goals > income',
);

const K_CHALL = issue(
  111, ['dsp:challenge'],
  USERS.dave, '2026-03-15T10:00:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 16, parentId: 16, disputeId: 309, context: 'dating' }) +
  '\n\nWould you maintain this position in a scenario where one partner\'s income is below the poverty line? At what income floor does income level start to matter, and why?',
);

const K_DISPUTE = issue(
  309, ['dsp:dispute'],
  USERS.dave, '2026-03-15T10:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.dave.id,  challengerLogin: 'dave',
    defenderId:   USERS.alice.id, defenderLogin:   'alice',
    rootPostId:   16,
    triggerChallengeId: 111,
    context: 'dating',
  }),
  'Dispute #309 — Financial compatibility (DATING context)',
);

// ---------------------------------------------------------------------------
// SCENARIO L — Christian context
// Topic: "Scripture is sufficiently clear on all matters essential to salvation"
// Challenger: bob  |  Defender: carol
// Active dispute in christian context
// ---------------------------------------------------------------------------

const L_ASSERT = issue(
  17, ['dsp:assertion'],
  USERS.carol, '2026-03-18T08:00:00Z',
  meta({ type: 'assertion', rootId: 17, parentId: null }) +
  '\n\nScripture is perspicuous — sufficiently clear on all matters essential to salvation — such that an ordinary believer reading it faithfully can understand what is necessary for eternal life without requiring authoritative ecclesiastical interpretation.',
  'Scripture perspicuity — sufficient for salvation',
);

const L_CHALL = issue(
  112, ['dsp:challenge'],
  USERS.bob, '2026-03-18T09:30:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 17, parentId: 17, disputeId: 310, context: 'christian' }) +
  '\n\nHow do you account for the 40,000+ Protestant denominations that all claim to read Scripture faithfully yet disagree on what is essential to salvation — including whether faith alone or faith-plus-works is required?',
);

const L_ANSWER = issue(
  210, ['dsp:answer'],
  USERS.carol, '2026-03-18T11:00:00Z',
  meta({ type: 'answer', rootId: 17, parentId: 112, disputeId: 310 }) +
  '\n\nDenominational fragmentation demonstrates human fallibility in interpretation, not a failure of Scripture\'s clarity. The core of perspicuity is that Scripture is clear on *essentials* — the 40,000-denominations figure collapses on examination; most diverge on secondary matters, not salvation itself.',
);

const L_DISPUTE = issue(
  310, ['dsp:dispute'],
  USERS.bob, '2026-03-18T09:30:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.bob.id,   challengerLogin: 'bob',
    defenderId:   USERS.carol.id, defenderLogin:   'carol',
    rootPostId:   17,
    triggerChallengeId: 112,
    context: 'christian',
  }),
  'Dispute #310 — Scripture perspicuity (CHRISTIAN context)',
);

// ---------------------------------------------------------------------------
// SCENARIO M — Historical context
// Topic: "Galileo's opponents had rational scientific grounds for resistance"
// Challenger: alice  |  Defender: frank
// Active dispute in historical context
// ---------------------------------------------------------------------------

const M_ASSERT = issue(
  18, ['dsp:assertion'],
  USERS.frank, '2026-03-20T08:00:00Z',
  meta({ type: 'assertion', rootId: 18, parentId: null }) +
  '\n\nGalileo\'s ecclesiastical and scientific opponents were not simply obscurantists — many had rational empirical grounds for resisting heliocentrism in 1616, given the state of evidence available at the time (stellar parallax undetected, no stellar aberration, Tychonic model fit the data equally well).',
  'Galileo\'s opponents had rational grounds in 1616',
);

const M_CHALL = issue(
  113, ['dsp:challenge'],
  USERS.alice, '2026-03-20T10:00:00Z',
  meta({ type: 'challenge', challengeType: 'objection', rootId: 18, parentId: 18, disputeId: 311, context: 'historical' }) +
  '\n\nThe Tychonic model was a face-saving compromise invented specifically to avoid committing to heliocentrism while matching its predictions — citing it as "equal" evidence is motivated reasoning dressed as empiricism.',
);

const M_ANSWER = issue(
  211, ['dsp:answer'],
  USERS.frank, '2026-03-20T12:00:00Z',
  meta({ type: 'answer', rootId: 18, parentId: 113, disputeId: 311 }) +
  '\n\nThe Tychonic model\'s motivation is irrelevant to its empirical adequacy in 1616. Empirical underdetermination is a legitimate scientific principle — if two models fit all available data, both remain rational options. Retroactive "motivated reasoning" accusations require knowing which theory was true, which they did not.',
);

const M_DISPUTE = issue(
  311, ['dsp:dispute'],
  USERS.alice, '2026-03-20T10:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.alice.id, challengerLogin: 'alice',
    defenderId:   USERS.frank.id, defenderLogin:   'frank',
    rootPostId:   18,
    triggerChallengeId: 113,
    context: 'historical',
  }),
  'Dispute #311 — Galileo opponents (HISTORICAL context)',
);

// ---------------------------------------------------------------------------
// SCENARIO N — Apology Court
// Topic: dave's public apology to eve
// Resolved via accord in apology context
// ---------------------------------------------------------------------------

const N_ASSERT = issue(
  19, ['dsp:assertion'],
  USERS.dave, '2026-03-22T09:00:00Z',
  meta({ type: 'assertion', rootId: 19, parentId: null }) +
  '\n\nI publicly and unreservedly apologize to @eve for asserting without evidence in Dispute #307 that her challenge was made in bad faith. The challenge was legitimate. I was wrong and I retract the characterisation.',
  'Dave\'s public apology to @eve',
);

const N_CHALL = issue(
  114, ['dsp:challenge'],
  USERS.eve, '2026-03-22T11:00:00Z',
  meta({ type: 'challenge', challengeType: 'interrogatory', rootId: 19, parentId: 19, disputeId: 312, context: 'apology' }) +
  '\n\nDo you acknowledge that the accusation of bad faith was stated publicly and did reputational harm, and do you accept responsibility for that harm specifically — not merely the underlying factual error?',
);

const N_ANSWER = issue(
  212, ['dsp:answer'],
  USERS.dave, '2026-03-22T13:00:00Z',
  meta({ type: 'answer', rootId: 19, parentId: 114, disputeId: 312 }) +
  '\n\nYes. I acknowledge the statement was made publicly, that it caused reputational harm, and I take full responsibility for both the error and the harm it caused — not merely the underlying factual mistake.',
);

const N_DISPUTE = issue(
  312, ['dsp:dispute', 'dsp:resolved'],
  USERS.eve, '2026-03-22T11:00:00Z',
  meta({
    type: 'dispute',
    challengerId: USERS.eve.id,  challengerLogin: 'eve',
    defenderId:   USERS.dave.id, defenderLogin:   'dave',
    rootPostId:   19,
    triggerChallengeId: 114,
    context: 'apology',
  }),
  'Dispute #312 — Apology Court (RESOLVED)',
);

// ---------------------------------------------------------------------------
// RESCISSION — alice rescinds her own assertion #11
// ---------------------------------------------------------------------------

const RESCISSION_ALICE_11 = issue(
  1001, ['dsp:rescission'],
  USERS.alice, '2026-03-25T10:00:00Z',
  meta({
    type:     'rescission',
    recordId: 11,
    reason:   'I no longer hold this position after further reflection on the epistemic limitations of representative democracy at scale.',
  }),
  'Rescission of assertion #11 by alice',
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
  // Scenario H — DEFENDED verdict
  H_ASSERT, H_CHALL, H_ANSWER, H_DISPUTE,
  // Scenario I — CONTESTED verdict
  I_ASSERT, I_CHALL, I_ANSWER, I_DISPUTE,
  // Scenario J — Judgment flow (analysis + judgment + base-of-truth)
  J_ASSERT, J_CHALL, J_ANSWER, J_DISPUTE, J_ANALYSIS, J_JUDGMENT, J_BOT,
  // Scenario K — Dating context
  K_ASSERT, K_CHALL, K_DISPUTE,
  // Scenario L — Christian context
  L_ASSERT, L_CHALL, L_ANSWER, L_DISPUTE,
  // Scenario M — Historical context
  M_ASSERT, M_CHALL, M_ANSWER, M_DISPUTE,
  // Scenario N — Apology Court (resolved)
  N_ASSERT, N_CHALL, N_ANSWER, N_DISPUTE,
  // Rescission — alice rescinds assertion #11
  RESCISSION_ALICE_11,
];
