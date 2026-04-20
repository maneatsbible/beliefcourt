// Copy this file to src/config.js and fill in your values.
// src/config.js is gitignored — never commit it.

export const CONFIG = {
  /** Product name shown in user-facing chrome */
  appName: 'disputable.io',

  /** GitHub OAuth App Client ID (public — safe to share) */
  githubClientId: 'Iv23lijU8slblZnF4ofj',

  /** owner/repo of the shared data repository, e.g. "myorg/disputable-data" */
  dataRepo: 'maneatsbible/dsp-data',

  /** GitHub login of the @herald placeholder account */
  heraldLogin: 'herald',

  /** App version shown in the header */
  appVersion: '0.1.0',

  // ---------------------------------------------------------------------------
  // Dev / testing — mock mode
  // ---------------------------------------------------------------------------

  /**
   * Set to true to bypass GitHub OAuth and use in-memory seed data.
   * No real API calls are made; actions (post/patch) persist only to localStorage.
   */
  mockMode: true,

  /**
   * When mockMode is true, sign in as this GitHub login.
   * Must match a login in src/mock/seed-data.js MOCK_USERS.
   * Defaults to the first mock user ('alice') when omitted.
   */
  mockUser: 'alice',
};
