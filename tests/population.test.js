// Crowd simulation: Titans, civilians, riders, Wall Titans (2.0).
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('./helpers.js');
const c = load({ population: true });
const { World, pop, events: E } = c;
const T = pop.T;
const titans = pop.agents.filter((a) => a.kind === 'titan'), civs = pop.agents.filter((a) => a.kind === 'civ');
const at = (Tl, list) => list.map((a) => ({ a, s: pop.stateAt(a, Tl, 0, { reduced: true }) })).filter((x) => x.s.vis > 0.5);
const reg = (s) => World.regionOf([s.x, s.y]);
const wrap = (d) => { while (d > 180) d -= 360; while (d < -180) d += 360; return d; };

test('about 300 Titans roam outside Wall Maria at the beginning', () => {
  const k = pop.counts(T('grisha', 0.5));
  assert.strictEqual(k.titan.total, 300);
  assert.strictEqual(k.titan.outside, 300);
  for (const { s } of at(T('grisha', 0.5), titans)) assert.strictEqual(reg(s), 'outside');
});

test('Titans gather where people are: far more near Shiganshina in the south than in the far north', () => {
  const live = at(T('grisha', 0.5), titans);
  const south = live.filter(({ s }) => Math.abs(wrap(World.degOf([s.x, s.y]) - 90)) < 50).length, north = live.filter(({ s }) => Math.abs(wrap(World.degOf([s.x, s.y]) + 90)) < 50).length;
  assert.ok(south > north * 2, `south ${south}, north ${north}`);
  assert.ok(south >= 120);
});

test('when the gates break only part of them get in, and the total stays the same', () => {
  const k = pop.counts(T('founder-transfer', 0.5));
  assert.strictEqual(k.titan.total, 300);
  assert.ok(k.titan.maria >= 50 && k.titan.maria <= 130, 'in Maria: ' + k.titan.maria);
  assert.ok(k.titan.outside >= 170, 'still outside: ' + k.titan.outside);
});

test('no Titan is inside Wall Maria before the inner gate breaks', () => {
  for (const { s } of at(T('maria-fall', 0.6), titans)) assert.ok(World.rOf([s.x, s.y]) > World.R.maria - 1 || reg(s) === 'shig', 'a Titan is inside too early');
});

test('the number of Titans falls as they are killed', () => {
  const n = (id, p) => pop.counts(T(id, p)).titan.total;
  assert.ok(n('cadets', 0.99) < 300);
  assert.ok(n('trost-seal', 0.99) < n('trost-attack', 0.99) - 20, 'Trost is cleared after the seal');
  assert.ok(n('maria-retaken', 0.99) < n('rod', 0) - 40);
  assert.ok(n('sea', 0.5) < n('sea', 0.05) && n('sea', 0.5) > 20, 'the island is cleared gradually');
  assert.strictEqual(n('ships', 0.5), 1); // only the immobile Ragako Titan
  assert.strictEqual(n('ambassadors', 1), 0);
});

test('Titans and civilians cross the Walls only at gates (before the Walls fall)', () => {
  const gates = World.DISTRICTS;
  for (const a of pop.agents) for (const op of a.ops) {
    if (op.type !== 'move' || op.straight || op.T0 >= pop.wallsFall) continue;
    const pts = op.path.pts;
    for (let i = 1; i < pts.length; i++) for (let k = 1; k <= 16; k++) {
      const p = [pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * (k - 1)) / 16, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (k - 1)) / 16];
      const q = [pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * k) / 16, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * k) / 16];
      for (const wall of ['maria', 'rose', 'sina']) {
        if (World.rOf(p) < World.R[wall] === World.rOf(q) < World.R[wall]) continue;
        const g = gates.find((d) => d.wall === wall && Math.hypot(q[0] - d.base[0], q[1] - d.base[1]) < d.r + 6);
        assert.ok(g, `${a.kind} ${a.id} crosses Wall ${wall} away from a gate`);
        if (a.kind === 'titan') assert.ok(g.id === 'shig' || g.id === 'trost', `a Titan uses the ${g.id} gate`);
      }
    }
  }
});

