# Implementation Plan: Truthbook

| Field | Value |
|---|---|
| **Version** | `v0.0.1-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Feature branch** | `001-truthbook-app` |
| **Created** | 2026-04-18 |
| **Last revised** | 2026-04-21 |
| **Spec** | [spec.md](spec.md) |
| **AI assistant** | GitHub Copilot (GPT-4.1) |
| **Constitution** | [TRUTHBOOK-CONSTITUTION.md](/specs/TRUTHBOOK-CONSTITUTION.md) |

---


## Summary

Truthbook is a browser-only JavaScript SPA, targeting **mobile browsers first, desktop browsers second**. It is backed by a lightweight Hono API server running on Fly.io, with a distributed, append-only, cryptographically signed log as the primary data store. Identity is established through social media OAuth (X, Threads, GitHub). All content records are stored in the distributed ledger, replicated and verified by independent Keyholder nodes. The architecture is strict MVC: all permission logic in the Controller, dumb rendering in the View, DB entities mapped directly in the Model. The MVP **requires a fully functional mockMode implementation and mock datasets for all major flows**.

## Technical Context

**Language/Version**: JavaScript ES2022+ for frontend; Node.js 22 LTS + Hono for API server  

**Primary Dependencies**: Any JavaScript libraries may be used in the browser as needed. Server: Hono (minimal, ~14 KB), jose (JWT), node-cron (deadline detection)  
| **Storage**: Distributed, append-only, cryptographically signed Belief Ledger replicated across Keyholder nodes (Kafka). Snapshots and backups to S3-compatible storage.  
| **Auth**: Social OAuth (X, Threads, GitHub) → server-side token exchange → signed JWT (HS256, 24h expiry) returned to client  
| **Testing**: Custom micro test-runner (JS, no framework)
| **Target Platform**: Modern desktop browsers — Chrome 110+, Firefox 110+, Safari 16+, Edge 110+  
| **Project Type**: Static frontend (CDN or Fly.io static asset serving) + Hono API server on Fly.io  
| **Performance Goals**: Home feed first render ≤ 2 s; challenge/answer round-trip ≤ 4 s; LCP ≤ 2.5 s; CLS ≤ 0.1  
| **Constraints**: Append-only, cryptographically signed records; all writes are peer-verified and replicated.  
| **Scale/Scope**: Horizontally scalable—Keyholder nodes can be added for increased throughput and redundancy. No single point of failure.  
---

## Infrastructure: Distributed Keyholder Deployment

### Application topology

```
Keyholder Node (Docker container or bare metal)
  ├── Hono API server (Node.js 22, port 8080)
  ├── Distributed append-only log (Kafka)
  ├── Merkle root computation and signature verification
  ├── Peer-to-peer replication and gossip
  └── Static frontend assets served by Hono (or CDN edge)

S3-compatible object storage
  └── Signed snapshots and backups (point-in-time restore)
