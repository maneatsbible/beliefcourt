/**
 * Client model: Duel
 * Maps API response rows from a case's duels array.
 */
export class Duel {
  constructor({
    id, case_id, status, round, challenge_record_id, answer_record_id,
    disposition_record_id, started_at, ended_at,
  }) {
    this.id                  = id;
    this.caseId              = case_id;
    this.status              = status;
    this.round               = round ?? 1;
    this.challengeRecordId   = challenge_record_id ?? null;
    this.answerRecordId      = answer_record_id ?? null;
    this.dispositionRecordId = disposition_record_id ?? null;
    this.startedAt           = started_at;
    this.endedAt             = ended_at ?? null;
  }

  get isActive()   { return this.status === 'active'; }
  get isPending()  { return this.status === 'pending'; }
  get isResolved() { return this.status === 'resolved'; }

  static fromApi(data) {
    if (!data) return null;
    return new Duel(data);
  }
}
