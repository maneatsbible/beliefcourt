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


// SVG heart-on-fire icon (from branding/icon.svg)
const ICON_HEART_ON_FIRE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28" style="vertical-align:middle;"><rect width="100" height="100" rx="18" fill="#181828"/><text x="50" y="58" text-anchor="middle" font-size="54" dominant-baseline="middle">❤️</text><text x="62" y="70" text-anchor="middle" font-size="38" dominant-baseline="middle">🔥</text></svg>`;

// Navigation layout: Home (SVG), Search, Person, Version (far right)
const TABS = [
  { id: 'home',   icon: ICON_HEART_ON_FIRE,  label: 'Home'   },
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

  // Layout: Home | Search | Person | Version (far right)
  root.innerHTML = `
    <div class="nav-bar-flex" style="display:flex;align-items:center;width:100%;height:100%;">
      <div style="flex:0 0 auto;">
        <button class="nav-tab${activeView === 'home' ? ' nav-tab--active' : ''}"
                data-view="home" aria-label="Home" ${activeView === 'home' ? 'aria-current="page"' : ''}>
          <span class="nav-tab__icon" aria-hidden="true">${ICON_HEART_ON_FIRE}</span>
          <span class="nav-tab__label">Home</span>
        </button>
      </div>
      <div style="flex:0 0 auto;">
        <button class="nav-tab${activeView === 'search' ? ' nav-tab--active' : ''}"
                data-view="search" aria-label="Search" ${activeView === 'search' ? 'aria-current="page"' : ''}>
          <span class="nav-tab__icon" aria-hidden="true">🔍</span>
          <span class="nav-tab__label">Search</span>
        </button>
      </div>
      <div style="flex:1 1 auto;"></div>
      <div style="flex:0 0 auto;">
        <button class="nav-tab${activeView === 'person' ? ' nav-tab--active' : ''}"
                data-view="person" aria-label="${handle ?? 'Profile'}" ${activeView === 'person' ? 'aria-current="page"' : ''}>
          <span class="nav-tab__icon" aria-hidden="true">👤</span>
          <span class="nav-tab__label">${personLabel}</span>
        </button>
      </div>
      <div style="flex:0 0 auto;margin-left:12px;padding-right:12px;">
        <span class="nav-tab__version" style="font-size:11px;color:#8b949e;font-family:monospace;">${_esc(version)}</span>
      </div>
    </div>
  `;

  root.addEventListener('click', e => {
    const btn = e.target.closest('button[data-view]');
    if (!btn) return;
    const view = btn.dataset.view;
    if (view === 'home') {
      setUrlParams({});
      window.location.reload();
    } else {
      setUrlParams({ v: view });
    }
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

