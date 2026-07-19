// Seema pack-round2 — print-ready label SVGs with OUTLINED text (fontkit shaping).
// Units: mm. Front panel of a 250 g stand-up pouch: 130 x 200 mm.
// Usage: node makelabels.js <direction d1|d2> <outdir>
const fk = require('fontkit');
const fs = require('fs');
const path = require('path');

const FONTS = path.join(__dirname, 'fonts') + '/';
const mono400 = fk.openSync(FONTS + 'IBMPlexMono-Regular.ttf');
const mono500 = fk.openSync(FONTS + 'IBMPlexMono-Medium.ttf');
const dev = fk.openSync(FONTS + 'IBMPlexSansDevanagari-Regular.ttf');

const frauncesVar = fk.openSync(FONTS + 'Fraunces-var.ttf');
const LOGO = frauncesVar.getVariation({ opsz: 144, wght: 620, SOFT: 0, WONK: 0 });
const SKUFACE = frauncesVar.getVariation({ opsz: 144, wght: 560, SOFT: 0, WONK: 0 });
const SKUFACE_D2 = frauncesVar.getVariation({ opsz: 72, wght: 600, SOFT: 0, WONK: 0 });

// ---- text -> outlined SVG path group -------------------------------------
function measure(font, text, size, ls) {
  const run = font.layout(text);
  const s = size / font.unitsPerEm;
  let w = 0;
  run.positions.forEach((p, i) => { w += p.xAdvance * s; if (i < run.glyphs.length - 1) w += (ls || 0); });
  return w;
}
function textPath(font, text, size, x, y, opts = {}) {
  // x,y = baseline origin. align: 'left'|'center'|'right'. ls = letterspacing in mm.
  const { align = 'left', ls = 0, fill = '#000' } = opts;
  const run = font.layout(text);
  const s = size / font.unitsPerEm;
  const w = measure(font, text, size, ls);
  let pen = x;
  if (align === 'center') pen = x - w / 2;
  if (align === 'right') pen = x - w;
  const parts = [];
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const gx = pen + p.xOffset * s;
    const gy = y - p.yOffset * s;
    const d = g.path.toSVG();
    if (d && d.length > 1) {
      parts.push(`<path transform="translate(${gx.toFixed(3)} ${gy.toFixed(3)}) scale(${s.toFixed(6)} ${(-s).toFixed(6)})" d="${d}"/>`);
    }
    pen += p.xAdvance * s + ls;
  });
  return { svg: `<g fill="${fill}">${parts.join('')}</g>`, width: w };
}
// fit text to a target width, returns chosen size
function fitSize(font, text, targetW, maxSize, ls) {
  const w100 = measure(font, text, 100, 0);
  let size = (targetW / w100) * 100;
  if (ls) { // iterate once for letterspacing
    const w = measure(font, text, size, ls * (size / 10));
    size *= targetW / w;
  }
  return Math.min(size, maxSize || Infinity);
}

// ---- shared bits ----------------------------------------------------------
const CREAM = '#F6EDDD', ROAST = '#2E1F16', KRAFT = '#B9915F';
const SKUS = [
  { id: 'chakli', name: ['Bhajani', 'chakli'], nameOne: 'Bhajani chakli', world: '#F7AE00', worldName: 'turmeric' },
  { id: 'chivda', name: ['Poha', 'chivda'], nameOne: 'Poha chivda', world: '#C8301B', worldName: 'chili' },
  { id: 'lahya', name: ['Lahya', 'crunch bites'], nameOne: 'Lahya crunch bites', world: '#0E7B3D', worldName: 'curry leaf' },
];
const W = 130, H = 200; // mm

function spiralPath(cx, cy, rMax, turns) {
  // Archimedean spiral, the brand seal
  const pts = [];
  const steps = 220;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * 2 * Math.PI;
    const r = rMax * (t / (turns * 2 * Math.PI));
    pts.push([(cx + r * Math.cos(t - Math.PI / 2)).toFixed(2), (cy + r * Math.sin(t - Math.PI / 2)).toFixed(2)]);
  }
  return 'M' + pts.map(p => p.join(',')).join(' L');
}

function svgDoc(inner, comment) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${comment}
     Seema pack-round2 label. Front panel 130 x 200 mm, 250 g stand-up pouch.
     ALL TEXT OUTLINED to paths (Fraunces var + IBM Plex Mono + IBM Plex Sans Devanagari).
     Layer "dieline" (magenta) = cutter guide, do not print. 3 mm bleed included on layer "bleed". -->
