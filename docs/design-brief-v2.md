# Cmaa Demos v2 — Shared Design Brief (deep-craft rebuild round)

This brief encodes the research round of July 2026. Every demo rebuild MUST follow it.
The user's critique of v1: "generic images, packaging doesn't look nice, product should speak
for itself, want real SVG animation and content." This round fixes that.

## The 10 rules (from D2C research: Graza, Fishwife, Omsom, Fly By Jing, Paper Boat, Bombay Sweet Shop, Subko)

1. **Loud pack, calm canvas.** Maximalist packaging/illustration on generous single-color fields with real whitespace. Never busy-on-busy.
2. **One ownable color system per demo**, saturated and specific, committed hard. 2 brand colors + 1 neutral field + flavor-keyed accents.
3. **Type tension = expensive.** One characterful display + one quiet workhorse. Devanagari is a hero script, not a translation caption.
4. **Illustration personifies; photography authenticates.** Run both. Photos ALWAYS art-directed (duotone/grade/mask/frame) — never plopped raw.
5. **Copy is a design material.** Dense, funny, specific. Never "Premium quality. Handcrafted with love."
6. **The story is structural.** Seema aaji is the hero of the page, not an About link.
7. **Cultural reference must be SPECIFIC.** Steel dabba, matchbox label, Paithani zari grid, Warli frieze, Irani café gingham, sorya press — never generic paisley clipart.
8. **One signature motion per site, repeated with discipline.** Not ten effects. Max one "loud" technique per viewport.
9. **Flavor = world.** Each SKU gets its own spot color / illustration hook.
10. **Zero tonal leaks.** Style every control — buttons, cart drawer, badges — in-voice. No default-looking UI anywhere.

## Packaging v2 assets (USE THESE — they are the product speaking for itself)

`assets/packaging/v2/`:
- `pouch-bhajani.svg`, `pouch-butter.svg`, `pouch-masala.svg`, `pouch-poha.svg` — full collectible label chassis: Paithani strap, chakli-spiral roundel, sign-painter Devanagari name, ribbon, cusped-arch die-cut window with the REAL product photo warm-graded inside, truth strip ("…— बस्स."), batch footer.
- `tin-gift.svg` — black Diwali gift tin, ivory wrap band, "दिवाळी फराळ" lockup.
- `matchbox-*.svg` — 4 collectible mini-labels (sunburst, emblem, slogan strip).
- SKU colors: bhajani `#7A1E2B`, butter `#C98A3B`, masala `#B3372B`, poha `#5F7A4A`, gold `#C8922A`, ink `#33241A`, cream `#F6EDDB`.

**CRITICAL — inlining:** the SVGs reference photos as `../../images/<file>.jpg` (relative to their own folder).
When you inline an SVG's markup into `demos/<name>/index.html`, rewrite those hrefs to `../../assets/images/<file>.jpg`.
Inline (don't `<img>`) whenever you animate the pack (tilt, float, sheen) or need fonts to inherit.
Duplicate-id warning: each SVG's ids are namespaced by flavor (`win-bhajani` etc.) so multiple packs can coexist on one page; don't inline the same pack twice.

## Real photos (assets/images/) — treatment recipes (NEVER use raw)

- `chakli-1.jpg` (dark bowl, moody) → hero-grade: `filter:saturate(1.3) contrast(1.08)`, crop tight.
- `chakli-2.jpg`, `murukku.jpg` (golden spirals) → best product close-ups.
- `chivda-2.jpg` (orange, spicy-looking) = masala; `chivda-1.jpg` (pale poha) = poha.
- `cooking.jpg` (woman at stove, dim) → use as duotone/color-wash only (multiply the theme color over grayscale), or masked in an arch with heavy grade. It is NOT acceptable full-bleed raw.
- `faral.jpg` (doily plate) → crop tight into the plate, grade warm, frame as a specimen (scallop/arch mask). Never show the lace tablecloth edges.
- `spices.jpg`, `peanuts.jpg`, `sev.jpg`, `chai.jpg`, `diwali.jpg` → ingredient/mood cutaways, always masked or graded.
- Keep the CC attribution line in each footer.

## Motion cookbook (vanilla, single-file; Chrome/Edge target, progressive enhancement)

Core kit (use `@supports (animation-timeline: view())` wrappers + IntersectionObserver fallback so Firefox sees content, never blank):
1. Scroll-scrubbed reveals: `animation-timeline: view(); animation-range: entry 0% entry 90%;`
2. Sticky scrubbed scene: wrapper `height:300vh; view-timeline:--scene;` + sticky stage; children pick `animation-range` slices.
3. Line-drawing: `pathLength="1"` then dash from 1→0 (draw illustrations in on scroll).
4. Split-text mask rise: per-char spans, `overflow:clip` parent, staggered `calc(var(--i)*35ms)`.
5. Ring badge: `<textPath>` on a circle, rotate whole SVG via CSS.
6. Marquee: duplicated content, `translateX(-50%)` loop, pause on hover, slight rotate.
7. 3D pack tilt on pointer + sheen + detached shadow (gate with `pointer:fine`).
8. Grain: static feTurbulence overlay at ~5-7% opacity, multiply.
9. Steam: dash traveling a wavy path + fade + rise.
10. Outlined→filled text: `-webkit-text-stroke` + color fill scrubbed.
11. Image trail on pointer (max 6-8 recycled nodes) — only where specified.
12. `@property`-registered gradient angle/color animation — max 1-2 visible.
Easing: entrances `cubic-bezier(.2,.8,.2,1)`; springs `linear(0, 1.2 60%, .95 80%, 1)`.
Reduced motion: allowlist pattern (`no-preference` wraps ALL motion), `animation-fill-mode:both` so end-states show.
Perf: infinite loops = transform/opacity only; pause offscreen via IO.

## Feature parity (every demo keeps)

- Sticky nav with cart ("tin") counter; working cart drawer; WhatsApp order CTA flow (demo).
- Shop/product section with the 4 SKUs (use pouch SVGs as product art), prices in ₹.
- Mobile-first responsive; test at 390px and 1440px.
- Footer: photo attributions (Wikimedia CC), "demo — no real checkout".
