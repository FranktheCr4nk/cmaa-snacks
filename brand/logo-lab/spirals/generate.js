// Cmaa logo lab — FAMILY B: SPIRAL MARKS (B1..B6)
// The chakli spiral as ownable symbol. 6 options x 3 variants (color / mono / rev).
// ALL geometry is computed (Archimedean spirals, arc-length tables, normal offsets,
// rotational symmetry) — no hand-typed coordinates.
//
// Run:  node "d:/Claude Code Projects/Cmaa/brand/logo-lab/spirals/generate.js"

const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);
const TAU = Math.PI * 2;
const smooth = t => t * t * (3 - 2 * t); // smoothstep

/* ---------------- palette ---------------- */
const INK = '#33241A';        // mono ink
const CREAM = '#F6EDDB';      // rev light
const GOLD = '#C8922A';       // zari gold (light grounds)
const GOLD_LUXE = '#D4A23C';  // luxe gold (dark grounds)
const MAROON = '#7A1E2B';     // bhajani maroon = master brand color
const TERRA = '#B5512E';      // terracotta

const VB = 240, C = VB / 2;   // square canvas, mark centered

/* ---------------- color math ---------------- */
function hexLerp(h1, h2, t) {
  const a = h1.match(/\w\w/g).map(x => parseInt(x, 16));
  const b = h2.match(/\w\w/g).map(x => parseInt(x, 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/* ---------------- spiral sampling (with tangents, normals, arc-length) ---------------- */
// Archimedean spiral r(t) = r0 + (r1-r0)t, theta(t) = theta0 + t*turns*TAU.
// Returns dense samples with unit tangent (tx,ty) and OUTWARD unit normal (nx,ny).
function sampleSpiral({ cx, cy, r0, r1, turns, theta0 = -Math.PI / 2, steps = 900 }) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const th = theta0 + t * turns * TAU;
    const r = r0 + (r1 - r0) * t;
    const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
    const dr = r1 - r0, dth = turns * TAU;
    const dx = dr * Math.cos(th) - r * Math.sin(th) * dth;
    const dy = dr * Math.sin(th) + r * Math.cos(th) * dth;
    const m = Math.hypot(dx, dy) || 1;
    // n = (dy,-dx)/m points OUTWARD (n . radial = +r*dth/m)
    pts.push({ t, th, r, x, y, tx: dx / m, ty: dy / m, nx: dy / m, ny: -dx / m });
  }
  let s = 0; pts[0].s = 0;
  for (let i = 1; i < pts.length; i++) {
    s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    pts[i].s = s;
  }
  return pts;
}
// nearest sample at arc length s (dense sampling => sub-pixel accuracy)
function atArc(pts, s) {
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; (pts[mid].s < s) ? lo = mid : hi = mid; }
  return (s - pts[lo].s < pts[hi].s - s) ? pts[lo] : pts[hi];
}

/* ---------------- tapered ribbon spiral (TRUE taper via normal offsets) ---------------- */
// Emits a single closed filled path: outer edge forward, round cap, inner edge back, round cap.
function taperedSpiralPath(spec, widthFn) {
  const pts = sampleSpiral(spec);
  const outer = pts.map(p => [F(p.x + p.nx * widthFn(p.t) / 2), F(p.y + p.ny * widthFn(p.t) / 2)]);
  const inner = pts.map(p => [F(p.x - p.nx * widthFn(p.t) / 2), F(p.y - p.ny * widthFn(p.t) / 2)]);
  const wEnd = widthFn(1) / 2, wStart = Math.max(widthFn(0) / 2, 0.1);
  let d = 'M' + outer.map(p => p.join(' ')).join(' L');
  d += ` A${F(wEnd)} ${F(wEnd)} 0 0 1 ${inner[inner.length - 1].join(' ')}`;   // outer round cap
  d += ' L' + inner.slice(0, -1).reverse().map(p => p.join(' ')).join(' L');
  d += ` A${F(wStart)} ${F(wStart)} 0 0 1 ${outer[0].join(' ')} Z`;            // inner round cap
  return d;
}

