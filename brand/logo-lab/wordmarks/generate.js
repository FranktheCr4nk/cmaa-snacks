/*
 * Cmaa logo lab — FAMILY A: custom wordmarks (A1..A6).
 * All Latin lettering is DRAWN GEOMETRY (variable-width ribbons, arcs, spirals),
 * no font dependency. A3's Devanagari (चमा) is extracted Yatra One (OFL) outlines
 * (see yatra-glyphs.json, produced by the extract script) so the glyphs are
 * exactly right AND font-independent.
 *
 * Emits, per option: <id>-color.svg, <id>-mono.svg (single ink), <id>-rev.svg
 * (cream/gold for dark grounds). ViewBox 800x600, mark auto-fitted + centered.
 *
 * Run: node generate.js
 */
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);
const R = d => (d * Math.PI) / 180;

/* ---------------- palette ---------------- */
const INK = '#33241A', CREAM = '#F6EDDB', GOLD = '#C8922A', PAPER = '#F1E4CB';
const BHAJANI = '#7A1E2B', TERRA = '#B5512E', CHILI = '#C2331F', HALDI = '#E3A72F';
const LEAF = '#3E7C43', GOLD_DK = '#8F5E20';

/* ---------------- geometry kit ---------------- */

// closed outline from centerline samples [{x,y,tx,ty,w}] (tx,ty = unit tangent)
function ribbon(samples) {
  const up = [], dn = [];
  for (const s of samples) {
    const nx = -s.ty, ny = s.tx;
    up.push([F(s.x + (nx * s.w) / 2), F(s.y + (ny * s.w) / 2)]);
    dn.push([F(s.x - (nx * s.w) / 2), F(s.y - (ny * s.w) / 2)]);
  }
  dn.reverse();
  return 'M' + up.map(p => p.join(' ')).join(' L ') + ' L ' + dn.map(p => p.join(' ')).join(' L ') + ' Z';
}

// ribbon from a bare polyline: tangents via central differences, width per t
function ribbonFromPts(pts, wFn) {
  const s = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    s.push({ x: pts[i][0], y: pts[i][1], tx, ty, w: wFn(i / (pts.length - 1)) });
  }
  return ribbon(s);
}

// sample a cubic bezier as points
function bezPts(p0, p1, p2, p3, steps = 16) {
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

// elliptical arc samples with per-point width function wFn(t, angle)
function arcVar(cx, cy, rx, ry, a0, a1, wFn, steps = 72) {
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = a0 + (a1 - a0) * t;
    const dir = a1 > a0 ? 1 : -1;
    let tx = -rx * Math.sin(a) * dir, ty = ry * Math.cos(a) * dir;
    const L = Math.hypot(tx, ty); tx /= L; ty /= L;
    out.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), tx, ty, w: wFn(t, a) });
  }
  return out;
}

function lineVar(x0, y0, x1, y1, w0, w1, steps = 10) {
  const out = [], L = Math.hypot(x1 - x0, y1 - y0), tx = (x1 - x0) / L, ty = (y1 - y0) / L;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, tx, ty, w: w0 + (w1 - w0) * t });
  }
  return out;
}

// closed variable-width ring (for bowls): two concentric outlines, evenodd fill
function ringVar(cx, cy, rx, ry, wFn, steps = 96) {
  const outer = [], inner = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = t * 2 * Math.PI;
    // true outward normal of the ellipse
    let nx = Math.cos(a) / rx, ny = Math.sin(a) / ry;
    const L = Math.hypot(nx, ny); nx /= L; ny /= L;
    const w = wFn(t, a), x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    outer.push([F(x + (nx * w) / 2), F(y + (ny * w) / 2)]);
    inner.push([F(x - (nx * w) / 2), F(y - (ny * w) / 2)]);
  }
  inner.reverse();
  return 'M' + outer.map(p => p.join(' ')).join(' L ') + ' Z M' + inner.map(p => p.join(' ')).join(' L ') + ' Z';
}

