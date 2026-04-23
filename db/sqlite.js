/**
 * LedgerAdapter — wraps distributed ledger backend behind the DbAdapter interface.
 * Used in production. Requires DB_PATH env var.
 */

// LedgerAdapter stub — replace with distributed ledger implementation.
import { DbAdapter } from './adapter.js';

export class LedgerAdapter extends DbAdapter {
  constructor(path) {
    super();
    // TODO: Implement distributed ledger connection using path
  }

  query(sql, params = []) {
    // TODO: Implement distributed ledger query
    throw new Error('Not implemented');
  }
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
