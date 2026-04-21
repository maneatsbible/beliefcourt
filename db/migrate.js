/**
 * db/migrate.js — idempotent migration runner.
 *
 * Reads all *.sql files from db/migrations/ in filename order,
 * skips already-applied filenames, executes and records each.
 *
 * Usage: node db/migrate.js   (standalone)
 * Or:    runMigrations(adapter) from server startup.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

export function runMigrations(adapter) {
  // Ensure schema_migrations table exists
  adapter.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      filename   TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    adapter.query('SELECT filename FROM schema_migrations').map(r => r.filename)
  );

  const migrationsDir = join(__dir, 'migrations');
  let files;
  try {
    files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
  } catch {
    console.warn('[migrate] no migrations directory found — skipping');
    return;
  }

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    // Execute all statements in the file
    if (adapter.raw) {
      adapter.raw().exec(sql);
    } else {
      // Fallback for mock — split on semicolons
      for (const stmt of sql.split(';').map(s => s.trim()).filter(Boolean)) {
        try { adapter.run(stmt); } catch { /* DDL not supported in mock */ }
      }
    }
    const versionMatch = file.match(/^(\d+)/);
    const version = versionMatch ? Number(versionMatch[1]) : Date.now();
    adapter.run(
      'INSERT INTO schema_migrations (version, filename) VALUES (?, ?)',
      [version, file]
    );
    console.log(`[migrate] applied ${file}`);
  }
}

// Run standalone: node db/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { SqliteAdapter } = await import('./sqlite.js');
  const path = process.env.DB_PATH ?? './data/jdg.db';
  const adapter = new SqliteAdapter(path);
  runMigrations(adapter);
  console.log('[migrate] done');
}
