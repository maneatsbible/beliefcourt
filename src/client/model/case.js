/**
 * Client model: Case
 * Maps API response from GET /api/cases/:id.
 */
export class Case {
  constructor({
    id, claim_id, challenger_id, respondent_id, status,
    opened_at, closed_at, duels = [],
    challenger_handle, respondent_handle,
  }) {
    this.id               = id;
    this.claimId          = claim_id;
    this.challengerId     = challenger_id;
    this.respondentId     = respondent_id;
    this.status           = status;
    this.openedAt         = opened_at;
    this.closedAt         = closed_at ?? null;
    this.duels            = duels;
    this.challengerHandle = challenger_handle ?? null;
    this.respondentHandle = respondent_handle ?? null;
  }

  get isOpen()   { return this.status === 'open'; }
  get isClosed() { return this.status === 'closed'; }

  get displayStatus() {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }

  static fromApi(data) {
    if (!data) return null;
    return new Case(data);
  }
}
