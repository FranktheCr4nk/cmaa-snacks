# Seema v3 — render review log

---

## Pack-render agent — S6-S10 draft renders (pollinations/FLUX, 2026-07-18)

SKU set confirmed: Bhajani chakli (haldi #DA8A1D), Poha chivda (chili #A93B26), Lahya crunch bites (ghee #F3C877 — replaces the brief's shankarpali placeholder; S8/S18 retitled accordingly).

Pipeline: `scripts/genimage.js batch`, backend pollinations (free FLUX), 2 variants per shot per round, 3 rounds (26 drafts total). Pollinations is text-only — it cannot ingest the packaging agent's label PNGs — so every prompt describes the delivered label art verbatim (large cream paper label on kraft stand-up pouch, small serif "Seema" wordmark with Devanagari beneath, blind-embossed spiral coil motif, large serif SKU name, one thin haldi/chili/ghee accent rule, lower-half mono text block with dotted separator rules) plus the brief's global preamble and the S6/S7/S8 hands-continuity language (mid-40s, worn, small bangles, no manicure).

### Winners (masters in `assets/masters/`, derivatives in `site/img/`)

| Shot | Master | Source draft | Verdict |
|---|---|---|---|
| S6 chakli pack-in-hand | `s6.jpg` | s6r2-v1 | both worn hands toward camera, bangles, unpainted nails, khadi cloth below, window-left light; label block with wordmark + rule + mono text |
| S7 chivda pack-in-hand | `s7.jpg` | s7r3-v1 | same two-hand framing, poha flakes scattered on cloth below, large label text blocks |
| S8 lahya pack-in-hand | `s8.jpg` | s8r2-v1 | same framing, popped-jowar bits on cloth below, matches S6 lighting world closely |
| S9 pack-on-surface (stamp target) | `s9.jpg` | s9r3-v1 | pouch square to camera on a worn terracotta block, brass bowl beside, clean upper-right space for the B9 stamp overlay |
| S10 pack trio | `s10.jpg` | s10r3-v2 | exactly three staggered pouches on terracotta-toned surface, per-pouch accent marks |

Derivatives per master (render agent's sharp settings, reused): `<id>-1600.webp`, `<id>-800.webp` (q78), `<id>-1600.jpg` (q82 mozjpeg). All 15 verified serving and decoding in-browser via playwright contact sheet.

### Rejected rounds (why)

- r1: label mostly missing or printed straight on kraft; young manicured hands (s6-v2, s7-v1); s10-v1 rendered only two pouches.
- r2 partial: s7r2-v2 had a stray object in frame; s9 rounds kept landing on cloth instead of terracotta — fixed in r3 with explicit clay-slab language.
- Contact sheets of every round: scratchpad `pack-sheet-r1.png`, `pack-sheet-r2.png`, `pack-sheet-r3.png`, `pack-derivatives-check.png`; prompt files `pack-shots.json`, `pack-shots-r2.json`, `pack-shots-r3.json`.

### DRAFT-FIDELITY FLAGS — all five marked for the Nano Banana finals pass

These are accepted drafts, not finals. Nano Banana accepts the real label image as reference; re-render S6-S10 with `assets/pack/label-{chakli,chivda,lahya}-flat.png` attached and the same prompts.

1. Label microtext is FLUX-garbled on every shot ("Serumi", "Sleema" etc.) — expected; the finals pass with the label reference fixes this wholesale.
2. S9's brass bowl contains sev-like sticks, not spiral chakli — re-render with chakli reference.
3. S10's center-pack focus is weak (all three pouches near-equal sharpness) and its surface is terracotta-toned cloth, not clay.
4. S7's light reads slightly right-of-frame in the background window; grade matches, but re-check against the S1 anchor in finals.
5. Masters are pollinations-native 1024x1280 / 1280x720, so the 1600w derivatives are gentle upscales (same behavior as the existing pipeline); finals will replace them at native ≥1600w.
