# Tasks: Better Dispute App

**Input**: Design documents from `/specs/001-better-dispute-app/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/github-issues-schema.md ✅ | quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies)
- **[Story]**: User story scope — [US1]–[US6]
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Project scaffold, configuration, tooling, and GitHub repo labels

- [X] T001 Create project directory structure per plan.md: `src/api/`, `src/model/`, `src/controller/`, `src/view/`, `src/view/components/`, `src/utils/`, `styles/`, `tests/unit/model/`, `tests/unit/controller/`, `tests/integration/`, `tests/e2e/flows/`
- [X] T002 Create `index.html` app shell with `<script type="module" src="src/app.js">` and semantic layout regions (header, main, notification-root) in `index.html`
- [X] T003 [P] Create `src/config.sample.js` with `CONFIG` export shape: `githubClientId`, `dataRepo`, `strawmanLogin`, `appVersion` in `src/config.sample.js`
- [X] T004 [P] Create `styles/main.css` with full CSS custom property design token palette (dark theme) from research.md §7 in `styles/main.css`
- [X] T005 [P] Create `tests/runner.js` custom micro test-runner with `describe`, `it`, `expect`, `beforeEach`, `afterEach` primitives (~50 lines, pure JS) in `tests/runner.js`
- [X] T006 [P] Create `scripts/setup-labels.sh` bash script that uses GitHub CLI (`gh`) to create all `bd:*` labels defined in `contracts/github-issues-schema.md` in `scripts/setup-labels.sh`
- [X] T007 Add `.gitignore` entries for `src/config.js` and `.env`, and add `node_modules/` entry in `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by all user stories — MUST complete before any story work

**⚠️ CRITICAL**: All user story phases depend on this phase being complete

- [X] T008 Implement `src/utils/url.js` — `getUrlParams()`, `setUrlParams(params)`, `buildCanonicalUrl(postId, disputeId)` helpers using `URLSearchParams`
- [X] T009 [P] Implement `src/utils/icons.js` — exported SVG/unicode icon constants: `ICON_ASSERTION` (`!`), `ICON_CHALLENGE` (`?`), `ICON_ANSWER` (`✓`), `ICON_SCALES`, `ICON_COPY`, `ICON_BACK`, `ICON_HOME`
- [X] T010 [P] Implement `src/utils/audio.js` — `playCricketsChirp()` using Web Audio API oscillator chain (4-5 kHz alternating tones) in `src/utils/audio.js`
- [X] T011 Implement `src/api/cache.js` — `localStorage` ETag cache: `get(url)`, `set(url, etag, data)`, `invalidate(url)`, `invalidatePattern(prefix)` in `src/api/cache.js`
- [X] T012 Implement `src/api/github-client.js` — authenticated/unauthenticated `GET` (with ETag conditional), `POST`, `PATCH` wrappers; `buildBody(meta, content)` helper; `parseBody(issueBody)` that extracts `BD:META` JSON block in `src/api/github-client.js`
- [X] T013 Implement `src/api/device-auth.js` — full GitHub Device Flow: `startDeviceFlow()`, `pollForToken()`, `getStoredToken()`, `clearToken()`, `getAuthenticatedUser()` in `src/api/device-auth.js`
- [X] T014 [P] Implement `src/model/person.js` — `Person` class with `id`, `name`, `avatarUrl`, `isStrawman`; `STRAWMAN` constant; `fromGitHubUser(apiObj)` factory in `src/model/person.js`
- [X] T015 [P] Implement `src/model/post.js` — `Post` base class + `Assertion`, `Challenge`, `Answer` subclasses with all fields from data-model.md; `fromIssue(apiObj)` factories in `src/model/post.js`
- [X] T016 [P] Implement `src/model/dispute.js` — `Dispute` class with all fields + `currentTurnPersonId` derivation logic + `status` derivation from labels; `fromIssue(apiObj)` factory in `src/model/dispute.js`
- [X] T017 [P] Implement `src/model/agreement.js` — `Agreement` class; `CricketsConditions` class; `CricketsEvent` class with all fields from data-model.md; `fromIssue(apiObj)` factories in `src/model/agreement.js`
- [X] T018 Implement `src/view/components/header.js` — `renderHeader(version)` function producing the header bar (scales icon, "Better Dispute" title, version on far-right) with `data-action="home"` navigation in `src/view/components/header.js`
- [X] T019 [P] Implement `src/view/components/notification.js` — `showNotification(message, type)` toast component (slide-in, auto-dismiss after 4 s) in `src/view/components/notification.js`
- [X] T020 Implement `src/app.js` — bootstrap: load config, init auth state, read URL params, instantiate controllers, render initial view, register `popstate` listener in `src/app.js`

**Checkpoint**: Foundation complete — all models, API client, cache, auth, URL routing, and shell render. User story phases can begin.

---

## Phase 3: User Story 1 — View and Start Assertions (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can view the Home assertion feed and compose/submit a new Assertion (text or image). @strawman posting and canonical URL copy also covered.

**Independent Test**: Open the app, sign in via Device Flow, type an assertion in the composer, submit it, and see a new card appear at the top of the Home feed. Copy its URL and open in a new tab to confirm deep-link renders the card.

