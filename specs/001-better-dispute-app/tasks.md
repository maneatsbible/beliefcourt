# Tasks: judgmental.io

**Format**: `[ ]` not started · `[~]` in progress · `[X]` done  
**Prerequisite reading**: `plan.md`, `spec.md`, `data-model.md`  
**Source structure**: `src/client/` (browser), `src/server/` (Hono/Node), `db/` (migrations + adapter)

---

## Phase 1: Infrastructure Setup

**Goal**: Fly.io app provisioned; Docker image builds and deploys; persistent SQLite volume mounted; Litestream replicates to Tigris S3; `fly.toml`, `Dockerfile`, and `start.sh` in place.

**Independent Test**: `fly deploy` succeeds; `curl https://judgmental.io/health` returns `{"status":"ok","version":"0.1.0"}`; Litestream logs show replication to S3 bucket.

- [ ] T001 Create `fly.toml` — app name `judgmental-io`, `shared-cpu-1x` / 256 MB, `auto_stop_machines = false`, internal port 3000, `/health` TCP check, `[mounts]` section pointing volume `jdg_data` to `/data` per plan.md topology
- [ ] T002 Create `Dockerfile` — `node:22-alpine` base, install `litestream` binary, copy app source + `start.sh`; expose port 3000
- [ ] T003 Create `start.sh` — launches Litestream `replicate` in the background then starts `node src/server/index.js`; aborts if `fly secrets` vars are missing (check `JWT_SECRET` and `DB_PATH` at minimum)
- [ ] T004 Create `litestream.yml` — replicate `/data/jdg.db` to `s3://{{TIGRIS_BUCKET}}/jdg.db` using `TIGRIS_ACCESS_KEY_ID` / `TIGRIS_SECRET_ACCESS_KEY` env vars
- [ ] T005 Create `db/` directory with `db/migrations/` and empty `db/migrate.js` placeholder
- [ ] T006 Create `src/server/` directory; create `src/client/` directory; move appropriate existing source files to `src/client/` (utils, view, model client counterparts)
- [ ] T007 Set Fly secrets via `fly secrets set`: `JWT_SECRET`, `DB_PATH=/data/jdg.db`, `LITESTREAM_*` Tigris credentials, `MAINTENANCE_MODE=false`
- [ ] T008 Confirm `fly deploy` succeeds and `/health` responds; commit `fly.toml`, `Dockerfile`, `start.sh`, `litestream.yml`

**Checkpoint**: Infrastructure live. Persistent volume mounted. Litestream replicating.

---

## Phase 2: Database — Migration 001 (Initial Schema)

**Goal**: SQLite WAL-mode database initialised on first boot with all tables from `plan.md` Migration 001. Append-only triggers prevent UPDATE/DELETE on immutable tables. `db/migrate.js` runs migrations idempotently on startup.

**Independent Test**: Fresh `node src/server/index.js` with empty `/data/jdg.db` → all tables exist; second run → no error, no duplicate tables; `PRAGMA integrity_check` passes.

- [ ] T009 Create `db/migrations/001_initial_schema.sql` — exact SQL from plan.md: tables `persons`, `linked_identities`, `records`, `cases`, `duels`, `turns`, `base_of_truth`, `judgments`, `analyses`, `moments`, `similarity_links`, `dispositions`, `accords`, `claim_accords`, `deadlines`, `evidence`, `exhibits`, `tips`, `schema_migrations`
- [ ] T010 Add append-only triggers to `001_initial_schema.sql` for all immutable tables (`records`, `turns`, `judgments`, `base_of_truth`, `moments`) preventing UPDATE and DELETE
- [ ] T011 Enable WAL mode in `001_initial_schema.sql`: `PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA foreign_keys=ON;`
- [ ] T012 Implement `db/migrate.js` — opens database, creates `schema_migrations` if absent, reads all `*.sql` files from `db/migrations/` in filename order, skips already-applied filenames, executes and records each; exports `runMigrations(db)` function
- [ ] T013 Call `runMigrations(db)` in server startup before any route is registered

**Checkpoint**: DB schema live on boot. Idempotent migrations. Triggers enforcing immutability.
- [X] T015 [P] Implement `src/model/post.js` — `Post` base class + `Assertion`, `Challenge`, `Answer` subclasses with all fields from data-model.md; `fromIssue(apiObj)` factories in `src/model/post.js`
- [X] T016 [P] Implement `src/model/dispute.js` — `Dispute` class with all fields + `currentTurnPersonId` derivation logic + `status` derivation from labels; `fromIssue(apiObj)` factory in `src/model/dispute.js`
- [X] T017 [P] Implement `src/model/agreement.js` — `Agreement` class; `CricketsConditions` class; `CricketsEvent` class with all fields from data-model.md; `fromIssue(apiObj)` factories in `src/model/agreement.js`
- [X] T018 Implement `src/view/components/header.js` — `renderHeader(version)` function producing the header bar (scales icon, `disputable.io` wordmark, version on far-right) with `data-action="home"` navigation in `src/view/components/header.js`
---

## Phase 3: DB Adapter + Hono Server Foundation

**Goal**: Thin DB adapter abstracts SQLite calls (enabling future Postgres swap). Hono server starts on port 3000 with `/health`, `/version`, and global middleware (CORS, rate-limit, maintenance).

