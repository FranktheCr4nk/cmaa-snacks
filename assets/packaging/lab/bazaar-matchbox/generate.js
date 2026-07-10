// Cmaa packaging lab — DIRECTION P4 "BAZAAR MATCHBOX" (collectible vernacular print)
// Every pack IS a giant matchbox label: off-rotated sunburst, framed-circle emblem,
// rope border, slogan strip, 2-3 inks on paper, deliberate misregistration on one
// channel, halftone + grain, series numbering. Geometry helpers derived from
// tools/gen-packaging.js (spiral / walk-a-rounded-rect / band techniques).
//
// Emits into this folder:
//   label-bhajani-flat.svg   label-masala-flat.svg
//   pouch-bhajani.svg        pouch-masala.svg
//   series-sheet.svg         manifest.json
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);

/* ================= palette (3 inks per label + paper) ================= */
const GOLD = '#C8922A', INK = '#33241A', CREAM = '#F6EDDB', PAPER = '#F1E4CB';
const HALDI = '#E3A72F';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Anton&amp;family=Courier+Prime:ital,wght@0,400;0,700;1,400&amp;family=Yatra+One&amp;family=Mulish:wght@600;700;800&amp;family=Noto+Sans+Devanagari:wght@500;700&amp;display=swap');`;
const DEV_STACK = `'Yatra One','Noto Sans Devanagari',serif`;
const ANTON = `'Anton','Arial Narrow',sans-serif`;
const COURIER = `'Courier Prime','Courier New',monospace`;
const MULISH = `'Mulish','Noto Sans Devanagari',sans-serif`;

/* ================= geometry helpers ================= */

// Archimedean spiral (chakli monogram) — from tools/gen-packaging.js
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

// walk a rounded-rect perimeter -> evenly spaced {x, y, a(tangent)} points
function roundedRectWalk(x, y, w, h, r, spacing) {
  const segs = [
    { t: 'L', x1: x + r, y1: y, x2: x + w - r, y2: y },
    { t: 'A', cx: x + w - r, cy: y + r, a0: -Math.PI / 2, a1: 0 },
    { t: 'L', x1: x + w, y1: y + r, x2: x + w, y2: y + h - r },
    { t: 'A', cx: x + w - r, cy: y + h - r, a0: 0, a1: Math.PI / 2 },
    { t: 'L', x1: x + w - r, y1: y + h, x2: x + r, y2: y + h },
    { t: 'A', cx: x + r, cy: y + h - r, a0: Math.PI / 2, a1: Math.PI },
    { t: 'L', x1: x, y1: y + h - r, x2: x, y2: y + r },
    { t: 'A', cx: x + r, cy: y + r, a0: Math.PI, a1: 1.5 * Math.PI },
  ];
  const lens = segs.map(s => s.t === 'L' ? Math.hypot(s.x2 - s.x1, s.y2 - s.y1) : r * (s.a1 - s.a0));
  const total = lens.reduce((a, b) => a + b, 0);
  const n = Math.round(total / spacing);
  const pts = [];
  for (let i = 0; i < n; i++) {
    let d = (i / n) * total, si = 0;
    while (d > lens[si] && si < segs.length - 1) { d -= lens[si]; si++; }
    const s = segs[si], t = d / lens[si];
    if (s.t === 'L') {
      const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      pts.push({ x: s.x1 + dx * t, y: s.y1 + dy * t, a: Math.atan2(dy, dx) });
    } else {
      const a = s.a0 + (s.a1 - s.a0) * t;
      pts.push({ x: s.cx + r * Math.cos(a), y: s.cy + r * Math.sin(a), a: a + Math.PI / 2 });
    }
  }
  return pts;
}

// twisted rope border: gold strands with ink outline laid along a rounded rect
function ropeBorder(x, y, w, h, r) {
  const pts = roundedRectWalk(x, y, w, h, r, 8.2);
  return pts.map(p =>
    `<ellipse cx="${F(p.x)}" cy="${F(p.y)}" rx="4.7" ry="2.15" fill="${GOLD}" stroke="${INK}" stroke-width=".85" transform="rotate(${F(p.a * 180 / Math.PI + 42)} ${F(p.x)} ${F(p.y)})"/>`
  ).join('');
}

