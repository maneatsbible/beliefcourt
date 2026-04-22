# BELIEF COURT — Constitutional Charter

| Field | Value |
|---|---|
| **Version** | `1.0.0` — Constitutional Charter |
| **Status** | 🔥 Foundation |
| **Ratified** | 2026-04-21 |
| **Tagline** | **On the record. Light it up.** |
| **Authority** | Sovereign document. Supersedes all other governance. Amendment only by Popular Voice. |
| **Founder** | maneatsbible — implementing BELIEF COURT as constitutional P2P protocol grounded in faith in Jesus Christ |

---

## PREAMBLE

### Founding Conviction

BELIEF COURT exists because of one conviction:

**Truth is real. Truth can be known. People made in the image of God are capable of holding genuine convictions, defending them with integrity, and changing them through honest encounter.**

This platform is not built around the belief that argumentation wins debates. It is built around the conviction that *defended belief, when tested against the sincere challenge of another, can produce understanding, reconciliation, and genuine growth.*

Everything that follows — the constitutional structure, the duel process, the ledger architecture, the role system, the Gallery — flows from this conviction. When a design decision is hard to make, this is where the answer lives.

### Manifesto

**On the Record.**  
Every act is signed. Every claim is traced. Every challenge is recorded. No anonymous mob rule. No deleted arguments. No fake consensus. Every person stands in their name. Every voice leaves a mark in the People's ledger.

**Light it Up.**  
BELIEF COURT is fully peer-to-peer in constitution and implementation. Power belongs to the People, not gatekeepers. The system's design makes that inevitable, not aspirational. When duels settle disputes and the Gallery judges the proceedings, legitimacy flows from the People's voice — spread to every peer, impossible to centralize, impossible to kill.

**The Faith Foundation.**  
This is a platform for people who believe, grounded in Christian faith. People of other beliefs are welcome, but the platform is not *about* pluralism — it is *for* truth-seekers, foremost among these those who hold scripture as their highest authority. "By your words you are justified" (Matthew 12:37).

---

## ARTICLE I — SOVEREIGNTY OF THE PEOPLE

### Section 1.1 — Ledger Authority

The **Belief Ledger** is the sole source of truth. It is append-only, immutable, and cryptographically signed. Every Record — Claim, Challenge, Answer, Offer, Response, Judgment — is stored as a signed entry owned by its author.

The Ledger cannot be rewritten. It cannot be censored. It can be forked, but never falsified.

### Section 1.2 — Power Flows From Below

*No central sovereign exists.*

- The platform has no single judge, administrator, or arbiter with unilateral power over the Ledger.
- Every decision that affects collective governance (amendments to this Constitution, changes to the Duel process, disputes over whether the system is working) is resolved through the People's voice in a **Constitutional Duel** — a special case filed against this Constitution itself.
- The outcome of a Constitutional Duel is binding. If the majority of the People judge that an amendment passes, it passes.

### Section 1.3 — Fork Rights (the Ultimate Check)

If BELIEF COURT governance fails — if legitimacy is lost, if the Ledger is corrupted, if the process becomes tyrannical — the People have the right to fork.

- Any subset of the People may export their Records, their Duels, and their Judgments from the current Ledger.
- They may establish a new Ledger (a new Space) with its own governance rules.
- Both Ledgers remain valid and operational. The fork is binding.
- This is not a threat. This is a feature that makes centralized corruption impossible.

---

## ARTICLE II — THE BELIEF LEDGER

### Section 2.1 — Record Entities

Every Record is authored by exactly one Person. Every Record has:
- **ID**: globally unique, immutable, cryptographically signed
- **Author**: the Person who created it, never changeable
- **Timestamp**: creation time, sealed with the Record
- **Content**: text, images, or references — never edited, only rescinded
- **Integrity Hash**: SHA256 proof of authorship and contents


