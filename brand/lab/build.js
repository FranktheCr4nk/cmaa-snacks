#!/usr/bin/env node
/* Cmaa Brand Lab — assembles all logo + packaging specimens into one review page.
 * Reads the 8 generation-agent manifests, normalises paths, emits brand/lab/index.html.
 * Re-runnable: `node brand/lab/build.js`.
 *
 * Embedding strategy (verified):
 *  - Wordmarks (A), Spirals (B), Illustrative (D): pure drawn geometry, no <text>/@import
 *    -> lightweight <img> (isolated document, no font/photo fetch, crisp).
 *  - Emblems (C): contain <text> + Google-Fonts @import -> <object> so each loads its own fonts.
 *  - Packaging: reference photos (../../../images/*) + fonts -> <object> so relative hrefs
 *    resolve against the SVG's own folder (= assets/images) and ids stay isolated.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..'); // repo root
const OUT = path.join(__dirname, 'index.html');
const rd = p => fs.readFileSync(p, 'utf8');
const readJSON = p => JSON.parse(rd(p));
const base = f => path.basename(f);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function viewBox(absFile) {
  const m = rd(absFile).match(/viewBox="([-\d.\s]+)"/);
  if (!m) return [1, 1];
  const a = m[1].trim().split(/\s+/).map(Number);
  return [a[2], a[3]];
}
function classify(files) {
  const pick = t => files.find(f => base(f).toLowerCase().includes(t));
  return { color: pick('color'), mono: pick('mono'), rev: pick('rev') };
}

/* ---------- LOGO LAB (Chapter 01) ---------- */
const logoFamilies = [
  { key: 'A', title: 'Wordmarks', sub: 'the name, drawn', dir: 'wordmarks', embed: 'img', ratio: 'wide',
    blurb: '“Cmaa” built as pure drawn lettering — ribbon serifs, warm monolines, a bilingual twin, sign-painter and stencil cuts. Zero font dependency; the name is the mark.' },
  { key: 'B', title: 'Marks & Spirals', sub: 'the chakli coil, abstracted', dir: 'spirals', embed: 'img', ratio: 'sq',
    blurb: 'The chakli spiral distilled into one ownable monogram — an app-icon, favicon, stamp and embroidery unit. Judge these hardest at 32px.' },
  { key: 'C', title: 'Emblems & Badges', sub: 'the full lockup', dir: 'emblems', embed: 'object', ratio: 'sq',
    blurb: 'Complete crests that carry the whole story — a heritage roundel, matchbox label, molten wax seal, steel-dabba badge, arch shrine and a faral-republic postage stamp.' },
  { key: 'D', title: 'Illustrative', sub: 'the story, in one mark', dir: 'illustrative', embed: 'img', ratio: 'sq',
    blurb: 'Picture-marks: aaji herself, the two fists on the brass sorya, the rising kadhai, a Paithani peacock, a chakli mandala and the Kothrud delivery cycle.' },
];

function logoCard(fam, opt) {
  const c = classify(opt.files);
  const src = f => `../logo-lab/${fam.dir}/${base(f)}`;
  const big = (f, cls) => fam.embed === 'img'
    ? `<img class="art" loading="lazy" src="${src(f)}" alt="${esc(opt.name)} — ${cls}">`
    : `<object class="art" type="image/svg+xml" data="${src(f)}" tabindex="-1" aria-label="${esc(opt.name)} — ${cls}"></object>`;
  const fav = f => fam.embed === 'img'
    ? `<img loading="lazy" src="${src(f)}" alt="">`
    : `<object type="image/svg+xml" data="${src(f)}" tabindex="-1" aria-hidden="true"></object>`;
  return `      <article class="spec rv" id="opt-${opt.id}">
        <div class="spec__hd">
          <span class="num">${opt.id}</span>
          <div class="spec__meta">
            <h4 class="spec__name">${esc(opt.name)}</h4>
            <p class="spec__concept">${esc(opt.concept)}</p>
          </div>
        </div>
        <div class="pair pair--${fam.ratio}">
          <div class="chipwrap">
            <div class="chip chip--cream">${big(c.color, 'colour')}</div>
            <span class="chiplab">colour · cream</span>
          </div>
          <div class="chipwrap">
            <div class="chip chip--dark">${big(c.rev, 'reversed')}</div>
            <span class="chiplab">reversed · black</span>
          </div>
        </div>
        <div class="fav">
          <span class="fav__k">favicon · 32px</span>
          <span class="fav__chip fav--cream">${fav(c.color)}</span>
          <span class="fav__chip fav--cream">${fav(c.mono)}</span>
          <span class="fav__chip fav--dark">${fav(c.rev)}</span>
        </div>
      </article>`;
}

