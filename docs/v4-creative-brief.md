# SEEMA v4 — CREATIVE BRIEF: "UNWIND: LOUD"
### Supersedes v3. The spine survives; the skin and energy change completely.

**Verdict on v1:** correct concept, wrong register. QUIET killed it. v4 moves the site into the SPYLT / Slosh / Mr.Pops family: **saturated color worlds that flip as the product flies between chapters, kinetic type at double scale, spectacle you cannot miss at any scroll speed.** What survives untouched: the UNWIND concept (one continuous line, chakli geometry as navigation), the 11-beat structure, the spiral morph engine (`site/assets/svg/spiral-states.js`, 5 states × 240 points, per-point lerp), GSAP+ScrollTrigger+Lenis vendored, live batch-date math, WhatsApp ordering, tokens architecture, sentence case, zero exclamation marks. Loudness comes from **scale, motion, and color — never from caps or punctuation.**

**The one image that defines everything:** `renders/test/oai-chakli-hero.png` — real 4-turn chakli floating on saturated turmeric, suspended crumbs and black sesame, punchy studio key, crisp edges, darker floor vignette. Every pixel of v4 must feel like the same campaign as this frame. It is locked. It is Shot V1.

---

## 1. COLOR WORLDS

The page no longer lives on cream. **The background IS the narrative:** each chapter owns a saturated world color, and the world flips as the product flies between sections. Cream appears only where appetite needs calm (B8 portrait) — earned contrast, used once.

### 1.1 The palette (sampled from the anchor, then built outward)

Anchor background measured at: `#FDB702` (top), `#FCC303` (mid), `#F5A502` (floor), vignette floor `#C66A02`. The turmeric world is defined FROM these samples.

| Token | Name | Base hex | Light edge | Deep floor | Role |
|---|---|---|---|---|---|
| `--w-haldi` | Turmeric Punch | `#F7AE00` | `#FFC414` | `#C96E00` | Hero world, Bhajani Chakli SKU, B9 stamp world, CTA fill |
| `--w-chili` | Chili Slam | `#C8301B` | `#E8491F` | `#8F1F10` | Manifesto, crunch slam, Poha Chivda SKU |
| `--w-leaf` | Curry Leaf | `#0E7B3D` | `#16994E` | `#07522A` | Exploded-view chapter, Lahya Crunch Bites SKU |
| `--w-roast` | Roast Dark | `#201510` | `#3A2417` | `#120B07` | Loader, 4:30 AM chapter, footer world |
| `--w-ghee` | Ghee Field | `#FFC933` | `#FFDD70` | `#E8A800` | Dial chapter — lighter haldi sibling so B1→B4 don't read identical |
| `--w-cream` | Milk Cream | `#F6EDDD` | `#FFFDF6` | `#E9DCC4` | B8 breathing room ONLY. Never adjacent to ghee. |

