/**
 * View: Home Feed
 *
 * Renders the paginated list of top-level Assertion cards and the
 * "Start a fire 🔥" composer trigger.
 *
 * Terminal cards (zero challenges) receive the `.card--terminal` class
 * which dims them and disables pointer events.
 *
 * Card depth shadows (indicating nested-challenge count) are applied via
 * `.card--depth-1` / `.card--depth-2` CSS classes.
 *
 * An IntersectionObserver triggers pre-fetch of the next page when the
 * last visible card enters the viewport.
 */

import { renderPostCard }  from './components/post-card.js';
import { renderComposer }  from './components/composer.js';
import { showNotification } from './components/notification.js';
import { setUrlParams }    from '../utils/url.js';

export class HomeView {
  /**
   * @param {HTMLElement}                                 root
   * @param {import('../controller/home-controller.js').HomeController} controller
   * @param {{ id: number, login: string }|null}           currentUser
   * @param {{ disputes: object[], agreements: object[] }} context
   */
  constructor(root, controller, currentUser, context = {}) {
    this._root        = root;
    this._ctrl        = controller;
    this._user        = currentUser;
    this._disputes    = context.disputes    ?? [];
    this._agreements  = context.agreements  ?? [];
    this._page        = 1;
    this._loading     = false;
    this._allLoaded   = false;
    this._composer    = null;   // active composer handle
    this._observer    = null;
    this._postMap     = new Map(); // postId -> Post
  }

  async render() {
    const orgMode = this._ctrl._config?.orgMode ?? false;
    const fabLabel = orgMode ? 'New Claim' : 'Start a fire…';
    const fabIcon  = orgMode ? '⚖️' : '🔥';

    this._root.innerHTML = `
      <div class="home-view">
        <div class="home-toolbar" id="home-toolbar"></div>
        <div class="home-feed" id="home-feed"></div>
        <div class="home-sentinel" id="home-sentinel" aria-hidden="true"></div>
      </div>
      <button class="fab-compose" id="home-compose-fab"
              ${this._user ? '' : 'disabled'}
              aria-label="${fabLabel}">
        <span aria-hidden="true">${fabIcon}</span>
      </button>
    `.trim();

    this._root.querySelector('#home-compose-fab')
      ?.addEventListener('click', () => this._openComposer());

    // Event delegation for card actions
    const feed = this._root.querySelector('#home-feed');
    feed.addEventListener('click', e => this._handleFeedClick(e));

    await this._loadNextPage();
    if (!this._allLoaded) this._initObserver();

    // Notification scan — show "You were challenged" if applicable.
    this._notifyPendingChallenges();
  }

  // ---------------------------------------------------------------------------
  // Feed loading
  // ---------------------------------------------------------------------------

  async _loadNextPage() {
    if (this._loading) return;
    this._loading = true;

    try {
      const posts = await this._ctrl.loadFeed(this._page);
      const feed  = this._root.querySelector('#home-feed');

      if (posts.length === 0 && this._page === 1) {
        feed.innerHTML = '<p class="empty-state">No assertions yet. Be first to start a fire 🔥</p>';
        return;
      }

      posts.forEach(post => {
        const isYourTurn = this._isYourTurn(post);
        const perms = {
          canChallenge: this._ctrl.canChallenge(this._user, post, this._disputes),
          canAgree:     this._ctrl.canAgree(this._user, post, this._agreements, this._disputes),
          isYourTurn,
          disputeId:    null,
        };

        const card = renderPostCard(post, perms, this._user);
        this._postMap.set(post.id, post);
            _applyTerminalClass(card, post, this._disputes);
        _applyDepthClass(card, post, this._disputes);

        // Navigate to dispute view on card click (not action buttons)
        card.addEventListener('click', e => {
          if (e.target.closest('button')) return;
          const disputeForCard = this._disputes.find(
            d => d.rootPostId === post.id || d.rootPostId === post.meta?.rootId
          );
          if (disputeForCard) {
            setUrlParams({ view: 'dispute', id: String(disputeForCard.id) });
            this._root.dispatchEvent(new CustomEvent('dsp:navigate', {
              bubbles: true,
              detail: { view: 'dispute', id: disputeForCard.id },
            }));
          }
        });

        feed.appendChild(card);
      });

      if (posts.length === PER_PAGE) {
        this._page++;
      } else {
        this._allLoaded = true;
        this._destroyObserver();
      }
    } catch (err) {
      showNotification(`Failed to load feed: ${err.message}`, 'error');
    } finally {
      this._loading = false;
    }
  }

  // ---------------------------------------------------------------------------
  // IntersectionObserver — pre-fetch next page
  // ---------------------------------------------------------------------------

