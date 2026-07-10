# Research Brief: Packaging as Website Hero

**For:** Cmaa (Seema's Chakli & Chivda) — premium D2C snack site, vanilla HTML/CSS/JS/SVG, static hosting (GitHub Pages).
**Question:** How do the best D2C sites make the pack the protagonist, and how do we fake premium print finishes in vector without raster bloat or jank?
**Date:** 2026-07-10

---

## 1. Landscape: how award sites present packs

### 1.1 Rotation: sprite/sequence vs true 3D vs 2.5D

Three tiers, in ascending cost:

| Approach | What it is | Cost | When |
|---|---|---|---|
| **2.5D layered tilt** | Flat pack art split into 3–6 layers (shadow, body, label, foil, glare) at different `translateZ` depths inside a `perspective` parent; tilts toward cursor/scroll | 1 afternoon, no new assets | Default. Reads as dimensional without a 3D pipeline |
| **Sprite / image sequence** | 24–120 pre-rendered frames scrubbed by scroll. Two builds: (a) canvas + frame-index math (Apple style), (b) **sprite sheet in an `overflow: clip` window animated with `steps()` + `animation-timeline: scroll()`** — no JS, lower CPU/memory than canvas repaint | Needs a render/photo pipeline for frames | When you have turntable photography or 3D renders |
| **True 3D (WebGL)** | glTF pack in three.js/OGL, scroll-bound camera | Heaviest; payload + GPU | Only if the pack shape itself is the story (e.g., Mana Yerba Maté's can rotating/flipping on scroll) |

Apple-style canvas math (CSS-Tricks): `scrollFraction = scrollTop / (scrollHeight - innerHeight)`; `frameIndex = min(frameCount-1, floor(scrollFraction * frameCount))`; draw inside `requestAnimationFrame`, preload all frames as `Image` objects up front, pin the canvas with `position: sticky` inside a tall section (e.g. `300vh`).

### 1.2 Real-site reference points

- **Mana Yerba Maté** — 3D can renders; scroll rotates, flips, moves the can through the story. The canonical "pack animates as story" example.
- **Fly by Jing** (Day Job rebrand) — jar label's vibrating color pairs ARE the site palette; site and label are one system, black/white keeps text legible over loud hues.
- **Magic Spoon** — product-page backgrounds coordinate with flavor (light brown for cocoa, pink for fruity); gradients carry brand energy. Pack color drives page theme.
- **Omsom** — loud pack-first art direction; pack photography dominates every fold.
- **Yucca Packaging** (Awwwards SOTD) — the counter-lesson: two colors (#12271D dark green, #BFC0AC beige), typography-led, "sophisticated interactions rather than heavy animations." Restraint reads premium.
- **Vamvalis Foods, Corphes** (Awwwards) — Mediterranean food brands where the pack is shot large, centered, with scroll-triggered reveals rather than gimmicks.

Common thread in award work: **one signature pack move per page**, everything else calm. Cursor parallax appears only on the hero, capped at a few degrees, always eased/lerped, never on text blocks.

### 1.3 Pack animating as story

Two recurring story devices:

1. **Explode/reassemble** — label elements (type lockup, motif, badges, ingredient icons) drift apart on scroll to "show the craft," then snap back. **Reality check (verified):** true "packaging label flies apart" scenes on the *live web* are rare — searching the space returns almost entirely 3D/After-Effects and AI "exploded-view" video generators (Media.io, Framia, Vectary), i.e. rendered clips, not DOM. The web-native, compositor-cheap way to get the same read is our own move: build the label as inline SVG **groups, each wrapped in a plain `<div>`**, and translate/rotate only the wrappers on scroll (see §4 — never animate SVG attributes directly). Closest shipped analogue is Mana Yerba Maté's ingredients orbiting the can (Lottie/3D), and generic "card layers separate on hover" 2.5D rigs.
2. **Die-cut window as portal** — the pack's window/die-cut shape becomes a `clip-path`/`mask` that expands until its contents ARE the next section. Emil Kowalski documents the underlying move: duplicated layers + animated `clip-path: inset()/circle()/path()`, which "has no effect on layout" and updates at the compositor level. Scroll-driven variants use `@property`-registered custom properties + `animation-timeline: scroll()`.

---

## 2. Ten named presentation patterns (implementation sketches)

### P1 — The Turntable (scroll-scrubbed rotation, sprite-sheet build)

```css
.turntable {                       /* one-frame window */
  width: 300px; height: 400px;
  background: url(pack-sprite.webp) 0 0 / 18000px 400px;  /* 60 frames × 300px wide */
  animation: spin 1s steps(60, jump-none) both paused;
  animation-timeline: scroll(root);
}
@keyframes spin { to { background-position: -17700px 0; } }  /* -(60-1) × 300px */
```
- 60 frames in one WebP sprite; **`steps(60, jump-none)`** is the exact trick — `jump-none` holds both the first and last frame for equal time so all 60 land precisely (plain `steps()`/`jump-end` drops the final frame), and the keyframe stops one frame short at `-(N-1)×frameWidth` (verified: leanrada CSS sprite-sheet notes). Scroll timeline scrubs it; zero JS in Chromium/Firefox; a JS scroll-listener fallback sets `animation-delay` (negative, in `ms`) to scrub it in Safari, which still lacks scroll-driven timelines.
- Animate `background-position` (or `translateX` on a nested `<img>`), never per-element geometry. Vs canvas: no per-frame decode+`drawImage` loop — the browser treats the sheet as one cached, GPU-uploaded image and only shifts its origin. Cheaper CPU and memory; the win grows with frame count and pixel size.

### P2 — The Levitating Pack (2.5D tilt rig, cursor parallax done tastefully)

```html
<div class="stage">  <!-- perspective: 1000px -->
  <div class="pack"> <!-- transform-style: preserve-3d; will-change: transform -->
    <img class="shadow">  <!-- translateZ(-40px), blurred ellipse -->
    <img class="pouch">   <!-- translateZ(0) -->
    <svg class="label"/>  <!-- translateZ(30px) -->
    <div class="glare"/>  <!-- translateZ(45px), radial white, mix-blend-mode: soft-light -->
  </div>
</div>
```
```js
addEventListener('pointermove', e => { tx = (e.clientX/innerWidth - .5); ty = (e.clientY/innerHeight - .5); });
(function loop(){ x += (tx-x)*.08; y += (ty-y)*.08;  // lerp = the "tasteful"
  pack.style.transform = `rotateY(${x*8}deg) rotateX(${-y*6}deg)`;
  glare.style.transform = `translate(${x*24}px,${y*24}px) translateZ(45px)`;
  requestAnimationFrame(loop); })();
```
- Cap at ±8°/±6°, lerp at 0.08, ease back to rest on `pointerleave`. Disable under `prefers-reduced-motion` and on touch.

### P3 — Pack Sets the Palette (flavor theming)

```css
:root { --ink:#1e130a; --paper:#f6efe3; --accent:#c1440e; } /* chakli default */
[data-flavor="chivda"] { --accent:#0e6b4a; --paper:#f2f4e8; }
body { background: var(--paper); transition: background .6s ease; }
```
```js
flavorBtns.forEach(b => b.onclick = () => document.body.dataset.flavor = b.value);
```
- Every color on the page (buttons, rules, halftone ink, foil undertone) references the custom properties, so one attribute swap re-themes everything; `transition` on `background`/`color` gives the crossfade. Progressive enhancement: wrap the swap in `document.startViewTransition()` for a full-page morph where supported.
- This is the Magic Spoon / Fly by Jing move: the label's ink colors are literally the site's theme tokens.

### P4 — The Die-Cut Portal (pack window becomes the section transition)

```css
.portal { position: sticky; top: 0; height: 100vh;
  clip-path: circle(var(--r) at 50% 42%); }        /* or path() of the tin's die-cut */
@property --r { syntax:'<length-percentage>'; inherits:false; initial-value:8%; }
@keyframes open { to { --r: 150%; } }
.portal { animation: open linear both; animation-timeline: view(); }
```
- Next section sits underneath; scrolling dilates the die-cut window until it swallows the viewport. `clip-path` animates on the compositor — no layout, no paint storms. For a non-circular die-cut, pre-compute the shape as `clip-path: path("…")` and interpolate between two same-structure paths.
- Fallback: IntersectionObserver + rAF writing `--r` inline.

### P5 — Label Explosion / Reassembly (exploded view as story)

```html
<div class="explode">           <!-- sticky inside a 250vh section -->
  <div class="piece" style="--dx:-120px; --dy:-60px; --dr:-8deg"><svg><!-- lockup --></svg></div>
  <div class="piece" style="--dx: 90px; --dy:-140px; --dr:6deg"><svg><!-- motif --></svg></div>
  <!-- 4–7 pieces max -->
</div>
```
```js
const p = clamp((viewportCenter - sectionTop) / sectionHeight, 0, 1);   // in rAF'd scroll handler
pieces.forEach(el => el.style.transform =
  `translate(calc(var(--dx)*${p}), calc(var(--dy)*${p})) rotate(calc(var(--dr)*${p}))`);
```
- Each label element is its own small inline SVG **inside a div wrapper**; only the wrapper transforms (Khan Academy's 12→60fps trick, §4). Scroll in = assembled pack; mid-scroll = parts labeled with thin keylines ("hand-tied pouch," "foil-stamped crest"); scroll out = reassembled.

### P6 — The Shelf (pack carousel, theme follows center pack)

```css
.shelf { display:flex; gap:4rem; overflow-x:auto; scroll-snap-type:x mandatory; }
.shelf .pack { scroll-snap-align:center; transition: transform .4s, filter .4s; }
.shelf .pack:not(.is-center) { transform: scale(.82); filter: saturate(.6) brightness(.92); }
```
```js
new IntersectionObserver(es => es.forEach(e => { if (e.intersectionRatio > .9) {
  e.target.classList.add('is-center');
  document.body.dataset.flavor = e.target.dataset.flavor;   // ties into P3
}}), { root: shelf, threshold: .9 }).observe(...);
```
- One soft shared shadow ellipse under the shelf grounds the packs. Center pack gets the tilt rig (P2) enabled; side packs are inert.

### P7 — The Unwrap (peel/open reveal)

```html
<div class="peel">
  <img class="under" src="product-inside.jpg">      <!-- the chakli itself -->
  <div class="over" style="clip-path: inset(0 0 0 0)"><svg><!-- label art --></svg></div>
  <div class="fold"></div>  <!-- the curled corner: gradient strip -->
</div>
```
```js
// scroll progress p ∈ [0,1]
over.style.clipPath = `inset(0 ${p*100}% 0 0)`;                    // label wipes away
fold.style.transform = `translateX(${-p*width}px) rotate(-14deg)`; // fold chases the edge
fold.style.background = 'linear-gradient(105deg,#fff8 0%,#0002 45%,#0004 50%,transparent 55%)';
```
- Reads as the label peeling back to reveal the real product photo underneath (honors the "real imagery" rule). Keep the fold narrow (~48px) — the gradient does the paper-curl illusion.

### P8 — Specular Sweep (foil glint on scroll/cursor)

```html
<svg>… <text class="foil">CMAA</text>
  <rect class="glint" width="40" height="200%" fill="url(#sweep)" transform="rotate(20)"/>
  <!-- #sweep: transparent → rgba(255,255,240,.85) → transparent -->
  <clipPath id="lock"><use href="#lockupPaths"/></clipPath>  <!-- glint clipped to foil art -->
</svg>
```
```js
glint.style.transform = `translateX(${-100 + p*300}%) rotate(20deg)`;  // p = scroll or hover progress
```
- The foil itself is a static gold gradient (§3.1); only a clipped highlight bar translates across it. Transform-only = compositor-only. Fire once on hero entry (IntersectionObserver), again on hover — never loop.

### P9 — The Giant Pack Handoff (hero scales down into the buy module)

```css
.hero-pack { position: sticky; top: 10vh; will-change: transform; }
```
```js
// over the hero's 180vh: scale 1 → .32, translate toward the buy card's slot
heroPack.style.transform = `translate(${lerp(0,dx,p)}px, ${lerp(0,dy,p)}px) scale(${lerp(1,.32,p)})`;
// at p==1: swap — hide hero pack, reveal identical pack already in the buy card (FLIP)
```
- Measure the buy-card slot with `getBoundingClientRect()` once (and on resize) to get `dx/dy` and target scale. The pack never leaves the user's eye between "admire" and "purchase" — strongest conversion pattern of the set.

### P10 — The Sticker Sheet (collectible labels as a wall)

```css
.sheet { display:grid; } .sticker { transform: rotate(var(--tilt)); transition: transform .25s; }
.sticker:hover { transform: rotate(0) scale(1.06); z-index:2;
  filter: drop-shadow(0 6px 14px rgb(0 0 0 / .25)); }
```
- Cmaa already has a collectible label system (pouches, tin, matchbox). Lay the labels out as a slightly-rotated sticker sheet; each has a kiss-cut white keyline (`stroke` on the SVG outline). Hover lifts one. Doubles as flavor navigation → clicking sets `data-flavor` (P3).

---

## 3. Faking print finishes in vector

### 3.1 Gold foil

**Cheap tier (use by default) — gradient ramp:**
```css
.foil-text { background: linear-gradient(105deg,
    #a3762a 0%, #f6e27a 28%, #fff8d6 40%, #cb9b51 55%, #f6e27a 72%, #8a5f1e 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
```
For SVG shapes: same stops in a `<linearGradient>` fill, angled ~105°. The multi-stop light/dark alternation is what reads as metal. Add P8's glint sweep for life.

**Premium tier — real specular relief (hero lockup only):**
```xml
<filter id="foil">
  <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="blur"/>
  <feSpecularLighting in="blur" surfaceScale="3.5" specularConstant="0.9"
      specularExponent="22" lighting-color="#fff" result="spec">
    <fePointLight x="220" y="-50" z="160"/>
  </feSpecularLighting>
  <feComposite in="spec" in2="SourceAlpha" operator="in" result="specCut"/>
  <feBlend in="SourceGraphic" in2="specCut" mode="screen"/>
</filter>
```
`surfaceScale` = perceived relief height; `specularExponent` higher = tighter, glossier hotspot. Move `fePointLight` x/y from cursor (rAF-throttled) so the foil "catches light" — but only on ONE element, gated by IntersectionObserver, frozen under `prefers-reduced-motion`.

### 3.2 Emboss / deboss (dual inner shadows)

Emboss = light from top-left: light inner edge on top, dark inner edge on bottom. Deboss = inverted.
```css
/* CSS text (letterpress-adjacent) */
.emboss { color:#e8dcc8; text-shadow: 0 1px 1px rgb(255 255 255/.8), 0 -1px 1px rgb(0 0 0/.35); }
.deboss { color:#d9cbb2; text-shadow: 0 -1px 1px rgb(255 255 255/.7), 0 1px 2px rgb(0 0 0/.4); }
```
```xml
<!-- SVG shape version: two offset inner shadows composited inside the shape -->
<filter id="deboss">
  <feOffset in="SourceAlpha" dx="0" dy="1.5" result="down"/>
  <feComposite in="down" in2="SourceAlpha" operator="out" result="rim"/>
  <feGaussianBlur in="rim" stdDeviation="1" result="rimB"/>
  <feFlood flood-color="#000" flood-opacity=".45"/><feComposite in2="rimB" operator="in" result="dark"/>
  <!-- repeat with dy="-1.5", white flood, for the opposing rim; feMerge all over SourceGraphic -->
</filter>
```
Key: the ink color must be derived from the paper color (slightly darker/lighter), and shadows must be rgba — that's what makes it read as pressed paper rather than a drop shadow.

### 3.3 Letterpress ink gain

Letterpress ink squeezes outward at edges. Recreate with a true outer stroke: `feMorphology operator="dilate" radius="0.75"` on `SourceAlpha`, flood with a darker ink, merge under the original. (CSS `stroke`/`-webkit-text-stroke` centers on the edge and thins the letterform — dilate doesn't.) Combine with §3.2 deboss + §3.4 grain for the full pressed-card look.

### 3.4 Riso grain & paper texture (without raster bloat)

```xml
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65"
  numOctaves="3" stitchTiles="stitch"/></filter>
```
- **Never run this live over the page.** Render it once into a tiny tiled SVG (a `<rect>` with the filter, saved as a ~1 KB data-URI `background-image`), overlay at `opacity: .06–.12` with `mix-blend-mode: multiply` (shadow grain) or `overlay` (paper tooth).
- Grainy-gradient trick: put the noise UNDER a gradient, then `filter: contrast(170%) brightness(1000%)` on the composite pushes mid-grays to pure paper/ink — coarse riso speckle instead of smooth digital gradient.
- **Riso misregistration:** duplicate a label motif, offset 1–2px, second copy in another ink color with `mix-blend-mode: multiply` — instantly "hand-printed."
- `baseFrequency` ~0.65 = fine tooth; 0.15–0.3 = coarse riso fleck. `stitchTiles="stitch"` makes it tile cleanly.

### 3.5 Halftone in SVG/CSS

```css
/* flat dot screen, zero assets */
.halftone { background-image: radial-gradient(circle, var(--ink) 25%, transparent 26%);
  background-size: 6px 6px; }
```
```xml
<!-- gradient halftone: dot screen masked by a luminance ramp -->
<pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse">
  <circle cx="3.5" cy="3.5" r="2.4" fill="var(--ink)"/></pattern>
<mask id="fade"><rect fill="url(#rampWhiteToBlack)" .../></mask>
<rect fill="url(#dots)" mask="url(#fade)"/>
```
Rotate the pattern 15–45° (`patternTransform="rotate(22)"`) — real print screens are always angled; 0° reads as digital. Use halftone in shadows under packs and in section dividers, not on body copy.

---

## 4. Performance playbook: big inline SVGs at 60fps

1. **Never animate SVG geometry/attributes.** Transforming SVG elements triggers re-layout + repaint. Khan Academy went 12→52-60fps by wrapping each moving SVG in a plain `<div>` and animating the div's CSS transform instead. Rule: SVG paints once; divs (or CSS `transform` on `<g>` in modern browsers — verify per-target) do the moving.
2. **Transform + opacity only.** These are the only universally composited properties. `clip-path` is compositor-friendly in modern engines; `filter` changes are not.
3. **Filters are the budget.** Live SVG filters (feTurbulence, feSpecularLighting, displacement) are "the performance crimes kingpin" — hardware acceleration is inconsistent across engines. Budget: **max 1–2 live-animated filters on screen** (the hero foil light, nothing else). Everything else: bake to static data-URI tiles. Any change to a filtered element's children recomputes the whole filter — keep filtered subtrees leaf-only.
4. **will-change discipline.** Add `will-change: transform` only to the elements that are actively animating (hero pack, glint bar), remove it (or scope via a class) when idle. Every promoted layer costs GPU memory; dozens of promoted stickers will jank a mid-range phone worse than no promotion.
5. **Contain the hero:** `contain: layout paint` on the pack stage stops its repaints leaking into the page; `content-visibility: auto` on below-fold sections keeps their SVG DOM out of style/layout cost until scrolled near.
6. **Gate everything:** IntersectionObserver starts/stops rAF loops and filter-light animation; `prefers-reduced-motion` swaps scrubbed sequences for static poses; touch devices skip cursor parallax.
7. **Sprite over canvas** for sequences when frames fit one sheet (≤ ~4096px wide per row on mobile GPUs — split rows if needed): one decoded image + `steps()` beats decode-and-drawImage per frame.
8. **rAF-throttle pointermove** and lerp toward targets — never write styles directly in the event handler.

---

## 5. Recommendation for Cmaa: build these 3 first

Cmaa's assets are flat label art (collectible label system) + real product photos — no 360° render pipeline. Vanilla stack, static hosting. Highest premium-per-effort:

1. **P3 + P6 — Pack Sets the Palette on The Shelf.** The flavor shelf where the centered pouch re-themes the whole page from its label's ink colors. This is the Fly by Jing/Magic Spoon signature that makes label and site feel like one printed system — and it's ~60 lines of vanilla code on top of existing assets. Wire P10's sticker labels in as the shelf's navigation.
2. **P2 + P8 — Levitating Pack hero with foil glint.** Real pouch photo + label SVG in a 4-layer tilt rig (±8°, lerped), gold-gradient crest with a one-shot clipped specular sweep on entry. This alone moves the hero from "product image" to "object of desire." Reduced-motion fallback: static pack with baked soft shadow.
3. **P4 — Die-Cut Portal transition.** The gift tin/matchbox die-cut shape as a `clip-path` portal from hero into the story section. No other snack D2C site does this; it's compositor-cheap, and it turns Cmaa's actual packaging die-line into the site's signature transition.

Phase 2 (when 360° pack photography exists): P1 Turntable via sprite-sheet + scroll timeline. Phase 2 conversions: P9 Giant Pack Handoff into the buy card.

Print-finish kit to build now (shared CSS/SVG partial): gold ramp gradient + glint (§3.1 cheap tier), deboss dual-shadow (§3.2), baked grain tile at 8% multiply (§3.4), angled halftone shadow under every pack (§3.5). One live `feSpecularLighting` allowed — hero lockup only.

---

## Sources

- [CSS-Tricks — Apple-style scroll-scrubbed image sequences](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)
- [geyer.dev — (almost) pure CSS image-sequence animations (sprite + steps + scroll timeline)](https://geyer.dev/blog/css-image-sequence-animations/)
- [Lean Rada — CSS sprite-sheet notes (steps(N, jump-none) + background-position, scroll-driven variant)](https://leanrada.com/notes/css-sprite-sheets/)
- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Emil Kowalski — The Magic of Clip Path](https://emilkowal.ski/ui/the-magic-of-clip-path)
- [utilitybend — Animating clip-paths on scroll with @property](https://utilitybend.com/blog/animating-clip-paths-on-scroll-with-at-property-in-css)
- [Carmen Ansio — SVG Filters on Type (feSpecularLighting gold, feMorphology ink gain)](https://www.carmenansio.com/articles/svg-filters-on-type/)
- [CSS-Tricks — Grainy Gradients (feTurbulence + contrast/brightness)](https://css-tricks.com/grainy-gradients/)
- [Codrops — Creating Texture with feTurbulence](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/)
- [fffuel nnnoise / gggrain — tiny tiled SVG noise generators](https://www.fffuel.co/nnnoise/)
- [freeCodeCamp — grainy CSS backgrounds via SVG filters baked to data-URI](https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/)
- [Daniel Immke — Making noisy SVGs](https://daniel.do/article/making-noisy-svgs)
- [Texteffects.dev — Gold text effect with CSS (multi-stop gradient + text-shadow)](https://texteffects.dev/posts/gold-text-effect)
- [Charlie Marsh — (More Than) Doubling SVG FPS at Khan Academy](https://www.crmarsh.com/svg-performance/)
- [Taylor Hunt — Improving SVG Runtime Performance](https://codepen.io/tigt/post/improving-svg-rendering-performance)
- [O'Reilly Using SVG — Planning for Performance](https://oreillymedia.github.io/Using_SVG/extras/ch19-performance.html)
- [MDN — Animation performance and frame rate](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- [Awwwards — Yucca Packaging SOTD](https://www.awwwards.com/sites/yucca-packaging) · [Vamvalis Foods packaging inspiration](https://www.awwwards.com/inspiration/packaging-vamvalis-foods)
- [Fonts In Use — Fly by Jing packaging + website](https://fontsinuse.com/uses/37812/fly-by-jing-packaging-and-website)
- [Shopify — Website color schemes (Magic Spoon flavor-coordinated backgrounds)](https://www.shopify.com/blog/website-color-schemes)
- [Really Good Designs — Scrollytelling examples (Mana Yerba Maté can rotation)](https://reallygooddesigns.com/scrollytelling-website-examples/)
- [30 seconds of code — Engraved/embossed text](https://www.30secondsofcode.org/css/s/engraved-embossed-text/) · [deborah-bickel — Letterpress with CSS](https://www.deborah-bickel.de/embossed-letterpress-effect-with-css)
