/**
 * Controller: App (top-level router)
 *
 * Reads URL params and instantiates the correct controller+view.
 * Handles Device Flow sign-in and re-renders on popstate.
 *
 * Views communicate back via CustomEvents on #app-main:
 *   - dsp:navigate  { view, id }
 *   - dsp:card-action { action, postId }
 */

import { HomeController }    from './home-controller.js';
import { DisputeController } from './dispute-controller.js';
import { JudgmentController } from './judgment-controller.js';
import { WorldviewController } from './worldview-controller.js';
import { HomeView }          from '../view/home-view.js';
import { DisputeView }       from '../view/dispute-view.js';
import { PersonView }        from '../view/person-view.js';
import { renderHeader }      from '../view/components/header.js';
import { showNotification }  from '../view/components/notification.js';
import { showErrorPanel }    from '../view/components/error-panel.js';
import { logger }            from '../utils/logger.js';
import { setUrlParams, buildPersonUrl } from '../utils/url.js';
import {
  startDeviceFlow,
  pollForToken,
  getAuthenticatedUser,
  clearToken,
} from '../api/device-auth.js';
import * as gh from '../api/github-client.js';
import { Post } from '../model/post.js';
import { Dispute } from '../model/dispute.js';
import { Agreement } from '../model/agreement.js';

export class AppController {
  /**
   * @param {{
   *   config:         object,
   *   token:          string|null,
   *   cachedUser:     { login: string, id: number }|null,
   *   onNotification: (msg: string, type: string) => void,
   * }} opts
   */
  constructor({ config, token, cachedUser, onNotification }) {
    this._config   = config;
    this._token    = token;
    this._user     = cachedUser;
    this._notify   = onNotification;
    this._main     = document.getElementById('app-main');
    this._disputes   = [];
    this._agreements = [];
  }

  /**
   * Called on DOMContentLoaded with the initial URL params.
   * @param {{ v?: string, id?: string, p?: string, m?: string, u?: string }} params
   */
  async init(params) {
    this._main.addEventListener('dsp:navigate', e => {
      const { view, id, who } = e.detail;
      if (view === 'home')    { setUrlParams({}); this.navigate({}); }
      if (view === 'dispute') { setUrlParams({ v: 'dispute', id: String(id) }); this.navigate({ v: 'dispute', id: String(id) }); }
      if (view === 'person' && who)  { setUrlParams({ v: 'person', who }); this.navigate({ v: 'person', who }); }
    });

    this._main.addEventListener('dsp:card-action', e => {
      this._handleCardAction(e.detail);
    });

    await this._loadContext();
    await this.navigate(params);
  }

  /**
   * Navigate to the appropriate view based on URL params.
   * @param {{ v?: string, id?: string, p?: string }} params
   */
  async navigate(params) {
    const { v, id } = params;
    window.scrollTo({ top: 0, behavior: 'instant' });

    try {
      if (v === 'person' && params.who) {
        await this._renderPersonView(params.who);
      } else if (v === 'dispute' && id) {
        await this._renderDisputeView(Number(id));
      } else {
        await this._renderHomeView(params);
      }
    } catch (err) {
      logger.error('router', 'Render failed', err);
      showErrorPanel(err, 'view render');
    }
  }

  // ---------------------------------------------------------------------------
  // Context pre-loading
  // ---------------------------------------------------------------------------

  async _loadContext() {
    try {
      // Load disputes and agreements for display and permission gates.
      // Public repo — token is optional; pass it when available for higher rate limits.
      const dispUrl = `${gh.issuesUrl(this._config.dataRepo)}?labels=dsp%3Adispute&state=open&per_page=100`;
      const agreeUrl = `${gh.issuesUrl(this._config.dataRepo)}?labels=dsp%3Aagreement&state=open&per_page=100`;

      const [dispIssues, agreeIssues] = await Promise.all([
        gh.get(dispUrl, this._token).catch(() => []),
        gh.get(agreeUrl, this._token).catch(() => []),
      ]);

      this._disputes   = dispIssues.map(i => Dispute.fromIssue(i)).filter(Boolean);
      this._agreements = agreeIssues.map(i => Agreement.fromIssue(i)).filter(Boolean);
    } catch {
      // Non-fatal — context will be empty, permissions will default-deny.
    }
  }

