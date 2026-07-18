/* ============================================================
   SEEMA v3 "UNWIND" — motion.js · agent E (brief §6.E)
   ------------------------------------------------------------
   All motion for the one-line site. GSAP 3 + ScrollTrigger +
   Lenis (loaded as globals from js/vendor/ BEFORE this module).
   This file is an ES module: it imports the 5 spiral states
   from ../assets/svg/spiral-states.js (agent D).

   CONTRACT — animates ONLY hooks published in
   site/assets/svg/HANDOFF.md + docs/v3-ui-spec.md:
     sections #b0…#b10 · #spiral-master (the traveling line;
     its closest <svg> is "the wrapper" per D's quick contract)
     · [id^=steam-] [id^=burst-] [id^=crumb-] (svg crumb dots)
     · [id^=speck-] [id^=dial-ring] [id^=leader-path-]
     · [id^=leader-dot-] · .crumb__chapter .order-pill
     · .scroll-cue .dial .dial__pill .dial-card .card-arch
     · .stamp .u-underline .u-chili .ledger__row
     · .slot--* (media stand-ins; F swaps for <picture> at
       identical AR — selectors here accept either)
   Toggles ONLY: .is-active .is-docked .is-hidden .is-endstate
   and CSS var --u-progress (+ inline transforms/opacity).

   MARKUP EXPECTATIONS (noted for agent F — see agent E report):
   - the traveling-line svg (viewBox "0 0 1000 1000", containing
     path#spiral-master) must live OUTSIDE #b0, as a direct child
     of <body>, with inline style="visibility:hidden" (this module
     reveals it; no-JS users never see a stray fixed line).
   - #b0 is a fixed khadi overlay (z --z-loader) holding the mono
     caption; the line itself is z-raised above it during load.
   - dial svg / sprinkle svg are inlined per section (ids may be
     suffixed for uniqueness — selectors here match by prefix).

   Easing doctrine (brief §6.E): entrances expo.out · pins scrub
   power2 · stamp back-out — the site's ONE overshoot (B9).
   ============================================================ */

import { states as STATE_D } from '../assets/svg/spiral-states.js';

const doc = document;
const rootEl = doc.documentElement;
const qs = (s, c = doc) => c.querySelector(s);
const qsa = (s, c = doc) => Array.from(c.querySelectorAll(s));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const missing = [];
const noteMissing = (label) => { if (!missing.includes(label)) missing.push(label); };

const EASE_ENTER = 'expo.out';          /* cubic-bezier(.16,1,.3,1)        */
const EASE_SCRUB = 'power2.inOut';
const EASE_SLAP  = 'back.out(1.8)';     /* ≈ cubic-bezier(.34,1.56,.64,1)  */
const ROAST = '#2E1F16', HALDI = '#DA8A1D', CHILI = '#A93B26';

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
   1 · batch number (prefer F's #stamp-batch-no; else WWYY)
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
  'BATCH ' + BATCH, 'ONE PAIR OF HANDS', 'THE HANDS', 'NO CORNERS CUT',
  'NOTHING TO HIDE', 'EVERYTHING INSIDE', 'THE CRUNCH', 'THE SHELF',
  'HERSELF', 'FRESH BY BATCH', 'TO YOURS',
];
/* pin distances ×viewport-height: [desktop, mobile (−40%)] */
const PIN = { b2: [1.5, 1.0], b3: [2.0, 1.2], b4: [2.5, 1.5], b5: [3.0, 0], b8: [1.5, 1.0], b9: [2.0, 1.2] };

/* ------------------------------------------------------------
   2 · the morph engine — 5 same-count states, per-point lerp
   Pre-parsed to Float64Arrays at load (tech spec: never parse
   per frame). Per frame: one lerp + one setAttribute('d').
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
   3 · pose engine — the wrapper FLIP
   A pose maps viewBox units to viewport px: (u,v)→(u·s+x, v·s+y).
   Pose fns are scroll/transform-independent (offset-tree walks
   or spec coordinates) and cached at ScrollTrigger refresh.
   ------------------------------------------------------------ */
const vw = () => window.innerWidth;
const vh = () => window.innerHeight;
const isMobileNow = () => vw() < 768;
const pageMargin = () => Math.min(Math.max(20, vw() * 0.06), 96);

function poseCenter(box, cx, cy, s) {
  return { x: cx - box.cx * s, y: cy - box.cy * s, s };
}
/* untransformed centre of el measured inside its section via the
   offset tree (= its viewport position while that section is
   pinned at top; immune to in-flight gsap transforms) */
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
  return qs('.slot--1x1:not(.slot--cutout)', sec) ||
         qsa('picture, img', sec).find((el) => !el.closest('.slot--cutout, .card-arch')) || null;
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
    const y = (isMobileNow() ? 0.80 : 0.78) * vh();
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
      /* viewport y of the section top at end-scroll, clamped: if the
         footer is taller than the viewport it fills it entirely */
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

/* haldi tint while the line is actively morphing (brief §2.1:
   haldi = the traveling line's "active" state) */