Ink tokens: `--ink-roast: #201510` (darkened from v3's #2E1F16 for punch on saturated fields) · `--ink-milk: #FFF4E2` · accent `--ink-haldi: #F7AE00`.

**World rendering rule (matches the anchor):** every world is not a flat fill — it is the base hex with a huge soft radial: light edge at 20% from top-left, deep floor as a bottom vignette (`radial-gradient(120% 90% at 35% 12%, lightEdge, base 55%, deepFloor 130%)`). This is exactly the anchor's lighting logic and makes cutout renders sit IN the world instead of ON it.

### 1.2 Contrast-checked ink pairings (WCAG, computed)

| World | Display + body ink | Ratio | Accent (large/decorative only) |
|---|---|---|---|
| Turmeric `#F7AE00` | Roast `#201510` | **9.3:1** AAA | Chili `#C8301B` at display sizes only (1.9:1 vs field — decorative, never text-critical) |
| Ghee `#FFC933` | Roast `#201510` | **11.6:1** AAA | — |
| Chili `#C8301B` | Milk `#FFF4E2` | **5.3:1** AA (AAA ≥24px) | Ghee `#FFC933` display words (3.7:1, ≥32px bold only) |
| Leaf `#0E7B3D` | Milk `#FFF4E2` | **5.0:1** AA | Haldi `#F7AE00` display words (3.4:1, ≥32px bold only) |
| Roast `#201510` | Milk `#FFF4E2` | **15:1** AAA | Haldi `#F7AE00` (9.3:1 — CTA, line-work) |
| Cream `#F6EDDD` | Roast `#201510` | **14:1** AAA | — |

Rules: mono captions always use the world's primary ink at 100% opacity (no 60%-grey-mono — it dies on saturated fields). The traveling spiral line: roast ink on light worlds, milk on dark worlds, haldi on roast. No gradients in type. Chili-on-turmeric and haldi-on-chili are permitted ONLY for stroked outline echo layers (see §2) where fill is transparent.

### 1.3 Per-beat world assignment (the flip score)

| Beat | World | Flip mechanic in |
|---|---|---|
| B0 loader | Roast | — (opens dark) |
| B0→B1 | **SLAM to Turmeric** | circle clip-wipe from spiral center, 450ms |
| B2 | Roast | product flies, world tweens 600ms |
| B3 | Chili | tween on flight |
| B4 | Ghee | tween on flight |
| B5 | Leaf | tween on flight |
| B6 | **HARD CUT to Chili** | 1-frame snap (the only non-tweened flip) |
| B7 | Turmeric → Chili → Leaf | horizontal, per-panel |
| B8 | Cream | slow 900ms dissolve — deliberate exhale |
| B9 | Turmeric | tween on flight |
| B10 | Roast | tween; haldi CTA burns on it |

**Implementation:** two stacked `position:fixed` full-screen world layers behind everything; flips crossfade opacity between them (compositor-cheap) while the incoming layer holds the next world's gradient. Never tween `background-color` on body per-frame. Each `<section>` also carries its own static world class — that IS the reduced-motion/no-JS rendering.

---

## 2. KINETIC TYPE SPEC

Faces unchanged (Fraunces variable + IBM Plex Mono + Plex Devanagari accent). Everything else doubles.

- **Scale — 2× v1.** Display XXL: `clamp(5rem, 15vw, 16rem)`, Fraunces `opsz 144, wght 620, SOFT 60, WONK 1`, line-height 0.92, letter-spacing −0.015em. Display L: `clamp(3rem, 8vw, 8rem)`. A headline is allowed — expected — to touch both viewport edges. Mono stays 13–14px: the contrast between 16rem serif and 13px mono IS the visual joke.
- **Echo layers (the loud signature):** every XXL headline renders 3×: the filled roast/milk layer on top, plus two `aria-hidden` stroked clones behind (`-webkit-text-stroke: 2px currentColor; color: transparent`, standards fallback `paint-order` not needed — clones are decorative). Clone 1: offset `0.045em, 0.05em`, opacity .5. Clone 2: offset `0.09em, 0.1em`, opacity .25. Clones lag the fill by 0.06s/0.12s on entrance and drift ±6px on scroll (different scrub speeds) so the headline feels like layered screen-print that never quite dries. Stroke color = the world's accent (chili echo on turmeric, ghee echo on chili, haldi echo on leaf/roast).
- **Per-word clip-mask rise:** split headlines into word spans, each inside an `overflow:hidden` mask; words rise `yPercent: 115 → 0` with `rotate: 4deg → 0`, stagger 0.055s, 0.7s, `expo.out`. Echo clones repeat the rise at their lag. Exit (scrub reversal): words sink back — the mask makes scroll feel mechanical, like letterpress slugs.
- **Counting numbers:** any numeral on screen counts. `04:30` counts up from `00:00` (B2). `0 palm oil · 0 preservatives · 0 machines` count DOWN from random 2-digit numbers to 0 (B4 — zeros landing one by one is the loudest honesty gag on the site). Batch number spins odometer-style to the live value (B9). Mono, `snap: 1`, 0.9s, `power2.out`.
- **Scale-punch entrances:** one word per chapter may enter at `scale: 1.35 → 1` with the site's back-out `cubic-bezier(.34,1.56,.64,1)`. One per chapter, no exceptions.
- **Preserved rules:** NO marquees (still the one loud-family cliché we refuse). Sentence case everywhere; uppercase lives only in 13px mono labels. No exclamation marks. Devanagari `सीमा` accent at B8 and wordmark only.
- Mobile: XXL floor is 5rem — still enormous at 390px wide; word-rise stagger tightens to 0.04s; echo clones drop to 1 (perf).

---

## 3. BEAT-BY-BEAT v2 (all 11 revised)

Global chrome unchanged in structure (wordmark top-left, mono breadcrumb pill top-right rewriting per chapter, Order pill docks from B7) but chrome ink swaps per world (roast on light worlds / milk on dark) via the same crossfade timing as the world flip.

**THE FLIGHT ENGINE (new, global):** one persistent shared element `#flyer` — a `<picture>` wrapping the current product render — FLIP-animates (GSAP Flip plugin, vendored) between per-beat slot divs. Flight duration 0.8s `power3.inOut`, slight arc via `y` overshoot, 6° rotation through flight; the world crossfade fires at flight midpoint. **Scroll-turn illusion:** V1/V2/V3 are the same chakli at three angles; during B1 scroll and B1→B2 flight, `#flyer` swaps src at opacity-dip midpoints (80ms dip to 0.85) so the chakli appears to rotate as you scroll. Reduced motion: `#flyer` doesn't exist; each section shows its own static image.

**B0 — LOADER: draw, then slam.**
Roast world. Haldi spiral line draws via dashoffset (existing engine — real asset progress, 1.2s floor). Mono: `batch no. NNNN — loading fresh`. At 100%: line does a 120ms tension snap (scale 1 → 1.03 → 1), then the **turmeric world slams in** as a circle clip-wipe expanding from the spiral's center (clip-path `circle(0% → 150%)`, 450ms `power4.in`) while the hero chakli (V1) **scale-punches** `1.6 → 1` with the back-out overshoot and a 10-particle crumb burst (crunch-burst.svg re-used at 40% scale, haldi-tinted). The spiral simultaneously morphs coiled→unwound and drops to its hero-rule position.
Pin: none (loader). Mobile: identical. Reduced motion: progress bar as static spiral at 60%, crossfade to hero.

**B1 — HERO: the anchor, enormous, breathing.**
Turmeric world. V1 at ~85vh, center-right, in `#flyer`'s first slot. **Suspended-crumb parallax:** 3 layers of cutout crumbs/sesame (harvested from V1's own margins + ingredient renders) at depths 0.25/0.5/0.85, responding to scroll scrub AND pointer (±14px, lerped). Type sandwich survives at 2×: "Made by" (XXL, behind chakli) / "one pair of hands." (XXL, in front) — per-word rises, chili echo strokes. Unwound line = horizon rule beneath. Chakli idles: ±4px drift, 5° slow rotation, angle-swap illusion begins mid-scroll (V1→V2). Steam deleted — steam was quiet; suspended particles are the new life.
Pin: 120vh scrub for the sandwich separation (front line rises faster than back line — depth). Mobile: parallax depths halved, pointer response off. Reduced: flat composition, all text visible.

