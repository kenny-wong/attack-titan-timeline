/* Population engine: ambient Pure Titans and civilians whose whereabouts follow the timeline.
   Embedded into index.html by scripts/embed-population.mjs (with POP_COAST and POP_MOTION prepended).
   Coordinates are app units (the original 520x510 space). Timeline position T = event index + scene progress.
   The core (create, stateAt, summary) is DOM-free so it can be tested in Node. */
(function (global) {
  'use strict';

  // ---- Geometry ----
  const MARIA = { c: [260, 217], rx: 244, ry: 215 }, ROSE = { c: [260, 209], rx: 173, ry: 146 }, SINA = { c: [260, 207], rx: 95, ry: 75 };
  const nr = (p, e) => Math.hypot((p[0] - e.c[0]) / e.rx, (p[1] - e.c[1]) / e.ry);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  const inPoly = (poly, [x, y]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  // District bulges to keep wandering figures off (Rose districts bulge into Maria territory, Sina's into Rose's).
  const ROSE_DISTRICTS = [[259, 362], [260, 56], [442, 208], [78, 209]];
  const SINA_DISTRICTS = [[259, 290], [358, 208], [259, 125], [162, 207]];
  const clearOf = (p, pts, r) => pts.every((q) => dist(p, q) > r);

  // Midline ellipses used to walk around a territory instead of through a wall.
  const RINGS = { outside: { c: [260, 217], rx: 276, ry: 247 }, maria: { c: [260, 213], rx: 208, ry: 180 }, rose: { c: [260, 208], rx: 134, ry: 110 }, sina: { c: [260, 207], rx: 48, ry: 38 } };
  // Gates between areas (waypoints listed in the a -> b direction).
  const LINKS = [
    ['outside', 'shig', [[259, 494], [259, 480], [259, 467]]],
    ['shig', 'maria', [[259, 425], [259, 409]]],
    ['maria', 'trost', [[259, 392], [259, 377]]],
    ['trost', 'rose', [[259, 344], [259, 328]]],
    ['maria', 'rose', [[462, 208], [441, 207], [420, 208]]],
    ['maria', 'rose', [[260, 40], [260, 58], [260, 78]]],
    ['maria', 'rose', [[58, 209], [79, 209], [100, 209]]],
    ['rose', 'sina', [[259, 302], [259, 288], [259, 272]]],
  ];
  // Areas a figure can live in. node = the walled territory it belongs to (for route finding).
  const ZONES = {
    outside: { node: 'outside' },
    maria: { node: 'maria' },
    rose: { node: 'rose' },
    sina: { node: 'sina' },
    shig: { node: 'shig', disk: [[259, 447], 12] },
    shigArea: { node: 'shig', disk: [[259, 445], 16] },
    trost: { node: 'trost', disk: [[259, 361], 10] },
    ragako: { node: 'rose', disk: [[168, 296], 15] },
    utgard: { node: 'rose', disk: [[165, 306], 10] }, // inside Wall Rose, near the wall
  };
  const ZONE_REGION = { outside: 'outside', maria: 'maria', rose: 'rose', sina: 'sina', shig: 'shig', shigArea: 'shig', trost: 'trost', ragako: 'rose', utgard: 'rose' };

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

  function makeWorld(coast) {
    const coastDist = (p) => { let m = Infinity; for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) { const a = coast[j], b = coast[i]; const dx = b[0] - a[0], dy = b[1] - a[1]; const t = clamp01(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)); m = Math.min(m, dist(p, [a[0] + dx * t, a[1] + dy * t])); } return m; };
    const inZone = (zone, p) => {
      const z = ZONES[zone];
      if (z.disk) return dist(p, z.disk[0]) <= z.disk[1];
      switch (zone) {
        case 'outside': return inPoly(coast, p) && coastDist(p) > 12 && nr(p, MARIA) > 1.12 && dist(p, [259, 452]) > 34;
        case 'maria': return nr(p, MARIA) < 0.94 && nr(p, ROSE) > 1.1 && clearOf(p, ROSE_DISTRICTS, 24);
        case 'rose': return nr(p, ROSE) < 0.92 && nr(p, SINA) > 1.12 && clearOf(p, SINA_DISTRICTS, 20);
        case 'sina': return nr(p, SINA) < 0.8 && dist(p, [259, 203]) > 11;
      }
      return false;
    };
    const bbox = { x0: Math.min(...coast.map((p) => p[0])), x1: Math.max(...coast.map((p) => p[0])), y0: Math.min(...coast.map((p) => p[1])), y1: Math.max(...coast.map((p) => p[1])) };
    const sample = (zone, r, near, radius) => {
      const z = ZONES[zone];
      for (let i = 0; i < 4000; i++) {
        let p;
        if (near) { const a = r() * Math.PI * 2, d = radius * Math.sqrt(r()); p = [near[0] + Math.cos(a) * d, near[1] + Math.sin(a) * d]; }
        else if (z.disk) { const a = r() * Math.PI * 2, d = z.disk[1] * Math.sqrt(r()); p = [z.disk[0][0] + Math.cos(a) * d, z.disk[0][1] + Math.sin(a) * d]; }
        else p = [bbox.x0 + r() * (bbox.x1 - bbox.x0), bbox.y0 + r() * (bbox.y1 - bbox.y0)];
        if (inZone(zone, p) && (!near || inZone(zone, lerp(near, p, 0.5)))) return p;
      }
      return near || (z.disk ? z.disk[0] : RINGS[zone] ? [RINGS[zone].c[0], RINGS[zone].c[1] + RINGS[zone].ry] : [259, 203]);
    };
    return { inZone, sample };
  }

  // ---- Route finding through gates ----
  const ang = (ring, p) => Math.atan2((p[1] - ring.c[1]) / ring.ry, (p[0] - ring.c[0]) / ring.rx);
  function arc(node, p0, p1) {
    const ring = RINGS[node];
    if (!ring) return [];
    const a0 = ang(ring, p0), d = wrap(ang(ring, p1) - a0), n = Math.floor(Math.abs(d) / 0.2), out = [];
    for (let i = 1; i <= n; i++) { const a = a0 + (d * i) / (n + 1); out.push([ring.c[0] + ring.rx * Math.cos(a), ring.c[1] + ring.ry * Math.sin(a)]); }
    return out;
  }
  const polyLen = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]); return s; };
  function route(fromNode, A, toNode, B) {
    let best = null;
    const walk = (node, pts, seen) => {
      if (pts.length > 60) return;
      if (node === toNode) { const full = [...pts, ...arc(node, pts[pts.length - 1], B), B]; const len = polyLen(full); if (!best || len < best.len) best = { pts: full, len }; return; }
      for (const [a, b, wp] of LINKS) {
        let next, way;
        if (a === node && !seen.has(b)) { next = b; way = wp; } else if (b === node && !seen.has(a)) { next = a; way = [...wp].reverse(); } else continue;
        walk(next, [...pts, ...arc(node, pts[pts.length - 1], way[0]), ...way], new Set([...seen, next]));
      }
    };
    walk(fromNode, [A], new Set([fromNode]));
    return best ? best.pts : [A, B];
  }
  function pathMetrics(pts) { const ls = []; let total = 0; for (let i = 1; i < pts.length; i++) { const n = dist(pts[i - 1], pts[i]); ls.push(n); total += n; } return { pts, ls, total: Math.max(0.001, total) }; }
  function pathAt(m, f) { let rem = m.total * clamp01(f); for (let i = 0; i < m.ls.length; i++) { if (rem <= m.ls[i]) return lerp(m.pts[i], m.pts[i + 1], m.ls[i] ? rem / m.ls[i] : 0); rem -= m.ls[i]; } return m.pts[m.pts.length - 1]; }

  // ---- The cast of extras and their story script ----
  const DEFAULT_MOTION = {
    titan: { walkFps: 2.4, bobAmplitude: 0.9, swayDegrees: 4, idleSwayDegrees: 2, idleSwayPeriod: 3.2, wanderSpeed: 5, displayScale: 0.5, opacity: 0.96 },
    civilian: { walkFps: 6, bobAmplitude: 0.5, swayDegrees: 2, idleSwayDegrees: 0.6, idleSwayPeriod: 2.2, wanderSpeed: 3.5, fleeWalkFps: 8, displayScale: 0.5, opacity: 0.95 },
  };

  function create(events, coast, motion) {
    motion = { titan: { ...DEFAULT_MOTION.titan, ...(motion && motion.titan) }, civilian: { ...DEFAULT_MOTION.civilian, ...(motion && motion.civilian) } };
    const world = makeWorld(coast);
    const idx = (id) => { const i = events.findIndex((e) => e.id === id); if (i < 0) throw new Error('Unknown event ' + id); return i; };
    const T = (id, p) => idx(id) + p;
    const agents = [];
    const add = (kind, n, zone, opt = {}) => {
      const list = [];
      for (let i = 0; i < n; i++) {
        const id = agents.length, r = rng(9173 + id * 7919);
        const a = { id, kind, variant: 1 + Math.floor(r() * 4), r, zone0: zone, vis0: opt.hidden ? 0 : 1, still: !!opt.still, ops: [], phase: r() * 10 };
        a.home0 = world.sample(zone, r);
        agents.push(a); list.push(a);
      }
      return list;
    };
    // Spread a window over a group so they move as a stream, not in lockstep.
    const stagger = (list, p0, p1, spread, fn) => {
      const order = list.map((a, i) => [a, ((a.id * 2654435761) >>> 0) / 4294967296, i]).sort((x, y) => x[1] - y[1]);
      order.forEach(([a], k) => { const u = order.length > 1 ? k / (order.length - 1) : 0; const s = p0 + (p1 - p0) * spread * u; fn(a, s, s + (p1 - p0) * (1 - spread)); });
    };
    const move = (list, id, p0, p1, zone, opt = {}) => stagger(list, p0, p1, opt.spread ?? 0.5, (a, s, e) => a.ops.push({ type: 'move', T0: T(id, s), T1: T(id, e), zone, straight: !!opt.straight, flee: !!opt.flee }));
    const fade = (list, id, p0, p1, v, spread = 0.4) => stagger(list, p0, p1, spread, (a, s, e) => a.ops.push({ type: 'fade', T0: T(id, s), T1: T(id, e), v }));

    // Pure Titans
    const tOut = add('titan', 22, 'outside', { hidden: true });
    fade(tOut, 'founding', 0.45, 1, 1, 0.6); // after the Walls rise, Titans roam the land outside
    const tA = tOut.slice(0, 6), tB = tOut.slice(6, 18), tC = tOut.slice(18);
    move(tA, 'maria-fall', 0.34, 0.54, 'shig', { spread: 0.4 }); // through the broken outer gate
    move(tA, 'maria-fall', 0.66, 0.96, 'maria', { spread: 0.5 }); // through the broken inner gate
    move(tB, 'maria-fall', 0.68, 1, 'maria', { spread: 0.6 });
    const tD = [...tA.slice(0, 3), ...tB.slice(0, 3)];
    move(tD, 'trost-attack', 0.42, 0.8, 'trost', { spread: 0.4 }); // into Trost through its outer gate
    fade(tD, 'trost-seal', 0.6, 0.95, 0, 0.5); // cleared after the gate is sealed
    fade([...tA, ...tB, ...tC].filter((a) => !tD.includes(a)), 'sea', 0.12, 0.9, 0, 0.7); // most remaining Titans are eliminated by 851
    const tRag = add('titan', 5, 'ragako', { hidden: true });
    fade(tRag, 'ragako', 0.34, 0.56, 1, 0.4); // villagers turned into Titans inside Wall Rose
    const tRagGo = tRag.slice(1);
    move(tRagGo, 'ragako', 0.62, 1, 'utgard', { spread: 0.4 });
    fade(tRagGo, 'utgard', 0.7, 0.96, 0, 0.5);
    // One stays in the village, lying down, unable to move (found there by the Scouts; still there in 854).
    Object.assign(tRag[0], { still: true, lying: true, home0: [170, 300] });
    fade(tRag.slice(0, 1), 'alliance', 0.86, 0.98, 0);
    const tZeke = add('titan', 7, 'shigArea', { hidden: true });
    fade(tZeke, 'zeke-scream', 0.32, 0.56, 1, 0.5); // Zeke's scream inside Shiganshina
    fade(tZeke, 'alliance', 0.86, 1, 0, 0.4); // the Titans' power ends and they turn back into people

    // Civilians
    const cShig = add('civilian', 4, 'shig');
    move(cShig, 'maria-fall', 0.42, 0.95, 'rose', { spread: 0.4, flee: true });
    move(cShig, 'sea', 0.55, 1, 'shig', { spread: 0.4 });
    move(cShig, 'zeke-scream', 0.3, 0.75, 'maria', { spread: 0.3, flee: true });
    move(cShig, 'ambassadors', 0.1, 0.6, 'shig', { spread: 0.3, straight: true });
    const cMaria = add('civilian', 14, 'maria');
    move(cMaria, 'maria-fall', 0.48, 1, 'rose', { spread: 0.6, flee: true }); // retreat behind Wall Rose through its gates
    const back = cMaria.slice(0, 10);
    move(back, 'sea', 0.4, 1, 'maria', { spread: 0.6 }); // resettling reclaimed Maria
    move(back.slice(0, 5), 'ambassadors', 0.3, 1, 'outside', { spread: 0.5, straight: true }); // the Walls are gone
    const cTrost = add('civilian', 3, 'trost');
    move(cTrost, 'trost-attack', 0.2, 0.6, 'rose', { spread: 0.3, flee: true });
    move(cTrost, 'annie-mp', 0.1, 0.7, 'trost', { spread: 0.3 });
    add('civilian', 12, 'rose');
    const cRag = add('civilian', 4, 'ragako');
    fade(cRag, 'ragako', 0.28, 0.46, 0, 0.3);
    fade(cRag.slice(0, 1), 'alliance', 0.9, 1, 1);
    add('civilian', 11, 'sina');

    // Resolve homes and routes in timeline order.
    const wallsGoneAt = T('rumbling', 0.43);
    for (const a of agents) {
      a.ops.sort((x, y) => x.T0 - y.T0);
      let zone = a.zone0, home = a.home0;
      for (const op of a.ops) {
        if (op.type !== 'move') continue;
        op.fromZone = zone; op.from = home;
        op.home = world.sample(op.zone, a.r);
        const straight = op.straight || op.T0 >= wallsGoneAt;
        op.path = pathMetrics(straight ? [home, op.home] : route(ZONES[zone].node, home, ZONES[op.zone].node, op.home));
        zone = op.zone; home = op.home;
      }
    }
    const loops = new Map();
    const wanderLoop = (a, zone, home) => {
      const key = a.id + '|' + home[0].toFixed(2) + ',' + home[1].toFixed(2);
      let L = loops.get(key);
      if (L) return L;
      const m = a.kind === 'titan' ? motion.titan : motion.civilian, r = rng(a.id * 131 + Math.round(home[0] * 7 + home[1] * 13));
      const radius = a.kind === 'titan' ? 26 : 13, pts = [home];
      for (let i = 0; i < 4; i++) pts.push(world.sample(zone, r, pts[pts.length - 1], radius));
      const chain = [...pts, ...pts.slice(1, -1).reverse()]; // there and back, so every leg stays inside the area
      const legs = []; let t = 0;
      for (let i = 0; i < chain.length; i++) {
        const p = chain[i], q = chain[(i + 1) % chain.length], pause = 0.6 + r() * (a.kind === 'titan' ? 2.6 : 2.0), walk = dist(p, q) / m.wanderSpeed;
        legs.push({ p, q, t0: t, tw: t + pause, t1: t + pause + walk }); t += pause + walk;
      }
      L = { legs, period: Math.max(0.1, t) }; loops.set(key, L);
      return L;
    };
    const wanderPos = (a, zone, home, t, still) => {
      if (still) return { p: home, walking: false };
      const L = wanderLoop(a, zone, home), tt = (((t + a.phase * 3) % L.period) + L.period) % L.period;
      for (const g of L.legs) if (tt < g.t1) return tt < g.tw ? { p: g.p, walking: false } : { p: lerp(g.p, g.q, smooth((tt - g.tw) / (g.t1 - g.tw))), walking: true };
      return { p: home, walking: false };
    };

    // State of one figure at timeline T and real time t (seconds).
    function stateAt(a, Tl, t, opts = {}) {
      let zone = a.zone0, home = a.home0, vis = a.vis0, mv = null;
      for (const op of a.ops) {
        if (Tl < op.T0) break;
        const f = (Tl - op.T0) / Math.max(1e-6, op.T1 - op.T0);
        if (op.type === 'fade') vis = f >= 1 ? op.v : vis + (op.v - vis) * smooth(f);
        else if (f >= 1) { zone = op.zone; home = op.home; }
        else mv = { op, f };
      }
      const still = a.still || opts.reduced;
      if (mv) {
        const { op, f } = mv, base = pathAt(op.path, smooth(f));
        const w0 = wanderPos(a, op.fromZone, op.from, t, still).p, w1 = wanderPos(a, op.zone, op.home, t, still).p;
        const p = lerp(lerp(w0, base, smooth(f / 0.12)), w1, smooth((f - 0.88) / 0.12));
        return { x: p[0], y: p[1], vis, migrating: true, flee: op.flee, zone: f < 0.5 ? op.fromZone : op.zone };
      }
      const w = wanderPos(a, zone, home, t, still);
      return { x: w.p[0], y: w.p[1], vis, walking: w.walking, zone };
    }

    // Where the Titans and civilians are at timeline T (areas with at least one visible figure).
    function summary(Tl) {
      const out = { titan: new Set(), civilian: new Set() };
      for (const a of agents) { const s = stateAt(a, Tl, 0, { reduced: true }); if (s.vis > 0.5) out[a.kind].add(a.lying ? 'ragakoFixed' : ZONE_REGION[s.zone]); }
      return out;
    }
    return { agents, stateAt, summary, motion, world };
  }

  // ---- Rendering (browser only) ----
  function renderer(pop) {
    const NS = 'http://www.w3.org/2000/svg';
    let els = [], lastSort = 0, layer = null;
    const prev = new Map();
    function mount(g, mopts = {}) {
      layer = g; els = [];
      for (const a of pop.agents) {
        const u = document.createElementNS(NS, 'use');
        const isT = a.kind === 'titan';
        u.setAttribute('href', `#pop-${isT ? 'titan' : 'civ'}-${a.variant}a`);
        u.setAttribute('x', isT ? -16 : -12); u.setAttribute('y', isT ? -32 : -16);
        u.setAttribute('width', isT ? 32 : 24); u.setAttribute('height', isT ? 34 : 18);
        u.setAttribute('class', 'pop-agent ' + (isT ? 'pop-titan' : 'pop-civ') + (a.lying ? ' pop-lying' : ''));
        if (a.lying) {
          u.setAttribute('href', '#pop-titan-lying'); u.setAttribute('x', -22); u.setAttribute('y', -14); u.setAttribute('width', 44); u.setAttribute('height', 16);
          if (mopts.lyingLabel) { const ti = document.createElementNS(NS, 'title'); ti.textContent = mopts.lyingLabel; u.appendChild(ti); u.setAttribute('aria-label', mopts.lyingLabel); u.setAttribute('role', 'img'); }
          if (mopts.onLyingClick) { u.style.pointerEvents = 'auto'; u.style.cursor = 'pointer'; u.addEventListener('click', () => mopts.onLyingClick(a)); }
        }
        u.style.display = 'none';
        g.appendChild(u); els.push({ a, u, href: '', y: 0 });
      }
    }
    function frame(Tl, t, opts) {
      if (!layer) return;
      layer.style.display = opts.on ? '' : 'none';
      if (!opts.on) return;
      for (const e of els) {
        const { a, u } = e, m = a.kind === 'titan' ? pop.motion.titan : pop.motion.civilian, s = pop.stateAt(a, Tl, t, opts);
        if (s.vis < 0.02) { if (u.style.display !== 'none') u.style.display = 'none'; continue; }
        if (u.style.display === 'none') u.style.display = '';
        if (a.lying) { // no walking or swaying: a slow breath only
          const k = m.displayScale * opts.scale * 1.6, br = opts.reduced ? 1 : 1 + Math.sin((t / 4.2 + a.phase) * Math.PI * 2) * 0.035;
          u.setAttribute('transform', `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) scale(${k.toFixed(3)} ${(k * br).toFixed(3)})`);
          u.style.opacity = (s.vis * m.opacity).toFixed(2); e.y = s.y; continue;
        }
        const pv = prev.get(a.id); let face = pv ? pv.face : 1, walking = !!s.walking;
        if (pv) { const dx = s.x - pv.x, dy = s.y - pv.y, sp = Math.hypot(dx, dy); if (sp > 0.02) { walking = true; if (Math.abs(dx) > 0.01) face = dx > 0 ? 1 : -1; } else if (s.migrating) walking = false; }
        prev.set(a.id, { x: s.x, y: s.y, face });
        const fps = walking ? (s.flee && m.fleeWalkFps ? m.fleeWalkFps : m.walkFps) : 0, step = fps && !opts.reduced ? Math.floor(t * fps + a.phase) % 2 : 0;
        const href = `#pop-${a.kind === 'titan' ? 'titan' : 'civ'}-${a.variant}${step ? 'b' : 'a'}`;
        if (href !== e.href) { u.setAttribute('href', href); e.href = href; }
        const bob = walking && !opts.reduced ? -Math.abs(Math.sin((t * fps + a.phase) * Math.PI)) * m.bobAmplitude : 0;
        const sway = opts.reduced ? 0 : walking ? Math.sin((t * fps + a.phase) * Math.PI) * m.swayDegrees : Math.sin((t / m.idleSwayPeriod + a.phase) * Math.PI * 2) * m.idleSwayDegrees;
        const k = m.displayScale * opts.scale;
        u.setAttribute('transform', `translate(${s.x.toFixed(1)} ${(s.y + bob).toFixed(1)}) scale(${(face * k).toFixed(3)} ${k.toFixed(3)}) rotate(${sway.toFixed(1)})`);
        u.style.opacity = (s.vis * m.opacity).toFixed(2);
        e.y = s.y;
      }
      if (t - lastSort > 0.4) { lastSort = t; els.slice().sort((p, q) => p.y - q.y).forEach((e) => layer.appendChild(e.u)); }
    }
    return { mount, frame };
  }

  global.Population = { create, renderer, route, ZONES, LINKS };
})(typeof window !== 'undefined' ? window : globalThis);
