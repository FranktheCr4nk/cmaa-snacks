#!/usr/bin/env node
/**
 * Cmaa packaging lab — DIRECTION P3 "ILLUSTRATED CARTOUCHE"
 * Paper Boat / Goenchi Feni register: a flat 4-5 ink illustrated scene
 * (aaji at work) inside a cusped-arch cartouche on cream, bilingual name
 * block, truth-strip, rubber batch stamp, real-photo porthole.
 *
 * All geometry is computed. Spiral / cusped-arch / band techniques are
 * borrowed from tools/gen-packaging.js and extended (archSpec keeps the
 * apex exactly on the box top; toran leaves are sampled along the arch).
 *
 * Emits: label-flat-{bhajani,butter}.svg, pouch-{bhajani,butter}.svg,
 *        manifest.json  (all in this directory)
 */
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);
const P = (x, y) => `${F(x)} ${F(y)}`;

/* ---------------- palette (design-brief-v2 inks) ---------------- */
const GOLD = '#C8922A', INK = '#33241A', CREAM = '#F6EDDB', PAPER = '#F1E4CB';
const TERRA = '#B5512E', TERRA_D = '#93401F';
const SKIN = '#B5512E', SKIN_D = '#9A4224';
const MAROON = '#7A1E2B', MAROON_D = '#57121E'; // aaji's saree — constant across SKUs (brand character)
const VEG = '#2E7D32';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&amp;family=Yatra+One&amp;family=Mulish:wght@400;600;700;800&amp;family=Courier+Prime:wght@400;700&amp;family=Caveat:wght@600&amp;family=Noto+Sans+Devanagari:wght@400;600&amp;display=swap');`;

/* ---------------- geometry helpers (per tools/gen-packaging.js) ---------------- */

// Archimedean spiral (chakli monogram)
function spiralPath(cx, cy, r0, r1, turns, steps = 160) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, th = t * turns * 2 * Math.PI - Math.PI / 2;
    const r = r0 + (r1 - r0) * t;
    pts.push([F(cx + r * Math.cos(th)), F(cy + r * Math.sin(th))]);
  }
  return 'M' + pts.map(p => p.join(' ')).join(' L');
}
function spiralTicks(cx, cy, r0, r1, turns, count, len) {
  let d = '';
  for (let i = 1; i < count; i++) {
    const t = i / count, th = t * turns * 2 * Math.PI - Math.PI / 2;
    const r = r0 + (r1 - r0) * t;
    const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
    const nx = Math.cos(th), ny = Math.sin(th);
    d += `M${F(x - nx * len / 2)} ${F(y - ny * len / 2)} L${F(x + nx * len / 2)} ${F(y + ny * len / 2)} `;
  }
  return d;
}

// Cusped (multifoil) arch whose apex lands EXACTLY on y (unlike v2 helper).
// Returns spec object so toran/spandrels can sample the same curve.
function archSpec(x, y, w, h, cusps = 5, sr = 0.48) {
  const R = w / 2, cx = x + R, springY = y + h * sr, rv = h * sr;
  const pts = [];
  for (let i = 0; i <= cusps; i++) {
    const a = Math.PI - (Math.PI * i) / cusps;
    pts.push([F(cx + R * Math.cos(a)), F(springY - rv * Math.sin(a))]);
  }
  let d = `M${F(x)} ${F(y + h)} L${F(x)} ${F(springY)}`;
  for (let i = 1; i <= cusps; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    d += ` A${F(chord * 0.62)} ${F(chord * 0.62)} 0 0 1 ${x2} ${y2}`;
  }
  d += ` L${F(x + w)} ${F(y + h)} Z`;
  return { d, cx, R, rv, springY, x, y, w, h };
}

// Marigold toran (doorway garland) hung along the inside of the arch.
function toran(spec, sku) {
  const n = 11; let leaves = '', dots = '', string = [];
  const pt = t => {
    const a = Math.PI * (1 - (0.13 + 0.74 * t));
    return [spec.cx + (spec.R - 6) * Math.cos(a), spec.springY - (spec.rv - 6) * Math.sin(a)];
  };
  for (let i = 0; i < n; i++) {
    const [px, py] = pt(i / (n - 1));
    string.push(P(px, py));
    leaves += `<path d="M${P(px - 3.5, py + 1)} L${P(px + 3.5, py + 1)} L${P(px, py + 9.4)} Z" fill="${i % 2 ? GOLD : sku}"/>`;
    if (i < n - 1) { const [mx, my] = pt((i + 0.5) / (n - 1)); dots += `<circle cx="${F(mx)}" cy="${F(my + 2.6)}" r="1.6" fill="${TERRA}"/>`; }
  }
  return `<g><polyline points="${string.join(' ')}" fill="none" stroke="${GOLD}" stroke-width="1.1" opacity=".9"/>${leaves}${dots}</g>`;
}