- [X] T021 [US1] Implement `src/controller/home-controller.js` — `loadFeed(page)`, `canCompose(person)`, `canPostAsStrawman(person)`, `submitAssertion(person, text, imageUrl, asStrawman)` with `cache.js` ETag integration in `src/controller/home-controller.js`
- [X] T022 [P] [US1] Implement `src/view/components/post-card.js` — `renderPostCard(post, controller, currentUser)` producing a card with type icon, text/image, copy-URL button, disabled-state logic read from controller; "Your turn" badge slot in `src/view/components/post-card.js`
- [X] T023 [P] [US1] Implement `src/view/components/composer.js` — `renderComposer({ placeholder, onSubmit, onCancel, extras })` slide-up inline panel preserving draft text on cancel, image upload input, @strawman toggle slot in `src/view/components/composer.js`
- [X] T024 [US1] Implement `src/view/home-view.js` — `renderHomeView(controller, currentUser)`: renders feed of assertion summary cards (click-anywhere-to-open), "Start a fire 🔥" composer trigger, @strawman toggle, IntersectionObserver pre-fetch hook in `src/view/home-view.js`
- [X] T025 [US1] Wire copy-to-clipboard in `post-card.js`: on copy button click call `navigator.clipboard.writeText(buildCanonicalUrl(...))` and show a brief "Copied!" notification in `src/view/components/post-card.js`
- [X] T026 [US1] Implement terminal card visual state in `home-view.js`: apply `.card--terminal` CSS class (dimmed, `pointer-events: none`) to cards with zero challenges; no text label in `src/view/home-view.js` and `styles/main.css`
- [X] T027 [US1] Add stacked card depth CSS: `.card--depth-1`, `.card--depth-2` with `box-shadow` offset using `--shadow-stack-1` / `--shadow-stack-2` tokens in `styles/main.css`

**Checkpoint**: Home feed renders, users can sign in, compose an Assertion, copy its URL, and deep-link to it. US1 fully independently testable.

---

## Phase 4: User Story 2 — Challenge a Post (Priority: P1)

**Goal**: Any eligible authenticated user can challenge any Post they didn't author (and haven't already challenged), creating a Dispute.

**Independent Test**: Sign in as Person B, view Person A's assertion, tap the Challenge icon, compose an Interrogatory challenge, submit, confirm a Dispute Issue is created in the data repo and Person A sees a "You were challenged" badge.

- [X] T028 [US2] Implement `canChallenge(person, post)` gate in `src/controller/home-controller.js`: check authorship, existing challenge, existing agreement; return `{ allowed: bool, reason: string }` in `src/controller/home-controller.js`
- [X] T029 [US2] Implement `submitChallenge(person, post, { challengeType, text })` in `home-controller.js`: write Challenge Issue → write Dispute Issue via `github-client.js`; invalidate feed cache in `src/controller/home-controller.js`
- [X] T030 [US2] Add Challenge icon button to `post-card.js`: rendered always, disabled when `!canChallenge(...)`, opens composer on click; icon = `?` in `src/view/components/post-card.js`
- [X] T031 [US2] Extend `composer.js` for Challenge mode: add Interrogatory / Objection type selector radio buttons in `src/view/components/composer.js`
- [X] T032 [US2] Implement "Your turn" badge in `post-card.js` and Home feed: yellow badge shown when `currentUser` is the `defenderId` of an active Dispute linked to this card in `src/view/components/post-card.js`
- [X] T033 [US2] Implement notification trigger in `home-controller.js` + `home-view.js`: on feed load, detect Disputes where `currentUser === defenderId` and `status === 'active'`; call `showNotification("You were challenged")` in `src/controller/home-controller.js`

**Checkpoint**: Challenges can be submitted, Disputes created, "Your turn" badges appear. US2 independently testable on top of US1.

---

## Phase 5: User Story 3 — Answer and Counter-Challenge (Priority: P1)

**Goal**: The challenged person can answer an Interrogatory (with Yes/No + optional text) or an Objection (text only), and optionally include a counter-challenge that triggers the two-lane Dispute View.

**Independent Test**: Sign in as Person A (defender), open the Dispute View, answer Person B's Interrogatory with "Yes" plus a counter-challenge. Verify the view splits into two lanes. Verify Person B's turn indicator appears.