**Independent Test**: `curl /health` → 200 `{"status":"ok"}`; `curl /version` → 200 `{"version":"0.1.0","schema":1}`; send >200 req/min from same IP → 429; `MAINTENANCE_MODE=true` → all non-`/health` routes return 503.

- [ ] T014 Create `db/adapter.js` — exports `query(sql, params)`, `run(sql, params)`, `get(sql, params)` wrapping `better-sqlite3`; synchronous API matching `better-sqlite3` but behind an interface that can be swapped for `postgres` later
- [ ] T015 Create `db/sqlite.js` — opens `better-sqlite3` at `process.env.DB_PATH`; enables WAL via pragma; exports the db instance
- [ ] T016 Create `src/server/index.js` — imports Hono, creates app, registers middleware (CORS, rate-limit, maintenance), mounts route modules, starts listening on port 3000
- [ ] T017 Implement global CORS middleware in `src/server/middleware/cors.js`: allow only `https://judgmental.io` and `http://localhost:*` origins; set `Access-Control-Allow-Credentials: true`
- [ ] T018 Implement rate-limit middleware in `src/server/middleware/rate-limit.js`: sliding window 200 req/min per IP using in-memory Map; return `429 Too Many Requests` with `Retry-After` header
- [ ] T019 Implement maintenance middleware in `src/server/middleware/maintenance.js`: if `process.env.MAINTENANCE_MODE === 'true'` return `503` for all routes except `/health` and `/maintenance/submit`
- [ ] T020 Add `GET /health` route: `{"status":"ok"}` 200
- [ ] T021 Add `GET /version` route: `{"version": pkg.version, "schema": <latest migration number>}` 200

**Checkpoint**: Server boots. Middleware enforces CORS, rate-limiting, maintenance mode. Health/version endpoints live.

---

## Phase 4: SM OAuth + JWT Authentication

**Goal**: Users can sign in via X (Twitter), Threads, Bluesky, or GitHub OAuth. Server exchanges code for token server-side, creates/updates `persons` row and `linked_identities`, issues signed JWT (HS256, 24h). Client stores JWT in `localStorage`.

**Independent Test**: Sign in with GitHub OAuth → `persons` row created, JWT returned; re-sign-in → same `person_id`, `linked_identities` upserted; expired JWT → 401; tampered JWT → 401.

- [ ] T022 Create `src/server/auth/jwt.js` — `signJwt(personId)` (HS256, 24h, `process.env.JWT_SECRET`) and `verifyJwt(token)` returning `{ personId }` or throwing; never expose secret
- [ ] T023 Create `src/server/middleware/auth.js` — extracts `Authorization: Bearer <token>` header; calls `verifyJwt`; attaches `c.set('personId', ...)` to context; returns 401 on missing or invalid token
- [ ] T024 Implement GitHub OAuth flow in `src/server/auth/github-oauth.js`: `GET /auth/github` redirects to GitHub; `GET /auth/github/callback` exchanges code, fetches user profile, upserts `persons` + `linked_identities`, issues JWT, redirects to `/?token=<jwt>`
- [ ] T025 Implement X (Twitter) OAuth 2.0 PKCE flow in `src/server/auth/x-oauth.js`: same pattern as GitHub; store PKCE verifier in server-side session (Map keyed by `state`); note high-risk volatility per plan.md
- [ ] T026 Implement Threads OAuth flow in `src/server/auth/threads-oauth.js`: Facebook Login SDK server-side; same upsert pattern
- [ ] T027 Implement Bluesky OAuth flow in `src/server/auth/bluesky-oauth.js`: ATProto OAuth; same upsert pattern
- [ ] T028 Create `src/client/api/auth.js` — `signIn(provider)` redirects to `/auth/<provider>`; `handleCallback()` extracts `?token=` from URL, stores in `localStorage`, removes from URL with `history.replaceState`; `getToken()` reads from `localStorage`; `isAuthenticated()` checks token exists and not expired (decode without verify); `signOut()` clears token
- [ ] T029 Add `GET /auth/me` route (requires auth middleware): returns `{ personId, handle, platform, is_ai, linked_identities[] }` from `persons` join `linked_identities`

**Checkpoint**: All four OAuth providers functional. JWT issued and validated. Client auth helpers working.

---

## Phase 5: Maintenance Mode

**Goal**: Operator flips `MAINTENANCE_MODE=true` → all users see `maintenance.html`; they can submit their email/message to `/maintenance/submit`; operator flips back to restore app.

**Independent Test**: Set `MAINTENANCE_MODE=true` in fly secrets; request any page → get `maintenance.html`; submit a message → `maintenance_submissions` table records it; `/health` still 200.

- [ ] T030 Create `maintenance.html` — standalone self-contained HTML page (no external deps); shows app logo, "We'll be right back" message, optional ETA, and a simple email + message form that POSTs to `/maintenance/submit`
- [ ] T031 Add `POST /maintenance/submit` route (bypasses maintenance middleware): stores `{ email, message, submitted_at }` in a `maintenance_submissions` SQLite table (add to migration 001 or a new migration 002)
- [ ] T032 Update maintenance middleware: when `MAINTENANCE_MODE=true` and request accepts HTML, serve `maintenance.html` with 503; for API requests return JSON `{"error":"maintenance"}` 503
- [ ] T033 Add operator runbook comment in `fly.toml` explaining how to toggle maintenance mode via `fly secrets set MAINTENANCE_MODE=true/false`

