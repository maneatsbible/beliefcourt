# Data Model: judgmental.io

**Phase**: 1 — Design  
**Date**: 2026-04-18 (revised 2026-04-19)  
**Plan**: [plan.md](plan.md)

> **Revision note**: This document supersedes the original disputable.io data model. Entities have been renamed and extended to reflect the full judgmental.io vision. The implementation target is **Fly.io + SQLite + Hono** (not GitHub Issues). See plan.md for the full SQL schema.

---

## Entity Hierarchy

```
Claim                          ← root; the statement being disputed
 └── Case                      ← opened when any Record is challenged
      └── Duel                 ← 1v1 contest within a Case
           ├── Challenge        ← turn: contest a Record
           ├── Answer           ← turn: respond to a Challenge
           ├── Offer            ← parallel: propose resolution (non-blocking)
           ├── Response         ← parallel: accept/reject an Offer
           ├── Disposition      ← terminal state of the Duel
           ├── Moment           ← annotation on any Record (post-turn)
           ├── Analysis         ← post-Disposition; references Moments
           └── Judgment         ← verdict on Duel, grounded in BaseOfTruth
```

Any Record (Claim, Challenge, Answer, Offer, Response, SimilarityLink) can itself be challenged, opening a nested Case with its own Case View and Duel Chooser.

---

## Entities

### Person

Represents an authenticated user (SM OAuth — X, Threads, Bluesky, or GitHub).

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `integer` | DB auto-increment | Globally unique, immutable |
| `name` | `string` | SM handle prefixed `@` | e.g., `@alice` |
| `profilePicUrl` | `string` | SM OAuth `picture` | Display only |
| `isStrawman` | `boolean` | Derived | `true` if this is the system-level @strawman account |
| `isAi` | `boolean` | Set at registration | `true` if this Person is an AI persona (bot account) |
| `aiModel` | `string \| null` | Set at registration | The model identifier if `isAi` is true (e.g. `"gpt-4o"`) |
| `linkedPlatforms` | `string[]` | linked_identities table | All SM platforms this person has linked |

**Special instance — @strawman**: A placeholder identity used to import external content for immediate disputation. When you quote something from the internet (a tweet, an article, a public statement), you submit it as a Claim attributed to @strawman. A Challenge against that Claim is submitted simultaneously, summoning the original author. If and when the original author arrives and authenticates, they can claim ownership of the @strawman Claim, replacing @strawman with their own Person record. @strawman is not a persona; it is a beacon.

**Person constraints**:
- A Person MUST NOT challenge their own Record.
- A Person MUST NOT challenge a Claim they have agreed with.
- A Person MUST NOT challenge the same Record more than once.

---

### Record (abstract — implementation only)

The base of all user-created content. Every Record is a row in the `records` table. Not a domain term — users never see the word "Record." Its subtypes are the real entities.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `integer` | DB auto-increment | Globally unique |
| `type` | `enum` | DB column | `"claim"`, `"challenge"`, `"answer"`, `"offer"`, `"response"` |
| `authorId` | `integer` | DB foreign key | Person who created the Record |
| `strawmanClaimId` | `integer \| null` | DB column | Set when @strawman is replaced by the real author; points to original Claim id |
| `parentId` | `integer \| null` | DB column | Parent Record id; `null` for root Claims |
| `caseId` | `integer \| null` | DB column | The nearest ancestor Claim or challenged Record that is the subject of this Record's Case |
| `text` | `string \| null` | DB column | Optional for non-Claim records |
| `imageUrl` | `string \| null` | DB column | Path or URL of attached image |
| `sourceUrl` | `string \| null` | DB column | Original URL when Claim was imported via @strawman |
| `isAi` | `boolean` | DB column | `true` if entirely AI-generated |
| `aiModel` | `string \| null` | DB column | AI model identifier if `isAi=true` or AI-assisted; e.g. `"gpt-4o"` |
| `aiAssisted` | `boolean` | DB column | `true` if human-authored but substantially AI-assisted |
| `createdAt` | `ISO8601` | DB `created_at` | |
| `authorId` | `number` | GitHub issue `user.id` | Person who created the Issue |
| `strawmanClaimId` | `number \| null` | `JDG:META.strawmanClaimId` | Set when @strawman is replaced by the real author; points to original Claim id |
| `parentId` | `number \| null` | `JDG:META.parentId` | Parent Record id; `null` for root Claims |
| `caseId` | `number \| null` | `JDG:META.caseId` | The nearest ancestor Claim or challenged Record that is the subject of this Record's Case |
| `text` | `string \| null` | Issue body (after meta block) | Optional for non-Claim records |
| `imageUrl` | `string \| null` | `JDG:META.imageUrl` | GitHub issue attachment URL |
| `sourceUrl` | `string \| null` | `JDG:META.sourceUrl` | Original URL when Claim was imported via @strawman |
| `createdAt` | `ISO8601` | GitHub `created_at` | |

