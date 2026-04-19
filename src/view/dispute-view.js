/**
 * View: Dispute
 *
 * Renders the full dispute thread.
 *
 * Single-lane layout (default):
 *   lineage header → chronological Post cards → action bar
 *
 * Two-lane layout (when a counter-challenge exists):
 *   left lane = main challenges | right lane = counter-challenges, interleaved
 *   by createdAt.
 *
 * T038 — single-lane  | T039 — two-lane | T044 — .card--latest-action
 * T053 — crickets detection on load
 */

import { renderPostCard }      from './components/post-card.js';
import { renderComposer }      from './components/composer.js';
import { showNotification }    from './components/notification.js';
import { setUrlParams }        from '../utils/url.js';
import { ICON_BACK }           from '../utils/icons.js';
import { playCricketsChirp }   from '../utils/audio.js';
import { POST_TYPE_CHALLENGE } from '../model/post.js';

export class DisputeView {
  /**
   * @param {HTMLElement}                                                root
   * @param {import('../controller/dispute-controller.js').DisputeController} controller
   * @param {{ id: number, login: string }|null}                         currentUser
   * @param {{ agreements: object[] }}                                    context
   */
  constructor(root, controller, currentUser, context = {}) {
    this._root       = root;
    this._ctrl       = controller;
    this._user       = currentUser;
    this._agreements = context.agreements ?? [];
    this._composer   = null;
  }

