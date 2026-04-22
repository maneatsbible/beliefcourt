# Research: Truthbook

| Field | Value |
|---|---|
| **Version** | `v0.0.1-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Phase** | 0 — Unknowns resolved before design |
| **Created** | 2026-04-18 |
| **Last revised** | 2026-04-21 |
| **Plan** | [plan.md](plan.md) |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Constitution** | [TRUTHBOOK-CONSTITUTION.md](TRUTHBOOK-CONSTITUTION.md) |


---
## 1. GitHub Device Flow — Feasibility in Pure Browser JS

**Decision**: Use GitHub Device Flow (OAuth 2.0 Device Authorization Grant) for v1.

**How it works in-browser**:
1. `POST https://github.com/login/device/code` with `client_id` and `scope=repo user` → returns `device_code`, `user_code`, `verification_uri`, `interval`, `expires_in`.
2. App renders: "Visit github.com/login/device and enter: **ABCD-1234**" with a countdown.
3. App polls `POST https://github.com/login/oauth/access_token` every `interval` seconds until the user completes the flow or it expires.
4. On success, store the `access_token` in `sessionStorage` (not `localStorage` — tokens must not persist across sessions for security).
5. To resume a session gracefully, store the GitHub username in `localStorage` and re-prompt Device Flow on next visit.

**Security note**: The `client_id` is public (it identifies the OAuth App, not a secret). The Device Flow has no `client_secret` exchange — the secret is never needed client-side. This is the specific design for public/native clients.

**Scope required**: `repo` (to create/read Issues) + `read:user` (username/id).

**Rationale**: Zero-server, officially supported by GitHub for public clients (CLI tools, TV apps, browser extensions). The primary UX tradeoff — leaving the app briefly — is acceptable for a developer-oriented tool in v1.

**Alternatives considered**:
- Standard OAuth redirect: Requires server-side token exchange (client_secret). Rejected for v1 (no server).
- Personal Access Token: Simpler but no "sign in" UX. Retained as a fallback/power-user option (documented in quickstart).

---

## 2. GitHub Issues as Append-Only Database — Schema Design

**Decision**: One GitHub Issue per logical entity (Post, Case). Structured metadata stored as a JSON front-matter block in the Issue body, followed by human-readable content. No Issue is ever edited after creation.

**Encoding approach**:
```
<!-- DSP:META
{
  "type": "assertion|challenge|answer|case|agreement|crickets|offer",
  "version": 1,
  "parentId": 42,
  "caseId": 17,
  "postType": "interrogatory|objection",
  "yesNo": true|false|null,
  "deadline": "2026-04-19T12:00:00Z"
}
-->

Human-readable content here (text and/or image markdown).
```

**Labels used** (must be pre-created in the shared repo):
- `dsp:assertion`, `dsp:challenge`, `dsp:answer`, `dsp:dispute`, `dsp:agreement`, `dsp:crickets`, `dsp:offer`
- `dsp:resolved`, `dsp:active`, `dsp:crickets-event`

**Querying**:
- List all top-level assertions: `GET /repos/{owner}/{repo}/issues?labels=dsp:assertion&state=open`
- List all issues in a dispute: `GET /repos/{owner}/{repo}/issues?labels=dsp:dispute:{id}` (dynamic label per dispute)
- The `parentId` field in the meta block encodes the tree structure (parent Issue number).

**Rationale**: JSON comment block is invisible in GitHub's rendered Issue view but trivially parseable in JS. Labels enable efficient server-side filtering. No Issue edits — only new Issues — preserves the append-only model and the full audit log.

**Alternatives considered**:
- Issue comments as child posts: Harder to label/filter; loses the individual-Issue addressability needed for canonical URLs. Rejected.
- Issue title encoding: Brittle, length-limited, clashes with human readability. Rejected.

---

## 3. ETag Caching Strategy

**Decision**: `localStorage`-backed ETag cache with conditional GET requests.

**Implementation pattern**:
```js
// On every GET:
const cached = localStorage.getItem(`etag:${url}`);
const headers = cached ? { 'If-None-Match': JSON.parse(cached).etag } : {};
const res = await fetch(url, { headers });
if (res.status === 304) return JSON.parse(cached).data;  // free
const data = await res.json();
localStorage.setItem(`etag:${url}`, JSON.stringify({ etag: res.headers.get('ETag'), data }));
return data;
```

**Pre-fetch strategy**: After Home feed renders, use `IntersectionObserver` to detect visible cards and pre-fetch their Dispute detail (if any) while the user is reading.

