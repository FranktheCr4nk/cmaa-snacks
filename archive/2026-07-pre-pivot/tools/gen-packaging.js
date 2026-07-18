// Cmaa packaging v2 generator — collectible label chassis per research brief.
// Computes spiral/scallop/arch/band geometry programmatically, emits SVGs + preview.
const fs = require('fs');
const path = require('path');
const OUT = 'd:/Claude Code Projects/Cmaa/assets/packaging/v2';
fs.mkdirSync(OUT, { recursive: true });

const F = n => +n.toFixed(2);

/* ---------- geometry helpers ---------- */

// Archimedean spiral (the chakli monogram) with ridge ticks
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

// Scalloped rectangle border (ticket / mithai-box edge). Bumps bulge outward.
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

// Cusped (multifoil) Mughal arch window path: straight sides, 5-cusp arch top.
function cuspArch(x, y, w, h, cusps = 5, springRatio = 0.62) {
  const spring = y + h - (h * springRatio); // arch springs from here up
  const R = w / 2, cx = x + R;
  // points along semicircle from 180deg -> 0deg
  const pts = [];
  for (let i = 0; i <= cusps; i++) {
    const a = Math.PI - (Math.PI * i) / cusps;
    pts.push([F(cx + R * Math.cos(a)), F(spring - R * 0.92 * Math.sin(a))]);
  }
  let d = `M${F(x)} ${F(y + h)} L${F(x)} ${F(spring)}`;
  for (let i = 1; i <= cusps; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    d += ` A${F(chord * 0.62)} ${F(chord * 0.62)} 0 0 1 ${x2} ${y2}`;
  }
  d += ` L${F(x + w)} ${F(y + h)} Z`;
  return d;
}

// Paithani strap: gold rules + rotated squares (kuyri grid)
function paithaniBand(x, y, w, h, sku, gold, ink) {
  const sq = h * 0.26, gap = sq * 2.1, n = Math.floor(w / gap);
  const off = (w - (n - 1) * gap) / 2;
  let cells = '';
  for (let i = 0; i < n; i++) {
    const cx = x + off + i * gap, cy = y + h / 2;
    if (i % 6 === 3) { // 8-petal dot flower every 6th
      for (let p = 0; p < 8; p++) {
        const a = (Math.PI * 2 * p) / 8;
        cells += `<circle cx="${F(cx + Math.cos(a) * sq * 0.72)}" cy="${F(cy + Math.sin(a) * sq * 0.72)}" r="${F(sq * 0.16)}" fill="${gold}"/>`;
      }
      cells += `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(sq * 0.22)}" fill="${sku}"/>`;
    } else {
      cells += `<rect x="${F(cx - sq / 2)}" y="${F(cy - sq / 2)}" width="${F(sq)}" height="${F(sq)}" fill="${i % 2 ? gold : sku}" transform="rotate(45 ${F(cx)} ${F(cy)})"/>`;
    }
  }
  return `<g>
    <rect x="${x}" y="${F(y)}" width="${w}" height="${F(h * 0.08)}" fill="${gold}"/>
    <rect x="${x}" y="${F(y + h * 0.92)}" width="${w}" height="${F(h * 0.08)}" fill="${gold}"/>
    ${cells}
  </g>`;
}

// Ribbon banner with swallow-tail ends + fold shading
function ribbon(cx, cy, w, h, fill, dark) {
  const x = cx - w / 2, y = cy - h / 2, tail = h * 0.9, fold = h * 0.28;
  return `<g>
    <path d="M${F(x - tail)} ${F(y + h * 0.14)} L${F(x + fold)} ${F(y + h * 0.14)} L${F(x + fold)} ${F(y + h + fold)} L${F(x)} ${F(y + h)} L${F(x - tail + h * 0.42)} ${F(y + h * 0.57)} Z" fill="${dark}"/>
    <path d="M${F(x + w + tail)} ${F(y + h * 0.14)} L${F(x + w - fold)} ${F(y + h * 0.14)} L${F(x + w - fold)} ${F(y + h + fold)} L${F(x + w)} ${F(y + h)} L${F(x + w + tail - h * 0.42)} ${F(y + h * 0.57)} Z" fill="${dark}"/>
    <rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" fill="${fill}"/>
  </g>`;
}

