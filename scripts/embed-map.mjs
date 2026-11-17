// Embeds assets/map-designs/map-c-island.svg into index.html as the base map
// (replaces the src of <img id="baseMap">). Safe to run again after rebuilding the map.
// Run: node scripts/embed-map.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'index.html');
const svg = fs.readFileSync(path.join(root, 'assets/map-designs/map-c-island.svg'), 'utf8');
let html = fs.readFileSync(htmlPath, 'utf8');

const re = /<img alt="[^"]*" id="baseMap" src="data:image\/[^"]+"\/>/g;
const hits = html.match(re) || [];
if (hits.length !== 1) throw new Error(`expected one baseMap <img>, found ${hits.length}`);
const tag = `<img alt="Illustrated map of Paradis Island and its three Walls" id="baseMap" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"/>`;
html = html.replace(re, () => tag);
fs.writeFileSync(htmlPath, html);
console.log(`Embedded map (${svg.length} bytes SVG) into index.html`);
