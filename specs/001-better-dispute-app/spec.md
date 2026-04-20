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

### Session 2026-04-20 — Expanded product scope

- Q: Should a Dating/Compatibility mode be in v1? → A: Yes. A Duel can be filed with `context=compatibility` between two consenting Persons. Mechanics are identical to standard Duels; the framing, copy, and UI chrome change. Both Persons must accept the Duel invitation before it begins. The verdict is private to the two parties by default but may be made public.
- Q: How are Compatibility Duels shared and discovered to drive traffic? → A: Three viral loops: (1) shareable invite link with anonymous teaser card sent outside the app; (2) public Open Challenges feed where anyone may accept; (3) shareable "Duel me on this" Score Card image watermarked with judgmental.io URL. Topic templates and a Match Profile alignment feature drive organic discovery. Dating leaderboard (Most Compatible Pairs) provides social proof.
- Q: Should an Open API for third-party integrations be in v1? → A: Yes, as a documented public REST API with API-key auth. All read endpoints (Claims, Cases, Duels, Dispositions, Analytics views) are accessible. Write endpoints (file a Claim, open a Case) require org-tier or API-key auth. Rate-limited. Documented at `GET /api/docs` (JSON/OpenAPI 3.1).
- Q: Should Historical Re-trials be in v1? → A: Yes. A Duel may be created with `context=historical` and a `historical_subject` string (e.g. "Galileo v The Church, 1633"). These Duels are special: parties are role-players arguing historical positions, not personal claims. The original Record is a system-authored Claim citing the historical subject. These Duels are always public, never generate ClaimAccords against living Persons, and are tagged for the Historic Re-trials analytics view.
- Q: Should an Apology Court (Resolution/Reconciliation mode) be in v1? → A: Yes, as a named Duel context (`context=apology`). The filing party declares a wrong, submits evidence of it, and proposes remediation. The respondent may Accept (producing a `reconciliation` Disposition), reject, or contest. The UI frames this in restorative language — wrongdoing acknowledged, remedy proposed, verdict reached. Christian forgiveness theology (the idea that confession, acknowledgement, and genuine repentance are the preconditions of restoration) is the philosophical north star, but the system is belief-agnostic. No religious language is coded into the UI. The system simply asks: was the wrong acknowledged? Was a remedy offered? Did the other party accept? The moral weight of the resulting record is left to the parties and their community.
- Q: Should Verdict data be sold as a product? → A: Yes. An anonymised, aggregated dataset of Claims, verdicts, and Judgment consistency scores is exposed as a subscription data API. Access tiers: Researcher (free, rate-limited), Professional ($99/month), Institutional ($499/month). Content is fully anonymised — no Persons, no handles, only argument structures and verdicts. Opt-out is available but defaults to opt-in.
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

### User Story 9 — New User Onboarding (Priority: P1)

A brand-new user arrives at judgmental.io for the first time. They see the public Home feed unauthenticated, choose a social platform to sign in with, complete OAuth, and land back at the Home feed authenticated. The Miranda acknowledgement card is shown above the composer. They acknowledge it once — it does not reappear.

**Why this priority**: First-time auth state and persistent card are foundational UX that every user encounters. Getting this wrong breaks trust immediately.

**Independent Test**: Fresh browser (no localStorage), sign in via GitHub OAuth → JWT stored → Home feed renders authenticated → Miranda card visible above composer → user acknowledges → card gone → refresh → card still gone.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they click "Sign in" and select GitHub, **Then** they are redirected to GitHub OAuth, then back to judgmental.io with a valid JWT stored in `localStorage`.
2. **Given** a newly authenticated user has never acknowledged the Miranda notice, **When** the composer is visible, **Then** the Miranda acknowledgement card is shown above it.
3. **Given** the user clicks "I understand" on the Miranda card, **Then** `localStorage['jdg:miranda_ack']` is set to `1` and the card is removed from the DOM.
4. **Given** the user refreshes or reopens the app, **When** `jdg:miranda_ack` is already set, **Then** the Miranda card is NOT shown.
5. **Given** a returning user with an expired JWT, **When** they reload the app, **Then** they see the unauthenticated Home feed and a "Your session expired — sign in again" notice.
6. **Given** the user's handle on their chosen platform is already taken by another Person on judgmental.io, **When** they complete OAuth, **Then** the server appends a short unique suffix to disambiguate and returns the resolved `@handle` in the JWT response.

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