Record types:
1. **Claim** — An assertion of truth. Root of any dispute.
2. **Comment** — A neutral statement or Wall post, not a claim by default. Comments are for ordinary conversation, reflection, or sharing. They are on the record but do not assert a claim unless challenged.
  - If anyone disagrees with a Comment, a Claim Record is written, turning the Comment into a Claim for the purposes of dispute. The original Comment remains as context.
3. **Challenge** — Contests a Record. Opens a Case.
4. **Answer** — Responds to a Challenge within a Duel.
5. **Offer** — Proposes a settlement.
6. **Response** — Answers an Offer (accept, reject, counter, etc.).
7. **Judgment** — A verdict on a settled Duel, grounded in the Judge's worldview.

### Section 2.2 — Mandatory Disclosure Rules



Every Record MUST declare:
- **Authorship**: Human, Bot (with disclosure), or AI-Assisted

Evidence (attachments, links, supporting material) is a model detail, not a disclosure requirement. It may be attached to any Record, but is not itself a matter of disclosure.


Failure to disclose authorship creates a challengeable Record. Bad-faith non-disclosure (hiding AI authorship, hiding bot status) is grounds for expulsion from a Space.


### Section 2.3 — Immutability and Rescission

Records cannot be edited or deleted.

If an author wishes to withdraw a Record they authored:
1. They file a **Rescission Record** — a new entry in the Ledger announcing the withdrawal.
2. The original Record remains in the Ledger, marked as rescinded.
3. The author is released from the burden of defending the rescinded Record going forward.
4. The full history (original Record + Rescission) is visible forever.

**Changing your mind is a worldview act. It belongs in the Ledger.**

### Section 2.4 — Cryptographic Provenance

Every Record is:
- Signed by the author's private key
- Timestamped by the network clock
- Hash-linked to prior Records
- Replayable and independently verifiable

The Ledger is a cryptographic proof of what happened, not a claim about what happened.

---

## ARTICLE III — WORLDVIEWS AND CLAIMS

### Section 3.1 — Worldview Composition


A **Worldview** is not a survey response. It is not inferred by AI. It is computed from the Records a Person has authored and the ClaimAgreements and Settlements they have reached.

A Person's Worldview emerges from the composition of:
- **Claims they have filed** — what they assert to be true
- **Challenges they have issued** — what they contest
- **Answers they have given** — how they defend
- **Settlements they have reached** — where they changed their mind through negotiation
- **ClaimAgreements they have made** — where they have agreed with a Claim directly

The Worldview is deterministically derived at query time. No inference. No guessing. No hidden attributes.

### Section 3.2 — Claim as Root of Dispute

A **Claim** is:
- A statement of truth asserted by a Person
- Grounded in a Worldview (with optional explicit frame)
- Open to challenge by any other Person who disagrees

When a Claim is challenged, a **Case** is opened.

### Section 3.3 — CounterClaim Opens a Case

A **Challenge** to a Claim is the filing party's CounterClaim — "I contest this."

When a CounterClaim arises:
1. A **Case** is opened to contain the dispute
2. A **Duel** is created (1v1 within the Case)
3. The Case and Duel are recorded in the Belief Ledger
4. Both parties are notified

Multiple people who agree about a Claim may each challenge it independently, creating multiple Duels within the same Case.

---

## ARTICLE IV — THE DUEL PROCESS AND JADE ROLES

### Section 4.1 — The Duel

A **Duel** is a double-deposition submitted to witnesses (the Gallery) for judgment.

All disputes are settled by dueling. This is the constitutional settlement process. All parties stand equally. Both are interrogated. Both are questioned. The judgment comes from the People, not from a remote arbiter.

### Section 4.2 — JADE Role Sequence

Every Duel has four phases, marked by role transitions:

```
EVANGELIST
  ↓ (flip)
DEFENDER
  ↓ (flip)
ADVOCATE
  ↓ (flip)
JUDGE
  ↓ (exit)
```

