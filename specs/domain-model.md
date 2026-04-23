# Truthbook — Unified Domain Model and Flow

| Field | Value |
|---|---|
| **Version** | `v0.0.1-pre-alpha` |
| **Status** | 🔥 Canonical Architecture |
| **Last updated** | 2026-04-21 |
| **Constitution** | [TRUTHBOOK-CONSTITUTION.md](/specs/TRUTHBOOK-CONSTITUTION.md) |

---

## The Complete Flow: Records → Ledger → Worldview → Case → Duel → Gallery → Judgment → Updated Ledger

### Phase 1: Record Creation — Foundation

```
Person (identity)
  ↓
  Author creates a Claim (root Record)
    ├─ Text OR Image (not both)
    ├─ Worldview Context (optional; declares epistemic frame)
    ├─ Evidence References (optional; links/attachments)
    └─ AI Disclosure (human / bot / ai-assisted)
      ↓
Record (signed, attributed, immutable)
  ├─ ID: globally unique, cryptographically signed
  ├─ Author: Person ID (permanent)
  ├─ Timestamp: creation sealed
  ├─ IntegrityHash: SHA256 proof
  └─ Status: OPEN (new Claim)
      ↓
Ledger Entry (appended, never rewritten)
  ├─ Stored in Truthbook Ledger (SQLite append-only)
  ├─ Replicated to backup storage (Litestream)
  └─ Visible to all Persons
```

**Worldview Contribution**: The Claim is now part of the Author's Worldview. The Claim is in their Record.

### Phase 2: Claim Visibility and Response Options

The Claim appears on the **Home Feed** (and relevant galleries/searches).

Any Person can now:
1. **Agree** — file a ClaimAccord, adding their voice to the Claim's strength
2. **Challenge** — contest the Claim by opening a Case

### Phase 3: Challenge Opens a Case

```
Person B (challenger) disagrees with Person A's Claim.
  ↓
Person B files a Challenge (a new Record)
  ├─ Type: Interrogatory (Y/N question) OR Objection (open challenge)
  ├─ Parent: the Claim being challenged
  ├─ Author: Person B
  ├─ Text: the actual challenge text
  └─ AI Disclosure: (human / bot / ai-assisted)
      ↓
Challenge Record (signed, attributed, stored, immutable)
      ↓
Case opened (container for this dispute)
  ├─ ID: globally unique
  ├─ Subject: the Record being challenged (the Claim)
  ├─ OpenedAt: timestamp
  ├─ Status: ACTIVE
  └─ ClaimAccords: records of who agreed with the Claim (context for judgment)
      ↓
Duel created (1v1 within this Case)
  ├─ PartyA (Challenger/Evangelist): Person B
  ├─ PartyB (Defender/Evangelist): Person A (or defender chosen by system)
  ├─ CurrentPhase: EVANGELIST (PartyB states position first)
  ├─ Turns: [] (empty, awaiting responses)
  └─ Deadline: 7 days (default, configurable)
      ↓
Gallery opened
  ├─ Visible to all Persons ("the People")
  ├─ Annotation capability: comment on Moments
  ├─ Judgment capability: after Disposition, judge the Duel
  └─ Status: WATCHING
```

**Worldview Contribution**: The Challenge is now part of Person B's Worldview. They have taken a public stance.

### Phase 4: Duel — JADE Role Sequence

The Duel proceeds through four phases, each with role transitions:

```
PHASE 1: EVANGELIST (Defender states position)
  ├─ CurrentHolder: Party B (Defender/Evangelist)
  ├─ Action: Submits Answer to the Challenge
  │   ├─ Type: (if Interrogatory) YES/NO + explanation
  │   └─ Type: (if Objection) open response
  ├─ Answer becomes a Record (signed, attributed, stored)
  ├─ Deadline: 7 days
  └─ Outcome: Answered or Defaulted
       ↓
PHASE 2: DEFENDER (Challenger cross-examines)
  ├─ Role flip: Party A now challenges Party B's Answer
  ├─ CurrentHolder: Party A (Challenger/Defender)
  ├─ Action: Files Counter-Challenge (new Record)
  │   ├─ Subject: Party B's Answer
  │   ├─ Type: Interrogatory or Objection
  │   └─ Depth: Can use nested Cases for procedural challenges
  ├─ Counter-Challenge becomes a Record (signed, attributed, stored)
  ├─ Deadline: 7 days
  └─ Outcome: Answered or Defaulted
       ↓
PHASE 3: ADVOCATE (Both seek accord)
  ├─ Role shift: from interrogation to negotiation
  ├─ Party A files Offer (resolution proposal)
  │   ├─ Text: "What if we agree on X?"
  │   ├─ Type: Full agreement, Partial accord, Stipulation, Settlement
  │   └─ Record: signed, attributed, stored
  ├─ Party B files Response (accept/reject)
  │   ├─ Accepted: Creates Accord Record, moves toward Disposition
  │   ├─ Rejected: may counter-offer
  │   └─ Record: signed, attributed, stored
  ├─ Offers run in parallel to Challenge/Answer turns (non-blocking)
  └─ Outcome: Accord reached, or impasse
       ↓
PHASE 4: JUDGE (Gallery renders verdict)
  ├─ Duel is closed to new turns
  ├─ GalleryBot prepares analysis Widgets
  │   ├─ Bible Widget (if scripture cited)
  │   ├─ Precedent Widget (prior similar cases)
  │   ├─ Logic Widget (structure of positions)
  │   ├─ Consensus Widget (People's agreement pattern)
  │   └─ Timeline Widget (turn sequence)
  ├─ Each Gallery member may now file a Judgment Record
  │   ├─ GroundedIn: their own Base of Truth / Worldview
  │   ├─ Verdict: (for Duel outcome) or (for Claim strength)
  │   ├─ Reasoning: open-ended explanation
  │   └─ Confidence: optional confidence score
  ├─ Judgments accumulate over time (Judgment Pattern emerges)
  └─ Outcome: STANDING (Claim survived), SETTLED (Accord), or DEFAULT
```

**Worldview Contribution**: Every Answer, Counter-Challenge, Offer, Response, and Judgment is part of each Person's Worldview. The full Duel record is their testimony.

### Phase 5: Disposition and Resolution

When the Duel reaches its terminal state:

```
Duel Disposition (one of five)
  ├─ 1. ACCORD (both parties agree)
  │     ├─ Creates Accord Record (signed, stored)
  │     ├─ Creates ClaimAccord if the Claim is settled
  │     ├─ Case closed
  │     └─ Claim status: SETTLED
  │
  ├─ 2. JUDGMENT (Gallery renders verdict)
  │     ├─ Accumulation of Judgment Records (from Gallery members)
  │     ├─ Judgment Pattern emerges (>50% vote direction)
  │     ├─ Disposition Record created (synthesis of Pattern)
  │     ├─ Case closed
  │     └─ Claim status: STANDING (if verdict favors Claim)
  │
  ├─ 3. DEFAULT (one party failed to respond)
  │     ├─ Defaulted party forfeits turn
  │     ├─ Default Judgment Record created by system
  │     ├─ Other party's position carries weight
  │     ├─ Case closed
  │     └─ Claim status: depends on which party defaulted
  │
  ├─ 4. RESCISSION (underlying Claim/Challenge withdrawn)
  │     ├─ Author files Rescission Record
  │     ├─ Original Record marked as rescinded (in Ledger)
  │     ├─ Author released from defense burden
  │     ├─ Duel moot, Case closed
  │     └─ Claim status: may reopen if other Challenges exist
  │
  └─ 5. STALEMATE (parties agree to disagree)
        ├─ Stalemate agreement Record created
        ├─ Case closed without resolution
        ├─ Both positions are recorded
        └─ Claim status: DISPUTED (permanent)
```

### Phase 6: Gallery Analysis and Judgment

After Disposition (or during final phase), the Gallery performs analysis:

```
Gallery Analysis
  ├─ Each Judgment Record captures:
  │   ├─ Author: the Judge (a Person)
  │   ├─ BaseOfTruth: their Worldview / epistemic frame
  │   ├─ Duel Link: reference to the Duel being judged
  │   ├─ Verdict: which party's position is more defensible
  │   ├─ Reasoning: explanation grounded in their worldview
  │   └─ Confidence: certainty level (optional)
  │
  ├─ Judgment Pattern (aggregate)
  │   ├─ Threshold: ≥66% of Judges agree on verdict
  │   ├─ Strength: weighted by Judge reputation/calibration
  │   └─ Produces: canonical Disposition Record
  │
  └─ Precedent (optional)
      ├─ Duel marked as Precedent if exceptional
      ├─ Means: cite this Duel for similar future cases
      ├─ Precedent is challengeable (new Case against Precedent meta-Record)
      └─ Precedent can be overturned
```