// Quarter rangoli medallion for corners (airy, chalk-like)
function rangoliQuarter(cx, cy, r, rot, color) {
  let g = `<g transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="${color}" stroke-width="1.6" opacity=".65" stroke-linecap="round">`;
  for (let k = 0; k < 2; k++) {
    g += `<g transform="rotate(${45 * k} ${cx} ${cy})">
      <path d="M${cx} ${cy} q ${F(r * 0.18)} ${F(-r * 0.55)} 0 ${F(-r * 0.95)} q ${F(-r * 0.18)} ${F(r * 0.4)} 0 ${F(r * 0.95)}"/>
    </g>`;
  }
  for (let k = 0; k <= 2; k++) {
    const a = -Math.PI / 2 + (Math.PI / 4) * k - Math.PI / 8;
    if (k > 0) g += `<circle cx="${F(cx + Math.cos(a) * r * 1.08)}" cy="${F(cy + Math.sin(a) * r * 1.08)}" r="2" fill="${color}" stroke="none"/>`;
  }
  return g + '</g>';
}

// deterministic barcode
function barcode(x, y, w, h) {
  let bars = '', cx = x; const seq = [2,1,1,3,1,2,2,1,1,1,3,2,1,1,2,1,3,1,1,2,2,1,1,3,1,1,2,2,1,1];
  for (let i = 0; i < seq.length && cx < x + w; i++) { const bw = seq[i] * (w / 52); if (i % 2 === 0) bars += `<rect x="${F(cx)}" y="${y}" width="${F(bw)}" height="${h}" fill="#2A211A"/>`; cx += bw + (w / 52); }
  return bars;
}

function chilis(x, y, n, lit, color) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const cx = x + i * 15;
    g += `<g transform="translate(${cx} ${y}) rotate(18)"><path d="M0 2 C -1 8, 3 13, 6 14 C 4 9, 4 4, 3 1 Z" fill="${i < lit ? color : 'none'}" stroke="${color}" stroke-width="1"/><path d="M3 1 q 2 -3 5 -2" fill="none" stroke="#35582F" stroke-width="1.4"/></g>`;
  }
  return g;
}

// steam curl (dash-animatable)
function steam(x, y, s, cls) {
  return `<path class="${cls}" d="M${x} ${y} c ${F(-6*s)} ${F(-8*s)}, ${F(6*s)} ${F(-14*s)}, 0 ${F(-22*s)} c ${F(-5*s)} ${F(-7*s)}, ${F(4*s)} ${F(-12*s)}, ${F(1*s)} ${F(-17*s)}" fill="none" stroke-linecap="round" pathLength="1"/>`;
}