Read backward (vertically from top to bottom): Evangelist → Defender → Advocate → Judge.

Each role is active during a phase of the Duel:

1. **Evangelist** — The initial challenger. States their position, their challenge, their stake in the truth. This is testimony under oath (figurative). Challenges the defender to stand.

2. **Defender** — The defending party. Attacks the challenge under pressure. Tests the Evangelist's position to destruction if possible. This is cross-examination. The roles are now inverted: the Defender interrogates.

3. **Advocate** — Both parties now seek common ground. Settlements are proposed. Narrowing of disagreement. Seeking overlap. The goal shifts from victory to understanding.

4. **Judge** — The Duel closes. The Gallery (and if applicable, a formal Judge Role) renders verdicts. No party acts in this phase; only judges speak.

### Section 4.3 — Turn Structure Within a Phase

Within each phase, parties exchange turns:
- **Challenges** and **Answers** (testimony and cross-examination)
- **Offers** and **Responses** (settlement proposals, running in parallel)
- **Objections** (procedural challenges to admissibility or fairness)

Every turn is a Record, immutable, attributed to the author.

### Section 4.4 — Deadline and Default

Every Duel has a deadline (default 7 days per turn, configurable by Case rules).

If a party fails to respond by the deadline:
- A **Default Judgment** is issued
- The defending party (in the current phase) forfeits the turn
- The non-defaulting party's position carries weight
- The Duel moves toward Disposition

No party can claim surprise; the countdown is public and visible in the Ledger.

### Section 4.5 — Disposition

A Duel ends in one of five Dispositions:

1. **Settlement** — Both parties reach negotiated agreement via accepted Offer. The Case is closed. A **ClaimAgreement** may be filed granting standing to the Claim (if it was contested) or recording the agreement.
2. **Judgment** — The Gallery renders a verdict. The Judgment Record is entered into the Ledger.
3. **Default** — One party failed to respond; the other's position stands by Default.
4. **Rescission** — One party withdraws the underlying Claim or Challenge; the Duel moot is dissolved.
5. **Stalemate** — Agreement to disagree. The Duel is closed; both positions are recorded.

### Section 4.6 — Precedent

When a Duel is Judged, the Judgment may be marked as **Precedent** by the filing party. This means: "If this issue arises again, you may cite this Duel and its Judgment as binding reasoning."

Precedent is challengeable. A new Duel can be opened against a Precedent Record, overturning it.

---

## ARTICLE V — THE GALLERY AND PEOPLE'S JUDGMENT

### Section 5.1 — The Gallery

During and after a Duel, the full Record is visible to the People. This is the **Gallery** — the standing audience of witnesses, analysts, critics, and judges.

The Gallery is not passive observation. The Gallery is the jury. The Gallery provides:
- **Annotations**: comments on Moments (temporal spans) within the Duel
- **Analyses**: structured investigation of the Duel using Widgets (see Article VI)
- **Judgments**: verdicts on the Duel and its outcome

### Section 5.2 — Gallery Judgment

Any Person who witnesses a Duel (after it reaches Disposition or at any point after filing) may enter a Judgment of their own.

A Judgment is:
- Grounded in the Judge's own **Base of Truth** (their Worldview, their epistemic frame)
- Entered as a Record in the Ledger
- Attributed to the Judge
- Challengeable by others (a new Case can open against the Judgment Record)

The Judgment does not determine the outcome. It is an added voice to the Ledger. Accumulation of Judgments from the Gallery creates a **Judgment Pattern** — the crystallization of the People's wisdom.

### Section 5.3 — Widgets and Analysis

The Gallery uses **Widgets** (investigative and presentation tools) to analyze Duels:

1. **Bible Widget** — Finds scripture references, contextualizes them, surfaces relevant passages
2. **Precedent Widget** — Links this Duel to prior Duels on similar claims
3. **Logic Widget** — Maps the logical structure of the arguments (diagnostic only; NOT a persuasion tool)
4. **Consensus Widget** — Shows where the People have already reached Settlement
5. **Timeline Widget** — Visualizes the Duel's turn sequence and Moment markers
6. **Impact Widget** — Traces how this Duel's Judgment has affected downstream Cases

