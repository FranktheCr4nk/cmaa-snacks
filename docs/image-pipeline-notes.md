# Seema v3 — Image Pipeline Notes (field-tested 2026-07-18)

Backend routing decided by live testing (`renders/test/`):

## What free FLUX (Pollinations) does EXCELLENTLY — use for ~80% of shots
- Ingredient flat-lays (brass bowls, slate, curry leaves) — magazine grade first try
- Mood/scene shots, dark-wood surfaces, dramatic window light
- Texture close-ups, scattered-spice styling, piles of snacks in bowls/plates
- The whole non-product-anatomy shot list: kitchen scenes, hands-at-work, steam, packaging-in-context

**Winning style formula (append to every prompt):**
"…on dark walnut / dark slate, soft directional window light from the left, deep warm
shadows, shallow depth of field, editorial food magazine style, photorealistic, rich
amber and umber tones" — consistent world across all test renders.

**Texture formula for fried snacks:** "churro-like deeply RIDGED extruded dough,
fried matte golden-brown, black sesame seeds, crispy, savory, NOT glazed, NOT sweet".

## The one hard class: exact chakli anatomy (tight 4-turn flat spiral) in macro
FLUX text-to-image reliably fails the coil (draws rings/twists/pastry instead).
Escalation path, in order:
1. "cinnamon roll spiral" framing gets the geometry, "churro" gets the texture —
   combined prompts get ~70% there; usable for mid-size images, not hero macros.
2. FLUX Kontext img2img with a real chakli reference photo
   (archive/2026-07-pre-pivot/assets/images/chakli-2.jpg is live on Pages) —
   endpoint returned 500 in tests; retry later, may be transient/gated.
3. **Manual free Nano Banana in AI Studio web** (aistudio.google.com, free daily
   interactive quota): paste the hero-macro prompts, save results. 3-5 shots only.
4. **Final pass: Nano Banana Pro API** when billing enabled (~$0.13/img):
   re-render all hero shots + anything inconsistent, using the SAME prompts +
   real reference images (Nano Banana accepts reference input natively).

## Mechanics
- `scripts/genimage.js one|batch` — backends: `pollinations` (free) | `nanobanana`.
- Batch mode reads a shots.json `[{id, prompt, ar}]`, supports `--variants N`.
- Pollinations: ~1.2s politeness delay between calls; seeds are reproducible.
- GEMINI_API_KEY lives in git-ignored `.env`; valid but free-tier (image quota 0
  until billing is enabled).