test('civilians live inside the Walls, leave Maria when it falls and resettle it after 851', () => {
  const inMaria = (Tl) => at(Tl, civs).filter(({ s }) => { const r = reg(s); return r === 'maria' || ['shig', 'holst', 'quinta', 'mariaN'].includes(r); }).length;
  for (const { s } of at(T('marcel', 0.5), civs)) assert.notStrictEqual(reg(s), 'outside');
  assert.ok(inMaria(T('marcel', 0.5)) >= 30);
  assert.strictEqual(inMaria(T('cadets', 0.5)), 0);
  assert.ok(inMaria(T('overseas', 0.5)) >= 15);
  assert.ok(pop.counts(T('cadets', 0.5)).civ.total < pop.counts(T('marcel', 0.5)).civ.total, 'some did not make it');
});

test('Ragako: Titans appear inside Wall Rose without a breach; one stays, unable to move', () => {
  const k = pop.counts(T('ragako', 0.6));
  assert.ok(k.titan.rose >= 15);
  const lying = titans.find((a) => a.lying && !a.crawl);
  assert.strictEqual(pop.counts(T('ships', 0.5)).titan.ragakoFixed, 1);
  assert.strictEqual(pop.stateAt(lying, T('alliance', 1), 0, { reduced: true }).vis, 0);
});

// ---- The Rumbling ----
const wallT = pop.agents.filter((a) => a.kind === 'wallTitan');
const lanes = pop.rumble.lanes;
const laneDist = (p) => Math.min(...lanes.map((l) => Math.abs(Math.sin((wrap(World.degOf(p) - l.deg) * Math.PI) / 180)) * World.rOf(p)));
const walk = (a, fn) => { for (let t = T('rumbling', 0.44); t < T('alliance', 0.95); t += 0.006) { const s = pop.stateAt(a, t, 0, {}); if (s.vis > 0) fn([s.x, s.y], t); } };

test('Wall Titans stand in every Wall and in every district wall, and only appear when the hardening is undone', () => {
  assert.strictEqual(pop.counts(T('rumbling', 0.3)).wallTitan, 0);
  assert.ok(pop.counts(T('rumbling', 0.6)).wallTitan >= 300);
  assert.strictEqual(pop.counts(T('ambassadors', 0.5)).wallTitan, 0);
  for (const w of ['maria', 'rose', 'sina']) {
    const mine = wallT.filter((a) => a.rumble.wall === w);
    assert.ok(mine.filter((a) => !a.rumble.district).length >= 50, w + ': the ring is manned');
    for (const d of World.DISTRICTS.filter((x) => x.wall === w)) assert.ok(mine.filter((a) => a.rumble.district === d).length >= 4, d.id + ': the half-round wall is manned');
  }
  for (const a of wallT) {
    const g = a.rumble, p = a.home0;
    if (g.district) assert.ok(Math.abs(Math.hypot(p[0] - g.district.base[0], p[1] - g.district.base[1]) - g.district.r) < 0.01, 'on the district wall');
    else assert.ok(Math.abs(World.rOf(p) - World.R[g.wall]) < 0.01, 'on the ring');
  }
  // shoulder to shoulder: evenly spaced along each ring
  const ring = wallT.filter((a) => a.rumble.wall === 'maria' && !a.rumble.district).map((a) => a.rumble.th).sort((x, y) => x - y);
  for (let i = 1; i < ring.length; i++) assert.ok(Math.abs(ring[i] - ring[i - 1] - 360 / ring.length) < 0.01);
});

test('the Rumbling spares the towns: no Wall Titan walks through a district or a village', () => {
  const keep = ['ragako', 'utgard', 'reiss', 'harbor', 'cadetCamp'].map((k) => c.P[k]);
  for (const a of wallT) walk(a, (p) => {
    for (const d of World.DISTRICTS) assert.ok(!(World.rOf(p) > World.R[d.wall] + 1.5 && Math.hypot(p[0] - d.base[0], p[1] - d.base[1]) < d.r - 1.5), 'a Wall Titan is inside ' + d.id);
    for (const k of keep) assert.ok(Math.hypot(p[0] - k[0], p[1] - k[1]) >= 12, 'a Wall Titan tramples a village');
  });
  for (const l of lanes) for (const comp of [-90, 0, 90, 180]) assert.ok(Math.abs(wrap(l.deg - comp)) >= 12.5, 'a lane runs into a district');
});