**Checkpoint**: Maintenance mode fully functional. Submissions captured. Health endpoint unaffected.

---

## Phase 6: Client Foundation

**Goal**: New `src/client/` structure mirrors the old structure with updated naming. `app.js` bootstraps auth check and routes to correct view. API client wraps fetch with JWT injection. Utility modules ported and updated.

**Independent Test**: `index.html` loads; unauthenticated user sees Home with sign-in prompt; authenticated user sees Home with Claim feed; clicking back/forward works via `popstate`.

- [ ] T034 Update `index.html` — point to `src/client/app.js` as entry; add Plausible analytics script tag; add GA4 script tag (loaded only when `!isAuthenticated()`)
- [ ] T035 Create `src/client/api/client.js` — `apiFetch(path, options)`: injects `Authorization: Bearer <token>` header; on 401 calls `auth.signOut()` and redirects to sign-in; on 503 with `maintenance` body redirects to `/maintenance.html`; typed `ApiError` on 4xx/5xx
- [ ] T036 Port and update `src/client/utils/url.js` — `setUrlParams(params)`, `getUrlParams()`, `buildShareUrl(type, id)`; update param names from `view=dispute` to `view=duel`, `id=caseId`, etc.
- [ ] T037 Port `src/client/utils/audio.js` — keep existing sounds; add `playJudgmentSound()` and `playAccordSound()`
- [ ] T038 Port and update `src/client/utils/icons.js` — update icon set: add `⚖` (Judgment), `⇌` (Offer), `🏛` (Case), `⚔` (Duel), `📎` (Evidence), `🎖` (Badge); remove old dispute-specific icons
- [ ] T039 Port `src/client/utils/logger.js` — keep circular buffer + `window.__jdgLogger`; update context names
- [ ] T040 Create `src/client/app.js` — on `DOMContentLoaded`: init logger; check auth; parse URL params; route to HomeView or DuelView or CaseView; wire `popstate`; wrap in try/catch → `showErrorPanel` on failure
- [ ] T041 Port `src/client/view/components/header.js` — update app name to "judgmental.io"; handle all four SM OAuth provider sign-in buttons; show `@handle` when authenticated
- [ ] T042 Port `src/client/view/components/notification.js` — keep `showNotification(message, type)` API unchanged
- [ ] T043 Port `src/client/view/components/error-panel.js` — keep full debug bundle (stack + logs + UA + URL); update branding
- [ ] T044 Port `src/client/view/components/composer.js` — refactor to support `mode` param: `"claim"`, `"challenge"`, `"answer"`, `"offer"`, `"response"`, `"moment"`; remove direct GitHub API calls; submit to `apiFetch`

**Checkpoint**: Client bootstraps. Auth flow works. All utility modules updated. Composer mode-driven.

---

## Phase 7: Server-Side Models + Routes (Records/Persons)

**Goal**: All entity CRUD goes through Hono routes. Client models are thin wrappers around API responses. `Record`, `Person`, `Case`, `Duel`, `Turn` server models read/write via DB adapter.

**Independent Test**: `POST /api/records` with valid JWT → creates Record row, returns `{id, ...}`; `GET /api/records/:id` → returns record; `GET /api/persons/:id` → returns person with linked identities.

- [ ] T045 Create `src/server/models/person.js` — `createPerson(data)`, `getPersonById(id)`, `getPersonByPlatformId(platform, platformId)`, `upsertPerson(data)` using db adapter
- [ ] T046 Create `src/server/models/record.js` — `createRecord(data)`, `getRecordById(id)`, `getRecordsByCase(caseId)`, `getRecordsByDuel(duelId)` using db adapter
- [ ] T047 Create `src/server/models/case.js` — `createCase(data)`, `getCaseById(id)`, `getCasesByClaimId(claimId)`, `updateCaseStatus(id, status)` using db adapter
- [ ] T048 Create `src/server/models/duel.js` — `createDuel(data)`, `getDuelById(id)`, `getDuelsByCaseId(caseId)`, `updateDuelStatus(id, status)` using db adapter
- [ ] T049 Create `src/server/models/turn.js` — `createTurn(data)`, `getTurnsByDuelId(duelId)`, `getLatestTurn(duelId)` using db adapter
- [ ] T050 Add `GET /api/persons/:id` route with auth middleware
- [ ] T051 Add `GET /api/records/:id` route and `POST /api/records` route with auth middleware; validate body fields at route boundary
- [ ] T052 Create `src/client/model/record.js` — `Record` client class with `fromApi(data)` factory; `attributionLabel` computed property
- [ ] T053 Create `src/client/model/person.js` — `Person` client class with `fromApi(data)` factory; `displayHandle` computed property; `isAi` boolean

**Checkpoint**: Person and Record server models + routes live. Client models wrapping API responses.

---

## Phase 8: Home View — Claim Feed (US1)

**Goal**: Authenticated user sees the Claim feed. Each Claim renders as a card with title, author, strength indicator (scale icon, computed from Case/Duel counts), and action buttons. Unauthenticated user sees the feed with sign-in prompt overlays.

