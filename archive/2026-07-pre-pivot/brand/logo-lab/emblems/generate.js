// Cmaa logo lab — FAMILY C: EMBLEMS, SEALS & BADGES (C1..C6)
// All geometry is computed (spirals, arcs, blobs, rotational symmetry) — no hand-eyeballed coords.
// Emits per option: <id>-color.svg, <id>-mono.svg, <id>-rev.svg  (all on transparent, 480x480).
// Run: node generate.js
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const F = n => +n.toFixed(2);

/* ---------------- palette ---------------- */
const INK = '#33241A', GOLD = '#C8922A', CREAM = '#F6EDDB', PAPER = '#F1E4CB';
const MAROON = '#7A1E2B', MAROON_D = '#57121E', RED = '#B3372B', GREEN = '#5F7A4A';
const TERRA = '#B5512E', GOLD_LUXE = '#D4A23C';

/* ---------------- fonts ---------------- */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&amp;family=Marcellus&amp;family=Anton&amp;family=Yatra+One&amp;family=Mulish:wght@400;600;700;800&amp;family=Courier+Prime:wght@700&amp;family=Noto+Sans+Devanagari:wght@400;700&amp;display=swap');`;
const FAM = {
  marc: `'Marcellus','Fraunces',Georgia,serif`,
  fra: `'Fraunces',Georgia,serif`,
  anton: `'Anton','Arial Narrow',Impact,sans-serif`,
  yatra: `'Yatra One','Noto Sans Devanagari',serif`,
  mul: `'Mulish','Avenir Next',system-ui,sans-serif`,
  cour: `'Courier Prime','Courier New',monospace`,
};

/* ---------------- geometry helpers (shared brand vocabulary) ---------------- */

// Archimedean spiral — the chakli monogram
function spiralPath(cx, cy, r0, r1, turns, steps = 220) {
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

// Scalloped rectangle (stamp / mithai-ticket edge)
function scallopRect(x, y, w, h, rr) {
  const seg = (len) => { const n = Math.max(3, Math.round(len / (2 * rr))); return { n, r: len / (2 * n) }; };
  const top = seg(w - 4 * rr), side = seg(h - 4 * rr);
  let d = `M${F(x + 2 * rr)} ${F(y)}`;
  for (let i = 0; i < top.n; i++) d += ` a${F(top.r)} ${F(top.r)} 0 0 1 ${F(top.r * 2)} 0`;
  d += ` a${F(2 * rr)} ${F(2 * rr)} 0 0 1 ${F(2 * rr)} ${F(2 * rr)}`;
  for (let i = 0; i < side.n; i++) d += ` a${F(side.r)} ${F(side.r)} 0 0 1 0 ${F(side.r * 2)}`;
  d += ` a${F(2 * rr)} ${F(2 * rr)} 0 0 1 ${F(-2 * rr)} ${F(2 * rr)}`;
  for (let i = 0; i < top.n; i++) d += ` a${F(top.r)} ${F(top.r)} 0 0 1 ${F(-top.r * 2)} 0`;
  d += ` a${F(2 * rr)} ${F(2 * rr)} 0 0 1 ${F(-2 * rr)} ${F(-2 * rr)}`;
  for (let i = 0; i < side.n; i++) d += ` a${F(side.r)} ${F(side.r)} 0 0 1 0 ${F(-side.r * 2)}`;
  d += ` a${F(2 * rr)} ${F(2 * rr)} 0 0 1 ${F(2 * rr)} ${F(-2 * rr)} Z`;
  return d;
}

// Cusped (multifoil) Maratha arch: straight sides, N-cusp arch top.
// bulge: cusp arc radius as a fraction of the chord (0.5 = semicircle bumps; lower = pointier cusps)
function cuspArch(x, y, w, h, cusps = 5, springRatio = 0.62, bulge = 0.62) {
  const spring = y + h - (h * springRatio);
  const R = w / 2, cx = x + R;
  const pts = [];
  for (let i = 0; i <= cusps; i++) {
    const a = Math.PI - (Math.PI * i) / cusps;
    pts.push([F(cx + R * Math.cos(a)), F(spring - R * 0.92 * Math.sin(a))]);
  }
  let d = `M${F(x)} ${F(y + h)} L${F(x)} ${F(spring)}`;
  for (let i = 1; i <= cusps; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    d += ` A${F(chord * bulge)} ${F(chord * bulge)} 0 0 1 ${x2} ${y2}`;
  }
  d += ` L${F(x + w)} ${F(y + h)} Z`;
  return d;
}

// circumtext arc paths: over=true → text crowns the top; over=false → upright along the bottom
function arcPathDef(id, cx, cy, r, over = true) {
  return `<path id="${id}" d="M ${F(cx - r)} ${F(cy)} a ${F(r)} ${F(r)} 0 0 ${over ? 1 : 0} ${F(2 * r)} 0" fill="none"/>`;
}
function ringText(pathId, content, { size, fam, fill, ls = 0, weight = null, extra = '' }) {
  return `<text font-size="${size}" font-family="${fam}" ${weight ? `font-weight="${weight}"` : ''} letter-spacing="${ls}" fill="${fill}" ${extra}><textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${content}</textPath></text>`;
}

// twisted-rope border ticks between two rails (matchbox chromo labels)
function ropeTicks(x, y, w, h, t, step) {
  let d = '';
  for (let px = x + step; px < x + w - 2; px += step) d += `M${F(px)} ${F(y)} L${F(px - t * 0.66)} ${F(y + t)} `;               // top, twist ↘
  for (let py = y + step; py < y + h - 2; py += step) d += `M${F(x + w)} ${F(py)} L${F(x + w - t)} ${F(py - t * 0.66)} `;      // right
  for (let px = x + w - step; px > x + 2; px -= step) d += `M${F(px)} ${F(y + h)} L${F(px + t * 0.66)} ${F(y + h - t)} `;      // bottom
  for (let py = y + h - step; py > y + 2; py -= step) d += `M${F(x)} ${F(py)} L${F(x + t)} ${F(py + t * 0.66)} `;              // left
  return d;
}

// irregular wax blob: radius modulated by fixed sinusoids + one drip nub (deterministic)
function blobPath(cx, cy, R, steps = 240) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * 2 * Math.PI;
    let r = R * (1 + 0.05 * Math.sin(3 * th + 0.7) + 0.032 * Math.sin(5 * th + 2.1) + 0.018 * Math.sin(9 * th + 4.2));
    const dTh = ((th - 5.05 + Math.PI * 3) % (Math.PI * 2)) - Math.PI; // drip nub near lower-right
    r += R * 0.075 * Math.exp(-(dTh * dTh) / 0.045);
    pts.push([F(cx + r * Math.cos(th)), F(cy + r * Math.sin(th))]);
  }
  return 'M' + pts.map(p => p.join(' ')).join(' L') + ' Z';
}