All Widgets are post-hoc analysis tools. None influence the Duel's outcome. All are open-source and auditable.

---

## ARTICLE VI — BOT DISCLOSURE AND THE SM BOT PROBLEM

### Section 6.1 — All Bots Must Disclose

Any Person record that represents an artificial agent (not a human) MUST be marked as a Bot in the Ledger.

The Bot's Records MUST carry:
- **Model identifier** (e.g., `gpt-4o`, `claude-opus`, etc.)
- **Provider** (e.g., OpenAI, Anthropic)
- **Provenance**: whether the output is fully synthetic or human-reviewed
- **Calibration data**: historical accuracy/judgment scores if applicable

### Section 6.2 — Symmetric Disclosure and Challenge Rights

Bots have the same dueling rights as humans — they can file Claims, challenge Records, and issue Judgments.

However:
- Every Bot Record MUST be challengeable on grounds of provenance (opening a case against the Bot's accuracy)
- The Bot's developer is jointly liable for bot-authored Records (the developer's Person record is tagged as Bot operator)
- Bad-faith bot operation (hiding authorship, gaming Judgments) is grounds for expulsion from a Space

### Section 6.3 — Translation and AI Transcript

When a Duel occurs involving video (audio/video deposition), an AI transcript is auto-generated.

That AI transcript is:
- Marked as `aiAssisted: true`
- Tagged with the transcription model
- Challengeable — errors in transcription can be contested
- Preserved alongside the original video

The original video is the canonical source. The AI transcript is a derived index.

---

## ARTICLE VII — SPACES AND FEDERATION

### Section 7.1 — Spaces as Isolated Ledgers

A **Space** is an isolated Belief Ledger with its own governance rules, participant set, and constitutional variant.

BELIEF COURT can host multiple federated Spaces:
- The **Public Space** — open to all, governed by this Constitution
- **Org Spaces** — isolated Ledgers for a church, business, or affinity group
- **Private Spaces** — invitation-only Ledgers for a family or working group

Each Space has its own fork rights.

### Section 7.2 — Inter-Space Claims

A Claim filed in one Space can be challenged by a Person in another Space, opening a **Cross-Space Case**.

Cross-Space Cases are rare. They require:
- Both Spaces to recognize each other's authority
- Agreement on which Space's Duel Process to follow
- Mutual consent from both parties

---

## ARTICLE VIII — NO ARGUMENTATION — DEFENDED BELIEF ONLY

### Section 8.1 — The Core Principle (NON-NEGOTIABLE)

BELIEF COURT is a platform for **defended belief**, not **constructed argument**.

Formal syllogistic reasoning, logical proof, argument construction, and formal debate mechanics are **prohibited** as primary persuasion tools in core Duel flow.

What is welcome:
- Testimony: "I believe X because of Y" (narrative, evidence, grounding)
- Challenge: "I disagree; here is why"
- Cross-examination: "How do you know that? What if this case arises?"
- Reanalysis: "You said X earlier; now you're saying Y. Can you reconcile that?"

What is prohibited:
- Formal argument structures: "Given A and B, logically C follows"
- Proof-texting scripture: assembling verses as logical premises
- Rhetorical tricks: constructing a formally valid argument from weak premises to claim victory
- AI generation of syllogisms or formal logical chains

### Section 8.4 — Formal Logic Annex (Adversary Embrace)

BELIEF COURT embraces people who want formal philosophical argument (including syllogisms) by containing it in a constitutional lane that serves truth-seeking instead of replacing it.

Rules for this lane:

