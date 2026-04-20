# Feature Specification: judgmental.io

**Feature Branch**: `001-better-dispute-app`
**Created**: 2026-04-18 (revised 2026-04-19)
**Status**: Draft
**Input**: User description: "I want to build an app called judgmental.io — plain vanilla JavaScript, runs in browser, GitHub back-end for users/repos/issues. No external frameworks or libraries. The system helps and encourages people to dispute and then judge according to their own standard of truth."

---

## Clarifications

### Session 2026-04-18

- Q: How should GitHub authentication be handled on a static site with no server? → A: GitHub Device Flow for v1 (zero-server); serverless token-exchange function planned for v2.
- Q: Where do GitHub Issues live — single shared repo, per-topic, or per-user? → A: Single shared repo owned by the app (e.g., `judgmentalio/judgmental-data`); all users' content is stored as issues there.
- Q: When multiple people have agreed with a Claim and it is challenged, how many Duels are created? → A: One Duel per challenger–defender pair within the same Case; each agre-er who chooses to respond opens their own Duel.
- Q: How is the deadline countdown enforced with no server? → A: Agreed deadline timestamp stored in the GitHub Issue body; clients compute remaining time on load; the first client to load past the deadline writes the Default (Disposition) record as a new GitHub Issue.
- Q: What is the caching and pre-fetching strategy given GitHub API rate limits? → A: localStorage cache with ETag-based conditional GETs (If-None-Match); viewport pre-fetch for visible Home feed cards.

### Session 2026-04-20 — Infrastructure pivot and feature batch

- Q: What analytics stack? → A: Both **Plausible** (privacy-first, no cookies, no consent banner — primary) and **Google Analytics 4** (IP-anonymised — secondary, required for ads integration). Both are script-tag only; no build step.
- Q: Should auth still use GitHub Device Flow? → A: No. Backend is now Fly.io + Hono + SQLite. Auth is **SM OAuth** (X, Threads, Bluesky, GitHub) → server-side token exchange → signed JWT (HS256, 24h). No GitHub API calls for data storage.
- Q: How are AI-authored Records disclosed? → A: `is_ai: boolean` and `ai_model: string | null` on every Record. The UI renders an `[AI]` or `[AI-assisted]` badge on every affected Record card — not just on the Person profile.
- Q: How does the tipping/creator-funding system work? → A: Direct peer-to-peer tips via Stripe (primary) or Ko-fi link. Platform fee 0% in v1. Tips are attached to a Person (and optionally to the Record that prompted the tip). Constitutional constraint: **no judgment, Claim access, or Duel participation is ever gated behind payment**.
- Q: What are Evidence and Exhibits? → A: An **Evidence** is a structured attachment (file, URL, quote) on any Record as supporting material. An **Exhibit** is a formally submitted Evidence item during a Duel, given an exhibit label (Exhibit A, B …). Either party may object to an Exhibit, opening a nested Case.
- Q: How should the logo communicate Duel state? → A: Scales beam angle + flame colours encode state. Left pan lower + larger left flame = challenger ahead. Right pan lower + larger right flame = defender holding. Both cold/grey = Disposed. Both white/gold = Accord/STANDING. Colour lane: challenger = cool blue-white; defender = warm amber.
- Q: What is the judicial role framing in the UI? → A: Each party carries a visible role badge (EXAMINING / TESTIFYING) that flips on counter-challenge. Judicial names are metadata; button labels remain user-friendly. Mapping: Challenge(Interrogatory) = Examination, Challenge(Objection) = Objection, Answer = Testimony, Counter-challenge = Cross-examination, Offer = Stipulation, Response(accepted) = So stipulated.
- Q: What is the ad policy? → A: Ads are shown only to unauthenticated users as a fixed bottom strip. Signing in removes ads permanently for that session. Constitutional principle: **full participation in the judgment process is free forever**.
- Q: What advanced judicial concepts should be modelled? → A: Voir dire (pre-Duel judge qualification), Subpoena (requesting a Person enter as witness), Amicus curiae (non-party Analysis submitter — already modelled), Deposition (pre-Case structured Q&A chain), Standing (right to bring a Case — modelled via ClaimAccord), Burden of proof (Duel-level flag indicating which party must prove their position).
- Q: What auto-analytics are wanted? → A: Ten public analytical views: (1) contested ground map, (2) consensus clusters, (3) undefeated Claims leaderboard, (4) serial challengers badge, (5) Judgment consistency score, (6) precedent chains graph, (7) dead ends / graveyard, (8) velocity (fastest-growing ClaimAccords), (9) flip rate (intellectual consistency), (10) "you disagree with N% on this" hook on Home View cards.

