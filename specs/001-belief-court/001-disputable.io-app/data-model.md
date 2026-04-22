# Data Model: judgmental.io

| Field | Value |
|---|---|
| **Version** | `v0.1.0-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Phase** | 1 — Design |
| **Created** | 2026-04-18 |
| **Last revised** | 2026-04-22 |
| **Plan** | [plan.md](plan.md) |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Governed by** | [constitution.md](constitution.md) — supersedes all other documents |

---

## Spec Index

| Document | Role |
|---|---|
| [spec.md](spec.md) | Functional requirements |
| [plan.md](plan.md) | Implementation architecture and deployment |
| **[data-model.md](data-model.md)** | Database schema and entity definitions — you are here |
| [tasks.md](tasks.md) | Implementation tasks (SDLC) |
| [quickstart.md](quickstart.md) | Development environment setup |
| [research.md](research.md) | Pre-design unknowns and resolved decisions |
| [stakeholder-briefing.md](stakeholder-briefing.md) | Public financial projections and constitutional crowdfunding |
| [viral-growth-model.md](viral-growth-model.md) | Growth flywheels and acquisition model |
| [constitution.md](constitution.md) | **Governing document — supersedes all others** |

> **Revision note**: This document supersedes the original disputable.io data model. Entities have been renamed and extended to reflect the full judgmental.io vision. The implementation target is **Fly.io + SQLite + Hono** (not GitHub Issues). See plan.md for the full SQL schema.

---

## Table of Contents

- [Entity Hierarchy](#entity-hierarchy)
- [The Belief Ledger and Worldview](#the-belief-ledger-and-worldview)
- [Entities](#entities)
- [Record Card Controls](#record-card-controls)
- [Disposition State Transitions](#disposition-state-transitions)
- [Record Card Control Mapping (UI)](#record-card-control-mapping-ui)
- [Entity → Database Table Mapping](#entity--database-table-mapping)
- [Storage Architecture Notes](#storage-architecture-notes)
- [Controller Permission Gates](#controller-permission-gates)

---

## Entity Hierarchy

```
Claim                          ← root; the statement being disputed
Comment                        ← neutral Wall post on Person profile
 └── Case                      ← opened when any Record is challenged
      └── Duel                 ← 1v1 contest within a Case
           ├── Challenge        ← turn: contest a Record
           ├── Answer           ← turn: respond to a Challenge
           ├── Offer            ← parallel: propose resolution (non-blocking)
           ├── Response         ← parallel: accept/reject an Offer
           ├── Disposition      ← terminal state of the Duel
           ├── Moment           ← temporal span on a Duel (not a Record)
           │    └── Annotation  ← comment within a Moment (GalleryBot or human)
           ├── Analysis         ← post-Disposition; references Moments
           └── Judgment         ← verdict on Duel, grounded in BaseOfTruth
