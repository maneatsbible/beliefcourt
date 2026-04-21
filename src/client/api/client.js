/**
 * Client API fetch wrapper.
 *
 * In mock mode: injects X-Mock-User header (from ?u= URL param)
 * In production: injects Authorization: Bearer <token>
 *
 * On 401: calls signOut() and redirects to home.
 * On 503 maintenance: redirects to /maintenance.html.
 * Throws ApiError on 4xx/5xx.
 */

import { getToken, signOut, isMockMode, getMockUser } from './auth.js';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name   = 'ApiError';
    this.status = status;
    this.body   = body;
  }
}

const BASE = ''; // same origin

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };

  if (isMockMode()) {
    headers['X-Mock-User'] = getMockUser();
  } else {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body: options.body != null && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  if (res.status === 401) {
    signOut();
    window.location.href = '/';
    throw new ApiError('Unauthorized', 401, null);
  }

  if (res.status === 503) {
    const body = await res.json().catch(() => ({}));
    if (body.error === 'maintenance') {
      window.location.href = '/maintenance.html';
    }
    throw new ApiError('Service unavailable', 503, body);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error ?? res.statusText, res.status, body);
  }

  return res.json();
}

export function apiGet(path)         { return apiFetch(path);                               }
export function apiPost(path, body)  { return apiFetch(path, { method: 'POST',  body });    }
export function apiPatch(path, body) { return apiFetch(path, { method: 'PATCH', body });    }
