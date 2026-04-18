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
import { getStoredToken, getCachedUser }  from './api/device-auth.js';
import { getUrlParams, setUrlParams }     from './utils/url.js';
import { renderHeader }                   from './view/components/header.js';
import { showNotification }               from './view/components/notification.js';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function bootstrap() {
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
  console.error('[disputable.io] Fatal bootstrap error:', err);
  const panel = document.getElementById('dsp-error');
  if (panel) {
    panel.textContent = `⚠ ${err.message}`;
    panel.style.display = 'block';
  }
});
