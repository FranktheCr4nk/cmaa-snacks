# SEEMA v3 — CREATIVE BRIEF: "UNWIND"
### The definitive build document. Everything previous is scrapped. Six agents build from this file only.

---

## 1. THE IDEA

**A chakli is a spiral. A scroll is a spiral you pull straight. The site is one chakli, unwinding.**

The entire page is stitched together by **one continuous line** — the chakli's spiral, drawn as a single SVG path. It draws itself as the loader, unwinds into the hero's horizon rule, travels down the page underlining the words that matter, becomes the orbit ring around the honesty dial, becomes the leader-lines of the exploded ingredient view, and finally **coils back into a chakli** that becomes the "Order" seal at the footer. One line, start to finish. The metaphor is literal: *everything here is one unbroken process, one pair of hands, nothing added along the way.*

Why this and not another color-swapping snack circus: the dissections show two winning families — the maximalist world-flippers (SPYLT, Slosh) and the **one-world object-handoff sites** (Bucks Sauce: one near-black room, a dotted stitch line sewing sections together; La Revoltosa: one bottle traveling the whole page). Seema is a real mother, not a beverage startup. She gets the second family, executed at the first family's craft level. **One world. One light. One line. The product hyper-real and enormous.**

Three non-negotiables baked into the concept:
1. **Seema is the brand.** Her hands appear before her face. Her face appears exactly once, and it is the emotional peak of the page.
2. **Honesty is the plot.** "No palm oil, no preservatives" is not a badge row — it is a full pinned chapter (*Nothing to Hide*, an orbital dial with the real product at center) followed immediately by its mirror (*Everything Inside*, an exploded macro showing every ingredient the chakli is made of).
3. **Minimal means fewer, bigger, realer.** ~11 beats, no marquees, no sticker spam, no world color-flips. Every image is a macro-real photograph of the actual food. Whitespace is a feature. If a section can be cut, cut it.

What no other snack brand has: **the product's own geometry as the site's navigation metaphor.** SPYLT has drips, Slosh has bubbles, Revoltosa has a bottle. Nobody has a food whose *shape is a line* — the chakli spiral is a gift and this site is the only one that can open it.

Tagline system (EN primary, Marathi accent): **"Made by one pair of hands."** / accent word **"हातची चव"** (the taste of the hand). Voice: quiet, first-person, a mother stating facts. No exclamation marks anywhere on the site.

---

## 2. ART DIRECTION

### 2.1 Palette (total: 5 values, use fewer per screen)
| Role | Name | Hex | Usage |
|---|---|---|---|
| Base world | Khadi Cream | `#F5EEE3` | Every background. The page is this color 90% of the time. |
| Ink | Roast Brown | `#2E1F16` | All type, all line-work, the spiral path. |
| Primary accent | Haldi | `#DA8A1D` | The traveling line's "active" state, underlines, CTA fill, chakli-golden echo. |
| Secondary accent | Dried Chili | `#A93B26` | Sparingly: one word per chapter max, the batch stamp, Chivda SKU accent. |
| Highlight | Ghee | `#F3C877` | Hover states, dial active pill, focus rings. Never as a background field. |

Rules: no gradients anywhere in UI (photography carries all tonal range). No pure white, no pure black. Dark sections do not exist — the world never flips; contrast comes from photography density, not background swaps.

