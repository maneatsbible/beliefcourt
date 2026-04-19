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

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Identity**

- **FR-001**: The app MUST authenticate users through the GitHub Device Flow (OAuth Device Authorization Grant) in v1; no server-side component is required. A serverless redirect-based OAuth flow is the planned v2 upgrade.
- **FR-002**: Each Person MUST have a unique `@name` derived from their GitHub username and a unique id from their GitHub user id.
- **FR-003**: The @strawman placeholder MUST be a pre-configured GitHub account used to import external content. Any authenticated user may submit a Claim attributed to @strawman together with an immediate Challenge. The real author of the imported content may later authenticate and claim ownership, replacing @strawman with their own Person record.

**Records & Tree Structure**

- **FR-004**: The system MUST support the following Record types: Claim, Challenge, Answer, Offer, Response, Case, Duel, Disposition, Accord, ClaimAccord, DeadlineConditions, Moment, Analysis, Judgment, SimilarityLink.
- **FR-005**: Every Record MUST be stored as a GitHub Issue in a single shared app-owned repository (one Issue per Record, relationships encoded in issue body metadata).
- **FR-006**: Top-level Claims MUST contain either text OR a single image, not both.
- **FR-007**: Non-Claim Records MAY contain both text and a single image.
- **FR-008**: All Records MUST have globally unique ids (GitHub issue number within the repo).
- **FR-009**: The GitHub Issues store MUST be treated as append-only; no Issue bodies are ever edited after creation.

**Challenges and Cases**

- **FR-010**: Challenge type MUST be one of: Interrogatory (Y/N question) or Objection (free-form objection).
- **FR-011**: A Person MUST NOT challenge their own Record; the Challenge control MUST be disabled for the author.
- **FR-012**: A Person MUST NOT challenge the same Record more than once.
- **FR-013**: When a Challenge is submitted, a Case MUST be created against the challenged Record and a Duel MUST be opened within that Case.
- **FR-014**: Any Record type (Claim, Challenge, Answer, Offer, Response, Disposition, SimilarityLink) MAY be challenged, opening a nested Case with its own Case View.

**Cases and Duels**

- **FR-015**: Cases and Duels MUST be first-class objects stored as GitHub Issues with distinct labels.
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
- **FR-026**: Upon expiry of agreed DeadlineConditions, the first client to load the Duel View past the deadline MUST write a Default Disposition as a new GitHub Issue, then display it prominently with a visual indicator and an audio cue (Web Audio API chirp).
- **FR-027**: A Default Disposition MAY be challenged by the defaulting party, opening a nested Case against the Disposition Record.

**ClaimAccords and Base of Truth**

- **FR-028**: A Person MUST be able to hold a ClaimAccord on any Claim they did not author and have not challenged.
- **FR-029**: A Person MUST NOT hold a ClaimAccord on a Claim they have challenged.
- **FR-030**: A Person MAY declare a Base of Truth by selecting an anchor Claim they hold a ClaimAccord on that is in STANDING state.

**Judgment**

- **FR-031**: Judgment on a Duel MUST require: (a) a Disposition on the Duel, (b) a completed Analysis referencing Moments, (c) the judge has a declared Base of Truth with a STANDING anchor Claim, (d) the judge is not a party to the Duel.
- **FR-032**: Judgment MUST record a verdict (challenger or defender), the Analysis it is based on, and the judge's anchor Claim.
- **FR-033**: Claim strength MUST be computed at query time from the dataset: `strength = count(ClaimAccords) × count(Duels where Disposition=STANDING)`. No stored score field.

**SimilarityLinks**

- **FR-034**: Any Person MAY submit a SimilarityLink asserting two Records are equivalent.
- **FR-035**: A SimilarityLink MUST be challengeable and can reach STANDING state.
- **FR-036**: A SimilarityLink in STANDING state MUST enable the system to surface the prior Duel resolution as Precedent for any new equivalent Challenge.

