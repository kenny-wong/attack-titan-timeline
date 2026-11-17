// Builds assets/map-designs/map-c-island.svg from design C (map-c.svg):
// a larger, irregular Paradis Island around the unchanged wall geometry.
// Also writes frame-island.json with the frame transform and the outside points
// the app uses (in both the new frame and the app's original 520x510 units).
// Run: node scripts/build-island-map.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'assets/map-designs');
const src = fs.readFileSync(path.join(dir, 'map-c.svg'), 'utf8');

// Frame: old app units (520x510) map to new = old * S + (OX, OY).
const W = 1200, H = 1060, S = 1.25, OX = 275, OY = 239;
const DX = OX - 175, DY = OY - 179; // shift applied to the 1000x920 design-C artwork
const CX = OX + 260 * S, CY = OY + 217 * S; // centre of Wall Maria
const MRX = 244 * S, MRY = 215 * S;
const f1 = (n) => Math.round(n * 10) / 10;

let seed = 8451;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return (u - 3) / 1.2; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const ellR = (t, rx, ry) => 1 / Math.sqrt((Math.cos(t) / rx) ** 2 + (Math.sin(t) / ry) ** 2);
const inside = (poly, [x, y]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const distTo = (poly, p) => { let m = Infinity; for (const q of poly) m = Math.min(m, Math.hypot(q[0] - p[0], q[1] - p[1])); return m; };

// ---- Coastline: an irregular island, clearly not the shape of the Walls ----
// Angles: 0 = east, PI/2 = south (SVG y grows downwards).
const bumps = [
  [-0.78, 0.50, 0.15], // long north-east peninsula
  [-2.30, 0.16, 0.38], // broad north-west lobe
  [-1.95, -0.10, 0.07], // north-west inlet
  [0.80, -0.22, 0.13], // south-east bay (harbour)
  [2.22, 0.27, 0.11], // south-west cape
  [3.02, -0.15, 0.10], // western inlet
  [1.45, -0.05, 0.22], // flatter south coast
  [-1.40, 0.04, 0.30], // northern bulge
  [0.18, 0.08, 0.22], // eastern bulge
];
const noise = [];
for (let k = 3; k <= 18; k++) noise.push([k, 0.03 * Math.pow(3 / k, 0.9) * (0.4 + rnd()), rnd() * Math.PI * 2]);
const coastR = (t) => {
  let f = 1;
  for (const [t0, a, w] of bumps) f += a * Math.exp(-(wrap(t - t0) ** 2) / (2 * w * w));
  for (const [k, a, p] of noise) f += a * Math.cos(k * t + p);
  return ellR(t, 520, 425) * f;
};
const N = 360, coast = [], coastRad = [];
let minGap = Infinity;
for (let i = 0; i < N; i++) {
  const t = -Math.PI + (2 * Math.PI * i) / N;
  let r = coastR(t);
  const need = ellR(t, MRX, MRY) + (Math.abs(Math.cos(2 * t)) > 0.97 ? 95 : 70); // keep land beyond Maria and its districts
  minGap = Math.min(minGap, r - need);
  if (r < need) r = need;
  coastRad.push(r);
  coast.push([CX + r * Math.cos(t), CY + r * Math.sin(t)]);
}
const radAt = (t) => coastRad[((Math.round(((wrap(t) + Math.PI) / (2 * Math.PI)) * N) % N) + N) % N];
const smooth = (pts) => {
  const n = pts.length;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
};

// ---- Pieces of design C ----
const oldD = src.match(/<path id="c-coast" d="([^"]+)"/)[1];
const oldPoly = [];
{
  const tk = oldD.match(/[MLCQZ]|-?[\d.]+/g);
  let i = 0, cmd;
  while (i < tk.length) {
    if (/[A-Z]/.test(tk[i])) cmd = tk[i++];
    if (cmd === 'Z') continue;
    const n = { M: 2, L: 2, C: 6, Q: 4 }[cmd];
    const a = tk.slice(i, (i += n)).map(Number);
    oldPoly.push([a[n - 2] + DX, a[n - 1] + DY]);
  }
}
const groupAt = (start) => {
  const re = /<(\/?)g\b[^>]*?(\/?)>/g;
  re.lastIndex = start;
  let d = 0, m;
  while ((m = re.exec(src))) { if (m[1]) d--; else if (!m[2]) d++; if (d === 0) return src.slice(start, re.lastIndex); }
  throw new Error('unbalanced <g>');
};
const contentFull = groupAt(src.indexOf('<g clip-path="url(#c-island)">'));
let content = contentFull.slice(contentFull.indexOf('>') + 1, -4);
let dropped = 0;
content = content.replace(/<path d="M([\d.]+) ([\d.]+)q([\d.]+) -8 ([\d.]+) 4l-9 ([\d.]+)q[^"]*Z"[^>]*\/>/g, (m, x, y, hw, w, h) =>
  inside(oldPoly, [+x + +w / 2 + DX, +y + +h / 2 + DY]) ? m : (dropped++, ''));