const circle = (cx, cy, r) =>
  `M${F(cx - r)} ${F(cy)} a${F(r)} ${F(r)} 0 1 0 ${F(2 * r)} 0 a${F(r)} ${F(r)} 0 1 0 ${F(-2 * r)} 0 Z`;

const poly = pts => 'M' + pts.map(p => p.map(F).join(' ')).join(' L ') + ' Z';

// Archimedean spiral polyline; a0 = start angle of the OUTER end, dir=-1 => screen-CCW inward
function spiralPts(cx, cy, rOuter, rInner, turns, a0, dir = -1, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + dir * t * turns * 2 * Math.PI;
    const r = rOuter + (rInner - rOuter) * t;
    pts.push([F(cx + r * Math.cos(a)), F(cy + r * Math.sin(a))]);
  }
  return pts;
}
const ptsPath = pts => 'M' + pts.map(p => p.join(' ')).join(' L ');

// sesame seed: pointed top, round bottom. len = full length, wd = full width
function sesamePath(cx, cy, len, wd, rotDeg) {
  const h = len / 2, w = wd / 2;
  const d = `M0 ${F(-h)} C${F(w * 0.63)} ${F(-h * 0.76)} ${F(w)} ${F(-h * 0.29)} ${F(w)} ${F(h * 0.12)}` +
    ` C${F(w)} ${F(h * 0.65)} ${F(w * 0.53)} ${F(h)} 0 ${F(h)}` +
    ` C${F(-w * 0.53)} ${F(h)} ${F(-w)} ${F(h * 0.65)} ${F(-w)} ${F(h * 0.12)}` +
    ` C${F(-w)} ${F(-h * 0.29)} ${F(-w * 0.63)} ${F(-h * 0.76)} 0 ${F(-h)} Z`;
  return { d, transform: `translate(${F(cx)} ${F(cy)}) rotate(${rotDeg})` };
}

/* ============================================================
 * A1 — HERITAGE CONTRAST (filled high-contrast serif, spiral counter)
 * ============================================================ */
function buildA1(pal) {
  const hair = 8, thick = 27;
  const wContrast = mult => (t, a) => hair + (thick * mult - hair) * Math.pow(Math.abs(Math.cos(a)), 1.32);
  let d = [];   // letter paths (fill pal.letters)

  /* --- C: cap-height, opening right, ball terminals --- */
  const Ccx = 72, Ccy = -74, Crx = 63, Cry = 73;
  const taper = w => (t, a) => {
    let v = w(t, a);
    if (t < 0.10) v *= 0.5 + 0.5 * (t / 0.10);
    if (t > 0.90) v *= 0.5 + 0.5 * ((1 - t) / 0.10);
    return v;
  };
  d.push(ribbon(arcVar(Ccx, Ccy, Crx, Cry, R(-35), R(-325), taper(wContrast(1.28)), 96)));
  // ball terminals
  const bt = a => [Ccx + Crx * Math.cos(R(a)), Ccy + Cry * Math.sin(R(a))];
  const [t1x, t1y] = bt(-35), [t2x, t2y] = bt(-325);
  d.push(circle(t1x - 1, t1y + 1.5, 13.5));
  d.push(circle(t2x - 1, t2y - 1.5, 13));

  // spiral counter (the chakli) — separate paint (pal.spiral), stroked
  const spiral = ptsPath(spiralPts(Ccx, Ccy, 27, 3, 2.2, R(18), -1));

  /* --- m --- */
  const mx = 180; // left stem centerline
  const pitch = 60, mw = 26;
  const stems = [mx, mx + pitch, mx + 2 * pitch];
  d.push(ribbon(lineVar(stems[0], -102, stems[0], 0, mw, mw)));
  d.push(poly([[stems[0] - 13, -102], [stems[0] - 29, -102], [stems[0] - 13, -80]])); // entry flag
  const wArch = (t) => hair + (thick - 1 - hair) * Math.pow(t, 1.9);
  for (let i = 0; i < 2; i++) {
    d.push(ribbon(arcVar(stems[i] + pitch / 2, -58, pitch / 2, 44, R(180), R(360), wArch, 64)));
    d.push(ribbon(lineVar(stems[i + 1], -63, stems[i + 1], 0, mw, mw))); // overlap arch end: no seam
  }
  const foot = cx => poly([[cx - 23, 0], [cx + 23, 0], [cx + 13, -9], [cx - 13, -9]]);
  stems.forEach(s => d.push(foot(s)));

  /* --- a ×2 (single-storey) --- */
  const aGeom = bx => {
    const parts = [];
    parts.push(ringVar(bx, -51, 36, 50, wContrast(0.96)));
    parts.push(ribbon(lineVar(bx + 36, -101, bx + 36, 0, mw, mw)));
    parts.push(foot(bx + 36));
    return parts;
  };
  const a1x = 383, a2x = 502;
  d.push(...aGeom(a1x), ...aGeom(a2x));

  /* --- sesame period --- */
  const seed = sesamePath(a2x + 76, -19, 40, 22, -24);

  const body = `
  <g fill="${pal.letters}">${d.map(p => `<path d="${p}" fill-rule="evenodd"/>`).join('')}</g>
  <path d="${spiral}" fill="none" stroke="${pal.spiral}" stroke-width="7" stroke-linecap="round"/>
  <g transform="${seed.transform}"><path d="${seed.d}" fill="${pal.seed}"/>${pal.crease ? `<path d="M0 -14 C1.8 -6 1.8 6 0 14" fill="none" stroke="${pal.crease}" stroke-width="2.2" stroke-linecap="round"/>` : ''}</g>`;
  return { body, bbox: [-14, -152, 600, 8] };
}

