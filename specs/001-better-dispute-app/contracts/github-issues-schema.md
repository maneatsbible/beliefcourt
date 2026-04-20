# Contract: GitHub Issues Schema

**disputable.io — Data Storage Contract**  
**Version**: 1.0.0 | **Date**: 2026-04-18  
**Plan**: [../plan.md](../plan.md)

This document defines the GitHub Issues schema that constitutes the external interface contract for all disputable.io data. Any code that reads or writes Issues MUST conform to this schema. Breaking changes require a `version` bump in the `DSP:META` block.

---

## Issue Body Format

Every disputable.io Issue body MUST begin with a metadata block in the following format, followed by a blank line and optional human-readable content:

```
<!-- DSP:META
{JSON object — see fields below}
-->

[Optional human-readable content: text and/or ![image](url)]
```

The `<!-- DSP:META ... -->` HTML comment is machine-readable but invisible in GitHub's rendered Issue view. The JSON MUST be valid. Any Issue lacking this block MUST be ignored by the app.

---

## DSP:META Fields

### Common fields (all entity types)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `string` (enum) | ✅ | Entity type — see values below |
| `version` | `integer` | ✅ | Schema version — always `1` for v1 |
| `appId` | `string` | ✅ | Always `"disputable.io"` — namespaces this repo from other uses |

### Type enum values

| Value | Entity |
|-------|--------|
| `"assertion"` | Assertion post |
| `"challenge"` | Challenge post |
| `"answer"` | Answer post |
| `"dispute"` | Dispute |
| `"agreement"` | Agreement |
| `"offer"` | Resolution offer (also has `dsp:assertion` label) |
| `"crickets-conditions"` | Proposed/agreed Crickets countdown |
| `"crickets-event"` | Recorded Crickets expiry event |

---

## Per-Type Schemas

### `type: "assertion"`

```jsonc
{
  "type": "assertion",
  "version": 1,
  "appId": "disputable.io",
  "parentId": null,           // null for top-level; number for offer (parentId = dispute root)
  "rootId": 42,               // GitHub issue number of root Assertion (self for top-level)
  "isOffer": false,           // true when submitted as a resolution offer
  "offeredInDisputeId": null, // Dispute issue number if isOffer=true
  "proxyAuthor": null         // "@herald" if posted on behalf of @herald; otherwise null
}
```

**Body content**: Title = first 80 chars of text. Body = full text or `![image](url)`. Top-level: text XOR image.

**GitHub labels**: `dsp:assertion`  
**GitHub label (offer)**: `dsp:assertion`, `dsp:offer`

---

### `type: "challenge"`

```jsonc
{
  "type": "challenge",
  "version": 1,
  "appId": "disputable.io",
  "parentId": 42,              // Issue number of the challenged Post
  "rootId": 42,                // Root Assertion of the tree
  "disputeId": 17,             // Dispute issue number created alongside this challenge
  "challengeType": "interrogatory" // "interrogatory" | "objection"
}
```

**Body content**: The challenge question/objection text. For Interrogatory, MUST be phrased as a yes/no question.

**GitHub labels**: `dsp:challenge`

---

### `type: "answer"`

```jsonc
{
  "type": "answer",
  "version": 1,
  "appId": "disputable.io",
  "parentId": 55,              // Issue number of the Challenge being answered
  "rootId": 42,
  "disputeId": 17,
  "yesNo": true,               // true|false for Interrogatory; null for Objection
  "counterChallengeId": null   // Issue number of counter-challenge Post if included; null otherwise
}
```

**Body content**: Response text (optional for Interrogatory, required for Objection). Image optional.

**GitHub labels**: `dsp:answer`

---

### `type: "dispute"`

```jsonc
{
  "type": "dispute",
  "version": 1,
  "appId": "disputable.io",
  "challengerId": 1234567,     // GitHub user id
  "defenderId": 7654321,       // GitHub user id
  "rootPostId": 42,            // Root Assertion at top of the dispute tree
  "triggerChallengeId": 55     // The first Challenge that created this Dispute
}
```

**Body content**: Auto-generated summary "Dispute: @challenger vs @defender over #{rootPostId}".

**GitHub labels**: `dsp:dispute`, `dsp:active`  
**GitHub labels (resolved)**: replace `dsp:active` with `dsp:resolved`  
**GitHub labels (crickets)**: add `dsp:crickets-event`