**Validation rules**:
- Root Claims (`parentId === null`): MUST have `text` XOR `imageUrl` (not both, not neither).
- Non-root Records: MAY have both `text` and `imageUrl`.
- All Records: Issue body is immutable after creation (append-only).

---

### Claim (extends Record)

The root statement being disputed. What people agree or disagree with. The subject of every Case.

| Field | Type | Notes |
|-------|------|-------|
| `isStrawmanPlaceholder` | `boolean` | `true` while attributed to @strawman pending the real author's arrival |
| `originalAuthorHandle` | `string \| null` | The attributed author's handle (e.g. `@realuser` on another platform) when imported |

**State** (derived from child Cases and Accords):

```
OPEN ────────(first Case opened)──────────► DISPUTED
DISPUTED ───(all Duels reach Disposition)──► SETTLED | DEFAULTED | STANDING
```

- **STANDING**: Claim has been challenged and survived — all Cases closed, no Defaults, no Accords that conceded the Claim.
- **SETTLED**: An Accord was reached that resolves the Claim.
- **DEFAULTED**: A Duel ended by Default (deadline passed, no Answer).

A Claim in STANDING state carries epistemic weight — it has been tested and held.

---

### Challenge (extends Record)

Contests a Record. Opens a new Case on that Record and creates a Duel within it.

| Field | Type | Notes |
|-------|------|-------|
| `challengeType` | `enum` | `"interrogatory"` (Y/N question) or `"objection"` (free-form) |
| `subjectRecordId` | `number` | The Record being challenged |

**Constraints**:
- `authorId` MUST NOT equal the `authorId` of the challenged Record.
- Only one Challenge per Person per Record.
- A Challenge can itself be challenged, opening a nested Case.

---

### Answer (extends Record)

Responds to a Challenge within a Duel's turn sequence.

| Field | Type | Notes |
|-------|------|-------|
| `yesNo` | `boolean \| null` | REQUIRED for Interrogatory; `null` for Objection |
| `challengeId` | `number` | The Challenge being answered |

**Constraints**:
- `yesNo` MUST be `true` or `false` if the parent Challenge is Interrogatory.
- `yesNo` MUST be `null` if the parent Challenge is Objection.
- An Answer can itself be challenged, opening a nested Case.

---

### Offer (extends Record)

Proposes resolution of a Duel. Runs in parallel to the Challenge/Answer turn sequence — does not block or pause turns.

| Field | Type | Notes |
|-------|------|-------|
| `duelId` | `number` | The Duel this Offer belongs to |
| `subjectRecordId` | `number` | The Record whose disposition this Offer proposes |
| `terms` | `string` | The proposed resolution statement |

**Constraints**:
- Person MUST be a party in the Duel.
- An Offer can itself be challenged, opening a nested Case.

---

### Response (extends Record)

Accepts or rejects an Offer.

| Field | Type | Notes |
|-------|------|-------|
| `offerId` | `number` | The Offer being responded to |
| `accepted` | `boolean` | `true` = accepted; `false` = rejected |

**Constraints**:
- `authorId` MUST be the OTHER party from the Offer's author.
- An accepted Response produces an Accord (see below).
- A Response can itself be challenged, opening a nested Case.

---

### Rescission

A Person's public declaration that they no longer hold a Record they authored. Append-only — the original Record is never deleted or hidden. The Rescission is visible on the original Record as a prominent notice.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `recordId` | `integer` | The Record being rescinded |
| `authorId` | `integer` | MUST equal the original Record's `authorId` |
| `reason` | `string \| null` | The person's stated reason for rescinding |
| `createdAt` | `ISO8601` | |