**Independent Test**: Seed database with 3 Claims; load app unauthenticated → see 3 cards with disabled actions; sign in → actions enabled; compose new Claim → appears at top of feed.

- [ ] T054 Add `GET /api/claims` route — returns paginated list of `records` where `record_type='claim'` joined with strength stats (open case count, judgment count); requires no auth (public)
- [ ] T055 Add `POST /api/claims` route with auth middleware — creates Claim record; validates non-empty `body`; returns created record
- [ ] T056 Create `src/server/controllers/home-controller.js` — `canPostClaim(person)`: authenticated; `canChallenge(person, claim)`: authenticated, not own claim; `canAgree(person, claim)`: authenticated, not own claim, not already agreed
- [ ] T057 Create `src/client/controller/home-controller.js` — `loadClaims()`, `submitClaim(body, widgets)`, `computeStrength(claimId)` (ratio of open vs resolved cases); calls `apiFetch`
- [ ] T058 Create `src/client/view/home-view.js` — `renderHome(claims, currentUser)`: renders list of Claim cards; pagination; compose button (disabled when unauthenticated with tooltip "Sign in to post")
- [ ] T059 Update `src/client/view/components/post-card.js` — restructure for Claim cards: title, author handle + platform icon, strength `⚖` indicator, agree-count badge, Challenge button, Agree button; disabled state with "why disabled" tooltips
- [ ] T060 Add ad strip in `home-view.js` rendered only when `!isAuthenticated()` with "Sign in to remove ads" below it
- [ ] T061 Add Plausible custom event `jdg:claim_posted` fired in `home-controller.js` after successful claim submission

**Checkpoint**: Claim feed renders authenticated and unauthenticated. Compose Claim functional. Ads shown to unauthenticated only.

---

## Phase 9: Case + Challenge (US2)

**Goal**: Challenger selects a Claim and opens a Case against it. A Case contains one or more Duels. The first Duel's opening Turn is the Challenge Record.

**Independent Test**: Person A posts Claim; Person B challenges it → `cases` row created, `duels` row created, `turns` row (challenge) created; Person A notified; Claim card shows open case indicator.

- [ ] T062 Add `POST /api/cases` route with auth middleware — creates Case (challenger_id, claim_record_id, status='open'); creates initial Duel; creates opening Turn (type='challenge'); validates challenger is not claim author
- [ ] T063 Add `GET /api/cases/:id` route — returns Case with nested Duels and Turns
- [ ] T064 Add `GET /api/cases` route — returns Cases by `?claim_id=` or `?person_id=`
- [ ] T065 Create `src/client/controller/dispute-controller.js` — handles Cases/Duels; `loadCase(id)`, `submitChallenge(claimId, body, widgets)`, `canChallenge(person, claim)`: auth, not own claim
- [ ] T066 Create `src/client/view/components/case-composer.js` — challenge composer: textarea, widget attachments, submit; disabled when `!canChallenge`
- [ ] T067 Update `home-view.js` to wire Challenge button → open case-composer modal
- [ ] T068 Fire Plausible `jdg:challenge_posted` after successful challenge

**Checkpoint**: Challenge creates Case + Duel + Turn. Case count reflected on Claim card.

---

## Phase 10: Answer + Duel View (US3)

**Goal**: Claim author (and agreers) can Answer the challenge. Duel View shows the two-lane layout (Challenge lane left, Answer lane right). EXAMINING/TESTIFYING role badges shown when a turn is active.

**Independent Test**: Person A answers Person B's challenge → `turns` row (answer) created; Duel View shows two-lane layout with Challenge left, Answer right; EXAMINING badge shows on the party whose turn it is to respond.

- [ ] T069 Add `POST /api/duels/:id/turns` route with auth middleware — creates Turn (type='answer'|'challenge'|'offer'|'response'); validates it is this person's turn; validates correct turn type per current duel state machine
- [ ] T070 Add `GET /api/duels/:id` route — returns Duel with all Turns, participant persons, current status
- [ ] T071 Create server-side duel state machine in `src/server/models/duel.js` — `getValidNextTurnTypes(duel, personId)`: returns allowed turn types based on `turns` sequence and `personId`
- [ ] T072 Create `src/client/view/duel-view.js` — `renderDuelView(duel, currentUser)`: two-lane layout (left = challenger lane, right = defender lane); each Turn rendered as a post card; EXAMINING badge on the party currently being questioned; TESTIFYING badge on the party whose turn it is to respond
- [ ] T073 Add role badge CSS in `styles/main.css`: `.badge--examining` (blue), `.badge--testifying` (amber); role badge anchored to the lane header avatar
- [ ] T074 Add `canAnswer(person, duel)` gate in `src/server/controllers/dispute-controller.js`: authenticated, defender or agre-er, duel is open, last turn was a challenge
- [ ] T075 Wire Answer composer in `duel-view.js`: open composer with `mode="answer"` when `canAnswer`; submit creates Turn via `POST /api/duels/:id/turns`
- [ ] T076 Fire Plausible `jdg:answer_posted` after successful answer

**Checkpoint**: Full challenge→answer loop functional. Two-lane Duel View renders correctly.

---