function logoFamilySection(fam) {
  const manifest = readJSON(path.join(ROOT, 'brand', 'logo-lab', fam.dir, 'manifest.json'));
  const cards = manifest.map(opt => logoCard(fam, opt)).join('\n');
  return `    <section class="family rv" id="fam-${fam.key}">
      <header class="family__hd">
        <span class="family__key">${fam.key}</span>
        <div>
          <h3 class="family__title">${fam.title} <span>· ${fam.sub}</span></h3>
          <p class="family__blurb">${fam.blurb}</p>
        </div>
      </header>
      <div class="specgrid specgrid--${fam.ratio}">
${cards}
      </div>
    </section>`;
}

/* ---------- PACKAGING LAB (Chapter 02) ---------- */
const packDirs = [
  { id: 'P1', slug: 'kadak-colorblock', title: 'KADAK Color-Block', tag: 'loud pack · calm canvas',
    concept: 'The direction that grew out of the KADAK energy the team loved. A full-bleed SKU colour field carries a giant justified Devanagari stack (each line solved to fill the measure exactly), a circular die-cut photo window with a hard ink offset shadow, an AAJI-APPROVED starburst and a cream spec block. Maximum shelf shout.',
    items: [
      { sub: 'a', cap: 'Pouch — Bhajani', file: 'pouch-bhajani.svg' },
      { sub: 'b', cap: 'Pouch — Butter', file: 'pouch-butter.svg' },
      { sub: 'c', cap: 'Flat label — Bhajani', file: 'label-bhajani-flat.svg' },
      { sub: 'd', cap: 'Flat label — Butter', file: 'label-butter-flat.svg' },
    ] },
  { id: 'P2', slug: 'heirloom-noir', title: 'Heirloom Noir', tag: 'premium gifting flagship',
    concept: 'Soft-black ground with gold restricted to line-weight — foil hairlines, filigree corners, a circumtext roundel — a Paithani kuyri band with magenta micro-accents, ivory Devanagari hero lettering, and product seen through a gold-rimmed cusped-arch die-cut. Craft-chocolate / single-malt shelf register, built for gifting.',
    items: [
      { sub: 'a', cap: 'Pouch — Bhajani', file: 'pouch-bhajani.svg' },
      { sub: 'b', cap: 'Diwali gift tin — दिवाळी फराळ', file: 'tin-diwali-faral.svg' },
    ] },
  { id: 'P3', slug: 'cartouche', title: 'Cartouche', tag: 'illustrated · Paper Boat register',
    concept: 'Storytelling on a cream ground: a flat five-ink scene of aaji at the brass sorya press mid-squeeze — a fresh spiral dropping toward the kadhai of hot oil, steam curls, chulha flames, a thali of finished chaklis at her feet. Each flavour gets its own hand-drawn world inside the same cartouche furniture.',
    items: [
      { sub: 'a', cap: 'Pouch — Bhajani', file: 'pouch-bhajani.svg' },
      { sub: 'b', cap: 'Pouch — Butter', file: 'pouch-butter.svg' },
      { sub: 'c', cap: 'Flat label — Bhajani', file: 'label-flat-bhajani.svg' },
      { sub: 'd', cap: 'Flat label — Butter', file: 'label-flat-butter.svg' },
    ] },
  { id: 'P4', slug: 'bazaar-matchbox', title: 'Bazaar Matchbox', tag: 'collectible · vintage print',
    concept: 'Giant vintage matchbox labels — maroon, gold and ink on paper, an off-rotated sunburst, the spiral emblem in a rope-framed circle, a slogan strip and a deliberate 1px misregistration on the colour plate. The pack IS the label; a matchbox-drawer die-cut shows the real product, and there is a collect-the-series uncut printer sheet.',
    items: [
      { sub: 'a', cap: 'Pouch — Bhajani', file: 'pouch-bhajani.svg' },
      { sub: 'b', cap: 'Pouch — Masala', file: 'pouch-masala.svg' },
      { sub: 'c', cap: 'Flat label — Bhajani', file: 'label-bhajani-flat.svg' },
      { sub: 'd', cap: 'Flat label — Masala', file: 'label-masala-flat.svg' },
      { sub: 'e', cap: 'Collect-the-series sheet (4-up)', file: 'series-sheet.svg', sheet: true },
    ] },
];

