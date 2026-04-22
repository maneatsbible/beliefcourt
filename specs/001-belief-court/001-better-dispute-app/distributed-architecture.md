# Distributed Architecture & Blockchain Hardening Strategy

| Field | Value |
|---|---|
| **Version** | `v0.2.0-pre-alpha` |
| **Status** | 🔴 Strategic Specification — Roadmap Phase 2 |
| **Created** | 2026-04-22 |
| **Last revised** | 2026-04-22 |
| **Spec** | [spec.md](spec.md) |
| **Plan** | [plan.md](plan.md) |
| **Constitution** | [constitution.md](constitution.md) |
| **Phase** | Visionary; implementation deferred to Phase 2 (post-MVP) |

---

## Overview

BELIEF COURT achieves blockchain-like properties **without blockchain**. The system is architected for **distributed, sovereign operation** where independent Keyholders maintain copies of Belief Ledger data, earn rewards for stewardship, and collectively govern the protocol through Constitutional Duels.

This revision codifies four constitutional constraints:
1. Every Judgment cites the judge's full Accord lineage, including root Truth Statement Accords.
2. Majority rule, amendment policy, and governance thresholds are defined by Constitution and changed only through constitutional process.
3. No forking is allowed. Governance and organizational divergence happen through in-database Spaces.
4. There is one global Person namespace across all Spaces.

---

## Table of Contents

- [Architecture Model](#architecture-model)
- [Space-Native Ledger Model](#space-native-ledger-model)
- [Judgment Citation Model](#judgment-citation-model)
- [Constitutional Governance Model](#constitutional-governance-model)
- [Keyholder Node Architecture](#keyholder-node-architecture)
- [Cryptographic Proof & Integrity](#cryptographic-proof--integrity)
- [Backup & Recovery Strategy](#backup--recovery-strategy)
- [Implementation Roadmap](#implementation-roadmap)
- [Risks & Mitigations](#risks--mitigations)

---

## Architecture Model

### Phase 1: Foundation (Current)

Single-instance Fly.io + SQLite remains the implementation base for MVP delivery.

```
Fly.io Machine
  - Hono API
  - SQLite (WAL)
  - Litestream replication
  - Static frontend serving
```

### Phase 2: Distributed Keyholder Operation

Distributed operation introduces independent reward-earning Keyholder nodes while preserving append-only semantics and constitutional governance.

No blockchain is required. The target properties are delivered by:
- Cryptographic signatures on Records
- Merkle-root publication for tamper evidence
- Deterministic replication and sync
- Constitution-bound governance
- Space-level organization in a single shared namespace

---

## Space-Native Ledger Model

### No Forking Rule

BELIEF COURT does not use network forks for governance divergence. All divergence and organizational shape are represented as Spaces in the same database system.

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

BELIEF COURT remains blockchain-skeptical while delivering tamper evidence, distributed operation, and constitutional governance.

The system is:
- Cryptographically signed
- Append-only
- Space-native (no forking)
- Constitution-governed
- Citation-complete at judgment time
- Globally namespaced for Persons

This aligns governance, data model, and network architecture with your clarified constitutional direction.
