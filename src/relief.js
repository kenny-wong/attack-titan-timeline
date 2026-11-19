/* The height of the land: a grid of heights in world units built from the terrain layout (terrain.js).
   Plains lie low, hills roll, the northern mountains rise where the map has peaks; the ground is level
   under the Walls, the district towns and the named places, rivers run in shallow beds, and the sea
   floor falls away from the coast (height 0 is sea level). Everything that stands on the map - Walls,
   figures, labels, routes - asks this one module where the ground is.
   Deterministic and DOM-free (tested in Node). Needs RouteGeo for the river curves. */
(function (global) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const BASE = { sea: 0, plain: 0.9, forest: 1.3, sand: 0.55, hill: 3.4, mountain: 8.5, snow: 13, water: 0.6 };
  const hash = (i, j) => { let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  // Smooth value noise, 0..1.
  const noise = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  // The coast as the map draws it: rounded through the midpoints of the traced outline.
  function smoothCoast(coast, per = 4) {
    const n = coast.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], out = [];
    for (let i = 0; i < n; i++) {
      const p0 = mid(coast[(i + n - 1) % n], coast[i]), c = coast[i], p1 = mid(coast[i], coast[(i + 1) % n]);
      for (let k = 0; k < per; k++) { const t = k / per, u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]); }
    }
    return out;
  }

  function build(terrain, World, opts = {}) {
    const step = opts.step || 4, { W, H, C, R, DISTRICTS, inPoly } = World;
    const cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1, N = cols * rows;
    const data = new Float32Array(N), cd = new Float32Array(N);
    const each = (x, y, rad, fn) => { // grid nodes within rad of (x, y)
      const i0 = Math.max(0, Math.ceil((x - rad) / step)), i1 = Math.min(cols - 1, Math.floor((x + rad) / step)), j0 = Math.max(0, Math.ceil((y - rad) / step)), j1 = Math.min(rows - 1, Math.floor((y + rad) / step));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(i * step - x, j * step - y); if (d <= rad) fn(j * cols + i, d); }
    };

    // 1. Distance to the coast (positive on land), exact within a band of BAND units and clamped beyond.
    const BAND = 18, shore = smoothCoast(World.coast, 4), near = new Uint8Array(N);
    cd.fill(BAND);
    for (let k = 0; k < shore.length; k++) {
      const a = shore[k], b = shore[(k + 1) % shore.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(len / 2));
      for (let q = 0; q < n; q++) { const t = q / n; each(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, BAND, (o, d) => { if (d < cd[o]) cd[o] = d; near[o] = 1; }); }
    }
    // land or sea: worked out exactly near the coast; further away a node is on the same side as its neighbour (the coast always lies inside the band)
    for (let j = 0; j < rows; j++) {
      let inside = inPoly(World.coast, [0, j * step]);
      for (let i = 0; i < cols; i++) { const o = j * cols + i; if (near[o]) inside = inPoly(shore, [i * step, j * step]); if (!inside) cd[o] = -cd[o]; }
    }

    // 2. Rolling ground from the terrain classes, blended between cell centres.
    const gw = terrain.cols, gh = terrain.rows, base = new Float32Array(gw * gh), [ox, oy] = terrain.origin, cell = terrain.cell;
    for (const c of terrain.cells) base[c.j * gw + c.i] = BASE[c.c] ?? BASE.plain;
    const baseAt = (x, y) => {
      const gx = clamp((x - ox) / cell - 0.5, 0, gw - 1.001), gy = clamp((y - oy) / cell - 0.5, 0, gh - 1.001), i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j;
      const a = base[j * gw + i], b = base[j * gw + i + 1], c = base[(j + 1) * gw + i], d = base[(j + 1) * gw + i + 1];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * step, y = j * step, b = baseAt(x, y);
      data[j * cols + i] = b * (0.72 + 0.56 * noise(x / 46, y / 46)) + (noise(x / 13 + 40, y / 13 + 7) - 0.5) * Math.min(2.4, 0.35 + b * 0.22);
    }
    // 3. Hills and peaks stand where the map shows them. Neighbouring peaks join into ridges (the higher one wins).
    const bump = new Float32Array(N);
    for (const h of terrain.hills) { const rad = 9.5 * h.s, top = 5 * h.s; each(h.x, h.y - 2, rad, (o, d) => { const v = top * (0.5 + 0.5 * Math.cos((Math.PI * d) / rad)); if (v > bump[o]) bump[o] = v; }); }
    for (const p of terrain.peaks) { // broad shoulders, a sharper top, and ridges that wander
      const hv = hash(Math.round(p.x), Math.round(p.y)), rad = 22 * p.s * (0.8 + 0.5 * hv), top = (p.snow ? 30 : 20) * p.s * (0.35 + 0.95 * hv * hv); // a few great peaks among many lesser ones
      each(p.x, p.y - 3, rad, (o, d) => { const i = o % cols, j = (o - i) / cols, f = 1 - d / rad, v = top * (0.45 * f + 0.55 * f * f * f) * (0.72 + 0.56 * noise(i * step / 8 + 3, j * step / 8 + 11)); if (v > bump[o]) bump[o] = v; });
    }
    for (let o = 0; o < N; o++) data[o] += bump[o];

    // 4. Level ground under the Walls, the district towns and the places; river beds; the coast.
    const flats = [{ p: C, r: 21 }, ...terrain.places.map((pl) => ({ p: pl.p, r: pl.kind === 'seawall' ? 24 : 11 })), ...(opts.flats || []).map((p) => ({ p, r: 11 }))];
    const river = new Float32Array(N).fill(99);
    const RG = global.RouteGeo;
    for (const rv of terrain.rivers) { const tab = RG.build(rv.pts, 1).tab; for (const q of tab.pts) each(q[0], q[1], 10, (o, d) => { const v = d - rv.w * 0.55; if (v < river[o]) river[o] = v; }); }
    const lk = terrain.lake;
    each(lk.c[0], lk.c[1], lk.rx + 10, (o) => { const i = o % cols, j = (o - i) / cols, e = Math.hypot((i * step - lk.c[0]) / lk.rx, (j * step - lk.c[1]) / lk.ry); const v = (e - 1) * lk.ry; if (v < river[o]) river[o] = v; });
    const lvl = new Float32Array(N), pad = new Float32Array(N); // how level the ground is made: under Walls and districts, around places
    for (const d of DISTRICTS) each(d.centre[0], d.centre[1], d.depth * 0.5 + d.hw + 14, (o) => { const i = o % cols, j = (o - i) / cols, v = 1 - smooth(3, 13, d.sd([i * step, j * step])); if (v > lvl[o]) lvl[o] = v; });
    for (const f of flats) each(f.p[0], f.p[1], f.r * 1.5, (o, dist) => { const v = 1 - smooth(f.r * 0.7, f.r * 1.5, dist); if (v > pad[o]) pad[o] = v; });
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const o = j * cols + i, r = Math.hypot(i * step - C[0], j * step - C[1]);
      let h = data[o], l = lvl[o];
      if (r < R.maria + 18) for (const k in R) l = Math.max(l, 1 - smooth(7, 17, Math.abs(r - R[k])));
      h += (1 - h) * l;
      if (pad[o] > 0) h += (Math.min(h, 2.2) - h) * pad[o];
      if (river[o] < 9) h += (Math.min(h, 0.32) - h) * (1 - smooth(0, 7, river[o]));
      const d = cd[o];
      data[o] = d > 0 ? Math.max(0.06, h * smooth(0, 15, d)) + Math.min(d, 4) * 0.1 : Math.max(-5, d * 0.4);
    }

    // Height at any world point (bilinear between grid nodes; the open sea beyond the grid).
    const h = (x, y) => {
      const gx = x / step, gy = y / step;
      if (gx < 0 || gy < 0 || gx > cols - 1 || gy > rows - 1) return -5;
      const i = Math.min(cols - 2, Math.floor(gx)), j = Math.min(rows - 2, Math.floor(gy)), fx = gx - i, fy = gy - j, o = j * cols + i;
      const a = data[o], b = data[o + 1], c = data[o + cols], d = data[o + cols + 1];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
    const land = (x, y) => Math.max(0, h(x, y)); // where something stands: never below the water
    return { step, cols, rows, data, coastDist: cd, band: BAND, h, land, shore };
  }
  global.Relief = { build, smoothCoast, BASE };
})(typeof window !== 'undefined' ? window : globalThis);