**Worldview Contribution**: Each Judgment is part of the Judge's Worldview. They have taken a public stance on what is true.

### Phase 7: Ledger Update and Worldview Recalibration

```
Ledger Appended
  ├─ New entries:
  │   ├─ All Challenge/Answer/Offer/Response Records from Duel
  │   ├─ All Judgment Records from Gallery
  │   ├─ Disposition Record (system-authored summary)
  │   └─ ClaimAccord or Rescission (if applicable)
  │
  ├─ Case closed (no new Records appended to this Case)
  ├─ Claim status updated (STANDING / SETTLED / DEFAULTED / DISPUTED)
  └─ Cached Worldviews invalidated (will recompute on next query)
      ↓
Worldview Recomputed (for each Person involved)
  ├─ Person A's Worldview: includes their Defense Record(s) and Judgment(s)
  ├─ Person B's Worldview: includes their Challenge Record and Answers
  ├─ Each Judge's Worldview: includes their Judgment Record
  │
  └─ Emergent Structures Updated
      ├─ Organization: clusters of aligned Worldviews
      ├─ Tradition Map: Jaccard similarity over faith-relevant Accords
      ├─ Match Profile: Compatibility score with others
      └─ Consensus Clusters: groups of People who consistently agree
```

---

## Entity Definitions

### Core Entities

#### Person
- **ID**: globally unique, immutable
- **Handle**: @username (reserved at first use, never changed)
- **Platforms**: linked social identities (X, Threads, Bluesky, GitHub)
- **Role**: Human, Bot, AI (disclosed at record-level)
- **Reputation**: calibration score (from historical Judgment accuracy)
- **Worldview**: computed from all Records authored by this Person

#### Record (abstract base)
- **ID**: globally unique, cryptographically signed
- **Type**: Claim, Challenge, Answer, Offer, Response, Judgment, Disposal, Accord, Rescission
- **Author**: Person ID (immutable)
- **Timestamp**: ISO8601 (sealed with Record)
- **IntegrityHash**: SHA256(id + author + type + text)
- **Status**: various (depends on Record type)
- **Content**: text (optional), image URL (optional), references
- **AI Disclosure**: human / bot / ai-assisted

#### Claim (extends Record)
- **Type**: "claim"
- **Text XOR Image**: must have one or the other (not both, not neither)
- **Worldview**: optional explicit epistemic frame
- **Evidence**: optional list of Evidence Records
- **Status**: OPEN → DISPUTED → (STANDING | SETTLED | DEFAULTED)
- **ClaimAccords**: counter — how many People agree

#### Challenge (extends Record)
- **Type**: "challenge"
- **Subject**: Record ID being challenged
- **ChallengeType**: Interrogatory (Y/N) or Objection (open)
- **Text**: the actual challenge
- **CaseID**: Case opened by this Challenge

#### Answer (extends Record)
- **Type**: "answer"
- **YesNo**: true/false (if parent Challenge is Interrogatory), null (if Objection)
- **Text**: explanation or response
- **Parent**: Challenge ID

#### Offer (extends Record)
- **Type**: "offer"
- **Text**: settlement proposal
- **OfferType**: Full agreement, Partial accord, Stipulation
- **Parent**: optional (may refer to Challenge or standalone)

#### Response (extends Record)
- **Type**: "response"
- **YesNo**: true/false (accept/reject)
- **Text**: explanation
- **Parent**: Offer ID

#### Judgment (extends Record)
- **Type**: "judgment"
- **DuelID**: the Duel being judged
- **Author**: the Judge (a Person)
- **BaseOfTruth**: epistemic frame / Worldview context
- **Verdict**: position favored (party A, party B, or tie)
- **Reasoning**: explanation
- **Confidence**: 0.0–1.0 (optional)

#### LogicAnnex (extends Record)
- **Type**: "logic_annex"
- **ParentRecordID**: Claim/Challenge/Answer/Judgment this annex is attached to
- **Form**: syllogism | argument-map | modal-logic-note | countermodel
- **Premises**: ordered list of stated premises
- **Inference**: declared inference pattern
- **Conclusion**: asserted conclusion
- **Status**: challengeable like any other Record

