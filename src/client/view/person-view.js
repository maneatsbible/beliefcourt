// *** LEGACY FILE: MARKED FOR DELETION — Replaced by /viz/ visualization suite. ***
/**
 * View: Person (Worldview Profile)
 * Renders a person's profile with their records.
 */

import { PersonController } from '../controller/person-controller.js';
import { showErrorPanel }   from './components/error-panel.js';
import { showNotification } from './components/notification.js';
import { setUrlParams }     from '../utils/url.js';
import { iconForType }      from '../utils/icons.js';

function _esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _ago(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const TABS = [
  { id: 'all',         label: 'All Records' },
  { id: 'claims',      label: 'Claims' },
  { id: 'challenges',  label: 'Challenges' },
  { id: 'judgments',   label: 'Judgments' },
];

export class PersonView {
  /**
   * @param {HTMLElement}      container
   * @param {PersonController} ctrl
   * @param {{ id:string, handle:string }|null} currentUser
   */
  constructor(container, ctrl, currentUser) {
    this._el   = container;
    this._ctrl = ctrl;
    this._user = currentUser;
    this._activeTab = 'all';
  }

  async render(personId) {
    this._el.innerHTML = '<div class="loading">Loading profile…</div>';
    try {
      const [person, records] = await Promise.all([
        this._ctrl.loadProfile(personId),
        this._ctrl.loadRecords(personId),
      ]);
      this._renderProfile(person, records, personId);
    } catch (err) {
      showErrorPanel(err, 'person-view');
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  _renderProfile(person, records, personId) {
    const el = this._el;
    el.innerHTML = '';

    // Back link
    const back = document.createElement('button');
    back.className = 'btn-back';
    back.textContent = '← Back';
    back.addEventListener('click', () => setUrlParams({}));
    el.appendChild(back);

    // Profile header
    const header = document.createElement('div');
    header.className = 'person-header';
    const badges = [
      person.isHerald     ? '<span class="badge badge--herald">Herald</span>'       : '',
      person.isAi         ? `<span class="badge badge--ai">AI · ${_esc(person.aiModel)}</span>` : '',
      person.isSuperAdmin ? '<span class="badge badge--admin">Admin</span>'          : '',
    ].filter(Boolean).join(' ');

    header.innerHTML = `
      <div class="person-header__avatar" aria-hidden="true">
        ${person.profilePicUrl
          ? `<img src="${_esc(person.profilePicUrl)}" alt="@${_esc(person.handle)}" class="person-header__pic">`
          : `<span class="person-header__initials">${_esc(person.handle[0] ?? '?').toUpperCase()}</span>`}
      </div>
      <div class="person-header__info">
        <h2 class="person-header__name">@${_esc(person.handle)} ${badges}</h2>
        <p class="person-header__platform">${_esc(person.platform ?? '')}</p>
        <p class="person-header__joined">Member since ${_ago(person.createdAt)}</p>
      </div>
    `;
    el.appendChild(header);

    // Stats bar
    const claims     = records.filter(r => r.type === 'claim');
    const challenges = records.filter(r => r.type === 'challenge');
    const judgments  = records.filter(r => r.type === 'judgment' || r.type === 'verdict');

    const stats = document.createElement('div');
    stats.className = 'person-stats';
    stats.innerHTML = `
      <span class="person-stats__item"><strong>${claims.length}</strong> Claims</span>
      <span class="person-stats__item"><strong>${challenges.length}</strong> Challenges</span>
      <span class="person-stats__item"><strong>${judgments.length}</strong> Judgments</span>
    `;
    el.appendChild(stats);

    // Tabs
    const tabBar = document.createElement('div');
    tabBar.className = 'tabs';
    tabBar.setAttribute('role', 'tablist');
    for (const tab of TABS) {
      const btn = document.createElement('button');
      btn.className = `tab-btn${this._activeTab === tab.id ? ' tab-btn--active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', this._activeTab === tab.id ? 'true' : 'false');
      btn.dataset.tab = tab.id;
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        this._activeTab = tab.id;
        tabBar.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.toggle('tab-btn--active', b.dataset.tab === tab.id);
          b.setAttribute('aria-selected', b.dataset.tab === tab.id ? 'true' : 'false');
        });
        this._renderRecordList(recordList, records);
      });
      tabBar.appendChild(btn);
    }
    el.appendChild(tabBar);

    // Record list
    const recordList = document.createElement('div');
    recordList.className = 'person-records';
    el.appendChild(recordList);
    this._renderRecordList(recordList, records);
  }

  _filterRecords(records) {
    switch (this._activeTab) {
      case 'claims':     return records.filter(r => r.type === 'claim');
      case 'challenges': return records.filter(r => r.type === 'challenge' || r.type === 'answer');
      case 'judgments':  return records.filter(r => r.type === 'judgment' || r.type === 'verdict');
      default:           return records;
    }
  }

  _renderRecordList(container, records) {
    const filtered = this._filterRecords(records);
    if (!filtered.length) {
      container.innerHTML = '<p class="empty-state">No records yet.</p>';
      return;
    }
    container.innerHTML = filtered.map(r => `
      <div class="record-card record-card--${_esc(r.type)}">
        <div class="record-card__header">
          <span class="record-card__type-icon" aria-hidden="true">${iconForType(r.type)}</span>
          <span class="record-card__type">${_esc(r.type.toUpperCase())}</span>
          <span class="record-card__date">${_ago(r.createdAt)}</span>
          ${r.isAi ? `<span class="badge badge--ai">AI · ${_esc(r.aiModel)}</span>` : ''}
        </div>
        <p class="record-card__text">${_esc(r.text)}</p>
        ${r.caseId ? `<button class="btn-link" data-action="open-case" data-case-id="${_esc(r.caseId)}">View case →</button>` : ''}
      </div>
    `).join('');

    // Delegate case link clicks
    container.querySelectorAll('[data-action="open-case"]').forEach(btn => {
      btn.addEventListener('click', () => {
        setUrlParams({ v: 'case', id: btn.dataset.caseId });
      });
    });
  }
}