- [X] T034 [US3] Implement `src/controller/dispute-controller.js` skeleton: constructor, `loadDispute(disputeId)`, `loadPostTree(rootId)` using `github-client.js` + cache in `src/controller/dispute-controller.js`
- [X] T035 [US3] Implement `canAnswer(person, challenge)` in `dispute-controller.js`: must be current turn, challenge must be unanswered in `src/controller/dispute-controller.js`
- [X] T036 [US3] Implement `canCounterChallenge(person, answer)` in `dispute-controller.js`: person is answerer AND counter-challenge slot is empty in `src/controller/dispute-controller.js`
- [X] T037 [US3] Implement `submitAnswer(person, challenge, { yesNo, text, counterChallenge })` in `dispute-controller.js`: write Answer Issue; if `counterChallenge` present write Challenge Issue with `counterChallengeId` ref; update turn; invalidate dispute cache in `src/controller/dispute-controller.js`
- [X] T038 [US3] Implement `src/view/dispute-view.js` — single-lane layout: lineage header (parent chain with `→` separators), chronological Post cards, "Your turn" indicator, back button in `src/view/dispute-view.js`
- [X] T039 [US3] Implement two-lane layout switch in `dispute-view.js`: when `dispute.hasCounterChallenge === true`, render challenges in left lane and counter-challenges in right lane, interleaved by `createdAt` in `src/view/dispute-view.js`
- [X] T040 [US3] Extend `composer.js` for Answer mode: Yes/No radio buttons (Interrogatory only), free-text field, optional counter-challenge sub-section (collapsed by default) in `src/view/components/composer.js`
- [X] T041 [US3] Add Answer icon button (✓) to Post cards in Dispute View: disabled when `!canAnswer(...)`; opens Answer composer on click in `src/view/components/post-card.js`
- [X] T042 [US3] Wire navigation: clicking a Home card sets URL params `?view=dispute&id={id}` and renders `dispute-view.js`; back button sets URL to Home in `src/controller/app-controller.js`
- [X] T043 [US3] Create `src/controller/app-controller.js` — top-level router: reads URL params, instantiates correct controller+view, re-renders on `popstate` in `src/controller/app-controller.js`
- [X] T044 [US3] Highlight latest actionable Post in Dispute View: apply `.card--latest-action` CSS class with accent border to the most recent unanswered challenge in `src/view/dispute-view.js` and `styles/main.css`

**Checkpoint**: Full answer-challenge loop works. Two-lane duel view operational. US3 independently testable.

---

## Phase 6: User Story 4 — Resolution: Offers and Crickets (Priority: P2)

**Goal**: Either party can submit a resolution Offer. Both can negotiate Crickets conditions. Deadline expiry triggers a prominent Crickets event with audio.

**Independent Test**: Two users agree on a 10-minute Crickets countdown, one party doesn't answer, wait for deadline; verify Crickets event Issue is written in the data repo and the UI shows the visual+audio cue. Separately: both parties accept an Offer and the Dispute shows as resolved.

- [X] T045 [US4] Implement `canOffer(person, dispute)` and `submitOffer(person, dispute, { text, imageUrl })` in `dispute-controller.js` in `src/controller/dispute-controller.js`
- [X] T046 [US4] Implement `canAcceptOffer(person, offer)` and `acceptOffer(person, offer)` in `dispute-controller.js`; resolve Dispute by updating labels via PATCH in `src/controller/dispute-controller.js`
- [X] T047 [US4] Add Offer UI to Dispute View: "Make offer" button in dispute action bar, opens composer pre-labelled as Offer; accepted offers shown with distinct styling in `src/view/dispute-view.js`
- [X] T048 [US4] Implement `canProposeCrickets(person, dispute)` and `submitCricketsProposal(person, dispute, durationMs)` in `dispute-controller.js` in `src/controller/dispute-controller.js`
- [X] T049 [US4] Implement Crickets negotiation UI in `dispute-view.js`: proposal card with duration, accept/counter buttons; counter opens a duration-picker composer in `src/view/dispute-view.js`
- [X] T050 [US4] Implement `canDeclareCrickets(dispute)` in `dispute-controller.js`: `cricketsConditions.active && Date.now() > deadline && !cricketsEventExists` in `src/controller/dispute-controller.js`
- [X] T051 [US4] Implement `triggerCricketsEvent(dispute, challenge)` in `dispute-controller.js`: write `bd:crickets-event` Issue; de-duplicate by earliest `created_at` in `src/controller/dispute-controller.js`
- [X] T052 [US4] Implement Crickets event display in `dispute-view.js`: fullwidth 🦗 banner, red/orange accent, call `playCricketsChirp()` on render in `src/view/dispute-view.js`
- [X] T053 [US4] Implement Crickets event detection on Dispute View load: call `canDeclareCrickets()` after loading dispute; if true call `triggerCricketsEvent()` in `src/view/dispute-view.js`
- [X] T054 [US4] Implement `canDisputeCrickets(person, cricketsEvent)` and `disputeCricketsEvent(person, cricketsEvent)` in `dispute-controller.js`; creates a new Dispute seeded on the CricketsEvent in `src/controller/dispute-controller.js`
- [X] T055 [US4] Show resolved Dispute state in both Dispute View and Home card: `.card--resolved` CSS class (muted palette, `pointer-events: none`), resolved offer highlighted in `src/view/dispute-view.js`, `src/view/home-view.js`, and `styles/main.css`

**Checkpoint**: Offer resolution and Crickets countdown both functional. US4 testable independently from US5/US6.

---

## Phase 7: User Story 5 — Agree With an Assertion (Priority: P2)

**Goal**: A Person can agree with an Assertion, making them eligible to answer challenges to it and creating a new Dispute against the challenger.

