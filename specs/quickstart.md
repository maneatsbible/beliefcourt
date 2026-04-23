# Quickstart: Truthbook — Development Setup

| Field | Value |
|---|---|
| **Version** | `v0.0.1-pre-alpha` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Created** | 2026-04-18 |
| **Last revised** | 2026-04-21 |
| **Plan** | [plan.md](plan.md) |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Constitution** | [TRUTHBOOK-CONSTITUTION.md](/specs/TRUTHBOOK-CONSTITUTION.md) |

---

## Prerequisites

- A GitHub account (your personal account is fine for local dev)
- A GitHub OAuth App (see step 1)
- A GitHub repository to use as the data store (see step 2)
- A modern browser (Chrome 110+, Firefox 110+, Safari 16+)
- Node.js 20+ (for running tests only — not used at runtime)
- A local HTTP server (e.g., Python's `http.server` or `npx serve`)

---

## Step 1 — Create a GitHub OAuth App

1. Go to **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
  - **Application name**: `Truthbook (dev)`
   - **Homepage URL**: `http://localhost:8080`
   - **Authorization callback URL**: *(leave blank — Device Flow does not use a callback URL)*
3. Click **Register application**.
4. Note the **Client ID** (it is public — safe to commit in config).
5. Do **not** generate a Client Secret — Device Flow does not require one.

---

## Step 2 — Create the Data Repository

1. Create a new public or private GitHub repository (e.g., `disputableio/disputable-data`).
2. Run the label setup script to create the required `dsp:*` labels:

```bash
# Requires the GitHub CLI (gh) and authentication
bash scripts/setup-labels.sh disputableio/disputable-data
```

Or create labels manually (see the label table in [contracts/github-issues-schema.md](contracts/github-issues-schema.md)).

---

## Step 3 — Configure the App

Copy the sample config and fill in your values:

```bash
cp src/config.sample.js src/config.js
```

Edit `src/config.js`:

```js
// src/config.js
export const CONFIG = {
  githubClientId: 'Ov23li...',          // Your OAuth App Client ID
  appName: 'Truthbook',                 // product name shown in the UI
  dataRepo: 'disputableio/disputable-data', // owner/repo of your data repository
  heraldLogin: 'bd-herald',            // GitHub username of the @herald account
  appVersion: '0.1.0',
};
```

> **Note**: `src/config.js` is gitignored. Never commit your `dataRepo` path if you want it private.

---

## Step 4 — Run Locally

No build step required. Serve `index.html` directly:

```bash
# Python (built-in)
python3 -m http.server 8080

# Or Node
npx serve . -p 8080
```

Open `http://localhost:8080` in your browser.

---

## Step 5 — Authenticate

1. Click **Sign in with GitHub** in the app header.
2. The app shows a short code (e.g., `ABCD-1234`) and opens `github.com/login/device` in a new tab.
3. Enter the code on GitHub and authorize the OAuth App.
4. Return to the app — it detects completion and loads your profile.

> **Token storage**: The access token is stored in `sessionStorage` and cleared on tab close. Your `@name` is stored in `localStorage` for session-resume prompts.

---

## Step 6 — Run Tests

```bash
# Run all tests (requires Node 20+ for ES module support)
node --experimental-vm-modules tests/runner.js

# Run with coverage (requires c8 dev dependency)
npx c8 node --experimental-vm-modules tests/runner.js

# Check coverage thresholds (≥80% per module, ≥85% project)
npx c8 check-coverage --lines 85 --functions 85 --branches 80
```

---

## @herald Setup

@herald is a reserved system placeholder used to import external content for immediate disputation. When you quote something from the internet, you submit it as a Claim attributed to @herald with a simultaneous Challenge. The real author can later authenticate and claim ownership.

To enable it:

1. Create a GitHub account named `bd-herald` (or your preferred login).
2. Create a Personal Access Token for that account with `repo` scope.
3. Add the token to your data repo's Secrets (for CI/CD) or to a local `.env` file:

```bash
# .env (never commit this)
HERALD_TOKEN=ghp_xxxxxxxxxxxx
```

The app uses this token only when a user explicitly toggles "Import as @herald".

---

## Project Structure Reference

```
src/
├── api/          # GitHub API client, cache, Device Flow auth
├── model/        # Data entities (Person, Post, Dispute, …)
├── controller/   # Permission gates + action logic
├── view/         # Render functions + components
└── utils/        # URL helpers, audio, icons

styles/
└── main.css      # Design tokens + dark theme

tests/
├── runner.js     # Custom micro test-runner
├── unit/
├── integration/
└── e2e/

index.html        # App shell
src/config.js     # Local config (gitignored)
src/config.sample.js  # Template to copy
```

---

## Common Development Patterns

### Adding a new permission gate

1. Add `canXxx(person, entity)` to `src/controller/dispute-controller.js` or `home-controller.js`.
2. Write unit tests in `tests/unit/controller/`.
3. Call `controller.canXxx(currentUser, entity)` in the relevant View component to set `disabled` state.
4. Never put the logic in the View.

### Writing a new Issue (Post/Event)

All writes go through `src/api/github-client.js`:

```js
await githubClient.createIssue({
  title: '...',
  body: buildBody(meta, content),   // from src/api/github-client.js helper
  labels: ['dsp:challenge'],
});
```

After creation, invalidate affected cache keys via `cache.invalidate(url)`.

### Deep-linking to a Post or Dispute

```js
// src/utils/url.js
setUrlParams({ view: 'dispute', id: 17, post: 55 });
getUrlParams(); // → { view: 'dispute', id: '17', post: '55' }
```

The app controller re-renders on `popstate` and on initial `DOMContentLoaded`.
