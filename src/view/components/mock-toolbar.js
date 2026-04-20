/**
 * Mock Toolbar — visible only when ?m= (mock mode) is active.
 *
 * Renders a fixed overlay bar that lets you:
 *   - See that mock mode is active
 *   - Switch the logged-in mock user instantly (no page reload)
 *   - See the current URL params
 *   - Exit mock mode (strips ?m from URL, reloads)
 *
 * User switching works by re-writing the ?u= param and reloading so
 * all session/auth state is cleanly reset from seed — no bleed possible
 * because installMockUser() and installMockMode() run fresh on every load.
 *
 * @param {{ login: string, id: number }[]} allUsers  Full MOCK_USERS list
 * @param {{ login: string, id: number }}  activeUser  Currently active mock user
 */
export function mountMockToolbar(allUsers, activeUser) {
  // Build toolbar element
  const bar = document.createElement('div');
  bar.id = 'mock-toolbar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Mock mode toolbar');
  bar.innerHTML = `
    <span class="mock-toolbar__badge" aria-hidden="true">⚙ MOCK</span>
    <label class="mock-toolbar__label" for="mock-user-select">User:</label>
    <select id="mock-user-select" class="mock-toolbar__select" aria-label="Switch mock user">
      ${allUsers.map(u => `
        <option value="${_esc(u.login)}"${u.login === activeUser.login ? ' selected' : ''}>
          @${_esc(u.login)}${u.is_super_admin ? ' (admin)' : ''}
        </option>
      `).join('')}
    </select>
    <button class="mock-toolbar__exit" aria-label="Exit mock mode">✕ Exit mock</button>
  `.trim();

  document.body.appendChild(bar);

  // User switch — reload with new ?u= (sticky ?m= is preserved by setUrlParams)
  bar.querySelector('#mock-user-select').addEventListener('change', e => {
    const login = e.target.value;
    // Build new URL with same ?m sticky and updated ?u
    const p = new URLSearchParams(window.location.search);
    p.set('u', login);
    window.location.search = p.toString();
  });

  // Exit mock — strip m and u, reload
  bar.querySelector('.mock-toolbar__exit').addEventListener('click', () => {
    const p = new URLSearchParams(window.location.search);
    p.delete('m');
    p.delete('u');
    const qs = p.toString();
    window.location.href = window.location.pathname + (qs ? `?${qs}` : '');
  });
}

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
