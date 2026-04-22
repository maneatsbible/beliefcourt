# Implementation Plan: Truthbook
Truthbook is a browser-only, plain vanilla JavaScript SPA backed by a lightweight Hono API server running on Fly.io, with SQLite (WAL mode) as the primary database streamed to S3-compatible storage via Litestream. Identity is established through social media OAuth (X, Threads, Bluesky, GitHub) — no GitHub API calls are made for data storage. All content records are stored in the application's own database. The architecture is strict MVC: all permission logic in the Controller, dumb rendering in the View, DB entities mapped directly in the Model.

The GitHub Issues PoC (truthbook.io, formerly disputable.io) proved the domain model. This plan implements the production architecture.

| Field | Value |
|---|---|
| **Version** | `v0.1.0-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Feature branch** | `001-better-dispute-app` |
| **Created** | 2026-04-18 |
| **Last revised** | 2026-04-21 |
| **Spec** | [spec.md](spec.md) |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Governed by** | [constitution.md](constitution.md) — supersedes all other documents |

---

## Spec Index

| Document | Role |
|---|---|
| [spec.md](spec.md) | Functional requirements |
| **[plan.md](plan.md)** | Implementation architecture and deployment — you are here |
| [data-model.md](data-model.md) | Database schema and entity definitions |
| [tasks.md](tasks.md) | Implementation tasks (SDLC) |
| [quickstart.md](quickstart.md) | Development environment setup |
| [research.md](research.md) | Pre-design unknowns and resolved decisions |
| [stakeholder-briefing.md](stakeholder-briefing.md) | Public financial projections and constitutional crowdfunding |
| [viral-growth-model.md](viral-growth-model.md) | Growth flywheels and acquisition model |
| [constitution.md](constitution.md) | **Governing document — supersedes all others** |
| [distributed-architecture.md](distributed-architecture.md) | Keyholder program, Truth Statements, cryptographic hardening, and fork mechanism |

---

## Table of Contents

- [Summary](#summary)
- [Technical Context](#technical-context)
- [Infrastructure: Fly.io Deployment](#infrastructure-flyio-deployment)
- [Maintenance Mode](#maintenance-mode)
- [Database Schema](#database-schema)
- [Scaling and Migration Planning](#scaling-and-migration-planning)
- [Known Risks and Mitigations](#known-risks-and-mitigations)
- [Constitution Check](#constitution-check)
- [Analytics Integration](#analytics-integration)
- [Project Structure](#project-structure)
- [Complexity Tracking](#complexity-tracking)

---

## Summary

judgmental.io is a browser-only, plain vanilla JavaScript SPA backed by a lightweight Hono API server running on Fly.io, with SQLite (WAL mode) as the primary database streamed to S3-compatible storage via Litestream. Identity is established through social media OAuth (X, Threads, Bluesky, GitHub) — no GitHub API calls are made for data storage. All content records are stored in the application's own database. The architecture is strict MVC: all permission logic in the Controller, dumb rendering in the View, DB entities mapped directly in the Model.

The GitHub Issues PoC (disputable.io) proved the domain model. This plan implements the production architecture.

## Technical Context

**Language/Version**: Vanilla JavaScript ES2022+ (no transpilation) for frontend; Node.js 22 LTS + Hono for API server  
**Primary Dependencies**: Zero external JS libraries in the browser. Server: Hono (minimal, ~14 KB), better-sqlite3, jose (JWT), node-cron (deadline detection)  
**Storage**: SQLite (WAL mode) on Fly.io persistent volume; Litestream continuous replication to Tigris (S3-compatible, free on Fly.io)  
**Auth**: SM OAuth (X, Threads, Bluesky, GitHub) → server-side token exchange → signed JWT (HS256, 24h expiry) returned to client  
**Testing**: Custom micro test-runner (plain JS, no framework)  
**Target Platform**: Modern desktop browsers — Chrome 110+, Firefox 110+, Safari 16+, Edge 110+  
**Project Type**: Static frontend (Fly.io static asset serving or CDN) + Hono API server on Fly.io  
**Performance Goals**: Home feed first render ≤ 2 s; challenge/answer round-trip ≤ 4 s; LCP ≤ 2.5 s; CLS ≤ 0.1  
**Constraints**: Append-only record tables (no UPDATE/DELETE on content); single Fly.io instance for SQLite write serialisation; WAL mode for concurrent reads  
**Scale/Scope**: Single-instance SQLite handles ~500 concurrent users, ~10k writes/day comfortably. Migration path to Postgres when needed.

---

## Infrastructure: Fly.io Deployment

### Application topology

```
Fly.io Machine (single instance, shared-cpu-1x, 256 MB)
  ├── Hono API server (Node.js 22, port 8080)
  ├── SQLite database file (/data/judgmental.db, WAL mode)
  ├── Litestream sidecar (continuous replication → Tigris S3)
  └── Static frontend assets served by Hono (or Fly.io CDN edge)

