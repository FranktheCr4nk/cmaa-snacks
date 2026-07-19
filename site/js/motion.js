/* ============================================================
   SEEMA v4 "UNWIND: LOUD" — motion.js · motion revision agent
   ------------------------------------------------------------
   All motion for the one-line site, re-registered to the LOUD
   family (docs/v4-creative-brief.md is LAW). GSAP 3 +
   ScrollTrigger + Lenis (globals from js/vendor/ BEFORE this
   module). ES module: imports the 5 spiral states from
   ../assets/svg/spiral-states.js.

   SURVIVES FROM v3 (untouched cores):
     · spiral morph engine (5 states × 240 pts, per-point lerp)
     · loader asset-progress + dashoffset draw (1.2 s floor)
     · pose engine for the traveling line (B0→B10 journey)
     · reduced-motion end-state mode · mobile shortening
     · 60 fps discipline: transform/opacity/clip-path only on
       scrub; the ONLY scrub-time filter is B5's sticker shadow
       (9 small cutouts, brief-specced)

   NEW IN v4 (brief §1–3):
     · WORLD ENGINE — two stacked fixed layers behind everything;
       chapter color-flips crossfade them (compositor-only) while
       the --world-* custom props on <body> lerp for token
       consumers. Modes: tween 600ms · slam (B0→B1 circle
       clip-wipe 450ms) · cut (B6, 1 frame) · dissolve (B8 900ms)
     · FLIGHT ENGINE — #flyer manual FLIP between
       [data-flyer-slot] slots, 0.8s power3.inOut, arc + 6° roll,
       world flip + src dip-swap (turn illusion) at midpoint
     · KINETIC TYPE — per-word clip-mask rises (yPercent 115→0,
       rot 4→0, stagger .055/.04), stroke-echo clones ×2 desktop
       / ×1 mobile with .06/.12s lag + ±6px scrub drift,
       one .u-punch scale-word per chapter
     · counting numbers: B2 clock 00:00→04:30 · B4 zeros
       countdown · B9 batch odometer
     · B4/B9 dial momentum spin (velocity lerp — the instrument
       has mass) · B6 color-slam + shard burst + viewport shake
     · B7 horizontal shelf (−200vw, per-panel worlds, snap;
       native scroll-snap carousel on mobile)
     · B9 stamp slap at 2.2→1 with nudge + crumb kick
     · B10 seal glow — the site's only idle loop

   HOOK CONTRACT (markup expectations for agent F; the test
   scaffold site/motion-test.html carries all of them):
     sections #b0…#b10, each with data-world="haldi|chili|leaf|
       roast|ghee|cream" (that static class IS the no-JS /
       reduced-motion rendering; html.is-flip-live hides it)
     #spiral-master traveling line (svg outside #b0, direct child
       of <body>, inline visibility:hidden)
     #flyer > .flyer__lift > img[data-turn-1|2|3]
     [data-flyer-slot="b1"|"b5"] slot divs (aspect reserved,
       containing a .slot-static fallback img)
     [data-split] headlines (word-rise) · [data-echo] (stroke
       clones) · .u-punch (one scale word per chapter)
     .crumb-layer[data-depth] hero particle layers (≤3)
     #b2-clock · #b3 .wall ×5 · #b4 .zeros .zero-num ×4
     #b6 [id^=burst-] · #b6 .crunch-media
     #b7 .shelf-track > .shelf-panel[data-world] ×3
     #b9 .stamp #stamp-batch-no · .crumb__chapter · .order-pill
     .scroll-cue · .dial .dial__pill .dial-card · .ledger__row
   Toggles ONLY: .is-active .is-docked .is-hidden .is-endstate,
   body[data-world][data-ink], html.is-flip-live, --world-*
   custom props (+ inline transforms/opacity/clip-path).

   Easing doctrine: entrances expo.out · scrubs power2 · exactly
   TWO overshoots (B0 hero punch, B9 stamp) + sanctioned §2
   .u-punch word entrances · exactly ONE hard cut (B6) · exactly
   ONE cream beat (B8) · exactly ONE idle loop (B10 seal glow).
   ============================================================ */

import { states as STATE_D } from '../assets/svg/spiral-states.js';

const doc = document;
const rootEl = doc.documentElement;
const bodyEl = doc.body;
const qs = (s, c = doc) => c.querySelector(s);
const qsa = (s, c = doc) => Array.from(c.querySelectorAll(s));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const missing = [];
const noteMissing = (label) => { if (!missing.includes(label)) missing.push(label); };

const EASE_ENTER = 'expo.out';          /* cubic-bezier(.16,1,.3,1)        */
const EASE_SCRUB = 'power2.inOut';
const EASE_SLAP  = 'back.out(1.8)';     /* ≈ cubic-bezier(.34,1.56,.64,1)  */

/* ------------------------------------------------------------
   v4 COLOR WORLDS (brief §1.1) — base/light/deep build the
   anchor's radial recipe; ink + echo accent per §1.2.
   ------------------------------------------------------------ */
const INK = { roast: '#201510', milk: '#FFF4E2', haldi: '#F7AE00' };
const WORLDS = {
  haldi: { base: '#F7AE00', light: '#FFC414', deep: '#C96E00', ink: 'roast', accent: '#C8301B' },
  chili: { base: '#C8301B', light: '#E8491F', deep: '#8F1F10', ink: 'milk',  accent: '#FFC933' },
  leaf:  { base: '#0E7B3D', light: '#16994E', deep: '#07522A', ink: 'milk',  accent: '#F7AE00' },
  roast: { base: '#201510', light: '#3A2417', deep: '#120B07', ink: 'milk',  accent: '#F7AE00' },
  ghee:  { base: '#FFC933', light: '#FFDD70', deep: '#E8A800', ink: 'roast', accent: '#C8301B' },
  cream: { base: '#F6EDDD', light: '#FFFDF6', deep: '#E9DCC4', ink: 'roast', accent: '#C8301B' },
};
const worldGradient = (w) =>
  `radial-gradient(120% 90% at 35% 12%, ${w.light} 0%, ${w.base} 55%, ${w.deep} 130%)`;
/* traveling line ink per world (§1.2): roast on light, milk on
   dark, haldi on roast */
const LINE_INK = { haldi: INK.roast, ghee: INK.roast, cream: INK.roast, chili: INK.milk, leaf: INK.milk, roast: INK.haldi };
/* the flip score (§1.3) — B0 opens roast; B7 is per-panel */
const WORLD_BY_BEAT = { 1: 'haldi', 2: 'roast', 3: 'chili', 4: 'ghee', 5: 'leaf', 6: 'chili', 7: 'haldi', 8: 'cream', 9: 'haldi', 10: 'roast' };
const SHELF_WORLDS = ['haldi', 'chili', 'leaf'];

/* ------------------------------------------------------------
   0 · guards + shared state
   ------------------------------------------------------------ */
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const REDUCED_MQ = window.matchMedia('(prefers-reduced-motion: reduce)');

let lenis = null;
let loaderDone = false;
let resolveLoader;
const loaderPromise = new Promise((res) => { resolveLoader = res; });
let heroIntroPlayed = false;

/* ------------------------------------------------------------
   1 · batch number (prefer #stamp-batch-no; else WWYY)
   ------------------------------------------------------------ */
function computeBatch() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = d.getTime();
  d.setUTCMonth(0, 1);
  if (d.getUTCDay() !== 4) d.setUTCMonth(0, 1 + ((4 - d.getUTCDay()) + 7) % 7);
  const week = 1 + Math.round((firstThursday - d.getTime()) / 604800000);
  return String(week).padStart(2, '0') + String(now.getFullYear() % 100).padStart(2, '0');
}
const batchEl = qs('#stamp-batch-no');
const BATCH = (batchEl && batchEl.textContent.trim()) || computeBatch();

const CHAPTERS = [
  'BATCH ' + BATCH, 'ONE PAIR OF HANDS', '04:30', 'NO SHORTCUTS',
  'NOTHING TO HIDE', 'EVERYTHING INSIDE', 'THE CRUNCH', 'THE SHELF',
  'HERSELF', 'FRESH BY BATCH', 'TO YOURS',
];
/* pin distances ×viewport-height: [desktop, mobile (−40%)] — §3 */
const PIN = {
  b1: [1.2, 0.8], b2: [1.8, 1.2], b3: [3.2, 2.2], b4: [2.5, 1.5],
  b5: [3.2, 0], b6: [1.2, 0.8], b7: [3.0, 0], b8: [1.5, 1.0], b9: [2.2, 1.5],
};

/* ------------------------------------------------------------
   2 · the morph engine — 5 same-count states, per-point lerp
   (v3 core, untouched). Pre-parsed to Float64Arrays at load;
   per frame: one lerp + one setAttribute('d').
   ------------------------------------------------------------ */
const STATE_ARR = {};
const STATE_BOX = {};
for (const name of Object.keys(STATE_D)) {
  const arr = Float64Array.from(STATE_D[name].match(/-?[\d.]+/g).map(Number));
  STATE_ARR[name] = arr;
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i] < minX) minX = arr[i];
    if (arr[i] > maxX) maxX = arr[i];
    if (arr[i + 1] < minY) minY = arr[i + 1];
    if (arr[i + 1] > maxY) maxY = arr[i + 1];
  }
  STATE_BOX[name] = {
    minX, minY, w: maxX - minX, h: maxY - minY,
    cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
  };
}
const scratch = new Float64Array(STATE_ARR.coiled.length);
const dParts = new Array(STATE_ARR.coiled.length / 2);

function buildD(arr) {
  for (let i = 0, p = 0; i < arr.length; i += 2, p++) {
    dParts[p] = (Math.round(arr[i] * 100) / 100) + ' ' + (Math.round(arr[i + 1] * 100) / 100);
  }
  return 'M' + dParts.join('L');
}

