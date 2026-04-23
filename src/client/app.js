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

      // Floating Start a Fire button (FAB)
      function addStartFireFAB() {
        let fab = document.getElementById('fab-start-fire');
        if (!fab) {
          fab = document.createElement('button');
          fab.id = 'fab-start-fire';
          fab.className = 'fab-compose';
          fab.title = 'Start a Fire (File a Claim)';
          fab.innerHTML = '<span style="font-size:1.5em;">🔥</span>';
          fab.addEventListener('click', () => {
            // Animate: grow/lighten, then restore
            fab.classList.remove('fab-compose--restore');
            fab.classList.add('fab-compose--active');
            setTimeout(() => {
              fab.classList.remove('fab-compose--active');
              fab.classList.add('fab-compose--restore');
              setTimeout(() => {
                fab.classList.remove('fab-compose--restore');
              }, 180);
            }, 220);
            // Route to claim composer or fire action (mock: alert)
            alert('Start a Fire: File a new Claim (Evangelize) — [TODO: open composer]');
          });
          document.body.appendChild(fab);
        } else {
          fab.style.display = '';
        }
      }
      function hideStartFireFAB() {
        const fab = document.getElementById('fab-start-fire');
        if (fab) fab.style.display = 'none';
      }

      // Home: (minimal, no full viz suite)
      if (view === 'home' || !view) {
        main.innerHTML = `
          <div class="viz-home-message">
            Welcome to Truthbook.<br>
            Use the navigation to explore cases, people, or:
            <br><br>
            <a href="?v=viz" class="viz-demo-link">
              <span style="font-size:1.2em;">📊</span> <b>Analytics Visualization Suite Demo</b>
            </a>
            <br><span class="viz-demo-caption">(Explore the full interactive analytics and visualization demo suite.)</span>
          </div>
        `;
        addStartFireFAB();
      }

      // Viz: full visualization suite demo
      else if (view === 'viz') {
        addStartFireFAB();
        const vizWrap = document.createElement('div');
        vizWrap.className = 'viz-suite viz-suite--viz';
        main.appendChild(vizWrap);

        // Marketing wrapper with analytics
        const marketing = document.createElement('div');
        marketing.className = 'viz-marketing-wrap';
        // Compute analytics
        const timelineCount = MOCK_TIMELINE.length;
        const uniquePeople = new Set(MOCK_TIMELINE.map(e => e.person)).size;
        const worldviewCount = MOCK_WORLDVIEW_MAP.length;
        const eeoLinks = MOCK_EEO.reduce((acc, n) => acc + (n.edges ? n.edges.length : 0), 0);
        const settlements = MOCK_SETTLEMENTS.length;
        const adjPairs = MOCK_ADJACENCY.length;
        marketing.innerHTML = `
          <div class="viz-hero">
            <h1 class="viz-title">Analytics Visualization Suite Demo</h1>
            <p class="viz-tagline">Explore the full interactive analytics and visualization demo suite for Truthbook. See the story of truth, challenge, and forgiveness unfold in real time. Explore the living network of beliefs, disputes, and reconciliation.</p>
            <div class="viz-analytics">
              <div><b>${timelineCount}</b> timeline events</div>
              <div><b>${uniquePeople}</b> unique participants</div>
              <div><b>${worldviewCount}</b> worldviews mapped</div>
              <div><b>${eeoLinks}</b> epistemic links</div>
              <div><b>${settlements}</b> settlements & acts of forgiveness</div>
              <div><b>${adjPairs}</b> worldview adjacencies</div>
            </div>
          </div>
        `;
        vizWrap.appendChild(marketing);

        // Add extra spacing to intro
        marketing.style.marginBottom = '48px';

        // Worldview map
        const mapDiv = document.createElement('div');
        mapDiv.className = 'viz-block viz-block--worldview-map';
        mapDiv.style.minHeight = '400px';
        mapDiv.innerHTML = `<div class="viz-label"><span class="viz-label-icon">🌐</span> <b>Worldview Map</b><br><span class="viz-label-desc">A living map of all worldviews and their connections. Each node is a worldview; each line is a relationship. <b>${worldviewCount}</b> worldviews, clustered and interconnected. <span class='viz-demo-caption'>See the big picture of belief.</span></span></div>`;
        marketing.appendChild(mapDiv);
        new WorldviewMapView(mapDiv, MOCK_WORLDVIEW_MAP, { width: 800, height: 400 }).render();

        // EEO
        const eeoDiv = document.createElement('div');
        eeoDiv.className = 'viz-block viz-block--eeo';
        eeoDiv.style.minHeight = '300px';
        eeoDiv.innerHTML = `<div class="viz-label"><span class="viz-label-icon">🤝</span> <b>Epistemic Organization</b><br><span class="viz-label-desc">How does trust and knowledge emerge? This graph shows <b>${eeoLinks}</b> trust links between people. <span class='viz-demo-caption'>Watch the network of trust form and evolve.</span></span></div>`;
        marketing.appendChild(eeoDiv);
        new EEOView(eeoDiv, MOCK_EEO, { width: 600, height: 300 }).render();

        // Adjacency
        const adjDiv = document.createElement('div');
        adjDiv.className = 'viz-block viz-block--adjacency';
        adjDiv.style.minHeight = '300px';
        adjDiv.innerHTML = `<div class="viz-label"><span class="viz-label-icon">🔗</span> <b>Worldview Adjacency</b><br><span class="viz-label-desc">${adjPairs} worldview distances. <span class='viz-demo-caption'>Visualize the bridges and distances between perspectives. Darker = closer, lighter = further.</span></span></div>`;
        marketing.appendChild(adjDiv);
        new AdjacencyView(adjDiv, MOCK_ADJACENCY, { width: 600, height: 300 }).render();

        // Settlements
        const settleDiv = document.createElement('div');
        settleDiv.className = 'viz-block viz-block--settlement';
        settleDiv.style.minHeight = '200px';
        settleDiv.innerHTML = `<div class="viz-label"><span class="viz-label-icon">🕊️</span> <b>Forgiveness & Settlement</b><br><span class="viz-label-desc">${settlements} events. <span class='viz-demo-caption'>Trace the path from conflict to reconciliation and peace. Green = forgiveness, blue = regeneration, gold = settlement.</span></span></div>`;
        marketing.appendChild(settleDiv);
        new SettlementView(settleDiv, MOCK_SETTLEMENTS, { width: 700, height: 200 }).render();

        // Timeline replay (now last)
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'viz-block viz-block--timeline';
        timelineDiv.style.overflowX = 'auto';
        timelineDiv.style.maxWidth = '100%';
        timelineDiv.innerHTML = `<div class="viz-label"><span class="viz-label-icon">⏳</span> <b>Animated Timeline Replay</b><br><span class="viz-label-desc">Watch the story unfold, step by step, with play/pause controls. <b>${timelineCount}</b> events, <b>${uniquePeople}</b> people.<span class='viz-demo-caption'>See every claim, challenge, answer, and act of forgiveness as it happens.</span></span></div>`;
        marketing.appendChild(timelineDiv);
        new TimelineReplayView(timelineDiv, MOCK_TIMELINE, { width: 1800, maxVisible: 30 }).render();
      }
      // Case: Timeline replay + settlements
      else if (view === 'case' && params.id) {
        addStartFireFAB();
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
        addStartFireFAB();
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
        hideStartFireFAB();
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

// (Old view/component mounting removed — replaced by visualization suite)

document.addEventListener('DOMContentLoaded', bootstrap);