test('they line up: along the line of their own Wall to a lane, then out in columns, the outer Wall first', () => {
  assert.ok(lanes.length >= 12 && lanes.length <= 20, 'lanes: ' + lanes.length);
  for (const a of wallT) {
    const Rw = World.R[a.rumble.wall];
    let last = null;
    walk(a, (p) => {
      const r = World.rOf(p), onRing = Math.abs(r - Rw) < 2.2, onDistrictWall = a.rumble.district && Math.abs(Math.hypot(p[0] - a.rumble.district.base[0], p[1] - a.rumble.district.base[1]) - a.rumble.district.r) < 0.6;
      assert.ok(onRing || onDistrictWall || laneDist(p) < 8, 'off the Wall lines and off the lanes at r ' + r.toFixed(0));
      if (last) assert.ok(Math.hypot(p[0] - last[0], p[1] - last[1]) < 4, 'no jumps');
      last = p;
    });
  }
  // every Wall Titan walks at the same speed, so a lane fills in order: Maria's column is ahead of Rose's, Rose's ahead of Sina's
  const t = T('rumbling', 0.75), lane = lanes[0], head = {};
  for (const w of ['maria', 'rose', 'sina']) head[w] = Math.max(...wallT.filter((a) => a.rumble.wall === w && a.rumble.lane === lane).map((a) => { const s = pop.stateAt(a, t, 0, {}); return World.rOf([s.x, s.y]); }));
  assert.ok(head.maria > head.rose && head.rose > head.sina, JSON.stringify(head));
});

test('every Wall Titan ends out at sea', () => {
  for (const a of wallT) {
    const g = a.rumble, end = [World.C[0] + Math.cos((g.lane.deg * Math.PI) / 180) * g.lane.endR, World.C[1] + Math.sin((g.lane.deg * Math.PI) / 180) * g.lane.endR];
    assert.ok(!World.onLand(end), 'a lane ends on land');
    assert.strictEqual(pop.stateAt(a, T('alliance', 0.95), 0, {}).vis, 0);
  }
});

test('Survey Corps riders ride only during events with a Scouts route', () => {
  const riders = pop.agents.filter((a) => a.kind === 'rider');
  assert.ok(riders.length >= 10);
  const scoutEvents = new Set(E.map((e, i) => (e.routes.some((r) => r.who === 'scouts') ? i : -1)).filter((i) => i >= 0));
  for (const a of riders) assert.ok(scoutEvents.has(a.ride.ei));
  const seaIdx = E.findIndex((e) => e.id === 'sea');
  assert.ok(riders.filter((a) => a.ride.ei === seaIdx).some((a) => pop.stateAt(a, seaIdx + 0.5, 0).vis > 0.5));
  assert.ok(riders.every((a) => pop.stateAt(a, T('cadets', 0.5), 0).vis === 0));
});

test('wandering keeps figures inside their area', () => {
  for (const a of [...titans.slice(0, 60), ...civs.slice(0, 60)]) for (let t = 0; t < 90; t += 2.3) {
    const s = pop.stateAt(a, T('grisha', 0.5), t);
    assert.ok(pop.inArea(a.area0, [s.x, s.y]) || Math.hypot(s.x - a.home0[0], s.y - a.home0[1]) < 34, `agent ${a.id} left ${a.area0}`);
  }
});

test('a phone gets fewer civilians and riders but the same 300 Titans', () => {
  const low = load({ population: true, counts: { civilians: 96, riders: 6, wallTitans: 190 } }).pop;
  assert.strictEqual(low.counts(low.T('grisha', 0.5)).titan.total, 300);
  assert.ok(low.agents.filter((a) => a.kind === 'civ').length < civs.length);
});

