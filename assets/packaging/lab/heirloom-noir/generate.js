// HEIRLOOM NOIR — Cmaa packaging direction P2 (premium gifting flagship).
// Soft-black ground; gold #D4A23C used ONLY as line-weight (hairlines, filigree,
// circumtext, foil-gradient strokes); Paithani kuyri band; deep maroon accents;
// magenta micro-accents; ivory for critical text. Print-finish simulation:
// gold foil = layered gradient strokes + specular glint sweep, emboss = inner shadow.
// Geometry helpers adapted from tools/gen-packaging.js (spiral / cusped arch /
// paithani grid / ribbon / rangoli quarter). All coordinates computed, not eyeballed.
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

const F = n => +n.toFixed(2);

/* ---------- palette ---------- */
const BLACK = '#1E1A17', BLACK2 = '#262019', BANDBLK = '#27211B';
const GOLD = '#D4A23C', GOLD_DK = '#7A5717', GOLD_HI = '#F4DE9B', GLINT = '#FFF3C6';
const MAROON = '#7A1E2B', MAROON_DK = '#4A1119';
const MAGENTA = '#A62A6E';
const IVORY = '#EFE3C8', IVORY_MUT = '#C4B292';
const GREEN = '#3E7C43';
const IMG = '../../../images/'; // relative to this folder: assets/packaging/lab/heirloom-noir

/* ---------- geometry (borrowed technique: tools/gen-packaging.js) ---------- */

// Archimedean spiral (chakli monogram)
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

// Cusped (multifoil) Mughal arch window: straight sides, 5-cusp arch top.
function cuspArch(x, y, w, h, cusps = 5, springRatio = 0.5) {
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
    d += ` A${F(chord * 0.62)} ${F(chord * 0.62)} 0 0 1 ${x2} ${y2}`;
  }
  d += ` L${F(x + w)} ${F(y + h)} Z`;
  return d;
}

// Paithani kuyri grid, NOIR edition: gold hairline rules, gold-OUTLINED rotated
// squares (line-weight rule), alternating maroon-filled cells, magenta dot-flower
// every 6th cell (the micro-accent).
function paithaniNoir(x, y, w, h, uid) {
  const sq = h * 0.46, gap = 24, n = Math.floor((w - sq) / gap) + 1;
  const off = (w - (n - 1) * gap) / 2;
  let cells = '';
  for (let i = 0; i < n; i++) {
    const cx = x + off + i * gap, cy = y + h / 2;
    if (i % 6 === 3) {
      for (let p = 0; p < 8; p++) {
        const a = (Math.PI * 2 * p) / 8;
        cells += `<circle cx="${F(cx + Math.cos(a) * sq * 0.62)}" cy="${F(cy + Math.sin(a) * sq * 0.62)}" r="${F(sq * 0.15)}" fill="none" stroke="${GOLD}" stroke-width=".8"/>`;
      }
      cells += `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(sq * 0.2)}" fill="${MAGENTA}"/>`;
    } else {
      cells += `<rect x="${F(cx - sq / 2)}" y="${F(cy - sq / 2)}" width="${F(sq)}" height="${F(sq)}" fill="${i % 2 ? MAROON : 'none'}" stroke="${GOLD}" stroke-width=".9" transform="rotate(45 ${F(cx)} ${F(cy)})"/>`;
    }
  }
  return `<g>
    <path d="M${F(x)} ${F(y)} H${F(x + w)}" stroke="url(#foil-${uid})" stroke-width="1.1"/>
    <path d="M${F(x)} ${F(y + h)} H${F(x + w)}" stroke="url(#foil-${uid})" stroke-width="1.1"/>
    ${cells}
  </g>`;
}

