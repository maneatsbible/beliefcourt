// *** LEGACY FILE: MARKED FOR DELETION — Replaced by /viz/ visualization suite. ***
/**
 * View component: bottom navigation bar.
 * Three tabs — Home (left), Search (centre), Person (right).
 * Renders into `#app-nav`.
 */

import { getUrlParams, setUrlParams, isMockMode, getMockUser } from '../../utils/url.js';

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

import { ICON_BRAND } from '../../utils/icons.js';

const TABS = [
  { id: 'home',   icon: ICON_BRAND,  label: 'Home'   },
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'person', icon: '👤', label: null      }, // label built dynamically
];

/**
 * @param {string}      version    App version string
 * @param {object}      [opts]
 * @param {string|null} [opts.handle]  Authenticated user handle, or null
 */
export function renderNavBar(version = 'v0.0.1-pre-alpha', { handle = null } = {}) {
  const root = document.getElementById('app-nav');
  if (!root) return;

  const activeView = getUrlParams().v ?? 'home';
  const personLabel = handle ? `@${_esc(handle)}` : 'Sign in';

  root.innerHTML = TABS.map(tab => {
    const label = tab.id === 'person'
      ? `<span class="nav-tab__label">${personLabel}<span class="nav-tab__version">${_esc(version)}</span></span>`
      : `<span class="nav-tab__label">${tab.label}</span>`;

    return `
      <button class="nav-tab${activeView === tab.id ? ' nav-tab--active' : ''}"
              data-view="${tab.id}"
              aria-label="${tab.id === 'person' ? (handle ?? 'Profile') : tab.label}"
              ${activeView === tab.id ? 'aria-current="page"' : ''}>
        <span class="nav-tab__icon" aria-hidden="true">${tab.icon}</span>
        ${label}
      </button>`;
  }).join('');

  root.addEventListener('click', e => {
    const btn = e.target.closest('button[data-view]');
    if (!btn) return;
    const view = btn.dataset.view;
    if (view === 'home') {
      setUrlParams({});
      window.location.reload(); // Force full reload to ensure home view refreshes
    } else {
      setUrlParams({ v: view });
    }
    // Update active state visually without full reload (for non-home)
    if (view !== 'home') {
      root.querySelectorAll('.nav-tab').forEach(t => {
        const isActive = t.dataset.view === view;
        t.classList.toggle('nav-tab--active', isActive);
        if (isActive) t.setAttribute('aria-current', 'page');
        else t.removeAttribute('aria-current');
      });
    }
  });
}

// Keep backward-compatible alias so any stale import of renderHeader still resolves.
export { renderNavBar as renderHeader };

