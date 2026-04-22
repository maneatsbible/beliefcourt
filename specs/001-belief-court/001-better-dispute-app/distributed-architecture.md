# Distributed Architecture & Blockchain Hardening Strategy

| Field | Value |
|---|---|
| **Version** | `v0.1.0-pre-alpha` |
| **Status** | 🔴 Strategic Specification — Roadmap Phase 2 |
| **Created** | 2026-04-22 |
| **Spec** | [spec.md](spec.md) |
| **Plan** | [plan.md](plan.md) |
| **Constitution** | [constitution.md](constitution.md) |
| **Phase** | Visionary; implementation deferred to Phase 2 (post-MVP) |

---

## Overview

BELIEF COURT achieves blockchain-like properties **without blockchain**. The system is architected for **distributed, sovereign operation** where independent Keyholders maintain copies of the Belief Ledger, earn rewards for their stewardship, and collectively govern the network through Constitutional Duels and shared Truth Statements.

**Key thesis**: Decentralization is achieved not through consensus protocols or token incentives, but through:
1. **Cryptographic immutability** — Every Record is signed by its author; the Ledger is append-only
2. **Distributed replication** — Independent Keyholders run nodes and share a synchronized Belief Ledger
3. **Constitutional governance** — Majority Judgment on Constitutional Duels determines network rules
4. **Truth-grounded coordination** — Shared Accords on Truth Statements establish the epistemic foundation for all Judgments
5. **Fork rights** — Any subset of Keyholders can export and establish a new Ledger (Space)

This architecture makes centralized corruption impossible while preserving the ability to evolve, fix bugs, and scale organically.

---

## Table of Contents