// sunburst wedge rays (drawn as ONE path; caller rotates + clips)
function sunburst(cx, cy, r0, r1, n) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * 2 * Math.PI, a2 = a1 + (Math.PI / n) * 0.66;
    d += `M${F(cx + r0 * Math.cos(a1))} ${F(cy + r0 * Math.sin(a1))} L${F(cx + r1 * Math.cos(a1))} ${F(cy + r1 * Math.sin(a1))} L${F(cx + r1 * Math.cos(a2))} ${F(cy + r1 * Math.sin(a2))} L${F(cx + r0 * Math.cos(a2))} ${F(cy + r0 * Math.sin(a2))} Z `;
  }
  return d;
}

// 4-point sparkle star
function star4(cx, cy, r, fill) {
  const k = F(r * 0.22);
  return `<path d="M${cx} ${F(cy - r)} Q ${F(cx + k)} ${F(cy - k)} ${F(cx + r)} ${cy} Q ${F(cx + k)} ${F(cy + k)} ${cx} ${F(cy + r)} Q ${F(cx - k)} ${F(cy + k)} ${F(cx - r)} ${cy} Q ${F(cx - k)} ${F(cy - k)} ${cx} ${F(cy - r)} Z" fill="${fill}"/>`;
}

// swallow-notch slogan banner
function banner(x, y, w, h, notch, fill) {
  return `M${x} ${y} H${F(x + w)} L${F(x + w - notch)} ${F(y + h / 2)} L${F(x + w)} ${F(y + h)} H${x} L${F(x + notch)} ${F(y + h / 2)} Z`;
}

/* ================= flavor-keyed emblem motifs (2-3 ink) ================= */

const MOTIFS = {
  bhajani(cx, cy, R, fl) {
    const r1 = R * 0.8;
    return `<path d="${spiralPath(cx, cy, 3, r1, 3.2, 200)}" fill="none" stroke="${fl.sku}" stroke-width="${F(R * 0.075)}" stroke-linecap="round"/>
      <path d="${spiralTicks(cx, cy, 3, r1, 3.2, 52, R * 0.105)}" stroke="${fl.sku}" stroke-width="${F(R * 0.02)}" opacity=".85"/>`;
  },
  masala(cx, cy, R, fl) {
    // pods carry a paper keyline halo (paint-order stroke) so the fan stays separated in one ink
    const pod = (l, rot, dx, dy) => `<g transform="translate(${F(cx + dx)} ${F(cy + dy)}) rotate(${rot})">
      <path d="M0 0 C ${F(-l * .30)} ${F(l * .10)}, ${F(-l * .36)} ${F(l * .52)}, ${F(-l * .10)} ${F(l * .94)} C ${F(-l * .02)} ${F(l * 1.06)}, ${F(l * .18)} ${F(l * 1.00)}, ${F(l * .15)} ${F(l * .84)} C ${F(l * .04)} ${F(l * .58)}, ${F(l * .14)} ${F(l * .22)}, ${F(l * .10)} ${F(l * .02)} Z" fill="${fl.sku}" stroke="${PAPER}" stroke-width="${F(l * .11)}" paint-order="stroke" stroke-linejoin="round"/>
      <path d="M${F(l * .05)} 0 q ${F(l * .07)} ${F(-l * .18)} ${F(l * .24)} ${F(-l * .15)}" fill="none" stroke="${INK}" stroke-width="${F(Math.max(1.6, l * .055))}" stroke-linecap="round"/>
    </g>`;
    const l = R * 0.92;
    return pod(l * 0.84, -40, -R * 0.5, -R * 0.28) + pod(l, -2, 0, -R * 0.48) + pod(l * 0.88, 36, R * 0.5, -R * 0.3)
      + star4(cx - R * 0.64, cy + R * 0.46, R * 0.12, GOLD) + star4(cx + R * 0.66, cy + R * 0.4, R * 0.1, GOLD);
  },
  butter(cx, cy, R, fl) {
    const w = R * 1.34, h = R * 0.74, dx = R * 0.4, dyy = R * 0.3;
    const x0 = F(cx - (w + dx) / 2), y0 = F(cy - (h - dyy) / 2 + h * 0.06);
    return `<g stroke="${INK}" stroke-width="${F(R * 0.024)}" stroke-linejoin="round">
      <path d="M${x0} ${y0} L${F(x0 + dx)} ${F(y0 - dyy)} L${F(x0 + dx + w)} ${F(y0 - dyy)} L${F(x0 + w)} ${y0} Z" fill="${HALDI}"/>
      <rect x="${x0}" y="${y0}" width="${F(w)}" height="${F(h)}" fill="${fl.sku}"/>
      <path d="M${F(x0 + w)} ${y0} L${F(x0 + w + dx)} ${F(y0 - dyy)} L${F(x0 + w + dx)} ${F(y0 - dyy + h)} L${F(x0 + w)} ${F(y0 + h)} Z" fill="#A06B24"/>
      <path d="M${F(x0 + dx * 0.6 + w * 0.3)} ${F(y0 - dyy * 0.5)} L${F(x0 + w * 0.3 + dx * 0.6 + w * 0.28)} ${F(y0 - dyy * 0.5)}" fill="none" opacity=".65"/>
    </g>
    ${star4(cx - R * 0.68, cy - R * 0.5, R * 0.12, GOLD)}${star4(cx + R * 0.7, cy + R * 0.42, R * 0.1, GOLD)}`;
  },
  poha(cx, cy, R, fl) {
    const e = (dx, dy, rot, rx, ry, op) =>
      `<ellipse cx="${F(cx + dx)}" cy="${F(cy + dy)}" rx="${F(rx)}" ry="${F(ry)}" transform="rotate(${rot} ${F(cx + dx)} ${F(cy + dy)})" fill="${fl.sku}" opacity="${op}"/>`;
    return e(-R * 0.32, -R * 0.18, -26, R * 0.27, R * 0.43, 1) + e(R * 0.32, -R * 0.08, 20, R * 0.27, R * 0.43, 1) + e(-R * 0.01, R * 0.3, -4, R * 0.23, R * 0.36, .82)
      + `<path d="M${F(cx - R * 0.14)} ${F(cy - R * 0.68)} a ${F(R * 0.2)} ${F(R * 0.2)} 0 1 0 ${F(R * 0.32)} 0 a ${F(R * 0.16)} ${F(R * 0.16)} 0 1 1 ${F(-R * 0.32)} 0" fill="${GOLD}"/>`
      + `<circle cx="${F(cx - R * 0.66)}" cy="${F(cy + R * 0.56)}" r="${F(R * 0.067)}" fill="${INK}"/><circle cx="${F(cx + R * 0.66)}" cy="${F(cy + R * 0.53)}" r="${F(R * 0.06)}" fill="${INK}"/>`;
  },
};