test('846: about a fifth of the people are sent out through Trost and only a handful return', () => {
  const before = pop.counts(T('reclamation', 0)), during = pop.counts(T('reclamation', 0.5)), after = pop.counts(T('reclamation', 1));
  assert.strictEqual(before.civ.maria || 0, 0);
  assert.ok(during.civ.maria >= 20, 'people are in Maria territory: ' + during.civ.maria);
  const lostShare = (before.civ.total - after.civ.total) / before.civ.total;
  assert.ok(lostShare > 0.14 && lostShare < 0.24, 'share lost: ' + lostShare);
  assert.strictEqual(after.civ.maria || 0, 0);
  assert.strictEqual(after.titan.total, before.titan.total); // nobody fights back
  assert.ok(during.titan.maria > before.titan.maria, 'Titans are drawn to the crowd');
});

test('evacuation boats go up the river from Shiganshina to behind Wall Rose in 845, and are not counted as people', () => {
  const boats = pop.agents.filter((a) => a.kind === 'boat');
  assert.strictEqual(boats.length, 8);
  for (const b of boats) {
    assert.ok(b.t0 >= T('maria-fall', 0.4) && b.t1 <= T('refugees', 0.75), 'boats sail during the evacuation');
    const at = (f) => pop.stateAt(b, b.t0 + (b.t1 - b.t0) * f, 0, { reduced: true });
    const a = at(0.05), m = at(0.5), z = at(0.95);
    assert.strictEqual(reg(a), 'shig');
    assert.strictEqual(reg(z), 'rose');
    assert.ok(a.y > m.y && m.y > z.y, 'they sail north');
    assert.ok(Math.abs(m.x - World.C[0]) < 6, 'on the river');
    assert.strictEqual(pop.stateAt(b, b.t0 - 0.05, 0, {}).vis, 0);
    assert.strictEqual(pop.stateAt(b, b.t1 + 0.05, 0, {}).vis, 0);
  }
  const k = pop.counts(T('maria-fall', 0.7));
  assert.strictEqual(k.civ.total, at(T('maria-fall', 0.7), civs).length);
});

test('the crawling Titan drags itself from the south coast towards the Walls and is found by the Scouts in 851', () => {
  const crawler = titans.find((a) => a.crawl);
  assert.ok(crawler && crawler.lying && crawler.still, 'one Titan crawls');
  assert.strictEqual(titans.filter((a) => a.crawl).length, 1);
  const pos = (id, p) => pop.stateAt(crawler, T(id, p), 0, {});
  const start = pos('grisha', 0), mid = pos('trost-attack', 0.5), found = pos('sea', 0.6);
  assert.ok(World.coastDist([start.x, start.y]) < 20, 'it starts near the south coast');
  assert.ok(start.y > mid.y && mid.y > found.y, 'it only ever moves north, towards Shiganshina');
  assert.ok(Math.hypot(found.x - c.P.crawlTo[0], found.y - c.P.crawlTo[1]) < 0.01);
  assert.ok(found.y > c.P.shigO[1] + 60, 'it never reaches the Wall');
  for (const s of [start, mid, found]) assert.strictEqual(World.regionOf([s.x, s.y]), 'outside');
  // real time does not move it: it cannot walk
  const a = pop.stateAt(crawler, T('cadets', 0.5), 0, {}), b = pop.stateAt(crawler, T('cadets', 0.5), 40, {});
  assert.ok(a.x === b.x && a.y === b.y);
  // on the route the Scouts ride to the sea, and gone once the island is cleared
  const ride = E.find((e) => e.id === 'sea').routes[0].path.map((p) => (Array.isArray(p) ? p : c.P[p]));
  assert.ok(ride.some((p) => Math.hypot(p[0] - found.x, p[1] - found.y) < 40), 'the Scouts pass close by');
  assert.strictEqual(pos('sea', 0.6).vis, 1);
  assert.strictEqual(pos('ships', 0.5).vis, 0);
  // it is one of the 300 outside, not an extra and not counted with the Ragako Titan
  const k = pop.counts(T('grisha', 0.5));
  assert.strictEqual(k.titan.total, 300);
  assert.strictEqual(k.titan.ragakoFixed || 0, 0);
});