**B2 — 4:30 AM: dark kitchen, counting clock.**
World tweens to Roast as the chakli flies off-screen upward (it "goes back to the kitchen"). V25 (press, dramatic) full-bleed with a slow 1.06→1 scale scrub. Mono timestamp counts `00:00 → 04:30` tied to scrub progress (top-left, milk ink, tabular). One XXL line in milk: "Before the city wakes, the press does." — per-word rise, haldi echo.
Pin: 180vh. Mobile: 120vh. Reduced: static image, timestamp pre-set at 04:30.

**B3 — MANIFESTO: statements as walls.**
Chili world. v3's underlined paragraph is dead. Now each negation is its own viewport-filling XXL wall in milk: "No factory." / "No palm oil." / "No preservatives." / "No shortcuts." Each statement clip-rises in per-word while the previous scales to 0.9 and dims to 35%, stacking upward like posters slapped over posters. Final wall: "Rice, dal, butter, spice — and a woman who **refuses** to cut corners." with "refuses" as the chapter's single scale-punch word in ghee. The traveling line snakes beneath the stack at 25% opacity (snaking state), keeping the spine visible.
Pin: 320vh, scrub. Mobile: 220vh, statements stack vertically with shorter travel. Reduced: all five statements laid out as a static poster column.

**B4 — NOTHING TO HIDE: the dial spins with momentum.**
Ghee world. Existing dial (dial.svg + circled line state) centered on V4 (new top-down chakli on ghee). **Momentum spin:** dial rotation driven by scroll velocity through a lerp (rotation += (target − rotation) × 0.08), so fast scrolls fling it and it eases out — the instrument now has mass. Pills (`no palm oil` · `no preservatives` · `no artificial colour` · `no machines`) snap level via counter-rotation; the active pill inverts roast-fill/ghee-text with a 1.06 pop. Above the dial, the counting-zeros line runs: `0 palm oil · 0 preservatives · 0 colours · 0 machines` counting down to zeros as pills activate. Detail sentence holds top-right in mono.
Pin: 250vh. Mobile: no rotation — pills highlight sequentially, zeros still count. Reduced: static dial fallback ring, all pills visible.

