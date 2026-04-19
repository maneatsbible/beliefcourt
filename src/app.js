/**
 * disputable.io application bootstrap.
 *
 * Loads CONFIG, restores auth state, reads URL params, and renders
 * the initial view. Registers a popstate listener for browser navigation.
 *
 * This file is intentionally thin: all routing, data-fetching, and
 * business logic live in the controllers and views imported below.
 */

import { CONFIG } from './config.js';
import { getStoredToken, getCachedUser, installMockUser } from './api/device-auth.js';
import { installMockMode }                               from './api/github-client.js';
import { getUrlParams, setUrlParams }     from './utils/url.js';
import { renderHeader }                   from './view/components/header.js';
import { showNotification }               from './view/components/notification.js';
import { logger }                         from './utils/logger.js';
import { showErrorPanel }                 from './view/components/error-panel.js';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function bootstrap() {
  // ---- Mock mode setup (dev/testing only) ---------------------------------
  if (CONFIG.mockMode) {
    // Always start from the canonical seed so data never accumulates across reloads.
    const { SEED_ISSUES, MOCK_USERS } = await import('./mock/seed-data.js');
    installMockMode(SEED_ISSUES);

    // Sign in as the configured mock user (or first in the default list).
    const mockUser = CONFIG.mockUser
      ? MOCK_USERS.find(u => u.login === CONFIG.mockUser) ?? MOCK_USERS[0]
      : MOCK_USERS[0];
    installMockUser(mockUser);
  }
  // -------------------------------------------------------------------------

  // Render chrome immediately — controller/view fill #app-main later.
  const token     = getStoredToken();
  const cached    = getCachedUser();
  renderHeader(CONFIG.appVersion, { userLogin: cached?.login ?? null });

  // Lazy-import the router so that Phase-2 utilities are verified to load.
  const { AppController } = await import('./controller/app-controller.js');

  const appController = new AppController({
    config:          CONFIG,
    token,
    cachedUser:      cached,
    onNotification:  showNotification,
  });

  await appController.init(getUrlParams());

  // Header action delegation (home button + sign-in button).
  document.getElementById('app-header')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'home') {
      setUrlParams({});
      appController.navigate({});
    } else if (btn.dataset.action === 'signin') {
      appController.showAuthScreen();
    }
  });

  // Re-render on browser Back / Forward.
  window.addEventListener('popstate', () => {
    appController.navigate(getUrlParams());
  });
}

bootstrap().catch(err => {
  logger.error('app', 'Bootstrap failed', err);
  showErrorPanel(err, 'app bootstrap');
});