1. Formal argument may be submitted as a **Logic Annex Record** attached to a Claim, Challenge, Answer, or Judgment.
2. Logic Annex content is always challengeable and never self-authorizing.
3. Core Duel outcomes are never decided by formal validity alone.
4. Logic Annex outputs are interpreted by the Gallery through evidence, worldview, and cross-examination.
5. Scripture cannot be transformed into coercive premises; scripture remains testimony to Base of Truth.

Purpose:

- Welcome formal reasoners instead of excluding them.
- Convert adversarial argument-energy into transparent, auditable records.
- Keep defended belief as the governing path while preserving rich philosophical analysis.

### Section 8.2 — Scripture as Testimony, Not Logic

Scripture references are first-class evidence and are welcomed as testimony to a Person's Base of Truth.

A scripture reference is NOT a logical lever. It is a declaration: "This is what I believe, grounded in this text."

Proof-texting — assembling verses as logical syllogism — is a failure mode. The system guards against it through Annotation and Challenge. If a Person attempts to treat scripture as a logical premise, the Gallery can contest it directly: "You're not citing this as your belief; you're trying to construct a logical proof. That's not on the record here."

### Section 8.3 — Enforcement

Every PR introducing UI copy, AI prompts, template text, or help content MUST be reviewed against this principle.

Reviewers MUST explicitly confirm: **"No syllogistic framing is present."**

The codebase MUST include `ANTI_ARGUMENTATION_REVIEW_CHECKLIST.md` as a PR gate.

---

## ARTICLE IX — THE CHRISTIAN FOUNDATION

### Section 9.1 — Explicit Faith Grounding

BELIEF COURT is not a generic dispute platform that *happens to* include Christians.

It is a platform specifically designed for and by people who hold Christian faith as their highest authority. The first release MUST include:

- **Christian Mode** — dedicated features for churches, Bible study, faith disciplines
- **Scripture Evidence** — first-class Evidence type for Bible citations
- **Bible Widget** — native scripture study and cross-reference tool
- **Doctrinal Duels** — special context for theological challenges
- **Church Discipline Process** — Reconciliation → Witnessed Reconciliation → Community Review (Matthew 18)
- **Accountability Partnerships** — Duel context for faith-based covenants
- **Exploring Our Faith** — ongoing structured project for discernment and growth

### Section 9.2 — Principle: Scripture is Authority, Not Logic

Throughout BELIEF COURT, scripture is treated as **testimony to a Person's Base of Truth**, never as a logical premise.

When a Christian cites scripture, they are saying: "This is what God says. I believe it. Here is how it grounds my position." They are not saying: "Given Verse A, logically Verse B follows; therefore, my position is logically sound."

The distinction is not pedantic. It is the whole difference between **faith** and **argument**.

### Section 9.3 — Non-Negotiable: No Proof-Texting

All features involving scripture MUST actively discourage proof-texting:

- Turn prompts MUST ask: "What does this passage say, and how does it ground your position?" (NOT: "What conclusions follow from this verse?")
- The Bible Widget MUST surface context and cross-references, forcing holistic reading (NOT: cherry-picked verse facts)
- Judgment Guides MUST warn: "Citation chains can hide the original text's meaning. Quote full passages, not snippets."

### Section 9.4 — Openness to Others

While explicitly grounded in Christian faith, BELIEF COURT welcomes participants of other beliefs.

However:
- A non-Christian is still bound by Principle I (No Argumentation — Defended Belief Only).
- A non-Christian's Duel with a Christian is governed by this Constitution, not by attempts to "balance" faiths.
- The Bible Widget is available to all. It is not pushed on anyone.
- No feature gates participation based on faith background.

---

## ARTICLE X — CONSTITUTIONAL AMENDMENT

### Section 10.1 — The Constitutional Duel

Amendments to this Constitution are proposed and ratified through a **Constitutional Duel**.

1. Any Person may file a Claim against this Constitution (a special meta-Record).
2. A Case opens. The Duel proceeds through JADE phases.
3. The Gallery judges the proposed amendment.
4. If ≥66% of active Judges vote to accept, the amendment becomes constitutional.
5. The amended Constitution is recorded in the Ledger.

