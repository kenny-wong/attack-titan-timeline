/* Route geometry: smooth curves through route waypoints, and positions along them.
   DOM-free (tested in Node); embedded into index.html by scripts/embed-src.mjs.
   Curves are Catmull-Rom splines converted to cubic Béziers, with the control arms clamped
   to a share of each segment so tight gate passages never overshoot through a wall. */
(function (global) {
  'use strict';
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const len = (a) => Math.hypot(a[0], a[1]);
  const clampLen = (v, max) => { const l = len(v); return l > max && l > 0 ? mul(v, max / l) : v; };
  const r1 = (n) => Math.round(n * 10) / 10;

  // Bézier segments through every point. smooth: 0 = straight polyline, 1 = classic Catmull-Rom.
  function segments(pts, smooth = 1) {
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      const span = len(sub(p2, p1)), arm = span * 0.38;
      const c1 = add(p1, clampLen(mul(sub(p2, p0), smooth / 6), arm));
      const c2 = sub(p2, clampLen(mul(sub(p3, p1), smooth / 6), arm));
      segs.push([p1, c1, c2, p2]);
    }
    return segs;
  }
  function pathD(segs) {
    if (!segs.length) return '';
    let d = `M${r1(segs[0][0][0])} ${r1(segs[0][0][1])}`;
    for (const [, c1, c2, p] of segs) d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p[0])} ${r1(p[1])}`;
    return d;
  }
  const bez = ([p0, c1, c2, p1], t) => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1]];
  };
  // A sampled lookup table: points with cumulative arc length.
  function sample(segs, perSeg = 24) {
    const pts = [], lens = [];
    let total = 0;
    segs.forEach((s, i) => {
      for (let k = i ? 1 : 0; k <= perSeg; k++) {
        const p = bez(s, k / perSeg);
        if (pts.length) total += len(sub(p, pts[pts.length - 1]));
        pts.push(p); lens.push(total);
      }
    });
    return { pts, lens, total: Math.max(total, 1e-6) };
  }
  // Point and heading (radians) at fraction f of the length.
  function at(tab, f) {
    const target = Math.max(0, Math.min(1, f)) * tab.total, L = tab.lens;
    let lo = 0, hi = L.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (L[mid] < target) lo = mid; else hi = mid; }
    const seg = L[hi] - L[lo] || 1, t = Math.max(0, Math.min(1, (target - L[lo]) / seg));
    const a = tab.pts[lo], b = tab.pts[hi];
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, angle: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  // Everything a route needs: SVG path data, total length, and a lookup table.
  function build(points, smooth = 1) {
    const pts = points.filter((p, i) => i === 0 || len(sub(p, points[i - 1])) > 0.01);
    if (pts.length < 2) { const p = pts[0] || [0, 0]; return { d: `M${r1(p[0])} ${r1(p[1])}`, total: 1e-6, tab: { pts: [p, p], lens: [0, 1e-6], total: 1e-6 } }; }
    const segs = segments(pts, smooth), tab = sample(segs);
    return { d: pathD(segs), total: tab.total, tab };
  }
  // SVG path data for the first fraction f of a route (the part already travelled).
  function slice(tab, f) {
    if (f <= 0) return '';
    const target = Math.min(1, f) * tab.total, P = tab.pts, L = tab.lens;
    let d = `M${r1(P[0][0])} ${r1(P[0][1])}`, i = 1;
    for (; i < P.length && L[i] <= target; i++) d += `L${r1(P[i][0])} ${r1(P[i][1])}`;
    if (i < P.length) { const p = at(tab, Math.min(1, f)); d += `L${r1(p.x)} ${r1(p.y)}`; }
    return d;
  }
  // Ease in and out (cubic), for movement along a route.
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  global.RouteGeo = { build, at, segments, sample, slice, ease };
})(typeof window !== 'undefined' ? window : globalThis);
