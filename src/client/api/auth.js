/**
 * Client auth helpers.
 *
 * In mock mode (?m= present in URL):
 *   - No OAuth redirect needed
 *   - "signed-in" user is whoever ?u= says (default: 'alice')
 *   - getToken() returns the mock handle as a pseudo-token
 *   - isAuthenticated() returns true if ?u= is set or ?m= is present
 *
 * In production:
 *   - signIn(provider) redirects to /auth/<provider>
 *   - handleCallback() extracts ?token= from URL, stores in localStorage
 *   - getToken() reads from localStorage
 *   - isAuthenticated() checks token exists and is not expired
 */

const TOKEN_KEY = 'jdg:token';

export function isMockMode() {
  return new URLSearchParams(location.search).has('m');
}

export function getMockUser() {
  return new URLSearchParams(location.search).get('u') ?? 'alice';
}

export function signIn(provider = 'github') {
  if (isMockMode()) return; // no-op in mock mode
  window.location.href = `/auth/${provider}`;
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  const params = new URLSearchParams(location.search);
  params.delete('token');
  history.replaceState(null, '', `${location.pathname}?${params}`);
  window.location.reload();
}

/** Called on page load — extracts ?token= and stores it. */
export function handleCallback() {
  const params = new URLSearchParams(location.search);
  const token  = params.get('token');
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    params.delete('token');
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }
}

export function getToken() {
  if (isMockMode()) return null; // mock uses header, not token
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  if (isMockMode()) return true; // always authenticated in mock mode
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/** Decode JWT payload without verifying — client-side only for display. */
export function getTokenPayload() {
  if (isMockMode()) return { personId: null, handle: getMockUser() };
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
