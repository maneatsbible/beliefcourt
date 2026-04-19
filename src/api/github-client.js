/**
 * GitHub REST API wrapper with ETag conditional GET caching.
 * All requests that need auth should pass the token.
 *
 * Mock mode: call installMockMode(issues) to replace all network I/O with an
 * in-memory store backed by localStorage.  Useful for development and testing
 * without a live GitHub account or data repo.
 */

import * as cache from './cache.js';

const BASE_URL = 'https://api.github.com';
export const APP_ID = 'disputable.io';

// ---------------------------------------------------------------------------
// Mock mode
// ---------------------------------------------------------------------------

const MOCK_STORE_KEY = 'dsp:mock:issues';

/** @type {Map<number, object>|null}  null = real mode */
let _mockIssues = null;
let _mockNextId = 1000;

/**
 * Enable mock mode.  All subsequent get/post/patch calls operate on an
 * in-memory store (seeded from `issues`) that is persisted to localStorage.
 *
 * @param {object[]} issues  Array of GitHub-Issue-shaped objects (seed data).
 *                           Passing an empty array resets to an empty store.
 *                           Pass `null` to disable mock mode.
 */
export function installMockMode(issues) {
  if (issues === null) {
    _mockIssues = null;
    return;
  }
  _mockIssues = new Map(issues.map(i => [i.number, _normalise(i)]));
  const maxId = issues.reduce((m, i) => Math.max(m, i.number), 0);
  _mockNextId = maxId + 1;
  _persistMock();
}

/**
 * Restore mock store from localStorage (call on page load when mockMode is on).
 * Returns false when nothing was stored yet.
 * @returns {boolean}
 */
export function restoreMockStore() {
  try {
    const raw = localStorage.getItem(MOCK_STORE_KEY);
    if (!raw) return false;
    const arr = JSON.parse(raw);
    _mockIssues = new Map(arr.map(i => [i.number, i]));
    const maxId = arr.reduce((m, i) => Math.max(m, i.number), 0);
    _mockNextId = maxId + 1;
    return true;
  } catch {
    return false;
  }
}

/** True when mock mode is active. */
export function isMockMode() { return _mockIssues !== null; }

function _persistMock() {
  try {
    localStorage.setItem(MOCK_STORE_KEY, JSON.stringify([..._mockIssues.values()]));
  } catch { /* ignore storage quota */ }
}

function _normalise(issue) {
  return {
    ...issue,
    labels: (issue.labels ?? []).map(l =>
      typeof l === 'string' ? { name: l } : l
    ),
  };
}