**Independent Test**: Person C clicks Agree on @strawman's Assertion, a `bd:agreement` Issue is written, Person C subsequently sees the Answer action available when a new challenge arrives on that Assertion.

- [X] T056 [US5] Implement `canAgree(person, assertion)` in `home-controller.js`: authenticated, not author, no existing agreement, has not challenged this assertion in `src/controller/home-controller.js`
- [X] T057 [US5] Implement `submitAgreement(person, assertion)` in `home-controller.js`: write `bd:agreement` Issue; cache-invalidate assertion in `src/controller/home-controller.js`
- [X] T058 [US5] Add Agree button/icon to `post-card.js` for Assertion cards: disabled when `!canAgree(...)`; show agre-er count badge in `src/view/components/post-card.js`
- [X] T059 [US5] Update `canAnswer` gate in `dispute-controller.js`: also allow person if they have an Agreement on the root Assertion of the dispute in `src/controller/dispute-controller.js`
- [X] T060 [US5] When an agre-er submits an Answer to a challenge on an agreed Assertion, create a new separate `bd:dispute` Issue for that pair (`agre-er` as defender vs the challenger) in `src/controller/dispute-controller.js`

**Checkpoint**: Agreement mechanic complete. Agre-ers can co-defend. US5 testable.

---

## Phase 8: User Story 6 — Notifications and URL Navigation (Priority: P3)

**Goal**: Users see "You were challenged" and "Your answer was challenged" notifications. Every Post and Dispute has a shareable canonical URL that deep-links directly into the correct view.

**Independent Test**: Copy a Dispute URL, open it in a new browser tab with no prior navigation — the app must render the Dispute View for that dispute without going through Home. Load the app as Person A who has pending challenges — notifications appear.

- [X] T061 [US6] Implement full deep-link routing in `app-controller.js`: on `DOMContentLoaded` parse URL params; `?view=dispute&id=X` → render Dispute View; `?post=Y` → render Home scrolled-to card Y; no params → render Home in `src/controller/app-controller.js`
- [X] T062 [US6] Implement notification scan in `home-controller.js` and `dispute-controller.js`: on load, query all active Disputes where `currentUser` is `defenderId`; fire "You were challenged" or "Your answer was challenged" notifications via `showNotification()` in `src/controller/home-controller.js` and `src/controller/dispute-controller.js`
- [X] T063 [US6] Ensure URL params update on every navigation (Home → Dispute, Dispute → Home, back button) via `setUrlParams()` and `history.pushState` in `src/controller/app-controller.js`
- [X] T064 [US6] Implement `popstate` listener in `app-controller.js`: re-read URL params and re-render correct view on browser back/forward in `src/controller/app-controller.js`
- [X] T065 [US6] Verify copy-URL button on every Post card produces URLs that resolve correctly end-to-end (canonical URL → correct view on fresh load) in `src/view/components/post-card.js`

**Checkpoint**: All 6 user stories functional. App fully URL-driven and navigable.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance hardening, accessibility, edge-case error handling, and final UI polish across all stories

- [X] T066 [P] Implement `IntersectionObserver`-based viewport pre-fetch in `home-view.js`: when a card enters the viewport, pre-fetch its Dispute detail if `disputeId` is set (uses ETag cache so no quota cost after first fetch) in `src/view/home-view.js`
- [X] T067 [P] Add ARIA roles and labels to all interactive components: `role="button"` + `aria-disabled` for disabled controls, `aria-live` region for notifications, landmark roles for header/main in `src/view/components/`
- [X] T068 [P] Add error boundary to all GitHub API calls in `github-client.js`: on network error or 4xx/5xx, reject with a typed `ApiError`; callers show `showNotification("Something went wrong — try again")` and roll back optimistic UI in `src/api/github-client.js`
- [X] T069 [P] Prevent double-submission: disable submit button immediately on first click in `composer.js`; re-enable on API error in `src/view/components/composer.js`
- [X] T070 [P] Add image file size validation in `composer.js`: reject files >10 MB before upload attempt; show inline error without clearing form in `src/view/components/composer.js`
- [X] T071 Add unit tests for all `can*` permission gates in `tests/unit/controller/home-controller.test.js` and `tests/unit/controller/dispute-controller.test.js` to meet ≥80% module coverage gate
- [X] T072 Add unit tests for `src/model/` entities (`Person`, `Post`, `Dispute`, `Agreement`, `CricketsConditions`) in `tests/unit/model/`
- [X] T073 Add integration tests for `github-client.js` using `fetch` mock in `tests/integration/github-client.test.js`
- [X] T074 Add integration tests for `cache.js` ETag flow in `tests/integration/cache.test.js`
- [X] T075 Run `npx c8 check-coverage --lines 85 --functions 85 --branches 80` and fix any gaps
- [X] T076 Final CSS pass: verify `--color-disabled` on all disabled controls, terminal card dimming, resolved card muting, two-lane layout on narrow viewport, stacked shadow depth on all card variants in `styles/main.css`
- [X] T077 Run quickstart.md validation: fresh clone → setup labels script → local HTTP server → Device Flow sign-in → compose assertion → challenge it → answer it; document any corrections in `specs/001-better-dispute-app/quickstart.md`
- [ ] T092 [P] Implement structured in-browser logging and an enhanced page-render error panel:
  - **Logger** (`src/utils/logger.js`): singleton with `log(level, context, message, data)` — levels `debug|info|warn|error`; appends timestamped entries to an in-memory circular buffer (last 200 entries); mirrors to `console` at matching level; exposed on `window.__bdLogger` for DevTools access.
  - **Error panel** (`src/view/components/error-panel.js`): `showErrorPanel(error, context)` replaces the current `<main>` content on unrecoverable render failures; displays: human-readable summary, full stack trace in a scrollable `<pre>`, structured log dump (all buffered entries as JSON), copy-to-clipboard button for the complete debug bundle (error + stack + logs + `navigator.userAgent` + `window.location.href` + timestamp), and a "Retry" button that calls `window.location.reload()`.
  - Wire into `src/app.js`: wrap top-level bootstrap in `try/catch`; on catch call `logger.error('app', 'Bootstrap failed', err)` then `showErrorPanel(err, 'app bootstrap')`.
  - Wire into `src/controller/app-controller.js`: wrap each `render*` call in `try/catch`; on catch call `logger.error('router', 'Render failed', err)` then `showErrorPanel(err, 'view render')`.
  - **Interactive debugging**: clicking any log entry row in the panel expands it to show the full `data` payload as pretty-printed JSON; a "Filter by level" dropdown (debug/info/warn/error) filters the visible log entries in-panel without clearing them.
  - CSS in `styles/main.css`: error panel uses `--color-error` background tint, monospace stack trace block, log-level colour chips (`debug`=muted, `info`=blue, `warn`=amber, `error`=red), smooth expand/collapse transition on log entry detail.

