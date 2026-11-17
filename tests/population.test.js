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
  const lying = titans.find((a) => a.lying);
  assert.strictEqual(pop.counts(T('ships', 0.5)).titan.ragakoFixed, 1);
  assert.strictEqual(pop.stateAt(lying, T('alliance', 1), 0, { reduced: true }).vis, 0);
});

test('Wall Titans appear only when the Walls fall, start on the Walls and march out to sea', () => {
  assert.strictEqual(pop.counts(T('rumbling', 0.3)).wallTitan, 0);
  assert.ok(pop.counts(T('rumbling', 0.7)).wallTitan >= 100);
  for (const a of pop.agents.filter((x) => x.kind === 'wallTitan')) {
    assert.ok(['sina', 'rose', 'maria'].some((w) => Math.abs(World.rOf(a.march.from) - World.R[w]) < 0.5));
    assert.ok(!World.onLand(a.march.to), 'ends at sea');
  }
  assert.strictEqual(pop.counts(T('ambassadors', 0.5)).wallTitan, 0);
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
  const low = load({ population: true, counts: { civilians: 96, riders: 6, wallTitans: 90 } }).pop;
  assert.strictEqual(low.counts(low.T('grisha', 0.5)).titan.total, 300);
  assert.ok(low.agents.filter((a) => a.kind === 'civ').length < civs.length);
});
