/**
 * App bootstrap — client entry point.
 * Reads URL params, initialises auth, mounts the correct view.
 */

import { isMockMode, getMockUser, getUrlParams }               from './utils/url.js';
import { handleCallback, isAuthenticated, getTokenPayload }    from './api/auth.js';
import { renderNavBar }     from './view/components/header.js';
import { showErrorPanel }   from './view/components/error-panel.js';
import { mountMockToolbar } from './view/components/mock-toolbar.js';
import { MOCK_USERS }       from './mock/users.js';
const VERSION = 'v0.0.1-pre-alpha';
// Visualization suite (mockMode-first)
import {
  TimelineReplayView,
  EEOView,
  AdjacencyView,
  SettlementView,
  WorldviewMapView,
} from './view/viz/index.js';
import {
  MOCK_TIMELINE,
  MOCK_EEO,
  MOCK_ADJACENCY,
  MOCK_SETTLEMENTS,
  MOCK_WORLDVIEW_MAP,
} from './mock/viz-mock-data.js';
import { logger }           from './utils/logger.js';


async function bootstrap() {
  logger.info('app', 'bootstrap start', { mock: isMockMode() });

  try {
    // Install mock API interceptor before any fetch calls
    if (isMockMode()) {
      const { installMockInterceptor } = await import('./mock/interceptor.js');
      installMockInterceptor();
    }

    // Handle OAuth callback (production flow — token in ?token= param)
    await handleCallback();

    const authed  = isAuthenticated();
    const payload = getTokenPayload();

    // Determine current user for UI
    let currentUser = null;
    if (isMockMode()) {
      const handle = getMockUser() ?? 'alice';
      const mu = MOCK_USERS.find(u => u.handle === handle) ?? { handle, person_id: `person-${handle}`, is_super_admin: 0 };
      currentUser = { id: mu.person_id, handle: mu.handle };
    } else if (authed && payload) {
      currentUser = { id: payload.personId ?? null, handle: payload.handle ?? 'guest' };
    }

    // Render nav bar
    renderNavBar(VERSION, { handle: currentUser?.handle ?? null });

    // Mount mock toolbar
    if (isMockMode()) {
      const activeHandle = getMockUser() ?? 'alice';
      const activeUser   = MOCK_USERS.find(u => u.handle === activeHandle) ?? { handle: activeHandle };
      mountMockToolbar(MOCK_USERS, activeUser);
    }

    const main = document.getElementById('app-main');
    if (!main) throw new Error('Missing #app-main element');

    // Router (mockMode-first visualizations)
    async function route() {
      const params = getUrlParams();
      const view   = params.v ?? 'home';
      main.innerHTML = '';

      // Home: Timeline replay + worldview map + all viz views
      if (view === 'home' || !view) {
        const vizWrap = document.createElement('div');
        vizWrap.className = 'viz-suite viz-suite--home';
        main.appendChild(vizWrap);

        // Timeline replay (with scroll/zoom)
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'viz-block viz-block--timeline';
        timelineDiv.style.overflowX = 'auto';
        timelineDiv.style.maxWidth = '100%';
        vizWrap.appendChild(timelineDiv);
        new TimelineReplayView(timelineDiv, MOCK_TIMELINE, { width: 1800, maxVisible: 30 }).render();

        // Worldview map
        const mapDiv = document.createElement('div');
        mapDiv.className = 'viz-block viz-block--worldview-map';
        mapDiv.style.minHeight = '400px';
        vizWrap.appendChild(mapDiv);
        new WorldviewMapView(mapDiv, MOCK_WORLDVIEW_MAP, { width: 800, height: 400 }).render();

        // EEO
        const eeoDiv = document.createElement('div');
        eeoDiv.className = 'viz-block viz-block--eeo';
        eeoDiv.style.minHeight = '300px';
        vizWrap.appendChild(eeoDiv);
        new EEOView(eeoDiv, MOCK_EEO, { width: 600, height: 300 }).render();

        // Adjacency
        const adjDiv = document.createElement('div');
        adjDiv.className = 'viz-block viz-block--adjacency';
        adjDiv.style.minHeight = '300px';
        vizWrap.appendChild(adjDiv);
        new AdjacencyView(adjDiv, MOCK_ADJACENCY, { width: 600, height: 300 }).render();

        // Settlements
        const settleDiv = document.createElement('div');
        settleDiv.className = 'viz-block viz-block--settlement';
        settleDiv.style.minHeight = '200px';
        vizWrap.appendChild(settleDiv);
        new SettlementView(settleDiv, MOCK_SETTLEMENTS, { width: 700, height: 200 }).render();
      }
      // Case: Timeline replay + settlements
      else if (view === 'case' && params.id) {
        const vizWrap = document.createElement('div');
        vizWrap.className = 'viz-suite viz-suite--case';
        main.appendChild(vizWrap);

        // Timeline replay
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'viz-block viz-block--timeline';
        vizWrap.appendChild(timelineDiv);
        new TimelineReplayView(timelineDiv, MOCK_TIMELINE).render();

        // Settlements
        const settleDiv = document.createElement('div');
        settleDiv.className = 'viz-block viz-block--settlement';
        vizWrap.appendChild(settleDiv);
        new SettlementView(settleDiv, MOCK_SETTLEMENTS).render();
      }
      // Person: EEO + adjacency
      else if (view === 'person' && params.id) {
        const vizWrap = document.createElement('div');
        vizWrap.className = 'viz-suite viz-suite--person';
        main.appendChild(vizWrap);

        // EEO
        const eeoDiv = document.createElement('div');
        eeoDiv.className = 'viz-block viz-block--eeo';
        vizWrap.appendChild(eeoDiv);
        new EEOView(eeoDiv, MOCK_EEO).render();

        // Adjacency
        const adjDiv = document.createElement('div');
        adjDiv.className = 'viz-block viz-block--adjacency';
        vizWrap.appendChild(adjDiv);
        new AdjacencyView(adjDiv, MOCK_ADJACENCY).render();
      }
      else {
        main.innerHTML = `<p class="empty-state">Unknown view.</p>`;
      }
    }

    await route();

    window.addEventListener('popstate', () => route());
    window.addEventListener('dsp:navigate', () => route());

    logger.info('app', 'bootstrap complete');
  } catch (err) {
    logger.error('app', 'bootstrap failed', err);
    showErrorPanel(err, 'app bootstrap');
  }
}

// (Legacy view/component mounting removed — replaced by visualization suite)

document.addEventListener('DOMContentLoaded', bootstrap);