function packFigure(dir, it) {
  const abs = path.join(ROOT, 'assets', 'packaging', 'lab', dir.slug, it.file);
  const [w, h] = viewBox(abs);
  const src = `../../assets/packaging/lab/${dir.slug}/${it.file}`;
  const style = it.sheet
    ? `width:100%;max-width:1040px;aspect-ratio:${w}/${h};`
    : `height:var(--packH);aspect-ratio:${w}/${h};`;
  return `        <figure class="pack${it.sheet ? ' pack--sheet' : ''} rv">
          <div class="pack__art"><object type="image/svg+xml" data="${src}" style="${style}" tabindex="-1" aria-label="${esc(dir.title)} — ${esc(it.cap)}"></object></div>
          <figcaption><span class="pcap__id">${dir.id}${it.sub}</span> ${esc(it.cap)}</figcaption>
        </figure>`;
}

function packSection(dir) {
  const figs = dir.items.map(it => packFigure(dir, it)).join('\n');
  return `    <section class="direction rv" id="dir-${dir.id}">
      <header class="direction__hd">
        <span class="direction__key">${dir.id}</span>
        <div>
          <h3 class="direction__title">${dir.title}</h3>
          <p class="direction__tag">${dir.tag}</p>
        </div>
      </header>
      <p class="direction__concept">${dir.concept}</p>
      <div class="packrow">
${figs}
      </div>
    </section>`;
}

/* ---------- ASSEMBLE ---------- */
const logoSections = logoFamilies.map(logoFamilySection).join('\n');
const packSections = packDirs.map(packSection).join('\n');

const grain = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)'/%3E%3C/svg%3E\")";