/* ---------- flavor definitions ---------- */
const GOLD = '#C8922A', INK = '#33241A', CREAM = '#F6EDDB', PAPER = '#F1E4CB';
const FLAVORS = [
  { id: 'bhajani', dev: 'भाजणी चकली', latin: 'BHAJANI CHAKLI', sub: 'HAND-PRESSED · STONE-GROUND BHAJANI', sku: '#7A1E2B', skuDark: '#57121E', photo: 'chakli-1.jpg', heat: 2,
    truthDev: 'तांदूळ · डाळी · तीळ · देशी तूप — बस्स.', truthEn: 'rice · four dals · sesame · ghee — that’s all.', wt: '200 g', batch: 'SB-11' },
  { id: 'butter', dev: 'बटर चकली', latin: 'BUTTER CHAKLI', sub: 'WHITE-BUTTER SHORT · MELT CRUNCH', sku: '#C98A3B', skuDark: '#8F5E20', photo: 'murukku.jpg', heat: 1,
    truthDev: 'तांदूळ · लोणी · जिरे · मीठ — बस्स.', truthEn: 'rice · white butter · cumin · salt — that’s all.', wt: '200 g', batch: 'SB-12' },
  { id: 'masala', dev: 'मसाला चिवडा', latin: 'MASALA CHIVDA', sub: 'KADAK POHA · KOLHAPURI HEAT', sku: '#B3372B', skuDark: '#7E1F1A', photo: 'chivda-2.jpg', heat: 3,
    truthDev: 'पोहे · शेंगदाणे · कढीपत्ता · मसाला — बस्स.', truthEn: 'poha · peanuts · curry leaf · masala — that’s all.', wt: '250 g', batch: 'SB-13' },
  { id: 'poha', dev: 'पोहा चिवडा', latin: 'POHA CHIVDA', sub: 'THIN POHA · CASHEW & RAISIN', sku: '#5F7A4A', skuDark: '#3E5530', photo: 'chivda-1.jpg', heat: 1,
    truthDev: 'पातळ पोहे · काजू · बेदाणे · हळद — बस्स.', truthEn: 'thin poha · cashew · raisins · turmeric — that’s all.', wt: '250 g', batch: 'SB-14' },
];

