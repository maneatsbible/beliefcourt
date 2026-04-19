/**
 * Icon constants for disputable.io.
 * Using Unicode characters to stay framework-free.
 */

export const ICON_ASSERTION = '!';
export const ICON_CHALLENGE = '?';
export const ICON_ANSWER    = '✓';

export const ICON_SCALES = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="12" y1="3" x2="12" y2="21"/>
  <path d="M3 9l9-6 9 6"/>
  <path d="M5 16l-2 3h6l-2-3"/>
  <path d="M19 16l-2 3h6l-2-3"/>
  <line x1="5" y1="14" x2="5" y2="16"/>
  <line x1="19" y1="14" x2="19" y2="16"/>
  <path d="M5 9a7 7 0 0 0 7 7 7 7 0 0 0-7-7z" opacity="0"/>
  <line x1="3" y1="9" x2="7" y2="14"/>
  <line x1="21" y1="9" x2="17" y2="14"/>
</svg>`;

/** Scales of justice with a flame in each pan — used as the app logomark. */
export const ICON_SCALES_FIRE = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
  viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <!-- centre pole -->
  <line x1="32" y1="8" x2="32" y2="58" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <!-- base -->
  <line x1="22" y1="58" x2="42" y2="58" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <!-- crossbeam -->
  <line x1="8" y1="20" x2="56" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <!-- left arm -->
  <line x1="12" y1="20" x2="12" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- right arm -->
  <line x1="52" y1="20" x2="52" y2="34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- left pan (arc) -->
  <path d="M5 34 Q12 44 19 34" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- right pan (arc) -->
  <path d="M45 34 Q52 44 59 34" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- fire in left pan -->
  <text x="12" y="42" text-anchor="middle" font-size="11" font-family="sans-serif">🔥</text>
  <!-- fire in right pan -->
  <text x="52" y="42" text-anchor="middle" font-size="11" font-family="sans-serif">🔥</text>
</svg>`;

export const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2"/>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>`;

export const ICON_BACK = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="15 18 9 12 15 6"/>
</svg>`;

export const ICON_HOME = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/>
</svg>`;

export const ICON_AGREE = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"/>
</svg>`;
