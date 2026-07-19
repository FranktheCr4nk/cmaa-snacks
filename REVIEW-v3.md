# REVIEW v3 — regeneration + integration pass (2026-07-19)

Scope: the auditor's flagged image slots on the UNWIND v2 LOUD site, regenerated with
gpt-image-2 (`scripts/genimage.js`, backend openai, quality high) against the locked
style anchor `renders/test/oai-chakli-hero.png` and the product-anatomy law, plus the
packaging program's winning D1 LOUD COLOR-BLOCK renders swapped into every pack slot.

**Budget: 8 of 22 gpt-image-2 calls used** (6 first takes + 2 re-rolls). The two pack
regens the audit listed (v22/v23 kraft pouches) were superseded by step 3's D1 swap —
the D1 renders already fix both flagged problems (wrong orbit anatomy, sweet/label-law
violations) at zero generation cost, so that budget was left unspent.

Prompt provenance: `assets/masters/shots-v3.json` (6), `assets/masters/shots-v3-reroll.json` (2).
Masters: `assets/masters/v3/` (rejected takes in `assets/masters/v3/rejects/`).
Derivatives: alpha-keyed `-1600.webp`/`-800.webp` + flat `-1600.jpg` at the site's
existing filenames in `site/img/v2/` — `index.html` untouched except by pixels.

---

## Per-slot verdicts

### v4 — B4 dial centre + B5 exploded centre + B1 turn frame 4 · UPGRADE (re-roll take 2)
- **Before:** ~6 rope-like coil turns with open gaps between them, beaded texture, hollow
  read; deep-turmeric field clashing with B4's ghee world. Highest-multiplicity offender.
- **After:** dead top-down vinyl-record coil, ONE continuous thumb-thick ridged rope winding
  to a tucked-tail centre, turns touching with no gaps, black+white sesame in the ridges,
  ghee-gold field. Take 1 (rejected, kept in `rejects/v4-take1.jpg`) had touching turns but
  ~6 thin rings reading as concentric circles; take 2 fixed coil density.
- **On-site:** B4 dial reads like an actual dial; B5 exploded view now orbits a believable
  chakli; verified desktop `b4-dial`, `b5-mid`, mobile `b4-dial`.

### v5 — B7 shelf card 2 hero, poha chivda burst · UPGRADE (take 1)
- **Before:** thick curled cornflake anatomy — the exact image behind the user's
  "we need to SHOW poha chivda" complaint. No sev, no mustard seeds.
- **After:** paper-thin flattened-rice flakes with translucent ragged edges, split-skin
  peanuts, fried curry leaves, raisins, thin sev strands, chana dal, black mustard seeds,
  frozen mid-burst on chili red. Every flake reads as pressed rice.
- **On-site:** chivda card verified desktop (`chivda-fixcheck`) — burst + D1 red pouch
  on the live chili world, no seams.

### v16 — B6 crunch full-bleed, the snap · UPGRADE (re-roll take 2)
- **Before:** two separate spiral cookies, each with its own spiral centre; fracture faces
  invisible; crumbly-soft texture. Full-screen anatomy miss.
- **After:** ONE four-turn spiral snapped along a single break line — spiral centre stays on
  the left half, right half is only broken concentric arc segments, matching fracture faces
  with airy fried crumb, violent crumb blast from the break. Take 1 (rejected, in `rejects/`)
  still gave each half its own curl centre.
