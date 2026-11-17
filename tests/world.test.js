// World geometry and camera maths.
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('./helpers.js');
const c = load();
const { World, Camera } = c;
const near = (a, b, eps = 0.01) => Math.abs(a - b) < eps;

test('the Walls are true circles in their real proportions (250 / 380 / 480 km)', () => {
  assert.ok(near(World.R.sina / World.R.maria, 250 / 480, 0.005));
  assert.ok(near(World.R.rose / World.R.maria, 380 / 480, 0.005));
});

test('the districts sit at the compass points of their Walls', () => {
  const C = World.C, d = (id) => World.district(id);
  assert.ok(d('shig').centre[1] > C[1] + World.R.maria && near(d('shig').centre[0], C[0]), 'Shiganshina is south of Wall Maria');
  assert.ok(d('trost').centre[1] > C[1] + World.R.rose && d('trost').centre[1] < C[1] + World.R.maria, 'Trost is south, between Rose and Maria');
  assert.ok(d('karanes').centre[0] > C[0] + World.R.rose && near(d('karanes').centre[1], C[1]), 'Karanes is east of Wall Rose');
  assert.ok(d('stohess').centre[0] > C[0] + World.R.sina && d('stohess').centre[0] < C[0] + World.R.rose, 'Stohess is east of Wall Sina');
  assert.ok(d('orvud').centre[1] < C[1] - World.R.sina, 'Orvud is north of Wall Sina');
  assert.strictEqual(World.DISTRICTS.length, 12);
});

test('regionOf tells the territories, districts, outside land and sea apart', () => {
  const C = World.C;
  assert.strictEqual(World.regionOf([C[0], C[1] - 60]), 'sina');
  assert.strictEqual(World.regionOf([C[0] + 160, C[1]]), 'rose');
  assert.strictEqual(World.regionOf([C[0], C[1] + 228]), 'maria');
  assert.strictEqual(World.regionOf(World.district('shig').centre), 'shig');
  assert.strictEqual(World.regionOf([C[0], C[1] + 320]), 'outside');
  assert.strictEqual(World.regionOf([40, 40]), 'sea');
});

test('the whole of Wall Maria and its districts is on land, with land beyond', () => {
  for (let deg = -180; deg < 180; deg += 5) {
    assert.ok(World.onLand(World.at(World.R.maria + World.DR.maria + 20, deg)), 'no land beyond Wall Maria at ' + deg);
    const hit = World.coastHit(World.C, deg);
    assert.ok(hit && hit.t > World.R.maria + 60, 'coast too close at ' + deg);
  }
  assert.ok(World.onLand(World.coastAt(90, -8)) && !World.onLand(World.coastAt(90, 20)));
});

test('camera: the widest view shows the whole world and the view never leaves it', () => {
  const vw = 800, vh = 700, whole = Camera.whole(World, vw, vh);
  assert.ok(whole.s * World.W <= vw + 1e-6 && whole.s * World.H <= vh + 1e-6);
  const v = Camera.constrain({ x: -500, y: 99999, s: 3 }, World, vw, vh, 5);
  assert.ok(v.x - vw / 2 / v.s >= -1e-6 && v.y + vh / 2 / v.s <= World.H + 1e-6);
  assert.ok(Camera.constrain({ x: 500, y: 700, s: 99 }, World, vw, vh, 5).s <= 5);
});

test('camera: zooming keeps the point under the cursor in place', () => {
  const vw = 800, vh = 700, v0 = { x: 500, y: 770, s: 1.2 }, px = 610, py = 240;
  const w0 = Camera.toWorld(v0, vw, vh, [px, py]), v1 = Camera.zoomAt(v0, 1.8, px, py, World, vw, vh, 5), w1 = Camera.toWorld(v1, vw, vh, [px, py]);
  assert.ok(near(w0[0], w1[0], 1e-6) && near(w0[1], w1[1], 1e-6));
  assert.ok(near(v1.s, 1.2 * 1.8, 1e-9));
});

test('camera: framing a box fits it inside the padding, and easing reaches the target', () => {
  const vw = 800, vh = 700, box = { x0: 400, y0: 900, x1: 640, y1: 1100 }, v = Camera.frame(box, World, vw, vh, 50, 5);
  const a = Camera.toScreen(v, vw, vh, [box.x0, box.y0]), b = Camera.toScreen(v, vw, vh, [box.x1, box.y1]);
  assert.ok(a[0] >= 49 && a[1] >= 49 && b[0] <= vw - 49 && b[1] <= vh - 49);
  let cur = { x: 550, y: 780, s: 0.5 };
  for (let i = 0; i < 600 && !cur.done; i++) cur = Camera.step(cur, v, 1 / 60, 2.2);
  assert.ok(cur.done && near(cur.s, v.s, 1e-9));
});

test('camera: the zoom slider and the scale convert both ways', () => {
  const lim = Camera.limits(World, 800, 700, 5);
  for (const s of [lim.min, 0.8, 2, lim.max]) assert.ok(near(Camera.sliderToScale(Camera.scaleToSlider(s, lim), lim), s, 1e-9));
  assert.strictEqual(Camera.scaleToSlider(lim.min, lim), 0);
});
