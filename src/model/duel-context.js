/**
 * Duel context — the "mode" a Duel is filed in.
 *
 * The mechanic is identical across all contexts.
 * Context changes: UI framing, copy, role badge labels, and optional
 * context-specific features (prayer offer, public-record flag, etc.).
 *
 * One Workflow Engine. Every context.
 */

export const DUEL_CONTEXT_STANDARD   = 'standard';
export const DUEL_CONTEXT_DATING     = 'dating';
export const DUEL_CONTEXT_CHRISTIAN  = 'christian';
export const DUEL_CONTEXT_HISTORICAL = 'historical';
export const DUEL_CONTEXT_APOLOGY    = 'apology';

/**
 * Per-context framing configuration.
 *
 * @type {Record<string, {
 *   label:           string,
 *   icon:            string,
 *   filingParty:     string,
 *   respondingParty: string,
 *   examiningRole:   string,
 *   testifyingRole:  string,
 *   challengeVerb:   string,
 *   answerVerb:      string,
 *   offerVerb:       string,
 *   verdictLabel:    string,
 *   prayerOffer?:    boolean,
 *   alwaysPublic?:   boolean,
 * }>}
 */
export const DUEL_CONTEXT_FRAMING = {
  [DUEL_CONTEXT_STANDARD]: {
    label:           'Standard',
    icon:            '⚖️',
    filingParty:     'Challenger',
    respondingParty: 'Defender',
    examiningRole:   'EXAMINING',
    testifyingRole:  'TESTIFYING',
    challengeVerb:   'Challenge',
    answerVerb:      'Testify',
    offerVerb:       'Offer accord',
    verdictLabel:    'Judgment',
  },
  [DUEL_CONTEXT_DATING]: {
    label:           'Compatibility',
    icon:            '💘',
    filingParty:     'Challenger',
    respondingParty: 'Match',
    examiningRole:   'EXAMINING',
    testifyingRole:  'TESTIFYING',
    challengeVerb:   'Challenge',
    answerVerb:      'Respond',
    offerVerb:       'Offer alignment',
    verdictLabel:    'Compatibility verdict',
  },
  [DUEL_CONTEXT_CHRISTIAN]: {
    label:           'Doctrinal',
    icon:            '✝️',
    filingParty:     'Questioner',
    respondingParty: 'Defender',
    examiningRole:   'QUESTIONING',
    testifyingRole:  'TESTIFYING',
    challengeVerb:   'Question',
    answerVerb:      'Testify',
    offerVerb:       'Offer reconciliation',
    verdictLabel:    'Doctrinal judgment',
    prayerOffer:     true,
  },
  [DUEL_CONTEXT_HISTORICAL]: {
    label:           'Historical Re-trial',
    icon:            '🏛️',
    filingParty:     'Prosecution',
    respondingParty: 'Defence',
    examiningRole:   'EXAMINING',
    testifyingRole:  'DEFENDING',
    challengeVerb:   'Prosecute',
    answerVerb:      'Defend',
    offerVerb:       'Submit plea',
    verdictLabel:    'Historical verdict',
    alwaysPublic:    true,
  },
  [DUEL_CONTEXT_APOLOGY]: {
    label:           'Apology Court',
    icon:            '🕊️',
    filingParty:     'Petitioner',
    respondingParty: 'Respondent',
    examiningRole:   'ACKNOWLEDGING',
    testifyingRole:  'RESPONDING',
    challengeVerb:   'Contest',
    answerVerb:      'Respond',
    offerVerb:       'Offer remedy',
    verdictLabel:    'Resolution',
  },
};

/**
 * Get framing for a context, falling back gracefully to standard.
 * @param {string|null|undefined} context
 * @returns {typeof DUEL_CONTEXT_FRAMING[string]}
 */
export function getFraming(context) {
  return DUEL_CONTEXT_FRAMING[context] ?? DUEL_CONTEXT_FRAMING[DUEL_CONTEXT_STANDARD];
}