  /**
   * Render the dispute view for the given disputeId.
   * @param {number} disputeId
   */
  async render(disputeId) {
    this._root.innerHTML = `<div class="dispute-view"><p class="loading-msg">Loading dispute…</p></div>`;

    try {
      const dispute    = await this._ctrl.loadDispute(disputeId);
      if (!dispute) {
        this._showError('Dispute not found.');
        return;
      }

      const postTree       = await this._ctrl.loadPostTree(dispute.rootPostId);
      const conditions     = await this._ctrl.loadCricketsConditions(disputeId);
      const cricketsEvent  = await this._ctrl.loadCricketsEvent(disputeId);

      // T053 — detect and trigger crickets on load.
      if (this._user && this._ctrl.canDeclareCrickets(dispute, conditions, cricketsEvent)) {
        const unansweredChallenge = _lastUnansweredChallenge(postTree);
        if (unansweredChallenge) {
          try {
            await this._ctrl.triggerCricketsEvent(this._user, dispute, unansweredChallenge);
            // Reload after writing the event.
            return this.render(disputeId);
          } catch { /* ignore — another client may have beaten us */ }
        }
      }

      this._renderFull(dispute, postTree, conditions, cricketsEvent);
    } catch (err) {
      this._showError(`Failed to load dispute: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------

  _renderFull(dispute, postTree, conditions, cricketsEvent) {
    const hasCounterChallenge = postTree.some(
      p => p.type === POST_TYPE_CHALLENGE && p.meta?.parentId && _isAnswer(p.meta.parentId, postTree)
    );

    const container = document.createElement('div');
    container.className = 'dispute-view';

    // Icon-only back button
    const backBtn = document.createElement('button');
    backBtn.className = 'dispute-view__back icon-btn';
    backBtn.innerHTML = ICON_BACK;
    backBtn.setAttribute('aria-label', 'Back to home feed');
    backBtn.addEventListener('click', () => {
      setUrlParams({});
      this._root.dispatchEvent(new CustomEvent('dsp:navigate', {
        bubbles: true, detail: { view: 'home' },
      }));
    });
    container.appendChild(backBtn);

    // Lineage header (assertion title is a clickable link home)
    const lineage = _buildLineage(dispute, postTree);
    lineage.querySelector('.dispute-view__lineage-link')?.addEventListener('click', () => {
      setUrlParams({});
      this._root.dispatchEvent(new CustomEvent('dsp:navigate', {
        bubbles: true, detail: { view: 'home' },
      }));
    });
    lineage.querySelector('.dispute-view__lineage-link')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setUrlParams({});
        this._root.dispatchEvent(new CustomEvent('dsp:navigate', {
          bubbles: true, detail: { view: 'home' },
        }));
      }
    });
    container.appendChild(lineage);

    // Your-turn indicator
    const isYourTurn = this._user && dispute.defenderId === this._user.id && dispute.isActive;
    if (isYourTurn) {
      const yt = document.createElement('div');
      yt.className = 'dispute-view__your-turn';
      yt.textContent = '⚡ Your turn to respond';
      container.appendChild(yt);
    }

    // Crickets banner
    if (cricketsEvent) {
      container.appendChild(_buildCricketsBanner(cricketsEvent));
      playCricketsChirp();
    }

    // Post tree — single or two-lane
    if (hasCounterChallenge) {
      container.appendChild(this._buildTwoLane(dispute, postTree));
    } else {
      container.appendChild(this._buildSingleLane(dispute, postTree));
    }

    // Dispute action bar (offers, crickets proposals)
    if (dispute.isActive) {
      container.appendChild(this._buildActionBar(dispute));
    }

    this._root.innerHTML = '';
    this._root.appendChild(container);
  }

  // ---------------------------------------------------------------------------
  // Post-tree layouts
  // ---------------------------------------------------------------------------

  _buildSingleLane(dispute, postTree) {
    const lane = document.createElement('div');
    lane.className = 'dispute-view__lane';

    const latestUnanswered = _lastUnansweredChallenge(postTree);

    postTree.forEach(post => {
      const perms = this._permsFor(post, dispute, postTree);
      const card  = renderPostCard(post, perms, this._user);

      if (post.id === latestUnanswered?.id) {
        card.classList.add('post-card--latest-action');
      }

      // Wire challenge/answer/agree actions.
      card.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        this._handleCardAction(btn.dataset.action, post, dispute, postTree);
      });

      lane.appendChild(card);
    });

    return lane;
  }

  _buildTwoLane(dispute, postTree) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dispute-view__lanes';

    // Labels — DEFENDER left (col 1), CHALLENGER right (col 2)
    const leftLabel = document.createElement('div');
    leftLabel.className = 'dispute-view__lane-label';
    leftLabel.style.cssText = 'grid-column:1;grid-row:1';
    leftLabel.textContent = `DEFENDER @${dispute.defenderLogin}`;

    const rightLabel = document.createElement('div');
    rightLabel.className = 'dispute-view__lane-label';
    rightLabel.style.cssText = 'grid-column:2;grid-row:1';
    rightLabel.textContent = `CHALLENGER @${dispute.challengerLogin}`;

    wrapper.appendChild(leftLabel);
    wrapper.appendChild(rightLabel);

    // Assign each post to DEFENDER (col 1) or CHALLENGER (col 2).
    // Anything authored by the challenger goes right; everything else left.
    postTree.forEach((post, i) => {
      const isChallenger = post.authorId === dispute.challengerId;
      const perms = this._permsFor(post, dispute, postTree);
      const card  = renderPostCard(post, perms, this._user);

      // grid-row starts at 2 (row 1 = labels); column by role
      card.style.cssText = `grid-column:${isChallenger ? 2 : 1};grid-row:${i + 2}`;

      card.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        this._handleCardAction(btn.dataset.action, post, dispute, postTree);
      });

      wrapper.appendChild(card);
    });

    return wrapper;
  }

  // ---------------------------------------------------------------------------
  // Action bar (offers / crickets proposals)
  // ---------------------------------------------------------------------------

  _buildActionBar(dispute) {
    const bar = document.createElement('div');
    bar.className = 'dispute-view__actions';

    if (this._ctrl.canOffer(this._user, dispute).allowed) {
      const offerBtn = document.createElement('button');
      offerBtn.className = 'btn btn--secondary';
      offerBtn.textContent = 'Make offer';
      offerBtn.addEventListener('click', () => this._openOfferComposer(dispute));
      bar.appendChild(offerBtn);
    }

    if (this._ctrl.canProposeCrickets(this._user, dispute).allowed) {
      const ccBtn = document.createElement('button');
      ccBtn.className = 'btn btn--secondary';
      ccBtn.textContent = '🦗 Propose Crickets';
      ccBtn.addEventListener('click', () => this._openCricketsProposal(dispute));
      bar.appendChild(ccBtn);
    }

    return bar;
  }

  // ---------------------------------------------------------------------------
  // Composers / actions
  // ---------------------------------------------------------------------------

  _handleCardAction(action, post, dispute, postTree) {
    if (action === 'challenge') {
      this._openChallengeComposer(post, dispute);
    } else if (action === 'answer') {
      this._openAnswerComposer(post, dispute, postTree);
    }
  }

  _openChallengeComposer(post, dispute) {
    if (this._composer) return;
    this._composer = renderComposer(this._root.querySelector('.dispute-view'), {
      mode:        'challenge',
      placeholder: 'Enter your challenge…',
      onSubmit:    async ({ text, challengeType }) => {
        try {
          await this._ctrl.submitChallenge(this._user, post, dispute, { challengeType, text });
          showNotification('Challenge submitted!', 'success');
          this._composer?.destroy();
          this._composer = null;
          await this.render(dispute.id);
        } catch (err) {
          showNotification(`Failed: ${err.message}`, 'error');
          throw err;
        }
      },
      onCancel: () => { this._composer?.destroy(); this._composer = null; },
    });
  }

  _openAnswerComposer(challenge, dispute, postTree) {
    if (this._composer) return;
    this._composer = renderComposer(this._root.querySelector('.dispute-view'), {
      mode:          'answer',
      placeholder:   'Your response…',
      challengeType: challenge.challengeType ?? 'interrogatory',
      onSubmit:      async ({ text, yesNo, counterChallenge }) => {
        try {
          await this._ctrl.submitAnswer(this._user, challenge, dispute, {
            yesNo:            yesNo,
            text:             text ?? '',
            counterChallenge: counterChallenge ?? null,
          });
          showNotification('Answer submitted!', 'success');
          this._composer?.destroy();
          this._composer = null;
          await this.render(dispute.id);
        } catch (err) {
          showNotification(`Failed: ${err.message}`, 'error');
          throw err;
        }
      },
      onCancel: () => { this._composer?.destroy(); this._composer = null; },
    });
  }

  _openOfferComposer(dispute) {
    if (this._composer) return;
    this._composer = renderComposer(this._root.querySelector('.dispute-view'), {
      mode:        'offer',
      placeholder: 'Describe your resolution offer…',
      onSubmit:    async ({ text, imageUrl }) => {
        try {
          await this._ctrl.submitOffer(this._user, dispute, { text, imageUrl: imageUrl || null });
          showNotification('Offer submitted!', 'success');
          this._composer?.destroy();
          this._composer = null;
          await this.render(dispute.id);
        } catch (err) {
          showNotification(`Failed: ${err.message}`, 'error');
          throw err;
        }
      },
      onCancel: () => { this._composer?.destroy(); this._composer = null; },
    });
  }

  _openCricketsProposal(dispute) {
    // Simple: prompt for duration in minutes.
    const mins = Number(prompt('Crickets duration in minutes:'));
    if (!mins || isNaN(mins)) return;
    this._ctrl.submitCricketsProposal(this._user, dispute, mins * 60_000)
      .then(() => {
        showNotification('Crickets proposal submitted!', 'success');
        this.render(dispute.id);
      })
      .catch(err => showNotification(`Failed: ${err.message}`, 'error'));
  }

  // ---------------------------------------------------------------------------
  // Permission helper
  // ---------------------------------------------------------------------------

  _permsFor(post, dispute, postTree) {
    const isActive = dispute.isActive;

    const canAnswer = (post.type === POST_TYPE_CHALLENGE && isActive)
      ? this._ctrl.canAnswer(this._user, post, dispute, postTree, this._agreements)
      : null;

    return {
      canChallenge: this._ctrl.canChallenge
        ? this._ctrl.canChallenge(this._user, post, dispute, postTree)
        : { allowed: false },
      canAgree:     null,
      canAnswer,
      isYourTurn:   canAnswer?.allowed ?? false,
      disputeId:    dispute.id,
    };
  }

  // ---------------------------------------------------------------------------

  _showError(msg) {
    this._root.innerHTML = `<p class="error-message">${msg}</p>`;
  }

  destroy() {
    this._composer?.destroy();
    this._root.innerHTML = '';
  }
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function _buildLineage(dispute, postTree) {
  const root = document.createElement('div');
  root.className = 'dispute-view__lineage';

  const rootPost = postTree.find(p => p.id === dispute.rootPostId);
  const summary  = rootPost
    ? _truncate(rootPost.content, 40)
    : `#${dispute.rootPostId}`;

  root.innerHTML = `
    <a class="dispute-view__lineage-link" role="link" tabindex="0"
       aria-label="Back to home feed">
      ${_esc(summary)}
    </a>
    <span class="dispute-view__lineage-sep"> → </span>
    <span>Dispute #${dispute.id}</span>
  `.trim();

  return root;
}

function _buildCricketsBanner(event) {
  const banner = document.createElement('div');
  banner.className = 'crickets-banner';
  banner.innerHTML = `
    <span class="crickets-banner__emoji">🦗</span>
    <div class="crickets-banner__title">Crickets!</div>
    <div class="crickets-banner__sub">
      Challenge #${event.challengeId} went unanswered.
      Detected at ${new Date(event.detectedAtIso).toLocaleString()}.
    </div>
  `.trim();
  return banner;
}

function _lastUnansweredChallenge(postTree) {
  const answerParentIds = new Set(
    postTree.filter(p => p.type === 'answer').map(p => p.meta?.parentId)
  );
  const unanswered = postTree
    .filter(p => p.type === POST_TYPE_CHALLENGE && !answerParentIds.has(p.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return unanswered[0] ?? null;
}

function _isAnswer(id, postTree) {
  return postTree.some(p => p.id === id && p.type === 'answer');
}

function _truncate(str, len) {
  const s = String(str ?? '');
  return s.length <= len ? s : s.slice(0, len) + '…';
}

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
