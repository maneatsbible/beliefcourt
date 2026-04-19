/**
 * GitHub Device Flow authentication.
 *
 * Implements the OAuth 2.0 Device Authorization Grant:
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 *
 * Token is stored in sessionStorage (cleared on tab close).
 * Authenticated user login is cached in localStorage.
 */

const DEVICE_CODE_URL  = 'https://github.com/login/device/code';
const TOKEN_URL        = 'https://github.com/login/oauth/access_token';

const SESSION_TOKEN_KEY = 'dsp:auth:token';
const LOCAL_LOGIN_KEY   = 'dsp:auth:login';
const LOCAL_USERID_KEY  = 'dsp:auth:userId';

// ---------------------------------------------------------------------------
// Mock mode helpers
// ---------------------------------------------------------------------------

/**
 * Pre-populate auth storage so the app treats the given user as already
 * signed in — no OAuth flow needed.  Call before bootstrap() when running
 * in mock/dev mode.
 *
 * @param {{ login: string, id: number }} user
 */
export function installMockUser(user) {
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, 'mock-token');
    localStorage.setItem(LOCAL_LOGIN_KEY,   user.login);
    localStorage.setItem(LOCAL_USERID_KEY,  String(user.id));
  } catch {
    // ignore
  }
}

/**
 * Switch the currently active mock user without reloading.
 * @param {{ login: string, id: number }} user
 */
export function switchMockUser(user) {
  installMockUser(user);
}

export class AuthError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Device Flow — Step 1: request device code
// ---------------------------------------------------------------------------

/**
 * Begin the Device Flow. Returns the data needed to show the user-code prompt.
 *
 * @param {string} clientId  GitHub OAuth App client_id
 * @returns {Promise<{
 *   deviceCode: string,
 *   userCode: string,
 *   verificationUri: string,
 *   expiresIn: number,
 *   interval: number
 * }>}
 */
export async function startDeviceFlow(clientId) {
  const res = await fetch(DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, scope: 'public_repo' }),
  });

  if (!res.ok) {
    throw new AuthError(`Device code request failed: HTTP ${res.status}`, 'request_failed');
  }

  const data = await res.json();

  if (data.error) {
    throw new AuthError(data.error_description ?? data.error, data.error);
  }

  return {
    deviceCode:      data.device_code,
    userCode:        data.user_code,
    verificationUri: data.verification_uri,
    expiresIn:       data.expires_in,
    interval:        data.interval ?? 5,
  };
}

// ---------------------------------------------------------------------------
// Device Flow — Step 2: poll for token
// ---------------------------------------------------------------------------

/**
 * Poll GitHub until the user authorises the device or the code expires.
 *
 * @param {string} deviceCode
 * @param {number} intervalSeconds  Polling interval from startDeviceFlow
 * @param {string} clientId
 * @returns {Promise<string>}  Access token
 */
export async function pollForToken(deviceCode, intervalSeconds, clientId) {
  const pollIntervalMs = Math.max(intervalSeconds, 5) * 1000;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await _sleep(pollIntervalMs);

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id:   clientId,
        device_code: deviceCode,
        grant_type:  'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    if (!res.ok) {
      throw new AuthError(`Token poll failed: HTTP ${res.status}`, 'poll_failed');
    }

    const data = await res.json();

    if (data.access_token) {
      _storeToken(data.access_token);
      return data.access_token;
    }

    switch (data.error) {
      case 'authorization_pending':
        // Still waiting — keep polling.
        break;
      case 'slow_down':
        // Add 5 more seconds as per spec.
        await _sleep(5000);
        break;
      case 'expired_token':
        throw new AuthError('Device code expired. Please restart sign-in.', 'expired_token');
      case 'access_denied':
        throw new AuthError('Access denied by the user.', 'access_denied');
      default:
        if (data.error) {
          throw new AuthError(data.error_description ?? data.error, data.error);
        }
    }
  }
}

// ---------------------------------------------------------------------------
// Token & user management
// ---------------------------------------------------------------------------

/**
 * Retrieve the stored access token (from sessionStorage).
 * @returns {string|null}
 */
export function getStoredToken() {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Clear the stored token and cached user info (sign-out).
 */
export function clearToken() {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(LOCAL_LOGIN_KEY);
    localStorage.removeItem(LOCAL_USERID_KEY);
  } catch {
    // ignore
  }
}

/**
 * Fetch the currently authenticated user from GitHub API.
 * Caches login+id in localStorage.
 *
 * @param {string} token
 * @returns {Promise<{ login: string, id: number, profilePicUrl: string }>}
 */
export async function getAuthenticatedUser(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Accept':               'application/vnd.github+json',
      'Authorization':        `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    throw new AuthError(`Failed to fetch user: HTTP ${res.status}`, 'user_fetch_failed');
  }

  const data        = await res.json();
  const login       = data.login;
  const id          = data.id;
  const profilePicUrl = data.avatar_url;

  try {
    localStorage.setItem(LOCAL_LOGIN_KEY,  login);
    localStorage.setItem(LOCAL_USERID_KEY, String(id));
  } catch {
    // ignore
  }

  return { login, id, profilePicUrl };
}

/**
 * Retrieve the cached user login without hitting the API.
 * @returns {{ login: string, id: number } | null}
 */
export function getCachedUser() {
  try {
    const login  = localStorage.getItem(LOCAL_LOGIN_KEY);
    const idStr  = localStorage.getItem(LOCAL_USERID_KEY);
    if (!login || !idStr) return null;
    return { login, id: Number(idStr) };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------

function _storeToken(token) {
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
