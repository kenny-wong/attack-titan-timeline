// Embeds the source modules (src/route-geometry.js, src/population.js), coastline, motion settings and
// sprites into index.html, as <script id="srcModules"> and the hidden <svg id="popSprites"> after <body>.
// Sprites come from assets/population/sprites.svg (simple placeholders are generated if it is missing).
// Safe to run again. Run: node scripts/embed-src.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const coast = JSON.parse(read('assets/map-designs/frame-island.json')).coastApp;
const motion = exists('assets/population/motion.json') ? JSON.parse(read('assets/population/motion.json')) : null;
const modules = read('src/route-geometry.js') + '\n' + read('src/population.js');

function placeholderSprites() {
  const skins = ['#e9c2a6', '#d9a184', '#f0d0b5', '#c98d72'], cloth = ['#7a5a3c', '#5d7c95', '#a65a3a', '#e7dcc0'];
  let s = '';
  for (let v = 1; v <= 4; v++) for (const f of ['a', 'b']) {
    const st = f === 'a' ? 3 : -3;
    s += `<symbol id="pop-titan-${v}${f}" viewBox="-16 -32 32 34"><ellipse cx="0" cy="0" rx="9" ry="2.5" fill="#1d2a22" opacity=".28"/><g stroke="#3a2620" stroke-width="1.4" fill="${skins[v - 1]}"><path d="M${-3 + st} 0L-2 -12M${3 - st} 0L2 -12" fill="none" stroke-width="3.2"/><ellipse cx="0" cy="-16" rx="6" ry="7"/><circle cx="1" cy="-26" r="${4 + (v % 2)}"/></g></symbol>`;
    s += `<symbol id="pop-civ-${v}${f}" viewBox="-12 -16 24 18"><ellipse cx="0" cy="0" rx="8" ry="2" fill="#1d2a22" opacity=".28"/><g stroke="#2d2622" stroke-width="1"><rect x="-6" y="-11" width="5" height="8" rx="2" fill="${cloth[v - 1]}"/><circle cx="-3.5" cy="-13" r="2" fill="#e9c9a8"/><rect x="2" y="-10" width="4.5" height="7" rx="2" fill="${cloth[(v + 1) % 4]}"/><circle cx="4.2" cy="-12" r="1.8" fill="#e9c9a8"/><path d="M${-5 + (f === 'a' ? 1 : -1)} -3V0M${3 + (f === 'a' ? -1 : 1)} -3V0" stroke-width="1.4"/></g></symbol>`;
  }
  return s;
}
const usingDesignedSprites = exists('assets/population/sprites.svg');
let defs = placeholderSprites();
if (usingDesignedSprites) {
  const sv = read('assets/population/sprites.svg');
  const m = sv.match(/<defs[^>]*>([\s\S]*)<\/defs>/);
  defs = m ? m[1] : (sv.match(/<symbol[\s\S]*?<\/symbol>/g) || []).join('');
  for (const id of ['titan', 'civ']) for (let v = 1; v <= 4; v++) for (const f of ['a', 'b'])
    if (!defs.includes(`id="pop-${id}-${v}${f}"`)) throw new Error(`sprites.svg is missing pop-${id}-${v}${f}`);
}
if (!defs.includes('id="pop-titan-lying"')) // stand-in until a designed lying Titan exists
  defs += '<symbol id="pop-titan-lying" viewBox="-22 -14 44 16"><ellipse cx="0" cy="0" rx="17" ry="3" fill="#1d2a22" opacity=".28"/><g transform="translate(-14 -6) rotate(90) scale(.55)"><use href="#pop-titan-4a" x="-16" y="-32" width="32" height="34"/></g></symbol>';
const spriteBlock = `<svg id="popSprites" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${defs}</defs></svg>`;
if (/<svg id="popSprites"[\s\S]*?<\/defs><\/svg>/.test(html)) html = html.replace(/<svg id="popSprites"[\s\S]*?<\/defs><\/svg>/, () => spriteBlock);
else { if (html.split('<body>').length !== 2) throw new Error('expected one <body>'); html = html.replace('<body>', () => '<body>\n' + spriteBlock); }

const script = `<script id="srcModules">\nconst POP_COAST=${JSON.stringify(coast)};\nconst POP_MOTION=${JSON.stringify(motion)};\n${modules}\nconst POP=Population.create(events,POP_COAST,POP_MOTION);const POP_VIEW=Population.renderer(POP);\n</script>`;
const oldBlock = /<script id="(?:populationEngine|srcModules)">[\s\S]*?<\/script>/;
if (oldBlock.test(html)) html = html.replace(oldBlock, () => script);
else { const i = html.indexOf('</script>'); if (i < 0) throw new Error('no </script>'); html = html.slice(0, i + 9) + '\n' + script + html.slice(i + 9); }

fs.writeFileSync(htmlPath, html);
console.log(`Embedded source modules (${modules.length} chars), ${usingDesignedSprites ? 'designed' : 'placeholder'} sprites, motion: ${motion ? 'motion.json' : 'defaults'}`);