/* ================= flavor definitions ================= */
const FLAVORS = [
  { id: 'bhajani', no: 1, dev: 'भाजणी चकली', latin: 'BHAJANI CHAKLI', slogan: 'KADAK & HONEST',
    sku: '#7A1E2B', skuDark: '#57121E', photo: 'chakli-1.jpg', price: '₹120', wt: '200 g', batch: 'SB-11',
    ringTop: 'आजीचा फराळ · CMAA', ringBot: 'STONE-GROUND · HAND-PRESSED',
    truth: 'तांदूळ · चार डाळी · तीळ · तूप — बस्स.',
    micro: 'AVG. CONTENTS: 40 HAND-PRESSED SPIRALS — COUNTED TWICE.' },
  { id: 'butter', no: 2, dev: 'बटर चकली', latin: 'BUTTER CHAKLI', slogan: 'MELTS, THEN CRUNCHES',
    sku: '#C98A3B', skuDark: '#8F5E20', photo: 'murukku.jpg', price: '₹140', wt: '200 g', batch: 'SB-12',
    ringTop: 'आजीचा फराळ · CMAA', ringBot: 'WHITE-BUTTER SHORT CRUNCH',
    truth: 'तांदूळ · लोणी · जिरे · मीठ — बस्स.',
    micro: 'AVG. CONTENTS: 36 SPIRALS — BROKEN ONES, WE EAT.' },
  { id: 'masala', no: 3, dev: 'मसाला चिवडा', latin: 'MASALA CHIVDA', slogan: 'KOLHAPURI HEAT',
    sku: '#B3372B', skuDark: '#7E1F1A', photo: 'chivda-2.jpg', price: '₹110', wt: '250 g', batch: 'SB-13',
    ringTop: 'आजीचा फराळ · CMAA', ringBot: 'POHA · PEANUT · CURRY LEAF',
    truth: 'पोहे · शेंगदाणे · कढीपत्ता · मसाला — बस्स.',
    micro: 'AVG. CONTENTS: POHA, PEANUTS, CURRY LEAF & 5 SECRETS.' },
  { id: 'poha', no: 4, dev: 'पोहा चिवडा', latin: 'POHA CHIVDA', slogan: 'LIGHT AS TALK',
    sku: '#5F7A4A', skuDark: '#3E5530', photo: 'chivda-1.jpg', price: '₹110', wt: '250 g', batch: 'SB-14',
    ringTop: 'आजीचा फराळ · CMAA', ringBot: 'THIN POHA · CASHEW & RAISIN',
    truth: 'पातळ पोहे · काजू · बेदाणे · हळद — बस्स.',
    micro: "AVG. CONTENTS: A LOT. IT'S CHIVDA — YOU WEIGH IT." },
];