Tigris (S3-compatible object storage, free on Fly.io)
  └── Litestream WAL replicas (point-in-time restore)
```

### fly.toml (outline)

```toml
app = "truthbook-io"
primary_region = "lax"

[build]
  dockerfile = "Dockerfile"

[mounts]
  source = "judgmental_data"
  destination = "/data"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false   # keep alive — no cold starts
  auto_start_machines = true
  min_machines_running = 1

[checks]
  [checks.api]
    type = "http"
    path = "/health"
    interval = "15s"
    timeout = "5s"
```

### Dockerfile (outline)

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache sqlite litestream curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 8080
CMD ["sh", "start.sh"]
```

`start.sh` — restores from Litestream backup on cold start, then launches both Litestream and the API server:

```sh
#!/bin/sh
litestream restore -if-replica-exists -config /etc/litestream.yml /data/judgmental.db
litestream replicate -config /etc/litestream.yml &
node src/server.js
```

---

## Maintenance Mode

### Design

Maintenance mode is a first-class operational state, not an afterthought. When engaged, the app serves a styled maintenance page instead of the normal UI. The maintenance page includes:

- A brief message explaining the outage (editable via environment variable or admin API endpoint)
- A **Composer** — an always-available text field where visitors can submit their email or a message to be notified when the app returns. These submissions are written to a separate `maintenance_messages` table that is independent of the main application schema. If the DB is unavailable, messages fall back to a Fly.io KV store or a flat append-only log file on the persistent volume.
- App version, estimated return if known, and a status link.

### Implementation

Maintenance mode is controlled by a single environment variable: `MAINTENANCE_MODE=true`. The Hono server checks this at request time (not startup) so it can be toggled without redeployment via `fly secrets set MAINTENANCE_MODE=true`.

```
API middleware order:
  1. /health — always passes (Fly.io health check must not be blocked)
  2. /maintenance/submit — always passes (composer POST endpoint)
  3. MAINTENANCE_MODE check → serve maintenance.html for all other routes
  4. Normal routing
```

The maintenance page (`maintenance.html`) is a standalone static HTML file with inline CSS — zero JS dependencies, zero API calls required to render it. The composer submits via a plain HTML form POST to `/maintenance/submit`. This works even if the frontend JS bundle fails to load.

### Maintenance Composer fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `contact` | `string` | No | Email or SM handle |
| `message` | `string` | No | Freeform (max 500 chars) |
| `createdAt` | `ISO8601` | Auto | Server timestamp |
| `ip_hash` | `string` | Auto | SHA-256 of IP, for dedup — never stored raw |

---

## Database Schema

### Versioning and migrations

Migrations are plain numbered SQL files in `db/migrations/`:

```
db/
  migrations/
    001_initial_schema.sql
    002_add_similarity_links.sql
    003_add_base_of_truth.sql
    ...
  seed/
    dev_seed.sql
  migrate.js      ← runs pending migrations on server startup
```

`migrate.js` reads a `schema_migrations` table (created on first run), compares to files on disk, and runs any pending migrations in order. Idempotent — safe to run on every startup.

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     INTEGER PRIMARY KEY,
  filename    TEXT NOT NULL,
  applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Core tables (Migration 001)

