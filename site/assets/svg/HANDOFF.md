# SVG handoff — agent D (brief §6.D)

Everything line-drawn for Seema v3 "UNWIND". All files in `site/assets/svg/`.
Conventions (every file): `stroke="currentColor"`, `fill="none"` (dots/text use `fill="currentColor"`), `stroke-linecap="round"`, `stroke-linejoin="round"`, **no `<style>` blocks, no `style=""` attributes** — presentation attributes only. All SVGs carry `aria-hidden="true" focusable="false"` and are inline-ready (inject into the DOM so `currentColor` inherits; host element sets `color`).

Palette hooks: ink = roast `#2E1F16` on khadi cream `#F5EEE3`. Haldi `#DA8A1D` = active-line state. Stamp = chili `#A93B26`. Ghee `#F3C877` = hover/active pill only.
SKU note: third SKU is confirmed as **Lahya Crunch Bites** (spiced popped-jowar bites), accent ghee `#F3C877` — S8/S18 are retitled accordingly; arch-card accents run chakli=haldi, chivda=chili, lahya=ghee.

Verified: every asset screenshotted inline on cream and roast; morph interpolation tested at t = 0/.25/.5/.75/1 for all four journey transitions (naive per-point lerp, no Flubber needed).

---

## 1. spiral-states.js — THE master asset (B0→B10 traveling line)

ES module. Exports:

```js
import { N, VIEWBOX, coiled, unwound, snaking, circled, recoiled, states } from './assets/svg/spiral-states.js';
```