Any authenticated user can look up the full public record of any other Person: every Claim, Challenge, Answer, ClaimAccord, Judgment rendered, and Rescission — all filterable.

**Why this priority**: The Miranda principle requires that this information be accessible. It is also the primary research tool before entering a Duel.

**Independent Test**: User A clicks on User B's handle → Person profile opens → tabs: Records, Agreements, Judgments, Rescissions; filter by `type=claim` → only Claims shown.

**Acceptance Scenarios**:

1. **Given** any post card, **When** the user clicks the author handle `@name`, **Then** the Person profile view opens for that author.
2. **Given** the Person profile is open, **Then** four tabs are shown: All Records, Agreements (ClaimAccords), Judgments Rendered, Rescissions.
3. **Given** the Records tab, **When** the user applies a type filter, **Then** only Records of that type are shown.
4. **Given** the Records tab, **When** the user types in the topic search field, **Then** Records containing that text are shown (full-text search).
5. **Given** the user is unauthenticated, **Then** the Person profile is visible but all "Challenge" and "Agree" interactions are disabled with "Sign in" tooltips.

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
2. **Given** the Undefeated Claims leaderboard, **When** rendered, **Then** Claims are ordered by `ClaimAccords × survived Duels` with the formula shown as a tooltip.
3. **Given** the "You disagree with N%" hook, **When** an authenticated user views the Home feed, **Then** each Claim card shows the percentage of Persons who hold that ClaimAccord against whom the current user has no ClaimAccord (approximated from the agreeers set).
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
2. **Given** Person B declines the consent prompt, **Then** the Duel is cancelled; no Records are created.
3. **Given** both Persons have accepted, **Then** the Duel proceeds using standard mechanics with compatibility UI framing.
4. **Given** a Disposition is reached, **Then** the verdict is visible only to persons A and B unless both explicitly toggle "Make public".
5. **Given** the Duel is private, **Then** it MUST NOT appear in the public feed, any analytics view, or the Verdict Data API.

---

### User Story 18 — Historical Re-trial (Priority: P3)

A user wants to re-argue a famous historical dispute — Galileo vs the Church, Keynes vs Hayek, Tesla vs Edison. They file a Re-trial, claiming one of the historical positions. Another user claims the opposing position. The Duel proceeds with standard mechanics. The verdict joins a public Historic Re-trials archive.

**Why this priority**: High organic shareability. Drives SEO. Zero data-model changes needed.

**Independent Test**: User A files a Historical Re-trial with `historical_subject="Galileo v The Church, 1633"`. The root Claim is authored by `@system`. User B argues the opposing position. Neither user's ClaimAccord count is affected by the verdict.

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
4. **Given** Person B contests the characterisation, **Then** a standard turn sequence begins; mechanics are identical to a normal Duel.
5. **Given** any Apology Court Duel, **Then** no religious terminology appears anywhere in the UI.

---

### User Story 20 — Open API (Priority: P2)

A developer or organisation wants to query judgmental.io data programmatically — embedding verdicts in another app, building a research tool, or filing Claims via automation. They use an API key to access documented endpoints.

**Why this priority**: Enables the Org tier, data API monetisation, and third-party ecosystem without building a dedicated integration for each.

**Independent Test**: Developer calls `GET /api/docs` → receives valid OpenAPI 3.1 JSON. Calls `GET /api/claims` with an API key → receives Claims. Calls the same route without a key → receives `401`. Exceeds rate limit → receives `429` with `Retry-After`.

**Acceptance Scenarios**:

1. **Given** any client calls `GET /api/docs`, **Then** a valid OpenAPI 3.1 JSON document is returned with all public endpoints documented.
2. **Given** a read-only API key, **When** used on a write endpoint, **Then** a `403 Forbidden` is returned.
3. **Given** a request exceeds the rate limit, **Then** `429 Too Many Requests` is returned with a `Retry-After` header.
4. **Given** an admin revokes an API key, **Then** the key stops working within 60 seconds (next cache invalidation cycle).

---

### User Story 21 — Verdict Data API Subscription (Priority: P2 — Business)

A researcher or institution wants bulk access to anonymised Duel outcome data for analysis — studying how claims survive contestation, how judgment consistency correlates with claim strength, etc. They subscribe to a data tier and query the Verdict Data API.

**Why this priority**: Zero marginal cost. Pure revenue. The data is a byproduct of the platform's existing mechanics.

**Independent Test**: Researcher API key calls `GET /api/data/claims` → returns anonymised Claim texts and Disposition outcomes with no Person identifiers. A Person who has opted out does not appear.

**Acceptance Scenarios**:

1. **Given** a Researcher API key, **Then** `GET /api/data/claims` returns anonymised claim text and Disposition outcomes only; no Person handles or platform identifiers are present.
2. **Given** a Person has opted out via User Settings, **Then** their Records do not appear in any Verdict Data API response within 24 hours of opt-out.
3. **Given** an Institutional subscriber, **Then** bulk JSONL export via `GET /api/data/export` is available with no daily rate limit.
4. **Given** a free Researcher key, **Then** requests beyond 100/day return `429`.

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
- **FR-151** (**External Counsellor Access**): Either party MAY invite one external Person (e.g. a counsellor, therapist, or pastor) as a **Counsellor** on the `MarriageRecord`. Both must consent. The Counsellor gains read-only access to all linked Duels and Covenant Claims, and may submit private Analysis on any of them. Counsellor access is revocable by either party at any time. Their Analysis is never public.

**Dating Game — Initiation and Sharing**

The dating/compatibility experience is designed to be shareable, playful, and inherently viral. The following mechanics drive traffic through the dating-game surface.

- **FR-152** (**Date Duel invite link**): When Person A files a `context=compatibility` Duel, the system generates a **shareable invite link** (`/join/duel/:token`) that can be sent to Person B outside the app — via DM, text, or any social platform. The link shows a teaser card ("Someone wants to settle something with you — on the record") before prompting sign-in. The invite token expires after 7 days if not accepted.
- **FR-153** (**Anonymous teaser card**): The invite link page MUST show a teaser that reveals only the Duel topic (e.g. "Are we compatible enough to move in together?") without revealing the filer's identity until Person B signs in and accepts. This creates curiosity-driven click-through.
- **FR-154** (**Public "Settle It" challenges**): Person A MAY file a compatibility-style Duel as a **public open challenge** — directed at any Person who matches a stated profile (e.g. "Anyone who thinks pineapple belongs on pizza — settle it with me"). These appear in a dedicated **Open Challenges** feed section. Any authenticated Person MAY accept. Once accepted, the Duel becomes private between the two parties.
- **FR-155** (**Dating topic templates**): A library of pre-written **topic templates** MUST be available when filing a `context=compatibility` Duel. Categories: Lifestyle, Values, Finances, Family, Conflict Style, Future Plans, Dealbreakers. Selecting a template pre-fills the Claim text and suggested turn structure. Templates are community-contributed (filed as Records and upvoted) — the most-used templates surface first.
- **FR-156** (**Compatibility score card**): After a Compatibility Duel reaches a Disposition, the system generates a private **Score Card** for the two parties — a visual summary showing: topic, how each party argued, where they converged, where they diverged, and the verdict. Both parties may choose to share the Score Card as a static image (generated server-side as an SVG/PNG). Shared Score Cards are watermarked with the judgmental.io URL and Duel ID.
- **FR-157** (**"Find your match" Claim alignment**): Any Person MAY publish a set of their public ClaimAccords as a **Match Profile** — a curated list of positions they hold (e.g. political, lifestyle, values Claims). The system MAY surface other Persons with high Claim-alignment scores as potential Compatibility Duel matches. Alignment is computed as Jaccard similarity over public ClaimAccords. This feature requires explicit opt-in for both the publisher and the surfaced match.
- **FR-158** (**Shareable compatibility teaser**): A Person MAY generate a public **"Duel me on this"** card from any of their public Claims — a shareable image linking to an open challenge on that Claim. Format: the Claim text, their handle, and a CTA ("Think you can beat this? Accept the challenge"). This is the primary viral loop: post the card on X/Threads/Instagram, drive clicks to judgmental.io, new users sign up to accept.
- **FR-159** (**Dating leaderboard**): An opt-in public leaderboard of **Most Compatible Pairs** (couples who have completed the most Compatibility Duels with `reconciliation` or `accord` dispositions and chosen to be public). Displayed on the Commitments feed. Drives social proof and aspiration.

