/**
 * View: Person profile — Worldview Renderer
 *
 * Renders:
 *   - Profile header (@login, stats bar)
 *   - Base of Truth (if declared)
 *   - Claims section (standing claims, rescission badges)
 *   - Duels section (as Challenger / as Defender, with context icons)
 *   - Agreements section
 *   - Judgments Rendered section
 *   - "Declare Base of Truth" form (own profile, no BoT yet)
 *
 * Dependencies:
 *   - WorldviewController (loads the profile)
 *   - JudgmentController  (loads BaseOfTruth, submits BoT)
 *   - renderJudgmentPanel  (not used directly here)
 */

import { WorldviewController } from '../../controller/worldview-controller.js';
import { JudgmentController }  from '../../controller/judgment-controller.js';
import { getFraming }          from '../../model/duel-context.js';
import { buildPersonUrl }      from '../../utils/url.js';
import { showNotification }    from '../components/notification.js';

export class PersonView {
  /**
   * @param {HTMLElement} root
   * @param {WorldviewController} worldviewCtrl
   * @param {JudgmentController}  judgmentCtrl
   * @param {{ id: number, login: string }|null} currentUser
   * @param {import('../../model/dispute.js').Dispute[]} allDisputes
   */
  constructor(root, worldviewCtrl, judgmentCtrl, currentUser, allDisputes) {
    this._root          = root;
    this._worldviewCtrl = worldviewCtrl;
    this._judgmentCtrl  = judgmentCtrl;
    this._user          = currentUser;
    this._allDisputes   = allDisputes ?? [];
  }