/* the one traveling line */
const linePath = qs('#spiral-master');
const lineWrap = linePath ? linePath.closest('svg') : null;
if (!linePath) noteMissing('#spiral-master (traveling line path)');
let lastD = '';
function drawLine(nameA, nameB, t) {
  if (!linePath) return;
  let d;
  if (nameA === nameB || t <= 0) d = STATE_D[nameA];
  else if (t >= 1) d = STATE_D[nameB];
  else {
    const a = STATE_ARR[nameA], b = STATE_ARR[nameB];
    for (let i = 0; i < a.length; i++) scratch[i] = a[i] + (b[i] - a[i]) * t;
    d = buildD(scratch);
  }
  if (d !== lastD) { linePath.setAttribute('d', d); lastD = d; }
}

/* ------------------------------------------------------------
   3 · pose engine — the wrapper FLIP for the line (v3 core)
   ------------------------------------------------------------ */
const vw = () => window.innerWidth;
const vh = () => window.innerHeight;
const isMobileNow = () => vw() < 768;
const pageMargin = () => Math.min(Math.max(20, vw() * 0.06), 96);

function poseCenter(box, cx, cy, s) {
  return { x: cx - box.cx * s, y: cy - box.cy * s, s };
}
/* untransformed centre of el measured inside its section via the
   offset tree (immune to in-flight gsap transforms) */
function pinnedCenter(sec, el) {
  if (!sec || !el) return null;
  let x = 0, y = 0, node = el;
  while (node && node !== sec && sec.contains(node)) {
    x += node.offsetLeft; y += node.offsetTop;
    node = node.offsetParent;
  }
  return { cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
}
function b5Center() {
  const sec = qs('#b5');
  if (!sec) return null;
  return qs('[data-flyer-slot="b5"]', sec) || qs('.slot--1x1:not(.slot--cutout)', sec) ||
         qsa('picture, img', sec).find((el) => !el.closest('.slot--cutout, .shelf-panel')) || null;
}

const POSES = {
  loader() {
    const stage = isMobileNow() ? 240 : 320;
    const cy = (isMobileNow() ? 0.44 : 0.46) * vh();
    const box = STATE_BOX.coiled;
    const s = stage / Math.max(box.w, box.h);
    return poseCenter(box, vw() / 2, cy, s);
  },
  rule() {
    const m = pageMargin();
    const s = (vw() - 2 * m) / 920;                       /* unwound runs x 40→960 */
    const y = (isMobileNow() ? 0.90 : 0.94) * vh();       /* v4: horizon rule beneath the XXL sandwich */
    return { x: m - 40 * s, y: y - 500 * s, s };
  },
  snake(kvh) {
    const m = pageMargin();
    const col = (vw() - 2 * m) / 12;
    const inset = isMobileNow() ? m : m + col;            /* cols 2–11 */
    const s = (vw() - 2 * inset) / 920;
    return { x: inset - 40 * s, y: kvh * vh() - 500 * s, s };
  },
  dialCircle(secSel) {
    const sec = qs(secSel);
    const dial = sec && sec.querySelector('.dial');
    let cx, cy, w;
    const c = dial && pinnedCenter(sec, dial);
    if (c) { cx = c.cx; cy = c.cy; w = c.w; }
    else {
      cx = vw() / 2;
      cy = (isMobileNow() ? 0.40 : 0.54) * vh();
      w = isMobileNow() ? Math.min(0.84 * vw(), 336) : Math.min(0.72 * vh(), 704);
    }
    /* circled state: centre (500,500), Ø 760 units → ring Ø = dial·(540/680) */
    const s = (w * (540 / 680)) / 760;
    return { x: cx - 500 * s, y: cy - 500 * s, s };
  },
  rim() {
    const sec = qs('#b5');
    const center = b5Center();
    const c = center && pinnedCenter(sec, center);
    let cx, cy, dia;
    if (c) { cx = c.cx; cy = c.cy; dia = Math.max(c.w, c.h) * 1.14; }
    else { cx = vw() / 2; cy = 0.52 * vh(); dia = 0.42 * vh() * 1.14; }
    const s = dia / 760;
    return { x: cx - 500 * s, y: cy - 500 * s, s };
  },
  seal() {
    const b10 = qs('#b10');
    const size = isMobileNow() ? 128 : 180;
    const box = STATE_BOX.recoiled;
    const s = size / Math.max(box.w, box.h);
    let cy = 0.26 * vh();
    if (b10 && window.ScrollTrigger) {
      const docTop = b10.getBoundingClientRect().top + window.scrollY;
      const topAtEnd = Math.max(0, docTop - window.ScrollTrigger.maxScroll(window));
      cy = topAtEnd + (isMobileNow() ? 0.20 : 0.26) * vh();
    }
    return poseCenter(box, vw() / 2, cy, s);
  },
};

function applyPose(p) {
  if (!lineWrap || !p) return;
  window.gsap.set(lineWrap, { x: p.x, y: p.y, scale: p.s });
}
function lerpPose(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: a.s + (b.s - a.s) * t };
}

/* ============================================================
   4 · WORLD ENGINE (new — brief §1.3 implementation note)
   Two fixed gradient layers at z −3/−2 behind everything;
   flips crossfade opacity (compositor) while <body>'s --world-*
   custom props lerp once per flip (never per scroll frame).
   ============================================================ */
const world = {
  cur: 'roast', layers: null, top: 0, ready: false,
  init() {
    if (this.ready || !hasGSAP) return;
    const gsap = window.gsap;
    const mk = (z) => {
      const el = doc.createElement('div');
      el.className = 'world-layer';
      el.setAttribute('aria-hidden', 'true');
      gsap.set(el, {
        position: 'fixed', inset: 0, zIndex: z, pointerEvents: 'none',
        background: worldGradient(WORLDS.roast), autoAlpha: 1,
      });
      bodyEl.insertBefore(el, bodyEl.firstChild);
      return el;
    };
    this.layers = [mk(-2), mk(-3)];
    this.top = 0;
    rootEl.classList.add('is-flip-live');   /* sections drop their static worlds */
    this.applyProps('roast', 0);
    this.ready = true;
  },
  applyProps(name, dur) {
    const gsap = window.gsap;
    const w = WORLDS[name];
    const vars = {
      '--world-base': w.base, '--world-light': w.light, '--world-deep': w.deep,
      '--world-ink': INK[w.ink], '--world-accent': w.accent,
    };
    if (dur > 0) gsap.to(bodyEl, { ...vars, duration: dur, ease: 'power1.inOut', overwrite: 'auto' });
    else gsap.set(bodyEl, vars);
    bodyEl.dataset.world = name;
    bodyEl.dataset.ink = w.ink;
    if (lineWrap) {
      if (dur > 0) gsap.to(lineWrap, { color: LINE_INK[name], duration: dur, ease: 'power1.inOut', overwrite: 'auto' });
      else gsap.set(lineWrap, { color: LINE_INK[name] });
    }
  },
  /* mode: 'tween' (600ms) | 'cut' (1 frame) | 'dissolve' (900ms)
     | 'slam' (450ms circle clip-wipe from origin {x,y}) */
  set(name, opts = {}) {
    if (!this.ready || !WORLDS[name]) return;
    if (name === this.cur && !opts.force) return;
    const gsap = window.gsap;
    const mode = opts.mode || 'tween';
    const dur = mode === 'cut' ? 0 : mode === 'slam' ? 0.45 : mode === 'dissolve' ? 0.9 : (opts.duration || 0.6);
    this.cur = name;
    const inEl = this.layers[1 - this.top];
    const outEl = this.layers[this.top];
    this.top = 1 - this.top;
    gsap.killTweensOf([inEl, outEl]);
    inEl.style.background = worldGradient(WORLDS[name]);
    gsap.set(inEl, { zIndex: -2 });
    gsap.set(outEl, { zIndex: -3 });
    const settle = () => gsap.set(outEl, { autoAlpha: 0, clipPath: 'none' });
    if (mode === 'cut') {
      gsap.set(inEl, { autoAlpha: 1, clipPath: 'none' });
      settle();
    } else if (mode === 'slam') {
      const o = opts.origin || { x: vw() / 2, y: vh() / 2 };
      gsap.set(inEl, { autoAlpha: 1, clipPath: `circle(0% at ${o.x}px ${o.y}px)` });
      gsap.to(inEl, {
        clipPath: `circle(150% at ${o.x}px ${o.y}px)`, duration: dur, ease: 'power4.in',
        onComplete() { gsap.set(inEl, { clipPath: 'none' }); settle(); },
      });
    } else {
      gsap.set(inEl, { clipPath: 'none' });
      gsap.fromTo(inEl, { autoAlpha: 0 }, {
        autoAlpha: 1, duration: dur, ease: 'power1.inOut', overwrite: 'auto',
        onComplete: settle,
      });
    }
    this.applyProps(name, dur);
  },
};

/* ============================================================
   5 · KINETIC TYPE ENGINE (new — brief §2)
   splitWords: idempotent word-mask splitter (child elements =
   single tokens, so .u-punch spans survive). buildEcho: wraps
   content in .t-fill and appends stroked clones. Minimal
   structural CSS injected here so the engine is self-contained.
   ============================================================ */
(function injectTypeCSS() {
  const st = doc.createElement('style');
  st.textContent = [
    '.w-mask{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.08em;margin-bottom:-0.08em}',
    '.w{display:inline-block;transform-origin:0% 100%}',
    '[data-echo]{position:relative}',
    '.t-fill{position:relative;z-index:2;display:block}',
    '.t-echo{position:absolute;inset:0;z-index:0;display:block;color:transparent!important;',
    '-webkit-text-stroke:2px var(--echo-ink,currentColor);pointer-events:none;user-select:none}',
  ].join('');
  doc.head.appendChild(st);
})();

function splitWords(el) {
  if (!el || el.dataset.splitDone) return qsa('.w', el);
  const tokens = [];
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((piece) => {
          if (!piece) return;
          tokens.push(/^\s+$/.test(piece) ? doc.createTextNode(' ') : piece);
        });
      } else if (n.nodeType === 1) tokens.push(n);   /* element = one token */
    });
  };
  walk(el);
  el.textContent = '';
  tokens.forEach((t) => {
    if (t.nodeType === 3) { el.appendChild(t); return; }
    const mask = doc.createElement('span');
    mask.className = 'w-mask';
    const w = doc.createElement('span');
    w.className = 'w';
    if (typeof t === 'string') w.textContent = t;
    else w.appendChild(t);
    mask.appendChild(w);
    el.appendChild(mask);
  });
  el.dataset.splitDone = '1';
  return qsa('.w', el);
}