// ridge grooves: ticks across the rope at EQUAL ARC-LENGTH spacing (like real chakli ridges);
// meant to be drawn black inside a mask so they cut transparent notches.
function spiralGrooves(spec, widthFn, { spacing = 9, tMin = 0.1, tMax = 0.96, frac = 0.62 } = {}) {
  const pts = sampleSpiral(spec);
  const total = pts[pts.length - 1].s;
  let d = '';
  for (let s = spacing; s < total; s += spacing) {
    const p = atArc(pts, s);
    if (p.t < tMin || p.t > tMax) continue;
    const L = widthFn(p.t) * frac;
    d += `M${F(p.x - p.nx * L / 2)} ${F(p.y - p.ny * L / 2)} L${F(p.x + p.nx * L / 2)} ${F(p.y + p.ny * L / 2)}`;
  }
  return d;
}

// plain spiral polyline (optionally with break-gaps at given t positions — fingerprint ridge endings)
function spiralPolyline(spec, { breaks = [], gapLen = 6 } = {}) {
  const pts = sampleSpiral(spec);
  const gaps = breaks.map(tb => {
    // convert t position to arc-length window
    const target = pts.reduce((best, p) => Math.abs(p.t - tb) < Math.abs(best.t - tb) ? p : best, pts[0]);
    return [target.s - gapLen / 2, target.s + gapLen / 2];
  });
  let d = '', pen = false;
  for (const p of pts) {
    const inGap = gaps.some(([a, b]) => p.s >= a && p.s <= b);
    if (inGap) { pen = false; continue; }
    d += (pen ? ' L' : ' M') + `${F(p.x)} ${F(p.y)}`;
    pen = true;
  }
  return d.trim();
}

/* ---------------- svg wrapper ---------------- */
const svg = (inner, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}" role="img" aria-label="${title}">\n${inner}\n</svg>`;

/* =====================================================================
   B1 — PURE COIL
   Mathematically perfect Archimedean spiral as a tapered ribbon (thin at
   the centre where the dough starts, full rope width outward), ridge
   grooves at equal arc spacing cut through via mask — a chakli, exactly.
===================================================================== */
function b1({ coil }, uid) {
  const wMax = 14;
  const spec = { cx: C, cy: C, r0: 3, r1: 79, turns: 3.1, theta0: 0.05 * Math.PI };
  const wf = t => t < 0.3 ? 2 + (wMax - 2) * smooth(t / 0.3) : wMax;
  const ribbon = taperedSpiralPath(spec, wf);
  const grooves = spiralGrooves(spec, wf, { spacing: 10.4, frac: 0.55 });
  return `<defs><mask id="g-${uid}"><rect width="${VB}" height="${VB}" fill="#fff"/><path d="${grooves}" stroke="#000" stroke-width="2.1" stroke-linecap="round" fill="none"/></mask></defs>
<path d="${ribbon}" fill="${coil}" mask="url(#g-${uid})"/>`;
}

