/**
 * View component: Post card
 *
 * Renders a single Post (Assertion, Challenge, or Answer) as a card element.
 * All action buttons are always rendered; disabled state is driven by the
 * controller permission gates — never hidden.
 */

import { ICON_ASSERTION, ICON_CHALLENGE, ICON_ANSWER, ICON_COPY, ICON_AGREE,
         DUEL_ICON_ACTIVE, DUEL_ICON_ACCORD, DUEL_ICON_CRICKETS,
         DUEL_ICON_DEFENDED, DUEL_ICON_CONTESTED } from '../../utils/icons.js';
import { buildCanonicalUrl } from '../../utils/url.js';
import { showNotification }  from './notification.js';

/**
 * Render a post card and return the `<div>` element.
 *
 * @param {import('../../model/post.js').Post} post
 * @param {{
 *   canChallenge:  { allowed: boolean },
 *   canAgree:      { allowed: boolean } | null,
 *   canAnswer:     { allowed: boolean } | null,
 *   isYourTurn:    boolean,
 *   disputeId:     number|null,
 *   duels:         import('../../model/dispute.js').Dispute[],
 * }} permissions
 * @param {object|null} currentUser  { login, id } or null
 * @returns {HTMLElement}
 */
export function renderPostCard(post, permissions, currentUser) {
  const {
    canChallenge = { allowed: false },
    canAgree     = null,
    canAnswer    = null,
    isYourTurn   = false,
    disputeId    = null,
    duels        = [],
  } = permissions;

  const typeIcon   = _typeIcon(post.type);
  const cardClass  = _cardClass(post);
  const statusBadge = (post.type === 'assertion')
    ? _duelsStatusBadge(post, duels)
    : '';

  const card = document.createElement('div');
  card.className   = `card post-card ${cardClass}`;
  card.dataset.postId = String(post.id);
  if (disputeId) card.dataset.disputeId = String(disputeId);

  card.innerHTML = `
    <div class="card__header">
      <span class="post-type-icon" aria-label="${post.type}">${typeIcon}</span>
      <span class="post-author">@${_esc(post.meta?.proxyAuthor?.replace(/^@/, '') ?? post.authorLogin)}</span>
      <time class="post-time" datetime="${_esc(post.createdAt)}">${_relTime(post.createdAt)}</time>
      ${statusBadge}
      ${isYourTurn ? '<span class="badge badge--your-turn">Your turn</span>' : ''}
    </div>
    <div class="card__body">${_renderContent(post)}</div>
    <div class="card__actions">
      ${_challengeButton(canChallenge)}
      ${canAgree   !== null ? _agreeButton(canAgree)   : ''}
      ${canAnswer  !== null ? _answerButton(canAnswer)  : ''}
      <button class="icon-btn btn--copy" data-action="copy-url"
              aria-label="Copy link to this post">
        ${ICON_COPY}
      </button>
    </div>
  `.trim();

  // Wire copy-to-clipboard
  card.querySelector('[data-action="copy-url"]')?.addEventListener('click', e => {
    e.stopPropagation();
    const url = buildCanonicalUrl({ postId: post.id, disputeId });
    navigator.clipboard.writeText(url).then(() => {
      showNotification('Link copied!', 'success');
    }).catch(() => {
      showNotification('Could not copy link.', 'error');
    });
  });

  return card;
}

// ---------------------------------------------------------------------------
// Privates
// ---------------------------------------------------------------------------

function _typeIcon(type) {
  switch (type) {
    case 'assertion': return `<span class="icon--assertion">${ICON_ASSERTION}</span>`;
    case 'challenge': return `<span class="icon--challenge">${ICON_CHALLENGE}</span>`;
    case 'answer':    return `<span class="icon--answer">${ICON_ANSWER}</span>`;
    default:          return '';
  }
}

function _cardClass(post) {
  const classes = [];
  if (post.type === 'assertion' && post.isOffer) classes.push('card--offer');
  return classes.join(' ');
}

/**
 * Derive an aggregate status icon for all Duels rooted at this assertion.
 * Priority: contested > defended > active > crickets > accord > none.
 */
function _duelsStatusBadge(post, duels) {
  const related = duels.filter(
    d => d.rootPostId === post.id || d.rootPostId === post.meta?.rootId
  );
  if (related.length === 0) return '';

  let icon, label;
  if (related.some(d => d.isContested)) {
    icon = DUEL_ICON_CONTESTED; label = 'Verdict contested';
  } else if (related.some(d => d.isDefended)) {
    icon = DUEL_ICON_DEFENDED;  label = 'Assertion defended — challenger conceded';
  } else if (related.some(d => d.isActive)) {
    icon = DUEL_ICON_ACTIVE;    label = 'Duel in progress';
  } else if (related.some(d => d.isCrickets)) {
    icon = DUEL_ICON_CRICKETS;  label = 'No response — crickets';
  } else {
    icon = DUEL_ICON_ACCORD;    label = 'Resolved by accord';
  }

  return `<span class="duel-status-icon" aria-label="${label}" title="${label}">${icon}</span>`;
}

function _renderContent(post) {
  const content = post.content ?? '';
  // Image
  const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (imgMatch) {
    return `<img class="post-image" src="${_esc(imgMatch[1])}" alt="assertion image" loading="lazy">`;
  }
  return `<p class="post-text">${_esc(content)}</p>`;
}

function _challengeButton({ allowed, reason = '' }) {
  const disabled = allowed ? '' : 'disabled';
  const title    = allowed ? 'Challenge this post' : reason;
  return `
    <button class="icon-btn btn--challenge" data-action="challenge"
            ${disabled} title="${_esc(title)}" aria-label="Challenge">
      ${ICON_CHALLENGE}
    </button>
  `.trim();
}

function _agreeButton({ allowed, reason = '' }) {
  const disabled = allowed ? '' : 'disabled';
  const title    = allowed ? 'Agree with this assertion' : reason;
  return `
    <button class="icon-btn btn--agree" data-action="agree"
            ${disabled} title="${_esc(title)}" aria-label="Agree">
      ${ICON_AGREE}
    </button>
  `.trim();
}

function _answerButton({ allowed, reason = '' }) {
  const disabled = allowed ? '' : 'disabled';
  const title    = allowed ? 'Answer this challenge' : reason;
  return `
    <button class="icon-btn btn--answer" data-action="answer"
            ${disabled} title="${_esc(title)}" aria-label="Answer">
      ${ICON_ANSWER}
    </button>
  `.trim();
}

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _relTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
