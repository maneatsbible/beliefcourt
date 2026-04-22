/**
 * View: Home Feed
 * Displays paginated claims feed with composing + challenging.
 */

import { renderRecordCard } from './components/record-card.js';
import { renderComposer }   from './components/composer.js';
import { showNotification } from './components/notification.js';
import { setUrlParams }     from '../utils/url.js';
import { Record }           from '../model/record.js';

const PER_PAGE = 30;

export class HomeView {
  /**
   * @param {HTMLElement}                                        root
   * @param {import('../controller/home-controller.js').HomeController} controller
   * @param {{ id: string, handle: string }|null}               currentUser
   */
  constructor(root, controller, currentUser) {
    this._root      = root;
    this._ctrl      = controller;
    this._user      = currentUser;
    this._page      = 1;
    this._loading   = false;
    this._allLoaded = false;
    this._composer  = null;
    this._observer  = null;
    this._recordMap = new Map(); // id -> Record
  }

  async render() {
    this._root.innerHTML = `
      <div class="home-view">
        <div class="home-toolbar" id="home-toolbar"></div>
        <div class="home-feed"    id="home-feed"></div>
        <div class="home-sentinel" id="home-sentinel" aria-hidden="true"></div>
      </div>
      <button class="fab-compose" id="home-compose-fab"
              ${this._user ? '' : 'disabled'}
              aria-label="Make a claim">
        <span aria-hidden="true">⚖</span>
      </button>
    `.trim();

    this._root.querySelector('#home-compose-fab')
      ?.addEventListener('click', () => this._openComposer());

    this._root.querySelector('#home-feed')
      ?.addEventListener('click', e => this._handleFeedClick(e));

    // Nav-bar event delegation (sign-in, home button)
    document.getElementById('app-nav')
      ?.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'home') {
          setUrlParams({});
          this._resetFeed();
        }
        if (btn.dataset.action === 'signin') {
          const provider = btn.dataset.provider ?? 'github';
          window.location.href = `/auth/${provider}`;
        }
      });

    await this._loadNextPage();
    if (!this._allLoaded) this._initObserver();
  }

  // ---------------------------------------------------------------------------
  // Feed loading
  // ---------------------------------------------------------------------------

  async _loadNextPage() {
    if (this._loading || this._allLoaded) return;
    this._loading = true;
    try {
      const records = await this._ctrl.loadClaims(this._page);
      const feed = this._root.querySelector('#home-feed');

      if (records.length === 0 && this._page === 1) {
        feed.innerHTML = '<p class="empty-state">No claims yet. Be the first to make one ⚖</p>';
        return;
      }

      records.forEach(record => {
        const perms = {
          canChallenge: this._ctrl.canChallenge(this._user, record),
          canAgree:     this._ctrl.canAgree(this._user, record),
          isYourTurn:   false,
        };
        const card = renderRecordCard(record, perms, this._user, {
          onOpen: r => this._openRecord(r),
        });
        this._recordMap.set(record.id, record);
        feed.appendChild(card);
      });

      if (records.length < PER_PAGE) {
        this._allLoaded = true;
        this._destroyObserver();
      } else {
        this._page++;
      }
    } catch (err) {
      showNotification(`Failed to load feed: ${err.message}`, 'error');
    } finally {
      this._loading = false;
    }
  }

  _initObserver() {
    const sentinel = this._root.querySelector('#home-sentinel');
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    this._observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) this._loadNextPage();
    }, { rootMargin: '200px' });
    this._observer.observe(sentinel);
  }

  _destroyObserver() {
    this._observer?.disconnect();
    this._observer = null;
  }

  async _resetFeed() {
    this._page = 1;
    this._allLoaded = false;
    this._recordMap.clear();
    const feed = this._root.querySelector('#home-feed');
    if (feed) feed.innerHTML = '';
    await this._loadNextPage();
    if (!this._allLoaded) this._initObserver();
  }

  // ---------------------------------------------------------------------------
  // Composer
  // ---------------------------------------------------------------------------

  _openComposer() {
    if (this._composer) return;
    this._root.querySelector('#home-compose-fab')?.classList.add('fab-compose--hidden');
    const toolbar = this._root.querySelector('#home-toolbar');
    this._composer = renderComposer(toolbar, {
      mode:        'claim',
      placeholder: 'Make a claim…',
      onSubmit:    data => this._submitClaim(data),
      onCancel:    () => this._closeComposer(),
    });
  }

  _closeComposer() {
    this._composer?.destroy();
    this._composer = null;
    this._root.querySelector('#home-compose-fab')?.classList.remove('fab-compose--hidden');
  }

  async _submitClaim({ text }) {
    try {
      await this._ctrl.submitClaim(text);
      this._closeComposer();
      showNotification('Claim posted!', 'success');
      await this._resetFeed();
    } catch (err) {
      showNotification(`Failed to post: ${err.message}`, 'error');
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Event delegation
  // ---------------------------------------------------------------------------

  _handleFeedClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const card     = btn.closest('[data-record-id]');
    if (!card) return;
    const recordId = card.dataset.recordId;
    const record   = this._recordMap.get(recordId);
    const action   = btn.dataset.action;

    if (action === 'challenge' && record) this._openChallengeComposer(record, card);
    if (action === 'agree'     && record) this._submitClaimAgreement(record);
  }

  _openRecord(record) {
    // Future: navigate to Case/Duel view via setUrlParams({ v: 'case', id: record.id })
    // For now, show notification so the interaction is visible
    showNotification(`Opened: ${record.text.slice(0, 60)}…`, 'info');
  }

  _openChallengeComposer(record, cardEl) {
    if (this._composer) return;
    const toolbar = this._root.querySelector('#home-toolbar');
    this._composer = renderComposer(toolbar, {
      mode:        'challenge',
      placeholder: 'State your challenge…',
      onSubmit:    async ({ text }) => {
        try {
          await this._ctrl.submitChallenge(record.id, text);
          showNotification('Challenge submitted!', 'success');
          this._closeComposer();
          await this._resetFeed();
        } catch (err) {
          showNotification(`Failed: ${err.message}`, 'error');
          throw err;
        }
      },
      onCancel: () => this._closeComposer(),
    });
  }

  async _submitClaimAgreement(record) {
    if (!this._user) { showNotification('Sign in to agree.', 'warn'); return; }
    try {
      await this._ctrl.submitClaimAgreement(record.id);
      showNotification('Agreement recorded!', 'success');
      await this._resetFeed();
    } catch (err) {
      showNotification(`Failed to agree: ${err.message}`, 'error');
    }
  }

  destroy() {
    this._destroyObserver();
    this._composer?.destroy();
    this._root.innerHTML = '';
  }
}