// Sunburst halo wedges (Paper Boat register)
function rays(cx, cy, r0, r1, n, color, op) {
  let g = `<g fill="${color}" opacity="${op}">`;
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * 2 * Math.PI, a2 = a1 + (Math.PI / n) * 0.62;
    g += `<path d="M${P(cx + r0 * Math.cos(a1), cy + r0 * Math.sin(a1))} L${P(cx + r1 * Math.cos(a1), cy + r1 * Math.sin(a1))} L${P(cx + r1 * Math.cos(a2), cy + r1 * Math.sin(a2))} L${P(cx + r0 * Math.cos(a2), cy + r0 * Math.sin(a2))} Z"/>`;
  }
  return g + '</g>';
}

/* ---------------- scene kit (local 300x310 box, floor line y=262) ---------------- */

function floorBand() {
  const y0 = 262, y1 = 318, x0 = -30, x1 = 330, sp = 26, dh = y1 - y0;
  let lat = '';
  for (let x = x0 - dh; x < x1 + dh; x += sp) lat += `M${F(x)} ${y0} L${F(x + dh)} ${y1} M${F(x)} ${y0} L${F(x - dh)} ${y1} `;
  return `<g>
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${dh}" fill="${TERRA}" opacity=".13"/>
    <path d="${lat}" stroke="${TERRA}" stroke-width="1" opacity=".3" fill="none"/>
    <path d="M${x0} ${y0} L${x1} ${y0}" stroke="${INK}" stroke-width="1.2" opacity=".28"/>
  </g>`;
}

const flame = (x, y, s) => `<path d="M${F(x)} ${F(y)} c ${F(-2.6 * s)} ${F(-2.8 * s)}, ${F(-1.2 * s)} ${F(-6 * s)}, 0 ${F(-8.5 * s)} c ${F(1.2 * s)} ${F(2.5 * s)}, ${F(2.6 * s)} ${F(5.7 * s)}, 0 ${F(8.5 * s)} Z" fill="${GOLD}"/>`;

const steamCurl = (x, y) => `<path d="M${x} ${y} c -6 -8, 7 -12, 1 -21 c -5 -7, 4 -10, 2 -18" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity=".3"/>`;

function skyBits(sku) {
  const dia = (x, y, s, fill, op) => `<rect x="${F(x - s / 2)}" y="${F(y - s / 2)}" width="${s}" height="${s}" transform="rotate(45 ${x} ${y})" fill="${fill}" opacity="${op}"/>`;
  return dia(58, 82, 8, GOLD, .85) + dia(244, 70, 7, GOLD, .85) +
    `<circle cx="34" cy="112" r="2" fill="${TERRA}" opacity=".5"/><circle cx="268" cy="100" r="2" fill="${TERRA}" opacity=".5"/>`;
}

// two-bone IK: shoulder S -> hand H, returns elbow
function elbowPt(S, H, L1 = 30, L2 = 34, sign = 1) {
  const dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 1;
  const dd = Math.min(d, L1 + L2 - 1);
  const a = (L1 * L1 - L2 * L2 + dd * dd) / (2 * dd);
  const hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [S[0] + a * ux - sign * hh * uy, S[1] + a * uy + sign * hh * ux];
}

