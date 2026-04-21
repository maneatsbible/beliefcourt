/**
 * View component: notification toasts (ported unchanged).
 */

const AUTO_DISMISS_MS = 4000;
const TYPE_CLASSES = {
  info:    'notification--info',
  success: 'notification--success',
  error:   'notification--error',
  warn:    'notification--warn',
};

export function showNotification(message, type = 'info') {
  const root = document.getElementById('notification-root');
  if (!root) return;

  const el = document.createElement('div');
  el.className = `notification ${TYPE_CLASSES[type] ?? TYPE_CLASSES.info}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  root.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.classList.add('notification--out');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 1000);
      }, AUTO_DISMISS_MS);
    });
  });
}
