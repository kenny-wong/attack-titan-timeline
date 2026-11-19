// World geometry and camera maths.
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('./helpers.js');
const c = load();
const { World, Camera } = c;
const near = (a, b, eps = 0.01) => Math.abs(a - b) < eps;

test('the Walls are drawn as in the story\'s diagram: Maria at its true distance, the inner Walls closer in; true distances are moved with them', () => {
  assert.ok(near(World.TRUE.sina / World.TRUE.maria, 250 / 480, 0.005) && near(World.TRUE.rose / World.TRUE.maria, 380 / 480, 0.005));
  assert.strictEqual(World.R.maria, World.TRUE.maria);
  assert.ok(World.R.sina < World.TRUE.sina && World.R.rose < World.TRUE.rose && World.R.sina < World.R.rose && World.R.rose < World.R.maria);
  for (const k of ['sina', 'rose', 'maria']) assert.ok(near(World.drawn(World.TRUE[k]), World.R[k]), k + ' is drawn at its own Wall');
  assert.strictEqual(World.drawn(0), 0);
  assert.strictEqual(World.drawn(300), 300); // beyond Wall Maria nothing moves
  for (let r = 1; r < 300; r += 3) assert.ok(World.drawn(r) > World.drawn(r - 1), 'order from the centre is kept');
  // a village a third of the way from Sina to Rose stays a third of the way
  assert.ok(near((World.drawn(146.67) - World.R.sina) / (World.R.rose - World.R.sina), 1 / 3, 0.001));
  assert.ok(near(World.rOf(World.atTrue(172, 114)), World.drawn(172)) && near(World.degOf(World.atTrue(172, 114)), 114));
});

test('a district is an arch standing out from its Wall: straight sides, a round end, longer than a half circle', () => {
  for (const d of World.DISTRICTS) {
    const Rw = World.R[d.wall];
    assert.ok(d.depth > d.hw * 1.5, d.id + ' stands out further than it is wide by half');
    assert.ok(near(World.rOf(d.inner), Rw) && near(World.rOf(d.outer), Rw + d.depth) && near(World.degOf(d.outer), d.deg));
    assert.ok(d.sd(d.centre) < -d.hw * 0.6 && near(d.sd(d.outer), 0) && d.sd(d.beyond) > 15 && d.sd(d.within) > 0);
    // the wall: both feet on the main Wall, the outer gate in the middle, every point on the outline
    const a = d.wallAt(0), b = d.wallAt(d.len), mid = d.wallAt(d.len / 2);
    assert.ok(near(World.rOf(a.p), Rw) && near(World.rOf(b.p), Rw), d.id + ' feet on the Wall');
    assert.ok(near(World.dist(a.p, b.p), d.hw * 2), 'as wide as it says');
    assert.ok(near(mid.p[0], d.outer[0]) && near(mid.p[1], d.outer[1]) && near(mid.n[0], d.n[0]) && near(mid.n[1], d.n[1]));
    let prev = null;
    for (const q of d.outline(1.5)) {
      assert.ok(Math.abs(d.sd(q.p)) < 0.3, d.id + ' outline off the wall by ' + d.sd(q.p));
      assert.ok(near(Math.hypot(q.n[0], q.n[1]), 1));
      assert.ok(d.sd([q.p[0] + q.n[0] * 3, q.p[1] + q.n[1] * 3]) > 2 || World.rOf(q.p) < Rw + 3, 'the normal points out');
      if (prev) assert.ok(World.dist(prev.p, q.p) < 1.6);
      prev = q;
    }
    // straight sides: a third of the way along the first side the wall runs straight out
    const s1 = d.wallAt(d.side * 0.3), s2 = d.wallAt(d.side * 0.8);
    assert.ok(near((s2.p[0] - s1.p[0]) * d.t[0] + (s2.p[1] - s1.p[1]) * d.t[1], 0) && near(World.dist(s1.p, s2.p), d.side * 0.5));
    assert.ok(d.side > d.hw * 0.4, d.id + ' has straight sides');
    assert.strictEqual(World.inDistrict(d.centre), d);
    assert.strictEqual(World.inDistrict(d.within), null);
  }
  // districts do not touch the next Wall out, or each other
  assert.ok(World.R.sina + World.DR.sina[1] < World.R.rose - 20 && World.R.rose + World.DR.rose[1] < World.R.maria - 20);
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
  assert.strictEqual(World.regionOf([C[0], C[1] - 40]), 'sina');
  assert.strictEqual(World.regionOf(World.at(100, 45)), 'rose');
  assert.strictEqual(World.regionOf(World.at(180, 45)), 'maria');
  assert.strictEqual(World.regionOf([C[0], C[1] + 228]), 'maria');
  assert.strictEqual(World.regionOf(World.district('shig').centre), 'shig');
  assert.strictEqual(World.regionOf([C[0], C[1] + 320]), 'outside');
  assert.strictEqual(World.regionOf([40, 40]), 'sea');
});

test('the whole of Wall Maria and its districts is on land, with land beyond', () => {
  for (let deg = -180; deg < 180; deg += 5) {
    assert.ok(World.onLand(World.at(World.R.maria + 40, deg)), 'no land beyond Wall Maria at ' + deg);
    const hit = World.coastHit(World.C, deg);
    assert.ok(hit && hit.t > World.R.maria + 60, 'coast too close at ' + deg);
  }
  for (const d of World.DISTRICTS.filter((x) => x.wall === 'maria')) {
    for (const q of d.outline(4)) assert.ok(World.onLand(q.p) && World.coastDist(q.p) > 12, d.id + ' reaches the coast');
    assert.ok(World.onLand(d.beyond) && World.coastDist(d.beyond) > 6, 'land beyond ' + d.id);
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
