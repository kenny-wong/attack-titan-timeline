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

test('about 200 Titans roam outside Wall Maria at the beginning, and about 500 people live inside the Walls', () => {
  const k = pop.counts(T('grisha', 0.5));
  assert.strictEqual(k.titan.total, 200);
  assert.strictEqual(k.titan.outside, 200);
  assert.ok(k.civ.total >= 495 && k.civ.total <= 510, 'people: ' + k.civ.total);
  assert.strictEqual(k.civ.outside || 0, 0);
  for (const { s } of at(T('grisha', 0.5), titans)) assert.strictEqual(reg(s), 'outside');
});

test('Titans gather where people are: far more near Shiganshina in the south than in the far north', () => {
  const live = at(T('grisha', 0.5), titans);
  const south = live.filter(({ s }) => Math.abs(wrap(World.degOf([s.x, s.y]) - 90)) < 50).length, north = live.filter(({ s }) => Math.abs(wrap(World.degOf([s.x, s.y]) + 90)) < 50).length;
  assert.ok(south > north * 2, `south ${south}, north ${north}`);
  assert.ok(south >= 80);
});

test('when the gates break only part of them get in, and the total stays the same', () => {
  const k = pop.counts(T('founder-transfer', 0.5));
  assert.strictEqual(k.titan.total, 200);
  assert.ok(k.titan.maria >= 35 && k.titan.maria <= 90, 'in Maria: ' + k.titan.maria);
  assert.ok(k.titan.outside >= 110, 'still outside: ' + k.titan.outside);
});

test('no Titan is inside Wall Maria before the inner gate breaks', () => {
  for (const { s } of at(T('maria-fall', 0.6), titans)) assert.ok(World.rOf([s.x, s.y]) > World.R.maria - 1 || reg(s) === 'shig', 'a Titan is inside too early');
});

test('the number of Titans falls as they are killed', () => {
  const n = (id, p) => pop.counts(T(id, p)).titan.total;
  assert.ok(n('cadets', 0.99) < 200);
  assert.ok(n('trost-seal', 0.99) < n('trost-attack', 0.99) - 12, 'Trost is cleared after the seal');
  assert.ok(n('maria-retaken', 0.99) < n('rod', 0) - 40);
  assert.ok(n('sea', 0.5) < n('sea', 0.05) && n('sea', 0.5) > 20, 'the island is cleared gradually');
  assert.strictEqual(n('ships', 0.5), 2); // only the two that cannot walk: the Ragako Titan and the crawling Titan
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
const RB = pop.rumble;
const whenFront = (rho) => RB.T0 + (rho - RB.rho0) / RB.v; // the moment the great circle has that radius
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
  const ring = wallT.filter((a) => a.rumble.wall === 'maria' && !a.rumble.district).map((a) => a.rumble.th0).sort((x, y) => x - y);
  for (let i = 1; i < ring.length; i++) assert.ok(Math.abs(ring[i] - ring[i - 1] - 360 / ring.length) < 0.01);
});

test('the Rumbling spares the towns: no Wall Titan walks through a district or a village', () => {
  const keep = ['ragako', 'utgard', 'reiss', 'harbor', 'cadetCamp'].map((k) => c.P[k]);
  for (const a of wallT) walk(a, (p) => {
    for (const d of World.DISTRICTS) assert.ok(!(World.rOf(p) > World.R[d.wall] + 1.5 && Math.hypot(p[0] - d.base[0], p[1] - d.base[1]) < d.r - 1.5), 'a Wall Titan is inside ' + d.id);
    for (const k of keep) assert.ok(Math.hypot(p[0] - k[0], p[1] - k[1]) >= 12, 'a Wall Titan tramples a village');
  });
});

