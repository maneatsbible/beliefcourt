/**
 * View component: Judgment Panel
 * Displays the disposition record for a resolved duel, or a status banner.
 */

import { iconForType } from '../../utils/icons.js';

function _esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _ago(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_LABELS = {
  resolved: 'Case resolved',
  crickets: 'No response — Crickets',
  verdict:  'Verdict issued',
};

/**
 * Render a judgment / disposition panel.
 *
 * @param {import('../../model/record.js').Record|null} record  The disposition record, if any.
 * @param {{ status?: string }}                         [opts]
 * @returns {HTMLElement}
 */
export function renderJudgmentPanel(record, opts = {}) {
  const panel = document.createElement('div');

  if (record) {
    panel.className = `judgment-panel judgment-panel--${_esc(record.type)}`;
    panel.innerHTML = `
      <div class="judgment-panel__header">
        <span class="judgment-panel__icon" aria-hidden="true">${iconForType(record.type)}</span>
        <span class="judgment-panel__label">${_esc(STATUS_LABELS[record.status] ?? record.type.toUpperCase())}</span>
        <span class="judgment-panel__by">by @${_esc(record.authorHandle)} · ${_ago(record.createdAt)}</span>
        ${record.isAi ? `<span class="badge badge--ai">AI</span>` : ''}
      </div>
      <p class="judgment-panel__text">${_esc(record.text)}</p>
    `;
  } else if (opts.status) {
    panel.className = `judgment-panel judgment-panel--${_esc(opts.status)}`;
    panel.innerHTML = `
      <div class="judgment-panel__header">
        <span class="judgment-panel__label">${_esc(STATUS_LABELS[opts.status] ?? opts.status.toUpperCase())}</span>
      </div>
    `;
  } else {
    return null;
  }

  return panel;
}