/* ================= the label artwork (480 x 640 local space) =================
   opts.drawer=true swaps the truth-strip zone for a "matchbox drawer" die-cut
   window holding the REAL product photo (used on the pouch application).     */
function labelArt(fl, uid, opts = {}) {
  const { drawer = false, imgPrefix = '../../../images/' } = opts;
  const W = 480, H = 640, cxm = W / 2;

  // vertical rhythm differs between flat + drawer variants
  const L = drawer
    ? { microY: 58, devY: 110, devSize: 43, ornY: 127, latY: 152, latSize: 18,
        emY: 268, emR: 90, rowY: 386, banY: 408, banH: 34, banSize: 17,
        star: [[60, 178], [420, 178], [60, 352], [420, 352]] }
    : { microY: 66, devY: 122, devSize: 46, ornY: 140, latY: 168, latSize: 20,
        emY: 312, emR: 106, rowY: 444, banY: 474, banH: 38, banSize: 19,
        star: [[60, 190], [420, 190], [60, 430], [420, 430]] };

  const emX = cxm, emY = L.emY, R = L.emR;
  const rt = R - 18; // ring-text radius
  const banX = drawer ? 74 : 70, banW = W - banX * 2;
  const bannerD = banner(banX, L.banY, banW, L.banH, 14, fl.sku);

  // emblem dot halo
  let halo = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 2 * Math.PI - Math.PI / 2;
    halo += `<circle cx="${F(emX + (R + 12) * Math.cos(a))}" cy="${F(emY + (R + 12) * Math.sin(a))}" r="2.2" fill="${GOLD}"/>`;
  }

  // drawer window (pouch only)
  let drawerG = '', drawerDefs = '';
  if (drawer) {
    const wx = 82, wy = 450, ww = 316, wh = 116;
    drawerDefs = `<clipPath id="dwc-${uid}"><rect x="${wx + 5}" y="${wy + 5}" width="${ww - 10}" height="${wh - 10}" rx="4"/></clipPath>`;
    drawerG = `
    <g>
      <rect x="${wx - 3}" y="${wy - 3}" width="${ww + 6}" height="${wh + 6}" rx="8" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
      <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="6" fill="${fl.skuDark}" stroke="${INK}" stroke-width="2.4"/>
      <g clip-path="url(#dwc-${uid})">
        <image href="${imgPrefix}${fl.photo}" x="${wx - 24}" y="${wy - 42}" width="${ww + 48}" height="${wh + 84}" preserveAspectRatio="xMidYMid slice" style="filter:saturate(1.25) contrast(1.08) brightness(1.06)"/>
        <rect x="${wx + 5}" y="${wy + 5}" width="${ww - 10}" height="${wh - 10}" fill="${fl.sku}" style="mix-blend-mode:multiply" opacity=".13"/>
      </g>
      <rect x="${cxm - 122}" y="${wy + wh - 10}" width="244" height="19" rx="2" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
      <text x="${cxm}" y="${wy + wh + 3.5}" text-anchor="middle" font-family="${COURIER}" font-size="10" font-weight="700" letter-spacing=".5" fill="${INK}">अस्सल माल · THE ACTUAL GOODS</text>
    </g>`;
  }

  // classic matchbox cue under the emblem (flat only; pouch is tighter)
  const tradeMark = drawer ? '' : `<text x="${cxm}" y="${F(emY + R + 34)}" text-anchor="middle" font-family="${COURIER}" font-size="8.5" letter-spacing="3" fill="${INK}" opacity=".75">— TRADE MARK —</text>`;

  // lower text block
  const lower = drawer
    ? `<text x="${cxm}" y="594" text-anchor="middle" font-family="${COURIER}" font-size="10" fill="${INK}">${fl.micro.replace('&', '&amp;')} · NET ${fl.wt}</text>`
    : `<text x="${cxm}" y="536" text-anchor="middle" font-family="${COURIER}" font-size="10.5" fill="${INK}">${fl.micro.replace('&', '&amp;')}</text>
       <text x="${cxm}" y="584" text-anchor="middle" font-family="${COURIER}" font-size="10" fill="${INK}">NET WT ${fl.wt} · BATCH ${fl.batch} · NO PRESERVATIVES</text>`;

  // truth line (flat only) sits between micro + netwt, in the RED channel
  const truth = drawer ? '' : `<text x="${cxm}" y="562" text-anchor="middle" font-family="${DEV_STACK}" font-size="15.5" fill="${fl.sku}">${fl.truth}</text>`;

  /* -------- defs -------- */
  const defs = `
  <clipPath id="field-${uid}"><rect x="44" y="44" width="${W - 88}" height="${H - 88}" rx="8"/></clipPath>
  <pattern id="ht-${uid}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx="3.5" cy="3.5" r="1.15" fill="${INK}"/></pattern>
  <radialGradient id="vg-${uid}" cx=".5" cy=".46" r=".78"><stop offset=".68" stop-color="#6B4A2A" stop-opacity="0"/><stop offset="1" stop-color="#6B4A2A" stop-opacity=".12"/></radialGradient>
  <filter id="grain-${uid}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
  <path id="rup-${uid}" d="M ${F(emX - rt)} ${emY} a ${rt} ${rt} 0 0 1 ${rt * 2} 0" fill="none"/>
  <path id="rdn-${uid}" d="M ${F(emX - rt)} ${emY} a ${rt} ${rt} 0 0 0 ${rt * 2} 0" fill="none"/>
  ${drawerDefs}
  <!-- the misregistered ink channel: printed twice, once slipped 1px -->
  <g id="red-${uid}">
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${fl.sku}" stroke-width="1.5"/>
    <text x="${cxm}" y="${L.devY}" text-anchor="middle" font-family="${DEV_STACK}" font-size="${L.devSize}" fill="${fl.sku}">${fl.dev}</text>
    <circle cx="${emX}" cy="${emY}" r="${R}" fill="none" stroke="${fl.sku}" stroke-width="4"/>
    <path d="${bannerD}"/>
    ${truth}
  </g>`;

  /* -------- body -------- */
  const body = `
  <!-- paper -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="${PAPER}"/>

  <!-- sunburst: off-rotated, clipped to the field -->
  <g clip-path="url(#field-${uid})">
    <g transform="rotate(-6 ${emX} ${emY})">
      <path d="${sunburst(emX, emY, R * 0.5, 520, 28)}" fill="${fl.sku}" opacity=".14"/>
    </g>
    <rect x="44" y="44" width="${W - 88}" height="${H - 88}" fill="url(#ht-${uid})" opacity=".07"/>
  </g>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#vg-${uid})"/>

  <!-- frame: heavy rule, rails, rope, thin red rule (in channel) -->
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="${INK}" stroke-width="2.6"/>
  <rect x="17" y="17" width="${W - 34}" height="${H - 34}" rx="20" fill="none" stroke="${INK}" stroke-width=".9" opacity=".8"/>
  <rect x="31" y="31" width="${W - 62}" height="${H - 62}" rx="12" fill="none" stroke="${INK}" stroke-width=".9" opacity=".8"/>
  ${ropeBorder(24, 24, W - 48, H - 48, 16)}

  <!-- emblem paper base (blanks the rays behind the circle) -->
  <circle cx="${emX}" cy="${emY}" r="${R}" fill="${PAPER}"/>

  <!-- RED CHANNEL: ghost pass (slipped) then true pass -->
  <use href="#red-${uid}" fill="${fl.sku}" transform="translate(1 .55)" opacity=".5" style="mix-blend-mode:multiply"/>
  <use href="#red-${uid}" fill="${fl.sku}"/>

  <!-- ink + gold passes -->
  <text x="${cxm}" y="${L.microY}" text-anchor="middle" font-family="${COURIER}" font-size="10" letter-spacing="1.5" fill="${INK}">CMAA HOME INDUSTRIES · KOTHRUD · PUNE 411038</text>
  <g transform="translate(0 ${L.ornY})">
    <path d="M${cxm - 92} 0 H${cxm - 20} M${cxm + 20} 0 H${cxm + 92}" stroke="${GOLD}" stroke-width="1.6"/>
    <rect x="${cxm - 5}" y="-5" width="10" height="10" transform="rotate(45 ${cxm} 0)" fill="${GOLD}"/>
    <circle cx="${cxm - 104}" cy="0" r="2" fill="${fl.sku}"/><circle cx="${cxm + 104}" cy="0" r="2" fill="${fl.sku}"/>
  </g>
  <text x="${cxm}" y="${L.latY}" text-anchor="middle" font-family="${ANTON}" font-size="${L.latSize}" letter-spacing="6" fill="${INK}">${fl.latin}</text>

  <circle cx="${emX}" cy="${emY}" r="${R - 7}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
  ${halo}
  <text font-family="${MULISH}" font-size="10.5" font-weight="800" letter-spacing="2" fill="${INK}"><textPath href="#rup-${uid}" startOffset="50%" text-anchor="middle">${fl.ringTop}</textPath></text>
  <text font-family="${MULISH}" font-size="9" font-weight="800" letter-spacing="2.4" fill="${INK}"><textPath href="#rdn-${uid}" startOffset="50%" text-anchor="middle">${fl.ringBot.replace('&', '&amp;')}</textPath></text>
  ${MOTIFS[fl.id](emX, emY, R - 34, fl)}
  ${tradeMark}

  <!-- price roundel + series cartouche -->
  <g transform="translate(88 ${L.rowY})">
    <circle r="20" fill="${GOLD}" stroke="${INK}" stroke-width="1.6"/>
    <circle r="15.5" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="1.5 2.5"/>
    <text y="4.5" text-anchor="middle" font-family="${MULISH}" font-size="12.5" font-weight="800" fill="${INK}">${fl.price}</text>
  </g>
  <g transform="translate(378 ${L.rowY}) rotate(3)">
    <rect x="-44" y="-13" width="88" height="26" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>
    <rect x="-40" y="-9" width="80" height="18" fill="none" stroke="${INK}" stroke-width=".7" stroke-dasharray="2 2.5"/>
    <text y="4" text-anchor="middle" font-family="${COURIER}" font-size="11" font-weight="700" fill="${INK}">No. ${fl.no} of 4</text>
  </g>

  <!-- slogan strip lettering (strip itself is in the red channel) -->
  <text x="${cxm}" y="${F(L.banY + L.banH / 2 + L.banSize * 0.36)}" text-anchor="middle" font-family="${ANTON}" font-size="${L.banSize}" letter-spacing="4.5" fill="${CREAM}">${fl.slogan.replace('&', '&amp;')}</text>

  ${L.star.map(([sx, sy]) => star4(sx, sy, 7, GOLD)).join('')}
  ${drawerG}
  ${lower}`;

  return { defs, body };
}