// toran (mango-leaf bunting) hanging along a sagging quadratic
function toranPts(x1, x2, y, sag, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const px = (1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * ((x1 + x2) / 2) + t * t * x2;
    const py = (1 - t) * (1 - t) * y + 2 * t * (1 - t) * (y + 2 * sag) + t * t * y;
    out.push([F(px), F(py)]);
  }
  return out;
}

// deterministic wavy cancellation "killer" lines
function wavyLine(x, y, w, amp, waves) {
  const seg = w / (waves * 2);
  let d = `M${F(x)} ${F(y)} q ${F(seg / 2)} ${F(amp)} ${F(seg)} 0`;
  for (let i = 1; i < waves * 2; i++) d += ` t ${F(seg)} 0`;
  return d;
}

// n-point sparkle diamond
function sparkle(cx, cy, r) {
  const q = r * 0.28;
  return `M${F(cx)} ${F(cy - r)} Q${F(cx + q)} ${F(cy - q)} ${F(cx + r)} ${F(cy)} Q${F(cx + q)} ${F(cy + q)} ${F(cx)} ${F(cy + r)} Q${F(cx - q)} ${F(cy + q)} ${F(cx - r)} ${F(cy)} Q${F(cx - q)} ${F(cy - q)} ${F(cx)} ${F(cy - r)} Z`;
}

const TXT = (x, y, content, { size, fam, fill, ls = 0, weight = null, anchor = 'middle', extra = '' } = {}) =>
  `<text x="${F(x)}" y="${F(y)}" font-size="${size}" font-family="${fam}" ${weight ? `font-weight="${weight}"` : ''} letter-spacing="${ls}" fill="${fill}" text-anchor="${anchor}" ${extra}>${content}</text>`;