## Phase 11: Offer / Response / Accord (US4)

**Goal**: Either party can make an Offer (proposal to close the Duel on agreed terms). The other party can Accept or Reject. Accept creates an Accord. Server cron detects expired deadlines and creates Default Accords.

**Independent Test**: Party A makes Offer → `turns` row (offer) + `deadlines` row created; Party B accepts → `accords` row created, Duel status='resolved'; deadline expires with no response → server cron creates Default Accord.

- [ ] T077 Add Offer turn type to state machine: either party may Offer when duel is open and last turn was not also an Offer; creates `deadlines` row with `deadline_at = now + 48h`
- [ ] T078 Add `POST /api/duels/:id/respond-offer` route with auth middleware — accepts `{ accept: boolean }`; if accept=true creates `accords` row and sets duel status='resolved'; if false creates rejection Turn
- [ ] T079 Create `src/server/cron/deadline-checker.js` — runs every 5 minutes via `setInterval` in server process; queries `deadlines` where `deadline_at < now` and `status='open'`; creates Default Accord for each; marks duel resolved
- [ ] T080 Start deadline checker in `src/server/index.js` after routes are mounted
- [ ] T081 Update `duel-view.js`: render Offer turn as a highlighted proposal card with Accept/Reject buttons; render Accord as a fullwidth resolution banner
- [ ] T082 Add `⇌` Offer icon to composer in `mode="offer"`; render accepted Accord with green accent, rejected Offer with muted style
- [ ] T083 Fire Plausible `jdg:offer_made` and `jdg:accord_reached` events

**Checkpoint**: Offer/Response/Accord loop functional. Deadline cron running. Default detection works.

---

## Phase 12: ClaimAccord + BaseOfTruth (US5)

**Goal**: Once all Duels under a Case resolve, the Case itself can resolve into a ClaimAccord. The Claim author may declare a BaseOfTruth synthesising the resolved Cases.

**Independent Test**: All Duels in Case resolve → Case status='resolved'; Claim author clicks "Declare BaseOfTruth" → `base_of_truth` row created; it appears on the Claim card.

- [ ] T084 Add server-side Case resolution logic in `src/server/models/case.js` — `checkAndResolveCase(caseId)`: if all Duels resolved, update Case status='resolved', create `claim_accords` row
- [ ] T085 Call `checkAndResolveCase` after every Accord creation (in the respond-offer route and deadline checker)
- [ ] T086 Add `POST /api/claims/:id/base-of-truth` route with auth middleware — creates `base_of_truth` row; validates author is Claim author; validates at least one resolved Case exists
- [ ] T087 Add `GET /api/claims/:id/base-of-truth` route — returns `base_of_truth` for a claim if it exists
- [ ] T088 Update `post-card.js` — show BaseOfTruth declaration button when authenticated as claim author and case resolved; render BaseOfTruth summary on Claim card
- [ ] T089 Update `duel-view.js` to show Case resolution state and link to ClaimAccord

**Checkpoint**: Full Case lifecycle ends in ClaimAccord. BaseOfTruth declarable by Claim author.

---

## Phase 13: Judgment (US6)

**Goal**: Any authenticated user can write a Judgment on a resolved Duel or Case. A Judgment has an Analysis (reasoning) and optional Moment annotations. Judgments are publicly visible.

**Independent Test**: Person C (not a party) opens a resolved Duel → sees "Write Judgment" button → submits Judgment with Analysis → `judgments` row + `analyses` row created; Judgment visible to all.

- [ ] T090 Add `POST /api/duels/:id/judgments` route with auth middleware — creates `judgments` row + `analyses` row; validates duel is resolved; any authenticated person may judge
- [ ] T091 Add `GET /api/duels/:id/judgments` route — returns all Judgments with Analyses for a Duel
- [ ] T092 Create `src/client/model/judgment.js` — `Judgment` client class with `fromApi(data)` factory
- [ ] T093 Update `duel-view.js` — add Judgment section below the two-lane layout showing all Judgments as cards; "Write Judgment" button opens composer with `mode="judgment"`; submit creates Judgment via API
- [ ] T094 Add `canJudge(person, duel)` gate: authenticated, duel is resolved
- [ ] T095 Fire Plausible `jdg:judgment_written` after successful judgment

**Checkpoint**: Judgment system live. Any authenticated user can judge resolved Duels.

---

## Phase 14: Evidence + Exhibits

**Goal**: Any party may submit Evidence (references, documents, citations) to a Duel. Evidence may be objected to, and an objection opens a nested Case against the Evidence. An Exhibit is a specific piece of Evidence formally admitted by both parties.

**Independent Test**: Party A submits Evidence (URL + description) → `evidence` row created; Party B objects → nested Case created; both parties accept Evidence → `exhibits` row created.

- [ ] T096 Add `POST /api/duels/:id/evidence` route with auth middleware — creates `evidence` row; validates participant
- [ ] T097 Add `POST /api/evidence/:id/object` route with auth middleware — creates nested Case (parent_case_id set to current Case id, subject_record_id = evidence record)
- [ ] T098 Add `POST /api/evidence/:id/admit` route with auth middleware — when both parties have admitted, creates `exhibits` row; validates both sides must agree
- [ ] T099 Create `src/client/view/components/evidence-panel.js` — renders Evidence list for a Duel; Submit Evidence button; Admit/Object buttons; Exhibit indicator (📎 badge on admitted evidence)
- [ ] T100 Wire `evidence-panel.js` into `duel-view.js` as a collapsible section below the Turn lanes