**Cache invalidation**: On every write (new Issue created), invalidate all affected cache keys (the parent Issue's issue list endpoint and the Home feed list).

**Rate-limit budget**:
- 5 000 req/hr authenticated ÷ ~60 min = ~83 req/min headroom.
- A typical user session (view feed + open 2–3 disputes + submit 1 challenge) uses ~15–25 requests. ETag 304s count against rate limit but at a lower cost signal from GitHub (still counted). Acceptable.

**Rationale**: ETag conditional GETs are the GitHub-documented approach for minimizing rate-limit consumption. `localStorage` provides cross-tab and cross-navigation persistence.

**Alternatives considered**:
- `sessionStorage` only: No cross-tab benefit, full re-fetch on every page load. Rejected.
- GitHub GraphQL API: Would allow batching nested entities in fewer requests but adds query complexity and different cache semantics. Deferred to v2 as a rate-limit optimisation.

---

## 4. MVC in Plain Vanilla JS — Pattern

**Decision**: ES module-based MVC with no framework.

**Controller pattern**:
```js
// case-controller.js
export class CaseController {
  constructor(model, apiClient) { ... }
  canChallenge(person, post) { ... }   // returns bool
  canAnswer(person, challenge) { ... }
  canCase(person, post) { ... }
  canAgree(person, assertion) { ... }
  canOffer(person, caseObj) { ... }
  canDeclareCrickets(person, caseObj) { ... }
  // Actions:
  async submitChallenge(person, post, challengeData) { ... }
  async submitAnswer(person, challenge, answerData) { ... }
}
```

**View pattern**: Views receive a controller reference and call `can*()` methods to decide enabled/disabled state. No logic in the View beyond rendering.

**Routing**: URL hash params (`?view=dispute&id=42`) read on `DOMContentLoaded` and on `popstate`. No client-side router library.

**Rationale**: Clean separation is achievable in vanilla JS with ES modules. No virtual DOM or reactivity framework is needed because the dataset is small (GitHub API responses) and re-renders are triggered explicitly on user actions (not continuous streams of state changes).

---

## 5. Crickets Countdown — Client-Triggered Write

**Decision**: Write-on-first-detection.

**Protocol**:
1. When CricketsConditions are agreed, a new Issue is written with `type: "crickets-conditions"` containing `{ deadline: ISO8601, challengeId, disputeId }`.
2. Every client loading the Dispute View checks: `if (Date.now() > deadline && !cricketsEventExists)`.
3. The first client to detect expiry attempts to write a `type: "crickets-event"` Issue. GitHub's issue creation is not atomic, but race conditions produce at most one extra duplicate Issue; the UI de-dupes by treating the earliest `created_at` among `dsp:crickets-event` Issues in the dispute as the canonical event.
4. The Crickets event UI (visual + audio) is shown to both parties.

**Audio**: Web Audio API oscillator chain simulating a cricket chirp (alternating 4-5 kHz tones in a rapid pattern). No audio files needed.

**Rationale**: The "write-on-first-detection" pattern is the only viable approach without a server. The de-duplication strategy handles rare race conditions gracefully. GitHub's API is eventually consistent enough for this use case.

---

## 6. Testing Without External Libraries

**Decision**: Custom micro test-runner in `tests/runner.js`.

**Capabilities needed**:
- `describe` / `it` / `expect` primitives
- `beforeEach` / `afterEach` hooks
- Coverage: Use V8's built-in coverage (`--experimental-vm-modules` in Node for server-side, or Coverage DevTools protocol in browser)
- CI: Run tests via Node with `--experimental-vm-modules` flag; no Jest/Vitest needed

**Coverage gate enforcement**: Use `c8` (a Node.js coverage tool that wraps V8 native coverage) as the sole "tooling" dependency — it is a dev-tool, not a runtime library, so it does not violate the "no external libraries" runtime constraint. Confirm this interpretation is acceptable.

**Alternative**: Use the browser's native `console.assert` and manually track pass/fail. Rejected — insufficient for the 80/85% coverage gate.

**Rationale**: `c8` is a thin CLI wrapper around V8's built-in coverage data. It produces no runtime dependencies in the shipped code. The constitution's "no external libraries" constraint is read as applying to shipped/runtime code, not dev tooling (consistent with the intent to keep the browser bundle clean).

---

## 7. Dark Theme Design System (CSS Custom Properties)

**Decision**: Single `main.css` with CSS custom property tokens. No CSS framework.

**Core tokens**:
```css
:root {
  --color-bg:           #0d1117;   /* GitHub-dark baseline */
  --color-surface:      #161b22;
  --color-surface-2:    #21262d;
  --color-border:       #30363d;
  --color-text:         #e6edf3;
  --color-text-muted:   #8b949e;
  --color-accent-blue:  #58a6ff;
  --color-accent-green: #3fb950;   /* Answer ✓ */
  --color-accent-yellow:#d29922;   /* Your turn badge */
  --color-accent-red:   #f85149;   /* Crickets / hostile */
  --color-accent-purple:#bc8cff;   /* Challenge ? */
  --color-disabled:     #484f58;
  --radius-card:        8px;
  --shadow-stack-1:     0 2px 0 1px var(--color-border);
  --shadow-stack-2:     0 4px 0 2px var(--color-border);
}
```

**Rationale**: CSS custom properties provide a coherent design system with zero runtime overhead. The palette is inspired by GitHub's own dark mode to feel natural given the GitHub back-end.