- **FR-113**: A public REST API MUST be documented at `GET /api/docs` as an OpenAPI 3.1 JSON document. A human-readable HTML render MAY be served at `/api/docs/ui`.
- **FR-114**: All read endpoints (Claims, Cases, Duels, Dispositions, Persons, Analytics views) MUST be accessible to authenticated API-key holders with no rate-limit tier above Researcher.
- **FR-115**: Write endpoints (create Claim, open Case, submit Analysis) MUST require an active org-tier subscription or a dedicated API key issued by an admin.
- **FR-116**: API keys MUST be scoped (read-only, read-write) and revocable from the user settings page. Keys MUST be stored as bcrypt hashes server-side; the plaintext is shown only once at creation.
- **FR-117**: All API routes MUST return `429 Too Many Requests` with `Retry-After` header when rate limits are exceeded. Rate limits: Researcher = 60 req/min; Professional/Institutional = 600 req/min; Org API key = 1,200 req/min.

**Historical Re-trials**

- **FR-118**: A Duel MAY be created with `context=historical` and a `historical_subject` string (e.g. `"Galileo v The Church, 1633"`).
- **FR-119**: The root Claim for a Historical Re-trial MUST be a system-authored Record (authored by `@system`) citing the `historical_subject`. No living Person's Base of Truth is affected by the outcome.
- **FR-120**: Historical Re-trial parties argue assigned historical positions. Their Judgment verdict does NOT produce a ClaimAccord against either party's personal Base of Truth.
- **FR-121**: Historical Re-trials are ALWAYS public. They appear in a dedicated **Historic Re-trials** analytics view and feed section.
- **FR-122**: A `historical_subject` search MAY surface existing Re-trials on the same subject, displaying precedent verdicts before a new one is filed.

**Apology Court (Restorative Resolution)**

- **FR-123**: A Duel MAY be filed with `context=apology`. The filing party is the `petitioner`; the respondent is the `recipient`.
- **FR-124**: The petitioner MUST submit: (a) an acknowledgement of the wrong (`claim_text`), (b) supporting Evidence, and (c) a proposed remedy (`remedy_text`). All three fields are required before the Duel begins.
- **FR-125**: The recipient may: (a) **Accept** — producing a `reconciliation` Disposition and marking the Duel resolved; (b) **Reject** — producing a `rejection` Disposition; or (c) **Contest** — opening a standard turn sequence disputing the characterisation of the wrong or the adequacy of the remedy.
- **FR-126**: Apology Court Duels use restorative UI language throughout. Labels: "Acknowledgement" (Claim), "Proposed Remedy" (Offer), "Restored" (Accord), "Unresolved" (Default). No religious terminology is used. The system is belief-agnostic.
- **FR-127**: The philosophical design principle — that genuine acknowledgement of wrongdoing, a sincere remedy, and acceptance by the wronged party constitute the preconditions of restoration — is documented in the codebase as a comment in the apology-context controller. It is never rendered to the user.
- **FR-128**: Apology Court dispositions (`reconciliation`, `rejection`) MUST be visually distinct in the feed. A `reconciliation` disposition MUST show a visual "resolved" state. A `rejection` remains as an open public record.