**B5 — EVERYTHING INSIDE: sticker-explosion.**
Leaf world. The signature beat, now loud: chakli center (V4 reused, flown in by `#flyer`), and on scrub **nine ingredient cutouts (V7–V15) fly OUT** to leader-line positions (leader-lines.svg geometry stands, extended to 9) — but each cutout now lands with **sticker energy**: crisp drop shadow popping from 0 to a chunky offset shadow (`filter: drop-shadow(10px 14px 0 rgba(18,11,7,.28))` — solid offset, not blur: the SPYLT sticker read), a 1.15→1 landing squash, and its mono label typing on (`sesame — toasted same morning`). Warm ingredient tones (dal, butter, flour, chili) detonate against green. Leader lines draw inner→outer in milk.
Pin: 320vh. Mobile: flat-lay fallback image + static labels below 768px (unchanged rule). Reduced: pre-composed exploded static.

**B6 — THE CRUNCH: the hard cut.**
The site's percussive frame. Background **hard-cuts** to Chili on a single frame (the only non-tweened flip — the visual "snap"), V16 (shatter macro, shards mid-flight) punches in at `scale 1.3 → 1` (280ms), crunch-burst.svg fires at the break point scaled 2× v1, and the whole viewport wrapper shakes ±6px for 180ms (transform only). XXL milk: "You'll hear it before you taste it."
Pin: 120vh — short and violent, then release. Mobile: shake ±3px. Reduced: static image + text, burst at 12% static, background change instant (which it is anyway).

**B7 — THE SHELF: three worlds, side-swiped.**
Pinned 300vh converting to horizontal travel (−200vw). Three full-viewport SKU panels, each a complete world: **Bhajani Chakli / Turmeric** (V1 + floating pack V21), **Poha Chivda / Chili** (V5 + V22), **Lahya Crunch Bites / Leaf** (V6 + V23). Panel anatomy: SKU hero floating at 70vh with 2 crumb parallax layers, floating pack at 30% scale lower-left, SKU name XXL with echo strokes, mono ledger (`₹ ___ · 250 g · this week's batch`), "Add" pill → WhatsApp deep link with prefilled SKU message. Panel snap points; the fixed world layers sync to the active panel. Mono note persists: `orders close friday · fried saturday · shipped monday`. Order pill docks in chrome from here on.
Mobile: native `scroll-snap` horizontal carousel, no pin, world color updates on snap via IntersectionObserver. Reduced: three stacked full-width panels, each statically colored.

**B8 — SEEMA: the exhale.**
Cream world, arriving via the page's slowest dissolve (900ms). Everything quiets ON PURPOSE — after five saturated worlds this beat lands like silence in a loud song, and it is the only place cream exists. V24 portrait (warm, dignified, window light — NOT neon) at 70vh; blur 16px→0 on scrub (rack focus kept, gentler). "Seema" in Fraunces at Display L (not XXL — she doesn't shout), `सीमा` beneath. Three mono ledger lines stagger up: `making chakli since the '90s` / `taught by her mother` / `still tastes every single batch`. No echo strokes in this beat. No parallax. Grain overlay allowed to read here.
Pin: 150vh. Mobile: 100vh. Reduced: sharp portrait, lines visible.