const tintLerp = hasGSAP ? window.gsap.utils.interpolate(ROAST, HALDI) : null;
function tintLine(k) {
  if (lineWrap && tintLerp) lineWrap.style.color = k <= 0.01 ? '' : tintLerp(k);
}

/* ============================================================
   INIT
   ============================================================ */
if (!hasGSAP || !linePath) {
  /* no engine → complete page, zero motion */
  rootEl.classList.add('is-endstate');
  qsa('.beat, section[id^="b"]').forEach((b) => b.classList.add('is-endstate'));
  if (!hasGSAP) noteMissing('gsap/ScrollTrigger globals (js/vendor)');
  const b0 = qs('#b0');
  if (b0) b0.style.display = 'none';
  if (lineWrap) lineWrap.style.visibility = 'hidden';
  window.SeemaMotion = { version: 'v3-noop', batch: BATCH, missing };
} else {
  boot();
}

function boot() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const zLine = parseInt(getComputedStyle(rootEl).getPropertyValue('--z-line'), 10) || 20;
  /* base styles for the wrapper: fixed 1000×1000 square, origin 0 0 —
     at scale 1, 1 viewBox unit = 1px, so poses are pure {x,y,scale} */
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

  /* the loader runs exactly once, whatever the media context */
  if (REDUCED_MQ.matches) runLoaderReduced();
  else runLoader();

  if (doc.fonts) doc.fonts.ready.then(() => ScrollTrigger.refresh());

  window.SeemaMotion = {
    version: 'v3', batch: BATCH, missing,
    get lenis() { return lenis; },
    get loaderDone() { return loaderDone; },
    drawLine, poses: POSES,
  };
}

/* ============================================================
   4 · LOADER — L2 weighted progress + L3 dashoffset draw
        + L9 morph-to-horizon handoff (B0)
   ============================================================ */
function collectAssetProgress(onProgress) {
  /* weighted: hero (fetchpriority=high) ×3, other imgs ×1, fonts ×2 */
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
  const zLine = parseInt(getComputedStyle(rootEl).getPropertyValue('--z-line'), 10) || 20;
  const minMs = parseFloat(getComputedStyle(rootEl).getPropertyValue('--t-loader-min')) || 1200;

  /* lock scroll for the whole ceremony */
  rootEl.style.overflow = 'hidden';
  if (lenis) lenis.stop();

  drawLine('coiled', 'coiled', 0);
  applyPose(POSES.loader());
  gsap.set(lineWrap, { zIndex: zLoader + 10, autoAlpha: 1 });

  const L = linePath.getTotalLength();
  linePath.style.strokeDasharray = String(L);
  linePath.style.strokeDashoffset = String(L);

  let target = 0, shown = 0, finished = false;
  const t0 = performance.now();
  collectAssetProgress((p) => { target = Math.max(target, p); });

  const tick = () => {
    if (finished) return;
    const elapsed = performance.now() - t0;
    shown += (target - shown) * 0.14;                    /* eased catch-up (L2) */
    const capped = Math.min(shown, elapsed / minMs);     /* 1.2s floor          */
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
    const proxy = { t: 0 };
    const tl = gsap.timeline({ onComplete: releaseWorld });
    tl.call(() => { linePath.style.strokeDasharray = 'none'; linePath.style.strokeDashoffset = '0'; }, null, 0.12)
      .to(proxy, {
        t: 1, duration: 1.15, ease: EASE_SCRUB,
        onUpdate() {
          drawLine('coiled', 'unwound', proxy.t);          /* the coil unwinds…  */
          applyPose(lerpPose(from, POSES.rule(), proxy.t)); /* …and travels home  */
          tintLine(Math.sin(Math.PI * proxy.t) * 0.6);
        },
      }, 0.15);
    if (caption) tl.to(caption, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, 0.15);
    if (overlay) tl.to(overlay, { autoAlpha: 0, duration: 0.5, ease: 'power1.inOut' }, 0.75);
  }

  function releaseWorld() {
    if (overlay) gsap.set(overlay, { display: 'none' });
    gsap.set(lineWrap, { zIndex: zLine });
    tintLine(0);
    rootEl.style.overflow = '';
    if (lenis) lenis.start();
    loaderDone = true;
    resolveLoader();
    window.ScrollTrigger.refresh();
  }
}

function runLoaderReduced() {
  /* brief B0 fallback: spiral at 60% opacity → simple crossfade to the
     hero rule. The STATIC .hero__rule is the rule under reduce (the
     end-state twin), so the spiral fades out while it fades in; the
     traveling line then retires for good (no scrubbing under reduce). */
  const gsap = window.gsap;
  const overlay = qs('#b0');
  const heroRule = qs('#b1 .hero__rule');
  if (overlay) gsap.set(overlay, { display: 'none' });
  drawLine('coiled', 'coiled', 0);
  applyPose(POSES.loader());
  gsap.set(lineWrap, { autoAlpha: 0.6, zIndex: 210 });
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
    setTimeout(finish, 4000);              /* never hold the ceremony */
  } else {
    setTimeout(finish, minMs);
  }
}

