/**
 * View component: rich error panel.
 *
 * showErrorPanel(error, context) replaces #app-main content with a full
 * interactive debug panel:
 *   - Human-readable summary
 *   - Full stack trace (scrollable <pre>)
 *   - Structured log dump with level filtering and expandable rows
 *   - Copy-to-clipboard debug bundle
 *   - Retry (reload) button
 */

import { logger } from '../../utils/logger.js';

const LEVEL_COLOURS = {
  debug: 'var(--color-text-muted)',
  info:  'var(--color-accent-blue)',
  warn:  'var(--color-accent-yellow)',
  error: 'var(--color-accent-red)',
};

function _escape(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Replace #app-main with the error panel.
 *
 * @param {Error|unknown} error
 * @param {string}        context  Short label, e.g. 'app bootstrap'
 */
export function showErrorPanel(error, context = 'unknown') {
  const main = document.getElementById('app-main');
  if (!main) return;

  const err     = error instanceof Error ? error : new Error(String(error));
  const entries = logger.getEntries();

  main.innerHTML = _buildHtml(err, context, entries);
  _wireInteractions(main, err, context, entries);
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function _buildHtml(err, context, entries) {
  const stack = _escape(err.stack ?? err.message ?? 'No stack available');

  const logRows = entries.map((e, i) => `
    <tr class="err-log__row" data-idx="${i}" tabindex="0"
        style="--level-color:${LEVEL_COLOURS[e.level] ?? 'inherit'}">
      <td class="err-log__chip err-log__chip--${_escape(e.level)}">${_escape(e.level)}</td>
      <td class="err-log__ts">${_escape(e.ts.slice(11, 23))}</td>
      <td class="err-log__ctx">${_escape(e.context)}</td>
      <td class="err-log__msg">${_escape(e.message)}</td>
    </tr>
    <tr class="err-log__detail" id="err-log-detail-${i}" hidden>
      <td colspan="4">
        <pre class="err-log__detail-pre">${_escape(JSON.stringify(e.data, null, 2))}</pre>
      </td>
    </tr>
  `).join('');

  return `
    <div class="err-panel">
      <div class="err-panel__header">
        <span class="err-panel__icon">⚠</span>
        <div>
          <h2 class="err-panel__title">Something went wrong</h2>
          <p class="err-panel__context">Context: <code>${_escape(context)}</code></p>
        </div>
      </div>

      <p class="err-panel__summary">${_escape(err.message)}</p>

      <details class="err-panel__details">
        <summary class="err-panel__details-summary">Stack trace</summary>
        <pre class="err-panel__stack">${stack}</pre>
      </details>

      <div class="err-panel__log-header">
        <span class="err-panel__log-title">Log (${entries.length} entries)</span>
        <select class="err-panel__log-filter" id="err-log-filter" aria-label="Filter by level">
          <option value="">All levels</option>
          <option value="debug">debug</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
      </div>

      <div class="err-panel__log-wrap">
        <table class="err-log" id="err-log-table">
          <thead>
            <tr>
              <th>Level</th><th>Time</th><th>Context</th><th>Message</th>
            </tr>
          </thead>
          <tbody>${logRows}</tbody>
        </table>
      </div>

      <div class="err-panel__actions">
        <button class="btn btn--secondary" id="err-copy-btn">Copy debug bundle</button>
        <button class="btn btn--primary"   id="err-retry-btn">Retry</button>
      </div>
    </div>
  `.trim();
}

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

function _wireInteractions(root, err, context, entries) {
  // Retry
  root.querySelector('#err-retry-btn')?.addEventListener('click', () => {
    window.location.reload();
  });

  // Copy debug bundle
  root.querySelector('#err-copy-btn')?.addEventListener('click', async () => {
    const bundle = JSON.stringify({
      timestamp:   new Date().toISOString(),
      url:         window.location.href,
      userAgent:   navigator.userAgent,
      context,
      error:       { message: err.message, stack: err.stack },
      logs:        entries,
    }, null, 2);

    try {
      await navigator.clipboard.writeText(bundle);
      const btn = root.querySelector('#err-copy-btn');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy debug bundle'; }, 2000); }
    } catch {
      // Fallback: select a hidden textarea
      const ta = document.createElement('textarea');
      ta.value = bundle;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  });

  // Expand/collapse log rows on click or Enter/Space
  const table = root.querySelector('#err-log-table');
  table?.addEventListener('click', e => {
    _toggleLogRow(e.target.closest('tr.err-log__row'));
  });
  table?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      _toggleLogRow(e.target.closest('tr.err-log__row'));
    }
  });

  // Level filter
  root.querySelector('#err-log-filter')?.addEventListener('change', e => {
    const level = e.target.value;
    const rows  = table?.querySelectorAll('tr.err-log__row') ?? [];
    rows.forEach(row => {
      const chip = row.querySelector('.err-log__chip');
      const rowLevel = chip?.textContent?.trim() ?? '';
      const hide = level && rowLevel !== level;
      row.hidden = hide;
      // Also hide detail row
      const idx = row.dataset.idx;
      const detail = root.querySelector(`#err-log-detail-${idx}`);
      if (detail && hide) detail.hidden = true;
    });
  });
}

function _toggleLogRow(row) {
  if (!row) return;
  const idx    = row.dataset.idx;
  const detail = document.getElementById(`err-log-detail-${idx}`);
  if (detail) {
    detail.hidden = !detail.hidden;
    row.classList.toggle('err-log__row--expanded', !detail.hidden);
  }
}
