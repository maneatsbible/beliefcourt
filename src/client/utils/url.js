/**
 * Client utils: URL helpers — ported to new architecture.
 * All navigation is driven by query params (Principle XIII: short params).
 *
 *   v   — view name ('home', 'case', 'person')
 *   id  — resource UUID
 *   m   — mock mode flag
 *   u   — mock user handle
 */

const STICKY_PARAMS = ['m', 'u'];

/**
 * Read current URL query params.
 */
export function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  const result = {};
  // Always treat param keys and values as case-insensitive
  const keys = Array.from(p.keys()).map(k => k.toLowerCase());
  for (const key of ['v', 'id', 'm', 'u']) {
    const idx = keys.indexOf(key);
    if (idx !== -1) {
      // Find the actual key in the URL (case-insensitive)
      const actualKey = Array.from(p.keys())[idx];
      result[key] = (p.get(actualKey) || '').toLowerCase();
    }
  }
  return result;
}

/**
 * Push a new URL state, preserving sticky params (m, u).
 * Pass {} to return to home view.
 */
export function setUrlParams(params) {
  const current = new URLSearchParams(window.location.search);
  const next    = new URLSearchParams();
  for (const key of STICKY_PARAMS) {
    // Case-insensitive sticky param copy
    for (const k of Array.from(current.keys())) {
      if (k.toLowerCase() === key) next.set(key, current.get(k));
    }
  }
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) next.set(k.toLowerCase(), String(v).toLowerCase());
    else next.delete(k.toLowerCase());
  }
  const search = next.toString() ? `?${next.toString()}` : '';
  window.history.pushState(params, '', `${window.location.pathname}${search}`);
}

/** True when ?m param is present. */
export function isMockMode() {
  // Case-insensitive check for 'm' param
  const p = new URLSearchParams(window.location.search);
  return Array.from(p.keys()).some(k => k.toLowerCase() === 'm');
}

/** Returns ?u param value or null. */
export function getMockUser() {
  const p = new URLSearchParams(window.location.search);
  for (const k of Array.from(p.keys())) {
    if (k.toLowerCase() === 'u') return p.get(k);
  }
  return null;
}

/** Build a canonical shareable URL for a case or claim. */
export function buildCanonicalUrl({ caseId, claimId } = {}) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const p = new URLSearchParams();
  if (caseId)  { p.set('v', 'case');   p.set('id', String(caseId)); }
  if (claimId) { p.set('v', 'home');   p.set('id', String(claimId)); }
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Build a URL for a person profile. */
export function buildPersonUrl(personId) {
  const current = new URLSearchParams(window.location.search);
  const p = new URLSearchParams();
  for (const key of STICKY_PARAMS) {
    if (current.has(key)) p.set(key, current.get(key));
  }
  p.set('v', 'person');
  p.set('id', personId);
  return `${window.location.pathname}?${p.toString()}`;
}