/* ============================================================
   5 · REDUCED MOTION — kill-switch → pre-composed end states
   ============================================================ */
function setupEndstate() {
  const gsap = window.gsap;
  rootEl.classList.add('is-endstate');
  qsa('.beat, section[id^="b"]').forEach((b) => b.classList.add('is-endstate'));
  /* park the traveling line (covers a motion→reduce OS toggle mid-
     session; during initial boot runLoaderReduced re-raises it) */
  if (lineWrap && loaderDone) gsap.set(lineWrap, { autoAlpha: 0 });

  /* steam + sprinkle hidden; burst pre-rendered faint; underlines
     pre-drawn (CSS default --u-progress:1 — we simply never zero them) */
  qsa('[id^="steam-"], [id^="speck-"]').forEach((el) => gsap.set(el, { autoAlpha: 0 }));
  qsa('#b6 svg').forEach((svg) => { if (svg.querySelector('[id^="burst-"]')) gsap.set(svg, { opacity: 0.12 }); });

  const observers = [];
  /* under reduce the STATIC twins (.hero__rule / .coil__seal) are the
     line; the traveling svg only appears during the loader crossfade
     (runLoaderReduced owns its alpha — an IntersectionObserver here
     used to fight that and double-draw the rule) */

  /* order pill docks when the shelf is reached (functional, no motion) */
  const pill = qs('.order-pill');
  const b7 = qs('#b7');
  if (pill && b7) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) pill.classList.add('is-docked'); });
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(b7);
    observers.push(io);
  } else if (pill) pill.classList.add('is-docked');

  /* crumb rewrites, instant */
  const chapterEl = qs('.crumb__chapter');
  if (chapterEl) {
    chapterEl.textContent = CHAPTERS[1];
    for (let i = 1; i <= 10; i++) {
      const sec = qs('#b' + i);
      if (!sec) continue;
      const text = CHAPTERS[i];
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) chapterEl.textContent = text; });
      }, { rootMargin: '-50% 0px -50% 0px' });
      io.observe(sec);
      observers.push(io);
    }
  }

  /* scroll cue */
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
   6 · FULL MOTION — Lenis, chrome, beats, the journey
   ============================================================ */