/* =====================================================================
   B2 — KUYRI TILE
   45-degree Paithani zari tile; spiral, hairline diamond and four zari
   dots are DIE-CUT (knocked out) or gold-inlaid. Reads as an app icon.
===================================================================== */
function b2({ field, spiral }, uid) {
  const D = 96, Dh = 82, dotD = 66, dotR = 2.9;
  const dia = d => `M${C} ${C - d} L${C + d} ${C} L${C} ${C + d} L${C - d} ${C} Z`;
  const spec = { cx: C, cy: C, r0: 2.5, r1: 48, turns: 2.7, theta0: -0.9 * Math.PI };
  const wMax = 9.8;
  const wf = t => t < 0.32 ? 1.8 + (wMax - 1.8) * smooth(t / 0.32) : wMax;
  const ribbon = taperedSpiralPath(spec, wf);
  const grooves = spiralGrooves(spec, wf, { spacing: 9, frac: 0.55 });
  const dots = [[C, C - dotD], [C + dotD, C], [C, C + dotD], [C - dotD, C]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${dotR}" fill="#000"/>`).join('');
  // mono/rev: spiral fully die-cut (single-plate stamp). color: gold spiral inlay w/ cut grooves.
  const knockSpiral = spiral === null;
  return `<defs><mask id="k-${uid}">
  <rect width="${VB}" height="${VB}" fill="#fff"/>
  <path d="${dia(Dh)}" fill="none" stroke="#000" stroke-width="1.7"/>
  ${dots}
  ${knockSpiral
    ? `<path d="${ribbon}" fill="#000"/>`
    : `<path d="${grooves}" stroke="#000" stroke-width="1.9" stroke-linecap="round" fill="none"/>`}
</mask></defs>
<path d="${dia(D)}" fill="${field}" mask="url(#k-${uid})"/>
${knockSpiral ? '' : `<g mask="url(#k-${uid})"><path d="${ribbon}" fill="${spiral}"/></g>`}`;
}

/* =====================================================================
   B3 — SPIRAL SUN
   Matchbox-label sunburst: 24 wedge rays alternating long/short (and
   alternating color), gold keyline ring, maroon core disc with the
   spiral knocked out of it. Festive, optimistic, printable.
===================================================================== */
function b3({ disc, ring, rayA, rayB }, uid) {
  const discR = 44, ringR = 52, base = 61, longR = 96, shortR = 79, n = 24;
  const hw = (TAU / n) * 0.33; // wedge half-angle
  let rays = '';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * TAU) / n;
    const rT = i % 2 ? shortR : longR;
    const col = i % 2 ? rayB : rayA;
    const p = (r, ang) => `${F(C + r * Math.cos(ang))} ${F(C + r * Math.sin(ang))}`;
    rays += `<path d="M${p(base, a - hw)} L${p(rT, a)} L${p(base, a + hw)} Z" fill="${col}"/>`;
  }
  const spec = { cx: C, cy: C, r0: 2, r1: 34.5, turns: 2.2, theta0: -Math.PI / 2 };
  const spiral = spiralPolyline(spec);
  return `<defs><mask id="s-${uid}">
  <rect width="${VB}" height="${VB}" fill="#fff"/>
  <path d="${spiral}" fill="none" stroke="#000" stroke-width="6.6" stroke-linecap="round"/>
</mask></defs>
${rays}
<circle cx="${C}" cy="${C}" r="${ringR}" fill="none" stroke="${ring}" stroke-width="2.4"/>
<circle cx="${C}" cy="${C}" r="${discR}" fill="${disc}" mask="url(#s-${uid})"/>`;
}

/* =====================================================================
   B4 — SESAME ORBIT
   The spiral drawn ONLY from sesame seeds: pointed ovals riding the
   tangent, sized down toward the centre, spaced by equal arc-length
   proportional to their own size. Color runs maroon -> zari gold.
===================================================================== */
function seedPath(L) {
  const half = L / 2, h = L * 0.56 / 2;
  return `M0 ${F(-half)} C${F(h * 1.12)} ${F(-half * 0.22)} ${F(h * 1.02)} ${F(half * 0.58)} 0 ${F(half)} C${F(-h * 1.02)} ${F(half * 0.58)} ${F(-h * 1.12)} ${F(-half * 0.22)} 0 ${F(-half)} Z`;
}
function b4({ colorAt }, uid) {
  const spec = { cx: C, cy: C, r0: 6, r1: 84, turns: 3.2, theta0: 0.05 * Math.PI, steps: 2400 };
  const pts = sampleSpiral(spec);
  const total = pts[pts.length - 1].s;
  let seeds = '', s = 4, i = 0;
  while (s < total - 5) {
    const p = atArc(pts, s);
    const L = 5.4 + 13.2 * p.t;
    // subtle deterministic alternating skew off the tangent = hand-sprinkled, not machine-dotted
    const skew = (i % 2 ? 7 : -5) * (0.4 + 0.6 * p.t);
    const ang = Math.atan2(p.ty, p.tx) * 180 / Math.PI + 90 + skew;
    seeds += `<path d="${seedPath(L)}" transform="translate(${F(p.x)} ${F(p.y)}) rotate(${F(ang)})" fill="${colorAt(p.t)}"/>\n`;
    s += L * 1.16;
    i++;
  }
  return `<circle cx="${C}" cy="${C}" r="3.4" fill="${colorAt(0)}"/>\n${seeds}`;
}

