/**
 * View component: Composer panel.
 * Supports modes: 'claim', 'challenge', 'answer', 'offer', 'response'.
 */

const MODES = ['claim', 'challenge', 'answer', 'offer', 'response'];

/**
 * Render a composer panel inside `container`.
 *
 * @param {HTMLElement} container
 * @param {{
 *   mode:        'claim'|'challenge'|'answer'|'offer'|'response',
 *   placeholder: string,
 *   onSubmit:    (data: object) => Promise<void>,
 *   onCancel:    () => void,
 * }} opts
 * @returns {{ destroy: () => void }}
 */
export function renderComposer(container, opts) {
  const {
    mode        = 'claim',
    placeholder = 'What do you want to say?',
    onSubmit,
    onCancel,
  } = opts;

  if (!MODES.includes(mode)) throw new Error(`Unknown composer mode: ${mode}`);

  const el = document.createElement('div');
  el.className = `composer composer--${mode}`;

  el.innerHTML = `
    <form class="composer__form" novalidate>
      <textarea class="composer__textarea" rows="4"
                placeholder="${_esc(placeholder)}"
                aria-label="Compose your ${mode}"></textarea>
      <div class="composer__actions">
        <button type="button" class="btn btn--secondary composer__cancel-btn">Cancel</button>
        <button type="submit"  class="btn btn--primary   composer__submit-btn">Submit</button>
      </div>
    </form>
  `.trim();

  const form     = el.querySelector('form');
  const textarea = el.querySelector('.composer__textarea');

  el.querySelector('.composer__cancel-btn').addEventListener('click', () => {
    onCancel();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) { textarea.focus(); _showError(el, 'Please enter some text.'); return; }

    const submitBtn = el.querySelector('.composer__submit-btn');
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Submitting…';
    try {
      await onSubmit({ mode, text });
    } finally {
      submitBtn.disabled   = false;
      submitBtn.textContent = 'Submit';
    }
  });

  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('composer--visible'));

  return {
    destroy() {
      el.classList.remove('composer--visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
    },
  };
}

function _esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _showError(el, msg) {
  let err = el.querySelector('.composer__error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'composer__error';
    el.querySelector('.composer__actions')?.before(err);
  }
  err.textContent = msg;
  setTimeout(() => err?.remove(), 3000);
}
