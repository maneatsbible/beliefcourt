/**
 * View component: application header bar.
 * Renders `.header-bar` into `#app-header`.
 */

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const OAUTH_PROVIDERS = [
  { id: 'github', label: 'GitHub' },
  { id: 'google', label: 'Google' },
  { id: 'x',      label: 'X' },
  { id: 'bluesky', label: 'Bluesky' },
];

/**
 * @param {string}      version   App version string
 * @param {object}      [opts]
 * @param {string|null} [opts.handle]  Authenticated user handle, or null
 */
export function renderHeader(version, { handle = null } = {}) {
  const root = document.getElementById('app-header');
  if (!root) return;

  const authSection = handle
    ? `<span class="header-user">@${_esc(handle)}</span>`
    : `<div class="header-signin-group" role="group" aria-label="Sign in with">
        ${OAUTH_PROVIDERS.map(p =>
          `<button class="btn btn--secondary btn--sm header-signin-btn"
                   data-action="signin" data-provider="${_esc(p.id)}"
                   aria-label="Sign in with ${_esc(p.label)}">
             ${_esc(p.label)}
           </button>`
        ).join('')}
       </div>`;

  root.innerHTML = `
    <div class="header-bar">
      <button class="header-home-btn icon-btn" data-action="home"
              aria-label="Go to home / claims feed">
        <span aria-hidden="true">⚖</span>
      </button>
      <span class="header-title">judgmental.io</span>
      <span class="header-right">
        ${authSection}
        <span class="header-version">${_esc(version)}</span>
      </span>
    </div>
  `.trim();
}
