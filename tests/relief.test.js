// The height of the land (relief.js): sea and shore, level ground under the Walls, mountains in the north.
const test = require('node:test');
const assert = require('node:assert');
const { load, read } = require('./helpers.js');
const c = load();
const { World, Terrain, Relief } = c;
const terrain = Terrain.build(JSON.parse(read('assets/map-designs/world-terrain.json')), World);
const relief = Relief.build(terrain, World, { step: 4 });

test('relief: the land is above the sea and the sea floor below it', () => {
  assert.ok(relief.h(...World.C) > 0, 'Mitras is on land');
  for (const d of World.DISTRICTS) assert.ok(relief.h(...d.centre) > 0, d.id + ' is on land');
  for (const p of [[5, 5], [1090, 20], [20, 1500], [1080, 1540]]) assert.ok(relief.h(...p) < -2, 'open sea at ' + p);
  assert.ok(relief.h(-50, 300) < 0 && relief.h(500, 5000) < 0, 'beyond the map is sea');
  assert.strictEqual(relief.land(5, 5), 0, 'nothing stands below the water');
});

test('relief: the shore is where the coastline is drawn', () => {
  let wrong = 0, n = 0;
  for (let x = 20; x < World.W; x += 23) for (let y = 20; y < World.H; y += 23) {
    if (World.coastDist([x, y]) < 9) continue; // the drawn coast is rounded: skip the strip beside it
    n++;
    if (relief.h(x, y) > 0 !== World.onLand([x, y])) wrong++;
  }
  assert.ok(n > 1500 && wrong === 0, `${wrong} of ${n} points on the wrong side of the shore`);
});

test('relief: the ground is level under the three Walls and the district walls', () => {
  for (const [name, R] of Object.entries(World.R)) {
    let lo = Infinity, hi = -Infinity;
    for (let deg = 0; deg < 360; deg += 2) { const h = relief.h(...World.at(R, deg)); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    assert.ok(hi - lo < 1.2 && lo > 0.3, `Wall ${name}: ground from ${lo.toFixed(2)} to ${hi.toFixed(2)}`);
  }
  for (const d of World.DISTRICTS) for (const q of d.outline(6)) {
    const p = q.p, h = relief.h(...p);
    assert.ok(h > 0.3 && h < 2.6, `${d.id} wall stands at ${h.toFixed(2)}`);
  }
});

test('relief: mountains rise in the north; the walled land stays gentle', () => {
  let north = 0, inside = 0;
  for (let x = 150; x < 900; x += 6) for (let y = 130; y < 420; y += 6) north = Math.max(north, relief.h(x, y));
  for (let deg = 0; deg < 360; deg += 3) for (let r = 10; r < World.R.maria; r += 6) inside = Math.max(inside, relief.h(...World.at(r, deg)));
  assert.ok(north > 22, 'highest northern peak ' + north.toFixed(1));
  assert.ok(inside < 15, 'highest ground inside Wall Maria ' + inside.toFixed(1));
  assert.ok(north > inside * 1.8);
});

test('relief: rivers run in beds lower than their banks, and places stand on level ground', () => {
  const tab = c.RouteGeo.build(terrain.rivers[0].pts, 1).tab;
  for (const f of [0.15, 0.3, 0.7]) {
    const q = c.RouteGeo.at(tab, f), nx = -Math.sin(q.angle), ny = Math.cos(q.angle), bed = relief.h(q.x, q.y);
    assert.ok(bed < 1.2, 'a river bed is low: ' + bed.toFixed(2));
    assert.ok(Math.max(relief.h(q.x + nx * 14, q.y + ny * 14), relief.h(q.x - nx * 14, q.y - ny * 14)) >= bed, 'its banks are not lower');
  }
  for (const pl of terrain.places) { const h = relief.h(...pl.p); assert.ok(h > 0 && h < 3.2, `${pl.id} stands at ${h.toFixed(2)}`); }
});

test('relief: building it twice gives the same land', () => {
  const again = Relief.build(terrain, World, { step: 4 });
  assert.strictEqual(again.data.length, relief.data.length);
  for (let i = 0; i < relief.data.length; i += 97) assert.strictEqual(again.data[i], relief.data[i]);
});
