# Scroll-Storytelling Research Brief — Cmaa Flagship Page

**Purpose:** Ground the Cmaa (Seema's Chakli & Chivda) site rebuild in what award-level scroll-storytelling actually does, beat by beat — then prescribe a concrete 10-beat storyboard implementable with vanilla CSS scroll-driven animations + IntersectionObserver fallbacks (no GSAP dependency required; GSAP/Lenis noted where they materially help).

**Research date:** 2026-07-10 (web-verified this session). Sources: Awwwards SOTD/SOTY + annual-award pages, agency case studies (Locomotive, Immersive Garden, Baggy Studio, blubolt), teardowns (Web Wizards, webgpu.com, Dropmark, Landbook), technique references (Josh Comeau, WebKit blog, web.dev, MDN, GSAP docs, scroll-driven-animations.style), usability research (NN/g), pattern taxonomies (Codrops, Smashing, Lovable).

Confidence labels: **[S]** = sourced from a written breakdown/case study; **[K]** = direct knowledge of the live site / widely-documented behavior, not line-verified this session.

---

## 1. Benchmark scroll storyboards (15 sites)

### 1.1 MANA Yerba Mate — manayerbamate.com (Awwwards Site of the Year 2023, E-commerce) [S]
The single most relevant benchmark: a Shopify snack/drink store that scored **9.20/10 for Animations/Transitions** while keeping checkout to **4 clicks**.
- **Stack:** Three.js (3D can renders), GSAP (scroll orchestration), Lottie (2D sequences), layered parallax — all inside Shopify. Design: Louis Paquet; FE: Michaël Garcia.
- **Storyboard:** Preloader → 3D can slider hero. On scroll, the **can rotates, flips, and travels** through the page as a persistent protagonist. Each flavor is **its own graphical world** — distinct palette, illustrated characters, drifting stars, floating fruit. Sections hand off via **"bubbly" organic blob/clip transitions** (also used between pages). Lottie compositions fire in tight sequence with scroll position ("closer to a motion reel than a product page"). Footer hides a Super Mario-style platformer game.
- **Lesson:** "Funtional" — visual maximalism on the story layer, zero friction on the buy layer. Scroll position is a *conductor*; the product never leaves the stage.

### 1.2 Scout Motors — scoutmotors.com (Awwwards **E-commerce Site of the Year 2025**, by Locomotive) [S]
The current e-commerce SOTY, and the clearest proof of the smooth-scroll lineage (Locomotive built both this and the Locomotive Scroll / Lenis smoothing that half the award scene runs on). Category tags: **E-Commerce, Promotional Animation, Storytelling.**
- **Storyboard:** launch site for a reborn off-road brand (Traveler SUV, Terra Truck). Full-viewport cinematic scenes; the **vehicle is the persistent protagonist**, revealed and re-framed through pinned, lerped scroll beats; adventure/landscape backdrops cross-fade; spec and story copy time in against scrubbed vehicle motion; the configurator/reserve flow is the calm commerce layer at the end.
- **Lesson:** at the very top of the jury pile in 2025, the winning grammar is *cinematic product-as-hero on buttery lerped scroll* — exactly the grammar below, applied to a pouch instead of a truck. Smoothness (Lenis-class scroll) is doing a lot of the "premium" work.

### 1.3 Apple product pages (AirPods Pro / iPhone) [S]
The canonical premium scrub. 3D product renders **rotate as you scroll; specs fade in with perfect timing**; full-viewport pinned scenes reveal one message at a time.
- **Technique (documented in CSS-Tricks + multiple teardowns):** a pre-rendered **image sequence drawn to `<canvas>`**, frame index mapped to scroll progress via `requestAnimationFrame` — a flip-book scrubbed by scroll. Canvas hardware-accelerates and avoids `<img>`-swap flashes.
- **Lesson:** restraint + performance obsession = premium. One idea per viewport; animation carries the narrative; palette stays quiet so the product pops.

### 1.4 Daylight Computer — daylightcomputer.com (Awwwards SOTD, basement.studio, 2024) [S/K]
Single amber accent (#FF9D00) on paper-white; scroll walks you through "a more caring computer": device hero, then **light-quality storytelling** — sun/amber-glow gradients animate in at the blue-light section, blueprint-style illustrations draw themselves, device screen content swaps in a pinned frame.
- **Lesson:** one accent color + one physical metaphor (sunlight) sustained across the whole scroll = coherence that feels designed, not decorated.

### 1.5 Oatly — oatly.com [S]
**Infinite sideways scroll:** the homepage scrolls horizontally and loops forever, stuffed with witty self-aware copy, micro-interactions and "unexpected moments."
- **Lesson:** interaction *is* the brand voice. But per NN/g, never make a vertical gesture drive horizontal movement — Oatly gets away with it as a deliberate rule-break; do **not** copy this on a conversion page.

### 1.6 Fishwife — eatfishwife.com (Dropmark "Reverse Engineered" teardown) [S]
- **Storyboard:** Each SKU owns a **vibrant hue used as full-bleed section background**; scrolling the homepage = moving through color-blocked flavor rooms. Recoleta serif + Albert Sans. Motion is *small but constant*: product-card tilts on hover, subtle JS "wiggles" on hand-drawn SVG illustrations, deep retro drop-shadows on buttons. Illustration is the hero; photography grounds it.
- **Lesson:** you don't need WebGL — a **color-per-flavor system + SVG micro-wiggle** reads as craft. "Illustrated packaging sets the tone, photography grounds it, UI/UX carries that energy into motion."

### 1.7 Graza — graza.co (Baggy Studio + Gander) [S]
Two SKUs only — **Drizzle** (finishing) and **Sizzle** (cooking) — squeeze-bottle olive oil. Hand-drawn marker illustrations (literally drawn on sticky notes), neon green/lime on peachy-sand, whimsical copy, marquee strips, sticker-like elements that drift on scroll; a "Glog" education layer; bundles/subscriptions handled with straight, boring, fast e-commerce UI.
- **Lesson:** analog texture + editorial copy does storytelling work animation alone can't; with only 2 SKUs the site leans on *story and character*, and keeps the shop layer conventional.

### 1.8 WatchHouse — watchhouse.com (Awwwards Honorable Mention; blubolt Shopify build) [S]
"Modern Coffee" premium system: **horizontally scrolling parallax coffee profiles on the homepage**, parallax banners, progressive loading states as storytelling, strong typography/photo/space discipline on Shopify 2.0.
- **Lesson:** a *restrained* premium scroll vocabulary (parallax bands + horizontal product shelf) is enough for a heritage-craft brand — closest tonal match to a premium Indian snacks brand going upscale.

### 1.9 Crescente Sicily — Awwwards nominee, Oct 2024 (Sicilian pastry e-commerce, WooCommerce) [S]
Tags: Animation, Icons, **Infinite marquee text scroll, Parallax, Video, 3D.** Animated banner text, parallax food photography, mobile-first product pages.
- **Lesson:** heritage food + parallax + marquee type is an established, jury-scoring pattern on a normal store platform (WooCommerce — no exotic stack needed).

### 1.10 Monolith — monolith.nyc (Awwwards SOTD Jan 2025, e-commerce) [S]
Luxury furniture store; two colors only (#ECEAE5 / #28282A). Praise centered on **micro-interactions and transitions** (Animations 7.80): preloader, refined PDP reveals, gallery layout.
- **Lesson:** at the luxury end, *fewer, better* transitions score — perceived quality lives in easing and detail, not spectacle.

### 1.11 Lusion — lusion.co (multi-award WebGL studio) [S]
- **Storyboard:** one fixed fullscreen WebGL canvas; as you scroll, the **3D scene itself morphs** to reveal project content; DOM elements' bounding boxes are read every rAF and 3D objects positioned to match.
- **Engineering insight (their own writeup):** native scrolling runs off the rAF thread, so WebGL layered on native scroll desyncs by 1–2 frames; they drive scroll themselves to keep canvas and DOM locked — exactly the problem **Lenis** was built to solve.
- **Lesson:** if a persistent canvas product scene is ever added, scroll must be lerped/driven on the same rAF loop, or it will always look slightly wrong.

### 1.12 Obys — obys.agency [S/K]
Self-described "typography-driven design laboratory": each scroll step detonates a fresh composition of outsized glyphs, color floods, kinetic type, fluid hover, custom cursor, and **scroll-triggered transitions that transform text and imagery as you browse**; chapter-like page transitions on Locomotive smooth scroll.
- **Lesson:** typography itself can be the animated protagonist between product moments — cheap to implement (transform-only text masking/slides), huge perceived craft.

### 1.13 Immersive Garden — immersive-g.com [S/K]
Paris studio; case-study site built on **pinned fullscreen scenes that morph on scroll**, layered depth, and Locomotive-smooth scrolling — the reference for "each scroll beat is a fully art-directed frame that dissolves into the next."
- **Lesson:** the premium feel is *frames, not a scrolling page* — design each beat as a poster and animate the seams.

### 1.14 Bruno Simon / Diagram-style product scenes [K]
Bruno Simon's portfolio (drive a 3D toy car through the content) and Diagram-style 3D landing scenes define the "product as toy in a world" pole. Famously delightful, famously heavy.
- **Lesson:** borrow the *spirit* (playable product world) at ~1% of the cost — a spritesheet/scrub of the pouch, a draggable ingredient, one physics-ish wiggle — without a WebGL runtime.

### 1.15 Aura Bora — aurabora.com + WMF coffee scrollytelling [S/K]
Two proven food/drink patterns worth naming: **Aura Bora** = illustrated fantasy world per flavor, animated illustrated scenes, playful hover, strong per-SKU color-blocking (same "flavor = world" system as Fishwife/Mana). **WMF** coffee scrollytelling = each scroll step reveals one part of the coffee-making process in 3D (bean → grind → cup) as one continuous pinned sequence.
- **Lesson:** "flavor = world" and "process-as-scroll (how it's made)" are the two most transferable story spines for food; for chakli, the recipe/craft *is* the natural pinned sequence.

---

## 2. The recurring premium scroll patterns (the canon)

1. **Pinned scrub scene ("scrollytelling core")** — section pins (`position: sticky` / GSAP ScrollTrigger `pin`), inner animation progress = scroll progress (`scrub`). Apple, Mana, WMF, Scout. CSS: `animation-timeline: view()` (or `scroll()`) on a tall sticky wrapper + `animation-range`.
2. **Image-sequence / spritesheet scrub** — pre-rendered frames of product rotating/exploding, drawn to canvas (Apple) or stepped `background-position` on a spritesheet with `steps(n)`, frame = scroll %. Cheapest way to fake "3D product rotates on scroll."
3. **Flavor-world color swap** — full-bleed background color cross-fades per section, each SKU owning a hue (Fishwife, Mana, Aura Bora). Implementation: animate a fixed backdrop layer's `background-color`, or cross-fade stacked fixed layers with `opacity`, triggered per section (IO toggling `data-flavor` on `<body>`).
4. **Persistent protagonist (shared-element product)** — the pack travels between sections: shrinks/slides from hero into the next scene, later lands in the shop card. Mana's can, Scout's vehicle. Technique: **FLIP** (First-Last-Invert-Play) for the layout hand-off; or a **named `view-timeline` + `timeline-scope`** so one scrubbed element drives another across the DOM without a JS scroll listener.
5. **Multi-layer parallax depth** — 2–4 layers (backdrop texture / ingredients / product / foreground type) translate at different rates. WatchHouse, Crescente, Immersive Garden. CSS: per-layer `animation-timeline: view()` translateY at different amplitudes; or Locomotive Scroll's `data-scroll-speed`.
6. **Mask / clip-path reveal** — text/imagery revealed through `clip-path: inset()` wipes, `circle()` blooms, or SVG mask; "bubbly" organic transitions between sections (Mana). `clip-path` animates on the compositor with `@property`-registered custom props.
7. **Kinetic type: line-mask rise + marquee** — headlines split into lines, each rising out of an `overflow: hidden` mask with stagger (Obys); infinite marquee strips for brand chatter (Graza, Crescente).
8. **Draw-on SVG line art** — `stroke-dasharray`/`stroke-dashoffset` scrubbed by scroll so illustrations (the chakli spiral!) literally draw themselves. Daylight-style blueprint feel; perfect for hand-drawn brand marks.
9. **Ingredient fly-in choreography** — physical items (peanuts, curry leaves, chilies) enter on staggered bezier-ish paths, settling around the pack; on scrub they drift apart/together ("exploded recipe" shot). Mana's floating fruit.
10. **Micro-interaction floor** — hover tilts, SVG wiggles, deep tactile button shadows, cursor details (Fishwife, Monolith). Not scroll-driven, but juries and users read these as the line between template and craft.

---

## 3. Pacing rules (distilled from NN/g research + award-site practice)

- **Beat length:** a pinned scrub scene should consume **100–200vh of scroll runway** (1–2 viewport-heights of gesture per idea). Under 100vh feels like a glitch; over ~300vh per single idea causes "scroll fatigue" (NN/g scrolljacking research: too-slow scroll rates are the #1 complaint).
- **Beat count before shop:** award food/D2C pages run **4–7 story beats** between hero and product grid. Mana: hero → benefits → flavors → rituals → shop. Do not exceed ~8 before purchasable product appears.
- **Buy exits everywhere:** hero carries a CTA; nav stays sticky (NN/g: sticky nav is the mandatory escape hatch from any pinned section); a persistent "Shop" affordance means the story never holds the wallet hostage. Mana proves story-maximalism and 4-click checkout coexist.
- **Alternate pinned and free:** never chain two scroll-jacked/pinned beats back-to-back; interleave normally-scrolling sections so users re-anchor (NN/g: scrolljacks are acceptable when short, below the fold, adjacent to normal sections).
- **Text and scrub don't mix:** put reading copy in *static* frames; scrub only imagery/graphics. NN/g's worst-usability cases were animated text the user had to read while controlling the animation.
- **Animate once, then persist:** entrance reveals fire the first time only and stay (NN/g "element persistence") — re-triggering on every scroll-up reads as gimmick.
- **Trigger animations ≤ 600–800ms** with ~60–100ms stagger steps; NN/g animation guidance: brief and unobtrusive; long entrance delays measurably annoy repeat visitors.
- **Mobile:** shorten runways ~40%, kill pinned scrub where it fights momentum scrolling, never alter scroll direction, and honor `prefers-reduced-motion` (WCAG) with a fully static art-directed fallback.

## 4. Packaging as protagonist

- **The pack is the main character, on stage in ≥70% of beats** (Mana's can, Apple's device, Scout's truck). It rotates, travels, scales — never merely pictured; it *performs*.
- **Pack colors art-direct the page:** the label palette becomes section backgrounds (Fishwife) — shelf-to-screen continuity makes the physical product feel iconic.
- **Label details become UI:** label typography, borders, stamps and illustrations reappear as dividers, bullets, marquee content (Cmaa's collectible label system is purpose-built for this).
- **The exploded-pack beat:** pack opens / ingredients orbit it — communicates recipe + generosity in one scene (Mana fruit, WMF process).
- **The landing:** the hero pack should visibly *become* the buyable card in the shop section (FLIP hand-off) — the story literally deposits the product into your hand.

## 5. Perfect vs. janky — the physics of premium

1. **Compositor-only:** animate **`transform` and `opacity` exclusively** (web.dev). Any animated `top/left/width/height/box-shadow` or heavy `filter` stutters on mid phones; layout properties are why cheap sites feel cheap. `clip-path` is compositor-friendly in modern engines.
2. **Scrub vs. trigger — choose deliberately.** *Scrub* (progress-linked) for spatial/product motion — user feels in control. *Trigger* (fire-once on entry) for text/UI reveals. GSAP wisdom: `scrub: 0.5–1` (lerped catch-up) feels expensive; `scrub: true` (hard-locked) feels mechanical. **CSS scroll-timelines are hard-locked** — that lerped luxe catch-up is the one thing GSAP/Lenis buy you that CSS can't.
3. **Easing is the tell.** Triggered motion: ease-out (fast in, soft settle), e.g. `cubic-bezier(0.16, 1, 0.3, 1)`; scrubbed keyframes stay near-linear (the finger *is* the easing), easing only inside sub-movements; the new `linear()` timing function enables spring-like scrubs. Default `ease` everywhere = template smell.
4. **FLIP for layout changes:** any element changing place in the layout (pack → card, grid reflow) must be FLIPped (measure First + Last, Invert with `transform`, Play) so the browser only animates transforms.
5. **One rAF loop — the #1 cause of scroll jank.** WebGL/canvas + native scroll desyncs 1–2 frames (Lusion). With Lenis + GSAP the fix is concrete: **`autoRaf: false` on Lenis and add `lenis.raf` to `gsap.ticker`**, so scroll updates and animations run in the same execution block; a **lerp ≈ 0.08** is the accepted sweet spot for smooth-yet-responsive. Locomotive Scroll is now a thin ~9.4 kB wrapper around Lenis. **Pure CSS scroll-timelines dodge this entirely** — they run on the compositor thread, smoother than JS scroll listeners *by construction* (and Safari 26.4 added a *threaded* implementation).
6. **No scroll listeners doing style writes.** IntersectionObserver for triggers; CSS timelines (or a single rAF-throttled, lerped loop) for scrubs. `scroll` event + style mutation = guaranteed jank.
7. **Pin correctness:** reserve pin space (padding equal to runway), create pins in document order, recalc on resize/late-loading images (ScrollTrigger's `refresh()` lesson applies to hand-rolled sticky too — set explicit media dimensions so layout doesn't shift mid-scroll).
8. **`will-change` sparingly**, applied just before animation and removed after; blanket `will-change: transform` on everything backfires (layer explosion, GPU-memory blowout on mid-range phones).
9. **`animation-fill-mode: backwards`** on view-timeline entrances so elements hold their start state before entering range (the #1 CSS scroll-timeline gotcha — without it, elements flash unstyled at their end state before the range begins, especially with `animation-range: contain`).
10. **Respect and fallback:** `@media (prefers-reduced-motion)` static variants; feature-detect `@supports (animation-timeline: view())` and fall back to IO-triggered classes. **Support status (July 2026):** Chrome/Edge since Chrome 115 (Jul 2023); **Safari since 26 (Sep 2025)**, threaded in 26.4, progress-accuracy bugs near 0%/100% fixed in **26.5 (Jun 2026)**; **Firefox 152 (Jun 2026) still behind a flag in stable** (on by default in Nightly; a named Interop 2026 priority). Global support ≈ **82.6%** — high, but *not yet Baseline* because Firefox stable hasn't flipped the switch, so the IO fallback is mandatory, not optional.

---

## 6. Cmaa flagship page — the 10-beat scroll storyboard

Spine: **"From Seema's kitchen to your table"** — pack hero → hands/craft → ingredients → flavor worlds → ritual → shop. Vanilla CSS scroll-timeline first; IO fallback classes; GSAP/Lenis noted where they'd materially help. Real pack photography throughout (per project rule — no CSS placeholders).

**Beat 1 — Pack hero (0–100vh, free scroll).**
Cmaa pouch large center on label-cream background, name in brand type, one line ("Hand-rolled in small batches"), CTA "Shop the batch" + sticky nav from frame one. Idle micro-motion: 4s CSS float/shadow loop on the pack; steam curl as a draw-on SVG. *Technique:* plain CSS keyframes, no scroll dependency. First paint must be complete and beautiful with zero JS.

**Beat 2 — Hero hand-off (100–200vh, scrubbed).**
On first scroll, headline lines exit upward through overflow masks; the pouch **scales down and glides** toward a corner anchor while the background begins its first color swap toward turmeric-gold. *Technique:* sticky 200vh wrapper; pack `transform: scale/translate` on `animation-timeline: scroll()` with `animation-range` over this stretch; text via view-timeline exit range. Register the pack's timeline as a named `view-timeline` (`timeline-scope`) so Beat 9 can reuse its progress. *GSAP note:* a `scrub: 0.7` timeline adds the lerped luxe CSS can't.

**Beat 3 — The spiral draws itself (200–350vh, pinned scrub).**
Black-on-gold frame: a giant chakli spiral **draws on** stroke-by-stroke (`stroke-dashoffset` scrubbed), morphing conceptually from brand mark → actual chakli photo (cross-fade at 80%). Copy (static, one line at a time, IO-triggered): "One spiral. Thirty years of practice." *Technique:* `view-timeline` on the sticky section driving dashoffset + photo opacity. The signature "SVG-animates" moment.

**Beat 4 — Hands & craft (350–450vh, free scroll).**
Editorial interlude, normal scrolling (pacing rule: never two pins in a row). Full-bleed photo of Seema's hands pressing dough; line-masked pull-quote rises once (IO, persist). Parallax: photo layer translateY −10%, caption +5% via `view()` timelines. *Technique:* two-layer parallax + one-shot text reveal, 500ms, ease-out.

**Beat 5 — The exploded recipe (450–650vh, pinned scrub).**
Chivda pack pinned center; as you scrub, **ingredients fly in** on staggered paths — poha flakes, peanuts, curry leaves, chilies — settling in orbit; labels fade in near each (static text). Scrolling on, ingredients converge *into* the pack (reverse translate), which seals with a subtle scale-pop. *Technique:* each ingredient PNG/SVG on its own `view()` timeline with offset `animation-range` slices for stagger; transforms only. *GSAP note:* MotionPath gives true curved trajectories; CSS approximates with 2-keyframe arcs via nested wrappers (X on parent, Y on child).

**Beat 6 — Flavor worlds (650–950vh, color-swap chapters, free scroll).**
One 100vh chapter per SKU (Chakli / Chivda / gift tin): full-bleed **background color swaps** to that label's palette as the chapter enters (fixed backdrop cross-fade), pack photo slides in with 3-layer parallax, the label's border pattern runs as a slow marquee strip, "Add to cart" chip present *in the story*. *Technique:* IO toggles `data-flavor` on `<body>`; backdrop transitions via opacity cross-fade of stacked color layers; marquee = CSS translate loop. The Fishwife/Mana pattern and the commercial heart of the page.

**Beat 7 — Pack turn (950–1100vh, pinned scrub).**
The "3D" moment without WebGL: a **24–36 frame photographed turntable sequence** of the pouch scrubbed by scroll — pack rotates to show the back label (story, ingredients, Seema's signature). *Technique:* spritesheet + stepped `background-position` keyframes (`steps(n)`) on a view-timeline; JS-canvas IO fallback. *GSAP note:* canvas + `scrub` is the battle-tested Apple approach if CSS stepping shows banding.

**Beat 8 — Ritual & proof (1100–1200vh, free scroll).**
Chai-time tableau: cup + bowl of chivda, steam SVGs drawing on; horizontal snap-scroll shelf of press quotes/reviews/UGC (`scroll-snap-type: x mandatory` — WatchHouse's shelf pattern; explicit swipe affordance, never hijacking the vertical gesture). One-shot reveals only.

**Beat 9 — The landing: story becomes shop (1200–1300vh, FLIP).**
As the shop grid enters, the traveling pack from Beat 2's corner anchor **FLIPs into its product-card slot** — the protagonist lands in the buyable grid. Grid cards stagger up 60ms apart, once. Bundles/subscription UI deliberately conventional (Graza rule). *Technique:* FLIP in ~20 lines of JS (measure First/Last, Invert with transform, Play); cards via view-timeline entrances with `animation-fill-mode: backwards`.

**Beat 10 — Footer as gift (1300vh+).**
Collectible-label wall (the matchbox/label system) as a hoverable mosaic; oversized wordmark rises through a mask; a tiny easter egg (click a matchbox label → it strikes, brief flame SVG) — the Mana footer-game principle at 1% cost. Newsletter + care info.

**Engineering shell:** every scrubbed beat inside `@supports (animation-timeline: view())`; else IO adds `.in-view` classes driving 400–600ms transform/opacity transitions (story still lands, just triggered not scrubbed). `prefers-reduced-motion`: all scrubs off, art-directed static frames. Mobile: Beats 3/5/7 runways cut ~40%, Beat 7 may degrade to a 3-frame cross-fade. **Where libraries materially help:** Lenis (lerped scroll feel + future WebGL sync; remember `autoRaf:false` + `gsap.ticker` if paired with GSAP), GSAP ScrollTrigger (scrub smoothing, pin robustness across browser quirks, MotionPath) — but nothing in the storyboard *requires* them, and Firefox-stable's flagged support means the IO fallback ships regardless.

---

## 7. Sources

- Awwwards: [Mana Yerba Mate](https://www.awwwards.com/sites/mana-yerba-mate) · [Scout Motors (SOTD)](https://www.awwwards.com/sites/scout-motors) · [E-commerce Site of the Year 2025](https://www.awwwards.com/annual-awards-2025/ecommerce-site-of-the-year) · [Monolith](https://www.awwwards.com/sites/monolith) · [Crescente Sicily](https://www.awwwards.com/sites/crescente-sicily) · [Daylight](https://www.awwwards.com/sites/daylight) · [WatchHouse](https://www.awwwards.com/sites/watchhouse-3) · [Food & Drink winners](https://www.awwwards.com/websites/food-drink/) · [E-commerce winners](https://www.awwwards.com/websites/winner_category_ecommerce/)
- Case studies / teardowns: [Locomotive — Scout Motors](https://locomotive.ca/en/work/scout-motors) · [webgpu.com — MANA animated Shopify store](https://www.webgpu.com/showcase/mana-yerba-mate-animated-shopify-store/) · [Web Wizards #024 MANA](https://webwizards.substack.com/p/024-mana-yerba-mate) · [Dropmark — Reverse Engineered: Fishwife](https://www.dropmark.com/blog/reverse-engineered-fishwife/) · [Baggy Studio — Graza](https://baggy.studio/projects/graza) · [blubolt — WatchHouse](https://blubolt.com/case-study/watchhouse) · [Immersive Garden](https://immersive-g.com/) · [Obys Agency](https://obys.agency/) · [Lapa Ninja — Graza](https://www.lapa.ninja/post/graza/)
- Technique: [Josh Comeau — Scroll-Driven Animations](https://www.joshwcomeau.com/animation/scroll-driven-animations/) · [WebKit — A guide to Scroll-Driven Animations with just CSS](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/) · [MDN — Scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [Smashing — Intro to CSS Scroll-Driven Animations](https://www.smashingmagazine.com/2024/12/introduction-css-scroll-driven-animations/) · [scroll-driven-animations.style](https://scroll-driven-animations.style/) · [CSS-Tricks — Apple-style scroll sequences](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/) · [web.dev — animations guide](https://web.dev/articles/animations-guide) · [GSAP — ScrollTrigger common mistakes](https://gsap.com/resources/st-mistakes/) · [aerotwist — FLIP Your Animations](https://aerotwist.com/blog/flip-your-animations/) · [Lenis (darkroom.engineering)](https://github.com/darkroomengineering/lenis) · [DevDreaming — Lenis + GSAP RAF sync (autoRaf/ticker, lerp 0.08)](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) · [Lusion WebGL Scroll Sync](https://github.com/lusionltd/WebGL-Scroll-Sync)
- Usability & pacing: [NN/g — Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/) · [NN/g — Scroll-triggered text animations delay users](https://www.nngroup.com/articles/scroll-animations/) · [NN/g — Animation duration](https://www.nngroup.com/articles/animation-duration/) · [Lovable — 8 scrolling patterns](https://lovable.dev/guides/scrolling-designs-patterns-when-to-use) · [Metabole — Scrollytelling guide](https://metabole.studio/en/blog/scrollytelling)