<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
${inner}
</svg>`;
}

// ---- D1 LOUD COLOR-BLOCK --------------------------------------------------
function d1(sku) {
  const inner = [];
  // bleed + bg
  inner.push(`<g id="bleed"><rect x="-3" y="-3" width="${W + 6}" height="${H + 6}" fill="${sku.world}"/></g>`);
  const margin = 12, tw = W - margin * 2;

  // logotype
  const logoSize = fitSize(LOGO, 'Seema', 86);
  inner.push(textPath(LOGO, 'Seema', logoSize, W / 2, 40, { align: 'center', fill: CREAM }).svg);
  // Devanagari accent
  inner.push(textPath(dev, 'सीमा', 8.5, W / 2, 51.5, { align: 'center', fill: CREAM }).svg);

  // SKU name stacked huge — both lines the same size, longest line fills the width
  const S = Math.min(fitSize(SKUFACE, sku.name[0], tw), fitSize(SKUFACE, sku.name[1], tw), 30);
  const zoneTop = 58, zoneH = 69;
  const totalH = 0.70 * S + 1.02 * S + 12; // capline1 + line2 + gap + honesty line
  const y1 = zoneTop + (zoneH - totalH) / 2 + 0.70 * S;
  const y2 = y1 + 1.02 * S;
  inner.push(textPath(SKUFACE, sku.name[0], S, W / 2, y1, { align: 'center', fill: CREAM }).svg);
  inner.push(textPath(SKUFACE, sku.name[1], S, W / 2, y2, { align: 'center', fill: CREAM }).svg);

  // honesty line
  inner.push(textPath(mono400, 'no palm oil · no preservatives', 4.1, W / 2, y2 + 9, { align: 'center', fill: CREAM }).svg);

  // window ring (printed cream keyline around the die-cut)
  const wc = { x: W / 2, y: 155, r: 26.5 };
  inner.push(`<circle cx="${wc.x}" cy="${wc.y}" r="${wc.r + 1.6}" fill="none" stroke="${CREAM}" stroke-width="1.1"/>`);

  // footer: net wt
  inner.push(textPath(mono500, '250 g', 4.6, W - margin, H - 7, { align: 'right', fill: CREAM }).svg);
  inner.push(textPath(mono400, 'mother-made · Pune', 3.4, margin, H - 7, { align: 'left', fill: CREAM }).svg);

  // dieline
  inner.push(`<g id="dieline" fill="none" stroke="#FF00FF" stroke-width="0.25">
    <rect x="0" y="0" width="${W}" height="${H}"/>
    <circle cx="${wc.x}" cy="${wc.y}" r="${wc.r}" stroke-dasharray="2 1.4"/>
  </g>`);
  return svgDoc(inner.join('\n'), `D1 LOUD COLOR-BLOCK — ${sku.nameOne} — world ${sku.worldName} ${sku.world}`);
}

// ---- D2 KRAFT HONEST ------------------------------------------------------
function d2(sku) {
  const inner = [];
  inner.push(`<g id="bleed"><rect x="-3" y="-3" width="${W + 6}" height="${H + 6}" fill="${KRAFT}"/></g>`);
  // cream label block
  const lb = { x: 11, y: 14, w: W - 22, h: 118 };
  inner.push(`<rect x="${lb.x}" y="${lb.y}" width="${lb.w}" height="${lb.h}" fill="${CREAM}"/>`);
  const cx = W / 2;
  const logoSize = fitSize(LOGO, 'Seema', 62);
  inner.push(textPath(LOGO, 'Seema', logoSize, cx, 46, { align: 'center', fill: ROAST }).svg);
  inner.push(textPath(dev, 'सीमा', 7, cx, 55.5, { align: 'center', fill: ROAST }).svg);
  inner.push(`<line x1="${lb.x + 12}" y1="62" x2="${lb.x + lb.w - 12}" y2="62" stroke="${ROAST}" stroke-width="0.5"/>`);
  const nameSize = Math.min(fitSize(SKUFACE_D2, sku.nameOne, lb.w - 20), 15);
  inner.push(textPath(SKUFACE_D2, sku.nameOne, nameSize, cx, 78, { align: 'center', fill: ROAST }).svg);
  inner.push(textPath(mono400, 'no palm oil · no preservatives', 3.9, cx, 88, { align: 'center', fill: ROAST }).svg);
  inner.push(textPath(mono400, '250 g', 3.9, cx, 94.5, { align: 'center', fill: ROAST }).svg);
  inner.push(textPath(mono500, 'batch 47 · packed by hand', 3.6, lb.x + 12, 112, { align: 'left', fill: ROAST }).svg);
  inner.push(`<line x1="${lb.x + 12}" y1="114.5" x2="${lb.x + 60}" y2="114.5" stroke="${ROAST}" stroke-width="0.35" stroke-dasharray="0.2 1.1" stroke-linecap="round"/>`);
  // spiral stamp in SKU color
  inner.push(`<g opacity="0.92"><circle cx="${lb.x + lb.w - 20}" cy="112" r="10.5" fill="none" stroke="${sku.world}" stroke-width="0.8"/>
  <path d="${spiralPath(lb.x + lb.w - 20, 112, 7.6, 3.5)}" fill="none" stroke="${sku.world}" stroke-width="1.1" stroke-linecap="round"/></g>`);
  // window
  const wc = { x: cx, y: 163, r: 24 };
  inner.push(`<circle cx="${wc.x}" cy="${wc.y}" r="${wc.r + 1.4}" fill="none" stroke="${CREAM}" stroke-width="1.0"/>`);
  inner.push(textPath(mono400, 'mother-made · Pune', 3.2, cx, H - 6, { align: 'center', fill: ROAST }).svg);
  inner.push(`<g id="dieline" fill="none" stroke="#FF00FF" stroke-width="0.25">
    <rect x="0" y="0" width="${W}" height="${H}"/>
    <circle cx="${wc.x}" cy="${wc.y}" r="${wc.r}" stroke-dasharray="2 1.4"/>
  </g>`);
  return svgDoc(inner.join('\n'), `D2 KRAFT HONEST — ${sku.nameOne} — stamp ${sku.worldName} ${sku.world}`);
}

// ---- main -----------------------------------------------------------------
const direction = process.argv[2] || 'd1';
const outdir = process.argv[3] || 'd:/Claude Code Projects/Cmaa/brand/pack-round2/svg';
fs.mkdirSync(outdir, { recursive: true });
for (const sku of SKUS) {
  const svg = direction === 'd2' ? d2(sku) : d1(sku);
  const f = path.join(outdir, `label-${direction}-${sku.id}.svg`);
  fs.writeFileSync(f, svg);
  console.log('wrote', f, Math.round(svg.length / 1024) + 'KB');
}
