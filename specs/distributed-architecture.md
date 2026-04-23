# Truthbook Distributed Architecture (Constitutional Edition)

| Field | Value |
|---|---|
| **Version** | `v0.2.0-pre-alpha` |
| **Status** | 🔴 Strategic Specification — Roadmap Phase 2 |
| **Created** | 2026-04-22 |
| **Last revised** | 2026-04-22 |
| **Spec** | [spec.md](spec.md) |
| **Plan** | [plan.md](plan.md) |
| **Constitution** | [constitution.md](constitution.md) |
| **Phase** | Distributed, peer-to-peer, append-only, constitutionally governed |

---

## Overview

Truthbook achieves blockchain-like properties **without blockchain**. The system is architected for **distributed, sovereign operation** where independent Keyholders maintain copies of Belief Ledger data, earn rewards for stewardship, and collectively govern the protocol through Constitutional Duels.

This revision codifies four constitutional constraints:
1. Every Judgment cites the judge's full Accord lineage, including root Truth Statement Accords.
2. Majority rule, amendment policy, and governance thresholds are defined by Constitution and changed only through constitutional process.
3. No forking is allowed. Governance and organizational divergence happen through in-database Spaces.
4. There is one global Person namespace across all Spaces.

---

# Distributed Architecture & Blockchain Hardening Strategy

| Field | Value |
|---|---|
| **Version** | `v0.2.0-pre-alpha` |
| **Status** | 🔴 Strategic Specification — Roadmap Phase 2 |
| **Created** | 2026-04-22 |
| **Last revised** | 2026-04-22 |
| **Spec** | [spec.md](spec.md) |
| **Plan** | [plan.md](plan.md) |
| **Constitution** | [TRUTHBOOK-CONSTITUTION.md](/specs/TRUTHBOOK-CONSTITUTION.md) |

---

## Architecture Model


## 1. Core Principles

- **Append-only, cryptographically signed Belief Ledger**: Every Record (Claim, Challenge, Judgment, etc.) is immutable, signed (Ed25519), and attributed to a Person or Bot (with full disclosure).
- **No blockchain, but blockchain-like guarantees**: Tamper evidence, distributed operation, and constitutional governance—without blockchain.
- **Distributed Keyholder nodes**: Multiple independent nodes replicate, verify, and serve the ledger, with constitutional governance for coordination and rewards.
- **No forking**: All divergence is handled via in-database Spaces, not network forks.
- **Global Person namespace**: One identity per human, globally unique across all Spaces.
- **Merkle-root proofs and signature verification**: For tamper evidence and auditability.
- **Governance and policy**: All changes, including node coordination, are governed by constitutional process and Duel outcomes.

---

## 2. Data Layer

- **Distributed, append-only log**: Replace SQLite with a distributed, append-only log (e.g., Apache Kafka, NATS JetStream, or custom Raft-based log).
  - Each Record is a signed, immutable event.
  - All nodes ingest, verify, and append Records to their local log.
  - Merkle roots are computed over the log for tamper evidence.
- **Space partitioning**: Each Space is a logical partition, but all share the global Person namespace.

---

## 3. Keyholder Nodes

- **Each node runs the full protocol stack**:
  - Verifies signatures and Merkle proofs on ingest.
  - Publishes and syncs Merkle roots and signed Records with peers.
  - Serves queries and proofs to clients.
  - Participates in constitutional governance (Duel, Judgment, etc.).
- **Coordinator election**: Pluggable, constitutionally-governed election protocol (Raft, or custom, with constitutional override).
- **Node rewards**: Uptime, correctness, and service are tracked and rewarded per constitutional policy.

---

## 4. Replication and Sync

- **Deterministic, peer-to-peer replication**:
  - Nodes gossip new Records and Merkle roots.
  - Hash divergence triggers quarantine and reconciliation.
  - All nodes must be able to independently verify the full chain of custody for every Record.
- **Backup and recovery**:
  - Regular, signed snapshots (JSON or binary) to S3 or similar.
  - Multi-node restore and corruption detection.

---

## 5. API and Client Layer

- **Stateless, horizontally scalable API servers**:
  - Serve the frontend and mobile clients.
  - Proxy all writes to the distributed log.
  - Serve queries with Merkle inclusion proofs.
- **Frontend remains a static SPA** (as in current plan), but now queries distributed nodes for data and proofs.

---

## 6. Governance and Policy Enforcement