  // ---------------------------------------------------------------------------
  // Home view
  // ---------------------------------------------------------------------------

  async _renderHomeView(params) {
    const ctrl = new HomeController({
      config: this._config, token: this._token, currentUser: this._user,
    });

    const view = new HomeView(this._main, ctrl, this._user, {
      disputes:   this._disputes,
      agreements: this._agreements,
    });

    await view.render();

    // If ?p=Y — scroll to that card.
    if (params.p) {
      const card = this._main.querySelector(`[data-post-id="${params.p}"]`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ---------------------------------------------------------------------------
  // Person view (Worldview Renderer)
  // ---------------------------------------------------------------------------

  async _renderPersonView(login) {
    const worldviewCtrl = new WorldviewController({
      config: this._config,
      token:  this._token,
    });
    const judgmentCtrl = new JudgmentController({
      config:      this._config,
      token:       this._token,
      currentUser: this._user,
    });
    const view = new PersonView(
      this._main, worldviewCtrl, judgmentCtrl, this._user, this._disputes,
    );
    await view.render(login);
  }

  // ---------------------------------------------------------------------------
  // Dispute view
  // ---------------------------------------------------------------------------

  async _renderDisputeView(disputeId) {
    const ctrl = new DisputeController({
      config: this._config, token: this._token, currentUser: this._user,
    });
    const judgmentCtrl = new JudgmentController({
      config:      this._config,
      token:       this._token,
      currentUser: this._user,
    });

    const view = new DisputeView(this._main, ctrl, this._user, {
      agreements:   this._agreements,
      judgmentCtrl,
    });

    await view.render(disputeId);
  }

  // ---------------------------------------------------------------------------
  // Auth screen — GitHub Device Flow
  // ---------------------------------------------------------------------------

  /** Public entry point so external callers (e.g. app bootstrap) can trigger sign-in. */
  showAuthScreen() {
    this._renderAuthScreen();
  }

  _renderAuthScreen() {
    this._main.innerHTML = `
      <div class="auth-screen">
        <div class="auth-screen__logo">⚖️</div>
        <h1 class="auth-screen__title">${this._config.appName ?? 'disputable.io'}</h1>
        <p class="auth-screen__sub">
          Sign in with GitHub to post Assertions, issue Challenges, and join disputes.
        </p>
        <button class="btn btn--primary" id="signin-btn">Sign in with GitHub</button>
      </div>
    `.trim();

    this._main.querySelector('#signin-btn')?.addEventListener('click', () => {
      this._startSignIn();
    });
  }

  async _startSignIn() {
    const btn = this._main.querySelector('#signin-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Starting…'; }

    try {
      const flow = await startDeviceFlow(this._config.githubClientId);

      this._main.innerHTML = `
        <div class="auth-screen">
          <div class="device-flow-box">
            <p class="device-flow-box__instruction">
              Visit <a class="device-flow-box__link" href="${flow.verificationUri}"
                       target="_blank" rel="noopener noreferrer">${flow.verificationUri}</a>
              and enter this code:
            </p>
            <div class="device-flow-box__code">${flow.userCode}</div>
            <p class="device-flow-box__spinner">Waiting for authorisation…</p>
          </div>
        </div>
      `.trim();

      const token = await pollForToken(flow.deviceCode, flow.interval, this._config.githubClientId);
      const user  = await getAuthenticatedUser(token);

      this._token = token;
      this._user  = { login: user.login, id: user.id };

      renderHeader(this._config.appVersion, { userLogin: user.login });

      showNotification(`Signed in as @${user.login}`, 'success');

      await this._loadContext();
      await this.navigate({});
    } catch (err) {
      showNotification(`Sign-in failed: ${err.message}`, 'error');
      this._renderAuthScreen();
    }
  }

  // ---------------------------------------------------------------------------

  _handleCardAction({ action, postId }) {
    // Future: handle challenge/agree/answer events bubbled from cards.
    // Currently handled within views directly.
    console.debug('[AppController] card-action', action, postId);
  }
}
