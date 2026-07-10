// Cmaa packaging lab — DIRECTION P1 "KADAK COLOR-BLOCK"
// Full-bleed SKU color field · GIANT reversed Devanagari (justified stack, every line
// computed to fill the measure exactly) · chunky ink outlines + hard offset shadows ·
// one starburst sticker · real photo in a bold circular die-cut window.
//
// All geometry is computed. Devanagari/Anton run widths were measured in Chromium
// (canvas measureText with loaded webfonts, 100px) — see scratchpad/kadak-measure.js.
// Spiral helper technique borrowed from tools/gen-packaging.js.
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);

/* ---------- measured font metrics @100px (Chromium canvas, fonts loaded) ---------- */
const YATRA = { // Yatra One
  'भाजणी': { w: 280.2, asc: 87, desc: 7 },
  'चकली':  { w: 256.1, asc: 87, desc: 6 },
  'बटर':   { w: 162.1, asc: 62, desc: 6 },
};
const ANTON = { // Anton
  'BHAJANI CHAKLI': 592.82, 'BUTTER CHAKLI': 542.04, 'CMAA': 219.09,
  'AAJI': 166.36, 'APPROVED': 376.66, '200 g': 222.07,
};

/* ---------- palette (design-brief law) ---------- */
const INK = '#33241A', CREAM = '#F6EDDB', PAPER = '#F1E4CB';
const BHAJANI = '#7A1E2B', HALDI = '#E3A72F';

/* ---------- geometry helpers ---------- */
// Archimedean spiral (chakli monogram) — same technique as tools/gen-packaging.js
function spiralPath(cx, cy, r0, r1, turns, steps = 160) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, th = t * turns * 2 * Math.PI - Math.PI / 2;
    const r = r0 + (r1 - r0) * t;
    pts.push([F(cx + r * Math.cos(th)), F(cy + r * Math.sin(th))]);
  }
  return 'M' + pts.map(p => p.join(' ')).join(' L');
}
// Serrated seal / starburst polygon (n teeth, alternating radii)
function starburst(cx, cy, rOut, rIn, n) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 === 0 ? rOut : rIn;
    pts.push(`${F(cx + r * Math.cos(a))} ${F(cy + r * Math.sin(a))}`);
  }
  return 'M' + pts.join(' L') + ' Z';
}

/* ---------- layout constants (460x660 grid) ---------- */
const W = 460, H = 660, M = 28, CW = W - 2 * M; // measure = 404
const RULE_Y = 52, NAME_TOP = 66, LINE_GAP = 16;
const BLOCK_Y = 552, BLOCK_H = 74, STRIP_Y = 634;

/* Justified Devanagari stack: each line's font-size solved so the run == 404px wide. */
function layoutName(lines, gap = LINE_GAP) {
  let baseline = NAME_TOP, out = [];
  for (const text of lines) {
    const m = YATRA[text];
    const size = CW / (m.w / 100);
    const asc = size * m.asc / 100, desc = size * m.desc / 100;
    baseline += asc;
    out.push({ text, size: F(size), baseline: F(baseline), shadow: Math.min(11, Math.max(7, Math.round(size * 0.055))) });
    baseline += desc + gap;
  }
  return out;
}