function arm(S, H, far = false) {
  const E = elbowPt(S, H);
  const skin = far ? SKIN_D : SKIN;
  const sleeve = [S[0] + (E[0] - S[0]) * 0.72, S[1] + (E[1] - S[1]) * 0.72];
  const bang = t => {
    const bx = E[0] + (H[0] - E[0]) * t, by = E[1] + (H[1] - E[1]) * t;
    const dx = H[0] - E[0], dy = H[1] - E[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    return `M${P(bx - nx * 5.2, by - ny * 5.2)} L${P(bx + nx * 5.2, by + ny * 5.2)} `;
  };
  return `<g>
    <path d="M${P(...S)} L${P(...E)} L${P(...H)}" fill="none" stroke="${skin}" stroke-width="8.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${P(...S)} L${P(...sleeve)}" stroke="${far ? '#451016' : MAROON_D}" stroke-width="9.8" stroke-linecap="round"/>
    <path d="${bang(0.74)}${bang(0.85)}" stroke="${GOLD}" stroke-width="1.8"/>
  </g>`;
}

// aaji — stylized geometric: bun + saree drape + spectacles suggestion.
// Feet baseline at (95, 262); faces right. pose = { near:{S,H}, far:{S,H} }
function aaji(pose) {
  const hx = 112, hy = 115;
  return `<g>
    ${arm(pose.far.S, pose.far.H, true)}
    <path d="M99 129 C 82 139, 70 168, 68 207 C 67 227, 73 237, 70 246 L 84 241 C 87 202, 92 170, 107 141 Z" fill="${MAROON_D}"/>
    <path d="M70 246 C 73 237, 67 227, 68 207 C 70 168, 82 139, 99 129" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity=".9"/>
    <path d="M63 262 C 60 224, 73 191, 80 167 L 107 167 C 113 197, 118 229, 117 261 Q 90 267 63 262 Z" fill="${MAROON}"/>
    <path d="M86 170 C 89 200, 92 230, 91 259 M97 170 C 101 201, 104 229, 103 260" stroke="${MAROON_D}" stroke-width="1.3" fill="none" opacity=".6"/>
    <path d="M63.5 257.5 Q 90 263.5 116.7 256.8" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
    <path d="M63.8 251.5 Q 90 257.5 116.9 250.9" fill="none" stroke="${GOLD}" stroke-width="1.1" opacity=".8"/>
    <ellipse cx="109" cy="260.5" rx="7" ry="3.2" fill="${SKIN}"/>
    <path d="M103 124 L114 127 L111 139 L100 136 Z" fill="${SKIN}"/>
    <path d="M80 167 C 81 149, 89 138, 99 131 L 112 137 C 114 147, 111 158, 107 167 Z" fill="${MAROON}"/>
    <path d="M99 131 C 104 137, 108 146, 108 153" fill="none" stroke="${MAROON_D}" stroke-width="3" opacity=".6"/>
    <circle cx="${hx - 3}" cy="${hy - 3}" r="12.4" fill="${INK}"/>
    <circle cx="${hx}" cy="${hy}" r="12" fill="${SKIN}"/>
    <path d="M${hx + 11} ${hy - 1} q 4.6 2.6 1 6.4 l -3.4 -1.2 Z" fill="${SKIN}"/>
    <circle cx="${hx - 13}" cy="${hy - 8}" r="6.4" fill="${INK}"/>
    <circle cx="${hx - 16.4}" cy="${hy - 11}" r="2" fill="${GOLD}"/>
    <circle cx="${hx + 6.5}" cy="${hy + 1}" r="4.3" fill="none" stroke="${INK}" stroke-width="1.4"/>
    <path d="M${hx + 2.2} ${hy + 0.4} L${hx - 6} ${hy - 0.6}" stroke="${INK}" stroke-width="1.3"/>
    <circle cx="${hx - 2}" cy="${hy + 7}" r="1.7" fill="${GOLD}"/>
    ${arm(pose.near.S, pose.near.H, false)}
  </g>`;
}

// hand-written annotation (Caveat) with a little arrow
function annotate(txt, tx, ty, a1, a2, rot = -7) {
  const mx = (a1[0] + a2[0]) / 2 + 7, my = (a1[1] + a2[1]) / 2;
  const dx = a2[0] - mx, dy = a2[1] - my, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const w1 = [a2[0] - ux * 6 - uy * 3.4, a2[1] - uy * 6 + ux * 3.4];
  const w2 = [a2[0] - ux * 6 + uy * 3.4, a2[1] - uy * 6 - ux * 3.4];
  return `<g opacity=".82">
    <text x="${tx}" y="${ty}" transform="rotate(${rot} ${tx} ${ty})" text-anchor="middle" font-family="'Caveat',cursive" font-size="15" font-weight="600" fill="${INK}">${txt}</text>
    <path d="M${P(...a1)} Q ${P(mx, my)} ${P(...a2)}" fill="none" stroke="${INK}" stroke-width="1.3"/>
    <path d="M${P(...w1)} L${P(...a2)} L${P(...w2)}" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>
  </g>`;
}

/* ---------------- the two scenes ---------------- */

// BHAJANI — aaji pressing chakli spirals from the brass sorya into the kadhai
function sceneBhajani(sku) {
  const g = [];
  g.push(rays(150, 146, 34, 250, 16, sku, 0.09));
  g.push(skyBits(sku));
  g.push(floorBand());
  // chulha
  g.push(`<path d="M170 240 L240 240 L248 262 L162 262 Z" fill="${TERRA}"/>`);
  g.push(`<path d="M170 240 L240 240" stroke="${TERRA_D}" stroke-width="2"/>`);
  g.push(`<path d="M191 262 A 14 12 0 0 1 219 262 Z" fill="${INK}"/>`);
  g.push(flame(199, 260, 0.85) + flame(205, 261, 1.15) + flame(211, 260, 0.8));
  // kadhai with hot oil
  g.push(`<circle cx="146" cy="207" r="6" fill="none" stroke="${GOLD}" stroke-width="2.4"/>`);
  g.push(`<circle cx="264" cy="207" r="6" fill="none" stroke="${GOLD}" stroke-width="2.4"/>`);
  g.push(`<path d="M150 211 Q 205 252 260 211 Z" fill="${INK}"/>`);
  g.push(`<ellipse cx="205" cy="211" rx="55" ry="9" fill="${INK}"/>`);
  g.push(`<ellipse cx="205" cy="211.5" rx="45" ry="6.2" fill="${GOLD}" opacity=".5"/>`);
  g.push(`<ellipse cx="205" cy="211" rx="55" ry="9" fill="none" stroke="${GOLD}" stroke-width="1.5"/>`);
  // frying spirals + oil bubbles
  g.push(`<path d="${spiralPath(180, 209.5, 1, 8, 2.4, 90)}" fill="none" stroke="${TERRA_D}" stroke-width="2.6" stroke-linecap="round"/>`);
  g.push(`<path d="${spiralPath(232, 210.5, 1, 7, 2.2, 80)}" fill="none" stroke="${TERRA_D}" stroke-width="2.4" stroke-linecap="round"/>`);
  g.push(`<g fill="${CREAM}" opacity=".65"><circle cx="192" cy="212.6" r="1.2"/><circle cx="220" cy="213.4" r="1.1"/><circle cx="206" cy="209" r="1"/></g>`);
  g.push(steamCurl(170, 201) + steamCurl(242, 198));
  // brass sorya press (two-lever), mid-squeeze
  g.push(`<path d="M196 131 L158 145" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M196 131 L158 145" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M214 130 L247 116" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M214 130 L247 116" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="188" y="125" width="34" height="8" rx="2.5" fill="${GOLD}" stroke="${INK}" stroke-width="1.3"/>
    <rect x="191" y="133" width="28" height="36" rx="3" fill="${GOLD}" stroke="${INK}" stroke-width="1.4"/>
    <path d="M197 137 L197 165" stroke="${CREAM}" stroke-width="2.4" opacity=".55"/>
    <path d="M191 169 L201 177 L209 177 L219 169 Z" fill="${GOLD}" stroke="${INK}" stroke-width="1.2"/>`);
  // dough strand extruding into a fresh spiral
  g.push(`<path d="M205 178 L205 187" stroke="${TERRA}" stroke-width="3" stroke-linecap="round"/>`);
  g.push(`<path d="${spiralPath(205, 196, 1, 10, 2.6, 100)}" fill="none" stroke="${TERRA}" stroke-width="3" stroke-linecap="round"/>`);
  // thali of finished chaklis by her feet
  g.push(`<ellipse cx="44" cy="257" rx="23" ry="5.5" fill="${GOLD}" stroke="${TERRA_D}" stroke-width="1.2"/>`);
  g.push(`<path d="${spiralPath(35, 252, 1, 7, 2.3, 80)}" fill="none" stroke="${TERRA_D}" stroke-width="2.2" stroke-linecap="round"/>`);
  g.push(`<path d="${spiralPath(53, 251.5, 1, 6.5, 2.2, 80)}" fill="none" stroke="${TERRA_D}" stroke-width="2" stroke-linecap="round"/>`);
  // aaji, both hands on the left lever (staggered grip so both arms read)
  g.push(aaji({ near: { S: [101, 136], H: [161, 145.5] }, far: { S: [96, 129], H: [176, 138] } }));
  g.push(annotate('aaji’s sorya', 243, 95, [232, 102], [216, 119]));
  return g.join('\n');
}

// BUTTER — aaji churning white butter with the ravi in a clay pot
function sceneButter(sku) {
  const g = [];
  g.push(rays(150, 146, 34, 250, 16, sku, 0.09));
  g.push(skyBits(sku));
  g.push(floorBand());
  // clay pot on floor
  g.push(`<ellipse cx="210" cy="258" rx="24" ry="5" fill="${TERRA_D}"/>`);
  g.push(`<circle cx="210" cy="216" r="43" fill="${TERRA}"/>`);
  g.push(`<path d="M171.9 196 Q 210 203 248.1 196" fill="none" stroke="${GOLD}" stroke-width="2.2"/>`);
  g.push(`<path d="M168.7 204 Q 210 211 251.3 204" fill="none" stroke="${GOLD}" stroke-width="1.1"/>`);
  g.push(`<g fill="${CREAM}"><circle cx="185" cy="201" r="1.6"/><circle cx="197.5" cy="202.5" r="1.6"/><circle cx="210" cy="203" r="1.6"/><circle cx="222.5" cy="202.5" r="1.6"/><circle cx="235" cy="201" r="1.6"/></g>`);
  // mouth
  g.push(`<ellipse cx="210" cy="172" rx="23" ry="7" fill="${TERRA}" stroke="${INK}" stroke-width="1.2"/>`);
  g.push(`<ellipse cx="210" cy="171.5" rx="16" ry="4.2" fill="${INK}"/>`);
  // ravi (churn stick) + rope
  g.push(`<path d="M206 96 L206 174" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`);
  g.push(`<circle cx="206" cy="94" r="5.5" fill="${GOLD}" stroke="${INK}" stroke-width="1.2"/>`);
  g.push(`<g fill="none" stroke="${TERRA_D}" stroke-width="1.6"><ellipse cx="206" cy="123" rx="6.5" ry="2.2"/><ellipse cx="206" cy="128" rx="6.5" ry="2.2"/><ellipse cx="206" cy="133" rx="6.5" ry="2.2"/></g>`);
  g.push(`<path d="M200 123 Q 180 114 161 114" fill="none" stroke="${TERRA_D}" stroke-width="1.8"/>`);
  g.push(`<path d="M200 132 Q 182 140 165 142" fill="none" stroke="${TERRA_D}" stroke-width="1.8"/>`);
  // butter blobs + splash
  g.push(`<g fill="${CREAM}"><circle cx="198" cy="168" r="4.4"/><circle cx="221" cy="166.5" r="3.4"/><circle cx="212" cy="163" r="2.6"/></g>`);
  g.push(`<path d="M224 169 q 3.4 7 -0.6 13 q -3 -6 -1.4 -9" fill="${CREAM}"/>`);
  g.push(`<g fill="${CREAM}" opacity=".9"><circle cx="188" cy="158" r="1.5"/><circle cx="228" cy="155" r="1.4"/><circle cx="207" cy="151" r="1.3"/></g>`);
  // bowl of finished loni
  g.push(`<path d="M255 252 A 17 13 0 0 0 289 252 Z" fill="${INK}"/>`);
  g.push(`<g fill="${CREAM}"><circle cx="265" cy="248" r="5.4"/><circle cx="275" cy="247.5" r="4.6"/><circle cx="270" cy="243" r="4"/></g>`);
  // small milk pot by her feet
  g.push(`<ellipse cx="44" cy="259" rx="13" ry="3.2" fill="${TERRA_D}"/>`);
  g.push(`<circle cx="44" cy="249" r="11" fill="${TERRA}"/>`);
  g.push(`<ellipse cx="44" cy="239.5" rx="5.6" ry="2.1" fill="${INK}"/>`);
  g.push(`<ellipse cx="44" cy="239.2" rx="4" ry="1.5" fill="${CREAM}"/>`);
  // aaji pulling the rope, one hand high one low
  g.push(aaji({ near: { S: [101, 134], H: [165, 142] }, far: { S: [98, 131], H: [161, 113.5] } }));
  g.push(annotate('the ravi', 247, 101, [228, 106], [214, 97]));
  return g.join('\n');
}

/* ---------------- shared label furniture ---------------- */

function grainFilter(uid) {
  return `<filter id="grain-${uid}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>`;
}
function pressFilter(uid) {
  return `<filter id="press-${uid}" x="-8%" y="-8%" width="116%" height="116%"><feOffset dx="0" dy="1" in="SourceAlpha" result="o"/><feGaussianBlur stdDeviation=".5" in="o" result="b"/><feComposite in="b" in2="SourceAlpha" operator="out" result="s"/><feFlood flood-color="#000" flood-opacity=".26"/><feComposite in2="s" operator="in" result="sh"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge></filter>`;
}

const dia = (x, y, s, fill) => `<rect x="${F(x - s / 2)}" y="${F(y - s / 2)}" width="${s}" height="${s}" transform="rotate(45 ${x} ${y})" fill="${fill}"/>`;

function brandMark(cx, cy, r, sku) {
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${sku}" stroke-width="1.6"/>
    <path d="${spiralPath(cx, cy, 1.8, r * 0.64, 3, 140)}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="${spiralTicks(cx, cy, 1.8, r * 0.64, 3, 34, 3.4)}" stroke="${INK}" stroke-width=".9" opacity=".8"/>
  </g>`;
}

function divider(cx, y, sku, half = 100) {
  return `<g><path d="M${cx - half} ${y} L${cx - 14} ${y} M${cx + 14} ${y} L${cx + half} ${y}" stroke="${GOLD}" stroke-width="1.2"/>${dia(cx, y, 7, sku)}</g>`;
}

function porthole(cx, cy, r, photo, sku, uid) {
  const s = r * 2 + 14;
  return `<g>
    <clipPath id="ph-${uid}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="none" stroke="${sku}" stroke-width="1.1"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>
    <g clip-path="url(#ph-${uid})">
      <image href="../../../images/${photo}" x="${F(cx - s / 2)}" y="${F(cy - s / 2)}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid slice" style="filter:saturate(1.25) contrast(1.06) brightness(1.04)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${sku}" style="mix-blend-mode:multiply" opacity=".12"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GOLD}" stroke-width="2"/>
  </g>`;
}

function stamp(cx, cy, w, h, lines, fs = 10, rot = -4) {
  const x = cx - w / 2, y = cy - h / 2, lh = fs * 1.3, n = lines.length;
  const t = lines.map((L, i) => `<text x="${cx}" y="${F(cy + (i - (n - 1) / 2) * lh + fs * 0.35)}" text-anchor="middle" font-family="'Courier Prime',monospace" font-weight="700" font-size="${fs}" letter-spacing="1.1" fill="${TERRA_D}">${L}</text>`).join('');
  return `<g transform="rotate(${rot} ${cx} ${cy})" opacity=".9">
    <rect x="${F(x)}" y="${F(y)}" width="${w}" height="${h}" rx="5" fill="none" stroke="${TERRA_D}" stroke-width="2"/>
    <rect x="${F(x + 4)}" y="${F(y + 4)}" width="${w - 8}" height="${h - 8}" rx="3" fill="none" stroke="${TERRA_D}" stroke-width=".8" stroke-dasharray="3 2.4"/>
    ${t}</g>`;
}

const vegMark = (x, y, s) => `<g><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="none" stroke="${VEG}" stroke-width="1.6"/><circle cx="${F(x + s / 2)}" cy="${F(y + s / 2)}" r="${F(s * 0.27)}" fill="${VEG}"/></g>`;

// 8-petal spandrel flower (paithani cell, scaled up)
function spandrelFlower(cx, cy, r, sku) {
  let p = '';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    p += `<circle cx="${F(cx + Math.cos(a) * r)}" cy="${F(cy + Math.sin(a) * r)}" r="${F(r * 0.3)}" fill="${GOLD}"/>`;
  }
  return `<g opacity=".9">${p}<circle cx="${cx}" cy="${cy}" r="${F(r * 0.42)}" fill="${sku}"/></g>`;
}

// scene placed into an inner arch: local 300x310 box, floor y=262
function placeScene(fl, inner, floorDrop, uid) {
  const k = inner.w / 300;
  const ty = (inner.y + inner.h - floorDrop) - 262 * k;
  const tx = inner.x;
  return `
  <path d="${inner.d}" fill="${CREAM}"/>
  <path d="${inner.d}" fill="${fl.sku}" opacity=".1"/>
  <g clip-path="url(#arch-${uid})">
    <g transform="translate(${F(tx)} ${F(ty)}) scale(${F(k)})">${fl.scene(fl.sku)}</g>
    ${toran(inner, fl.sku)}
  </g>
  <path d="${inner.d}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`;
}

