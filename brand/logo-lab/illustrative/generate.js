// Cmaa logo lab — FAMILY D: ILLUSTRATIVE / CHARACTER MARKS
// Generates D1..D6, each in color / mono / rev, all geometry computed.
// Run: node generate.js   (emits SVGs + manifest.json next to this file)
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);
const P2 = (x, y) => `${F(x)} ${F(y)}`;

/* ================= palette ================= */
const INK = '#33241A';
const GOLD = '#C8922A';       // zari gold (light grounds)
const GOLD_LX = '#D4A23C';    // luxe gold (dark grounds)
const CREAM = '#EFE3C8';      // luxe ivory (dark grounds)
const MAROON = '#7A1E2B';
const MAGENTA = '#A62A6E';
const GREEN = '#3E7C43';
const TERRA = '#B5512E';
const BUTTER = '#C98A3B';

/* ================= geometry helpers ================= */

// Archimedean spiral path. startAngle in radians; drawn centre -> out.
function spiral(cx, cy, r0, r1, turns, startAngle = -Math.PI / 2, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const th = startAngle + t * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * t;
    pts.push([F(cx + r * Math.cos(th)), F(cy + r * Math.sin(th))]);
  }
  return 'M' + pts.map(p => p.join(' ')).join(' L');
}
// outer endpoint of that spiral (to join tails/strands tangentially)
function spiralEnd(cx, cy, r1, turns, startAngle = -Math.PI / 2) {
  const th = startAngle + turns * 2 * Math.PI;
  return [F(cx + r1 * Math.cos(th)), F(cy + r1 * Math.sin(th))];
}

// sesame seed: pointed lens aimed along angle a (radians)
function sesame(cx, cy, a, L, W) {
  const dx = Math.cos(a), dy = Math.sin(a);
  const nx = -dy, ny = dx;
  const t1 = [cx + dx * L, cy + dy * L], t2 = [cx - dx * L, cy - dy * L];
  const c1 = [cx + nx * W * 2, cy + ny * W * 2], c2 = [cx - nx * W * 2, cy - ny * W * 2];
  return `M${P2(...t1)} Q${P2(...c1)} ${P2(...t2)} Q${P2(...c2)} ${P2(...t1)} Z`;
}

// point on circle (deg, SVG y-down; 0 = +x, 90 = down)
function onCircle(cx, cy, r, deg) {
  const a = deg * Math.PI / 180;
  return [F(cx + r * Math.cos(a)), F(cy + r * Math.sin(a))];
}

function svgFile(name, body, defs = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
${defs ? '<defs>' + defs + '</defs>\n' : ''}${body}
</svg>`;
  fs.writeFileSync(path.join(OUT, name), svg);
  return name;
}

/* =========================================================
   D1 — AAJI MARK. Continuous-line portrait, 7 strokes:
   embrace ring (open at top), face U, hair sweep, bun spiral
   (the chakli!), glasses, bindi, half-smile.
   ========================================================= */
function d1(P) {
  const cx = 120, cy = 120, R = 92;
  // ring open at top (gap 64deg centred at -90); bun lives in the gap
  const [ax, ay] = onCircle(cx, cy, R, -58);
  const [bx, by] = onCircle(cx, cy, R, -122);
  const ring = `<path d="M${ax} ${ay} A${R} ${R} 0 1 1 ${bx} ${by}" fill="none" stroke="${P.ring}" stroke-width="8" stroke-linecap="round"/>`;
  // face U: temples (74,100)-(166,100), chin at 172
  const face = `<path d="M74 100 C74 148 90 172 120 172 C150 172 166 148 166 100" fill="none" stroke="${P.line}" stroke-width="7" stroke-linecap="round"/>`;
  // hair = filled crescent cap (mass, not an egg outline), tapering to the temples
  const hair = `<path d="M74 100 C74 52 92 40 120 40 C148 40 166 52 166 100
    C166 62 150 52 120 52 C90 52 74 62 74 100 Z" fill="${P.line}"/>`;
  // bun = tiny chakli spiral poking through the ring gap, rooted in the hair cap
  const bun = `<path d="${spiral(120, 32, 1.6, 13, 2.4, Math.PI / 2)}" fill="none" stroke="${P.line}" stroke-width="5.5" stroke-linecap="round"/>`;
  const glasses = `<g fill="none" stroke="${P.line}" stroke-width="6">
    <circle cx="98" cy="112" r="17"/><circle cx="142" cy="112" r="17"/>
    <path d="M115 106 Q120 101 125 106" stroke-linecap="round"/>
  </g>`;
  const bindi = `<circle cx="120" cy="83" r="5" fill="${P.dot}"/>`;
  const earrings = `<circle cx="72" cy="128" r="3.5" fill="${P.ring}"/><circle cx="168" cy="128" r="3.5" fill="${P.ring}"/>`;
  const smile = `<path d="M104 150 Q120 161 135 147" fill="none" stroke="${P.line}" stroke-width="6" stroke-linecap="round"/>`;
  return ring + face + hair + bun + glasses + bindi + earrings + smile;
}

