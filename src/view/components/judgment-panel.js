/**
 * View component: Judgment Panel
 *
 * Rendered at the bottom of DisputeView when a Duel has reached Disposition.
 * Shows:
 *   1. Verdict tally (challenger / defender / inconclusive counts)
 *   2. Existing Judgment cards
 *   3. Analysis submission form (if user can analyze)
 *   4. Judgment form (if user has Analysis + Base of Truth)
 *
 * @param {object} opts
 * @param {import('../../model/dispute.js').Dispute}      opts.dispute
 * @param {import('../../model/judgment.js').Judgment[]}  opts.judgments
 * @param {import('../../model/judgment.js').Analysis[]}  opts.analyses
 * @param {import('../../model/judgment.js').BaseOfTruth|null} opts.baseOfTruth
 * @param {{ id: number, login: string }|null}            opts.user
 * @param {import('../../controller/judgment-controller.js').JudgmentController} opts.judgmentCtrl
 * @param {() => Promise<void>}                           opts.onRefresh
 * @returns {HTMLElement}
 */

import {
  JUDGMENT_VERDICT_CHALLENGER,
  JUDGMENT_VERDICT_DEFENDER,
  JUDGMENT_VERDICT_INCONCLUSIVE,
} from '../../controller/judgment-controller.js';
import { showNotification } from './notification.js';

export function renderJudgmentPanel({ dispute, judgments, analyses, baseOfTruth, user, judgmentCtrl, onRefresh }) {
  const panel = document.createElement('section');
  panel.className = 'judgment-panel';

  // --- Tally ---
  const forChallenger  = judgments.filter(j => j.favoursChallenger).length;
  const forDefender    = judgments.filter(j => j.favoursDefender).length;
  const inconclusive   = judgments.filter(j => j.isInconclusive).length;

  panel.innerHTML = `
    <h3 class="judgment-panel__title">⚖️ Judgments</h3>
    <div class="judgment-panel__tally">
      <span class="judgment-tally__item judgment-tally__item--challenger"
            title="Judged: Challenger made stronger case">
        Challenger ${forChallenger}
      </span>
      <span class="judgment-tally__sep">·</span>
      <span class="judgment-tally__item judgment-tally__item--defender"
            title="Judged: Defender held position">
        Defender ${forDefender}
      </span>
      ${inconclusive ? `<span class="judgment-tally__sep">·</span>
      <span class="judgment-tally__item" title="Inconclusive">— ${inconclusive}</span>` : ''}
    </div>
  `.trim();

  // --- Existing judgment cards ---
  if (judgments.length > 0) {
    const list = document.createElement('div');
    list.className = 'judgment-panel__list';
    judgments.forEach(j => list.appendChild(_judgmentCard(j)));
    panel.appendChild(list);
  } else {
    const empty = document.createElement('p');
    empty.className = 'judgment-panel__empty';
    empty.textContent = 'No Judgments yet. Be first to analyze and judge.';
    panel.appendChild(empty);
  }

  if (!user) {
    const cta = document.createElement('p');
    cta.className = 'judgment-panel__signin-cta';
    cta.textContent = 'Sign in to submit Analysis and render Judgment.';
    panel.appendChild(cta);
    return panel;
  }

  // --- Analysis / Judgment forms ---
  const canAnalyze  = judgmentCtrl.canAnalyze(user, dispute);
  const myAnalysis  = analyses.find(a => a.authorPersonId === user.id);
  const canJudge    = judgmentCtrl.canJudge(user, dispute, analyses, baseOfTruth, judgments);

  if (canAnalyze.allowed && !myAnalysis) {
    panel.appendChild(_analysisForm(user, dispute, judgmentCtrl, onRefresh));
  } else if (myAnalysis && !myAnalysis._formOpen && canJudge.allowed) {
    panel.appendChild(_judgmentForm(user, dispute, myAnalysis, baseOfTruth, judgmentCtrl, onRefresh));
  } else if (!canAnalyze.allowed && canAnalyze.reason) {
    const note = document.createElement('p');
    note.className = 'judgment-panel__gate-note';
    note.textContent = canAnalyze.reason;
    panel.appendChild(note);
  } else if (myAnalysis && !canJudge.allowed) {
    const note = document.createElement('p');
    note.className = 'judgment-panel__gate-note';
    note.textContent = canJudge.reason;
    panel.appendChild(note);
  }

  return panel;
}

// ---------------------------------------------------------------------------
// Judgment card
// ---------------------------------------------------------------------------