```sql
-- Persons and linked SM identities
CREATE TABLE persons (
  id           TEXT PRIMARY KEY,   -- UUID v4
  display_name TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE linked_identities (
  id              TEXT PRIMARY KEY,
  person_id       TEXT NOT NULL REFERENCES persons(id),
  platform        TEXT NOT NULL,   -- 'x' | 'threads' | 'bluesky' | 'github'
  platform_user_id TEXT NOT NULL,
  handle          TEXT NOT NULL,
  verified_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(platform, platform_user_id)
);

-- All content records (append-only: no UPDATE/DELETE triggers enforce this)
CREATE TABLE records (
  id            TEXT PRIMARY KEY,  -- UUID v4
  type          TEXT NOT NULL,     -- 'claim'|'challenge'|'answer'|'offer'|'response'
  author_id     TEXT NOT NULL REFERENCES persons(id),
  parent_id     TEXT REFERENCES records(id),
  case_id       TEXT REFERENCES cases(id),
  text          TEXT,
  image_url     TEXT,
  source_url    TEXT,              -- for @herald imports
  attributed_handle TEXT,          -- @handle on external platform
  attributed_platform TEXT,        -- 'x'|'threads' etc.
  integrity_hash TEXT NOT NULL,    -- SHA-256 of canonical fields
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE cases (
  id                  TEXT PRIMARY KEY,
  subject_record_id   TEXT NOT NULL REFERENCES records(id),
  opened_by_person_id TEXT NOT NULL REFERENCES persons(id),
  trigger_challenge_id TEXT NOT NULL REFERENCES records(id),
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE duels (
  id            TEXT PRIMARY KEY,
  case_id       TEXT NOT NULL REFERENCES cases(id),
  challenger_id TEXT NOT NULL REFERENCES persons(id),
  defender_id   TEXT NOT NULL REFERENCES persons(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE dispositions (
  id                    TEXT PRIMARY KEY,
  duel_id               TEXT NOT NULL REFERENCES duels(id),
  type                  TEXT NOT NULL,  -- 'accord'|'default'|'withdrawal'
  triggered_by_person_id TEXT NOT NULL REFERENCES persons(id),
  detected_at           TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE accords (
  id          TEXT PRIMARY KEY,
  duel_id     TEXT NOT NULL REFERENCES duels(id),
  offer_id    TEXT NOT NULL REFERENCES records(id),
  response_id TEXT NOT NULL REFERENCES records(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE claim_accords (
  id         TEXT PRIMARY KEY,
  claim_id   TEXT NOT NULL REFERENCES records(id),
  person_id  TEXT NOT NULL REFERENCES persons(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(claim_id, person_id)
);

CREATE TABLE deadline_conditions (
  id                   TEXT PRIMARY KEY,
  duel_id              TEXT NOT NULL REFERENCES duels(id),
  proposed_by_person_id TEXT NOT NULL REFERENCES persons(id),
  agreed_by_person_id  TEXT REFERENCES persons(id),
  duration_ms          INTEGER NOT NULL,
  active               INTEGER NOT NULL DEFAULT 0,
  current_deadline_iso TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE moments (
  id               TEXT PRIMARY KEY,
  subject_record_id TEXT NOT NULL REFERENCES records(id),
  duel_id          TEXT NOT NULL REFERENCES duels(id),
  author_id        TEXT NOT NULL REFERENCES persons(id),
  text             TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE analyses (
  id         TEXT PRIMARY KEY,
  duel_id    TEXT NOT NULL REFERENCES duels(id),
  author_id  TEXT NOT NULL REFERENCES persons(id),
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE analysis_moments (
  analysis_id TEXT NOT NULL REFERENCES analyses(id),
  moment_id   TEXT NOT NULL REFERENCES moments(id),
  PRIMARY KEY (analysis_id, moment_id)
);

CREATE TABLE judgments (
  id                    TEXT PRIMARY KEY,
  duel_id               TEXT NOT NULL REFERENCES duels(id),
  judge_id              TEXT NOT NULL REFERENCES persons(id),
  analysis_id           TEXT NOT NULL REFERENCES analyses(id),
  verdict               TEXT NOT NULL,  -- 'challenger'|'defender'
  base_of_truth_claim_id TEXT NOT NULL REFERENCES records(id),
  reasoning             TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE base_of_truth (
  person_id        TEXT PRIMARY KEY REFERENCES persons(id),
  anchor_claim_id  TEXT NOT NULL REFERENCES records(id),
  declared_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE similarity_links (
  id          TEXT PRIMARY KEY,
  author_id   TEXT NOT NULL REFERENCES persons(id),
  record_a_id TEXT NOT NULL REFERENCES records(id),
  record_b_id TEXT NOT NULL REFERENCES records(id),
  reasoning   TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(record_a_id, record_b_id)
);

-- Append-only enforcement triggers (no UPDATE or DELETE on content tables)
CREATE TRIGGER records_no_update BEFORE UPDATE ON records BEGIN
  SELECT RAISE(ABORT, 'records table is append-only');
END;
CREATE TRIGGER records_no_delete BEFORE DELETE ON records BEGIN
  SELECT RAISE(ABORT, 'records table is append-only');
END;

-- Maintenance mode composer submissions
CREATE TABLE maintenance_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  contact    TEXT,
  message    TEXT,
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_records_type ON records(type);
CREATE INDEX idx_records_author ON records(author_id);
CREATE INDEX idx_records_parent ON records(parent_id);
CREATE INDEX idx_records_case ON records(case_id);
CREATE INDEX idx_cases_subject ON cases(subject_record_id);
CREATE INDEX idx_duels_case ON duels(case_id);
CREATE INDEX idx_claim_accords_claim ON claim_accords(claim_id);
CREATE INDEX idx_claim_accords_person ON claim_accords(person_id);
CREATE INDEX idx_judgments_duel ON judgments(duel_id);
CREATE INDEX idx_linked_identities_person ON linked_identities(person_id);
```