/* ---------- the pouch ---------- */
function pouch(fl, { festive = false, imgPrefix = '../../images/' } = {}) {
  const W = 460, H = 660;
  const bx = 26, bw = W - 52; // body
  const crimpY = 30, bodyY = 58, bodyH = 566;
  // crimp zigzag
  let zz = `M${bx} ${crimpY}`; const zn = 26, zw = bw / zn;
  for (let i = 0; i < zn; i++) zz += ` l${F(zw / 2)} ${i % 2 ? 7 : -7} l${F(zw / 2)} ${i % 2 ? -7 : 7}`;

  const roundelCy = 168, roundelR = 52;
  const archW = 236, archX = (W - archW) / 2, archY = 316, archH = 196;
  const arch = cuspArch(archX, archY, archW, archH, 5, 0.5);
  const archInner = cuspArch(archX + 7, archY + 7, archW - 14, archH - 14, 5, 0.5);

  const spiral = spiralPath(W / 2, roundelCy, 2.5, roundelR * 0.52, 3.1);
  const ticks = spiralTicks(W / 2, roundelCy, 2.5, roundelR * 0.52, 3.1, 46, 4.6);

  const uid = fl.id;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
<defs>
  <style>@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&amp;family=Yatra+One&amp;family=Mulish:wght@400;600;700;800&amp;display=swap');
    .steam-${uid}{stroke:${GOLD};stroke-width:2.4;opacity:.85;stroke-dasharray:.42 .58;stroke-dashoffset:0}
  </style>
  <clipPath id="win-${uid}"><path d="${archInner}"/></clipPath>
  <clipPath id="body-${uid}"><rect x="${bx}" y="${crimpY - 8}" width="${bw}" height="${bodyH + 60}" rx="14"/></clipPath>
  <filter id="grain-${uid}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
  <filter id="press-${uid}" x="-8%" y="-8%" width="116%" height="116%"><feOffset dx="0" dy="1" in="SourceAlpha" result="o"/><feGaussianBlur stdDeviation=".5" in="o" result="b"/><feComposite in="b" in2="SourceAlpha" operator="out" result="s"/><feFlood flood-color="#000" flood-opacity=".28"/><feComposite in2="s" operator="in" result="sh"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge></filter>
  <linearGradient id="sheen-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".18" stop-color="#fff" stop-opacity=".28"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
  <radialGradient id="winsh-${uid}" cx=".5" cy=".35" r=".75"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
</defs>

<!-- pouch body -->
<g filter="url(#grain-${uid})">
<g clip-path="url(#body-${uid})">
  <rect x="${bx}" y="${crimpY - 8}" width="${bw}" height="${bodyH + 60}" rx="14" fill="${festive ? '#221D19' : CREAM}"/>
  <rect x="${bx}" y="${crimpY - 8}" width="${bw}" height="${bodyH + 60}" rx="14" fill="url(#sheen-${uid})"/>

  <!-- scalloped frame + hairline -->
  <path d="${scallopRect(bx + 16, 74, bw - 32, 536, 5)}" fill="none" stroke="${fl.sku}" stroke-width="1.8"/>
  <rect x="${bx + 27}" y="85" width="${bw - 54}" height="514" fill="none" stroke="${GOLD}" stroke-width="1"/>

  <!-- paithani strap -->
  ${paithaniBand(bx + 30, 92, bw - 60, 26, fl.sku, GOLD, INK)}

  <!-- roundel -->
  <circle cx="${W / 2}" cy="${roundelCy}" r="${roundelR}" fill="${festive ? '#2B241E' : PAPER}" stroke="${fl.sku}" stroke-width="2.2"/>
  <circle cx="${W / 2}" cy="${roundelCy}" r="${roundelR - 6}" fill="none" stroke="${GOLD}" stroke-width=".9"/>
  <path id="rup-${uid}" d="M ${W / 2 - (roundelR - 13)} ${roundelCy} a ${roundelR - 13} ${roundelR - 13} 0 0 1 ${(roundelR - 13) * 2} 0" fill="none"/>
  <path id="rdn-${uid}" d="M ${W / 2 - (roundelR - 12)} ${roundelCy} a ${roundelR - 12} ${roundelR - 12} 0 0 0 ${(roundelR - 12) * 2} 0" fill="none"/>
  <text font-size="9.5" font-weight="800" letter-spacing="2.2" fill="${festive ? PAPER : INK}"><textPath href="#rup-${uid}" startOffset="50%" text-anchor="middle">CMAA · आजीचा फराळ</textPath></text>
  <text font-size="8.5" font-weight="700" letter-spacing="2.6" fill="${fl.sku}"><textPath href="#rdn-${uid}" startOffset="50%" text-anchor="middle">PUNE · EST. 2026</textPath></text>
  <path d="${spiral}" fill="none" stroke="${fl.sku}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="${ticks}" stroke="${fl.sku}" stroke-width="1.1" opacity=".8"/>

  <!-- sign-painter devanagari name -->
  <g filter="url(#press-${uid})" font-family="'Yatra One','Mukta',serif" text-anchor="middle" font-size="43">
    <text x="${W / 2 + 2.5}" y="${262.5}" fill="${fl.skuDark}" opacity=".92">${fl.dev}</text>
    <text x="${W / 2}" y="260" fill="${festive ? GOLD : INK}">${fl.dev}</text>
  </g>
  ${ribbon(W / 2, 286, 224, 22, fl.sku, fl.skuDark)}
  <text x="${W / 2}" y="291" text-anchor="middle" font-size="11.5" font-weight="800" letter-spacing="2.8" fill="${CREAM}">${fl.latin}</text>

  <!-- die-cut arch window with REAL product photo (warm-graded) -->
  <path d="${arch}" fill="${fl.skuDark}"/>
  <g clip-path="url(#win-${uid})">
    <image href="${imgPrefix}${fl.photo}" x="${archX - 30}" y="${archY - 26}" width="${archW + 60}" height="${archH + 60}" preserveAspectRatio="xMidYMid slice" style="filter:saturate(1.28) contrast(1.06) brightness(1.04)"/>
    <path d="${archInner}" fill="${fl.sku}" style="mix-blend-mode:multiply" opacity=".13"/>
    <path d="${archInner}" fill="url(#winsh-${uid})"/>
  </g>
  <path d="${archInner}" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
  <path d="${arch}" fill="none" stroke="${fl.sku}" stroke-width="2.4"/>

  <!-- flanking snack-geometry columns: spiral / crescent / diamond dots -->
  <g fill="none" stroke="${fl.sku}" stroke-width="1.4" opacity=".85">
    ${[0, 1, 2].map(i => `<path d="${spiralPath(archX - 26, archY + 42 + i * 62, 1.2, 9, 2.4, 60)}"/>
    <path d="${spiralPath(archX + archW + 26, archY + 42 + i * 62, 1.2, 9, 2.4, 60)}"/>
    <path d="M${archX - 33} ${archY + 76 + i * 62} a 8.5 8.5 0 1 0 14 0 a 6.8 6.8 0 1 1 -14 0" fill="${GOLD}" stroke="none" opacity=".9"/>
    <rect x="${archX + archW + 21}" y="${archY + 70 + i * 62}" width="9" height="9" transform="rotate(45 ${archX + archW + 25.5} ${archY + 74.5 + i * 62})" fill="${GOLD}" stroke="none" opacity=".9"/>`).join('')}
  </g>

  <!-- truth strip -->
  <text x="${W / 2}" y="540" text-anchor="middle" font-family="'Yatra One',serif" font-size="15.5" fill="${festive ? PAPER : INK}">${fl.truthDev}</text>
  <path d="M${W / 2 - 112} 549 q 112 8 224 0" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linecap="round"/>
  <text x="${W / 2}" y="563" text-anchor="middle" font-size="10.5" font-style="italic" font-family="'Fraunces',serif" fill="${festive ? '#B8A88F' : '#6B573F'}">${fl.truthEn}</text>

  <!-- meta row -->
  <g transform="translate(${bx + 34} 578)">
    <rect x="0" y="0" width="17" height="17" fill="none" stroke="#2E7D32" stroke-width="1.6"/><circle cx="8.5" cy="8.5" r="4.4" fill="#2E7D32"/>
  </g>
  <text x="${W / 2}" y="586" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="1.4" fill="${festive ? '#B8A88F' : '#6B573F'}">NET WT</text>
  <text x="${W / 2}" y="601" text-anchor="middle" font-family="'Fraunces',serif" font-size="17" font-weight="700" fill="${festive ? PAPER : INK}">${fl.wt}</text>
  <g>${chilis(W - bx - 84, 578, 3, fl.heat, '#B3202C')}</g>

  <!-- credentials footer -->
  <rect x="${bx}" y="614" width="${bw}" height="34" fill="${fl.sku}"/>
  <text x="${W / 2}" y="635" text-anchor="middle" font-size="10.5" font-weight="800" letter-spacing="2.4" fill="${CREAM}">BATCH ${fl.batch} · PACKED 02·07·26 · NO PRESERVATIVES</text>
</g>

<!-- crimp seal -->
<path d="${zz}" fill="none" stroke="${fl.skuDark}" stroke-width="2.2"/>
<rect x="${bx}" y="${crimpY - 18}" width="${bw}" height="15" rx="6" fill="${festive ? '#2B241E' : PAPER}" stroke="${fl.skuDark}" stroke-width="1.4"/>
<circle cx="${W / 2}" cy="${crimpY - 10.5}" r="3.4" fill="none" stroke="${fl.skuDark}" stroke-width="1.3"/>
</g>
</svg>`;
}

/* ---------- gift tin (Kalichandrakala palette) ---------- */
function giftTin({ imgPrefix = '../../images/' } = {}) {
  const W = 520, H = 560;
  const tinX = 60, tinW = 400, tinTop = 120, tinH = 360;
  const lidRy = 46;
  const spiral = spiralPath(W / 2, tinTop, 2, 30, 3.1);
  const ticks = spiralTicks(W / 2, tinTop, 2, 30, 3.1, 40, 4.2);
  const GOLDK = '#D4A23C', IVORY = '#EFE3C8', BLACK = '#1E1A17', MAROON = '#7A1E2B', MAGENTA = '#A62A6E', GREEN = '#3E7C43';
  const archW = 150, archX = (W - archW) / 2, archY = 314, archH = 120;
  const arch = cuspArch(archX, archY, archW, archH, 5, 0.5);
  const archInner = cuspArch(archX + 6, archY + 6, archW - 12, archH - 12, 5, 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
<defs>
  <style>@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&amp;family=Yatra+One&amp;family=Mulish:wght@400;600;700;800&amp;display=swap');</style>
  <clipPath id="tin-win"><path d="${archInner}"/></clipPath>
  <linearGradient id="tin-shade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".12" stop-color="#000" stop-opacity="0"/>
    <stop offset=".38" stop-color="#fff" stop-opacity=".16"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".5"/>
  </linearGradient>
  <linearGradient id="lid-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
  <filter id="tin-grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
</defs>
<g filter="url(#tin-grain)">
  <!-- contact shadow -->
  <ellipse cx="${W / 2}" cy="${tinTop + tinH + 12}" rx="${tinW / 2 + 10}" ry="18" fill="#000" opacity=".28"/>
  <!-- drum -->
  <path d="M${tinX} ${tinTop} L${tinX} ${tinTop + tinH} A ${tinW / 2} ${lidRy} 0 0 0 ${tinX + tinW} ${tinTop + tinH} L${tinX + tinW} ${tinTop} Z" fill="${BLACK}"/>
  <!-- wrap band artwork: ivory paper wrap on black drum -->
  <g>
    <path d="M${tinX} ${tinTop + 58} L${tinX} ${tinTop + tinH - 26} A ${tinW / 2} ${lidRy} 0 0 0 ${tinX + tinW} ${tinTop + tinH - 26} L${tinX + tinW} ${tinTop + 58} A ${tinW / 2} ${lidRy} 0 0 0 ${tinX} ${tinTop + 58} Z" fill="${IVORY}"/>
    ${paithaniBand(tinX + 14, tinTop + 78, tinW - 28, 24, MAROON, GOLDK, BLACK)}
    <g font-family="'Yatra One',serif" text-anchor="middle">
      <text x="${W / 2 + 2}" y="${tinTop + 152}" font-size="38" fill="${GOLDK}">दिवाळी फराळ</text>
      <text x="${W / 2}" y="${tinTop + 150}" font-size="38" fill="${MAROON}">दिवाळी फराळ</text>
    </g>
    <text x="${W / 2}" y="${tinTop + 172}" text-anchor="middle" font-size="11.5" font-weight="800" letter-spacing="4" fill="${BLACK}">THE FARAL DABBA · SIX SNACKS · ONE TIN</text>
    <path d="M${W / 2 - 90} ${tinTop + 182} h 180" stroke="${GOLDK}" stroke-width="1.2"/>
    <path d="${arch}" fill="${MAROON}"/>
    <g clip-path="url(#tin-win)"><image href="${imgPrefix}faral.jpg" x="${archX - 60}" y="${archY - 55}" width="${archW + 120}" height="${archH + 120}" preserveAspectRatio="xMidYMid slice" style="filter:saturate(1.3) contrast(1.08) brightness(1.05)"/><path d="${archInner}" fill="${MAROON}" style="mix-blend-mode:multiply" opacity=".12"/></g>
    <path d="${archInner}" fill="none" stroke="${GOLDK}" stroke-width="1.6"/>
    <path d="${arch}" fill="none" stroke="${MAROON}" stroke-width="2"/>
    ${rangoliQuarter(tinX + 34, archY + 24, 24, 0, MAROON)}
    ${rangoliQuarter(tinX + tinW - 34, archY + 24, 24, 90, MAROON)}
    <g fill="${GREEN}">
      <path d="M${tinX + 46} ${archY + 92} a 10 10 0 1 0 16 0 a 8 8 0 1 1 -16 0"/>
      <rect x="${tinX + tinW - 62}" y="${archY + 87}" width="11" height="11" transform="rotate(45 ${tinX + tinW - 56.5} ${archY + 92.5})"/>
    </g>
    <text x="${W / 2}" y="${tinTop + tinH - 42}" text-anchor="middle" font-size="10.5" font-style="italic" font-family="'Fraunces',serif" fill="#6B573F">packed by hand in Kothrud, Pune — send it like your maa would.</text>
  </g>
  <!-- drum shading -->
  <path d="M${tinX} ${tinTop} L${tinX} ${tinTop + tinH} A ${tinW / 2} ${lidRy} 0 0 0 ${tinX + tinW} ${tinTop + tinH} L${tinX + tinW} ${tinTop} Z" fill="url(#tin-shade)"/>
  <!-- lid -->
  <ellipse cx="${W / 2}" cy="${tinTop}" rx="${tinW / 2}" ry="${lidRy}" fill="#2A241E" stroke="#3A322A" stroke-width="2"/>
  <ellipse cx="${W / 2}" cy="${tinTop}" rx="${tinW / 2}" ry="${lidRy}" fill="url(#lid-shade)"/>
  <ellipse cx="${W / 2}" cy="${tinTop}" rx="${tinW / 2 - 14}" ry="${lidRy - 7}" fill="none" stroke="${GOLDK}" stroke-width="1.2"/>
  <!-- lid roundel: chakli spiral -->
  <ellipse cx="${W / 2}" cy="${tinTop}" rx="52" ry="${lidRy * 0.62}" fill="${BLACK}" stroke="${GOLDK}" stroke-width="1.6"/>
  <g transform="translate(0 0) scale(1 ${(lidRy * 0.62 / 52).toFixed(3)})" transform-origin="${W / 2} ${tinTop}">
    <path d="${spiral}" fill="none" stroke="${GOLDK}" stroke-width="3" stroke-linecap="round"/>
    <path d="${ticks}" stroke="${GOLDK}" stroke-width="1" opacity=".85"/>
  </g>
</g>
</svg>`;
}