// Swallow-tail ribbon (maroon accent, gold hairline edging)
function ribbonNoir(cx, cy, w, h, uid) {
  const x = cx - w / 2, y = cy - h / 2, tail = h * 0.9, fold = h * 0.28;
  return `<g filter="url(#press-${uid})">
    <path d="M${F(x - tail)} ${F(y + h * 0.14)} L${F(x + fold)} ${F(y + h * 0.14)} L${F(x + fold)} ${F(y + h + fold)} L${F(x)} ${F(y + h)} L${F(x - tail + h * 0.42)} ${F(y + h * 0.57)} Z" fill="${MAROON_DK}"/>
    <path d="M${F(x + w + tail)} ${F(y + h * 0.14)} L${F(x + w - fold)} ${F(y + h * 0.14)} L${F(x + w - fold)} ${F(y + h + fold)} L${F(x + w)} ${F(y + h)} L${F(x + w + tail - h * 0.42)} ${F(y + h * 0.57)} Z" fill="${MAROON_DK}"/>
    <rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" fill="${MAROON}"/>
    <path d="M${F(x)} ${F(y + 1)} H${F(x + w)} M${F(x)} ${F(y + h - 1)} H${F(x + w)}" stroke="${GOLD}" stroke-width=".7" opacity=".85"/>
  </g>`;
}

// Quarter-rangoli filigree (gold hairline petals + magenta dot) for corners
function filigree(cx, cy, r, rot) {
  let g = `<g transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="${GOLD}" stroke-width=".9" opacity=".8" stroke-linecap="round">`;
  for (let k = 0; k < 2; k++) {
    g += `<g transform="rotate(${45 * k} ${cx} ${cy})">
      <path d="M${cx} ${cy} q ${F(r * 0.18)} ${F(-r * 0.55)} 0 ${F(-r * 0.95)} q ${F(-r * 0.18)} ${F(r * 0.4)} 0 ${F(r * 0.95)}"/>
    </g>`;
  }
  const a = -Math.PI / 2 + Math.PI / 8;
  g += `<circle cx="${F(cx + Math.cos(a) * r * 1.05)}" cy="${F(cy + Math.sin(a) * r * 1.05)}" r="1.8" fill="${MAGENTA}" stroke="none"/>`;
  const b = -Math.PI / 2 - Math.PI / 8;
  g += `<circle cx="${F(cx + Math.cos(b) * r * 1.05)}" cy="${F(cy + Math.sin(b) * r * 1.05)}" r="1.4" fill="${GOLD}" stroke="none"/>`;
  return g + '</g>';
}

function chilisNoir(x, y, n, lit) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const cx = x + i * 15;
    g += `<g transform="translate(${cx} ${y}) rotate(18)"><path d="M0 2 C -1 8, 3 13, 6 14 C 4 9, 4 4, 3 1 Z" fill="${i < lit ? '#9E2B23' : 'none'}" stroke="#9E2B23" stroke-width="1"/><path d="M3 1 q 2 -3 5 -2" fill="none" stroke="${GREEN}" stroke-width="1.3"/></g>`;
  }
  return g;
}

/* ---------- shared defs ---------- */
function defsBlock(uid, W, H, glintFrom, glintTo) {
  return `<defs>
  <style>@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&amp;family=Yatra+One&amp;family=Noto+Sans+Devanagari:wght@400;600&amp;family=Mulish:wght@400;600;700;800&amp;display=swap');</style>
  <linearGradient id="foil-${uid}" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${GOLD_DK}"/><stop offset=".26" stop-color="${GOLD}"/>
    <stop offset=".44" stop-color="${GOLD_HI}"/><stop offset=".6" stop-color="${GOLD}"/>
    <stop offset="1" stop-color="${GOLD_DK}"/>
  </linearGradient>
  <linearGradient id="glint-${uid}" x1="${glintFrom[0]}" y1="${glintFrom[1]}" x2="${glintTo[0]}" y2="${glintTo[1]}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${GLINT}" stop-opacity="0"/>
    <stop offset=".42" stop-color="${GLINT}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${GLINT}" stop-opacity=".9"/>
    <stop offset=".58" stop-color="${GLINT}" stop-opacity="0"/>
    <stop offset="1" stop-color="${GLINT}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="sheen-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/>
  </linearGradient>
  <radialGradient id="winsh-${uid}" cx=".5" cy=".35" r=".78">
    <stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/>
  </radialGradient>
  <filter id="grain-${uid}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>
  <filter id="press-${uid}" x="-8%" y="-8%" width="116%" height="116%"><feOffset dx="0" dy="1.4" in="SourceAlpha" result="o"/><feGaussianBlur stdDeviation=".7" in="o" result="b"/><feComposite in="b" in2="SourceAlpha" operator="out" result="s"/><feFlood flood-color="#000" flood-opacity=".5"/><feComposite in2="s" operator="in" result="sh"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge></filter>`;
}

