/**
 * MockAdapter — in-memory database for development and testing.
 *
 * Interprets a small subset of SQL by table name and WHERE clause
 * to support the server models without any real DB.
 *
 * Pre-seeded by calling MockAdapter.seed(rows) with row-format data
 * imported from src/mock/seed-rows.js.
 *
 * Supports:
 *   SELECT * FROM <table> WHERE <col> = ?
 *   SELECT * FROM <table> WHERE <col> = ? AND <col2> = ?
 *   INSERT INTO <table> (...cols) VALUES (...)
 *   UPDATE <table> SET <col> = ? WHERE id = ?
 *
 * Not intended to handle complex JOINs — server models should
 * do multi-step lookups for those cases.
 */

import { DbAdapter } from './adapter.js';

export class MockAdapter extends DbAdapter {
  constructor() {
    super();
    /** @type {Map<string, Map<string, object>>} tableName -> (id -> row) */
    this._tables = new Map();
    this._lastInsertRowid = null;
  }

  /**
   * Seed the mock store from an object of { tableName: rows[] }.
   * @param {{ [table: string]: object[] }} data
   */
  seed(data) {
    for (const [table, rows] of Object.entries(data)) {
      const map = this._tables.get(table) ?? new Map();
      for (const row of rows) {
        map.set(String(row.id), row);
      }
      this._tables.set(table, map);
    }
  }

  /** Clear all data (useful between tests). */
  reset() { this._tables.clear(); }

  _getTable(name) {
    if (!this._tables.has(name)) this._tables.set(name, new Map());
    return this._tables.get(name);
  }

  /** Parse a minimal WHERE clause: col = 'val', col = 42, col = ? */
  _parseWhere(where, params) {
    if (!where) return [() => true, 0];
    const conditions  = [];
    let   paramIdx    = 0;
    for (const part of where.split(/\s+AND\s+/i)) {
      const t = part.trim();
      // col = ?  (placeholder)
      let m = t.match(/^(\w+)\s*=\s*\?$/i);
      if (m) {
        const col = m[1];
        const val = params[paramIdx++];
        conditions.push(row => String(row[col]) === String(val ?? ''));
        continue;
      }
      // col = 'string literal'
      m = t.match(/^(\w+)\s*=\s*'([^']*)'$/i);
      if (m) {
        const col = m[1], val = m[2];
        conditions.push(row => String(row[col] ?? '') === val);
        continue;
      }
      // col = numeric literal
      m = t.match(/^(\w+)\s*=\s*(\d+)$/i);
      if (m) {
        const col = m[1], val = m[2];
        conditions.push(row => String(row[col] ?? '') === val);
        continue;
      }
    }
    const filter = row => conditions.every(fn => fn(row));
    return [filter, paramIdx];
  }

  query(sql, params = []) {
    // Accept both literal ints and ? placeholders for LIMIT/OFFSET.
    const m = sql.match(
      /FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+|\?))?(?:\s+OFFSET\s+(\d+|\?))?\s*$/is
    );
    if (!m) return [];
    const [, table, where, orderBy, limitRaw, offsetRaw] = m;

    const [filter, whereParamCount] = this._parseWhere(where, params);
    const restParams = params.slice(whereParamCount); // params after WHERE ones

    // Resolve LIMIT / OFFSET — either literal digit or ? from restParams
    let limitN  = undefined;
    let offsetN = undefined;
    let restIdx = 0;
    if (limitRaw  !== undefined) { limitN  = limitRaw  === '?' ? restParams[restIdx++] : Number(limitRaw);  }
    if (offsetRaw !== undefined) { offsetN = offsetRaw === '?' ? restParams[restIdx++] : Number(offsetRaw); }

    const tbl = this._getTable(table);
    let rows = [...tbl.values()].filter(filter);

    if (orderBy) {
      const [col, dir] = orderBy.trim().split(/\s+/);
      rows.sort((a, b) => {
        const av = a[col] ?? '';
        const bv = b[col] ?? '';
        const cmp = String(av).localeCompare(String(bv));
        return dir?.toUpperCase() === 'DESC' ? -cmp : cmp;
      });
    }
    if (offsetN !== undefined) rows = rows.slice(Number(offsetN));
    if (limitN  !== undefined) rows = rows.slice(0, Number(limitN));
    return rows;
  }

  get(sql, params = []) {
    return this.query(sql, params)[0];
  }

  run(sql, params = []) {
    // INSERT
    const ins = sql.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (ins) {
      const [, table, colsStr] = ins;
      const cols = colsStr.split(',').map(s => s.trim());
      const row = {};
      cols.forEach((col, i) => { row[col] = params[i] ?? null; });
      const tbl = this._getTable(table);
      tbl.set(String(row.id), row);
      this._lastInsertRowid = row.id;
      return { changes: 1, lastInsertRowid: row.id };
    }
    // UPDATE
    const upd = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+id\s*=\s*\?/i);
    if (upd) {
      const [, table, setStr] = upd;
      const setParts = setStr.split(',').map(s => s.trim().match(/^(\w+)\s*=\s*\?$/i)?.[1]).filter(Boolean);
      const tbl = this._getTable(table);
      const id = String(params[params.length - 1]);
      const row = tbl.get(id);
      if (!row) return { changes: 0, lastInsertRowid: null };
      setParts.forEach((col, i) => { row[col] = params[i]; });
      return { changes: 1, lastInsertRowid: id };
    }
    return { changes: 0, lastInsertRowid: null };
  }

  transaction(fn) {
    return fn();
  }
}