/* =====================================================================
   B5 — WARM COIL
   The B1 rope, smaller and set low, with two steam wisps rising off the
   coil — fresh-from-the-kadhai. Vertical composition.
===================================================================== */
// steam wisp = sampled sine ribbon (1.5 periods), amplitude eased in/out => calligraphic rise
function steamPath(x0, y0, h, amp, phase = 0) {
  const N = 44;
  let d = '';
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const ease = Math.sin(Math.PI * Math.min(1, u * 1.25)); // fade amplitude at both ends
    const x = x0 + amp * ease * Math.sin(u * Math.PI * 1.5 + phase);
    const y = y0 - h * u;
    d += (k ? ' L' : 'M') + `${F(x)} ${F(y)}`;
  }
  return d;
}
function b5({ coil, steam }, uid) {
  const cy = 150, wMax = 11;
  const spec = { cx: C, cy, r0: 3, r1: 60, turns: 2.7, theta0: -1.15 * Math.PI };
  const wf = t => t < 0.3 ? 1.8 + (wMax - 1.8) * smooth(t / 0.3) : wMax;
  const ribbon = taperedSpiralPath(spec, wf);
  const grooves = spiralGrooves(spec, wf, { spacing: 10, frac: 0.55 });
  const w1 = steamPath(106, 78, 48, 8.5, 0);
  const w2 = steamPath(135, 80, 38, 7, Math.PI); // mirrored phase
  return `<defs><mask id="w-${uid}"><rect width="${VB}" height="${VB}" fill="#fff"/><path d="${grooves}" stroke="#000" stroke-width="2" stroke-linecap="round" fill="none"/></mask></defs>
<path d="${ribbon}" fill="${coil}" mask="url(#w-${uid})"/>
<g fill="none" stroke="${steam}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="${w1}"/><path d="${w2}"/>
</g>`;
}