content = content.replace('<rect width="1000" height="920" fill="url(#c-grain)"/>', `<rect x="${-DX}" y="${-DY}" width="${W}" height="${H}" fill="url(#c-grain)"/>`);
const walls = groupAt(src.indexOf('<g transform="translate(175 179) scale(1.25)"')).replace('translate(175 179)', `translate(${OX} ${OY})`);
const compass = groupAt(src.indexOf('<g transform="translate(109 112)"'));
let defs = src.slice(src.indexOf('<defs>'), src.indexOf('</defs>') + 7).replace(/<path id="c-coast" d="[^"]+"\/>/, `<path id="c-coast" d="${smooth(coast)}"/>`);

// ---- New terrain on the added land ----
const outerLand = (p, margin = 0) => inside(coast, p) && !inside(oldPoly, p) && distTo(coast, p) > margin;
const mariaAt = (t) => ellR(t, MRX, MRY);
const items = []; // [y, svg] drawn in y order so nearer things overlap
const peaks = [];
const mountain = (x, y, k) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${k.toFixed(2)})"><path d="M-24 12L-4 -24L3 -19.2L9 -13.2L24 12Z" fill="#818a69" stroke="#59704f" stroke-width="1" opacity="0.85"/><path d="M-4 -24L1 1L24 12L9 -13.2L3 -19.2Z" fill="#5b7359" opacity=".65"/><path d="M-9 -14.4L-4 -24L3 -19.2L7 -15.12L1 -16.08L-2 -12.96L-4 -17.28Z" fill="#d5d0af" opacity=".8"/></g>`;
for (const [t0, t1, q, n] of [[-2.15, -1.2, 0.6, 12], [-1.0, -0.62, 0.7, 9], [2.7, 3.35, 0.58, 8], [2.05, 2.35, 0.72, 5]]) {
  for (let i = 0; i < n; i++) {
    const t = t0 + ((t1 - t0) * (i + 0.5 + (rnd() - 0.5) * 0.6)) / n;
    for (const row of [0, 1]) {
      if (row && rnd() < 0.45) continue;
      const qq = q + (row ? 0.17 : 0) + (rnd() - 0.5) * 0.12;
      const r = mariaAt(t) + (radAt(t) - mariaAt(t)) * qq;
      const p = [CX + r * Math.cos(t), CY + r * Math.sin(t)];
      if (!outerLand(p, 30)) continue;
      peaks.push(p);
      items.push([p[1], mountain(p[0], p[1], 0.85 + rnd() * 0.45)]);
    }
  }
}
const nearPeak = (p, d) => peaks.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < d);
let fields = '';
const fieldCols = ['#b5b783', '#a8b37c', '#92a573', '#899f70', '#b9be88', '#c2bd87'];
for (let y = -10; y < H; y += 48) {
  let x = -20 + rnd() * 30;
  while (x < W) {
    const w = 48 + rnd() * 34, h = 34 + rnd() * 22, c = [x + w / 2, y + h / 2];
    if (outerLand(c) && rnd() > 0.12 && !nearPeak(c, 42))
      fields += `<path d="M${f1(x)} ${f1(y)}q${f1(w / 2)} -8 ${f1(w)} 4l-9 ${f1(h)}q${f1(-w * 0.4)} 7 ${f1(-w)} -3Z" fill="${pick(fieldCols)}" opacity=".55" stroke="#d7d2a2" stroke-opacity=".22" stroke-width="1.5"/>`;
    x += w + 4 + rnd() * 10;
  }
}
let forests = 0;
for (let tries = 0; forests < 10 && tries < 4000; tries++) {
  const p = [rnd() * W, rnd() * H];
  if (!outerLand(p, 40) || nearPeak(p, 55)) continue;
  forests++;
  const sx = 16 + rnd() * 16, sy = sx * (0.6 + rnd() * 0.4);
  items.push([p[1] - 999, `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${f1(sx * 2)}" ry="${f1(sy * 2)}" fill="#315744" opacity="0.17"/>`]);
  const n = 16 + Math.floor(rnd() * 24);
  for (let i = 0; i < n; i++) {
    const q = [p[0] + gauss() * sx, p[1] + gauss() * sy];
    if (outerLand(q, 14)) items.push([q[1], `<use href="#c-tree" transform="translate(${f1(q[0])} ${f1(q[1])}) scale(${(0.8 + rnd() * 0.45).toFixed(2)})"/>`]);
  }
}
for (let i = 0; i < 70; i++) {
  const q = [rnd() * W, rnd() * H];
  if (outerLand(q, 18) && !nearPeak(q, 30)) items.push([q[1], `<use href="#c-tree" transform="translate(${f1(q[0])} ${f1(q[1])}) scale(${(0.7 + rnd() * 0.3).toFixed(2)})"/>`]);
}
items.sort((a, b) => a[0] - b[0]);

