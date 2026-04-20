// Copy this file to src/config.js and fill in your values.
// src/config.js is gitignored — never commit it.

export const CONFIG = {
  /** Product name shown in user-facing chrome */
  appName: 'judgmental.io',

  /** GitHub OAuth App Client ID (public — safe to share) */
  githubClientId: 'YOUR_GITHUB_CLIENT_ID',

  /** owner/repo of the shared data repository, e.g. "myorg/disputable-data" */
  dataRepo: 'YOUR_ORG/dsp-data',

  /** GitHub login of the @herald placeholder account */
  heraldLogin: 'herald',

  /** App version shown in the header */
  appVersion: '0.1.0',

  /**
   * Set to true for org/enterprise deployments.
   * Changes composer language from "Start a fire 🔥" to "New Claim ⚖️" and
   * removes consumer-facing "hot take" framing throughout the UI.
   */
  orgMode: false,
};