/* wraps the (already split) content in .t-fill + appends echo
   clones. Echo stroke color = the section/panel world's accent. */
function buildEcho(el, count) {
  if (!el || el.dataset.echoDone) return qsa('.t-echo', el);
  const host = el.closest('[data-world]');
  const wname = host && host.dataset.world;
  const accent = (wname && WORLDS[wname]) ? WORLDS[wname].accent : 'currentColor';
  const fill = doc.createElement('span');
  fill.className = 't-fill';
  while (el.firstChild) fill.appendChild(el.firstChild);
  el.appendChild(fill);
  const offs = [[0.045, 0.05, 0.5], [0.09, 0.1, 0.25]];
  const echoes = [];
  for (let i = 0; i < count; i++) {
    const c = fill.cloneNode(true);
    c.className = 't-echo';
    c.setAttribute('aria-hidden', 'true');
    c.style.setProperty('--echo-ink', accent);
    c.style.left = offs[i][0] + 'em';
    c.style.top = offs[i][1] + 'em';
    c.style.opacity = String(offs[i][2]);
    el.insertBefore(c, fill);   /* fill stays painted on top (z 2) */
    echoes.push(c);
  }
  el.dataset.echoDone = '1';
  return echoes;
}

/* per-word clip-mask rise across fill + echo layers.
   tl===null → plays now (entrance); tl → placed at `at` (scrub). */
function riseWords(tl, el, opts = {}) {
  const gsap = window.gsap;
  if (!el) return;
  const mob = isMobileNow();
  splitWords(el);
  const layers = [el.querySelector('.t-fill') || el];
  if (el.dataset.echoDone) layers.push(...qsa('.t-echo', el));
  const stag = opts.stagger != null ? opts.stagger : (mob ? 0.04 : 0.055);
  const dur = opts.dur != null ? opts.dur : 0.7;
  const lag = opts.lag != null ? opts.lag : 0.06;
  layers.forEach((layer, li) => {
    const words = qsa('.w', layer);
    if (!words.length) return;
    const vars = {
      yPercent: 0, rotate: 0, duration: dur, ease: opts.ease || EASE_ENTER,
      stagger: stag, overwrite: 'auto',
    };
    const from = { yPercent: 115, rotate: 4 };
    const layerAt = (opts.at || 0) + li * lag * (opts.lagScale != null ? opts.lagScale : 1);
    if (tl) tl.fromTo(words, from, vars, layerAt);
    else gsap.fromTo(words, from, { ...vars, delay: layerAt });
    /* the chapter's single scale-punch word (fill layer only) */
    if (li === 0 && !opts.noPunch) {
      const punch = layer.querySelector('.u-punch');
      if (punch) {
        const pw = punch.closest('.w') || punch;
        const pv = { scale: 1, duration: dur * 0.9, ease: EASE_SLAP, overwrite: 'auto' };
        if (tl) tl.fromTo(pw, { scale: 1.35 }, pv, layerAt + stag);
        else gsap.fromTo(pw, { scale: 1.35 }, { ...pv, delay: layerAt + stag });
      }
    }
  });
}

/* echo drift ±6px at differing scrub speeds (screen-print that
   never dries) — one scrub trigger per echoed headline */
function echoDrift(el, trigEl) {
  const gsap = window.gsap;
  const echoes = qsa('.t-echo', el);
  echoes.forEach((c, i) => {
    gsap.fromTo(c, { y: i ? 6 : -6 }, {
      y: i ? -6 : 6, ease: 'none',
      scrollTrigger: { trigger: trigEl || el, start: 'top bottom', end: 'bottom top', scrub: i ? 0.6 : 0.25 },
    });
  });
}

/* ============================================================
   6 · FLIGHT ENGINE (new — brief §3 "THE FLIGHT ENGINE")
   Manual FLIP: #flyer is fixed, sized once from slot b1, posed
   with x/y/scale (origin 50% 50%). Flights are 0.8s
   power3.inOut boundary one-shots with 6° roll + arc on the
   inner .flyer__lift; src dip-swap (80ms to 0.85) sells the
   scroll-turn illusion. Reduced motion: #flyer never boots and
   each slot's .slot-static image stands.
   ============================================================ */
const flyer = {
  el: null, lift: null, img: null, slots: {}, baseW: 1, baseH: 1,
  parked: 'b1', flying: false, hidden: false, ready: false, idleTl: null,
  init() {
    if (this.ready || !hasGSAP) return;
    const gsap = window.gsap;
    this.el = qs('#flyer');
    if (!this.el) { noteMissing('#flyer (flight engine element)'); return; }
    this.lift = qs('.flyer__lift', this.el) || this.el;
    this.img = qs('img', this.el);
    qsa('[data-flyer-slot]').forEach((s) => { this.slots[s.dataset.flyerSlot] = s; });
    if (!this.slots.b1) { noteMissing('[data-flyer-slot="b1"]'); return; }
    const r = this.slots.b1.getBoundingClientRect();
    this.baseW = Math.max(1, r.width);
    this.baseH = Math.max(1, r.height);
    gsap.set(this.el, {
      position: 'fixed', left: 0, top: 0, width: this.baseW, height: this.baseH,
      zIndex: 10, pointerEvents: 'none', transformOrigin: '50% 50%', autoAlpha: 1,
    });
    /* motion mode: the flyer IS the product — static twins stand down */
    qsa('.slot-static').forEach((im) => gsap.set(im, { autoAlpha: 0 }));
    this.place('b1');
    this.ready = true;
  },
  poseFor(key) {
    const slot = this.slots[key];
    if (!slot) return null;
    const r = slot.getBoundingClientRect();
    const s = r.width / this.baseW;
    return { x: r.left + r.width / 2 - this.baseW / 2, y: r.top + r.height / 2 - this.baseH / 2, scale: s };
  },
  place(key) {
    const p = this.poseFor(key);
    if (!p) return;
    window.gsap.set(this.el, { ...p, rotation: 0, autoAlpha: 1 });
    this.parked = key; this.hidden = false;
  },
  offPose() {
    const p = this.poseFor(this.parked) || { x: vw() / 2 - this.baseW / 2, y: 0, scale: 1 };
    return { x: p.x, y: -this.baseH * p.scale - 0.12 * vh(), scale: p.scale * 0.92 };
  },
  swapSrc(turn) {
    if (!this.img) return;
    const src = this.img.getAttribute('data-turn-' + turn);
    if (!src || this.img.getAttribute('src') === src) return;
    const gsap = window.gsap;
    gsap.timeline()
      .to(this.img, { autoAlpha: 0.85, duration: 0.08, ease: 'power1.in' })
      .call(() => { this.img.src = src; })
      .to(this.img, { autoAlpha: 1, duration: 0.08, ease: 'power1.out' });
  },
  /* fly to slot key, or 'off' (up out of frame). midCall fires at
     flight midpoint (world flip + turn swap live there). */
  fly(target, opts = {}) {
    if (!this.ready) return;
    const gsap = window.gsap;
    const to = target === 'off' ? this.offPose() : this.poseFor(target);
    if (!to) return;
    this.flying = true;
    gsap.killTweensOf(this.el);
    gsap.killTweensOf(this.lift);
    const tl = gsap.timeline({
      onComplete: () => {
        this.flying = false;
        if (target === 'off') this.hidden = true;
        else { this.parked = target; this.hidden = false; this.place(target); }
      },
    });
    if (this.hidden && target !== 'off') {
      const from = this.offPose();
      gsap.set(this.el, { ...from, autoAlpha: 1 });
    }
    tl.to(this.el, { x: to.x, scale: to.scale, duration: 0.8, ease: 'power3.inOut' }, 0)
      .to(this.el, { y: to.y, duration: 0.8, ease: EASE_SCRUB }, 0)
      .to(this.el, { rotation: 6, duration: 0.4, ease: 'sine.in' }, 0)
      .to(this.el, { rotation: 0, duration: 0.4, ease: 'sine.out' }, 0.4)
      /* slight arc: the lift bows against the travel */
      .to(this.lift, { y: -0.06 * vh(), duration: 0.4, ease: 'sine.out' }, 0)
      .to(this.lift, { y: 0, duration: 0.4, ease: 'sine.in' }, 0.4)
      .call(() => {
        if (opts.turn) this.swapSrc(opts.turn);
        if (opts.midCall) opts.midCall();
      }, null, 0.4);
    if (target === 'off') tl.to(this.el, { autoAlpha: 0, duration: 0.15 }, 0.65);
    return tl;
  },
  idle(on) {
    const gsap = window.gsap;
    if (this.idleTl) { this.idleTl.kill(); this.idleTl = null; gsap.set(this.lift, { y: 0, rotation: 0 }); }
    if (!on || !this.ready) return;
    /* B1 idle: ±4px drift + 5° slow roll — lives on the lift so it
       never fights the pose */
    this.idleTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      .fromTo(this.lift, { y: -4 }, { y: 4, duration: 2.4 }, 0)
      .fromTo(this.lift, { rotation: -2.5 }, { rotation: 2.5, duration: 5.2 }, 0);
  },
  refresh() {
    if (!this.ready || this.flying) return;
    if (this.hidden) window.gsap.set(this.el, { autoAlpha: 0 });
    else this.place(this.parked);
  },
};

/* ============================================================
   INIT
   ============================================================ */
if (!hasGSAP || !linePath) {
  rootEl.classList.add('is-endstate');
  qsa('.beat, section[id^="b"]').forEach((b) => b.classList.add('is-endstate'));
  if (!hasGSAP) noteMissing('gsap/ScrollTrigger globals (js/vendor)');
  const b0 = qs('#b0');
  if (b0) b0.style.display = 'none';
  if (lineWrap) lineWrap.style.visibility = 'hidden';
  window.SeemaMotion = { version: 'v4-noop', batch: BATCH, missing };
} else {
  boot();
}

