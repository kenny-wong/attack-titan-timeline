/* Crowd simulation: Pure Titans, civilians, Survey Corps riders, wall cannons and the Wall Titans.
   Where everyone is follows the timeline (T = event index + scene progress), so scrubbing is exact;
   wandering, fleeing and chasing are added in real time on top.
   - About 300 Titans start outside Wall Maria. They gather where people are: around the districts
     that jut out of the Wall, most of all Shiganshina in the south, where new Titans arrive from.
   - Only some of them get in when a gate breaks; the total stays the same until Titans are killed.
   - Civilians live inside the Walls, retreat through the gates and resettle when land is won back.
   World units and geometry come from world.js. DOM-free (tested in Node). */
(function (global) {
  'use strict';
  const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const wrapDeg = (a) => { while (a > 180) a -= 360; while (a < -180) a += 360; return a; };
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

  function create(events, World, opts = {}) {
    const { C, R, DISTRICTS, at, dist, rOf, degOf, district, onLand, coastDist, coastAt } = World;
    const N = { titans: 300, civilians: 150, riders: 10, wallTitans: 150, ...(opts.counts || {}) };
    const idx = (id) => { const i = events.findIndex((e) => e.id === id); if (i < 0) throw new Error('Unknown event ' + id); return i; };
    const T = (id, p) => idx(id) + p;

    // ---- Areas ----
    const REGIONS = ['outside', 'maria', 'rose', 'sina'];
    const RING = { outside: R.maria + 34, maria: (R.maria + R.rose) / 2, rose: (R.rose + R.sina) / 2, sina: 68 };
    const clearOf = (p, wall, pad) => DISTRICTS.every((d) => d.wall !== wall || dist(p, d.base) > d.r + pad);
    const inArea = (area, p) => {
      const d = district(area);
      if (d) return rOf(p) > R[d.wall] + 2 && dist(p, d.base) < d.r - 3;
      if (area === 'ragako') return dist(p, at(172, 114)) < 11;
      if (area === 'utgard') return dist(p, at(174, 134)) < 10 && rOf(p) < R.rose - 5;
      if (area === 'shigRing') { const r = rOf(p), a = Math.abs(wrapDeg(degOf(p) - 90)); return r < R.maria - 6 && r > R.maria - 44 && a < 26 && clearOf(p, 'rose', 6); } // Maria side of Shiganshina's inner gate
      const r = rOf(p);
      if (area === 'outside') return r > R.maria + 7 && clearOf(p, 'maria', 5) && onLand(p) && coastDist(p) > 9;
      if (area === 'maria') return r < R.maria - 6 && r > R.rose + 7 && clearOf(p, 'rose', 5);
      if (area === 'rose') return r < R.rose - 6 && r > R.sina + 7 && clearOf(p, 'sina', 5);
      if (area === 'sina') return r < R.sina - 6 && r > 11;
      return false;
    };
    const regionOfArea = (area) => { const d = district(area); return d ? d.id : area === 'ragako' || area === 'utgard' ? 'rose' : area === 'shigRing' ? 'maria' : area; };
    const box = (area) => {
      const d = district(area);
      if (d) return [d.base[0] - d.r, d.base[1] - d.r, d.base[0] + d.r, d.base[1] + d.r];
      if (area === 'ragako' || area === 'utgard') { const c = at(173, 124); return [c[0] - 40, c[1] - 40, c[0] + 40, c[1] + 40]; }
      const rr = area === 'outside' ? null : area === 'sina' ? R.sina : area === 'rose' ? R.rose : R.maria;
      return rr ? [C[0] - rr, C[1] - rr, C[0] + rr, C[1] + rr] : [0, 0, World.W, World.H];
    };
    // Random point of an area; `weight(p)` (0..1) makes some places likelier; `near` keeps it close to a point.
    const sample = (area, r, o = {}) => {
      const b = box(area);
      for (let i = 0; i < 6000; i++) {
        let p;
        if (o.near) { const a = r() * Math.PI * 2, d = o.radius * Math.sqrt(r()); p = [o.near[0] + Math.cos(a) * d, o.near[1] + Math.sin(a) * d]; }
        else p = [b[0] + r() * (b[2] - b[0]), b[1] + r() * (b[3] - b[1])];
        if (!inArea(area, p)) continue;
        if (o.near && !inArea(area, lerp(o.near, p, 0.5))) continue;
        if (o.weight && r() > o.weight(p)) continue;
        return p;
      }
      return o.near || district(area)?.centre || at(RING[area] || 60, 90);
    };

    // ---- Where Titans gather: near people ----
    const landingCoast = coastAt(84, -5);
    const pull = (centres, L) => (p) => { let w = 0.015; for (const [c, k] of centres) w += k * Math.exp(-dist(p, c) / L); return Math.min(1, w); };
    const outsidePull = pull([[district('shig').outer, 1.0], [district('holst').outer, 0.3], [district('quinta').outer, 0.3], [district('mariaN').outer, 0.2], [landingCoast, 0.7]], 85); // most arrive on the south coast and head for Shiganshina
    const mariaPull = pull([[district('trost').outer, 1.0], [district('karanes').outer, 0.5], [district('klorva').outer, 0.5], [district('utopia').outer, 0.4], [district('shig').inner, 0.25]], 70);

    // ---- Routes through the gates ----
    const NODES = {};
    for (const reg of REGIONS) NODES[reg] = { ring: RING[reg] };
    const ORDER = { maria: ['outside', 'maria'], rose: ['maria', 'rose'], sina: ['rose', 'sina'] };
    const LINKS = [];
    for (const d of DISTRICTS) {
      NODES[d.id] = { district: d };
      const [outerReg, innerReg] = ORDER[d.wall];
      LINKS.push([outerReg, d.id, [d.beyond, d.outer]], [d.id, innerReg, [d.inner, d.within]]);
    }
    const arc = (node, p0, p1) => {
      const ring = NODES[node]?.ring;
      if (!ring) return [];
      const a0 = degOf(p0), d = wrapDeg(degOf(p1) - a0), n = Math.floor(Math.abs(d) / 11), out = [];
      const r0 = rOf(p0), r1 = rOf(p1);
      for (let i = 1; i <= n; i++) { const f = i / (n + 1), rr = ring + (r0 - ring) * Math.pow(1 - f, 2.2) + (r1 - ring) * Math.pow(f, 2.2); out.push(at(Math.max(node === 'sina' ? 20 : 0, rr), a0 + d * f)); }
      return out;
    };
    const polyLen = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]); return s; };
    function route(fromArea, A, toArea, B, via) {
      const from = regionOfArea(fromArea), to = regionOfArea(toArea);
      let best = null;
      const walk = (node, pts, seen) => {
        if (seen.size > 7) return;
        if (node === to) { const full = [...pts, ...arc(node, pts[pts.length - 1], B), B], len = polyLen(full); if (!best || len < best.len) best = { pts: full, len }; return; }
        for (const [a, b, wp] of LINKS) {
          let next, way;
          if (a === node && !seen.has(b)) { next = b; way = wp; } else if (b === node && !seen.has(a)) { next = a; way = [...wp].reverse(); } else continue;
          const gate = NODES[next].district || NODES[node].district;
          if (via && gate && !via.includes(gate.id)) continue;
          walk(next, [...pts, ...arc(node, pts[pts.length - 1], way[0]), ...way], new Set([...seen, next]));
        }
      };
      walk(from, [A], new Set([from]));
      return best ? best.pts : [A, B];
    }
    const metrics = (pts) => { const ls = []; let total = 0; for (let i = 1; i < pts.length; i++) { const n = dist(pts[i - 1], pts[i]); ls.push(n); total += n; } return { pts, ls, total: Math.max(0.001, total) }; };
    const along = (m, f) => { let rem = m.total * clamp01(f); for (let i = 0; i < m.ls.length; i++) { if (rem <= m.ls[i]) return lerp(m.pts[i], m.pts[i + 1], m.ls[i] ? rem / m.ls[i] : 0); rem -= m.ls[i]; } return m.pts[m.pts.length - 1]; };

    // ---- Agents and the story script ----
    const agents = [];
    const add = (kind, n, area, o = {}) => {
      const list = [];
      for (let i = 0; i < n; i++) {
        const id = agents.length, r = rng(9173 + id * 7919);
        const a = { id, kind, r, variant: 1 + Math.floor(r() * (kind === 'titan' ? 5 : 4)), area0: area, vis0: o.hidden ? 0 : 1, ops: [], phase: r() * 10, speed: 0.75 + r() * 0.5 };
        if (kind === 'titan' && r() < 0.07) a.variant = 6; // a few abnormals on all fours
        a.home0 = o.at ? o.at(i, r) : sample(area, r, { weight: o.weight });
        agents.push(a); list.push(a);
      }
      return list;
    };
    const stagger = (list, p0, p1, spread, fn) => {
      const order = list.map((a) => [a, ((a.id * 2654435761) >>> 0) / 4294967296]).sort((x, y) => x[1] - y[1]);
      order.forEach(([a], k) => { const u = order.length > 1 ? k / (order.length - 1) : 0, s = p0 + (p1 - p0) * spread * u; fn(a, s, s + (p1 - p0) * (1 - spread)); });
    };
    // Windows may run across events: give [idA, pA] and [idB, pB].
    const win = (a, b) => [T(a[0], a[1]), T(b[0], b[1])];
    const move = (list, from, to, area, o = {}) => { const [t0, t1] = win(from, to); stagger(list, t0, t1, o.spread ?? 0.55, (a, s, e) => a.ops.push({ type: 'move', T0: s, T1: e, area, via: o.via, straight: !!o.straight, flee: !!o.flee, weight: o.weight, near: o.near, radius: o.radius })); };
    const fade = (list, from, to, v, o = {}) => { const [t0, t1] = win(from, to); stagger(list, t0, t1, o.spread ?? 0.6, (a, s, e) => a.ops.push({ type: 'fade', T0: s, T1: e, v, how: o.how || (v ? 'appear' : 'leave') })); };
    const kill = (list, from, to, o = {}) => fade(list, from, to, 0, { ...o, how: 'kill' });
    const nearest = (list, p, n) => [...list].sort((a, b) => dist(a.cur, p) - dist(b.cur, p)).slice(0, n);
    const take = (pool, picked) => { for (const a of picked) pool.splice(pool.indexOf(a), 1); return picked; };
    const setCur = (list, fn) => list.forEach((a) => (a.cur = fn ? fn(a) : a.home0));

    // Pure Titans: about 300 outside, drawn towards the districts.
    const titans = add('titan', N.titans, 'outside', { hidden: true, weight: outsidePull });
    setCur(titans);
    fade(titans, ['founding', 0.4], ['founding', 1], 1, { spread: 0.7 });
    const SHIG = district('shig'), TROST = district('trost');
    const outside = [...titans], inMaria = [];
    // The crawling Titan: its limbs are too small to walk, so it drags itself from the south coast towards the Walls for years.
    // The Scouts find it in 851 on their way to the sea. It is one of the 300.
    const PT = opts.points || {};
    if (PT.crawlFrom && PT.crawlTo) {
      const crawler = take(outside, nearest(outside, PT.crawlFrom, 1))[0];
      Object.assign(crawler, { still: true, lying: true, home0: PT.crawlFrom, cur: PT.crawlFrom, crawl: { from: PT.crawlFrom, to: PT.crawlTo, T0: T('grisha', 0), T1: T('sea', 0.55) } });
      kill([crawler], ['sea', 0.72], ['sea', 0.82]);
    }
    // 845: the gates break. Those nearest get in first; the stream goes on for years. About 110 in all.
    const first = take(outside, nearest(outside, SHIG.outer, 30));
    move(first, ['maria-fall', 0.36], ['maria-fall', 0.64], 'shig', { via: ['shig'], spread: 0.45 });
    move(first, ['maria-fall', 0.68], ['maria-fall', 1], 'maria', { via: ['shig'], weight: mariaPull });
    const second = take(outside, nearest(outside, SHIG.outer, 42));
    move(second, ['maria-fall', 0.7], ['refugees', 0.6], 'maria', { via: ['shig'], weight: mariaPull, spread: 0.7 });
    const third = take(outside, nearest(outside, SHIG.outer, 38));
    move(third, ['refugees', 0.3], ['cadets', 0.6], 'maria', { via: ['shig'], weight: mariaPull, spread: 0.8 });
    inMaria.push(...first, ...second, ...third);
    // their homes after entering are resolved below; use Trost as the reference for "nearest" until then
    setCur(inMaria, (a) => lerp(a.home0, TROST.outer, 0.8));
    // 846: the refugee column sent out through Trost draws the Titans nearest to it.
    const drawn = nearest([...first, ...second], TROST.outer, 22);
    move(drawn, ['reclamation', 0.22], ['reclamation', 0.7], 'maria', { near: TROST.beyond, radius: 30, spread: 0.5 });
    kill(take(inMaria, inMaria.filter((_, i) => i % 13 === 5)), ['cadets', 0.2], ['cadets', 0.9]); // early Survey Corps expeditions
    // 850: Trost. The Titans nearest the broken outer gate pour in and are all killed once it is sealed.
    const trostTitans = take(inMaria, nearest(inMaria, TROST.outer, 26));
    move(trostTitans, ['trost-attack', 0.42], ['trost-attack', 0.88], 'trost', { via: ['trost'], spread: 0.5 });
    kill(trostTitans, ['trost-seal', 0.45], ['trost-seal', 0.96]);
    kill(take(inMaria, nearest(inMaria, at(214, 42), 6)), ['female-forest', 0.2], ['female-forest', 0.72]); // 57th expedition
    // Autumn 850: the Trost "executioner" lures and kills Titans night after night.
    const lured = take(inMaria, nearest(inMaria, TROST.outer, 30));
    move(lured, ['rod', 0], ['rod', 0.7], 'maria', { near: TROST.beyond, radius: 16, spread: 0.6 });
    kill(lured, ['rod', 0.25], ['rod', 0.98]);
    // The battle of Shiganshina: Zeke's Titans ring the district and Levi cuts them down.
    const ringed = take(inMaria, nearest(inMaria, SHIG.inner, 30));
    move(ringed, ['maria-retaken', 0.22], ['maria-retaken', 0.5], 'shigRing', { spread: 0.4 });
    kill(ringed, ['maria-retaken', 0.58], ['maria-retaken', 0.86]);
    kill(take(outside, nearest(outside, SHIG.outer, 20)), ['maria-retaken', 0.4], ['maria-retaken', 0.95]);
    // 851: the island is cleared, the nearest first, as the Scouts ride for the sea.
    kill(inMaria, ['sea', 0], ['sea', 0.4]);
    const bySouth = [...outside].sort((a, b) => dist(a.home0, SHIG.outer) - dist(b.home0, SHIG.outer));
    bySouth.forEach((a, i) => { const s = 0.04 + 0.82 * (i / bySouth.length); a.ops.push({ type: 'fade', T0: T('sea', s), T1: T('sea', s + 0.09), v: 0, how: 'kill' }); });
    // 850: Ragako. Villagers become Titans inside Wall Rose; all but one walk to Utgard and die there.
    const rag = add('titan', 22, 'ragako', { hidden: true });
    fade(rag, ['ragako', 0.34], ['ragako', 0.56], 1, { spread: 0.4 });
    Object.assign(rag[0], { still: true, lying: true, home0: at(172, 114) }); // one stays, lying in the village, unable to move
    const ragGo = rag.slice(1);
    move(ragGo, ['ragako', 0.62], ['ragako', 1], 'utgard', { spread: 0.4 });
    kill(ragGo.slice(0, 17), ['utgard', 0.5], ['utgard', 0.96]);
    kill(ragGo.slice(17), ['reveal-escape', 0], ['reveal-escape', 0.5]);
    fade(rag.slice(0, 1), ['alliance', 0.86], ['alliance', 0.98], 0);
    // 854: Zeke's scream in Shiganshina.
    const scream = add('titan', 30, 'shig', { hidden: true });
    fade(scream, ['zeke-scream', 0.32], ['zeke-scream', 0.56], 1, { spread: 0.5 });
    kill(scream.slice(0, 18), ['zeke-scream', 0.72], ['rumbling', 0.4]);
    fade(scream.slice(18), ['alliance', 0.86], ['alliance', 1], 0); // the Titans' power ends and they turn back into people

    // Civilians. Shares: Sina, Rose and Maria territory plus the twelve districts.
    const nc = N.civilians, per = Math.max(2, Math.round(nc * 0.016));
    const civD = {};
    for (const d of DISTRICTS) civD[d.id] = add('civ', d.id === 'shig' || d.id === 'trost' ? per + 2 : per, d.id);
    const left = nc - agents.filter((a) => a.kind === 'civ').length;
    const civSina = add('civ', Math.round(left * 0.3), 'sina'), civRose = add('civ', Math.round(left * 0.37), 'rose'), civMaria = add('civ', left - civSina.length - civRose.length, 'maria');
    const ragCiv = add('civ', 5, 'ragako');
    // 845: Maria falls. Shiganshina first, then the whole territory flees behind Wall Rose; some do not make it.
    move(civD.shig, ['maria-fall', 0.4], ['maria-fall', 0.92], 'rose', { flee: true, spread: 0.4 });
    const mariaFolk = [...civMaria, ...civD.holst, ...civD.quinta, ...civD.mariaN];
    const lost = mariaFolk.filter((_, i) => i % 9 === 4);
    move(mariaFolk, ['maria-fall', 0.5], ['refugees', 0.5], 'rose', { flee: true, spread: 0.6 });
    for (const a of lost) { const m = a.ops[a.ops.length - 1], mid = m.T0 + (m.T1 - m.T0) * 0.45; a.ops.push({ type: 'fade', T0: mid, T1: mid + 0.08, v: 0, how: 'caught' }); }
    const survivors = mariaFolk.filter((a) => !lost.includes(a));
    // 846: the "reclamation". About a fifth of the people are marched out through Trost into Titan country; a handful return.
    const sent = survivors.slice(0, Math.round(nc * 0.2)), returned = sent.slice(0, 2);
    move(sent, ['reclamation', 0.06], ['reclamation', 0.6], 'maria', { via: ['trost'], near: TROST.beyond, radius: 34, spread: 0.5 });
    sent.filter((a) => !returned.includes(a)).forEach((a, i, list) => { const t0 = T('reclamation', 0.5 + 0.38 * (i / list.length)); a.ops.push({ type: 'fade', T0: t0, T1: t0 + 0.07, v: 0, how: 'caught' }); });
    move(returned, ['reclamation', 0.82], ['reclamation', 1], 'rose', { via: ['trost'], flee: true, spread: 0.2 });
    const alive = survivors.filter((a) => !sent.includes(a) || returned.includes(a));
    // 850: Trost is evacuated during the attack and lived in again afterwards.
    move(civD.trost, ['trost-attack', 0.2], ['trost-attack', 0.6], 'rose', { flee: true, spread: 0.3 });
    move(civD.trost, ['annie-mp', 0.1], ['annie-mp', 0.7], 'trost', { spread: 0.3 });
    fade(ragCiv, ['ragako', 0.28], ['ragako', 0.46], 0, { spread: 0.3, how: 'turned' });
    fade(ragCiv.slice(0, 1), ['alliance', 0.9], ['alliance', 1], 1);
    // 851 onwards: Maria is settled again.
    const back = alive.filter((_, i) => i % 3 !== 0);
    move(back.filter((a) => a.area0 === 'maria'), ['sea', 0.4], ['sea', 1], 'maria', { spread: 0.6 });
    for (const id of ['holst', 'quinta', 'mariaN']) move(back.filter((a) => a.area0 === id), ['sea', 0.5], ['ships', 0.5], id, { spread: 0.5 });
    move(civD.shig, ['sea', 0.55], ['sea', 1], 'shig', { spread: 0.4 });
    move(civRose.slice(0, Math.round(nc * 0.09)), ['sea', 0.45], ['ships', 0.4], 'maria', { spread: 0.6 }); // new settlers from Wall Rose
    // 854: Shiganshina's people get away from the fighting, and return once it is over.
    move(civD.shig, ['zeke-scream', 0.3], ['zeke-scream', 0.75], 'maria', { flee: true, spread: 0.3 });
    move(civD.shig, ['ambassadors', 0.1], ['ambassadors', 0.6], 'shig', { spread: 0.3, straight: true });
    move(back.filter((a) => a.area0 === 'maria').slice(0, Math.round(nc * 0.06)), ['ambassadors', 0.3], ['ambassadors', 1], 'outside', { spread: 0.5, straight: true, near: SHIG.beyond, radius: 80 }); // the Walls are gone

    // The Wall Titans of the Rumbling: they step out of all three Walls and march to the sea.
    const wallsFall = T('rumbling', 0.43);
    const wallTitans = [];
    {
      const r = rng(4242), share = { maria: 0.46, rose: 0.32, sina: 0.22 };
      for (const [wall, end] of [['maria', 1.0], ['rose', 1.3], ['sina', 1.6]]) {
        const n = Math.round(N.wallTitans * share[wall]);
        for (let i = 0; i < n; i++) {
          const deg = (360 * (i + r() * 0.6)) / n - 180, start = at(R[wall], deg), goal = coastAt(deg, 46);
          const t0 = wallsFall + 0.02 + r() * 0.05, t1 = T('rumbling', 0) + end + r() * 0.08;
          const a = { id: agents.length, kind: 'wallTitan', r, variant: 1, area0: 'outside', home0: start, vis0: 0, ops: [], phase: r() * 10, speed: 1, march: { from: start, to: goal, T0: t0, T1: t1 } };
          agents.push(a); wallTitans.push(a);
        }
      }
    }
    // Survey Corps riders follow every "scouts" route of the story.
    const riders = [];
    events.forEach((ev, ei) => ev.routes.forEach((rt) => {
      if (rt.who !== 'scouts') return;
      const pts = rt.path.map((p) => (Array.isArray(p) ? p : opts.points[p]));
      const geo = global.RouteGeo.build(pts, 1), r = rng(77 + ei * 31), wide = ev.id === 'female-forest' ? 3.4 : 1; // the long-range scouting formation fans out
      for (let i = 0; i < N.riders; i++) {
        const a = { id: agents.length, kind: 'rider', r, variant: 1, area0: 'outside', home0: pts[0], vis0: 0, ops: [], phase: r() * 10, speed: 1, ride: { ei, geo, start: rt.start, end: rt.end, lag: 0.012 + 0.1 * (i / N.riders), side: (i % 2 ? 1 : -1) * (2.5 + 2.2 * Math.floor(i / 2)) * wide } };
        agents.push(a); riders.push(a);
      }
    }));
    // 845: evacuation boats carry people up the river from Shiganshina, through the gates, to Trost.
    const boats = [];
    {
      const river = global.RouteGeo.build([SHIG.centre, SHIG.inner, [C[0] + 1.5, C[1] + R.rose + 38], TROST.outer, TROST.centre, TROST.inner, at(R.rose - 26, 90)], 1);
      const trips = [['maria-fall', 0.44], ['maria-fall', 0.53], ['maria-fall', 0.62], ['maria-fall', 0.72], ['maria-fall', 0.84], ['refugees', 0.04], ['refugees', 0.18], ['refugees', 0.33]];
      for (const [id, p] of trips) { const a = { id: agents.length, kind: 'boat', r: rng(5), variant: 1, area0: 'maria', home0: SHIG.centre, vis0: 0, ops: [], phase: p * 9, speed: 1, ferry: { geo: river, T0: T(id, p), T1: T(id, p) + 0.36 } }; agents.push(a); boats.push(a); }
    }
    // Wall cannons on the districts' outer walls.
    const cannons = [];
    for (const d of DISTRICTS) for (const off of [-48, 48]) { const a = ((d.deg + off) * Math.PI) / 180; cannons.push({ x: d.base[0] + Math.cos(a) * d.r, y: d.base[1] + Math.sin(a) * d.r, face: Math.cos(a) >= 0 ? 1 : -1, wall: d.wall, district: d.id }); }

    // Resolve homes and routes in timeline order.
    for (const a of agents) {
      a.ops.sort((x, y) => x.T0 - y.T0);
      let area = a.area0, home = a.home0;
      for (const op of a.ops) {
        if (op.type !== 'move') continue;
        op.fromArea = area; op.from = home;
        op.home = sample(op.area, a.r, { weight: op.weight, near: op.near, radius: op.radius });
        const straight = op.straight || op.T0 >= wallsFall;
        op.path = metrics(straight ? [home, op.home] : route(area, home, op.area, op.home, op.via));
        area = op.area; home = op.home;
      }
      delete a.cur;
      // when this figure can be on screen at all (lets the renderer skip it cheaply)
      if (a.march) { a.t0 = wallsFall; a.t1 = a.march.T1; }
      else if (a.ferry) { a.t0 = a.ferry.T0; a.t1 = a.ferry.T1; }
      else if (a.ride) { a.t0 = a.ride.ei; a.t1 = a.ride.ei + 1; }
      else {
        const fades = a.ops.filter((o) => o.type === 'fade');
        a.t0 = a.vis0 ? -Infinity : (fades.find((o) => o.v) || { T0: Infinity }).T0;
        const last = fades[fades.length - 1];
        a.t1 = last && !last.v ? last.T1 : Infinity;
      }
    }

    // ---- Wandering (real time) ----
    const loops = new Map();
    const SPEED = { titan: 2.6, civ: 3.4 };
    const wanderLoop = (a, area, home) => {
      const key = a.id + '|' + home[0].toFixed(1) + ',' + home[1].toFixed(1);
      let L = loops.get(key);
      if (L) return L;
      const r = rng(a.id * 131 + Math.round(home[0] * 7 + home[1] * 13)), radius = a.kind === 'titan' ? 30 : 13, pts = [home];
      for (let i = 0; i < 4; i++) pts.push(sample(area, r, { near: pts[pts.length - 1], radius }));
      const chain = [...pts, ...pts.slice(1, -1).reverse()], legs = [];
      let t = 0;
      for (let i = 0; i < chain.length; i++) {
        const p = chain[i], q = chain[(i + 1) % chain.length], pause = 0.8 + r() * (a.kind === 'titan' ? 4.5 : 3), walk = dist(p, q) / (SPEED[a.kind] * a.speed);
        legs.push({ p, q, tw: t + pause, t1: t + pause + walk }); t += pause + walk;
      }
      L = { legs, period: Math.max(0.1, t) }; loops.set(key, L);
      return L;
    };
    const wander = (a, area, home, t, still) => {
      if (still) return home;
      const L = wanderLoop(a, area, home), tt = (((t + a.phase * 5) % L.period) + L.period) % L.period;
      for (const g of L.legs) if (tt < g.t1) return tt < g.tw ? g.p : lerp(g.p, g.q, smooth((tt - g.tw) / (g.t1 - g.tw)));
      return home;
    };

    // State of one figure at timeline T and real time t (seconds).
    function stateAt(a, Tl, t, o = {}) {
      if (a.march) { // a Wall Titan walking from its Wall to the sea
        const m = a.march, f = (Tl - m.T0) / (m.T1 - m.T0);
        if (Tl < wallsFall || f > 1) return { x: m.from[0], y: m.from[1], vis: 0, area: 'outside' };
        const p = lerp(m.from, m.to, clamp01(f));
        return { x: p[0], y: p[1], vis: Math.min(clamp01((Tl - wallsFall) / 0.04), clamp01((1 - f) / 0.06)), area: 'outside', marching: f > 0 };
      }
      if (a.ferry) { // an evacuation boat on the river
        const f = (Tl - a.ferry.T0) / (a.ferry.T1 - a.ferry.T0);
        if (f < 0 || f > 1) return { x: a.home0[0], y: a.home0[1], vis: 0, area: 'maria' };
        const pos = global.RouteGeo.at(a.ferry.geo.tab, f);
        return { x: pos.x, y: pos.y, vis: Math.min(clamp01(f / 0.08), clamp01((1 - f) / 0.08)), area: 'maria', sailing: true };
      }
      if (a.ride) { // a rider on a Survey Corps route, only during that event
        const rd = a.ride, p = Tl - rd.ei;
        if (p < 0 || p >= 1) return { x: a.home0[0], y: a.home0[1], vis: 0, area: 'outside' };
        const f = clamp01((p - rd.start - rd.lag) / Math.max(0.001, rd.end - rd.start)), pos = global.RouteGeo.at(rd.geo.tab, global.RouteGeo.ease(f));
        const nx = -Math.sin(pos.angle), ny = Math.cos(pos.angle);
        return { x: pos.x + nx * rd.side, y: pos.y + ny * rd.side, vis: Math.min(clamp01((p - rd.start) / 0.04 + 0.001), clamp01((1 - p) / 0.05)), area: 'outside', riding: f > 0 && f < 1 };
      }
      let area = a.area0, home = a.home0, vis = a.vis0, mv = null, dying = 0, how = null;
      for (const op of a.ops) {
        if (Tl < op.T0) break;
        const f = (Tl - op.T0) / Math.max(1e-6, op.T1 - op.T0);
        if (op.type === 'fade') { if (f >= 1) vis = op.v; else { vis = vis + (op.v - vis) * smooth(f); if (!op.v) { dying = f; how = op.how; } } }
        else if (f >= 1) { area = op.area; home = op.home; }
        else mv = { op, f };
      }
      if (a.crawl) { // the crawling Titan: no wandering, just a very slow drag along its line
        const c = a.crawl, p = lerp(c.from, c.to, clamp01((Tl - c.T0) / (c.T1 - c.T0)));
        return { x: p[0], y: p[1], vis, dying, how, area: 'outside', crawling: true };
      }
      const still = a.still || o.reduced;
      if (mv) {
        const { op, f } = mv, base = along(op.path, smooth(f));
        const w0 = wander(a, op.fromArea, op.from, t, still), w1 = wander(a, op.area, op.home, t, still);
        const p = lerp(lerp(w0, base, smooth(f / 0.1)), w1, smooth((f - 0.9) / 0.1));
        return { x: p[0], y: p[1], vis, dying, how, flee: op.flee, moving: true, area: f < 0.5 ? op.fromArea : op.area };
      }
      const w = wander(a, area, home, t, still);
      return { x: w[0], y: w[1], vis, dying, how, area };
    }

    // How many Titans and civilian groups are where (for the status panel).
    function counts(Tl) {
      const out = { titan: { total: 0 }, civ: { total: 0 }, wallTitan: 0 };
      for (const a of agents) {
        if (a.kind === 'rider' || a.kind === 'boat') continue;
        const s = stateAt(a, Tl, 0, { reduced: true });
        if (s.vis <= 0.5) continue;
        if (a.kind === 'wallTitan') { out.wallTitan++; continue; }
        const o = out[a.kind], reg = a.crawl ? 'outside' : a.lying ? 'ragakoFixed' : regionOfArea(s.area);
        o.total++; o[reg] = (o[reg] || 0) + 1;
      }
      return out;
    }
    return { agents, cannons, stateAt, counts, inArea, regionOfArea, route, wallsFall, N, T };
  }
  global.Population = { create };
})(typeof window !== 'undefined' ? window : globalThis);