### Session 2026-04-19 — Scope widening to judgmental.io

- Q: What is the root entity? → A: **Claim** — a statement of truth. People agree with Claims. Cases are brought against Claims (and against any other Record).
- Q: What is the difference between a Case and a Duel? → A: A Case is opened when any Record is challenged; it groups one or more 1v1 Duels. Multiple agreers each enter their own Duel within the same Case.
- Q: What replaces "Dispute View"? → A: **Case View** — navigated to via a Case Chooser (cases against a Claim) and a Duel Chooser (Duels within a Case). Any nested challenged Record drills into another Case View with lineage breadcrumb.
- Q: What is @strawman? → A: A placeholder identity used to import external content (quotes, tweets, articles) for immediate disputation. Not a persona — a beacon. When the real author arrives and authenticates, they claim ownership and @strawman is replaced with their Person record.
- Q: What are Offer/Response? → A: First-class entities parallel to Challenge/Answer. Same structural shape (parent ← binary-response child), different semantics — resolution vs. contestation. Offers run non-blocking alongside the turn sequence. An accepted Response produces an Accord.
- Q: Can any Record be challenged? → A: Yes. Claim, Challenge, Answer, Offer, Response, Disposition, SimilarityLink — all can have a Case opened against them.
- Q: What is Judgment? → A: A Person's verdict on a Duel, grounded in their declared Base of Truth. Requires a completed Analysis (which references Moments). The accumulation of Judgments is the knowledge base.
- Q: How is Claim strength computed? → A: At query time from the dataset — not stored as a score. Strength = agreers × survived Duels. No opaque scores; all signals are queryable relationships.
- Q: How is semantic equivalence of Records determined? → A: By community, not algorithm. A **SimilarityLink** is a first-class challengeable Record asserting two Records are equivalent. If it stands, it enables Precedent surfacing.
- Q: What is the storage architecture? → A: GitHub Issues as append-only tamper-evident ledger (v1). A secondary read-model index (v2) for performant queries. The ledger is authoritative; the index is derived and rebuildable.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Claims and Make a Claim (Priority: P1)

A visitor opens judgmental.io in their browser. They see the Home view listing Claims as summary cards ranked by strength and activity. They can authenticate via GitHub and compose a new Claim (text and/or a single image). They can also import an external quote via @strawman to plant a position for others to dispute.

**Why this priority**: The Claim feed and composition are the entry point for all activity. Without this, no disputes can begin.

**Independent Test**: A logged-in user can type text, submit a Claim, and see it appear as a new card on the Home feed.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they visit the Home view, **Then** they see the Claim feed in read-only mode with all interactive controls disabled.
2. **Given** the user is authenticated, **When** they compose and submit a Claim, **Then** a new Claim card appears on the Home feed.
3. **Given** the user wants to import an external quote, **When** they toggle @strawman mode and paste a source URL and quote, **Then** the Claim is attributed to @strawman with the source URL recorded, and a Challenge is opened against it immediately.
4. **Given** the user uploads an image, **When** they submit a top-level Claim, **Then** the Claim contains either the text or the image (not both).
5. **Given** any Claim card is visible, **When** the user clicks the copy icon, **Then** the canonical URL for that Claim is copied to their clipboard.

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
5. **Given** a Challenge is submitted against a Claim that has agreers (ClaimAccords), **Then** each agre-er is notified and can enter their own Duel within the same Case.

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