/* ---------- flavor worlds ---------- */
const FLAVORS = [
  {
    id: 'bhajani', field: BHAJANI, fieldDark: '#57121E',
    fg: CREAM, nameFill: CREAM, nameShadow: INK, accent: HALDI,
    stickerFill: HALDI, stickerText: INK, stickerRing: INK,
    keyline: HALDI,
    lines: ['भाजणी', 'चकली'], latin: 'BHAJANI CHAKLI',
    photo: 'chakli-1.jpg', grade: 'saturate(1.3) contrast(1.1) brightness(1.08)',
    photoC: { x: 306, y: 436, r: 110 }, sticker: { x: 142, y: 470, r: 64, rot: -12 },
    truthDev: 'तांदूळ · डाळी · तीळ · देशी तूप — बस्स.',
    truthEn: 'rice · four dals · sesame · ghee — that’s all.',
    wt: '200 g', batch: 'SB-11',
  },
  {
    id: 'butter', field: HALDI, fieldDark: '#8F5E20',
    fg: INK, nameFill: INK, nameShadow: BHAJANI, accent: BHAJANI,
    stickerFill: BHAJANI, stickerText: CREAM, stickerRing: CREAM,
    keyline: CREAM,
    lines: ['बटर', 'चकली'], lineGap: 8, latin: 'BUTTER CHAKLI',
    photo: 'murukku.jpg', grade: 'saturate(1.32) contrast(1.08) brightness(1.18)',
    photoC: { x: 320, y: 460, r: 92 }, sticker: { x: 146, y: 484, r: 64, rot: -12 },
    truthDev: 'तांदूळ · लोणी · जिरे · मीठ — बस्स.',
    truthEn: 'rice · white butter · cumin · salt — that’s all.',
    wt: '200 g', batch: 'SB-12',
  },
];

const FONT_CSS = `@import url('https://fonts.googleapis.com/css2?family=Anton&amp;family=Yatra+One&amp;family=Mulish:wght@400;700;800&amp;family=Fraunces:ital,opsz,wght@1,9..144,400..600&amp;display=swap');`;
const DISPLAY = `'Anton','Arial Narrow',Impact,sans-serif`;
const DEV = `'Yatra One','Noto Sans Devanagari',serif`;
const BODY = `'Mulish',system-ui,sans-serif`;
const SERIF_IT = `'Fraunces',Georgia,serif`;

/* ---------- shared defs ---------- */
function defs(uid, fl) {
  const p = fl.photoC;
  return `<defs>
  <style>${FONT_CSS}</style>
  <clipPath id="ph-${uid}"><circle cx="${p.x}" cy="${p.y}" r="${p.r}"/></clipPath>
  <filter id="gr-${uid}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
</defs>`;
}

