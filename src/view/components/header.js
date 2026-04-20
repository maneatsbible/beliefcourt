/**
 * View component: application header bar.
 *
 * Renders `.header-bar` into the `#app-header` element.
 * The home button fires a click that the controller handles via
 * event delegation on `data-action="home"`.
 */

/**
 * Render (or re-render) the application header.
 *
 * @param {string} version  App version string, e.g. "1.0.0"
 * @param {object} [opts]
 * @param {string} [opts.userLogin]   Authenticated user login, or null
 */
export function renderHeader(version, { userLogin = null } = {}) {
  const root = document.getElementById('app-header');
  if (!root) return;

  root.innerHTML = `
    <div class="header-bar">
      <button class="header-home-btn icon-btn" data-action="home"
              aria-label="Go to home / claims feed">
        <span aria-hidden="true">⚖️</span>
      </button>
      <span class="header-title">judgmental.io</span>
      <span class="header-right">
        ${userLogin
          ? `<span class="header-user">@${_escape(userLogin)}</span>`
          : '<button class="btn btn--secondary btn--sm header-signin-btn" data-action="signin">Sign in</button>'
        }
        <span class="header-version">${_escape(version)}</span>
      </span>
    </div>
  `.trim();
}

function _escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