- `N = 240` — every state is **exactly 1 M + 239 L commands, 240 points, same order**. Point `i` in one state corresponds to point `i` in every other. **Morph = per-point lerp** (`x = a + (b-a)*t`), precompute the parsed number arrays once at load (tech-spec rule: never parse per frame). Flubber unnecessary; GSAP `attr: {d: ...}` also works since command structures are identical.
- `VIEWBOX = "0 0 1000 1000"` for all states. Render the line at 2px with `stroke-width="2" vector-effect="non-scaling-stroke"` so scale transforms during handoffs never fatten it.
- **Point order:** index 0 = spiral **centre** = line/snake **left end** = circle **west point (9 o'clock)**. Circle runs clockwise; both coils wind clockwise centre→outer. Draw-in via `stroke-dasharray`/`dashoffset` therefore draws the chakli from its centre outward (correct for B0), and the hero rule left→right.
- The journey (state per beat):
  | state | beat | role |
  |---|---|---|
  | `coiled` | B0 loader | draws itself via dashoffset, then morphs |
  | `unwound` | B1 hero | the horizon rule under the type sandwich |
  | `snaking` | B3 manifesto | the line snaking through the paragraph (underlines themselves are separate haldi spans per UI spec; this is the traveling line passing through) |
  | `circled` | B4 dial / B9 reuse | the orbit ring; tiny hand-drawn gap sits at 9 o'clock |
  | `recoiled` | B10 footer | the seal — line comes home |
- Morph quality (visually verified): coiled→unwound literally "pulls the coil straight" through cursive loops; snaking→circled crests like a wave closing into a ring (circle starts at west specifically so the snake's left end doesn't whip over the top); circled→recoiled self-crosses a little mid-morph — intentional, reads as winding up.
- Hand wobble (±~2 units) is baked into all five states; don't smooth it.
- Size: 14.7 KB raw ≈ 4 KB gz (inside JS budget).
- Regeneration: generator lives in agent-D scratchpad (`gen-assets.js`). Parameters if it must be rebuilt: Archimedean spiral arc-length-uniform sampling; coiled rInner 12 / rMax 368 / 4.1 turns / rot −90°; recoiled rInner 9 / rMax 300 / 4.3 turns / rot 180°; line x 40→960 @ y 500; snake ±30 sine ×3 waves; circle r 380, west start, 0.992·2π. If the logo agent later ships `#spiral-master` with different geometry, re-sample that path into the same 5×240 structure.

## 2. spiral-states.svg — visual reference only
ViewBox `0 0 5000 1120`, the five states side by side with mono captions. Path ids `spiral-coiled`, `spiral-unwound`, `spiral-snaking`, `spiral-circled`, `spiral-recoiled`. Use for design review / docs; the live morph uses the JS module.

## 3. steam.svg — B1 hero steam (catalog #1)
ViewBox `0 0 140 160`. Three staggered squiggles, bottom→top path direction:
- `#steam-1` (left, medium), `#steam-2` (centre, tallest), `#steam-3` (right, shortest)
Intended motion: each loops rise + fade (translateY −8→−20, opacity 0→.55→0), `ease-in-out`, **prime-offset durations** 2.3 s / 2.9 s / 3.7 s so the pattern never visibly repeats. Reduced motion: hidden.

## 4. crunch-burst.svg — B6 one-shot burst (catalog #24)
ViewBox `0 0 240 240`, centre (120,120). Stroke-width 2.5.
- Radial lines `#burst-1` … `#burst-7` (irregular angles 15/62/105/148/200/258/310°, inner r≈48 → outer r≈94–102)
- Crumb dots `#crumb-1` … `#crumb-3` (filled circles at 35/175/285°, r 2.4–3.6)
Intended motion: fires **once** on B6 enter at the snap point: lines scale 0.6→1 from centre + dashoffset draw, crumbs pop out along their radial, whole group opacity 1→0. 350 ms, `ease-out`, one-frame scale pop at start. Fallback: shown static at 12% opacity.

## 5. sprinkle.svg — B7 card-hover sesame sprinkle (catalog #5)
ViewBox `0 0 160 120`. Five seed outlines `#speck-1` … `#speck-5` (pointed ovals, various rotations, stroke-width 1.6) + two dots `#speck-6`, `#speck-7` (filled). Intended motion: on arch-card hover, pick 2 specks near the cursor edge, 400 ms fall+fade (translateY +10, rotate ±20°, opacity .8→0), staggered 60 ms. Never all seven at once — this is a pinch of sesame, not confetti.

## 6. dial.svg — B4 "nothing to hide" instrument furniture (reused verbatim in B9)
ViewBox `0 0 680 680`, centre (340,340), ring radius 270.
- `#dial-ring` — wobbly hand-drawn circle, small gap near 12 o'clock. NOTE: in the live B4 the *orbit* is the traveling line in its `circled` state; `#dial-ring` is the static fallback ring and the reduced-motion end state. Don't show both at full strength — ring at 100 %, or ring hidden while the morph line is the circle.
- `#dial-tick-1` … `#dial-tick-12` — `+` ticks ON the ring at 22.5° steps, compass points skipped. Tick numbering runs clockwise from just past 12 o'clock.
- `#dial-anchor-1` (N) `#dial-anchor-2` (E) `#dial-anchor-3` (S) `#dial-anchor-4` (W) — 104×32 pill outlines centred on the ring at the compass points. These are geometry anchors: UI agent's live mono pills (`NO PALM OIL` etc., B9: `FRIED SATURDAY` etc.) dock exactly over them; the outlines can stay as the resting stroke of inactive pills. Active pill: roast fill, ghee text (UI spec owns that styling).
- `#dial-center` — small `+` crosshair at centre (sits behind the S2 top-down chakli; keep, it peeks in the fallback).
Intended motion: scroll scrub rotates ticks+anchors group around (340,340); active pill counter-rotates to stay level. Mobile/reduced: no rotation, all four pills visible.

## 7. leader-lines.svg — B5 exploded-chakli leaders
ViewBox `0 0 1200 800`, chakli centre (600,400), chakli radius ≈175. Seven groups `#leader-1` … `#leader-7`, each containing `#leader-dot-N` (origin dot on the chakli edge, filled, r 4) and `#leader-path-N` (stroke-width 1.5, gentle hand-drawn bow, direction **inner → outer**, ending in a horizontal label tail).
Ingredient map + label anchor (mono 13 px, place at tail end):

| id | ingredient | label anchor (x,y) | text-anchor |
|---|---|---|---|
| leader-1 | rice flour | (260,250) | end |
| leader-2 | chana dal | (232,376) | end |
| leader-3 | sesame | (329,623) | end |
| leader-4 | cumin | (518,151) | end |
| leader-5 | ajwain | (903,199) | start |
| leader-6 | butter | (970,400) | start |
| leader-7 | curry leaves | (893,601) | start |

Labels state facts, mono lowercase (`sesame — toasted same morning`). Intended motion: as each ingredient cutout flies out on scrub, its path draws inner→outer via dashoffset (use `getTotalLength()` per path), dot pops first, 60 ms stagger between leaders. Ingredient cutouts (S13–S15) land at/beyond the tail ends. Fallback: whole SVG static under the S4 flat-lay labels.

## 8. stamp.svg — B9 batch stamp (used exactly ONCE on the site)
ViewBox `0 0 360 200`. Host sets `color: #A93B26` (chili). −4° rotation baked into group `#stamp` — do NOT add more resting rotation.
- `#stamp` — whole artwork group
- `#stamp-frame` / `#stamp-frame-inner` — border; outer has ink-break dasharray (intentional rubber-stamp gaps)
- `#stamp-batch` — "BATCH ____" line; **`#stamp-batch-no`** — tspan the batch JS overwrites with the live number (e.g. `0117`, 4 chars keeps centring; IBM Plex Mono via font-family attribute, loaded by the page)
- `#stamp-rule` — dotted separator (`stroke-dasharray="1 7"` per art direction)
- `#stamp-fresh` — "FRESH"
Intended motion: slap-down on scrub end — scale 1.4→1 + rotate −6°→−4°, back-out `cubic-bezier(.34,1.56,.64,1)`, the site's single overshoot; pair with a 1-frame opacity 0→1. Lands on S9's clean upper-right space. Fallback: pre-applied, static.

## 9. grain.png — paper grain tile
240×240 opaque RGBA PNG, white with 0–4 % (avg ~2 %) uniform darkening. Usage (frontend):

```css
body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none;
  background: url(assets/svg/grain.png); background-size: 240px;
  mix-blend-mode: multiply; z-index: 999;
}
```

Invisible-but-felt on cream; naturally disappears over dark photography (multiply). Do not raise opacity — 2 % is the art direction.

---

### Animation-agent quick contract
Animate ONLY these ids/classes. The traveling line is one `<path>` whose `d` you lerp between `states` (order: coiled → unwound → snaking → circled → recoiled), positioned per beat by transforming its wrapper (FLIP the wrapper, morph the d — never both in the same frame if avoidable). Pre-parse all five d-strings to Float64Arrays at load; per-frame work is one lerp + one `setAttribute('d', ...)` (~240 points, well under the 50 ms long-task budget — measured trivial). `prefers-reduced-motion`: skip morphing entirely; show `unwound` in B1, `#dial-ring` in B4/B9, `recoiled` in B10 as static end states.