/* ---------- the 460x660 artwork (used by flat label AND pouch) ---------- */
function artwork(fl, uid, imgPrefix) {
  const p = fl.photoC, st = fl.sticker;
  const nameLines = layoutName(fl.lines, fl.lineGap);

  // header
  const spiral = spiralPath(41, 26.5, 1.5, 11.5, 2.6, 120);
  const header = `
  <!-- header strip -->
  <path d="${spiral}" fill="none" stroke="${fl.fg}" stroke-width="2.6" stroke-linecap="round"/>
  <text x="58" y="36" font-family=${JSON.stringify(DISPLAY)} font-size="26" letter-spacing="1" fill="${fl.fg}">CMAA</text>
  <text x="${W - M}" y="36" text-anchor="end" font-family=${JSON.stringify(DEV)} font-size="16" fill="${fl.fg}">आजीचा फराळ</text>
  <path d="M${M} ${RULE_Y} H${W - M}" stroke="${fl.fg}" stroke-width="2.5"/>`;

  // photo die-cut circle: hard ink offset shadow + ink ring + accent keyline
  const photo = `
  <!-- circular die-cut photo window -->
  <circle cx="${p.x + 8}" cy="${p.y + 8}" r="${p.r}" fill="${INK}"/>
  <circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${fl.fieldDark}"/>
  <g clip-path="url(#ph-${uid})">
    <image href="${imgPrefix}${fl.photo}" x="${p.x - p.r - 20}" y="${p.y - p.r - 20}" width="${(p.r + 20) * 2}" height="${(p.r + 20) * 2}" preserveAspectRatio="xMidYMid slice" style="filter:${fl.grade}"/>
    <circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${fl.field}" style="mix-blend-mode:multiply" opacity=".08"/>
  </g>
  <circle cx="${p.x}" cy="${p.y}" r="${p.r - 7}" fill="none" stroke="${fl.keyline}" stroke-width="2"/>
  <circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="none" stroke="${INK}" stroke-width="5.5"/>`;

  // giant justified Devanagari stack, hard offset shadow per line
  const giant = nameLines.map(L => `
  <text x="${M}" y="${F(L.baseline + L.shadow)}" font-family=${JSON.stringify(DEV)} font-size="${L.size}" fill="${fl.nameShadow}" transform="translate(${L.shadow} 0)">${L.text}</text>
  <text x="${M}" y="${L.baseline}" font-family=${JSON.stringify(DEV)} font-size="${L.size}" fill="${fl.nameFill}">${L.text}</text>`).join('');

  // starburst sticker "AAJI APPROVED"
  const burstOut = starburst(0, 0, st.r, st.r - 12, 18);
  const sticker = `
  <!-- sticker: aaji approved seal -->
  <g transform="translate(${st.x} ${st.y}) rotate(${st.rot})">
    <path d="${burstOut}" transform="translate(6 6)" fill="${INK}"/>
    <path d="${burstOut}" fill="${fl.stickerFill}" stroke="${INK}" stroke-width="3"/>
    <circle r="${st.r - 21}" fill="none" stroke="${fl.stickerRing}" stroke-width="1.6"/>
    <text y="-28" text-anchor="middle" font-size="8.5" fill="${fl.stickerText}">★</text>
    <text y="-4" text-anchor="middle" font-family=${JSON.stringify(DISPLAY)} font-size="20" letter-spacing="1.5" fill="${fl.stickerText}">AAJI</text>
    <text y="13" text-anchor="middle" font-family=${JSON.stringify(DISPLAY)} font-size="12.5" letter-spacing="1.2" fill="${fl.stickerText}">APPROVED</text>
    <text y="28" text-anchor="middle" font-family=${JSON.stringify(BODY)} font-weight="800" font-size="6" letter-spacing=".8" fill="${fl.stickerText}">KOTHRUD · PUNE</text>
  </g>`;

  // cream type block with ink border + hard shadow
  const block = `
  <!-- cream type block -->
  <rect x="${M + 7}" y="${BLOCK_Y + 7}" width="${CW}" height="${BLOCK_H}" fill="${INK}"/>
  <rect x="${M}" y="${BLOCK_Y}" width="${CW}" height="${BLOCK_H}" fill="${CREAM}" stroke="${INK}" stroke-width="3.5"/>
  <text x="46" y="${BLOCK_Y + 27}" font-family=${JSON.stringify(DISPLAY)} font-size="24" letter-spacing="1" fill="${INK}">${fl.latin}</text>
  <text x="46" y="${BLOCK_Y + 48}" font-family=${JSON.stringify(DEV)} font-size="13" fill="${BHAJANI}">${fl.truthDev}</text>
  <text x="46" y="${BLOCK_Y + 65}" font-family=${JSON.stringify(SERIF_IT)} font-style="italic" font-size="10" fill="#6B573F">${fl.truthEn}</text>
  <path d="M348 ${BLOCK_Y + 12} V${BLOCK_Y + BLOCK_H - 12}" stroke="${INK}" stroke-width="2.5"/>
  <text x="391" y="${BLOCK_Y + 30}" text-anchor="middle" font-family=${JSON.stringify(BODY)} font-weight="800" font-size="8" letter-spacing="2" fill="#6B573F">NET WT</text>
  <text x="391" y="${BLOCK_Y + 58}" text-anchor="middle" font-family=${JSON.stringify(DISPLAY)} font-size="21" fill="${INK}">${fl.wt}</text>`;

  // ink credentials strip (full bleed)
  const strip = `
  <rect x="0" y="${STRIP_Y}" width="${W}" height="${H - STRIP_Y}" fill="${INK}"/>
  <text x="${W / 2}" y="${STRIP_Y + 17.5}" text-anchor="middle" font-family=${JSON.stringify(BODY)} font-weight="800" font-size="9.5" letter-spacing="1.8" fill="${CREAM}">NO MAIDA · NO MACHINES · NOT SORRY — BATCH ${fl.batch}</text>`;

  return `<g filter="url(#gr-${uid})">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${fl.field}"/>
  ${header}
  ${photo}
  ${giant}
  ${sticker}
  ${block}
  ${strip}
</g>`;
}