### Extended tables (Migration 002)

```sql
-- AI disclosure fields on records (alter existing table)
ALTER TABLE records ADD COLUMN is_ai      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE records ADD COLUMN ai_model   TEXT;
ALTER TABLE records ADD COLUMN ai_assisted INTEGER NOT NULL DEFAULT 0;

-- AI persona fields on persons (alter existing table)
ALTER TABLE persons ADD COLUMN is_ai    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE persons ADD COLUMN ai_model TEXT;

-- Evidence: structured attachments on any Record
CREATE TABLE evidence (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id       INTEGER NOT NULL REFERENCES records(id),
  author_id       INTEGER NOT NULL REFERENCES persons(id),
  attachment_type TEXT NOT NULL CHECK(attachment_type IN ('url','quote','image','file')),
  title           TEXT,
  url             TEXT,
  text            TEXT,
  file_path       TEXT,
  source_url      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_evidence_record ON evidence(record_id);

-- Exhibits: formally submitted Evidence in a Duel
CREATE TABLE exhibits (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id                INTEGER NOT NULL REFERENCES duels(id),
  evidence_id            INTEGER NOT NULL REFERENCES evidence(id),
  submitted_by_person_id INTEGER NOT NULL REFERENCES persons(id),
  exhibit_label          TEXT NOT NULL,  -- "A", "B", "C" ...
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(duel_id, exhibit_label)
);
CREATE INDEX idx_exhibits_duel ON exhibits(duel_id);

-- Tips: voluntary peer-to-peer support
CREATE TABLE tips (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  from_person_id          INTEGER NOT NULL REFERENCES persons(id),
  to_person_id            INTEGER NOT NULL REFERENCES persons(id),
  amount_cents            INTEGER NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'USD',
  subject_record_id       INTEGER REFERENCES records(id),
  payment_provider        TEXT NOT NULL CHECK(payment_provider IN ('stripe','kofi')),
  stripe_payment_intent_id TEXT,
  platform_fee_percent    INTEGER NOT NULL DEFAULT 0,
  created_at              TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_tips_to ON tips(to_person_id);
CREATE INDEX idx_tips_from ON tips(from_person_id);

-- Append-only triggers for new content tables
CREATE TRIGGER evidence_no_update BEFORE UPDATE ON evidence BEGIN
  SELECT RAISE(ABORT, 'evidence table is append-only');
END;
CREATE TRIGGER evidence_no_delete BEFORE DELETE ON evidence BEGIN
  SELECT RAISE(ABORT, 'evidence table is append-only');
END;
CREATE TRIGGER exhibits_no_update BEFORE UPDATE ON exhibits BEGIN
  SELECT RAISE(ABORT, 'exhibits table is append-only');
END;
CREATE TRIGGER exhibits_no_delete BEFORE DELETE ON exhibits BEGIN
  SELECT RAISE(ABORT, 'exhibits table is append-only');
END;
```



### Application versioning

Semantic versioning: `MAJOR.MINOR.PATCH`

- `MAJOR`: breaking changes to the data model or API contract
- `MINOR`: new features, new entity types, new API endpoints
- `PATCH`: bug fixes, performance improvements, UI changes

Version is stored in `package.json` and displayed in the app header (FR-044). The API exposes it at `GET /version`.

### Database versioning

Migration version numbers are sequential integers matching the filename prefix (`001`, `002`, ...). The running migration version is readable at `GET /version` alongside the app version. A mismatch between expected and actual migration version on startup is a fatal error — the server refuses to start until migrations are applied.

