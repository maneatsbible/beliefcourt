# Tasks: Truthbook

| Field | Value |
|---|---|
| **Version** | `v0.0.1-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Task format** | `[ ]` not started · `[~]` in progress · `[X]` done |
| **Prerequisite reading** | `plan.md`, `spec.md`, `data-model.md` |
| **Source structure** | `src/client/` (browser), `src/server/` (Hono/Node), `db/` (migrations + adapter) |
| **Last revised** | 2026-04-21 |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Constitution** | [TRUTHBOOK-CONSTITUTION.md](/specs/TRUTHBOOK-CONSTITUTION.md) |

---

## Phase 1: Infrastructure Setup

**Goal**: Fly.io app provisioned; Docker image builds and deploys; persistent SQLite volume mounted; Litestream replicates to Tigris S3; `fly.toml`, `Dockerfile`, and `start.sh` in place.

**Independent Test**: `fly deploy` succeeds; `curl https://truthbook.io/health` returns `{"status":"ok","version":"0.1.0"}`; Litestream logs show replication to S3 bucket.

- [ ] T001 Create `fly.toml` — app name `truthbook-io`, `shared-cpu-1x` / 256 MB, `auto_stop_machines = false`, internal port 3000, `/health` TCP check, `[mounts]` section pointing volume `tb_data` to `/data` per plan.md topology
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
- [X] T018 Implement `src/view/components/header.js` — `renderHeader(version)` function producing the header bar (scales icon, `Truthbook` wordmark, version on far-right) with `data-action="home"` navigation in `src/view/components/header.js`
---

## Phase 3: DB Adapter + Hono Server Foundation

**Goal**: Thin DB adapter abstracts SQLite calls (enabling future Postgres swap). Hono server starts on port 3000 with `/health`, `/version`, and global middleware (CORS, rate-limit, maintenance).

**Independent Test**: `curl /health` → 200 `{"status":"ok"}`; `curl /version` → 200 `{"version":"0.1.0","schema":1}`; send >200 req/min from same IP → 429; `MAINTENANCE_MODE=true` → all non-`/health` routes return 503.

- [ ] T014 Create `db/adapter.js` — exports `query(sql, params)`, `run(sql, params)`, `get(sql, params)` wrapping `better-sqlite3`; synchronous API matching `better-sqlite3` but behind an interface that can be swapped for `postgres` later
- [ ] T015 Create `db/sqlite.js` — opens `better-sqlite3` at `process.env.DB_PATH`; enables WAL via pragma; exports the db instance
- [ ] T016 Create `src/server/index.js` — imports Hono, creates app, registers middleware (CORS, rate-limit, maintenance), mounts route modules, starts listening on port 3000
- [ ] T017 Implement global CORS middleware in `src/server/middleware/cors.js`: allow only `https://truthbook.io` and `http://localhost:*` origins; set `Access-Control-Allow-Credentials: true`
- [ ] T018 Implement rate-limit middleware in `src/server/middleware/rate-limit.js`: sliding window 200 req/min per IP using in-memory Map; return `429 Too Many Requests` with `Retry-After` header
- [ ] T019 Implement maintenance middleware in `src/server/middleware/maintenance.js`: if `process.env.MAINTENANCE_MODE === 'true'` return `503` for all routes except `/health` and `/maintenance/submit`
- [ ] T020 Add `GET /health` route: `{"status":"ok"}` 200
- [ ] T021 Add `GET /version` route: `{"version": pkg.version, "schema": <latest migration number>}` 200

**Checkpoint**: Server boots. Middleware enforces CORS, rate-limiting, maintenance mode. Health/version endpoints live.

---

## Phase 4: SM OAuth + JWT Authentication

**Goal**: Users can sign in via X (Twitter), Threads, or GitHub OAuth. Server exchanges code for token server-side, creates/updates `persons` row and `linked_identities`, issues signed JWT (HS256, 24h). Client stores JWT in `localStorage`.

**Independent Test**: Sign in with GitHub OAuth → `persons` row created, JWT returned; re-sign-in → same `person_id`, `linked_identities` upserted; expired JWT → 401; tampered JWT → 401.

- [ ] T022 Create `src/server/auth/jwt.js` — `signJwt(personId)` (HS256, 24h, `process.env.JWT_SECRET`) and `verifyJwt(token)` returning `{ personId }` or throwing; never expose secret
- [ ] T023 Create `src/server/middleware/auth.js` — extracts `Authorization: Bearer <token>` header; calls `verifyJwt`; attaches `c.set('personId', ...)` to context; returns 401 on missing or invalid token
- [ ] T024 Implement GitHub OAuth flow in `src/server/auth/github-oauth.js`: `GET /auth/github` redirects to GitHub; `GET /auth/github/callback` exchanges code, fetches user profile, upserts `persons` + `linked_identities`, issues JWT, redirects to `/?token=<jwt>`
- [ ] T025 Implement X (Twitter) OAuth 2.0 PKCE flow in `src/server/auth/x-oauth.js`: same pattern as GitHub; store PKCE verifier in server-side session (Map keyed by `state`); note high-risk volatility per plan.md
- [ ] T026 Implement Threads OAuth flow in `src/server/auth/threads-oauth.js`: Facebook Login SDK server-side; same upsert pattern
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
- [ ] T041 Port `src/client/view/components/header.js` — update app name to "Truthbook"; handle all four SM OAuth provider sign-in buttons; show `@handle` when authenticated
- [ ] T042 Port `src/client/view/components/notification.js` — keep `showNotification(message, type)` API unchanged
- [ ] T043 Port `src/client/view/components/error-panel.js` — keep full debug bundle (stack + logs + UA + URL); update branding
- [ ] T044 Port `src/client/view/components/composer.js` — refactor to support `mode` param: `"claim"`, `"challenge"`, `"answer"`, `"offer"`, `"response"`, `"moment"`; ensure all storage is via internal API; submit to `apiFetch`

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

- [ ] T090 Add `POST /api/duels/:id/judgments` route with auth middleware — creates `judgments` row + `analyses` row; validates duel is resolved; validates judge has a declared BaseOfTruth with a STANDING anchor Claim; is not a party to the Duel
- [ ] T091 Add `GET /api/duels/:id/judgments` route — returns all Judgments with Analyses for a Duel; each Judgment includes computed `weight` (`strength(anchor_claim) × judgment_track_record(judge)`) as a float
- [ ] T092 Create `src/client/model/judgment.js` — `Judgment` client class with `fromApi(data)` factory; stores `weight` from API response
- [ ] T093 Update `duel-view.js` — add Judgment section below the two-lane layout showing all Judgments as cards ordered by descending `weight`; show judge's anchor Claim handle and computed weight; "Write Judgment" button opens composer with `mode="judgment"`; submit creates Judgment via API
- [ ] T094 Add `canJudge(person, duel)` gate: authenticated, duel is resolved, person is not a party, person has declared BaseOfTruth with a STANDING anchor Claim; tooltip on disabled state explains which condition is not met
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

**Goal**: Plausible tracks all navigation as privacy-first pageviews + custom events. GA4 loaded only for unauthenticated users (required for ads program). Auto-analytics endpoints power knowledge-base queries.

**Independent Test**: Load app unauthenticated → Plausible pageview fires, GA4 fires; sign in → GA4 script not present; call `GET /api/analytics/contested` → returns top contested Claims.

- [ ] T111 Add Plausible script to `index.html`: `<script defer data-domain="truthbook.io" src="https://plausible.io/js/script.js"></script>`
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

## Phase 19: BibleWidget and Bible Reader (FR-210, FR-211)

**Goal**: The Bible Widget is the first implemented Widget type. The Bible Reader is the platform's full scripture study tool — it surfaces in all Christian Mode contexts and powers the Exploring Our Faith section. The Catechism Library is community-driven: it is the accumulated body of Catechism-tagged Duels filed by users, not a pre-built question bank. KJV is the default translation; 7 free public-domain translations are supported at launch via api.bible.