test('they take the shortest way: straight out, unless a town or village is in the way', () => {
  const direct = wallT.filter((a) => a.rumble.pre === 0);
  assert.ok(direct.length > wallT.length * 0.6, 'most walk straight out: ' + direct.length + ' of ' + wallT.length);
  for (const a of direct) {
    // a direct one never steps along its Wall: it stays put until the circle reaches it, then only moves outward
    let last = World.rOf(a.home0), moved = false;
    walk(a, (p) => { const r = World.rOf(p); assert.ok(r >= last - 0.01, 'a direct Titan walks back'); if (r > last + 0.01) moved = true; last = r; });
    assert.ok(moved);
    // and it leaves on the bearing it stood on
    const s = pop.stateAt(a, whenFront(a.rumble.r0 + 4), 0, {});
    assert.ok(Math.abs(wrap(World.degOf([s.x, s.y]) - a.rumble.th0)) < 1, 'a direct Titan leaves on its own bearing');
  }
  // the others step aside along the line of their own Wall, and only as far as the first clear bearing
  for (const a of wallT.filter((x) => x.rumble.pre > 0)) {
    assert.ok(a.rumble.pre < 90, 'a long detour: ' + a.rumble.pre);
    const Rw = World.R[a.rumble.wall], s = pop.stateAt(a, whenFront(a.rumble.r0 - a.rumble.pre / 2), 0, {}), p = [s.x, s.y];
    const onRing = Math.abs(World.rOf(p) - Rw) < 2.2, onDistrictWall = a.rumble.district && Math.abs(Math.hypot(p[0] - a.rumble.district.base[0], p[1] - a.rumble.district.base[1]) - a.rumble.district.r) < 0.6;
    assert.ok(onRing || onDistrictWall, 'a side-stepper leaves the Wall lines');
  }
});

test('outside the Walls they form one great circle, shoulder to shoulder, and it grows', () => {
  // the front collects the Walls from the inside out
  let st = wallT.map((a) => [a, pop.stateAt(a, whenFront(170), 0, {})]);
  for (const [a, s] of st.filter(([a]) => a.rumble.wall === 'maria' && a.rumble.pre === 0)) assert.ok(Math.hypot(s.x - a.home0[0], s.y - a.home0[1]) < 0.01, 'Maria waits for the circle');
  assert.ok(st.filter(([a, s]) => a.rumble.wall === 'sina' && Math.abs(World.rOf([s.x, s.y]) - 170) < 0.01).length > 50, 'Sina is already out');
  // past the towns: everyone on one circle, evenly spaced all the way round
  for (const rho of [450, 480]) {
    st = wallT.map((a) => pop.stateAt(a, whenFront(rho), 0, {}));
    for (const s of st) assert.ok(Math.abs(World.rOf([s.x, s.y]) - rho) < 0.01, 'off the circle');
    const deg = st.map((s) => World.degOf([s.x, s.y])).sort((x, y) => x - y), even = 360 / wallT.length;
    for (let i = 1; i < deg.length; i++) assert.ok(Math.abs(deg[i] - deg[i - 1] - even) < 0.02, 'uneven circle');
  }
  // no gaps wider than three places while the circle closes up beyond Wall Maria
  st = wallT.map((a) => pop.stateAt(a, whenFront(330), 0, {}));
  const deg = st.map((s) => World.degOf([s.x, s.y])).sort((x, y) => x - y);
  let widest = 0;
  for (let i = 1; i < deg.length; i++) widest = Math.max(widest, deg[i] - deg[i - 1]);
  assert.ok(widest < 12, 'a gap of ' + widest.toFixed(1) + ' degrees');
});

