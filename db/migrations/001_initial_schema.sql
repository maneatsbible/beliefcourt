-- Migration 001: Initial Schema
-- Truthbook — Belief Ledger

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA foreign_keys=ON;

-- Persons and linked SM identities
CREATE TABLE IF NOT EXISTS persons (
  id           TEXT PRIMARY KEY,   -- UUID v4
  display_name TEXT,
  is_herald    INTEGER NOT NULL DEFAULT 0,
  is_ai        INTEGER NOT NULL DEFAULT 0,
  ai_model     TEXT,
  is_super_admin INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS linked_identities (
  id                TEXT PRIMARY KEY,
  person_id         TEXT NOT NULL REFERENCES persons(id),
  platform          TEXT NOT NULL,   -- 'x' | 'threads' | 'bluesky' | 'github'
  platform_user_id  TEXT NOT NULL,
  handle            TEXT NOT NULL,
  profile_pic_url   TEXT,
  verified_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(platform, platform_user_id)
);

-- All content records (append-only)
CREATE TABLE IF NOT EXISTS records (
  id                  TEXT PRIMARY KEY,  -- UUID v4
  type                TEXT NOT NULL,     -- 'claim'|'challenge'|'answer'|'offer'|'response'
  author_id           TEXT NOT NULL REFERENCES persons(id),
  parent_id           TEXT REFERENCES records(id),
  case_id             TEXT REFERENCES cases(id),
  challenge_type      TEXT,              -- 'interrogatory'|'objection' for challenges
  yes_no              INTEGER,           -- 0/1 for interrogatory answers
  text                TEXT,
  image_url           TEXT,
  source_url          TEXT,
  attributed_handle   TEXT,
  attributed_platform TEXT,
  integrity_hash      TEXT NOT NULL DEFAULT '',
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cases: opened when any Record is challenged
CREATE TABLE IF NOT EXISTS cases (
  id                   TEXT PRIMARY KEY,
  subject_record_id    TEXT NOT NULL REFERENCES records(id),
  opened_by_person_id  TEXT NOT NULL REFERENCES persons(id),
  trigger_challenge_id TEXT REFERENCES records(id),
  status               TEXT NOT NULL DEFAULT 'open',  -- 'open'|'closed'
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Duels: 1v1 contest within a Case
CREATE TABLE IF NOT EXISTS duels (
  id            TEXT PRIMARY KEY,
  case_id       TEXT NOT NULL REFERENCES cases(id),
  challenger_id TEXT NOT NULL REFERENCES persons(id),
  defender_id   TEXT NOT NULL REFERENCES persons(id),
  status        TEXT NOT NULL DEFAULT 'active',  -- 'active'|'disposed'
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Dispositions: terminal state of a Duel
CREATE TABLE IF NOT EXISTS dispositions (
  id                     TEXT PRIMARY KEY,
  duel_id                TEXT NOT NULL REFERENCES duels(id),
  type                   TEXT NOT NULL,  -- 'accord'|'default'|'withdrawal'
  triggered_by_person_id TEXT NOT NULL REFERENCES persons(id),
  detected_at            TEXT NOT NULL,
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Accords: mutual agreement resolution
CREATE TABLE IF NOT EXISTS accords (
  id          TEXT PRIMARY KEY,
  duel_id     TEXT NOT NULL REFERENCES duels(id),
  offer_id    TEXT NOT NULL REFERENCES records(id),
  response_id TEXT NOT NULL REFERENCES records(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ClaimAccords: person agrees with a Claim (not via Duel)
CREATE TABLE IF NOT EXISTS claim_accords (
  id         TEXT PRIMARY KEY,
  claim_id   TEXT NOT NULL REFERENCES records(id),
  person_id  TEXT NOT NULL REFERENCES persons(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(claim_id, person_id)
);

-- Deadline conditions negotiated per Duel
CREATE TABLE IF NOT EXISTS deadline_conditions (
  id                    TEXT PRIMARY KEY,
  duel_id               TEXT NOT NULL REFERENCES duels(id),
  proposed_by_person_id TEXT NOT NULL REFERENCES persons(id),
  agreed_by_person_id   TEXT REFERENCES persons(id),
  duration_ms           INTEGER NOT NULL,
  active                INTEGER NOT NULL DEFAULT 0,
  current_deadline_iso  TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Moments: temporal markers on a Duel (for GalleryBot annotations)
CREATE TABLE IF NOT EXISTS moments (
  id                TEXT PRIMARY KEY,
  subject_record_id TEXT NOT NULL REFERENCES records(id),
  duel_id           TEXT NOT NULL REFERENCES duels(id),
  author_id         TEXT NOT NULL REFERENCES persons(id),
  text              TEXT NOT NULL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Analyses: post-Disposition write-up referencing Moments
CREATE TABLE IF NOT EXISTS analyses (
  id         TEXT PRIMARY KEY,
  duel_id    TEXT NOT NULL REFERENCES duels(id),
  author_id  TEXT NOT NULL REFERENCES persons(id),
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analysis_moments (
  analysis_id TEXT NOT NULL REFERENCES analyses(id),
  moment_id   TEXT NOT NULL REFERENCES moments(id),
  PRIMARY KEY (analysis_id, moment_id)
);

-- Judgments
CREATE TABLE IF NOT EXISTS judgments (
  id                     TEXT PRIMARY KEY,
  duel_id                TEXT NOT NULL REFERENCES duels(id),
  judge_id               TEXT NOT NULL REFERENCES persons(id),
  analysis_id            TEXT NOT NULL REFERENCES analyses(id),
  verdict                TEXT NOT NULL,  -- 'challenger'|'defender'
  base_of_truth_claim_id TEXT NOT NULL REFERENCES records(id),
  rationale              TEXT NOT NULL,
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Maintenance submissions (always writable regardless of MAINTENANCE_MODE)
CREATE TABLE IF NOT EXISTS maintenance_submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  contact    TEXT,
  message    TEXT,
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Schema migration tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  filename   TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Append-only triggers: prevent UPDATE/DELETE on immutable tables
CREATE TRIGGER IF NOT EXISTS records_no_update
  BEFORE UPDATE ON records BEGIN
    SELECT RAISE(ABORT, 'records table is append-only');
  END;

CREATE TRIGGER IF NOT EXISTS records_no_delete
  BEFORE DELETE ON records BEGIN
    SELECT RAISE(ABORT, 'records table is append-only');
  END;

CREATE TRIGGER IF NOT EXISTS judgments_no_update
  BEFORE UPDATE ON judgments BEGIN
    SELECT RAISE(ABORT, 'judgments table is append-only');
  END;

CREATE TRIGGER IF NOT EXISTS judgments_no_delete
  BEFORE DELETE ON judgments BEGIN
    SELECT RAISE(ABORT, 'judgments table is append-only');
  END;

CREATE TRIGGER IF NOT EXISTS moments_no_update
  BEFORE UPDATE ON moments BEGIN
    SELECT RAISE(ABORT, 'moments table is append-only');
  END;

CREATE TRIGGER IF NOT EXISTS moments_no_delete
  BEFORE DELETE ON moments BEGIN
    SELECT RAISE(ABORT, 'moments table is append-only');
  END;
