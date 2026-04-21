/**
 * SqliteAdapter — wraps better-sqlite3 behind the DbAdapter interface.
 * Used in production. Requires DB_PATH env var.
 */

import Database from 'better-sqlite3';
import { DbAdapter } from './adapter.js';

export class SqliteAdapter extends DbAdapter {
  constructor(path) {
    super();
    this._db = new Database(path);
    this._db.pragma('journal_mode = WAL');
    this._db.pragma('synchronous = NORMAL');
    this._db.pragma('foreign_keys = ON');
  }

  query(sql, params = []) {
    return this._db.prepare(sql).all(...params);
  }

  get(sql, params = []) {
    return this._db.prepare(sql).get(...params);
  }

  run(sql, params = []) {
    const info = this._db.prepare(sql).run(...params);
    return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
  }

  transaction(fn) {
    return this._db.transaction(fn)();
  }

  /** Expose the raw db instance for migrate.js */
  raw() { return this._db; }
}
