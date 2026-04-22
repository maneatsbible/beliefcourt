/**
 * View: Case Court
 * Renders a case with its claim, duels, and duel records.
 * Two-lane layout: Challenger vs Defender.
 */

import { DisputeController } from '../controller/dispute-controller.js';
import { renderComposer }    from './components/composer.js';
import { renderJudgmentPanel } from './components/judgment-panel.js';
import { showNotification }  from './components/notification.js';
import { showErrorPanel }    from './components/error-panel.js';
import { setUrlParams }      from '../utils/url.js';
import { iconForType }       from '../utils/icons.js';

function _esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _ago(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export class CaseView {
  /**
   * @param {HTMLElement}     container
   * @param {DisputeController} ctrl
   * @param {{ id:string, handle:string }|null} currentUser
   */
  constructor(container, ctrl, currentUser) {
    this._el   = container;
    this._ctrl = ctrl;
    this._user = currentUser;
  }

  async render(caseId) {
    this._el.innerHTML = '<div class="loading">Loading case…</div>';
    try {
      const { case: caseObj, claim, duels } = await this._ctrl.loadCase(caseId);
      this._renderCase(caseObj, claim, duels);
    } catch (err) {
      showErrorPanel(err, 'dispute-view');
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  _renderCase(caseObj, claim, duels) {
    const el = this._el;
    el.innerHTML = '';

    // Back link
    const back = document.createElement('button');
    back.className = 'btn-back';
    back.textContent = '← Back';
    back.addEventListener('click', () => setUrlParams({}));
    el.appendChild(back);

    // Claim header
    if (claim) {
      const header = document.createElement('div');
      header.className = 'dispute-claim-header';
      header.innerHTML = `
        <div class="dispute-claim-header__icon">${iconForType('claim')}</div>
        <div class="dispute-claim-header__body">
          <p class="dispute-claim-header__text">${_esc(claim.text)}</p>
          <p class="dispute-claim-header__meta">by @${_esc(claim.authorHandle)} · ${_ago(claim.createdAt)}</p>
        </div>
      `;
      el.appendChild(header);
    }

    // Case meta bar
    const meta = document.createElement('div');
    meta.className = `dispute-meta dispute-meta--${_esc(caseObj.status)}`;
    meta.innerHTML = `
      <span class="dispute-meta__participants">
        <span class="dispute-meta__challenger">⚡ @${_esc(caseObj.challengerHandle)}</span>
        <span class="dispute-meta__vs">vs</span>
        <span class="dispute-meta__respondent">🛡 @${_esc(caseObj.respondentHandle)}</span>
      </span>
      <span class="dispute-meta__status badge badge--${_esc(caseObj.status)}">${_esc(caseObj.status.toUpperCase())}</span>
    `;
    el.appendChild(meta);

    // Duels
    for (const duel of duels) {
      el.appendChild(this._renderDuel(duel, caseObj));
    }
  }

  _renderDuel(duel, caseObj) {
    const section = document.createElement('section');
    section.className = `duel duel--${_esc(duel.status)}`;
    section.setAttribute('aria-label', `Round ${duel.round}`);

    const heading = document.createElement('h3');
    heading.className = 'duel__heading';
    heading.textContent = `Round ${duel.round} · ${duel.status.toUpperCase()}`;
    section.appendChild(heading);

    // Records in this duel
    const records = duel.records ?? [];
    const challengeRec = records.find(r => r.id === duel.challengeRecordId);
    const answerRec    = records.find(r => r.id === duel.answerRecordId);
    const dispositionRec = records.find(r => r.id === duel.dispositionRecordId);

    // Two-lane layout
    const lanes = document.createElement('div');
    lanes.className = 'duel__lanes';

    const challengerLane = document.createElement('div');
    challengerLane.className = 'duel__lane duel__lane--challenger';
    if (challengeRec) challengerLane.appendChild(this._renderRecord(challengeRec, 'CHALLENGING'));

    const defenderLane = document.createElement('div');
    defenderLane.className = 'duel__lane duel__lane--defender';
    if (answerRec) {
      defenderLane.appendChild(this._renderRecord(answerRec, 'DEFENDING'));
    } else if (duel.isActive ?? duel.status === 'active') {
      const perm = this._ctrl.canAnswer(duel, caseObj);
      if (perm.allowed) {
        defenderLane.appendChild(this._renderAnswerComposer(duel));
      } else {
        const wait = document.createElement('p');
        wait.className = 'duel__waiting';
        wait.textContent = `Awaiting @${_esc(caseObj.respondentHandle)}'s response…`;
        defenderLane.appendChild(wait);
      }
    }

    lanes.appendChild(challengerLane);
    lanes.appendChild(defenderLane);
    section.appendChild(lanes);

    // Disposition / judgment panel
    if (dispositionRec) {
      section.appendChild(renderJudgmentPanel(dispositionRec));
    } else if (duel.status === 'resolved' || duel.status === 'crickets') {
      const jp = renderJudgmentPanel(null, { status: duel.status });
      if (jp) section.appendChild(jp);
    }

    return section;
  }

  _renderRecord(record, badge) {
    const card = document.createElement('div');
    card.className = `duel__record duel__record--${_esc(record.type)}`;
    card.innerHTML = `
      <div class="duel__record-badge">${_esc(badge)}</div>
      <p class="duel__record-text">${_esc(record.text)}</p>
      <p class="duel__record-meta">
        ${iconForType(record.type)} @${_esc(record.authorHandle)} · ${_ago(record.createdAt)}
        ${record.isAi ? `<span class="badge badge--ai">AI · ${_esc(record.aiModel)}</span>` : ''}
      </p>
    `;
    return card;
  }

  _renderAnswerComposer(duel) {
    const wrap = document.createElement('div');
    wrap.className = 'duel__composer-wrap';
    renderComposer(wrap, {
      mode: 'answer',
      placeholder: 'Write your response to this challenge…',
      onSubmit: async ({ text }) => {
        try {
          await this._ctrl.submitAnswer(duel.id, text);
          showNotification('Answer submitted.', 'success');
          // Reload duel
          await this.render(duel.caseId);
        } catch (err) {
          showNotification('Failed to submit: ' + err.message, 'error');
        }
      },
      onCancel: () => wrap.remove(),
    });
    return wrap;
  }
}

// Backward-compatible alias for Truthbook naming.
export { CaseView as CaseTruthbookView };