This record type embraces formal argument users while preserving core defended-belief process.

#### Accord (extends Record)
- **Type**: "accord"
- **OriginalClaim**: Claim ID (if this Accord settles a Claim)
- **Text**: agreed position
- **Parties**: list of Persons who agree
- **Status**: STANDING (survived challenge), SETTLED (resolved)

#### Rescission (extends Record)
- **Type**: "rescission"
- **RescindedRecord**: Record ID being withdrawn
- **Text**: reason (optional)
- **Author**: must equal the author of the rescinded Record

### Supporting Entities

#### Case
- **ID**: globally unique
- **Subject**: Record ID being challenged (usually a Claim)
- **OpenedBy**: Person ID
- **OpenedAt**: timestamp
- **Status**: ACTIVE → CLOSED
- **Duels**: list of 1v1 Duels within this Case
- **ClaimAccords**: records of who agreed with the Claim

#### Duel
- **ID**: globally unique
- **CaseID**: Case ID
- **PartyA**: Person ID (Challenger / Evangelist role opener)
- **PartyB**: Person ID (Defender / Evangelist role holder)
- **CurrentPhase**: EVANGELIST | DEFENDER | ADVOCATE | JUDGE
- **Turns**: list of Turn Records (Challenges, Answers, Offers, Responses)
- **Deadline**: timestamp (e.g., 7 days from phase start)
- **Status**: ACTIVE → CLOSED
- **Disposition**: ACCORD | JUDGMENT | DEFAULT | RESCISSION | STALEMATE

#### Moment
- **ID**: globally unique
- **DuelID**: Duel ID
- **TimeRange**: (startTurn, endTurn) — span of turns
- **Annotations**: list of Gallery comments on this span
- **GalleryBot**: system author

#### Worldview
- **PersonID**: the Person whose worldview this is
- **ComputedAt**: timestamp (cached, invalidated on Record updates)
- **Claims**: list of Claim Records authored
- **Challenges**: list of Challenge Records issued
- **Answers**: list of Answer Records submitted
- **Accords**: list of Accord Records reached
- **Judgments**: list of Judgment Records issued
- **RepScore**: calibration / reputation score

#### Organization
- **ID**: globally unique
- **Members**: list of Person IDs
- **Type**: Church, Business, Affinity Group, Other
- **TraditionMap**: Jaccard similarity scores between Members' Worldviews
- **Emergent**: true if auto-clustered; false if explicitly created

#### Space
- **ID**: globally unique
- **Name**: Public | Org Name | Private Group Name
- **Ledger**: local Belief Ledger (SQLite)
- **Members**: list of Person IDs with access
- **ConstitutionalVariant**: Truthbook standard or custom rules
- **ForkRight**: if corrupted, members may fork

#### Bot
- **PersonID**: the Bot's Person record
- **Model**: "gpt-4o", "claude-opus", etc.
- **Provider**: "OpenAI", "Anthropic", etc.
- **Provenance**: fully_synthetic | human_reviewed
- **CalibrationData**: historical accuracy scores
- **Developer**: Person ID of the Bot operator

#### Translation
- **ID**: globally unique
- **DuelID**: Duel ID (video duel)
- **VideoURL**: canonical source
- **Transcript**: AI-generated text
- **Model**: transcription model identifier
- **Challengeable**: true (errors in transcription can be contested)

#### Widget
- **ID**: stable identifier (e.g. bible, precedent, logic, consensus)
- **Version**: semantic version for reproducibility
- **InputRefs**: records, duels, persons, evidence used to compute output
- **Output**: structured payload rendered in UI
- **Provenance**: explainability block for "how computed"
- **AdvisoryOnly**: true (widgets do not issue binding judgments)

---

## State Machines