function boot() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const zLine = parseInt(getComputedStyle(rootEl).getPropertyValue('--z-line'), 10) || 20;
  gsap.set(lineWrap, {
    position: 'fixed', top: 0, left: 0, width: 1000, height: 1000,
    zIndex: zLine, pointerEvents: 'none', transformOrigin: '0px 0px', overflow: 'visible',
  });
  linePath.setAttribute('stroke-width', '2');
  linePath.setAttribute('vector-effect', 'non-scaling-stroke');
  linePath.setAttribute('fill', 'none');
  if (!linePath.getAttribute('stroke')) linePath.setAttribute('stroke', 'currentColor');

  const mm = gsap.matchMedia();
  mm.add(
    {
      desk: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
      mob: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      if (ctx.conditions.reduce) return setupEndstate();
      return setupMotion(ctx, !!ctx.conditions.desk);
    }
  );

  if (REDUCED_MQ.matches) runLoaderReduced();
  else runLoader();

  if (doc.fonts) doc.fonts.ready.then(() => ScrollTrigger.refresh());

  window.SeemaMotion = {
    version: 'v4', batch: BATCH, missing,
    get lenis() { return lenis; },
    get loaderDone() { return loaderDone; },
    get world() { return world.cur; },
    drawLine, poses: POSES, setWorld: (n, o) => world.set(n, o),
  };
}

/* ============================================================
   7 · LOADER v4 (B0) — haldi line draws on roast, tension snap,
   TURMERIC SLAM (circle clip-wipe from the spiral's center),
   hero scale-punch + crumb burst, coil→rule handoff.
   ============================================================ */
function collectAssetProgress(onProgress) {
  const imgs = Array.from(doc.images).filter((im) => im.src || im.srcset);
  let total = 0, loaded = 0, capped = false;
  const report = () => onProgress(capped ? 1 : (total ? loaded / total : 1));
  imgs.forEach((im) => {
    const w = (im.getAttribute('fetchpriority') === 'high') ? 3 : 1;
    total += w;
    if (im.complete) loaded += w;
    else {
      const done = () => { loaded += w; report(); };
      im.addEventListener('load', done, { once: true });
      im.addEventListener('error', done, { once: true });
    }
  });
  if (doc.fonts) {
    total += 2;
    doc.fonts.ready.then(() => { loaded += 2; report(); });
  }
  report();
  setTimeout(() => { capped = true; report(); }, 8000);   /* never hold the door past 8s */
}

function runLoader() {
  const gsap = window.gsap;
  const overlay = qs('#b0');
  const caption = overlay && overlay.querySelector('.t-mono');
  if (!overlay) noteMissing('#b0 loader overlay');

  const zLoader = parseInt(getComputedStyle(rootEl).getPropertyValue('--z-loader'), 10) || 200;
  const zLineV = parseInt(getComputedStyle(rootEl).getPropertyValue('--z-line'), 10) || 20;
  const minMs = parseFloat(getComputedStyle(rootEl).getPropertyValue('--t-loader-min')) || 1200;

  rootEl.style.overflow = 'hidden';
  if (lenis) lenis.stop();

  drawLine('coiled', 'coiled', 0);
  const loaderPose = POSES.loader();
  applyPose(loaderPose);
  /* v4: the loader line is haldi on roast (§3 B0) */
  gsap.set(lineWrap, { zIndex: zLoader + 10, autoAlpha: 1, color: INK.haldi });

  const L = linePath.getTotalLength();
  linePath.style.strokeDasharray = String(L);
  linePath.style.strokeDashoffset = String(L);

  let target = 0, shown = 0, finished = false;
  const t0 = performance.now();
  collectAssetProgress((p) => { target = Math.max(target, p); });

  const tick = () => {
    if (finished) return;
    const elapsed = performance.now() - t0;
    shown += (target - shown) * 0.14;
    const capped = Math.min(shown, elapsed / minMs);
    linePath.style.strokeDashoffset = String(L * (1 - clamp01(capped)));
    if (capped >= 0.99 && target >= 1 && elapsed >= minMs) {
      finished = true;
      linePath.style.strokeDashoffset = '0';
      handoff();
    } else {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);

  function handoff() {
    const from = POSES.loader();
    /* spiral center in viewport px = wipe origin */
    const box = STATE_BOX.coiled;
    const origin = { x: from.x + box.cx * from.s, y: from.y + box.cy * from.s };
    const proxy = { t: 0 };
    const tl = gsap.timeline({ onComplete: releaseWorld });
    /* 1 · tension snap — 120ms scale 1→1.03→1 on the drawn coil */
    tl.to(lineWrap, { scale: from.s * 1.03, duration: 0.06, ease: 'power2.out' }, 0)
      .to(lineWrap, { scale: from.s, duration: 0.06, ease: 'power2.in' }, 0.06)
      /* 2 · THE SLAM — turmeric world clip-wipes from the coil's heart */
      .call(() => { world.set('haldi', { mode: 'slam', origin }); }, null, 0.12)
      .call(() => { overlay && gsap.to(overlay, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }); }, null, 0.2)
      /* 3 · coil unwinds and travels to the hero rule through the slam */
      .call(() => { linePath.style.strokeDasharray = 'none'; linePath.style.strokeDashoffset = '0'; }, null, 0.16)
      .to(proxy, {
        t: 1, duration: 1.0, ease: EASE_SCRUB,
        onUpdate() {
          drawLine('coiled', 'unwound', proxy.t);
          applyPose(lerpPose(from, POSES.rule(), proxy.t));
        },
      }, 0.2)
      /* 4 · hero chakli scale-punch 1.6→1 (overshoot #1 of 2) + burst */
      .call(() => {
        if (flyer.ready) {
          const p = flyer.poseFor('b1');
          if (p) gsap.fromTo(flyer.el, { scale: p.scale * 1.6 }, { scale: p.scale, duration: 0.62, ease: EASE_SLAP });
        }
        fireBurst(qs('#b1 .hero-burst'), { scale: 0.4, tint: INK.roast });
      }, null, 0.34);
    if (caption) tl.to(caption, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, 0.12);
  }

  function releaseWorld() {
    if (overlay) gsap.set(overlay, { display: 'none' });
    gsap.set(lineWrap, { zIndex: zLineV, color: LINE_INK[world.cur] || '' });
    rootEl.style.overflow = '';
    if (lenis) lenis.start();
    loaderDone = true;
    resolveLoader();
    window.ScrollTrigger.refresh();
  }
}

/* one-shot radial burst on any [id^=burst-]/[id^=crumb-] svg */
function fireBurst(svg, opts = {}) {
  if (!svg) return;
  const gsap = window.gsap;
  const linesB = qsa('[id^="burst-"]', svg);
  const crumbs = qsa('[id^="crumb-"]', svg);
  if (!linesB.length) return;
  linesB.forEach((l) => {
    const L = l.getTotalLength();
    l.style.strokeDasharray = String(L);
    l.style.strokeDashoffset = String(L);
  });
  if (opts.tint) svg.style.color = opts.tint;
  const base = opts.scale || 1;
  const fling = 26 * (opts.scale ? opts.scale * 2.5 : 2);   /* B6 fires at 2× v1 */
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.set(svg, { autoAlpha: 1, scale: base * 1.06, transformOrigin: 'center center' }, 0)
    .to(svg, { scale: base, duration: 0.09 }, 0.016)
    .fromTo(linesB, { scale: 0.6, svgOrigin: '120 120' }, { scale: 1, duration: 0.3 }, 0)
    .to(linesB, { strokeDashoffset: 0, duration: 0.3 }, 0);
  crumbs.forEach((c) => {
    const b = c.getBBox();
    const dx = b.x + b.width / 2 - 120, dy = b.y + b.height / 2 - 120;
    const m = Math.hypot(dx, dy) || 1;
    tl.fromTo(c, { x: 0, y: 0 }, { x: (dx / m) * fling, y: (dy / m) * fling, duration: 0.32 }, 0.02);
  });
  tl.to(svg, { autoAlpha: 0, duration: 0.14 }, 0.3);
}

