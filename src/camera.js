/* Camera maths for the map. A view is { x, y, s }: the world point at the centre of the viewport
   and the scale in screen pixels per world unit. DOM-free (tested in Node). */
(function (global) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Scale limits for a viewport: the smallest scale shows the whole world, the largest gets close to a district.
  function limits(world, vw, vh, maxScale = 5) {
    const min = Math.min(vw / world.W, vh / world.H);
    return { min, max: Math.max(maxScale, min * 1.5) };
  }
  // Keep the view inside the world: never show beyond the world's edge unless the viewport is larger than the world.
  function constrain(view, world, vw, vh, maxScale) {
    const lim = limits(world, vw, vh, maxScale), s = clamp(view.s, lim.min, lim.max);
    const hw = vw / s / 2, hh = vh / s / 2;
    const x = hw * 2 >= world.W ? world.W / 2 : clamp(view.x, hw, world.W - hw);
    const y = hh * 2 >= world.H ? world.H / 2 : clamp(view.y, hh, world.H - hh);
    return { x, y, s };
  }
  // The view that fits a world box { x0, y0, x1, y1 } with `pad` screen pixels to spare on each side.
  function frame(box, world, vw, vh, pad = 0, maxScale) {
    const w = Math.max(1, box.x1 - box.x0), h = Math.max(1, box.y1 - box.y0);
    const s = Math.min((vw - pad * 2) / w, (vh - pad * 2) / h);
    return constrain({ x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, s }, world, vw, vh, maxScale);
  }
  const whole = (world, vw, vh) => constrain({ x: world.W / 2, y: world.H / 2, s: 0 }, world, vw, vh);
  const toScreen = (view, vw, vh, p) => [(p[0] - view.x) * view.s + vw / 2, (p[1] - view.y) * view.s + vh / 2];
  const toWorld = (view, vw, vh, q) => [(q[0] - vw / 2) / view.s + view.x, (q[1] - vh / 2) / view.s + view.y];
  // Zoom by `factor` keeping the world point under screen point (px, py) where it is.
  function zoomAt(view, factor, px, py, world, vw, vh, maxScale) {
    const lim = limits(world, vw, vh, maxScale), s = clamp(view.s * factor, lim.min, lim.max);
    const w = toWorld(view, vw, vh, [px, py]);
    return constrain({ x: w[0] - (px - vw / 2) / s, y: w[1] - (py - vh / 2) / s, s }, world, vw, vh, maxScale);
  }
  // Move `cur` towards `target` (exponential smoothing; scale is eased in log space so zooming feels even).
  function step(cur, target, dt, rate = 3) {
    const k = 1 - Math.exp(-Math.max(0, dt) * rate);
    const s = Math.exp(Math.log(cur.s) + (Math.log(target.s) - Math.log(cur.s)) * k);
    const out = { x: cur.x + (target.x - cur.x) * k, y: cur.y + (target.y - cur.y) * k, s };
    const done = Math.abs(out.x - target.x) < 0.05 && Math.abs(out.y - target.y) < 0.05 && Math.abs(out.s / target.s - 1) < 0.0005;
    return done ? { ...target, done: true } : { ...out, done: false };
  }
  // Box around a set of points, grown to at least `minSize` on each side.
  function boxOf(points, minSize = 0) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    if (!isFinite(x0)) return null;
    const gx = Math.max(0, minSize - (x1 - x0)) / 2, gy = Math.max(0, minSize - (y1 - y0)) / 2;
    return { x0: x0 - gx, y0: y0 - gy, x1: x1 + gx, y1: y1 + gy };
  }
  // 0..1 slider position <-> scale, logarithmic so each step feels the same.
  const scaleToSlider = (s, lim) => clamp(Math.log(s / lim.min) / Math.log(lim.max / lim.min), 0, 1);
  const sliderToScale = (v, lim) => lim.min * Math.pow(lim.max / lim.min, clamp(v, 0, 1));

  global.Camera = { limits, constrain, frame, whole, toScreen, toWorld, zoomAt, step, boxOf, scaleToSlider, sliderToScale };
})(typeof window !== 'undefined' ? window : globalThis);