/* ================= deliverable 1: label flats ================= */
function flatSVG(fl) {
  const art = labelArt(fl, fl.id + '-f', { drawer: false });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640" font-family="${MULISH}">
<defs><style>${FONTS}</style>${art.defs}</defs>
<g filter="url(#grain-${fl.id}-f)">${art.body}</g>
</svg>`;
}

/* ================= deliverable 2: pouch application ================= */
function pouchSVG(fl) {
  const W = 460, H = 660, bx = 26, bw = 408, crimpY = 34;
  const uid = fl.id + '-p';
  const art = labelArt(fl, uid, { drawer: true, imgPrefix: '../../../images/' });
  // crimp zigzag
  let zz = `M${bx} ${crimpY}`; const zn = 26, zw = bw / zn;
  for (let i = 0; i < zn; i++) zz += ` l${F(zw / 2)} ${i % 2 ? 7 : -7} l${F(zw / 2)} ${i % 2 ? -7 : 7}`;
  const s = 0.76, tx = F(215 - 240 * s), ty = 52; // label centered on 26..404 zone

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${MULISH}">
<defs><style>${FONTS}</style>${art.defs}
  <clipPath id="pb-${uid}"><rect x="${bx}" y="26" width="${bw}" height="602" rx="14"/></clipPath>
  <pattern id="grit-${uid}" width="11" height="11" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="3" r="1.2" fill="#2E2118"/><circle cx="7" cy="1.5" r=".9" fill="#2E2118"/><circle cx="5" cy="6.4" r="1.3" fill="#2E2118"/><circle cx="9.2" cy="8.4" r="1" fill="#2E2118"/><circle cx="2.2" cy="9.2" r=".9" fill="#6B573F"/><circle cx="8.4" cy="4.6" r=".7" fill="#6B573F"/>
  </pattern>
  <linearGradient id="sheen-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".16" stop-color="#fff" stop-opacity=".26"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient>
</defs>
<g filter="url(#grain-${uid})">
  <g clip-path="url(#pb-${uid})">
    <rect x="${bx}" y="26" width="${bw}" height="602" rx="14" fill="${PAPER}"/>
    <!-- the pack IS the label -->
    <g transform="translate(${tx} ${ty}) scale(${s})">${art.body.replace(/<rect x="0" y="0" width="480" height="640" fill="[^"]+"\/>/, '')}</g>
    <!-- striker strip: strike here when hunger hits -->
    <g>
      <rect x="408" y="64" width="20" height="478" rx="5" fill="#4A3423" stroke="${INK}" stroke-width="1.2"/>
      <rect x="408" y="64" width="20" height="478" rx="5" fill="url(#grit-${uid})"/>
      <text transform="translate(421.5 303) rotate(90)" text-anchor="middle" font-family="${COURIER}" font-size="8.6" font-weight="700" letter-spacing="1.8" fill="${PAPER}">STRIKE HERE WHEN HUNGER HITS</text>
    </g>
    <!-- footer band -->
    <rect x="${bx}" y="562" width="${bw}" height="46" fill="${fl.sku}"/>
    <rect x="${bx}" y="562" width="${bw}" height="3" fill="${fl.skuDark}"/>
    <text x="230" y="583" text-anchor="middle" font-family="${COURIER}" font-size="10" font-weight="700" letter-spacing="1.2" fill="${CREAM}">BATCH ${fl.batch} · PACKED 08·07·26 · NO PRESERVATIVES</text>
    <text x="230" y="599" text-anchor="middle" font-family="${MULISH}" font-size="9" font-weight="700" letter-spacing="2.6" fill="${CREAM}" opacity=".85">CMAA · आजीचा फराळ · KOTHRUD, PUNE</text>
    <rect x="${bx}" y="26" width="${bw}" height="602" rx="14" fill="url(#sheen-${uid})"/>
  </g>
  <rect x="${bx}" y="26" width="${bw}" height="602" rx="14" fill="none" stroke="${fl.skuDark}" stroke-width="1.6"/>
  <!-- crimp seal -->
  <path d="${zz}" fill="none" stroke="${fl.skuDark}" stroke-width="2.2"/>
  <rect x="${bx}" y="16" width="${bw}" height="15" rx="6" fill="${PAPER}" stroke="${fl.skuDark}" stroke-width="1.4"/>
  <circle cx="230" cy="23.5" r="3.4" fill="none" stroke="${fl.skuDark}" stroke-width="1.3"/>
</g>
</svg>`;
}

