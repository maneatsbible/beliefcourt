/**
 * App bootstrap — client entry point.
 * Reads URL params, initialises auth, mounts the correct view.
 */

import { isMockMode, getMockUser, getUrlParams, setUrlParams } from './utils/url.js';
import { handleCallback, isAuthenticated, getTokenPayload }    from './api/auth.js';
import { renderHeader }     from './view/components/header.js';
import { showErrorPanel }   from './view/components/error-panel.js';
import { mountMockToolbar } from './view/components/mock-toolbar.js';
import { HomeView }         from './view/home-view.js';
import { HomeController }   from './controller/home-controller.js';
import { logger }           from './utils/logger.js';

const VERSION = '0.1.0';

async function bootstrap() {
  logger.info('app', 'bootstrap start', { mock: isMockMode() });

  try {
    // Handle OAuth callback (production flow — token in ?token= param)
    await handleCallback();

    const params  = getUrlParams();
    const authed  = isAuthenticated();
    const payload = getTokenPayload();

    // Determine current user for UI
    const currentUser = authed
      ? { id: payload?.personId ?? null, handle: payload?.handle ?? getMockUser() ?? 'guest' }
      : null;

    // Render header
    renderHeader(VERSION, { handle: currentUser?.handle ?? null });

    // Mount mock toolbar
    if (isMockMode()) {
      // Fetch mock users list for toolbar picker
      try {
        const { MOCK_USERS } = await import('/src/mock/seed-rows.js');
        const activeHandle   = getMockUser() ?? 'alice';
        const activeUser     = MOCK_USERS.find(u => u.handle === activeHandle) ?? { handle: activeHandle };
        mountMockToolbar(MOCK_USERS, activeUser);
      } catch {
        // seed-rows.js is a server-side file; in production mock mode this path may fail
        // gracefully ignore
      }
    }

    // Route to view based on ?v= param
    const view = params.v ?? 'home';
    const main = document.getElementById('app-main');
    if (!main) throw new Error('Missing #app-main element');

    if (view === 'home' || !view) {
      await mountHomeView(main, currentUser);
    } else {
      // Future views: 'case', 'person', 'duel'
      main.innerHTML = `<p class="empty-state">View "${view}" is not yet implemented.</p>`;
    }

    // SPA history navigation
    window.addEventListener('popstate', async () => {
      const p = getUrlParams();
      const v = p.v ?? 'home';
      if (v === 'home' || !v) {
        await mountHomeView(main, currentUser);
      }
    });

    logger.info('app', 'bootstrap complete');
  } catch (err) {
    logger.error('app', 'bootstrap failed', err);
    showErrorPanel(err, 'app bootstrap');
  }
}

async function mountHomeView(main, currentUser) {
  main.innerHTML = '';
  const ctrl = new HomeController(currentUser);
  const view = new HomeView(main, ctrl, currentUser);
  await view.render();
}

document.addEventListener('DOMContentLoaded', bootstrap);