**Note**: Dispute status is derived from labels; the app reads the current label set to determine status.

---

### `type: "agreement"`

```jsonc
{
  "type": "agreement",
  "version": 1,
  "appId": "disputable.io",
  "assertionId": 42,           // Assertion being agreed with
  "personId": 7654321          // GitHub user id of the person agreeing
}
```

**Body content**: "I agree with #{assertionId}".

**GitHub labels**: `dsp:agreement`

---

### `type: "crickets-conditions"`

```jsonc
{
  "type": "crickets-conditions",
  "version": 1,
  "appId": "disputable.io",
  "disputeId": 17,
  "proposedByPersonId": 1234567,
  "agreedByPersonId": null,    // null until accepted; set to other party's user id on acceptance
  "durationMs": 86400000,      // e.g., 24 hours in milliseconds
  "currentDeadlineIso": null   // set when conditions become active and a new challenge is issued
}
```

**Body content**: "Crickets conditions proposed: {duration} per challenge. Dispute #{disputeId}."

**GitHub labels**: `dsp:crickets-conditions`

**Lifecycle**: A new Issue is written when conditions are accepted (agreedByPersonId populated). The `currentDeadlineIso` is updated by writing a **new** Issue of the same type with `agreedByPersonId` set and updated deadline — the latest-created Issue for a given `disputeId` with `dsp:crickets-conditions` is the canonical active conditions. (Append-only: never edit the original.)

---

### `type: "crickets-event"`

```jsonc
{
  "type": "crickets-event",
  "version": 1,
  "appId": "disputable.io",
  "disputeId": 17,
  "challengeId": 55,           // The unanswered Challenge
  "triggeredByPersonId": 1234567,
  "detectedAtIso": "2026-04-20T12:01:05Z"
}
```

**Body content**: "🦗 Crickets! @person failed to answer challenge #{challengeId} in Dispute #{disputeId}."

**GitHub labels**: `dsp:crickets-event`

---

## GitHub Labels — Required Setup

The following labels MUST be created in the shared repo before the app can write data. Label creation is part of the deployment/setup step (see [quickstart.md](../quickstart.md)).

| Label name | Color | Purpose |
|------------|-------|---------|
| `dsp:assertion` | `#e3b341` | Assertion post |
| `dsp:challenge` | `#bc8cff` | Challenge post |
| `dsp:answer` | `#3fb950` | Answer post |
| `dsp:dispute` | `#f85149` | Dispute instance |
| `dsp:agreement` | `#58a6ff` | Agreement record |
| `dsp:offer` | `#d29922` | Resolution offer |
| `dsp:crickets-conditions` | `#8b949e` | Crickets negotiation |
| `dsp:crickets-event` | `#ff7b72` | Crickets expiry event |
| `dsp:active` | `#238636` | Active dispute/process |
| `dsp:resolved` | `#484f58` | Resolved dispute |

---

## GitHub API Endpoints Used

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List top-level assertions | `GET` | `/repos/{owner}/{repo}/issues?labels=dsp:assertion&state=open&per_page=30` |
| Get single issue (Post/Dispute) | `GET` | `/repos/{owner}/{repo}/issues/{issue_number}` |
| List issues by dispute | `GET` | `/repos/{owner}/{repo}/issues?labels=dsp:dispute,dsp:active` |
| List posts in a tree | `GET` | `/repos/{owner}/{repo}/issues?labels=dsp:challenge&state=open` + client-side filter by `rootId` |
| Create a Post/Dispute/Event | `POST` | `/repos/{owner}/{repo}/issues` |
| Update dispute status label | `PATCH` | `/repos/{owner}/{repo}/issues/{issue_number}` (labels only) |
| Get authenticated user | `GET` | `/user` |
| Upload image attachment | `POST` | `/repos/{owner}/{repo}/issues` (markdown image in body via GitHub upload) |

---

## URL Param Schema

The app is controlled entirely via URL query params. All params are optional; absence renders the Home view.

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `view` | `string` | `dispute` | Active view — omit for Home |
| `id` | `number` | `17` | Dispute id (issue number) |
| `post` | `number` | `42` | Post id to deep-link |

**Canonical URL examples**:
- Home: `https://disputable.io/`
- Specific assertion: `https://disputable.io/?post=42`
- Dispute view: `https://disputable.io/?view=dispute&id=17`
- Dispute view at specific post: `https://disputable.io/?view=dispute&id=17&post=55`
