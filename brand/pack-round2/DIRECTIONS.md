# SEEMA PACKAGING — ROUND 2
### Three directions, rendered photoreal against the campaign anchor (`renders/test/oai-chakli-hero.png`). 11 of 16 budgeted gpt-image-2 images used (8 baseline + 1 anatomy re-roll + 2 in-hand). Every accepted render passed two gates: (1) all label text legible and correctly spelled — "Seema", "सीमा", SKU name, "no palm oil · no preservatives", "250 g"; (2) the product in the window obeys the anatomy law.

---

## RANKED VERDICT

### 1st — D1 LOUD COLOR-BLOCK ← the winner
`p-d1-chakli.png` · `p-d1-chivda-r2.png` · `p-d1-lahya.png` · in-hand: `p-d1-chakli-hand.png`, `p-d1-chivda-hand.png`

The pouch **is** the world color — turmeric #F7AE00, chili #C8301B, curry-leaf #0E7B3D — with nothing on it but cream Fraunces type and a die-cut window of the real food. Why it wins:

- **It is literally the site.** The v4 site's chapters are saturated color worlds; this pack drops into any section and reads as the same campaign frame. Pack shots, site heroes, and social crops become one continuous system — zero translation cost.
- **Shelf physics.** A flat slab of one saturated color with giant cream serif type owns its shelf meter; nothing in the Indian snacks aisle (foil gradients, food collages, starbursts) looks like it. The color-matched pouch floating on its own world color is also the single most distinctive photographic device we have.
- **It SHOWS the food.** The window is the only "image" on the pack — the real chakli coil / poha flakes do the appetite work, which was the exact v2 complaint.
- **Text renders proved out.** gpt-image-2 typeset every line correctly on all five D1 renders, including सीमा.

Risk / mitigation: pouch color match to the world hex needs a printed drawdown (matte lamination shifts saturation); the label SVGs lock the artwork so only the substrate needs proofing.

### 2nd — D3 PREMIUM TIN ← keep as the gift/festive tier, not the everyday SKU
`p-d3-hero.png` · `p-d3-trio.png`

Roast-brown #201510 tin, ghee-gold embossed spiral lid, cream band. The hero (lid floating off, chaklis stacked inside) is the most premium object of the eleven renders — this is the Diwali box, the corporate-gifting SKU, the ₹—premium line. It shouldn't replace the pouch: unit economics (tin + emboss) don't fit a ₹150–250 everyday snack, and the roast/gold palette deliberately steps outside the LOUD worlds. Run it as "Seema · The Tin" seasonal.

### 3rd — D2 KRAFT HONEST ← credible, but the most generic of the three
`p-d2-chakli.png` · `p-d2-chivda.png` · `p-d2-lahya.png`

Kraft pouch, cream label, roast serif, handwritten "batch 47 · packed by hand", spiral rubber-stamp in SKU color. Everything renders correctly and the batch-stamp story is the truest to "mother-made" — but kraft + cream label is the default artisan look of every farmers-market brand; on a shelf it recedes exactly where D1 shouts. Keep the **batch stamp + handwritten line** as an idea worth stealing onto D1's back panel.

---

## RENDER LOG (accept/reject)

| file | direction | verdict | notes |
|---|---|---|---|
| p-d1-chakli.png | D1 | ACCEPT | all text correct; window chakli = flat 4-turn ridged coil + sesame |
| p-d1-chivda.png | D1 | **REJECT — cornflakes** | window + floaters were thick corrugated cereal flakes; anatomy-law violation |
| p-d1-chivda-r2.png | D1 | ACCEPT (re-roll) | thin translucent poha flakes, sev, peanuts, raisin, curry leaf, mustard seeds |
| p-d1-lahya.png | D1 | ACCEPT | popped-jowar pearl clusters, peanuts visible, spice dust |
| p-d2-chakli.png | D2 | ACCEPT | handwritten batch line + turmeric spiral stamp rendered clean |
| p-d2-chivda.png | D2 | ACCEPT | window is proper thin poha; chili stamp |
| p-d2-lahya.png | D2 | ACCEPT | green stamp; correct clusters |
| p-d3-hero.png | D3 | ACCEPT | lid-off hero; chaklis stacked inside; gold spiral emboss |
| p-d3-trio.png | D3 | ACCEPT | all three band texts correct; minor: floating chivda flakes slightly thick (small in frame) |
| p-d1-chakli-hand.png | D1 | ACCEPT | mid-40s hands, bangles, pack tack-sharp |
| p-d1-chivda-hand.png | D1 | ACCEPT | window anatomy correct; left floaters slightly thick (acceptable) |

Rejected file `p-d1-chivda.png` is kept in the folder for the record; use `p-d1-chivda-r2.png` everywhere.

---

## PRINT-READY LABEL SVGs — `svg/`

Built for the winning direction (D1), plus the D2 set as a bonus since the tooling existed:

- `label-d1-chakli.svg` / `label-d1-chivda.svg` / `label-d1-lahya.svg` — front panel 130×200 mm, 3 mm bleed, world-color ground, cream #F6EDDD artwork: Seema logotype (Fraunces 144pt SemiBold instance, WONK off), सीमा (IBM Plex Sans Devanagari, properly shaped), two-line SKU lockup auto-fit to width, honesty line + "250 g" + "mother-made · Pune" in IBM Plex Mono, cream keyline ring around the die-cut window. Magenta `#dieline` layer = trim + window cut (do not print).
- `label-d2-*.svg` — same trim size, kraft ground + cream label block, rule, batch line, spiral stamp in SKU color.
- **All text is outlined to paths** (no font dependencies; safe for any prepress RIP). Generated by `svg/makelabels.js` — needs `npm i fontkit` plus 4 Google-Fonts TTFs (Fraunces variable, IBM Plex Mono Regular/Medium, IBM Plex Sans Devanagari Regular) in a `fonts/` dir beside it; re-run `node makelabels.js d1 <outdir>`.

## PROMPT PROVENANCE
`shots-baseline.json` (8), `shots-fix1.json` (chivda anatomy re-roll), `shots-inhand.json` (2). All prompts carry the v4 campaign preamble verbatim plus the product-anatomy law inline; the chivda re-roll adds explicit anti-cornflake negative language — keep that block in every future chivda prompt.