/* ============================================================
 * A2 — SOFT ROUNDHAND (monoline rounded lowercase + curry-leaf swash)
 * ============================================================ */
function buildA2(pal) {
  const sw = 30;
  const P = [];   // [d, extraAttrs] main letter strokes

  // c : open circle
  P.push(ptsPath(spiralPts(0, -50, 42, 42, 0.767, R(-42), -1, 60)));

  // m : stems + arches, one flowing path
  const mx = 85, pitch = 62;
  let m = `M${mx} -15 L${mx} -85 M${mx} -60`;
  m += ` A31 31 0 0 1 ${mx + pitch} -60 L${mx + pitch} -15 M${mx + pitch} -60`;
  m += ` A31 31 0 0 1 ${mx + 2 * pitch} -60 L${mx + 2 * pitch} -15`;
  P.push(m);

  // a1 : bowl + stem + exit tail that becomes the swash
  const ba = 305;
  P.push(circle(ba, -50, 42));
  const bb = ba + 140; // a2 bowl center
  P.push(`M${ba + 42} -85 L${ba + 42} -22 A18 18 0 0 0 ${ba + 60} -4`);

  // a2 : bowl + stem + closing tail
  P.push(circle(bb, -50, 42));
  P.push(`M${bb + 42} -85 L${bb + 42} -22 A18 18 0 0 0 ${bb + 60} -4`);

  // the tie: a THIN overhead swash linking a1's stem top to a2's bowl shoulder
  // (roundhand ligature — leaves the inter-a gap open, no phantom letterform)
  const tie = `M${ba + 42} -86 C${F(ba + 56)} -114 ${F(ba + 82)} -124 ${F(ba + 96)} -122` +
    ` C${F(bb - 56)} -117 ${F(bb - 32)} -100 ${F(bb - 27.5)} -83`;

  // curry leaf sprouting from the tie's crest, in open sky above the x-height
  const sx = ba + 90;
  const sprig = `M${sx} -121 L${F(sx - 2)} -130`;
  const leafAt = `translate(${F(sx - 2)} -131) rotate(-32)`;
  // curved lanceolate leaf, midrib as negative space (reads as a leaf even in mono)
  const leafMid = [[0, 0], [2, -16], [-5, -30]];
  const midPts = bezPts([leafMid[0][0], leafMid[0][1]], [leafMid[1][0], leafMid[1][1]], [leafMid[1][0], leafMid[1][1]], [leafMid[2][0], leafMid[2][1]], 20);
  const halves = [[], []];
  for (let i = 0; i < midPts.length; i++) {
    const a = midPts[Math.max(0, i - 1)], b = midPts[Math.min(midPts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const nx = -ty, ny = tx, t = i / (midPts.length - 1);
    const w = 7.4 * Math.pow(Math.sin(Math.PI * t), 0.85), g = Math.min(w, 1.1);
    halves[0].push([[midPts[i][0] + nx * g, midPts[i][1] + ny * g], [midPts[i][0] + nx * w, midPts[i][1] + ny * w]]);
    halves[1].push([[midPts[i][0] - nx * g, midPts[i][1] - ny * g], [midPts[i][0] - nx * w, midPts[i][1] - ny * w]]);
  }
  const leafPaths = halves.map(h => poly([...h.map(p => p[0]), ...h.map(p => p[1]).reverse()]));

  // sesame tittle — floats beside the leaf
  const seed = sesamePath(ba + 120, -138, 22, 12, 42);

  const body = `
  <g fill="none" stroke="${pal.letters}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    ${P.map(d => `<path d="${d}"/>`).join('')}
  </g>
  <path d="${tie}" fill="none" stroke="${pal.letters}" stroke-width="11" stroke-linecap="round"/>
  <path d="${sprig}" fill="none" stroke="${pal.sprig}" stroke-width="6.5" stroke-linecap="round"/>
  <g transform="${leafAt}" fill="${pal.leaf}">${leafPaths.map(p => `<path d="${p}"/>`).join('')}</g>
  <g transform="${seed.transform}"><path d="${seed.d}" fill="${pal.seedFill}"/></g>`;
  return { body, bbox: [-58, -168, bb + 76, 12] };
}

/* ============================================================
 * shared stroke-skeleton CAPS (C M A) for A3 / A4 / A5
 * each letter -> array of segments {type:'arc',...}|{type:'line', pts:[...]}
 * ============================================================ */
function capC(h, sw) {
  const r = (h - sw) / 2;
  return { segs: [{ type: 'arc', cx: r, cy: -h / 2, r, a0: -35, a1: -325 }], w: r + r * Math.cos(R(35)) };
}
function capM(h, sw) {
  const w = h * 0.84, vTop = -h + sw / 2, vBot = -sw / 2, midY = -h + h * 0.56;
  return {
    segs: [
      { type: 'line', pts: [[0, vTop], [0, vBot]] },
      { type: 'line', pts: [[w, vTop], [w, vBot]] },
      { type: 'line', pts: [[sw * 0.12, vTop], [w / 2, midY]] },
      { type: 'line', pts: [[w - sw * 0.12, vTop], [w / 2, midY]] },
    ], w
  };
}
function capA(h, sw) {
  const w = h * 0.72, apex = [w / 2, -h + sw / 2], bl = [0, -sw / 2], br = [w, -sw / 2];
  const byY = -h * 0.34; // crossbar center y
  const t = (byY - apex[1]) / (bl[1] - apex[1]);
  const lx = apex[0] + (bl[0] - apex[0]) * t, rx = apex[0] + (br[0] - apex[0]) * t;
  return {
    segs: [
      { type: 'line', pts: [[apex[0], apex[1]], [bl[0], bl[1]]] },
      { type: 'line', pts: [[apex[0], apex[1]], [br[0], br[1]]] },
      { type: 'line', pts: [[lx + sw * 0.18, byY], [rx - sw * 0.18, byY]] },
    ], w, apex, byY
  };
}
function segPath(s, trim = 0) {
  if (s.type === 'arc') {
    const span = s.a1 - s.a0, a0 = s.a0 + span * trim, a1 = s.a1 - span * trim;
    const p = t => [F(s.cx + s.r * Math.cos(R(a0 + (a1 - a0) * t))), F(s.cy + s.r * Math.sin(R(a0 + (a1 - a0) * t)))];
    // polyline the arc (exact + simple)
    const pts = []; for (let i = 0; i <= 48; i++) pts.push(p(i / 48));
    return ptsPath(pts);
  }
  const [[x0, y0], [x1, y1]] = s.pts;
  const xa = x0 + (x1 - x0) * trim, ya = y0 + (y1 - y0) * trim;
  const xb = x1 - (x1 - x0) * trim, yb = y1 - (y1 - y0) * trim;
  return `M${F(xa)} ${F(ya)} L${F(xb)} ${F(yb)}`;
}
const letterPath = (L, trim = 0) => L.segs.map(s => segPath(s, trim)).join(' ');

/* ============================================================
 * A3 — BILINGUAL TWIN (CMAA over चमा, shared shirorekha bar)
 * ============================================================ */
function buildA3(pal) {
  const glyphs = JSON.parse(fs.readFileSync(path.join(OUT, 'yatra-glyphs.json'), 'utf8'));
  // Devanagari: ink bbox x -70..1715 (w 1785), headline y -619..-523, body to +56
  const DEVW = 560, k = DEVW / 1785;
  const devTx = 70 * k, devTy = 619 * k;              // headline top -> y=0
  const barH = 96 * k;                                 // match glyph headline thickness
  const barX0 = -16, barX1 = DEVW + 16;

  // Latin CMAA — bold monoline caps, butt ends, tracked wide, baseline = bar top
  const capH = 88, sw = 18, gapY = 9;                  // gapY: air between letters & bar
  const Ls = [capC(capH, sw), capM(capH, sw), capA(capH, sw), capA(capH, sw)];
  const sumW = Ls.reduce((s, L) => s + L.w + sw, 0);
  const targetW = 470;
  const track = (targetW - sumW) / (Ls.length - 1);
  let cursor = (DEVW - targetW) / 2 + sw / 2;
  let latin = '';
  for (const L of Ls) {
    latin += `<path d="${letterPath(L)}" transform="translate(${F(cursor)} ${-gapY})" fill="none" stroke="${pal.latin}" stroke-width="${sw}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
    cursor += L.w + sw + track;
  }

  const body = `
  ${latin}
  <rect x="${barX0}" y="0" width="${F(barX1 - barX0)}" height="${F(barH)}" fill="${pal.dev}"/>
  <g transform="translate(${F(devTx)} ${F(devTy)}) scale(${F(k)})">
    <path d="${glyphs.string.d}" fill="${pal.dev}"/>
  </g>`;
  return { body, bbox: [-16, -capH - 10 - 8, DEVW + 16, (56 + 619) * k + 4] };
}

/* ============================================================
 * A4 — SIGNBOARD PAINTER (fat brush caps, inline, hard shadow, bounce)
 * ============================================================ */
function buildA4(pal, uid) {
  const capH = 130, sw = 34, inW = 9, gap = 30, off = 8;
  const Ls = [capC(capH, sw), capM(capH, sw), capA(capH, sw), capA(capH, sw)];
  const dy = [4, -6, 3, -5], rot = [-3, 2, -2, 2.5];
  let x = sw / 2;
  const place = [];
  for (let i = 0; i < Ls.length; i++) { place.push({ L: Ls[i], x, i }); x += Ls[i].w + sw + gap; }
  const totW = x - gap;

  const tf = p => {
    const cx = p.L.w / 2, cy = -capH / 2;
    return `translate(${F(p.x)} ${dy[p.i]}) rotate(${rot[p.i]} ${F(cx)} ${F(cy)})`;
  };
  const strokes = (color, w, trim = 0, extra = '') =>
    place.map(p => `<path d="${letterPath(p.L, trim)}" transform="${tf(p)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`).join('');

  let body;
  if (pal.mode === 'mono') {
    // single-ink: shadow separated from body by a transparent halo (mask),
    // inline carved out of the body (mask) — still exactly one paint.
    body = `
    <defs>
      <mask id="shadowM-${uid}">
        <g transform="translate(${off} ${off})">${strokes('#fff', sw)}</g>
        ${strokes('#000', sw + 13)}
      </mask>
      <mask id="bodyM-${uid}">
        ${strokes('#fff', sw)}
        ${strokes('#000', inW, 0.14)}
      </mask>
    </defs>
    <rect x="-40" y="-190" width="${F(totW + 100)}" height="240" fill="${pal.ink}" mask="url(#shadowM-${uid})"/>
    <rect x="-40" y="-190" width="${F(totW + 100)}" height="240" fill="${pal.ink}" mask="url(#bodyM-${uid})"/>`;
  } else {
    body = `
    <g transform="translate(${off} ${off})">${strokes(pal.shadow, sw)}</g>
    ${strokes(pal.body, sw)}
    ${strokes(pal.inline, inW, 0.14)}`;
  }
  return { body, bbox: [-sw / 2 - 4, -capH - sw / 2 - 8, totW + off + 6, sw / 2 + off + 8] };
}

/* ============================================================
 * A5 — DABBA STENCIL (butt-cut bridged letters + rivets)
 * ============================================================ */
function buildA5(pal, uid) {
  const capH = 120, sw = 28, gap = 34;
  const bridgeDeg = 11;

  // C with two bridges (top & bottom)
  const r = (capH - sw) / 2, cc = { x: r, y: -capH / 2 };
  const cSegs = [
    { type: 'arc', cx: cc.x, cy: cc.y, r, a0: -35, a1: -90 + bridgeDeg },
    { type: 'arc', cx: cc.x, cy: cc.y, r, a0: -90 - bridgeDeg, a1: -270 + bridgeDeg },
    { type: 'arc', cx: cc.x, cy: cc.y, r, a0: -270 - bridgeDeg, a1: -325 },
  ];
  const cW = r + r * Math.cos(R(35));

  // M: solid verticals, floating diagonals
  const mw = capH * 0.86, midY = -capH + capH * 0.56;
  const trimLine = (p0, p1, t0, t1) => ({
    type: 'line', pts: [
      [p0[0] + (p1[0] - p0[0]) * t0, p0[1] + (p1[1] - p0[1]) * t0],
      [p0[0] + (p1[0] - p0[0]) * t1, p0[1] + (p1[1] - p0[1]) * t1]]
  });
  const mSegs = [
    { type: 'line', pts: [[0, -capH], [0, 0]] },
    { type: 'line', pts: [[mw, -capH], [mw, 0]] },
    trimLine([2, -capH + sw * 0.4], [mw / 2, midY], 0.12, 1),
    trimLine([mw - 2, -capH + sw * 0.4], [mw / 2, midY], 0.12, 0.99),
  ];

  // A: joined apex, floating crossbar
  const aw = capH * 0.78, apex = [aw / 2, -capH + sw * 0.55], byY = -capH * 0.33;
  const tA = (byY - apex[1]) / (0 - apex[1]);
  const lx = apex[0] * (1 - tA), rx = apex[0] + (aw - apex[0]) * tA;
  const aSegs = [
    { type: 'line', pts: [[apex[0] - sw * 0.28, apex[1]], [0, 0]] },
    { type: 'line', pts: [[apex[0] + sw * 0.28, apex[1]], [aw, 0]] },
    trimLine([lx, byY], [rx, byY], 0.13, 0.87),
  ];

  const letters = [
    { segs: cSegs, w: cW },
    { segs: mSegs, w: mw },
    { segs: aSegs, w: aw },
    { segs: aSegs, w: aw },
  ];

  // rivets sit in the gaps between letters — a punched seam, not inside counters
  let x = sw / 2, paths = '', rivets = [];
  for (let i = 0; i < letters.length; i++) {
    const L = letters[i];
    paths += `<g transform="translate(${F(x)} 0)">` +
      L.segs.map(s => `<path d="${segPath(s)}" fill="none" stroke="${pal.letters}" stroke-width="${sw}" stroke-linecap="butt" stroke-linejoin="miter"/>`).join('') + '</g>';
    x += L.w + sw + gap;
  }
  const totW = x - gap;
  // rivet seam UNDER the wordmark — the rolled, riveted edge of a steel dabba
  const nR = 7, seamY = 22, x0R = totW * 0.04, x1R = totW * 0.96;
  for (let i = 0; i < nR; i++) rivets.push([x0R + ((x1R - x0R) * i) / (nR - 1), seamY]);

  const rivet = ([cx, cy]) => pal.mode === 'mono'
    ? `<path d="${circle(cx, cy, 4.6)}" fill="${pal.rivet}"/>`
    : `<g><path d="${circle(cx, cy, 4.8)}" fill="${pal.rivet}" ${pal.rivetRim ? `stroke="${pal.rivetRim}" stroke-width="1.4"` : ''}/>` +
    (pal.rivetHi ? `<path d="M${F(cx - 2.6)} ${F(cy - 1.2)} a3.2 3.2 0 0 1 2 -2.2" fill="none" stroke="${pal.rivetHi}" stroke-width="1.5" stroke-linecap="round"/>` : '') + '</g>';

  const body = paths + rivets.map(rivet).join('');
  return { body, bbox: [-sw / 2 - 4, -capH - sw / 2 - 4, totW + 4, 32] };
}

/* ============================================================
 * A6 — SPIRAL LIGATURE (minimal monoline, final a coils into a chakli)
 * ============================================================ */
function buildA6(pal) {
  const sw = 12;
  const ink = [];

  // c
  ink.push(ptsPath(spiralPts(0, -50, 44, 44, 0.778, R(-40), -1, 60)));

  // m  (ink gaps between letters evened to ~34)
  const mx = 80, pitch = 56;
  let m = `M${mx} -6 L${mx} -94 M${mx} -60 A28 28 0 0 1 ${mx + pitch} -60 L${mx + pitch} -6`;
  m += ` M${mx + pitch} -60 A28 28 0 0 1 ${mx + 2 * pitch} -60 L${mx + 2 * pitch} -6`;
  ink.push(m);

  // a1 : bowl + plain stem
  const ba = 280;
  ink.push(circle(ba, -50, 42));
  ink.push(`M${ba + 42} -94 L${ba + 42} -6`);

  // a2 : stem flows into an Archimedean spiral bowl (the chakli),
  // built as ONE tapering ribbon (12 -> 7) so the coils keep clear air between turns
  const sc = ba + 130;             // spiral (bowl) center
  const bs = sc + 42;              // stem x
  const spiralStart = R(58), turns = 1.75, rOut = 42, rIn = 10;
  const p0 = [sc + rOut * Math.cos(spiralStart), -50 + rOut * Math.sin(spiralStart)];
  const stemPts = [];
  for (let i = 0; i <= 12; i++) stemPts.push([bs, -94 + (68 * i) / 12]); // to -26
  const bridge = bezPts([bs, -26], [bs, -9], [sc + 35, -6], p0, 14).slice(1);
  const coil = spiralPts(sc, -50, rOut, rIn, turns, spiralStart, -1, 220).slice(1);
  const allPts = [...stemPts, ...bridge, ...coil];
  const nStem = stemPts.length + bridge.length;
  const wFn = t => {
    const i = t * (allPts.length - 1);
    if (i <= nStem) return sw;
    return sw - (sw - 7) * ((i - nStem) / (allPts.length - 1 - nStem));
  };
  const a2 = ribbonFromPts(allPts, wFn);
  const capTop = circle(bs, -94, sw / 2);
  const inner = coil[coil.length - 1];
  const capIn = circle(inner[0], inner[1], 3.5);

  const body = `
  <g fill="none" stroke="${pal.letters}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    ${ink.map(d => `<path d="${d}"/>`).join('')}
  </g>
  <g fill="${pal.spiral}"><path d="${a2}"/><path d="${capTop}"/><path d="${capIn}"/></g>`;
  return { body, bbox: [-52, -104, bs + 8, 2] };
}

/* ---------------- variants & emit ---------------- */

const OPTIONS = [
  {
    id: 'A1', name: 'Heritage Contrast', build: buildA1,
    concept: "High-contrast serif Cmaa drawn as variable-width ribbon geometry; the C's counter is a gold chakli spiral, a gold sesame seed sets the period.",
    pal: {
      color: { letters: BHAJANI, spiral: GOLD, seed: GOLD, crease: CREAM },
      mono: { letters: INK, spiral: INK, seed: INK },
      rev: { letters: CREAM, spiral: GOLD, seed: GOLD },
    }
  },
  {
    id: 'A2', name: 'Soft Roundhand', build: buildA2,
    concept: 'Warm rounded monoline lowercase; the two a\'s link with a swash that sprouts a curry leaf, sesame-seed tittle floats above.',
    pal: {
      color: { letters: TERRA, sprig: LEAF, leaf: LEAF, midrib: CREAM, seedFill: GOLD },
      mono: { letters: INK, sprig: INK, leaf: INK, seedFill: INK },
      rev: { letters: CREAM, sprig: GOLD, leaf: GOLD, seedFill: GOLD },
    }
  },
  {
    id: 'A3', name: 'Bilingual Twin', build: buildA3,
    concept: 'CMAA locked over चमा (real Yatra One outlines); the drawn shirorekha doubles as the Latin underline — one shared bar, Devanagari as hero.',
    pal: {
      color: { latin: INK, dev: BHAJANI },
      mono: { latin: INK, dev: INK },
      rev: { latin: GOLD, dev: CREAM },
    }
  },
  {
    id: 'A4', name: 'Signboard Painter', build: buildA4,
    concept: 'Pune storefront hand-paint: fat bouncing brush caps, haldi inline stripe, hard ink drop-shadow — KADAK energy.',
    pal: {
      color: { body: CHILI, inline: HALDI, shadow: INK },
      mono: { mode: 'mono', ink: INK },
      rev: { body: CREAM, inline: GOLD, shadow: GOLD },
    }
  },
  {
    id: 'A5', name: 'Dabba Stencil', build: buildA5,
    concept: 'Stencil-cut caps as if punched on a steel tiffin — butt-cut bridges, brass rivet dots; industrial-warm.',
    pal: {
      color: { letters: TERRA, rivet: GOLD, rivetRim: GOLD_DK, rivetHi: CREAM },
      mono: { mode: 'mono', letters: INK, rivet: INK },
      rev: { letters: CREAM, rivet: GOLD },
    }
  },
  {
    id: 'A6', name: 'Spiral Ligature', build: buildA6,
    concept: 'Minimal monoline cmaa; the final a resolves into a continuous tapering Archimedean spiral — one-stroke chakli ligature.',
    pal: {
      color: { letters: INK, spiral: BHAJANI },
      mono: { letters: INK, spiral: INK },
      rev: { letters: CREAM, spiral: GOLD },
    }
  },
];

function emit(opt, variant) {
  const uid = `${opt.id}-${variant}`;
  const { body, bbox } = opt.build(opt.pal[variant], uid);
  const [x0, y0, x1, y1] = bbox, w = x1 - x0, h = y1 - y0;
  const s = Math.min(640 / w, 400 / h);
  const tx = 400 - (s * (x0 + x1)) / 2, ty = 300 - (s * (y0 + y1)) / 2;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Cmaa">
<title>Cmaa — ${opt.name} (${variant})</title>
<g transform="translate(${F(tx)} ${F(ty)}) scale(${F(s)})">${body}
</g>
</svg>`;
  const file = `${opt.id}-${variant}.svg`;
  fs.writeFileSync(path.join(OUT, file), svg);
  return file;
}

const manifest = [];
for (const opt of OPTIONS) {
  const files = ['color', 'mono', 'rev'].map(v => emit(opt, v));
  manifest.push({ id: opt.id, name: opt.name, concept: opt.concept, files: files.map(f => `brand/logo-lab/wordmarks/${f}`) });
  console.log(opt.id, opt.name, '->', files.join(', '));
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('manifest.json written,', manifest.length, 'options');