/* ---------------- LABEL FLAT (500 x 700) ---------------- */

function labelFlat(fl) {
  const W = 500, H = 700, uid = `${fl.id}-flat`;
  const outer = archSpec(97, 134, 306, 296);
  const inner = archSpec(105, 142, 290, 280);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
<title>Cmaa — ${fl.latin} — illustrated cartouche label</title>
<defs>
  <style>${FONTS}</style>
  <clipPath id="arch-${uid}"><path d="${inner.d}"/></clipPath>
  ${grainFilter(uid)}${pressFilter(uid)}
</defs>
<g filter="url(#grain-${uid})">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${fl.sku}" stroke-width="2.5"/>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${GOLD}" stroke-width="1"/>
  ${dia(22, 22, 6.5, fl.sku)}${dia(W - 22, 22, 6.5, fl.sku)}${dia(22, H - 22, 6.5, fl.sku)}${dia(W - 22, H - 22, 6.5, fl.sku)}

  <!-- brand header -->
  ${brandMark(W / 2, 60, 20, fl.sku)}
  <text x="${W / 2}" y="105" text-anchor="middle" font-family="'Fraunces',serif" font-weight="600" font-size="27" letter-spacing="7" fill="${INK}">CMAA</text>
  <text x="${W / 2}" y="122" text-anchor="middle" font-size="9.5" fill="${INK}" opacity=".78"><tspan font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="10.5">आजीचा फराळ</tspan><tspan font-family="'Mulish',sans-serif" font-weight="700" letter-spacing="2.2" dx="5"> · KOTHRUD, PUNE · EST 2026</tspan></text>

  <!-- illustrated cartouche -->
  ${placeScene(fl, inner, 30, uid)}
  <path d="${outer.d}" fill="none" stroke="${fl.sku}" stroke-width="3"/>
  ${spandrelFlower(59, 186, 7, fl.sku)}${spandrelFlower(W - 59, 186, 7, fl.sku)}

  <!-- bilingual name block -->
  <g filter="url(#press-${uid})" font-family="'Yatra One','Noto Sans Devanagari',serif" text-anchor="middle" font-size="46">
    <text x="${W / 2 + 2.2}" y="482.2" fill="${fl.skuDark}" opacity=".9">${fl.dev}</text>
    <text x="${W / 2}" y="480" fill="${INK}">${fl.dev}</text>
  </g>
  ${divider(W / 2, 493, fl.sku)}
  <text x="${W / 2}" y="517" text-anchor="middle" font-weight="800" font-size="16" letter-spacing="5" fill="${fl.sku}">${fl.latin}</text>
  <text x="${W / 2}" y="535" text-anchor="middle" font-weight="700" font-size="9" letter-spacing="2.4" fill="${INK}" opacity=".6">${fl.sub}</text>

  <!-- truth strip -->
  <text x="${W / 2}" y="565" text-anchor="middle" font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="15.5" fill="${INK}">${fl.truthDev}</text>
  <path d="M${W / 2 - 110} 574 q 110 8 220 0" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linecap="round"/>
  <text x="${W / 2}" y="590" text-anchor="middle" font-size="10.5" font-style="italic" font-family="'Fraunces',serif" fill="#6B573F">${fl.truthEn}</text>

  <!-- meta row: photo porthole / caption / veg / batch stamp -->
  ${porthole(110, 614, 25, fl.portholePhoto || fl.photo, fl.sku, uid)}
  <text x="146" y="608" font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="11.5" fill="${INK}">आत हेच आहे —</text>
  <text x="146" y="624" font-size="8.5" font-style="italic" font-family="'Fraunces',serif" fill="#6B573F">the real batch, un-retouched</text>
  ${vegMark(284, 606, 15)}
  ${stamp(400, 611, 132, 50, [`BATCH ${fl.batch}`, 'PACKED 08·07·26', `NET WT ${fl.wt}`])}

  <!-- footer band -->
  <rect x="22" y="645" width="${W - 44}" height="33" fill="${fl.sku}"/>
  <text x="${W / 2}" y="666" text-anchor="middle" font-size="9.5" font-weight="800" letter-spacing="2.2" fill="${CREAM}">MADE IN A HOME KITCHEN · KOTHRUD, PUNE · NO PRESERVATIVES</text>
</g>
</svg>`;
}

/* ---------------- POUCH APPLICATION (460 x 660) ---------------- */

function pouch(fl) {
  const W = 460, H = 660, uid = `${fl.id}-pouch`;
  const bx = 26, bw = W - 52, crimpY = 30, bodyH = 566;
  let zz = `M${bx} ${crimpY}`; const zn = 26, zw = bw / zn;
  for (let i = 0; i < zn; i++) zz += ` l${F(zw / 2)} ${i % 2 ? 7 : -7} l${F(zw / 2)} ${i % 2 ? -7 : 7}`;
  const outer = archSpec(98, 158, 264, 240);
  const inner = archSpec(105, 165, 250, 226);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
<title>Cmaa — ${fl.latin} — cartouche pouch</title>
<defs>
  <style>${FONTS}</style>
  <clipPath id="arch-${uid}"><path d="${inner.d}"/></clipPath>
  <clipPath id="body-${uid}"><rect x="${bx}" y="${crimpY - 8}" width="${bw}" height="${bodyH + 60}" rx="14"/></clipPath>
  ${grainFilter(uid)}${pressFilter(uid)}
  <linearGradient id="sheen-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".18" stop-color="#fff" stop-opacity=".26"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
</defs>
<g filter="url(#grain-${uid})">
<g clip-path="url(#body-${uid})">
  <rect x="${bx}" y="${crimpY - 8}" width="${bw}" height="${bodyH + 60}" rx="14" fill="${CREAM}"/>

  <rect x="46" y="66" width="${bw - 40}" height="514" fill="none" stroke="${GOLD}" stroke-width="1"/>
  ${dia(46, 66, 5.5, fl.sku)}${dia(W - 46, 66, 5.5, fl.sku)}${dia(46, 580, 5.5, fl.sku)}${dia(W - 46, 580, 5.5, fl.sku)}

  ${brandMark(W / 2, 96, 15, fl.sku)}
  <text x="${W / 2}" y="128" text-anchor="middle" font-family="'Fraunces',serif" font-weight="600" font-size="19" letter-spacing="5" fill="${INK}">CMAA</text>
  <text x="${W / 2}" y="143" text-anchor="middle" font-size="8.5" fill="${INK}" opacity=".78"><tspan font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="9.5">आजीचा फराळ</tspan><tspan font-family="'Mulish',sans-serif" font-weight="700" letter-spacing="2" dx="4"> · KOTHRUD, PUNE</tspan></text>

  ${placeScene(fl, inner, 24, uid)}
  <path d="${outer.d}" fill="none" stroke="${fl.sku}" stroke-width="2.6"/>
  ${spandrelFlower(66, 196, 6, fl.sku)}${spandrelFlower(W - 66, 196, 6, fl.sku)}

  <g filter="url(#press-${uid})" font-family="'Yatra One','Noto Sans Devanagari',serif" text-anchor="middle" font-size="38">
    <text x="${W / 2 + 2}" y="441.8" fill="${fl.skuDark}" opacity=".9">${fl.dev}</text>
    <text x="${W / 2}" y="440" fill="${INK}">${fl.dev}</text>
  </g>
  ${divider(W / 2, 459, fl.sku, 86)}
  <text x="${W / 2}" y="480" text-anchor="middle" font-weight="800" font-size="13" letter-spacing="4" fill="${fl.sku}">${fl.latin}</text>
  <text x="${W / 2}" y="496" text-anchor="middle" font-weight="700" font-size="8.5" letter-spacing="2" fill="${INK}" opacity=".6">${fl.sub}</text>

  <text x="${W / 2}" y="522" text-anchor="middle" font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="13.5" fill="${INK}">${fl.truthDev}</text>
  <path d="M${W / 2 - 96} 530 q 96 7 192 0" fill="none" stroke="${GOLD}" stroke-width="1.3" stroke-linecap="round"/>
  <text x="${W / 2}" y="545" text-anchor="middle" font-size="9.5" font-style="italic" font-family="'Fraunces',serif" fill="#6B573F">${fl.truthEn}</text>

  ${porthole(98, 566, 21, fl.portholePhoto || fl.photo, fl.sku, uid)}
  <text x="128" y="562" font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="10" fill="${INK}">आत हेच आहे —</text>
  <text x="128" y="576" font-size="8" font-style="italic" font-family="'Fraunces',serif" fill="#6B573F">the real batch, un-retouched</text>
  ${vegMark(248, 558, 13)}
  ${stamp(352, 565, 122, 44, [`BATCH ${fl.batch}`, 'PACKED 08·07·26', `NET WT ${fl.wt}`], 8.5, -3.5)}

  <rect x="${bx}" y="610" width="${bw}" height="38" fill="${fl.sku}"/>
  <text x="${W / 2}" y="633" text-anchor="middle" font-size="9" font-weight="800" letter-spacing="1.8" fill="${CREAM}">MADE IN A HOME KITCHEN · NO PRESERVATIVES</text>

  <rect x="${bx}" y="${crimpY - 8}" width="${bw}" height="${bodyH + 60}" rx="14" fill="url(#sheen-${uid})"/>
</g>
<path d="${zz}" fill="none" stroke="${fl.skuDark}" stroke-width="2.2"/>
<rect x="${bx}" y="${crimpY - 18}" width="${bw}" height="15" rx="6" fill="${PAPER}" stroke="${fl.skuDark}" stroke-width="1.4"/>
<circle cx="${W / 2}" cy="${crimpY - 10.5}" r="3.4" fill="none" stroke="${fl.skuDark}" stroke-width="1.3"/>
</g>
</svg>`;
}