---

## Phase 10: Social Sharing — OG Preview via Cloudflare Worker

**Goal**: Shareable `?post=42` and `?view=dispute&id=X` URLs produce rich social previews (title + description) when shared on Twitter/X, iMessage, Slack etc.

**Approach**: A Cloudflare Worker sits in front of GitHub Pages, intercepts requests with BD query params, fetches the GitHub Issue title/body, injects `<meta og:*>` tags into the proxied HTML, and returns it. The SPA and all client code are unchanged.

- [ ] T078 Create `worker/index.js` — Cloudflare Worker that proxies GitHub Pages, injects dynamic `og:title`, `og:description`, `og:url` for `?post=N` and `?view=dispute&id=N` requests by fetching the corresponding GitHub Issue; falls back to generic app tags for unparameterised requests in `worker/index.js`
- [ ] T079 Create `worker/wrangler.toml` — Wrangler config for the worker (account_id placeholder, route pattern, compatibility_date) in `worker/wrangler.toml`
- [ ] T080 Store `GITHUB_TOKEN` as a Cloudflare Worker secret via `wrangler secret put GITHUB_TOKEN` so the worker can fetch private Issue data without exposing credentials in source; document in `worker/wrangler.toml` and `specs/001-better-dispute-app/quickstart.md`
- [ ] T081 Update `specs/001-better-dispute-app/quickstart.md` — add "Social previews" section: install Wrangler, set `GITHUB_TOKEN` secret, deploy worker, point DNS/route at it in `specs/001-better-dispute-app/quickstart.md`

---

## Phase 12: Multi-Repo Environment Strategy (DEV → STG → PRD)

**Goal**: Separate GitHub data repos for development, staging, and production so testing never pollutes live data. Promotion flows through PRs: feature branch → DEV → STG → PRD.

**Approach**: `CONFIG.dataRepo` drives which GitHub repo the app reads/writes Issues to. Three named config profiles are loaded at build/deploy time. A `gh` CLI–based promotion script opens a PR from the current environment's branch to the next.

- [ ] T093 Add `dataRepoStg` and `dataRepoPrd` fields to the `CONFIG` shape in `src/config.sample.js`; document the three-repo model (DEV = `<owner>/bd-data-dev`, STG = `<owner>/bd-data-stg`, PRD = `<owner>/bd-data-prd`) with placeholder values in `src/config.sample.js`
- [ ] T094 [P] Create `scripts/promote.sh` — interactive bash script that accepts `--from dev|stg` and `--title <PR title>`; uses `gh pr create` to open a PR from the source env branch (`dev`→`stg` or `stg`→`prd`) in the correct data repo; prints the PR URL on success in `scripts/promote.sh`
- [ ] T095 [P] Create `scripts/setup-env.sh` — bash script that accepts `--env dev|stg|prd`; calls `scripts/setup-labels.sh` against the correct repo (pass repo via `-R <owner>/<repo>`); ensures all three data repos have the full `bd:*` label set in `scripts/setup-env.sh`
- [ ] T096 Update `src/config.js` (and `src/config.sample.js`) to select the active `dataRepo` based on a `CONFIG.env` field (`"dev"|"stg"|"prd"`): `dev` reads `dataRepoDev`, `stg` reads `dataRepoStg`, `prd` reads `dataRepoPrd`; `github-client.js` references only `CONFIG.dataRepo` (no changes needed there) in `src/config.js` and `src/config.sample.js`
- [ ] T097 Update `specs/001-better-dispute-app/quickstart.md` — add "Environment setup" section: create the three GitHub data repos, run `scripts/setup-env.sh` for each, configure `src/config.js` with all three repo names, use `scripts/promote.sh` to promote changes, and guidance on deploying each env to a separate GitHub Pages branch (`gh-pages-dev`, `gh-pages-stg`, `gh-pages`) in `specs/001-better-dispute-app/quickstart.md`