function runLoaderReduced() {
  const gsap = window.gsap;
  const overlay = qs('#b0');
  const heroRule = qs('#b1 .hero__rule');
  if (overlay) gsap.set(overlay, { display: 'none' });
  drawLine('coiled', 'coiled', 0);
  applyPose(POSES.loader());
  gsap.set(lineWrap, { autoAlpha: 0.6, zIndex: 210, color: INK.haldi });
  if (heroRule) gsap.set(heroRule, { autoAlpha: 0 });
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    const tl = gsap.timeline({
      onComplete() {
        gsap.set(lineWrap, { autoAlpha: 0, zIndex: 20 });
        loaderDone = true;
        resolveLoader();
      },
    });
    tl.to(lineWrap, { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' }, 0.05);
    if (heroRule) tl.to(heroRule, { autoAlpha: 1, duration: 0.6, ease: 'power1.inOut' }, 0.2);
  };
  const minMs = parseFloat(getComputedStyle(rootEl).getPropertyValue('--t-loader-min')) || 1200;
  const hero = qs('#b1 img');
  if (hero && !hero.complete) {
    const onHero = () => setTimeout(finish, 400);
    hero.addEventListener('load', onHero, { once: true });
    hero.addEventListener('error', onHero, { once: true });
    setTimeout(finish, 4000);
  } else {
    setTimeout(finish, minMs);
  }
}

/* ============================================================
   8 · REDUCED MOTION — statically-colored sections, end states
   composed, live numbers still live (first-class art direction)
   ============================================================ */
function setupEndstate() {
  const gsap = window.gsap;
  rootEl.classList.add('is-endstate');
  rootEl.classList.remove('is-flip-live');
  qsa('.beat, section[id^="b"]').forEach((b) => b.classList.add('is-endstate'));
  if (lineWrap && loaderDone) gsap.set(lineWrap, { autoAlpha: 0 });

  /* end-state counters: the numbers land, composed */
  const clock = qs('#b2-clock');
  if (clock) clock.textContent = '04:30';
  qsa('.zero-num').forEach((z) => { z.textContent = '0'; });
  const flyEl = qs('#flyer');
  if (flyEl) gsap.set(flyEl, { display: 'none' });   /* slots' .slot-static images stand */
  qsa('#b6 svg').forEach((svg) => { if (svg.querySelector('[id^="burst-"]')) gsap.set(svg, { opacity: 0.12 }); });
  qsa('.hero-burst').forEach((svg) => gsap.set(svg, { autoAlpha: 0 }));

  const observers = [];
  /* order pill docks when the shelf is reached (functional) */
  const pill = qs('.order-pill');
  const b7 = qs('#b7');
  if (pill && b7) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) pill.classList.add('is-docked'); });
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(b7);
    observers.push(io);
  } else if (pill) pill.classList.add('is-docked');

  /* crumb rewrites + chrome ink follows the section worlds */
  const chapterEl = qs('.crumb__chapter');
  for (let i = 1; i <= 10; i++) {
    const sec = qs('#b' + i);
    if (!sec) continue;
    const text = CHAPTERS[i];
    const wname = sec.dataset.world || WORLD_BY_BEAT[i];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (chapterEl) chapterEl.textContent = text;
        if (wname && WORLDS[wname]) {
          bodyEl.dataset.world = wname;
          bodyEl.dataset.ink = WORLDS[wname].ink;
          /* chrome ink follows even without the world engine */
          bodyEl.style.setProperty('--world-ink', INK[WORLDS[wname].ink]);
          bodyEl.style.setProperty('--world-accent', WORLDS[wname].accent);
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    io.observe(sec);
    observers.push(io);
  }

  const cue = qs('.scroll-cue');
  const onScroll = () => {
    if (window.scrollY > 40 && cue) { cue.classList.add('is-hidden'); window.removeEventListener('scroll', onScroll); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    rootEl.classList.remove('is-endstate');
    qsa('.is-endstate').forEach((b) => b.classList.remove('is-endstate'));
    observers.forEach((o) => o.disconnect());
    window.removeEventListener('scroll', onScroll);
  };
}

/* ============================================================
   9 · FULL MOTION — Lenis, worlds, flights, beats, the journey
   ============================================================ */
function setupMotion(ctx, isDesk) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const removers = [];
  let alive = true;
  const pinPx = (key) => () => '+=' + Math.round(vh() * PIN[key][isDesk ? 0 : 1]);
  const pad1 = (tl) => tl.to({ _: 0 }, { _: 1, duration: 0.0001 }, 1);

  world.init();
  flyer.init();

  /* ---- Lenis wiring ------------------------------------------------ */
  lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => { if (lenis) lenis.raf(time * 1000); };
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  if (!loaderDone) lenis.stop();
  removers.push(() => { gsap.ticker.remove(raf); lenis.destroy(); lenis = null; });

  /* ---- chrome pt.1: crumb crossfade + scroll cue ------------------- */
  const chapterEl = qs('.crumb__chapter');
  if (!chapterEl) noteMissing('.crumb__chapter');
  let currentChapter = null;
  let chapterTl = null;
  const setChapter = (text) => {
    if (!chapterEl || text === currentChapter) return;
    if (currentChapter === null) { chapterEl.textContent = text; currentChapter = text; return; }
    currentChapter = text;
    /* kill any in-flight crossfade — rapid boundary crossings (jump
       scrolls) must land on the LAST chapter, not an earlier .call */
    if (chapterTl) chapterTl.kill();
    chapterTl = gsap.timeline()
      .to(chapterEl, { autoAlpha: 0, y: -3, duration: 0.075, ease: 'power1.in', overwrite: 'auto' })
      .call(() => { chapterEl.textContent = text; })
      .to(chapterEl, { autoAlpha: 1, y: 0, duration: 0.075, ease: EASE_ENTER });
  };
  setChapter(CHAPTERS[0]);

  const cue = qs('.scroll-cue');
  if (cue) {
    const onLenisScroll = (e) => {
      if ((e.scroll || 0) > 40) { cue.classList.add('is-hidden'); lenis && lenis.off('scroll', onLenisScroll); }
    };
    lenis.on('scroll', onLenisScroll);
  }

  /* ---- shared kinetic-type prep ------------------------------------ */
  const echoCount = isDesk ? 2 : 1;
  qsa('[data-split]').forEach((el) => splitWords(el));
  qsa('[data-echo]').forEach((el) => buildEcho(el, echoCount));

  /* =================================================================
     BEATS
     ================================================================= */

  /* ---- B1 · HERO — anchor, enormous, breathing (pin 120vh) --------- */
  const b1 = qs('#b1');
  const heroLines = qsa('#b1 [data-split]');
  const crumbLayers = qsa('#b1 .crumb-layer');
  if (!crumbLayers.length) noteMissing('#b1 .crumb-layer particle layers');
  let heroTurned = false;

  if (!loaderDone) {
    heroLines.forEach((el) => gsap.set(qsa('.w', el), { yPercent: 115, rotate: 4 }));
  }
  function heroIntro() {
    if (!heroIntroPlayed) {
      heroLines.forEach((el, i) => riseWords(null, el, { at: 0.15 + i * 0.12 }));
    } else {
      heroLines.forEach((el) => gsap.set(qsa('.w', el), { yPercent: 0, rotate: 0 }));
    }
    heroIntroPlayed = true;
    flyer.idle(true);
  }
  heroLines.forEach((el) => echoDrift(el, b1));

  if (b1) {
    /* NOT a ScrollTrigger pin: a pinned section becomes an atomic
       stacking context, which would trap the type sandwich behind the
       body-level #flyer. #b1 is tall (CSS) with a position:sticky
       stage — sticky (z auto, no transform) keeps children in the
       root stacking context, so line-1 (z −1) < flyer (z 10) <
       line-2 (z 30) actually interleaves. */
    const front = qs('#b1 .line-2');
    const back = qs('#b1 .line-1');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b1, start: 'top top', end: 'bottom bottom',
        scrub: true, invalidateOnRefresh: true,
        onUpdate(self) {
          /* scroll-turn illusion begins mid-scroll: V1→V2 */
          if (self.progress > 0.5 && !heroTurned) { heroTurned = true; flyer.swapSrc(2); }
          else if (self.progress < 0.45 && heroTurned) { heroTurned = false; flyer.swapSrc(1); }
        },
      },
    });
    pad1(tl);
    /* sandwich separation: front line rises faster than back (depth) */
    if (front) tl.to(front, { y: () => -0.22 * vh(), ease: 'none', duration: 1 }, 0);
    if (back) tl.to(back, { y: () => -0.08 * vh(), ease: 'none', duration: 1 }, 0);
    /* suspended-crumb parallax — scrub axis (pointer axis is nested) */
    crumbLayers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || '0.5') * (isDesk ? 1 : 0.5);
      tl.to(layer, { y: () => -depth * 0.34 * vh(), ease: 'none', duration: 1 }, 0);
    });
  }

  /* pointer parallax ±14px, lerped — desktop only, on the inner <g> */
  if (isDesk && crumbLayers.length) {
    const targets = crumbLayers.map((layer) => ({
      g: layer.querySelector('g') || layer, depth: parseFloat(layer.dataset.depth || '0.5'), x: 0, y: 0,
    }));
    let px = 0, py = 0;
    const onMove = (e) => {
      px = (e.clientX / vw()) * 2 - 1;
      py = (e.clientY / vh()) * 2 - 1;
    };
    const pTick = () => {
      targets.forEach((t) => {
        const gx = px * 14 * t.depth, gy = py * 14 * t.depth;
        t.x += (gx - t.x) * 0.08;
        t.y += (gy - t.y) * 0.08;
        gsap.set(t.g, { x: t.x, y: t.y });
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    gsap.ticker.add(pTick);
    removers.push(() => { window.removeEventListener('pointermove', onMove); gsap.ticker.remove(pTick); });
  }

  /* ---- FLIGHTS (boundary one-shots; world flip fires mid-flight) --- */
  if (flyer.ready) {
    if (qs('#b2')) {
      ScrollTrigger.create({
        trigger: '#b2', start: 'top 92%',
        onEnter: () => flyer.fly('off', { turn: 3 }),          /* back to the kitchen */
        onLeaveBack: () => flyer.fly('b1', { turn: 1 }),
      });
    }
    if (isDesk && flyer.slots.b5) {
      ScrollTrigger.create({
        trigger: '#b5', start: 'top top',
        onEnter: () => flyer.fly('b5', { turn: 4 }),           /* lands as the exploded center */
        onLeaveBack: () => flyer.fly('off', { turn: 3 }),
      });
      ScrollTrigger.create({
        trigger: '#b6', start: 'top 80%',
        onEnter: () => flyer.fly('off', { turn: 4 }),
        onLeaveBack: () => flyer.fly('b5', { turn: 4 }),
      });
    }
    const flyerRefresh = () => flyer.refresh();
    ScrollTrigger.addEventListener('refresh', flyerRefresh);
    removers.push(() => ScrollTrigger.removeEventListener('refresh', flyerRefresh));
  }

  /* ---- B2 · 04:30 — dark kitchen, counting clock (pin 180vh) ------- */
  const b2 = qs('#b2');
  if (b2) {
    const media = qs('#b2 .press-media img') || qs('#b2 img');
    const clock = qs('#b2-clock');
    const head = qs('#b2 [data-split]');
    if (!clock) noteMissing('#b2-clock counting timestamp');
    const time = { m: 0 };
    const fmt = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m) % 60).padStart(2, '0');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b2, start: 'top top', end: pinPx('b2'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    pad1(tl);
    if (media) tl.fromTo(media, { scale: 1.06 }, { scale: 1, duration: 1, ease: 'none' }, 0);
    if (clock) {
      tl.to(time, {
        m: 270, duration: 0.85, ease: 'none',
        onUpdate() { clock.textContent = fmt(time.m); },
      }, 0);
    }
    if (head) riseWords(tl, head, { at: 0.35, dur: 0.22, stagger: 0.03, ease: 'power2.out' });
    if (head) echoDrift(head, b2);
  }

  /* ---- B3 · MANIFESTO — statements as walls (pin 320vh) ------------ */
  const b3 = qs('#b3');
  let b3SegHook = null;
  if (b3) {
    const walls = qsa('#b3 .wall');
    if (walls.length < 5) noteMissing('#b3 five .wall statements (found ' + walls.length + ')');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b3, start: 'top top', end: pinPx('b3'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { if (b3SegHook) b3SegHook(self.progress); },
      },
    });
    pad1(tl);
    walls.forEach((wall, i) => {
      const head = wall.querySelector('[data-split]') || wall;
      const at = i === 0 ? 0.02 : 0.04 + i * 0.16;   /* final wall settles by ~0.95 */
      if (i > 0) tl.set(wall, { autoAlpha: 1 }, at - 0.01);
      riseWords(tl, head, { at, dur: 0.12, stagger: 0.014, ease: 'power2.out', lag: 0.02 });
      /* previous walls recede — posters slapped over posters. The
         freshest ghost holds at 18%, the one before at 8%, anything
         older fades out entirely so the reading line always wins. */
      if (i > 0) {
        tl.to(walls[i - 1], { scale: 0.88, autoAlpha: 0.18, duration: 0.08, ease: 'power1.inOut' }, at);
      }
      if (i > 1) {
        tl.to(walls[i - 2], { scale: 0.84, autoAlpha: 0.08, duration: 0.08, ease: 'power1.inOut' }, at);
      }
      if (i > 2) {
        tl.to(walls[i - 3], { autoAlpha: 0, duration: 0.08, ease: 'power1.inOut' }, at);
      }
    });
    if (walls.length > 1) gsap.set(walls.slice(1), { autoAlpha: 0 });
  }

  /* ---- B4 + B9 · the dial with MOMENTUM (mass, not clockwork) ------ */
  function buildDial(secSel, pinKey, withCards, withStamp) {
    const sec = qs(secSel);
    if (!sec) { noteMissing(secSel + ' section'); return null; }
    const dial = sec.querySelector('.dial');
    const centerFig = sec.querySelector('.dial__center');
    const pills = qsa('.dial__pill', sec);
    const cards = withCards ? qsa('.dial-card', sec) : [];
    const ring = sec.querySelector('[id^="dial-ring"]');
    const zeroEls = qsa('.zero-num', sec);
    if (!dial) noteMissing(secSel + ' .dial');
    if (pills.length < 4) noteMissing(secSel + ' four .dial__pill (found ' + pills.length + ')');

    if (ring) gsap.set(ring, { opacity: 0 });
    if (isDesk && pills.length) gsap.set(pills, { xPercent: -50, yPercent: -50 });
    cards.forEach((c, i) => gsap.set(c, isDesk ? { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 6 } : { opacity: i === 0 ? 1 : 0.45 }));

    /* counting-zeros line: randomized 2-digit starts, land on 0 */
    const zeroStart = zeroEls.map(() => 20 + Math.floor(Math.random() * 70));
    zeroEls.forEach((z, i) => { z.textContent = String(zeroStart[i]); });
    const zeroDone = zeroEls.map(() => false);
    const countZero = (i) => {
      if (zeroDone[i] || !zeroEls[i]) return;
      zeroDone[i] = true;
      const o = { v: zeroStart[i] };
      gsap.to(o, {
        v: 0, duration: 0.9, ease: 'power2.out',
        onUpdate() { zeroEls[i].textContent = String(Math.round(o.v)); },
      });
    };
    const resetZero = (i) => {
      if (!zeroDone[i] || !zeroEls[i]) return;
      zeroDone[i] = false;
      gsap.killTweensOf(zeroEls[i]);
      zeroEls[i].textContent = String(zeroStart[i]);
    };

    let activeIdx = -1;
    const setActive = (idx, dir) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      pills.forEach((p, i) => p.classList.toggle('is-active', i === idx));
      /* 1.06 pop as the pill snaps level; zeros land for every pill
         reached so far (fast scrolls can skip indices) */
      if (idx >= 0 && pills[idx] && dir >= 0) {
        gsap.fromTo(pills[idx], { scale: 1.06 }, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      }
      for (let i = 0; i < zeroEls.length; i++) {
        if (i <= idx) countZero(i);
        else if (dir < 0) resetZero(i);
      }
      cards.forEach((c, i) => {
        if (isDesk) gsap.to(c, { autoAlpha: i === idx ? 1 : 0, y: i === idx ? 0 : 6, duration: 0.15, ease: EASE_ENTER, overwrite: 'auto' });
        else gsap.to(c, { opacity: i === idx ? 1 : 0.45, duration: 0.15, ease: EASE_ENTER, overwrite: 'auto' });
      });
    };

    let slapped = false;
    const stampEl = withStamp ? sec.querySelector('.stamp') : null;
    if (withStamp && !stampEl) noteMissing(secSel + ' .stamp');
    if (stampEl) gsap.set(stampEl, { autoAlpha: 0 });
    const stampNoEl = stampEl ? stampEl.querySelector('#stamp-batch-no') : null;

    const slap = () => {
      /* B9 — THE BIGGER SLAP (overshoot #2 of 2): 2.2→1 (1.8 mob),
         −10°→−4°, 1-frame nudge, 6 crumbs kicked, odometer spin */
      const from = isDesk ? 2.2 : 1.8;
      gsap.timeline()
        .fromTo(stampEl, { scale: from, rotation: -10 }, { autoAlpha: 1, duration: 0.04 }, 0)
        .to(stampEl, { scale: 1, rotation: -4, duration: 0.42, ease: EASE_SLAP }, 0.04)
        .fromTo(sec, { y: 3 }, { y: 0, duration: 0.09, ease: 'power1.out' }, 0.2);
      kickCrumbs(stampEl, 6);
      if (stampNoEl) {
        const target = parseInt(BATCH, 10) || 0;
        const o = { v: Math.max(0, target - 137) };
        gsap.to(o, {
          v: target, duration: 0.9, ease: 'power2.out',
          onUpdate() { stampNoEl.textContent = String(Math.round(o.v)).padStart(4, '0'); },
        });
      }
    };

    /* momentum spin — rotation chases scrub target through a lerp,
       so fast scrolls fling the instrument and it eases out */
    const mom = { rot: 0, shown: 0 };
    const st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: pinPx(pinKey),
      pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate(self) {
        setActive(Math.max(0, Math.min(3, Math.round(self.progress * 3))), self.direction);
        if (stampEl) {
          if (self.progress >= 0.88 && !slapped) { slapped = true; slap(); }
          else if (self.progress < 0.8 && slapped) {
            slapped = false;
            gsap.set(stampEl, { autoAlpha: 0 });
            gsap.set(sec, { y: 0 });
          }
        }
      },
    });

    if (isDesk && dial) {
      gsap.set(dial, { transformOrigin: '50% 50%' });
      const momTick = () => {
        const vel = st.isActive ? gsap.utils.clamp(-55, 55, st.getVelocity() / 40) : 0;
        const target = -270 * st.progress - vel;
        mom.shown += (target - mom.shown) * 0.08;
        if (Math.abs(target - mom.shown) < 0.01 && mom.rot === mom.shown) return;
        mom.rot = mom.shown;
        gsap.set(dial, { rotation: mom.shown });
        pills.forEach((p) => gsap.set(p, { rotation: -mom.shown }));
        /* B9's centre is a directional pack scene — stays square */
        if (withStamp && centerFig) gsap.set(centerFig, { rotation: -mom.shown, transformOrigin: '50% 50%' });
      };
      gsap.ticker.add(momTick);
      removers.push(() => gsap.ticker.remove(momTick));
    } else if (!isDesk) {
      /* mobile: no rotation — pills highlight sequentially, zeros count */
    }
    setActive(0, 1);
    return st;
  }

  /* 6 crumb particles kicked from under an element (one-shot DOM) */
  function kickCrumbs(el, n) {
    if (!el || !el.parentElement) return;
    const host = el.parentElement;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:200px;height:200px;left:50%;top:60%;margin:-100px 0 0 -100px;pointer-events:none;overflow:visible;z-index:41;color:currentColor;';
    const dots = [];
    for (let i = 0; i < n; i++) {
      const c = doc.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', '100'); c.setAttribute('cy', '100');
      c.setAttribute('r', String(2 + Math.random() * 2.4));
      c.setAttribute('fill', 'currentColor');
      svg.appendChild(c);
      dots.push(c);
    }
    el.insertAdjacentElement('afterend', svg);
    const tl = gsap.timeline({ onComplete: () => svg.remove() });
    dots.forEach((c, i) => {
      const a = (Math.PI * (0.15 + 0.7 * (i / (n - 1)))) + Math.PI;   /* fan downward-out */
      const dist = 44 + Math.random() * 40;
      tl.fromTo(c, { x: 0, y: 0, opacity: 1 }, {
        x: Math.cos(a) * dist, y: -Math.sin(a) * dist * 0.8 + 26,
        opacity: 0, duration: 0.5 + Math.random() * 0.2, ease: 'power2.out',
      }, 0.02 * i);
    });
  }

  buildDial('#b4', 'b4', true, false);
  /* #b9 is built AFTER B5–B8 (document order → pin spacing) */

  /* ---- B5 · EVERYTHING INSIDE — sticker explosion (pin 320vh) ------ */
  const b5 = qs('#b5');
  if (b5 && isDesk) {
    const center = b5Center();
    const cutouts = qsa('#b5 .slot--cutout, #b5 .cutout');
    const labels = qsa('#b5 .b5-label');
    const leaders = qsa('#b5 [id^="leader-path-"]');
    const dots = qsa('#b5 [id^="leader-dot-"]');
    const DEPTHS = [0.6, 0.8, 1.0, 0.7, 0.9, 0.5, 0.8, 0.65, 0.95];   /* 9 cutouts */
    if (!center) noteMissing('#b5 center media ([data-flyer-slot=b5])');
    if (cutouts.length < 9) noteMissing('#b5 nine cutouts (found ' + cutouts.length + ')');
    if (leaders.length < cutouts.length) noteMissing('#b5 ' + cutouts.length + ' leader paths (found ' + leaders.length + ')');

    /* re-draw every leader from REAL geometry (v3 audit #5 fix) */
    const leadersSvg = leaders.length ? leaders[0].ownerSVGElement : null;
    function layoutLeaders() {
      if (!leadersSvg || !center) return;
      const host = leadersSvg.parentElement;
      const W = host.clientWidth || 1, H = host.clientHeight || 1;
      leadersSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      const c = pinnedCenter(b5, center);
      if (!c) return;
      const R = (Math.max(c.w, c.h) * 1.14) / 2;
      cutouts.forEach((cut, i) => {
        const p = leaders[i];
        if (!p) return;
        const k = pinnedCenter(b5, cut);
        if (!k) return;
        const dx = k.cx - c.cx, dy = k.cy - c.cy;
        const m = Math.hypot(dx, dy) || 1;
        const ux = dx / m, uy = dy / m;
        const sx = c.cx + ux * R, sy = c.cy + uy * R;
        const gap = Math.max(k.w, k.h) / 2 + 8;
        const ex = k.cx - ux * gap, ey = k.cy - uy * gap;
        const bow = (i % 2 ? -1 : 1) * Math.min(26, m * 0.09);
        const mx = (sx + ex) / 2 - uy * bow, my = (sy + ey) / 2 + ux * bow;
        p.setAttribute('d', 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
          'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1));
        if (dots[i]) { dots[i].setAttribute('cx', sx.toFixed(1)); dots[i].setAttribute('cy', sy.toFixed(1)); }
        const L = p.getTotalLength();
        p.style.strokeDasharray = String(L);
        p.style.strokeDashoffset = String(L);
      });
    }
    layoutLeaders();
    ScrollTrigger.addEventListener('refreshInit', layoutLeaders);
    removers.push(() => ScrollTrigger.removeEventListener('refreshInit', layoutLeaders));
    dots.forEach((d) => gsap.set(d, { attr: { r: 0 } }));
    labels.forEach((l) => gsap.set(l, { clipPath: 'inset(0% 100% 0% 0%)', autoAlpha: 0 }));

    const SHADOW_ON = 'drop-shadow(10px 14px 0px rgba(18,11,7,0.28))';
    const SHADOW_OFF = 'drop-shadow(0px 0px 0px rgba(18,11,7,0.28))';
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b5, start: 'top top', end: pinPx('b5'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    pad1(tl);

    cutouts.forEach((cut, i) => {
      const at = 0.06 + i * 0.075;
      const depth = DEPTHS[i % DEPTHS.length];
      const delta = (axis) => () => {
        const c = center && pinnedCenter(b5, center);
        const k = pinnedCenter(b5, cut);
        if (!c || !k) return 0;
        return axis === 'x' ? c.cx - k.cx : c.cy - k.cy;
      };
      /* flight out of the chakli… */
      tl.fromTo(cut,
        { x: delta('x'), y: delta('y'), scale: 0.35, autoAlpha: 0, rotation: i % 2 ? 6 : -6, filter: SHADOW_OFF },
        { x: 0, y: 0, scale: 1.15, autoAlpha: 1, rotation: i % 2 ? 2 : -2, duration: 0.16, ease: EASE_SCRUB }, at)
        /* …then the STICKER LANDING: squash 1.15→1 + chunky offset
           shadow pops on (solid offset, not blur — the SPYLT read) */
        .to(cut, { scale: 1, rotation: 0, filter: SHADOW_ON, duration: 0.05, ease: 'power2.out' }, at + 0.16)
        .to(cut, { y: () => -depth * 40, duration: Math.max(0.1, 1 - (at + 0.24)), ease: 'none' }, at + 0.24);
      if (dots[i]) tl.to(dots[i], { attr: { r: 4 }, duration: 0.03, ease: 'power2.out' }, at + 0.02);
      if (leaders[i]) tl.to(leaders[i], { strokeDashoffset: 0, duration: 0.14, ease: EASE_SCRUB }, at + 0.04);
      /* label types on */
      if (labels[i]) {
        tl.set(labels[i], { autoAlpha: 1 }, at + 0.15)
          .to(labels[i], { clipPath: 'inset(0% -6% 0% 0%)', duration: 0.08, ease: 'none' }, at + 0.15);
      }
    });
  } else if (b5 && !isDesk) {
    /* below 768px this beat swaps entirely to the flat-lay (brief rule) */
    const flat = qs('#b5 .b5-flat') || qs('#b5 picture');
    if (flat) {
      gsap.from(flat, {
        autoAlpha: 0, y: 32, duration: 0.9, ease: EASE_ENTER,
        scrollTrigger: { trigger: b5, start: 'top 72%', toggleActions: 'play none none none' },
      });
    }
  }

  /* ---- B6 · THE CRUNCH — hard cut + punch + shake (pin 120vh) ------ */
  const b6 = qs('#b6');
  if (b6) {
    const media = qs('#b6 .crunch-media') || qs('#b6 img');
    const burstSvg = qsa('#b6 svg').find((s) => s.querySelector('[id^="burst-"]'));
    const head6 = qs('#b6 [data-split]');
    if (!burstSvg) noteMissing('#b6 crunch-burst svg ([id^=burst-])');
    if (burstSvg) gsap.set(burstSvg, { autoAlpha: 0 });
    /* short violent pin so the frame holds */
    ScrollTrigger.create({
      trigger: b6, start: 'top top', end: pinPx('b6'),
      pin: true, anticipatePin: 1, invalidateOnRefresh: true,
    });
    ScrollTrigger.create({
      trigger: b6, start: 'top 55%', once: true,
      onEnter() {
        /* the world hard-cut itself fires from the boundary score
           (mode 'cut'); this is the percussion on top of it */
        if (media) gsap.fromTo(media, { scale: 1.3 }, { scale: 1, duration: 0.28, ease: 'power4.out' });
        fireBurst(burstSvg, { scale: 2 });
        const amp = isDesk ? 6 : 3;
        gsap.timeline()
          .fromTo(b6, { x: -amp }, { x: amp, duration: 0.03, repeat: 4, yoyo: true, ease: 'none' }, 0.02)
          .to(b6, { x: 0, duration: 0.03 });
        if (head6) riseWords(null, head6, { at: 0.1, dur: 0.5, stagger: 0.04, ease: 'power3.out' });
      },
    });
    if (head6) echoDrift(head6, b6);
  }

  /* ---- B7 · THE SHELF — three worlds, side-swiped ------------------ */
  const b7 = qs('#b7');
  let shelfWorldIdx = 0;
  const shelfWorld = () => SHELF_WORLDS[shelfWorldIdx];
  if (b7) {
    const track = qs('#b7 .shelf-track');
    const panels = qsa('#b7 .shelf-panel');
    if (!track) noteMissing('#b7 .shelf-track');
    if (panels.length < 3) noteMissing('#b7 three .shelf-panel (found ' + panels.length + ')');
    const syncShelfWorld = (p) => {
      const idx = p < 0.25 ? 0 : p < 0.75 ? 1 : 2;
      if (idx !== shelfWorldIdx) {
        shelfWorldIdx = idx;
        world.set(panels[idx] ? (panels[idx].dataset.world || SHELF_WORLDS[idx]) : SHELF_WORLDS[idx], { duration: 0.45 });
      }
    };
    if (isDesk && track && panels.length) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: b7, start: 'top top', end: pinPx('b7'),
          pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          snap: { snapTo: [0, 0.5, 1], directional: false, duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut' },
          onUpdate: (self) => syncShelfWorld(self.progress),
        },
      });
      pad1(tl);
      tl.to(track, { x: () => -(track.scrollWidth - vw()), ease: 'none', duration: 1 }, 0);
      /* panel type + float entrances at panel centers */
      panels.forEach((panel, i) => {
        const head = panel.querySelector('[data-split]');
        const at = [0.02, 0.4, 0.78][i] || 0.02;
        if (head) riseWords(tl, head, { at, dur: 0.1, stagger: 0.02, ease: 'power2.out', lag: 0.02 });
        /* per-panel crumb drift — cheap depth while the shelf slides.
           MUST end by t=1 or the scrub timeline dilates and the
           track x no longer maps 1:1 to pin progress. */
        qsa('.crumb-layer', panel).forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth || '0.5');
          const from = Math.max(0, at - 0.08);
          tl.fromTo(layer, { y: depth * 30 }, { y: -depth * 30, ease: 'none', duration: Math.min(0.55, 1 - from) }, from);
        });
      });
    } else if (panels.length) {
      /* mobile: native scroll-snap carousel; worlds flip on snap */
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const idx = panels.indexOf(e.target);
          if (idx >= 0) {
            shelfWorldIdx = idx;
            /* only flip if the shelf is the current chapter */
            if (bodyEl.dataset.world && ['haldi', 'chili', 'leaf'].includes(bodyEl.dataset.world)) {
              world.set(e.target.dataset.world || SHELF_WORLDS[idx], { duration: 0.45 });
            }
          }
        });
      }, { root: track, threshold: 0.6 });
      panels.forEach((p) => io.observe(p));
      removers.push(() => io.disconnect());
      panels.forEach((panel) => {
        const head = panel.querySelector('[data-split]');
        if (head) {
          gsap.set(qsa('.w', head), { yPercent: 115, rotate: 4 });
          const io2 = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { riseWords(null, head, {}); io2.disconnect(); } });
          }, { root: track, threshold: 0.5 });
          io2.observe(panel);
          removers.push(() => io2.disconnect());
        }
      });
    }
  }

  /* ---- B8 · SEEMA — the exhale (pin 150vh, cream, quiet) ----------- */
  const b8 = qs('#b8');
  if (b8) {
    const portrait = qs('#b8 .portrait img') || qs('#b8 .portrait') || qs('#b8 img');
    const name = qs('#b8 .t-display, #b8 .t-xl');
    const dev = qs('#b8 .t-dev');
    const rows = qsa('#b8 .ledger__row');
    if (!portrait) noteMissing('#b8 portrait media');
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b8, start: 'top top', end: pinPx('b8'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (lowPower && portrait) ? (self) => {
          const steps = [16, 7, 0];
          const idx = Math.min(2, Math.floor(clamp01(self.progress / 0.7) * 3));
          const v = 'blur(' + steps[idx] + 'px)';
          if (portrait.style.filter !== v) portrait.style.filter = v;
        } : undefined,
      },
    });
    pad1(tl);
    if (portrait && !lowPower) {
      tl.fromTo(portrait, { filter: 'blur(16px)' }, { filter: 'blur(0px)', duration: 0.7, ease: 'none' }, 0);
    } else if (portrait) {
      gsap.set(portrait, { filter: 'blur(16px)' });
    }
    if (name) tl.fromTo(name, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0.1);
    if (dev) tl.fromTo(dev, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0.18);
    rows.forEach((row, i) => {
      tl.fromTo(row,
        { clipPath: 'inset(0% 0% 100% 0%)', y: 14, autoAlpha: 0 },
        { clipPath: 'inset(0% 0% -10% 0%)', y: 0, autoAlpha: 1, duration: 0.12, ease: 'power2.out' },
        0.55 + i * 0.1);
    });
  }

  /* ---- B9 · fresh by batch — momentum dial + the bigger slap ------- */
  buildDial('#b9', 'b9', false, true);

  /* ---- B10 · THE COIL — home on roast ------------------------------ */
  const b10 = qs('#b10');
  if (b10) {
    const head10 = qs('#b10 [data-split]');
    if (head10) {
      gsap.set(qsa('.w', head10), { yPercent: 115, rotate: 4 });
      ScrollTrigger.create({
        trigger: b10, start: 'top 60%', once: true,
        onEnter: () => riseWords(null, head10, { at: 0, dur: 0.7 }),
      });
      echoDrift(head10, b10);
    }
    const items = qsa('#b10 .btn, #b10 .t-mono, #b10 .lockup');
    if (items.length) {
      gsap.from(items, {
        autoAlpha: 0, y: 24, duration: 0.9, ease: EASE_ENTER, stagger: 0.07,
        scrollTrigger: { trigger: b10, start: 'top 45%', toggleActions: 'play none none none' },
      });
    }
    /* seal glow — the site's ONLY idle loop: a soft radial breathing
       behind the recoiled line (compositor-only opacity pulse) */
    const glow = doc.createElement('div');
    glow.className = 'seal-glow';
    glow.setAttribute('aria-hidden', 'true');
    gsap.set(glow, {
      position: 'fixed', width: 340, height: 340, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(247,174,0,0.5) 0%, rgba(247,174,0,0) 65%)',
      zIndex: 19, pointerEvents: 'none', autoAlpha: 0, xPercent: -50, yPercent: -50,
    });
    bodyEl.appendChild(glow);
    const placeGlow = () => {
      const p = POSES.seal();
      const box = STATE_BOX.recoiled;
      gsap.set(glow, { x: p.x + box.cx * p.s, y: p.y + box.cy * p.s });
    };
    placeGlow();
    ScrollTrigger.addEventListener('refresh', placeGlow);
    removers.push(() => { ScrollTrigger.removeEventListener('refresh', placeGlow); glow.remove(); });
    let glowTl = null;
    ScrollTrigger.create({
      trigger: b10, start: 'top 30%', end: 'bottom bottom',
      onEnter() {
        if (!glowTl) glowTl = gsap.fromTo(glow, { autoAlpha: 0.12 }, { autoAlpha: 0.4, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      },
      onLeaveBack() { if (glowTl) { glowTl.kill(); glowTl = null; } gsap.set(glow, { autoAlpha: 0 }); },
    });
    removers.push(() => { if (glowTl) glowTl.kill(); });
  }

  /* ---- chrome pt.2 + THE FLIP SCORE --------------------------------
     One boundary trigger per beat at its 50%-crossing: rewrites the
     crumb AND flips the world (mode per §1.3 — B6 hard cut is the
     only 1-frame snap; B8 dissolves over 900ms). Created after all
     pins so trigger positions include pin spacing. */
  const present = [];
  for (let i = 1; i <= 10; i++) if (qs('#b' + i)) present.push(i);
  const worldFor = (i) => {
    /* the shelf owns its own per-panel world — never override it */
    if (i === 7) return shelfWorld();
    const sec = qs('#b' + i);
    return (sec && sec.dataset.world) || WORLD_BY_BEAT[i] || 'haldi';
  };
  const flipModeFor = (i) => (i === 6 ? { mode: 'cut' } : i === 8 ? { mode: 'dissolve' } : { mode: 'tween' });
  present.forEach((i, idx) => {
    if (idx === 0) return;                       /* first beat set by the loader slam */
    const prev = present[idx - 1];
    ScrollTrigger.create({
      trigger: '#b' + i, start: 'top 50%', end: 'top 50%',
      onEnter: () => { setChapter(CHAPTERS[i]); world.set(worldFor(i), flipModeFor(i)); },
      onLeaveBack: () => { setChapter(CHAPTERS[prev]); world.set(worldFor(prev), flipModeFor(prev)); },
    });
  });

  const orderPill = qs('.order-pill');
  if (orderPill && qs('#b7')) {
    ScrollTrigger.create({
      trigger: '#b7', start: 'top 80%', once: true,
      onEnter: () => orderPill.classList.add('is-docked'),
    });
  } else if (!orderPill) noteMissing('.order-pill');

  /* =================================================================
     THE JOURNEY — the one line, B0 → B10 (v3 core, v4 registers)
     ================================================================= */
  const segs = [];
  function renderSeg(seg, t) {
    if (!loaderDone) return;
    if (!seg.pA) { seg.pA = seg.poseFnA(); seg.pB = seg.poseFnB(); }
    drawLine(seg.A, seg.B, t);
    applyPose(lerpPose(seg.pA, seg.pB, t));
    /* alpha: per-seg base (B3 snakes under the walls at 25%) and the
       circled→recoiled pigtail dip (audit #11) */
    let a = seg.alpha != null ? seg.alpha : 1;
    if (seg.dip) a *= 1 - 0.7 * Math.sin(Math.PI * t);
    gsap.set(lineWrap, { autoAlpha: a });
  }
  function addSeg(A, B, poseFnA, poseFnB, trig, opts) {
    if (!qs(trig.trigger) || (trig.endTrigger && !qs(trig.endTrigger))) return null;
    const seg = {
      A, B, pA: null, pB: null, poseFnA, poseFnB, st: null,
      dip: !!(opts && opts.dip), alpha: opts && opts.alpha,
    };
    seg.st = ScrollTrigger.create({
      ...trig,
      onUpdate: (self) => renderSeg(seg, self.progress),
    });
    segs.push(seg);
    return seg;
  }

  const shift = (poseFn, dyFn) => () => { const p = poseFn(); return { x: p.x, y: p.y + dyFn(), s: p.s }; };
  const rulePose = () => POSES.rule();
  const snakeHi = () => POSES.snake(0.42);
  const snakeLo = () => POSES.snake(0.58);
  const dial4 = () => POSES.dialCircle('#b4');
  const dial9 = () => POSES.dialCircle('#b9');
  const rimPose = () => POSES.rim();
  const up = () => -1.25 * vh();
  const down = () => 1.15 * vh();

  addSeg('unwound', 'snaking', rulePose, snakeHi,
    { trigger: '#b2', start: 'top bottom', endTrigger: '#b3', end: 'top top' });
  if (b3) {
    const b3St = ScrollTrigger.getAll().find((st) => st.trigger === b3 && st.pin);
    if (b3St) {
      const seg = { A: 'snaking', B: 'snaking', pA: null, pB: null, poseFnA: snakeHi, poseFnB: snakeLo, st: b3St, alpha: 0.25 };
      segs.push(seg);
      b3SegHook = (p) => renderSeg(seg, p);
    }
  }
  addSeg('snaking', 'circled', snakeLo, dial4,
    { trigger: '#b4', start: 'top bottom', end: 'top top' });
  if (isDesk && b5) {
    addSeg('circled', 'circled', dial4, rimPose,
      { trigger: '#b5', start: 'top bottom', end: 'top top' });
    addSeg('circled', 'circled', rimPose, shift(rimPose, up),
      { trigger: '#b6', start: 'top bottom', end: 'top top' });
  } else {
    addSeg('circled', 'circled', dial4, shift(dial4, up),
      { trigger: b5 ? '#b5' : '#b6', start: 'top bottom', end: b5 ? 'top 25%' : 'top top' });
  }
  addSeg('circled', 'circled', shift(dial9, down), dial9,
    { trigger: '#b9', start: 'top bottom', end: 'top top' });
  addSeg('circled', 'recoiled', dial9, () => POSES.seal(), {
    trigger: '#b10',
    start: () => {
      const el = qs('#b10');
      const def = el ? el.getBoundingClientRect().top + window.scrollY - vh() : 0;
      const b9El = qs('#b9');
      const b9St = ScrollTrigger.getAll().find((st) => st.trigger === b9El && st.pin);
      return b9St ? Math.max(def, b9St.end + 1) : def;
    },
    end: 'bottom bottom',
  }, { dip: true });

  const syncJourney = () => {
    segs.forEach((s) => { s.pA = s.poseFnA(); s.pB = s.poseFnB(); });
    if (!loaderDone) return;
    const y = window.scrollY;
    let best = -1;
    segs.forEach((s, i) => { if (s.st && s.st.start <= y + 1) best = i; });
    if (best === -1) {
      drawLine('unwound', 'unwound', 0);
      applyPose(POSES.rule());
      gsap.set(lineWrap, { autoAlpha: 1 });
      return;
    }
    const s = segs[best];
    renderSeg(s, clamp01((y - s.st.start) / Math.max(1, s.st.end - s.st.start)));
  };
  ScrollTrigger.addEventListener('refresh', syncJourney);
  removers.push(() => ScrollTrigger.removeEventListener('refresh', syncJourney));

  ScrollTrigger.sort();

  loaderPromise.then(() => {
    if (!alive) return;
    ctx.add(() => {
      heroIntro();
      if (window.scrollY < vh() / 2 && present.length) setChapter(CHAPTERS[present[0]]);
      syncJourney();
    });
  });
  if (loaderDone) requestAnimationFrame(() => { if (alive) ScrollTrigger.refresh(); });

  return () => { alive = false; flyer.idle(false); removers.forEach((f) => f()); };
}
