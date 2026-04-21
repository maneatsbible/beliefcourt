/**
 * db/db.js — singleton DB connection.
 *
 * In mock mode (USE_MOCK_DB=true or NODE_ENV=test):
 *   Uses MockAdapter backed by in-memory data seeded from src/mock/seed-rows.js
 *
 * In production:
 *   Uses SqliteAdapter backed by DB_PATH env var.
 */

import { MockAdapter }   from './mock-adapter.js';
import { SqliteAdapter } from './sqlite.js';

let _db = null;

export function getDb() {
  if (!_db) throw new Error('DB not initialised — call initDb() first');
  return _db;
}

export async function initDb() {
  const useMock = process.env.USE_MOCK_DB === 'true' || process.env.NODE_ENV === 'test';

  if (useMock) {
    const adapter = new MockAdapter();
    const { SEED_ROWS } = await import('../src/mock/seed-rows.js');
    adapter.seed(SEED_ROWS);
    _db = adapter;
    console.log('[db] mock mode — in-memory store seeded');
  } else {
    const path = process.env.DB_PATH;
    if (!path) throw new Error('DB_PATH env var is required in production');
    const adapter = new SqliteAdapter(path);
    const { runMigrations } = await import('./migrate.js');
    runMigrations(adapter);
    _db = adapter;
    console.log(`[db] sqlite — ${path}`);
  }

  return _db;
}
