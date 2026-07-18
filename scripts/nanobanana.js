#!/usr/bin/env node
// Nano Banana Pro image generation for the Seema brand.
// Usage: node scripts/nanobanana.js "<prompt>" <outfile.png> [aspectRatio] [model]
// Reads GEMINI_API_KEY from .env at repo root.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
const KEY = (env.match(/GEMINI_API_KEY=(.+)/) || [])[1]?.trim();
if (!KEY) { console.error('no GEMINI_API_KEY in .env'); process.exit(1); }

const [, , prompt, outfile, aspect = '4:5', model = 'nano-banana-pro-preview'] = process.argv;
if (!prompt || !outfile) { console.error('usage: node nanobanana.js "<prompt>" <out.png> [aspect] [model]'); process.exit(1); }

(async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } },
  };
  const t0 = Date.now();
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) { console.error('HTTP', r.status, JSON.stringify(j).slice(0, 500)); process.exit(1); }
  const parts = j.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inlineData);
  if (!img) { console.error('no image in response:', JSON.stringify(j).slice(0, 500)); process.exit(1); }
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, Buffer.from(img.inlineData.data, 'base64'));
  const kb = Math.round(fs.statSync(outfile).size / 1024);
  console.log(`OK ${outfile} (${kb}KB, ${img.inlineData.mimeType}, ${((Date.now() - t0) / 1000).toFixed(1)}s, ${model}, ${aspect})`);
})();