### 2.2 Type (2 faces)
- **Display / voice: Fraunces** (Google Fonts, variable). Optical size 72–144, weight 400–600, `SOFT 50, WONK 1` on display sizes only. Big, warm, slightly imperfect serif — reads homemade-with-standards, never techy. All headlines sentence-case (not caps — caps shout, Seema doesn't).
- **Ledger / label voice: IBM Plex Mono** (400/500). Batch numbers, ingredient labels, nutrition, captions, nav, the breadcrumb pill. This is the "honest label" voice — everything factual is set in mono, everything felt is set in Fraunces. The reader learns the grammar in one screen.
- Marathi accent glyphs (सीमा, हातची चव): **IBM Plex Sans Devanagari** — same family, counts as Plex. Used only as small accent marks beside the wordmark and portrait chapter, never for running text.

Scale: display clamps `clamp(2.8rem, 8vw, 7.5rem)`; mono captions fixed 13–14px, letter-spacing 0.06em, uppercase allowed only in mono.

### 2.3 Photographic world (the Nano Banana contract)
Every image obeys ONE lighting/surface language so 20+ renders read as a single shoot:
- **Light:** single soft window light from camera-left, ~35° elevation, warm morning temperature (~4300K), gentle falloff to soft shadow on the right. No studio-white, no ring light, no HDR. Shadows are brown, never grey.
- **Lens:** 100mm macro language for product (shallow DOF, f/4-ish, crumb-level micro-texture in focus plane); 50mm at f/2.8 for hands/process; 85mm for portrait. Slight film grain, muted-but-warm color grade (think Kinfolk × Indian kitchen, not Instagram-saturated).
- **Surfaces (only these):** aged khadi/muslin cloth in cream, a dark worn terracotta-brown clay surface, hammered brass thali, well-used steel kadhai. Nothing marble, nothing white ceramic, nothing wooden-cutting-board-generic.
- **Styling:** food is imperfect-real — a broken chakli, loose besan dust, one flake of fried curry leaf out of place. No parsley-garnish energy, no water-spritz sheen. Oil sheen must look like actual frying, i.e., matte-satin not gloss.
- **Texture rules for UI:** the cream background carries a barely-there paper grain (2% noise PNG, multiply). The spiral line is 2px, `stroke-linecap: round`, hand-drawn slight wobble (path drawn with 1–2px jitter, not geometric-perfect). Dotted rules use `stroke-dasharray: 1 7`.

---

## 3. THE SCROLL STORYBOARD (11 beats)

Global chrome, present throughout: top-left wordmark (SVG, from logo agent); top-right a mono breadcrumb pill that rewrites per chapter — `SEEMA / THE HANDS`, `SEEMA / NOTHING TO HIDE`, etc. (ActiveHop steal — dirt-cheap orientation, strong voice); bottom-right mono scroll cue that fades after first scroll. No persistent nav menu — the page IS the nav; a single "Order" pill docks top-right after Beat 7.

**B0 — LOADER: the line draws itself.**
Cream screen. Center: the chakli spiral as a bare 2px roast-brown path drawing in via `stroke-dashoffset` (catalog L3), driven by **real asset progress with a 1.2s floor** (L2 — weighted image loading, eased catch-up). Mono caption beneath: `batch no. 0117 — loading fresh`. At 100% the spiral does NOT fade out — it **unwinds**: the path morphs (Flubber/precomputed samples) from coil to a straight horizontal line that travels to its permanent home as the hero's horizon rule (L9 — the loader element becomes a real layout element; zero discarded UI, the Bucks loader-to-plinth move).
*Feel:* "this brand wastes nothing, not even a loading bar."
*Reduced-motion/mobile:* spiral appears at 60% opacity, fades to the hero rule with a simple crossfade. Mobile identical (cheap).

**B1 — HERO: the type sandwich.**
Full-viewport. Macro render of a single bhajani chakli (shot S1), enormous, center-right, floating over cream with its real soft shadow. Type sandwich (La Revoltosa steal): Fraunces line **behind** the chakli — "Made by" — and a second line **in front** — "one pair of hands." The unwound loader line sits beneath as the horizon rule; haldi underline ticks in under "hands." Chakli idles with a 2s ±1.5px drift + 3° slow rotation (never static, never busy). Two wisps of steam rise from it (catalog #1: 3 staggered SVG squiggles, 2.5s ease-in-out, prime-offset durations).
*Feel:* immediate hunger + immediate thesis.
*Fallback:* no idle drift; steam static-hidden; layers flatten to image-above-type.

**B2 — 4:30 AM: the hands.**
Aperture reveal (L7): a small clipped window on shot S12 (Seema's hands pressing dough through the brass chakli press, dawn light) opens to full-bleed as you scroll, image counter-scaling 1.3→1. Over it, mono timestamp `04:30 — the kitchen is already awake`, then one Fraunces line: "Before the city wakes, the press does."
*Feel:* cinema; the "who made this" question answered with labor, not a claim.
*Fallback:* static full-bleed image with text; no clip animation.

**B3 — MANIFESTO: the line underlines the truth.**
Cream. One pinned Fraunces paragraph fills the viewport: "No factory. No palm oil. No preservatives. No 'natural identical flavours.' Rice, dal, butter, spice — and a woman who refuses to cut corners." As scrub progresses, the traveling spiral line snakes through the text and **underlines each negation in haldi**, one per scroll increment (SPYLT sticker-stamp mechanic, restrained to underlines — no stickers, this brand doesn't slap tape). "refuses" gets the single chili-red word of the chapter.
*Feel:* the claims land one at a time, physically.
*Fallback:* all underlines pre-drawn; paragraph static.

**B4 — NOTHING TO HIDE: the orbital dial.**
Pinned ~250vh. The traveling line curls into a thin circle with `+` ticks around a centered chakli macro (S2, top-down). Mono pills park at compass points: `NO PALM OIL` · `NO PRESERVATIVES` · `NO ARTIFICIAL COLOUR` · `NO MACHINES`. Scroll rotates the orbit (ActiveHop specimen-dial steal); the active pill inverts to roast-brown fill with ghee text, and its one-sentence detail card holds the top-right corner ("Fried in groundnut oil we'd feed our own kids. Because we do."). Build the dial ONCE — it is reused in B9.
*Feel:* clinical honesty, instrument-panel calm — the premium register.
*Fallback/mobile:* dial becomes a static circle with all four pills visible; detail cards become a vertical list. On mobile the orbit doesn't rotate; pills highlight sequentially on scroll.

**B5 — EVERYTHING INSIDE: the exploded chakli.**
The mirror of B4, and **the signature beat of the site.** Pinned ~300vh. Center: chakli macro (S3). On scrub, the real ingredients fly OUT to labeled positions — rice flour drift, chana dal, sesame, cumin, ajwain, butter, curry leaves (individual cutout renders S13–S15, composited) — each connected to the chakli by a thin leader line branching off the traveling spiral path, with mono labels (`sesame — toasted same morning`). It is catalog #18 (ingredient stack assembly) played in reverse: not "we assemble," but "look, you can take it apart and nothing surprises you." Each ingredient has its own parallax depth; nearest layer gets 2px blur (Bucks DOF steal).
*Feel:* the "what's inside" promise delivered visually, not as a table.
*Fallback:* pre-composed exploded flat-lay image (S4) with static labels — this exact image is also the shareable/OG asset.

**B6 — THE CRUNCH.**
Short, loud, sensory. Full-bleed macro of a chakli snapped in half, crumb structure and spiral cross-section razor-sharp (S5). On enter, a one-shot **crunch burst** (catalog #24: 6–8 radial lines + 3 crumb dots, 350ms ease-out, 1-frame scale pop) fires once at the break point. Fraunces, huge: "You'll hear it before you taste it." Nothing else on screen.
*Feel:* appetite spike; the page's single percussive moment.
*Fallback:* static image + text; burst pre-rendered as faint radial marks.

**B7 — THE SHELF: three doors.**
World stays cream. Three arched-window cards (La Revoltosa steal), each an arch-masked render of the SKU in context (S6–S8): **Bhajani Chakli** (haldi arch tint), **Poha Chivda** (chili arch tint), **Shankarpali** (ghee arch tint — confirm third SKU with user; card is templated). Card = arch image, Fraunces name, mono line (`₹ ___ · 250 g · this week's batch`), quiet "Add" pill. Hover: jelly wobble (catalog #9, 6% squash, volume-preserved) + 2 sesame specks sprinkle (#5). The docked "Order" pill appears in the chrome from here on. Ordering flow: cards deep-link to a WhatsApp order message (D2C, no cart backend on GitHub Pages) — mono note `orders close friday · fried saturday · shipped monday`.
*Feel:* a small shelf, not a store. Three things, each perfect.
*Fallback/mobile:* cards stack vertically; no wobble.

**B8 — SEEMA: the rack focus.**
The only portrait on the site (S11). Enters fully defocused (CSS blur 24px→0 on scrub — ActiveHop rack-focus-as-transition), sharpening as her name sets in Fraunces with सीमा in Devanagari beneath. Three short mono ledger lines, staggered up (L10 letters-behind-clip grammar): `making chakli since the ‘90s` / `taught by her mother` / `still tastes every single batch`. No paragraph. No "our story" essay.
*Feel:* the emotional peak. The blur-to-sharp reads as "meeting her."
*Fallback:* image loads sharp; lines fade in.

**B9 — FRESH BY BATCH: the stamp.**
The B4 dial component returns, re-labeled (ActiveHop reuse discipline): `FRIED SATURDAY` · `PACKED SAME DAY` · `NO WAREHOUSE` · `21-DAY WINDOW`. At scrub end, a chili-red rubber stamp — `BATCH 0117 · FRESH` — slaps onto the center pack shot (S9) with a 1.4→1 scale + 2° rotation slap-down (SPYLT stamp, used exactly once on the whole site). Live-ish detail: the batch number and "orders close Friday" date render from JS date math — the page always tells the truth about this week.
*Feel:* freshness as a system, not an adjective.
*Fallback:* stamp pre-applied on the image.

**B10 — THE COIL: order, and the line comes home.**
Footer-as-poster. The traveling line — present since B0 — animates its final act: it **coils back into a chakli spiral**, which settles beside the wordmark as the brand's "seal." Fraunces: "From Seema's kitchen to yours." One haldi CTA pill (`Order this week's batch` → WhatsApp), mono contact/IG line, that's the entire footer. Under reduced motion the coiled seal is simply present.
*Feel:* closure — the metaphor pays off; the line you followed was a chakli all along.

**Global reduced-motion rule:** `prefers-reduced-motion` disables all pinning/scrubbing; the page becomes a clean vertically-flowing editorial with all end-states pre-composed. **Mobile rule:** pins shortened ~40%, parallax depths halved, B5 uses the flat-lay fallback below 768px, all tap targets ≥44px.

---

## 4. PRODUCT PRESENTATION SPEC

The product appears **five ways**, no others:
1. **Hero macro** — one piece of product, enormous, floating on cream, real shadow, steam. (B1; shots S1, S2, S5.) The rule: product is never shown small. Minimum 55vh tall on desktop.
2. **Exploded "what's inside"** — chakli center + ingredient cutouts on leader lines (B5; S3 + cutouts S13–S15; fallback composite S4). Every label states a fact (`toasted same morning`), never an adjective.
3. **Pack-in-context** — the pouch (from packaging agent) rendered held in hands and on the terracotta surface (B7, B9; S6–S9). Pack never shown as a floating 3D mockup on white — always touched, always lit by the same window.
4. **Texture/crumb detail** — snapped cross-sections, chivda tumble mid-air frozen, oil-satin close-ups (B6; S5, S16, S17). These are the appetite engine; art-direct them hardest.
5. **Honesty instrumentation** — top-down product inside the line-drawn dial (B4/B9). Product photographed dead-flat top-down so the circle geometry locks.

Nutrition/ingredients per SKU live on the pack renders and in a mono expandable per card (plain text, no icons). No lifestyle-model photography, no picnic scenes, no chai-cup-morning-light stock energy anywhere.

---

## 5. NANO BANANA SHOT LIST

**Global style preamble — prepend to EVERY prompt verbatim:**
> "Editorial food photography, single soft window light from camera left at 35 degrees, warm early-morning temperature, soft brown shadows falling right, muted warm film grade, subtle film grain, matte-satin oil sheen, hyper-detailed real Indian homemade snack, imperfect and authentic, no gloss, no HDR, no studio white. Surfaces limited to: cream khadi muslin cloth, dark worn terracotta-brown clay, hammered brass, used steel. Background khadi cream #F5EEE3 where seamless."

| # | Shot | Prompt core (after preamble) | AR |
|---|---|---|---|
| S1 | Hero chakli | One golden-brown bhajani chakli spiral, 100mm macro, three-quarter angle floating look on seamless khadi cream, razor focus on ridged spiral texture with sesame seeds, soft contact shadow, faint steam | 4:5 |
| S2 | Dial chakli (top-down) | Single chakli photographed dead top-down on cream, perfectly centered, even spiral geometry visible, macro texture, minimal soft shadow ring | 1:1 |
| S3 | Exploded-view center | Same chakli as S2, top-down, slightly smaller in frame with generous empty cream margin on all sides for compositing | 1:1 |
| S4 | Exploded flat-lay (fallback/OG) | Top-down flat-lay: chakli center; radiating around it small neat piles — rice flour, chana dal, white sesame, cumin, ajwain, a curl of butter on brass spoon, three fried curry leaves; thin gaps between, on cream khadi | 16:9 |
| S5 | Crunch cross-section | Chakli snapped in half, 100mm extreme macro on the break: airy crumb structure, oil-satin interior, loose crumbs mid-fall, dark terracotta surface | 16:9 |
| S6 | Chakli pack-in-hand | Woman's hands (mid-40s, worn, small bangles, no manicure) holding kraft pouch of chakli toward camera, 50mm f/2.8, kitchen bokeh behind, window light | 4:5 |
| S7 | Chivda pack-in-hand | Same hands, same framing, poha chivda pouch, a few chivda flakes on the cloth below | 4:5 |
| S8 | Third SKU pack-in-hand | Same hands, same framing, shankarpali pouch (placeholder — retitle when SKU confirmed) | 4:5 |
| S9 | Pack on surface (stamp target) | Single kraft pouch standing on dark terracotta, front label square to camera, brass bowl of chakli beside, clean space upper-right for stamp overlay | 4:5 |
| S10 | Pack trio | Three kraft pouches in a loose row on terracotta, slight depth stagger, focus on center pack | 16:9 |
| S11 | Seema portrait | Environmental portrait, Indian mother mid-50s in simple cotton saree, standing at her kitchen counter beside steel kadhai, 85mm, defocused morning kitchen behind, honest gentle almost-smile, hands dusted with flour, window light on face | 4:5 |
| S12 | The press (4:30 AM) | Close on hands pressing chakli dough through a brass chakli press into hot oil in steel kadhai, 50mm, dawn-dark kitchen, single warm window glow, oil surface shimmer, steam | 16:9 |
| S13 | Ingredient cutouts A | Individual small subjects centered on pure khadi cream, top-down macro, for cutout: (a) pinch-pile of rice flour (b) scatter of chana dal (c) teaspoon-pile of white sesame | 1:1 ×3 |
| S14 | Ingredient cutouts B | Same treatment: (a) cumin seeds pile (b) ajwain pile (c) small butter curl on hammered brass spoon | 1:1 ×3 |
| S15 | Ingredient cutouts C | Same treatment: (a) three crisp fried curry leaves (b) two dried red chilies (c) roasted peanuts small pile | 1:1 ×3 |
| S16 | Chivda macro | Poha chivda extreme macro heap on brass thali: thin poha flakes, peanuts, curry leaves, turmeric-gold tone, one raisin, scattered pieces at heap edge | 4:5 |
| S17 | Chivda mid-air | Chivda tumbling mid-pour from brass bowl, frozen motion, individual flakes and peanuts sharp against cream, soft shadow below | 4:5 |
| S18 | Third SKU macro | Shankarpali stacked loosely, macro on sugar-ghee sheen and layered edges, terracotta surface (retitle with SKU) | 4:5 |
| S19 | Frying moment | Chaklis frying in kadhai, top-down-ish 50mm, oil bubbles ringing the spirals, brass skimmer entering frame left, steam | 16:9 |
| S20 | Cooling rack | Fresh chaklis cooling on steel mesh over khadi cloth, raking window light exaggerating ridge texture, one broken piece | 16:9 |
| S21 | Hands + finished batch | Same hands as S6 cupping a heap of chakli pieces offered toward camera, crumbs falling, 50mm | 4:5 |
| S22 | Empty kitchen still | Quiet corner: brass press, folded khadi cloth, steel kadhai, dawn light — no food. (Breather/backdrop texture for B2/B8) | 16:9 |

Consistency levers: same hands model description in S6/S7/S8/S12/S21; same kadhai/press props named identically in every process prompt; re-roll any render whose light direction or surface breaks the preamble. All renders reviewed against S1 as the color-grade anchor.

---

## 6. SIX-AGENT BUILD PLAN

Order of operations: **Logo + Packaging + UI start immediately** (day 0, no render dependency). **Renders generated in parallel** from Section 5. **SVG + Animation** start on spec immediately, integrate renders as they land. **Frontend** assembles last-but-continuous.

**A. LOGO AGENT** — starts now.
Scope: wordmark "Seema" in Fraunces-derived custom-spaced setting + the **coil seal** (the B10 spiral, drawn as ONE open path with hand wobble — this exact path is a shared asset). Devanagari सीमा accent lockup. Deliverables: `assets/brand/logo.svg` (wordmark), `assets/brand/seal.svg` (single-path spiral, path exported with ID `#spiral-master`), mono/reversed variants, 32px favicon. Constraint: seal path must be open-ended (unwindable) and ≤80 path commands — the SVG agent morphs it.

**B. PACKAGING AGENT** — starts now; blocks S6–S10 renders.
Scope: kraft-pouch label system for 3 SKUs. Cream label, roast-brown Fraunces SKU name, mono ingredient/batch block with a real blank for handwritten batch no., seal spiral embossed motif, haldi/chili/ghee SKU accent rule. Deliverables: `assets/pack/label-{chakli,chivda,sku3}.svg` + flat 2000px PNG label art for Nano Banana prompt-injection ("pouch bearing this exact label"), dieline PDF. Handoff: PNGs to whoever runs the render batch before S6–S10.

**C. UI AGENT** — starts now.
Scope: design tokens + every component's spec: chrome (wordmark slot, breadcrumb pill, order pill), type scale, dial component (pills, ticks, detail card), arch cards, mono ledger blocks, stamp, footer. Deliverables: `site/tokens.css` (palette/type/spacing custom props), `docs/v3-ui-spec.md` with per-beat desktop+mobile layout redlines (grid, sizes, exact copy placement for B1–B10). Uses grey-box placeholders at exact AR from Section 5 so nothing waits on renders.

**D. SVG AGENT** — starts now.
Scope: everything line-drawn. Deliverables in `site/assets/svg/`: the **master spiral path** states (coiled / unwound / snaking / circled / re-coiled — 5 keyframe paths with IDENTICAL point counts for morphing, sampled from `#spiral-master`), steam squiggles (#1), crunch burst (#24), sprinkle specks (#5), dial ring + ticks, leader lines for B5, stamp artwork, paper-grain tile. Every SVG inline-ready, `currentColor` strokes, `stroke-linecap="round"`, no embedded styles. Handoff doc listing each path's element IDs for the animation agent.

**E. ANIMATION AGENT** — starts after D's path states + C's spec (day 1–2).
Scope: all motion. Deliverables: `site/js/motion.js` — loader (L2+L3+L9 composite), per-beat ScrollTrigger timelines (pin distances, scrub configs, easings exactly as Section 3), path-morph engine for the spiral's five states, micro-interactions (wobble, burst, stamp), `prefers-reduced-motion` kill-switch that swaps to end-state classes, mobile pin-shortening. Easing doctrine: entrances `cubic-bezier(.16,1,.3,1)` (expo.out), pins scrub `power2`, stamps/slaps back-out `cubic-bezier(.34,1.56,.64,1)`, exactly one overshoot ever.
Interface: animates ONLY via IDs/classes published in D's handoff doc and C's spec — never invents DOM.

**F. FRONTEND AGENT** — scaffolds now, integrates continuously, owns final QA.
Scope: `site/index.html` semantic structure (one `<section>` per beat, IDs `#b0`–`#b10`), image pipeline (Section 7), font loading (`font-display: swap`, preload Fraunces variable + Plex Mono woff2), WhatsApp deep links with prefilled order message, batch-date JS, OG/meta using S4, GitHub Pages deploy (root or `/docs`, keep `.nojekyll`), Lighthouse pass, cross-device test. Final owner of the browser walkthrough demo.

Dependency graph: `A.seal → D.morph-states → E.spiral-timeline` · `B.labels → S6–S10 renders → F.integration` · `C.spec → E + F` · renders (any order) → F. Nothing idles.

---

## 7. TECH SPEC

**Stack: GSAP 3 (ScrollTrigger) + Lenis. Vanilla everything else. No framework, no build step beyond an image script.**
Justification: the storyboard demands 4 pinned scrub chapters, a 5-state path morph tied to scroll progress, and FLIP-style loader handoffs — hand-rolling that on raw `IntersectionObserver`+rAF means rebuilding ScrollTrigger badly. GSAP is now fully free (incl. all plugins), ships as static files — perfect for GitHub Pages. Lenis (~4KB) gives the inertial smoothness that makes scrub feel buttery and syncs cleanly via `lenis.on('scroll', ScrollTrigger.update)`. Total JS: GSAP core+ScrollTrigger (~70KB gz) + Lenis + ~15KB own code — inside budget, zero server requirements.

**Performance budget (hard):** JS ≤ 120KB gz total · CSS ≤ 25KB · fonts ≤ 120KB (Fraunces variable subset + Plex Mono 2 weights, woff2, `unicode-range` subset Devanagari separately) · LCP (hero S1) < 2.0s on Fast 3G+ / < 2.5s mid-tier Android · CLS < 0.05 (all images with explicit `width/height`/`aspect-ratio`) · long tasks < 50ms (pre-sample morph paths at load, never per-frame) · 60fps scrub on 2019 hardware — transforms/opacity/clip-path only, no animated filters except B8's blur which is snapshotted to ≤3 steps on low-power devices.

**Image pipeline:** Nano Banana masters (PNG) → script (`sharp`) → AVIF + WebP + JPEG fallback via `<picture>`. Sizes: hero/full-bleed 2400/1600/800w · arch cards & portraits 1200/800/400w · ingredient cutouts 600/300w (WebP with alpha; AVIF alpha where supported). Quality: AVIF q50, WebP q78. `loading="lazy"` everything below B1; `fetchpriority="high"` + preload on S1 only. Target total page weight < 4MB full-scroll, < 1.2MB before first interaction. Store masters in `assets/masters/` (git-lfs or excluded), derivatives in `site/img/`.

**Hosting:** GitHub Pages static, existing repo, `.nojekyll` retained. No SW/caching tricks needed at this size.

---
*This brief supersedes design-brief-v2.md and all prior concepts. Questions route back to the creative director; everything unspecified defaults to "less."*