- [Phase 1: Foundation (Current — Single-Instance SQLite)](#phase-1-foundation-current--single-instance-sqlite)
- [Phase 2: Distributed Ledger (Keyholder Program)](#phase-2-distributed-ledger-keyholder-program)
- [Keyholder Node Architecture](#keyholder-node-architecture)
- [Truth Statement Foundation](#truth-statement-foundation)
- [Constitutional Amendment via Distributed Consensus](#constitutional-amendment-via-distributed-consensus)
- [Cryptographic Proof & Integrity](#cryptographic-proof--integrity)
- [Backup & Recovery Strategy](#backup--recovery-strategy)
- [Fork Mechanism](#fork-mechanism)
- [Self-Refutation Logic](#self-refutation-logic)
- [Implementation Roadmap](#implementation-roadmap)

---

## Phase 1: Foundation (Current — Single-Instance SQLite)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Fly.io Machine (Single Instance)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ Hono API Server      │  │ Node.js 22 Worker    │         │
│  │ (Port 8080)          │  │ Process (Deadline    │         │
│  ├──────────────────────┤  │ Detection, Cron)     │         │
│  │ • OAuth Token Auth   │  └──────────────────────┘         │
│  │ • JWT (HS256, 24h)   │                                    │
│  │ • Record Serializ.   │  ┌──────────────────────┐         │
│  │ • Case/Duel Router   │  │ Persistent Volume    │         │
│  │ • Judgment Ledger    │  │ /data/judgmental.db  │         │
│  └──────────────────────┘  │ (SQLite WAL mode)    │         │
│                             └──────────────────────┘         │
│                                     ▲                        │
│                                     │ Litestream            │
│                                     │ Continuous            │
│                                     │ Replication           │
│                                     ▼                        │
│                         ┌─────────────────┐                  │
│                         │ Tigris S3       │                  │
│                         │ (WAL Replicas)  │                  │
│                         └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Static Frontend (Fly.io CDN or S3)                          │
│ • Vanilla JS ES2022+                                         │
│ • localStorage for caching                                   │
│ • No external JS libraries                                   │
└────────────────────────────────────────────────────────────┘
```

### Ledger Integrity in Phase 1

All data is stored in a single SQLite append-only state. Immutability is enforced at the application layer:

| Table | Enforcement | Strategy |
|-------|-------------|----------|
| `records` | Append-only | No UPDATE/DELETE allowed at application layer; schema has no DELETE triggers |
| `cases` | Append-only | Cases cannot be closed or modified, only new records appended |
| `duels` | Append-only | Disposition is a terminal Record, not an UPDATE to the Duel |
| `judgments` | Append-only | Judgments cannot be recalled or edited |
| `accords` | Append-only | Accords are permanent; rescission is a new Record |

**Cryptographic Binding in Phase 1**:
- Every Record is signed with the author's PK (asymmetric, deterministic)
- Signature is stored alongside the Record in the DB
- On retrieval, the signature is verified against the author's public key
- Ledger hash (Merkle tree of all Records) is computed at query time
- Ledger hash is published daily as a signed proof to an append-only external log (e.g. DNS TXT record, or a free log aggregator)

### Backup Strategy in Phase 1

**Primary**: Litestream continuous replication to Tigris (S3-compatible, free tier on Fly.io)
- Point-in-time restore capability
- Automatic failover if primary machine is lost
- Monthly signed snapshots published to a public archive

**Secondary**: Manual export of Ledger as JSON every 24h
- Contains full chain of Records with signatures and timestamps
- Published to GitHub Releases
- Anyone can verify Ledger state by comparing hashes

---

## Phase 2: Distributed Ledger (Keyholder Program)

### Vision

In Phase 2 (post-MVP), BELIEF COURT becomes a **distributed P2P network** where:

1. **Independent Keyholders** run nodes maintaining a copy of the Belief Ledger
2. **Rewards are earned** by Keyholders for stewardship, uptime, and serving Ledger queries
3. **Consensus is achieved** through Constitutional Duels (majority Judgment)
4. **Truth Statements** form the shared epistemic foundation
5. **Growth is unbounded** — new Keyholders can join, existing ones can exit

No blockchain is used. Instead:
- Ledger is a replicated SQLite database w/ vector clocks or CRDT semantics for ordering
- Consensus is achieved through application-layer voting (Constitutional Duels)
- Rewards flow to Keyholders based on staked capital, uptime, and query volume served
- Security is achieved through cryptographic signing, audit trails, and fork rights

---

## Keyholder Node Architecture

### Node Structure

Each Keyholder runs a **Belief Court Node** — a lightweight server that:

```
┌────────────────────────────────────────────────────────────────┐
│ Keyholder Node (Independent Machine)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Hono API Server (Port 8080, behind reverse proxy)       │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ • Syncs Belief Ledger from peer nodes (gossip protocol) │   │
│ │ • Verifies signatures on all Records                    │   │
│ │ • Serves read queries (Query Index)                     │   │
│ │ • Routes writes to Coordinator Node                     │   │
│ │ • Caches Judgments for local Worldview derivation       │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Belief Ledger (Local Copy)                              │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ • SQLite with WAL mode (read replicas don't lock       │   │
│ │ • CRDT-annotated Records (vector clock or timestamp)   │   │
│ │ • Query Index (materialized view of searchable records) │   │
│ │ • Merkle Tree of all Records (computed on sync)        │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Sync & Consensus Engine                                 │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ • Gossip protocol (peer discovery via DHT or Bootstrap  │   │
│ │ • Record fetch & signature verification                 │   │
│ │ • Merkle tree reconciliation (efficient diff detection) │   │
│ │ • Conflict resolution (Byzantine-tolerant ordering)    │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Coordinator Node (Single, elected via Constitutional    │   │
│ │ Duel; can be moved to a different Keyholder)           │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ • Accepts writes (new Records from authenticated users) │   │
│ │ • Verifies authorship (JWT from authenticated session)  │   │
│ │ • Assigns vector clock or timestamp                     │   │
│ │ • Broadcasts to other nodes (gossip)                    │   │
│ │ • Replicates Dispositions (terminal Records)           │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Monitoring & Telemetry                                   │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ • Heartbeat to bootstrap nodes                          │   │
│ │ • Ledger State Hash published every 10 min              │   │
│ │ • Uptime & Query latency tracked for rewards            │   │
│ │ • Node reputation score (based on data accuracy)        │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Records are Written to Coordinator Only

**Write Flow**:
1. Authenticated user submits new Record (Claim, Challenge, Answer, Offer, Response, Judgment) to any Keyholder node
2. Node verifies JWT signature + person authorization
3. Node routes write request to **Coordinator Node** (elected Keyholder)
4. Coordinator verifies Record structure and author signature
5. Coordinator appends Record to its Belief Ledger with vector clock timestamp
6. Coordinator broadcasts new Record to all peer nodes via gossip
7. Peers verify signature and append locally
8. Coordinator replicas to all nodes until all confirm receipt (or timeout)

**Why Coordinator-based writes?** Append-only, single-writer SQLite serialization. Multiple Coordinators writing concurrently would require consensus (slow). A single Coordinator is fast, and the role can be transferred via Constitutional Duel if the Coordinator becomes adversarial.

### Keyholder Identity & Rewards

Each Keyholder is a Person with special attributes:

| Field | Type | Notes |
|---|---|---|
| `id` | `integer` | Person id |
| `name` | `string` | `@keyholder-node-name` (reserved namespace) |
| `nodePublicKey` | `string` | Ed25519 public key of the node's signing key |
| `stakeAmount` | `decimal` | Escrowed capital (in-app currency or fiat) |
| `coordinatorRound` | `integer` | The Constitutional Duel #id in which this Keyholder was elected Coordinator |
| `isCoordinator` | `boolean` | true if currently elected; only one Coordinator at a time |
| `uptimePercent` | `float` | Last 30-day uptime %; used for reward calculation |
| `totalQueriesServed` | `integer` | Cumulative queries answered by this node |
| `reputationScore` | `float` | 0–1; based on data accuracy and Byzantine tolerance |

**Reward Model** (Phase 2 onwards):

```
Monthly Reward = BasePayout × (Stake × Uptime × ReputationScore × QueryVolume)
```

- **BasePayout**: Set by Constitutional Duel; typically $100–1000/month per active Keyholder
- **Stake**: Higher stake = higher reward (incentivizes long-term commitment)
- **Uptime**: 99.9% uptime gets full multiplier; lower uptime degrades reward
- **ReputationScore**: Nodes that consistently serve accurate data get higher scores
- **QueryVolume**: Nodes that serve more queries get higher rewards (incentivizes peering)

Payments are processed monthly via the Payout system (off-chain, via Stripe or kofi link pointing to the Keyholder's tip address).

---

## Truth Statement Foundation

### What is a Truth Statement?

A **Truth Statement** is a shared Accord held by a subset of the network that declares a foundational epistemic principle — i.e. the basis on which all Judgments by signatories are grounded.

Examples:
- *"Truth is real and knowable. We ground our Judgments in scripture as interpreted by the Church fathers and the confessions of Protestant Christendom."*
- *"Truth is real and knowable. We ground our Judgments in empiricism, logic, and peer-reviewed science."*
- *"Truth is a matter of perspective. We ground our Judgments in the lived experience and self-determination of the parties."*
- *"Truth is relative. We have no final authority."* ← **Self-refuting**

### Self-Refutation Detection

BELIEF COURT has a built-in philosophical trap for relativism:

**Claim**: *"Truth is relative; what you believe is as true as what I believe."*

**Analysis**: This claim is itself a Truth Statement. By the claimant's own standard, their claim that "truth is relative" is just another perspective — no more true than the opposite claim "truth is NOT relative."

**Consequence**: The claimant has asserted a truth claim about truth, and in doing so has undermined it. This is NOT a debate tactic. This is a structural feature of the Ledger.

**Implementation**:
- When a Judgment cites a Truth Statement, the system verifies that the Base of Truth is internally consistent (not self-refuting for relativism)
- A Judgment cannot cite *only* relativistic claims while asserting a position
- Analytics engine surfaces "self-refuting claims" as a diagnostic category (not as an attack, but as a structural observation)
- Users can see: *"This worldview contains a logical contradiction; click to explore."*

### Truth Statement Registry

A special table in the Belief Ledger:

| Field | Type | Notes |
|---|---|---|
| `id` | `integer` | Auto-increment |
| `accordId` | `integer` | The Accord Record that created this Truth Statement |
| `name` | `string` | Human-readable name (e.g., "Reformed Protestantism") |
| `description` | `text` | The statement itself (as a Claim or Accord description) |
| `signatoryCount` | `integer` | How many Persons/Keyholders have endorsed this |
| `createdAt` | `ISO8601` | When the statement was first recorded |
| `isActive` | `boolean` | true if currently used by Keyholders; false if deprecated |

**Endorsement Process**:
1. A Person or Keyholder creates a new Truth Statement as a Claim, discussing it with community
2. One or more Constitutional Duels refine the statement
3. Keyholders vote (via Judgment) to add it to the registry
4. Once approved, Judgments on future Duels cite the Truth Statement as their Base of Truth

### Truth Statements and the Distributed Network

Each Keyholder's node is configured with a **Truth Statement Profile** — a list of Truth Statements it endorses:

| Keyholder | Truth Statements Endorsed |
|---|---|
| @keyholder-reformed-church | Reformed Protestantism, Historical Continuity |
| @keyholder-empiricist | Scientific Empiricism, Peer Review Authority |
| @keyholder-interfaith | Lived Experience, Self-Determination (relativistic) |

**Consequence**: When a Judgment is recorded, it declares both the Duel verdict AND the Base of Truth used. Keyholders can filter or weight Judgments based on epistemological alignment:

```sql
SELECT * FROM judgments 
WHERE duelId = ? 
  AND baseOfTruthId IN (
    SELECT id FROM truth_statements 
    WHERE name ILIKE 'Reformed%'
  )
ORDER BY reputationScore DESC
```

This creates **consensual federations** — groups of Keyholders that share epistemic ground and thus produce more coherent Judgment streams.

---

## Constitutional Amendment via Distributed Consensus

### Constitutional Duel Mechanics

A **Constitutional Duel** is a special Case filed directly against [constitution.md](constitution.md) or against a principle within it.

**Status**: Anyone can file a Constitutional Duel (free, no stake required).

**Structure**:
1. Challenger files a Claim proposing an amendment
2. Defender (default: the Keyperson/Foundation or any Keyholder by consent) responds
3. The Duel proceeds normally — turns, evidence, judgments, disposition
4. At Disposition, if verdict is "Accord", the amendment is adopted

**Adoption Threshold**: 
- Majority of active Keyholders' Judgments must agree
- Supermajority (66%) for constitutional amendments affecting governance
- Simple majority (50%) for procedural or user-facing changes

**Implementation**:
- The application code has a `CONSTITUTION_HASH` constant
- When an amendment is adopted, `CONSTITUTION_HASH` is updated, triggering a recompile and redeploy
- All Keyholders must redeploy within 7 days or risk deactivation
- Phase-in period: amendment is announced but not enforced for 14 days, allowing graceful upgrade

### Example: Coordinator Rotation

**Amendment Proposal**:
- Challenger: @alice (a Person)
- Claim: *"The Coordinator should rotate every 30 days, not be reelected indefinitely."*
- Defense: @keyholder-primary (current Coordinator)

**Duel**:
- 20 Keyholders file Judgments
- 15 judge "Accord — Rotate every 30 days"
- 5 judge "Defended — Indefinite tenure is better"

**Result**: 75% supermajority agreement. Amendment is adopted.

**Implementation**:
- Coordinator election Constitutional Duel is scheduled automatically every 30 days
- Code change: `COORDINATOR_TENURE_DAYS = 30` is updated
- All Keyholders redeploy within 7 days
- On day 31, the current Coordinator is automatically transitioned to a non-Coordinator node, and the next Coordinator is elected

---

## Cryptographic Proof & Integrity

### Record Signing

Every Record is signed at creation time:

```javascript
// Pseudocode
const record = {
  id: 12345,
  type: "claim",
  authorId: 99,
  text: "Bitcoin is a path to freedom.",
  createdAt: "2026-04-22T10:30:00Z",
};

const recordPayload = JSON.stringify(record, Object.keys(record).sort());
const signature = await crypto.subtle.sign(
  "Ed25519",
  authorPrivateKey,
  new TextEncoder().encode(recordPayload)
);

const recordInLedger = {
  ...record,
  signature: base64(signature),
  signatureAlgorithm: "Ed25519",
};
```

**Verification** (performed on every read):
```javascript
const isValid = await crypto.subtle.verify(
  "Ed25519",
  authorPublicKey,
  hex2bytes(recordInLedger.signature),
  new TextEncoder().encode(recordPayload)
);
```

### Ledger Merkle Tree

A cryptographic proof that the Ledger is a valid append-only chain:

```
Level 0 (Records):
├─ Record 1 → Hash(Record 1 + Sig 1) = H1
├─ Record 2 → Hash(Record 2 + Sig 2) = H2
├─ Record 3 → Hash(Record 3 + Sig 3) = H3
└─ Record 4 → Hash(Record 4 + Sig 4) = H4

Level 1 (Pairs):
├─ Hash(H1 + H2) = H12
└─ Hash(H3 + H4) = H34

Level 2 (Root):
└─ Hash(H12 + H34) = ROOT_HASH
```

**Published Daily**:
- At 00:00 UTC, the Merkle root is computed
- Root hash is signed by the Coordinator's key
- Proof is published to:
  1. A free append-only log (e.g., Certificate Transparency-style)
  2. DNS TXT record (e.g., `_belief-court-merkle.example.com`)
  3. GitHub Releases (signed git tag)
  4. Arweave (permanent immutable storage)

**Consequence**: 
- Anyone can download the current Merkle root
- Anyone can verify that past Ledgers have not been retroactively altered
- If the Merkle root changes for a past date, it's obvious proof of tampering

### Query Integrity Proofs

When a Keyholder responds to a user query, it can include a **Merkle proof**:

```
User Query: "Give me all Claims by @alice"

Response:
{
  records: [
    { id: 100, authorId: 99, text: "...", signature: "..." },
    { id: 105, authorId: 99, text: "...", signature: "..." },
  ],
  merkleProof: [
    { hash: "H1", side: "left", level: 0 },
    { hash: "H34", side: "right", level: 1 },
  ],
  ledgerRootHash: "ROOT_HASH",
  ledgerRootHashSignature: "...", // Coordinator signed this
  ledgerCommitTime: "2026-04-22T00:00:00Z"
}
```

**Verification**:
- User has the published Merkle root from 2026-04-22
- User reconstructs the path using the Merkle proof
- User verifies each Record's signature
- User verifies each record hash against the Merkle proof
- User verifies the Merkle proof against the root
- **If all match, the query is cryptographically proven**

This prevents a Keyholder from lying about what Records exist.

---

## Backup & Recovery Strategy

### Phase 1 (Single-Instance) Backups

**Primary Backup**: Litestream → Tigris (S3-compatible)
- Continuous replication (every 10 seconds)
- Point-in-time restore capability
- Free tier on Fly.io

**Secondary Backup**: Daily JSON export
- Every 24h, the entire Belief Ledger is exported as JSON
- Export is signed (Coordinator's key)
- Published to GitHub Releases, S3, Arweave
- Anyone can restore from this if Tigris is unavailable

**Tertiary Backup**: Monthly archive to Arweave
- Permanent, immutable storage
- Costs ~$, but one-time per archive
- Acts as a canonical timestamped snapshot

### Phase 2 (Distributed) Backups

Each Keyholder maintains a full copy of the Belief Ledger. This is the primary backup strategy:

**Replication redundancy**:
- Minimum 3 Keyholders online at any time (consensus threshold)
- Each Keyholder holds a full copy
- If one node fails, others replicate and serve queries
- If all nodes fail, data persists on disk; first node back online replicates to rejoining nodes

**Cross-network archival**:
- Every Constitutional amendment triggers an archive snapshot
- Archive is replicated to all major Keyholder nodes
- Archive is published to Arweave for 200+ year permanence

### Recovery Process

**Scenario 1: Single Keyholder Node Fails**
1. Node operator brings machine back online
2. Node performs sync with peer nodes (gossip protocol)
3. Any missing Records are fetched and verified
4. Node is operational within minutes

**Scenario 2: All Keyholders Fail Simultaneously**
1. Not recoverable (single point of failure). **This is why Phase 2 requires N ≥ 3 Keyholders.**
2. After Phase 2 launch, network is designed for N ≥ 10 active Keyholders

**Scenario 3: Data Corruption Detected**
1. Weekly audit job compares Merkle roots across all Keyholders
2. If a Keyholder's Merkle root diverges, it is marked as suspicious
3. Coordinator stops accepting writes from the corrupted node
4. Alert is broadcast to all Keyholders
5. Corrupted node syncs from a healthy peer
6. If corruption persists, Keyholder is deactivated via Constitutional Duel

---

## Fork Mechanism

The ultimate check against tyranny.

### Fork Rights

Section 1.3 of the foundational constitution states:

> If BELIEF COURT governance fails — if legitimacy is lost, if the Ledger is corrupted, if the process becomes tyrannical — **the People have the right to fork.**

### Implementation

**Step 1: Export Ledger**
```bash
# Any Keyholder or Person can run this
curl https://coordinator-node.example.com/api/ledger/export \
  > belief-court-fork-2026-04-22.json

# Output: Full Belief Ledger as JSON (all Records + signatures)
# Size: ~1 GB for 1M records, ~100 GB for 100M records
```

**Step 2: Verify Export**
```bash
# Compute Merkle root of exported ledger
# Compare against published Merkle root from known time
# Verify all record signatures

node verify-ledger-export.js belief-court-fork-2026-04-22.json
# Output: ✓ Export verified. 1,000,000 records, root hash: abc123...
```

**Step 3: Establish New Space**
```bash
# Start a new Keyholder node as the first node in a new Space
docker run -e LEDGER_EXPORT=belief-court-fork-2026-04-22.json \
  -e SPACE_NAME="belief-court-reformed" \
  -e FOUNDER_NAME="@council-of-reformers" \
  belief-court-node:latest

# New Space is initialized with the forked ledger
# New Space has its own root Constitution
# New Coordinator is elected from the forking Keyholders
```

**Step 4: Declare Independence**
1. New Space publishes a **Fork Declaration** (signed Claim)
2. Fork Declaration cites the reason (e.g., "Original Coordinator has become corrupt")
3. Fork Declaration is recorded in BOTH the original and new Ledger
4. Users can choose to join the new Space or remain in the original
5. Persons who exist in both Spaces have separate identities in each (no sync)

### Post-Fork Scenario

```
Original BELIEF COURT
├─ @coordinator-original (elected by original community)
├─ 50 Keyholders
├─ 10k Persons
└─ 100k Records

New Space: belief-court-reformed
├─ @coordinator-reformed (elected by reformed subset)
├─ 8 Keyholders (subset of original 50)
├─ 2k Persons (subset of original 10k who endorsed the fork)
└─ 100k Records (copy of original, now diverging)

[Time passes]

After 1 year:
- Original: 150k Records, 25k Persons
- Reformed: 120k Records, 3k Persons (more active but smaller)

Both Ledgers are valid. Both networks are operational. 
No corruption. No lost data. Just divergent communities.
```

### Fork Incentives & Checks

**Why fork?**
- Original Coordinator becomes corrupt or inactive (> 48h downtime)
- Constitutional amendments are blocked or rejected unfairly
- Epistemological drift (e.g., a relativistic Truth Statement gains majority, displacing reformed signatories)
- Technical incompatibility (e.g., bugs in a protocol upgrade)

**Why NOT fork unnecessarily?**
- Forking splits the user base (network effects are lost)
- Historical records are duplicated, not merged
- Users must choose a Space (no "home" in both)
- If a fork is seen as an overreaction, it loses legitimacy and users

**Governance check**: A fork requires at least 3 Keyholders + 5% of active Persons to be viable. Otherwise it's too small to operate.

---

## Self-Refutation Logic

### The Philosophical Foundation

BELIEF COURT is built on a conviction that **truth is real and knowable**. This is not a debate position. This is the constitution.

However, BELIEF COURT also models **relativistic worldviews** — people who genuinely believe that truth is subjective, perspectival, or non-existent.

The system is designed to surface a problem: **relativism is self-refuting**.

### Implementation

**When a Judgment is recorded**:
```sql
INSERT INTO judgments (
  id, duelId, judgerId, verdict, baseOfTruthId, analysis, createdAt
) VALUES (
  ?, ?, ?, ?, ?, ?, ?
);
```

The `baseOfTruthId` is the Truth Statement that grounds the Judgment. If the Judge cites a relativistic Truth Statement (e.g., *"All perspectives are equally valid"*), the system records this.

**Analytics engine (runs daily)**:
```sql
SELECT * FROM judgments
WHERE baseOfTruthId = ? -- A relativistic truth statement
  AND verdict NOT IN ('Accord', 'Deferred')  -- Judge made a decisive call
  AND EXISTS (
    SELECT 1 FROM judgments j2
    WHERE j2.duelId = judgments.duelId
      AND j2.verdict CONFLICTS_WITH judgments.verdict  -- opposite verdict
  );
```

**Result**: A **Self-Refutation Report**, published quarterly:

> **Q2 2026 Self-Refutation Analysis**
> 
> Judges citing relativistic Truth Statements filed **847 Judgments**.
> **234 of these (27.6%) contradicted other Judgments on identical Duels**, while claiming that no perspective is more valid than another.
>
> Example: Judge @alice cites "All Perspectives Valid" while judging Duel #4521 as Defended. Judge @bob cites the same Truth Statement while judging the same Duel as Challenger Wins. By their own standard, both verdicts are equally valid. This is internally consistent, but it suggests the Truth Statement itself may need refinement.

**Consequence**: Not a penalty. Not an attack. Just a public **structural observation** that surfaces logical contradiction.

### Forcing Consistency

A Judge cannot indefinitely claim *"all perspectives are valid"* while consistently making decisive Judgments. Eventually, the contradiction becomes obvious:

1. They either refine their Truth Statement (accepting that some standards DO exist)
2. Or they stop making judgments (living consistently with their relativism — but then unable to contribute to governance)
3. Or they are recognized by their own community as incoherent

This is not rhetoric. It's architecture.

---

## Implementation Roadmap

### Phase 1: Foundation (Current — MVP, Q2/Q3 2026)

**Outcome**: Single-instance Fly.io + SQLite, cryptographically signed Records, daily Merkle snapshots.

| Task | Timeline | Owner |
|------|----------|-------|
| Deploy Fly.io Hono + SQLite | Week 1–2 | Backend team |
| Implement Record signing (Ed25519) | Week 2–3 | Security team |
| Litestream → Tigris backup | Week 3 | Ops |
| Daily Merkle tree + DNS publishing | Week 4 | Backend team |
| Audit trail logging (immutable event store) | Week 4–5 | Backend team |
| Constitution.md ratified & encoded | Week 5 | Product |

**Deliverables**:
- Live app with cryptographically immutable Ledger
- Merkle snapshots published daily to DNS + GitHub
- Full local backup strategy via Litestream
- Zero losses even if server fails

**Security Model**: Requires trusting Fly.io ops team not to corrupt backups (weak but practical)

---

### Phase 2a: Keyholder Program Closed Beta (Q4 2026 — Q1 2027)

**Outcome**: 3–5 Keyholders run nodes, test distributed sync protocol.

| Task | Timeline | Owner |
|------|----------|-------|
| Design CRDT or vector-clock ordered Ledger | Week 1–3 | Architecture |
| Implement gossip protocol (peer sync) | Week 3–6 | Backend team |
| Write Coordinator election Constitutional Duel template | Week 2 | Product |
| Deploy 3 Keyholder nodes in closed beta | Week 6–8 | Ops |
| Verify data consistency across nodes (daily audit) | Week 8–12 | QA |
| Byzantine fault tolerance testing | Week 10–12 | Security team |

**Deliverables**:
- 3 geographically distributed nodes
- All Records synced with <5 min latency
- Data consistency verified; no corruption
- Coordinator election mechanism tested

**Security Model**: Network is still small; trust is bootstrapped via founder relationships

---

### Phase 2b: Keyholder Rewards System (Q1 2027)

**Outcome**: Keyholders earn rewards for uptime, query service, and accuracy.

| Task | Timeline | Owner |
|------|----------|-------|
| Design reward model (stake, uptime, reputation) | Week 1–2 | Product |
| Implement Keyholder Person entity + reputation scoring | Week 2–4 | Backend team |
| Automate monthly reward payout (via Stripe Connect) | Week 4–6 | Finance/Backend |
| Constitutional Duel for reward governance | Week 3 | Product |
| Public dashboard (Keyholder uptime, earnings, reputation) | Week 5–7 | Frontend team |

**Deliverables**:
- Rewards flowing to active Keyholders
- Transparent reputation system
- Public dashboard showing all Keyholder metrics

---

### Phase 3: Public Keyholder Program (Q2 2027 onwards)

**Outcome**: General public can join as Keyholders; network becomes truly P2P.

| Task | Timeline | Owner |
|------|----------|-------|
| One-click Keyholder node setup (Docker Compose) | Week 1–3 | DevOps |
| Staking mechanism (tie rewards to capital commitment) | Week 3–4 | Backend team |
| Constitutional governance (Dynamic Coordinator, Duel amendments) | Week 2–4 | Product |
| Merkle proof APIs (clients can verify queries) | Week 4–5 | Backend team |
| Fork mechanism implementation (export/reimport Ledger) | Week 5–7 | Backend team |

**Deliverables**:
- Any person can run a Keyholder node in <30 min
- N ≥ 10 Keyholders, geographically distributed
- Network is Byzantine-fault-tolerant to 1/3 failures
- Fork rights are exercised (or demonstrated as feasible)

**Security Model**: Majority of Keyholders are not coordinated; network is truly decentralized

---

### Phase 4: Truth Statement Standardization (Q3 2027)

**Outcome**: Keyholder nodes can be configured with different Truth Statement profiles; networks can form around shared epistemology.

| Task | Timeline | Owner |
|------|----------|-------|
| Truth Statement Registry schema | Week 1–2 | Data team |
| Self-refutation detection algorithm | Week 2–4 | Analytics team |
| Constitutional amendment process for Truth Statements | Week 3–4 | Product |
| Quarterly Self-Refutation Report automation | Week 4–5 | Analytics team |
| Keyholder Truth Statement profile configuration | Week 5–6 | Backend team |

**Deliverables**:
- Truth Statements are first-class governance entities
- Quarterly Self-Refutation Reports published
- Keyholders can align on shared epistemology
- Consensual federations can form (e.g., "Reformed network", "Scientific network")

---

## Consensus & Governance Model (Deferred to Phase 2)

### Current (Phase 1)

- Single Coordinator (the operator, via Fly.io access)
- All writes are serialized through the primary node
- Constitution.md is ratified by founder

### Future (Phase 2 onwards)

- Coordinator is elected via Constitutional Duel (majority vote of Keyholders)
- Coordinator term is 30 days (renewable)
- Coordinator can be recalled at any time (new Constitutional Duel)
- All amendments to Constitution go through Constitutional Duels
- Threshold: Supermajority (66%) for governance changes
- Threshold: Simple majority (50%) for policy changes

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| **Keyholder Collusion** | Medium | Require N ≥ 10; use Byzantine fault tolerance (tolerate up to 1/3 dishonest); fork rights |
| **Coordinator Becomes Corrupt** | Low | Constitutional Duel to recall; fork mechanism as last resort |
| **Ledger Grows Too Large** | Low in Phase 1, High in Phase 3 | Archive old Records to Arweave; partition by time; pruning policy via Constitutional Duel |
| **Network Partitions** | Medium | Use CRDT-based ordering (causal consistency); manual reconciliation on rejoin |
| **Signature Key Compromise** | Low | Rotate keys via Constitutional Duel; revoked keys marked as stolen; old Records remain valid (signature itself is not revoked) |
| **Arweave Depends on External Storage** | Low | Also publish to GitHub Releases, DNS, and Keyholder nodes; tripleRedundancy |

---

## Summary

BELIEF COURT achieves blockchain-like immutability, auditability, and fork rights **without blockchain's cost, complexity, or regulatory burden**.

The system is:
- **Cryptographically signed** — Every Record is authored and verified
- **Append-only** — No deletion, only rescission
- **Distributed** — Keyholder network replicates Ledger
- **Governed democratically** — Constitutional Duels determine rules
- **Truth-grounded** — Shared Truth Statements establish epistemic foundation
- **Self-correcting** — Relativism is exposed as logically incoherent
- **Exit-protected** — Forking is always possible if governance fails

**Next iteration**: Implement Phase 2 design in Q4 2026.
