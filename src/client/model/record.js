/**
 * Client model: Record
 * Maps API response rows from GET /api/claims or GET /api/records/:id.
 */

export const RECORD_TYPES = {
  CLAIM:     'claim',
  CHALLENGE: 'challenge',
  ANSWER:    'answer',
  OFFER:     'offer',
  RESPONSE:  'response',
  JUDGMENT:  'judgment',
  VERDICT:   'verdict',
};

export class Record {
  constructor({
    id, type, author_id, case_id, text, url, integrity_hash,
    created_at, open_case_count, claim_agreement_count,
    author_handle, author_platform, author_profile_pic_url,
    is_ai, ai_model, status,
  }) {
    this.id                  = id;
    this.type                = type;
    this.authorId            = author_id;
    this.caseId              = case_id ?? null;
    this.text                = text ?? '';
    this.url                 = url ?? null;
    this.integrityHash       = integrity_hash ?? null;
    this.createdAt           = created_at;
    this.openCaseCount       = open_case_count ?? 0;
    this.claimAgreementCount = claim_agreement_count ?? 0;
    this.authorHandle        = author_handle ?? null;
    this.authorPlatform      = author_platform ?? null;
    this.authorProfilePicUrl = author_profile_pic_url ?? '';
    this.isAi                = !!is_ai;
    this.aiModel             = ai_model ?? null;
    this.status              = status ?? null;
  }

  get isClaim()     { return this.type === RECORD_TYPES.CLAIM; }
  get isChallenge() { return this.type === RECORD_TYPES.CHALLENGE; }
  get isJudgment()  { return this.type === RECORD_TYPES.JUDGMENT || this.type === RECORD_TYPES.VERDICT; }

  /** How disputed is this claim? >1 = more cases than agreements. */
  get strengthRatio() {
    return this.openCaseCount / Math.max(1, this.claimAgreementCount);
  }

  get displayCreatedAt() {
    if (!this.createdAt) return '';
    const d = new Date(this.createdAt);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  static fromApi(data) {
    if (!data) return null;
    return new Record(data);
  }
}