/* =========================================================
   D2 — SORYA HANDS. Woodcut press: two fists on the press bar,
   brass cylinder, star nozzle, chakli coiling out below.
   Cut lines are transparent via mask (true single-ink capable).
   ========================================================= */
function d2(P, ns) {
  // hand: shallow palm over the bar, four SHORT finger-tip scallops
  // wrapping below it, plus a thumb hugging the bar toward centre.
  const HW = 36, TIP = HW / 8, HTOP = 50, HBOT = 90, HRX = 10;
  function hand(hcx, dir) { // dir: +1 thumb points right, -1 left
    const x0 = hcx - HW / 2, x1 = hcx + HW / 2;
    let d = `M${F(x0)} ${F(HBOT - TIP)} L${F(x0)} ${F(HTOP + HRX)}`
      + ` Q${F(x0)} ${F(HTOP)} ${F(x0 + HRX)} ${F(HTOP)}`
      + ` L${F(x1 - HRX)} ${F(HTOP)} Q${F(x1)} ${F(HTOP)} ${F(x1)} ${F(HTOP + HRX)}`
      + ` L${F(x1)} ${F(HBOT - TIP)}`;
    for (let i = 0; i < 4; i++) d += ` a${F(TIP)} ${F(TIP)} 0 0 1 ${F(-TIP * 2)} 0`;
    d += ' Z';
    // thumb: rounded lobe reaching along the bar top toward the stem
    const tx = hcx + dir * (HW / 2 - 2);
    d += ` M${F(tx)} ${F(HTOP + 4)} h${F(dir * 8)} q${F(dir * 7)} 0 ${F(dir * 7)} 6.5 q0 6.5 ${F(-dir * 7)} 6.5 h${F(-dir * 8)} Z`;
    return d;
  }
  const cuts = [];
  // finger separations (3 per hand): start at the knuckle line (bar top)
  for (const hcx of [67, 173]) for (const k of [-TIP * 2, 0, TIP * 2])
    cuts.push(`M${F(hcx + k)} 66 L${F(hcx + k)} ${F(HBOT - TIP - 1.5)}`);
  // cylinder bands + flange separations
  cuts.push('M88 124 L152 124', 'M88 136 L152 136');
  cuts.push('M80 107 L160 107', 'M80 144.5 L160 144.5', 'M102 155.5 L138 155.5');
  const mask = `<mask id="${ns}-cut">
    <rect x="0" y="0" width="240" height="240" fill="#fff"/>
    <g stroke="#000" stroke-width="3.4" stroke-linecap="round" fill="none">
      ${cuts.map(d => `<path d="${d}"/>`).join('')}
    </g>
  </mask>`;
  // press stack (filled, masked): bar, stem, flanges, body, nozzle
  const press = `<g mask="url(#${ns}-cut)">
    <g fill="${P.brass}">
      <rect x="50" y="62" width="140" height="14" rx="7"/>
      <rect x="113" y="76" width="14" height="20"/>
      <rect x="78" y="96" width="84" height="11" rx="4"/>
      <rect x="84" y="107" width="72" height="40"/>
      <rect x="78" y="144" width="84" height="11" rx="4"/>
      <path d="M102 155 L138 155 L128 169 L112 169 Z"/>
    </g>
    <g fill="${P.hand}">
      <path d="${hand(67, 1)}"/><path d="${hand(173, -1)}"/>
    </g>
    <g stroke="${P.hand}" stroke-width="16" stroke-linecap="round">
      <path d="M46 24 L62 44"/><path d="M194 24 L178 44"/>
    </g>
  </g>`;
  // chakli emerging: strand from nozzle -> spiral (turns=3 ends at top)
  const sp = spiral(120, 200, 2, 23.5, 3);
  const chakli = `<path d="M120 171 L120 176.5 ${sp.slice(1)}" fill="none" stroke="${P.coil}" stroke-width="6.5" stroke-linecap="round"/>`;
  return { body: press + chakli, defs: mask };
}

