#!/usr/bin/env node
// Seema brand image pipeline — multi-backend.
//   node scripts/genimage.js one "<prompt>" <out> [--ar 4:5] [--backend pollinations|nanobanana] [--seed N] [--model M]
//   node scripts/genimage.js batch <shots.json> <outdir> [--backend pollinations] [--variants 3]
// shots.json: [{ id, prompt, ar }]
// Backends:
//   pollinations — free, no key (FLUX). Draft everything here.
//   nanobanana   — Gemini API (needs billing-enabled GEMINI_API_KEY in .env). Finals.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; }
const AR_SIZES = { '4:5': [1024, 1280], '1:1': [1024, 1024], '16:9': [1280, 720], '9:16': [720, 1280], '3:2': [1200, 800], '2:3': [800, 1200], '21:9': [1344, 576] };

async function genPollinations(prompt, ar, seed) {
  const [w, h] = AR_SIZES[ar] || AR_SIZES['4:5'];
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
    `?width=${w}&height=${h}&model=flux&nologo=true&seed=${seed}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('pollinations HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

async function genNanoBanana(prompt, ar, _seed, model) {
  const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  const KEY = (env.match(/GEMINI_API_KEY=(.+)/) || [])[1]?.trim();
  if (!KEY) throw new Error('no GEMINI_API_KEY in .env');
  const m = model || 'nano-banana-pro-preview';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: ar } } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('nanobanana HTTP ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
  const img = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData);
  if (!img) throw new Error('no image in response');
  return Buffer.from(img.inlineData.data, 'base64');
}

const BACKENDS = { pollinations: genPollinations, nanobanana: genNanoBanana };

(async () => {
  const mode = process.argv[2];
  const backend = arg('backend', 'pollinations');
  const gen = BACKENDS[backend];
  if (!gen) { console.error('unknown backend', backend); process.exit(1); }

  if (mode === 'one') {
    const [, , , prompt, out] = process.argv;
    const buf = await gen(prompt, arg('ar', '4:5'), Number(arg('seed', 7)), arg('model'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    console.log('OK', out, Math.round(buf.length / 1024) + 'KB', backend);
  } else if (mode === 'batch') {
    const [, , , shotsFile, outdir] = process.argv;
    const shots = JSON.parse(fs.readFileSync(shotsFile, 'utf8'));
    const variants = Number(arg('variants', 1));
    fs.mkdirSync(outdir, { recursive: true });
    let ok = 0, fail = 0;
    for (const s of shots) {
      for (let v = 0; v < variants; v++) {
        const seed = 100 + v * 37 + (s.seedOffset || 0);
        const out = path.join(outdir, `${s.id}${variants > 1 ? '-v' + (v + 1) : ''}.jpg`);
        try {
          const buf = await gen(s.prompt, s.ar || '4:5', seed, arg('model'));
          fs.writeFileSync(out, buf);
          ok++; console.log('OK ', s.id, 'v' + (v + 1), Math.round(buf.length / 1024) + 'KB');
        } catch (e) { fail++; console.log('ERR', s.id, 'v' + (v + 1), String(e).slice(0, 120)); }
        await new Promise(r => setTimeout(r, 1200)); // be polite to free API
      }
    }
    console.log(`done: ${ok} ok, ${fail} failed -> ${outdir}`);
  } else {
    console.error('usage: genimage.js one|batch ...'); process.exit(1);
  }
})();