**What a Rescission does**:
- The original Record gains a `[RESCINDED]` notice and visual treatment (strike-through author attribution, muted border).
- The author is no longer summoned as a defender for that Record going forward — they are not obligated to defend a position they have publicly abandoned.
- **Active Duels are not closed.** Any in-progress Duel involving the rescinded Record continues to its Disposition unchanged. The Rescission is surfaced as a notice in the Case View.
- **ClaimAccords are not voided.** Others who agreed with a rescinded Claim retain their agreement; the Claim's history is preserved. The author's own ClaimAccord on their own rescinded Claim is implicitly superseded but not deleted.
- The Rescission Record itself is challengeable — anyone may open a Case questioning whether the rescission is sincere or in good faith.

**What a Rescission does NOT do**:
- It does not delete, hide, or alter the original Record.
- It does not close Cases or Duels.
- It does not remove ClaimAccords held by others.
- It does not remove the Record from the Miranda pool — the rescinded Record remains admissible as cross-record Evidence by anyone in any Duel.

**Virtue framing**: A Rescission on a STANDING Claim — one that had been challenged and survived — is a significant epistemic act. It is displayed prominently in the Velocity and Flip Rate analytics views, and on the author's Person card, as a mark of intellectual courage: the willingness to publicly abandon a defended position.