/* ==================================================================
   POUCH — Bhajani Chakli, Heirloom Noir flat front
   ================================================================== */
function pouchNoir() {
  const uid = 'hn-bh';
  const W = 460, H = 696;
  const bx = 26, bw = W - 52, bodyY = 42, bodyH = 634; // body 42..676
  // crimp zigzag
  let zz = `M${bx + 6} 33`; const zn = 26, zw = (bw - 12) / zn;
  for (let i = 0; i < zn; i++) zz += ` l${F(zw / 2)} ${i % 2 ? 6 : -6} l${F(zw / 2)} ${i % 2 ? -6 : 6}`;

  const cx = W / 2;
  const roundelCy = 178, roundelR = 56;
  const archW = 236, archX = (W - archW) / 2, archY = 352, archH = 192;
  const arch = cuspArch(archX, archY, archW, archH, 5, 0.5);
  const archInner = cuspArch(archX + 7, archY + 7, archW - 14, archH - 14, 5, 0.5);
  const spiral = spiralPath(cx, roundelCy, 2.2, roundelR * 0.48, 3.1);
  const ticks = spiralTicks(cx, roundelCy, 2.2, roundelR * 0.48, 3.1, 44, 4.4);

  // flanking filigree columns
  const colL = archX - 26, colR = archX + archW + 26;
  let cols = '';
  for (let i = 0; i < 3; i++) {
    const ry = archY + 40 + i * 60;
    cols += `<path d="${spiralPath(colL, ry, 1.1, 8.5, 2.4, 60)}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".8"/>
    <path d="${spiralPath(colR, ry, 1.1, 8.5, 2.4, 60)}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".8"/>`;
    if (i < 2) {
      const dy = archY + 70 + i * 60;
      cols += `<rect x="${F(colL - 3.2)}" y="${F(dy - 3.2)}" width="6.4" height="6.4" transform="rotate(45 ${colL} ${dy})" fill="${MAGENTA}"/>
      <rect x="${F(colR - 3.2)}" y="${F(dy - 3.2)}" width="6.4" height="6.4" transform="rotate(45 ${colR} ${dy})" fill="${MAGENTA}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
${defsBlock(uid, W, H, [archX - 30, archY - 30], [archX + archW * 0.7, archY + archH * 0.7])}
  <clipPath id="body-${uid}"><rect x="${bx}" y="${bodyY}" width="${bw}" height="${bodyH}" rx="14"/></clipPath>
  <clipPath id="win-${uid}"><path d="${archInner}"/></clipPath>
</defs>

<g filter="url(#grain-${uid})">
  <!-- crimp seal -->
  <rect x="${bx}" y="10" width="${bw}" height="15" rx="7" fill="${BLACK2}" stroke="url(#foil-${uid})" stroke-width="1"/>
  <circle cx="${cx}" cy="17.5" r="3.2" fill="none" stroke="${GOLD}" stroke-width="1"/>
  <path d="${zz}" fill="none" stroke="${GOLD}" stroke-width=".9" opacity=".65"/>

  <!-- body -->
  <g clip-path="url(#body-${uid})">
    <rect x="${bx}" y="${bodyY}" width="${bw}" height="${bodyH}" rx="14" fill="${BLACK}"/>
    <rect x="${bx}" y="${bodyY}" width="${bw}" height="${bodyH}" rx="14" fill="url(#sheen-${uid})"/>

    <!-- hairline double frame + corner filigree -->
    <rect x="42" y="58" width="376" height="552" fill="none" stroke="url(#foil-${uid})" stroke-width="1.3"/>
    <rect x="49" y="65" width="362" height="538" fill="none" stroke="${GOLD}" stroke-width=".55" opacity=".55"/>
    ${filigree(49, 65, 19, 135)}
    ${filigree(411, 65, 19, 225)}
    ${filigree(49, 603, 19, 45)}
    ${filigree(411, 603, 19, -45)}

    <!-- paithani kuyri band -->
    ${paithaniNoir(78, 84, 304, 22, uid)}

    <!-- monogram roundel with circumtext -->
    <circle cx="${cx}" cy="${roundelCy}" r="${roundelR}" fill="${BLACK2}" stroke="url(#foil-${uid})" stroke-width="1.7"/>
    <circle cx="${cx}" cy="${roundelCy}" r="${roundelR - 5.5}" fill="none" stroke="${GOLD}" stroke-width=".55" opacity=".6"/>
    <path id="rup-${uid}" d="M ${cx - 43} ${roundelCy} a 43 43 0 0 1 86 0" fill="none"/>
    <path id="rdn-${uid}" d="M ${cx - 42} ${roundelCy} a 42 42 0 0 0 84 0" fill="none"/>
    <!-- Latin gets letterspacing; Devanagari never does -->
    <text font-size="13" font-weight="800" letter-spacing="6" fill="${GOLD}"><textPath href="#rup-${uid}" startOffset="50%" text-anchor="middle">CMAA</textPath></text>
    <text font-size="9" font-weight="600" fill="${GOLD}" font-family="'Noto Sans Devanagari',sans-serif"><textPath href="#rdn-${uid}" startOffset="50%" text-anchor="middle">आजीचा फराळ · पुणे</textPath></text>
    <path d="${spiral}" fill="none" stroke="url(#foil-${uid})" stroke-width="3.2" stroke-linecap="round"/>
    <path d="${ticks}" stroke="${GOLD}" stroke-width=".9" opacity=".8"/>

    <!-- hero Devanagari (ivory, embossed) -->
    <g font-family="'Yatra One','Noto Sans Devanagari',serif" text-anchor="middle" font-size="46">
      <text x="${cx}" y="290" fill="#0A0806" opacity=".8">भाजणी चकली</text>
      <text x="${cx}" y="288" fill="${IVORY}" filter="url(#press-${uid})">भाजणी चकली</text>
    </g>

    <!-- maroon ribbon with latin name -->
    ${ribbonNoir(cx, 318, 252, 26, uid)}
    <text x="${cx}" y="322.5" text-anchor="middle" font-size="12.5" font-weight="800" letter-spacing="3" fill="${IVORY}">BHAJANI CHAKLI</text>

    <!-- cusped-arch die-cut window, gold foil rim -->
    <path d="${arch}" fill="${MAROON_DK}"/>
    <g clip-path="url(#win-${uid})">
      <!-- crop computed: square photo drawn 360x360, food centroid (.53,.47) at window center -->
      <image href="${IMG}chakli-1.jpg" x="39.2" y="272.8" width="360" height="360" preserveAspectRatio="xMidYMid slice" style="filter:saturate(1.25) contrast(1.1) brightness(1.02)"/>
      <path d="${archInner}" fill="${MAROON}" style="mix-blend-mode:multiply" opacity=".16"/>
      <path d="${archInner}" fill="url(#winsh-${uid})"/>
    </g>
    <path d="${archInner}" fill="none" stroke="${GOLD}" stroke-width="1"/>
    <path d="${arch}" fill="none" stroke="url(#foil-${uid})" stroke-width="3.2"/>
    <path d="${arch}" fill="none" stroke="url(#glint-${uid})" stroke-width="3.2"/>

    ${cols}

    <!-- truth strip -->
    <text x="${cx}" y="572" text-anchor="middle" font-family="'Yatra One','Noto Sans Devanagari',serif" font-size="16" fill="${IVORY}">तांदूळ · डाळी · तीळ · देशी तूप — बस्स.</text>
    <path d="M${cx - 112} 581 q 112 8 224 0" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".9"/>
    <text x="${cx}" y="597" text-anchor="middle" font-size="10.5" font-style="italic" font-family="'Fraunces',serif" fill="${IVORY_MUT}">rice · four dals · sesame · ghee — that&#8217;s all.</text>

    <!-- meta row -->
    <g transform="translate(64 615)">
      <rect x="0" y="0" width="15" height="15" fill="none" stroke="${GREEN}" stroke-width="1.5"/><circle cx="7.5" cy="7.5" r="3.9" fill="${GREEN}"/>
    </g>
    <text x="${cx}" y="628" text-anchor="middle" font-family="'Fraunces',serif" font-size="14" font-weight="600" fill="${IVORY}">NET WT · 200 g</text>
    <g>${chilisNoir(352, 613, 3, 2)}</g>

    <!-- footer band -->
    <path d="M${bx} 641 H${bx + bw}" stroke="${GOLD}" stroke-width=".6" opacity=".7"/>
    <rect x="${bx}" y="644" width="${bw}" height="32" fill="${MAROON}"/>
    <text x="${cx}" y="664" text-anchor="middle" font-size="9.5" font-weight="800" letter-spacing="2.2" fill="${IVORY}">BATCH SB-11 · PACKED 02·07·26 · NO PRESERVATIVES</text>
  </g>
</g>
</svg>`;
}

/* ==================================================================
   GIFT TIN — दिवाळी फराळ, front view with wrap band
   ================================================================== */
function tinNoir() {
  const uid = 'hn-tin';
  const W = 560, H = 620;
  const CX = 280, RX = 210, RY = 50;
  const tinX = 70, tinW = 420, tinTop = 130, tinH = 400;
  const bandTop = tinTop + 60, bandBot = tinTop + tinH - 30; // 190..500

  // y of an arc edge (the visible lower half of the wrap ellipse) at x
  const edge = (x, yTop) => yTop + RY * Math.sqrt(Math.max(0, 1 - ((x - CX) / RX) ** 2));
  // sampled path parallel to an arc edge
  const sag = (x0, x1, yTop, off, steps = 56) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const x = x0 + (x1 - x0) * i / steps;
      pts.push([F(x), F(edge(x, yTop) + off)]);
    }
    return 'M' + pts.map(p => p.join(' ')).join(' L');
  };

  const drum = `M${tinX} ${tinTop} L${tinX} ${tinTop + tinH} A ${RX} ${RY} 0 0 0 ${tinX + tinW} ${tinTop + tinH} L${tinX + tinW} ${tinTop} Z`;
  const band = `M${tinX} ${bandTop} L${tinX} ${bandBot} A ${RX} ${RY} 0 0 0 ${tinX + tinW} ${bandBot} L${tinX + tinW} ${bandTop} A ${RX} ${RY} 0 0 0 ${tinX} ${bandTop} Z`;

  // paithani cells along the curved band
  let pcells = '';
  const px0 = 112, px1 = 448, pgap = 24, pn = Math.floor((px1 - px0) / pgap) + 1;
  const psq = 10;
  for (let i = 0; i < pn; i++) {
    const x = px0 + i * pgap, y = edge(x, bandTop) + 24;
    if (i % 6 === 3) {
      for (let p = 0; p < 8; p++) {
        const a = (Math.PI * 2 * p) / 8;
        pcells += `<circle cx="${F(x + Math.cos(a) * psq * 0.62)}" cy="${F(y + Math.sin(a) * psq * 0.62)}" r="1.5" fill="none" stroke="${GOLD}" stroke-width=".8"/>`;
      }
      pcells += `<circle cx="${F(x)}" cy="${F(y)}" r="2" fill="${MAGENTA}"/>`;
    } else {
      pcells += `<rect x="${F(x - psq / 2)}" y="${F(y - psq / 2)}" width="${psq}" height="${psq}" fill="${i % 2 ? MAROON : 'none'}" stroke="${GOLD}" stroke-width=".9" transform="rotate(45 ${F(x)} ${F(y)})"/>`;
    }
  }

  // cusped dome overshoots its box by R*0.92 - h*springRatio (~24px): keep archY low
  // enough that the dome apex (spring - 78.2) clears the caps line at y=368.
  const archW = 170, archX = CX - archW / 2, archY = 404, archH = 108;
  const arch = cuspArch(archX, archY, archW, archH, 5, 0.5);
  const archInner = cuspArch(archX + 6, archY + 6, archW - 12, archH - 12, 5, 0.5);

  const spiral = spiralPath(CX, tinTop, 1.8, 27, 3.1);
  const ticks = spiralTicks(CX, tinTop, 1.8, 27, 3.1, 40, 4);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'Mulish',system-ui,sans-serif">
${defsBlock(uid, W, H, [archX - 24, archY - 24], [archX + archW * 0.72, archY + archH * 0.72])}
  <clipPath id="win-${uid}"><path d="${archInner}"/></clipPath>
  <linearGradient id="drum-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".14" stop-color="#000" stop-opacity=".08"/>
    <stop offset=".36" stop-color="#fff" stop-opacity=".1"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".55"/>
  </linearGradient>
  <linearGradient id="lid-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".3"/>
  </linearGradient>
  <path id="bandarc-${uid}" d="${sag(104, 456, bandBot, -20)}"/>
</defs>

<g filter="url(#grain-${uid})">
  <!-- contact shadow -->
  <ellipse cx="${CX}" cy="583" rx="${tinW / 2 + 12}" ry="15" fill="#000" opacity=".32"/>

  <!-- drum -->
  <path d="${drum}" fill="${BLACK}"/>

  <!-- wrap band (soft-black paper over metal) -->
  <path d="${band}" fill="${BANDBLK}"/>
  <path d="${sag(tinX, tinX + tinW, bandTop, 0)}" fill="none" stroke="url(#foil-${uid})" stroke-width="1.2"/>
  <path d="${sag(tinX, tinX + tinW, bandBot, 0)}" fill="none" stroke="url(#foil-${uid})" stroke-width="1.2"/>
  <path d="${sag(tinX + 4, tinX + tinW - 4, bandTop, 7)}" fill="none" stroke="${GOLD}" stroke-width=".55" stroke-dasharray="1 3" opacity=".7"/>
  <path d="${sag(tinX + 4, tinX + tinW - 4, bandBot, -7)}" fill="none" stroke="${GOLD}" stroke-width=".55" stroke-dasharray="1 3" opacity=".7"/>

  <!-- paithani kuyri row following the curve -->
  <path d="${sag(px0 - 10, px1 + 10, bandTop, 12)}" fill="none" stroke="${GOLD}" stroke-width=".8" opacity=".8"/>
  <path d="${sag(px0 - 10, px1 + 10, bandTop, 36)}" fill="none" stroke="${GOLD}" stroke-width=".8" opacity=".8"/>
  ${pcells}

  <!-- lockup -->
  <g font-family="'Yatra One','Noto Sans Devanagari',serif" text-anchor="middle" font-size="44">
    <text x="${CX}" y="332" fill="#0A0806" opacity=".8">दिवाळी फराळ</text>
    <text x="${CX}" y="330" fill="${IVORY}" filter="url(#press-${uid})">दिवाळी फराळ</text>
  </g>
  <path d="M${CX - 108} 344 Q ${CX} 354 ${CX + 108} 344" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".9"/>
  <rect x="${F(CX - 3)}" y="${F(345)}" width="6" height="6" transform="rotate(45 ${CX} 348)" fill="${MAGENTA}"/>
  <text x="${CX}" y="368" text-anchor="middle" font-size="10" font-weight="800" letter-spacing="3" fill="${IVORY}">THE FARAL DABBA · SIX SNACKS · ONE TIN</text>

  <!-- arch window with faral photo -->
  <path d="${arch}" fill="${MAROON_DK}"/>
  <g clip-path="url(#win-${uid})">
    <!-- crop computed in photo px: food rect (170,375)-(444,588) of 623x830 mapped to window at scale 0.62 -->
    <image href="${IMG}faral.jpg" x="89.6" y="147.3" width="386.3" height="514.6" preserveAspectRatio="xMidYMid slice" style="filter:saturate(1.25) contrast(1.1) brightness(1)"/>
    <path d="${archInner}" fill="${MAROON}" style="mix-blend-mode:multiply" opacity=".08"/>
    <path d="${archInner}" fill="${MAROON}" style="mix-blend-mode:multiply" opacity=".14"/>
    <path d="${archInner}" fill="url(#winsh-${uid})"/>
  </g>
  <path d="${archInner}" fill="none" stroke="${GOLD}" stroke-width=".9"/>
  <path d="${arch}" fill="none" stroke="url(#foil-${uid})" stroke-width="2.8"/>
  <path d="${arch}" fill="none" stroke="url(#glint-${uid})" stroke-width="2.8"/>

  <!-- flanking filigree -->
  ${filigree(150, 448, 22, 90)}
  ${filigree(410, 448, 22, -90)}
  <path d="${spiralPath(150, 494, 1.1, 8.5, 2.4, 60)}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".8"/>
  <path d="${spiralPath(410, 494, 1.1, 8.5, 2.4, 60)}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".8"/>

  <!-- curved caption along band bottom -->
  <text font-size="10.5" font-style="italic" font-family="'Fraunces',serif" fill="${IVORY_MUT}"><textPath href="#bandarc-${uid}" startOffset="50%" text-anchor="middle">packed by hand in Kothrud, Pune — send it like your maa would.</textPath></text>

  <!-- drum hoop + cylinder shading -->
  <path d="${sag(tinX, tinX + tinW, bandBot + 20, 0)}" fill="none" stroke="${GOLD}" stroke-width=".6" opacity=".4"/>
  <path d="${drum}" fill="url(#drum-${uid})"/>

  <!-- lid -->
  <ellipse cx="${CX}" cy="${tinTop}" rx="${RX}" ry="${RY}" fill="#29231C" stroke="#3A322A" stroke-width="1.6"/>
  <ellipse cx="${CX}" cy="${tinTop}" rx="${RX}" ry="${RY}" fill="url(#lid-${uid})"/>
  <ellipse cx="${CX}" cy="${tinTop}" rx="${RX - 7}" ry="${RY - 3.5}" fill="none" stroke="${GOLD}" stroke-width=".5" opacity=".5"/>
  <ellipse cx="${CX}" cy="${tinTop}" rx="${RX - 15}" ry="${RY - 7}" fill="none" stroke="${GOLD}" stroke-width=".9" opacity=".85"/>
  <ellipse cx="${CX}" cy="${tinTop}" rx="56" ry="28" fill="${BLACK}" stroke="url(#foil-${uid})" stroke-width="1.6"/>
  <g transform="translate(${CX} ${tinTop}) scale(1 .5) translate(${-CX} ${-tinTop})">
    <path d="${spiral}" fill="none" stroke="url(#foil-${uid})" stroke-width="2.8" stroke-linecap="round"/>
    <path d="${ticks}" stroke="${GOLD}" stroke-width=".9" opacity=".8"/>
  </g>
</g>
</svg>`;
}

/* ---------- emit ---------- */
fs.writeFileSync(path.join(OUT, 'pouch-bhajani.svg'), pouchNoir());
fs.writeFileSync(path.join(OUT, 'tin-diwali-faral.svg'), tinNoir());

const manifest = [
  {
    id: 'heirloom-noir-bhajani-flat',
    name: 'Bhajani Chakli — Heirloom Noir pouch',
    concept: 'Premium gifting flagship. Soft-black ground, gold restricted to line-weight (foil-gradient hairlines, filigree corners, circumtext roundel), Paithani kuyri band with magenta micro-accents, maroon ribbon + footer, ivory Devanagari hero lettering with emboss, product visible through a gold-rimmed cusped-arch die-cut. Craft-chocolate / single-malt shelf register.',
    files: ['assets/packaging/lab/heirloom-noir/pouch-bhajani.svg']
  },
  {
    id: 'heirloom-noir-gift-tin',
    name: 'दिवाळी फराळ gift tin — Heirloom Noir (front, wrap band)',
    concept: 'Black Diwali tin, front elevation with soft-black paper wrap band edged in gold foil hairlines. Curved Paithani kuyri row and curved caption follow the drum geometry; ivory दिवाळी फराळ lockup embossed; faral spread visible through gold-rimmed cusped arch; chakli-spiral gold monogram on the lid.',
    files: ['assets/packaging/lab/heirloom-noir/tin-diwali-faral.svg']
  }
];
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('heirloom-noir: wrote pouch-bhajani.svg, tin-diwali-faral.svg, manifest.json');