const html = `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cmaa — Brand Lab · logo & packaging review</title>
<meta name="description" content="Cmaa Brand Lab — every new logo direction and packaging system in one place for the founder & team to review and vote.">
<script>document.documentElement.className='js';</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Mulish:wght@400;500;600;700;800&family=Yatra+One&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#1E1A17; --ink2:#141110; --cream:#F6EDDB; --paper:#F1E4CB;
  --gold:#C8922A; --gold2:#D4A23C; --maroon:#7A1E2B; --muted:#B9A98D;
  --line:rgba(200,146,42,.28); --packH:420px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
html,body{margin:0}
[id]{scroll-margin-top:78px}
@media(prefers-reduced-motion:reduce){ html{scroll-behavior:auto} }
body{
  background:var(--ink); color:var(--cream);
  font-family:'Mulish',system-ui,sans-serif; font-size:16px; line-height:1.6;
  -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
body::before{ /* grain */
  content:""; position:fixed; inset:0; z-index:9998; pointer-events:none;
  background-image:${grain}; background-size:150px 150px;
  opacity:.06; mix-blend-mode:overlay;
}
img,object{display:block; border:0}
a{color:inherit; text-decoration:none}
h1,h2,h3,h4{font-family:'Fraunces',Georgia,serif; font-weight:500; line-height:1.05; margin:0}
.dev{font-family:'Yatra One','Noto Sans Devanagari',serif}

/* mini nav */
.mininav{
  position:sticky; top:0; z-index:100;
  display:flex; align-items:center; gap:18px; flex-wrap:wrap;
  padding:11px clamp(16px,4vw,54px);
  background:rgba(20,17,16,.86); backdrop-filter:blur(9px);
  border-bottom:1px solid var(--line);
}
.mininav .brand{font-family:'Fraunces',serif; font-weight:600; letter-spacing:.02em; font-size:19px}
.mininav .brand span{color:var(--gold2); font-style:italic; font-weight:400}
.mininav__links{display:flex; gap:6px; flex-wrap:wrap}
.mininav__links a{
  font-size:12.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase;
  color:var(--muted); padding:6px 12px; border:1px solid transparent; border-radius:999px;
  transition:color .2s, border-color .2s, background .2s;
}
.mininav__links a:hover{color:var(--cream); border-color:var(--line); background:rgba(200,146,42,.07)}
.mininav__note{margin-left:auto; font-size:12px; color:var(--muted); font-style:italic}
.mininav__note b{color:var(--gold2); font-style:normal}
@media(max-width:820px){ .mininav__note{display:none} }

.wrap{max-width:1240px; margin:0 auto; padding:0 clamp(16px,4vw,54px)}
.rule{height:1px; background:linear-gradient(90deg,transparent,var(--line) 12%,var(--line) 88%,transparent); margin:0 clamp(16px,4vw,54px)}

/* hero */
.hero{padding:clamp(56px,9vw,120px) 0 clamp(30px,5vw,60px)}
.kicker{font-size:12.5px; letter-spacing:.34em; text-transform:uppercase; color:var(--gold2); margin:0 0 18px}
.hero h1{font-size:clamp(58px,12vw,150px); letter-spacing:-.02em; line-height:.92}
.hero h1 em{font-style:italic; color:var(--gold2); font-weight:400}
.hero__sub{max-width:56ch; font-size:clamp(17px,2.1vw,22px); color:#EADFC6; margin:26px 0 0}
.hero__meta{margin:22px 0 0; font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted)}
.hero__meta b{color:var(--cream)}
.hero__vote{
  margin:34px 0 0; max-width:64ch; font-size:14.5px; color:#E6DAC0;
  border-left:2px solid var(--gold); padding:8px 0 8px 18px; background:linear-gradient(90deg,rgba(200,146,42,.08),transparent);
}
.hero__vote b{color:var(--gold2)}

/* chapter head */
.chapter{padding:clamp(46px,7vw,90px) 0 8px}
.chapter__no{font-size:13px; letter-spacing:.34em; text-transform:uppercase; color:var(--gold2)}
.chapter__ttl{font-size:clamp(34px,6vw,68px); margin:8px 0 0; letter-spacing:-.01em}
.chapter__lead{max-width:66ch; color:#D8CBB0; margin:16px 0 0; font-size:16.5px}

/* family */
.family{padding:clamp(34px,5vw,60px) 0 0}
.family__hd{display:flex; gap:20px; align-items:baseline; padding-bottom:22px}
.family__key{
  font-family:'Fraunces',serif; font-size:clamp(40px,6vw,72px); font-weight:600; line-height:.8;
  color:var(--gold2); flex:0 0 auto; min-width:1.1em;
}
.family__title{font-size:clamp(22px,3vw,32px)}
.family__title span{color:var(--muted); font-style:italic; font-weight:400; font-size:.62em}
.family__blurb{max-width:74ch; color:#C9BB9E; margin:9px 0 0; font-size:14.5px}

.specgrid{display:grid; gap:26px}
.specgrid--wide{grid-template-columns:repeat(auto-fill,minmax(540px,1fr))}
.specgrid--sq{grid-template-columns:repeat(auto-fill,minmax(440px,1fr))}
@media(max-width:600px){ .specgrid--wide,.specgrid--sq{grid-template-columns:1fr} }

.spec{
  background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012));
  border:1px solid rgba(200,146,42,.18); border-radius:14px;
  padding:18px 18px 20px; display:flex; flex-direction:column; gap:15px;
}
.spec__hd{display:flex; gap:14px; align-items:flex-start}
.num{
  font-family:'Fraunces',serif; font-weight:600; font-size:15px; letter-spacing:.04em;
  color:var(--ink); background:var(--gold2); border-radius:7px;
  padding:4px 9px; flex:0 0 auto; line-height:1.1;
}
.spec__name{font-size:19px; letter-spacing:.01em}
.spec__concept{font-size:13px; color:#C4B593; margin:5px 0 0; line-height:1.5}

.pair{display:flex; gap:12px}
.chipwrap{flex:1; min-width:0; display:flex; flex-direction:column; gap:6px}
.chip{
  border-radius:10px; display:flex; align-items:center; justify-content:center;
  padding:14px; overflow:hidden;
}
.pair--wide .chip{height:152px}
.pair--sq .chip{height:188px}
.chip--cream{background:var(--paper)}
.chip--dark{background:#0F0C0A; border:1px solid rgba(200,146,42,.14)}
.chip .art{width:100%; height:100%; object-fit:contain; pointer-events:none}
object.art{pointer-events:none}
.chiplab{font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); text-align:center}

.fav{display:flex; align-items:center; gap:9px; margin-top:2px}
.fav__k{font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); margin-right:2px}
.fav__chip{width:44px; height:44px; border-radius:8px; display:flex; align-items:center; justify-content:center}
.fav--cream{background:var(--paper)}
.fav--dark{background:#0F0C0A; border:1px solid rgba(200,146,42,.14)}
.fav__chip img,.fav__chip object{width:32px; height:32px; pointer-events:none}

/* packaging */
.direction{padding:clamp(40px,6vw,76px) 0 0}
.direction__hd{display:flex; gap:18px; align-items:baseline}
.direction__key{
  font-family:'Fraunces',serif; font-weight:600; font-size:clamp(34px,5vw,60px); line-height:.8;
  color:var(--gold2); flex:0 0 auto;
}
.direction__title{font-size:clamp(24px,3.4vw,40px)}
.direction__tag{font-size:12.5px; letter-spacing:.2em; text-transform:uppercase; color:var(--gold); margin:6px 0 0}
.direction__concept{max-width:80ch; color:#D2C5AA; margin:16px 0 4px; font-size:15.5px; line-height:1.6}
.packrow{
  display:flex; flex-wrap:wrap; gap:clamp(20px,3vw,40px);
  align-items:flex-end; justify-content:center; margin-top:26px;
}
.pack{margin:0; display:flex; flex-direction:column; align-items:center; gap:12px}
.pack__art object{
  filter:drop-shadow(0 26px 40px rgba(0,0,0,.55));
  pointer-events:none; border-radius:6px;
}
.pack--sheet{flex-basis:100%; width:100%}
.pack--sheet .pack__art{width:100%; display:flex; justify-content:center}
.pack--sheet .pack__art object{filter:drop-shadow(0 20px 34px rgba(0,0,0,.5))}
.pack figcaption{font-size:13px; color:#CFC1A5; text-align:center; letter-spacing:.02em}
.pcap__id{
  font-family:'Fraunces',serif; font-weight:600; color:var(--gold2);
  margin-right:7px; letter-spacing:.03em;
}

/* vote board */
.board{padding:clamp(50px,7vw,96px) 0 40px}
.board h2{font-size:clamp(30px,5vw,52px)}
.board__lead{max-width:64ch; color:#D2C5AA; margin:14px 0 26px; font-size:16px}
.board__lead b{color:var(--gold2)}
.board__grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px}
.vfield{display:flex; flex-direction:column; gap:8px}
.vfield label{font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold2)}
.vfield textarea{
  font-family:'Mulish',sans-serif; font-size:14px; color:var(--cream);
  background:rgba(255,255,255,.03); border:1px solid rgba(200,146,42,.22); border-radius:10px;
  padding:12px 13px; min-height:92px; resize:vertical;
}
.vfield textarea::placeholder{color:#8d7f66}
.vfield textarea:focus{outline:none; border-color:var(--gold2); background:rgba(200,146,42,.06)}

footer{padding:44px 0 70px; color:var(--muted); font-size:12.5px; letter-spacing:.06em}
footer b{color:var(--cream)}

/* reveal on scroll */
.js .rv{opacity:0; transform:translateY(20px); transition:opacity .7s cubic-bezier(.2,.8,.2,1), transform .7s cubic-bezier(.2,.8,.2,1)}
.js .rv.in{opacity:1; transform:none}
@media(prefers-reduced-motion:reduce){
  .js .rv{opacity:1 !important; transform:none !important; transition:none !important}
}
</style>
</head>
<body id="top">

<nav class="mininav">
  <a class="brand" href="#top">CMAA <span>Brand Lab</span></a>
  <div class="mininav__links">
    <a href="#logolab">01 · Logos</a>
    <a href="#fam-A">A</a><a href="#fam-B">B</a><a href="#fam-C">C</a><a href="#fam-D">D</a>
    <a href="#packlab">02 · Packaging</a>
    <a href="#vote">Vote</a>
  </div>
  <span class="mininav__note">vote: WhatsApp us the numbers → <b>A3 · B2 · P2</b></span>
</nav>

<div class="wrap">
  <header class="hero rv">
    <p class="kicker">Cmaa · <span class="dev">आजीचा फराळ</span> · Kothrud, Pune</p>
    <h1>Brand <em>Lab</em></h1>
    <p class="hero__sub">Every new logo direction and every packaging system, assembled in one place — for the founder &amp; team to review, compare and pick the winners.</p>
    <p class="hero__meta"><b>8</b> studios &nbsp;·&nbsp; <b>24</b> logo options &nbsp;·&nbsp; <b>4</b> packaging directions &nbsp;·&nbsp; 10 July 2026</p>
    <p class="hero__vote"><b>How to vote →</b> reply on WhatsApp with the numbers you like (e.g. <b>A3 · B2 · C3 · P2</b>), or drop notes in the feedback boxes on the vote board at the bottom.</p>
  </header>
</div>

<div class="rule"></div>

<div class="wrap">
  <section class="chapter rv" id="logolab">
    <p class="chapter__no">Chapter 01</p>
    <h2 class="chapter__ttl">Logo Lab</h2>
    <p class="chapter__lead">Four families, six options each. Every specimen is shown in <b>colour on a cream card</b> and <b>reversed on black</b>, with a 32-pixel favicon strip so you can judge how the mark survives at app-icon size. Vote by number (A1–D6).</p>
  </section>

${logoSections}
</div>

<div class="rule" style="margin-top:70px"></div>

<div class="wrap">
  <section class="chapter rv" id="packlab">
    <p class="chapter__no">Chapter 02</p>
    <h2 class="chapter__ttl">Packaging Lab</h2>
    <p class="chapter__lead">Four complete pack systems. Each is shown large across its pouch and flat-label applications and its flavour range. Vote by direction (P1–P4) — and tell us which flavours sing.</p>
  </section>

${packSections}
</div>

<div class="rule" style="margin-top:70px"></div>

<div class="wrap">
  <section class="board rv" id="vote">
    <h2>Vote board</h2>
    <p class="board__lead">Reply on <b>WhatsApp</b> with the numbers you like — e.g. “A3, B2, C3, P2 — love the Diwali tin”. Or jot notes here (saved on this device only, so we can screen-share).</p>
    <div class="board__grid">
      <div class="vfield"><label>Wordmarks (A)</label><textarea data-k="A" placeholder="favourite A#, why…"></textarea></div>
      <div class="vfield"><label>Marks &amp; Spirals (B)</label><textarea data-k="B" placeholder="favourite B#, why…"></textarea></div>
      <div class="vfield"><label>Emblems (C)</label><textarea data-k="C" placeholder="favourite C#, why…"></textarea></div>
      <div class="vfield"><label>Illustrative (D)</label><textarea data-k="D" placeholder="favourite D#, why…"></textarea></div>
      <div class="vfield"><label>Packaging (P)</label><textarea data-k="P" placeholder="favourite direction P#, flavours…"></textarea></div>
      <div class="vfield"><label>Anything else</label><textarea data-k="X" placeholder="gut reactions, worries, must-haves…"></textarea></div>
    </div>
  </section>

  <footer>
    <p><b>Cmaa</b> — homemade Maharashtrian chakli &amp; chivda by Seema aaji, Kothrud, Pune. <span class="dev">आजीचा फराळ</span>.</p>
    <p>Brand Lab review document · internal · product photos: Wikimedia Commons (CC) — see assets/images/ATTRIBUTIONS.md.</p>
  </footer>
</div>

<script>
// reveal on scroll (IO); reduced-motion handled in CSS
(function(){
  var els=[].slice.call(document.querySelectorAll('.rv'));
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); return; }
  var io=new IntersectionObserver(function(en){
    en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target);} });
  },{rootMargin:'0px 0px -8% 0px', threshold:0.06});
  els.forEach(function(e){io.observe(e);});
})();
// vote board persistence (local only)
(function(){
  try{
    document.querySelectorAll('.vfield textarea').forEach(function(t){
      var k='cmaa-lab-vote-'+t.dataset.k;
      t.value=localStorage.getItem(k)||'';
      t.addEventListener('input',function(){localStorage.setItem(k,t.value);});
    });
  }catch(e){}
})();
</script>
</body>
</html>`;

fs.writeFileSync(OUT, html);
console.log('wrote', OUT, '(' + (html.length / 1024).toFixed(1) + ' KB)');
console.log('logo options:', logoFamilies.reduce((n, f) => n + readJSON(path.join(ROOT, 'brand', 'logo-lab', f.dir, 'manifest.json')).length, 0));
console.log('pack specimens:', packDirs.reduce((n, d) => n + d.items.length, 0));