/* ================= deliverable 3: 4-up "collect the series" sheet ================= */
function sheetSVG() {
  const W = 1120, H = 700;
  const s = 0.48, lw = 480 * s, lh = 640 * s; // 230.4 x 307.2
  const gap = 26, rowY = 178;
  const total = 4 * lw + 3 * gap, x0 = (W - total) / 2;
  const arts = FLAVORS.map(fl => ({ fl, art: labelArt(fl, 's-' + fl.id, { drawer: false }) }));
  const perfX = [1, 2, 3].map(i => F(x0 + i * (lw + gap) - gap / 2));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${MULISH}">
<defs><style>${FONTS}</style>
  ${arts.map(a => a.art.defs).join('\n')}
  <pattern id="ht-board" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="4" cy="4" r="1" fill="${GOLD}"/></pattern>
  <filter id="grain-sheet"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
</defs>
<g filter="url(#grain-sheet)">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#ht-board)" opacity=".05"/>
  <rect x="48" y="50" width="1040" height="620" fill="#000" opacity=".38"/>
  <rect x="40" y="40" width="1040" height="620" fill="${PAPER}"/>

  <!-- crop marks -->
  ${[[46, 46, 1, 1], [1074, 46, -1, 1], [46, 654, 1, -1], [1074, 654, -1, -1]].map(([mx, my, sx, sy]) =>
    `<path d="M${mx} ${my + sy * 6} v ${sy * 12} M${mx + sx * 6} ${my} h ${sx * 12}" stroke="${INK}" stroke-width="1.4" fill="none"/>`).join('')}

  <text x="${W / 2}" y="78" text-anchor="middle" font-family="${COURIER}" font-size="10.5" letter-spacing="2" fill="${INK}">THE CMAA PRESS · KOTHRUD · PUNE 411038 · SHEET No. 004 · TWO INKS &amp; GOLD PER LABEL</text>
  <text x="${W / 2}" y="120" text-anchor="middle" font-family="${DEV_STACK}" font-size="38" fill="#7A1E2B">चारही जमवा — आजीचा फराळ</text>
  <text x="${W / 2}" y="150" text-anchor="middle" font-family="${ANTON}" font-size="17" letter-spacing="5" fill="${INK}">COLLECT THE SERIES · KADAK &amp; HONEST</text>

  ${arts.map((a, i) => `<g transform="translate(${F(x0 + i * (lw + gap))} ${rowY}) scale(${s})">${a.art.body}</g>`).join('\n')}

  <!-- perforations between labels -->
  ${perfX.map(px => `<path d="M${px} ${rowY} V${F(rowY + lh)}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="5 6" opacity=".55"/>
  <circle cx="${px}" cy="${rowY - 6}" r="3.2" fill="${INK}" opacity=".55"/><circle cx="${px}" cy="${F(rowY + lh + 6)}" r="3.2" fill="${INK}" opacity=".55"/>`).join('')}

  ${arts.map((a, i) => {
    const cx = F(x0 + i * (lw + gap) + lw / 2);
    return `<g transform="translate(${cx} ${F(rowY + lh + 32)})">
      <rect x="-76" y="-11" width="11" height="11" fill="none" stroke="${INK}" stroke-width="1.3"/>
      ${a.fl.no === 1 ? `<path d="M-74 -6 l3 4 l5 -8" fill="none" stroke="${a.fl.sku}" stroke-width="1.8" stroke-linecap="round"/>` : ''}
      <text x="8" y="0" text-anchor="middle" font-family="${COURIER}" font-size="12" font-weight="700" fill="${INK}">No. ${a.fl.no} · ${a.fl.latin.split(' ')[0]} · ${a.fl.price}</text>
    </g>`;
  }).join('')}

  <path d="M${W / 2 - 150} 586 h 300" stroke="${GOLD}" stroke-width="1.4"/>
  <text x="${W / 2}" y="618" text-anchor="middle" font-family="${COURIER}" font-size="10.5" fill="${INK}">MISPRINTS ARE NOT DEFECTS — THEY ARE CHARACTER. · छपाई: अस्सल · SAVE ALL FOUR, TRADE WITH COUSINS.</text>

  <!-- aaji's rubber stamp -->
  <g transform="translate(952 566) rotate(-8)" opacity=".78">
    <ellipse rx="86" ry="34" fill="none" stroke="#7A1E2B" stroke-width="2.6"/>
    <ellipse rx="78" ry="27" fill="none" stroke="#7A1E2B" stroke-width="1.1"/>
    <text y="-4" text-anchor="middle" font-family="${COURIER}" font-size="14" font-weight="700" letter-spacing="3" fill="#7A1E2B">PASSED</text>
    <text y="13" text-anchor="middle" font-family="${COURIER}" font-size="9.5" letter-spacing="1.5" fill="#7A1E2B">AAJI Q.C. · 08·07·26</text>
  </g>
</g>
</svg>`;
}

/* ================= write everything ================= */
const DO = ['bhajani', 'masala'];
const files = [];
for (const id of DO) {
  const fl = FLAVORS.find(f => f.id === id);
  fs.writeFileSync(path.join(OUT, `label-${id}-flat.svg`), flatSVG(fl));
  fs.writeFileSync(path.join(OUT, `pouch-${id}.svg`), pouchSVG(fl));
  files.push(`label-${id}-flat.svg`, `pouch-${id}.svg`);
}
fs.writeFileSync(path.join(OUT, 'series-sheet.svg'), sheetSVG());
files.push('series-sheet.svg');

const manifest = [
  { id: 'bazaar-matchbox-bhajani-flat', name: 'Bhajani Chakli — matchbox label flat (No. 1 of 4)',
    concept: 'Giant vintage matchbox label: maroon+gold+ink on paper, off-rotated sunburst, spiral emblem in framed circle, rope border, KADAK & HONEST slogan strip, deliberate 1px misregistration on the maroon channel.',
    files: ['label-bhajani-flat.svg'] },
  { id: 'bazaar-matchbox-bhajani-pouch', name: 'Bhajani Chakli — pouch application',
    concept: 'The pack IS the label: same print chassis on a crimped pouch, plus a matchbox-drawer die-cut window with the real chakli photo and a striker strip ("strike here when hunger hits").',
    files: ['pouch-bhajani.svg'] },
  { id: 'bazaar-matchbox-masala-flat', name: 'Masala Chivda — matchbox label flat (No. 3 of 4)',
    concept: 'Chili-red channel, fanned chili-pod emblem, KOLHAPURI HEAT slogan strip; same collectible chassis, series-numbered.',
    files: ['label-masala-flat.svg'] },
  { id: 'bazaar-matchbox-masala-pouch', name: 'Masala Chivda — pouch application',
    concept: 'Masala label on the crimped pouch with the real chivda photo in the drawer window and striker strip.',
    files: ['pouch-masala.svg'] },
  { id: 'bazaar-matchbox-series-sheet', name: 'Collect-the-series sheet (4-up)',
    concept: 'Uncut printer sheet from "The Cmaa Press": all four flavor labels with perforations, crop marks, checkboxes ("save all four, trade with cousins").',
    files: ['series-sheet.svg'] },
];
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('wrote', files.join(', '), '+ manifest.json');