**B9 — FRESH BY BATCH: the bigger slap.**
Turmeric world returns (re-energize after the exhale). Dial reused, relabeled: `fried saturday` · `packed same day` · `no warehouse` · `21-day window`, spinning around the floating chakli pack (V21). At scrub end the chili stamp (stamp.svg) **slaps at 2× v1 scale**: `scale 2.2 → 1`, rotate −10°→−4°, back-out, 1-frame viewport nudge (±3px), 6 crumb particles kicked from under it. `#stamp-batch-no` odometer-spins to the live batch number; "orders close friday" date renders from the live date math. This remains the site's only stamp and one of its two overshoots (B0 punch is the other).
Pin: 220vh. Mobile: 150vh, stamp scale 1.8→1. Reduced: stamp pre-applied, live numbers still live (they're just text).

**B10 — THE COIL: home on roast.**
Roast world. The traveling line performs its finale: circled → recoiled morph, the spiral settling beside the wordmark as the seal, drawn in haldi and glowing faintly (single soft shadow pulse, 3s loop, the site's only idle loop). XXL milk: "From Seema's kitchen to yours." Haldi CTA pill, big — min-height 64px, `Order this week's batch` → WhatsApp — with roast text (9.3:1). Mono contact/IG line. Footer-as-poster, nothing else.
Reduced: seal simply present, no pulse.

**Global rules:** `prefers-reduced-motion` → no pins, no flips-in-motion, each section statically colored with end-states composed (the page still reads as a color-flip site because the sections carry their worlds). Mobile: pins −40%, parallax halved, tap targets ≥44px, echo clones reduced to 1. Exactly two overshoots on the site (B0, B9). Exactly one hard cut (B6). Exactly one cream beat (B8).

---

## 4. IMAGERY DIRECTION — the campaign contract + SHOT LIST v2

### 4.1 Campaign consistency rules (every render must match the anchor)

Engine: `node "d:/Claude Code Projects/Cmaa/scripts/genimage.js"` backend **openai** (gpt-image-2), key in `.env`. Sizes: portrait 1024×1536 (2:3), square 1024×1024, landscape 1536×1024 (3:2). Portrait heroes are composed with generous margin so both 4:5 and 1:1 crops survive.

**Style preamble — prepend to EVERY prompt verbatim, substituting the world color:**
> "Commercial food advertising photography, hyper-detailed and appetizing. Seamless saturated studio background in flat [WORLD: deep turmeric yellow #F7AE00 / chili red #C8301B / deep leaf green #0E7B3D / warm cream], with a subtle darker vignette at the bottom edge and slightly lighter glow upper-left. Punchy directional studio key light from upper left, crisp defined edges, crisp soft-edged drop shadow. Subject floating in mid-air unless stated. Small crumbs and particles suspended around the subject. No props, no surfaces, no hands, no text unless stated. Colors rich and saturated but food tones natural and true."

Acceptance bar (review every render against V1): background saturation matches the world hex family (±10% sat), one key light upper-left, shadow crisp not diffuse, suspended particles present on all floating shots, food color natural (no orange-shifted dal, no neon curry leaves). Re-roll anything that reads matte, flat-lit, or surface-bound. Portrait V24 is the single exception to the saturation rule.

**The pack (real label description for prompts — gpt-image-2 renders text well):**
> "matte kraft stand-up pouch with a large cream paper label; at the top 'Seema' in a warm elegant serif logotype with small Devanagari 'सीमा' beneath it; below, the product name '[SKU NAME]' in bold serif; a thin horizontal rule; a small neat ingredient list block in monospace type; a small circular batch-stamp area lower right; label edges cleanly printed, kraft texture visible around it"

### 4.2 SHOT LIST v2 — 28 shots (V1 locked, 27 to render)

Q = quality tier (high for heroes/portrait/process/packs-in-hand; medium for cutouts/textures/floating packs).

| # | Shot | Prompt core (after preamble) | Size | Q |
|---|---|---|---|---|
| V1 | Chakli hero A | **LOCKED — `renders/test/oai-chakli-hero.png`. Do not re-render. The campaign anchor.** | 2:3 | — |
| V2 | Chakli hero B (+turn) | Same single golden-brown bhajani chakli spiral with black sesame seeds as the campaign hero, floating on turmeric, but rotated roughly 25 degrees clockwise and tilted slightly away from camera, same suspended crumbs and sesame, same light | 2:3 | high |
| V3 | Chakli hero C (−turn) | Same chakli rotated roughly 25 degrees counter-clockwise, tilted slightly toward camera, same suspended crumbs, same light | 2:3 | high |
| V4 | Chakli top-down (dial) | Single bhajani chakli photographed dead top-down, perfectly centered on ghee-yellow #FFC933 field, even spiral geometry, crisp circular drop shadow ring, few suspended crumbs at frame edges, generous margin | 1:1 | high |
| V5 | Chivda floating hero | Poha chivda exploding gently in mid-air on chili red: thin golden poha flakes, roasted peanuts, fried curry leaves, one raisin, all frozen floating in a loose cloud, sharpest flakes center frame, crisp shadows | 2:3 | high |
| V6 | Lahya floating hero | Lahya crunch bites (spiced popped-jowar clusters, golden with red-spice dusting) floating in a loose cluster on deep leaf green, spice dust suspended around them, crisp shadows | 2:3 | high |
| V7 | Cutout: rice flour | A small airborne puff-pile of fine white rice flour, floating centered on turmeric, flour dust suspended around it | 1:1 | med |
| V8 | Cutout: chana dal | A loose floating scatter of golden chana dal, a dozen lentils suspended mid-air centered on turmeric | 1:1 | med |
| V9 | Cutout: sesame | A floating pinch of mixed white and black sesame seeds, suspended mid-air centered on turmeric | 1:1 | med |
| V10 | Cutout: cumin | Cumin seeds floating in a loose swirl, centered on leaf green | 1:1 | med |
| V11 | Cutout: ajwain | Ajwain seeds floating in a small cloud, centered on leaf green | 1:1 | med |
| V12 | Cutout: butter | A single curl of pale golden butter mid-melt at one edge, floating centered on chili red, tiny droplets suspended | 1:1 | med |
| V13 | Cutout: curry leaves | Three crisp fried curry leaves floating fanned mid-air, centered on chili red | 1:1 | med |
| V14 | Cutout: dried chili | Two dried red chilies crossed mid-air with a few chili flakes suspended, centered on turmeric | 1:1 | med |
| V15 | Cutout: peanuts | Roasted peanuts floating in a loose cluster, skins split, centered on leaf green | 1:1 | med |
| V16 | Crunch shatter macro | Extreme macro of a bhajani chakli snapping in half mid-air on chili red: the break point razor sharp showing airy crumb structure, shards and crumbs blasting outward frozen, high drama | 3:2 | high |
| V17 | Chivda mid-air pour | Poha chivda pouring downward from top of frame, frozen: a column of flakes, peanuts and curry leaves cascading on turmeric, individual pieces sharp | 2:3 | high |
| V18 | Chakli pack-in-hand | An Indian woman's hands (mid-40s, small bangles, no manicure) holding [PACK — chakli label 'Bhajani Chakli'] toward camera on turmeric, pack sharp, hands slightly soft, two chaklis floating beside the pack | 2:3 | high |
| V19 | Chivda pack-in-hand | Same hands, same framing, [PACK — 'Poha Chivda'] on chili red, chivda flakes suspended around | 2:3 | high |
| V20 | Lahya pack-in-hand | Same hands, same framing, [PACK — 'Lahya Crunch Bites'] on leaf green, popped jowar bites suspended around | 2:3 | high |
| V21 | Chakli pack floating | [PACK — 'Bhajani Chakli'] floating upright mid-air on turmeric, tilted 8 degrees, two chaklis and crumbs orbiting it, crisp shadow below | 2:3 | med |
| V22 | Chivda pack floating | [PACK — 'Poha Chivda'] floating on chili red, chivda pieces orbiting, same treatment | 2:3 | med |
| V23 | Lahya pack floating | [PACK — 'Lahya Crunch Bites'] floating on leaf green, bites orbiting, same treatment | 2:3 | med |
| V24 | Seema portrait | **OVERRIDE preamble background/light:** Environmental portrait, Indian mother mid-50s in a simple cotton saree at her home kitchen counter beside a steel kadhai, warm soft window light on her face, honest gentle almost-smile, hands dusted with flour, defocused warm kitchen behind, dignified and real, muted warm grade — NOT a studio color background, NOT saturated, no floating elements | 2:3 | high |
| V25 | The press (4:30 AM) | Dramatic low-key shot: hands pressing chakli dough through a brass chakli press into hot oil in a steel kadhai, dawn-dark kitchen, one hard warm light raking from the left, oil shimmer, steam, deep roast-brown shadows swallowing the edges of frame | 3:2 | high |
| V26 | Kadhai frying | Chaklis frying in a steel kadhai shot from a steep angle, oil bubbles ringing the golden spirals, brass skimmer entering frame, dramatic single hard warm light, dark surround, steam and oil droplets frozen | 3:2 | high |
| V27 | Texture: chakli ridge | Extreme macro filling the whole frame with chakli ridge texture: fried besan bumps, embedded sesame seeds, satin oil sheen, warm golden tones, shallow focus band | 1:1 | med |
| V28 | Texture: chivda heap | Extreme macro filling the frame with a chivda heap: layered poha flakes, split peanuts, curry leaf edges, turmeric-gold dust, shallow focus | 1:1 | med |

Consistency levers: identical hands description V18–V20; [PACK — …] expands to the full label description from §4.1 with the SKU name swapped; V2/V3 prompts open with "same single golden-brown bhajani chakli as the campaign hero" and should be generated referencing V1's look; cutouts V7–V15 keep subjects centered with ≥25% margin all around (they will be cut out — background choice still matters because gpt-image-2 bakes rim light/shadow color from it, and the listed world matches each ingredient's B5 landing zone contrast). Review batch order: V2/V3 first (hardest match), then SKU heroes, then everything else.

---

## 5. PERFORMANCE + BUILD DELTAS (vs v3 §6–7)

**Stack deltas:** add GSAP **Flip** plugin (vendored, ~12KB gz) for the flight engine; optional Observer if the B4 momentum lerp wants velocity events (else read `ScrollTrigger.getVelocity()` — prefer that, zero bytes). JS budget raises to **≤140KB gz** total. Everything else in the v3 stack stands (GSAP core + ScrollTrigger + Lenis, vanilla, no build step).

**World-flip cost rule:** flips are opacity crossfades between two fixed solid-gradient layers (compositor-only). Never animate `background-color` on scroll-scrub; never put the world gradient on elements that repaint. The B6 hard cut is a class toggle (free).

**Type cost rule:** echo stroke clones are plain text nodes transformed on the compositor — but 3 layers × 16rem glyphs is real raster area; cap echo clones at 2 desktop / 1 mobile, and `will-change: transform` only while animating. Word-mask spans: split once at load, cache, never re-split on resize below a 200px width delta.

**Image pipeline deltas:** same sharp → AVIF/WebP/JPEG ladder, but saturated flat backgrounds compress beautifully — expect smaller files than v3's textured cream; hold AVIF q50. Ingredient cutouts now need alpha: run background removal (flat saturated bg makes chroma-keying trivial — sharp + flood-fill threshold, or manual) → WebP/AVIF with alpha at 600/300w. `#flyer` preloads V1+V2+V3 (the turn illusion must never pop). LCP asset is V1: `fetchpriority="high"`, preload, target < 2.0s. New page-weight ceiling: **< 5MB full-scroll, < 1.3MB before first interaction** (three extra hero-grade renders on the shelf).

**Layout-shift guard:** the flight engine swaps `#flyer` between absolutely-positioned slots — slots reserve space with `aspect-ratio`, so CLS stays < 0.05 even as the flyer moves.

**Reduced-motion is now a first-class art direction,** not a fallback: statically-colored sections, end-state compositions, live batch numbers still live. QA must screenshot BOTH modes per beat.

**Build order (6-agent map holds):** UI agent re-cuts `tokens.css` to §1 (worlds + inks + gradient recipe) and §2 type scale first — every other agent consumes tokens. SVG agent: extend leader-lines to 9, re-tint contract is automatic (`currentColor` everywhere — v3 discipline pays off now). Animation agent owns flight engine + world crossfade + momentum dial; morph engine untouched. Render batch per §4.2 runs in parallel from minute zero. Frontend assembles; playwright walkthrough at 8170–8199 per house rules; iterate ≥2 rounds against V1 as the taste anchor.

---
*Questions route to the creative director. Everything unspecified defaults to: louder in color and scale, quieter in words.*