---

## Phase 11: Dispute Moments

**Goal**: Any authenticated user can annotate any Post (or contiguous range of Posts) with a one-liner Moment. Moments thread into scrollable one-liner replies. All Moments for a dispute are shown in a collapsible third lane on the right of the Dispute View.

**Storage**: New `bd:moment` Issue type. Fields: `disputeId`, `anchorPostId` (single post) or `anchorStartId`+`anchorEndId` (range), `parentMomentId` (null for root, set for reply), `text` (≤280 chars). Label: `bd:moment`.

- [ ] T082 Add `"moment"` to the BD:META type enum and define its schema (fields above) in `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T083 Add `bd:moment` label to `scripts/setup-labels.sh` in `scripts/setup-labels.sh`
- [ ] T084 Implement `src/model/moment.js` — `Moment` class with all fields; `fromIssue()` factory in `src/model/moment.js`
- [ ] T085 [P] Implement `canAddMoment(person, dispute)` and `submitMoment(person, dispute, { anchorPostId, anchorStartId, anchorEndId, parentMomentId, text })` in `src/controller/dispute-controller.js`
- [ ] T086 [P] Implement `loadMoments(disputeId)` in `src/controller/dispute-controller.js`: fetch all `bd:moment` Issues for the dispute, sort into anchor-keyed tree in `src/controller/dispute-controller.js`
- [ ] T087 Implement `src/view/components/moment-lane.js` — `renderMomentLane(moments, postTree, controller, currentUser)`: collapsible third lane, Posts annotated with thread-count badge, clicking badge scrolls lane to that anchor's thread in `src/view/components/moment-lane.js`
- [ ] T088 Implement range-selection in Dispute View: shift-click a second Post card to define an anchor range; highlights the range and opens the Moment composer pre-filled with `anchorStartId`+`anchorEndId` in `src/view/dispute-view.js`
- [ ] T089 Extend `composer.js` for Moment mode: single-line input, 280-char counter, no image, submit on Enter in `src/view/components/composer.js`
- [ ] T090 Wire moment lane into `dispute-view.js`: load moments alongside post tree, render third lane, add collapse/expand toggle button to dispute action bar, persist collapsed state in `localStorage` in `src/view/dispute-view.js`
- [ ] T091 Add CSS for third lane, moment cards, anchor highlight, thread-count badge, range-selection highlight, collapse animation in `styles/main.css`
- [ ] T092 Add unit tests for `canAddMoment` gate and `Moment.fromIssue` in `tests/unit/`

---

## Phase 13: Widgets — Embeddable Post Attachments

**Goal**: Posts can carry one or more structured Widget attachments (stored as JSON in the Issue body's `BD:META` block) rendered as rich interactive cards below the post text. The first Widget type is the **Bible Widget**.

**Architecture**: Widget data is serialised into the `widgets: []` array in `BD:META`. Each entry has `{ type, payload }`. The renderer is a registry: `src/view/components/widgets/` holds one file per type; `widget-host.js` dispatches to the correct renderer. The composer gains a "+ Widget" action that opens a widget picker.

### Bible Widget

**Data**: `type: "bible"`, `payload: { ref: "John 3:16", verseIds: ["JHN.3.16"] }` — reference string (display) + canonical verse ID array (lookup key).

**Data source**: [api.esv.org](https://api.esv.org) is not used. All text and data is fetched from the free, public [api.bible](https://scripture.api.bible) (American Bible Society) using the **KJV** Bible ID (`de4e12af7f28f599-02`). No attribution label for the translation is shown in the UI. Original-language data uses the **BHSA** (Hebrew, BibleOL) for OT and **SBLGNT** (Greek, API.Bible free tier) for NT.

- [ ] T098 Define `widgets` array in `BD:META` schema: `[{ type: string, payload: object }]`; document `"bible"` payload shape (`ref`, `verseIds`) in `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T099 [P] Create `src/api/bible-client.js` — thin wrapper around api.bible REST API (API key from `CONFIG.biblApiKey`); methods: `getPassage(verseIds)` → `{ html, verses[] }`; `search(query)` → `{ results[] }`; `getBooks()` → book list; `getChapter(bookId, chapter)` → verse list; responses cached via `cache.js` (long TTL, no ETag needed); errors surfaced as typed `ApiError` in `src/api/bible-client.js`
- [ ] T100 [P] Add `bibleApiKey` field to `CONFIG` shape in `src/config.sample.js` and `src/config.js` in `src/config.sample.js`
- [ ] T101 Implement `src/view/components/widgets/widget-host.js` — `renderWidget(widgetData)` registry dispatcher; gracefully renders an "Unknown widget" placeholder for unrecognised types in `src/view/components/widgets/widget-host.js`
- [ ] T102 Implement `src/view/components/widgets/bible-widget.js` — `renderBibleWidget(payload)`: collapsed pill showing reference (e.g. "John 3:16 ▾"); on expand shows the passage text with each verse individually numbered; "View in context" link opens the in-panel Bible reader in `src/view/components/widgets/bible-widget.js`
- [ ] T103 Implement `src/view/components/bible-reader.js` — slide-over panel (does not navigate away); tabs: **Passage** (formatted HTML from api.bible), **Context** (full chapter with current verses highlighted), **Original** (interlinear Hebrew/Greek fetched from api.bible BHSA/SBLGNT Bible IDs, word-by-word with transliteration and gloss on hover), **Cross-refs** (related passage list from api.bible `/passages/{id}/fums`); loading skeleton while fetching in `src/view/components/bible-reader.js`
- [ ] T104 [P] Implement `src/view/components/bible-search.js` — search input with debounced api.bible `search()` call; results list shows reference + snippet; clicking a result opens the Bible reader at that passage in `src/view/components/bible-search.js`
- [ ] T105 [P] Implement `src/view/components/bible-navigator.js` — book → chapter → verse drill-down picker using `getBooks()` + `getChapter()`; shows full chapter text with selectable verse checkboxes; "Attach selected" commits the selection as a widget payload in `src/view/components/bible-navigator.js`
- [ ] T106 Add "+ Widget" button to `composer.js`: opens a widget-picker modal (initially just "Bible" option); selecting "Bible" opens `bible-navigator.js` in picker mode; confirmed selection appends a widget chip to the draft and serialises into `widgets[]` on submit in `src/view/components/composer.js`
- [ ] T107 Wire `widget-host.js` into `post-card.js`: after rendering post text, iterate `post.widgets` and append each rendered widget in `src/view/components/post-card.js`
- [ ] T108 Extend `Post.fromIssue()` and `BD:META` serialisation in `github-client.js` `buildBody()` / `parseBody()` to round-trip the `widgets` array in `src/model/post.js` and `src/api/github-client.js`
- [ ] T109 Add CSS: bible widget pill, expanded passage block (line-height 1.8, generous padding), verse number superscripts, interlinear word rows (original script top, transliteration middle, gloss bottom in muted colour), highlighted context verses, slide-over panel animation, Bible reader tab bar in `styles/main.css`
- [ ] T110 Add unit tests for `bible-client.js` fetch/cache paths (fetch mock) and `Post.fromIssue` widget round-trip in `tests/unit/` and `tests/integration/`