### API versioning

API routes are prefixed: `/api/v1/...`. A breaking schema change increments the route prefix to `/api/v2/...` and the old version remains available for one major app version cycle before deprecation.

---

## Scaling and Migration Planning

### Current ceiling (SQLite single-instance)

| Metric | Practical limit | Notes |
|--------|----------------|-------|
| Concurrent reads | ~1,000/s | WAL mode; reads don't block each other |
| Concurrent writes | ~200/s | Serialised; WAL mode reduces contention |
| Database file size | ~10 GB comfortable | SQLite handles TB-scale but Litestream replication gets slower |
| Active users (concurrent) | ~500 | Estimated; depends heavily on write mix |

### Migration trigger signals

These are the operational signals that indicate it is time to migrate from SQLite to Postgres:

1. Write latency (p95) exceeds 200ms under normal load
2. Database file size exceeds 5 GB
3. Need to run more than one Fly.io instance (horizontal scaling required)
4. Litestream replication lag exceeds 10 seconds consistently

### Migration path: SQLite → Postgres

The schema is designed to be Postgres-compatible with minor changes:
- `TEXT PRIMARY KEY` UUIDs → `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- SQLite `datetime('now')` → Postgres `NOW()`
- SQLite triggers → Postgres triggers (same logic, different syntax)
- `INTEGER` booleans → `BOOLEAN`

Migration procedure:
1. Spin up Postgres instance (Fly.io Postgres or Supabase)
2. Run schema DDL with Postgres dialect
3. Export SQLite data to CSV/JSON via `sqlite3` CLI
4. Import to Postgres
5. Verify row counts and integrity hashes
6. Blue/green deploy: new instance points to Postgres, old SQLite instance stays live during cutover
7. DNS/proxy switch when verified
8. Decommission SQLite instance

Estimated migration effort: 1–2 days. No application logic changes required if the DB adapter layer is properly abstracted.

### DB adapter layer

The server uses a thin adapter pattern so the database driver is never called directly from business logic:

```
src/server/
  db/
    adapter.js       ← interface: query(), run(), transaction()
    sqlite.js        ← better-sqlite3 implementation
    postgres.js      ← pg implementation (stubbed until needed)
  model/
    claim.js         ← uses db/adapter, never db/sqlite directly
    duel.js
    ...