**Why this priority**: ClaimAccords are the foundation of the knowledge base and Judgment eligibility.

**Independent Test**: Person C holds a ClaimAccord on @strawman's Claim and is eligible to enter a Duel defending it.

**Acceptance Scenarios**:

1. **Given** a Claim posted by another person, **When** an authenticated user clicks Agree, **Then** a ClaimAccord is created and they become eligible to defend it.
2. **Given** a Challenge is issued against a Claim with multiple agreers, **Then** each agre-er receives notification and can enter their own Duel within the same Case.
3. **Given** a person holds a ClaimAccord on a Claim, **Then** the Challenge icon for that Claim is disabled for them.

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

## Platform Philosophy

### On Truth and Judgment

judgmental.io is built on the conviction that **truth is knowable and defensible**. The system is designed to help people identify where they actually agree and disagree, to expose untested and tested claims, and to make righteous judgment possible — judgment grounded in a declared standard of truth rather than rhetorical technique.

The core mechanic — Claim, Challenge, Answer — is designed around substantive positions and their defense, not logical scaffolding. A Challenge must be answerable. An Answer must engage the Challenge. A Judgment must cite a Base of Truth.

The knowledge base grows from the bottom up: Claims that survive challenges accumulate epistemic weight. Judgments grounded in STANDING Claims carry more credibility than judgments grounded in untested ones. The truth is intended to rise to the top — not by vote, not by algorithm, but by surviving contestation.

### On Argumentation Style

The platform explicitly discourages philosophical argumentation — construction of formal syllogisms, premise-mapping, validity-based "winning" — as a primary mode. Such approaches reward structural cleverness over substantive engagement and can be used to avoid rather than address what is actually true.

**Logic & Reasoning widgets** (Fallacy Tag, Claim Map) are available *only as post-hoc diagnostic tools* — they describe errors and patterns in reasoning that has already occurred, never as a method to construct or win an argument. They are restricted to Challenge and Answer records and to Moment annotations.

> A Fallacy Tag names a failure that happened. A Claim Map renders visible what was implicit. Neither is an argument.

### On Precedent and Repeated Fights

When a SimilarityLink between two Records reaches STANDING state, the system surfaces the prior Duel as Precedent for any new equivalent Challenge. The intention is that a good argument, once won, should not need to be won again. People defend their claims once; the record speaks for itself.

### On Openness and Access

**Full participation in the judgment process — making Claims, entering Duels, rendering Judgments, building a Base of Truth — is free and requires no payment, ever.** Tipping and creator support are voluntary and have zero effect on any person's ability to participate or on the weight of any Record.

Advertising is shown only to unauthenticated visitors. Signing in removes all ads. This is a deliberate design statement: the platform earns attention from people who are not yet committed; it never monetises those who are actively doing the work.

### On Authorship and Disclosure

Every Record must accurately represent who authored it and in what capacity. The platform surfaces four disclosure types at the moment of display:

| Badge | Meaning |
|-------|---------|
| `[AI]` | Record was entirely generated by an AI model |
| `[AI-assisted]` | Record was drafted or substantially edited with AI assistance |
| `[Imported · @handle · Platform]` | @strawman import — sourced from external platform |
| `[on behalf of @handle]` | Proxy submission (future) |

Sponsored content is prohibited. Any sponsored-in-intent Record would be required to display `[Sponsored]` and is excluded from Claim strength computation and Judgment eligibility.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Identity**

