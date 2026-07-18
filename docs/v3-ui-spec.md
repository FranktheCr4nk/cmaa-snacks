# SEEMA v3 — UI SPEC (per-beat redlines, B0–B10)
### Agent C deliverable. Consumed by agents D (SVG hooks), E (motion targets), F (markup + assembly).
Companion files: `site/tokens.css` (every class named here exists there) · `site/styleguide.html` (live demo).
All copy in this document is FINAL unless tagged `[CONFIRM]`. No exclamation marks anywhere. Fraunces = felt, sentence-case. Plex Mono = factual; uppercase only in mono.

**SKU decision (from the founder's product list):** the three SKUs are **Bhajani Chakli**, **Poha Chivda**, and **Lahya Crunch Bites** (spiced popped-jowar bites). Lahya replaces the brief's "shankarpali" placeholder; its accent is **ghee `#F3C877`**. Shot-list retitles: **S8** = "Lahya Crunch Bites pack-in-hand (same hands, same framing, lahya pouch, a few popped jowar grains on the cloth below)". **S18** = "Lahya crunch bites macro — popped jowar clusters tossed in haldi-chili spice, loose grains at pile edge, terracotta surface".

---

## 0 · GLOBAL SYSTEMS

### 0.1 Reference viewports + grid
| | Desktop ref | Mobile ref |
|---|---|---|
| Viewport | 1440 × 900 | 390 × 844 |
| Grid | 12 col / `.grid-12` | 4 col (auto via `.grid-12` media query) |
| Side margin | `--margin` = clamp(20, 6vw, 96) → **86px @1440** | **20px** |
| Gutter | `--gutter` = clamp(12, 1.5vw, 24) → **22px @1440** | **12px** |
| Column width | ≈ **92px** @1440 | ≈ 79px |
| Container max | 1600px centered | — |

"cols X–Y" below = grid lines of this system. vh/vw are of the reference viewport.

### 0.2 Chrome (persistent, `z: var(--z-chrome)` = 100)
- **Wordmark** top-left at (`--chrome-pad`, `--chrome-pad`) = 32px @1440, 16px mobile. Slot: `assets/brand/logo.svg` (agent A), height 28px desktop / 24px mobile. Devanagari accent सीमा (`.t-dev`, roast-70) 8px right of the wordmark, desktop only.
- **Breadcrumb pill** `.crumb` top-right, same pad. Content: `.crumb__brand` "SEEMA" + `.crumb__sep` "/" + `.crumb__chapter`. Mobile ≤480px: brand + sep hidden automatically (chapter only). Rewrite rule: when a beat's `<section>` top crosses 50% viewport height, crossfade the chapter text 150ms `--ease-enter` (agent E). Chapters:

| Beat | `.crumb__chapter` text |
|---|---|
| B0 | `BATCH 0117` *(number from JS date math, see 0.5)* |
| B1 | `ONE PAIR OF HANDS` |
| B2 | `THE HANDS` |
| B3 | `NO CORNERS CUT` |
| B4 | `NOTHING TO HIDE` |
| B5 | `EVERYTHING INSIDE` |
| B6 | `THE CRUNCH` |
| B7 | `THE SHELF` |
| B8 | `HERSELF` |
| B9 | `FRESH BY BATCH` |
| B10 | `TO YOURS` |

- **Order pill** `.btn.order-pill` sits right of the crumb inside `.chrome__right`, gap 12px. Copy: `Order`. Height 36px (padding sp-2/sp-6). **Appearance rule:** starts un-docked (opacity 0, translateY(-8px), no pointer events). Agent E adds `.is-docked` the FIRST time `#b7`'s top edge crosses 80% of viewport height scrolling down; the class is never removed for the rest of the session (brief: "from here on"). Links to the WhatsApp deep link (0.5).
- **Scroll cue** `.scroll-cue` fixed bottom-right at chrome pad. Copy: `scroll — slowly is fine`. E adds `.is-hidden` after the first scroll > 40px; never returns.

### 0.3 Component state summary
| Component | State | Spec |
|---|---|---|
| Dial pill `.pill` | inactive | khadi fill, 1px roast-45 border, roast text, 13px mono up |
| | `.is-active` | roast fill + border, **ghee** text. One active at a time |
| Arch card `.card-arch` | rest | arch well = SKU accent 16% mix; tint overlay (::after) opacity .14 multiply |
| | hover / focus-within | tint overlay → .26 (150ms); jelly wobble 6% squash + 2 sesame specks (agent E, transform-origin 50% 100% already set); `Add` pill hover = ghee fill |
| Buttons `.btn` | hover | ghee fill/border · active: scale .97 · focus-visible: 2px ghee ring, offset 3px (global) |
| Order pill | `.is-docked` | see 0.2 — permanent once triggered |
| Scroll cue | `.is-hidden` | opacity 0, 700ms, pointer-events none |
| Stamp `.stamp` | end state | chili double-ring border, rotate −6°, multiply. E slaps: from scale 1.4 / rotate −8° → scale 1 / rotate −6°, 350ms `--ease-slap`. Used ONCE (B9) |
| Underline `.u-underline` | animatable | `--u-progress` 0→1 (background-size). Chili variant `.u-underline--chili` |
| Facts expandable `.card-arch__facts` | closed/open | `<details>`; summary prefix +/− swaps automatically |

### 0.4 Image slot registry (grey-box `.slot` classes ship at these exact ARs)
| Slot | Shot | AR | Beat(s) |
|---|---|---|---|
| `.slot--4x5` | S1 hero chakli | 4:5 | B1 |
| `.slot--16x9` | S12 press at 04:30 | 16:9 | B2 |
| `.slot--1x1.slot--round` | S2 dial chakli top-down | 1:1 | B4 |
| `.slot--1x1` | S3 exploded center | 1:1 | B5 |
| `.slot--1x1.slot--cutout` ×9 | S13a–c, S14a–c, S15a–c | 1:1 | B5 |
| `.slot--16x9` | S4 flat-lay | 16:9 | B5 mobile/fallback + OG image |
| `.slot--16x9` | S5 crunch cross-section | 16:9 | B6 |
| `.slot--4x5` ×3 | S6 chakli · S7 chivda · S8 lahya packs-in-hand | 4:5 | B7 |
| `.slot--4x5` | S11 Seema portrait | 4:5 | B8 |
| `.slot--4x5` | S9 pack on surface (stamp target) | 4:5 | B9 |
| reserve | S10, S16, S17, S18, S19, S20, S21, S22 | per §5 | OG/social/press bench — do NOT add sections for them |

### 0.5 Live data (agent F)
- Batch number = two-digit week-of-year + two-digit year → this week = `0117` format `WWYY`. Used in: B0 caption, B9 stamp, breadcrumb B0.
- `orders close friday` date = next Friday, format `fri 24 jul`, lowercase. Used in B9 mono line.
- WhatsApp deep link: `https://wa.me/91XXXXXXXXXX?text=` + URL-encoded `Hello Seema, I'd like to order from this week's batch (0117): Bhajani Chakli x1. My address:` — SKU name substituted per card; number `[CONFIRM founder's WhatsApp]`.

### 0.6 Reduced motion + mobile globals
`prefers-reduced-motion: reduce` → E swaps every timeline for pre-composed end states (classes noted per beat); tokens.css already collapses CSS transitions. Mobile: pins shortened 40%, parallax depths halved, B5 uses the S4 flat-lay below 768px, all tap targets ≥44px (`.btn` min-height enforces).

---

## B0 · LOADER — the line draws itself
**Section:** `#b0`, fixed overlay, khadi, `z: var(--z-loader)`, `.u-grain`.

**Desktop redline**
- Spiral stage: 320×320px, centered at (50vw, 46vh). Content: agent D's `#spiral-master` coiled state, 2px roast stroke, drawn by `stroke-dashoffset` tied to **real asset progress with a 1.2s floor** (`--t-loader-min`), eased catch-up (agent E).
- Caption `.t-mono`, roast-70, centered, 40px below stage bottom:
  `batch no. 0117 — loading fresh`
- At 100%: spiral morphs coil → straight line (Flubber/pre-sampled), travels to its permanent home = B1's horizon rule position (see B1). Overlay releases scroll only after handoff completes.

**Mobile:** stage 240×240px at (50vw, 44vh); caption 32px below; same behavior.

**Reduced motion:** spiral appears at 60% opacity, crossfades to the B1 rule. No morph.

---

## B1 · HERO — the type sandwich
**Section:** `#b1`, `.beat--full`, min-height 100vh.

**Desktop redline (1440×900)**
- **S1 chakli** (4:5): height **78vh** (rule: never below 55vh), width auto ≈ 62vh. Center at (**66vw, 46vh**) — center-right. `z: var(--z-media)`. Idle: ±1.5px drift @2s + 3° slow rotation (E). `fetchpriority="high"`, preloaded.
- **Line 1 "Made by"** `.t-display` (120px @1440), `z: var(--z-behind)` — BEHIND the chakli. Left edge col 1; baseline at **38vh**.
- **Line 2 "one pair of hands."** `.t-display`, `z: var(--z-front)` — IN FRONT. Left edge col 2; baseline at **58vh**; the word "hands." must overlap the chakli's left third (adjust tracking, not size).
- **Haldi underline** under exactly `hands.` — `.u-underline` ticking `--u-progress` 0→1, 400ms after settle, `--ease-enter`.
- **Horizon rule**: the unwound loader line. 2px roast, spans margin to margin (cols 1–12) at **y 78vh**, `z: var(--z-line)`. This is a real layout element (the B0 path's final home), slight hand wobble per D.
- **Steam**: 2 squiggles (D's #1 set, prime-offset 2.5s/3.1s), each ~70×130px, rising from chakli top edge at 60vw and 68vw.
- Chrome: crumb `ONE PAIR OF HANDS`; scroll cue visible.

**Mobile (390×844)**
- "Made by" baseline at **20vh**, left margin, `--fs-display` floor (44.8px), one line.
- S1: width **78vw** (height ≈ 97vw ≈ 46vh), centered, top edge at 24vh, z media.
- "one pair of hands." baseline at **72vh**, left margin, wraps to 2 lines, `z: front`, first line overlapping the chakli's lower edge.
- Rule at **80vh**, margin to margin. Steam: 1 squiggle. Idle drift off.

**Fallback:** no drift, steam hidden, stack flattens to image-above-type (`z` overrides dropped via `.is-endstate`).

**Copy (exact)**
```
Made by
one pair of hands.
```

---

## B2 · 04:30 — the hands
**Section:** `#b2`, pinned **150vh** desktop / **100vh** mobile (40% shorter → 90vh, round to 100).

**Desktop redline**
- **Aperture window** (L7): clipped viewport onto **S12** (16:9), starts **34vw × 19.1vw** (16:9) centered at (50vw, 50vh), `border-radius: var(--r-card)` while small. On scrub 0→70%: window expands to full-bleed (inset 0, radius 0); image inside counter-scales **1.3 → 1.0**, `--ease-scrub`.
- **Timestamp** `.t-mono--up`, **khadi** text over the photo, 24px inside the window's top-left corner (tracks the window while it grows):
  `04:30 — the kitchen is already awake`
- **Headline** `.t-chapter`, khadi, cols 1–7, baseline **82vh**, enters (scrub 70→100%) rising 24px, `--ease-enter` feel:
  `Before the city wakes, the press does.`
- Crumb rewrites to `THE HANDS` at section 50% crossing.

**Mobile:** window starts 60vw × 33.75vw centered at 46vh; expands to full-bleed; timestamp 16px inside top-left; headline baseline 78vh, left margin, max-width 20ch.

**Fallback:** static full-bleed S12, both text blocks present.

---

## B3 · MANIFESTO — the line underlines the truth
**Section:** `#b3`, khadi, pinned **200vh** desktop / **120vh** mobile.

**Desktop redline**
- One paragraph `.t-chapter` (68px @1440), cols **2–11**, vertically centered (block midpoint at 50vh), line-height 1.12.
- The traveling spiral line (`z: var(--z-line)`) snakes through the text block; at scrub **0.2 / 0.4 / 0.6 / 0.8** the four negation underlines fire in order (each `--u-progress` 0→1 over 8% of scrub).
- "refuses" = the chapter's single chili word (`.u-chili`), colored from scrub 0.85.

**Mobile:** cols 1–4 (full width minus margins), `.t-chapter` floor ≈ 32px, block starts 18vh. Same four increments.

**Fallback:** all underlines pre-drawn (`--u-progress: 1`), paragraph static.

**Copy (exact — the four underlined spans marked, curly quotes)**
```
No [factory]. No [palm oil]. No [preservatives]. No [‘natural identical
flavours’]. Rice, dal, butter, spice — and a woman who refuses to cut
corners.
```
Underlines haldi; `refuses` chili, never underlined.

---

## B4 · NOTHING TO HIDE — the orbital dial
**Section:** `#b4`, pinned **250vh** desktop / **150vh** mobile. Markup wrapper: `.dial-wrap`. **Build the dial once — B9 reuses this exact component re-labeled.**

**Desktop redline**
- **Kicker** `.t-mono--up` roast-70, col 1, y **10vh**: `chapter one — the label, out loud`
- **Chapter head** `.t-chapter`, cols 1–5, baseline **16vh**: `Nothing to hide.`
- **Dial** `.dial`: size **min(72vh, 704px)** square, centered at (**50vw, 54vh**). Ring + `+` ticks = agent D SVG in `.dial__ring` (dotted 1 7, 2px, roast). Center `.dial__center` (inset 13%, round): **S2** top-down chakli, dead-centered.
- **4 pills** `.pill.dial__pill` at compass points N/E/S/W (classes `--n/--e/--s/--w`). Scroll rotates the orbit 90° per quarter of scrub (E rotates a wrapper; pills counter-rotate to stay level). The pill arriving at **N** gets `.is-active` (roast fill, ghee text).
- **Detail card** `.dial-card`, positioned by `.dial-wrap` at top-right (right margin edge, y **10vh**), max-width 304px: mono up label + one Fraunces sentence, crossfades 150ms on active change.
- Order of pills and their card sentences (active N at scrub 0 = no palm oil):

| Pill (exact) | Card sentence (exact) |
|---|---|
| `NO PALM OIL` | Fried in groundnut oil we'd feed our own kids. Because we do. |
| `NO PRESERVATIVES` | Nothing added to make it keep. A batch never sits long enough to need it. |
| `NO ARTIFICIAL COLOUR` | The gold is haldi and slow frying. Nothing else. |
| `NO MACHINES` | One brass press, two hands. That small wobble in the spiral is me. |

**Mobile:** dial static at **min(84vw, 336px)**, centered, y-center 40vh; orbit does NOT rotate; all 4 pills visible (N/S centered, E/W flush inside edges — tokens handles this); pills highlight sequentially on scroll (E toggles `.is-active` at scrub quarters); the 4 cards render as a **vertical list** below the dial (`.dial-card` static, stacked, 12px gap), the active one at full opacity, others 45%.

**Fallback:** static dial, all pills visible, four cards listed.

---

## B5 · EVERYTHING INSIDE — the exploded chakli
**Section:** `#b5`, pinned **300vh** desktop. **Below 768px this beat swaps entirely to the S4 flat-lay fallback** (brief rule). The signature beat — build last, polish most.

**Desktop redline**
- **Kicker** mono up, col 1, y 10vh: `chapter two — the mirror`
- **Chapter head** `.t-chapter`, cols 1–5, baseline 16vh: `Everything inside.`
- **Center**: **S3** (1:1) at **42vh** square, centered (50vw, 52vh), `z: var(--z-media)`.
- **7 ingredient cutouts** (S13–S15, 1:1 alpha WebP/AVIF, `.slot--cutout` while grey) fly OUT on scrub from behind the chakli to these rest positions (element size = long side px @1440 / parallax depth factor; nearest depth 1.0 gets **2px blur** — Bucks DOF):

| # | Cutout (shot) | Rest center (vw, vh) | Size px | Depth |
|---|---|---|---|---|
| 1 | rice flour pile (S13a) | 18, 26 | 150 | 0.6 |
| 2 | chana dal scatter (S13b) | 33, 18 | 130 | 0.8 |
| 3 | sesame spoon-pile (S13c) | 67, 17 | 120 | 1.0 (blur 2px) |
| 4 | cumin pile (S14a) | 82, 30 | 110 | 0.7 |
| 5 | ajwain pile (S14b) | 84, 62 | 110 | 0.9 |
| 6 | butter curl on brass (S14c) | 70, 80 | 160 | 0.5 |
| 7 | fried curry leaves (S15a) | 22, 72 | 150 | 0.8 |

- **Leader lines** (agent D): thin 2px roast lines branching off the traveling spiral path from the chakli's rim to each cutout, drawing in sync with the fly-out (`z: var(--z-line)`).
- **Labels** `.t-mono` 13px, roast, one per cutout, anchored 12px beyond the cutout on the side away from center:

```
rice flour — milled this month
chana dal — roasted at home
sesame — toasted same morning
cumin — ground the day of frying
ajwain — from the same shop for years
butter — white, churned at home
curry leaves — fried in the same oil
```

**Mobile (<768) + fallback (both use the same composition)**
- **S4** (16:9) full-width inside margins, y-top 16vh, static.
- Labels listed beneath as a `.ledger--bare` block (same 7 lines), 24px below image.
- This S4 composite is also the OG/share image (agent F).

---

## B6 · THE CRUNCH
**Section:** `#b6`, `.beat--full`, NOT pinned — one full-viewport screen, short and loud.

**Desktop redline**
- **S5** (16:9) full-bleed, `object-fit: cover`, 100vh.
- **Crunch burst** (D's #24: 6–8 radial lines + 3 crumb dots, khadi strokes over the dark terracotta photo): fires ONCE on enter (E, 350ms `--ease-scrub-out`, 1-frame scale pop) at the break point — anchor **(55vw, 46vh)**, artwork ~220px.
- **Headline** `.t-display`, **khadi** text, centered horizontally, baseline **56vh**, max-width 12ch (wraps to 2 lines), `z: var(--z-front)`. Nothing else on screen. Chrome crumb: `THE CRUNCH`.

**Mobile:** S5 cover-cropped to center on the break; headline centered, baseline 54vh.

**Fallback:** static image + text; burst pre-rendered as faint radial marks in the SVG's end state.

**Copy (exact)**
```
You'll hear it before you taste it.
```

---

## B7 · THE SHELF — three doors
**Section:** `#b7`, khadi, natural flow (no pin), padding-block `--sp-32`. **The order pill docks from this beat on** (rule in 0.2).

**Desktop redline**
- **Kicker** mono up, col 1: `small batch — three things only`
- **Heading** `.t-chapter`, cols 1–6, below kicker 8px: `This week's shelf.`
- **Cards row**: 3 × `.card-arch` in a centered grid, max-width **992px**, equal columns, gutter `--gutter`, top margin 64px. Per card top-to-bottom:
  - `.card-arch__media` arch (4:5, semicircle crown): S6 / S7 / S8 render. Tint: chakli haldi · chivda chili · lahya ghee (modifier classes `--chakli/--chivda/--lahya`).
  - `.t-h3.card-arch__name`, 16px below arch.
  - `.t-mono.card-arch__meta`, 4px below: `₹ ___ · 250 g · this week's batch` *(price blank until founder confirms — ships as written)*
  - `.btn--quiet.card-arch__add`, 12px below: `Add` → WhatsApp deep link with that SKU prefilled.
  - `.card-arch__facts` `<details>`, 8px below, left-aligned: summary `ingredients + nutrition`; body = `.ledger` rows, plain text, no icons `[CONFIRM final ingredient/nutrition rows per SKU from founder]`.
- Card names (exact): `Bhajani chakli` · `Poha chivda` · `Lahya crunch bites`
- Hover state: see 0.3 (tint deepens, E wobbles, 2 sesame specks from D's #5).
- **Mono note**, centered under the row, 48px below: `orders close friday · fried saturday · shipped monday`

**Mobile:** cards stack vertically, full-width minus margins, 40px gap, no wobble; note left-aligned under the last card.

---

## B8 · SEEMA — the rack focus
**Section:** `#b8`, pinned **150vh** desktop / **100vh** mobile. The only portrait on the site; the emotional peak.

**Desktop redline**
- **S11 portrait** (4:5): height **72vh**, cols 2–6 (left edge col 2), vertical center 50vh. Enters at **CSS blur 24px**, sharpens to 0 across the pin (E; snapshotted to ≤3 steps on low-power).
- **Name** `.t-display` "Seema", cols 7–11, baseline **38vh**. **सीमा** `.t-dev` (28px, roast-70) directly beneath, +12px.
- **Ledger** `.ledger--bare`, cols 7–10, first line at **52vh**, lines staggered up 12px apart as scrub completes (L10 letters-behind-clip grammar):

```
making chakli since the '90s
taught by her mother
still tastes every single batch
```
- No paragraph. No "our story" essay. Crumb: `HERSELF`.

**Mobile:** portrait full-width minus margins (4:5), top 12vh; name overlays the portrait's bottom-left corner (khadi text, baseline −24px from image bottom edge); सीमा beneath; ledger below image, left margin, static stagger.

**Fallback:** image loads sharp; lines fade in.

---

## B9 · FRESH BY BATCH — the stamp
**Section:** `#b9`, pinned **200vh** desktop / **120vh** mobile. **Reuses the B4 dial component verbatim** — same markup, new labels, no detail cards.

**Desktop redline**
- **Kicker** mono up, col 1, y 10vh: `chapter three — the calendar`
- **Chapter head** `.t-chapter`, cols 1–5, baseline 16vh: `Fresh is a schedule.`
- **Dial**: same size/position as B4. Center `.dial__center`: **S9** pack shot, center-cropped to the circle. Pills (exact):
  `FRIED SATURDAY` · `PACKED SAME DAY` · `NO WAREHOUSE` · `21-DAY WINDOW`
  Rotation/active behavior identical to B4 (desktop rotates, mobile highlights).
- **Stamp** `.stamp`, `z: var(--z-stamp)`: at scrub ≥ 90%, slaps onto the pack's clear upper-right area — center at **(58vw, 38vh)**, rotate −6°, from scale 1.4/rotate −8°, 350ms `--ease-slap`, multiply. THE site's only overshoot. Copy: `BATCH 0117 · FRESH` *(number live per 0.5)*.
- **Mono date line**, centered 24px below the dial, roast-70, live per 0.5: `batch 0117 · orders close fri 24 jul`

**Mobile:** dial per B4 mobile; stamp lands at the dial's top-right rim (center 78vw, dial-top +8vh), scale 0.85.

**Fallback:** stamp pre-applied (end state), dial static.

---

## B10 · THE COIL — order, and the line comes home
**Section:** `#b10`, footer-as-poster, min-height **90vh** desktop / **100vh** mobile, khadi, `.u-grain`.

**Desktop redline**
- **The seal**: the traveling line coils back into the chakli spiral (D's re-coiled state = `assets/brand/seal.svg` path), settling at **180×180px**, centered at (**50vw, 26vh**), 2px roast.
- **Headline** `.t-chapter`, centered, baseline **48vh**: `From Seema's kitchen to yours.`
- **CTA** `.btn`, centered, top edge **56vh**: `Order this week's batch` → WhatsApp deep link (no SKU prefilled).
- **Wordmark + seal lockup**: bottom-left at (col 1, 84vh) — logo.svg h28px with the small seal beside it (40px), सीमा accent.
- **Mono contact line**, bottom-right (right margin edge, 84vh), roast-70:
  `orders on whatsapp · instagram @seema.kitchen · pune` `[CONFIRM handle + city]`
- Thin 2px roast rule margin-to-margin at **78vh** (the line's literal last inch, drawn by the seal's tail).
- Crumb: `TO YOURS`. Reduced motion: seal simply present.

**Mobile:** seal 128px at (50vw, 20vh); headline baseline 42vh; CTA centered 50vh (min 44px tall); lockup centered 76vh; contact line centered beneath, 12px gap; rule at 70vh.

---

## APPENDIX · hooks published for agents D/E/F
- Sections: `#b0` … `#b10` (one `<section>` each, class `.beat` / `.beat--full`).
- Spiral master path: `#spiral-master` (from A/D); its five state classes live in D's handoff.
- E toggles ONLY: `.is-active` (dial pills), `.is-docked` (order pill), `.is-hidden` (scroll cue), `.is-endstate` (reduced-motion swap), CSS vars `--u-progress` (underlines), `--stamp-rot` (stamp).
- F swaps every `.slot` for a `<picture>` at the identical AR — layout must not shift (CLS < 0.05).
- Type/space/color/z/motion values: import from `site/tokens.css` only. No new hex values, no new easings, anywhere.