/* ---------------- flavors & emit ---------------- */

const FLAVORS = [
  {
    id: 'bhajani', dev: 'भाजणी चकली', latin: 'BHAJANI CHAKLI', sub: 'HAND-PRESSED · STONE-GROUND BHAJANI',
    sku: '#7A1E2B', skuDark: '#57121E', photo: 'chakli-1.jpg', wt: '200 g', batch: 'SB-11',
    truthDev: 'तांदूळ · डाळी · तीळ · देशी तूप — बस्स.', truthEn: 'rice · four dals · sesame · ghee — that’s all.',
    scene: sceneBhajani,
    concept: 'Aaji at the brass sorya press, mid-squeeze: a fresh spiral drops toward the kadhai of hot oil, two more fry, steam curls, flames under the chulha, a thali of finished chaklis at her feet. Tiled floor hint, marigold toran, sunburst halo.',
  },
  {
    id: 'butter', dev: 'बटर चकली', latin: 'BUTTER CHAKLI', sub: 'WHITE-BUTTER SHORT · MELT CRUNCH',
    sku: '#C98A3B', skuDark: '#8F5E20', photo: 'murukku.jpg', portholePhoto: 'chakli-2.jpg', wt: '200 g', batch: 'SB-12',
    truthDev: 'तांदूळ · लोणी · जिरे · मीठ — बस्स.', truthEn: 'rice · white butter · cumin · salt — that’s all.',
    scene: sceneButter,
    concept: 'Aaji churning white butter: the ravi spun by a pulled rope in a gold-banded clay pot, loni blobs at the mouth, a bowl of finished butter beside, milk pot at her feet. Same cartouche furniture, honey-gold flavor world.',
  },
];

const manifest = [];
for (const fl of FLAVORS) {
  const flat = `label-flat-${fl.id}.svg`, pch = `pouch-${fl.id}.svg`;
  fs.writeFileSync(path.join(OUT, flat), labelFlat(fl));
  fs.writeFileSync(path.join(OUT, pch), pouch(fl));
  manifest.push({
    id: `cartouche-${fl.id}-flat`, name: `${fl.latin} — label flat`,
    concept: `Illustrated cartouche (Paper Boat register), cream ground, flat 5-ink scene: ${fl.concept}`, files: [flat],
  });
  manifest.push({
    id: `cartouche-${fl.id}-pouch`, name: `${fl.latin} — pouch application`,
    concept: `Cartouche label applied to the crimp-top pouch chassis with sheen + grain. ${fl.concept}`, files: [pch],
  });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('cartouche: wrote', manifest.length, 'entries →', OUT);