function svgDoc(inner, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480">
<defs><style>${FONT_IMPORT}</style>${defs}</defs>
${inner}
</svg>`;
}

/* =========================================================================
   C1 — HERITAGE ROUNDEL
   ========================================================================= */
function buildC1(mode) {
  const uid = `c1-${mode[0]}`;
  const cx = 240, cy = 240;
  const P = {
    color: { disc: PAPER, discIn: CREAM, ring: MAROON, hair: GOLD, txt: MAROON, dev: INK, dot: RED, spiral: MAROON, tick: GOLD, band: MAROON, bandTxt: CREAM },
    mono: { disc: 'none', discIn: 'none', ring: INK, hair: INK, txt: INK, dev: INK, dot: INK, spiral: INK, tick: INK, band: INK, bandTxt: null },
    rev: { disc: 'none', discIn: 'none', ring: CREAM, hair: GOLD, txt: CREAM, dev: CREAM, dot: GOLD, spiral: CREAM, tick: GOLD, band: GOLD, bandTxt: null },
  }[mode];

  const spiral = spiralPath(cx, cy - 10, 3, 86, 3.15);
  const ticks = spiralTicks(cx, cy - 10, 3, 86, 3.15, 54, 5.4);

  // banner with V-notched ends, fully inside inner disc (corner radius check: sqrt(82²+117.5²)=143.3 < ring 148)
  const bw = 68, notch = 14, bt = 330.5, bb = 357.5, bm = 344;
  const banner = `M${cx - bw - notch} ${bt} L${cx + bw + notch} ${bt} L${cx + bw + notch - 10} ${bm} L${cx + bw + notch} ${bb} L${cx - bw - notch} ${bb} L${cx - bw - notch + 10} ${bm} Z`;

  const bandLabel = `EST 2026 · PUNE`;
  const bandText = P.bandTxt
    ? TXT(cx, bm + 4.2, bandLabel, { size: 11.5, fam: FAM.mul, fill: P.bandTxt, ls: 2.6, weight: 800 })
    : ''; // knocked out via mask in mono/rev
  const bandMask = P.bandTxt ? '' : `<mask id="${uid}-bm"><path d="${banner}" fill="#fff"/>${TXT(cx, bm + 4.2, bandLabel, { size: 11.5, fam: FAM.mul, fill: '#000', ls: 2.6, weight: 800 })}</mask>`;

  const defs = `${arcPathDef(`${uid}-up`, cx, cy, 168, true)}${arcPathDef(`${uid}-dn`, cx, cy, 170, false)}${bandMask}`;

  const inner = `
<g>
  ${P.disc !== 'none' ? `<circle cx="${cx}" cy="${cy}" r="214" fill="${P.disc}"/><circle cx="${cx}" cy="${cy}" r="148" fill="${P.discIn}"/>` : ''}
  <circle cx="${cx}" cy="${cy}" r="214" fill="none" stroke="${P.ring}" stroke-width="5"/>
  <circle cx="${cx}" cy="${cy}" r="204" fill="none" stroke="${P.hair}" stroke-width="1.3"/>
  <circle cx="${cx}" cy="${cy}" r="148" fill="none" stroke="${P.ring}" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="${P.hair}" stroke-width="1.1"/>
  ${ringText(`${uid}-up`, 'C M A A', { size: 38, fam: FAM.marc, fill: P.txt, ls: 14 })}
  ${ringText(`${uid}-dn`, 'आजीचा फराळ', { size: 30, fam: FAM.yatra, fill: P.dev })}
  <circle cx="${cx - 177}" cy="${cy}" r="7" fill="${P.dot}"/>
  <circle cx="${cx + 177}" cy="${cy}" r="7" fill="${P.dot}"/>
  ${[45, 135, 225, 315].map(a => {
    const rad = a * Math.PI / 180, dx = cx + 177 * Math.cos(rad), dy = cy + 177 * Math.sin(rad);
    return `<rect x="${F(dx - 5)}" y="${F(dy - 5)}" width="10" height="10" fill="${P.hair}" transform="rotate(45 ${F(dx)} ${F(dy)})"/>`;
  }).join('')}
  <path d="${spiral}" fill="none" stroke="${P.spiral}" stroke-width="6" stroke-linecap="round"/>
  <path d="${ticks}" stroke="${P.tick}" stroke-width="1.5"/>
  <g ${P.bandTxt ? '' : `mask="url(#${uid}-bm)"`}><path d="${banner}" fill="${P.band}"/></g>
  ${bandText}
</g>`;
  return svgDoc(inner, defs);
}

/* =========================================================================
   C2 — MATCHBOX EMBLEM (Sivakasi chromo label, 2-colour misregistration)
   ========================================================================= */
function buildC2(mode) {
  const uid = `c2-${mode[0]}`;
  const L = { x: 80, y: 36, w: 320, h: 408 };
  const cx = 240;
  const P = {
    color: { paper: PAPER, edge: INK, rope: MAROON, main: RED, under: GOLD, ink: INK, strip: RED, stripTxt: CREAM, ring: RED, spark: GOLD },
    mono: { paper: 'none', edge: INK, rope: INK, main: INK, under: null, ink: INK, strip: INK, stripTxt: null, ring: INK, spark: INK },
    rev: { paper: 'none', edge: CREAM, rope: CREAM, main: CREAM, under: GOLD, ink: CREAM, strip: GOLD, stripTxt: null, ring: CREAM, spark: GOLD },
  }[mode];
  const MIS = P.under ? 'translate(-2.6 -2.2)' : null; // deliberate misregistration of the under-colour plate

  const ecx = 240, ecy = 254, er = 74; // central emblem
  const spiral = spiralPath(ecx, ecy, 2.5, 52, 3.0, 160);
  const ticks = spiralTicks(ecx, ecy, 2.5, 52, 3.0, 40, 4.6);

  // long litho sunburst wedges radiating from the emblem to the frame (clipped to the inner panel)
  let rays = '';
  const rn = 24;
  for (let i = 0; i < rn; i++) {
    const a1 = (i / rn) * 2 * Math.PI + 0.035, a2 = ((i + 0.42) / rn) * 2 * Math.PI;
    const r1 = er + 4, r2 = 240;
    rays += `M${F(ecx + r1 * Math.cos(a1))} ${F(ecy + r1 * Math.sin(a1))} L${F(ecx + r2 * Math.cos(a1))} ${F(ecy + r2 * Math.sin(a1))} L${F(ecx + r2 * Math.cos(a2))} ${F(ecy + r2 * Math.sin(a2))} L${F(ecx + r1 * Math.cos(a2))} ${F(ecy + r1 * Math.sin(a2))} Z `;
  }
  const panel = { x: L.x + 23.5, y: L.y + 23.5, w: L.w - 47, h: L.h - 47 };
  const rayClip = `<clipPath id="${uid}-rc"><rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}"/></clipPath>`;
  // corner sparkles centred in the rope-band corners
  const sp = [[L.x + 15, L.y + 15], [L.x + L.w - 15, L.y + 15], [L.x + 15, L.y + L.h - 15], [L.x + L.w - 15, L.y + L.h - 15]]
    .map(([x, y]) => `<path d="${sparkle(x, y, 6.5)}" fill="${P.spark}"/>`).join('');

  const stripRect = { x: 104, y: 390, w: 272, h: 30 };
  const stripLabel = 'KADAK &amp; HONEST · PUNE';
  const stripText = P.stripTxt
    ? TXT(cx, stripRect.y + 19.5, stripLabel, { size: 12, fam: FAM.mul, fill: P.stripTxt, ls: 2.5, weight: 800 })
    : '';
  const stripMask = P.stripTxt ? '' : `<mask id="${uid}-sm"><rect x="${stripRect.x}" y="${stripRect.y}" width="${stripRect.w}" height="${stripRect.h}" fill="#fff"/>${TXT(cx, stripRect.y + 19.5, stripLabel, { size: 12, fam: FAM.mul, fill: '#000', ls: 2.5, weight: 800 })}</mask>`;

  // artwork that gets the misregistered under-plate
  const plate = (fill) => `
    ${TXT(cx, 148, 'CMAA', { size: 66, fam: FAM.anton, fill, ls: 6 })}
    <path d="${spiral}" fill="none" stroke="${fill}" stroke-width="5.5" stroke-linecap="round"/>
    ${TXT(cx, 376, 'आजीचा फराळ', { size: 30, fam: FAM.yatra, fill })}`;

  // sunburst: tinted litho wedges in colour/rev (with misregistered under-plate), engraved hairlines in mono
  const sunburst = mode === 'mono'
    ? `<g clip-path="url(#${uid}-rc)"><path d="${rays}" fill="none" stroke="${P.ink}" stroke-width="1"/></g>`
    : `<g clip-path="url(#${uid}-rc)">
        <g transform="${MIS}"><path d="${rays}" fill="${P.under}" opacity="0.32"/></g>
        <path d="${rays}" fill="${P.main}" opacity="0.20"/>
      </g>`;

  const inner = `
<g>
  ${P.paper !== 'none' ? `<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="8" fill="${P.paper}"/>` : ''}
  <rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="8" fill="none" stroke="${P.edge}" stroke-width="2.2"/>
  <rect x="${L.x + 8}" y="${L.y + 8}" width="${L.w - 16}" height="${L.h - 16}" fill="none" stroke="${P.rope}" stroke-width="1.8"/>
  <rect x="${L.x + 22}" y="${L.y + 22}" width="${L.w - 44}" height="${L.h - 44}" fill="none" stroke="${P.rope}" stroke-width="1.4"/>
  <path d="${ropeTicks(L.x + 8, L.y + 8, L.w - 16, L.h - 16, 14, 11)}" stroke="${P.rope}" stroke-width="2.4" stroke-linecap="round"/>
  ${sp}
  ${sunburst}
  ${TXT(cx, 80, 'TRADE MARK', { size: 9.5, fam: FAM.mul, fill: P.ink, ls: 5, weight: 700 })}
  ${MIS ? `<g transform="${MIS}" opacity="0.9">${plate(P.under)}</g>` : ''}
  <circle cx="${ecx}" cy="${ecy}" r="${er}" fill="${P.paper === 'none' ? 'none' : CREAM}" stroke="${P.ring}" stroke-width="3"/>
  <circle cx="${ecx}" cy="${ecy}" r="${er - 7}" fill="none" stroke="${P.ink}" stroke-width="1" stroke-dasharray="1 3.2"/>
  ${plate(P.main)}
  <path d="${ticks}" stroke="${P.main}" stroke-width="1.2"/>
  ${TXT(cx, 172, '· SAFETY SNACK ·', { size: 9.5, fam: FAM.mul, fill: P.ink, ls: 3.2, weight: 700 })}
  <g ${P.stripTxt ? '' : `mask="url(#${uid}-sm)"`}><rect x="${stripRect.x}" y="${stripRect.y}" width="${stripRect.w}" height="${stripRect.h}" fill="${P.strip}"/></g>
  ${stripText}
</g>`;
  return svgDoc(inner, `${stripMask}${rayClip}`);
}