  async render(login) {
    if (!login) {
      this._root.innerHTML = '<p class="person-view__error">No user specified.</p>';
      return;
    }
    this._root.innerHTML = '<p class="person-view__loading">Loading worldview…</p>';
    try {
      const profile = await this._worldviewCtrl.loadProfile(login);
      let baseOfTruth = null;
      if (this._judgmentCtrl) {
        try { baseOfTruth = await this._judgmentCtrl.loadBaseOfTruth(profile.login); } catch (_) {}
      }
      this._renderProfile(profile, baseOfTruth);
    } catch (err) {
      this._root.innerHTML = `<p class="person-view__error">Failed to load profile: ${_esc(err.message)}</p>`;
    }
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  _renderProfile(profile, baseOfTruth) {
    const isOwnProfile = this._user?.login === profile.login;

    const el = document.createElement('div');
    el.className = 'person-view';

    // ------ Back button ------
    const back = document.createElement('button');
    back.className = 'person-view__back btn btn--ghost';
    back.textContent = '← Back';
    back.addEventListener('click', () => {
      this._root.dispatchEvent(new CustomEvent('dsp:navigate', {
        bubbles: true,
        detail: { view: 'home' },
      }));
    });
    el.appendChild(back);

    // ------ Header ------
    const header = document.createElement('div');
    header.className = 'person-view__header';
    header.innerHTML = `
      <div class="person-view__identity">
        <img class="person-view__avatar"
             src="https://github.com/${_esc(profile.login)}.png?size=72"
             alt="@${_esc(profile.login)}"
             width="72" height="72">
        <div>
          <h2 class="person-view__login">@${_esc(profile.login)}</h2>
          <p class="person-view__subtitle">Worldview</p>
        </div>
      </div>
      <nav class="person-view__stats" aria-label="Profile stats">
        <span class="person-view__stat" title="Filed Claims">
          <strong>${profile.claims.length}</strong> Claims
        </span>
        <span class="person-view__stat" title="Total Duels entered">
          <strong>${profile.totalDuels}</strong> Duels
        </span>
        <span class="person-view__stat" title="Active Duels">
          <strong>${profile.activeCount}</strong> Active
        </span>
        <span class="person-view__stat" title="Accords reached">
          <strong>${profile.accordCount}</strong> Accords
        </span>
        <span class="person-view__stat" title="Victories (Defender held)">
          <strong>${profile.defendedCount}</strong> Defended
        </span>
        <span class="person-view__stat" title="Judgments rendered by this person">
          <strong>${profile.judgments.length}</strong> Judged
        </span>
      </nav>
    `.trim();
    el.appendChild(header);

    // ------ Base of Truth ------
    el.appendChild(this._renderBotSection(profile, baseOfTruth, isOwnProfile));

    // ------ Standing Claims ------
    el.appendChild(this._renderClaimsSection(profile));

    // ------ Duels ------
    el.appendChild(this._renderDuelsSection(profile));

    // ------ Agreements ------
    el.appendChild(this._renderAgreementsSection(profile));

    // ------ Judgments Rendered ------
    el.appendChild(this._renderJudgmentsSection(profile));

    this._root.innerHTML = '';
    this._root.appendChild(el);
  }

  // -------------------------------------------------------------------------
  // Base of Truth
  // -------------------------------------------------------------------------

  _renderBotSection(profile, baseOfTruth, isOwnProfile) {
    const section = document.createElement('section');
    section.className = 'person-view__section person-view__section--bot';

    const heading = document.createElement('h3');
    heading.className = 'person-view__section-title';
    heading.textContent = 'Base of Truth';
    section.appendChild(heading);

    if (baseOfTruth?.isDeclared) {
      const botCard = document.createElement('div');
      botCard.className = 'person-view__bot-card';
      botCard.innerHTML = `
        <p class="person-view__bot-text">"${_esc(_trunc(baseOfTruth.declarationText, 300))}"</p>
        ${baseOfTruth.anchorClaimId
          ? `<p class="person-view__bot-anchor">
               Anchor Claim: <a href="?v=dispute&id=${baseOfTruth.anchorClaimId}" class="person-view__link">
                 #${baseOfTruth.anchorClaimId}
               </a>
             </p>`
          : ''}
      `.trim();
      section.appendChild(botCard);
    } else {
      const empty = document.createElement('p');
      empty.className = 'person-view__empty-note';
      empty.textContent = 'No Base of Truth declared.';
      section.appendChild(empty);

      if (isOwnProfile && this._judgmentCtrl) {
        section.appendChild(this._renderBotForm());
      }
    }

    return section;
  }

  _renderBotForm() {
    const form = document.createElement('div');
    form.className = 'person-view__bot-form';
    form.innerHTML = `
      <h4 class="person-view__bot-form-title">Declare your Base of Truth</h4>
      <textarea class="judgment-form__textarea" rows="4"
                placeholder="State your epistemic foundation — your source of truth, interpretive method, or first principles…"
                aria-label="Base of Truth declaration"></textarea>
      <input type="number" class="person-view__bot-anchor-input"
             placeholder="Anchor Claim # (optional)" min="1" aria-label="Anchor claim number">
      <div class="judgment-form__actions">
        <button class="btn btn--primary person-view__bot-submit">Declare</button>
      </div>
      <p class="judgment-form__error" style="display:none"></p>
    `.trim();

    const textarea  = form.querySelector('.judgment-form__textarea');
    const anchorIn  = form.querySelector('.person-view__bot-anchor-input');
    const submitBtn = form.querySelector('.person-view__bot-submit');
    const errEl     = form.querySelector('.judgment-form__error');

    submitBtn.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) { _showErr(errEl, 'Declaration text is required.'); return; }
      const anchor = anchorIn.value ? parseInt(anchorIn.value, 10) : null;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';
      try {
        await this._judgmentCtrl.setBaseOfTruth(this._user, {
          declarationText: text,
          anchorClaimId:   anchor,
        });
        showNotification('Base of Truth declared!', 'success');
        await this.render(this._user.login);
      } catch (err) {
        _showErr(errEl, err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Declare';
      }
    });
    return form;
  }

  // -------------------------------------------------------------------------
  // Claims
  // -------------------------------------------------------------------------

  _renderClaimsSection(profile) {
    const section = document.createElement('section');
    section.className = 'person-view__section';

    const heading = document.createElement('h3');
    heading.className = 'person-view__section-title';
    heading.textContent = `Claims (${profile.claims.length})`;
    section.appendChild(heading);

    if (profile.claims.length === 0) {
      section.appendChild(_emptyNote('No claims filed.'));
      return section;
    }

    const list = document.createElement('div');
    list.className = 'person-view__claim-list';
    profile.claims.forEach(claim => {
      const isRescinded = profile.rescindedIds.has(claim.id);
      const row = document.createElement('div');
      row.className = `person-view__claim-row${isRescinded ? ' person-view__claim-row--rescinded' : ''}`;
      row.innerHTML = `
        <span class="person-view__claim-text">${_esc(_trunc(claim.content ?? claim.text ?? '', 120))}</span>
        ${isRescinded ? '<span class="person-view__claim-badge person-view__claim-badge--rescinded">RESCINDED</span>' : ''}
      `.trim();
      list.appendChild(row);
    });
    section.appendChild(list);
    return section;
  }

  // -------------------------------------------------------------------------
  // Duels
  // -------------------------------------------------------------------------

  _renderDuelsSection(profile) {
    const section = document.createElement('section');
    section.className = 'person-view__section';

    const heading = document.createElement('h3');
    heading.className = 'person-view__section-title';
    heading.textContent = `Duels (${profile.totalDuels})`;
    section.appendChild(heading);

    if (profile.totalDuels === 0) {
      section.appendChild(_emptyNote('No Duels.'));
      return section;
    }

    const list = document.createElement('div');
    list.className = 'person-view__duel-list';

    profile.duelsAsChallenger.forEach(d => list.appendChild(_duelRow(d, 'Challenger')));
    profile.duelsAsDefender.forEach(d  => list.appendChild(_duelRow(d, 'Defender')));

    section.appendChild(list);
    return section;
  }

  // -------------------------------------------------------------------------
  // Agreements
  // -------------------------------------------------------------------------

  _renderAgreementsSection(profile) {
    const section = document.createElement('section');
    section.className = 'person-view__section';

    const heading = document.createElement('h3');
    heading.className = 'person-view__section-title';
    heading.textContent = `Agreements (${profile.agreements.length})`;
    section.appendChild(heading);

    if (profile.agreements.length === 0) {
      section.appendChild(_emptyNote('No Agreements filed.'));
      return section;
    }

    const list = document.createElement('div');
    list.className = 'person-view__agreement-list';
    profile.agreements.forEach(a => {
      const row = document.createElement('div');
      row.className = 'person-view__agreement-row';
      row.innerHTML = `🤝 <a class="person-view__link" href="?v=dispute&id=${a.disputeId ?? a.assertionId}">Dispute #${a.disputeId ?? a.assertionId}</a>`;
      list.appendChild(row);
    });
    section.appendChild(list);
    return section;
  }

  // -------------------------------------------------------------------------
  // Judgments Rendered
  // -------------------------------------------------------------------------

  _renderJudgmentsSection(profile) {
    const section = document.createElement('section');
    section.className = 'person-view__section';

    const heading = document.createElement('h3');
    heading.className = 'person-view__section-title';
    heading.textContent = `Judgments Rendered (${profile.judgments.length})`;
    section.appendChild(heading);

    if (profile.judgments.length === 0) {
      section.appendChild(_emptyNote('No Judgments rendered.'));
      return section;
    }

    const list = document.createElement('div');
    list.className = 'person-view__judgment-list';
    profile.judgments.forEach(j => {
      const verdictLabel = j.favoursChallenger
        ? 'Challenger'
        : j.favoursDefender
          ? 'Defender'
          : 'Inconclusive';
      const row = document.createElement('div');
      row.className = 'person-view__judgment-row';
      row.innerHTML = `
        <span class="person-view__judgment-verdict">⚖️ ${_esc(verdictLabel)}</span>
        <a class="person-view__link" href="?v=dispute&id=${j.duelId}">Duel #${j.duelId}</a>
        <span class="person-view__judgment-reasoning">"${_esc(_trunc(j.reasoning, 100))}"</span>
      `.trim();
      list.appendChild(row);
    });
    section.appendChild(list);
    return section;
  }
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function _duelRow(dispute, role) {
  const framing   = getFraming(dispute.context ?? 'standard');
  const statusIcon = dispute.isContested
    ? '⚖️'
    : dispute.isDefended
      ? '🛡️'
      : dispute.isCrickets
        ? '🦗'
        : dispute.isResolved
          ? '🤝'
          : '⚔️';

  const row = document.createElement('div');
  row.className = 'person-view__duel-row';
  row.innerHTML = `
    <span class="context-badge" title="${_esc(framing.label)}">${_esc(framing.icon)}</span>
    <span class="person-view__duel-role">${_esc(role)}</span>
    <a class="person-view__link" href="?v=dispute&id=${dispute.id}">
      Dispute #${dispute.id}
    </a>
    <span class="person-view__duel-parties">
      @${_esc(dispute.challengerLogin ?? '?')} vs @${_esc(dispute.defenderLogin ?? '?')}
    </span>
    <span class="duel-status-icon" title="${_esc(dispute.status)}">${statusIcon}</span>
  `.trim();
  return row;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _emptyNote(text) {
  const p = document.createElement('p');
  p.className = 'person-view__empty-note';
  p.textContent = text;
  return p;
}

function _trunc(str, len) {
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

function _showErr(el, msg) {
  el.style.display = '';
  el.textContent   = msg;
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}
