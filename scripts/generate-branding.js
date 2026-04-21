// REMOVED — judgmental.io uses emoji (⚖️ 🔥) for all UI states.
// State-variant SVGs (icon-open, icon-challenger-ahead, etc.) are no longer part of the design.
// This script has been superseded. Run: git rm scripts/generate-branding.js

// generate-branding.js
// (placeholder — can be deleted)
 *
 * Output:
 *   branding/icon-{state}.svg        512×512 app icons
 *   branding/icon.svg                alias for "standing" (default)
 *   branding/logo.svg                horizontal wordmark (standing state)
 *   branding/og-image.svg            1200×630 Open Graph card (standing state)
 *
 * Duel states:
 *   standing         — ACCORD / STANDING. Balanced beam. Both flames white-gold.
 *   open             — Active Duel. Balanced beam. Left = challenger blue-white. Right = defender amber.
 *   challenger-ahead — Left pan lower. Large blue flame. Small amber flame.
 *   defender-holding — Right pan lower. Small blue flame. Large amber flame.
 *   disposed         — Deadline expired / Default. Balanced. Both flames grey-cold.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Output directory ────────────────────────────────────────────────────────
const OUT = path.join(__dirname, '..', 'branding');
fs.mkdirSync(OUT, { recursive: true });

// ─── Flame colour palettes ────────────────────────────────────────────────────
const PALETTES = {
  gold: {
    base:      '#a06810',
    mid:       '#e8c030',
    tip:       '#faf6e4',
    tipOpacity: 0.9,
    innerFill: '#fdf8ec',
    glow:      '#c89020',
  },
  blue: {
    base:      '#1030a0',
    mid:       '#3880e0',
    tip:       '#b8e0ff',
    tipOpacity: 0.92,
    innerFill: '#d8f0ff',
    glow:      '#2060d0',
  },
  amber: {
    base:      '#903010',
    mid:       '#d06020',
    tip:       '#ffc870',
    tipOpacity: 0.92,
    innerFill: '#ffe0a0',
    glow:      '#c05018',
  },
  grey: {
    base:      '#282830',
    mid:       '#484858',
    tip:       '#7888a0',
    tipOpacity: 0.8,
    innerFill: '#9098a8',
    glow:      '#404050',
  },
};

// ─── Duel state definitions ──────────────────────────────────────────────────
// beamTilt: degrees clockwise (positive = right pan lower / defender holds)
//            negative = left pan lower / challenger ahead
// flameScale: { left, right } — relative flame size multipliers
// leftPalette / rightPalette: keys into PALETTES
const STATES = {
  standing: {
    label:        'STANDING / ACCORD',
    beamTilt:      0,
    flameScale:   { left: 1.0, right: 1.0 },
    leftPalette:  'gold',
    rightPalette: 'gold',
  },
  open: {
    label:        'OPEN (active)',
    beamTilt:      0,
    flameScale:   { left: 1.0, right: 1.0 },
    leftPalette:  'blue',
    rightPalette: 'amber',
  },
  'challenger-ahead': {
    label:        'CHALLENGER AHEAD',
    beamTilt:     -10,            // negative = left pan drops
    flameScale:   { left: 1.3, right: 0.7 },
    leftPalette:  'blue',
    rightPalette: 'amber',
  },
  'defender-holding': {
    label:        'DEFENDER HOLDING',
    beamTilt:      10,            // positive = right pan drops
    flameScale:   { left: 0.7, right: 1.3 },
    leftPalette:  'blue',
    rightPalette: 'amber',
  },
  disposed: {
    label:        'DISPOSED (default)',
    beamTilt:      0,
    flameScale:   { left: 0.7, right: 0.7 },
    leftPalette:  'grey',
    rightPalette: 'grey',
  },
};

// ─── Geometry ────────────────────────────────────────────────────────────────
// All coordinates are in the 100×100 icon design space.
const PIVOT = { x: 50, y: 57 };  // beam rotation centre / pivot jewel
const BEAM_HALF = 32;            // half-length of beam from pivot to tip
const ARM_LEN   = 9.5;           // vertical chain length (pan hangs below beam tip)