- **FR-001**: The app MUST authenticate users through **SM OAuth** (X/Twitter, Threads, Bluesky, GitHub) via a server-side token exchange on the Hono API server. The server returns a signed JWT (HS256, 24h expiry) stored client-side. No GitHub API calls are made for data storage.
- **FR-002**: Each Person MUST have a unique `@name` (derived from their social media handle on the authenticating platform) and a globally unique id assigned by the application.
- **FR-003**: The @strawman placeholder MUST be a system-level identity (not a real OAuth user) used to import external content. Any authenticated user may submit a Claim attributed to @strawman together with an immediate Challenge. The real author of the imported content may later authenticate and claim ownership, replacing @strawman with their own Person record.

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
- **FR-062a** (**Miranda Principle**): A `cross_record` Evidence item cites any existing Record on the platform by its `id`. Any Record authored by a Duel party MAY be submitted as `cross_record` Evidence against them in any Duel in which they are a party. Everything posted on judgmental.io is on the record and permanently admissible. This is constitutionally non-negotiable.
- **FR-062b**: At first composition, every new user MUST see a persistent acknowledgement card above the composer: *"Everything you post on judgmental.io is permanent and on the record. Any of your Records can be submitted as Evidence in a Duel by anyone."* The card collapses only once the user explicitly acknowledges it. It MUST NOT be a skippable modal.
- **FR-063**: During a Duel, either party MAY formally submit an Evidence attachment as an **Exhibit**, assigning it an auto-incremented label (Exhibit A, Exhibit B, …) within the Duel.
- **FR-064**: Either party MAY object to an Exhibit by challenging it; this opens a nested Case against the Exhibit Record.
- **FR-065**: Exhibits MUST be listed in the Case View with their label and the submitting party clearly shown.

- **FR-090** (**Rescission**): Any Person MAY rescind any Record they authored by creating a Rescission Record pointing at it. The original Record MUST NOT be deleted or hidden. The Rescission notice MUST appear prominently on the original Record card. The author is no longer obligated to answer as defender for that Record going forward, but existing Duels MUST continue to their Disposition unchanged. A Rescission MAY NOT cascade-close Cases, Duels, or ClaimAccords held by others.
- **FR-091**: A Rescission Record MUST itself be challengeable, opening a nested Case to contest its sincerity or good faith.
- **FR-092**: When a Person rescinds a Claim that was in STANDING state, the platform MUST surface this event prominently — on the Person's profile, in the Flux/Velocity analytics view, and with a `[Rescinded STANDING]` badge — as a mark of intellectual courage. This is a virtue mechanic, not a penalty.
- **FR-093** (**On the Record search**): Any authenticated user MAY look up the full public record of another Person — every Record they have ever authored, every ClaimAccord they hold, every Judgment they have rendered, every Rescission they have made — filterable by Record type and topic. This is the Miranda feature in UI form: research your opponent before entering a Duel.

**Judicial Role Framing**

- **FR-066**: Each party in a Duel MUST display a visible role badge — **EXAMINING** (challenger's turn) or **TESTIFYING** (defender's turn) — in the Case View. The badge flips when the counter-challenge is submitted.
- **FR-067**: The judicial vocabulary mapping MUST be surfaced as a tooltip on the role badge: Challenge(Interrogatory) = Examination; Challenge(Objection) = Objection; Answer = Testimony; Counter-challenge = Cross-examination; Offer = Stipulation; Response(accepted) = So stipulated.
- **FR-068**: Advanced judicial roles MAY be represented as future first-class entities:
  - **Voir dire**: Pre-Duel qualification check of a proposed judge (does their BaseOfTruth qualify them to judge?).
  - **Subpoena**: A formal request that a specific Person enter a Duel as a witness.
  - **Deposition**: A structured pre-Case Q&A chain (Interrogatory Challenge sequence) before a formal Case is opened.
  - **Burden of proof**: A Duel-level flag indicating which party must prove their position.

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
- **FR-075**: Signing in MUST immediately remove all advertising for that session.
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
  - Flame colour: challenger lane = cool blue-white; defender lane = warm amber.
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