- **All protocol rules, thresholds, and amendments are encoded in the Constitution**:
  - Changes require a constitutional Duel and majority Judgment.
  - Node software must be upgradable via constitutional process, not unilateral admin action.

---

## 7. Security and Audit

- **All actions are signed and auditable**.
- **No opaque or inferred beliefs**: Only explicit, on-record acts are stored.
- **Bots and AI must be fully disclosed and challengeable**.

---

## 8. Implementation Roadmap

- **Phase 1**: MockMode and in-memory simulation for all flows.
- **Phase 2**: Integration with distributed log and signature verification.
- **Phase 3**: Launch 3–5 Keyholder nodes, test full replication, Merkle proofs, and governance flows.
- **Phase 4**: Open node participation, enable rewards, and enforce constitutional upgrades.

---

## 9. Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| Keyholder collusion | Medium | Constitutional controls, transparent proofs, broad operator base |
| Space policy drift | Medium | Strong constitutional inheritance + explicit duel-approved overrides |
| Citation explosion (large accord sets) | High | Snapshot hashing + indexed citation tables |
| Ledger growth | High long-term | Space snapshots, archival tiering, aggressive index strategy |
| Namespace abuse | Medium | Global handle governance, moderation and identity controls by constitution |

---

## 10. Summary Table

| Layer         | Technology/Pattern         | Constitutional Alignment         |
|---------------|---------------------------|----------------------------------|
| Data/Log      | Kafka/NATS/Custom Raft    | Append-only, signed, auditable   |
| Replication   | Gossip, Merkle proofs     | Tamper-evident, peer-verified    |
| API           | Stateless Node.js/Hono    | No central authority, scalable   |
| Frontend      | SPA (JS, no framework)    | Open, accessible, mobile-first   |
| Governance    | Duel, Judgment, Amend     | All changes by constitutional process |
| Backup        | S3, signed snapshots      | Recoverable, auditable           |

---

This architecture is fully aligned with the Truthbook Constitution and is designed for robust, scalable, and tamper-evident operation without blockchain or legacy database constraints.

---

## Space-Native Ledger Model

### No Forking Rule

Truthbook does not use network forks for governance divergence. All divergence and organizational shape are represented as Spaces in the same database system.

### Space Definition

A Space is an in-database boundary that defines:
- Which Belief Ledger subset is active for that Space
- Governance settings inherited from Constitution plus Duel-approved local policies
- The shape of that Space's belief graph

Examples include Youth Zones, Organizations, church cohorts, or community-run thematic courts.

### Namespace Rule

All Persons share one global namespace, regardless of Space.

Implications:
- A Person identity is global and persistent.
- A Person may participate in many Spaces without identity duplication.
- Cross-Space analytics can reason over the same Person without alias merging.

### Suggested Data Additions

| Table | Key Fields | Purpose |
|---|---|---|
| `spaces` | `id`, `slug`, `name`, `created_by`, `is_youth_zone`, `created_at` | Space registry |
| `space_memberships` | `space_id`, `person_id`, `role`, `status`, `joined_at` | Membership and permissions |
| `space_ledgers` | `space_id`, `ledger_root_hash`, `last_commit_at` | Space-scoped ledger commitment |
| `space_records` | `space_id`, `record_id` | Mapping Record membership into Space belief graph |
| `space_rules` | `space_id`, `rule_key`, `rule_value`, `approved_case_id` | Duel-approved local policy extensions |

### Space Graph Shape

Belief graph topology is computed per Space from Space-included Records. The same Person can therefore have different graph neighborhoods in different Spaces while maintaining one identity.

---

## Judgment Citation Model

### Constitutional Requirement

Every Judgment is based on, and therefore cites, every Accorded Record held by that Person, including and especially root Truth Statement Accords.

### Citation Semantics

When a Person files a Judgment, the system attaches a complete citation set consisting of:
1. All active Accorded Records for that Person in scope.
2. All root Truth Statement Accords for that Person.
3. Optional Space-scoped Accord filters where Constitution allows Space-local interpretation.

### Suggested Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `judgments` | `id`, `duel_id`, `judger_id`, `space_id`, `verdict`, `analysis`, `created_at` | Judgment header |
| `judgment_citations` | `judgment_id`, `record_id`, `citation_type` | Complete citation list per Judgment |
| `person_accord_snapshots` | `person_id`, `snapshot_hash`, `captured_at` | Fast immutable lineage snapshot |