/**
 * Rotate a point around the pivot by `angleDeg` degrees.
 */
function rotate(px, py, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx  = px - PIVOT.x;
  const dy  = py - PIVOT.y;
  return {
    x: PIVOT.x + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: PIVOT.y + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

/**
 * Compute the end-points of the beam and pan-suspend points.
 *   leftEnd  = beam tip to the left  (x = PIVOT.x - BEAM_HALF)
 *   rightEnd = beam tip to the right (x = PIVOT.x + BEAM_HALF)
 * Both are rotated by beamTilt around PIVOT.
 */
function beamGeometry(tilt) {
  const lTip = rotate(PIVOT.x - BEAM_HALF, PIVOT.y, tilt);
  const rTip = rotate(PIVOT.x + BEAM_HALF, PIVOT.y, tilt);

  // Chains hang straight down from the rotated tips
  const lPan = { x: lTip.x, y: lTip.y + ARM_LEN };
  const rPan = { x: rTip.x, y: rTip.y + ARM_LEN };

  return { lTip, rTip, lPan, rPan };
}

// ─── SVG building blocks ──────────────────────────────────────────────────────

function gradientDefs(id, pal) {
  const p = PALETTES[pal];
  return `
    <linearGradient id="flame-${id}" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%"   stop-color="${p.base}"/>
      <stop offset="42%"  stop-color="${p.mid}"/>
      <stop offset="100%" stop-color="${p.tip}" stop-opacity="${p.tipOpacity}"/>
    </linearGradient>`;
}

function filterDefs(suffix) {
  return `
    <filter id="fglow-${suffix}" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="pglow-${suffix}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="1.8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
}

/**
 * Generate the flame path centred at (cx, panY) with a given scale.
 * The flame sits in the pan — base at panY, tip above.
 * Base width and height scale with `scale`.
 */
function flamePath(cx, panY, scale, gradId, innerFill, filterId) {
  const w  = 7  * scale;   // half-width at base
  const h  = 22 * scale;   // total height
  const iw = 3  * scale;   // inner highlight half-width
  const ih = 14 * scale;   // inner highlight height

  const bY  = panY;
  const tY  = panY - h;
  const mY  = panY - h * 0.5;
  const mid = panY - h * 0.35;

  // Outer flame — simple bezier blob
  const outer = [
    `M ${cx - w} ${bY}`,
    `C ${cx - w * 1.35} ${mY} ${cx - w * 0.8} ${tY + h * 0.2} ${cx} ${tY}`,
    `C ${cx + w * 0.8} ${tY + h * 0.2} ${cx + w * 1.35} ${mY} ${cx + w} ${bY}`,
    `Z`,
  ].join(' ');

  // Inner highlight
  const inner = [
    `M ${cx - iw} ${bY}`,
    `C ${cx - iw * 1.2} ${mid} ${cx - iw * 0.6} ${tY + ih * 0.2} ${cx} ${tY + h * 0.1}`,
    `C ${cx + iw * 0.6} ${tY + ih * 0.2} ${cx + iw * 1.2} ${mid} ${cx + iw} ${bY}`,
    `Z`,
  ].join(' ');

  return `
    <path d="${outer}" fill="url(#flame-${gradId})" filter="url(#${filterId})"/>
    <path d="${inner}" fill="${innerFill}" opacity="0.45"/>`;
}

// ─── Icon generator ───────────────────────────────────────────────────────────

function generateIcon(stateKey, size = 512) {
  const state  = STATES[stateKey];
  const suffix = stateKey;
  const geo    = beamGeometry(state.beamTilt);
  const lPal   = PALETTES[state.leftPalette];
  const rPal   = PALETTES[state.rightPalette];

  // Beam line as a rotated rect (thin)
  const beamAngle = state.beamTilt;
  // We'll draw beam as a line from lTip to rTip with stroke
  const beamPath = `M ${geo.lTip.x} ${geo.lTip.y} L ${geo.rTip.x} ${geo.rTip.y}`;

  const panRx = 10;
  const panRy = 2.2;

  const defs = `
  <defs>
    <radialGradient id="bg-${suffix}" cx="50%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#181828"/>
      <stop offset="100%" stop-color="#070710"/>
    </radialGradient>
    ${gradientDefs(`L-${suffix}`, state.leftPalette)}
    ${gradientDefs(`R-${suffix}`, state.rightPalette)}
    ${filterDefs(suffix)}
  </defs>`;

  const bg = `<rect width="100" height="100" rx="18" fill="url(#bg-${suffix})"/>`;

  // Pillar & base
  const structure = `
    <rect x="49.2" y="57" width="1.6" height="26" fill="#6070840"/>
    <rect x="49.2" y="57" width="1.6" height="26" fill="#607084"/>
    <rect x="41"   y="82" width="18"  height="2"  rx="1" fill="#607084"/>
    <rect x="40"   y="83.2" width="3" height="3.5" rx="0.8" fill="#607084"/>
    <rect x="57"   y="83.2" width="3" height="3.5" rx="0.8" fill="#607084"/>`;

  // Beam
  const beam = `<path d="${beamPath}" stroke="#8faabf" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;

  // Pivot jewel
  const pivotColor = state.leftPalette === 'grey' ? '#404050' : '#c8a420';
  const pivotMid   = state.leftPalette === 'grey' ? '#606070' : '#f0d048';
  const pivotTip   = state.leftPalette === 'grey' ? '#808090' : '#fdf0a0';
  const pivot = `
    <circle cx="${PIVOT.x}" cy="${PIVOT.y}" r="5"   fill="${pivotColor}" filter="url(#pglow-${suffix})"/>
    <circle cx="${PIVOT.x}" cy="${PIVOT.y}" r="3"   fill="${pivotMid}"/>
    <circle cx="${PIVOT.x}" cy="${PIVOT.y}" r="1.2" fill="${pivotTip}"/>`;

  // Left chain & pan
  const LC = geo.lTip;
  const LP = geo.lPan;
  const leftChainPan = `
    <line x1="${LC.x.toFixed(2)}" y1="${LC.y.toFixed(2)}" x2="${LP.x.toFixed(2)}" y2="${LP.y.toFixed(2)}" stroke="#607084" stroke-width="1.1"/>
    <ellipse cx="${LP.x.toFixed(2)}" cy="${LP.y.toFixed(2)}" rx="${panRx}" ry="${panRy}" fill="#0c0e1a" stroke="#8faabf" stroke-width="1.3"/>`;

  // Right chain & pan
  const RC = geo.rTip;
  const RP = geo.rPan;
  const rightChainPan = `
    <line x1="${RC.x.toFixed(2)}" y1="${RC.y.toFixed(2)}" x2="${RP.x.toFixed(2)}" y2="${RP.y.toFixed(2)}" stroke="#607084" stroke-width="1.1"/>
    <ellipse cx="${RP.x.toFixed(2)}" cy="${RP.y.toFixed(2)}" rx="${panRx}" ry="${panRy}" fill="#0c0e1a" stroke="#8faabf" stroke-width="1.3"/>`;

  // Flames (drawn above pans)
  const flames =
    flamePath(LP.x, LP.y, state.flameScale.left,  `L-${suffix}`, lPal.innerFill, `fglow-${suffix}`) +
    flamePath(RP.x, RP.y, state.flameScale.right, `R-${suffix}`, rPal.innerFill, `fglow-${suffix}`);

  const viewBox = '0 0 100 100';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">
${defs}
${bg}
${structure}
${beam}
${leftChainPan}
${rightChainPan}
${flames}
${pivot}
<!-- state: ${state.label} -->
</svg>`;

  return svg;
}

// ─── Logo generator (standing only) ──────────────────────────────────────────

function generateLogo() {
  const state  = STATES.standing;
  const suffix = 'logo';
  const geo    = beamGeometry(0);
  const lPal   = PALETTES.gold;
  const rPal   = PALETTES.gold;

  // Scale the 100-unit icon into a 72-high emblem by scaling 0.72
  const S  = 0.72;
  const OX = 4;   // left offset in logo canvas
  const OY = -10; // vertical shift to centre within 80px tall canvas

  function tx(x) { return (OX + x * S).toFixed(2); }
  function ty(y) { return (OY + y * S + 14).toFixed(2); }

  const beamPath = `M ${tx(geo.lTip.x)} ${ty(geo.lTip.y)} L ${tx(geo.rTip.x)} ${ty(geo.rTip.y)}`;

  const defs = `
  <defs>
    <linearGradient id="lbg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#0e0e1c"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    ${gradientDefs(`L-${suffix}`, 'gold')}
    ${gradientDefs(`R-${suffix}`, 'gold')}
    ${filterDefs(suffix)}
  </defs>`;

  const bg = `<rect width="420" height="80" fill="url(#lbg)"/>`;

  const structure = `
    <rect x="${tx(49.2)}" y="${ty(57)}"   width="${(1.6*S).toFixed(2)}"  height="${(24*S).toFixed(2)}" fill="#607084"/>
    <rect x="${tx(41)}"   y="${ty(82)}"   width="${(18*S).toFixed(2)}"   height="${(1.8*S).toFixed(2)}" rx="${(0.9*S).toFixed(2)}" fill="#607084"/>
    <rect x="${tx(40)}"   y="${ty(83.2)}" width="${(2.5*S).toFixed(2)}"  height="${(3*S).toFixed(2)}"   rx="${(0.6*S).toFixed(2)}" fill="#607084"/>
    <rect x="${tx(57)}"   y="${ty(83.2)}" width="${(2.5*S).toFixed(2)}"  height="${(3*S).toFixed(2)}"   rx="${(0.6*S).toFixed(2)}" fill="#607084"/>`;

  const beam = `<path d="${beamPath}" stroke="#8faabf" stroke-width="${(2.5*S).toFixed(2)}" stroke-linecap="round" fill="none"/>`;

  const px = tx(PIVOT.x);
  const py = ty(PIVOT.y);
  const pivot = `
    <circle cx="${px}" cy="${py}" r="${(5*S).toFixed(2)}"   fill="#c8a420" filter="url(#pglow-${suffix})"/>
    <circle cx="${px}" cy="${py}" r="${(3*S).toFixed(2)}"   fill="#f0d048"/>
    <circle cx="${px}" cy="${py}" r="${(1.2*S).toFixed(2)}" fill="#fdf0a0"/>`;

  const LC = geo.lTip;
  const LP = geo.lPan;
  const leftChainPan = `
    <line x1="${tx(LC.x)}" y1="${ty(LC.y)}" x2="${tx(LP.x)}" y2="${ty(LP.y)}" stroke="#607084" stroke-width="${(1.1*S).toFixed(2)}"/>
    <ellipse cx="${tx(LP.x)}" cy="${ty(LP.y)}" rx="${(10*S).toFixed(2)}" ry="${(2.2*S).toFixed(2)}" fill="#0c0e1a" stroke="#8faabf" stroke-width="${(1.3*S).toFixed(2)}"/>`;

  const RC = geo.rTip;
  const RP = geo.rPan;
  const rightChainPan = `
    <line x1="${tx(RC.x)}" y1="${ty(RC.y)}" x2="${tx(RP.x)}" y2="${ty(RP.y)}" stroke="#607084" stroke-width="${(1.1*S).toFixed(2)}"/>
    <ellipse cx="${tx(RP.x)}" cy="${ty(RP.y)}" rx="${(10*S).toFixed(2)}" ry="${(2.2*S).toFixed(2)}" fill="#0c0e1a" stroke="#8faabf" stroke-width="${(1.3*S).toFixed(2)}"/>`;

  const flames =
    flamePath(parseFloat(tx(LP.x)), parseFloat(ty(LP.y)), 0.72, `L-${suffix}`, lPal.innerFill, `fglow-${suffix}`) +
    flamePath(parseFloat(tx(RP.x)), parseFloat(ty(RP.y)), 0.72, `R-${suffix}`, rPal.innerFill, `fglow-${suffix}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 80" width="840" height="160">
${defs}
${bg}
${structure}
${beam}
${leftChainPan}
${rightChainPan}
${flames}
${pivot}
  <!-- Wordmark -->
  <text x="82" y="53"
        font-family="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
        font-size="32" font-weight="600" letter-spacing="-0.5"
        fill="#e8dfc4">judgmental</text>
  <text x="323" y="53"
        font-family="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
        font-size="32" font-weight="300"
        fill="#4868b0">.io</text>
</svg>`;
}

// ─── OG image generator (standing state) ─────────────────────────────────────

function generateOGImage() {
  // Scale the 100-unit icon to fit in OG image: ~3× scale, centred at (600, 220)
  const S  = 3.0;
  const OX = 600 - 50 * S;
  const OY = 220 - 57 * S;

  const suffix = 'og';
  const geo    = beamGeometry(0);
  const lPal   = PALETTES.gold;
  const rPal   = PALETTES.gold;

  function tx(x) { return (OX + x * S).toFixed(2); }
  function ty(y) { return (OY + y * S).toFixed(2); }

  const defs = `
  <defs>
    <radialGradient id="obg" cx="50%" cy="40%" r="70%">
      <stop offset="0%"   stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#060610"/>
    </radialGradient>
    ${gradientDefs(`L-${suffix}`, 'gold')}
    ${gradientDefs(`R-${suffix}`, 'gold')}
    ${filterDefs(suffix)}
    <filter id="txtglow" x="-10%" y="-30%" width="120%" height="160%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="rulefade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#304060" stop-opacity="0"/>
      <stop offset="30%"  stop-color="#4060a0" stop-opacity="0.5"/>
      <stop offset="70%"  stop-color="#4060a0" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#304060" stop-opacity="0"/>
    </linearGradient>
  </defs>`;

  const bg = `<rect width="1200" height="630" fill="url(#obg)"/>`;

  const structure = `
    <rect x="${tx(49.2)}" y="${ty(57)}"   width="${(1.6*S).toFixed(2)}"  height="${(26*S).toFixed(2)}" fill="#607084"/>
    <rect x="${tx(41)}"   y="${ty(82)}"   width="${(18*S).toFixed(2)}"   height="${(2*S).toFixed(2)}"  rx="${(1*S).toFixed(2)}" fill="#607084"/>
    <rect x="${tx(40)}"   y="${ty(83.2)}" width="${(3*S).toFixed(2)}"    height="${(3.5*S).toFixed(2)}" rx="${(0.8*S).toFixed(2)}" fill="#607084"/>
    <rect x="${tx(57)}"   y="${ty(83.2)}" width="${(3*S).toFixed(2)}"    height="${(3.5*S).toFixed(2)}" rx="${(0.8*S).toFixed(2)}" fill="#607084"/>`;

  const beamPath = `M ${tx(geo.lTip.x)} ${ty(geo.lTip.y)} L ${tx(geo.rTip.x)} ${ty(geo.rTip.y)}`;
  const beam = `<path d="${beamPath}" stroke="#8faabf" stroke-width="${(2.5*S).toFixed(2)}" stroke-linecap="round" fill="none"/>`;

  const px = tx(PIVOT.x);
  const py = ty(PIVOT.y);
  const pivot = `
    <circle cx="${px}" cy="${py}" r="${(5*S).toFixed(2)}"   fill="#c8a420" filter="url(#pglow-${suffix})"/>
    <circle cx="${px}" cy="${py}" r="${(3*S).toFixed(2)}"   fill="#f0d048"/>
    <circle cx="${px}" cy="${py}" r="${(1.2*S).toFixed(2)}" fill="#fdf0a0"/>`;

  const LC = geo.lTip;
  const LP = geo.lPan;
  const leftChainPan = `
    <line x1="${tx(LC.x)}" y1="${ty(LC.y)}" x2="${tx(LP.x)}" y2="${ty(LP.y)}" stroke="#607084" stroke-width="${(1.1*S).toFixed(2)}"/>
    <ellipse cx="${tx(LP.x)}" cy="${ty(LP.y)}" rx="${(10*S).toFixed(2)}" ry="${(2.2*S).toFixed(2)}" fill="#0c0e1a" stroke="#8faabf" stroke-width="${(1.3*S).toFixed(2)}"/>`;

  const RC = geo.rTip;
  const RP = geo.rPan;
  const rightChainPan = `
    <line x1="${tx(RC.x)}" y1="${ty(RC.y)}" x2="${tx(RP.x)}" y2="${ty(RP.y)}" stroke="#607084" stroke-width="${(1.1*S).toFixed(2)}"/>
    <ellipse cx="${tx(RP.x)}" cy="${ty(RP.y)}" rx="${(10*S).toFixed(2)}" ry="${(2.2*S).toFixed(2)}" fill="#0c0e1a" stroke="#8faabf" stroke-width="${(1.3*S).toFixed(2)}"/>`;

  const flames =
    flamePath(parseFloat(tx(LP.x)), parseFloat(ty(LP.y)), S, `L-${suffix}`, lPal.innerFill, `fglow-${suffix}`) +
    flamePath(parseFloat(tx(RP.x)), parseFloat(ty(RP.y)), S, `R-${suffix}`, rPal.innerFill, `fglow-${suffix}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
${defs}
${bg}
${structure}
${beam}
${leftChainPan}
${rightChainPan}
${flames}
${pivot}
  <!-- Rule -->
  <rect x="300" y="395" width="600" height="1" fill="url(#rulefade)"/>
  <!-- Wordmark -->
  <text text-anchor="middle" x="600" y="470"
        font-family="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
        font-size="72" font-weight="600" letter-spacing="-1"
        fill="#e8dfc4" filter="url(#txtglow)">judgmental<tspan fill="#4868b0" font-weight="300">.io</tspan></text>
  <!-- Taglines -->
  <text text-anchor="middle" x="600" y="536"
        font-family="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
        font-size="22" font-weight="300" letter-spacing="0.5"
        fill="#7080a8">The internet has been fighting for 30 years.</text>
  <text text-anchor="middle" x="600" y="566"
        font-family="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
        font-size="22" font-weight="300" letter-spacing="0.5"
        fill="#7080a8">judgmental.io is where we settle it.</text>
</svg>`;
}

// ─── Write outputs ────────────────────────────────────────────────────────────

const generated = [];

for (const stateKey of Object.keys(STATES)) {
  const svg  = generateIcon(stateKey);
  const file = path.join(OUT, `icon-${stateKey}.svg`);
  fs.writeFileSync(file, svg, 'utf8');
  generated.push(file);
  console.log(`✓  ${path.relative(process.cwd(), file)}`);
}

// Default icon = standing
const defaultIcon = path.join(OUT, 'icon.svg');
fs.writeFileSync(defaultIcon, generateIcon('standing'), 'utf8');
generated.push(defaultIcon);
console.log(`✓  ${path.relative(process.cwd(), defaultIcon)}  (= standing)`);

const logoFile = path.join(OUT, 'logo.svg');
fs.writeFileSync(logoFile, generateLogo(), 'utf8');
generated.push(logoFile);
console.log(`✓  ${path.relative(process.cwd(), logoFile)}`);

const ogFile = path.join(OUT, 'og-image.svg');
fs.writeFileSync(ogFile, generateOGImage(), 'utf8');
generated.push(ogFile);
console.log(`✓  ${path.relative(process.cwd(), ogFile)}`);

console.log(`\nGenerated ${generated.length} files in branding/`);