**MVC Architecture**

- **FR-037**: All permission logic (canChallenge, canAnswer, canOffer, canRespond, canAgree, canJudge, etc.) MUST reside in the Controller; the View MUST NOT make permission decisions.
- **FR-038**: The View MUST only read Controller state and render accordingly; it MUST disable (not hide) controls that are unavailable.
- **FR-039**: The Model MUST map directly to GitHub API entities (Users → Person, Issues → Records).

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

### Key Entities

- **Person**: A GitHub user. Unique `@name` (GitHub login), unique id (GitHub user id). Special placeholder: @strawman.
- **Record** (abstract, impl only): Base for all stored entities. Unique id (GitHub issue number), author, type, parentId, text, imageUrl, createdAt.
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
- **DeadlineConditions**: Mutually agreed countdown per turn. Expiry triggers Default Disposition.
- **Moment**: Timed annotation on a Record within a Duel context.
- **Analysis**: Post-Disposition review of a Duel, referencing Moments. Required before Judgment.
- **Judgment**: A Person's verdict on a Duel, grounded in their Base of Truth (STANDING anchor Claim).
- **BaseOfTruth**: A Person's declared anchor Claim and the set of Claims they hold ClaimAccords on.
- **SimilarityLink**: Asserts two Records are equivalent. Challengeable. In STANDING state enables Precedent surfacing.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can read the Home feed, authenticate with GitHub, compose a Claim, and see it appear in the feed — all within 3 minutes.
- **SC-002**: Any Record, Case, or Duel can be opened via its canonical URL in a freshly opened browser tab without additional navigation steps.
- **SC-003**: All permission controls (Challenge, Answer, Offer, Agree, Judge) accurately reflect the current user's eligibility — zero cases of an unauthorised action being permitted client-side.
- **SC-004**: The full challenge-answer-counter-challenge cycle for one Duel round-trips (submit → GitHub → re-render) in under 4 seconds on a standard broadband connection.
- **SC-005**: The Home feed loads and renders the first screen of Claim cards in under 2 seconds on a standard broadband connection.
- **SC-006**: A deadline expiry triggers a visible and audible Default event within 5 seconds of the deadline passing.
- **SC-007**: 100% of Record/Case/Duel state changes are persisted to GitHub Issues; no client-only state mutations go unrecorded.

---

## Assumptions

- Users have a GitHub account and are willing to authorise the app via the GitHub Device Flow (no server required for v1).
- Authentication in v1 uses GitHub Device Flow; a serverless OAuth token-exchange function is the planned v2 upgrade.
- A single shared GitHub repository (owned by the app organisation) is used as the append-only ledger for all Records; it is pre-created and configured.
- Mobile browser support is a stretch goal; v1 targets modern desktop browsers (Chrome, Firefox, Safari, Edge).
- Real-time push notifications (WebSockets/SSE) are out of scope; the app polls or refreshes on user action.
- GitHub API responses MUST be cached in `localStorage` using ETag-based conditional GET requests to minimise rate-limit consumption.
- The @strawman GitHub account is pre-created and its OAuth token is available to the app as a configured secret.
- Audio for the Default (deadline) event uses the Web Audio API (no external audio library); a simple generated chirp pattern is acceptable for v1.
- Accessibility (WCAG 2.1 AA) is a goal but secondary to functional completeness in v1.
- The app is deployed as a static site (GitHub Pages or equivalent); no server-side rendering.
- Image uploads are handled by attaching images to GitHub Issues via the GitHub API; file size limits are governed by GitHub's limits (~10 MB per attachment).
- **Storage scalability**: GitHub Issues is the authoritative ledger for v1. A secondary read-model index (queryable by label, relationship, and derived strength) is planned for v2 to support the full judgment and knowledge-base feature set at scale. The v1 data model is designed so this index is mechanically derivable from the Issues ledger.

