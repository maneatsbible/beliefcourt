/**
 * URL parameter helpers for disputable.io.
 * All navigation is driven by query params.
 *
 * Param naming convention (constitutional): all params are 1–2 chars max.
 *   v   — view name (e.g. "dispute")
 *   id  — numeric resource id
 *   p   — post id (scroll anchor on home view)
 *   m   — mock mode flag (any truthy value, e.g. "1")
 *   u   — mock user login override
 *
 * Sticky params: m and u are automatically preserved across all setUrlParams()
 * calls so mock mode survives SPA navigation without having to re-add them.
 */

const STICKY_PARAMS = ['m', 'u'];

/**
 * Read current URL query params.
 * @returns {{ v?: string, id?: string, p?: string, m?: string, u?: string }}
 */
export function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  const result = {};
  if (p.has('v'))  result.v  = p.get('v');
  if (p.has('id')) result.id = p.get('id');
  if (p.has('p'))  result.p  = p.get('p');
  if (p.has('m'))  result.m  = p.get('m');
  if (p.has('u'))  result.u  = p.get('u');
  return result;
}

/**
 * Push a new URL state with the given params.
 * Sticky params (m, u) from the current URL are preserved unless explicitly overridden.
 * Pass an empty object to go to Home (sticky params still preserved).
 * @param {Record<string, string|number>} params
 */
export function setUrlParams(params) {
  const current = new URLSearchParams(window.location.search);
  const next    = new URLSearchParams();
  // Carry sticky params forward.
  for (const key of STICKY_PARAMS) {
    if (current.has(key)) next.set(key, current.get(key));
  }
  // Apply new params (may override sticky if explicitly included).
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) next.set(k, String(v));
    else next.delete(k);
  }
  const search = next.toString() ? `?${next.toString()}` : '';
  window.history.pushState(params, '', `${window.location.pathname}${search}`);
}

/** True when the ?m param is present in the current URL. */
export function isMockMode() {
  return new URLSearchParams(window.location.search).has('m');
}

/** Returns the ?u param value, or null when absent. */
export function getMockUser() {
  return new URLSearchParams(window.location.search).get('u') ?? null;
}

/**
 * Build a URL that activates (or switches) mock mode.
 * Preserves current non-sticky params when opts.keepNav is true.
 * @param {{ u?: string, v?: string, id?: string|number }} [opts]
 * @returns {string}
 */
export function buildMockUrl(opts = {}) {
  const p = new URLSearchParams();
  p.set('m', '1');
  if (opts.u)  p.set('u',  opts.u);
  if (opts.v)  { p.set('v', opts.v); if (opts.id) p.set('id', String(opts.id)); }
  return `${window.location.pathname}?${p.toString()}`;
}

/**
 * Build a canonical shareable URL for a Post or Dispute.
 * Does NOT include sticky params — canonical URLs are always clean.
 * @param {{ postId?: number, disputeId?: number }} opts
 * @returns {string}
 */
export function buildCanonicalUrl({ postId, disputeId } = {}) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const p = new URLSearchParams();
  if (disputeId) { p.set('v', 'dispute'); p.set('id', String(disputeId)); }
  if (postId)    p.set('p', String(postId));
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}