`citation_type` values can include `truth_statement_root`, `accord`, and `derived_context`.

### Snapshot Integrity

At judgment time:
1. Build the judge's full Accord set.
2. Compute deterministic hash of sorted record IDs.
3. Store snapshot hash in `person_accord_snapshots`.
4. Link each cited Record in `judgment_citations`.

This guarantees later auditors can prove the exact worldview basis cited for the Judgment.

---

## Constitutional Governance Model

### Source of Authority

Majority rules, amendment policies, and governance thresholds are constitutional, and all future changes are made only through constitutional process.

### Rule Evolution

Organizational affiliation and additional rules are decided by Dueling and then codified as:
- Constitutional amendments for platform-wide effects
- Space rules for Space-local effects

### Baseline Governance Flow

1. Proposal is filed as a constitutional or Space-governance Case.
2. Duel process gathers challenges, answers, offers, and responses.
3. Judgments are filed with full citation lineage.
4. Threshold evaluation is run using current constitutional policy.
5. If adopted, rule materializes in `constitution` state or `space_rules`.

### Threshold Authority

Thresholds are not hardcoded permanently in this document. They are inherited from current constitutional state and can only change by successful constitutional process.

---

## Keyholder Node Architecture

### Role

Independent Keyholders operate nodes, serve reads, participate in replication, and may be elected into coordination responsibilities per constitutional policy.

### Node Responsibilities

- Verify signatures for all ingested Records
- Replicate Space-ledger updates
- Publish ledger commitment proofs
- Serve query proofs for clients
- Report uptime and correctness for reward calculation

### Coordinator Model

Coordinator behavior is constitutional and therefore mutable by governance process. Current design keeps single-writer semantics for append-only ordering while allowing constitutional changes to coordination tenure and election method.

---

## Cryptographic Proof & Integrity

### Record Integrity

- Every Record is signed (Ed25519 recommended).
- Signature verification is required at ingest and auditable on read.

### Ledger Integrity

- Build Merkle roots over append-only record chains.
- Publish signed roots on a fixed schedule.
- Retain proofs by Space and by global aggregate.

### Proof Publishing

Recommended channels:
1. DNS TXT
2. Public Git tags/releases
3. Low-cost immutable archival target

### Query Proofs

Responses can include Merkle inclusion paths so clients independently verify returned records are included in the committed Space ledger state.

---

## Backup & Recovery Strategy

### Phase 1

- Litestream continuous replication to S3-compatible storage
- Daily signed JSON exports
- Regular restore drills

### Phase 2

- Multi-Keyholder replicated copies
- Space-level snapshot commitments
- Coordinated corruption detection by hash divergence

### Corruption Response

1. Detect divergent hash.
2. Quarantine affected node from write path.
3. Reconcile from verified peers.
4. Resolve repeated misconduct through constitutional process.

---

## Implementation Roadmap

### Phase 1 (MVP)

- Keep Fly.io + SQLite foundation
- Add deterministic signatures and proof publication
- Add schema support for Space entities

### Phase 2a (Distributed Closed Beta)

- Launch 3–5 Keyholder nodes
- Replicate Space-ledger streams
- Enforce full Judgment citation lineage at write-time

### Phase 2b (Governance Hardening)

- Codify constitutional threshold resolver in code
- Implement `space_rules` materialization from successful Duels
- Add governance audit dashboard

### Phase 3 (Public Keyholder Program)

- Open node participation
- Reward model based on uptime, correctness, and service contribution
- Full proof-verifiable query APIs across Spaces

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| Keyholder collusion | Medium | Constitutional controls, transparent proofs, broad operator base |
| Space policy drift | Medium | Strong constitutional inheritance + explicit duel-approved overrides |
| Citation explosion (large accord sets) | High | Snapshot hashing + indexed citation tables |
| Ledger growth | High long-term | Space snapshots, archival tiering, aggressive index strategy |
| Namespace abuse | Medium | Global handle governance, moderation and identity controls by constitution |

---

## Summary

Truthbook remains blockchain-skeptical while delivering tamper evidence, distributed operation, and constitutional governance.

The system is:
- Cryptographically signed
- Append-only
- Space-native (no forking)
- Constitution-governed
- Citation-complete at judgment time
- Globally namespaced for Persons

This aligns governance, data model, and network architecture with your clarified constitutional direction.