**Verdict Data API**

- **FR-129**: An anonymised, aggregated dataset of Claims (text only, no author), Disposition outcomes, and Judgment consistency scores MUST be exposed as a subscription data API at `GET /api/data/*`.
- **FR-130**: Verdict Data API access tiers and rate limits:
  - **Researcher** — free, 100 req/day, read-only, anonymised only
  - **Professional** — $99/month, 2,000 req/day, full anonymised dataset including argument structure
  - **Institutional** — $499/month, unlimited, bulk export (JSONL), priority support
- **FR-131**: All data returned by the Verdict Data API MUST be fully anonymised. No Person handles, display names, or platform identifiers may be included. Argument structure (Claim text, challenge text, evidence summaries) is included but stripped of any PII.
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
- **MarriageRecord**: A first-class entity linking two Persons through a lifecycle of states — `engaged` → `married` → `separated` | `dissolved`. Linked to a proposal Duel, an optional sealed Covenant, and any intra-marriage Duels. Always private unless both parties consent to public visibility.
- **Covenant**: A co-authored, mutually signed Record containing structured mutual commitments. Each commitment line is stored as a `context=covenant` Claim jointly authored by both partners. Sealed Covenants are immutable. Linked to a MarriageRecord.

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
| Historic Re-trials | Completed Historical Re-trial Duels, searchable by `historical_subject` |
| Apology Court | Resolved and unresolved Apology Court Duels, filterable by `reconciliation` / `rejection` |

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
- **SC-013**: A Compatibility Duel cannot begin until both named Persons have accepted the consent prompt; the filing party sees a "Awaiting acceptance" state.
- **SC-014**: A Historical Re-trial's root Claim is authored by `@system`; neither party's ClaimAccord count changes after a verdict.
- **SC-015**: An Apology Court Duel with all three required fields (acknowledgement, evidence, remedy) submitted produces a `reconciliation` or `rejection` Disposition correctly; the feed renders the correct visual state for each.
- **SC-016**: `GET /api/docs` returns a valid OpenAPI 3.1 JSON document; all documented endpoints return the correct HTTP status for both authorised and unauthorised requests.
- **SC-017**: `GET /api/data/claims` with a Researcher API key returns only anonymised claim text with no Person identifiers; a Person who has opted out does not appear in the results.

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
`moderation_flags` has `flagged_by_person_id NOT NULL`. Cron auto-flags (from `db-integrity.js`) need a system actor. **Resolution**: Seed the database with a reserved `persons` row: `id=0, name='@system', is_strawman=false, is_ai=false`. FK constraints must allow id=0 as a valid value. This must be inserted in migration 001 or as a seed step before migration 002.

---

## Marketing Taglines

- *"Take ideas and their defenders to trial, and reach verdicts."*
- *"You've been posting takes for years. Time to defend them."*
- *"Likes don't make you right. Surviving challenges does."*
- *"The internet has been arguing for 30 years. judgmental.io is where we settle it."*

---

## Product Modes

judgmental.io ships five named Duel contexts in v1. The engine is identical across all; only framing, copy, and access rules differ.

| Context | Use case | Visibility default | ClaimAccords affected |
|---|---|---|---|
| `standard` | Public debate, claim defence | Public | Yes |
| `compatibility` | Relational/dating decision-making | Private | No |
| `proposal` | Marriage proposal and vow negotiation | Private | No |
| `decision` | Joint couple decision deliberation | Private | No |
| `appreciation` | Couple gratitude/appreciation post | Private | No |
| `historical` | Re-trying historical disputes | Public | No |
| `apology` | Restorative resolution | Public | No |
| `separation` | Structured marital separation/reconciliation | Private | No |
| `org` | Private organisational workspace | Org-private | Configurable |


