# Feature Specification: Truthbook

| Field | Value |
|---|---|
| **Version** | `v0.0.1-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Feature branch** | `001-better-dispute-app` |
| **Created** | 2026-04-18 |
| **Last revised** | 2026-04-22 |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Governed by** | [constitution.md](constitution.md) — supersedes all other documents |
---


| Document | Role |
|---|---|
| **[spec.md](spec.md)** | Functional requirements — you are here |
| [plan.md](plan.md) | Implementation architecture and deployment |
| [data-model.md](data-model.md) | Database schema and entity definitions |
| [tasks.md](tasks.md) | Implementation tasks (SDLC) |
| [quickstart.md](quickstart.md) | Development environment setup |
| [research.md](research.md) | Pre-design unknowns and resolved decisions |
| [stakeholder-briefing.md](stakeholder-briefing.md) | Public financial projections and constitutional crowdfunding |
| [viral-growth-model.md](viral-growth-model.md) | Growth flywheels and acquisition model |
| [constitution.md](constitution.md) | **Governing document — supersedes all others** |
| [distributed-architecture.md](distributed-architecture.md) | Keyholder program, Truth Statements, cryptographic hardening, and Space-native governance |

---


## Clarifications

### Session 2026-04-22 — Record card controls and speaking roles

- Q: What is the primary interaction control on Record cards? → A: Every Record card uses three primary controls: **up**, **neutral**, **down**. Their semantic meaning is context-sensitive (e.g., like/dislike, accept/reject, yes/no), but the control shape remains stable across the product.
- Q: How is a challengeable Claim indicated on these controls? → A: The **up** and **down** controls (never neutral) may carry a claim-indicator by superimposing the control emoji over the fire emoji. A claim created through **Start a Fire** (composer hint: `I believe that...`) defaults to fire on **up**. A previously neutral statement can become claim-bearing if someone disputes it; the disputed direction takes fire and the filer of that claim is the defender for that claim.
- Q: What are the speaking roles when authoring Records? → A: The speaking role is explicit and shown as `Speaking as [role] of this belief record.` Supported roles are **Evangelist, Defender, Advocate, Judge, Investigator, Commentator** (mnemonic: JADEIC). These are not Duel phases or a sequence—they are UX indicators of how the Person is speaking on the record. The UI (especially Composers and Record cards) should always display the Person’s current speaking role as a badge or label.

### Session 2026-04-22 — Profile Wall and Comment records

- Q: What personal publishing surface exists on a Person profile? → A: Every Person has a **Wall** on their profile for blog-style posting. Wall posts are first-class on-record entries.
- Q: What record type is used for Wall posts? → A: Wall posts use `type=comment` and are neutral by default (no claim intent).
- Q: How does a neutral Wall Comment become fire? → A: If a Comment is challenged, a Case opens. If the comment author (or another eligible defender per platform rules) defends the challenged position in Duel flow, that challenged stance becomes claim-bearing (fire).
- Q: What interactions are allowed directly on Wall comments? → A: Wall commentary is conflict-free by design: only **up** (like) and **neutral** are allowed on the Wall surface. Direct down/dislike is not allowed on-Wall. Any disagreement route initiates Court flow by filing a Challenge Claim.

### Session 2026-04-18

- Q: How should GitHub authentication be handled on a static site with no server? → A: GitHub Device Flow for v1 (zero-server); serverless token-exchange function planned for v2.
- Q: Where do GitHub Issues live — single shared repo, per-topic, or per-user? → A: Single shared repo owned by the app (e.g., `judgmentalio/judgmental-data`); all users' content is stored as issues there.
- Q: When multiple people have agreed with a Claim and it is challenged, how many Duels are created? → A: One Duel per challenger–defender pair within the same Case; each agre-er who chooses to respond opens their own Duel.
- Q: How is the deadline countdown enforced with no server? → A: Agreed deadline timestamp stored in the GitHub Issue body; clients compute remaining time on load; the first client to load past the deadline writes the Default (Disposition) record as a new GitHub Issue.
- Q: What is the caching and pre-fetching strategy given GitHub API rate limits? → A: localStorage cache with ETag-based conditional GETs (If-None-Match); viewport pre-fetch for visible Home feed cards.

### Session 2026-04-20 — Infrastructure pivot and feature batch

- Q: What analytics stack? → A: Both **Plausible** (privacy-first, no cookies, no consent banner — primary) and **Google Analytics 4** (IP-anonymized — secondary, required for ads integration). Both are script-tag only; no build step.
- Q: Should auth still use GitHub Device Flow? → A: No. Backend is now Fly.io + Hono + SQLite. Auth is **SM OAuth** (X, Threads, Bluesky, GitHub) → server-side token exchange → signed JWT (HS256, 24h). No GitHub API calls for data storage.
- Q: How are AI-authored Records disclosed? → A: `is_ai: boolean` and `ai_model: string | null` on every Record. The UI renders an `[AI]` or `[AI-assisted]` badge on every affected Record card — not just on the Person profile.
- Q: How does the tipping/creator-funding system work? → A: Direct peer-to-peer tips via Stripe (primary) or Ko-fi link. Platform fee 0% in v1. Tips are attached to a Person (and optionally to the Record that prompted the tip). Constitutional constraint: **no judgment, Claim access, or Duel participation is ever gated behind payment**.
- Q: What are Evidence and Exhibits? → A: An **Evidence** is a structured attachment (file, URL, quote) on any Record as supporting material. An **Exhibit** is a formally submitted Evidence item during a Duel, given an exhibit label (Exhibit A, B …). Either party may object to an Exhibit, opening a nested Case.
- Q: How should the logo communicate Duel state? → A: Scales beam angle + flame colors encode state. Left pan lower + larger left flame = challenger ahead. Right pan lower + larger right flame = defender holding. Both cold/grey = Disposed. Both white/gold = Accord/STANDING. Color lane: challenger = cool blue-white; defender = warm amber.
- Q: What is the judicial role framing in the UI? → A: Each party carries a visible role badge (EXAMINING / TESTIFYING) that flips on counter-challenge. Judicial names are metadata; button labels remain user-friendly. Mapping: Challenge(Interrogatory) = Examination, Challenge(Objection) = Objection, Answer = Testimony, Counter-challenge = Cross-examination, Offer = Stipulation, Response(accepted) = So stipulated.
- Q: What is the ad policy? → A: Ads are shown only to unauthenticated users as a fixed bottom strip. Signing in removes ads permanently for that session. Constitutional principle: **full participation in the judgment process is free forever**.
- Q: What advanced judicial concepts should be modeled? → A: Voir dire (pre-Duel judge qualification), Subpoena (requesting a Person enter as witness), Amicus curiae (non-party Analysis submitter — already modeled), Deposition (pre-Case structured Q&A chain), Standing (right to bring a Case — modeled via ClaimAccord), Burden of proof (Duel-level flag indicating which party must prove their position).
- Q: What is the canonical definition of a Duel? → A: A Duel is a **double-deposition submitted to witnesses for judgment**. Each party is simultaneously the examiner (interrogating the other's position) and the deponent (testifying to their own). The EXAMINING / TESTIFYING role badges encode this. Judges are the witnesses. Turns are testimony. This is the constitutional framing — not "debate", not "argument."

### Session 2026-04-20 — Expanded product scope

- Q: Should a Dating/Compatibility mode be in v1? → A: Yes. A Duel can be filed with `context=compatibility` between two consenting Persons. Mechanics are identical to standard Duels; the framing, copy, and UI chrome change. Both Persons must accept the Duel invitation before it begins. The verdict is private to the two parties by default but may be made public.
- Q: How are Compatibility Duels shared and discovered to drive traffic? → A: Three viral loops: (1) shareable invite link with anonymous teaser card sent outside the app; (2) public Open Challenges feed where anyone may accept; (3) shareable "Duel me on this" Score Card image watermarked with truthbook.io URL. Topic templates and a Match Profile alignment feature drive organic discovery. Dating leaderboard (Most Compatible Pairs) provides social proof.
- Q: Are there features specifically for Bible-following Christians? → A: Yes — **Christian Mode** is a first-release feature set, not deferred, and not a general interfaith layer. It is built specifically for people who hold scripture as their highest authority. Features include: Scripture Evidence type, Doctrinal Claims with scripture citation helper, Bible Study Duels, Church/Small Group org tier with `elder` role, Accountability Partnerships, Community Discernment, a three-stage Church Discipline process (Reconciliation / Witnessed Reconciliation / Community Review), Theological topic templates, **Exploring Our Faith** (an ongoing structured project — see FR-169), Tradition tag, **Christian Dating** context (faith-first matching and courtship Duels), and **Parenting Duels** (faith formation, discipline approach, co-parenting under shared faith). The **Bible Widget** (FR-210) and **Bible Reader** (FR-211) are the platform's native scripture study tool — KJV default, 7 free translations at launch, with a low-priority roadmap for licensed translations requiring formal publisher partnerships. Pre-marital Counseling Track is included but is secondary priority — it ships after the core dispute and reconciliation features. No denomination is privileged. The platform actively discourages proof-texting in all contexts — scripture references are testimony, not logical premises (Constitutional Principle I). This is not Patheos. There is no generic spirituality mode.
- Q: Should an Open API for third-party integrations be in v1? → A: Yes, as a documented public REST API with API-key auth. All read endpoints (Claims, Cases, Duels, Dispositions, Analytics views) are accessible. Write endpoints (file a Claim, open a Case) require org-tier or API-key auth. Rate-limited. Documented at `GET /api/docs` (JSON/OpenAPI 3.1).
- Q: Should Historical Re-trials be in v1? → A: Yes. A Duel may be created with `context=historical` and a `historical_subject` string (e.g. "Galileo v The Church, 1633"). These Duels are special: parties are role-players defending assigned historical positions, not personal claims. The original Record is a system-authored Claim citing the historical subject. These Duels are always public, never generate ClaimAccords against living Persons, and are tagged for the Historic Re-trials analytics view.
- Q: Should an Apology Court (Resolution/Reconciliation mode) be in v1? → A: Yes, as a named Duel context (`context=apology`). The filing party declares a wrong, submits evidence of it, and proposes remediation. The respondent may Accept (producing a `reconciliation` Disposition), reject, or contest. The UI frames this in restorative language — wrongdoing acknowledged, remedy proposed, verdict reached. Christian forgiveness theology (the idea that confession, acknowledgement, and genuine repentance are the preconditions of restoration) is the philosophical north star, but the system is belief-agnostic. No religious language is coded into the UI. The system simply asks: was the wrong acknowledged? Was a remedy offered? Did the other party accept? The moral weight of the resulting record is left to the parties and their community.
- Q: Should Verdict data be sold as a product? → A: Yes. An anonymized, aggregated dataset of Claims, verdicts, and Judgment consistency scores is exposed as a subscription data API. Access tiers: Researcher (free, rate-limited), Professional ($99/month), Institutional ($499/month). Content is fully anonymized — no Persons, no handles, only claim structures and verdicts. Opt-out is available but defaults to opt-in.
- Q: What auto-analytics are wanted? → A: Ten public analytical views: (1) contested ground map, (2) consensus clusters, (3) undefeated Claims leaderboard, (4) serial challengers badge, (5) Judgment consistency score, (6) precedent chains graph, (7) dead ends / graveyard, (8) velocity (fastest-growing ClaimAccords), (9) flip rate (intellectual consistency), (10) "you disagree with N% on this" hook on Home View cards.

### Session 2026-04-19 — Scope widening to judgmental.io

- Q: What is the root entity? → A: **Claim** — a statement of truth. People agree with Claims. Cases are brought against Claims (and against any other Record).
- Q: What is the difference between a Case and a Duel? → A: A Case is opened when any Record is challenged; it groups one or more 1v1 Duels. Multiple agreers each enter their own Duel within the same Case.
- Q: What replaces "Dispute View"? → A: **Case View** — navigated to via a Case Chooser (cases against a Claim) and a Duel Chooser (Duels within a Case). Any nested challenged Record drills into another Case View with lineage breadcrumb.
- Q: What is @herald? → A: A placeholder identity used to import external content (quotes, tweets, articles) for immediate disputation. Not a persona — a beacon. Permanently reserved as a system handle — unavailable in the Person namespace, neither Person nor Bot while unclaimed. When the real author arrives and authenticates, they claim ownership and @herald is replaced with their Person record.
- Q: What are Offer/Response? → A: First-class entities parallel to Challenge/Answer. Same structural shape (parent ← binary-response child), different semantics — resolution vs. contestation. Offers run non-blocking alongside the turn sequence. An accepted Response produces an Accord.
- Q: Can any Record be challenged? → A: Yes. Claim, Challenge, Answer, Offer, Response, Disposition, SimilarityLink — all can have a Case opened against them.
- Q: What is Judgment? → A: A Person's verdict on a Duel, grounded in their declared Base of Truth. Requires a completed Analysis (which references Moments). The accumulation of Judgments is the knowledge base.
- Q: How is Claim strength computed? → A: At query time from the dataset — not stored as a score. Strength = agreers × survived Duels. No opaque scores; all signals are queryable relationships.
- Q: How is semantic equivalence of Records determined? → A: By community, not algorithm. A **SimilarityLink** is a first-class challengeable Record asserting two Records are equivalent. If it stands, it enables Precedent surfacing.
- Q: What is the storage architecture? → A: GitHub Issues as append-only tamper-evident ledger (v1). A secondary read-model index (v2) for performant queries. The ledger is authoritative; the index is derived and rebuildable.

---

## The Worldview Explorer

*Where worldviews collide, people open cases to confront the differences, seeking harmony.*

*Social media usually means social mayhem. Truthbook introduces social mediation.*

Truthbook is a **Worldview Explorer**. A Person's worldview is not a profile field, a survey result, or an AI-generated summary. It is the composition of all the Records they have produced and all the Accords they have reached — every Claim filed, every Challenge issued, every Answer given, every Offer made, every Rescission posted. The Worldview Explorer is the complete architecture through which those records are stored, structured, and presented.

The architecture maps exactly onto MVC, and the correspondence is not incidental — it is the design:

- **Belief Ledger (Model)** — The SQLite database. Append-only record of every epistemic act: Claims, Challenges, Answers, Offers, Responses, Accords, ClaimAccords, Rescissions, Dispositions, Judgments, Evidence. The Ledger contains only what happened — what a Person actually filed, contested, agreed to, or withdrew. There is no inference layer. There are no implied beliefs. The Ledger is authoritative; it cannot be reconstructed from any other source.

- **Worldview Engine (Controller)** — Derives structure from the Belief Ledger deterministically, without AI. This is where Tradition Map computation lives (Jaccard similarity over `faith_relevant` ClaimAccords), where Compatibility Scores are computed, where the Personal Faith Profile is assembled, where Accord chains are traced, where the Base of Truth is derived. The Engine asks: *given all the Records this Person has produced, what structure emerges?* That structure is not inferred. It is computed. A Tradition Map produced by the Worldview Engine is a faithful derivation of what a Person has actually defended and agreed to — nothing else.

- **Worldview Renderer (View)** — Presents the derived worldview: the public profile, the Tradition Map, the Match Profile, the Exploring Our Faith view, Score Cards, the Personal Faith Profile. The Renderer has no opinions. It shows what the Engine derived from what the Ledger contains.

- **Worldview Explorer (the whole)** — The name for the complete stack taken together as a product concept. Not a feature. Not a section of the app. The architecture *is* the product. Every Duel filed is a Worldview Explorer interaction in whatever domain it occurs — dating, faith, family, neighborhood, workplace, history. The same engine processes all of it.

**Analytics** sits within the Controller layer but is conceptually outside the Worldview Engine. Analytics queries the Belief Ledger directly (SQLite read-only) and may use AI for clustering, pattern detection, and trend analysis across cohorts. It operates at the platform level, not the Person level — it observes population-wide patterns in records that individuals have already made. Analytics MUST NOT write back to the Belief Ledger. The flow is strictly one-way: Belief Ledger → Analytics. Analytics outputs are never written as Records into any Person's Ledger, and no inferred belief is ever attributed to a Person based on analytics.

**Challenges are Belief Ledger entries.** Filing a Challenge is an epistemic act: it asserts that a Record is wrong, unclear, or undefended. That act is attributed to the challenger, stored as a Record in the Belief Ledger, and contributes to their worldview exactly as a Claim or Accord does. A Challenge that is itself challenged produces a nested Record — also in the Ledger, also attributed, also challengeable. This recursion has no floor. Each layer of challenge and answer in a nested Duel is a Record. All of them are in the Belief Ledger. All of them constitute worldview.

**Turn prompts are not Records.** A turn prompt is a question surfaced in the Composer UI to help a party articulate their position before submitting a turn. It is a View-layer element. It produces no Record, has no Ledger entry, is not challengeable, and contributes nothing to anyone's worldview. The text a person *writes in response to* a turn prompt — and submits as a Challenge, Answer, or Offer — is a Record. The prompt itself is not.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Claims and Make a Claim (Priority: P1)

A visitor opens truthbook.io in their browser. They see the Home view listing Claims as summary cards ranked by strength and activity. They can authenticate via GitHub and compose a new Claim (text and/or a single image). They can also import an external quote via @herald to plant a position for others to dispute.

The composer's claim-first hint text is `I believe that...` and the action to submit a claim is conceptually **Start a Fire**.


**Note on OfferAgreement vs. ClaimAgreement:**
- **OfferAgreement** is the outcome of a resolved Duel (Offer accepted by both parties). It is a negotiated, on-record agreement and is a Belief Ledger entry.
- **Agree** (ClaimAgreement) is a Person's standing agreement with a Claim, not requiring a Duel or negotiation. It is a Belief Ledger entry but does not result from negotiation.
- The **Affirm (❤️)** control on a Claim means “I agree” (creates a ClaimAgreement). The **Affirm (❤️)** control on an Offer means “I accept” (can lead to OfferAgreement if both parties accept).
UI/UX must make this distinction explicit: “Agree” is a personal stance; “OfferAgreement” is a negotiated outcome. Only OfferAgreements resolve Duels.

**Gallery one-liners (Annotations) are always off the record for everyone, including bots.** Annotations are not Records, not attributed as epistemic acts, and not challengeable. GalleryBot posts are not Belief Ledger entries.

**Why this priority**: The Claim feed and composition are the entry point for all activity. Without this, no disputes can begin.

**Independent Test**: A logged-in user can type text, submit a Claim, and see it appear as a new card on the Home feed.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they visit the Home view, **Then** they see the Claim feed in read-only mode with all interactive controls disabled.
2. **Given** the user is authenticated, **When** they compose and submit a Claim, **Then** a new Claim card appears on the Home feed.
3. **Given** the user wants to import an external quote, **When** they toggle @herald mode and paste a source URL and quote, **Then** the Claim is attributed to @herald with the source URL recorded, and a Challenge is opened against it immediately.
4. **Given** the user uploads an image, **When** they submit a top-level Claim, **Then** the Claim contains either the text or the image (not both).
5. **Given** any Claim card is visible, **When** the user clicks the copy icon, **Then** the canonical URL for that Claim is copied to their clipboard.
6. **Given** a user submits from `I believe that...`, **When** the card renders, **Then** the Affirm (❤️)/neutral/Disagree (🔥) controls are shown and the **Affirm (❤️)** control carries the fire claim indicator.
7. **Given** a card is rendered in a context with no claim intent, **Then** the neutral control shows no claim indicator and is never fire-marked.

---

### User Story 1A — Contextual Control Semantics and Speaking Relation (Priority: P1)

A user should be able to use the same three controls (up, neutral, down) across contexts while understanding their current meaning and seeing who is speaking in which relation.

**Why this priority**: Consistent controls with explicit relation context are foundational to clear on-record interaction.

**Independent Test**: The same Record card renders in three contexts (`like/dislike`, `accept/reject`, `yes/no`) with unchanged control layout, context-appropriate labels, and visible `Speaking as [relation]` metadata.

**Acceptance Scenarios**:

1. **Given** a Record card in Home feed context, **When** controls render, **Then** Affirm (❤️)/Disagree (🔥) semantics map to "affirm/disagree" while neutral remains available for no-claim intent.
2. **Given** a Record card in Offer/Response context, **When** controls render, **Then** Affirm (❤️)/Disagree (🔥) semantics map to "affirm/disagree" with the same control positions.
3. **Given** a Record card in Interrogatory context, **When** controls render, **Then** Affirm (❤️)/Disagree (🔥) semantics map to "affirm/disagree" with the same control positions.
4. **Given** a claim-bearing direction exists, **When** the card renders, **Then** only Affirm (❤️) or Disagree (🔥) may carry the fire overlay, never neutral.
5. **Given** a previously neutral position is disputed and filed as a claim, **When** the card updates, **Then** the disputed direction takes fire and that claim author is shown as defender for that claim.
6. **Given** any authored Record, **When** metadata renders, **Then** the UI displays `Speaking as [relation] of this belief record.` where relation is one of Judge, Advocate, Defender, Evangelist, or Investigator.

---

### User Story 2 — Challenge a Record and Open a Case (Priority: P1)

An authenticated user views a Claim (or any Record in a Case View) they disagree with. They open an inline Compose panel and submit a Challenge of type Interrogatory (Y/N question) or Objection. A Case is created against the Record and a Duel is opened within it.

**Why this priority**: Challenging is the core mechanic. Without it there are no Cases or Duels.

**Independent Test**: One user challenges another's Claim. The Case and Duel are created and both users can navigate to the Case View.

**Acceptance Scenarios**:

1. **Given** Person A has posted a Claim, **When** Person B taps the Challenge icon, **Then** the inline Compose panel slides up showing Interrogatory and Objection options.
2. **Given** Person B fills in an Interrogatory challenge and submits, **Then** a new Case and Duel are created and Person A sees a "You were challenged" notification.
3. **Given** a person attempts to challenge their own Record, **Then** the Challenge icon is disabled.
4. **Given** Person B has already challenged a Record once, **When** they view it again, **Then** the Challenge icon is disabled for that Record.
5. **Given** a Challenge is submitted against a Claim that has agreers (ClaimAgreements), **Then** each agre-er is notified and can enter their own Duel within the same Case.

---

### User Story 3 — Answer a Challenge and Counter-Challenge (Priority: P1)

In a Case View, the challenged Person can answer a Challenge. Interrogatory answers require a Yes or No selection plus optional text. The answerer may also issue a counter-challenge back to the challenger.

**Why this priority**: The answer-challenge cycle is the core loop of a Duel.

**Independent Test**: Person A answers Person B's Interrogatory with "Yes" and a counter-challenge. The Case View updates to show two lanes.

**Acceptance Scenarios**:

1. **Given** a pending Interrogatory challenge, **When** the challenged person opens the Answer panel, **Then** they see Yes/No radio buttons and an optional text field.
2. **Given** the answer is submitted, **Then** the Case View refreshes showing the answer card.
3. **Given** the answerer includes a counter-challenge, **When** the view refreshes, **Then** the Case View shows two lanes — left for challenger's Challenges, right for defender's counter-Challenges — interleaved chronologically.
4. **Given** it is not the user's turn in a Duel, **Then** the Challenge/Answer icons are disabled.
5. **Given** an Objection challenge, **When** the answerer opens the Answer panel, **Then** the form shows a free-text response field only (no Yes/No).

---

### User Story 4 — Offer Resolution and Reach Accord (Priority: P2)

Either party can submit an Offer proposing resolution. The other party can accept (producing an Accord) or reject (producing a Response). Offers do not block the Challenge/Answer turn sequence. Either party can also propose DeadlineConditions (a countdown per turn); if the answering party defaults, a Default Disposition is written.

**Why this priority**: Resolution paths give Duels finality. Without them every Duel is open-ended.

**Independent Test**: Two users reach Accord via Offer/Response. Duel is marked with ACCORD Disposition.

**Acceptance Scenarios**:

1. **Given** two parties are in a Duel, **When** one submits an Offer, **Then** the other sees the Offer without the turn sequence pausing.
2. **Given** the other party accepts the Offer, **Then** an Accord is created, a Disposition (type=accord) is written, and the Duel is marked closed.
3. **Given** one party proposes DeadlineConditions, **When** the other agrees, **Then** the countdown becomes active on the next unanswered Challenge.
4. **Given** the countdown expires without an Answer, **Then** a Default Disposition is written by the first client to detect it, shown prominently with the chirping audio cue.
5. **Given** a Default Disposition is written, **When** the defaulting party disputes it, **Then** a nested Case is opened against the Disposition Record.

---

### User Story 5 — Agree With a Claim (Priority: P2)

A person can hold a ClaimAccord on a Claim, making them eligible to defend it when challenged and building their Base of Truth.

**Why this priority**: ClaimAgreements are the foundation of the knowledge base and Judgment eligibility.

**Independent Test**: Person C holds a ClaimAgreement on @herald's Claim and is eligible to enter a Duel defending it.

**Acceptance Scenarios**:

1. **Given** a Claim posted by another person, **When** an authenticated user clicks Agree, **Then** a ClaimAgreement is created and they become eligible to defend it.
2. **Given** a Challenge is issued against a Claim with multiple agreers, **Then** each agre-er (ClaimAgreement holder) receives notification and can enter their own Duel within the same Case.
3. **Given** a person holds a ClaimAgreement on a Claim, **Then** the Challenge icon for that Claim is disabled for them.

---

### User Story 6 — Render Judgment (Priority: P3)

After a Duel reaches a Disposition, any eligible Person may submit Analysis (referencing Moments from the Duel) and then render a Judgment (a verdict grounded in their Base of Truth).

**Why this priority**: Judgments are the product of the system — the accumulating knowledge base. They require all prior mechanics to be in place.

**Independent Test**: A third party submits Analysis on a completed Duel and renders a Judgment citing their anchor Claim.

**Acceptance Scenarios**:

1. **Given** a Duel has a Disposition, **When** any authenticated Person opens the post-Disposition panel, **Then** they can submit Analysis referencing Moments from the Duel.
2. **Given** an Analysis exists and the Person has a declared Base of Truth with a STANDING anchor Claim, **When** they submit a Judgment, **Then** the verdict (challenger/defender) and reasoning are recorded.
3. **Given** a Person was a party in the Duel, **Then** the Judgment control is disabled for them.
4. **Given** Judgments exist on a Duel, **When** the Case View is viewed, **Then** a summary of verdicts is shown.

---

### User Story 7 — Navigate Nested Cases and Lineage (Priority: P2)

A user can navigate from the Home View → Case Chooser → Duel Chooser → Case View. Any Record within a Case View can itself be challenged, drilling into a nested Case View with lineage breadcrumb.

**Why this priority**: Nested Cases are fundamental to the model — any Record can be disputed.

**Independent Test**: A Challenge within a Duel is itself challenged. The nested Case View opens showing the lineage from the root Claim.

**Acceptance Scenarios**:

1. **Given** the Home View is open, **When** a user clicks a Claim card, **Then** the Case Chooser opens showing all Cases against that Claim.
2. **Given** a Case with multiple Duels, **When** the Case is opened, **Then** the Duel Chooser lists all Duels with their disposition status.
3. **Given** a Record within a Case View is challenged, **When** the Challenge is submitted, **Then** the app navigates to a nested Case View showing lineage breadcrumb back to the root Claim.
4. **Given** any Case View, **When** the user taps a breadcrumb ancestor, **Then** they navigate back to that level.

---

### User Story 8 — Notification and Navigation (Priority: P3)

Users receive notifications when a Record they own or hold a ClaimAccord on is challenged. The app is fully URL-param driven, allowing any Record, Case, or Duel to be shared via canonical URL.

**Acceptance Scenarios**:

1. **Given** a user's Record is challenged, **When** they next open the app, **Then** a notification is shown and the relevant card shows a "Your turn" badge.
2. **Given** any Record, Case, or Duel is visible, **When** the user copies its canonical URL and opens it in a new tab, **Then** the app loads the correct view directly.

---

1. **Given** Person A has posted an Assertion, **When** Person B (not the author) taps the Challenge icon, **Then** the inline Compose panel slides up showing Interrogatory and Objection options.
2. **Given** Person B fills in an Interrogatory challenge and submits, **Then** a new Dispute is created and Person A sees a "You were challenged" notification.
3. **Given** a person attempts to challenge their own Post, **Then** the Challenge icon is disabled (visible but non-interactive) and no action is taken.
4. **Given** Person B has already challenged a Post once, **When** they view that Post again, **Then** the Challenge icon is disabled for that Post.
5. **Given** a challenge is submitted, **When** the view refreshes, **Then** the card reflects the new challenge and shows a "Your turn" badge to the challenged person.

---

### Edge Cases

- What happens when a GitHub API call fails mid-Challenge submission? The optimistic UI must roll back and inform the user.
- What if the same person is invited via a shared URL but is already a party to that Duel? They are taken directly to the Case View in their correct role.
- What if a person holds a ClaimAccord on a Claim and is the only one who can enter a Duel against it? The Challenge icon is disabled for that person — they cannot be both challenger and defender.
- What if the same challenge type is submitted twice in one turn by accident? The UI must prevent double-submission after first submit.
- What if an image file exceeds GitHub's issue attachment limits? The user is shown an error before submission and the form is not cleared.
- What if a Claim has no Cases yet? The Home card is visually indicated as untested (distinct from settled or defaulted) without a text label.
- What if two clients simultaneously detect a deadline expiry and both attempt to write a Default Disposition? The second write must be treated as a duplicate; the controller must check for an existing Disposition before writing.

---

### User Story 9 — New User Onboarding (Priority: P1)

A brand-new user arrives at judgmental.io for the first time. They see the public Home feed unauthenticated, choose a social platform to sign in with, complete OAuth, and land back at the Home feed authenticated. The Miranda acknowledgement card is shown above the composer. They acknowledge it once — it does not reappear.

**Why this priority**: First-time auth state and persistent card are foundational UX that every user encounters. Getting this wrong breaks trust immediately.

**Independent Test**: Fresh browser (no localStorage), sign in via GitHub OAuth → JWT stored → Home feed renders authenticated → Miranda card visible above composer → user acknowledges → card gone → refresh → card still gone.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they click "Sign in" and select GitHub, **Then** they are redirected to GitHub OAuth, then back to truthbook.io with a valid JWT stored in `localStorage`.
2. **Given** a newly authenticated user has never acknowledged the Miranda notice, **When** the composer is visible, **Then** the Miranda acknowledgement card is shown above it.
3. **Given** the user clicks "I understand" on the Miranda card, **Then** `localStorage['jdg:miranda_ack']` is set to `1` and the card is removed from the DOM.
4. **Given** the user refreshes or reopens the app, **When** `jdg:miranda_ack` is already set, **Then** the Miranda card is NOT shown.
5. **Given** a returning user with an expired JWT, **When** they reload the app, **Then** they see the unauthenticated Home feed and a "Your session expired — sign in again" notice.
6. **Given** the user's handle on their chosen platform is already taken by another Person on truthbook.io, **When** they complete OAuth, **Then** the server appends a short unique suffix to disambiguate and returns the resolved `@handle` in the JWT response.

---

### User Story 10 — Rescission (Priority: P3)

An authenticated user wants to publicly withdraw a position they previously posted. They open the Record's overflow menu and choose "Rescind". The Record is immediately marked RESCINDED; the user's defender obligation for that Record ends going forward. Existing Duels continue. The Rescission is itself challengeable.

**Why this priority**: Rescission is a virtue mechanic. It demonstrates intellectual honesty. It must be technically sound to preserve knowledge graph integrity.

**Independent Test**: Person A has a STANDING Claim. Person A rescinds it. The Claim card shows `[RESCINDED]` badge. A pending Duel that was open against it continues. The profile shows a `[Rescinded STANDING]` virtue marker.

**Acceptance Scenarios**:

1. **Given** a Record authored by the current user, **When** they open the overflow menu, **Then** a "Rescind this Record" option is visible (disabled if already rescinded).
2. **Given** they confirm rescission, **Then** a `rescissions` row is created; the Record card badge changes to `[RESCINDED]`.
3. **Given** an open Duel exists against the rescinded Record, **Then** the Duel remains open; the defender is no longer obligated to answer new Challenges after the rescission date.
4. **Given** the rescinded Claim was in STANDING state, **Then** the Person's profile shows a `[Rescinded STANDING]` badge and the Velocity analytics view surfaces the event.
5. **Given** another user views the rescinded Record, **When** they disagree with the rescission's sincerity, **Then** they can challenge the Rescission itself, opening a nested Case.

---

### User Story 11 — Person Profile and On-the-Record Search (Priority: P3)

Any authenticated user can look up the full public record of any other Person: every Claim, Challenge, Answer, ClaimAgreement, Judgment rendered, and Rescission — all filterable.

Every Person profile also includes a Wall for long-form and short-form blog-style posts authored as `Comment` records. Wall content is on the Record.

**Why this priority**: The Miranda principle requires that this information be accessible. It is also the primary research tool before entering a Duel.

**Independent Test**: User A clicks on User B's handle → Person profile opens → tabs: Records, Wall, Agreements, Judgments, Rescissions; filter by `type=claim` → only Claims shown; Wall renders `Comment` posts.

**Acceptance Scenarios**:

1. **Given** any post card, **When** the user clicks the author handle `@name`, **Then** the Person profile view opens for that author.
2. **Given** the Person profile is open, **Then** five tabs are shown: All Records, Wall, Agreements (ClaimAgreements), Judgments Rendered, Rescissions.
3. **Given** the Records tab, **When** the user applies a type filter, **Then** only Records of that type are shown.
4. **Given** the Records tab, **When** the user types in the topic search field, **Then** Records containing that text are shown (full-text search).
5. **Given** the user is unauthenticated, **Then** the Person profile is visible but all "Challenge" and "Agree" interactions are disabled with "Sign in" tooltips.
6. **Given** the profile owner creates a Wall post, **When** submitted, **Then** a new `Comment` record is appended and shown on the Wall in reverse-chronological order.
7. **Given** a Wall Comment is unchallenged, **Then** its card remains neutral (no fire indicator).
8. **Given** a Wall Comment is challenged, **When** a Case is opened and defense is filed in Duel flow, **Then** the challenged stance is rendered as claim-bearing fire in that dispute context.
9. **Given** a viewer is on a Wall Comment card, **Then** only up and neutral controls are interactive on that Wall surface.
10. **Given** a viewer intends to disagree with a Wall Comment, **When** they choose the disagreement route, **Then** the system opens Challenge composition and files the disagreement to Court as a Challenge Claim (opening a Case).

---

### User Story 12 — Tipping (Priority: P3)

Any authenticated user can send a voluntary tip to any other Person via Stripe. The tip may be attached to a specific Record. The platform takes 0%.

**Why this priority**: Creator support is a documented feature and Stripe integration is a real dependency that blocks verification.

**Independent Test**: Person A clicks Tip on Person B's Claim → Stripe checkout opens → on success `tips` row created → Person B's profile shows tip count.

**Acceptance Scenarios**:

1. **Given** a Record authored by another person, **When** the current user clicks the tip `💰` icon, **Then** a Stripe Checkout session is created and the user is redirected to Stripe.
2. **Given** the Stripe payment succeeds, **When** the Stripe webhook fires, **Then** a `tips` row is created with `amount_cents`, linking tipper, recipient, and optionally the Record.
3. **Given** a user attempts to tip their own Record, **Then** the tip button is disabled with tooltip "You can't tip yourself."
4. **Given** a Stripe webhook is received with an invalid signature, **Then** the server returns 400 and writes nothing.
5. **Given** a Person's profile is viewed, **Then** a total tip count and amount are visible to the profile owner (authenticated, own profile only).

---

### User Story 13 — Analytics Views (Priority: P3)

Any visitor can browse the 10 public auto-analytics views — Contested Ground, Consensus Clusters, Undefeated Claims, Serial Challengers, Judgment Consistency, Precedent Chains, Graveyard, Velocity, Flip Rate — with no sign-in required.

**Independent Test**: Unauthenticated user navigates to `/analytics/velocity` → sees fastest-growing Claims in last 7 days, no sign-in required, page renders in < 3 s.

**Acceptance Scenarios**:

1. **Given** any visitor, **When** they visit `/analytics`, **Then** they see a navigation list of all 10 views.
2. **Given** the Undefeated Claims leaderboard, **When** rendered, **Then** Claims are ordered by `ClaimAgreements × survived Duels` with the formula shown as a tooltip.
3. **Given** the "You disagree with N%" hook, **When** an authenticated user views the Home feed, **Then** each Claim card shows the percentage of Persons who hold that ClaimAgreement against whom the current user has no ClaimAgreement (approximated from the agreeers set).
4. **Given** the Velocity view, **When** a STANDING Claim is rescinded, **Then** the event appears in the Velocity feed with a `[Rescinded STANDING]` marker.

---

### User Story 14 — Moderation (Priority: P2)

An authenticated moderator or admin can view the moderation flag queue, review flagged Records, and resolve flags. Only admins can ban a Person.

**Independent Test**: Moderator visits `/admin/flags` → sees unresolved flag list → resolves a flag → flag disappears from queue. Non-moderator visits `/admin` → 403.

**Acceptance Scenarios**:

1. **Given** an authenticated user sees a harmful Record, **When** they select "Flag" in the overflow menu and submit a reason, **Then** a `moderation_flags` row is created.
2. **Given** a moderator views `/admin/flags`, **Then** they see Record preview, flagger handle, reason, and timestamp for each unresolved flag.
3. **Given** the moderator clicks Resolve, **Then** the flag is marked resolved and removed from the queue.
4. **Given** an admin resolves a flag with "Ban author" action, **Then** `persons.banned_at` is set and subsequent write attempts by that person return `403 {"error":"banned"}`.
5. **Given** a banned user attempts to submit a Claim, **Then** the API returns `403 {"error":"banned"}` and the client shows a clear "Your account has been suspended" message.
6. **Given** a non-admin, non-moderator accesses `/admin`, **Then** they receive a `403` response page.

---

### User Story 15 — Deployment and Migration (Priority: P1 — Operator)

The operator needs repeatable, safe deployment: run migrations before traffic, toggle maintenance mode during schema changes, and restore from Litestream backup if the volume is lost.

**Why this priority**: This is an operational blocker. Without a safe deploy path, every schema change is a risk.

**Independent Test**: `fly deploy` → container starts → `db/migrate.js` runs → `/health` returns 200 → traffic resumes. Run `fly deploy` twice → migrations are idempotent, no duplicate runs.

**Acceptance Scenarios**:

1. **Given** a new `*.sql` migration file is added, **When** `fly deploy` completes, **Then** `db/migrate.js` runs it exactly once and records it in `schema_migrations`.
2. **Given** `fly deploy` is run with no new migrations, **Then** `migrate.js` completes immediately with no writes.
3. **Given** `MAINTENANCE_MODE=true` is set via `fly secrets set`, **Then** all API and HTML routes except `/health` return 503; `/maintenance.html` is served for browser requests.
4. **Given** the Fly.io volume is lost and must be restored, **When** the operator runs the Litestream restore procedure, **Then** the database is recovered to within 5 minutes of the last write.
5. **Given** the operator runs `npm run migrate` locally against `DB_PATH=/tmp/test.db`, **Then** all migrations run against the local DB, enabling local dev without a live Fly.io instance.

---

### User Story 16 — Admin Operations (Priority: P2 — Operator)

An admin user manages Persons (role changes, bans), monitors cron job health, and views system health metrics — all from the `/admin` interface without needing a terminal.

**Independent Test**: Admin user visits `/admin/cron` → sees all 7 jobs with last-run status → clicks "Run now" on `analytics_rollup` → new `cron_runs` row created → panel refreshes showing new last-run entry.

**Acceptance Scenarios**:

1. **Given** the admin visits `/admin/users`, **Then** they see a paginated list of Persons with handle, platform, joined date, role, and ban status.
2. **Given** the admin changes a user's role from `member` to `moderator`, **Then** the `persons.role` is updated and the change is reflected on the next page load.
3. **Given** the admin bans a user, **Then** `persons.banned_at` is set and the user list shows them as banned immediately.
4. **Given** the admin visits `/admin/cron`, **Then** each of the 7 jobs shows its last run timestamp and outcome (OK / ERROR with message).
5. **Given** the admin clicks "Run now" on any job, **Then** the job executes synchronously and the result is shown inline within 10 seconds.
6. **Given** the admin visits `/admin/health`, **Then** they see DB file size, WAL size, server uptime, memory usage, Litestream last-replicated-at, and rate-limit hit count — all live.

---

### User Story 17 — Dating and Compatibility Duel (Priority: P3)

Two consenting Persons want to use the Duel mechanic to structure a high-stakes relational decision — whether to move in together, whether a relationship should continue, whether they are compatible on a key value. Both must explicitly accept before the Duel begins. The result is private by default.

**Why this priority**: The mechanic is already built. The context layer is a framing change. Viral potential is very high.

**Independent Test**: Person A files a Compatibility Duel naming Person B. Person B sees a consent prompt. The Duel does not begin until Person B accepts. After a Disposition is reached, the verdict is visible only to A and B.

**Acceptance Scenarios**:

1. **Given** Person A files a Duel with `context=compatibility` naming Person B, **Then** Person B receives a consent notification and the Duel shows `Awaiting acceptance` to Person A.
2. **Given** Person B declines the consent prompt, **Then** the Duel is canceled; no Records are created.
3. **Given** both Persons have accepted, **Then** the Duel proceeds using standard mechanics with compatibility UI framing.
4. **Given** a Disposition is reached, **Then** the verdict is visible only to persons A and B unless both explicitly toggle "Make public".
5. **Given** the Duel is private, **Then** it MUST NOT appear in the public feed, any analytics view, or the Verdict Data API.

---

### User Story 18 — Historical Re-trial (Priority: P3)

A user wants to re-litigate a famous historical dispute — Galileo vs the Church, Keynes vs Hayek, Tesla vs Edison. They file a Re-trial, claiming one of the historical positions. Another user claims the opposing position. The Duel proceeds with standard mechanics. The verdict joins a public Historic Re-trials archive.

**Why this priority**: High organic shareability. Drives SEO. Zero data-model changes needed.

**Independent Test**: User A files a Historical Re-trial with `historical_subject="Galileo v The Church, 1633"`. The root Claim is authored by `@system`. User B defends the opposing position. Neither user's ClaimAccord count is affected by the verdict.

**Acceptance Scenarios**:

1. **Given** a Historical Re-trial is filed, **Then** the root Claim is created by `@system` citing `historical_subject`; no living Person is the Claim author.
2. **Given** a Disposition is reached, **Then** neither party's BaseOfTruth is modified (no ClaimAccord is created).
3. **Given** the Historic Re-trials analytics view is open, **Then** all completed Re-trials are listed, searchable by `historical_subject`.
4. **Given** a `historical_subject` already has a prior Re-trial, **Then** filing a new Re-trial surfaces existing precedent verdicts before submission.

---

### User Story 19 — Apology Court (Priority: P3)

A Person wants to publicly acknowledge a wrong, propose a remedy, and seek the other party's acceptance — on the record. They file an Apology Court Duel. The other party may accept (reconciliation) or reject (the public record stands).

**Why this priority**: Unique to the platform. No social network offers structured public reconciliation. High viral and press potential. Philosophically central to what the platform stands for.

**Independent Test**: Person A files an Apology Court Duel with acknowledgement, evidence, and remedy text. Person B accepts. A `reconciliation` Disposition is created. The feed renders the "Resolved" visual state.

**Acceptance Scenarios**:

1. **Given** Person A files a Duel with `context=apology`, **Then** the UI requires all three fields before submission: acknowledgement, evidence, proposed remedy.
2. **Given** Person B accepts, **Then** a `reconciliation` Disposition is created and the Duel card shows a visually distinct "Restored" state.
3. **Given** Person B rejects, **Then** a `rejection` Disposition is created; the Duel remains as a public record of an unresolved wrong.
4. **Given** Person B contests the characterization, **Then** a standard turn sequence begins; mechanics are identical to a normal Duel.
5. **Given** any Apology Court Duel, **Then** no religious terminology appears anywhere in the UI.

---

### User Story 20 — Open API (Priority: P2)

A developer or organization wants to query judgmental.io data programmatically — embedding verdicts in another app, building a research tool, or filing Claims via automation. They use an API key to access documented endpoints.

**Why this priority**: Enables the Org tier, data API monetization, and third-party ecosystem without building a dedicated integration for each.

**Independent Test**: Developer calls `GET /api/docs` → receives valid OpenAPI 3.1 JSON. Calls `GET /api/claims` with an API key → receives Claims. Calls the same route without a key → receives `401`. Exceeds rate limit → receives `429` with `Retry-After`.

**Acceptance Scenarios**:

1. **Given** any client calls `GET /api/docs`, **Then** a valid OpenAPI 3.1 JSON document is returned with all public endpoints documented.
2. **Given** a read-only API key, **When** used on a write endpoint, **Then** a `403 Forbidden` is returned.
3. **Given** a request exceeds the rate limit, **Then** `429 Too Many Requests` is returned with a `Retry-After` header.
4. **Given** an admin revokes an API key, **Then** the key stops working within 60 seconds (next cache invalidation cycle).

---

### User Story 21 — Verdict Data API Subscription (Priority: P2 — Business)

A researcher or institution wants to bulk access to anonymized Duel outcome data for analysis — studying how claims survive contestation, how judgment consistency correlates with claim strength, etc. They subscribe to a data tier and query the Verdict Data API.

**Why this priority**: Zero marginal cost. Pure revenue. The data is a byproduct of the platform's existing mechanics.

**Independent Test**: Researcher API key calls `GET /api/data/claims` → returns anonymized Claim texts and Disposition outcomes with no Person identifiers. A Person who has opted out does not appear.

**Acceptance Scenarios**:

1. **Given** a Researcher API key, **Then** `GET /api/data/claims` returns anonymized claim text and Disposition outcomes only; no Person handles or platform identifiers are present.
2. **Given** a Person has opted out via User Settings, **Then** their Records do not appear in any Verdict Data API response within 24 hours of opt-out.
3. **Given** an Institutional subscriber, **Then** bulk JSONL export via `GET /api/data/export` is available with no daily rate limit.
4. **Given** a free Researcher key, **Then** requests beyond 100/day return `429`.

---

### User Story 22 — Neighborhood Dispute and Policy (Priority: P1)

A group of residents in an apartment building — most of whom don't know each other — want to agree on a noise policy, resolve a parking dispute, and have a record of what everyone agreed to. One resident creates a neighborhood org and prints a QR flyer to post in the communal hallway. Other residents scan it, join, and participate without needing to know each other's names.

**Why this priority**: The QR flyer is a physical-world acquisition mechanic with no marginal cost and no algorithm dependency. Every flyer posted is an ongoing acquisition channel. The use case is universal — every apartment block, dorm, and shared house has unresolved neighbor friction.

**Independent Test**: A convenor creates a neighborhood org → generates a QR flyer PDF → a second person scans the QR → lands on the join page → creates an account → joins as a resident → the convenor sees them listed. Convenor files a `context=community_policy` Duel from a template → policy reaches accord → Policy Document is generated and printable.

**Acceptance Scenarios**:

1. **Given** a Person creates a neighborhood org, **Then** a QR invite flyer is immediately available as a downloadable PDF at `/orgs/:id/flyer`.
2. **Given** a person scans the QR code, **Then** they land on a join page showing org name and member count with no personal details required to view.
3. **Given** a `context=community_policy` Duel reaches `accord`, **Then** a Policy Document is created, timestamped, and listed at `/orgs/:id/policies`.
4. **Given** a `context=neighbor_dispute` Duel is filed with `anonymous=true`, **Then** the respondent sees "A Resident" as the filer; the convenor sees the true identity.
5. **Given** a resident files an anonymous dispute and then lifts anonymity, **Then** their handle is revealed to all parties from that point forward; prior Turns are not retroactively attributed.
6. **Given** a Policy Document exists, **Then** it is downloadable as a formatted PDF signed by all active members at time of accord.

---

### User Story 23 — Brand Claim (Priority: P2 — Commercial)

A brand wants to be discoverable on judgmental.io. They don't want a banner ad. They want to file a position — "We believe our supply chain is fully traceable and we can prove it" — and prove it publicly by defending it against anyone who challenges them. They file a Brand Claim, attach their evidence, open it to challenges, pay for placement in the Brand Challenges feed, and then defend their position Duel by Duel. Every DEFENDED verdict strengthens their public Credibility Score. Every genuine ACCORD is even better — it means they engaged honestly with someone who pushed back.

**Why this priority**: Brand Claims are the non-church placement revenue stream. They are also a structural PR incentive for orgs with genuine integrity — the mechanic favors orgs that can actually back their claims. It is anti-greenwashing by design.

**Independent Test**: An org admin files a Brand Claim with `claim_text` and one Evidence item → passes copy review → `is_brand_claim = true` Duel is created → Claim appears in Brand Challenges feed → a user taps Challenge → a `context=brand` Duel is opened with the org's `response_handle` as Defender → Duel proceeds to Verdict → Disposition badge appears on org profile.

**Acceptance Scenarios**:

1. **Given** an org admin submits a Brand Claim without Evidence, **Then** the submission is rejected with "At least one Evidence item is required before filing a Brand Claim."
2. **Given** a Brand Claim uses the phrase "best in class" without Evidence, **Then** the copy review rejects it with a specific reason before it goes live.
3. **Given** a user challenges a Brand Claim, **Then** a `context=brand` Duel is opened within 60 seconds; the org's `response_handle` receives a notification.
4. **Given** the org's `response_handle` does not respond within the deadline, **Then** the Disposition is `abandoned` and the ABANDONED badge is permanently displayed on the org profile.
5. **Given** a Brand Duel reaches `accord`, **Then** the ACCORD badge is displayed; the org's Credibility Score is updated; the Duel record links bidirectionally from both the org profile and the challenger's profile.
6. **Given** an org has `placement_active = false`, **Then** their Brand Claims are not surfaced in the `/discover/brand-challenges` feed but remain accessible via direct link.
7. **Given** a church org attempts to file a Brand Claim, **Then** the option is not available in the org admin interface.

---

### On Truth and Judgment

judgmental.io is built on the conviction that **truth is knowable and defensible**. The system is designed to help people identify where they actually agree and disagree, to expose untested and tested claims, and to make righteous judgment possible — judgment grounded in a declared standard of truth rather than rhetorical technique.

The core mechanic — Claim, Challenge, Answer — is designed around substantive positions and their defense, not logical scaffolding. A Challenge must be answerable. An Answer must engage the Challenge. A Judgment must cite a Base of Truth.

The knowledge base grows from the bottom up: Claims that survive challenges accumulate epistemic weight. Judgments grounded in STANDING Claims carry more credibility than judgments grounded in untested ones. The truth is intended to rise to the top — not by vote, not by algorithm, but by surviving contestation.

### On Argumentation Style

The platform explicitly discourages philosophical argumentation — construction of formal syllogisms, premise-mapping, validity-based "winning" — as a primary mode. Such approaches reward structural cleverness over substantive engagement and can be used to avoid rather than address what is actually true.

**Logic & Reasoning widgets** (Fallacy Tag, Claim Map) are available *only as post-hoc diagnostic tools* — they describe errors and patterns in reasoning that has already occurred, never as a method to construct or win an argument. They are restricted to Challenge and Answer records and to Moment annotations.

> A Fallacy Tag names a failure that happened. A Claim Map renders visible what was implicit. Neither is an argument.

### On Precedent and Repeated Fights

When a SimilarityLink between two Records reaches STANDING state, the system surfaces the prior Duel as Precedent for any new equivalent Challenge. The intention is that a well-defended position, once it has held, should not need to be defended again. People defend their claims once; the record speaks for itself.

### On Openness and Access

**Full participation in the judgment process — making Claims, entering Duels, rendering Judgments, building a Base of Truth — is free and requires no payment, ever.** Tipping and creator support are voluntary and have zero effect on any person's ability to participate or on the weight of any Record.

Advertising is shown only to unauthenticated visitors. Signing in removes all ads. This is a deliberate design statement: the platform earns attention from people who are not yet committed; it never monetizes those who are actively doing the work.

### On Authorship and Disclosure

Every Record must accurately represent who authored it and in what capacity. The platform surfaces four disclosure types at the moment of display:

| Badge | Meaning |
|-------|---------|
| `[AI]` | Record was entirely generated by an AI model |
| `[AI-assisted]` | Record was drafted or substantially edited with AI assistance |
| `[Imported · @handle · Platform]` | @herald import — sourced from external platform |
| `[on behalf of @handle]` | Proxy submission (future) |

Sponsored content is prohibited. Any sponsored-in-intent Record would be required to display `[Sponsored]` and is excluded from Claim strength computation and Judgment eligibility.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Identity**

- **FR-001**: The app MUST authenticate users through **SM OAuth** (X/Twitter, Threads, Bluesky, GitHub) via a server-side token exchange on the Hono API server. The server returns a signed JWT (HS256, 24h expiry) stored client-side. No GitHub API calls are made for data storage.
- **FR-002**: Each Person MUST have a unique `@name` (derived from their social media handle on the authenticating platform) and a globally unique id assigned by the application
- **FR-003**: The @herald placeholder MUST be a system-level identity (not a real OAuth user) used to import external content. It is permanently reserved and unavailable in the Person namespace. Any authenticated user may submit a Claim attributed to @herald together with an immediate Challenge. The real author of the imported content may later authenticate and claim ownership, replacing @herald with their own Person record.

**Records & Tree Structure**

- **FR-004**: The system MUST support the following Record types: Claim, Challenge, Answer, Offer, Response, Case, Duel, Disposition, Accord, ClaimAccord, DeadlineConditions, Moment, Analysis, Judgment, SimilarityLink, Evidence, Exhibit.
- **FR-005**: Every Record MUST be stored as a row in the application's SQLite database (Fly.io persistent volume, Litestream-replicated). The database is the canonical append-only ledger.
- **FR-006**: Top-level Claims MUST contain either text OR a single image, not both.
- **FR-007**: Non-Claim Records MAY contain both text and a single image.
- **FR-008**: All Records MUST have globally unique integer ids assigned by the database.
- **FR-009**: The database store MUST be treated as append-only for content Records; no row is UPDATE'd or DELETE'd after creation.

**Challenges and Cases**

- **FR-010**: Challenge type MUST be one of: Interrogatory (Y/N question) or Objection (free-form objection).
- **FR-011**: A Person MUST NOT challenge their own Record; the Challenge control MUST be disabled for the author.
- **FR-012**: A Person MUST NOT challenge the same Record more than once.
- **FR-013**: When a Challenge is submitted, a Case MUST be created against the challenged Record and a Duel MUST be opened within that Case.
- **FR-014**: Any Record type (Claim, Challenge, Answer, Offer, Response, Disposition, SimilarityLink) MAY be challenged, opening a nested Case with its own Case View.

**Cases and Duels**

- **FR-015**: Cases and Duels MUST be first-class objects stored as distinct rows in the database.
- **FR-016**: A Duel involves exactly two Persons (challenger and defender); the controller MUST enforce whose turn it is.
- **FR-017**: A Case may contain multiple Duels — one per challenger–defender pair (e.g. when multiple ClaimAccord holders respond to the same Challenge).
- **FR-018**: Persons who hold a ClaimAccord on a Claim MUST be eligible to enter a Duel defending it when it is challenged; each agre-er opens their own Duel within the same Case.
- **FR-019**: Duel turn state MUST be independent of any other Duel, including nested Duels on Records within the same Duel.

**Answers**

- **FR-020**: An Answer to an Interrogatory Challenge MUST include a Yes/No selection; free-text is optional.
- **FR-021**: An Answer to an Objection Challenge MUST include free-text only; no Yes/No selection.
- **FR-022**: An Answer MAY include an optional counter-challenge back to the challenger.

**Offers and Resolution**

- **FR-023**: Either party in a Duel MAY submit an Offer proposing resolution at any time; Offers MUST NOT pause or block the Challenge/Answer turn sequence.
- **FR-024**: The other party MUST be able to accept (producing an Accord and a Disposition of type=accord) or reject the Offer.
- **FR-025**: Either party MAY propose DeadlineConditions (countdown per turn); conditions MUST be mutually agreed before activation. The absolute deadline timestamp MUST be stored in the Duel's GitHub Issue body.
- **FR-026**: Upon expiry of agreed DeadlineConditions, the **server** (node-cron, 1-minute tick) MUST detect the expiry and write a Default Disposition record. The client displays the Default event prominently with a visual indicator and an audio cue (Web Audio API chirp) when it next loads or polls the Duel. Server-side detection removes the race condition of multiple clients simultaneously writing a Default.
- **FR-027**: A Default Disposition MAY be challenged by the defaulting party, opening a nested Case against the Disposition Record.

**ClaimAccords and Base of Truth**

- **FR-028**: A Person MUST be able to hold a ClaimAccord on any Claim they did not author and have not challenged.
- **FR-029**: A Person MUST NOT hold a ClaimAccord on a Claim they have challenged.
- **FR-030**: A Person MAY declare a Base of Truth by selecting an anchor Claim they hold a ClaimAccord on that is in STANDING state.

**Judgment**

- **FR-031**: Judgment on a Duel MUST require: (a) a Disposition on the Duel, (b) a completed Analysis referencing Moments, (c) the judge has a declared Base of Truth with a STANDING anchor Claim, (d) the judge is not a party to the Duel.
- **FR-032**: Judgment MUST record a verdict (challenger or defender), the Analysis it is based on, and the judge's anchor Claim.
- **FR-032a**: Judgment weight MUST be computed at query time as `strength(anchor_claim) × judgment_track_record(judge)` where `judgment_track_record` is the fraction of the judge's prior Judgments that aligned with eventual Accord outcomes (defaults to 1.0 for first-time judges). This weight MUST be displayed alongside each Judgment in the Case View and used when aggregating Judgments into a consensus indicator. It MUST NOT be stored; it is always derived live.
- **FR-033**: Claim strength MUST be computed at query time from the dataset: `strength = count(ClaimAccords) × count(Duels where Disposition=STANDING)`. No stored score field.

**SimilarityLinks**

- **FR-034**: Any Person MAY submit a SimilarityLink asserting two Records are equivalent.
- **FR-035**: A SimilarityLink MUST be challengeable and can reach STANDING state.
- **FR-036**: A SimilarityLink in STANDING state MUST enable the system to surface the prior Duel resolution as Precedent for any new equivalent Challenge.

**MVC Architecture**

- **FR-037**: All permission logic (canChallenge, canAnswer, canOffer, canRespond, canAgree, canJudge, etc.) MUST reside in the Controller; the View MUST NOT make permission decisions.
- **FR-038**: The View MUST only read Controller state and render accordingly; it MUST disable (not hide) controls that are unavailable.
- **FR-039**: The Model MUST map directly to database entities (rows in the SQLite schema defined in plan.md).

**URL & Navigation**

- **FR-040**: Every Record, Case, and Duel MUST have a canonical URL expressed as browser URL params.
- **FR-041**: The app MUST interpret URL params on load and render the correct view (Home, Case Chooser, Duel Chooser, or Case View).
- **FR-042**: A copy-to-clipboard button MUST appear on every Record card.

**UI / UX**

- **FR-043**: The app MUST use a dark theme with select colorful accent elements.
- **FR-044**: The header MUST contain: home/scales icon (top-left), `judgmental.io`, and the current version (far right).
- **FR-045**: Record type icons MUST be: Claim = `!`, Challenge = `?`, Answer = `✓`, Offer = `⇌`, Response = `·` (accepted) / `✗` (rejected).
- **FR-046**: Home View MUST list Claim cards ranked by derived strength (query-time: agreers × survived Duels); cards MUST show a "Your turn" badge when applicable.
- **FR-047**: Claims with no Cases MUST be visually indicated as untested; claims with all Duels settled MUST be indicated as standing or settled.
- **FR-048**: The inline Composer (challenge/answer/offer input) MUST slide up in-place, preserve draft text on cancel, and dismiss on deliberate close.
- **FR-049**: After any submission the current view MUST refresh to reflect the updated state.
- **FR-050**: Notifications ("You were challenged", "Your answer was challenged") MUST appear for pending actions.
- **FR-051**: Cards in the Home feed MUST be click-anywhere-to-open.
- **FR-052**: Stacked card depth MUST be conveyed visually (slight z-offset shadow stacking).
- **FR-053**: The Case View MUST show the full Record lineage at top as parent chain with arrow separators.
- **FR-054**: The two-lane Case View (after first counter-challenge) MUST interleave challenges and counter-challenges chronologically. Left lane: challenger's Challenges. Right lane: defender's counter-Challenges.
- **FR-055**: The "Your turn" indicator MUST be shown within the active Case View.
- **FR-056**: The latest actionable Record MUST be highlighted.
- **FR-057**: The app MUST use no external JavaScript frameworks or libraries; plain vanilla JS only.
- **FR-058**: The Home feed MUST pre-fetch Case detail data for all Claim cards visible in the current viewport.

**AI Disclosure**

- **FR-059**: Every Record MUST carry `is_ai` (boolean) and `ai_model` (string | null) fields in the database.
- **FR-060**: The View MUST render a visible `[AI]` badge on every Record card where `is_ai = true`, and an `[AI-assisted]` badge where `ai_model` is set but the record is co-authored by a human.
- **FR-061**: The composer MUST expose a toggle ("AI-assisted" / "AI generated") so authors can self-declare AI involvement at submission time.

**Evidence and Exhibits**

- **FR-062**: Any Record MAY have one or more **Evidence** items attached to it — structured attachments of type: `url`, `quote`, `image`, `file`, or `cross_record`.
- **FR-062a** (**Miranda Principle**): A `cross_record` Evidence item cites any existing Record on the platform by its `id`. Any Record authored by a Duel party MAY be submitted as `cross_record` Evidence against them in any Duel in which they are a party. Everything posted on judgmental.io is on the record and permanently admissible. This is constitutionally non-negotiable. **This applies without exception to Records filed by AdvisorBot under Power of Attorney.** A PoA Record is attributed to the Person, not the Bot. The `[via AdvisorBot]` badge is a disclosure of method, not a reduction of accountability. Such Records are admissible against the Person as Evidence, are challengeable, contribute to their Worldview, and survive Rescission as permanent artefacts. A Person who operates under PoA accepts the same Miranda jeopardy as a Person who files every Record themselves.
- **FR-062b**: At first composition, every new user MUST see a persistent acknowledgement card above the composer: *"Everything you post on judgmental.io is permanent and on the record. Any of your Records can be submitted as Evidence in a Duel by anyone."* The card collapses only once the user explicitly acknowledges it. It MUST NOT be a skippable modal.
- **FR-063**: During a Duel, either party MAY formally submit an Evidence attachment as an **Exhibit**, assigning it an auto-incremented label (Exhibit A, Exhibit B, …) within the Duel.
- **FR-064**: Either party MAY object to an Exhibit by challenging it; this opens a nested Case against the Exhibit Record.
- **FR-065**: Exhibits MUST be listed in the Case View with their label and the submitting party clearly shown.

- **FR-090** (**Rescission**): Any Person MAY rescind any Record they authored by creating a Rescission Record pointing at it. The original Record MUST NOT be deleted or hidden. The Rescission notice MUST appear prominently on the original Record card. The author is no longer obligated to answer as defender for that Record going forward, but existing Duels MUST continue to their Disposition unchanged. A Rescission MAY NOT cascade-close Cases, Duels, or ClaimAccords held by others.
- **FR-091**: A Rescission Record MUST itself be challengeable, opening a nested Case to contest its sincerity or good faith.
- **FR-092**: When a Person rescinds a Claim that was in STANDING state, the platform MUST surface this event prominently — on the Person's profile, in the Flux/Velocity analytics view, and with a `[Rescinded STANDING]` badge — as a mark of intellectual courage. This is a virtue mechanic, not a penalty.
- **FR-093** (**On the Record search**): Any authenticated user MAY look up the full public record of another Person — every Record they have ever authored (including Records filed under AdvisorBot PoA, displayed as `[via AdvisorBot]`), every ClaimAccord they hold, every Judgment they have rendered, every Rescission they have made — filterable by Record type and topic. PoA Records appear in full; they are not collapsed, hidden, or marked as provisional. This is the Miranda feature in UI form: research your opponent before entering a Duel.

**Judicial Role Framing**

- **FR-066**: Each party in a Duel MUST display a visible role badge — **EXAMINING** (challenger's turn) or **TESTIFYING** (defender's turn) — in the Case View. The badge flips when the counter-challenge is submitted.
- **FR-067**: The judicial vocabulary mapping MUST be surfaced as a tooltip on the role badge: Challenge(Interrogatory) = Examination; Challenge(Objection) = Objection; Answer = Testimony; Counter-challenge = Cross-examination; Offer = Stipulation; Response(accepted) = So stipulated.
- **FR-068**: Advanced judicial roles MAY be represented as future first-class entities:
  - **Voir dire**: Pre-Duel qualification check of a proposed judge (does their BaseOfTruth qualify them to judge?).
  - **Subpoena**: A formal request that a specific Person enter a Duel as a witness.
  - **Deposition**: A structured pre-Case Q&A chain (Interrogatory Challenge sequence) before a formal Case is opened.
  - **Burden of proof**: A Duel-level flag indicating which party must prove their position.
- **FR-068a**: The platform MUST support a `logic_annex` Record type that allows formal philosophical argument (including syllogisms) as an attached analysis lane on Claims, Challenges, Answers, and Judgments.
- **FR-068b**: A `logic_annex` MUST include: `form`, ordered `premises`, `inference`, and `conclusion` fields. It is challengeable like any other Record.
- **FR-068c**: Core Duel outcomes MUST NOT be determined by formal validity alone. Logic Annex output is advisory analysis, interpreted through worldview, evidence, and cross-examination.
- **FR-068d**: Scripture Evidence MUST NOT be transformed into coercive logical premises in `logic_annex` outputs; scripture remains testimony to Base of Truth.

**Widget Commonwealth and Mobile-First Richness**

- **FR-068e**: The planned widget set MUST be implemented as first-class, versioned analyzers: Bible, Precedent, Logic, Consensus, Timeline, Impact, Evidence Graph, Worldview Intersections, Translation, Bot Provenance.
- **FR-068f**: Every widget MUST expose provenance metadata (`input_refs`, `version`, `computed_at`) and a user-visible "how this was computed" view.
- **FR-068g**: Widgets MUST be mobile-first: touch-first controls, thumb-reachable primary actions, readable compact state, expanded detail state, and fullscreen inspector state.
- **FR-068h**: No critical widget function may rely on hover-only interactions. Small-view fallback views (list/table) are required when complex charts are not legible.
- **FR-068i**: Widget outputs MUST render with loading skeletons and graceful degradation for poor networks.

**Tipping and Creator Support**

- **FR-069**: Any authenticated Person MAY send a tip to any other Person via Stripe or a Ko-fi link fallback.
- **FR-070**: Tips MAY be optionally attached to a specific Record (the piece of content that prompted the support).
- **FR-071**: The platform MUST take 0% of tips in v1. The platform fee is a configurable server-side setting (default 0).
- **FR-072**: Tipping MUST NEVER gate, unlock, or otherwise affect any judgment, Claim access, Duel participation, or Record visibility. The constitutional constraint is absolute.
- **FR-073**: A "Support this person" button MUST appear on every Person profile card.

**Advertising**

- **FR-074**: Advertising is shown ONLY to unauthenticated users as a fixed bottom strip (`<aside class="ad-strip">`).

**Admin Interface**

- **FR-094** (**Admin role**): A `role` field on Person MUST support values `member` (default), `moderator`, and `admin`. Role is set server-side only, never via user-facing flows. Only `admin` role holders may access the admin interface.
- **FR-095**: The admin interface MUST be a server-rendered HTML page at `/admin` (authenticated, `role=admin` gate). It MUST NOT expose any sensitive keys or secrets in client HTML.
- **FR-096** (**User Management**): Admin interface MUST provide a paginated user list with columns: Person handle, platform, joined date, role, record count, ban status. Admin MAY change a Person's role (`member` ↔ `moderator`) and MAY ban or un-ban a Person.
- **FR-097** (**Ban enforcement**): A banned Person MUST receive `403 {"error":"banned"}` on all write routes. Banned Persons MAY still read public content — ban is a write-lock, not erasure. Banning MUST NOT delete any Records (append-only principle preserved).
- **FR-098** (**Moderation queue**): Two types of reports flow into the moderation queue: (a) flagged Records — any authenticated Person may flag a Record as harmful; (b) automatic flags from the cron integrity check. Moderators and admins see the queue; only admins may resolve flags that result in bans.
- **FR-099** (**Cron Control Panel**): Admin interface MUST show a Cron Control Panel listing every scheduled job with: name, schedule expression, last run timestamp, last run outcome (OK / ERROR + message), next scheduled run, and a manual "Run now" trigger. Jobs MUST NOT be startable/stoppable from the panel — only manually triggered for diagnostic use.
- **FR-100** (**System health**): Admin interface MUST display: DB file size, WAL checkpoint lag, Litestream last-replicated timestamp, server uptime, memory usage, and rate-limit hit count in the last hour. All polled live on page load.

**Scheduled Jobs (Cron)**

- **FR-101** (**Default Disposition checker** — implements FR-026): `every 1 minute` — queries `deadline_conditions` where `deadline_at < now` and duel has no Disposition; writes Default Disposition record for each expired deadline.
- **FR-102** (**Stale Duel reaper**): `every 6 hours` — queries Duels open > 30 days with no Turn activity in the last 7 days; creates a `moments` annotation flagging the Duel as stale; sends an in-app nudge notification to both parties. Does NOT force-close.
- **FR-103** (**Judgment track-record recompute**): `every hour` — for each Person who has rendered Judgments, recompute `judgment_track_record` (fraction of prior Judgments aligned with eventual Accord outcomes) and upsert into `person_stats` cache table. This cached value is used by Judgment weight computation to avoid per-request aggregation.
- **FR-104** (**Analytics rollup**): `every hour` — aggregate `records`, `claim_accords`, `duels`, `judgments` into `analytics_snapshots` table (hourly buckets). Powers auto-analytics views without full-table scans on every request.
- **FR-105** (**SimilarityLink cluster recompute**): `every 24 hours` — walks the `similarity_links` graph and recomputes connected-component cluster ids, storing cluster membership in `similarity_clusters` table. Enables Precedent surfacing queries.
- **FR-106** (**DB integrity check**): `every 24 hours` — runs `PRAGMA integrity_check`; runs `PRAGMA wal_checkpoint(PASSIVE)`; records Litestream replication lag; if integrity check fails or lag > 5 minutes, creates an auto-flag in the moderation queue and writes to `cron_runs` with `status=error`.
- **FR-107** (**Tip settlement digest**): `every 24 hours at 00:00 UTC` — aggregates tip totals per recipient for the prior day; writes a row to `tip_digests`; exposes via `GET /api/persons/:id/tips/digest` for creator dashboard.

**Dating and Compatibility Mode**

- **FR-108**: A Duel MAY be filed with `context=compatibility`. Both named Persons MUST accept a consent prompt before the Duel begins — no compatibility Duel can be imposed unilaterally.
- **FR-109**: Compatibility Duels use identical mechanics to standard Duels. Only the framing copy and UI chrome change (e.g. "Proposal" instead of "Claim", "We should move in together" style). The underlying records schema is unchanged.
- **FR-110**: Compatibility Duel verdicts are **private by default** — visible only to the two parties. Either party may choose to make the verdict public, but ONLY if both consent. Consent is a mutual toggle.
- **FR-111**: Compatibility Duels MUST be excluded from all public Analytics views, the public feed, and Verdict Data API unless both parties have made the verdict public.
- **FR-112**: A trusted panel of up to 5 invited Persons (e.g. mutual friends, a therapist) MAY be added as Judges on a Compatibility Duel. Invitations are sent via in-app notification.

**Marriage Features**

Marriage on judgmental.io is a structured, consensual, on-the-record commitment between two Persons. It builds on the Compatibility Duel context with additional ceremony, covenant, and dispute-resolution mechanics. It is belief-agnostic; the platform does not attach any legal, religious, or cultural meaning to the record — it is a voluntary structured commitment between two adults.

- **FR-133** (**Marriage Proposal**): A Person MAY file a `context=proposal` Duel naming one other Person. The proposal consists of: (a) a `proposal_text` (the statement of intent), and (b) an optional `vow_draft` (preliminary covenant text the proposer wishes to commit to). Both Persons MUST consent before the Duel begins.
- **FR-134** (**Proposal mechanics**): The named Person may: (a) **Accept** — producing an `engaged` Disposition and creating a linked `MarriageRecord` in state `engaged`; (b) **Decline** — Duel closes with `declined` Disposition, no further record; or (c) **Counter-propose** — opens a turn sequence where vow terms are negotiated as Offers and Responses until Accord is reached.
- **FR-135** (**MarriageRecord entity**): A `marriage_records` table MUST be created with columns: `id`, `person_a_id`, `person_b_id`, `state` (`engaged` | `married` | `separated` | `dissolved`), `proposal_duel_id`, `covenant_record_id`, `ceremony_at`, `created_at`. This is a first-class entity with its own canonical URL (`/marriages/:id`).
- **FR-136** (**Covenant Filing**): After an `engaged` state is reached, both Persons MAY co-author a **Covenant** — a structured Record listing mutual commitments (one commitment per line, each independently challengeable). Both Persons must digitally sign the Covenant (a consent toggle) before it is sealed. The sealed Covenant is immutable and append-only. It is linked to the `MarriageRecord`.
- **FR-137** (**Covenant commitments as Claims**): Each line of a sealed Covenant is stored as a `context=covenant` Claim authored jointly (`person_a_id` and `person_b_id` both listed as co-authors). These Claims are challengeable by either party within the marriage's dispute context. Covenant Claims are always private to the couple unless both consent to make them public.
- **FR-138** (**Ceremony Record**): Either party MAY mark the marriage as formalised by filing a `ceremony_at` timestamp on the `MarriageRecord`. Both must consent. This updates state from `engaged` to `married`. No external verification is required or implied — it is a self-reported record.
- **FR-139** (**Intra-marriage Dispute Resolution**): Any dispute between the two married Persons SHOULD be filed as a `context=compatibility` Duel linked to the `MarriageRecord` (`linked_marriage_id` foreign key). The UI offers this as the default filing path when two married Persons initiate a Duel against each other. Linked Duels are always private unless both consent to publicise.
- **FR-140** (**Separation**): Either party MAY file a `context=separation` Duel. Both must consent to begin. The Duel is a structured negotiation of terms. A `reconciliation` Disposition returns state to `married`. An `accord` Disposition on agreed separation terms updates state to `separated`. A `default` Disposition (one party non-responsive) MUST NOT automatically update state — a human review flag is created.
- **FR-141** (**Dissolution**): Both Persons must mutually and explicitly consent to a `dissolved` state via a dedicated dissolution confirmation flow (not a standard Duel). Both must confirm independently within a 48-hour window. The `MarriageRecord` state is updated to `dissolved`; all linked Covenant Claims are marked `[DISSOLVED]`. The record remains permanently accessible to both parties.
- **FR-142** (**Marriage profile visibility**): A Person's public profile MAY display their marriage status (`engaged`, `married`, `separated`) if both parties have consented to public visibility. Default is private. Dissolved marriages are never shown on public profiles.
- **FR-143** (**Witness role**): Up to 4 Persons MAY be invited as Witnesses to a marriage ceremony. Witnesses receive a notification and may submit a short `witness_statement` Record linked to the `MarriageRecord`. Witness statements are private by default, public if both parties consent. Witnesses have no mechanical role — their presence is a record of social acknowledgement only.
- **FR-144** (**Marriage feed section**): Public marriages (both parties consented) appear in a dedicated **Commitments** feed section, separate from the standard Claim feed. This feed is opt-in for viewers.

**Post-Wedding Couple Features**

Once a MarriageRecord is in `married` state, the following features become available to the couple.

- **FR-145** (**Anniversary Record**): On each anniversary of `ceremony_at`, the system sends both Persons an in-app prompt to file an **Anniversary Reflection** — a jointly authored Record documenting one thing each party is grateful for from the prior year. Both must contribute before it is sealed. Reflections are private by default; either or both may be made public. They are linked to the `MarriageRecord` chronologically.
- **FR-146** (**Covenant Review Cycle**): Either party MAY initiate a **Covenant Review** at any time. This opens a structured negotiation (Offer/Response turn sequence) on any Covenant Claim they wish to revise. A revised Covenant Claim is a new Record appended after the original; the original is marked `[SUPERSEDED]` but preserved. Both must consent to finalisie any revision.
- **FR-147** (**Decision Record**): Married Persons MAY file a `context=decision` Duel on joint decisions (e.g. "We should buy a house", "We should move cities"). Both must consent. The Duel proceeds as a structured deliberation. The Disposition is recorded as the couple's on-the-record joint decision. Decision Records are private by default and linked to the `MarriageRecord`.
- **FR-148** (**Gratitude & Appreciation Posts**): Either party MAY file a `context=appreciation` Record directed at their partner. The partner receives a notification and may optionally respond. These are private by default; if both consent, they appear in the Commitments feed. They are linked to the `MarriageRecord` as a timeline of expressed appreciation.
- **FR-149** (**Shared Base of Truth**): Married couples MAY opt in to a **Shared Covenant Claims** view — a private page at `/marriages/:id/covenant` showing all their jointly held Claims, Decision Records, and the current state of each (STANDING, challenged, superseded). This is the couple's shared epistemic record.
- **FR-150** (**Marriage Health Snapshot**): The system computes a private **Relationship Health Snapshot** for the couple — never visible to anyone else — showing: number of linked Duels filed, resolved, and unresolved; number of Covenant Claims in STANDING state; time since last Anniversary Reflection; and time since last Appreciation Record. This is surfaced as a private dashboard widget at `/marriages/:id`. It is explicitly NOT a score or rating — it is a neutral record of activity.
- **FR-151** (**External Counselor Access**): Either party MAY invite one external Person (e.g. a counselor, therapist, or pastor) as a **Counselor** on the `MarriageRecord`. Both must consent. The Counselor gains read-only access to all linked Duels and Covenant Claims, and may submit private Analysis on any of them. Counselor access is revocable by either party at any time. Their Analysis is never public.

**Dating Mode — Initiation and Dating Duels**

Dating Mode is a first-class product mode in v1. The dating/compatibility experience is designed to be shareable, playful, and inherently viral. Compatibility Duels shared externally are called **Dating Duels** in all user-facing copy. The following mechanics drive traffic through the Dating Mode surface.

- **FR-152** (**Dating Duel invite link**): When Person A files a `context=compatibility` Duel, the system generates a **shareable Dating Duel invite link** (`/join/duel/:token`) that can be sent to Person B outside the app — via DM, text, or any social platform. The link shows a Dating Duel teaser card ("Someone wants to settle something with you — on the record") before prompting sign-in. The invite token expires after 7 days if not accepted.
- **FR-153** (**Dating Duel teaser card**): The invite link page MUST show a teaser that reveals only the Duel topic (e.g. "Are we compatible enough to move in together?") without revealing the filer's identity until Person B signs in and accepts. This creates curiosity-driven click-through. The teaser card is branded as a **Dating Duel** in the header.
- **FR-154** (**Public "Settle It" challenges**): Person A MAY file a Dating Duel as a **public open challenge** — directed at any Person who matches a stated profile (e.g. "Anyone who thinks pineapple belongs on pizza — settle it with me"). These appear in a dedicated **Open Challenges** feed section. Any authenticated Person MAY accept. Once accepted, the Duel becomes private between the two parties.
- **FR-155** (**Dating topic templates**): A library of pre-written **topic templates** MUST be available when filing a `context=compatibility` Dating Duel. Categories: Lifestyle, Values, Finances, Family, Conflict Style, Future Plans, Dealbreakers. Selecting a template pre-fills the Claim text and suggested turn structure. Templates are community-contributed (filed as Records and upvoted) — the most-used templates surface first.
- **FR-156** (**Dating Duel score card**): After a Dating Duel reaches a Disposition, the system generates a private **Score Card** for the two parties — a visual summary showing: topic, the position each party held, where they converged, where they diverged, and the verdict. Both parties may choose to share the Score Card as a static image (generated server-side as an SVG/PNG). Shared Score Cards are watermarked with the judgmental.io URL and Duel ID.
- **FR-157** (**"Find your match" Claim alignment**): Any Person MAY publish a set of their public ClaimAccords as a **Match Profile** — a curated list of positions they hold (e.g. political, lifestyle, values Claims). The system MAY surface other Persons with high Claim-alignment scores as potential Dating Duel matches. Alignment is computed as Jaccard similarity over public ClaimAccords. This feature requires explicit opt-in for both the publisher and the surfaced match.
- **FR-158** (**Shareable Dating Duel teaser**): A Person MAY generate a public **"Duel me on this"** card from any of their public Claims — a shareable image linking to an open Dating Duel challenge on that Claim. Format: the Claim text, their handle, and a CTA ("Think you can beat this? Accept the challenge"). This is the primary viral loop: post the card on X/Threads/Instagram, drive clicks to judgmental.io, new users sign up to accept.
- **FR-159** (**Dating leaderboard**): An opt-in public leaderboard of **Most Compatible Pairs** (couples who have completed the most Dating Duels with `reconciliation` or `accord` dispositions and chosen to be public). Displayed on the Commitments feed. Drives social proof and aspiration.

**Christian Mode — Faith Community Features** *(First Release)*

Christian Mode is a first-release feature set, not an add-on, and not a general faith mode. It is built for Bible-following Christians: people who hold scripture as their highest authority and who take repentance, reconciliation, and accountability seriously as real practices of the faith — not metaphors. Church Discipline is the most structurally serious feature on the platform and is treated as such. judgmental.io's core mechanics — structured claims, evidence, challenge, verdict — map naturally onto how Christians engage with doctrine, accountability, community discernment, parenting disagreements, and courtship. This is not Patheos. No denomination is privileged, but the frame is unambiguously Christian.

**On Scripture Evidence and proof-texting**: Scripture references are first-class Evidence and are welcomed as genuine expressions of a person's Base of Truth. However, the platform actively discourages *proof-texting* — assembling isolated verses as logical premises to compel a conclusion. A scripture reference is testimony: *"This is what I believe, and here is the text I ground it in."* It is not a logical lever. UI copy, templates, and AI assistance in all Christian Mode contexts MUST reinforce this framing. Any prompts in these contexts ask *"What does this text mean to you and how does it ground your position?"* — never *"What conclusions follow from this verse?"* This is Constitutional Principle I — it applies platform-wide, not only in Christian Mode contexts.

- **FR-160** (**Scripture Evidence type**): A new `evidence_type=scripture` MUST be added to the Evidence entity. Scripture Evidence fields: `book` (string), `chapter` (integer), `verse_start` (integer), `verse_end` (integer, nullable), `translation` (string, default `"KJV"`; supported values: `"KJV"`, `"WEB"`, `"ASV"`, `"Darby"`, `"YLT"`, `"Geneva"`, `"Bishops"`), `quote_text` (the verse text as quoted). Scripture Evidence renders with a canonical citation badge (e.g. `John 3:16 KJV`) and an expandable Bible Widget (FR-210) showing the verse in context. Searchable by reference. Any Evidence may cite scripture regardless of Duel context.
- **FR-161** (**Doctrinal Claim context**): A Claim MAY be filed with `context=doctrinal`. Doctrinal Claims are expected to cite at least one Scripture Evidence item before filing. The filing interface surfaces a scripture citation helper (book/chapter/verse lookup) and a prompt: *"How does this text ground your position?"* — not *"What does this verse prove?"* Doctrinal Claims appear in a dedicated **Theology** feed section.
- **FR-162** (**Bible Study Duel**): A `context=bible_study` Duel MAY be filed on any Doctrinal Claim. Both parties ground their positions in scripture. The Evidence panel prominently surfaces all cited scripture references as expandable Bible Widgets (FR-210). A trusted panel of up to 7 Judges MAY be invited. Judges may cite their own Scripture Evidence in their Analysis. Turn prompts ask *"What does this passage mean to you?"* not *"What argument does this verse support?"* The Bible Reader (FR-211) is available from any cited scripture reference during a Bible Study Duel — parties may study context, cross-references, and original languages without leaving the Duel view.
- **FR-163** (**Church / Small Group Org tier**): Churches, small groups, and Bible study groups are a primary org-tier use case. An org of type `church` or `small_group` MAY be created. Church orgs have an additional role: `elder` — above `moderator`, below `admin`. Elders may resolve flags and close Duels within the org workspace. Private org Duels are visible only to org members.
- **FR-164** (**Pre-marital Counseling Track**) *(secondary priority — ships after core dispute and reconciliation features)*: A couple in `engaged` MarriageRecord state MAY activate a **Pre-marital Counseling Track** — a structured series of up to 12 pre-built `context=decision` Duel templates covering: finances, children, extended family roles, faith practice, conflict resolution, intimacy, vocation, and shared goals. A counselor or pastor invited as an External Counselor (FR-151) may see all track Duels and add private Analysis. Track progress is shown at `/marriages/:id/premarital`.
- **FR-165** (**Accountability Partnership**): Two Persons MAY enter a `context=accountability` Duel on a stated commitment (e.g. "I will read scripture daily", "I will not return to this habit"). The filing Person declares the commitment (`claim_text`). The partner is the Accountability Holder. At intervals defined in `deadline_conditions`, the committing Person files a Turn reporting progress. The partner may affirm (`reconciliation`) or raise a concern (opens a standard response sequence). All accountability Duels are **private by default** and never appear in any public feed or analytics view.
- **FR-166** (**Community Discernment**): A `context=discernment` Duel MAY be filed within a church org by an elder or admin. All org members are notified and may file Analysis (as amicus curiae). The elder panel renders a final Judgment. Discernment Duels are private to the org. The Disposition is the org's on-the-record decision.
- **FR-167** (**Church Discipline**): A `context=discipline` process MAY be initiated by an org elder against an org member. The process has three mandatory stages consistent with Matthew 18: (1) private `context=apology` Duel between the elder and the member; (2) if unresolved, a second `context=apology` Duel with two additional Witnesses required; (3) if unresolved, escalation to a `context=discernment` Duel before the full elder panel. Each stage MUST be completed before the next is available. Stage records are private to participants. No outcome is published to the org feed without explicit consent of all parties. The system never uses the word "discipline" in the UI — stages are labeled **"Reconciliation"**, **"Witnessed Reconciliation"**, and **"Community Review"**. The Matthew 18 structure is documented as a comment in the discipline-context controller; it is never rendered to the user.
- **FR-168** (**Theological topic templates**): A library of pre-written Doctrinal Claim templates MUST be available. Categories: Salvation, Scripture, Creation, Eschatology, Ecclesiology, Ethics, Sacraments, Prayer. Each template includes a suggested scripture reference and standard counterposition. Templates present both positions neutrally — no theological weighting. Community-contributed; most-used surfaces first. All template prompts follow the anti-proof-texting framing (Constitutional Principle I).
- **FR-169** (**Exploring Our Faith**): **Exploring Our Faith (EOF)** is a primary, ongoing, structured project — not a filter or a feed section. Its central purpose is to **map out the variations in Christian belief** across individuals and traditions, using the platform's core mechanic — the Duel and its resulting ClaimAccords — as the mapping instrument. EOF is a belief-system cartography tool. It grows continuously as more Christians engage their faith on the platform.

  **The Core Premise — A Duel Functions as a Catechism:**

  A **Catechism** is a structured engagement with a doctrinal question: you are asked what you believe, you state it, you may be challenged on it, and you defend it. This is exactly what a Duel does. Therefore, any Duel filed in a Christian Mode context — specifically `context=doctrinal`, `context=bible_study`, `context=discernment`, `context=accountability`, or `context=christian_dating` on matters of faith — IS a Catechism engagement. It produces a defended, on-the-record position. **There are no preset question sets.** There is no pre-built question bank the user must work through. The Catechisms emerge from the Duels people file, not from a curriculum the platform imposes.

  **What this means in practice:**
  - There is no library of pre-authored Catechism questions. The Catechism Library IS the accumulated body of Doctrinal Claims and Bible Study Duels that Christians have filed on the platform.
  - Any Doctrinal Claim or Bible Study Duel MAY be tagged `catechism=true` by the author, signalling that it is intended as a general doctrinal question rather than a personal dispute. Catechism-tagged Duels are listed publicly in the EOF section for others to engage with — to file their own position, to challenge the existing answer, or to seek a ClaimAccord.
  - The result: the Catechism Library is continuously and organically populated with real theological questions that real Christians have found worth engaging. The question set is never finished. It reflects the actual concerns of the community at any given time.
  - **Catechism completion is not a concept.** There is no badge for completing a preset category. A Person has a record of how many Catechism-tagged Duels they have engaged with and what positions they have defended — a descriptive profile, not a completion meter.

  **The Tradition Map and the Connection to ClaimAccords:**

  The heart of EOF is the explicit, structural connection between a Person's ClaimAccords and the traditions of Christianity. This is the belief-system map:

  - Every `faith_relevant` ClaimAccord — a position a Person has stated and defended, or agreed to, in a Christian Mode context — is a data point on their **Doctrinal Profile**.
  - The platform maintains a **Doctrinal Index**: a structured reference set of positions historically associated with known Christian traditions (Reformed, Catholic, Eastern Orthodox, Pentecostal, Charismatic, Baptist, Anglican, Lutheran, Methodist, Non-denominational, Anabaptist, Evangelical, etc.). This index is used only as a reference to compute proximity — never to assign labels or route users.
  - A Person's Doctrinal Profile is compared against the Doctrinal Index to compute **Tradition Proximity Scores** for each tradition. These scores reflect how much overlap exists between what the Person has defended and what each tradition holds. They are shown as a proximity gradient — not a verdict, not a label, not a recommendation.
  - The **Tradition Map** is a visual rendering of this. Each tradition appears as a cluster. The Person's own position is plotted relative to each cluster based entirely on their ClaimAccords. A Person who has never filed a faith Duel has no plotted position. The more they engage, the more precise their position becomes.
  - The Tradition tag (FR-170) is the user's **self-reported anchor** — where they say they stand. The Tradition Map shows where their ClaimAccords actually place them. The gap between the two (if any) is informative and visible to the user, but never displayed to others without explicit consent.
  - The Map is not a judgment. It does not tell a Person they are wrong about their tradition. It shows them what they have actually defended and how it relates to how Christians across history have grouped their beliefs. It is a tool for self-understanding and honest inquiry.
  - The Map enables comparison: two Persons MAY compare their Doctrinal Profiles side by side, seeing where their ClaimAccords overlap, where they diverge, and which tradition clusters each aligns with. This is the core engine of faith-based matching in Christian Dating Mode and of theological search across the platform.

  **The EOF Product Surface:**

  - Accessible at `/faith` from main navigation for all Christian Mode users. No authentication required to browse public EOF content; authentication required to file or engage.
  - Structured sections: (1) **My Doctrinal Profile** — personal list of `faith_relevant` ClaimAccords, Catechism-tagged Duels engaged, and the Tradition Map showing Tradition Proximity Scores; (2) **Open Catechisms** — Catechism-tagged Duels open for others to file a position, challenge an existing answer, or seek a ClaimAccord; (3) **Tradition Map** — the interactive belief-system map rendered visually; (4) **Faith Matches** — Persons whose Doctrinal Profiles most overlap with the viewer's (available in Dating Mode only).
  - Each Person's EOF section MAY be shared publicly at `/persons/:id/faith`. Default: private.
  - The Bible Widget (FR-210) is integrated throughout EOF. Scripture references on any Catechism-tagged Duel render as expandable Bible Widgets. The full Bible Reader (FR-211) is accessible from any Widget.
  - **Ongoing project framing**: EOF is explicitly described in the UI and in product copy as an ongoing community project. It is not a finished feature. The question set grows as the community grows. The map improves as more positions are defended. This is intentional — it is a map being drawn in real time.

  **Personal Faith Profile:**
  - A Person MAY tag any ClaimAccord as `faith_relevant`. Faith-tagged ClaimAccords form the core of their **Personal Faith Profile** — a structured, queryable record of their stated and defended positions on matters of Christian faith.
  - Accessible at `/persons/:id/faith`. Opt-in only. Visible to the person by default; shareable publicly at their discretion.
  - In Dating Mode and Match Profile, faith alignment is shown as a separate **Faith Alignment Score** alongside the standard compatibility score. This score reflects how many `faith_relevant` ClaimAccords the two Persons share vs. hold opposing positions on. The score is not a ranking — it is an informational signal.
  - The Faith Alignment Score is available as a filter in the Christian Dating feed.

- **FR-170** (**Tradition tag**): A Person MAY optionally tag their profile with a `tradition` string. Suggested values (not enforced, not a controlled vocabulary): `"Reformed"`, `"Catholic"`, `"Eastern Orthodox"`, `"Pentecostal"`, `"Charismatic"`, `"Baptist"`, `"Anglican"`, `"Lutheran"`, `"Methodist"`, `"Non-denominational"`, `"Anabaptist"`, `"Evangelical"`. A user may enter any value. Displayed on the Person profile card and in Exploring Our Faith as their stated tradition. Plotted on the Tradition Map as their **self-reported anchor**. The Tradition Map's computed position (derived from ClaimAccords via the Doctrinal Index) is independent of this tag — both are shown side by side so the user can see the relationship between where they say they stand and what they have actually defended. Never used algorithmically to route users, filter content, or weight verdicts.
- **FR-171** (**Christian Dating context**): A `context=christian_dating` Duel MAY be filed between two Persons who have both opted into Christian Mode. This is a structured courtship Duel: the filing Person states an intention or compatibility question grounded in shared faith (e.g. "We share a commitment to raising children in the faith"). Both parties respond with their position and supporting Evidence, including Scripture Evidence. The verdict is private by default. Key use cases: (1) faith compatibility assessment before committing to a relationship, (2) doctrinal alignment check between dating Christians, (3) shared values declaration early in courtship. Turn prompts in this context ask *"What does your faith say about this?"* and *"How would you pursue this together?"* — never framing it as a debate to be won. The Score Card for Christian Dating Duels shows a **Faith Alignment Score** alongside the standard compatibility score.
- **FR-172** (**Christian Dating feed and discovery**): A public **Christian Dating** feed section MUST be available, surfacing Open Challenges filed with `context=christian_dating`. Browsable by Tradition tag. Members may post public faith statements (“I believe marriage is a covenant”) as an Open Challenge, inviting anyone who shares or disputes that position to respond. This is the primary discovery surface for Christians seeking a faith-first relationship. Faith Alignment Scores from completed Christian Dating Duels are shown on the Match Profile.
- **FR-173** (**Parenting — Family Agreements and Disputes**): A `context=parenting` Duel is filed by a parent with their child as the named other party. The primary purpose is **family governance**: parents and children making explicit agreements and handling disputes about rules, expectations, conduct, and commitments — on the record, with both parties heard.

  **The parent is the authority.** The platform does not pretend that parent-child dynamics are peer-to-peer. When a Judgment is rendered on a Parenting Duel, the Judgment Weight formula applies a **Parenting Authority Factor** that weights the parent's position in their favor unless the child presents compelling Evidence of harm, deception, or a clear breach of a prior agreement. This reflects the actual relational structure: a parent who initiates a Parenting Duel is not asking to be overruled by a verdict — they are using the structure to give their decision the dignity of a fully-heard, on-the-record process.

  **What the mechanic does for children**: The child is fully heard. Their position is entered on the record. They may submit Evidence. The process is not a kangaroo court — it is a structured hearing in which the child can articulate their case and have it taken seriously. The outcome remains the parent's decision; but the child knows they were heard, and the parent has a clear record of what they decided and why.

  **Use cases**: curfew agreements and disputes, screen time rules, dating restrictions, academic expectations, chore agreements, faith practice commitments, summer plans, device access, social commitments. Both parties may propose terms; the Duel produces a documented family agreement.

  **Filing constraints**: Both parent and child must accept a consent prompt before the Duel begins. Parenting Duels are always private — never in any public feed, Analytics view, or Verdict Data API response. The child's handle is never shown on any public surface in connection with a Parenting Duel.

  **Co-parenting** (two parents, no child party): A `context=co_parenting` Duel MAY be filed between two adults who share parental responsibility. Standard Duel mechanics apply; no Parenting Authority Factor is applied — both parties hold equal parental authority. Templates: school choice, discipline method, schedule, extra-curricular priorities, device rules, holiday arrangements. Available to all users without Christian Mode.
- **FR-174** (**Parenting — Christian household context**): A `context=parenting` Duel MAY be filed with `faith_context=christian`. In the Christian understanding, the parent's authority is not earned — it is conferred. Ephesians 6:1–4 grounds the child's call to obey; Proverbs 1:8 grounds the parent's call to instruct; Ephesians 6:4 grounds the parent against provoking to anger. The Parenting Authority Factor is theologically grounded: a parent acting within scripture-informed discipline carries the explicit weight of their calling, and the Duel gives that authority a structured, on-the-record voice.

  The Christian parenting context surfaces:
  - Scripture citation support — both parent and child may cite scripture to ground their positions
  - Dedicated template library: (1) faith practice commitments (daily prayer, scripture reading), (2) how to respond to a child's expressed doubt, (3) church attendance choices (where the child has a view), (4) faith school vs state school, (5) Sabbath and Sunday practices, (6) approach to confession and repentance with children, (7) purity and courtship standards, (8) media, device, and entertainment standards in a Christian household
  - Turn prompts ask *"How does your understanding of scripture and your role as a parent — or your experience as a child — inform this?"*
  - Elder or counselor access MAY be granted to a trusted third party (e.g. pastor, family elder) as read-only with Analysis privileges
  - Verdict is always private
  - The framing throughout is covenantal, not adversarial. The goal is a family agreement that both parties can live with and that the parent can stand before God about.

**Bible Widget and Bible Reader — Integrated Scripture Study Tool**

The Bible Widget and Bible Reader together form the platform's native Bible study tool. They are not peripheral features — they are the primary interface through which scripture is engaged across all Christian Mode contexts and the Exploring Our Faith Catechism Library. The Bible Reader is a full-featured study environment that grows over time.

- **FR-210** (**Bible Widget**): A **Bible Widget** MAY be attached to any Record (Claim, Turn, Analysis, Judgment, Covenant line). A Bible Widget consists of: `ref` (human-readable reference, e.g. `"Romans 8:28–30"`), `verseIds` (canonical api.bible verse ID array), and `translation` (default: `"KJV"`). The widget renders as a collapsed pill showing the reference and translation badge (e.g. `Romans 8:28–30 · KJV ▾`). Expanding the pill shows the verse text, individually numbered, with line-height optimized for reading. A **"Open in Bible Reader"** button opens the full Bible Reader (FR-211) pre-loaded to the passage. The Bible Widget is the first implemented Widget type. Composer integration allows any user to attach a Bible passage by book/chapter/verse selection or by reference search. Multiple Bible Widgets MAY be attached to a single Record.

  **Supported translations — all free via api.bible at launch:**

  | Translation | ID (api.bible) | Notes |
  |---|---|---|
  | King James Version (KJV) | `de4e12af7f28f599-02` | **Default.** Public domain. Most widely recognized. |
  | World English Bible (WEB) | `9879dbb7cfe39e4d-04` | Modern public domain. Gender-neutral. |
  | American Standard Version (ASV) | `685d1470fe4d5c3b-04` | Public domain. 1901. |
  | Bishops' Bible 1568 | `c315fa9f71d4af3a-04` | Historical. Public domain. |
  | Geneva Bible 1587 | `c4872018b0e01352-01` | Reformation-era. Public domain. |
  | Darby Translation | `179568874c45066f-01` | Public domain. Strong for prophecy study. |
  | Young's Literal Translation (YLT) | `65eec8e0b60e656b-01` | Highly literal. Public domain. |

  KJV is pre-selected. The user MAY select any supported translation when attaching a Bible Widget. Translation is stored with the widget payload. Translation switching in the open Bible Reader is available via dropdown without re-attaching.

  **Future translation integrations** (low-priority roadmap only — not first release and not near-term): Expanding to licensed translations such as ESV, NIV, NASB, and NKJV requires formal publisher partnerships and licensing agreements. This is not something the platform can enable unilaterally or via user-supplied API keys — it requires negotiated terms with each publisher. These translations are not offered at launch and are not on the near-term roadmap. They will be pursued through formal partnership discussions when the platform has the audience and commercial structure to support them.

- **FR-211** (**Bible Reader — full study tool**): The **Bible Reader** is a slide-over panel accessible from any Bible Widget and from the Catechism Library. It is a complete personal Bible study environment. Also accessible as a standalone view at `/bible/:ref` — shareable, deep-linkable, and usable without a Duel context. Available without authentication (read-only).

  **Tabs:**

  1. **Passage** — formatted passage text. Line-height 1.8. Verse numbers as superscripts. Translation selector dropdown (all supported free translations; KJV pre-selected). Copy-verse button per verse (copies as `"Romans 8:28 KJV — [text]"`). If a Composer is open, an "Attach to record" shortcut attaches the passage as a Bible Widget.

  2. **Context** — full chapter surrounding the passage. Current verses highlighted. Adjacent chapter navigation arrows. Book and chapter selector for free navigation anywhere in the Bible.

  3. **Original Languages** — interlinear view. OT: Hebrew/Aramaic (BHSA Bible ID via api.bible). NT: Greek (SBLGNT Bible ID via api.bible). Each word shown as a three-line stack: original script → transliteration → English gloss. Hover shows extended lexical entry (Strong's number, semantic range, usage frequency). Framed as study — tab heading reads *"What does this say in the original?"* — consistent with Constitutional Principle I.

  4. **Cross-References** — curated cross-reference chains (Treasury of Scripture Knowledge data, public domain). Each cross-reference renders as an inline Bible Widget pill — tap to navigate there. Grouped by theme (Covenant, Fulfillment, Parallel account, Doctrinal echo).

  5. **Commentary** *(roadmap — not first release)*: Public-domain commentaries for the passage: Matthew Henry, Calvin's Commentaries, Jamieson-Fausset-Brown. Infrastructure stub included in first release.

  The Bible Reader is surfaced prominently in all Christian Mode contexts, the Catechism Library, and the Exploring Our Faith section. Accessible at `/bible` from main navigation.

**Neighborhood Mode — DIY Community Governance**

Neighborhood Mode is for people who share a physical space and need to resolve disputes, agree on conduct, and produce documented shared policies — without a formal HOA, property manager, or legal structure. It is designed for apartment buildings, dorms, shared houses, cul-de-sacs, and any group of people who are neighbors but strangers. The primary acquisition mechanic is a printable QR flyer.

- **FR-175** (**Neighborhood Org tier**): An org of type `neighborhood` MAY be created by any Person. A neighborhood org has: a name (e.g. "Block 14, Maple Street"), an optional address or descriptor (never shown publicly), and an invite mechanism. Members join via invite link or QR code scan. The `neighborhood` org type does not require verified identities — joining with a handle is sufficient. Roles: `resident` (default), `convenor` (org creator and subsequent elected convenors), `guest` (read-only, e.g. a property manager or mediator). A neighborhood org is **private by default** — all Duels, Accords, and Policy Documents are visible only to members.

- **FR-176** (**Neighborhood Duel contexts**): Within a neighborhood org, the following Duel contexts are available: `context=neighbor_dispute` (bilateral dispute between two residents), `context=community_policy` (a proposed shared rule put to all members), and `context=community_vote` (a decision that needs a majority, not a verdict). Community Policy and Community Vote Duels are org-wide — all members are notified and may file Analysis. Neighbor Dispute Duels are private to the two parties and the convenor.

- **FR-177** (**Policy Document**): When a `context=community_policy` Duel reaches a Disposition of `accord`, the resulting ClaimAccord MAY be promoted to a **Policy Document**. A Policy Document is a signed, timestamped record of an agreed community rule. It is versioned — if the rule is later disputed and overturned, the old version is archived and the new accord becomes current. Policy Documents are listed at `/orgs/:id/policies` and are printable as a formatted PDF. They are signed by all members who were active at the time of the accord. Example policies: "No music after 11pm on weekdays", "Shared bike storage is first-come-first-served", "Dogs must be on lead in the courtyard".

- **FR-178** (**QR Invite Flyer**): A convenor MAY generate a **printable QR invite flyer** for their neighborhood org. The flyer is generated server-side as a PDF. It contains: the org name, the QR code (linking to the org's public join page), a one-line description field (e.g. "Residents of Unit 1–12, join our community dispute board"), and the judgmental.io wordmark. The QR code links to a join-intent page at `/join/:org_token` — scanning it shows the org name, member count, and a "Join as resident" button. No personal details are required to view the join page; an account is required to join. Flyer generation is available to all neighborhood orgs at no cost. The PDF is styled to be legible at half-letter size so two can be printed per page and posted on bulletin boards, mailboxes, or communal doors.

- **FR-179** (**Anonymous Dispute Filing**): Within a neighborhood org, a resident MAY file a `context=neighbor_dispute` Duel marked `anonymous=true`. Their handle is hidden from the respondent and other members; they are identified only as "A Resident". The convenor always sees the true identity for moderation purposes. Anonymous disputes are for situations where a resident is concerned about retaliation or social friction from a direct accusation. Once both parties have filed at least one Turn, anonymous status MAY be lifted by the filing party.

- **FR-180** (**Community Policy templates**): A library of pre-written `context=community_policy` templates MUST be available for neighborhood orgs. Categories: Noise, Parking, Shared Spaces, Pets, Deliveries, Cleanliness, Guests, Security, Recycling, and Building Works. Each template includes a proposed rule text, a standard counterposition, and a list of common amendments. Templates are community-contributed and sorted by most-used nationally. A convenor may launch a Policy Duel directly from a template in under 60 seconds.

- **FR-181** (**Neighborhood feed and discovery**): A public **Neighborhood** feed section surfaces anonymized community policies that have reached accord across all neighborhood orgs (with org identity and individual identities hidden). This feed shows what rules real communities have agreed on — "Most agreed-upon noise policy in apartment buildings this month" — and functions as a discovery and persuasion surface: a convenor can share a link to a popular policy in their own org before filing it, showing their neighbors "others have agreed to this". The feed never exposes member identities, addresses, or org names.

- **FR-182** (**Neighbor Dispute resolution arc**): A `context=neighbor_dispute` Duel follows a specific resolution arc distinct from standard Duels: (1) the filing party states the issue and proposed resolution; (2) the respondent may accept (producing an `accord`), contest (standard turn sequence), or escalate to the convenor for mediated Assessment; (3) if the convenor is invoked, they file an Analysis and may propose a binding Community Policy. The UI frames the arc in restorative language — "resolve between yourselves first; bring others in only if needed." The Disposition options are: `accord` (resolved between parties), `community_policy` (escalated to a policy vote), `unresolved` (on the record, no outcome), or `referred` (handed to a property manager or external body).

**Organizations — Core Data Model and Features**

Orgs are the shared-workspace layer of the platform. They scope membership, access, roles, Duel visibility, and subscription billing. Every org type shares the same underlying data model with type-specific extensions. No org type is a second-class feature — all are first-release.

- **FR-183** (**Org entity**): The `Org` entity MUST have: `id`, `name` (string, required), `slug` (unique, URL-safe, used at `/orgs/:slug`), `type` (enum: `church`, `small_group`, `neighborhood`, `team`, `debate_club`, `legal`, `education`, `youth`), `description` (text, optional), `is_private` (boolean, default `true`), `created_by` (Person FK), `created_at`, `updated_at`, `subscription_tier` (enum: `free`, `standard`, `pro`), `subscription_status` (enum: `active`, `trialing`, `lapsed`, `canceled`), `member_count` (computed), and `placement_eligible` (boolean — see FR-195). An Org MAY have an optional `logo_url` and `banner_url` for org profile pages.

- **FR-184** (**Org types and their purposes**): The following org types are supported at launch:
  - `church` or `small_group` — faith community; Church Discipline, Discernment, Accountability contexts available; `elder` role available; **placement_eligible = false** (no paid placement in any feed).
  - `neighborhood` — residential community; Neighbor Dispute, Community Policy, Community Vote contexts available; `convenor` role; QR flyer generation available.
  - `team` — workplace or project team; `context=decision` and `context=apology` Duels available; standard role model; placement in the General Orgs discovery feed available.
  - `debate_club` — educational or competitive debate group; public Duel output encouraged; leaderboard and analytics emphasis; placement in the Debate Clubs discovery feed available.
  - `legal` — legal teams, law firms, mediation groups. Private by default, locked. `context=apology` and standard Duels. No public feed placement. Org API key available at Standard tier.
  - `education` — university departments, school classes, research groups. Standard Duel contexts plus read-only student role. Placement in Education discovery feed available.
  - `youth` — supervised space for persons under 18. Created by a Guardian (individual or institution). Governed by Principle XI. KidsGalleryBot active. Full anonymization layer for non-guardian external viewers. Not placement-eligible. Youth Zone billing is anchored to the creating Guardian's subscription tier, not org-level billing.

- **FR-185** (**Org roles**): Every org has a role hierarchy. Universal roles (all org types):
  - `member` — can file Duels, submit Analysis, and vote within the org workspace
  - `moderator` — can close Duels, remove members, and resolve flags
  - `admin` — full control: edit org settings, manage roles, manage subscription, issue API keys
  - `guest` — read-only; can view Duels and Policy Documents but not participate
  
  Type-specific additional roles:
  - `church` / `small_group`: `elder` — above `moderator`, below `admin`. May initiate Church Discipline, file Community Discernment Duels, and approve Accountability Partnerships.
  - `neighborhood`: `convenor` — equivalent to `admin` for neighborhood orgs; elected by `member` vote after initial creator tenure.
  - `legal`: `counsel` — above `member`, can file Cases on behalf of org; may invite external parties as non-member participants in a specific Duel.
  - `youth`: `guardian` — a verified Guardian-in-Context for the org. Has full Oversight Dashboard access for all Duels in the org. May act (Rescind, Judgment, co-file Challenge) on behalf of their own linked wards only. `ward` — the child participant. May file Duels, submit Evidence, and receive Judgment within the Youth Zone. All ward records are subject to youth testimony sequestration at age 18.

- **FR-186** (**Org membership lifecycle**): A Person joins an org via: (a) direct invite link with a `join_token`, (b) QR code scan (neighborhood type), (c) admin-issued invitation by email or handle, or (d) a public join page if `is_private = false`. When a Person leaves or is removed from an org, their past Duel contributions within the org workspace remain visible to remaining members but are attributed to a `[Former Member]` label. An admin MAY permanently redact a removed member's contributions by explicit action (not automatic). A Person MAY belong to any number of orgs simultaneously.

- **FR-187** (**Org workspace**): Each org has a private workspace at `/orgs/:slug/workspace`. The workspace contains: (1) an Org Feed of all active and resolved Duels scoped to the org, (2) a Members list with roles and join dates, (3) a Policy Documents archive (neighborhood type), (4) a Duel Templates library (org-specific templates in addition to global templates), (5) an Org Stats panel (total Duels, resolution rate, most active members), and (6) an Org Settings page (admin-only). All workspace content is visible only to org members except where the specific Duel has been explicitly made public by its author.

- **FR-188** (**Org-scoped Duel filing**): A Person who is a member of an org MAY file a Duel scoped to that org. Org-scoped Duels: appear in the org workspace feed, are private to org members by default, may be made public by the filer (subject to org settings — admin can restrict this), inherit the org's available Duel contexts, and may be Judge-panelled from org members only. Standard (non-scoped) Duels filed by org members are not visible in the org workspace unless explicitly cross-posted.

- **FR-189** (**Org Duel templates**): An org admin MAY create custom Duel templates scoped to the org. Custom templates appear first in the template picker for org members. A custom template has: `title`, `description`, `default_claim_text`, `default_counterposition_text`, `suggested_context`, and `tags`. Templates are versioned — an updated template does not alter existing Duels created from it. Global (platform-wide) templates are always available to all org members regardless of org type.

- **FR-190** (**Org moderation**): Within an org workspace, a `moderator`, `elder`, or `admin` MAY: close an active Duel (creating a `moderator_closed` Disposition), flag a Duel for admin review, warn a member, temporarily suspend a member from filing (up to 30 days), or permanently remove a member. All moderation actions are logged in an org-only audit trail visible to admins. The platform's global moderation layer sits above org moderation — a globally suspended user cannot participate in any org regardless of role.

- **FR-191** (**Org subscription tiers**): Every org has a subscription tier governing feature access and limits:

  | Feature | Free | Standard ($29/mo) | Pro ($79/mo) |
  |---|---|---|---|
  | Members | Up to 15 | Up to 100 | Unlimited |
  | Active Duels | 5 | 50 | Unlimited |
  | Custom templates | 0 | 10 | Unlimited |
  | Org API key | No | Yes (read-only) | Yes (read-write) |
  | Org analytics | Basic | Full | Full + export |
  | Guest access | No | Yes | Yes |
  | QR flyer (neighborhood) | Yes | Yes | Yes (custom branded) |
  | Policy Documents (neighborhood) | 3 | Unlimited | Unlimited |
  | Placement-eligible | No | Yes (opt-in) | Yes (opt-in) |
  | Church/small_group type | Free forever | — | — |

  **Church and small_group orgs are free forever at all member counts.** The subscription model does not apply to them — they access all features (unlimited members, unlimited Duels, custom templates, full analytics, Org API key) at no cost. This is a constitutional commitment (Principle VII).

- **FR-192** (**Org billing**): Non-church orgs are billed monthly. Subscription is managed at `/orgs/:slug/settings/billing`. Payment is handled via Stripe. Orgs on the free tier may upgrade at any time. Downgrade takes effect at the end of the current billing period. A `lapsed` subscription reverts the org to free-tier limits without deleting data — existing Duels and Policy Documents remain accessible in read-only mode above the free-tier limit until a member manually archives them or the subscription is renewed. Trial period: 30 days at Standard for all new non-church orgs.

- **FR-193** (**Org API keys**): An org on Standard or Pro tier MAY generate an Org API key. Org API keys are scoped to the org's data only — they cannot read or write other orgs' Duels. A read-only Org API key allows: `GET /api/orgs/:id/duels`, `GET /api/orgs/:id/members`, `GET /api/orgs/:id/policies`. A read-write key additionally allows filing Duels and creating Policy Documents via API. Keys are displayed once at creation, stored as bcrypt hashes server-side, and revocable from the settings page. Rate limit: 1,200 req/min per Org API key.

- **FR-194** (**Org analytics**): Every org has an analytics panel at `/orgs/:slug/analytics`. Basic (free): total Duels, total Dispositions, resolution rate, member activity bar chart. Full (Standard/Pro): breakdown by Duel context, average turns to resolution, most active members ranked, most-disputed topics by tag, monthly trend line, Judge consistency scores for org-panelled Duels. Export (Pro only): all analytics data as CSV or JSON. Church orgs receive the Full tier analytics at no cost.

- **FR-195** (**Org placement — non-church only**): Orgs of type `team`, `debate_club`, and `education` on Standard or Pro tier MAY opt into **Org Placement** — paid feed visibility in the relevant discovery feed. Placement is **not available** to `church`, `small_group`, `legal`, or `neighborhood` org types.

  Placement mechanics:
  - A placed org appears in the **Orgs** discovery section at `/discover/orgs`, surfaced to users whose topic interests or Duel history overlap with the org's focus tags.
  - Placement is **topical, not ranking-based** — orgs are matched to users by tag overlap, not by payment amount. Higher payment does not buy a better position; it buys time in the rotation.
  - Placement is sold as a time slot: $19.99/month for the Standard discovery rotation (shown to ~500–2,000 relevant users/month based on tag match), $49.99/month for the Pro rotation (shown to the full relevant audience).
  - Placed orgs MUST have a minimum of 5 completed public Duels visible on their org profile to be eligible. This prevents empty-window placement.
  - Org placement copy is subject to the same anti-argumentation review as all platform copy (Principle I). An org cannot place with copy that frames membership as "sharpen your argument" — only "share what you believe."
  - **Church and small_group orgs are explicitly excluded from placement**. Their community growth happens through pastoral recommendation, not commercial feed visibility.

- **FR-196** (**Org public profile**): Every org has a public profile page at `/orgs/:slug` showing: org name, type badge, description, member count, number of completed Duels, most recent public Duels (if any), and a "Request to join" or "Join" button (depending on `is_private`). Private orgs show only name, type, and member count on their public profile — no Duels visible. Church orgs may optionally display their `tradition` tag on their public profile.

- **FR-197** (**Org discovery feed**): A public **Orgs** discovery section at `/discover/orgs` lists placement-eligible orgs that have opted in, filtered by topic tags and org type. Browsable by type: Teams, Debate Clubs, Education. Neighborhood and Church orgs are NOT listed here — they have their own dedicated feeds (Neighborhood feed at FR-181; Christian community is word-of-mouth only). A user may submit a join request directly from the discovery feed entry.

- **FR-198** (**Org Duel context restrictions by type**): Org admins MAY restrict which Duel contexts are available to members within the org workspace. This allows, for example, a debate club to restrict to `standard` context only, or a legal org to restrict to `apology` and `standard`. Restriction is set in Org Settings and enforced server-side — a member filing a Duel via API with a disallowed context receives `403 Forbidden` with a descriptive error.

- **FR-199** (**Org transfer and succession**): An org `admin` MAY transfer admin ownership to another member. Transfer requires the recipient to explicitly accept. The outgoing admin is downgraded to `moderator` unless they remove themselves. For `neighborhood` orgs, the `convenor` role MAY be put to a member vote — a vote opened by the current convenor or by a petition of ≥30% of members. Vote uses the `context=community_vote` Duel mechanic. For `church` orgs, succession is managed by the existing `elder` panel — any elder with `admin` access may promote another elder to admin.

- **FR-200** (**Org deletion and data retention**): An `admin` MAY delete an org. Deletion is a two-step process: (1) admin triggers deletion, (2) a 30-day cooling-off period begins during which the org is locked (no new Duels, no new members) but fully readable by all current members. After 30 days the org is permanently deleted. Policy Documents and completed Duel records are offered as a ZIP export to the admin before deletion completes. If the org has any Duel with `is_public = true`, those public Duels are detached from the org and remain as standalone public records attributed to `[Deleted Org]`.

**Brand Claims — Interactive Org Placement**

This is the placement mechanic for non-church orgs. Instead of passive sponsored listings, an org's placement in the discovery feed IS a Claim they file and must be willing to defend. A Brand Claim is a public, first-person belief statement made by an org on behalf of their brand — filed as a live Duel that anyone may challenge. The org defends it with Evidence. The Verdict is permanently on their profile. This is not advertising. This is advertising as defended belief.

**The constitutional fit**: Principle I prohibits argumentation but requires defended belief. A Brand Claim is exactly that — a position held by an org, grounded in evidence they can produce, subject to the same challenge mechanic as any other Claim on the platform. An org that says "Our supply chain is ethical" must be prepared to defend that. An org that says "We make the best coffee in London" must be prepared to have that challenged. The mechanic naturally filters for orgs that are willing to stand behind what they say. Orgs that won't file a Brand Claim don't get placement.

- **FR-201** (**Brand Claim entity**): A Brand Claim is a `Claim` filed by an org (via its `admin`) with `is_brand_claim = true` and `filed_by_org_id` set. Brand Claims are always `is_public = true`. The `claim_text` is the org's position statement — first person, present tense, belief-grounded (e.g. "We believe our ingredients are ethically sourced and we can show our work"). Brand Claims MUST NOT use product slogans, superlatives without grounds ("best", "number one"), or passive-voice hedging. The filing interface enforces this with a copy review prompt before submission. A Brand Claim is filed to a `context=brand` Duel automatically upon submission.

- **FR-202** (**Brand Claim filing flow**): An org admin files a Brand Claim at `/orgs/:slug/brand-claims/new`. The filing interface requires: (1) `claim_text` (the position, 20–280 characters), (2) at least one Evidence item (URL, document, or exhibit — supporting the claim), (3) a `challenge_open` boolean (must be `true` to be eligible for feed placement), and (4) optionally a `response_handle` — the specific org member who will handle challenges from the org's side (defaults to admin). Submission triggers a platform copy review (automated + async human review for first-time orgs). Approved Brand Claims are live within 24 hours.

- **FR-203** (**Brand Duel mechanic**): When a user challenges a Brand Claim, a `context=brand` Duel is opened with: the challenging Person as the Challenger, the org's `response_handle` member as the Defender. The Duel follows the standard turn mechanic. The org may submit additional Evidence at each turn. The Challenger may submit counter-Evidence. The Duel is judged by the standard public Judge panel (3–7 Judges drawn from active users, not org members). The Verdict is public and permanently displayed on the org's Brand Claims profile section. An org MAY have multiple Brand Claims active simultaneously, each with its own Duel history.

- **FR-204** (**Brand Claim outcomes and their display**): A Brand Claim Duel may reach the following Dispositions:
  - `defended` — the org's position was upheld by the Judge panel. Displayed on the org profile as a green **DEFENDED** badge with the date.
  - `challenged_successfully` — the challenger's position was upheld. Displayed as an amber **CONTESTED** badge. The org may file an amended Brand Claim (new Claim, new Duel) but the original contested record remains permanently visible.
  - `accord` — both parties reached a mutual understanding. Displayed as a blue **ACCORD** badge — the most credibility-generating outcome for the org, since it implies they engaged genuinely.
  - `abandoned` — the org's `response_handle` did not respond within the deadline. Displayed as a grey **ABANDONED** badge. This is the most damaging outcome and is permanent. It signals the org filed a claim they were unwilling to defend.
  - `withdrawn` — the org withdrew the Brand Claim before any challenge was filed. No badge. The claim is removed from the feed. An org may not re-file the same claim text within 90 days.

- **FR-205** (**Brand Claim feed placement**): A Brand Claim with `challenge_open = true` and `placement_active = true` appears in the **Brand Challenges** feed at `/discover/brand-challenges`. This feed is publicly browsable — no account required to read. Users see org Brand Claims and may tap **Challenge** to open a Duel (requires account). The feed is sorted by: most recently filed, most recently challenged, and "Most Defended" (highest ratio of DEFENDED outcomes). Placement in this feed is the commercial product — orgs pay for `placement_active = true` as a monthly fee (see FR-206). An org with `placement_active = false` may still file Brand Claims and receive challenges via direct link, but is not surfaced in the feed.

- **FR-206** (**Brand Claim placement pricing**): Placement in the Brand Challenges feed is sold as a monthly subscription per active Brand Claim:
  - **Standard placement**: $39/month per Brand Claim — surfaced in the standard rotation to all browsing users.
  - **Pro placement**: $99/month per Brand Claim — surfaced in the Pro rotation with higher frequency and inclusion in the homepage Brand Challenges spotlight (up to 3 featured claims shown on the judgmental.io homepage to unauthenticated visitors).
  - An org MAY have up to 5 active placed Brand Claims simultaneously.
  - Placement is suspended automatically if the Claim receives an `abandoned` Disposition — the org must file a new Claim to re-enter placement.
  - **Church and small_group orgs are ineligible for Brand Claim filing and placement.** This mechanic is for organizations that have a brand — not a faith community.

- **FR-207** (**Brand Claim profile section**): Every org with at least one Brand Claim has a **Brand Record** section on their public org profile. This section shows: all current and historical Brand Claims, their Disposition badges (DEFENDED / CONTESTED / ACCORD / ABANDONED), the number of challenges received per Claim, and the org's overall **Credibility Score** — a computed ratio of DEFENDED + ACCORD outcomes against total adjudicated Brand Claims. Credibility Score is shown as a percentage and a rank label (e.g. "Top 10% of placed orgs"). The Credibility Score is a trust signal, not a game — it cannot be gamed by filing easy claims, because the Judge panel is drawn from the general user base.

- **FR-208** (**Brand Claim copy enforcement**): All Brand Claim text MUST pass the platform's anti-argumentation copy review (Principle I) before going live. Additionally, Brand Claims MUST NOT: make comparative claims against named competitors ("better than X"), make unqualified absolute claims without Evidence ("always", "never", "guaranteed"), use clinical or legal language designed to limit challenge scope ("to the best of our knowledge"), or impersonate another org. Violations result in the Brand Claim being rejected with a specific reason. Repeat violations by an org result in the org being suspended from Brand Claim filing for 90 days.

- **FR-209** (**Brand Claim challenge incentives**): To seed challenges and keep the Brand Challenges feed active, users who successfully challenge a Brand Claim (CONTESTED Disposition) receive a **Challenger Badge** on their profile — visually distinct from standard Duel badges. This badge is permanent, publicly visible, and links to the original Brand Duel record. There are no monetary rewards. The badge is the incentive — it signals the user is willing and able to hold organizations to account on the public record.

---

### Youth Zone

The Youth Zone is a first-class supervised space for persons under 18. It is governed by Principle XI. All of the following FRs are non-negotiable; no org admin or Guardian may override them.

- **FR-220** (**GuardianRelation entity**): The `GuardianRelation` entity MUST have: `id`, `guardian_id` (Person FK), `ward_id` (Person FK), `relationship_type` (enum: `parent`, `teacher`, `coach`, `other`), `youth_space_enabled` (boolean — `true` only when ward's birth date places them under 18 and Guardian has an active Guardian tier subscription), `created_at`, `verified_at` (nullable; timestamp of Guardian verification for under-13 accounts), `active` (boolean; set `false` if Guardian subscription lapses or Guardian removes link). A Person may have multiple Guardians. A Guardian may have multiple wards.

- **FR-221** (**Guardian tier subscription**): The Guardian tier is a **Person-level add-on subscription** at `$14.99/month`. It includes: (a) ability to create `youth` org(s) and add wards; (b) AdvisorBot Advisory (`$9.99/month` value) included at no additional charge for Guardian use only; (c) the Guardian Oversight Dashboard (FR-228); (d) ability to co-file Challenges, Rescind, and file Judgments on behalf of linked wards. No Guardian subscription = no `youth_space_enabled = true` for any linked ward. Guardian subscription lapse immediately suspends Youth Zone access for all wards pending re-subscription or Guardian handoff.

- **FR-222** (**COPPA account creation**): Persons under 13 CANNOT self-register. A Guardian MUST create the ward account from within their Guardian dashboard at `/guardian/wards/new`. The ward receives a credential (handle + password) for their own device. The Guardian's account is the legal consent anchor. If the Guardian account is closed, all linked under-13 ward accounts are suspended within 24 hours, pending reassignment to a new Guardian or age-based upgrade. Persons age 13–17 MAY self-register with birth date declared. They MUST link a verified Guardian within 30 days to access any `youth` org. Without a linked, active Guardian, a 13–17 Person operates in standard adult mode with no Youth Zone access.

- **FR-223** (**Youth org creation**): A Person with an active Guardian tier subscription MAY create an org of `type: youth` at `/guardian/orgs/new`. The Guardian is automatically assigned as `admin` and `guardian` role. The org is **private by default, always** — `is_private` cannot be set to `false` for `youth` orgs. There is no public profile, no discovery feed listing, and no Org Placement option for `youth` orgs. A school or institution creating a `youth` org on behalf of multiple Guardians MUST assign a minimum of one Guardian-in-Context per ward before the ward can participate.

- **FR-224** (**Guardian-in-Context assignment**): A Guardian who is a member of a `youth` org with the `guardian` role is a **Guardian-in-Context** for that org. A Guardian-in-Context: (a) can view all Duels in the org regardless of which ward participated; (b) may act on behalf of their own linked wards only (not any ward in the org); (c) may file Judgment in Duels where their ward is a party. An org `admin` may assign existing Guardians to the `guardian` role. A Guardian MUST have an active GuardianRelation to at least one ward in the org to hold the `guardian` role; removing all linked wards from the org automatically removes the `guardian` role.

- **FR-225** (**Walled garden enforcement**): Under-13 wards are fully walled: they MAY only Duel other wards in the same `youth` org(s) to which they belong. They have no visibility into, and no contact with, the adult platform in any direction. Age 13–17 wards are default-walled: the same restriction applies unless their Guardian explicitly unlocks adult-mode filing for that specific ward via the Guardian Oversight Dashboard. An unlock is logged, visible to all org admins, and immediately reversible by the Guardian. A re-lock takes effect immediately — any active adult-mode Duels are suspended pending Guardian action.

- **FR-226** (**Guardian Belief Ledger attribution rules**): When a Guardian acts on behalf of a ward, attribution follows Principle XI:
  - **Co-signature** (Challenge, new Duel): Record is attributed to the ward AND filed on the Guardian's Ledger. Badge: `[co-filed: @guardian on behalf of @ward]`. The Guardian is epistemic co-owner of the position. This Record is admissible as evidence against both the Guardian (in adult-mode Duels) and the ward (in Youth Zone Duels).
  - **PoA act** (Rescission, Judgment filing): Record is attributed solely to the ward, on the ward's Ledger. Badge: `[via @guardian]`. Ward is fully Miranda'd. The Guardian is acting in the ward's interest, not advancing their own belief, and is therefore not added to the ward's Ledger as an author.
  - The system enforces this at the action level — there is no UI or API path that allows a Guardian to re-classify an action from one type to the other after submission.

- **FR-227** (**Youth testimony sequestration**): On the ward's 18th birthday, all Records in Youth Zone orgs are sequestered as **youth testimony** with `sequestered: true`. Youth testimony: (a) is NOT migrated to the adult Belief Ledger; (b) is NOT returned by `GET /api/persons/:id/records` for adult-mode queries; (c) is NOT admissible as `cross_record` Evidence in any adult-mode Duel; (d) CANNOT be Rescinded by the now-adult Person; (e) is accessible to the now-adult Person in a read-only `/my/youth-record` view; (f) remains accessible to the Guardian(s) linked during the youth period; (g) is excluded from all Verdict Data API exports and third-party analytics. The original Records are never deleted — sequestration is a visibility and admissibility state change, not a deletion.

- **FR-228** (**Guardian Oversight Dashboard**): Every Guardian with an active subscription has a dashboard at `/guardian`. It shows: (a) all linked wards with their current Youth Zone org memberships; (b) for each ward: full Duel history, all Records filed, all Judgments received, all Rescissions; (c) pending co-filing requests (if a ward queued an action for Guardian approval in Guardian-approval mode); (d) Guardian Analytics: aggregate bot commentary activity (KidsGalleryBot), which topics are most active in the ward's Youth Zone orgs, Worldview divergence trends across cohort; (e) unlock status for each ward (walled or adult-mode-enabled). Guardians may act on behalf of any ward directly from this dashboard.

- **FR-229** (**KidsGalleryBot**): One KidsGalleryBot instance is active per `youth` org. It is a system bot, not personal, not a subscription item, and not configurable by Guardians or admins. KidsGalleryBot is prompted with the **aggregate Worldviews of all ward members in the org** — the sum of all ClaimAccords held by all wards — and generates Annotations (not Records) on completed Duels. Rules:
  - Annotations post after a Duel closes, never during.
  - Annotations MUST NOT render a verdict or characterize who made the stronger case — Judgment is the exclusive domain of the Judge panel.
  - Commentary MUST be age-appropriate, warm, absurdist, and grounded in the actual positions the participants hold.
  - Annotations are visible to: all ward members of the org; all linked Guardians; external authenticated viewers (with ward identity anonymized per FR-230).
  - KidsGalleryBot carries `[KidsGalleryBot]` badge. Annotations are NOT Records and NOT Ledger entries.
  - KidsGalleryBot commentary is a primary input to the Guardian Analytics panel (FR-228): engagement by topic, cohort Worldview evolution, sentiment trends.

- **FR-230** (**Youth Zone anonymization for external viewers**): Any authenticated Person who is not a linked Guardian of a specific ward MUST receive the following protections when viewing any Youth Zone Duel or Record:
  - Ward handles → deterministic per-session pseudonyms (e.g. `@child_A`). Pseudonyms are consistent within a single session but re-randomized per viewer per session. The same ward is always `@child_A` within one session, but may be `@child_C` in another viewer's session.
  - Guardian handles → `@guardian_of_A` (matching the ward's pseudonym for that session).
  - Avatars → platform-default silhouettes. No uploaded avatar is shown.
  - Assigned Judges → `[Judge]` with role badge only. Handle not shown.
  - Claim and Evidence content → visible unchanged. Substance is not hidden; only identity is.
  - `[KidsGalleryBot]` Annotations → shown without anonymization. KidsGalleryBot is not a Person.
  - `@herald` → NOT anonymized. Platform bot.
  - Unauthenticated users → MUST NOT have any access to Youth Zone Duel content, even anonymized. A login gate is enforced at every Youth Zone URL before any content is rendered.

- **FR-231** (**Youth Zone analytics and external visibility**): KidsGalleryBot Annotations and Youth Zone Duels (anonymized) are visible to authenticated adult users as a **Youth Debates** section in the public feed. The section is filterable by topic and org (anonymized). External visibility of this section serves two purposes: (a) it allows teachers, researchers, and parents outside the immediate Guardian group to observe the quality of discourse in youth contexts; (b) it is a platform-level analytics signal — Youth Zone Duel data (fully anonymized, no ward identity) feeds the Verdict Data API under a separate `youth_cohort` data tier accessible to verified educational researchers at Institutional tier only. Guardian Analytics (FR-228) is the richer, non-anonymized view available to linked Guardians within the org.

---

### CI / CD Pipeline

- **FR-232** (**CI pipeline — toolchain**): Every pull request to `main` MUST trigger the full CI pipeline via **GitHub Actions**. The pipeline MUST include, in order: (1) lint and format check, (2) unit test suite with coverage gate, (3) integration test suite, (4) security scan, (5) build smoke test, (6) staging deploy and smoke test. All steps MUST pass before merge is permitted. The pipeline definition lives in `.github/workflows/ci.yml`.

- **FR-233** (**Lint and format**): ESLint (`eslint.config.js`) and Prettier (`.prettierrc`) MUST be enforced in CI. ESLint config: `eslint:recommended` + `node` + `browser` environments; no `console.log` in `src/server/` (use the logger); no `eval`; max cyclomatic complexity 12 per function. Prettier: 2-space indent, single quotes, no semicolons. CI runs `npm run lint` and `npm run format:check`; either failure fails the build. Auto-fix is NOT applied in CI — the developer fixes locally.

- **FR-234** (**Unit test suite**): Unit tests live in `tests/unit/`. Test runner: **Vitest**. Coverage tool: **c8**. `npm run test:unit` MUST pass with: statement coverage ≥ 85% project-wide, branch coverage ≥ 80% project-wide, function coverage ≥ 80% project-wide. Coverage report is uploaded as a CI artifact. Coverage thresholds are enforced via `c8 --check-coverage`; failure = red build. Coverage HTML report is published to the PR as a status check comment.

- **FR-235** (**Integration test suite**): Integration tests live in `tests/integration/`. These tests run against a real in-process SQLite database (`:memory:` for speed) with all migrations applied. `npm run test:integration` MUST exercise: all API route happy paths, all auth gates (401/403 on missing/wrong JWT), all state machine transitions (Duel turn sequence), and all cron/deadline logic. Vitest is used throughout for consistency.

- **FR-236** (**Security scan**): CI MUST run `npm audit --audit-level=high` — any HIGH or CRITICAL vulnerability in production dependencies fails the build. Additionally, **GitHub's Dependabot** MUST be enabled on the repository for automated dependency patching. An optional second scan via `npx better-npm-audit` may add signal but does not gate the build independently.

- **FR-237** (**Build smoke test**): CI MUST verify that `node src/server/index.js` starts without error (exit code 0 after 3 seconds with `SIGTERM`), all migrations run to completion against a fresh `:memory:` DB, and `GET /health` returns `{"status":"ok"}` from the in-process server. This step catches import errors and migration regressions that unit tests may miss.

- **FR-238** (**Staging deploy and smoke test**): On merge to `main`, GitHub Actions MUST: (1) build the Docker image, (2) deploy to the Fly.io staging environment (`judgmental-io-staging`), (3) wait for health check pass, (4) run `tests/smoke/` suite against staging URL (5 critical path checks: `/health`, auth flow, Claim creation, Duel creation, Judgment creation). Failure of any smoke test triggers an automatic rollback to the previous Fly.io release and opens a GitHub Issue tagged `ci-regression`.

- **FR-239** (**Secrets in CI**): All CI secrets are stored as **GitHub Actions Repository Secrets** (never in `.env` files committed to the repo). Required secrets: `FLY_API_TOKEN`, `JWT_SECRET_CI`, `DB_PATH_CI` (`:memory:` override), `TIGRIS_*` credentials (for staging), `STRIPE_SECRET_KEY_CI` (test mode). Secrets are injected as env vars in the workflow and never echoed in CI logs.

- **FR-240** (**PR status checks**): The following checks MUST be required in the GitHub branch protection rules for `main`: `ci / lint`, `ci / unit-tests`, `ci / integration-tests`, `ci / security-scan`, `ci / smoke-test`. A PR that fails any check cannot be merged without admin override. Admin overrides are logged in the audit trail (FR-244/OpenSpec).

- **FR-241** (**Release versioning**): On every merge to `main`, CI MUST: (1) read `package.json` version, (2) create a GitHub Release with tag `v<version>`, (3) attach the Docker image digest as a release asset, and (4) bump the PATCH version in `package.json` automatically via `npm version patch` + auto-commit to `main`. MINOR and MAJOR bumps are manual. The `GET /version` endpoint always reflects the deployed `package.json` version.

---

### Judgy Blog

- **FR-242** (**Judgy Blog — overview**): The **Judgy Blog** is a platform-hosted editorial space at `/blog`. It is written by platform contributors and authors appointed by the platform admin. All content in the Judgy Blog is **off-record**: nothing published there creates Belief Ledger entries, no post is a Record, no post is admissible as Evidence in any Duel, and no bot commentary appears on blog content. The Judgy Blog is a **no-bot zone** — no GalleryBot, no AdvisorBot, no KidsGalleryBot posts, annotations, or summaries on any blog content. Comments are disabled. Readers who want to respond to an idea from the blog are invited to file a Claim on the platform.

- **FR-243** (**Blog authorship**): Blog authors hold a platform-level role `blog_author`, granted by the `super_admin` role (see FR-248). Any authenticated Person MAY be granted `blog_author`. The platform owner is a `blog_author` by default. `blog_author` is not an org role — it is scoped to the platform. A Person can hold `blog_author` regardless of org membership. A Person whose account is suspended loses `blog_author` access for the suspension duration.

- **FR-244** (**Blog posts**): A blog post has: `id`, `slug` (unique, URL-safe, used at `/blog/:slug`), `title`, `body` (markdown), `author_id` (Person FK), `published_at` (nullable — `null` = draft), `updated_at`, `cover_image_url` (optional), `tags` (array of strings), `is_featured` (boolean). Posts are authored in markdown via a markdown editor in the admin console (`/admin/blog/new`, `/admin/blog/:id/edit`). Published posts are rendered as static HTML from markdown at page load — no CMS API call on the read path. Drafts are visible only to `blog_author` and `super_admin`.

- **FR-245** (**Blog public surface**): `/blog` renders a paginated list of published posts, sorted by `published_at` descending. Each post card shows: title, author handle and avatar, `published_at`, tags, and a 200-character excerpt. `/blog/:slug` renders the full post. Both pages are publicly readable without authentication. Metadata (Open Graph + Twitter Card tags) MUST be set on each post page for share previews. The Judgy Blog feed is eligible for public Plausible analytics only — no GA4 on the blog (GA4 is for unauthenticated ad targeting only).

---

### Duels as Double-Depositions

- **FR-246** (**Canonical framing — Duel as double-deposition**): The canonical framing of a Duel is: **two simultaneous depositions submitted to witnesses for judgment**. Each party is simultaneously the deposing party (interrogator, challenging the other's position) and the deponent (witness, answering under examination). The EXAMINING / TESTIFYING role badges encode this: the party whose turn it is to challenge is the interrogator in that lane; the party answering is the witness. Every turn is testimony. Every challenge is examination. The Judges are the witnesses to whom the depositions are submitted. This framing is the constitutional and conceptual definition of a Duel, and it supersedes any informal "debate" or "argument" framing in all UI copy, documentation, and training data.

---

### Open-Spec Software

- **FR-247** (**Open-Spec — Tier 1, public read**): The platform's specification documents (spec.md, data-model.md, plan.md, constitution) are exposed as readable pages at `/open-spec`. Each document is rendered from its markdown source at read time. The `/open-spec` index lists all documents with last-amended date and version. Every section heading has a permanent anchor link. Each section has a **"Suggest improvement"** link that opens a pre-filled GitHub Issue in the `judgmental.io` repository tagged `spec-suggestion`. Each section has a **"Report problem"** link that opens a pre-filled GitHub Issue tagged `spec-problem`. These links work without authentication on judgmental.io — the GitHub Issue UI handles auth. `/open-spec` is publicly readable without authentication.

- **FR-248** (**Open-Spec — Tier 2, admin spec editor**): The admin console at `/admin/spec` provides an authenticated markdown editor for all specification documents. Access requires the `super_admin` role. The `super_admin` role is a platform-level role, separate from all org roles. The platform owner is the initial `super_admin`. Additional `super_admin` accounts may be granted by the existing `super_admin`. The admin spec editor: (a) shows the current rendered spec alongside an editable markdown panel; (b) saves draft changes with version history; (c) queues changes for deployment; (d) connects to the **SpecKit agent** for AI-assisted spec updates (FR-249).

- **FR-249** (**SpecKit integration in admin console**): The admin spec editor MAY invoke the SpecKit agent to: generate new FRs from a natural language description, update existing FRs, generate tasks from spec changes, and validate consistency between spec sections. All SpecKit suggestions are **drafts** — the `super_admin` reviews and explicitly approves each change before it is committed. SpecKit-generated changes are marked with `[SpecKit-generated]` in the document diff. The `super_admin` may also run the full SpecKit workflow (specify → plan → tasks → implement) from the admin console, triggering CI via GitHub Actions on approval.

- **FR-250** (**Constitutional amendment by Duel**): Changes to the platform constitution that affect any enumerated Principle MUST be proposed as a **Constitutional Duel** — a public Duel filed by the `super_admin` in which the proposed amendment is the Claim and the existing constitutional text is the Counter-position. Constitutional Duels are always public, always open to any authenticated Person as an Amicus curiae analysis submitter, and require a Judge panel of ≥ 7 platform members with the `verified_judge` role (minimum 10 resolved Judgments) to reach verdict. The `super_admin` MUST accept the Constitutional Duel Verdict before the amendment is applied. A Judgment of CONTESTED blocks the amendment unless the `super_admin` files a Notice of Override — which is itself a public Record attributed to the `super_admin` and permanently admissible as Evidence. **The platform uses its own mechanics to govern itself.**

---

### Video Duels *(long-range feature)*

- **FR-260** (**Video Duel — overview**): A Duel MAY be conducted in **Video Duel** mode. In this mode, each party's mobile device guides them through the structured turn sequence (Challenge → Answer → Counter-challenge → Answer → ...) using the in-app video recording interface. Each turn is a separately recorded video segment. After all turns are complete, three edited videos are automatically produced and uploaded. The AI-generated transcript for each segment is entered into the Duel Record as a bot-authored Record. Video Duels are identified by `duel.mode = 'video'`. All other Duel mechanics (Miranda, Ledger, Judgment) apply identically to Video Duels.

- **FR-261** (**Video Duel — guided recording flow**): The in-app recording interface uses the device's native camera via `getUserMedia`. For each turn: (1) the app displays the current turn prompt (the other party's last statement, or the opening Challenge text); (2) when the party taps Record, a countdown (3 seconds) plays; (3) recording begins; (4) a visual turn timer runs (configurable per-Duel: 1, 2, 3, or 5 minutes); (5) party taps Stop or timer expires — segment is saved. Segments are uploaded immediately on stop (background upload with retry) using chunked multipart to `POST /api/video-segments`. Per-turn segments are stored individually; final stitching happens server-side after all turns are complete.

- **FR-262** (**Video Duel — three output videos**): After all turn segments are uploaded and stitching is triggered (by either party marking turns complete, or by deadline), the server produces three video outputs:
  1. **Confrontation video** (`video_type = 'confrontation'`): all segments in turn order, interleaved — the full both-parties record.
  2. **Party A witness video** (`video_type = 'witness_a'`): Party A's segments as witness (answers) interleaved with Party B's segments as interrogator (challenges), in challenge-answer sequence order. Party A reads as the deponent throughout; Party B reads as the examiner throughout.
  3. **Party B witness video** (`video_type = 'witness_b'`): mirror of the above, Party B as deponent, Party A as examiner.
  Each video is stitched server-side using FFmpeg. Stitched videos are uploaded to **Mux** for adaptive streaming. Mux asset IDs are stored in a `video_assets` table with `duel_id`, `video_type`, `mux_asset_id`, `mux_playback_id`, `duration_seconds`, `status` (enum: `processing`, `ready`, `error`). Videos are made available in the Duel View once `status = 'ready'`.

- **FR-263** (**Video Duel — playhead sync**): In the Duel View, the video player responds to the playhead position and highlights the corresponding turn in the turn-lane layout. Each turn segment has a `start_seconds` and `end_seconds` stored in `video_segments`. When the player playhead enters a segment's range, the matching turn card is scrolled into view and highlighted with a `.turn-card--active` class. When the playhead exits, the highlight clears. The player is embedded via Mux Player (`@mux/mux-player` web component). Player controls are standard: tap to play/pause, scrub by dragging the timeline, skip forward/back 10 seconds with double-tap left/right. No custom gesture overrides — platform uses native Mux Player gesture handling.

- **FR-264** (**Video Duel — AI transcript and TranscriptBot**): After segments are uploaded, the server submits each segment to an AI speech-to-text service (OpenAI Whisper API, model `whisper-1`) for transcription. The resulting text for each segment is entered into the Duel Record as a Turn authored by `@transcript-bot` (a named Bot in the Bot namespace) with `record_type = 'transcript'` and `parent_turn_id` linking to the corresponding video-mode Turn. `@transcript-bot` carries the `[transcript]` badge. Transcript Records are Belief Ledger entries attributed to the actual party (not to `@transcript-bot`); `@transcript-bot` is the filing agent, not the accountable author. TranscriptBot Records are fully Miranda'd — the transcript is on the record for the person being transcribed, attributable and admissible.

- **FR-265** (**Video Duel — transcript correction**): Any **authenticated** user may file a **Transcript Correction Claim** against any `@transcript-bot` Record. A Transcript Correction Claim has: `corrected_text` (the proposed better transcript), `timestamp_start` and `timestamp_end` (the segment range being corrected), and a required `rationale` (why this correction is more accurate). Transcript Correction Claims are standard Duel-eligible Claims — any authenticated user may challenge a Correction. A Correction that survives challenge and accumulates ≥ 5 endorsements from authenticated users with no outstanding challenges is marked `canonical: true`. When `canonical: true`, the Correction is shown by default in place of the original transcript in the Duel View; the original is accessible via "Show original transcript." The original `@transcript-bot` Record is never altered or deleted — the Correction is a separate Record linked to it.

- **FR-266** (**Video storage and cost model**): Video segments are stored temporarily in **Tigris S3** (already in stack) for the stitching step, then deleted after Mux ingestion confirms `asset.status = 'ready'`. The Mux Asset stores the three stitched videos at Mux's standard CDN pricing. Raw segments are not retained after stitching. Storage cost per Video Duel: estimated $0.015–$0.05 per minute of video at Mux standard pricing. Video Duels require a Video tier subscription add-on ($4.99/month per Person or included in any paid subscription tier above free). This gates the video storage cost behind a revenue event.

---

### PublicRecord Herald — Famous Person Auto-Seeding

- **FR-270** (**PublicRecordBot — overview**): `PublicRecordBot` is a system bot that monitors designated public sources (social media, official statements, published interviews) for statements by persons on the **Herald Seed List** and creates `@herald`-attributed Records for immediate disputation. Every such Record is an invitation to challenge, defend, or agree — and when the real person claims their handle, they walk into an established history of Duels, Judgments, and Challenges filed against their public statements.

- **FR-271** (**@herald sub-namespace for unverified famous persons**): Unverified famous Person handles use a distinct `@herald:` prefix in the system: `@herald:realdonaldtrump`, `@herald:elonmusk`, etc. In the UI these are displayed as `@realdonaldtrump [unverified]` with an `[unverified — not authored by this person]` badge on every Record. The `[unverified]` badge is non-dismissible. The underlying identifier retains the `@herald:` prefix until the real person claims the handle. On claim, the prefix is stripped, the Person record is created, and all historical Records are re-attributed. The `[unverified]` badge is replaced by the SM OAuth–verified badge. The now-authenticated famous Person CANNOT silently delete pre-claim Records: they may Rescind specific Records (Rescission is public and permanent), but the originals are never deleted.

- **FR-272** (**Herald Seed List**): The Herald Seed List is a structured dataset maintained by the `super_admin` in the admin console. The seed list is organized by tier:
  - **Tier 1 — Heads of state and major political leaders**: sitting and recent heads of state, major heads of government, and former U.S. Presidents. Examples: `@realdonaldtrump` (TruthSocial), `@potus`, `@joebiden`, `@kamalaharris`, `@mikepence`, `@barackobama`, `@hillaryclinton`, `@mittromney`, `@narendramodi`, `@BorisJohnson`, `@EmmanuelMacron`, `@Rishi_Sunak`, `@OlafScholz`, `@ZelenskyyUa`, `@netanyahu`.
  - **Tier 2 — Major media and platform owners**: `@elonmusk`, `@markzuckerberg`, `@JeffBezos`, `@sundarpichai`, `@satyanadella`, `@RupertMurdoch`, `@BillGates`.
  - **Tier 3 — Major broadcast/cable journalists and anchors**: `@TuckerCarlson`, `@andersoncooper`, `@maddow`, `@BretBaier`, `@megynkelly`, `@SeanHannity`, `@lauralingraham`, `@donlemon`, `@ChrisCuomo`, `@GlennBeck`.
  - **Tier 4 — Political commentators and high-audience podcasters**: `@joerogan`, `@benshapiro`, `@DennisPrager`, `@prageru`, `@samharrisorg`, `@DailyWire`, `@thedailywire`, `@TheBlaze`, `@BlazeTV`, `@CharlieCkirk`.
  - **Tier 5 — Entertainers and influencers with politically or socially significant public statements**: `@KanyeWest`, `@taylorswift13`, `@therock`, `@Oprah`, `@selenagomez`, `@Pontifex` (Pope Francis), `@Dalai_Lama`, `@rickwarren`, `@alankay1940`.
  The seed list is extensible by `super_admin` at any time. All seed-list handles are sourced from publicly accessible profiles on their stated platforms. The platform does NOT speculate about private statements.

- **FR-273** (**PublicRecordBot ingestion rules**): PublicRecordBot follows these rules strictly:
  - Only public statements are ingested: posts from public profiles, published interviews, official statements, published books and articles (excerpt + citation URL only — no full-text reproduction).
  - Statement text is **paraphrased + attributed** for copyright compliance, not reproduced verbatim beyond 280 characters. For longer statements, a 280-character excerpt + citation URL is stored; the full text is linked, not reproduced.
  - Each ingested Record has `source_url` (required), `source_platform` (string, e.g. `"X/Twitter"`), `ingested_at` timestamp, and `original_text_hash` (SHA-256 of original text for deduplication).
  - Deduplication: a statement that has already been ingested (matching `source_url` or `original_text_hash`) is skipped.
  - PublicRecordBot does NOT ingest: private messages, leaked communications, statements made in clearly private contexts, or statements attributed to the person by a third party without direct quotation.
  - PublicRecordBot ingestion is **initially a curated historical import** of notable past statements, not a live crawler. Live following of public feeds is a roadmap feature (post-v1) requiring platform-level rate-limit compliance with each source platform's API terms.

- **FR-274** (**Famous Person claim flow**): When a person on the Herald Seed List authenticates via SM OAuth using the matching handle: (1) the system detects the handle match; (2) presents a **Claim Your Herald** screen showing all existing `@herald:` Records attributed to that handle, with full Duel history, Judgments, and Challenges; (3) the person must explicitly accept or decline attribution for each Record as a batch action (accept all / decline all / per-record); (4) declined Records are publicly Rescinded (original preserved; `[Rescinded by claimant on claim]` badge added); (5) accepted Records are re-attributed to the now-verified Person handle; (6) all unverified badges replaced with verified badge; (7) the person receives a notification of all open Duels in which their herald Records are a party.

---

 (Claims, Cases, Duels, Dispositions, Persons, Analytics views) MUST be accessible to authenticated API-key holders with no rate-limit tier above Researcher.
- **FR-115**: Write endpoints (create Claim, open Case, submit Analysis) MUST require an active org-tier subscription or a dedicated API key issued by an admin.
- **FR-116**: API keys MUST be scoped (read-only, read-write) and revocable from the user settings page. Keys MUST be stored as bcrypt hashes server-side; the plaintext is shown only once at creation.
- **FR-117**: All API routes MUST return `429 Too Many Requests` with `Retry-After` header when rate limits are exceeded. Rate limits: Researcher = 60 req/min; Professional/Institutional = 600 req/min; Org API key = 1,200 req/min.

**Historical Re-trials**

- **FR-118**: A Duel MAY be created with `context=historical` and a `historical_subject` string (e.g. `"Galileo v The Church, 1633"`).
- **FR-119**: The root Claim for a Historical Re-trial MUST be a system-authored Record (authored by `@system`) citing the `historical_subject`. No living Person's Base of Truth is affected by the outcome.
- **FR-120**: Historical Re-trial parties defend assigned historical positions. Their Judgment verdict does NOT produce a ClaimAccord against either party's personal Base of Truth.
- **FR-121**: Historical Re-trials are ALWAYS public. They appear in a dedicated **Historic Re-trials** analytics view and feed section.
- **FR-122**: A `historical_subject` search MAY surface existing Re-trials on the same subject, displaying precedent verdicts before a new one is filed.

**Apology Court (Restorative Resolution)**

- **FR-123**: A Duel MAY be filed with `context=apology`. The filing party is the `petitioner`; the respondent is the `recipient`.
- **FR-124**: The petitioner MUST submit: (a) an acknowledgement of the wrong (`claim_text`), (b) supporting Evidence, and (c) a proposed remedy (`remedy_text`). All three fields are required before the Duel begins.
- **FR-125**: The recipient may: (a) **Accept** — producing a `reconciliation` Disposition and marking the Duel resolved; (b) **Reject** — producing a `rejection` Disposition; or (c) **Contest** — opening a standard turn sequence disputing the characterization of the wrong or the adequacy of the remedy.
- **FR-126**: Apology Court Duels use restorative UI language throughout. Labels: "Acknowledgement" (Claim), "Proposed Remedy" (Offer), "Restored" (Accord), "Unresolved" (Default). No religious terminology is used. The system is belief-agnostic.
- **FR-127**: The philosophical design principle — that genuine acknowledgement of wrongdoing, a sincere remedy, and acceptance by the wronged party constitute the preconditions of restoration — is documented in the codebase as a comment in the apology-context controller. It is never rendered to the user.
- **FR-128**: Apology Court dispositions (`reconciliation`, `rejection`) MUST be visually distinct in the feed. A `reconciliation` disposition MUST show a visual "resolved" state. A `rejection` remains as an open public record.

**Verdict Data API**

- **FR-129**: An anonymized, aggregated dataset of Claims (text only, no author), Disposition outcomes, and Judgment consistency scores MUST be exposed as a subscription data API at `GET /api/data/*`.
- **FR-130**: Verdict Data API access tiers and rate limits:
  - **Researcher** — free, 100 req/day, read-only, anonymized only
  - **Professional** — $99/month, 2,000 req/day, full anonymized dataset including claim structure
  - **Institutional** — $499/month, unlimited, bulk export (JSONL), priority support
- **FR-131**: All data returned by the Verdict Data API MUST be fully anonymized. No Person handles, display names, or platform identifiers may be included. Claim structure (Claim text, challenge text, evidence summaries) is included but stripped of any PII.
- **FR-132**: Persons MAY opt out of Verdict Data API inclusion via a toggle in User Settings. Opt-out is respected within 24 hours (next analytics rollup cycle). Default is **opted in**.
- **FR-076**: An "Sign in to remove ads" label MUST appear above the ad strip for unauthenticated users.
- **FR-077**: Google Ads MUST be the ad provider. Ad content MUST NOT appear in any authenticated view.

**Analytics**

- **FR-078**: **Plausible Analytics** MUST be integrated as the primary analytics provider — a single `<script>` tag, no cookies, no PII, no GDPR consent banner required.
- **FR-079**: **Google Analytics 4** MUST be integrated as a secondary provider with IP anonymisation enabled. GA4 is required for Google Ads conversion tracking.
- **FR-080**: Both analytics scripts MUST be loaded only after the page's critical content has rendered (defer or async loading).
- **FR-081**: The following **auto-analytics views** MUST be implemented as queryable public pages (computed at query time from the database):
  1. **Contested Ground Map** — Claims with the most open and active Cases.
  2. **Consensus Clusters** — Sets of Claims linked by SimilarityLinks in STANDING state.
  3. **Undefeated Claims Leaderboard** — Claims ranked by `strength = ClaimAccords × survived Duels`.
  4. **Serial Challengers** — Persons who have opened the most Cases, with a win/draw/default breakdown.
  5. **Judgment Consistency Score** — For each judge: % of verdicts that aligned with the eventual Accord outcome.
  6. **Precedent Chains** — Graph of SimilarityLinks that have shaped or resolved related Duels.
  7. **Graveyard / Dead Ends** — Cases that reached Default without contestation; Claims with no agreers.
  8. **Velocity** — Claims whose ClaimAccord count grew most in the last 7 days.
  9. **Flip Rate** — Persons who most frequently reversed their ClaimAccord positions; a measure of intellectual honesty.
  10. **"You disagree with N%"** — Shown inline on each Home View Claim card, computed against the current user's ClaimAccord set.

**Logo and Visual State**

- **FR-082**: The scales/logo icon MUST visually encode the current Duel state when rendered in the Case View header:
  - Beam angle: left pan lower = challenger ahead; right pan lower = defender holding; level = balanced or undecided.
  - Flame color: challenger lane = cool blue-white; defender lane = warm amber.
  - Disposed state: both sides cold/grey.
  - Accord/STANDING state: both sides white/gold.
- **FR-083**: The Home View logo (header, top-left) MUST be the static scales icon (no state encoding in the Home context).

**Tooltips and Minimal UI**

- **FR-084**: Every interactive control MUST have a tooltip — hover on desktop, long-press on mobile.
- **FR-085**: When a control is disabled, the tooltip MUST explain *why* it is disabled (e.g. "You already challenged this Claim", "It's not your turn").
- **FR-086**: Home View Claim cards MUST show at most 3 interactive controls. Additional actions MUST live behind a "…" overflow menu.
- **FR-087**: Record type icons MUST be used without text labels in card view. Labels appear only in the Composer and in tooltips.
- **FR-088**: The Composer is the only full-UI modal; all other interactions MUST use inline or slide-up transitions.
- **FR-089**: All tappable targets MUST be at minimum 44 × 44 px (WCAG 2.5.5).

### Key Entities

- **Person**: An authenticated user (SM OAuth). Unique `@name`, unique id. Special placeholder: @herald.
- **Record** (abstract, impl only): Base for all stored entities. Unique integer id, author, type, parentId, text, imageUrl, is_ai, ai_model, createdAt.
  - **Claim**: Root statement. Text OR image. Can have ClaimAccords. Determines Case hierarchy.
  - **Challenge**: Contests any Record. Type: Interrogatory | Objection. Opens a Case + Duel.
  - **Answer**: Responds to a Challenge. Yes/No for Interrogatory; free-text for Objection.
  - **Offer**: Proposes resolution in a Duel. Non-blocking. Accepted → Accord.
  - **Response**: Accepts or rejects an Offer.
- **Case**: First-class. Opened when any Record is challenged. Contains one or more Duels.
- **Duel**: First-class 1v1. Lives within a Case. Has turn state (independent per Duel). Reaches a Disposition.
- **Disposition**: Terminal state of a Duel. Type: accord | default | withdrawal. Immutable, challengeable.
- **Accord**: Record of a Duel resolved by accepted Offer.
- **ClaimAccord**: A Person's agreement with a Claim. Grants eligibility to defend it. Foundation of Base of Truth.
- **DeadlineConditions**: Mutually agreed countdown per turn. Expiry triggers Default Disposition (server-side, node-cron).
- **Moment**: Timed annotation on a Record within a Duel context.
- **Analysis**: Post-Disposition review of a Duel, referencing Moments. Required before Judgment.
- **Judgment**: A Person's verdict on a Duel, grounded in their Base of Truth (STANDING anchor Claim).
- **BaseOfTruth**: A Person's declared anchor Claim and the set of Claims they hold ClaimAccords on.
- **SimilarityLink**: Asserts two Records are equivalent. Challengeable. In STANDING state enables Precedent surfacing.
- **Evidence**: A structured attachment on any Record (url, quote, image, file, or **cross_record** — a citation of another Record on the platform). **Miranda Principle**: every Record ever posted is permanently admissible against its author as Evidence in any Duel.
- **Exhibit**: A formally submitted Evidence item in a Duel. Auto-labeled (Exhibit A, B …). Objectable.
- **Rescission**: A public declaration by a Record's author that they no longer hold that position. Append-only. Original Record preserved. Author released from defender obligation going forward. Challengeable.
- **Tip**: A voluntary peer-to-peer payment. Optionally linked to a Record. Platform fee 0%.
- **MarriageRecord**: A first-class entity linking two Persons through a lifecycle of states — `engaged` → `married` → `separated` | `dissolved`. Linked to a proposal Duel, an optional sealed Covenant, and any intra-marriage Duels. Always private unless both parties consent to public visibility.
- **Covenant**: A co-authored, mutually signed Record containing structured mutual commitments. Each commitment line is stored as a `context=covenant` Claim jointly authored by both partners. Sealed Covenants are immutable. Linked to a MarriageRecord.

---

**GitHub PoC — Rate Limit Handling (disputable.io current client)**

The current disputable.io SPA communicates directly with the GitHub Issues API (no backend proxy). Anonymous requests share GitHub's 60 req/hr unauthenticated quota; authenticated requests receive 5,000 req/hr. The following requirements govern client-side behaviour when that quota is exhausted.

- **FR-275** (**Rate-limit detection — reads**): When any `GET` call to the GitHub API returns HTTP 403 or 429, the client MUST inspect the response body for `"API rate limit exceeded"` or a `X-RateLimit-Remaining: 0` header. On detection the client MUST: (1) surface a non-blocking banner — "GitHub rate limit reached. Reads may be stale. Sign in for a higher limit." with a "Sign In" CTA if the user is unauthenticated; (2) serve subsequent `GET` requests from the ETag cache where available, and render a `[cached]` indicator on stale content; (3) suppress further API calls until either the user signs in or `X-RateLimit-Reset` has elapsed.

- **FR-276** (**Rate-limit detection — writes**): When any `POST` or `PATCH` call to the GitHub API returns HTTP 403 or 429 due to rate limiting, the client MUST not silently swallow the error. The composer or action button that triggered the write MUST display an inline error: "Couldn't save — GitHub rate limit reached. Try again after [time] or sign in for a higher limit." The composer MUST retain the user's draft text and not clear the input. A "Retry" button MUST be shown; pressing it re-attempts the request once after a 3-second delay.

- **FR-277** (**Mock mode bypass**): When mock mode is active (`isMockMode() === true`), rate-limit detection MUST be fully bypassed. All reads and writes operate on the in-memory + localStorage store and are never rate-limited. This ensures development and demo workflows are unaffected.

- **FR-278** (**Sign-in upsell on rate limit**): The rate-limit banner (FR-275) MUST include a brief explanation: "Signed-in users get 5,000 GitHub API requests per hour vs 60 for anonymous visitors." The "Sign In" CTA navigates to the GitHub Device Auth flow. On successful authentication the banner MUST dismiss automatically and the pending read request MUST be retried with the new token.

**Independent Test**: Load the app without a token; exhaust the rate limit; verify the banner appears and content still renders from cache. Attempt to submit a Challenge; verify the draft is preserved and the inline error is shown. Activate mock mode; verify no rate-limit UI appears at all.

---

**Constitutional Governance, Crowdfunding, and Federation**

> All requirements in this section are **constitutional** — they may only be changed through a Constitutional Duel (Principle XII). The SDLC documents (spec, plan, tasks) are governed by and subordinate to [constitution.md](constitution.md). Where any FR in this spec conflicts with a constitutional Principle, the constitution supersedes.

- **FR-279** (**Worldview Reconciliation Process as governance engine**): The platform MUST govern all non-SDLC operational decisions — including fee rates, reward rates, feature prioritization, constitutional amendments, moderation policy, and platform financial projections — through the **Worldview Reconciliation Process (WRP)**. WRP is the platform's operating equivalent of Robert's Rules of Order, replacing procedural formalism with structured truth-seeking: every motion is a Claim, every amendment a Counter-challenge, every vote a weighted Judgment. No platform-level policy decision that affects Stakeholders may be enacted by `super_admin` unilaterally without first being either (a) unopposed as a Claim for 30 days, or (b) resolved via a Constitutional Duel. This applies to the `super_admin` equally. The `super_admin` role is a bootstrapping necessity, not a permanent authority above the constitution.

- **FR-280** (**Quorum requirement for binding Judgment**): No Judgment rendered on any Duel is constitutionally binding unless a **quorum** of qualified Judges has participated. Quorum rules: (1) Standard Duels: minimum 3 Judgments required; (2) Organizational Duels: minimum 5 Judgments, at least 3 from non-parties; (3) Constitutional Duels: minimum 7 Judgments from `verified_judge`-role Persons who have each completed ≥ 10 prior Judgments. A Judgment count below quorum produces a `PENDING_QUORUM` disposition rather than a verdict — the Duel remains open for further Judgment. Quorum thresholds are themselves constitutional and may only be changed by Constitutional Duel. Keyholder Governance Weight (see FR-284) is additive to track-record weight in Constitutional Duels only.

- **FR-281** (**Pinned Claims**): The `super_admin` MAY pin up to 3 Claims to the top of the public feed at any time. A pinned Claim: (a) is rendered above all other feed content for unauthenticated and authenticated users alike; (b) carries a `[PINNED]` badge; (c) shows the live total of P2P contributions received via its giving widget (FR-282); (d) is non-dismissible for guest users; (e) may be challenged and judged like any other Claim. Pinning is a `super_admin` action that must itself be filed as a Claim and left open for 7 days before taking effect, giving any Person the opportunity to Challenge before the pin activates. The first pinned Claim MUST be the bootstrapping Claim (FR-283).

- **FR-282** (**P2P giving widget on Claims**): Any Claim MAY display a **P2P giving widget** that allows any visitor — authenticated or not — to make a direct financial contribution to the Claim author. The widget is rendered below the Claim text and above any responses. It shows: (1) a live running total of all contributions received on this Claim; (2) a count of unique contributors; (3) a "Give" button that opens a Stripe Payment Link in a new tab (no account required for the guest to contribute); (4) a public list of the most recent contributors (handle or "Anonymous") with amount. All contributions are made directly to the Claim author's Stripe Connected Account — the platform takes 0% platform fee. Stripe's standard interchange applies (≈2.9% + $0.30). The giving widget is enabled per-Claim by the author via the Claim composer. The live total and contributor list are first-class public records on the Claim — permanently visible, permanently on the Belief Ledger. `super_admin` may enable the giving widget on any Claim when acting in the bootstrapping-campaign capacity (FR-283).

- **FR-283** (**Bootstrapping Claim and constitutional crowdfunding**): The MVP MUST include a live, real, on-platform Claim filed by the `super_admin` / platform founder with the text: *"judgmental.io is viable, worth funding, and can reach constitutional self-governance within 18 months of launch."* This Claim: (a) is pinned as the first Pinned Claim per FR-281; (b) has the P2P giving widget (FR-282) enabled, serving as the platform's primary crowdfunding mechanism; (c) is filed with all documents in `specs/001-better-dispute-app/` attached as Evidence — the Stakeholder Briefing, viral growth model, data model, and plan are the evidentiary record; (d) is open to Challenge by any authenticated Person from the moment of launch; (e) is publicly readable without authentication so guests can read the evidence and contribute before signing in. The running total raised through this Claim is shown on the Claim card. This is not a widget embedded in a mockup — it is the live product's first real Duel. The crowdfunding campaign's existence as an active on-platform Claim is itself primary evidence that the platform's governance model works.

- **FR-284** (**Keyholder program — federation and constitutional stake**): A **Keyholder** is any authenticated Person or registered organization that hosts a judgmental.io node and has registered it through the Keyholder Registry. Keyholders are a constitutional class of Stakeholder. The platform MUST provide: (1) a Keyholder Registry (`GET /keyholders`, accessible to all authenticated users) listing all registered nodes with tier, uptime, and reward history; (2) a Keyholder registration flow (`POST /api/keyholders`) allowing any authenticated Person to register a node by providing its URL, node type, and API key; (3) a reward calculation endpoint (`GET /api/keyholders/:id/rewards`) returning earned rewards based on verifiable compute contribution; (4) a Keyholder Settings page at `/settings/keyholder`. Keyholder tiers are filed as a Claim by `super_admin` and governed by constitutional Duel. **Initial tiers (subject to Constitutional Duel)**: *Seedling* (read replica — per-query credit toward platform fees); *Steward* (write relay — per-write credit + monthly reward share); *Keeper* (full peer — per-record confirmation reward + Governance Weight in Constitutional Duels). No crypto or blockchain is used in reward distribution — all rewards are denominated in USD equivalent and distributed via Stripe or platform fee credit. Crypto distribution is prohibited until approved by Constitutional Duel (FR-285).

- **FR-285** (**No cryptocurrency or blockchain until constitutional approval**): No feature, reward mechanism, payment flow, or data structure on the platform MAY use cryptocurrency, blockchain, distributed ledger technology, or token-based economics of any kind until a Constitutional Duel specifically proposing the use case has been filed, reached quorum, and produced an Accord. This prohibition is absolute and has no exceptions. It applies to: Keyholder rewards, P2P giving, tipping, subscription payments, data marketplace transactions, and any future feature. The constitutional requirement for crypto adoption is: (a) a specific, documented use case filed as a Claim; (b) a Constitutional Duel with ≥ 7 Judge panel; (c) an Accord (not a split verdict). A CONTESTED verdict is inadequate — the bar is Accord. This FR is constitutional and may only be changed by Constitutional Duel.

- **FR-286** (**Financial projections as public constitutional record**): All financial projections, revenue model assumptions, crowdfunding targets, and cost structures published in [stakeholder-briefing.md](stakeholder-briefing.md) are first-class constitutional evidence. They MUST be: (a) published at `/open-spec/stakeholder-briefing` alongside all other spec documents; (b) challengeable by any authenticated Person via the standard Claim/Challenge mechanic; (c) updated only via a Claim filed by `super_admin` and left open for 7 days before the document update is committed — the filed Claim is the amendment record. Revised projections supersede prior ones via Accord, not editorial discretion. The running history of projection revisions and their associated Duels is permanently on the Belief Ledger. There is no private version of this document.

- **FR-287** (**Constitution as Belief Ledger foundation**): The [constitution.md](constitution.md) is the primitive record from which all Belief Ledger structure is derived. In the MVP, the constitution exists as a file. The constitutional vision is that it grows into the first and foundational set of Records in the Belief Ledger itself — each Principle is a Claim, each amendment is a Duel outcome, and the Ledger's own history is the constitution's provenance chain. This migration (file → Ledger) is the first Constitutional Duel after launch: *"The constitution should be migrated to the Belief Ledger as its founding Records."* The MVP MUST be built in a way that makes this migration structurally possible without data loss — meaning the DB schema for constitutional Records (Principle type, amendment history, quorum metadata) MUST be included in the initial migration even if that table is empty at launch.

**Independent Test (FR-279–FR-287)**: File the bootstrapping Claim as `super_admin`; verify it is pinnable and the giving widget is live and shows real total. Challenge the bootstrapping Claim as a different user; verify standard Duel flow proceeds. Verify quorum gate on Judgment: with 2 Judgments on any Duel, `GET /api/duels/:id` returns `disposition: "PENDING_QUORUM"`. Verify `/keyholders` registry endpoint returns registered nodes. Verify no crypto-related code paths exist in the codebase (`grep -r "blockchain\|ethereum\|solana\|token\|wallet" src/` returns zero results).

---

## Analytics Views *(mandatory)*

The following views are computed from the live database at query time, not stored as materialised scores:

| View | Description |
|------|-------------|
| Contested Ground Map | Claims with the most open/active Cases |
| Consensus Clusters | Claims grouped by STANDING SimilarityLinks |
| Undefeated Claims | Ranked by `ClaimAccords × survived Duels` |
| Serial Challengers | Most Cases opened, with win/draw/default breakdown |
| Judgment Consistency | Per-judge % of verdicts aligned with eventual Accord |
| Precedent Chains | SimilarityLink graph influencing related Duel outcomes |
| Graveyard | Defaulted Cases, Claims with zero agreers |
| Velocity | Fastest-growing ClaimAccords in last 7 days |
| Flip Rate | Persons who reversed ClaimAccord positions most frequently |
| Disagreement Hook | "You disagree with N%" shown per Claim card on Home View |
| Historic Re-trials | Completed Historical Re-trial Duels, searchable by `historical_subject` |
| Apology Court | Resolved and unresolved Apology Court Duels, filterable by `reconciliation` / `rejection` |

---

### Measurable Outcomes

- **SC-001**: A first-time user can read the Home feed, authenticate via SM OAuth, compose a Claim, and see it appear in the feed — all within 3 minutes.
- **SC-002**: Any Record, Case, or Duel can be opened via its canonical URL in a freshly opened browser tab without additional navigation steps.
- **SC-003**: All permission controls (Challenge, Answer, Offer, Agree, Judge) accurately reflect the current user's eligibility — zero cases of an unauthorized action being permitted client-side.
- **SC-004**: The full challenge-answer-counter-challenge cycle for one Duel round-trips (submit → server → re-render) in under 4 seconds on a standard broadband connection.
- **SC-005**: The Home feed loads and renders the first screen of Claim cards in under 2 seconds on a standard broadband connection.
- **SC-006**: A deadline expiry triggers a visible and audible Default event within 60 seconds of the deadline passing (server-side node-cron, 1-minute tick); client displays event on next load/poll.
- **SC-007**: 100% of Record/Case/Duel state changes are persisted to the SQLite database; no client-only state mutations go unrecorded.
- **SC-008**: Every AI-authored or AI-assisted Record displays the correct disclosure badge in all views.
- **SC-009**: Unauthenticated users see the ad strip; authenticated users never see ads in any view.
- **SC-010**: All 10 auto-analytics views load and render in under 3 seconds.
- **SC-011**: Admin interface loads and renders the user list (first page), cron panel, and system health widgets in under 2 seconds.
- **SC-012**: All 7 cron jobs run to completion without error on a fresh database with seed data; each produces the correct output rows in its target table.
- **SC-013**: A Compatibility Duel cannot begin until both named Persons have accepted the consent prompt; the filing party sees a "Awaiting acceptance" state.
- **SC-014**: A Historical Re-trial's root Claim is authored by `@system`; neither party's ClaimAccord count changes after a verdict.
- **SC-015**: An Apology Court Duel with all three required fields (acknowledgement, evidence, remedy) submitted produces a `reconciliation` or `rejection` Disposition correctly; the feed renders the correct visual state for each.
- **SC-016**: `GET /api/docs` returns a valid OpenAPI 3.1 JSON document; all documented endpoints return the correct HTTP status for both authorized and unauthorized requests.
- **SC-017**: `GET /api/data/claims` with a Researcher API key returns only anonymized claim text with no Person identifiers; a Person who has opted out does not appear.

---

## Assumptions

- Users have a social media account (X, Threads, Bluesky, or GitHub) and are willing to authorise the app via SM OAuth.
- The Hono API server runs on Fly.io (single instance, shared-cpu-1x, 256 MB) with SQLite (WAL mode) on a persistent volume.
- Litestream continuously replicates the SQLite WAL to Tigris (S3-compatible, free on Fly.io).
- Mobile browser support is a stretch goal; v1 targets modern desktop browsers (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+).
- Real-time push notifications (WebSockets/SSE) are out of scope; the app polls or refreshes on user action.
- The @herald identity is a system-level account in the database, not a real OAuth user.
- Audio for the Default (deadline) event uses the Web Audio API (no external audio library); a simple generated chirp pattern is acceptable for v1.
- Accessibility (WCAG 2.1 AA) is a goal but secondary to functional completeness in v1.
- Image uploads are stored as binary blobs or file-system paths in v1; CDN/S3 offload is planned for v2 when storage exceeds 1 GB.
- **Storage scalability**: SQLite single-instance handles ~500 concurrent users and ~10k writes/day comfortably. Migration path to Postgres is documented in plan.md.
- Stripe is the primary tipping provider; Ko-fi link is the fallback. Stripe keys are stored in Fly.io secrets.
- Plausible Analytics (primary, privacy-first) and Google Analytics 4 (secondary, for ads) are both integrated via `<script>` tag — no build step required.

---

## Implementation Blockers

The following items are known pre-conditions or risks that could block implementation if not resolved before the relevant phase. Each has been assigned a Phase reference.

### B-001 — `better-sqlite3` native addon (blocks Phase 2)
`better-sqlite3` is a compiled native Node.js addon. The `node:22-alpine` Docker base image does not include build tools (`python3`, `make`, `g++`). **Resolution**: Add `RUN apk add --no-cache python3 make g++` to the Dockerfile before `npm ci`, or switch to `node:22` (Debian-based) as the build stage and use a slim runtime stage. A pre-built binary via `@db0/better-sqlite3-legacy` is an alternative if build toolchain is unwanted.

### B-002 — OAuth redirect URIs must be pre-registered (blocks Phase 4)
All four OAuth providers (X, Threads, Bluesky, GitHub) require a redirect URI to be registered in their developer consoles before the callback routes will work. X (Twitter) and Threads require app review for production scopes. **Resolution**: Register `https://judgmental.io/auth/<provider>/callback` on each platform before beginning Phase 4. Budget time for X and Threads review processes (can take days). Bluesky ATProto OAuth is currently unstable — may need to use Bluesky App Passwords as a fallback for v1.

### B-003 — Tigris bucket must pre-exist before first deploy (blocks Phase 1)
Litestream will fail to start if the S3 bucket does not exist. **Resolution**: Create the Tigris bucket via the Fly.io dashboard or `fly storage create` before running `fly deploy`. Document this as step zero in the quickstart runbook.

### B-004 — Fly.io persistent volume must be pre-created (blocks Phase 1)
`fly.toml` references a volume `jdg_data` but volumes must be created separately via `fly volumes create jdg_data --size 1`. **Resolution**: Add this to the quickstart as a mandatory pre-deploy step. Size should be 3 GB minimum to allow headroom.

### B-005 — Stripe webhook endpoint must be publicly reachable (blocks Phase 16)
Stripe webhooks cannot be tested against `localhost`. **Resolution**: Use `stripe listen --forward-to localhost:3000/api/tips/webhook` for local dev. In production the `fly deploy` domain must be registered in Stripe's webhook dashboard.

### B-006 — JWT refresh not specced (blocks Phase 4)
JWTs are issued with 24h expiry. There is no refresh token mechanism. When a JWT expires the user is silently logged out on the next API call. **Resolution**: The auth middleware returns `401` with `{"error":"token_expired"}`. The client intercepts this specific error code and shows a non-blocking "Session expired — tap to sign in again" banner (not a full redirect), preserving compositor state. This must be specced as FR-001a and implemented in Phase 4.

### B-007 — JWT secret rotation procedure not documented (operational risk)
Rotating `JWT_SECRET` immediately invalidates all active sessions. **Resolution**: Add a `JWT_SECRET_PREV` env var that the auth middleware also accepts during a rotation window. Procedure: set new `JWT_SECRET`, set old value in `JWT_SECRET_PREV`, deploy, wait 25h, clear `JWT_SECRET_PREV`. Document in plan.md runbook.

### B-008 — `node-cron` has no watchdog (operational risk, blocks Phase 27)
If the Hono server process crashes and is restarted by Fly.io, `node-cron` jobs resume — but any deadline that expired during the downtime will be caught on the next 1-minute tick. For longer downtime (> 30 min) the gap is still acceptable. **Resolution**: The stale-duel reaper partially mitigates this. Add a `cron_runs` integrity check: on server startup, query for any `deadline_conditions` with `deadline_at < now` and no Disposition — process them immediately before the first cron tick.

### B-009 — Bluesky ATProto OAuth complexity (high effort, blocks Phase 4 for Bluesky)
The Bluesky ATProto OAuth flow requires Dynamic Client Registration per PDS instance, which is significantly more complex than standard OAuth 2.0. **Resolution**: Defer Bluesky OAuth to v1.1. Implement X, GitHub, and Threads for v1. Add a note in the UI that Bluesky sign-in is "coming soon". Tasks T027 should be marked deferred.

### B-010 — `@system` pseudo-person for auto-flags not defined in DB (blocks Phase 27)
`moderation_flags` has `flagged_by_person_id NOT NULL`. Cron auto-flags (from `db-integrity.js`) need a system actor. **Resolution**: Seed the database with a reserved `persons` row: `id=0, name='@system', is_herald=false, is_ai=false`. FK constraints must allow id=0 as a valid value. This must be inserted in migration 001 or as a seed step before migration 002.

---

## Marketing Taglines

- *"Take ideas and their defenders to trial, and reach verdicts."*
- *"You've been posting takes for years. Time to defend them."*
- *"Likes don't make you right. Surviving challenges does."*
- *"The internet has been fighting for 30 years. judgmental.io is where we settle it."*

---

## Product Modes

judgmental.io ships five named Duel contexts in v1. The engine is identical across all; only framing, copy, and access rules differ.

| Context | Use case | Visibility default | ClaimAccords affected |
|---|---|---|---|
| `standard` | Public debate, claim defence | Public | Yes |
| `compatibility` | **Dating Mode** — relational/dating decision-making | Private | No |
| `proposal` | Marriage proposal and vow negotiation | Private | No |
| `decision` | Joint couple decision deliberation | Private | No |
| `appreciation` | Couple gratitude/appreciation post | Private | No |
| `historical` | Re-trying historical disputes | Public | No |
| `apology` | Restorative resolution | Public | No |
| `separation` | Structured marital separation/reconciliation | Private | No |
| `accountability` | Private personal commitment tracking | Private | No |
| `doctrinal` | **Christian Mode** — scripture-grounded theological claim | Public | Yes |
| `bible_study` | **Christian Mode** — scripture-based group Duel | Private (org) | No |
| `discernment` | **Christian Mode** — church/org community decision | Org-private | No |
| `discipline` | **Christian Mode** — three-stage church reconciliation | Private | No |
| `org` | Private organizational workspace | Org-private | Configurable |