  _initObserver() {
    const sentinel = this._root.querySelector('#home-sentinel');
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    this._observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        this._loadNextPage();
      }
    }, { rootMargin: '200px' });

    this._observer.observe(sentinel);
  }

  _destroyObserver() {
    this._observer?.disconnect();
    this._observer = null;
  }

  // ---------------------------------------------------------------------------
  // Composer
  // ---------------------------------------------------------------------------

  _openComposer() {
    if (this._composer) return;

    // Hide FAB while composer is active.
    this._root.querySelector('#home-compose-fab')?.classList.add('fab-compose--hidden');

    const toolbar = this._root.querySelector('.home-toolbar');
    this._composer = renderComposer(toolbar, {
      mode:           'assertion',
      placeholder:    'Make a claim…',
      canPostAsHerald: this._ctrl.canPostAsHerald(this._user).allowed,
      onSubmit:       data => this._submitAssertion(data),
      onCancel:       ()   => {
        this._composer?.destroy();
        this._composer = null;
        this._root.querySelector('#home-compose-fab')?.classList.remove('fab-compose--hidden');
      },
    });
  }

  async _submitAssertion({ text, imageUrl, asHerald }) {
    try {
      await this._ctrl.submitAssertion(this._user, text, imageUrl || null, asHerald);
      this._composer?.destroy();
      this._composer = null;
      this._root.querySelector('#home-compose-fab')?.classList.remove('fab-compose--hidden');
      showNotification('Claim posted!', 'success');
      // Reload first page to show the new post.
      this._page = 1;
      this._root.querySelector('#home-feed').innerHTML = '';
      await this._loadNextPage();
    } catch (err) {
      showNotification(`Failed to post: ${err.message}`, 'error');
      throw err; // let composer re-enable submit button
    }
  }

  // ---------------------------------------------------------------------------
  // Event delegation
  // ---------------------------------------------------------------------------

  _handleFeedClick(e) {
    const btn    = e.target.closest('button[data-action]');
    if (!btn) return;
    const card   = btn.closest('[data-post-id]');
    if (!card) return;

    const action = btn.dataset.action;
    const postId = Number(card.dataset.postId);
    const post   = this._postMap.get(postId);

    if (action === 'agree' && post) {
      this._submitAgree(post);
      return;
    }
    if (action === 'challenge' && post) {
      this._openChallengeComposer(post, card);
      return;
    }

    // Trigger will be handled by the controller/view layer above.
    this._root.dispatchEvent(new CustomEvent('dsp:card-action', {
      bubbles: true,
      detail: { action, postId },
    }));
  }

  async _submitAgree(post) {
    if (!this._user) { showNotification('Sign in to agree.', 'warn'); return; }
    try {
      await this._ctrl.submitAgreement(this._user, post);
      this._agreements.push({ personId: this._user.id, assertionId: post.id });
      showNotification('Agreement recorded!', 'success');
      // Refresh feed so agree button updates.
      this._page = 1;
      this._postMap.clear();
      this._root.querySelector('#home-feed').innerHTML = '';
      await this._loadNextPage();
    } catch (err) {
      showNotification(`Failed to agree: ${err.message}`, 'error');
    }
  }

  _openChallengeComposer(post, cardEl) {
    if (this._composer) return;
    const container = this._root.querySelector('.home-toolbar');
    this._composer = renderComposer(container, {
      mode:        'challenge',
      placeholder: 'State your challenge…',
      onSubmit:    async ({ text, challengeType }) => {
        try {
          const { dispute } = await this._ctrl.submitChallenge(this._user, post, { challengeType, text });
          this._disputes.push(dispute ? { id: dispute.number, challengerId: this._user.id, rootPostId: post.id, status: 'active' } : {});
          showNotification('Challenge submitted!', 'success');
          this._composer?.destroy();
          this._composer = null;
          this._page = 1;
          this._postMap.clear();
          this._root.querySelector('#home-feed').innerHTML = '';
          await this._loadNextPage();
        } catch (err) {
          showNotification(`Failed: ${err.message}`, 'error');
          throw err;
        }
      },
      onCancel: () => { this._composer?.destroy(); this._composer = null; },
    });
  }

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  _notifyPendingChallenges() {
    if (!this._user) return;
    const pending = this._disputes.filter(
      d => d.defenderId === this._user.id && d.status === 'active'
    );
    if (pending.length > 0) {
      showNotification(
        `You were challenged in ${pending.length} dispute${pending.length > 1 ? 's' : ''}!`,
        'warn'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  _isYourTurn(post) {
    if (!this._user) return false;
    return this._disputes.some(
      d => d.defenderId === this._user.id &&
           d.status     === 'active'      &&
           (d.rootPostId === post.id || d.rootPostId === post.meta?.rootId)
    );
  }

  destroy() {
    this._destroyObserver();
    this._composer?.destroy();
    this._root.innerHTML = '';
  }
}

const PER_PAGE = 30;

// ---------------------------------------------------------------------------
// Card visual helpers (outside the class — pure functions)
// ---------------------------------------------------------------------------

function _applyTerminalClass(card, post, disputes) {
  const hasChallenges = disputes.some(
    d => d.rootPostId === post.id || d.rootPostId === post.meta?.rootId
  );
  if (!hasChallenges) {
    card.classList.add('post-card--terminal');
  }
}

function _applyDepthClass(card, post, disputes) {
  const count = disputes.filter(
    d => d.rootPostId === post.id || d.rootPostId === post.meta?.rootId
  ).length;

  if      (count === 1) card.classList.add('post-card--depth-1');
  else if (count >= 2)  card.classList.add('post-card--depth-2');
}