/* =========================================================
   D3 — KADHAI RISING. Kadhai silhouette, ring handles,
   three steam curls, one perfect chakli spiral above.
   ========================================================= */
function d3(P) {
  const sp = `<path d="${spiral(120, 58, 2, 28, 3)}" fill="none" stroke="${P.spiral}" stroke-width="7" stroke-linecap="round"/>`;
  const steam = `<g fill="none" stroke="${P.steam}" stroke-width="6" stroke-linecap="round">
    <path d="M96 150 C87 138 105 126 96 114"/>
    <path d="M120 152 C110 138 130 120 120 102"/>
    <path d="M144 150 C135 138 153 126 144 114"/>
  </g>`;
  const bowl = `<path d="M54 163 L186 163 C182 199 152 211 120 211 C88 211 58 199 54 163 Z" fill="${P.bowl}"/>`;
  const rim = `<path d="M48 161 L192 161" stroke="${P.bowl}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
  const handles = `<g fill="none" stroke="${P.handle}" stroke-width="6.5">
    <circle cx="39" cy="153" r="9.5"/><circle cx="201" cy="153" r="9.5"/>
  </g>`;
  return sp + steam + handles + bowl + rim;
}

/* =========================================================
   D4 — MOR COIL. Paithani peacock; the tail feather flows
   tangentially into an Archimedean chakli spiral.
   ========================================================= */
function d4(P) {
  // coil floats UP-RIGHT of the bird (a curling plume, not a snail shell).
  // turns=2.625 -> outer end at 135deg (bottom-left of coil), so the tail
  // enters travelling down-right, tangent-matched.
  const scx = 158, scy = 96, sr = 30, turns = 2.625;
  const [ex, ey] = spiralEnd(scx, scy, sr, turns); // ~(136.8, 117.2)
  const sp = spiral(scx, scy, 2, sr, turns);
  const tail = `<path d="M110 128 C118 112 ${F(ex - 6)} ${F(ey - 6)} ${ex} ${ey}" fill="none" stroke="${P.coil}" stroke-width="7" stroke-linecap="round"/>
  <path d="${sp}" fill="none" stroke="${P.coil}" stroke-width="7" stroke-linecap="round"/>`;
  const body = `<path d="M63 60 C52 90 60 124 90 138 C101 143 109 139 112 132 C115 108 99 84 78 62 Z" fill="${P.body}"/>`;
  const head = `<circle cx="70" cy="55" r="9.5" fill="${P.body}"/>`;
  const beak = `<path d="M52 57 L63 50.5 L64 61 Z" fill="${P.beak}"/>`;
  const crest = `<g stroke="${P.crest}" stroke-width="3.5" stroke-linecap="round">
    <path d="M67 46 L60 34"/><path d="M70 45 L70 30"/><path d="M73 46 L80 34"/>
    <circle cx="60" cy="33" r="3" fill="${P.crest}" stroke="none"/>
    <circle cx="70" cy="29" r="3" fill="${P.crest}" stroke="none"/>
    <circle cx="80" cy="33" r="3" fill="${P.crest}" stroke="none"/>
  </g>`;
  const wing = `<path d="M73 90 Q92 102 97 126" fill="none" stroke="${P.wing}" stroke-width="4.5" stroke-linecap="round"/>`;
  return `<g transform="translate(0 34)">${tail}${body}${head}${beak}${crest}${wing}</g>`;
}

/* =========================================================
   D5 — CHAKLI MANDALA. 8-fold rangoli computed rotationally:
   centre boss, dot ring, 8 mini chakli spirals, scallop arcs,
   8 sesame seeds, outer dot ring.
   ========================================================= */
function d5(P) {
  const cx = 120, cy = 120;
  let g = '';
  // centre boss
  g += `<circle cx="${cx}" cy="${cy}" r="7" fill="${P.boss}"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="13.5" fill="none" stroke="${P.spiral}" stroke-width="3"/>`;
  // inner dots (offset 22.5deg)
  for (let k = 0; k < 8; k++) {
    const [x, y] = onCircle(cx, cy, 27, k * 45 + 22.5);
    g += `<circle cx="${x}" cy="${y}" r="2.8" fill="${P.boss}"/>`;
  }
  // 8 mini chakli spirals at r=48 (template at top, rotated copies)
  const mini = spiral(cx, cy - 48, 1.4, 14.5, 2.25);
  for (let k = 0; k < 8; k++)
    g += `<path d="${mini}" fill="none" stroke="${P.spiral}" stroke-width="4.6" stroke-linecap="round" transform="rotate(${k * 45} ${cx} ${cy})"/>`;
  // scallop petal arcs between spirals (chalk rangoli line)
  let petals = '';
  for (let k = 0; k < 8; k++) {
    const [x1, y1] = onCircle(cx, cy, 70, k * 45 - 90);
    const [x2, y2] = onCircle(cx, cy, 70, (k + 1) * 45 - 90);
    const [cxp, cyp] = onCircle(cx, cy, 98, k * 45 - 67.5);
    petals += `M${x1} ${y1} Q${cxp} ${cyp} ${x2} ${y2} `;
  }
  g += `<path d="${petals}" fill="none" stroke="${P.petal}" stroke-width="3.2" stroke-linecap="round"/>`;
  // sesame seeds beyond the petal bulges, radial
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22.5 - 90) * Math.PI / 180;
    const [x, y] = onCircle(cx, cy, 92, k * 45 + 22.5 - 90);
    g += `<path d="${sesame(x, y, a, 7.5, 3)}" fill="${P.seed}"/>`;
  }
  // outer dots aligned with spirals
  for (let k = 0; k < 8; k++) {
    const [x, y] = onCircle(cx, cy, 98, k * 45 - 90);
    g += `<circle cx="${x}" cy="${y}" r="3" fill="${P.spiral}"/>`;
  }
  return g;
}

/* =========================================================
   D6 — CYCLE COURIER. Roadster side view, computed frame,
   wheels = chakli spirals, tiffin (dabba) stack on the carrier.
   ========================================================= */
function d6(P) {
  const RW = [66, 154], FW = [178, 154], r = 33; // axles + wheel radius
  const BB = [116, 158], S = [102, 104], H1 = [160, 100], H2 = [168, 124];
  const wheel = (c) => `
    <circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="none" stroke="${P.frame}" stroke-width="6.5"/>
    <path d="${spiral(c[0], c[1], 2, 26, 2.5)}" fill="none" stroke="${P.spoke}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${c[0]}" cy="${c[1]}" r="3" fill="${P.frame}"/>`;
  const frame = `<g fill="none" stroke="${P.frame}" stroke-width="6" stroke-linecap="round">
    <path d="M${P2(...BB)} L${P2(...S)}"/>
    <path d="M${P2(...S)} L${P2(...H1)}"/>
    <path d="M${P2(...BB)} L166 122"/>
    <path d="M${P2(...H1)} L${P2(...H2)} L${P2(...FW)}"/>
    <path d="M${P2(...RW)} L${P2(...BB)}"/>
    <path d="M${P2(...RW)} L${P2(...S)}"/>
    <path d="M${P2(...S)} L98 92"/>
    <path d="M${P2(...H1)} L156 80"/>
  </g>`;
  const saddle = `<path d="M84 90 L110 90" stroke="${P.accent}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  const bars = `<path d="M156 80 C144 71 135 77 137 86" fill="none" stroke="${P.frame}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="137" cy="86" r="3.2" fill="${P.accent}"/>`;
  const crank = `<circle cx="${BB[0]}" cy="${BB[1]}" r="7.5" fill="none" stroke="${P.frame}" stroke-width="4.5"/>
    <path d="M${P2(...BB)} L127 171 M121 174 L135 174" stroke="${P.frame}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  const rack = `<g fill="none" stroke="${P.frame}" stroke-width="4.5" stroke-linecap="round">
    <path d="M44 118 L90 118"/><path d="M50 118 L62 150"/><path d="M86 118 L70 150"/>
  </g>`;
  // tiffin stack: 3 tiers + handle
  const tiers = [[45, 102, 44], [46.5, 86, 41], [48, 70, 38]];
  const tiffin = tiers.map(([x, y, w]) =>
    `<rect x="${x}" y="${y}" width="${w}" height="16" rx="3" fill="${P.tiffin}" stroke="${P.frame}" stroke-width="5"/>`).join('') +
    `<path d="M58 68 Q67 50 76 68" fill="none" stroke="${P.frame}" stroke-width="5" stroke-linecap="round"/>`;
  return `<g transform="translate(-1 6)">${wheel(RW)}${wheel(FW)}${frame}${saddle}${bars}${crank}${rack}${tiffin}</g>`;
}

/* ================= build all variants ================= */

const OPTIONS = [
  {
    id: 'D1', name: 'Aaji Mark',
    concept: 'Continuous-line portrait of Seema aaji — hair bun drawn as a chakli spiral poking through an open embrace ring; round glasses, bindi, knowing half-smile. Seven strokes.',
    make: v => ({ body: d1(v) }),
    palettes: {
      color: { ring: GOLD, line: INK, dot: '#B3372B' },
      mono: { ring: INK, line: INK, dot: INK },
      rev: { ring: GOLD_LX, line: CREAM, dot: GOLD_LX },
    },
  },
  {
    id: 'D2', name: 'Sorya Hands',
    concept: 'Woodcut press: two fists bearing down on the brass sorya, one bhajani-dark chakli coiling out of the nozzle. Cut lines are transparent, so it prints in one ink.',
    make: (v, ns) => d2(v, ns),
    palettes: {
      color: { brass: GOLD, hand: TERRA, coil: MAROON },
      mono: { brass: INK, hand: INK, coil: INK },
      rev: { brass: GOLD_LX, hand: CREAM, coil: CREAM },
    },
  },
  {
    id: 'D3', name: 'Kadhai Rising',
    concept: 'The kadhai silhouette with ring handles; three steam curls lift one perfect chakli spiral off the oil. The frying moment as an emblem.',
    make: v => ({ body: d3(v) }),
    palettes: {
      color: { bowl: MAROON, handle: INK, steam: TERRA, spiral: GOLD },
      mono: { bowl: INK, handle: INK, steam: INK, spiral: INK },
      rev: { bowl: CREAM, handle: CREAM, steam: GOLD_LX, spiral: GOLD_LX },
    },
  },
  {
    id: 'D4', name: 'Mor Coil',
    concept: 'Paithani peacock whose tail feather flows tangent-perfect into the chakli spiral — the pallu motif becomes the product. Single-colour capable.',
    make: v => ({ body: d4(v) }),
    palettes: {
      color: { body: MAGENTA, beak: GOLD, crest: GREEN, wing: GOLD, coil: GOLD },
      mono: { body: INK, beak: INK, crest: INK, wing: INK, coil: INK },
      rev: { body: CREAM, beak: GOLD_LX, crest: GOLD_LX, wing: GOLD_LX, coil: GOLD_LX },
    },
  },
  {
    id: 'D5', name: 'Chakli Mandala',
    concept: 'Eight-fold rangoli computed rotationally from tiny chakli spirals, scallop chalk arcs and sesame seeds — a Diwali doorstep drawn with the product itself.',
    make: v => ({ body: d5(v) }),
    palettes: {
      color: { boss: MAROON, spiral: GOLD, petal: MAROON, seed: INK },
      mono: { boss: INK, spiral: INK, petal: INK, seed: INK },
      rev: { boss: GOLD_LX, spiral: GOLD_LX, petal: CREAM, seed: CREAM },
    },
  },
  {
    id: 'D6', name: 'Cycle Courier',
    concept: 'Side-view roadster with a three-tier dabba strapped to the carrier; both wheels are chakli spirals. The Kothrud delivery story in one mark.',
    make: v => ({ body: d6(v) }),
    palettes: {
      color: { frame: INK, spoke: GOLD, tiffin: TERRA, accent: MAROON },
      mono: { frame: INK, spoke: INK, tiffin: 'none', accent: INK },
      rev: { frame: CREAM, spoke: GOLD_LX, tiffin: 'none', accent: GOLD_LX },
    },
  },
];

const manifest = [];
for (const opt of OPTIONS) {
  const files = [];
  for (const variant of ['color', 'mono', 'rev']) {
    const ns = `${opt.id.toLowerCase()}-${variant}`;
    const res = opt.make(opt.palettes[variant], ns);
    const name = `${opt.id}-${variant}.svg`;
    svgFile(name, res.body, res.defs || '');
    files.push(name);
  }
  manifest.push({ id: opt.id, name: opt.name, concept: opt.concept, files });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('emitted', manifest.length * 3, 'svgs + manifest.json ->', OUT);