```

Swapping backends = swap `adapter.js` import. All queries remain unchanged.

---

## Known Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| SQLite write serialisation bottleneck under viral load | Medium | WAL mode; single writer is sufficient for projected v1 scale; migration path to Postgres is documented and straightforward |
| Fly.io machine restart loses in-memory state | Low | All state is in SQLite on persistent volume; Litestream restores on cold start; no in-memory-only state |
| Litestream replication lag on backup | Low | Litestream replicates every WAL frame; maximum data loss is seconds; test restore procedure quarterly |
| X (Twitter) OAuth policy change or cost increase | High | X is one of multiple providers; no core feature requires X specifically; new providers addable without schema changes |
| Threads (Meta) app review delay | Low | Basic profile OAuth scope requires minimal review; submit early; app functions without Threads |
| JWT secret compromise | High | Secrets stored in Fly.io secrets (not env file, not repo); rotate via `fly secrets set`; short-lived tokens (24h) limit exposure window |
| Concurrent Default Disposition writes (two clients detect deadline simultaneously) | Medium | DB UNIQUE constraint on `(duel_id, type)` in dispositions table makes the second write fail gracefully; first writer wins; client handles constraint error without UI error |
| Schema migration failure on deploy | Medium | Migrations run before server accepts traffic; failed migration = failed deploy = previous version stays live; migrations are tested in CI against a copy of the production schema |
| Persistent volume data corruption | Low | Litestream provides point-in-time restore; SQLite WAL provides crash safety; Fly.io volumes are on NVMe with redundancy |
| Single region latency for non-US users | Low | SQLite single-write constraint means single-region for writes; reads could be served from edge cache in v2; acceptable for v1 |
| Node.js/Hono security vulnerabilities | Medium | `npm audit` in CI; Dependabot alerts; Hono has minimal attack surface; no ORM reduces injection surface |
| Over-aggressive caching serving stale Claim strength | Low | Strength is computed at query time; cache TTL set to 60s on KV; explicit cache bust on any write to claim_accords or dispositions |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design. Updated 2026-04-20.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | MVC enforces SRP by design. Each module has one responsibility. DB adapter pattern isolates persistence from business logic. |
| II. Testing Standards | ⚠️ TENSION | Browser frontend forbids external libraries. Custom micro test-runner (~50 lines, pure JS) satisfies coverage gates without violating no-library constraint. Server-side code uses Node.js test runner (built-in, no library). |
| III. UX Consistency | ✅ PASS | Dark theme, design tokens in CSS custom properties, WCAG 2.1 AA target. Tooltips on all interactive controls. Minimum 44×44px tap targets. |
| IV. Performance | ✅ PASS | HTTP cache headers from API, viewport pre-fetch, LCP/CLS targets encoded in spec SC-004/SC-005. Analytics scripts loaded defer/async. |
| V. Security | ✅ PASS | Parameterised queries (no ORM, no SQL injection); JWT HS256 with server-side secret stored in Fly.io secrets; OAuth state param (CSRF protection); append-only DB triggers; IP hashing in maintenance composer (no raw PII); CSP headers; rate limiting on write endpoints; CORS locked to app origin; `npm audit` blocks CI. |
| VI. Openness | ✅ PASS | Full judgment participation is free and requires no payment. Ads appear only for unauthenticated users. Tipping has zero effect on Record visibility, strength, or Duel eligibility. Constitutional constraint encoded in Tip model (`platform_fee_percent DEFAULT 0`, no access gates). |
| VII. Disclosure | ✅ PASS | Every Record carries `is_ai`, `ai_model`, `ai_assisted` fields. UI renders disclosure badge on every affected card. @herald imports carry `[Imported · @handle · Platform]` label. Sponsored content is prohibited. |
| VIII. Analytics Privacy | ✅ PASS | Plausible (primary) collects no PII, no cookies, no consent banner required. GA4 (secondary) uses IP anonymisation. Neither analytics provider receives personally identifiable data. |

**Gate decision**: PASS with one documented tension (Testing Standards). The micro test-runner approach resolves the conflict.

---

## Analytics Integration

### Plausible Analytics (primary)

[Plausible](https://plausible.io) is an open-source, privacy-first web analytics tool. It collects no personally identifiable information, sets no cookies, and requires no GDPR/CCPA consent banner. It is fully self-hostable on Fly.io as a separate app instance, or available as a hosted service at $9/month for up to 10k monthly page views.

**Integration**: A single `<script>` tag in `index.html`. No build step, no npm package.

```html
<script defer data-domain="truthbook.io"
  src="https://plausible.io/js/script.js"></script>
```

For self-hosted: replace `https://plausible.io/js/script.js` with your own Plausible instance URL.

**What it tracks**: Page views, referrers, browser/OS, country — all aggregated, no per-user data. Custom events (e.g. `plausible('challenge-submitted')`) can be fired from the Controller after key actions.

**Why Plausible first**: No consent UX overhead. No cookie banner. EU-hosted option available. Dashboard is public-shareable if desired. Aligns with platform's disclosure principles.

### Google Analytics 4 (secondary)

GA4 is required for Google Ads conversion tracking (FR-079). Integrated alongside Plausible.

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
</script>
```

`anonymize_ip: true` is mandatory. The GA4 `Measurement ID` (`G-XXXXXXXXXX`) is stored as a public config value (not a secret — it appears in HTML source by design).

**Loading strategy**: Both scripts are loaded with `async`/`defer` after the critical content paint (appended by `app.js` after `DOMContentLoaded`). They MUST NOT block first render.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-better-dispute-app/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── api-schema.md    ← REST API contract (replaces github-issues-schema.md)
└── tasks.md             ← Phase 2 output (via /speckit.tasks)
```

### Source Code Structure

