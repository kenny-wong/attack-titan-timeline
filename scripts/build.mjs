// Builds the single offline index.html from src/ and assets/.
//   src/index.template.html   page markup; <!--__SCRIPTS__--> is replaced by the scripts below
//   src/style.css             styles
//   src/build.json            the data files and scripts to embed, in order
// Run: node scripts/build.mjs   (npm run build)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const cfg = JSON.parse(read('src/build.json'));
const version = JSON.parse(read('package.json')).version;

const inline = (js) => js.replace(/<\/script/gi, '<\/script'); // keep inline scripts from closing early
const dataJs = Object.entries(cfg.data).map(([name, file]) => `const ${name}=${JSON.stringify(JSON.parse(read(file)))};`).join('\n');
// picture folders: { NAME: folder } becomes const NAME = { fileName: dataURI, ... }
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const imageJs = Object.entries(cfg.images || {}).map(([name, dir]) => {
  const files = fs.readdirSync(path.join(root, dir)).filter((f) => MIME[path.extname(f)]).sort();
  return `const ${name}=${JSON.stringify(Object.fromEntries(files.map((f) => [path.basename(f, path.extname(f)), `data:${MIME[path.extname(f)]};base64,${fs.readFileSync(path.join(root, dir, f)).toString('base64')}`])))};`;
}).join('\n');
const used = [], skipped = [];
let scripts = `<script id="data">\n${dataJs}\n${imageJs}\n</script>`;
for (const f of cfg.scripts) {
  if (!exists(f)) { if ((cfg.optional || []).includes(f)) { skipped.push(f); continue; } throw new Error('missing ' + f); }
  scripts += `\n<script data-src="${f}">\n${inline(read(f))}\n</script>`;
  used.push(f);
}
let html = read('src/index.template.html');
const put = (key, value) => { if (!html.includes(key)) throw new Error('template is missing ' + key); html = html.split(key).join(value); };
// small theme drawings named in the styles are embedded, so the page still works when copied on its own
const css = read('src/style.css').replace(/url\((assets\/theme\/[\w.-]+\.svg)\)/g, (m, f) => `url(data:image/svg+xml;base64,${fs.readFileSync(path.join(root, f)).toString('base64')})`);
put('/*__STYLE__*/', css);
const sheets = (cfg.sprites || []).filter(exists).map((f) => (read(f).match(/<defs[^>]*>([\s\S]*)<\/defs>/) || [, ''])[1]).join('');
put('<!--__SPRITES__-->', `<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${sheets}</defs></svg>`);
put('<!--__SCRIPTS__-->', scripts);
html = html.replace(/id="appVersion">v[\d.]+</, `id="appVersion">v${version}<`);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Built index.html ${(html.length / 1024).toFixed(0)} KB, v${version}; ${used.length} scripts${skipped.length ? '; skipped (not there yet): ' + skipped.join(', ') : ''}`);
