// Route curve geometry (smooth paths through waypoints).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'route-geometry.js'), 'utf8'), ctx);
const G = ctx.RouteGeo;
const close = (a, b, eps = 0.05) => Math.hypot(a[0] - b[0], a[1] - b[1]) < eps;
const polyLen = (p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
const pts = [[259, 505], [259, 466], [259, 424], [310, 380], [420, 300]];

test('the curve passes through every waypoint', () => {
  const segs = G.segments(pts);
  pts.slice(0, -1).forEach((p, i) => assert.ok(close(segs[i][0], p)));
  assert.ok(close(segs.at(-1)[3], pts.at(-1)));
});

test('positions start and end at the first and last waypoints and move forward', () => {
  const r = G.build(pts);
  const a = G.at(r.tab, 0), b = G.at(r.tab, 1);
  assert.ok(close([a.x, a.y], pts[0]) && close([b.x, b.y], pts.at(-1)));
  let prev = -1;
  for (let f = 0; f <= 1.0001; f += 0.05) { const p = G.at(r.tab, f); const d = r.tab.lens[r.tab.pts.findIndex((q) => close(q, [p.x, p.y], 2))] ?? prev; assert.ok(d >= prev - 1e-6); prev = d; }
});

test('the curve length stays close to the straight-line length (no loops or overshoot)', () => {
  const r = G.build(pts);
  const pl = polyLen(pts);
  assert.ok(r.total >= pl * 0.99 && r.total <= pl * 1.12, `${r.total} vs ${pl}`);
});

test('a straight gate passage stays straight', () => {
  const r = G.build([[259, 494], [259, 480], [259, 467], [259, 445], [259, 425]]);
  for (let f = 0; f <= 1; f += 0.1) assert.ok(Math.abs(G.at(r.tab, f).x - 259) < 0.01);
});

test('two points make a straight line; one point does not crash', () => {
  const r = G.build([[0, 0], [10, 0]]);
  assert.ok(Math.abs(r.total - 10) < 0.01);
  assert.ok(G.build([[5, 5]]).d.startsWith('M5 5'));
});

test('slice draws the travelled part and ends at the current position', () => {
  const r = G.build(pts);
  assert.strictEqual(G.slice(r.tab, 0), '');
  const d = G.slice(r.tab, 0.5), p = G.at(r.tab, 0.5);
  const last = d.split('L').at(-1).split(' ').map(Number);
  assert.ok(d.startsWith('M259 505') && close(last, [p.x, p.y], 0.11));
  assert.ok(G.slice(r.tab, 1).split('L').length >= G.slice(r.tab, 0.5).split('L').length);
});

test('ease goes from 0 to 1 smoothly and symmetrically', () => {
  assert.strictEqual(G.ease(0), 0); assert.strictEqual(G.ease(1), 1);
  assert.ok(Math.abs(G.ease(0.5) - 0.5) < 1e-9);
  assert.ok(Math.abs(G.ease(0.2) + G.ease(0.8) - 1) < 1e-9);
  for (let t = 0; t < 1; t += 0.05) assert.ok(G.ease(t + 0.05) >= G.ease(t));
});