**Constraints**:
- Only the original `authorId` may create a Rescission on a Record.
- One Rescission per Record; duplicate Rescission attempts return a conflict error.
- A Rescission cannot be rescinded (it's a declaration, not a position).

---

### Case

A dispute opened against a specific Record. One Case per challenger per Record (multiple people challenging the same Record each open their own Case). Contains one or more Duels.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `number` | GitHub issue number | |
| `subjectRecordId` | `number` | `JDG:META.subjectRecordId` | The Record this Case is against |
| `openedByPersonId` | `number` | `JDG:META.openedByPersonId` | Person who challenged the Record |
| `triggerChallengeId` | `number` | `JDG:META.triggerChallengeId` | The Challenge that opened this Case |
| `createdAt` | `ISO8601` | GitHub `created_at` | |

---

### Duel

A first-class 1v1 contest within a Case between two Persons.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `number` | GitHub issue number | |
| `caseId` | `number` | `JDG:META.caseId` | The Case this Duel belongs to |
| `challengerId` | `number` | `JDG:META.challengerId` | Person who issued the opening Challenge |
| `defenderId` | `number` | `JDG:META.defenderId` | Person defending the subject Record |
| `currentTurnPersonId` | `number` | Derived from turn sequence | On creation: `defenderId` |
| `disposition` | `enum \| null` | Derived from child Records | `null` while active; see Disposition below |
| `deadline` | `DeadlineConditions \| null` | Derived from child Issues | |
| `createdAt` | `ISO8601` | GitHub `created_at` | |

**Turn derivation rule**: The Person whose last action was answered is "waiting." The other person is "to move." Duel turn state is independent of any other Duel, including nested Duels on Records within this Duel.

**Multiple Duels per Case**: If a Claim has multiple agreers (via Accord) and one Person challenges it, the Case is shared but each agre-er who responds opens their own Duel within that Case. The Case View shows a **Duel Chooser** listing all Duels.

---

### Disposition

The terminal state of a Duel. Written as a child GitHub Issue when the Duel concludes. Immutable once written.

| Field | Type | Notes |
|-------|------|-------|
| `duelId` | `number` | |
| `type` | `enum` | `"accord"`, `"default"`, `"withdrawal"` |
| `triggeredByPersonId` | `number` | First client to detect and write the Disposition |
| `detectedAt` | `ISO8601` | Client-detected time |
| `createdAt` | `ISO8601` | GitHub `created_at` |
| `isContested` | `boolean` | Derived — `true` if a nested Case exists against this Disposition Record |

**Disposition types**:
- **ACCORD**: Both parties accepted an Offer. Duel is resolved by agreement.
- **DEFAULT**: Deadline passed with no Answer. Challenger wins by Default. The party who failed to answer is "in default." The first client to load the Duel View past the deadline writes this record.
- **WITHDRAWAL**: A party withdrew from the Duel (future feature).

A Disposition Record can itself be challenged, opening a nested Case to contest the ruling.

---

### DeadlineConditions

Negotiated countdown conditions within a Duel. Replaces "CricketsConditions."

| Field | Type | Notes |
|-------|------|-------|
| `duelId` | `number` | Parent Duel |
| `proposedByPersonId` | `number` | Who proposed the conditions |
| `agreedByPersonId` | `number \| null` | `null` until accepted |
| `durationMs` | `number` | Agreed countdown per Challenge turn in milliseconds |
| `active` | `boolean` | `true` once both parties agree |
| `currentDeadlineIso` | `ISO8601 \| null` | Absolute deadline for the current unanswered Challenge |
| `proposalIssueId` | `number` | The GitHub Issue recording the proposal |

**State transitions**:
```
PROPOSED ──(other party accepts or counter-proposes)──► NEGOTIATING
NEGOTIATING ──(both agree)──► ACTIVE
ACTIVE ──(deadline passes, no answer)──► DEFAULT triggered
```

---

### Accord

Records a successfully resolved Duel — both parties accepted an Offer. A first-class record produced by an accepted Response.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `duelId` | `number` | The Duel that reached Accord |
| `offerId` | `number` | The Offer that was accepted |
| `responseId` | `number` | The Response that accepted it |
| `createdAt` | `ISO8601` | |

---

### ClaimAccord

Records that a Person has agreed with a Claim without a Duel — a standing agreement. Makes the Person eligible to defend the Claim if it is challenged.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `claimId` | `number` | The Claim agreed with |
| `personId` | `number` | The Person who agreed |
| `createdAt` | `ISO8601` | |

**Constraints**:
- A Person MUST NOT agree with a Claim they authored.
- A Person who holds a ClaimAccord MUST NOT challenge that same Claim.
- One ClaimAccord per Person per Claim.

---

### Moment

A timed annotation on any Record, attached during or after a Duel. Referenced in Analysis.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `subjectRecordId` | `number` | The Record this Moment annotates |
| `duelId` | `number` | The Duel context |
| `authorId` | `number` | |
| `text` | `string` | The annotation |
| `createdAt` | `ISO8601` | |

---

### Analysis

Post-Disposition structured review of a Duel. References Moments. Required before Judgment can be rendered.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `duelId` | `number` | The Duel being analysed |
| `authorId` | `number` | |
| `momentIds` | `number[]` | `JDG:META.momentIds` — Moments cited |
| `text` | `string` | The analysis text |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Analysis MAY only be submitted after the Duel has a Disposition.
- Any Person (not just parties) may submit Analysis.

---

### Judgment

A Person's verdict on a Duel, grounded in their Base of Truth. The accumulation of Judgments is the knowledge base.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | DB auto-increment |
| `duelId` | `number` | The Duel being judged |
| `judgeId` | `number` | The Person rendering judgment |
| `analysisId` | `number` | The Analysis this Judgment is based on |
| `verdict` | `enum` | `"challenger"` or `"defender"` — who prevailed |
| `baseOfTruthClaimId` | `number` | The Person's anchor Claim from their Base of Truth |
| `reasoning` | `string` | Why this verdict follows from the Base of Truth |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Judgment requires a completed Analysis and a Disposition.
- The judge's `baseOfTruthClaimId` MUST be a Claim the judge holds a ClaimAccord on and that is in STANDING state (unchallenged or challenge survived).
- A Person MAY NOT judge a Duel they were a party to.

**Judgment weight** (computed at query time, never stored):
```
weight(judgment) = strength(anchor_claim) × judgment_track_record(judge)

strength(anchor_claim) = count(ClaimAccords on that Claim) × survived_duels(that Claim)

judgment_track_record(judge) =
  count(prior Judgments by judge that aligned with eventual Accord outcome)
  ÷ count(all prior Judgments by judge on disposed Duels)
  (defaults to 1.0 for judges with no prior record)
```
This weight is applied when aggregating Judgments on a Duel into a consensus display. A judge who has consistently agreed with Accord outcomes carries more weight than one whose verdicts have not correlated with resolved outcomes. Neither metric is stored; both are derived from the live dataset on each query.

---

### BaseOfTruth

A Person's declared anchor Claim — the foundation from which they judge. A Person's Base of Truth is the set of Claims they hold as true, anchored to one root Claim they have defended or that stands unchallenged.

| Field | Type | Notes |
|-------|------|-------|
| `personId` | `number` | |
| `anchorClaimId` | `number` | The root Claim this person has declared as their foundation |
| `agreedClaimIds` | `number[]` | All Claims this Person holds ClaimAccords on (derived) |
| `declaredAt` | `ISO8601` | When the anchor was set |

The weight of a Person's Judgments is a function of two factors computed at query time from the dataset — neither is stored:
1. **Anchor Claim strength**: `count(ClaimAccords on anchor) × survived_duels(anchor)`. A Claim that has been tested and held in more Duels anchors a stronger epistemic foundation.
2. **Track record**: the fraction of the Person's prior Judgments that aligned with eventual Accord outcomes. Consistent alignment with outcomes reflects trustworthy judgment.

**Claim strength query** (derived, not stored):
```
strength(claim) = count(ClaimAccords) × survived_duels(claim)
survived_duels(claim) = count(Duels where disposition=STANDING and subjectRecordId=claim.id)
```

---

### SimilarityLink

A Person's assertion that two Records are conceptually equivalent — e.g. the same argument made twice. Treated as a first-class Record: it can be agreed with, challenged, and have Cases opened against it. Equivalence is determined by community consensus, not by algorithm.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `authorId` | `number` | Person asserting the equivalence |
| `recordAId` | `number` | First Record |
| `recordBId` | `number` | Second Record |
| `reasoning` | `string` | Why these Records are equivalent |
| `createdAt` | `ISO8601` | |

When a SimilarityLink is in STANDING state (challenged and survived, or unchallenged), the system can surface the prior Duel as a **Precedent** for any new Challenge against an equivalent Record — sparing parties from re-litigating settled ground.

---

### Evidence

A structured attachment on any Record, providing supporting material. Not itself a turn in a Duel — it is attached at record-creation time or added post-hoc.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `recordId` | `integer` | The Record this Evidence supports |
| `authorId` | `integer` | Person who attached it |
| `attachmentType` | `enum` | `"url"`, `"quote"`, `"image"`, `"file"`, `"cross_record"` |
| `title` | `string \| null` | Optional display label |
| `url` | `string \| null` | For `url` and `image` types |
| `text` | `string \| null` | For `quote` type |
| `filePath` | `string \| null` | For `file` type (server-stored path) |
| `sourceUrl` | `string \| null` | Original source URL for `quote` type |
| `sourceRecordId` | `integer \| null` | For `cross_record` type — the cited Record's id |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Evidence is append-only; it cannot be removed once attached.
- Evidence attached to a Record is visible to all viewers of that Record.
- For `cross_record` type: `sourceRecordId` MUST reference an existing Record; `url`, `text`, and `filePath` MUST be null.

**Miranda Principle**: Any Record on judgmental.io — Claim, Challenge, Answer, Offer, Response — may be submitted as `cross_record` Evidence in any Duel in which its author is a party. Everything is on the record. Every position a Person has ever taken is admissible against them. This is not a feature; it is the constitutional foundation of the platform.

---

### Exhibit

A formally submitted Evidence item within a Duel, assigned an auto-incrementing exhibit label (Exhibit A, B, C …). Either party may submit Evidence as an Exhibit, and either party may object to an Exhibit.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `duelId` | `integer` | The Duel this Exhibit belongs to |
| `evidenceId` | `integer` | The underlying Evidence item |
| `submittedByPersonId` | `integer` | The Duel party who formally submitted it |
| `exhibitLabel` | `string` | Auto-assigned: "A", "B", "C", … (scoped per Duel) |
| `isObjected` | `boolean` | Derived — `true` if a nested Case exists against this Exhibit |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Only Duel parties may submit Exhibits.
- Objecting to an Exhibit opens a nested Case against the Exhibit Record (same mechanic as contesting any Record).
- Labels are auto-assigned sequentially within the Duel; they are not editable.

---

### Tip

A voluntary peer-to-peer monetary support. Platform fee is 0% in v1.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `fromPersonId` | `integer` | The Person sending the tip |
| `toPersonId` | `integer` | The Person receiving the tip |
| `amountCents` | `integer` | Amount in smallest currency unit |
| `currency` | `string` | ISO 4217 code, e.g. `"USD"` |
| `subjectRecordId` | `integer \| null` | The Record that prompted the tip (optional) |
| `paymentProvider` | `enum` | `"stripe"`, `"kofi"` |
| `stripePaymentIntentId` | `string \| null` | Stripe payment intent id (for reconciliation) |
| `platformFeePercent` | `integer` | Always `0` in v1 |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Tips have no effect on any Record's strength, Judgment eligibility, Duel participation, or Claim visibility. Constitutional constraint — absolute.
- A Person may tip themselves (not blocked, but meaningless; payment providers handle self-tip prevention at their level).

---



```
Home View
 └── Claim cards (ranked by strength × activity)
      └── Case View  (cases against this Claim)
           └── Duel Chooser  (Duels within this Case)
                └── Case View  (for any nested challenged Record)
```

- **Home View**: Lists Claims ranked by derived strength. Shows "Your turn" badge where applicable.
- **Case View**: Shows all Cases opened against a Record. Displays a Duel Chooser when there are multiple Duels within a Case. Shows lineage breadcrumb for nested Cases.
- **Duel Chooser**: Lists all Duels within a Case with their disposition status.
- **Case View (Duel)**: The turn-by-turn view. Two lanes: challenger's Challenges on the left, defender's counter-Challenges on the right, interleaved chronologically. Offers/Responses surfaced without blocking the lane. Moments, Analysis, and Judgments accessible post-Disposition.

---

## Disposition State Transitions

```
                       ┌─────────────────┐
                       │     ACTIVE      │
                       └────────┬────────┘
          ┌──────────────────────┼───────────────────────┐
          ▼                      ▼                       ▼
   Both accept Offer    Deadline passes,          (ongoing turns)
          │              no Answer
          ▼                      ▼
       ACCORD               DEFAULT_PENDING
                                  │
                       ┌──────────┴───────────┐
                       ▼                      ▼
               Disposition contested    Not contested
                       │                      │
                       ▼                      ▼
               nested Case opened         DEFAULT (final)
```

---

## Record Type Icons (UI mapping)

| Record Type | Icon | CSS class |
|-------------|------|-----------|
| Claim | `!` | `.icon-claim` |
| Challenge | `?` | `.icon-challenge` |
| Answer | `✓` | `.icon-answer` |
| Offer | `⇌` | `.icon-offer` |
| Response | `·` accepted / `✗` rejected | `.icon-response` |

---

## Entity → Database Table Mapping

| Entity | Table | Key columns |
|--------|-------|-------------|
| Person | `persons` | `id`, `name`, `profile_pic_url`, `is_strawman`, `is_ai`, `ai_model` |
| LinkedIdentity | `linked_identities` | `person_id`, `platform`, `platform_user_id` |
| Record (all types) | `records` | `id`, `type`, `author_id`, `parent_id`, `case_id`, `text`, `image_url`, `source_url`, `is_ai`, `ai_model`, `ai_assisted` |
| Case | `cases` | `id`, `subject_record_id`, `opened_by_person_id`, `trigger_challenge_id` |
| Duel | `duels` | `id`, `case_id`, `challenger_id`, `defender_id` |
| Disposition | `dispositions` | `id`, `duel_id`, `type`, `triggered_by_person_id` |
| Accord | `accords` | `id`, `duel_id`, `offer_id`, `response_id` |
| ClaimAccord | `claim_accords` | `id`, `claim_id`, `person_id` |
| DeadlineConditions | `deadline_conditions` | `id`, `duel_id`, `duration_ms`, `agreed_by_person_id`, `active` |
| Moment | `moments` | `id`, `subject_record_id`, `duel_id`, `author_id`, `text` |
| Analysis | `analyses` | `id`, `duel_id`, `author_id`, `text` |
| AnalysisMoment | `analysis_moments` | `analysis_id`, `moment_id` |
| Judgment | `judgments` | `id`, `duel_id`, `judge_id`, `analysis_id`, `verdict`, `base_of_truth_claim_id` |
| BaseOfTruth | `base_of_truth` | `person_id`, `anchor_claim_id` |
| SimilarityLink | `similarity_links` | `id`, `author_id`, `record_a_id`, `record_b_id` |
| Evidence | `evidence` | `id`, `record_id`, `author_id`, `attachment_type`, `url`, `text`, `source_record_id` |
| Exhibit | `exhibits` | `id`, `duel_id`, `evidence_id`, `submitted_by_person_id`, `exhibit_label` |
| Rescission | `rescissions` | `id`, `record_id`, `author_id`, `reason` |
| Tip | `tips` | `id`, `from_person_id`, `to_person_id`, `amount_cents`, `subject_record_id` |
| PersonStats | `person_stats` | `person_id`, `judgment_track_record`, `updated_at` |
| AnalyticsSnapshot | `analytics_snapshots` | `id`, `bucket_at`, `record_count`, `accord_count`, `duel_count`, `judgment_count`, `tip_volume_cents` |
| SimilarityCluster | `similarity_clusters` | `record_id`, `cluster_id`, `updated_at` |
| CronRun | `cron_runs` | `id`, `job_name`, `started_at`, `finished_at`, `status`, `message` |
| ModerationFlag | `moderation_flags` | `id`, `record_id`, `flagged_by_person_id`, `reason`, `created_at`, `resolved_at`, `resolved_by_person_id` |
| TipDigest | `tip_digests` | `id`, `person_id`, `date`, `total_cents`, `tip_count` |

---

## Storage Architecture Notes

SQLite (WAL mode) on a Fly.io persistent volume is the canonical append-only ledger. All writes go through the Hono API server. Litestream continuously replicates every WAL frame to Tigris (S3-compatible object storage, free on Fly.io) for point-in-time restore.

**Append-only enforcement**: SQLite triggers prevent UPDATE/DELETE on content tables (`records`, `cases`, `duels`, `dispositions`, `accords`, `claim_accords`, `moments`, `analyses`, `judgments`, `similarity_links`, `evidence`, `exhibits`, `rescissions`). Only operational/cache tables (`deadline_conditions.active`, `maintenance_messages`, `person_stats`, `analytics_snapshots`, `similarity_clusters`, `cron_runs`, `moderation_flags`) allow updates or upserts.

**Known constraints at scale**:
- Single-writer SQLite means write throughput tops out at ~10k writes/day on a shared-cpu-1x machine.
- Graph traversal (lineage, nested Cases) is handled by recursive SQL CTEs — performant for typical chain depths of <10.
- Migration path to Postgres is documented in plan.md, triggered by write latency p95 > 200ms, file size > 5 GB, or need for multiple write instances.

**Read performance**:
- Indexes on `records.type`, `records.author_id`, `records.case_id`, `claim_accords.claim_id`, `duels.case_id`, `judgments.duel_id` cover all primary query paths.
- Home feed Claim strength is computed at query time using a single SQL query with two subquery aggregates — no stored score field.
- Analytics views are served as precomputed SQL queries with a 60-second TTL cache on the server.


---

## Controller Permission Gates

These are implemented in the Controller layer. The View reads these — it never decides them.

| Method | Rule |
|--------|------|
| `canChallenge(person, record)` | Person is authenticated AND person ≠ record.authorId AND no existing Challenge by person on this record AND (if Claim) person has no ClaimAccord on it |
| `canAnswer(person, challenge)` | Person is the current-turn player in the Duel AND challenge is unanswered |
| `canOffer(person, duel)` | Person is a party in the Duel AND duel has no Disposition |
| `canRespond(person, offer)` | Person is the OTHER party from the offer author AND duel has no Disposition |
| `canAgree(person, claim)` | Person is authenticated AND person ≠ claim.authorId AND no existing ClaimAccord by person on this claim AND person has not challenged this claim |
| `canRescind(person, record)` | Person is the `authorId` of the Record AND no Rescission already exists for that Record |
| `canJudge(person, duel)` | Person is NOT a party in the Duel AND duel has a Disposition AND a qualifying Analysis exists AND person has a declared BaseOfTruth with a STANDING anchor Claim. Weight of resulting Judgment is computed as `strength(anchor_claim) × judgment_track_record(person)` — see Judgment entity. |
| `canAnalyse(person, duel)` | Person is authenticated AND duel has a Disposition |
| `canDeclareDefault(duel)` | DeadlineConditions.active === true AND Date.now() > currentDeadlineIso AND no Disposition yet exists |
| `canContestDisposition(person, disposition)` | Person is the party ruled against AND disposition.isContested === false |
| `canLinkSimilarity(person, recordA, recordB)` | Person is authenticated AND recordA ≠ recordB AND no existing SimilarityLink between them by this person |
| `canAccessAdmin(person)` | `person.role === 'admin'` |
| `canModerate(person)` | `person.role` is `'admin'` or `'moderator'` |
| `canChangeRole(person, target)` | `person.role === 'admin'` AND target role transition is `member ↔ moderator` only (admins may not self-promote or demote other admins) |
| `canBan(person, target)` | `person.role === 'admin'` AND target is not an admin |

---

## Storage Architecture Notes

*(This section is superseded by the more detailed version in the Entity → Database Table Mapping section above. See plan.md for the full SQL schema and migration strategy.)*
