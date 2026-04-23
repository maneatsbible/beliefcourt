// Visualization suite: superseded this component.
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

  // Layout: Home (left), Search (center), Person (right of version), Version (hard right)
  root.innerHTML = `
    <div class="nav-bar-flex" style="display:flex;align-items:stretch;width:100%;height:100%;">
      <div style="flex:0 0 28%;display:flex;align-items:center;justify-content:flex-start;">
        <button class="nav-tab${activeView === 'home' ? ' nav-tab--active' : ''}"
                data-view="home" aria-label="Home" ${activeView === 'home' ? 'aria-current="page"' : ''} style="width:100%;height:100%;min-width:90px;">
          <span class="nav-tab__icon" aria-hidden="true">${ICON_HEART_ON_FIRE}</span>
          <span class="nav-tab__label">Home</span>
          <span class="nav-tab__caption">Go to the main feed and see the latest claims and duels.</span>
        </button>
      </div>
      <div style="flex:1 1 44%;display:flex;align-items:center;justify-content:center;">
        <button class="nav-tab${activeView === 'search' ? ' nav-tab--active' : ''}"
                data-view="search" aria-label="Search" ${activeView === 'search' ? 'aria-current="page"' : ''} style="width:100%;height:100%;min-width:90px;">
          <span class="nav-tab__icon" aria-hidden="true">🔍</span>
          <span class="nav-tab__label">Search</span>
          <span class="nav-tab__caption">Find claims, people, and cases across the platform.</span>
        </button>
      </div>
      <div style="flex:0 0 18%;display:flex;align-items:center;justify-content:flex-end;">
        <button class="nav-tab${activeView === 'person' ? ' nav-tab--active' : ''}"
                data-view="person" aria-label="${handle ?? 'Profile'}" ${activeView === 'person' ? 'aria-current="page"' : ''} style="width:100%;height:100%;min-width:90px;">
          <span class="nav-tab__icon" aria-hidden="true">👤</span>
          <span class="nav-tab__label">${personLabel}</span>
          <span class="nav-tab__caption">View your profile, records, and settings.</span>
        </button>
      </div>
      <div style="flex:0 0 10%;display:flex;align-items:center;justify-content:flex-end;padding-right:12px;">
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
    } else if (view === 'search') {
      // Stub: Show a TODO popup for Search (like Start a Fire)
      alert('Search: [TODO] Implement search popup/modal.');
    } else {
      setUrlParams({ v: view });
    }
    if (view !== 'home' && view !== 'search') {
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

