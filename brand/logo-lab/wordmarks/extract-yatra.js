// One-time extraction: needs npm i opentype.js + Yatra One TTF (Google Fonts, OFL)
// in the working directory. Output yatra-glyphs.json is committed next to generate.js.
// Extract चमा outlines from Yatra One (OFL) as path data, baseline y=0, y-down, fs=1000.
const ot = require('opentype.js'), fs = require('fs');
const buf = fs.readFileSync('yatra-one.ttf');
const font = ot.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const out = { unitsPerEm: font.unitsPerEm, fontSize: 1000, note: 'Yatra One (OFL). y-down, baseline y=0.', chars: {} };
let pen = 0;
for (const ch of ['च','म','ा']) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, 1000);
  const bb = p.getBoundingBox();
  out.chars[ch] = { name: g.name, advance: g.advanceWidth * 1000 / font.unitsPerEm, d: p.toPathData(2), bbox: [bb.x1, bb.y1, bb.x2, bb.y2].map(n => +n.toFixed(1)) };
  console.log(ch, g.name, 'adv', out.chars[ch].advance.toFixed(1), 'bbox', out.chars[ch].bbox.join(','));
}
// combined string path for reference
const sp = font.getPath('चमा', 0, 0, 1000);
const sbb = sp.getBoundingBox();
out.string = { d: sp.toPathData(2), bbox: [sbb.x1, sbb.y1, sbb.x2, sbb.y2].map(n => +n.toFixed(1)), advance: 0 };
out.string.advance = ['च','म','ा'].reduce((s, c) => s + out.chars[c].advance, 0);
console.log('string bbox', out.string.bbox.join(','), 'advance', out.string.advance);
// headline scan: histogram of y for dvmAA path (stem+head) to find headline band
const aa = font.charToGlyph('ा').getPath(0, 0, 1000);
const ys = [];
aa.commands.forEach(c => { ['y', 'y1', 'y2'].forEach(k => { if (c[k] !== undefined) ys.push(+c[k].toFixed(1)); }); });
console.log('dvmAA y values (sorted uniq):', [...new Set(ys)].sort((a, b) => a - b).join(', '));
fs.mkdirSync('d:/Claude Code Projects/Cmaa/brand/logo-lab/wordmarks', { recursive: true });
fs.writeFileSync('d:/Claude Code Projects/Cmaa/brand/logo-lab/wordmarks/yatra-glyphs.json', JSON.stringify(out));
console.log('written yatra-glyphs.json');