/* =========================================================================
   C3 — WAX SEAL (relief in colour, honest flat stamp in mono/rev)
   ========================================================================= */
function buildC3(mode) {
  const uid = `c3-${mode[0]}`;
  const cx = 240, cy = 240;
  const blob = blobPath(cx, cy, 182);
  const stampR = 118;
  const spiral = spiralPath(cx, cy + 6, 3, 64, 2.9, 180);
  const spiralT = spiralTicks(cx, cy + 6, 3, 64, 2.9, 36, 4.8);
  const arcUpDef = arcPathDef(`${uid}-up`, cx, cy + 2, 92, true);
  const arcDnDef = arcPathDef(`${uid}-dn`, cx, cy + 2, 95, false);

  if (mode !== 'color') {
    // flat single-ink stamp: the wax blob with the die knocked out
    const fill = mode === 'mono' ? INK : GOLD;
    const knock = `
      <circle cx="${cx}" cy="${cy}" r="${stampR}" fill="none" stroke="#000" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="${stampR - 8}" fill="none" stroke="#000" stroke-width="1.4"/>
      <path d="${spiral}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/>
      ${ringText(`${uid}-up`, 'C M A A', { size: 26, fam: FAM.marc, fill: '#000', ls: 10 })}
      ${ringText(`${uid}-dn`, '· PUNE ·', { size: 12, fam: FAM.mul, fill: '#000', ls: 4, weight: 800 })}`;
    const defs = `${arcUpDef}${arcDnDef}<mask id="${uid}-km"><path d="${blob}" fill="#fff"/>${knock}</mask>`;
    return svgDoc(`<path d="${blob}" fill="${fill}" mask="url(#${uid}-km)"/>`, defs);
  }

  // colour: molten relief
  const HI = '#A63C50', HI2 = '#C25A6E', LO = '#380911', BASE = '#7A1E2B', FIELD = '#6E1926';
  const emboss = (body, sw) => `
    <g transform="translate(1.9 1.9)">${body(LO, sw)}</g>
    <g transform="translate(-1.9 -1.9)">${body(HI2, sw)}</g>
    ${body('#96303F', sw)}`;
  const spiralBody = (c, sw) => `<path d="${spiral}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
  const cmaaBody = (c) => ringText(`${uid}-up`, 'C M A A', { size: 27, fam: FAM.marc, fill: c, ls: 10, extra: `stroke="${c}" stroke-width="0.6"` });
  const puneBody = (c) => ringText(`${uid}-dn`, '· PUNE ·', { size: 12, fam: FAM.mul, fill: c, ls: 4, weight: 800 });

  const defs = `${arcUpDef}${arcDnDef}
  <radialGradient id="${uid}-wax" cx="0.38" cy="0.30" r="0.95">
    <stop offset="0" stop-color="#9A3143"/><stop offset="0.55" stop-color="${BASE}"/><stop offset="1" stop-color="#4E0F1A"/>
  </radialGradient>
  <radialGradient id="${uid}-press" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0.78" stop-color="#000" stop-opacity="0"/><stop offset="0.97" stop-color="#000" stop-opacity="0.38"/><stop offset="1" stop-color="#000" stop-opacity="0.05"/>
  </radialGradient>`;

  const inner = `
<g>
  <path d="${blob}" fill="url(#${uid}-wax)"/>
  <path d="${blob}" fill="none" stroke="${LO}" stroke-width="2.2"/>
  <g transform="translate(-2.6 -3) scale(0.986)" transform-origin="${cx} ${cy}">
    <path d="${blob}" fill="none" stroke="${HI}" stroke-width="1.8" opacity="0.55"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${stampR}" fill="${FIELD}"/>
  <circle cx="${cx}" cy="${cy}" r="${stampR}" fill="url(#${uid}-press)"/>
  <path d="M ${F(cx - (stampR - 2))} ${cy} a ${stampR - 2} ${stampR - 2} 0 0 1 ${(stampR - 2) * 2} 0" fill="none" stroke="${LO}" stroke-width="3" opacity="0.75"/>
  <path d="M ${F(cx - (stampR - 2))} ${cy} a ${stampR - 2} ${stampR - 2} 0 0 0 ${(stampR - 2) * 2} 0" fill="none" stroke="${HI}" stroke-width="2.2" opacity="0.7"/>
  <circle cx="${cx}" cy="${cy}" r="${stampR - 9}" fill="none" stroke="${HI2}" stroke-width="1.2" opacity="0.8"/>
  ${emboss(spiralBody, 6.5)}
  <path d="${spiralT}" stroke="${LO}" stroke-width="1.2" opacity="0.7"/>
  ${emboss(cmaaBody)}
  ${emboss(puneBody)}
  <ellipse cx="150" cy="170" rx="30" ry="13" fill="#fff" opacity="0.10" transform="rotate(-32 150 170)"/>
  <ellipse cx="316" cy="330" rx="16" ry="7" fill="#fff" opacity="0.07" transform="rotate(24 316 330)"/>
</g>`;
  return svgDoc(inner, defs);
}

/* =========================================================================
   C4 — DABBA BADGE (3-tier steel tiffin as the containing shape)
   ========================================================================= */
function buildC4(mode) {
  const uid = `c4-${mode[0]}`;
  const P = {
    color: { line: INK, body: CREAM, band: MAROON, bandTxt: CREAM, clasp: GOLD, spiral: MAROON, tick: GOLD, dev: INK, small: MAROON, shade: true },
    mono: { line: INK, body: 'none', band: INK, bandTxt: null, clasp: 'none', spiral: INK, tick: INK, dev: INK, small: INK, shade: false },
    rev: { line: CREAM, body: 'none', band: CREAM, bandTxt: null, clasp: GOLD, spiral: GOLD, tick: GOLD, dev: CREAM, small: GOLD, shade: false },
  }[mode];

  // geometry (pre-transform); overall group is recentred+scaled below
  const bx = 112, bw = 256;                       // tier body
  const fx = 104, fw = 272;                       // flange lip
  const t1 = { y: 140, h: 72 }, f1 = { y: 212, h: 10 };
  const t2 = { y: 222, h: 78 }, f2 = { y: 300, h: 10 };
  const t3 = { y: 310, h: 68 }, fb = { y: 378, h: 12, x: 100, w: 280 };
  const cx = 240;

  // lid dome + swing handle (handle feet computed on the dome bezier at t = 0.3 / 0.7)
  const domeY = 128, domeTop = 62;
  const bez = t => {
    const x = (1 - t) ** 2 * (bx + 12) + 2 * t * (1 - t) * cx + t * t * (bx + bw - 12);
    const y = (1 - t) ** 2 * domeY + 2 * t * (1 - t) * domeTop + t * t * domeY;
    return [F(x), F(y)];
  };
  const [hx1, hy1] = bez(0.3), [hx2] = bez(0.7);
  const handleR = F((hx2 - hx1) / 2);
  const dome = `M${bx + 12} ${domeY} Q ${cx} ${domeTop} ${bx + bw - 12} ${domeY} Z`;

  const spiral = spiralPath(cx, t1.y + t1.h / 2, 2, 26, 2.7, 140);
  const ticksP = spiralTicks(cx, t1.y + t1.h / 2, 2, 26, 2.7, 26, 3.6);

  const bandLabel = 'CMAA';
  const bandTextY = t2.y + t2.h / 2 + 17;
  const bandText = P.bandTxt
    ? TXT(cx, bandTextY, bandLabel, { size: 50, fam: FAM.fra, fill: P.bandTxt, ls: 8, weight: 700, extra: 'font-variation-settings="\'opsz\' 100"' })
    : '';
  const bandMask = P.bandTxt ? '' : `<mask id="${uid}-bm"><rect x="${bx}" y="${t2.y}" width="${bw}" height="${t2.h}" rx="6" fill="#fff"/>${TXT(cx, bandTextY, bandLabel, { size: 50, fam: FAM.fra, fill: '#000', ls: 8, weight: 700 })}</mask>`;

  const tier = (o, fill) => `<rect x="${bx}" y="${o.y}" width="${bw}" height="${o.h}" rx="6" fill="${fill}" stroke="${P.line}" stroke-width="2.6"/>`;
  const flange = (o) => `<rect x="${fx}" y="${o.y}" width="${fw}" height="${o.h}" rx="4" fill="${P.body === 'none' ? 'none' : PAPER}" stroke="${P.line}" stroke-width="2.6"/>`;
  // side clasp: strap gripping the lid rim (hook tab over the top) and tucked under the base flange
  const clasp = (x) => `
    <rect x="${x - 2}" y="${domeY - 4}" width="22" height="18" rx="5" fill="${P.clasp === 'none' ? 'none' : P.clasp}" stroke="${P.line}" stroke-width="2.4"/>
    <rect x="${x}" y="${domeY + 10}" width="18" height="${fb.y + 6 - (domeY + 10)}" rx="9" fill="${P.clasp === 'none' ? 'none' : P.clasp}" stroke="${P.line}" stroke-width="2.4"/>
    <rect x="${x - 2}" y="${fb.y - 2}" width="22" height="12" rx="4" fill="${P.clasp === 'none' ? 'none' : P.clasp}" stroke="${P.line}" stroke-width="2.4"/>
    <circle cx="${x + 9}" cy="${domeY + 30}" r="2.6" fill="${P.line}"/>
    <circle cx="${x + 9}" cy="${fb.y - 18}" r="2.6" fill="${P.line}"/>`;

  const inner = `
<g transform="translate(240 240) scale(1.06) translate(-240 -229)">
  <path d="M${hx1} ${hy1} a ${handleR} ${handleR} 0 0 1 ${F(hx2 - hx1)} 0" fill="none" stroke="${P.line}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${F(hy1 - handleR)}" r="5" fill="${P.clasp === 'none' ? P.line : P.clasp}" stroke="${P.line}" stroke-width="2"/>
  <path d="${dome}" fill="${P.body === 'none' ? 'none' : P.body}" stroke="${P.line}" stroke-width="3"/>
  <rect x="${fx}" y="${domeY}" width="${fw}" height="12" rx="4" fill="${P.body === 'none' ? 'none' : PAPER}" stroke="${P.line}" stroke-width="2.6"/>
  ${tier(t1, P.body === 'none' ? 'none' : P.body)}
  ${flange(f1)}
  <g ${P.bandTxt ? '' : `mask="url(#${uid}-bm)"`}><rect x="${bx}" y="${t2.y}" width="${bw}" height="${t2.h}" rx="6" fill="${P.band}"/></g>
  <rect x="${bx}" y="${t2.y}" width="${bw}" height="${t2.h}" rx="6" fill="none" stroke="${P.line}" stroke-width="2.6"/>
  ${bandText}
  ${flange(f2)}
  ${tier(t3, P.body === 'none' ? 'none' : P.body)}
  <rect x="${fb.x}" y="${fb.y}" width="${fb.w}" height="${fb.h}" rx="5" fill="${P.body === 'none' ? 'none' : PAPER}" stroke="${P.line}" stroke-width="2.6"/>
  ${P.shade ? `<line x1="${bx + 24}" y1="${t1.y + 8}" x2="${bx + 24}" y2="${t1.y + t1.h - 8}" stroke="${INK}" stroke-width="1.4" opacity="0.16"/><line x1="${bx + bw - 24}" y1="${t1.y + 8}" x2="${bx + bw - 24}" y2="${t1.y + t1.h - 8}" stroke="${INK}" stroke-width="1.4" opacity="0.16"/><line x1="${bx + 24}" y1="${t3.y + 8}" x2="${bx + 24}" y2="${t3.y + t3.h - 8}" stroke="${INK}" stroke-width="1.4" opacity="0.16"/><line x1="${bx + bw - 24}" y1="${t3.y + 8}" x2="${bx + bw - 24}" y2="${t3.y + t3.h - 8}" stroke="${INK}" stroke-width="1.4" opacity="0.16"/>` : ''}
  <path d="${spiral}" fill="none" stroke="${P.spiral}" stroke-width="4.2" stroke-linecap="round"/>
  <path d="${ticksP}" stroke="${P.tick}" stroke-width="1.2"/>
  ${TXT(cx, 346, 'आजीचा फराळ', { size: 25, fam: FAM.yatra, fill: P.dev })}
  ${TXT(cx, 366, 'KOTHRUD · PUNE · EST 2026', { size: 9, fam: FAM.mul, fill: P.small, ls: 2.6, weight: 700 })}
  ${clasp(92)}
  ${clasp(370)}
</g>`;
  return svgDoc(inner, P.bandTxt ? '' : bandMask);
}

/* =========================================================================
   C5 — ARCH SHRINE (cusped Maratha arch, toran, threshold steps, nameplate)
   ========================================================================= */
function buildC5(mode) {
  const uid = `c5-${mode[0]}`;
  const cx = 240;
  const P = {
    color: { frame: MAROON, field: PAPER, hair: GOLD, pilaster: TERRA, line: INK, step: CREAM, stepLine: MAROON, dot: RED, spiral: MAROON, tick: GOLD, plate: INK, plateTxt: GOLD_LUXE, leafA: GREEN, leafB: GOLD, string: GOLD, cmaa: INK, rangoli: GOLD },
    mono: { frame: INK, field: 'none', hair: null, pilaster: 'none', line: INK, step: 'none', stepLine: INK, dot: INK, spiral: INK, tick: INK, plate: INK, plateTxt: null, leafA: INK, leafB: 'none', string: INK, cmaa: INK, rangoli: INK },
    rev: { frame: CREAM, field: 'none', hair: GOLD, pilaster: 'none', line: CREAM, step: 'none', stepLine: CREAM, dot: GOLD, spiral: CREAM, tick: GOLD, plate: GOLD, plateTxt: null, leafA: GOLD, leafB: CREAM, string: GOLD, cmaa: CREAM, rangoli: GOLD },
  }[mode];

  const AX = 126, AY = 92, AW = 228, AH = 262;   // outer arch; bottom = 354
  const outer = cuspArch(AX, AY, AW, AH, 5, 0.55, 0.76);
  const innerA = cuspArch(AX + 11, AY + 11, AW - 22, AH - 22, 5, 0.55, 0.76);
  const bottom = AY + AH;

  // toran across the face of the arch
  const pts = toranPts(AX + 6, AX + AW - 6, 158, 20, 12);
  let toran = `<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="${P.string}" stroke-width="2"/>`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const fill = i % 2 ? P.leafA : P.leafB;
    if (fill === 'none') toran += `<path d="M${F(px - 7)} ${F(py)} L${F(px + 7)} ${F(py)} L${F(px)} ${F(py + 15)} Z" fill="none" stroke="${P.line}" stroke-width="1.6"/>`;
    else toran += `<path d="M${F(px - 7)} ${F(py)} L${F(px + 7)} ${F(py)} L${F(px)} ${F(py + 15)} Z" fill="${fill}"/>`;
  }

  const spiral = spiralPath(cx, 272, 2.5, 52, 3.0, 160);
  const ticksP = spiralTicks(cx, 272, 2.5, 52, 3.0, 40, 4.6);

  // threshold steps (3, widening)
  const steps = [
    { x: 118, w: 244, y: bottom, h: 13 },
    { x: 96, w: 288, y: bottom + 13, h: 13 },
    { x: 74, w: 332, y: bottom + 26, h: 13 },
  ].map(s => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${P.step === 'none' ? 'none' : P.step}" stroke="${P.stepLine}" stroke-width="2"/>`).join('');
  // rangoli dots on the top step
  const rangoli = [-36, -18, 0, 18, 36].map(dx => `<circle cx="${cx + dx}" cy="${bottom + 6.5}" r="2.4" fill="${P.rangoli}"/>`).join('');

  const plate = { x: 138, y: bottom + 50, w: 204, h: 42 };
  const plateLabel = 'आजीचा फराळ';
  const plateTextY = plate.y + 29;
  const plateText = P.plateTxt ? TXT(cx, plateTextY, plateLabel, { size: 26, fam: FAM.yatra, fill: P.plateTxt }) : '';
  const plateMask = P.plateTxt ? '' : `<mask id="${uid}-pm"><rect x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="4" fill="#fff"/>${TXT(cx, plateTextY, plateLabel, { size: 26, fam: FAM.yatra, fill: '#000' })}</mask>`;

  const pilaster = (x) => `
    <rect x="${x}" y="214" width="22" height="140" fill="${P.pilaster === 'none' ? 'none' : P.pilaster}" stroke="${P.line}" stroke-width="2"/>
    <rect x="${x - 5}" y="200" width="32" height="15" fill="${P.pilaster === 'none' ? 'none' : P.pilaster}" stroke="${P.line}" stroke-width="2"/>
    <rect x="${x - 5}" y="340" width="32" height="14" fill="${P.pilaster === 'none' ? 'none' : P.pilaster}" stroke="${P.line}" stroke-width="2"/>`;

  const inner = `
<g>
  ${TXT(cx, 62, 'CMAA', { size: 21, fam: FAM.mul, fill: P.cmaa, ls: 12, weight: 800 })}
  <circle cx="${cx - 74}" cy="55" r="3.6" fill="${P.dot}"/>
  <circle cx="${cx + 74}" cy="55" r="3.6" fill="${P.dot}"/>
  ${pilaster(104)}
  ${pilaster(354)}
  ${mode === 'color'
    ? `<path d="${outer}" fill="${P.frame}"/><path d="${innerA}" fill="${P.field}"/><path d="${innerA}" fill="none" stroke="${P.hair}" stroke-width="1.4"/>`
    : `<path d="${outer}" fill="none" stroke="${P.frame}" stroke-width="3.4"/><path d="${innerA}" fill="none" stroke="${P.hair || P.frame}" stroke-width="1.6"/>`}
  <circle cx="${cx}" cy="130" r="4.5" fill="${P.dot}"/>
  <path d="${spiral}" fill="none" stroke="${P.spiral}" stroke-width="5.5" stroke-linecap="round"/>
  <path d="${ticksP}" stroke="${P.tick}" stroke-width="1.3"/>
  ${toran}
  ${steps}
  ${rangoli}
  <g ${P.plateTxt ? '' : `mask="url(#${uid}-pm)"`}><rect x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="4" fill="${P.plate}"/></g>
  ${P.plateTxt ? `<rect x="${plate.x + 4}" y="${plate.y + 4}" width="${plate.w - 8}" height="${plate.h - 8}" rx="2" fill="none" stroke="${P.plateTxt}" stroke-width="1"/>` : ''}
  ${plateText}
</g>`;
  return svgDoc(inner, plateMask);
}