---

## Phase 14: Image and Web Citation Widgets (Migrate Images into Widget Model)

**Goal**: Remove the first-class image upload field from the composer and replace it with two new widget types — `"image"` and `"web-citation"` — so all rich attachments flow through the unified widget system. The strawman composer uses Web Citation as its primary attachment method.

**Migration note**: T022–T023 and T070 added image upload directly to `composer.js` and `post-card.js`. These tasks supersede that implementation; the raw image input field is removed and its functionality is reborn as the Image widget.

### Image Widget

**Data**: `type: "image"`, `payload: { url: string, alt: string, caption?: string }` — URL is a GitHub-hosted image URL obtained by uploading to the Issue via the GitHub REST API (`POST /repos/{owner}/{repo}/issues/{issue_number}/comments` with a multipart body, then extracting the uploaded URL from the markdown response).

- [ ] T111 Remove the raw image file input from `composer.js`; remove image-URL prop from `submitAssertion` / `submitAnswer` signatures in `src/view/components/composer.js`, `src/controller/home-controller.js`, `src/controller/dispute-controller.js`
- [ ] T112 [P] Implement `src/view/components/widgets/image-widget.js` — `renderImageWidget(payload)`: renders `<figure>` with `<img>` (lazy-loaded, max-height capped), optional `<figcaption>`; clicking opens a lightbox overlay in `src/view/components/widgets/image-widget.js`
- [ ] T113 [P] Add `"image"` to the widget picker in `composer.js`: opens a file chooser (≤10 MB validation re-using T070 logic); on confirm, uploads to GitHub via `github-client.js` `uploadImage(file)` helper and stores the returned URL as the widget payload in `src/view/components/composer.js` and `src/api/github-client.js`
- [ ] T114 Register `"image"` type in `widget-host.js` in `src/view/components/widgets/widget-host.js`

### Web Citation Widget

**Data**: `type: "web-citation"`, `payload: { url: string, title: string, description: string, siteName: string, fetchedAt: string }` — metadata fetched at compose time via a CORS-safe proxy (use `https://corsproxy.io/?` prefix); extracted from Open Graph / `<title>` / `<meta name="description">` tags.