**Checkpoint**: Evidence submission, objection (nested Case), and Exhibit admission all functional.

---

## Phase 15: AI Persona Disclosure

**Goal**: Persons flagged `is_ai=true` show a clearly visible AI disclosure badge on every Record card they author. "Bot-free Duel" flag prevents AI participants. Human-verification check warns when an AI attempts to enter a bot-free Duel.

**Independent Test**: Create person with `is_ai=true`; all their Record cards show AI badge; attempt to join bot-free Duel → 403 with `{"error":"bot_free_duel"}`.

- [ ] T101 Add `is_ai` and `ai_model` columns to `persons` table (already in migration 001); expose on `GET /api/persons/:id`
- [ ] T102 Add AI disclosure badge to `post-card.js`: when `record.person.is_ai` is true, render `[AI]` chip in amber with tooltip showing `ai_model` name
- [ ] T103 Add `bot_free` boolean column to `duels` table (add in migration 002 if not in 001); add `GET /api/duels/:id` to return this field
- [ ] T104 Add server-side gate in turn-creation route: if `duel.bot_free` and `person.is_ai` → 403
- [ ] T105 Update composer to show "Bot-free Duel" toggle when creating a new Case/Duel

**Checkpoint**: AI disclosure fully visible. Bot-free Duels enforced at API layer.

---

## Phase 16: Tipping

**Goal**: Any authenticated user can send a Tip to a Record author. Platform takes 0% fee. Tip goes directly to recipient. Stripe (or Ko-fi deeplink) handles payment processing.

**Independent Test**: Person C clicks Tip on Person A's Record → Stripe checkout session created → on success `tips` row created with `amount_cents`, `tipper_id`, `recipient_id`; Person A's profile shows received tips count.

- [ ] T106 Add `POST /api/tips` route with auth middleware — creates Stripe checkout session (or Ko-fi deeplink redirect); params: `{ record_id, amount_cents }`; validate recipient is not tipping themselves
- [ ] T107 Add `POST /api/tips/webhook` route — receives Stripe `checkout.session.completed` webhook; creates `tips` row; validates Stripe signature via `STRIPE_WEBHOOK_SECRET` env var
- [ ] T108 Add `GET /api/persons/:id/tips` route — returns aggregate tip stats for a person (total received, tip count)
- [ ] T109 Add Tip button to `post-card.js`: `💰` icon; opens amount picker (preset: $1/$3/$5/custom); creates checkout session via API; disabled when viewing own record; disabled when unauthenticated with tooltip "Sign in to tip"
- [ ] T110 Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as Fly secrets; document in plan.md runbook section

**Checkpoint**: Tipping functional. 0% platform fee. Stripe webhook creating `tips` rows.

---

## Phase 17: Analytics

**Goal**: Plausible tracks all navigation as privacy-first pageviews + custom events. GA4 loaded only for unauthenticated users (required for ads programme). Auto-analytics endpoints power knowledge-base queries.

**Independent Test**: Load app unauthenticated → Plausible pageview fires, GA4 fires; sign in → GA4 script not present; call `GET /api/analytics/contested` → returns top contested Claims.

- [ ] T111 Add Plausible script to `index.html`: `<script defer data-domain="judgmental.io" src="https://plausible.io/js/script.js"></script>`
- [ ] T112 Add GA4 script to `index.html` wrapped in `if (!isAuthenticated())` check (evaluated at bootstrap in `app.js`), or loaded dynamically via `app.js`
- [ ] T113 Add `trackEvent(name, props)` helper in `src/client/utils/analytics.js` — calls `window.plausible(name, { props })` if Plausible loaded; no-op otherwise
- [ ] T114 Instrument all Plausible custom events in controllers: `jdg:claim_posted`, `jdg:challenge_posted`, `jdg:answer_posted`, `jdg:offer_made`, `jdg:accord_reached`, `jdg:judgment_written`, `jdg:tip_sent`, `jdg:evidence_submitted`
- [ ] T115 Add `GET /api/analytics/contested` route — returns top 10 Claims by open Case count
- [ ] T116 Add `GET /api/analytics/consensus` route — returns Claims with highest Accord rate (resolved Cases / total Cases)
- [ ] T117 Add `GET /api/analytics/undefeated` route — returns Persons with longest streak of unchallenged Claims
- [ ] T118 Add `GET /api/analytics/challengers` route — returns top 10 most active challengers by Case count

**Checkpoint**: Plausible on all pages. GA4 unauthenticated only. Four auto-analytics endpoints live.

---

## Phase 18: Ads

**Goal**: Ad strip shown to unauthenticated users only. "Sign in to remove ads" CTA below each ad. No ads shown to authenticated users (enforced in client).

**Independent Test**: Unauthenticated → ad strip visible in Home and Duel views; sign in → reload → ad strip gone; ad strip shows "Sign in to remove ads" CTA.

