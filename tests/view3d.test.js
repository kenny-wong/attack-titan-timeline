// The 3D camera's maths: what the tilted camera shows, and where a screen point lies on the ground.
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('./helpers.js');
const { View3D: V } = load();
const near = (a, b, eps = 0.01) => Math.abs(a - b) < eps;
const VW = 1200, VH = 1060;

test('view3d: the point the view looks at is in the middle of the screen, at the view\'s scale', () => {
  for (const yaw of [0, 0.9, -2.3]) for (const s of [0.7, 1.8, 5]) {
    const P = V.pose({ x: 500, y: 770, s }, VW, VH, yaw), q = V.project(P, 500, 770, 0);
    assert.ok(near(q[0], VW / 2) && near(q[1], VH / 2), 'centre');
    assert.ok(near(q[2], s, 1e-6), 'scale ' + q[2]);
  }
});

test('view3d: north is up, east is right, and what stands up rises on the screen', () => {
  const P = V.pose({ x: 500, y: 770, s: 2 }, VW, VH);
  assert.ok(V.project(P, 500, 700, 0)[1] < VH / 2, 'a point to the north is higher on the screen');
  assert.ok(V.project(P, 560, 770, 0)[0] > VW / 2, 'a point to the east is to the right');
  assert.ok(V.project(P, 500, 770, 20)[1] < VH / 2 - 10, 'a tall thing rises above its foot');
  const far = V.project(P, 500, 600, 0)[2], close = V.project(P, 500, 900, 0)[2];
  assert.ok(far < 2 && close > 2, 'things further away are drawn smaller');
});

test('view3d: a screen point maps to the ground and back, also with the camera turned', () => {
  for (const yaw of [0, 1.2, 3.0, -0.7]) {
    const P = V.pose({ x: 430, y: 880, s: 1.4 }, VW, VH, yaw);
    for (const [px, py] of [[100, 120], [600, 530], [1100, 1000], [37, 900]]) {
      const g = V.ground(P, px, py), q = V.project(P, g[0], g[1], 0);
      assert.ok(near(q[0], px, 0.01) && near(q[1], py, 0.01), `round trip at yaw ${yaw}`);
    }
  }
});

test('view3d: the camera looks down steeply from afar and sinks towards the horizon close up', () => {
  const far = V.pitch(0.3), mid = V.pitch(1.6), close = V.pitch(9);
  assert.ok(far > mid && mid > close);
  assert.ok(near(far, (V.cfg.pitchFar * Math.PI) / 180) && near(close, (V.cfg.pitchNear * Math.PI) / 180));
  assert.ok(close > ((V.cfg.fov / 2 + 2) * Math.PI) / 180, 'the horizon never comes into view');
});

test('view3d: hold keeps the ground you took hold of under the pointer (drag and zoom)', () => {
  const view = { x: 500, y: 770, s: 1.2 }, yaw = 0.6;
  const w = V.ground(V.pose(view, VW, VH, yaw), 300, 400);
  const dragged = V.hold(view, VW, VH, w, 520, 610, yaw), a = V.project(V.pose(dragged, VW, VH, yaw), w[0], w[1], 0);
  assert.ok(near(a[0], 520, 0.01) && near(a[1], 610, 0.01), 'after a drag');
  const zoomed = V.hold({ ...view, s: 3.4 }, VW, VH, w, 300, 400, yaw), b = V.project(V.pose(zoomed, VW, VH, yaw), w[0], w[1], 0);
  assert.ok(near(b[0], 300, 0.01) && near(b[1], 400, 0.01), 'after zooming');
});

test('view3d: the view from straight above (bird-eye) looks straight down like a map, and dragging stays exact', () => {
  const vw = 1000, vh = 800, view = { x: 500, y: 770, s: 2 };
  V.cfg.bird = 1;
  try {
    const P = V.pose(view, vw, vh);
    assert.ok(P.pitch > (85 * Math.PI) / 180 && P.pitch < Math.PI / 2, 'nearly overhead, never exactly (the camera needs an up direction)');
    const n = V.project(P, 500, 670, 0), s = V.project(P, 500, 870, 0), e = V.project(P, 600, 770, 0);
    assert.ok(Math.abs(n[0] - 500) < 0.01 && n[1] < 400 && s[1] > 400, 'north is up');
    assert.ok(Math.abs(n[2] - s[2]) / s[2] < 0.08, 'near and far are drawn at almost one scale: ' + n[2].toFixed(3) + ' / ' + s[2].toFixed(3));
    assert.ok(Math.abs((e[0] - 500) - 200) < 2 && Math.abs((s[1] - n[1]) - 400) < 6, 'a unit is the same length across and up the screen');
    const tall = V.project(P, 500, 770, 17);
    assert.ok(Math.abs(tall[1] - 400) < 2, 'a Wall hides almost nothing behind it');
    const g = V.ground(P, 320, 610), back = V.project(P, g[0], g[1], 0);
    assert.ok(Math.abs(back[0] - 320) < 1e-6 && Math.abs(back[1] - 610) < 1e-6);
    const held = V.hold(view, vw, vh, [430, 900], 700, 200), q = V.project(V.pose(held, vw, vh), 430, 900, 0);
    assert.ok(Math.abs(q[0] - 700) < 1e-6 && Math.abs(q[1] - 200) < 1e-6);
  } finally { V.cfg.bird = 0; }
  assert.ok(V.pose(view, vw, vh).pitch < (62 * Math.PI) / 180, 'and the tilted view is back');
});

test('view3d: a framed box is wholly on screen', () => {
  for (const box of [{ x0: 300, y0: 600, x1: 700, y1: 1000 }, { x0: 480, y0: 900, x1: 520, y1: 1300 }, { x0: 0, y0: 0, x1: 1100, y1: 1560 }]) {
    const pad = 40, s = V.fit(box, VW, VH, pad), P = V.pose({ x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, s }, VW, VH);
    for (const [x, y] of [[box.x0, box.y0], [box.x1, box.y0], [box.x1, box.y1], [box.x0, box.y1]]) {
      const q = V.project(P, x, y, 0);
      assert.ok(q[0] >= 0 && q[0] <= VW && q[1] >= 0 && q[1] <= VH, `corner ${x},${y} at ${q[0].toFixed(0)},${q[1].toFixed(0)}`);
    }
  }
});

test('view3d: the visible ground is wider at the far side than at the near side', () => {
  const [tl, tr, br, bl] = V.corners(V.pose({ x: 500, y: 770, s: 1 }, VW, VH));
  assert.ok(tr[0] - tl[0] > br[0] - bl[0]);
  assert.ok(tl[1] < bl[1]);
});

test('view3d: the flat map answers the same calls with a camera straight overhead', () => {
  const F = V.flat, view = { x: 400, y: 700, s: 2 }, P = F.pose(view, VW, VH);
  const q = F.project(P, 450, 760, 99), g = F.ground(P, q[0], q[1]);
  assert.ok(near(q[0], VW / 2 + 100) && near(q[1], VH / 2 + 120) && q[2] === 2);
  assert.ok(near(g[0], 450) && near(g[1], 760));
  const held = F.hold(view, VW, VH, [450, 760], 10, 20), h = F.project(F.pose(held, VW, VH), 450, 760, 0);
  assert.ok(near(h[0], 10) && near(h[1], 20));
});