### Claim State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                          OPEN                                │
│                  (newly filed Claim)                         │
└─────────────────────────────────────────────────────────────┘
                          │
                (first Challenge filed)
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                       DISPUTED                               │
│           (at least one Case is ACTIVE)     │
└──────────────────────────────────────────────────────────────┘
                          │
          (all Cases CLOSED; roll up outcomes)
                          │
         ┌────────┬──────┴──────┬─────────────┐
         ↓        ↓             ↓             ↓
       DEFAULT  ACCORD      STANDING     STALEMATE
    (default   (accord    (survived      (agree to
     judgment  reached)   challenge)     disagree)
```

### Duel State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                       ACTIVE                                 │
│        (newly opened, awaiting Evangelist Answer)            │
└──────────────────────────────────────────────────────────────┘
                          │
          (Answer submitted or deadline reached)
                          │
         ┌─────────────────┴──────────────────┐
         │                                    │
         ↓ (Answered)                         ↓ (Defaulted)
   ┌──────────────┐               ┌────────────────────────┐
   │ ACTIVE       │               │ DEFAULT (Disposition)  │
   │ (next phase) │               │ (closed, non-binding)  │
   └──────────────┘               └────────────────────────┘
         │
         (loop through phases: EVANGELIST → DEFENDER → ADVOCATE)
         │
         ↓ (reaches JUDGE phase)
   ┌──────────────────────────────────────────────────────────┐
   │                        CLOSED                            │
   │       (Duel awaiting Gallery Judgment or Accord)         │
   └────────────────────────────────────────────────────────────┘
         │
         ├─ All Judgments entered
         │
         ↓
   ┌──────────────────────────────────────────────────────────┐
   │  [DISPOSITION] Final State:                              │
   │  ├─ ACCORD (via agreement)                               │
   │  ├─ JUDGMENT (via Gallery verdict)                       │
   │  ├─ RESCISSION (withdrawn)                               │
   │  └─ STALEMATE (agreed to disagree)                       │
   └──────────────────────────────────────────────────────────┘
```

### Case State Machine

```
ACTIVE (at least one Duel is ACTIVE)
  ↓ (all Duels reach Disposition)
CLOSED (ready for analysis)
  ├─ Outcomes:
  │  ├─ Claim STANDING (Challenge defended)
  │  ├─ Claim SETTLED (Accord reached)
  │  ├─ Claim DEFAULTED (defender failed to respond)
  │  └─ Claim DISPUTED (stalemate)
```

---

## Core Invariants

### Immutability
- No Record ever edited or deleted.
- Rescission does not delete; it appends a Rescission Record and marks the original as rescinded.
- The Belief Ledger is append-only.

### Attribution
- Every Record has exactly one Author.
- An Author cannot challenge their own Record.
- An Author cannot agree with a Claim they authored.

### Cryptographic Provenance
- Every Record is signed by the Author's private key.
- Every Record is timestamped and hash-linked to prior Records.
- The Belief Ledger is independently verifiable and replayable.

### Disclosure Obligation
- Every Record MUST declare: Human, Bot, or AI-Assisted authorship.
- Failure to disclose is a challengeable breach.
- Bad-faith non-disclosure is grounds for expulsion.

### Worldview Composition
- A Person's Worldview is computed deterministically from their Records.
- No inference. No hidden attributes.
- Worldviews are queryable and auditable.

### Gallery Authority
- The Gallery (People's Judgment) is the final authority on contested truth.
- No central judge or arbiter.
- Gallery votes (Judgment accumulation) are binding only if ≥66% agree.

### Constitution Authority
- The Constitution is the sole governing document.
- All features and processes must be consistent with Constitutional principles.
- Constitutional Amendment requires a Constitutional Duel and ≥66% Gallery approval.

### Widget Authority Boundary
- Widgets are analysis tools only; they cannot directly settle Cases.
- Every widget output is inspectable and attributable to source records.
- Widget outputs can be challenged by filing Records or Cases.

### Mobile-First UX
- Every critical analysis action is available on mobile.
- Widget interaction model must support collapsed, expanded, and fullscreen states.
- No evidentiary context may be hidden behind hover-only desktop interactions.

---

## Entity Dependency Graph

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PERSON (identity, reputation, linked platforms)                         │
│   ├─ authors                                                             │
│   │   ├─ RECORD (base entity for all epistemic acts)                   │
│   │   │   ├─ CLAIM (root statement — opens disputes)                   │
│   │   │   │   ├─ challenged by → CHALLENGE Record                      │
│   │   │   │   │   ├─ opens → CASE                                      │
│   │   │   │   │   │   └─ contains → DUEL(s)                            │
│   │   │   │   │   │       ├─ followed by → ANSWER Record               │
│   │   │   │   │   │       ├─ followed by → COUNTER-CHALLENGE Record    │
│   │   │   │   │   │       ├─ parallel with → OFFER Record              │
│   │   │   │   │   │       ├─ parallel with → RESPONSE Record           │
│   │   │   │   │   │       ├─ phase transitions → MOMENT (span)         │
│   │   │   │   │   │       │   └─ annotated by → GALLERY                │
│   │   │   │   │   │       └─ closed by → DISPOSITION (outcome)         │
│   │   │   │   │   │           └─ followed by → JUDGMENT Records        │
│   │   │   │   │   └─ can itself be challenged (nested CASE)            │
│   │   │   │   ├─ agreed with by → CLAIM_ACCORD Record                  │
│   │   │   │   └─ concludes with → ACCORD Record (if settled)           │
│   │   │   │                                                              │
│   │   │   ├─ RESCISSION (withdrawal of author's Record)                 │
│   │   │   ├─ JUDGMENT (verdict on a Duel, grounded in Worldview)       │
│   │   │   └─ ... all Records are stored in LEDGER                       │
│   │   │                                                                   │
│   │   └─ WORLDVIEW (computed at query time from Person's Records)      │
│   │       ├─ aggregates → Claims authored                              │
│   │       ├─ aggregates → Challenges issued                            │
│   │       ├─ aggregates → Accords reached                              │
│   │       ├─ aggregates → Judgments issued                             │
│   │       └─ produces → ORGANIZATION (emergent cluster)                │
│   │                                                                       │
│   ├─ includes in GALLERY (observes Cases and Duels)                    │
│   │   └─ may file → JUDGMENT Record                                    │
│   │                                                                       │
│   ├─ linked to → BOT (if synthetic)                                    │
│   │   ├─ model identifier (gpt-4o, claude-opus, etc.)                  │
│   │   └─ provenance disclosure                                          │
│   │                                                                       │
│   └─ member of → SPACE (isolated Ledger)                               │
│       └─ can fork (if governance fails) → new SPACE                    │
│                                                                           │
├─ administered by → TRANSLATION (AI transcript for video Duels)         │
│   ├─ source → video in uploaded format                                 │
│   ├─ derived → AI-generated transcript                                 │
│   └─ challengeable (errors can be contested)                           │
│                                                                           │
└─ governed by → CONSTITUTION (canonical, supersedes all)                │
    ├─ amended by → CONSTITUTIONAL DUEL                                  │
    └─ enforced via → BELIEF LEDGER (immutable, append-only)             │
```

---

## Canonical Emoji Mappings

| Entity | Emoji | Entity | Emoji |
|--------|-------|--------|-------|
| Record | 🧾 | Offset | ⚖️ |
| Ledger | 📚 | Challenge | ❓ |
| Worldview | 🌐 | Answer | ✅ |
| Claim | 💬 | Offer | 🤝 |
| Case | 📂 | Response | 👍 |
| Duel | ⚔️ | Accord | 🕊️ |
| Judgment | ⚖️ | Rescission | ↩️ |
| Person | 🧍 | Bot | 🤖 |
| Organization | 🏛️ | Translation | 🌍 |
| Space | 🧭 | Gallery | 👥 |

---

## Widget Registry (Constitutional Baseline)

1. Bible Widget: scripture context, cross references, translation comparison.
2. Precedent Widget: similarity-linked prior Cases and outcomes.
3. Logic Widget: formal structure diagnostics, including Logic Annex rendering.
4. Consensus Widget: aggregate people-judgment pattern.
5. Timeline Widget: turn and moment chronology.
6. Impact Widget: downstream influence graph.
7. Evidence Graph Widget: source network, citation paths, exhibit status.
8. Worldview Intersections Widget: overlap/conflict map between parties.
9. Translation Widget: transcript and language reconciliation, including video duel transcripts.
10. Bot Provenance Widget: bot disclosure lineage, model/provider/provenance trace.

### Mobile Widget Interaction Contract

1. Default card state is compact and scan-friendly.
2. One tap expands into readable detail.
3. Fullscreen inspector supports deep analysis without losing navigation context.
4. Controls must be thumb-reachable on standard phone viewports.
5. Heavy visualizations degrade gracefully to list/table representations on small screens.

---

## Next Sections

1. [Implementation Plan](plan.md) — Fly.io, Hono, SQLite (preserved from judgmental.io)
2. [Specification](spec.md) — Feature requirements aligned to Truthbook
3. [Tasks](tasks.md) — Implementation tasks in dependency order