- [ ] T119 Create `src/client/view/components/ad-strip.js` — renders a Google AdSense (or placeholder) ad unit; visible only when `!isAuthenticated()`; renders "Sign in to remove ads" link below unit
- [ ] T120 Wire `ad-strip.js` into `home-view.js` (top of feed) and `duel-view.js` (between lanes and Judgment section) conditionally on auth state
- [ ] T121 Add `styles/main.css` rules for `.ad-strip`: fixed max-height, centered, muted border, "Sign in to remove ads" in `--color-muted` small text

**Checkpoint**: Ads shown unauthenticated only. Constitutional constraint satisfied: judgment is always free.

---

## Phase 19: BibleWidget (First Widget)

**Goal**: BibleWidget is the first implemented Widget type per spec. Posts can attach a Bible passage reference. The widget renders as a collapsed pill; expanded shows the passage text from api.bible (KJV). A Bible Reader slide-over provides full chapter context, original-language interlinear, and cross-references.

**Independent Test**: Compose a Claim with BibleWidget attaching "John 3:16" → `widgets: [{type:"bible", payload:{ref:"John 3:16", verseIds:["JHN.3.16"]}}]` stored in Record; Claim card shows collapsed "John 3:16 ▾" pill; expand → KJV passage text; "View in context" → Bible Reader opens.

- [ ] T122 Add `widgets` JSON column to `records` table (include in migration 001 or append migration 002): `widgets TEXT DEFAULT '[]'`
- [ ] T123 Create `src/client/api/bible-client.js` — `getPassage(verseIds)`, `search(query)`, `getChapter(bookId, chapter)`; all call api.bible KJV (ID: `de4e12af7f28f599-02`); API key from `CONFIG.bibleApiKey`; cached via client-side Map (long TTL); typed `ApiError` on failure
- [ ] T124 Create `src/client/view/components/widgets/widget-host.js` — `renderWidget(widgetData)` dispatches to registered widget renderers; graceful "Unknown widget" placeholder for unrecognised types
- [ ] T125 Create `src/client/view/components/widgets/bible-widget.js` — `renderBibleWidget(payload)`: collapsed pill showing reference + "▾"; expand shows verse text individually numbered; "View in context" button opens Bible Reader; fetch passage on expand (skeleton while loading)
- [ ] T126 Create `src/client/view/components/bible-reader.js` — slide-over panel; tabs: Passage (formatted HTML), Context (full chapter, current verses highlighted), Original (interlinear Hebrew/Greek from BHSA/SBLGNT Bible IDs, word-by-word with transliteration + gloss on hover), Cross-refs; loading skeleton while fetching
- [ ] T127 Add `"+ Widget"` button to `composer.js`: opens widget picker (initially only "Bible"); selecting "Bible" opens a Bible passage search/navigator; confirmed selection appends widget chip to draft
- [ ] T128 Create `src/client/view/components/bible-navigator.js` — book → chapter → verse drill-down picker; "Attach selected verses" commits payload
- [ ] T129 Wire `widget-host.js` into `post-card.js`: after post text, iterate `record.widgets` and render each widget
- [ ] T130 Update `POST /api/records` and `POST /api/claims` routes to accept and store `widgets` JSON column
- [ ] T131 Add CSS: bible widget pill, expanded passage block (line-height 1.8), verse number superscripts, interlinear word rows (original script / transliteration / gloss), highlighted context verses, slide-over panel animation, tab bar in `styles/main.css`
- [ ] T132 Add `bibleApiKey` to `src/client/config.js` and `src/client/config.sample.js`

**Checkpoint**: BibleWidget renders collapsed and expanded. Bible Reader slide-over functional with all four tabs.

---

## Phase 20: Tooltips

**Goal**: Every disabled control shows a "why disabled" tooltip on hover/tap. All entity names and action labels have explanatory tooltips for new users.

**Independent Test**: Hover over disabled Challenge button → tooltip: "Sign in to challenge"; hover over disabled Answer button → tooltip: "Not your turn to answer"; hover over EXAMINING badge → tooltip: "This party is currently being questioned".

- [ ] T133 Create `src/client/view/components/tooltip.js` — `attachTooltip(element, text)`: adds `data-tooltip` attribute and CSS-driven tooltip; works on touch via taphold
- [ ] T134 Attach "why disabled" tooltips to all disabled controls in `post-card.js`, `duel-view.js`, `home-view.js`: Challenge, Answer, Offer, Accept, Reject, Agree, Judge, Tip buttons
- [ ] T135 Attach informational tooltips to role badges (EXAMINING, TESTIFYING), entity type labels (Claim, Case, Duel, Accord, BaseOfTruth), and strength indicator `⚖`
- [ ] T136 Add tooltip CSS to `styles/main.css`: `[data-tooltip]::after` pattern; `z-index` above all content; smooth fade-in; phone-friendly tap handling

**Checkpoint**: Every disabled control explains itself. All entity labels have info tooltips.

---

## Phase 21: Notifications (US8)

**Goal**: Authenticated users see "Your turn" badge in the header. Turn notifications appear as in-app banners when a new Turn is created in a Duel they are participating in.

**Independent Test**: Person A is defender in an open Duel; Person B posts a challenge Turn; Person A's next page load shows "1 pending" badge in header; notification banner fires.

