/**
 * View component: Record card.
 * Renders a single Record (claim, challenge, answer, etc.) as a card element.
 *
 * FR-042: copy-to-clipboard on every card
 * FR-045: type icons Claim=!, Challenge=?, Answer=✓, Offer=⇌, Response=·/✗
 * FR-047: untested / standing visual state
 * FR-051: click-anywhere-to-open
 * FR-052: stacked depth shadows via CSS class
 * FR-060: [AI] / [AI-assisted] badge
 */

import {
  ICON_CLAIM, ICON_CHALLENGE, ICON_ANSWER, ICON_OFFER,
  ICON_RESPONSE_ACCEPT,
  ICON_COPY, ICON_AGREE,
} from '../../utils/icons.js';
import { buildCanonicalUrl } from '../../utils/url.js';
import { showNotification }  from './notification.js';

/**
 * @param {import('../../model/record.js').Record} record
 * @param {{
 *   canChallenge: { allowed: boolean, reason?: string },
 *   canAgree:     { allowed: boolean, reason?: string } | null,
 *   isYourTurn:   boolean,
 * }} permissions
 * @param {{ id: string, handle: string }|null} currentUser
 * @param {{ onOpen?: (record) => void }} [handlers]
 * @returns {HTMLElement}
 */
export function renderRecordCard(record, permissions, currentUser, handlers = {}) {
  const {
    canChallenge = { allowed: false },
    canAgree     = null,
    isYourTurn   = false,
  } = permissions;

  // Derive visual state for FR-047
  const isUntested = record.isClaim && record.openCaseCount === 0;
  const isStanding = record.isClaim && record.openCaseCount === 0 && record.accordCount > 0;
  const stateClass = isStanding ? 'record-card--standing'
                   : isUntested ? 'record-card--untested'
                   : '';

  const card = document.createElement('div');
  card.className = `card record-card record-card--${record.type} ${stateClass}`.trim();
  card.dataset.recordId = record.id;
  card.setAttribute('role', 'article');
  card.setAttribute('tabindex', '0');
  card.style.cursor = 'pointer';

  // AI disclosure badges (FR-060)
  const aiBadge = record.isAi
    ? '<span class="badge badge--ai" title="AI-generated">[AI]</span>'
    : record.aiModel
      ? '<span class="badge badge--ai-assisted" title="AI-assisted">[AI-assisted]</span>'
      : '';

  // State badge (FR-047)
  const stateBadge = isStanding
    ? '<span class="badge badge--standing">STANDING</span>'
    : isUntested
      ? '<span class="badge badge--untested">UNTESTED</span>'
      : '';

  card.innerHTML = `
    <div class="card__header">
      <span class="record-type-icon" aria-label="${_esc(record.type)}">${_typeIcon(record.type)}</span>
      <span class="record-author">@${_esc(record.authorHandle ?? '?')}</span>
      <time class="record-time" datetime="${_esc(record.createdAt)}">${_relTime(record.createdAt)}</time>
      ${isYourTurn   ? '<span class="badge badge--your-turn">Your turn</span>' : ''}
      ${aiBadge}
      ${stateBadge}
      ${record.openCaseCount > 0
        ? `<span class="badge badge--cases" title="${record.openCaseCount} open case(s)">${_esc(String(record.openCaseCount))} ?</span>`
        : ''}
      ${record.accordCount > 0
        ? `<span class="badge badge--accords" title="${record.accordCount} accord(s)">\u21cc ${_esc(String(record.accordCount))}</span>`
        : ''}
    </div>
    <div class="card__body">
      <p class="record-text">${_esc(record.text)}</p>
    </div>
    <div class="card__actions">
      ${_challengeBtn(canChallenge)}
      ${canAgree !== null ? _agreeBtn(canAgree) : ''}
      <button class="icon-btn btn--copy" data-action="copy-url" aria-label="Copy link">
        ${ICON_COPY}
      </button>
    </div>
  `.trim();

  // Copy button (FR-042) — stop propagation so card click doesn't also fire
  card.querySelector('[data-action="copy-url"]')?.addEventListener('click', e => {
    e.stopPropagation();
    navigator.clipboard.writeText(buildCanonicalUrl({ claimId: record.id }))
      .then(() => showNotification('Link copied!', 'success'))
      .catch(() => showNotification('Could not copy link.', 'error'));
  });

  // Action buttons stop propagation too
  card.querySelectorAll('[data-action="challenge"], [data-action="agree"]').forEach(btn => {
    btn.addEventListener('click', e => e.stopPropagation());
  });

  // Click-anywhere-to-open (FR-051)
  card.addEventListener('click', () => handlers.onOpen?.(record));

  // Keyboard a11y
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlers.onOpen?.(record);
    }
  });

  return card;
}

function _typeIcon(type) {
  switch (type) {
    case 'claim':     return `<span class="icon--claim">${ICON_CLAIM}</span>`;
    case 'challenge': return `<span class="icon--challenge">${ICON_CHALLENGE}</span>`;
    case 'answer':    return `<span class="icon--answer">${ICON_ANSWER}</span>`;
    case 'offer':     return `<span class="icon--offer">${ICON_OFFER}</span>`;
    case 'response':  return `<span class="icon--response">${ICON_RESPONSE_ACCEPT}</span>`;
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
