/**
 * Mock Toolbar — visible only when ?m= (mock mode) is active.
 * Lets you switch mock users without a full sign-in flow.
 *
 * @param {{ handle: string }[]} allUsers
 * @param {{ handle: string }}   activeUser
 */
export function mountMockToolbar(allUsers, activeUser) {
  const bar = document.createElement('div');
  bar.id = 'mock-toolbar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Mock mode toolbar');
  bar.innerHTML = `
    <span class="mock-toolbar__badge" aria-hidden="true">⚙ MOCK</span>
    <label class="mock-toolbar__label" for="mock-user-select">User:</label>
    <select id="mock-user-select" class="mock-toolbar__select" aria-label="Switch mock user">
      ${allUsers.map(u => `
        <option value="${_esc(u.handle)}"${u.handle === activeUser.handle ? ' selected' : ''}>
          @${_esc(u.handle)}${u.is_super_admin ? ' (admin)' : ''}
        </option>
      `).join('')}
    </select>
    <button class="mock-toolbar__exit" aria-label="Exit mock mode">✕ Exit mock</button>
  `.trim();

  document.body.appendChild(bar);
  document.body.classList.add('has-mock-toolbar');

  bar.querySelector('#mock-user-select').addEventListener('change', e => {
    const p = new URLSearchParams(window.location.search);
    p.set('u', e.target.value);
    window.location.search = p.toString();
  });

  bar.querySelector('.mock-toolbar__exit').addEventListener('click', () => {
    const p = new URLSearchParams(window.location.search);
    p.delete('m');
    p.delete('u');
    const qs = p.toString();
    window.location.href = window.location.pathname + (qs ? `?${qs}` : '');
  });
}

function _esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