- [ ] T137 Add `GET /api/notifications` route with auth middleware — returns list of Duels where it's `personId`'s turn to respond (based on last turn type + who submitted it)
- [ ] T138 Add notification polling in `app.js`: every 30s call `GET /api/notifications`; update header badge count; fire `showNotification()` for new items since last poll
- [ ] T139 Update `header.js` — add badge slot with pending turn count; animate on change
- [ ] T140 Update `post-card.js` — show "Your turn" indicator on Claim cards where current user has an open Duel needing response

**Checkpoint**: Turn notifications functional. Header badge shows pending count.

---

## Phase 22: Nested Cases / Lineage (US7)

**Goal**: A Case may have a `parent_case_id` linking it to a parent Case (e.g. Evidence objection opens a nested Case). Duel View shows a lineage breadcrumb showing the chain of Cases up to the root Claim.

**Independent Test**: Evidence objection creates nested Case; nested Case Duel View shows breadcrumb: "Claim > Case #1 > Evidence Objection Case #2"; clicking a breadcrumb item navigates to that Case.

- [ ] T141 Support `parent_case_id` on Case creation (already in schema); return it in `GET /api/cases/:id`
- [ ] T142 Add `GET /api/cases/:id/lineage` route — returns ordered array of ancestor Cases up to the root Claim
- [ ] T143 Create `src/client/view/components/lineage-breadcrumb.js` — `renderLineage(cases)`: horizontal breadcrumb; each item is a link; current Case highlighted; overflow collapsed with "..." for deep nesting
- [ ] T144 Wire `lineage-breadcrumb.js` into `duel-view.js` as a sticky top bar when `case.parent_case_id` is set

**Checkpoint**: Nested Case lineage visible. Breadcrumb navigable.

---

## Phase 23: Security Hardening

**Goal**: CSP headers set. `npm audit` passes. Rate limiting verified under load. CORS locked to production origin. All auth paths audited for token leakage.

**Independent Test**: Run `npm audit --audit-level=moderate` → 0 vulnerabilities; send malformed JWT → 401 not 500; check response headers include `Content-Security-Policy`.

- [ ] T145 Add `Content-Security-Policy` header in Hono global middleware: `default-src 'self'; script-src 'self' https://plausible.io https://www.googletagmanager.com; connect-src 'self' https://api.bible https://plausible.io`; adjust per actual third-party origins used
- [ ] T146 Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` headers in the same middleware
- [ ] T147 Run `npm audit --audit-level=moderate`; fix all moderate+ vulnerabilities before merge
- [ ] T148 Verify JWT `?token=` param is cleared from URL immediately after extraction (via `history.replaceState`) — already specified in T028; add integration test assertion
- [ ] T149 Add security headers test: request any route and assert required headers are present in response
- [ ] T150 Review all routes for missing auth middleware: any route that writes data must require auth; automated test that POSTing without token returns 401

**Checkpoint**: Security hardening complete. CSP set. No audit vulnerabilities. All write routes require auth.

---

## Phase 24: Test Coverage

**Goal**: ≥80% line/function/branch coverage on server-side models and permission gates. Integration tests for auth flow and main entity lifecycle.

**Independent Test**: `npm test` → all tests pass; `npx c8 check-coverage --lines 80 --functions 80 --branches 75` → passes.

- [ ] T151 Add unit tests for all server-side permission gates (`canChallenge`, `canAnswer`, `canJudge`, `canOffer`, etc.) in `tests/unit/controller/`
- [ ] T152 Add unit tests for duel state machine `getValidNextTurnTypes` in `tests/unit/model/`
- [ ] T153 Add unit tests for server models: `Person.upsert`, `Record.create`, `Case.checkAndResolve`, `Turn.create` in `tests/unit/model/`
- [ ] T154 Add integration tests for auth flow: GitHub OAuth callback → JWT issued; invalid JWT → 401 in `tests/integration/`
- [ ] T155 Add integration tests for full Claim→Challenge→Answer→Offer→Accord lifecycle in `tests/integration/`
- [ ] T156 Add integration tests for Judgment creation on resolved Duel in `tests/integration/`
- [ ] T157 Run coverage gate: `npx c8 check-coverage --lines 80 --functions 80 --branches 75`; fix any gaps

**Checkpoint**: Coverage gate met. All integration lifecycle tests passing.

---

## Phase 25: Final Polish + Quickstart Validation

**Goal**: Phone-first UI verified. All views tested on 375px viewport. `quickstart.md` updated and validated on a fresh clone. Styles pass final review.

- [ ] T158 Final CSS pass: phone-first layout (375px baseline), two-lane Duel layout stacks vertically on narrow viewport, post cards have correct shadow depth, disabled controls use `--color-disabled`, resolved Accords use muted palette, animated transitions on expand/collapse
- [ ] T159 Update `specs/001-better-dispute-app/quickstart.md` — replace GitHub Device Flow section with Fly.io deploy instructions; replace GitHub labels setup with `db/migrate.js` instructions; add BibleWidget API key setup; add Stripe setup; add Plausible domain setup
- [ ] T160 Run quickstart validation: fresh clone → `npm install` → set env vars → `fly deploy` → sign in → post Claim → challenge it → answer it → offer resolution → accept → write Judgment; document any corrections

**Checkpoint**: Quickstart validated. Phone-first UI confirmed. Project shippable.