- **Person**: An authenticated user (SM OAuth). Unique `@name`, unique id. Special placeholder: @strawman.
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
- **Exhibit**: A formally submitted Evidence item in a Duel. Auto-labelled (Exhibit A, B …). Objectable.
- **Rescission**: A public declaration by a Record's author that they no longer hold that position. Append-only. Original Record preserved. Author released from defender obligation going forward. Challengeable.
- **Tip**: A voluntary peer-to-peer payment. Optionally linked to a Record. Platform fee 0%.

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
| Disagreement Hook | "You disagree with N% on this" shown per Claim card on Home View |

---

### Measurable Outcomes

- **SC-001**: A first-time user can read the Home feed, authenticate via SM OAuth, compose a Claim, and see it appear in the feed — all within 3 minutes.
- **SC-002**: Any Record, Case, or Duel can be opened via its canonical URL in a freshly opened browser tab without additional navigation steps.
- **SC-003**: All permission controls (Challenge, Answer, Offer, Agree, Judge) accurately reflect the current user's eligibility — zero cases of an unauthorised action being permitted client-side.
- **SC-004**: The full challenge-answer-counter-challenge cycle for one Duel round-trips (submit → server → re-render) in under 4 seconds on a standard broadband connection.
- **SC-005**: The Home feed loads and renders the first screen of Claim cards in under 2 seconds on a standard broadband connection.
- **SC-006**: A deadline expiry triggers a visible and audible Default event within 60 seconds of the deadline passing (server-side node-cron, 1-minute tick); client displays event on next load/poll.
- **SC-007**: 100% of Record/Case/Duel state changes are persisted to the SQLite database; no client-only state mutations go unrecorded.
- **SC-008**: Every AI-authored or AI-assisted Record displays the correct disclosure badge in all views.
- **SC-009**: Unauthenticated users see the ad strip; authenticated users never see ads in any view.
- **SC-010**: All 10 auto-analytics views load and render in under 3 seconds.
- **SC-011**: Admin interface loads and renders the user list (first page), cron panel, and system health widgets in under 2 seconds.
- **SC-012**: All 7 cron jobs run to completion without error on a fresh database with seed data; each produces the correct output rows in its target table.

---

## Assumptions

- Users have a social media account (X, Threads, Bluesky, or GitHub) and are willing to authorise the app via SM OAuth.
- The Hono API server runs on Fly.io (single instance, shared-cpu-1x, 256 MB) with SQLite (WAL mode) on a persistent volume.
- Litestream continuously replicates the SQLite WAL to Tigris (S3-compatible, free on Fly.io).
- Mobile browser support is a stretch goal; v1 targets modern desktop browsers (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+).
- Real-time push notifications (WebSockets/SSE) are out of scope; the app polls or refreshes on user action.
- The @strawman identity is a system-level account in the database, not a real OAuth user.
- Audio for the Default (deadline) event uses the Web Audio API (no external audio library); a simple generated chirp pattern is acceptable for v1.
- Accessibility (WCAG 2.1 AA) is a goal but secondary to functional completeness in v1.
- Image uploads are stored as binary blobs or file-system paths in v1; CDN/S3 offload is planned for v2 when storage exceeds 1 GB.
- **Storage scalability**: SQLite single-instance handles ~500 concurrent users and ~10k writes/day comfortably. Migration path to Postgres is documented in plan.md.
- Stripe is the primary tipping provider; Ko-fi link is the fallback. Stripe keys are stored in Fly.io secrets.
- Plausible Analytics (primary, privacy-first) and Google Analytics 4 (secondary, for ads) are both integrated via `<script>` tag — no build step required.

---

## Marketing Taglines

- *"Take ideas and their defenders to trial, and reach verdicts."*
- *"You've been posting takes for years. Time to defend them."*
- *"Likes don't make you right. Surviving challenges does."*
- *"The internet has been arguing for 30 years. judgmental.io is where we settle it."*