// Mock implementation of GET — handles the URL shapes used by the app.
function _mockGet(url) {
  const issuesBase = /\/repos\/[^/]+\/[^/]+\/issues$/;
  const issueSingle = /\/repos\/[^/]+\/[^/]+\/issues\/(\d+)$/;

  const singleMatch = issueSingle.exec(url.split('?')[0]);
  if (singleMatch) {
    const num = Number(singleMatch[1]);
    const issue = _mockIssues.get(num);
    if (!issue) throw new ApiError('Not Found', 404);
    return issue;
  }

  if (issuesBase.test(url.split('?')[0])) {
    const qStr = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
    const params = new URLSearchParams(qStr);
    const wantLabels = (params.get('labels') ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const wantState  = params.get('state') ?? 'open';

    let results = [..._mockIssues.values()];

    if (wantLabels.length) {
      results = results.filter(issue => {
        const names = issue.labels.map(l => (typeof l === 'string' ? l : l.name));
        return wantLabels.every(wl => names.includes(wl));
      });
    }

    if (wantState !== 'all') {
      results = results.filter(i => (i.state ?? 'open') === wantState);
    }

    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return results;
  }

  // Unknown mock URL — return empty array rather than crashing.
  return [];
}

// Mock implementation of POST (create issue).
function _mockPost(url, body) {
  const issue = _normalise({
    number:     _mockNextId++,
    title:      body.title ?? '',
    body:       body.body  ?? '',
    state:      'open',
    labels:     (body.labels ?? []).map(l => (typeof l === 'string' ? { name: l } : l)),
    user:       { login: 'mock-user', id: 9999 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  _mockIssues.set(issue.number, issue);
  _persistMock();
  return issue;
}

// Mock implementation of PATCH (update issue).
function _mockPatch(url, body) {
  const match = /\/issues\/(\d+)/.exec(url);
  if (!match) throw new ApiError('Bad URL', 400);
  const num   = Number(match[1]);
  const issue = _mockIssues.get(num);
  if (!issue) throw new ApiError('Not Found', 404);
  const updated = _normalise({ ...issue, ...body });
  _mockIssues.set(num, updated);
  _persistMock();
  return updated;
}

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status  HTTP status code
   * @param {any}    body    Parsed response body (if available)
   */
  constructor(message, status, body = null) {
    super(message);
    this.name    = 'ApiError';
    this.status  = status;
    this.body    = body;
  }
}

/**
 * Perform a conditional-GET request, using the ETag cache.
 *
 * Returns cached data when the server responds 304 Not Modified.
 *
 * @param {string}      url   Full GitHub API URL
 * @param {string|null} token Bearer token (optional for public endpoints)
 * @returns {Promise<any>}    Parsed JSON body
 */
export async function get(url, token = null) {
  if (_mockIssues !== null) return _mockGet(url);
  const cached = cache.get(url);
  const headers = _baseHeaders(token);
  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  const res = await fetch(url, { headers });

  if (res.status === 304 && cached) {
    return cached.data;
  }

  if (!res.ok) {
    await _throwApiError(res);
  }

  const data = await res.json();
  const etag = res.headers.get('ETag');
  if (etag) {
    cache.set(url, etag, data);
  }
  return data;
}

/**
 * POST JSON to a GitHub API endpoint.
 *
 * @param {string}      url
 * @param {object}      body
 * @param {string|null} token
 * @returns {Promise<any>}
 */
export async function post(url, body, token = null) {
  if (_mockIssues !== null) return _mockPost(url, body);
  const res = await fetch(url, {
    method:  'POST',
    headers: { ..._baseHeaders(token), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    await _throwApiError(res);
  }
  return res.json();
}

/**
 * PATCH JSON to a GitHub API endpoint (e.g. update issue labels).
 *
 * @param {string}      url
 * @param {object}      body
 * @param {string|null} token
 * @returns {Promise<any>}
 */
export async function patch(url, body, token = null) {
  if (_mockIssues !== null) return _mockPatch(url, body);
  const res = await fetch(url, {
    method:  'PATCH',
    headers: { ..._baseHeaders(token), 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    await _throwApiError(res);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Body helpers
// ---------------------------------------------------------------------------

const META_OPEN  = '<!-- DSP:META';
const META_CLOSE = '-->';

/**
 * Build a GitHub Issue body from DSP:META + optional human-readable content.
 *
 * @param {object} meta    DSP:META JSON object
 * @param {string} content Human-readable text (may be empty string)
 * @returns {string}
 */
export function buildBody(meta, content = '') {
  const metaBlock = `${META_OPEN}\n${JSON.stringify(meta, null, 2)}\n${META_CLOSE}`;
  return content ? `${metaBlock}\n\n${content}` : metaBlock;
}

/**
 * Extract and parse the DSP:META JSON block from an issue body.
 *
 * @param {string} issueBody GitHub issue body string
 * @returns {object|null}    Parsed DSP:META object, or null if absent/invalid
 */
export function parseBody(issueBody) {
  if (!issueBody) return null;
  const start = issueBody.indexOf(META_OPEN);
  if (start === -1) return null;
  const innerStart = start + META_OPEN.length;
  const end = issueBody.indexOf(META_CLOSE, innerStart);
  if (end === -1) return null;
  const jsonStr = issueBody.slice(innerStart, end).trim();
  try {
    const meta = JSON.parse(jsonStr);
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
    if (meta.appId !== APP_ID) return null;
    return meta;
  } catch {
    return null;
  }
}

/**
 * Build the full GitHub API URL for the issues endpoint.
 * @param {string} dataRepo  "owner/repo"
 * @returns {string}
 */
export function issuesUrl(dataRepo) {
  return `${BASE_URL}/repos/${dataRepo}/issues`;
}

/**
 * Build the URL for a specific issue number.
 * @param {string} dataRepo
 * @param {number} issueNumber
 * @returns {string}
 */
export function issueUrl(dataRepo, issueNumber) {
  return `${BASE_URL}/repos/${dataRepo}/issues/${issueNumber}`;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _baseHeaders(token) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function _throwApiError(res) {
  let body = null;
  try { body = await res.json(); } catch { /* ignore */ }
  throw new ApiError(
    body?.message ?? `HTTP ${res.status}`,
    res.status,
    body
  );
}
