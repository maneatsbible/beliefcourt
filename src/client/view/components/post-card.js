/**
 * View component: Record card (replaces post-card.js).
 * Renders a single Record (claim, challenge, answer, etc.) as a card element.
 */

import { ICON_CLAIM, ICON_CHALLENGE, ICON_ANSWER, ICON_COPY, ICON_AGREE, ICON_OFFER } from '../../utils/icons.js';
import { buildCanonicalUrl } from '../../utils/url.js';
import { showNotification }  from './notification.js';

/**
 * @param {import('../../model/record.js').Record} record
 * @param {{
 *   canChallenge: { allowed: boolean, reason?: string },
 *   canAgree:     { allowed: boolean, reason?: string } | null,
 *   isYourTurn:   boolean,
 * }} permissions
 * @returns {HTMLElement}
 */
export function renderPostCard(record, permissions, _currentUser) {
  const {
    canChallenge = { allowed: false },
    canAgree     = null,
    isYourTurn   = false,
  } = permissions;

  const card = document.createElement('div');
  card.className = `card post-card post-card--${record.type}`;
  card.dataset.recordId = record.id;

  card.innerHTML = `
    <div class="card__header">
      <span class="post-type-icon" aria-label="${_esc(record.type)}">${_typeIcon(record.type)}</span>
      <span class="post-author">@${_esc(record.authorHandle ?? '?')}</span>
      <time class="post-time" datetime="${_esc(record.createdAt)}">${_relTime(record.createdAt)}</time>
      ${isYourTurn ? '<span class="badge badge--your-turn">Your turn</span>' : ''}
      ${record.openCaseCount > 0
        ? `<span class="badge badge--cases" title="${record.openCaseCount} open case(s)">${_esc(String(record.openCaseCount))} ⚔</span>`
        : ''}
      ${record.accordCount > 0
        ? `<span class="badge badge--accords" title="${record.accordCount} accord(s)">⇌ ${_esc(String(record.accordCount))}</span>`
        : ''}
    </div>
    <div class="card__body">
      <p class="post-text">${_esc(record.text)}</p>
    </div>
    <div class="card__actions">
      ${_challengeBtn(canChallenge)}
      ${canAgree !== null ? _agreeBtn(canAgree) : ''}
      <button class="icon-btn btn--copy" data-action="copy-url" aria-label="Copy link">
        ${ICON_COPY}
      </button>
    </div>
  `.trim();

  card.querySelector('[data-action="copy-url"]')?.addEventListener('click', e => {
    e.stopPropagation();
    navigator.clipboard.writeText(buildCanonicalUrl({ claimId: record.id }))
      .then(() => showNotification('Link copied!', 'success'))
      .catch(() => showNotification('Could not copy link.', 'error'));
  });

  return card;
}

function _typeIcon(type) {
  switch (type) {
    case 'claim':     return `<span class="icon--claim">${ICON_CLAIM}</span>`;
    case 'challenge': return `<span class="icon--challenge">${ICON_CHALLENGE}</span>`;
    case 'answer':    return `<span class="icon--answer">${ICON_ANSWER}</span>`;
    case 'offer':     return `<span class="icon--offer">${ICON_OFFER}</span>`;
    default:          return '';
  }
}

function _challengeBtn({ allowed, reason = '' }) {
  const disabled = allowed ? '' : 'disabled';
  return `<button class="icon-btn btn--challenge" data-action="challenge"
    ${disabled} title="${_esc(allowed ? 'Challenge this claim' : reason)}"
    aria-label="Challenge">${ICON_CHALLENGE}</button>`;
}

function _agreeBtn({ allowed, reason = '' }) {
  const disabled = allowed ? '' : 'disabled';
  return `<button class="icon-btn btn--agree" data-action="agree"
    ${disabled} title="${_esc(allowed ? 'Accord with this claim' : reason)}"
    aria-label="Accord">${ICON_AGREE}</button>`;
}

function _esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _relTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
