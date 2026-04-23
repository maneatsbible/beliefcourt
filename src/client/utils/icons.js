/**
 * Icon constants — updated for new entity vocabulary.
 * Using Unicode + minimal inline SVG. No icon font dependencies.
 */

// ---
// PROTOCOL NOTE: The heart+fire overlay (❤️🔥) is the Truthbook brand icon and protocol glyph.
// It MUST NOT be used as a generic claim indicator or control. Only the fire emoji (🔥),
// superimposed with the relevant control emoji, is used as the claim indicator in UI controls.
// See: Constitution ARTICLE XIII and app spec for details.
export const ICON_BRAND = '❤️🔥'; // For branding/identity only, constitutional protocol glyph

export const ICON_CLAIM            = '!';
export const ICON_CHALLENGE        = '?';
export const ICON_ANSWER           = '✓';
export const ICON_OFFER            = '⇌';
export const ICON_RESPONSE_ACCEPT  = '·';
export const ICON_RESPONSE_REJECT  = '✗';
export const ICON_CASE      = '🏛';
export const ICON_JUDGMENT  = '⚖'; // Not used for Home, see ICON_BRAND
export const ICON_BADGE     = '🎖';
export const ICON_EVIDENCE  = '📎';

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

// ICON_HOME is now the constitutional brand icon
export const ICON_HOME = ICON_BRAND;

export const ICON_AGREE = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"/>
</svg>`;
