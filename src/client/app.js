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
import { VERSION }          from './version.js';
import { HomeView }         from './view/home-view.js';
import { HomeController }   from './controller/home-controller.js';
import { CaseView }      from './view/case-view.js';
import { DisputeController } from './controller/dispute-controller.js';
import { PersonView }       from './view/person-view.js';
import { PersonController } from './controller/person-controller.js';
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

    // Router
    async function route() {
      const params = getUrlParams();
      const view   = params.v ?? 'home';
      main.innerHTML = '';

      if (view === 'home' || !view) {
        await mountHomeView(main, currentUser);
      } else if (view === 'case' && params.id) {
        await mountDisputeView(main, params.id, currentUser);
      } else if (view === 'person' && params.id) {
        await mountPersonView(main, params.id, currentUser);
      } else {
        main.innerHTML = `<p class="empty-state">Unknown view.</p>`;
      }
    }

    await route();

    window.addEventListener('popstate', () => route());

    // Custom navigation events from views
    window.addEventListener('dsp:navigate', () => route());

    logger.info('app', 'bootstrap complete');
  } catch (err) {
    logger.error('app', 'bootstrap failed', err);
    showErrorPanel(err, 'app bootstrap');
  }
}

async function mountHomeView(main, currentUser) {
  const ctrl = new HomeController(currentUser);
  const view = new HomeView(main, ctrl, currentUser);
  await view.render();
}

async function mountDisputeView(main, caseId, currentUser) {
  const ctrl = new DisputeController(currentUser);
  const view = new CaseView(main, ctrl, currentUser);
  await view.render(caseId);
}

async function mountPersonView(main, personId, currentUser) {
  const ctrl = new PersonController(currentUser);
  const view = new PersonView(main, ctrl, currentUser);
  await view.render(personId);
}

document.addEventListener('DOMContentLoaded', bootstrap);
