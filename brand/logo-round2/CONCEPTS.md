# Seema — Logo Round 2

14 gpt-image-2 renders (12 concepts + 2 re-rolls, quality high, 1:1), reviewed against the brief:
flat vector, roast `#2E1F16` on cream `#F6EDDD`, chakli-coil integration, bilingual सीमा, honesty ring.
Top 3 rebuilt as production SVGs in `svg/` (outlined Fraunces + IBM Plex Mono + Plex Sans Devanagari
glyphs, computed Archimedean spirals, `currentColor` primaries + cream-on-roast reversed).

## Concepts

| # | Direction | One-liner | Verdict |
|---|-----------|-----------|---------|
| l1 | (a) S-coil wordmark | Fraunces-style serif "Seema", the S's top arm curls into a 3-turn chakli coil | **WINNER — Concept A.** Ownable, warm, reads at 24px |
| l2 | (a) coil accent | Gold coil floats over the "ee" like a diacritic | Charming but coil crowds the e; keep as motif idea |
| l3 | (b) seal roundel | Letterpress stamp: SEEMA / HOMEMADE MAHARASHTRA ring + bold center coil | Solid stamp energy; edged out by l11's honesty ring |
| l4 | (b) wax seal (re-rolled) | Cream coil + SEEMA · GHARGUTI impressed in a roast wax blob | Re-roll fixed the arc typography; good packaging accent |
| l5 | (c) stacked bilingual | "Seema" over सीमा with a tiny coil divider | Very good; superseded by l11 which carries the bilingual job |
| l6 | (c) Devanagari-first | सीमा large on roast tile, shirorekha extends and curls into a coil; SEEMA caps below | **Strongest alternate (4th).** Culturally rooted, gorgeous idea worth a future round |
| l7 | (d) sign-painter script | One-stroke brush "Seema", swash underline ends in a coil | Lively but swash is heavy at left; script clashes with Fraunces system |
| l8 | (d) sign-painter badge | Cream brush script on roast panel + gold HOMEMADE SNACKS | Handsome retro shop-board; same script clash |
| l9 | (e) unwind lockup | Monoline coil unrolls into the baseline rule under a light "Seema" | **WINNER — Concept B.** Literally the site's UNWIND gesture in one continuous line |
| l10 | (e) coil + wordmark | Cap-height coil glyph beside "Seema" | Clean but the most generic of the twelve |
| l11 | (f) honesty badge | Coil / Seema / सीमा inside a ring; NO PALM OIL · NO PRESERVATIVES; dotted border | **WINNER — Concept C.** The packaging/trust seal; bilingual + honesty claims in one mark |
| l12 | (f) reversed badge (re-rolled) | Gold coil + cream Seema on scalloped roast disc, honesty ring | Re-roll fixed the broken spiral; loud bottle-cap variant of C |

Kills/re-rolls: original l4 (wobbly GHARGUTI arc) and l12 (detached spiral fragment) were re-rolled
with corrected prompts — both fixed. Budget: 14/14 images.

## Ranked verdict

1. **A — `seema-logo-a.svg` (from l1).** The primary logo. The brand's own Fraunces display wordmark
   with the S's top arm replaced by a piped 2.5-turn chakli coil — the product baked into the name.
   Use everywhere the brand speaks first: site header, bags, invoices.
2. **B — `seema-logo-b.svg` (from l9).** The story lockup. One continuous monoline: a chakli coil
   unwinds into the baseline under the wordmark — the same gesture as the UNWIND site scroll. Use for
   hero moments, email footers, tape, ribbon.
3. **C — `seema-logo-c.svg` (from l11).** The honesty seal. Coil + Seema + सीमा ringed by
   NO PALM OIL · NO PRESERVATIVES in Plex Mono caps, dotted border. Use on packaging fronts,
   stickers, PDP trust row.
4. l6 — Devanagari-first tile: strongest unused idea; revisit if the brand wants a Marathi-forward mark.

## SVG construction notes

- Wordmark glyphs: Fraunces display instance (opsz 144 / wght 540 / SOFT 50 / WONK 1), outlined —
  font-independent. सीमा: IBM Plex Sans Devanagari Medium, outlined. Ring caps: IBM Plex Mono Medium, outlined.
- Spirals are computed Archimedean paths (`r = a + bθ`, 4° sampling), not autotraced — the A splice
  clips the S's top arm and phase-locks the coil's outer end into the cut stroke.
- Primaries use `currentColor` (default roast via root `color`), so they inherit ink color in situ.
  Reversed files are cream-on-roast with the panel/disc baked in.
- Generator lives in the session scratchpad (`gen-logos.js` + `logo-lib.js` + `glyphs*.json`);
  regenerate rather than hand-editing path data.