/* ---------- matchbox mini-labels (sunburst emblem set) ---------- */
function matchbox(fl, motifFn, slogan) {
  const W = 240, H = 168;
  // sunburst
  let rays = '';
  const cx = W / 2, cy = H / 2 - 6, r0 = 30, r1 = 118, n = 28;
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * Math.PI * 2 + 0.06, a2 = ((i + 0.5) / n) * Math.PI * 2 - 0.02;
    rays += `<path d="M${F(cx + r0 * Math.cos(a1))} ${F(cy + r0 * Math.sin(a1))} L${F(cx + r1 * Math.cos(a1))} ${F(cy + r1 * Math.sin(a1))} L${F(cx + r1 * Math.cos(a2))} ${F(cy + r1 * Math.sin(a2))} Z" fill="${fl.sku}" opacity=".22"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
<defs><style>@import url('https://fonts.googleapis.com/css2?family=Yatra+One&amp;family=Mulish:wght@700;800&amp;display=swap');</style>
<clipPath id="mb-${fl.id}"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="4"/></clipPath>
<filter id="mbg-${fl.id}"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter></defs>
<g filter="url(#mbg-${fl.id})">
<rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="${PAPER}"/>
<g clip-path="url(#mb-${fl.id})" transform="rotate(-4 ${cx} ${cy})">${rays}</g>
<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="4" fill="none" stroke="${fl.sku}" stroke-width="2.4"/>
<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="2" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="1 3"/>
<circle cx="${cx}" cy="${cy}" r="34" fill="${CREAM}" stroke="${fl.sku}" stroke-width="2"/>
${motifFn(cx, cy, fl)}
<rect x="22" y="${H - 44}" width="${W - 44}" height="24" fill="${fl.sku}"/>
<text x="${cx}" y="${H - 27.5}" text-anchor="middle" font-size="9.5" font-weight="800" letter-spacing="2" fill="${CREAM}">${slogan}</text>
<text x="${cx}" y="26" text-anchor="middle" font-family="'Yatra One',serif" font-size="15" fill="${INK}">${fl.dev}</text>
</g>
</svg>`;
}
const MOTIFS = {
  bhajani: (cx, cy, fl) => `<path d="${spiralPath(cx, cy, 1.6, 22, 3, 120)}" fill="none" stroke="${fl.sku}" stroke-width="3" stroke-linecap="round"/><path d="${spiralTicks(cx, cy, 1.6, 22, 3, 30, 4)}" stroke="${fl.sku}" stroke-width="1"/>`,
  butter: (cx, cy, fl) => `<path d="${spiralPath(cx, cy, 1.6, 22, 3, 120)}" fill="none" stroke="${fl.sku}" stroke-width="5" stroke-linecap="round" opacity=".55"/><path d="${spiralPath(cx, cy, 1.6, 22, 3, 120)}" fill="none" stroke="${fl.sku}" stroke-width="2" stroke-linecap="round"/>`,
  masala: (cx, cy, fl) => `<g transform="translate(${cx - 10} ${cy - 16}) scale(2.1)"><path d="M0 2 C -2 9, 4 14, 8 15 C 5 10, 5 4, 4 1 Z" fill="${fl.sku}"/><path d="M4 1 q 2 -4 6 -3" fill="none" stroke="#35582F" stroke-width="1.6"/></g>`,
  poha: (cx, cy, fl) => `<g fill="${fl.sku}"><ellipse cx="${cx - 8}" cy="${cy - 4}" rx="7" ry="10" transform="rotate(-24 ${cx - 8} ${cy - 4})"/><ellipse cx="${cx + 8}" cy="${cy + 2}" rx="7" ry="10" transform="rotate(18 ${cx + 8} ${cy + 2})"/><ellipse cx="${cx - 1}" cy="${cy + 10}" rx="6" ry="8.5" transform="rotate(-6 ${cx - 1} ${cy + 10})" opacity=".8"/></g>`,
};
const SLOGANS = { bhajani: 'KADAK & HONEST', butter: 'MELTS, THEN CRUNCHES', masala: 'KOLHAPURI HEAT', poha: 'LIGHT AS TALK' };