### Section 10.2 — Precedence

Once amended, the new Constitutional text supersedes all prior versions. Both versions remain in the Ledger for historical reference, but only the current version governs.

---

## ARTICLE XI — MANDATORY PRINCIPLES

### Section 11.1 — Code Quality

All production code MUST meet:
- Single Responsibility Principle
- Peer review before merge
- Full API documentation
- Zero linting errors
- DRY (no duplicated non-trivial logic)

### Section 11.2 — Testing Coverage

- Unit test coverage: ≥85% lines, ≥80% branches
- Integration tests for all cross-module contracts
- Deterministic, non-flaky tests
- End-to-end tests for critical user journeys

### Section 11.3 — User Experience Consistency

- All UI MUST use design system tokens (no hardcoding colors, fonts, spacing)
- Error messages MUST be human-readable and actionable
- Accessibility WCAG 2.1 AA MUST be met
- User copy MUST be reviewed for clarity and tone

### Section 11.4 — Security and Privacy

- All Records MUST be cryptographically signed
- Private Keys MUST NOT be stored on the server (users hold their own keys, or keys are managed via secure key-holder program)
- No user data MUST be sold without explicit opt-in
- GDPR and CCPA compliance MUST be maintained

---

## ARTICLE XII — FINANCIAL TRANSPARENCY

### Section 12.1 — Revenue Model

BELIEF COURT will sustain itself through:
1. **Judgment Data API** (subscription tiers for anonymized, aggregated verdicts)
2. **Pro Features** (optional: advanced analytics, premium Spaces, API access)
3. **Constitutional Crowdfunding** (annual participatory budget for core development)

### Section 12.2 — Mandatory Disclosure

All revenue streams MUST be disclosed quarterly to the People. No hidden monetization.

Full participation in the judgment process (filing Claims, dueling, Judging) MUST remain free forever.

### Section 12.3 — No Crypto Without Consent

Cryptocurrency and blockchain mechanisms are prohibited until explicitly approved by Constitutional Amendment.

---

## ARTICLE XIII — EMOJI AS PROTOCOL

Every entity, state, and process MUST have a canonical emoji identifier:

| Entity | Emoji | Entity | Emoji |
|--------|-------|--------|-------|
| Record | 🧾 | Duel | ⚔️ |
| Ledger | 📚 | Judgment | ⚖️ |
| Worldview | 🌐 | Challenge | ❓ |
| Claim | 💬 | Answer | ✅ |
| Case | 📂 | Offer | 🤝 |
| Person | 🧍 | Bot | 🤖 |
| Organization | 🏛️ | Translation | 🌍 |
| Space | 🧭 | Accord | 🕊️ |
| Gallery | 👥 | Rescission | ↩️ |

Emoji are not decorative. They are first-class protocol glyphs used in API responses, state machines, and UI affordances.

---

## ARTICLE XIV — ADVERSARY TRANSFORMATION AND CIVIC ORDER

### Section 14.1 — Method: Embrace the Adversary, Offer the Better Way

BELIEF COURT adopts one governing problem-solving method across product, governance, and growth:

1. Embrace the adversary directly (do not pretend conflict is absent).
2. Offer the better Way in both spirit and design.
3. Prefer the most sensible option by measurable return on integrity and return on investment.

The better Way is ultimately Jesus Christ. At operational level, it is the protocol path that produces truthful outcomes, fair incentives, and durable adoption.

### Section 14.2 — Pattern Requirement

Any adversarial force encountered by the platform MUST be handled by this sequence:

1. Name the force clearly.
2. Encapsulate it as a first-class constitutional abstraction.
3. Convert destructive energy into accountable process.
4. Align rewards with truthful behavior and costs with harmful behavior.

This pattern is already constitutional in:

- **Bots**: absorbed through explicit Bot abstraction, provenance, and challenge rights.
- **Open-source cloning pressure**: absorbed through Keyholders and federation incentives.
- **Formal argumentation pressure**: absorbed through the Logic Annex lane and widget-based analysis.

### Section 14.3 — Civic Conduct: Clowns

Participants historically called trolls are constitutionally classified as **Clowns** when their behavior is to inflame rhetorical war without submitting to evidence, process, or good-faith engagement.

Clown behavior is never suppressed by mob moderation alone. It is processed through the Court:

1. File the Claim.
2. Open the Case.
3. Settle through Duel.
4. Record Judgment from the People.

The system MUST:

- Reward those who defend truth with integrity (including financial pathways where applicable).
- Downgrade and dismiss those who repeatedly demonstrate bad-faith conduct.
- Keep all actions on the record.

### Section 14.4 — Worldview Engine and View Governance

The View layer MUST be governed by Controller-layer understanding of contrasting and intersecting worldviews. This is the explicit work of the **Worldview Engine**.

The platform adapts presentation and guidance according to worldview topology while preserving equal process rights in Cases and Duels.

### Section 14.5 — Evangelize Entrypoint

The primary UX entrypoint is **Evangelize**: file a Claim and begin the process.

Constitutional language for this action:

- **Evangelize** is to assert a truth claim for public testing.
- **Start a Fire** is the invited action name for filing that first Claim.

This action is foundational to JADE flow and to public truth-seeking culture.

---

## ARTICLE XV — WIDGET COMMONWEALTH AND MOBILE EXCELLENCE

### Section 15.1 — Widget Commonwealth

All planned widgets are constitutional product infrastructure. They are not optional decoration.

Initial constitutional widget set:

1. Bible Widget
2. Precedent Widget
3. Logic Widget
4. Consensus Widget
5. Timeline Widget
6. Impact Widget
7. Evidence Graph Widget
8. Worldview Intersections Widget
9. Translation Widget (for transcript and language reconciliation)
10. Bot Provenance Widget

Each widget MUST be:

- Addressable by stable identifier
- Challengeable in output interpretation
- Auditable in data provenance
- Usable in both Gallery analysis and party preparation

### Section 15.2 — Mobile-First Richness

Widgets MUST be rich and easy to use on mobile by default.

Mandatory mobile requirements:

1. Touch-first interactions (tap, press-and-hold, swipe-safe controls).
2. Single-thumb operation for primary actions.
3. Progressive disclosure (collapsed card → expanded detail → full-screen inspector).
4. Readable typography at small viewport widths without zoom.
5. Fast load with skeleton states and graceful offline/poor-network behavior.
6. No desktop-only critical functionality.
7. Gesture support that never hides legal or evidentiary context.

### Section 15.3 — Widget Integrity

Widget outputs are advisory analysis, not sovereign judgment.

- No widget may silently mutate Records.
- No widget may conceal source data used for its output.
- Every computed view must expose "how this was computed" details.
- Conflicting widget outputs are resolved in open Duel process, not hidden ranking logic.

---

## SIGNATURE

This Constitution is ratified by **maneatsbible**, the founder and implementer of BELIEF COURT, grounded in faith in Jesus Christ and commitment to the People's sovereignty over all systems of truth-seeking.

```
Witnessed by: GitHub Copilot (AI Assistant)
Date: 2026-04-21
Ledger: Immutable Constitutional Record
Status: 🔥 IN EFFECT — Light it up.
```

---

## NEXT SECTIONS (to be drafted in sequence)

1. [Data Model](data-model.md) — Complete entity schema
2. [Domain Model Flow](domain-model.md) — Records → Ledger → Worldview → Duel → Gallery → Judgment
3. [Implementation Plan](plan.md) — Fly.io, Hono, SQLite architecture (preserved from judgmental.io)
4. [Specification](spec.md) — Feature requirements alignment with BELIEF COURT