```

### Deployment

Keyholder nodes are deployed as containers or on bare metal, each running the full protocol stack. Nodes discover peers via DNS, static config, or gossip. All data is replicated and verified across nodes. Snapshots and backups are stored in S3-compatible storage for disaster recovery.

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


## Data Model and Schema


All data structures are append-only and cryptographically signed. New entity types or fields require a constitutional amendment and coordinated upgrade of all Keyholder nodes. The distributed Belief Ledger is the canonical source of truth, and all schema evolution is governed by constitutional process. No migration from previous architectures is required.

**Person Storage and Privacy:**
Person entities are stored as first-class records in the distributed, append-only, cryptographically signed log, ensuring auditability and constitutional compliance. For privacy, performance, and GDPR compliance, a privacy-aware side index (e.g., SQLite) is maintained for fast lookup and PII management. The log stores only pseudonymous or hashed references for PII fields, while the side index enables selective deletion or anonymization as required by law. This hybrid approach balances auditability, privacy, and performance.

## Scaling and Migration Planning

Truthbook is natively horizontally scalable. Keyholder nodes can be added or removed with no single point of failure. All data is replicated and verified across nodes using deterministic, cryptographically signed logs. All scaling is handled by adding nodes and partitioning via Spaces.

## Known Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Keyholder collusion | Medium | Constitutional controls, transparent proofs, broad operator base |
| Space policy drift | Medium | Strong constitutional inheritance + explicit duel-approved overrides |
| Citation explosion (large accord sets) | High | Snapshot hashing + indexed citation tables |
| Ledger growth | High long-term | Space snapshots, archival tiering, aggressive index strategy |
| Namespace abuse | Medium | Global handle governance, moderation and identity controls by constitution |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design. Updated 2026-04-20.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | MVC enforces SRP by design. Each module has one responsibility. Distributed log pattern isolates persistence from business logic. |
| II. Testing Standards | ⚠️ TENSION | Browser frontend forbids external libraries. Custom micro test-runner (~50 lines, pure JS) satisfies coverage gates without violating no-library constraint. Server-side code uses Node.js test runner (built-in, no library). |
| III. UX Consistency | ✅ PASS | Dark theme, design tokens in CSS custom properties, WCAG 2.1 AA target. Tooltips on all interactive controls. Minimum 44×44px tap targets. |
| IV. Performance | ✅ PASS | HTTP cache headers from API, viewport pre-fetch, LCP/CLS targets encoded in spec SC-004/SC-005. Analytics scripts loaded defer/async. |
| V. Security | ✅ PASS | Parameterised queries (no ORM, no SQL injection); JWT HS256 with server-side secret stored in Fly.io secrets; OAuth state param (CSRF protection); append-only distributed log; IP hashing in maintenance composer (no raw PII); CSP headers; rate limiting on write endpoints; CORS locked to app origin; `npm audit` blocks CI. |
| VI. Openness | ✅ PASS | Full judgment participation is free and requires no payment. Ads appear only for unauthenticated users. Tipping has zero effect on Record visibility, strength, or Duel eligibility. Constitutional constraint encoded in Tip model (no access gates). |
| VII. Disclosure | ✅ PASS | Every Record carries `is_ai`, `ai_model`, `ai_assisted` fields. UI renders disclosure badge on every affected card. @herald imports carry `[Imported · @handle · Platform]` label. Sponsored content is prohibited. |
| VIII. Analytics Privacy | ✅ PASS | Plausible (primary) collects no PII, no cookies, no consent banner required. GA4 (secondary) uses IP anonymisation. Neither analytics provider receives personally identifiable data. |

**Gate decision**: PASS with one documented tension (Testing Standards). The micro test-runner approach resolves the conflict.

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

## Operational Requirements: CRUD Entity Hardening, Audit, and Privacy

All Person entities and mutable (CRUD) tables must comply with the following requirements (moved from the constitutional charter):

- **Strict access controls:** Users may only update their own data. Administrative updates are allowed only for legitimate, auditable reasons.
- **Audit logging:** Every create, update, and delete action must be logged, including who performed the action, what changed, when, and the old/new values.
- **Soft deletes:** Deletion must be implemented as a soft delete (marking as deleted/disabled), not physical removal, to preserve history and accountability.
- **Input validation and sanitization:** All input must be validated and sanitized to prevent injection and other attacks.
- **Strong authentication and authorization:** All user-related actions must require strong authentication and proper authorization.
- **Regular backups:** User tables and audit logs must be regularly backed up to prevent data loss.

**Person Storage and Privacy:**
Person entities must be stored as first-class records in the distributed, append-only, cryptographically signed log (the Belief Ledger or equivalent), ensuring a tamper-evident, auditable, and constitutionally compliant record of all identity-related actions. For privacy, performance, and regulatory compliance (including GDPR), a privacy-aware, query-optimized side index (such as SQLite) must be maintained for fast Person lookup, authentication, and profile queries. Personally identifiable information (PII) is stored in the side index, which supports selective deletion or anonymization as required by law. The distributed log stores only pseudonymous references or hashed data for PII fields, ensuring that the authoritative ledger remains immutable and auditable, while the side index enables compliance with “right to be forgotten” and other privacy requests. This hybrid approach balances auditability, privacy, and performance.

These requirements apply to all CRUD entities, present and future. Immutable (append-only) entities, such as Records in the Belief Ledger, are governed by their own constitutional rules of immutability and auditability.

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
├── client/                         # Browser frontend
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
│   │   ├── log-adapter.js          # distributed log implementation (Kafka/NATS/Custom Raft)
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
│   └── db.test.js                  # DB adapter integration tests (mock distributed log)
└── e2e/
    └── flows/                      # Critical user journey scripts

Dockerfile
fly.toml
start.sh

```