```text
src/
├── client/                         # Browser frontend (vanilla JS, no build step)
│   ├── app.js                      # Entry point — bootstraps controller, renders shell
│   ├── api/
│   │   ├── client.js               # Fetch wrapper for truthbook.io REST API
│   │   └── auth.js                 # SM OAuth PKCE flow + JWT storage
│   ├── model/
│   │   ├── person.js               # Person entity + herald attribution
│   │   ├── record.js               # Record base + Claim/Challenge/Answer/Offer/Response
│   │   ├── duel.js                 # Duel + Case + Disposition entities
│   │   └── judgment.js             # Judgment + Analysis + BaseOfTruth entities
│   ├── controller/
│   │   ├── app-controller.js       # Top-level routing, auth state, URL param handling
│   │   ├── home-controller.js      # Home feed, canChallenge, canAgree gates
│   │   └── case-controller.js      # Case/Duel turn logic, canAnswer, canOffer, canJudge, canDeclareDefault
│   ├── view/
│   │   ├── home-view.js            # Home feed, Claim cards, Case Chooser
│   │   ├── case-view.js            # Case View, Duel Chooser, two-lane layout, lineage header
│   │   └── components/
│   │       ├── record-card.js      # Record card (all types), copy URL button, type icon
│   │       ├── composer.js         # Inline slide-up challenge/answer/offer composer
│   │       ├── header.js           # App header bar
│   │       └── notification.js     # Toast notification component
│   └── utils/
│       ├── url.js                  # URL param read/write helpers
│       ├── audio.js                # Web Audio API default-event chirp generator
│       └── icons.js                # SVG icon constants (!, ?, ✓, ⇌, scales, etc.)
│
├── server/                         # Hono API server (Node.js 22)
│   ├── server.js                   # Entry point — mounts routes, middleware
│   ├── db/
│   │   ├── adapter.js              # DB interface: query(), run(), transaction()
│   │   ├── sqlite.js               # better-sqlite3 implementation
│   │   ├── postgres.js             # pg implementation (stubbed until migration needed)
│   │   └── migrate.js              # Runs pending migrations on startup
│   ├── routes/
│   │   ├── auth.js                 # SM OAuth callback + JWT issuance
│   │   ├── claims.js               # Claim CRUD + ClaimAccord endpoints
│   │   ├── cases.js                # Case + Duel endpoints
│   │   ├── records.js              # Challenge/Answer/Offer/Response endpoints
│   │   ├── judgments.js            # Analysis + Judgment endpoints
│   │   ├── maintenance.js          # Maintenance composer POST endpoint
│   │   └── version.js              # GET /version + GET /health
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification middleware
│   │   ├── maintenance.js          # MAINTENANCE_MODE check + pass-through exceptions
│   │   └── rate-limit.js           # Simple in-memory rate limiter (per IP)
│   └── model/
│       ├── claim.js                # Claim DB queries (uses db/adapter)
│       ├── duel.js                 # Duel/Case DB queries
│       ├── person.js               # Person + LinkedIdentity queries
│       └── judgment.js             # Judgment/Analysis/BaseOfTruth queries
│
└── public/                         # Static assets served by Hono
    ├── index.html                  # App shell
    ├── maintenance.html            # Standalone maintenance page (inline CSS, no JS deps)
    └── favicon.ico

db/
├── migrations/
│   ├── 001_initial_schema.sql
│   └── ...
└── seed/
    └── dev_seed.sql

styles/
└── main.css                        # CSS custom properties (design tokens), dark theme

tests/
├── runner.js                       # Custom micro test-runner (browser, ~50 lines)
├── unit/
│   ├── model/                      # Record, Person, Duel, Judgment unit tests
│   └── controller/                 # Permission gate unit tests (canChallenge etc.)
├── integration/
│   ├── api-client.test.js          # API client contract tests (mock fetch)
│   └── db.test.js                  # DB adapter integration tests (in-memory SQLite)
└── e2e/
    └── flows/                      # Critical user journey scripts

Dockerfile
fly.toml
start.sh
litestream.yml
```

---

## Complexity Tracking

| Tension | Why Accepted | Simpler Alternative Rejected Because |
|---------|-------------|--------------------------------------|
| Custom micro test-runner (browser) | Constitution II requires 80/85% coverage; browser frontend forbids external libs | No external test framework can run without a build step or node_modules in the browser |
| SQLite single-writer constraint | Simplest possible DB; zero managed infra; fully owned | Postgres adds operational complexity not justified at v1 scale; migration path is documented |
| Server-side deadline detection | No client can be trusted to reliably fire a deadline event; a server-side cron job (node-cron, 1-minute tick) is simpler and more reliable than relying on the first browser client to load past the deadline | Client-side detection is a race condition at scale |
| DB adapter pattern | Required for SQLite → Postgres migration path with zero business logic changes | Direct driver calls would make migration a rewrite |
| Maintenance mode as env var toggle | Zero-downtime mode switch without redeployment; no admin UI needed in v1 | A DB-stored flag would require the DB to be available — defeating the purpose during DB maintenance |