/* =========================================================================
   C6 — POSTAL FARAL (perforated stamp + PUNE 411038 cancellation)
   ========================================================================= */
function buildC6(mode) {
  const uid = `c6-${mode[0]}`;
  const P = {
    color: { paper: CREAM, perf: MAROON, frame: MAROON, hair: GOLD, ink: INK, spiral: MAROON, tick: GOLD, denom: MAROON, denomTxt: CREAM, cancel: INK },
    mono: { paper: 'none', perf: INK, frame: INK, hair: null, ink: INK, spiral: INK, tick: INK, denom: INK, denomTxt: null, cancel: INK },
    rev: { paper: 'none', perf: CREAM, frame: CREAM, hair: GOLD, ink: CREAM, spiral: CREAM, tick: GOLD, denom: GOLD, denomTxt: null, cancel: GOLD },
  }[mode];

  const S = { x: 64, y: 88, w: 330, h: 330 };   // stamp
  const scx = S.x + S.w / 2;                    // 229
  const stamp = scallopRect(S.x, S.y, S.w, S.h, 7);
  const spiral = spiralPath(scx, 252, 3, 70, 3.1, 200);
  const ticksP = spiralTicks(scx, 252, 3, 70, 3.1, 48, 5);

  const denom = { x: 322, y: 118, w: 44, h: 40 };
  const denomText = P.denomTxt ? TXT(denom.x + denom.w / 2, denom.y + 27.5, '₹5', { size: 19, fam: FAM.fra, fill: P.denomTxt, weight: 700 }) : '';
  const denomMask = P.denomTxt ? '' : `<mask id="${uid}-dm"><rect x="${denom.x}" y="${denom.y}" width="${denom.w}" height="${denom.h}" rx="3" fill="#fff"/>${TXT(denom.x + denom.w / 2, denom.y + 27.5, '₹5', { size: 19, fam: FAM.fra, fill: '#000', weight: 700 })}</mask>`;

  // cancellation postmark over the top-right corner
  const pm = { cx: 372, cy: 108, r: 50 };
  const cancelDefs = `${arcPathDef(`${uid}-cu`, pm.cx, pm.cy, 36, true)}${arcPathDef(`${uid}-cd`, pm.cx, pm.cy, 37, false)}`;
  let killers = '';
  for (let i = 0; i < 4; i++) killers += `<path d="${wavyLine(196, 92 + i * 11, 122, 4.5, 3)}" fill="none" stroke="${P.cancel}" stroke-width="2.2" stroke-linecap="round"/>`;
  const cancel = `
  <g opacity="${mode === 'color' ? 0.88 : 1}">
    <g transform="rotate(-8 ${pm.cx} ${pm.cy})">
      <circle cx="${pm.cx}" cy="${pm.cy}" r="${pm.r}" fill="none" stroke="${P.cancel}" stroke-width="2.4"/>
      <circle cx="${pm.cx}" cy="${pm.cy}" r="${pm.r - 24}" fill="none" stroke="${P.cancel}" stroke-width="1.3"/>
      ${ringText(`${uid}-cu`, 'PUNE G.P.O.', { size: 11, fam: FAM.mul, fill: P.cancel, ls: 2.4, weight: 800 })}
      ${ringText(`${uid}-cd`, '411038', { size: 11, fam: FAM.mul, fill: P.cancel, ls: 3, weight: 800 })}
      ${TXT(pm.cx, pm.cy - 1, '10 JUL', { size: 12.5, fam: FAM.cour, fill: P.cancel, weight: 700 })}
      ${TXT(pm.cx, pm.cy + 12, '2026', { size: 12.5, fam: FAM.cour, fill: P.cancel, weight: 700 })}
    </g>
    ${killers}
  </g>`;

  const inner = `
<g>
  ${P.paper !== 'none' ? `<path d="${stamp}" fill="${P.paper}"/>` : ''}
  <path d="${stamp}" fill="none" stroke="${P.perf}" stroke-width="2"/>
  <rect x="${S.x + 20}" y="${S.y + 20}" width="${S.w - 40}" height="${S.h - 40}" fill="none" stroke="${P.frame}" stroke-width="2.2"/>
  ${P.hair ? `<rect x="${S.x + 26}" y="${S.y + 26}" width="${S.w - 52}" height="${S.h - 52}" fill="none" stroke="${P.hair}" stroke-width="1"/>` : ''}
  ${TXT(S.x + 36, 146, 'CMAA', { size: 26, fam: FAM.marc, fill: P.ink, ls: 4, anchor: 'start' })}
  ${TXT(S.x + 36, 162, 'FARAL POST', { size: 9, fam: FAM.mul, fill: P.ink, ls: 3.4, weight: 700, anchor: 'start' })}
  <g ${P.denomTxt ? '' : `mask="url(#${uid}-dm)"`}><rect x="${denom.x}" y="${denom.y}" width="${denom.w}" height="${denom.h}" rx="3" fill="${P.denom}"/></g>
  ${denomText}
  <path d="${spiral}" fill="none" stroke="${P.spiral}" stroke-width="6" stroke-linecap="round"/>
  <path d="${ticksP}" stroke="${P.tick}" stroke-width="1.4"/>
  ${TXT(scx, 356, 'आजीचा फराळ', { size: 27, fam: FAM.yatra, fill: P.ink })}
  ${TXT(scx, 380, 'GHARGUTI FARAL · PUNE', { size: 9.5, fam: FAM.mul, fill: P.ink, ls: 3, weight: 700 })}
  ${cancel}
</g>`;
  return svgDoc(inner, `${denomMask}${cancelDefs}`);
}