function _judgmentCard(j) {
  const verdictLabel = j.favoursChallenger
    ? 'Challenger'
    : j.favoursDefender
      ? 'Defender'
      : 'Inconclusive';

  const verdictClass = j.favoursChallenger
    ? 'judgment-card--challenger'
    : j.favoursDefender
      ? 'judgment-card--defender'
      : 'judgment-card--inconclusive';

  const card = document.createElement('div');
  card.className = `judgment-card ${verdictClass}`;
  card.innerHTML = `
    <div class="judgment-card__header">
      <span class="judgment-card__judge">@${_esc(j.judgeLogin)}</span>
      <span class="judgment-card__verdict">${_esc(verdictLabel)}</span>
      <time class="judgment-card__time">${_relTime(j.createdAt)}</time>
    </div>
    <p class="judgment-card__reasoning">${_esc(_truncate(j.reasoning, 200))}</p>
    ${j.baseOfTruthClaimId
      ? `<p class="judgment-card__bot">Grounded in Base of Truth (anchor Claim #${j.baseOfTruthClaimId})</p>`
      : ''}
  `.trim();
  return card;
}

// ---------------------------------------------------------------------------
// Analysis form
// ---------------------------------------------------------------------------

function _analysisForm(user, dispute, judgmentCtrl, onRefresh) {
  const wrap = document.createElement('div');
  wrap.className = 'judgment-form';
  wrap.innerHTML = `
    <h4 class="judgment-form__title">Submit Analysis</h4>
    <p class="judgment-form__hint">
      Analyze the exchange to unlock Judgment. Reference specific moments in the Duel.
    </p>
    <textarea class="judgment-form__textarea" rows="5"
              placeholder="Describe the quality of each party's position, the strength of evidence presented, logical consistency, and what you believe happened here…"
              aria-label="Analysis text"></textarea>
    <div class="judgment-form__actions">
      <button class="btn btn--primary judgment-form__submit">Submit Analysis</button>
    </div>
    <p class="judgment-form__error" style="display:none"></p>
  `.trim();

  const textarea = wrap.querySelector('.judgment-form__textarea');
  const submitBtn = wrap.querySelector('.judgment-form__submit');
  const errEl = wrap.querySelector('.judgment-form__error');

  submitBtn.addEventListener('click', async () => {
    const summary = textarea.value.trim();
    if (!summary) { _showErr(errEl, 'Analysis text is required.'); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    try {
      await judgmentCtrl.submitAnalysis(user, dispute, { summary });
      showNotification('Analysis submitted!', 'success');
      await onRefresh();
    } catch (err) {
      _showErr(errEl, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Analysis';
    }
  });

  return wrap;
}

// ---------------------------------------------------------------------------
// Judgment form
// ---------------------------------------------------------------------------

function _judgmentForm(user, dispute, analysis, baseOfTruth, judgmentCtrl, onRefresh) {
  const wrap = document.createElement('div');
  wrap.className = 'judgment-form';
  wrap.innerHTML = `
    <h4 class="judgment-form__title">Render Judgment</h4>
    <p class="judgment-form__hint">
      Your Analysis is on record. Now render your verdict, grounded in your Base of Truth.
    </p>
    ${baseOfTruth?.declarationText
      ? `<p class="judgment-form__bot-summary">
           Base of Truth: "<em>${_esc(_truncate(baseOfTruth.declarationText, 120))}</em>"
         </p>`
      : ''}
    <fieldset class="judgment-form__verdict-selector">
      <legend>Your verdict</legend>
      <label>
        <input type="radio" name="verdict" value="${JUDGMENT_VERDICT_CHALLENGER}">
        Challenger made the stronger case
      </label>
      <label>
        <input type="radio" name="verdict" value="${JUDGMENT_VERDICT_DEFENDER}">
        Defender held their position
      </label>
      <label>
        <input type="radio" name="verdict" value="${JUDGMENT_VERDICT_INCONCLUSIVE}">
        Inconclusive — neither party prevailed
      </label>
    </fieldset>
    <textarea class="judgment-form__textarea judgment-form__textarea--reasoning" rows="4"
              placeholder="State your reasoning — what specifically led you to this verdict?"
              aria-label="Judgment reasoning"></textarea>
    <div class="judgment-form__actions">
      <button class="btn btn--primary judgment-form__submit">Render Judgment</button>
    </div>
    <p class="judgment-form__error" style="display:none"></p>
  `.trim();

  const textarea  = wrap.querySelector('.judgment-form__textarea--reasoning');
  const submitBtn = wrap.querySelector('.judgment-form__submit');
  const errEl     = wrap.querySelector('.judgment-form__error');

  submitBtn.addEventListener('click', async () => {
    const checkedVerdict = wrap.querySelector('input[name="verdict"]:checked');
    if (!checkedVerdict) { _showErr(errEl, 'Select a verdict.'); return; }
    const reasoning = textarea.value.trim();
    if (!reasoning)  { _showErr(errEl, 'Reasoning is required.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    try {
      await judgmentCtrl.submitJudgment(user, dispute, {
        verdict:            checkedVerdict.value,
        reasoning,
        analysisId:         analysis.id,
        baseOfTruthClaimId: baseOfTruth?.anchorClaimId ?? null,
      });
      showNotification('Judgment rendered!', 'success');
      await onRefresh();
    } catch (err) {
      _showErr(errEl, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Render Judgment';
    }
  });

  return wrap;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _showErr(el, msg) {
  el.style.display = '';
  el.textContent   = msg;
  setTimeout(() => { el.style.display = 'none'; }, 4000);
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

function _relTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