**Supported translations at launch (all free via api.bible):**
- KJV (ID: `de4e12af7f28f599-02`) — **default**
- WEB (ID: `9879dbb7cfe39e4d-04`)
- ASV (ID: `685d1470fe4d5c3b-04`)
- Bishops' Bible 1568 (ID: `c315fa9f71d4af3a-04`)
- Geneva Bible 1587 (ID: `c4872018b0e01352-01`)
- Darby (ID: `179568874c45066f-01`)
- Young's Literal Translation — YLT (ID: `65eec8e0b60e656b-01`)

**Independent Test**: Compose a Claim with BibleWidget attaching "John 3:16" with KJV selected → `widgets: [{type:"bible", payload:{ref:"John 3:16", verseIds:["JHN.3.16"], translation:"KJV"}}]` stored in Record; Claim card shows collapsed "John 3:16 · KJV ▾" pill; expand → KJV passage text; "Open in Bible Reader" → Bible Reader slide-over opens to Passage tab; switch to Context tab → full chapter with verse 16 highlighted; switch to Original Languages → Greek interlinear renders; switch to Cross-References → TSK cross-refs render as inline pills.

- [ ] T122 Add `widgets` JSON column to `records` table (include in migration 001 or append migration 002): `widgets TEXT DEFAULT '[]'`
- [ ] T123 Create `src/client/api/bible-client.js` — `getPassage(verseIds, translation)`, `search(query, translation)`, `getChapter(bookId, chapter, translation)`, `getInterlinear(verseIds)`; default translation `"KJV"`; translation lookup map of name → api.bible ID; API key from `CONFIG.bibleApiKey`; results cached via client-side Map keyed by `verseId+translationId` (long TTL); `ApiError` on failure
- [ ] T123a Add `BIBLE_TRANSLATIONS` config constant in `bible-client.js` — array of `{name, id, label, notes}` for all 7 supported translations; KJV first; used to populate translation selector dropdowns
- [ ] T124 Create `src/client/view/components/widgets/widget-host.js` — `renderWidget(widgetData)` dispatches to registered widget renderers; graceful "Unknown widget" placeholder for unrecognized types
- [ ] T125 Create `src/client/view/components/widgets/bible-widget.js` — `renderBibleWidget(payload)`: collapsed pill showing `${ref} · ${translation} ▾`; expand shows verse text individually numbered; "Open in Bible Reader" button opens Bible Reader; fetch passage on expand (skeleton while loading); translation stored in payload rendered consistently
- [ ] T126 Create `src/client/view/components/bible-reader.js` — slide-over panel; 4 tabs: Passage, Context, Original Languages, Cross-References; 5th tab stub (Commentary — disabled, roadmap label); loading skeleton while fetching; accessible as standalone route `/bible/:ref`
- [ ] T126a Passage tab: formatted passage; translation selector dropdown using `BIBLE_TRANSLATIONS`; copy-verse button per verse (copies as `"Ref Translation — text"`); "Attach to record" shortcut if Composer is open
- [ ] T126b Context tab: full chapter; current passage highlighted; prev/next chapter arrows; book + chapter selector
- [ ] T126c Original Languages tab: OT → BHSA Hebrew interlinear from api.bible; NT → SBLGNT Greek interlinear; word stack: original script / transliteration / gloss; hover → lexical entry panel (Strong's number, semantic range, usage count)
- [ ] T126d Cross-References tab: TSK cross-reference data for passage (embed as JSON or fetch from static asset); render each as inline BibleWidget pill at collapsed state; grouped by theme label
- [ ] T127 Add `"+ Widget"` button to `composer.js`: opens widget picker (initially only "Bible"); selecting "Bible" opens BibleNavigator
- [ ] T128 Create `src/client/view/components/bible-navigator.js` — book → chapter → verse drill-down picker; translation selector present at top (KJV default); "Attach selected verses" commits `{ref, verseIds, translation}` payload
- [ ] T129 Wire `widget-host.js` into `post-card.js`: after post text, iterate `record.widgets` and render each widget
- [ ] T130 Update `POST /api/records` and `POST /api/claims` routes to accept and store `widgets` JSON column
- [ ] T131 Add CSS: bible widget pill with translation badge, expanded passage block (line-height 1.8), verse number superscripts, interlinear word rows (original script / transliteration / gloss), lexical hover panel, highlighted context verses, slide-over panel animation, translation selector, tab bar in `styles/main.css`
- [ ] T132 Add `bibleApiKey` to `src/config.js` and `src/config.sample.js`

**Checkpoint**: BibleWidget renders collapsed and expanded with translation badge. Bible Reader functional with all four active tabs. Translation switching works across all 7 translations. Bible Reader accessible at `/bible/:ref`.

---

## Phase 26: Miranda, Rescission, Judgment Weight, and On-the-Record Search

**Goal**: Complete all gaps identified in the 2026-04-20 coherence review. (1) Cross-record Evidence (Miranda) wired end-to-end. (2) Rescission entity with simple deactivation semantics. (3) Judgment weight computation and display. (4) Miranda acknowledgement card at first composition. (5) On-the-record Person search.

**Independent Test**: Post a Claim, then in a separate Duel cite that Claim as cross_record Evidence against its author — Exhibit panel shows the cited Record inline. Rescind the Claim — original Record shows `[RESCINDED]` notice, Duel remains open. Write a Judgment — weight shown beside verdict. New user sees acknowledgement card before first compose.

### Miranda — Cross-Record Evidence

- [ ] T161 Add `source_record_id INTEGER REFERENCES records(id)` column to `evidence` table in a new migration `db/migrations/002_cross_record_rescissions.sql`; add `attachment_type` value `'cross_record'` to the CHECK constraint
- [ ] T162 Update `POST /api/duels/:id/evidence` route — accept `attachment_type: 'cross_record'` with `source_record_id`; validate: the cited Record exists AND its `author_id` matches one of the Duel's parties; require no `url`, `text`, or `file_path` for this type
- [ ] T163 Update `src/client/view/components/evidence-panel.js` — add "Cite a Record" option alongside file/URL/quote; opens a Record search picker (search by text, author handle, date); selected Record submitted as `cross_record` Evidence; rendered inline as a quoted Record card with `[CITED AS EVIDENCE]` label
- [ ] T164 Add Miranda notice chip to `post-card.js`: any Record that has been cited as `cross_record` Evidence in at least one Duel shows a small `⦿ cited` indicator (tooltip: "This record has been used as evidence in a Duel")
- [ ] T165 Fire Plausible `jdg:evidence_cross_record` event on successful cross-record submission

### Miranda Acknowledgement Card

- [ ] T166 Create `src/client/view/components/miranda-card.js` — `renderMirandaCard()`: persistent card rendered above composer on Home View; text: *"Everything you post on Truthbook is permanent, public, and on the record. Any of your posts can be submitted as Evidence in a Duel by anyone, at any time."*; shows "I understand" button; on click: stores acknowledgement in `localStorage` (`tb:miranda_ack=1`) and collapses the card smoothly; NEVER a modal; NEVER auto-dismissed
- [ ] T167 Wire `miranda-card.js` into `home-view.js`: render above composer when `!localStorage.getItem('jdg:miranda_ack')` and user is authenticated
- [ ] T168 Add CSS: miranda card uses `--color-warning` left border accent, muted background, warning icon; collapse animation smooth

### Rescission

- [ ] T169 Add `rescissions` table to migration `002_cross_record_rescissions.sql`: `id INTEGER PRIMARY KEY, record_id INTEGER NOT NULL REFERENCES records(id), author_id INTEGER NOT NULL REFERENCES persons(id), reason TEXT, created_at TEXT NOT NULL`; UNIQUE constraint on `record_id`; append-only trigger (no UPDATE/DELETE)
- [ ] T170 Add `POST /api/records/:id/rescind` route with auth middleware — creates `rescissions` row; validates `person_id` equals `record.author_id`; validates no existing Rescission; returns 409 if already rescinded
- [ ] T171 Add `GET /api/records/:id` to return `rescission` object if one exists (join `rescissions`)
- [ ] T172 Update `canRescind(person, record)` gate in `src/server/controllers/record-controller.js`: person is `authorId` AND no existing Rescission
- [ ] T173 Update `post-card.js` — when `record.rescission` is present: apply `[RESCINDED]` badge on author attribution line (amber, struck-through); render muted card border; show rescission reason as a collapsed note; "Rescind" action in overflow menu when `canRescind`
- [ ] T174 In `duel-view.js`: when any Turn's source Record is rescinded, show a `[RESCINDED]` inline notice within the Turn card; Duel remains fully active and functional
- [ ] T175 Add analytics hook: when a Rescission is created on a Claim that was STANDING, fire Plausible `jdg:rescission_standing` event; record is surfaced in Velocity and Flip Rate analytics views with a `♥ rescinded STANDING` label as virtue marker

### Judgment Weight

- [ ] T176 Add `GET /api/persons/:id/judgment-track-record` route — returns `{ total: N, aligned: M, rate: float }` where `aligned` = Judgments this Person made that matched the eventual Accord outcome of the same Duel; returns `{ rate: 1.0 }` for judges with no prior record
- [ ] T177 Update `POST /api/duels/:id/judgments` route — after creating the Judgment, compute and return `weight = strength(anchor_claim) × track_record_rate` inline in the response (do not store)
- [ ] T178 Update `GET /api/duels/:id/judgments` route — compute and return `weight` for each Judgment in the list; sort by descending weight
- [ ] T179 Update `duel-view.js` Judgment section — display `weight` as a visual strength indicator beside each Judgment verdict (e.g. `●●○○` dots or a percentage label); show tooltip explaining the two contributing factors; weighted consensus indicator at section header (e.g. "Weighted: 68% Challenger")

### On-the-Record Person Search

- [ ] T180 Add `GET /api/persons/:id/record` route — returns paginated list of all Records authored by this person, filterable by `type` (claim/challenge/answer/etc) and `topic` (full-text search on `text`); includes rescission status and cross-record citation count per Record
- [ ] T181 Add `GET /api/persons/:id/accords` route — returns all ClaimAccords held by this person with Claim summary
- [ ] T182 Add `GET /api/persons/:id/judgments-rendered` route — returns all Judgments rendered by this person with verdict, weight at time of render, and alignment status (did they agree with eventual Accord?)
- [ ] T183 Create `src/client/view/person-view.js` — `renderPersonView(person)`: shows Person handle, profile pic, BaseOfTruth anchor Claim, judgment track record rate; tabs: **All Records** (filterable by type), **Agreements** (ClaimAccords), **Judgments** (rendered), **Rescissions**; accessible from any Record card author attribution click
- [ ] T184 Update `post-card.js` — author attribution is clickable; navigates to `?view=person&id=<personId>` which renders `person-view.js`
- [ ] T185 Fire Plausible `jdg:person_profile_viewed` on Person view load

**Checkpoint**: Miranda cross-record Evidence submittable and displayed. Rescission creates `[RESCINDED]` notice, Duel stays open. Judgment weight shown and explained. Miranda acknowledgement card shown to new users. Person profile shows full on-the-record history.

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

---

## Phase 27: Admin, User Management, and Cron Infrastructure

**Goal**: Admin interface at `/admin` (server-rendered, role-gated). User management (paginated list, role change `member↔moderator`, ban/un-ban). Moderation flag queue (user-submitted flags + auto-flags from cron). Cron control panel (last run, outcome, manual trigger). System health widgets. All 7 scheduled jobs implemented, registered in a central registry, and writing to `cron_runs`.

**Independent Test**: Admin user visits `/admin` → user list, cron panel, health widgets render. Non-admin → 403. Manual "Run now" button fires job and updates `cron_runs` row. Banned user POSTs to any write route → `403 {"error":"banned"}`.

### Migration 003 — Admin and Cron Tables

- [ ] T186 Create `db/migrations/003_admin_cron.sql` — add `role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','moderator','admin'))` and `banned_at DATETIME NULL` to `persons`; create tables: `person_stats (person_id PK, judgment_track_record REAL, updated_at)`, `analytics_snapshots (id, bucket_at, record_count, accord_count, duel_count, judgment_count, tip_volume_cents)`, `similarity_clusters (record_id PK, cluster_id INTEGER, updated_at)`, `cron_runs (id, job_name, started_at, finished_at, status, message)`, `moderation_flags (id, record_id, flagged_by_person_id, reason, created_at, resolved_at, resolved_by_person_id)`, `tip_digests (id, person_id, date, total_cents, tip_count, UNIQUE(person_id, date))`
- [ ] T187 Add indexes: `cron_runs(job_name, started_at DESC)`, `moderation_flags(resolved_at)`, `moderation_flags(record_id)`

### Role and Ban Enforcement

- [ ] T188 Expose `role` on `GET /api/persons/:id` for admin requests only (omit from public profile); add `banned_at` to internal Person model
- [ ] T189 Create `src/server/middleware/require-admin.js` — checks JWT claims `role='admin'`; returns `403 {"error":"forbidden"}` otherwise
- [ ] T190 Create `src/server/middleware/require-moderator.js` — checks JWT claims `role` in `['admin','moderator']`
- [ ] T191 Add `banned` guard to the shared auth middleware — after JWT validation, if `persons.banned_at IS NOT NULL` return `403 {"error":"banned"}` for any non-GET route
- [ ] T192 Add `PATCH /api/admin/persons/:id/role` (requireAdmin) — accepts `{ role: 'member'|'moderator' }`; validates `canChangeRole` gate; updates `persons.role`
- [ ] T193 Add `PATCH /api/admin/persons/:id/ban` (requireAdmin) — accepts `{ banned: boolean }`; validates `canBan` gate; sets/clears `persons.banned_at`

### Moderation Flags

- [ ] T194 Add `POST /api/records/:id/flag` (auth required) — creates `moderation_flags` row; one flag per person per record (UNIQUE constraint); accepts `{ reason: string }`
- [ ] T195 Add `GET /api/admin/flags` (requireModerator) — returns unresolved flags paginated, ordered by `created_at DESC`; each includes Record summary and flagger handle
- [ ] T196 Add `PATCH /api/admin/flags/:id/resolve` (requireModerator) — sets `resolved_at` and `resolved_by_person_id`
- [ ] T197 Add flag button to `post-card.js` — `⚑` icon in overflow menu; opens one-line reason input; calls `POST /api/records/:id/flag`; button changes to `⚑ Flagged` after submission

### Cron Registry

- [ ] T198 Create `src/server/cron/registry.js` — exports `JOBS` array (each entry: `{ name, schedule, fn }`); exports `registerAll(db)` which sets up `node-cron` schedules and wraps each `fn(db)` call in try/catch writing a `cron_runs` row (`status='ok'` or `status='error'` with message)
- [ ] T199 Refactor existing `src/server/cron/deadline-checker.js` (T079) into registry format — `name='deadline_checker'`, `schedule='* * * * *'`; remove the old `setInterval` from `index.js`
- [ ] T200 Create `src/server/cron/stale-duel-reaper.js` — `schedule='0 */6 * * *'`; queries Duels with `created_at < now-30d` and no Turn in last 7 days; creates stale `moments` annotation per Duel; inserts nudge notification rows for both parties
- [ ] T201 Create `src/server/cron/judgment-track-record.js` — `schedule='0 * * * *'`; for each user, compute `COUNT(aligned)/COUNT(total)` from `judgments` joined against resolved `accords`; upsert into `person_stats`; default 1.0 for zero history
- [ ] T202 Create `src/server/cron/analytics-rollup.js` — `schedule='0 * * * *'`; inserts one `analytics_snapshots` row per hour with counts from `records`, `claim_accords`, `duels`, `judgments` and sum from `tips.amount_cents`
- [ ] T203 Create `src/server/cron/similarity-cluster.js` — `schedule='0 2 * * *'`; BFS walk of `similarity_links` adjacency; upserts `similarity_clusters` with computed `cluster_id`; runs in a single transaction
- [ ] T204 Create `src/server/cron/db-integrity.js` — `schedule='0 3 * * *'`; runs `PRAGMA integrity_check`; runs `PRAGMA wal_checkpoint(PASSIVE)`; if integrity check returns anything other than `"ok"`, inserts a `moderation_flags` row with `flagged_by_person_id` = @system person id
- [ ] T205 Create `src/server/cron/tip-digest.js` — `schedule='0 0 * * *'`; aggregates prior day's `tips` by `to_person_id`; upserts into `tip_digests`
- [ ] T206 Call `registerAll(db)` in `src/server/index.js` after all routes are mounted

### Admin Interface

- [ ] T207 Create `src/server/routes/admin.js` — registers all `/admin` GET routes and `/api/admin` API routes behind `requireAdmin`/`requireModerator`; mounted in `index.js`; all pages are server-rendered HTML via template strings
- [ ] T208 `GET /admin` — admin shell: nav sidebar (Users, Flags, Cron, Health), main `<main>` area; minimal semantic HTML; no JS bundles
- [ ] T209 `GET /admin/users` — paginated user list (20/page); handle, platform, joined, role, record count, ban status; role-change select + ban toggle button inline per row; `?search=` query param filters by handle
- [ ] T210 `GET /admin/flags` — moderation queue: Record text preview, flagger handle, reason, flag date, Resolve button (posts to `/api/admin/flags/:id/resolve`)
- [ ] T211 `GET /admin/cron` — cron panel: one row per job showing latest `cron_runs` entry (name, schedule, last started, status badge, message, next run estimate); "Run now" button per row
- [ ] T212 `POST /api/admin/cron/:jobName/run` (requireAdmin) — looks up job by name in `JOBS`; calls `fn(db)`; returns `{ ok: true, duration_ms }` or `{ ok: false, error: string }`; never 500
- [ ] T213 `GET /admin/health` — health panel: DB page count × page size, WAL file size, server uptime via `process.uptime()`, `process.memoryUsage().rss`, rate-limit hit counter for last hour, Litestream last-replicated-at (read from `cron_runs` where `job_name='db_integrity'`)
- [ ] T214 Create `styles/admin.css` — dark sidebar layout, zebra-stripe tables, status badges (`ok` = green, `error` = red, `pending` = amber); no external CSS; imported only from admin pages

**Checkpoint**: All 7 cron jobs registered and running. Admin interface live at `/admin`. User management, moderation queue, and cron panel all functional.

---

## Phase 28: Blocker Resolution and Gap Closure

**Goal**: Resolve all Implementation Blockers (B-001 through B-010). Close data model and build/deploy gaps identified in the full spec review. Harden the deploy pipeline and add missing `package.json` scripts.

**Independent Test**: `fly deploy` completes cleanly with `better-sqlite3` built; `/health` 200; migrations run once, idempotently; Litestream replicates to Tigris; `npm run migrate` works locally; all 3 OAuth providers have registered redirect URIs.

### B-001 — Docker build toolchain for `better-sqlite3`

- [ ] T215 Update `Dockerfile`: add `RUN apk add --no-cache python3 make g++ && npm ci --omit=dev` in the build layer; use multi-stage build (`node:22-alpine` builder → `node:22-alpine` runtime) to keep final image small; verify `better-sqlite3` compiles without error on `fly deploy`

### B-002 — OAuth redirect URI registration

- [ ] T216 Register `https://truthbook.io/auth/github/callback` in GitHub OAuth App settings; register X/Twitter OAuth 2.0 app with PKCE; register Threads App with Instagram Graph API; document all four client IDs/secrets as Fly.io secrets in plan.md runbook

### B-003 / B-004 — Pre-deploy infrastructure

- [ ] T218 Add `fly volumes create jdg_data --size 3` and `fly storage create` (Tigris bucket) as documented Step 0 in `quickstart.md`; add a pre-flight check script `scripts/preflight.sh` that verifies `FLY_API_TOKEN`, `JWT_SECRET`, `DB_PATH`, `TIGRIS_BUCKET`, `STRIPE_SECRET_KEY` are all set before deploy

### B-005 — Stripe webhook local dev

- [ ] T219 Add `npm run stripe:listen` script to `package.json` (`stripe listen --forward-to localhost:3000/api/tips/webhook`); document in quickstart under "Tipping setup"; register production webhook URL in Stripe dashboard post-deploy

### B-006 — JWT session expiry UX

- [ ] T220 Add FR-001a to spec.md: auth middleware returns `{"error":"token_expired"}` on JWT expiry (distinct from `"invalid_token"`); client `apiFetch` intercepts this specific code and shows a non-blocking persistent banner "Your session expired — tap to sign in again"; banner appears at bottom of screen above ad strip position; composer draft is NOT cleared

### B-007 — JWT secret rotation procedure

- [ ] T221 Add `JWT_SECRET_PREV` support to `src/server/auth/jwt.js` — `verifyJwt` tries `JWT_SECRET` first, falls back to `JWT_SECRET_PREV`; add rotation procedure to plan.md runbook: (1) set new secret, (2) move old value to `JWT_SECRET_PREV`, (3) deploy, (4) wait 25h, (5) clear `JWT_SECRET_PREV`

### B-008 — On-startup deadline catch-up

- [ ] T222 In `src/server/index.js`, after `registerAll(db)` is called, run a one-time startup sweep: query `deadline_conditions` where `deadline_at < now` and no Disposition exists; call `deadline-checker` logic for each; log count of caught-up deadlines



### B-010 — @system person seed

- [ ] T224 Update migration 001 to insert `@herald` (id=1) and `@system` (id=2) as the first two rows in the `persons` table immediately after schema creation; both rows have `is_herald=false`, `is_ai=false`, `role='member'`, `banned_at=NULL`; note that `@herald` is a beacon for imported external content, not a bot

### Data Model Gaps

- [ ] T225 Add `notifications` table to migration 001 (or 002): `id INTEGER PK, person_id INTEGER FK, type TEXT CHECK(type IN ('turn_pending','challenged','accord_reached','stale_duel_nudge')), subject_record_id INTEGER NULL, duel_id INTEGER NULL, read_at DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- [ ] T226 Add `maintenance_submissions` table to migration 001: `id INTEGER PK, email TEXT, message TEXT, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- [ ] T227 Add `type TEXT DEFAULT 'annotation' CHECK(type IN ('annotation','stale_notice'))` column to `moments` table in migration 001; update stale-duel cron (T200) to set `type='stale_notice'` when creating system moments; update Analysis query to exclude `stale_notice` moments from analyst-facing moment picker
- [ ] T228 Add `platform_handle TEXT` column to `linked_identities` in migration 001; populate during OAuth upsert with the raw handle from the platform; use this for display in admin user list and Person profile
- [ ] T229 Update `GET /api/notifications` (T137) to read from `notifications` table with `WHERE person_id=? AND read_at IS NULL`; mark as read by setting `read_at=now` on fetch with `?mark_read=true`; cron jobs and route handlers INSERT notification rows when turns are created or stale duels detected

### Build and Deploy Infrastructure

- [ ] T230 Add `package.json` scripts: `"migrate": "node db/migrate.js"`, `"seed": "node src/mock/seed-data.js"`, `"test": "node tests/run-all.js"`, `"stripe:listen": "stripe listen --forward-to localhost:3000/api/tips/webhook"`
- [ ] T231 Add deploy health-check assertion to `start.sh`: after `db/migrate.js` runs, `curl -sf http://localhost:3000/health` once before allowing Fly.io to route traffic; if it fails, exit 1 (Fly.io will block the deploy and roll back)
- [ ] T232 Document migration rollback strategy in plan.md: since content tables are append-only, rollback is always a forward patch (migration 004 that undoes structural changes introduced in 003). No `DOWN` migrations. If a bad migration ships, it is fixed by deploying migration `N+1`.
- [ ] T233 Add `PRAGMA foreign_keys=ON` assertion at DB open time in `db/sqlite.js` to ensure FK constraints are enforced at runtime (SQLite disables them by default)

**Checkpoint**: All 10 blockers resolved or formally deferred. `notifications` table live. `moments.type` discriminated. Deploy pipeline has preflight, health-check gate, and rollback strategy documented. `package.json` scripts in place.

---

## Phase 29: CI / CD Pipeline (FR-232 – FR-241)

**Goal**: Full GitHub Actions CI pipeline enforced on every PR to `main`. Lint, unit tests, integration tests, security scan, build smoke test, staging deploy, and smoke test all required to pass before merge. Release versioning automated on merge.

**Independent Test**: Open a PR → all 5 required status checks appear and pass; merge → staging deploy succeeds and smoke tests pass; `/version` returns bumped patch version; a PR with a lint error fails the `ci/lint` check and cannot be merged.

### CI Setup

- [ ] T234 Create `.github/workflows/ci.yml` — defines the `ci` workflow triggered on `pull_request` to `main` and `push` to `main`; jobs: `lint`, `unit-tests`, `integration-tests`, `security-scan`, `build-smoke`, `staging-deploy` (main-only); all jobs use `ubuntu-latest` runner and `node:22` image
- [ ] T235 Add `ci/lint` job — runs `npm ci`, then `npm run lint` (ESLint), then `npm run format:check` (Prettier); fails on any error; no auto-fix
- [ ] T236 Create `eslint.config.js` — `eslint:recommended`, `node` + `browser` environments, `no-console` rule set to `error` in `src/server/**` (warn in `src/client/**`), `no-eval: error`, `complexity: ['error', 12]`; exclude `tests/` from `no-console`
- [ ] T237 Create `.prettierrc` — `{ "tabWidth": 2, "singleQuote": true, "semi": false, "trailingComma": "es5" }`; add `npm run format:check` script (`prettier --check .`) and `npm run format:fix` script (`prettier --write .`) to `package.json`
- [ ] T238 Add `ci/unit-tests` job — depends on `lint`; runs `npm ci`, then `npx vitest run --coverage`; uploads `coverage/` as artifact; enforces `c8 --check-coverage --lines 85 --functions 80 --branches 80`; posts coverage summary comment to PR via `actions/github-script`
- [ ] T239 Install Vitest and c8: `npm install --save-dev vitest @vitest/coverage-c8`; add `vitest.config.js` with `coverage: { provider: 'c8', reporter: ['text', 'html', 'json'], reportsDirectory: './coverage' }`; add `"test:unit": "vitest run"` and `"test:unit:watch": "vitest"` scripts to `package.json`
- [ ] T240 Add `ci/integration-tests` job — depends on `lint`; runs `npm ci`, sets `DB_PATH=:memory:` and `NODE_ENV=test`; runs `npm run test:integration`; add `"test:integration": "vitest run tests/integration/**"` to `package.json`; integration tests auto-apply migrations at setup using `runMigrations(db)` with an in-memory DB
- [ ] T241 Add `ci/security-scan` job — runs `npm ci`, then `npm audit --audit-level=high`; any HIGH or CRITICAL vulnerability exits non-zero and fails the build; add `"audit": "npm audit --audit-level=high"` script to `package.json`; also create `.github/dependabot.yml` enabling weekly npm dep updates to `main` via PR
- [ ] T242 Create `.github/dependabot.yml` — `version: 2`, `updates` entry for `package-ecosystem: npm`, `directory: /`, `schedule: { interval: weekly }`, `open-pull-requests-limit: 10`
- [ ] T243 Add `ci/build-smoke` job — runs `npm ci`; starts server with `NODE_ENV=test DB_PATH=:memory: node src/server/index.js &`; waits up to 5s for `GET /health` to return 200 (via `curl --retry 5 --retry-delay 1 -sf http://localhost:3000/health`); then sends `SIGTERM`; any failure fails build
- [ ] T244 Create `tests/smoke/` directory with `smoke.test.js` — 5 critical path checks against `$SMOKE_URL` env var: `/health` returns 200, `/version` returns JSON with `version` and `schema`, `POST /api/auth/callback` with invalid code returns 400, `GET /api/claims` returns JSON array, `GET /api/analytics/contested` returns JSON array
- [ ] T245 Add `ci/staging-deploy` job — runs only on `push` to `main`; uses `superfly/flyctl-actions/setup-flyctl@master`; runs `flyctl deploy --app truthbook-io-staging --remote-only`; runs smoke tests against staging URL (`SMOKE_URL=https://truthbook-io-staging.fly.dev`); on smoke failure runs `flyctl releases rollback --app truthbook-io-staging` and opens a GitHub Issue via `actions/github-script` tagged `ci-regression`
- [ ] T246 Add GitHub Repository Secrets to CI: `FLY_API_TOKEN`, `JWT_SECRET_CI`, `STAGING_URL`; document all required secrets in `quickstart.md` under "CI Setup" section
- [ ] T247 Configure branch protection rules in GitHub repository settings (document in `quickstart.md`): require status checks `ci/lint`, `ci/unit-tests`, `ci/integration-tests`, `ci/security-scan`, `ci/build-smoke` to pass before merging to `main`; require PR approval from at least 1 reviewer; no force-push to `main`
- [ ] T248 Add release versioning job to `ci.yml` — runs after `staging-deploy` on `push` to `main`; reads `package.json` version; creates GitHub Release with tag `v<version>` via `actions/create-release`; runs `npm version patch` + commits and pushes to `main` with `[skip ci]` message to avoid CI loop; uses `GITHUB_TOKEN` from workflow context

### ESLint Migration of Existing Tests

- [ ] T249 Migrate existing `tests/unit/` files from the old `tests/runner.js` format to Vitest: convert `runner.run(name, fn)` calls to `describe/it` blocks; ensure all existing tests pass under `vitest run`
- [ ] T250 Add `"test": "vitest run"` as the canonical `npm test` script (replaces `node tests/run-all.js`); update `quickstart.md` accordingly

**Checkpoint**: Full CI pipeline live. All 5 required checks enforced on PRs. Staging deploy with auto-rollback on smoke failure. Coverage gate enforced. Dependabot enabled. ESLint and Prettier enforced. Release versioning automated.

---

## Phase 30: Judgy Blog (FR-242 – FR-245)

**Goal**: Judgy Blog live at `/blog`. Admin can create and publish posts from `/admin/blog`. Public read, no auth required. No bot zone. Comments disabled.

**Independent Test**: Admin creates a post via admin console; visits `/blog` → post card visible; visits `/blog/:slug` → full post renders; unauthenticated user can read; no bot annotations appear anywhere on blog pages.

- [ ] T251 Add `blog_posts` table to migration `004_blog_opspec_herald.sql`: `id INTEGER PK, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, author_id INTEGER FK references persons(id), published_at DATETIME, updated_at DATETIME, cover_image_url TEXT, tags TEXT DEFAULT '[]', is_featured BOOLEAN DEFAULT 0`
- [ ] T252 Add `blog_author` and `super_admin` columns to `persons` in migration 004: `is_blog_author BOOLEAN DEFAULT 0`, `is_super_admin BOOLEAN DEFAULT 0`; seed the platform owner's Person row with both flags
- [ ] T253 Add `GET /blog` route (public, no auth) — server-renders paginated list of published posts (`published_at IS NOT NULL`), sorted by `published_at DESC`; each card: title, author handle + avatar, date, tags, 200-char excerpt; Open Graph meta tags in `<head>`
- [ ] T254 Add `GET /blog/:slug` route (public) — server-renders full post markdown as HTML via a markdown parser (`marked`); Open Graph + Twitter Card meta tags; no comments section; footer CTA: "Respond with a Claim on Truthbook" → links to `/compose?context=blog&source=<slug>`
- [ ] T255 Add `GET /admin/blog` (requireBlogAuthor) — paginated list of all posts (drafts + published) with edit links
- [ ] T256 Add `GET /admin/blog/new` and `GET /admin/blog/:id/edit` (requireBlogAuthor) — markdown editor using a plain `<textarea>` with tab-key indent support; fields: title, slug (auto-generated from title, editable), cover_image_url, tags (comma list), body; Preview button renders markdown in-page; Save Draft / Publish buttons
- [ ] T257 Add `POST /api/blog/posts` and `PATCH /api/blog/posts/:id` (requireBlogAuthor) — create/update post; `published_at` is set to `now` when `{ publish: true }` is passed and was previously null; validates non-empty title and body; slug uniqueness enforced
- [ ] T258 Create `src/server/middleware/require-blog-author.js` — checks `person.is_blog_author OR person.is_super_admin`; returns 403 otherwise
- [ ] T259 Wire Plausible `jdg:blog_post_viewed` event on `/blog/:slug` page load (no GA4 on blog pages)

**Checkpoint**: Judgy Blog live. Posts creatable and publishable from admin console. Public read. No bot annotations.

---

## Phase 31: Open-Spec Public Surface (FR-247 – FR-250)

**Goal**: Spec documents readable by anyone at `/open-spec`. Section-level anchor links. "Suggest improvement" and "Report problem" links to GitHub Issues. Constitutional Duel mechanic spec'd.

**Independent Test**: Unauthenticated user visits `/open-spec` → index lists all documents; `/open-spec/spec` → spec.md rendered as HTML with anchor links; "Suggest improvement" on any section → GitHub Issue URL opens with pre-filled body.

- [ ] T260 Add `GET /open-spec` route (public) — server-renders index page listing all spec documents: spec.md, data-model.md, plan.md, constitution.md; each shows title, last-amended date (from git metadata or hardcoded), and link to `/open-spec/:doc`
- [ ] T261 Add `GET /open-spec/:doc` route (public) — reads the corresponding `.md` file from `specs/001-better-dispute-app/` and the constitution from `.specify/memory/`; renders as HTML via `marked`; injects `id` anchors on every `<h2>`, `<h3>`, `<h4>` heading; adds "Suggest improvement" and "Report problem" links after each heading as icon-only links (`✏` and `⚑`); links open pre-filled GitHub Issue URLs with `title=Suggestion: <section>` and `body=Document: <doc>\nSection: <heading>\n\n<!-- Describe your suggestion or problem here -->`
- [ ] T262 Add `GET /admin/spec` route (requireSuperAdmin) — same rendering as `/open-spec/:doc` but with inline edit buttons on each section that open the admin spec editor; includes SpecKit agent invocation UI placeholder (deferred implementation)
- [ ] T263 Document Constitutional Duel procedure in `quickstart.md`: how to file a Constitutional Duel, what constitutes a `verified_judge` role, how the super_admin accepts or overrides a Constitutional Duel verdict

**Checkpoint**: Open-spec public surface live. Section anchors and GitHub Issue links working. Admin spec view gated to super_admin.

## Phase 32: Milestone 1 — mockMode MVP

**Goal**: Full end-to-end user journey functional in mockMode with no server. All Duel states in seed data render correctly. Mock user switching demonstrates correct perspective changes. This is the First Stab toward MVP — working UI before any Fly.io deployment.

**Independent Test**: Load `index.html?m=1` → feed shows assertions with status icons; click dispute card → dispute view with correct turns; switch mock user via toolbar → your-turn and disabled states update correctly; file new Assertion → appears in feed; file Challenge → dispute created; switch to defender user → your-turn shown.

- [X] T264 Wire `duels: this._disputes` to `renderPostCard` perms in `home-view.js`; add `.duel-status-icon` CSS to `main.css`; verify ⚔️/🤝/🦗 display for all three seed scenarios
- [X] T265 Verify Assertion composer (`renderComposer`) posts to mock store and card appears in feed without reload — confirm in-memory store roundtrip
- [X] T266 Verify Challenge composer functional in mockMode — filing a challenge against a seed Assertion creates a dispute and the card shows ⚔️
- [X] T267 Verify Answer composer functional in mockMode — filing an Answer advances the active dispute turn
- [X] T268 Dispute view audit across all seed scenarios (A–N: active, objection, accord, crickets, counter-challenge, offer, defended, contested, judgment, dating, christian, historical, apology) — correct layout, correct action button states
- [X] T269 Mock user switch (toolbar) — verify your-turn indicator and action button disabled states update cleanly for each mock user with no state bleed
- [X] T270 Duel status icon visual review — correct emoji for all 5 statuses (⚔️ active, 🤝 accord, 🦗 crickets, 🛡️ defended, ⚖️ contested), tooltip text readable, no layout overflow on short cards

**Checkpoint**: ✅ COMPLETE — Working UI demo runnable from `index.html?m=1`, no server required. Covers all core Duel flows across 14 seed scenarios (A–N).

---

## Phase 33: Milestone 2 — Worldview Explorer (mockMode)

**Goal**: Full Worldview Explorer architecture functional in mockMode. Person profiles render correctly. Judgment flow (Analysis → Judgment → BaseOfTruth) works end-to-end. DuelContext framing (5 modes) renders in dispute view. @login clicks navigate to person profiles. Auto-Claim Anywhere and Worldview Sync stubs reflected in spec/data model.

**Independent Test**: Load `index.html?m=1` → click @carol on any card → PersonView renders with correct stats, claims, duels, agreements, judgments; navigate to Dispute #308 (defended) → judgment panel loads with carol's judgment; context badge visible for dating/christian/historical/apology disputes; @login button on all cards navigates to person profile; declare Base of Truth form saves and reflects.

- [X] T271 Implement `src/model/judgment.js` — `Judgment`, `Analysis`, `BaseOfTruth` classes with `fromIssue` factories; verdict constants `JUDGMENT_VERDICT_CHALLENGER/DEFENDER/INCONCLUSIVE`
- [X] T272 Implement `src/model/rescission.js` — `Rescission` class with `fromIssue` factory
- [X] T273 Implement `src/model/duel-context.js` — 5 context constants + `DUEL_CONTEXT_FRAMING` map + `getFraming(context)` helper
- [X] T274 Extend `src/model/dispute.js` — add `context` field to constructor and `fromIssue`
- [X] T275 Extend `src/model/person.js` — add `isSuperAdmin`, `isAi`, `aiModel` fields
- [X] T276 Implement `src/controller/judgment-controller.js` — `loadAnalyses`, `loadJudgments`, `loadBaseOfTruth`; `canAnalyze`, `canJudge` gates; `submitAnalysis`, `submitJudgment`, `setBaseOfTruth`
- [X] T277 Implement `src/controller/worldview-controller.js` — `WorldviewController.loadProfile(login)` with 8 parallel fetches; `WorldviewProfile` class with derived getters
- [X] T278 Implement `src/view/person-view.js` — Worldview Renderer: header, stats, Base of Truth section (with declare form for own profile), Claims, Duels, Agreements, Judgments Rendered
- [X] T279 Implement `src/view/components/judgment-panel.js` — tally, judgment cards, analysis form, judgment form with verdict selector and reasoning; grounded in Base of Truth
- [X] T280 Extend `src/utils/url.js` — add `who` param to `getUrlParams`; add `buildPersonUrl(login)` helper
- [X] T281 Make `@login` clickable in `src/view/components/post-card.js` — `<button data-action="profile" data-login="...">` replacing static `<span>`
- [X] T282 Wire `?v=person&who=` route in `src/controller/app-controller.js`; pass `JudgmentController` to `DisputeView`; add `_renderPersonView(login)` method
- [X] T283 Extend `src/view/dispute-view.js` — context badge in lineage header; post-Disposition judgment panel; `profile` action handler routing to person view; accept `judgmentCtrl` in context object
- [X] T284 Add seed scenarios J–N to `src/mock/seed-data.js`: Scenario J (judgment flow with Analysis #701, Judgment #801, BaseOfTruth #901), K (dating context), L (christian context), M (historical context), N (apology court resolved); Rescission #1001 (alice rescinds #11)
- [X] T285 Add CSS to `styles/main.css` — `.person-view`, `.judgment-panel`, `.judgment-card`, `.judgment-form`, `.context-badge`, `.role-badge`, `.post-author--btn`

**Checkpoint**: ✅ COMPLETE — Worldview Explorer functional in mockMode. 14 seed scenarios. Full Judgment flow. 5 DuelContexts. PersonView with profile navigation from any @login.

---

## Phase 34: Milestone 3 — Worldview Sync + Auto-Claim Anywhere (Spec + Stubs)

**Goal**: Spec the Worldview Sync (platform Herald auto-import from trending content) and Auto-Claim Anywhere (user-initiated paid feed monitoring) features fully enough that mockMode stubs can demonstrate the UX. Hard product questions (claim extraction, deduplication, attribution, defamation surface, sarcasm detection) are held as open constitutional questions in spec. Revenue model updated.

**Independent Test**: Investor pitch reflects both features with revenue projections. Spec contains hard product questions as open items. Mock seed data includes at least one Herald-imported Claim (confidence flag, source URL in meta). tasks.md has implementation tasks for the claim-extraction pipeline stub.

- [X] T286 Update `specs/001-better-dispute-app/investor-pitch.md` — add Worldview Sync (platform Herald), Auto-Claim Anywhere ($4.99/mo add-on), updated revenue table (adds Auto-Claim Anywhere line, revised Verdict Data API), revised growth projections (Y1–Y5); add hard product questions section under each feature
- [ ] T287 Update `specs/001-better-dispute-app/spec.md` — add Worldview Sync section (Herald import pipeline, trending detection, confidence flag, pending/confirm flow, claim lifecycle); add Auto-Claim Anywhere section (feed monitoring, notify-then-confirm, 24h window, platform coverage); add open constitutional questions block for each
- [ ] T288 Add Herald-imported seed Claim to `src/mock/seed-data.js` — Assertion with `source_url`, `confidence: 0.87`, `herald_imported: true` in meta, attributed to a public-figure-style login (`@senator_j_hayes [unverified]`); add corresponding pending Challenge
- [ ] T289 Update `src/model/post.js` — add `heraldImported`, `sourceUrl`, `confidence`, `pendingConfirmation` fields to `Assertion.fromIssue`; add `isPending` getter
- [ ] T290 Update `src/view/components/post-card.js` — render `[HERALD IMPORT]` badge and source URL link for herald-imported assertions; render `[PENDING]` badge for unconfirmed claims; show confidence indicator
- [ ] T291 Update `src/mock/seed-data.js` — add `USERS['senator_j_hayes']` entry with `{ login: 'senator_j_hayes', id: 2001, unverified: true }`; add to `MOCK_USERS`

---

## GitHub PoC — Rate Limit Handling (FR-275 – FR-278)

**Goal**: The current Truthbook SPA detects GitHub API rate-limit responses (HTTP 403/429) and surfaces clear, actionable UX instead of silent failures. Writes preserve draft content. Reads fall back to ETag cache. Mock mode is unaffected.

**Independent Test**: Exhaust rate limit anonymously → banner appears, cached content renders with `[cached]` indicator, write attempt shows inline error with draft preserved and Retry button. Sign in via Device Auth → banner auto-dismisses, pending read retried. Enable mock mode → no rate-limit UI at any point.

- [ ] T292 Add `isRateLimit(err)` helper to `src/api/github-client.js` — returns `true` when `err` is an `ApiError` with `status` 403 or 429 and `err.body?.message` includes `"rate limit"` (case-insensitive); export it alongside `ApiError`
- [ ] T293 Add `getRateLimitReset(res)` helper in `src/api/github-client.js` — reads `X-RateLimit-Reset` header (Unix timestamp) from a `Response` and returns a `Date`; also store the value in module-level state so it can be queried without a `Response` reference; export `getRateLimitResetDate()` getter
- [ ] T294 Update `get()`, `post()`, and `patch()` in `src/api/github-client.js` — on 403/429 responses, call `getRateLimitReset(res)` to cache the reset time before throwing `ApiError`; skip this when `_mockIssues !== null`
- [ ] T295 Add rate-limit banner component to `src/view/components/notification.js` (or a new `src/view/components/rate-limit-banner.js`): renders a non-blocking persistent bar at the top of `#app-main`; message: "GitHub rate limit reached. Reads may be stale. Sign in for a higher limit." with sign-in CTA button (`data-action="signin"`); shows reset countdown if reset time is known; `dismissRateLimitBanner()` export to remove it; `showRateLimitBanner(resetDate, isAuthenticated)` export to display it
- [ ] T296 In `src/controller/home-controller.js` and `src/controller/dispute-controller.js` — wrap all `get()` calls in try/catch; on `isRateLimit(err)`: call `showRateLimitBanner(getRateLimitResetDate(), !!this._user)`; fall through to cached data if available (already returned by `get()` via ETag); add `[cached]` text to any rendered content that was served from cache during a rate-limit state (pass a `fromCache` flag through the render path or check `cache.get(url)?.data` directly)
- [ ] T297 In `src/view/components/composer.js` — when a submit action throws an `ApiError` that `isRateLimit()`: (1) do NOT clear the textarea or image URL field; (2) hide the spinner; (3) show an inline error message below the submit button: "Couldn't save — GitHub rate limit reached. Try again after [reset time] or sign in."; (4) render a "Retry" button that re-attempts the submit after a 3-second delay (single retry; on second failure show generic error)
- [ ] T298 In `src/controller/app-controller.js` — listen for `data-action="signin"` on the rate-limit banner; trigger the existing GitHub Device Auth sign-in flow; on successful auth, call `dismissRateLimitBanner()` and re-run the current view's load method to retry failed reads with the new token

---

## Constitutional Governance, Crowdfunding, and Federation (FR-279 – FR-287)

**Goal**: The MVP is a live, real product. The bootstrapping Claim is an on-platform Duel. P2P giving is wired to Stripe. Keyholders can register. Quorum gates are enforced. No crypto exists in the codebase. Financial projections are publicly challengeable at `/open-spec/peoples-briefing`.

**Independent Test**: File bootstrapping Claim as `super_admin`; verify pinned with live giving total. Challenge it as another user; verify Duel flow proceeds. Verify PENDING_QUORUM disposition fires when < quorum Judgments exist. Verify `/api/keyholders` registry endpoint returns 200. `grep -r "blockchain\|ethereum\|solana\|token\|wallet" src/` returns zero results.

- [ ] T299 Add `constitutional_records` table to migration 001: `id INTEGER PK, principle_number INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, version TEXT NOT NULL, ratified_at DATETIME NOT NULL, amended_at DATETIME`; append-only trigger (no UPDATE/DELETE); this table is empty at launch — it is the landing pad for the constitution-to-Ledger migration (FR-287)
- [ ] T300 Add `quorum_rules` table to migration 001: `id INTEGER PK, duel_type TEXT NOT NULL CHECK(duel_type IN ('standard','organizational','constitutional')), min_judgments INTEGER NOT NULL, min_verified_judges INTEGER NOT NULL DEFAULT 0`; seed with initial quorum values from FR-280: standard=3, organizational=5/3, constitutional=7/7; append-only
- [ ] T301 Update `POST /api/duels/:id/judgments` route — after inserting the Judgment, query count of Judgments for this Duel against `quorum_rules` for this duel's type; if count < `min_judgments`, set `duels.disposition = 'PENDING_QUORUM'`; only advance to verdict computation when quorum is met
- [ ] T302 Update `GET /api/duels/:id` response — include `quorum: { required: N, current: M, met: bool }` in response body; include `disposition: "PENDING_QUORUM"` when appropriate
- [ ] T303 Update `duel-view.js` Judgment section — when `quorum.met === false`, show a `[Awaiting Quorum — N of M Judgments needed]` notice above the Judgment list instead of a verdict; Judgment form remains open and functional; the notice disappears automatically when quorum is met and page is refreshed
- [ ] T304 Add `pinned_claims` table to migration 001: `id INTEGER PK, record_id INTEGER NOT NULL REFERENCES records(id), pinned_by INTEGER NOT NULL REFERENCES persons(id), pinned_at DATETIME NOT NULL, is_active BOOLEAN DEFAULT 1, activation_claim_id INTEGER REFERENCES records(id)`; max 3 active pins enforced at application layer; append-only
- [ ] T305 Add `POST /api/admin/pins` route (requireAdmin) — creates a pin request Claim attributed to `super_admin` (plain text: "Pinning Claim #N to the public feed for [reason]"), schedule `is_active = true` after 7 days if no Challenge blocks it; returns the pin record and the activation-gate Claim; max 3 active pins enforced
- [ ] T306 Add `GET /api/feed/pinned` route (public) — returns active pinned Claims in pin order, with full Record payload including giving widget totals; called by `home-controller.js` before the standard feed fetch and rendered above it
- [ ] T307 Render pinned Claims in `home-view.js`: above the standard feed, for each result from `GET /api/feed/pinned`, render a post card with `[PINNED]` badge (amber, top-right corner of card); non-dismissible for unauthenticated users (no × button); dismissible per-session for authenticated users (stored in `localStorage` keyed by pin ID)
- [ ] T308 Add `stripe_connect_accounts` table to migration 001: `id INTEGER PK, person_id INTEGER UNIQUE NOT NULL FK, stripe_account_id TEXT NOT NULL, onboarded_at DATETIME, is_active BOOLEAN DEFAULT 0`; one Connected Account per Person
- [ ] T309 Add `giving_widgets` table to migration 001: `id INTEGER PK, record_id INTEGER UNIQUE NOT NULL FK, enabled_by INTEGER NOT NULL FK, enabled_at DATETIME NOT NULL, total_raised_cents INTEGER NOT NULL DEFAULT 0, contributor_count INTEGER NOT NULL DEFAULT 0`; `total_raised_cents` updated by Stripe webhook
- [ ] T310 Add `GET /api/auth/stripe/connect` route (auth required) — redirects to Stripe Connect Express onboarding URL for the authenticated user; on return, verifies onboarding completion and sets `is_active = true` in `stripe_connect_accounts`
- [ ] T311 Add `POST /api/records/:id/giving-widget` route (auth required, author only OR super_admin) — enables the giving widget on a Record; creates `giving_widgets` row; validates the author has a connected Stripe account (`is_active = true`); returns `{ paymentLink: <Stripe Payment Link URL> }`
- [ ] T312 Add `POST /api/giving/webhook` route — receives Stripe `payment_intent.succeeded` webhook; validates Stripe signature; increments `giving_widgets.total_raised_cents` and `contributor_count`; inserts a public contributor row in `giving_contributions` table (person_id or NULL for anonymous, amount_cents, created_at)
- [ ] T313 Add `giving_contributions` table to migration 001: `id INTEGER PK, widget_id INTEGER NOT NULL FK, person_id INTEGER NULL FK, amount_cents INTEGER NOT NULL, anonymous BOOLEAN DEFAULT 0, created_at DATETIME NOT NULL`; NOT append-restricted (no correction needed — read-only after insert is sufficient)
- [ ] T314 Render giving widget in `post-card.js`: when `record.givingWidget` is present, render below the post text — running total (e.g. "$1,240 raised"), contributor count, "Give" button (opens Stripe Payment Link in new tab), and collapsible contributor list (most recent 5, with "See all" link); total and count refresh after each page load; "Give" button hidden when unauthenticated with tooltip "Sign in to give" — wait, actually allow giving without sign-in since Stripe Payment Link requires no account: show Give button always, tooltip only when payment link is not yet set up
 - [ ] T315 Add `POST /api/admin/bootstrapping-claim` route (requireAdmin, idempotent) — creates the bootstrapping Claim Record if it does not already exist: `{ title: "Truthbook is viable, worth funding, and can reach constitutional self-governance within 18 months of launch.", body: <content from peoples-briefing.md summary>, labels: ["bootstrapping", "constitutional", "pinned"] }`; enables the giving widget automatically; pins it; attaches spec documents as Evidence links
- [ ] T316 Add `keyholders` table to migration 001: `id INTEGER PK, person_id INTEGER NOT NULL FK, node_url TEXT NOT NULL, node_type TEXT NOT NULL CHECK(node_type IN ('seedling','steward','keeper')), registered_at DATETIME NOT NULL, last_ping_at DATETIME, is_active BOOLEAN DEFAULT 1, governance_weight REAL NOT NULL DEFAULT 0.0`
- [ ] T317 Add `keyholder_rewards` table to migration 001: `id INTEGER PK, keyholder_id INTEGER NOT NULL FK, period_start DATETIME NOT NULL, period_end DATETIME NOT NULL, queries_served INTEGER DEFAULT 0, writes_relayed INTEGER DEFAULT 0, records_confirmed INTEGER DEFAULT 0, reward_usd_cents INTEGER DEFAULT 0, paid_at DATETIME NULL`; append-only
- [ ] T318 Add `GET /api/keyholders` route (public) — returns all active Keyholder nodes with `id`, `node_type`, `node_url`, `registered_at`, `last_ping_at`, `governance_weight`; no personal data exposed
- [ ] T319 Add `POST /api/keyholders` route (auth required) — registers a new Keyholder node for the authenticated user; validates URL is reachable (`GET <url>/health` returns 200); creates `keyholders` row; returns registration record; limited to one registration per Person in MVP
- [ ] T320 Add `GET /api/keyholders/:id/rewards` route (auth required, own node only OR admin) — returns full reward history for the node; add `GET /settings/keyholder` client-side route rendering the Keyholder Settings page: node status, uptime, reward history, governance weight, and a "Deregister" button
- [ ] T321 Add no-crypto assertion to CI: add a step to `ci/security-scan` job (T241) that runs `grep -r "blockchain\|ethereum\|solana\|wallet\|token\b" src/` and fails if any match is found; this enforces FR-285 at the build level; legitimate uses of "token" (JWT token, auth token) must use variable names that don't trigger the raw-word match — use `grep -rP "\bblockchain\b|\bethereum\b|\bsolana\b|\bcrypto\b|\bwallet\b" src/` with word-boundary regex to avoid false positives on `authToken`
- [ ] T322 Add bootstrapping Claim to `src/mock/seed-data.js` — mock assertion with `{ number: 9999, title: "Truthbook is viable, worth funding…", labels: ["bootstrapping","constitutional","pinned"], giving_widget: { total_raised_cents: 412500, contributor_count: 247 } }` so the pinned Claim renders correctly in mock mode with a realistic giving total

---

## Visualization in mockMode

- [ ] T100 Create a /viz/ static route or page for visualizations
- [ ] T101 Implement D3-based Timeline Replay visualization (Ledger playback, scrubbable/animated)
- [ ] T102 Implement Worldview Cluster Map (force-directed/MDS projection)
- [ ] T103 Implement Settlement & Forgiveness Flow (Sankey/flow diagrams)
- [ ] T104 Implement Adjacency/Distance Heatmap or Chord Diagram
- [ ] T105 Implement Animated Ledger Evolution (replay worldview shifts)
- [ ] T106 Implement Personal/Community Analytics Dashboards
- [ ] T107 Implement Christian Context Overlays (forgiveness, regeneration events)
- [ ] T108 Make all visualizations available statically in mockMode using mock data
- [ ] T109 Add UI controls for switching between visualizations and timeline scrubbing
- [ ] T110 Document all visualizations and mockMode usage in README
- [ ] T111 Add sample export/download for reports and images

---

## Visualization Implementation Plan

1. Create a /viz/ static route or page in the client app for visualizations.
2. Use D3.js for all visualizations, loading mock data from src/client/mock/seed-data.js.
3. Implement each visualization as a separate module/component.
4. Add UI controls for switching visualizations and timeline scrubbing.
5. Ensure all visualizations work in mockMode (no backend required).
6. Document usage and provide sample exports for marketing/demo.