// Rivers: continue design C's two rivers from its old coast to the new one.
let rivers = '';
for (const [ex, ey, dx, dy] of [[488, 60, 22, -33], [540, 857, 5, 26], [76, 461, -48, -25], [930, 445, 44, 19]]) {
  const E = [ex + DX, ey + DY], len = Math.hypot(dx, dy), d = [dx / len, dy / len];
  if (!inside(coast, E)) continue;
  let t = 0;
  while (inside(coast, [E[0] + d[0] * t, E[1] + d[1] * t]) && t < 600) t += 2;
  const X = [E[0] + d[0] * (t + 16), E[1] + d[1] * (t + 16)], p = [-d[1], d[0]];
  const c1 = [E[0] + d[0] * t * 0.35, E[1] + d[1] * t * 0.35];
  const c2 = [X[0] - d[0] * t * 0.3 + p[0] * t * 0.14, X[1] - d[1] * t * 0.3 + p[1] * t * 0.14];
  const dd = `M${f1(E[0])} ${f1(E[1])}C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(X[0])} ${f1(X[1])}`;
  rivers += `<path d="${dd}" fill="none" stroke="#c8caa0" stroke-width="11" stroke-linecap="round"/><path d="${dd}" fill="none" stroke="#6caaa8" stroke-width="6" stroke-linecap="round"/><path d="${dd}" fill="none" stroke="#d5e1c1" stroke-width="1" opacity=".55"/>`;
}

// Sea texture and compass (placed in open sea).
let waves = '';
for (let y = 30, row = 0; y < H; y += 47, row++) {
  for (let x = row % 2 ? 57 : 27; x < W; x += 80) {
    if (rnd() < 0.2) continue;
    const p = [x + 16, y];
    if (inside(coast, p) || distTo(coast, p) < 28) continue;
    waves += `M${x} ${y}q8 4 16 0t16 0`;
  }
}
const seaClear = (p, r) => !inside(coast, p) && distTo(coast, p) > r;
const compassAt = [[92, 92], [W - 92, 92], [92, H - 92], [W - 92, H - 92]].find((p) => seaClear(p, 60)) || [92, H - 92];
const compassSvg = compass.replace('translate(109 112)', `translate(${compassAt[0]} ${compassAt[1]})`);