```

Any Record (Claim, Comment, Challenge, Answer, Offer, Response, SimilarityLink) can itself be challenged, opening a nested Case with its own Case View and Duel Chooser.

---

## The Belief Ledger and Worldview

Every entity that extends **Record** is a **Belief Ledger entry**. The Belief Ledger is the append-only SQLite store of all epistemic acts on the platform. Filing a Claim, posting a Comment on your Wall, issuing a Challenge, giving an Answer, making an Offer, reaching an Accord, posting a Rescission — these are all acts attributed to a Person and stored permanently in the Ledger. Together they constitute that Person's **worldview** as it exists on the platform.

**Challenges are first-class Belief Ledger entries.** Issuing a Challenge is not a procedural step in a turn sequence — it is an epistemic act asserting that a Record is wrong, unclear, or undefended. It is attributed to the challenger, stored as a Record, and contributes to their worldview. A Challenge may itself be challenged, opening a nested Case. That nested Challenge is also a Record, also attributed, also challengeable. The recursion is unbounded. Every layer of challenge and answer in any nested Duel is a Record in the Belief Ledger.

**Turn prompts are not Records.** A turn prompt is a question surfaced in the Composer UI to help a party articulate their position. It is a View-layer element only. It produces no Record, has no Ledger entry, is not challengeable, and does not contribute to anyone's worldview. The turn a person submits is a Record. The prompt that preceded it is not.

**Rescissions are append-only.** A Rescission does not delete the original Record. It appends a Rescission Record to the Ledger, releasing the author from the defender obligation on that Record going forward. The original Record is preserved permanently. A Person's worldview history — including positions they have since withdrawn — is always visible. Changing your mind is a worldview act; it belongs in the Ledger.

**Analytics queries the Belief Ledger but never writes to it.** Analytics (AI-assisted or otherwise) reads the Ledger as a source of population-level pattern data. It MUST NOT write inferred beliefs, implied positions, or derived Records back into any Person's Ledger. The Belief Ledger contains only what a Person actually did.

---

## Entities

### Person

Represents an authenticated user (SM OAuth — X, Threads, Bluesky, or GitHub).

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `integer` | DB auto-increment | Globally unique, immutable |
| `name` | `string` | SM handle prefixed `@` | e.g., `@alice` |
| `profilePicUrl` | `string` | SM OAuth `picture` | Display only |
| `isHerald` | `boolean` | Derived | `true` if this is the system-level @herald account |
| `isAi` | `boolean` | Set at registration | `true` if this Person is an AI persona (bot account) |
| `aiModel` | `string \| null` | Set at registration | The model identifier if `isAi` is true (e.g. `"gpt-4o"`) |
| `linkedPlatforms` | `string[]` | linked_identities table | All SM platforms this person has linked |

**Special instance — @herald**: A placeholder identity used to import external content for immediate disputation. When you quote something from the internet (a tweet, an article, a public statement), you submit it as a Claim attributed to @herald. A Challenge against that Claim is submitted simultaneously, summoning the original author. If and when the original author arrives and authenticates, they can claim ownership of the @herald Claim, replacing @herald with their own Person record. @herald is not a persona; it is a beacon. @herald is permanently reserved as a system handle — it is unavailable in the Person namespace and is neither a Person nor a Bot while unclaimed.

**Person constraints**:
- A Person MUST NOT challenge their own Record.
- A Person MUST NOT challenge a Claim they have agreed with.
- A Person MUST NOT challenge the same Record more than once.
- Person handles are globally unique across all Spaces.

---


### Record (abstract — implementation only)

The base of all user-created content. Every Record is a row in the `records` table. Not a domain term — users never see the word "Record." Its subtypes are the real entities.


**Authorship rules:**
- All Records must be authored by a Person (human), except for transcript Records, which may be authored by a Bot (StenoBot/TranscriptBot).
- Only Bots of type StenoBot/TranscriptBot may author a Record, and only of type `"transcript"`.
- All other Record types (`"claim"`, `"comment"`, `"challenge"`, `"answer"`, `"offer"`, `"response"`, etc.) must have a human Person as author.
- When a Person hires an AdvisorBot with Power of Attorney (PoA), the AdvisorBot may file Records on their behalf, but the Record is always authored by the Person, with a `[via AdvisorBot]` disclosure badge. The Bot is never the author; the Person is fully accountable for the Record.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `integer` | DB auto-increment | Globally unique |
| `type` | `enum` | DB column | `"claim"`, `"comment"`, `"challenge"`, `"answer"`, `"offer"`, `"response"`, `"transcript"`, ... |
| `authorId` | `integer \| null` | DB foreign key | Person who created the Record; null if authored by a Bot (for transcript only) |
| `botId` | `integer \| null` | DB foreign key | Bot who authored the Record (only for transcript) |
| `heraldClaimId` | `integer \| null` | DB column | Set when @herald is replaced by the real author; points to original Claim id |
| `parentId` | `integer \| null` | DB column | Parent Record id; `null` for root Claims |
| `caseId` | `integer \| null` | DB column | The nearest ancestor Claim or challenged Record that is the subject of this Record's Case |
| `text` | `string \| null` | DB column | Optional for non-Claim records |
| `imageUrl` | `string \| null` | DB column | Path or URL of attached image |
| `sourceUrl` | `string \| null` | DB column | Original URL when Claim was imported via @herald |
| `createdAt` | `ISO8601` | DB `created_at` | |

**Validation rules**:
- If `type === "transcript"`, then `botId` must be set and `authorId` must be null.
- For all other types, `authorId` must be set and `botId` must be null.
- Root Claims (`parentId === null`): MUST have `text` XOR `imageUrl` (not both, not neither).
- Non-root Records: MAY have both `text` and `imageUrl`.
- All Records: Issue body is immutable after creation (append-only).

---

### Translation

A Translation Record is a first-class entity allowing anyone (Person or Bot) to file a translation of any Record into any language. This is especially used to correct or improve a transcript Record authored by a Bot.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `sourceRecordId` | `integer` | The Record being translated (may be a transcript or any other Record) |
| `authorId` | `integer \| null` | Person who filed the translation (null if Bot) |
| `botId` | `integer \| null` | Bot who filed the translation (null if Person) |
| `language` | `string` | Target language code (e.g. "en", "es", "fr") |
| `text` | `string` | The translated text |
| `createdAt` | `ISO8601` | |

**Validation rules:**
- Exactly one of `authorId` or `botId` must be set.
- A Translation may be filed for any Record, but is especially used to correct or improve a transcript Record.

---

---

### RecordRelation

Declares the author's explicit speaking relation for a specific Record. Rendered in UI as `Speaking as [relation] of this belief record.`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `recordId` | `integer` | The Record this relation applies to |
| `authorId` | `integer` | Must match `records.author_id` |
| `relation` | `enum` | `"judge"`, `"advocate"`, `"defender"`, `"evangelist"`, `"investigator"` |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Exactly one active relation per authored Record.
- Only the Record author can set or change relation before first challenge; after challenge opens, relation is append-only history (new relation row, old row retained).
- `investigator` relation denotes active case reporting/research (journalistic, true-crime, or formal investigative mode).

---

### RecordControlState

Stores context-sensitive meaning and claim-indicator state for the three primary Record card controls.

| Field | Type | Notes |
|-------|------|-------|
| `recordId` | `integer` | Record whose controls are rendered |
| `context` | `enum` | `"reaction"`, `"response"`, `"interrogatory"` |
| `upMeaning` | `enum` | e.g. `"like"`, `"accept"`, `"yes"` |
| `neutralMeaning` | `enum` | e.g. `"no_claim"`, `"defer"`, `"not_answering"` |
| `downMeaning` | `enum` | e.g. `"dislike"`, `"reject"`, `"no"` |
| `claimDirection` | `enum \| null` | `"up"`, `"down"`, or `null` |
| `claimRecordId` | `integer \| null` | If control direction is claim-bearing, links to that Claim record |

**Constraints**:
- `claimDirection` MUST NEVER be `"neutral"`.
- Claim indicator (fire overlay) may only appear on up or down controls.
- A Record created from composer hint `I believe that...` (Start a Fire) defaults to `claimDirection="up"`.
- A previously neutral stance can become claim-bearing when challenged; in that event `claimDirection` transitions to up or down and `claimRecordId` is set.
- In Wall commentary context, direct down interaction is disabled; disagreement routes to Challenge composition.

---

### Claim (extends Record)

The root statement being disputed. What people agree or disagree with. The subject of every Case.

| Field | Type | Notes |
|-------|------|-------|
| `isHeraldPlaceholder` | `boolean` | `true` while attributed to @herald pending the real author's arrival |
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

### Comment (extends Record)

A neutral Wall post authored on a Person's profile. A Comment is on the Record but does not declare claim intent by default.

| Field | Type | Notes |
|-------|------|-------|
| `wallOwnerId` | `integer` | The profile owner whose Wall hosts this comment |
| `isNeutral` | `boolean` | Always `true` on creation |
| `isClaimBearing` | `boolean` | Derived; false at creation, may become true in dispute context |

**Constraints**:
- `type=comment` is the canonical Wall post type.
- New Comments render with neutral controls and no fire indicator.
- On the Wall surface, only up (like) and neutral controls are interactive for Comment records.
- Down/dislike is not an on-Wall interaction for Comment records; disagreement is expressed by filing a Challenge Claim in Court flow.
- A challenged Comment opens a Case like any other Record.
- If the challenged stance is defended in Duel flow, that stance is rendered as claim-bearing (fire) for that dispute context.
- Original Comment content remains append-only and does not mutate into a different record type.

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

Records a successfully resolved Duel — both parties accepted an Offer. A first-class record produced by an accepted Response. **Accord is a negotiated, on-record agreement and is a Belief Ledger entry.**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `duelId` | `number` | The Duel that reached Accord |
| `offerId` | `number` | The Offer that was accepted |
| `responseId` | `number` | The Response that accepted it |
| `createdAt` | `ISO8601` | |

---

### ClaimAccord

Records that a Person has agreed with a Claim without a Duel — a standing agreement. Makes the Person eligible to defend the Claim if it is challenged. **ClaimAccord is a Person’s standing agreement with a Claim, not requiring a Duel or negotiation. It is a Belief Ledger entry but does not result from negotiation.**

**UI/UX guidance:**
- The **up** button on a Claim means “I agree” (creates a ClaimAccord).
- The **up** button on an Offer means “I accept” (can lead to Accord if both parties accept).
- UI/UX must make this distinction explicit: “Agree” is a personal stance; “Accord” is a negotiated outcome. Only Accords resolve Duels.

---

### Annotation (Gallery one-liners)

A comment posted within a Moment — by a human or by GalleryBot. **Annotations are always off the record for everyone, including bots.** Annotations are not Records, not attributed as epistemic acts, and not challengeable. GalleryBot posts are not Belief Ledger entries.

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

A temporal span on a Duel — a named window of time marking a significant passage in the exchange. A Moment is **not a Record**: it is not attributed to a Person as an epistemic act, it is not challengeable, and it does not appear in the Belief Ledger. Moments are referenced in Analysis.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `duelId` | `integer` | The Duel this Moment belongs to |
| `label` | `string` | A descriptive label for the span (e.g., "Opening exchange", "Evidence phase") |
| `startRecordId` | `integer` | The Record that opens this Moment |
| `endRecordId` | `integer \| null` | The Record that closes this Moment; `null` = open |
| `createdAt` | `ISO8601` | |

---

### Annotation

A comment posted within a Moment — by a human or by GalleryBot. An Annotation is **not a Record**: it does not appear in the Belief Ledger, is not attributed as an epistemic act, and is not challengeable. GalleryBot Annotations are visually distinct from human Annotations and carry a `[GalleryBot]` badge.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `integer` | DB auto-increment |
| `momentId` | `integer` | The Moment this Annotation belongs to |
| `authorId` | `integer \| null` | Person who posted it; `null` if posted by a system Bot |
| `botId` | `integer \| null` | Bot that posted it (e.g., GalleryBot); `null` if human |
| `text` | `string` | The annotation text |
| `createdAt` | `ISO8601` | |

**Constraints**:
- Exactly one of `authorId` or `botId` MUST be non-null.
- An Annotation MUST NOT be considered a Belief Ledger entry — it is commentary on the Duel, not a worldview act.
- GalleryBot Annotations are not challengeable. A human Annotation is also not challengeable (Annotations are not Records).

---

### Analysis

Post-Disposition structured review of a Duel. References Moments. Required before Judgment can be rendered.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | GitHub issue number |
| `duelId` | `number` | The Duel being analyzed |
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

A Person's assertion that two Records are conceptually equivalent — e.g. the same claim made twice. Treated as a first-class Record: it can be agreed with, challenged, and have Cases opened against it. Equivalence is determined by community consensus, not by algorithm.

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

## Record Card Controls

Every Record card exposes three primary controls in fixed order:
1. Up
2. Neutral
3. Down

Control meaning is context-sensitive but layout is invariant.

- In reaction contexts: up/down map to like/dislike.
- In offer-response contexts: up/down map to accept/reject.
- In interrogatory contexts: up/down map to yes/no.
- Neutral denotes no claim intent and never carries claim-fire.

Fire-overlay semantics:
- Up and down controls may be rendered as claim-bearing by superimposing the control emoji over fire.
- Neutral control never carries fire.
- Start a Fire (`I believe that...`) creates a claim-bearing up control by default.
- If a neutral posture is disputed and becomes a filed claim, the resulting claim direction (up/down) takes fire and the filer is the defender of that claim.

---

## Record Card Control Mapping (UI)

| Context | Up | Neutral | Down | Fire Overlay Rule |
|---------|----|---------|------|-------------------|
| `reaction` | like | no-claim | dislike | up/down only |
| `response` | accept | no-claim | reject | up/down only |
| `interrogatory` | yes | no-claim | no | up/down only |
| `wall_commentary` | like | no-claim | disabled → Challenge Claim | fire only in Court context |

---

## Entity → Database Table Mapping

| Entity | Table | Key columns |
|--------|-------|-------------|
| Person | `persons` | `id`, `name`, `profile_pic_url`, `is_herald`, `is_ai`, `ai_model` |
| LinkedIdentity | `linked_identities` | `person_id`, `platform`, `platform_user_id`, `platform_handle` |
| Record (all types) | `records` | `id`, `type`, `author_id`, `parent_id`, `case_id`, `text`, `image_url`, `source_url`, `is_ai`, `ai_model`, `ai_assisted` |
| RecordRelation | `record_relations` | `id`, `record_id`, `author_id`, `relation`, `created_at` |
| RecordControlState | `record_control_states` | `record_id`, `context`, `up_meaning`, `neutral_meaning`, `down_meaning`, `claim_direction`, `claim_record_id` |
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
| Wall (derived view) | `records` | `type='comment' AND author_id=:person_id ORDER BY created_at DESC` |
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
| MaintenanceSubmission | `maintenance_submissions` | `id`, `email`, `message`, `submitted_at` |
| Notification | `notifications` | `id`, `person_id`, `type`, `subject_record_id`, `duel_id`, `read_at`, `created_at` — see note |

> **Notifications**: Notifications are stored rows (not computed on the fly) so they survive server restarts and can be polled efficiently. `type` values: `turn_pending`, `challenged`, `accord_reached`, `stale_duel_nudge`. Marked read when `GET /api/notifications` is polled with `mark_read=true`. Append-only: read state is stored as `read_at` timestamp, never deleted.

---

## Storage Architecture Notes

SQLite (WAL mode) on a Fly.io persistent volume is the canonical append-only ledger. All writes go through the Hono API server. Litestream continuously replicates every WAL frame to Tigris (S3-compatible object storage, free on Fly.io) for point-in-time restore.

**Append-only enforcement**: SQLite triggers prevent UPDATE/DELETE on content tables (`records`, `cases`, `duels`, `dispositions`, `accords`, `claim_accords`, `moments`, `analyses`, `judgments`, `similarity_links`, `evidence`, `exhibits`, `rescissions`). Only operational/cache tables (`deadline_conditions.active`, `maintenance_messages`, `person_stats`, `analytics_snapshots`, `similarity_clusters`, `cron_runs`, `moderation_flags`, `notifications.read_at`) allow updates or upserts.

**Reserved system persons**: Two `persons` rows are seeded before migration 001 completes and before any OAuth user is created:
- `id=1, name='@herald'` — placeholder identity for imported external content (B-010 resolved).
- `id=2, name='@system'` — server-side actor used for auto-generated `moderation_flags` (e.g. from `db-integrity` cron) and system `notifications`. Never returned by `GET /api/persons/:id` to public clients.

**Handle disambiguation**: If a new OAuth user's handle derived from their SM platform conflicts with an existing `persons.name`, the server appends a 4-digit random numeric suffix (e.g. `@alice` → `@alice4821`) and returns the resolved handle in the JWT. The original platform handle is stored separately in `linked_identities.platform_handle`.

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