- **On-site:** verified desktop `b6-cut` and mobile `b6-cut` ("You'll hear it before you
  taste it." beat) — reads as one snapped chakli at full bleed.

### v2 — B1 hero flyer turn frame 2 · UPGRADE (take 1)
- **Before:** open turns with visible gaps and a hollow centre — the scroll-turn illusion
  morphed between a tight chakli and a loose open spiral on the site's first beat.
- **After:** tight touching four-and-a-bit-turn coil to a filled centre, rotated clockwise
  and tilted away per the turn choreography, same key light and crumb energy as the anchor.
- **On-site:** verified desktop `b1-turn2` — flyer frame blends seamlessly into the live
  haldi gradient mid-flight.

### v3 — B1 hero flyer turn frame 3 · UPGRADE (take 1)
- **Before:** same drift as v2 plus a loose flying tail.
- **After:** tight touching coil, filled centre, no tail, rotated counter-clockwise and
  tilted toward camera — the near-frontal frame of the turn sequence.
- **On-site:** verified in the B1 scrub sequence.

### v21 — B7 shelf card 1 pack + B9 dial pack · UPGRADE (D1 swap, no gen)
- **Before:** kraft pouch with small label; batch-stamp region needed inpainting.
- **After:** packaging round-2 winner `p-d1-chakli.png` — the turmeric pouch that IS the
  world color, cream Fraunces logotype + सीमा, die-cut window showing a correct 4-turn
  chakli, two chaklis orbiting. Pack, site and campaign are now one system.
- **On-site:** B7 chakli card (`b7-p1`) and the B9 "Fresh is a schedule" dial (desktop `b9`,
  mobile `b9` with the FRESH batch stamp overlay) — the strongest single upgrade on the site.

### v22 — B7 shelf card 2 pack · UPGRADE (D1 swap, no gen)
- **Before:** orbiting product was amorphous boondi-like blobs (zero poha flakes) and the
  label listed 'Sugar' — both audit flags.
- **After:** `p-d1-chivda-r2.png` — chili-red pouch, correct thin-poha window (the packaging
  agent's anatomy re-roll), orbiting thin flakes + peanut + curry leaf, savory-only label
  ("no palm oil · no preservatives", 250 g).
- **On-site:** verified desktop `chivda-fixcheck`.

### v23 — B7 shelf card 3 pack · UPGRADE (D1 swap, no gen)
- **Before:** label read as a sweet ladoo recipe ('Jaggery, Almond, Cardamom…') with a stray
  TM mark — off the savory mother-made positioning.
- **After:** `p-d1-lahya.png` — leaf-green pouch, correct popped-jowar cluster window with
  visible peanuts, savory label, orbiting clusters.
- **On-site:** B7 lahya card verified desktop + mobile.

### v6 — B7 shelf card 3 hero · UPGRADE (optional polish, take 1)
- **Before:** campaign energy right but zero visible peanuts; clusters read like makhana.
- **After:** popped-jowar pearl clusters with split-skin roasted peanuts clearly embedded in
  every cluster, curry-leaf flecks, loose pearls + spice dust suspended, leaf-green world.
- **On-site:** verified desktop `b6-hold`/`probe-073` and mobile shelf pass.

---

## Pipeline notes (what changed vs the fix2 pass)

- **Matting:** rembg `isnet-general-use` fails on the D1 color-matched pouches (pouch IS the
  bg color — body keyed away) and left v5/v6 semi-transparent. Switched those slots to
  **`birefnet-general`** (rembg downloads ~1 GB weights once), which segments by structure
  and cut every pouch and burst cleanly. isnet retained for plain chakli subjects (v2/v3/v4).
- **Floater rescue:** birefnet drops small orbiting pieces. Added a union pass in
  `fix3/key.js`: alpha = max(matte, smoothstep(dist(pixel, blur40(master)), 30, 70)) — i.e.
  distance from the *local* background estimate. Two rejected designs are documented in the
  script history: absolute distance from the border-median (caught the vignette corner — the
  visible rectangle seam first seen on the chivda card) and chromaticity distance (caught the
  desaturated upper-left glow, corners went fully opaque). The blur-diff version measures
  0.0–2.0 mean stray alpha in bg corners/strips on all five rescued slots.
- **Consistency check:** the live site's existing cutouts are subject-only (the old anchor
  webp also drops its suspended crumbs), so subject-only keying on v2/v3/v4 matches the
  established compositing look; the jpg fallbacks keep the full master with bg baked in.
- Working scripts: scratchpad `fix3/` (`matte.py`, `key.js`, `verify.js`), staging in
  `fix3/keyed/`, world-gradient check composites in `fix3/keyed-check/`, before-files backed
  up in `fix3/old-site/`, walkthrough screenshots in `fix3/shots-desktop/` + `fix3/shots-mobile/`.

## Verification

Served on :8176, playwright walkthroughs at 1440×900 and 390×844 through every affected
beat (B1 hero + turn frames, B4 dial, B5 exploded, B6 snap, B7 all three shelf cards
including a stepwise scrub to settle the pinned shelf, B9 dial). Every screenshot read and
compared against the before-files; one regression found and fixed during the pass (stray
partial alpha from the first rescue design showing the master's vignette as a faint
rectangle behind the v5 burst — re-keyed, re-measured, re-shot clean). No layout shifts:
all filenames, dimensions and aspect ratios match the old derivatives exactly.