// ---- Outside points for the app ----
const clampF = ([x, y]) => [Math.max(30, Math.min(W - 30, x)), Math.max(30, Math.min(H - 30, y))];
const coastAt = (t, off) => clampF([CX + (radAt(t) + off) * Math.cos(t), CY + (radAt(t) + off) * Math.sin(t)]);
const toOld = ([x, y]) => [f1((x - OX) / S), f1((y - OY) / S)];
const points = {
  shore: coastAt(Math.PI / 2, -16), // south coast below Shiganshina
  ship: coastAt(1.95, 60), // offshore, south-south-west
  sea: coastAt(2.4, 170), // open sea, south-west
  outerWest: (() => { const t = 3.0, r = (mariaAt(t) + radAt(t)) / 2; return [CX + r * Math.cos(t), CY + r * Math.sin(t)]; })(),
  outsideEast: coastAt(-0.15, 45), // just off the east coast
  alliance: coastAt(0.8, -14), // harbour in the south-east bay
};
const checks = {
  minLandBeyondMaria: f1(minGap),
  shoreOnLand: inside(coast, points.shore),
  shipAtSea: !inside(coast, points.ship),
  seaAtSea: !inside(coast, points.sea),
  outerWestOnLand: inside(coast, points.outerWest),
  outsideEastAtSea: !inside(coast, points.outsideEast),
  allianceOnLand: inside(coast, points.alliance),
  droppedFieldPatches: dropped,
  forests,
  peaks: peaks.length,
  compassAt,
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${defs}<rect width="${W}" height="${H}" fill="url(#c-sea)"/>`
  + `<use href="#c-coast" fill="none" stroke="#d2d8b2" stroke-opacity="0.16" stroke-width="42" stroke-linejoin="round"/>`
  + `<use href="#c-coast" fill="none" stroke="#d2d8b2" stroke-opacity="0.24" stroke-width="24" stroke-linejoin="round"/>`
  + `<use href="#c-coast" fill="none" stroke="#d2d8b2" stroke-opacity="0.4" stroke-width="10" stroke-linejoin="round"/>`
  + `<path d="${waves}" fill="none" stroke="#c4ddd0" stroke-width="1.2" opacity="0.28"/>`
  + `<use href="#c-coast" fill="url(#c-land)" stroke="#d8cd9d" stroke-width="13" stroke-linejoin="round"/>`
  + `<g clip-path="url(#c-island)"><g>${fields}</g><g transform="translate(${DX} ${DY})">${content}</g>${rivers}${items.map((i) => i[1]).join('')}</g>`
  + `<use href="#c-coast" fill="none" stroke="#eee0b5" stroke-width="1.5"/>${walls}${compassSvg}</svg>\n`;

fs.writeFileSync(path.join(dir, 'map-c-island.svg'), svg);
const frame = {
  viewBox: `0 0 ${W} ${H}`,
  transform: { scale: S, offsetX: OX, offsetY: OY, note: 'new = old * scale + offset; old = the app\'s original 520x510 units' },
  outsidePoints: Object.fromEntries(Object.entries(points).map(([k, p]) => [k, { new: p.map(f1), old: toOld(p) }])),
  coastSample: coast.filter((_, i) => i % 30 === 0).map((p) => p.map(f1)),
  coastApp: coast.filter((_, i) => i % 4 === 0).map((p) => toOld(p).map(Math.round)), // for the population engine (COAST in index.html)
};
fs.writeFileSync(path.join(dir, 'frame-island.json'), JSON.stringify(frame, null, 2) + '\n');
console.log(JSON.stringify({ bytes: svg.length, ...checks, outsidePointsOld: Object.fromEntries(Object.entries(points).map(([k, p]) => [k, toOld(p)])) }, null, 1));