/* ---------- flat label ---------- */
function flatLabel(fl, imgPrefix) {
  const uid = fl.id + '-f';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family=${JSON.stringify(BODY)}>
${defs(uid, fl)}
${artwork(fl, uid, imgPrefix)}
</svg>`;
}

/* ---------- pouch application ---------- */
function pouchSVG(fl, imgPrefix) {
  const uid = fl.id + '-p';
  const bx = 24, bw = 412, teethY = 44, tipY = 37, botY = 652, rr = 16;
  // sawtooth top edge
  const n = 24, tw = bw / n;
  let top = `M${bx} ${teethY}`;
  for (let i = 0; i < n; i++) top += ` l${F(tw / 2)} ${tipY - teethY} l${F(tw / 2)} ${teethY - tipY}`;
  const body = `${top} L${bx + bw} ${botY - rr} Q${bx + bw} ${botY} ${bx + bw - rr} ${botY} L${bx + rr} ${botY} Q${bx} ${botY} ${bx} ${botY - rr} Z`;
  // full-bleed artwork cover-fit into body silhouette
  const s = F((botY - tipY) / H);           // 0.9318
  const ax = F(bx + (bw - W * s) / 2);      // center horizontally (slight side bleed)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family=${JSON.stringify(BODY)}>
${defs(uid, fl)}
<defs>
  <clipPath id="body-${uid}"><path d="${body}"/></clipPath>
  <linearGradient id="gusset-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".07" stop-color="#000" stop-opacity="0"/>
    <stop offset=".34" stop-color="#fff" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".93" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/>
  </linearGradient>
  <linearGradient id="crimp-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="foot-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/>
  </linearGradient>
  <linearGradient id="sheen-${uid}" x1="0" y1="0" x2="1" y2=".18">
    <stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".38" stop-color="#fff" stop-opacity=".13"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
</defs>
<ellipse cx="${W / 2}" cy="${botY + 3}" rx="196" ry="6" fill="#000" opacity=".16"/>
<!-- crimp seal strip + euro slot -->
<rect x="${bx}" y="10" width="${bw}" height="24" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
<rect x="${W / 2 - 13}" y="19" width="26" height="6" rx="3" fill="none" stroke="${INK}" stroke-width="1.8"/>
<!-- pouch body with full-bleed label artwork -->
<g clip-path="url(#body-${uid})">
  <g transform="translate(${ax} ${tipY}) scale(${s})">${artwork(fl, uid, imgPrefix)}</g>
  <rect x="${bx}" y="${tipY}" width="${bw}" height="34" fill="url(#crimp-${uid})"/>
  <rect x="${bx}" y="${botY - 52}" width="${bw}" height="52" fill="url(#foot-${uid})"/>
  <rect x="${bx}" y="${tipY}" width="${bw}" height="${botY - tipY}" fill="url(#gusset-${uid})"/>
  <rect x="${bx}" y="${tipY}" width="${bw}" height="${botY - tipY}" fill="url(#sheen-${uid})"/>
</g>
<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" opacity=".55"/>
</svg>`;
}

/* ---------- emit ---------- */
const IMG = '../../../images/'; // relative to this output dir
const manifest = [];
for (const fl of FLAVORS) {
  const flat = `label-${fl.id}-flat.svg`, pouch = `pouch-${fl.id}.svg`;
  fs.writeFileSync(path.join(OUT, flat), flatLabel(fl, IMG));
  fs.writeFileSync(path.join(OUT, pouch), pouchSVG(fl, IMG));
  manifest.push({
    id: `kadak-colorblock-${fl.id}-flat`,
    name: `${fl.latin} — flat label (KADAK color-block)`,
    concept: `Full-bleed ${fl.id} color field; giant justified Devanagari stack (each line solved to the 404px measure); circular die-cut photo window with hard ink offset shadow; AAJI APPROVED starburst; cream spec block; ink credentials strip.`,
    files: [flat],
  }, {
    id: `kadak-colorblock-${fl.id}-pouch`,
    name: `${fl.latin} — pouch application`,
    concept: `Same artwork applied full-bleed to a crimp-top pouch silhouette: sawtooth crimp, euro-slot seal strip, gusset/sheen shading, grain.`,
    files: [pouch],
  });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('kadak-colorblock: wrote', manifest.length, 'entries');