test('the circle sweeps out over the sea and leaves the map before the story ends', () => {
  assert.ok(RB.front(T('rumbling', 1)) > World.R.maria + 60, 'out of the Walls within the event');
  assert.ok(RB.front(T('alliance', 0.9)) >= RB.edge - 0.01);
  for (const a of wallT) assert.strictEqual(pop.stateAt(a, T('alliance', 0.95), 0, {}).vis, 0);
  // at sea they are still walking
  const atSea = wallT.map((a) => pop.stateAt(a, whenFront(560), 0, {})).filter((s) => s.vis > 0.5 && !World.onLand([s.x, s.y]));
  assert.ok(atSea.length > 50, 'Wall Titans crossing the sea: ' + atSea.length);
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

test('a phone gets fewer civilians and riders but the same 200 Titans', () => {
  const low = load({ population: true, counts: { civilians: 320, riders: 6, wallTitans: 190 } }).pop;
  assert.strictEqual(low.counts(low.T('grisha', 0.5)).titan.total, 200);
  assert.ok(low.meals.length >= 30, 'people are caught on a phone too: ' + low.meals.length);
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

test('the crawling Titan drags itself from the south coast towards the Walls, is found by the Scouts in 851 and stays until the Rumbling reaches it', () => {
  const crawler = titans.find((a) => a.crawl);
  assert.ok(crawler && crawler.lying && crawler.still, 'one Titan crawls');
  assert.strictEqual(titans.filter((a) => a.crawl).length, 1);
  const pos = (id, p) => pop.stateAt(crawler, T(id, p), 0, {});
  const start = pos('grisha', 0), mid = pos('trost-attack', 0.5), found = pos('sea', 0.55); // where the Scouts find it
  assert.ok(World.coastDist([start.x, start.y]) < 20, 'it starts near the south coast');
  assert.ok(start.y > mid.y && mid.y > found.y, 'it only ever moves north, towards Shiganshina');
  assert.ok(Math.hypot(found.x - c.P.crawlTo[0], found.y - c.P.crawlTo[1]) < 0.01);
  assert.ok(found.y > c.P.shigO[1] + 60, 'it never reaches the Wall');
  for (const s of [start, mid, found]) assert.strictEqual(World.regionOf([s.x, s.y]), 'outside');
  // real time does not move it: it cannot walk
  const a = pop.stateAt(crawler, T('cadets', 0.5), 0, {}), b = pop.stateAt(crawler, T('cadets', 0.5), 40, {});
  assert.ok(a.x === b.x && a.y === b.y);
  // on the route the Scouts ride to the sea; they leave it be
  const ride = E.find((e) => e.id === 'sea').routes[0].path.map((p) => (Array.isArray(p) ? p : c.P[p]));
  assert.ok(ride.some((p) => Math.hypot(p[0] - found.x, p[1] - found.y) < 40), 'the Scouts pass close by');
  for (const [id, p] of [['sea', 0.6], ['sea', 0.99], ['ships', 0.5], ['liberio', 0.5], ['rumbling', 0.5]]) assert.strictEqual(pos(id, p).vis, 1, 'still there at ' + id);
  // it keeps crawling north after 851, and never reaches the Wall
  const later = pos('rumbling', 0.5);
  assert.ok(later.y < found.y && later.y > c.P.shigO[1] + 40);
  // the great circle of the Rumbling ends it
  const hit = crawler.crawl.T2, here = crawler.crawl.at(hit);
  assert.ok(Math.abs(pop.rumble.front(hit) - World.rOf(here)) < 0.01, 'it dies when the circle arrives');
  assert.strictEqual(pop.stateAt(crawler, hit - 0.01, 0, {}).vis, 1);
  assert.strictEqual(pop.stateAt(crawler, hit + 0.04, 0, {}).vis, 0);
  assert.strictEqual(pos('ambassadors', 0.5).vis, 0);
  // it is one of the 200 outside, not an extra and not counted with the Ragako Titan
  const k = pop.counts(T('grisha', 0.5));
  assert.strictEqual(k.titan.total, 200);
  assert.strictEqual(k.titan.ragakoFixed || 0, 0);
});

test('after 857 more people are born and they settle the whole island, the land beyond the old Walls included', () => {
  const before = pop.counts(T('ambassadors', 0.9)), after = pop.counts(T('rebuild', 1));
  assert.ok(after.civ.total > before.civ.total * 1.5, 'people: ' + before.civ.total + ' -> ' + after.civ.total);
  assert.ok((after.civ.outside || 0) >= (before.civ.outside || 0) + 40, 'beyond the old Walls: ' + (before.civ.outside || 0) + ' -> ' + after.civ.outside);
  const settlers = pop.agents.filter((a) => a.settler);
  for (const a of settlers) assert.strictEqual(pop.stateAt(a, T('ambassadors', 0.9), 0, {}).vis, 0); // nobody is born early
  // they spread widely: in all four quarters of the island
  const q = [0, 0, 0, 0];
  for (const a of settlers.filter((x) => x.area0 === 'outside')) q[(a.home0[0] > World.C[0] ? 1 : 0) + (a.home0[1] > World.C[1] ? 2 : 0)]++;
  for (const n of q) assert.ok(n >= 5, 'quarters: ' + q.join(' '));
});

test('outside the Walls the Rumbling spares nothing but the harbour; inside, the towns and villages stay protected', () => {
  const ruin = [556, 1072], seaWall = World.coastAt(84, -3); // the castle ruin and Marley's sea wall, both beyond Wall Maria
  const p2 = c.Population.create(E, World, { points: c.P, protect: [ruin, seaWall, c.P.harbor, c.P.ragako] });
  const zones = p2.rumble.zones.filter((z) => !z.town);
  const has = (p) => zones.some((z) => Math.hypot(z.c[0] - p[0], z.c[1] - p[1]) < 1);
  assert.ok(!has(ruin), 'the castle ruin is flattened');
  assert.ok(!has(seaWall), 'the sea wall is flattened');
  assert.ok(has(c.P.harbor), 'the harbour is still used by the story');
  assert.ok(has(c.P.ragako), 'villages inside the Walls stay protected');
  assert.strictEqual(p2.rumble.zones.filter((z) => z.town).length, 12);
  // so a Wall Titan does walk over the ruin
  const over = p2.agents.filter((a) => a.kind === 'wallTitan').some((a) => { for (let t = p2.T('rumbling', 0.7); t < p2.T('alliance', 0.3); t += 0.004) { const s = p2.stateAt(a, t, 0, {}); if (Math.hypot(s.x - ruin[0], s.y - ruin[1]) < 6) return true; } return false; });
  assert.ok(over, 'nobody walks over the ruin');
});

test('850: when Titans appear inside Wall Rose the people of the south-west leave for Ehrmich and Wall Sina, and come home afterwards', () => {
  const scare = World.at(175, 125), nearScare = (Tl) => at(Tl, civs).filter(({ s }) => reg(s) === 'rose' && Math.hypot(s.x - scare[0], s.y - scare[1]) < 140).length;
  const before = nearScare(T('ragako', 0.3)), during = nearScare(T('utgard', 0.6)), after = nearScare(T('rod', 0.6));
  assert.ok(before >= 30, 'people live there: ' + before);
  assert.ok(during <= 2, 'they have left: ' + during);
  assert.ok(after >= before - 7, 'and are home again (all but Ragako.s own five): ' + before + ' -> ' + after);
  assert.ok(pop.evacuees.length >= 30);
  assert.strictEqual(pop.counts(T('utgard', 0.6)).civ.total, pop.counts(T('ragako', 0.3)).civ.total - 5); // only Ragako's own people are gone (they are the Titans)
  for (const { a, home, dest } of pop.evacuees) {
    const away = pop.stateAt(a, T('utgard', 0.6), 0, { reduced: true }), back = pop.stateAt(a, T('rod', 0.6), 0, { reduced: true });
    assert.ok(['ehrmich', 'sina'].includes(reg(away)), 'behind Wall Sina or in Ehrmich: ' + reg(away));
    assert.ok(Math.hypot(away.x - dest[0], away.y - dest[1]) < 0.01);
    assert.ok(Math.hypot(back.x - home[0], back.y - home[1]) < 0.01, 'back at the same home');
    assert.ok(pop.stateAt(a, T('ragako', 0.9), 0, { reduced: true }).flee || pop.stateAt(a, T('utgard', 0.1), 0, { reduced: true }).flee || pop.stateAt(a, T('ragako', 0.7), 0, { reduced: true }).flee, 'they run');
  }
  // nobody is left within reach of the Titans at Utgard
  const ut = c.P.utgard;
  for (const { s } of at(T('utgard', 0.6), civs)) assert.ok(Math.hypot(s.x - ut[0], s.y - ut[1]) > 60, 'someone stayed near Utgard');
});

// ---- Caught and eaten ----
test('whoever does not get away in time is caught by a Titan that walks up to them', () => {
  const quiet = { reduced: true }, here = (a, Tl) => { const st = pop.stateAt(a, Tl, 0, quiet); return [st.x, st.y, st]; };
  assert.ok(pop.meals.length >= 80, 'meals: ' + pop.meals.length);
  const eaten = new Set();
  for (const m of pop.meals) {
    assert.ok(m.Ts < m.T0 && m.T0 < m.T1 && m.T1 < m.Te);
    assert.strictEqual(m.victim.kind, 'civ'); assert.strictEqual(m.titan.kind, 'titan');
    assert.ok(!m.titan.lying && !m.titan.crawl, 'a Titan that cannot walk catches nobody');
    assert.ok(!eaten.has(m.victim), 'nobody is eaten twice'); eaten.add(m.victim);
    // the person is where the Titan expects them, alive until then and gone once swallowed
    const [vx, vy, vs] = here(m.victim, m.T0);
    assert.ok(Math.hypot(vx - m.spot[0], vy - m.spot[1]) < 0.01 && vs.doom === m);
    assert.strictEqual(pop.stateAt(m.victim, m.T0 - 0.001, 0, quiet).vis, 1);
    assert.strictEqual(pop.stateAt(m.victim, m.T1, 0, quiet).vis, 0);
    assert.strictEqual(pop.stateAt(m.victim, m.T0, 7.7, {}).x, vx, 'real time no longer moves someone who is caught');
    // the Titan stands beside them for the whole meal, and says so
    for (const f of [0, 0.3, 0.7, 1]) {
      const [tx, ty, ts] = here(m.titan, m.T0 + (m.T1 - m.T0) * f);
      assert.ok(Math.hypot(tx - m.spot[0], ty - m.spot[1]) < 3, 'the Titan is ' + Math.hypot(tx - m.spot[0], ty - m.spot[1]).toFixed(1) + ' away');
      assert.ok(ts.vis > 0.9 && ts.eat === m && Math.abs(ts.eatF - f) < 1e-6);
    }
    assert.strictEqual(here(m.titan, (m.Ts + m.T0) / 2)[2].hunt, m);
    // it never goes through a Wall for it: the whole way there and back lies in one territory
    const region = World.regionOf(m.spot);
    for (let t = m.Ts; t <= m.Te; t += 0.005) { const [x, y] = here(m.titan, t); assert.strictEqual(World.regionOf([x, y]), region, 'Titan ' + m.titan.id + ' leaves ' + region); }
  }
  // one meal at a time
  for (const a of titans) if (a.meals) for (let i = 1; i < a.meals.length; i++) assert.ok(a.meals[i].Ts >= a.meals[i - 1].T1, 'a Titan starts its next hunt after its meal');
});

test('people are eaten where the story lost them: Shiganshina and Maria territory in 845, the column of 846; never behind Wall Rose', () => {
  const where = {}, when = {};
  for (const m of pop.meals) { const r = World.regionOf(m.spot), id = E[Math.floor(m.T0)].id; where[r] = (where[r] || 0) + 1; when[id] = (when[id] || 0) + 1; }
  assert.deepStrictEqual(Object.keys(where).sort(), ['maria', 'shig']);
  assert.ok(where.shig >= 2, 'in Shiganshina: ' + where.shig);
  assert.deepStrictEqual(Object.keys(when).sort(), ['maria-fall', 'reclamation', 'refugees']);
  assert.ok(when['maria-fall'] + when.refugees >= 15 && when.reclamation >= 60, JSON.stringify(when));
  // almost nobody of the 846 column dies out of a Titan's sight
  const unseen = civs.filter((a) => a.ops.some((o) => o.how === 'lost')).length;
  assert.ok(unseen <= when.reclamation * 0.15, 'unseen: ' + unseen);
  for (const a of civs) for (const o of a.ops) if (o.how === 'caught') assert.ok(a.doom, 'a caught person has a Titan');
});