function setupMotion(ctx, isDesk) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const removers = [];
  let alive = true;
  const pinPx = (key) => () => '+=' + Math.round(vh() * PIN[key][isDesk ? 0 : 1]);
  /* a zero-length pad at t=1 so timeline positions read as scrub fractions */
  const pad1 = (tl) => tl.to({ _: 0 }, { _: 1, duration: 0.0001 }, 1);

  /* ---- Lenis wiring ------------------------------------------------ */
  lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => { if (lenis) lenis.raf(time * 1000); };
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  if (!loaderDone) lenis.stop();
  removers.push(() => { gsap.ticker.remove(raf); lenis.destroy(); lenis = null; });

  /* ---- chrome pt.1: crumb crossfade + scroll cue -------------------
     (crumb/order-pill ScrollTriggers are created AFTER the beats so
     their positions include every pin's spacing — see chrome pt.2) */
  const chapterEl = qs('.crumb__chapter');
  if (!chapterEl) noteMissing('.crumb__chapter');
  let currentChapter = null;
  const setChapter = (text) => {
    if (!chapterEl || text === currentChapter) return;
    if (currentChapter === null) { chapterEl.textContent = text; currentChapter = text; return; }
    currentChapter = text;
    gsap.timeline()
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

  /* =================================================================
     BEATS — pinned scrub timelines (created BEFORE journey segments
     so pin spacing is already resolved when segments measure)
     ================================================================= */

  /* ---- B1 · hero --------------------------------------------------- */
  const heroMedia = qs('#b1 .slot--4x5') || qs('#b1 picture') || qs('#b1 img');
  const heroLines = qsa('#b1 .t-display');
  const heroUnderline = qs('#b1 .u-underline');
  const steams = qsa('#b1 [id^="steam-"]');
  if (!heroMedia) noteMissing('#b1 hero media (.slot--4x5/picture)');
  if (!steams.length) noteMissing('#b1 steam squiggles ([id^=steam-])');

  if (!loaderDone) {
    if (heroLines.length) gsap.set(heroLines, { autoAlpha: 0, y: 26 });
    if (heroUnderline) gsap.set(heroUnderline, { '--u-progress': 0 });
  }
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: EASE_ENTER } });
    if (!heroIntroPlayed && heroLines.length) {
      tl.to(heroLines, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0);
    } else if (heroLines.length) gsap.set(heroLines, { autoAlpha: 1, y: 0 });
    if (heroUnderline) tl.to(heroUnderline, { '--u-progress': 1, duration: 0.7 }, heroIntroPlayed ? 0 : 0.4);
    heroIntroPlayed = true;
    /* idle drift — desktop only: ±1.5px @2s + slow ±1.5° (never static, never busy) */
    if (isDesk && heroMedia) {
      gsap.fromTo(heroMedia, { y: -1.5 }, { y: 1.5, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.fromTo(heroMedia, { rotation: -1.5 }, { rotation: 1.5, duration: 3.65, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    /* steam — staggered squiggles, prime-offset periods (2.3/2.9/3.7s) */
    const durations = [2.3, 2.9, 3.7];
    const activeSteams = isDesk ? steams : steams.slice(0, 1);
    steams.forEach((el) => gsap.set(el, { autoAlpha: 0 }));
    activeSteams.forEach((el, i) => {
      const d = durations[i % 3];
      gsap.timeline({ repeat: -1, delay: i * 0.7 })
        .fromTo(el, { y: -6, autoAlpha: 0 }, { y: -14, autoAlpha: 0.55, duration: d / 2, ease: 'sine.inOut' })
        .to(el, { y: -22, autoAlpha: 0, duration: d / 2, ease: 'sine.inOut' });
    });
  }

  /* ---- B2 · 04:30 aperture reveal (pin 150vh/100vh) ---------------- */
  const b2 = qs('#b2');
  if (b2) {
    const wrap = qs('#b2 .slot--16x9') || qs('#b2 picture');
    const img = wrap && wrap.querySelector('img');
    const ts = qs('#b2 .t-mono--up');
    const head = qs('#b2 .t-chapter');
    if (!wrap) noteMissing('#b2 aperture media (.slot--16x9/picture)');
    const winW = () => (isDesk ? 0.34 : 0.60) * vw();
    const winCy = () => (isDesk ? 0.50 : 0.46) * vh();
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b2, start: 'top top', end: pinPx('b2'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    pad1(tl);
    if (wrap) {
      tl.fromTo(wrap, {
        clipPath: () => {
          const w0 = winW(), h0 = w0 * 9 / 16, cy = winCy();
          const ix = (vw() - w0) / 2;
          return `inset(${Math.max(0, cy - h0 / 2)}px ${ix}px ${Math.max(0, vh() - cy - h0 / 2)}px ${ix}px round 14px)`;
        },
      }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.7, ease: EASE_SCRUB }, 0);
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 0.7, ease: EASE_SCRUB }, 0);
      if (ts) {
        /* the timestamp tracks the window's top-left corner as it grows */
        tl.fromTo(ts, {
          x: () => (vw() - winW()) / 2,
          y: () => winCy() - (winW() * 9 / 16) / 2,
        }, { x: 0, y: 0, duration: 0.7, ease: EASE_SCRUB }, 0);
      }
    }
    if (head) tl.fromTo(head, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 0.7);
  }

  /* ---- B3 · manifesto — the line underlines the truth (pin 200vh) -- */
  const b3 = qs('#b3');
  let b3SegHook = null;
  if (b3) {
    const uls = qsa('#b3 .u-underline');
    const chiliWord = qs('#b3 .u-chili');
    if (uls.length < 4) noteMissing('#b3 four .u-underline spans (found ' + uls.length + ')');
    if (uls.length) gsap.set(uls, { '--u-progress': 0 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b3, start: 'top top', end: pinPx('b3'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { if (b3SegHook) b3SegHook(self.progress); },
      },
    });
    pad1(tl);
    /* four negations fire at scrub .2/.4/.6/.8, each over 8% of scrub */
    uls.forEach((ul, i) => {
      tl.to(ul, { '--u-progress': 1, duration: 0.08, ease: 'none' }, 0.2 * (i + 1) - 0.08);
    });
    /* "refuses" — the chapter's single chili word, from scrub .85 */
    if (chiliWord) tl.fromTo(chiliWord, { color: ROAST }, { color: CHILI, duration: 0.1, ease: 'none' }, 0.85);
  }

  /* ---- B4 + B9 · the dial (built once, reused re-labeled) ---------- */
  function buildDial(secSel, pinKey, withCards, withStamp) {
    const sec = qs(secSel);
    if (!sec) { noteMissing(secSel + ' section'); return null; }
    const dial = sec.querySelector('.dial');
    const centerFig = sec.querySelector('.dial__center');
    const pills = qsa('.dial__pill', sec);
    const cards = withCards ? qsa('.dial-card', sec) : [];
    const ring = sec.querySelector('[id^="dial-ring"]');
    if (!dial) noteMissing(secSel + ' .dial');
    if (pills.length < 4) noteMissing(secSel + ' four .dial__pill (found ' + pills.length + ')');

    /* the traveling line IS the orbit in motion mode — the static
       fallback ring stands down (HANDOFF §6: never both at full) */
    if (ring) gsap.set(ring, { opacity: 0 });
    if (isDesk && pills.length) gsap.set(pills, { xPercent: -50, yPercent: -50 });
    cards.forEach((c, i) => gsap.set(c, isDesk ? { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 6 } : { opacity: i === 0 ? 1 : 0.45 }));

    let activeIdx = -1;
    const setActive = (idx) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      pills.forEach((p, i) => p.classList.toggle('is-active', i === idx));
      cards.forEach((c, i) => {
        if (isDesk) gsap.to(c, { autoAlpha: i === idx ? 1 : 0, y: i === idx ? 0 : 6, duration: 0.15, ease: EASE_ENTER, overwrite: 'auto' });
        else gsap.to(c, { opacity: i === idx ? 1 : 0.45, duration: 0.15, ease: EASE_ENTER, overwrite: 'auto' });
      });
    };
    setActive(0);

    let slapped = false;
    const stampEl = withStamp ? sec.querySelector('.stamp') : null;
    if (withStamp && !stampEl) noteMissing(secSel + ' .stamp');
    if (stampEl) gsap.set(stampEl, { autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: pinPx(pinKey),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate(self) {
          /* active pill = the one arriving at N (quarter midpoints) */
          setActive(Math.max(0, Math.min(3, Math.round(self.progress * 3))));
          if (stampEl) {
            if (self.progress >= 0.9 && !slapped) {
              slapped = true;
              /* the slap — scale 1.4→1, rotate −8°→−6°, 350ms back-out.
                 THE site's single overshoot. */
              gsap.timeline()
                .fromTo(stampEl, { scale: isDesk ? 1.4 : 1.2, rotation: -8 }, { autoAlpha: 1, duration: 0.04 }, 0)
                .to(stampEl, { scale: isDesk ? 1 : 0.85, rotation: -6, duration: 0.35, ease: EASE_SLAP }, 0.04);
            } else if (self.progress < 0.85 && slapped) {
              slapped = false;
              gsap.set(stampEl, { autoAlpha: 0 });
            }
          }
        },
      },
    });
    pad1(tl);
    if (isDesk && dial) {
      /* scroll rotates the orbit 90° per quarter; pills counter-rotate */
      gsap.set(dial, { transformOrigin: '50% 50%' });
      tl.to(dial, { rotation: -270, ease: 'none', duration: 1 }, 0);
      pills.forEach((p) => tl.to(p, { rotation: 270, ease: 'none', duration: 1 }, 0));
      /* B9's centre is the DIRECTIONAL S9 pack scene — it must stay
         square to camera while the orbit turns (audit #4). B4's S2 is
         dead-flat top-down, where spinning with the dial is the point. */
      if (withStamp && centerFig) {
        gsap.set(centerFig, { transformOrigin: '50% 50%' });
        tl.to(centerFig, { rotation: 270, ease: 'none', duration: 1 }, 0);
      }
    }
    return tl;
  }
  buildDial('#b4', 'b4', true, false);
  /* #b9 is built AFTER B5–B8 (document order) so its trigger start
     includes their pin spacing — see below */

  /* ---- B5 · everything inside — the exploded chakli ---------------- */
  const b5 = qs('#b5');
  if (b5 && isDesk) {
    const center = b5Center();
    const cutouts = qsa('#b5 .slot--cutout, #b5 .cutout');
    const labels = qsa('#b5 .t-mono:not(.t-mono--up)');
    const leaders = qsa('#b5 [id^="leader-path-"]');
    const dots = qsa('#b5 [id^="leader-dot-"]');
    const DEPTHS = [0.6, 0.8, 1.0, 0.7, 0.9, 0.5, 0.8];   /* ui-spec §B5 table */
    if (!center) noteMissing('#b5 center media (.slot--1x1)');
    if (cutouts.length < 7) noteMissing('#b5 seven cutouts (found ' + cutouts.length + ')');
    if (leaders.length < 7) noteMissing('#b5 seven leader paths (found ' + leaders.length + ')');

    /* audit #5: leaders were static 1200×800 coords stretched with
       preserveAspectRatio=none against vw/vh-positioned cutouts —
       endpoints dangled 80–150px+ off target. Re-draw every leader
       from the REAL geometry (rim of the centre → edge of each
       cutout) in px units, at load + every ScrollTrigger refresh. */
    const leadersSvg = leaders.length ? leaders[0].ownerSVGElement : null;
    function layoutLeaders() {
      if (!leadersSvg || !center) return;
      const host = leadersSvg.parentElement;
      const W = host.clientWidth || 1, H = host.clientHeight || 1;
      leadersSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      const c = pinnedCenter(b5, center);
      if (!c) return;
      const R = (Math.max(c.w, c.h) * 1.14) / 2;      /* = the traveling line's rim */
      cutouts.forEach((cut, i) => {
        const p = leaders[i];
        if (!p) return;
        const k = pinnedCenter(b5, cut);
        if (!k) return;
        const dx = k.cx - c.cx, dy = k.cy - c.cy;
        const m = Math.hypot(dx, dy) || 1;
        const ux = dx / m, uy = dy / m;
        const sx = c.cx + ux * R, sy = c.cy + uy * R;              /* branch off rim  */
        const gap = Math.max(k.w, k.h) / 2 + 8;
        const ex = k.cx - ux * gap, ey = k.cy - uy * gap;          /* land at cutout  */
        const bow = (i % 2 ? -1 : 1) * Math.min(26, m * 0.09);     /* hand-drawn bow  */
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

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b5, start: 'top top', end: pinPx('b5'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    pad1(tl);
    if (center) tl.fromTo(center, { scale: 1.05 }, { scale: 1, duration: 0.4, ease: EASE_SCRUB }, 0);

    cutouts.forEach((cut, i) => {
      const at = 0.08 + i * 0.075;
      const depth = DEPTHS[i % DEPTHS.length];
      /* nearest-layer DOF blur is CSS (.cutout--near img) — img only,
         so the mono label stays legible (audit #5: the JS filter here
         blurred the whole figure and double-blurred the img) */
      const delta = (axis) => () => {
        const c = center && pinnedCenter(b5, center);
        const k = pinnedCenter(b5, cut);
        if (!c || !k) return 0;
        return axis === 'x' ? c.cx - k.cx : c.cy - k.cy;
      };
      tl.fromTo(cut,
        { x: delta('x'), y: delta('y'), scale: 0.35, autoAlpha: 0, rotation: i % 2 ? 5 : -5 },
        { x: 0, y: 0, scale: 1, autoAlpha: 1, rotation: 0, duration: 0.2, ease: EASE_SCRUB }, at);
      /* per-cutout parallax depth after landing (mobile rule halves it,
         but B5 desktop-only — kept explicit for clarity) */
      tl.to(cut, { y: () => -depth * 44 * (isDesk ? 1 : 0.5), duration: Math.max(0.1, 1 - (at + 0.24)), ease: 'none' }, at + 0.24);
      if (dots[i]) tl.to(dots[i], { attr: { r: 4 }, duration: 0.03, ease: 'power2.out' }, at + 0.02);
      if (leaders[i]) tl.to(leaders[i], { strokeDashoffset: 0, duration: 0.16, ease: EASE_SCRUB }, at + 0.045);
      if (labels[i]) tl.fromTo(labels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: 'none' }, at + 0.16);
    });
  } else if (b5 && !isDesk) {
    /* below 768px this beat swaps entirely to the S4 flat-lay (brief rule) */
    const flat = qs('#b5 .slot--16x9') || qs('#b5 picture');
    if (flat) {
      gsap.from(flat, {
        autoAlpha: 0, y: 32, duration: 0.9, ease: EASE_ENTER,
        scrollTrigger: { trigger: b5, start: 'top 72%', toggleActions: 'play none none none' },
      });
    }
  }

  /* ---- B6 · the crunch — one-shot burst ---------------------------- */
  const b6 = qs('#b6');
  if (b6) {
    const burstSvg = qsa('#b6 svg').find((s) => s.querySelector('[id^="burst-"]'));
    const head6 = qs('#b6 .t-display');
    if (!burstSvg) noteMissing('#b6 crunch-burst svg ([id^=burst-])');
    if (burstSvg) {
      const linesB = qsa('[id^="burst-"]', burstSvg);
      const crumbs = qsa('[id^="crumb-"]', burstSvg);
      linesB.forEach((l) => {
        const L = l.getTotalLength();
        l.style.strokeDasharray = String(L);
        l.style.strokeDashoffset = String(L);
      });
      gsap.set(burstSvg, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: b6, start: 'top 55%', once: true,
        onEnter() {
          /* 350ms, ease-out, 1-frame scale pop at start (catalog #24) */
          const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
          tl.set(burstSvg, { autoAlpha: 1, scale: 1.06, transformOrigin: 'center center' }, 0)
            .to(burstSvg, { scale: 1, duration: 0.09 }, 0.016)
            .fromTo(linesB, { scale: 0.6, svgOrigin: '120 120' }, { scale: 1, duration: 0.3 }, 0)
            .to(linesB, { strokeDashoffset: 0, duration: 0.3 }, 0);
          crumbs.forEach((c) => {
            const b = c.getBBox();
            const dx = b.x + b.width / 2 - 120, dy = b.y + b.height / 2 - 120;
            const m = Math.hypot(dx, dy) || 1;
            tl.fromTo(c, { x: 0, y: 0 }, { x: (dx / m) * 26, y: (dy / m) * 26, duration: 0.32 }, 0.02);
          });
          tl.to(burstSvg, { autoAlpha: 0, duration: 0.12 }, 0.26);
        },
      });
    }
    if (head6) {
      gsap.from(head6, {
        autoAlpha: 0, y: 28, duration: 0.9, ease: EASE_ENTER,
        scrollTrigger: { trigger: b6, start: 'top 55%', toggleActions: 'play none none none' },
      });
    }
  }

  /* ---- B7 · the shelf — entrances, jelly wobble, sprinkle ---------- */
  const b7 = qs('#b7');
  if (b7) {
    const cards = qsa('#b7 .card-arch');
    if (!cards.length) noteMissing('#b7 .card-arch cards');
    if (cards.length) {
      gsap.from(cards, {
        autoAlpha: 0, y: 36, duration: 0.9, ease: EASE_ENTER, stagger: 0.09,
        scrollTrigger: { trigger: b7, start: 'top 70%', toggleActions: 'play none none none' },
      });
    }
    if (isDesk) {
      cards.forEach((card) => {
        const specks = qsa('[id^="speck-"]', card);
        specks.forEach((s) => gsap.set(s, { autoAlpha: 0 }));
        if (!specks.length) noteMissing('#b7 sprinkle specks in cards ([id^=speck-])');
        const onEnter = (ev) => {
          /* jelly wobble — 6% squash, volume-preserved, no overshoot
             (the site's only overshoot belongs to the B9 stamp) */
          gsap.timeline({ defaults: { overwrite: 'auto' } })
            .to(card, { scaleY: 0.94, scaleX: 1.045, duration: 0.13, ease: 'power2.out' })
            .to(card, { scaleY: 1, scaleX: 1, duration: 0.5, ease: EASE_ENTER });
          /* a pinch of sesame: 2 specks near the cursor edge, never all */
          if (specks.length) {
            const r = card.getBoundingClientRect();
            const leftHalf = ev && ev.clientX ? (ev.clientX - r.left) < r.width / 2 : Math.random() < 0.5;
            const pool = specks.slice().sort((a, b) => {
              const ax = a.getBBox().x, bx = b.getBBox().x;
              return leftHalf ? ax - bx : bx - ax;
            });
            pool.slice(0, 2).forEach((s, i) => {
              gsap.fromTo(s, { y: 0, rotation: 0, autoAlpha: 0.8 },
                { y: 12, rotation: i ? -20 : 20, autoAlpha: 0, duration: 0.4, ease: 'power1.in', delay: i * 0.06, overwrite: 'auto' });
            });
          }
        };
        card.addEventListener('mouseenter', onEnter);
        removers.push(() => card.removeEventListener('mouseenter', onEnter));
      });
    }
  }

  /* ---- B8 · Seema — the rack focus (pin 150vh/100vh) --------------- */
  const b8 = qs('#b8');
  if (b8) {
    const portrait = qs('#b8 .slot--4x5') || qs('#b8 picture') || qs('#b8 img');
    const name = qs('#b8 .t-display');
    const dev = qs('#b8 .t-dev');
    const rows = qsa('#b8 .ledger__row');
    if (!portrait) noteMissing('#b8 portrait media (.slot--4x5/picture)');
    /* blur snapshotted to ≤3 steps on low-power devices (tech spec) */
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: b8, start: 'top top', end: pinPx('b8'),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (lowPower && portrait) ? (self) => {
          const steps = [24, 10, 0];
          const idx = Math.min(2, Math.floor(clamp01(self.progress / 0.75) * 3));
          const v = 'blur(' + steps[idx] + 'px)';
          if (portrait.style.filter !== v) portrait.style.filter = v;
        } : undefined,
      },
    });
    pad1(tl);
    if (portrait && !lowPower) {
      tl.fromTo(portrait, { filter: 'blur(24px)' }, { filter: 'blur(0px)', duration: 0.75, ease: 'none' }, 0);
    } else if (portrait) {
      gsap.set(portrait, { filter: 'blur(24px)' });
    }
    if (name) tl.fromTo(name, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0.1);
    if (dev) tl.fromTo(dev, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0.18);
    /* ledger lines — letters-behind-clip grammar (L10), staggered up */
    rows.forEach((row, i) => {
      tl.fromTo(row,
        { clipPath: 'inset(0% 0% 100% 0%)', y: 14, autoAlpha: 0 },
        { clipPath: 'inset(0% 0% -10% 0%)', y: 0, autoAlpha: 1, duration: 0.12, ease: 'power2.out' },
        0.58 + i * 0.1);
    });
  }

  /* ---- B9 · fresh by batch — dial reuse + stamp (document order) --- */
  buildDial('#b9', 'b9', false, true);

  /* ---- B10 · footer entrances -------------------------------------- */
  const b10 = qs('#b10');
  if (b10) {
    const items = qsa('#b10 .t-chapter, #b10 .btn, #b10 .t-mono, #b10 .chrome__wordmark');
    if (items.length) {
      gsap.from(items, {
        autoAlpha: 0, y: 24, duration: 0.9, ease: EASE_ENTER, stagger: 0.07,
        scrollTrigger: { trigger: b10, start: 'top 55%', toggleActions: 'play none none none' },
      });
    }
    /* the rule at 78vh — "the line's literal last inch" */
    const rule10 = qs('#b10 hr') || qs('#b10 .u-rule-dotted');
    if (rule10) {
      gsap.fromTo(rule10, { scaleX: 0, transformOrigin: '0 50%' }, {
        scaleX: 1, ease: EASE_SCRUB,
        scrollTrigger: { trigger: b10, start: 'top 45%', end: 'bottom bottom', scrub: true },
      });
    }
  }

  /* ---- chrome pt.2: crumb boundaries + order pill ------------------
     Zero-length markers at each beat's 50%-crossing; pinned chapters
     hold their name for the entire pin (markers sit after the pins
     in creation order, so spacing is accounted). */
  const present = [];
  for (let i = 1; i <= 10; i++) if (qs('#b' + i)) present.push(i);
  present.forEach((i, idx) => {
    if (idx === 0) return;                       /* first beat set at loader end */
    const prev = present[idx - 1];
    ScrollTrigger.create({
      trigger: '#b' + i, start: 'top 50%', end: 'top 50%',
      onEnter: () => setChapter(CHAPTERS[i]),
      onLeaveBack: () => setChapter(CHAPTERS[prev]),
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
     THE JOURNEY — the one line, B0 → B10
     Segments map scroll ranges → (state morph t, wrapper pose lerp).
     Only the active segment writes; refresh-sync re-applies the
     correct segment after any resize/refresh/jump.
     ================================================================= */
  const segs = [];
  function renderSeg(seg, t) {
    if (!loaderDone) return;
    if (!seg.pA) { seg.pA = seg.poseFnA(); seg.pB = seg.poseFnB(); }
    drawLine(seg.A, seg.B, t);
    applyPose(lerpPose(seg.pA, seg.pB, t));
    tintLine(seg.A === seg.B ? 0 : Math.sin(Math.PI * t) * 0.55);
    /* audit #11: the circled→recoiled lerp self-crosses mid-morph
       (a scribbly pigtail) — dip the line's alpha through the ugly
       middle; guaranteed 1 at both ends (sin curve) */
    if (seg.dip) gsap.set(lineWrap, { autoAlpha: 1 - 0.7 * Math.sin(Math.PI * t) });
  }
  function addSeg(A, B, poseFnA, poseFnB, trig, opts) {
    if (!qs(trig.trigger) || (trig.endTrigger && !qs(trig.endTrigger))) return null;
    const seg = { A, B, pA: null, pB: null, poseFnA, poseFnB, st: null, dip: !!(opts && opts.dip) };
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

  /* B1 rule → B3 snake: the line lifts off the hero and morphs across
     B2's pin — passing through the dawn photo, Bucks-stitch style */
  addSeg('unwound', 'snaking', rulePose, snakeHi,
    { trigger: '#b2', start: 'top bottom', endTrigger: '#b3', end: 'top top' });
  /* B3 pin: the snake slides down through the paragraph while the
     underlines fire (hooked into B3's own pinned timeline) */
  if (b3) {
    const b3St = ScrollTrigger.getAll().find((st) => st.trigger === b3 && st.pin);
    if (b3St) {
      const seg = { A: 'snaking', B: 'snaking', pA: null, pB: null, poseFnA: snakeHi, poseFnB: snakeLo, st: b3St };
      segs.push(seg);
      b3SegHook = (p) => renderSeg(seg, p);
    }
  }
  /* B3 → B4: the snake crests and closes into the orbit ring */
  addSeg('snaking', 'circled', snakeLo, dial4,
    { trigger: '#b4', start: 'top bottom', end: 'top top' });
  if (isDesk && b5) {
    /* B4 → B5: the orbit shrinks to hug the exploded chakli's rim
       (the leader lines branch off it) */
    addSeg('circled', 'circled', dial4, rimPose,
      { trigger: '#b5', start: 'top bottom', end: 'top top' });
    /* B5 → B6: the ring rides up and out with the released pin */
    addSeg('circled', 'circled', rimPose, shift(rimPose, up),
      { trigger: '#b6', start: 'top bottom', end: 'top top' });
  } else {
    addSeg('circled', 'circled', dial4, shift(dial4, up),
      { trigger: b5 ? '#b5' : '#b6', start: 'top bottom', end: b5 ? 'top 25%' : 'top top' });
  }
  /* …offscreen through the shelf and the portrait… re-enters under B9 */
  addSeg('circled', 'circled', shift(dial9, down), dial9,
    { trigger: '#b9', start: 'top bottom', end: 'top top' });
  /* B9 → B10: the line comes home — re-coil into the seal.
     start is clamped past B9's pin end: on mobile the B9 section is
     shorter than the viewport, so a plain 'top bottom' start began
     re-coiling DURING the pin and dragged the orbit off its ring
     (the audit's ~35px up-left misregistration). */
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

  /* after any refresh: recompute poses, re-render the correct segment */
  const syncJourney = () => {
    segs.forEach((s) => { s.pA = s.poseFnA(); s.pB = s.poseFnB(); });
    if (!loaderDone) return;
    const y = window.scrollY;
    let best = -1;
    segs.forEach((s, i) => { if (s.st && s.st.start <= y + 1) best = i; });
    if (best === -1) {
      drawLine('unwound', 'unwound', 0);
      applyPose(POSES.rule());
      tintLine(0);
      return;
    }
    const s = segs[best];
    renderSeg(s, clamp01((y - s.st.start) / Math.max(1, s.st.end - s.st.start)));
  };
  ScrollTrigger.addEventListener('refresh', syncJourney);
  removers.push(() => ScrollTrigger.removeEventListener('refresh', syncJourney));

  /* refresh order must be document order regardless of creation order */
  ScrollTrigger.sort();

  /* hero intro + crumb + first journey render once the loader hands off */
  loaderPromise.then(() => {
    if (!alive) return;
    ctx.add(() => {
      heroIntro();
      if (window.scrollY < vh() / 2 && present.length) setChapter(CHAPTERS[present[0]]);
      syncJourney();
    });
  });
  if (loaderDone) requestAnimationFrame(() => { if (alive) ScrollTrigger.refresh(); });

  return () => { alive = false; removers.forEach((f) => f()); };
}