/* ---------------- emit ---------------- */
const OPTIONS = [
  { id: 'C1', name: 'Heritage Roundel', build: buildC1, concept: 'Concentric two-tone roundel: Marcellus CMAA crowns the top arc, आजीचा फराळ answers along the bottom, kunku-dot separators at 3 & 9 o\'clock, chakli spiral centre, notched EST 2026 · PUNE banner.' },
  { id: 'C2', name: 'Matchbox Emblem', build: buildC2, concept: 'Vintage Sivakasi matchbox label: rope border between rails, sunburst spiral emblem, Anton CMAA, safety-snack pastiche, slogan strip — with a deliberate 2-colour gold misregistration plate.' },
  { id: 'C3', name: 'Wax Seal', build: buildC3, concept: 'Irregular molten-wax blob with a pressed die: embossed chakli spiral, tiny Marcellus CMAA arc, PUNE counter-arc; radial-gradient relief in colour, honest knocked-out stamp in mono/rev.' },
  { id: 'C4', name: 'Dabba Badge', build: buildC4, concept: 'Three-tier steel tiffin as the containing badge: spiral on the top tier, Fraunces CMAA reversed out of the maroon middle tier, Devanagari on the base tier, gold side clasps and wire handle.' },
  { id: 'C5', name: 'Arch Shrine', build: buildC5, concept: 'Five-cusp Maratha arch as a storefront doorway: toran bunting across the face, spiral hanging inside, terracotta pilasters, three threshold steps with rangoli dots, ink nameplate आजीचा फराळ.' },
  { id: 'C6', name: 'Postal Faral', build: buildC6, concept: 'Postage stamp from the faral republic: perforated scallop edge, ₹5 denomination, spiral specimen, आजीचा फराळ — cancelled with a PUNE G.P.O. 411038 postmark and wavy killer bars.' },
];
const MODES = ['color', 'mono', 'rev'];

const manifest = [];
for (const opt of OPTIONS) {
  const files = [];
  for (const mode of MODES) {
    const fname = `${opt.id.toLowerCase()}-${mode}.svg`;
    fs.writeFileSync(path.join(OUT, fname), opt.build(mode));
    files.push(fname);
  }
  manifest.push({ id: opt.id, name: opt.name, concept: opt.concept, files });
  console.log(`${opt.id} ${opt.name}: ${files.join(', ')}`);
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('manifest.json written —', manifest.length, 'options ×', MODES.length, 'variants');
