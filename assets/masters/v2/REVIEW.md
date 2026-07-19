# v4 render batch — REVIEW (render agent, 2026-07-19)

Anchor for every verdict: `renders/test/oai-chakli-hero.png` (= `v1.png` here). Bar per brief §4.1:
background saturation in world hex family, one key light upper-left, crisp shadow, suspended
particles on floating shots, natural food color.

**Batch stats:** 28 API images total (3 SKU heroes pre-brief + 25 from shot list), 0 failures,
0 re-rolls needed. Budget used 28 of ~35. Engine: gpt-image-2 via `scripts/genimage.js`,
prompts recorded in `assets/masters/shots-v2.json`.

**Derivatives (all done):** `site/img/v2/<id>-1600.webp`, `<id>-800.webp`, `<id>-1600.jpg`
for the 20 full shots; `<id>-600.webp` for cutouts v7–v15. Contact sheet:
`assets/masters/v2/contact-sheet.html` (serve repo root, open `/assets/masters/v2/contact-sheet.html`).
Verified in playwright: 0 broken images, set reads as one campaign.

## Per-shot verdicts

| id | shot | verdict | notes |
|---|---|---|---|
| v1 | Chakli hero A | **LOCKED — campaign anchor** | Copied from `renders/test/oai-chakli-hero.png`. |
| v1-alt | Chakli hero regen | campaign-grade (alternate) | My regen; anchor stays primary per brief. Usable as extra angle/B7 texture. |
| v2 | Chakli hero B (+turn) | **campaign-grade** | Clockwise turn, tilted away. Reads as same chakli as v1 — turn illusion works. |
| v3 | Chakli hero C (−turn) | **campaign-grade** | Counter-clockwise, tilted toward. Slightly smoother rope than v1; within family. |
| v4 | Top-down dial | campaign-grade, note | Perfect circular geometry for the dial. Field reads deep turmeric rather than ghee `#FFC933`; more coil turns than the anchor's 4. Retry-later candidate if the ghee world clash shows in B4. |
| v5 | Chivda floating hero | **campaign-grade** | Loud burst on chili red. Flakes read slightly cornflake-thick; v17 has the more authentic poha read if art direction wants a swap. |
| v6 | Lahya floating hero | **campaign-grade** | Hero cluster + satellites on leaf green, spice dust suspended. |
| v7–v15 | Ingredient cutouts | **all campaign-grade** | Centered, ≥25% margin, correct anatomy (flour puff, dal, mixed sesame, cumin, ajwain, butter curl w/ drip, 3 fried curry leaves, crossed chilies, split-skin peanuts). Flat saturated bgs = trivial chroma-key for B5 alpha cutouts (downstream task, not done here). |
| v16 | Crunch shatter | campaign-grade, note | Violent snap + crumb blast on chili red. Fracture-face crumb structure only partly visible; optional retry-later for a tighter break-point macro. Works for B6 full-bleed as-is. |
| v17 | Chivda mid-air pour | **campaign-grade, standout** | Best chivda anatomy of the set — thin real poha flakes. |
| v18 | Chakli pack-in-hand | **campaign-grade, standout** | Label rendered clean: Seema serif + सीमा + Bhajani Chakli + mono ingredients + batch stamp. Hands per spec (bangles, no manicure). |
| v19 | Chivda pack-in-hand | **campaign-grade** | Same hands language, chili world. |
| v20 | Lahya pack-in-hand | campaign-grade, note | Green world, clusters floating. AI label lists "Jaggery" (sweet) — conflicts with savory positioning; real label from packaging agent supersedes; illegible at most site sizes. |
| v21 | Chakli pack floating | **campaign-grade** | B7/B9 target. Tilted, chaklis orbiting, crisp under-shadow. |
| v22 | Chivda pack floating | **campaign-grade** | |
| v23 | Lahya pack floating | **campaign-grade** | |
| v24 | Seema portrait | **campaign-grade** | The one saturation exception, correctly muted/warm/dignified. B8 exhale. |
| v25 | The press (4:30 AM) | **campaign-grade, standout** | Brass press extruding into bubbling oil, low-key roast shadows. |
| v26 | Kadhai frying | **campaign-grade** | Steep angle, brass skimmer, oil bubbles ringing spirals. |
| v27 | Texture: chakli ridge | campaign-grade | Slightly warmer/orange vs v1; acceptable macro shift. |
| v28 | Texture: chivda heap | **campaign-grade** | Authentic poha texture tile. |

## Label inconsistencies across pack shots (expected, low priority)
Generative labels differ in detail between v18–v23 (logotype color brown vs red on v20,
ingredient copy varies, stamp text varies). At site scale these read as "same brand";
packaging agent's real `assets/pack/` label art is the source of truth for close-ups.

## Retry-later list (none blocking)
1. v4 on a true ghee `#FFC933` field, 4-turn coil, if B4 compositing shows the clash.
2. v16 with halves barely separated + macro on fracture faces.
3. v5 alternate with thinner poha flakes (or simply crop v17).

## Notes for frontend/animation
- Turn-illusion trio: v1 → v2 → v3 (preload all three for `#flyer`).
- B5 cutouts need alpha extraction (chroma-key against their flat worlds) — not part of this
  batch; flat bgs chosen to make it trivial. 600w flat webps shipped meanwhile.
- `-1600` derivatives are capped at native master width (1024/1536 px, no upscaling) — the
  filename is the slot contract, matching the existing `site/img/` convention.
