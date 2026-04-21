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
  for (const key of ['v', 'id', 'm', 'u']) {
    if (p.has(key)) result[key] = p.get(key);
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
    if (current.has(key)) next.set(key, current.get(key));
  }
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) next.set(k, String(v));
    else next.delete(k);
  }
  const search = next.toString() ? `?${next.toString()}` : '';
  window.history.pushState(params, '', `${window.location.pathname}${search}`);
}

/** True when ?m param is present. */
export function isMockMode() {
  return new URLSearchParams(window.location.search).has('m');
}

/** Returns ?u param value or null. */
export function getMockUser() {
  return new URLSearchParams(window.location.search).get('u') ?? null;
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