/* ---------- write files ---------- */
let manifest = [];
for (const fl of FLAVORS) {
  fs.writeFileSync(path.join(OUT, `pouch-${fl.id}.svg`), pouch(fl));
  fs.writeFileSync(path.join(OUT, `matchbox-${fl.id}.svg`), matchbox(fl, MOTIFS[fl.id], SLOGANS[fl.id]));
  manifest.push({ flavor: fl.id, dev: fl.dev, latin: fl.latin, sku: fl.sku, skuDark: fl.skuDark, photo: fl.photo, files: [`pouch-${fl.id}.svg`, `matchbox-${fl.id}.svg`] });
}
fs.writeFileSync(path.join(OUT, 'tin-gift.svg'), giftTin());
manifest.push({ flavor: 'gift', files: ['tin-gift.svg'], palette: 'Kalichandrakala' });
fs.writeFileSync(path.join(OUT, 'manifest-v2.json'), JSON.stringify(manifest, null, 2));

/* preview page (embeds inline so photos + fonts load) */
const inline = f => fs.readFileSync(path.join(OUT, f), 'utf8').replace(/\.\.\/\.\.\/images\//g, '../../assets/images/');
// preview lives in scratchpad; fix image paths to absolute file URLs for preview only
const previewSvg = f => fs.readFileSync(path.join(OUT, f), 'utf8').replace(/\.\.\/\.\.\/images\//g, 'file:///d:/Claude Code Projects/Cmaa/assets/images/');
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Yatra+One&family=Mulish:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>body{background:#2A211A;margin:0;padding:40px;display:flex;flex-wrap:wrap;gap:36px;align-items:flex-start;justify-content:center}
.p{width:340px}.t{width:420px}.m{width:250px}</style></head><body>
${FLAVORS.map(f => `<div class="p">${previewSvg('pouch-' + f.id + '.svg')}</div>`).join('')}
<div class="t">${previewSvg('tin-gift.svg')}</div>
${FLAVORS.map(f => `<div class="m">${previewSvg('matchbox-' + f.id + '.svg')}</div>`).join('')}
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'pack-preview.html'), html);
console.log('wrote', manifest.length, 'entries + preview');