/* =====================================================================
   B6 — PRESSED THUMB
   One continuous uniform-weight spiral (4.6 turns — spiral FIRST), with
   two ridge-ending breaks and eight short flanking ridge fragments set
   in the gaps between windings — read twice, it's a thumbprint.
   Slight vertical squash + tilt = a pressed thumb pad.
===================================================================== */
function b6({ main, frag }, uid) {
  const spec = { cx: C, cy: C, r0: 2, r1: 86, turns: 4.35, theta0: -0.95 * Math.PI, steps: 1600 };
  const pitch = (spec.r1 - spec.r0) / spec.turns;
  const mainD = spiralPolyline(spec, { breaks: [0.47, 0.76], gapLen: 8 });
  // ridge fragments: short arcs mid-gap, alternating sides, deterministic placement
  const frags = [
    { t: 0.30, side: 1, arc: 24 }, { t: 0.40, side: -1, arc: 19 },
    { t: 0.52, side: 1, arc: 30 }, { t: 0.61, side: -1, arc: 24 },
    { t: 0.70, side: 1, arc: 34 }, { t: 0.78, side: -1, arc: 26 },
    { t: 0.87, side: 1, arc: 30 }, { t: 0.94, side: -1, arc: 21 },
  ];
  let fragD = '';
  for (const f of frags) {
    const thC = spec.theta0 + f.t * spec.turns * TAU;
    const rC = spec.r0 + (spec.r1 - spec.r0) * f.t + f.side * pitch * 0.5;
    const dth = f.arc / rC; // angular span from arc length
    let seg = '';
    for (let k = 0; k <= 20; k++) {
      const th = thC - dth / 2 + (dth * k) / 20;
      // radius follows the spiral slope so fragments stay parallel to windings
      const r = rC + ((th - thC) / (spec.turns * TAU)) * (spec.r1 - spec.r0);
      seg += (k ? ' L' : 'M') + `${F(C + r * Math.cos(th))} ${F(C + r * Math.sin(th))}`;
    }
    fragD += seg + ' ';
  }
  return `<g transform="rotate(-6 ${C} ${C}) translate(0 ${F(C - C * 1.05)}) scale(1 1.05)">
<path d="${mainD}" fill="none" stroke="${main}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${fragD}" fill="none" stroke="${frag}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;
}

/* ---------------- options + variant palettes ---------------- */
const OPTIONS = [
  {
    id: 'B1', name: 'Pure Coil',
    concept: 'A mathematically exact Archimedean spiral rendered as a tapered dough rope — thin where the press starts at the centre, full width outward, round-capped end, ridge grooves cut at equal arc spacing. The chakli itself, drawn like a monogram.',
    build: v => b1({ coil: v === 'color' ? MAROON : v === 'mono' ? INK : CREAM }, `b1-${v}`),
  },
  {
    id: 'B2', name: 'Kuyri Tile',
    concept: 'The spiral set in a 45-degree Paithani zari tile: maroon diamond field, die-cut hairline diamond and four zari dots, gold spiral inlay (mono/rev: the spiral is die-cut clean through — a single-plate stamp). Born to be an app icon.',
    build: v => b2({
      field: v === 'color' ? MAROON : v === 'mono' ? INK : CREAM,
      spiral: v === 'color' ? GOLD : null,
    }, `b2-${v}`),
  },
  {
    id: 'B3', name: 'Spiral Sun',
    concept: 'Matchbox-label sunburst: 24 wedge rays alternating long terracotta / short gold around a gold keyline ring; the maroon core carries the spiral knocked out of it. Festive shelf energy, prints in three inks.',
    build: v => b3(
      v === 'color' ? { disc: MAROON, ring: GOLD, rayA: TERRA, rayB: GOLD }
        : v === 'mono' ? { disc: INK, ring: INK, rayA: INK, rayB: INK }
          : { disc: CREAM, ring: GOLD_LUXE, rayA: CREAM, rayB: GOLD_LUXE }, `b3-${v}`),
  },
  {
    id: 'B4', name: 'Sesame Orbit',
    concept: 'The spiral drawn from nothing but sesame seeds — pointed ovals riding the curve tangent with a hand-sprinkled alternating skew, shrinking toward the centre, spaced proportionally to their own size. Color runs zari gold at the core to bhajani maroon at the rim so the silhouette holds on light grounds. Premium, particle-like.',
    build: v => b4({
      colorAt: v === 'color' ? (t => hexLerp(GOLD, MAROON, smooth(t)))
        : v === 'mono' ? (() => INK)
          : (t => hexLerp(GOLD_LUXE, CREAM, smooth(t))),
    }, `b4-${v}`),
  },
  {
    id: 'B5', name: 'Warm Coil',
    concept: 'The rope spiral set low with two gold steam wisps rising off it — the mark says fresh-and-hot, straight from the kadhai. Terracotta coil, zari steam.',
    build: v => b5(
      v === 'color' ? { coil: TERRA, steam: GOLD }
        : v === 'mono' ? { coil: INK, steam: INK }
          : { coil: CREAM, steam: GOLD_LUXE }, `b5-${v}`),
  },
  {
    id: 'B6', name: 'Pressed Thumb',
    concept: 'One continuous 4.6-turn spiral (spiral FIRST) with two ridge-ending breaks and eight flanking ridge fragments in the winding gaps — look twice and it is a thumbprint: hand-pressed as literal identity. Slight squash and tilt make it a thumb pad.',
    build: v => b6(
      v === 'color' ? { main: MAROON, frag: GOLD }
        : v === 'mono' ? { main: INK, frag: INK }
          : { main: CREAM, frag: GOLD_LUXE }, `b6-${v}`),
  },
];

/* ---------------- emit ---------------- */
const manifest = [];
for (const opt of OPTIONS) {
  const files = [];
  for (const v of ['color', 'mono', 'rev']) {
    const fname = `${opt.id.toLowerCase()}-${v}.svg`;
    fs.writeFileSync(path.join(OUT, fname), svg(opt.build(v), `Cmaa ${opt.name} logo (${v})`));
    files.push(fname);
  }
  manifest.push({ id: opt.id, name: opt.name, concept: opt.concept, files });
  console.log(`${opt.id} ${opt.name}: ${files.join(', ')}`);
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('manifest.json written —', manifest.length, 'options');
