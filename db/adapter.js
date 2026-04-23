/**
 * DB Adapter — interface contract.
 *
 * All database access goes through one of:
 *   - LedgerAdapter  (production)
 *   - MockAdapter    (in-memory Map, development / mock mode)
 *
 * The interface is intentionally synchronous-style for compatibility.
 * Swap the export in db/db.js to change backends.
 */

export class DbAdapter {
  /**
   * Execute a SELECT that returns multiple rows.
   * @param {string} sql
   * @param {any[]} params
   * @returns {object[]}
   */
  query(sql, params = []) { throw new Error('Not implemented'); }

  /**
   * Execute a SELECT that returns a single row or undefined.
   * @param {string} sql
   * @param {any[]} params
   * @returns {object|undefined}
   */
  get(sql, params = []) { throw new Error('Not implemented'); }

  /**
   * Execute a non-SELECT statement (INSERT/UPDATE/DELETE).
   * @param {string} sql
   * @param {any[]} params
   * @returns {{ changes: number, lastInsertRowid: string|number }}
   */
  run(sql, params = []) { throw new Error('Not implemented'); }

  /**
   * Execute multiple statements inside a single transaction.
   * @param {() => void} fn
   */
  transaction(fn) { throw new Error('Not implemented'); }
}