- [ ] T115 [P] Create `src/api/citation-client.js` — `fetchCitation(url)`: fetches HTML through `corsproxy.io`, parses `og:title`, `og:description`, `og:site_name` (fallback to `<title>` / `<meta name="description">` / hostname), returns the payload object; errors surface as typed `ApiError` in `src/api/citation-client.js`
- [ ] T116 [P] Implement `src/view/components/widgets/web-citation-widget.js` — `renderWebCitationWidget(payload)`: card with site favicon (`https://www.google.com/s2/favicons?domain=`), site name, bold title (hyperlinked), one-line description, muted domain + fetch date footer; opens URL in new tab in `src/view/components/widgets/web-citation-widget.js`
- [ ] T117 Add `"web-citation"` to the widget picker in `composer.js`: URL input → live preview card updates as user types (debounced `fetchCitation` call) → "Attach" commits the payload in `src/view/components/composer.js`
- [ ] T118 Register `"web-citation"` type in `widget-host.js` in `src/view/components/widgets/widget-host.js`
- [ ] T119 Update `schemas/github-issues-schema.md` — add `"image"` and `"web-citation"` payload shapes to the `widgets[]` enum in `specs/001-better-dispute-app/contracts/github-issues-schema.md`
- [ ] T120 For the strawman composer context specifically: default the widget picker to open on `"web-citation"` rather than the type selection screen (strawman posts represent a position in the world and citations are their natural attachment); no code-path change needed beyond passing `defaultWidget: "web-citation"` option to `renderComposer()` in `src/view/components/composer.js`
- [ ] T121 Add CSS: image widget figure/lightbox overlay, web citation card layout (favicon + site-name row, title, description, footer), live-preview skeleton while `fetchCitation` is in-flight in `styles/main.css`
- [ ] T122 Add unit tests: `citation-client.js` OG parsing (mock fetch responses), `image-widget` and `web-citation-widget` render output, widget round-trip through `Post.fromIssue` in `tests/unit/` and `tests/integration/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Requires Phase 2 — independent of all other stories ✅
- **US2 (Phase 4)**: Requires Phase 2 + US1 card/composer components ready ✅
- **US3 (Phase 5)**: Requires Phase 2 + US2 (challenge must exist to answer) ✅
- **US4 (Phase 6)**: Requires Phase 2 + US3 (dispute must be active) ✅
- **US5 (Phase 7)**: Requires Phase 2 + US1 (assertion cards) — **independent of US2–US4** ✅
- **US6 (Phase 8)**: Requires Phase 2 — URL routing overlaps US1–US5 but can be completed independently ✅
- **Polish (Phase 9)**: Requires all desired user stories complete

### User Story Dependencies

| Story | Depends on | Can run in parallel with |
|-------|-----------|--------------------------|
| US1 | Phase 2 | US5, US6 (partially) |
| US2 | Phase 2 + US1 components | US5 |
| US3 | Phase 2 + US2 | US5 |
| US4 | Phase 2 + US3 | US5 |
| US5 | Phase 2 + US1 | US2, US3, US4 |
| US6 | Phase 2 | US1 (start URL routing alongside) |

### Parallel Opportunities Per Story

**US1** (Phase 3):
```
T021 (controller) ──────────────────────────────► T024 (home-view)
T022 (post-card) ────────────────────────────────► T024
T023 (composer) ─────────────────────────────────► T024
                                                    T025, T026, T027 in parallel
```

**US2** (Phase 4):
```
T028 (canChallenge gate) ─► T029 (submitChallenge) ─► T032, T033
T030 (challenge button) ──► parallel with T031 (composer extension)
```

**US3** (Phase 5):
```
T034 ─► T035, T036 (gates, parallel) ─► T037 (submitAnswer)
T038 (dispute-view single-lane) ─► T039 (two-lane) parallel with T040 (answer composer)
T041, T042 parallel after T038
T043 (app-controller) parallel with all above
```

---

## Implementation Strategy

**MVP scope**: Phases 1–5 (US1, US2, US3) — delivers a working 1v1 dispute loop from Assertion → Challenge → Answer → Counter-Challenge with deep-link URLs.

**Increment 2**: Phase 6 (US4) — Resolution via Offers + Crickets countdown.

**Increment 3**: Phase 7 (US5) — Agreement and co-defence.

**Increment 4**: Phase 8 (US6) — Polished notifications.

**Increment 5**: Phase 9 — Coverage gates, accessibility, error hardening.

---

## Summary

| Phase | Tasks | Stories | Parallel tasks |
|-------|-------|---------|----------------|
| Phase 1 — Setup | T001–T007 | — | T003–T006 |
| Phase 2 — Foundational | T008–T020 | — | T009, T010, T014–T017 |
| Phase 3 — US1 (P1) 🎯 | T021–T027 | US1 | T022, T023, T026, T027 |
| Phase 4 — US2 (P1) | T028–T033 | US2 | T030, T031 |
| Phase 5 — US3 (P1) | T034–T044 | US3 | T035, T036, T040, T041, T043 |
| Phase 6 — US4 (P2) | T045–T055 | US4 | T048, T049 |
| Phase 7 — US5 (P2) | T056–T060 | US5 | T056, T057, T058 |
| Phase 8 — US6 (P3) | T061–T065 | US6 | T063, T064 |
| Phase 9 — Polish | T066–T077 | all | T066–T070 |
| **Total** | **77 tasks** | | |
