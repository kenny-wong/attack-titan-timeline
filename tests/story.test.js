// Story geography checks for the event data (accuracy audit of 2026-11-17, redone for the 2.0 world).
const test = require('node:test');
const assert = require('node:assert');
const { load, read } = require('./helpers.js');
const c = load();
const { World, events: E, P } = c;
const ev = (id) => E.find((e) => e.id === id);
const pt = (p) => (Array.isArray(p) ? p : P[p]);
const region = (p) => World.regionOf(pt(p));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const labelKeys = read('src/app.js').match(/const labels = \{([\s\S]*?)\n\};/)[1].match(/^\s+(\w+): C\(/gm).map((s) => s.trim().split(':')[0]);

test('there are 27 events and every route and mark point exists', () => {
  assert.strictEqual(E.length, 27);
  for (const e of E) {
    for (const r of e.routes) for (const p of r.path) assert.ok(pt(p) && isFinite(pt(p)[0]), `${e.id}: unknown point ${p}`);
    for (const m of e.marks) assert.ok(pt(m.point), `${e.id}: unknown mark point ${m.point}`);
  }
});

test('every event place has a readable name', () => {
  for (const e of E) assert.ok(labelKeys.includes(e.place), `no label for place ${e.place} (${e.id})`);
});

test('the Reiss chapel is in Rose territory, outside Wall Sina, and Rod crawls to Orvud from outside', () => {
  assert.strictEqual(region('reiss'), 'rose');
  for (const p of ev('rod').routes.find((r) => r.who === 'rod').path) assert.ok(World.rOf(pt(p)) > World.R.sina, 'Rod should stay outside Wall Sina');
  for (const p of ev('founder-transfer').routes[0].path.slice(2)) assert.ok(World.rOf(pt(p)) > World.R.sina, 'Grisha should go around Wall Sina, not through it');
});

test('the Titans at Utgard come from Ragako, inside Wall Rose', () => {
  for (const p of ev('utgard').routes.find((r) => r.who === 'pure').path) assert.strictEqual(region(p), 'rose');
});

test('Reiner and Bertholdt reveal themselves on Wall Rose near Utgard and flee into Maria territory', () => {
  const e = ev('reveal-escape');
  assert.ok(Math.abs(World.rOf(pt(e.place)) - World.R.rose) < 2, 'the reveal is on Wall Rose');
  assert.ok(dist(pt(e.place), P.utgard) < 30, 'the reveal is near Utgard');
  assert.strictEqual(region(e.routes.find((r) => r.who === 'reiner').path.at(-1)), 'maria');
});

test('Shiganshina 850: Zeke is on the Maria side of the inner gate; the outer gate is sealed before the inner is blocked', () => {
  const zeke = ev('maria-retaken').routes.find((r) => r.who === 'zeke');
  assert.strictEqual(region(zeke.path[0]), 'maria');
  assert.ok(pt(zeke.path[0])[1] < P.shigI[1], 'Zeke starts north of the inner gate');
  const marks = ev('maria-retaken').marks;
  assert.ok(marks.find((m) => m.point === 'shigO').at < marks.find((m) => m.point === 'shigI').at);
});

test('the Rumbling starts on Wall Maria and ends at sea, in every direction', () => {
  const routes = ev('rumbling').routes;
  assert.ok(routes.length >= 8);
  for (const r of routes) {
    assert.ok(Math.abs(World.rOf(pt(r.path[0])) - World.R.maria) <= World.DR.maria + 1, 'starts on the Wall');
    assert.strictEqual(region(r.path.at(-1)), 'sea');
  }
});

test('the 857 delegation includes Jean and Connie', () => {
  assert.match(ev('ambassadors').description.en, /Jean, Connie/);
});

test('a route reaching a gate arrives by the time the gate breaks or is sealed', () => {
  for (const e of E) for (const m of e.marks) {
    if (m.at === undefined || !['breach', 'repair'].includes(m.kind)) continue;
    for (const r of e.routes) if (dist(pt(r.path.at(-1)), pt(m.point)) < 1) assert.ok(r.end <= m.at + 0.01, `${e.id}: ${r.who} arrives at ${r.end}, after the ${m.kind} at ${m.at}`);
  }
});

test('the 845 Warriors land on the south coast and walk north to Shiganshina without doubling back', () => {
  const routes = ev('marcel').routes;
  const arrive = routes.find((r) => r.who === 'reiner' && r.start === 0), onward = routes.find((r) => r.who === 'reiner' && r.start > 0.5);
  const [a0, a1] = arrive.path.map(pt), [b0, b1] = onward.path.map(pt);
  assert.ok(World.coastDist(a0) < 12 && a0[1] > World.C[1] + World.R.maria + 100, 'they land on the south coast');
  assert.ok(a0[1] > a1[1] && b0[1] > b1[1], 'both legs head north');
  const u = [a1[0] - a0[0], a1[1] - a0[1]], v = [b1[0] - b0[0], b1[1] - b0[1]];
  assert.ok(u[0] * v[0] + u[1] * v[1] > 0, 'the onward route does not reverse');
  assert.strictEqual(onward.path.at(-1), 'outer');
});

test('the Fall of Maria starts where the landing scene leaves the Warriors: at Shiganshina outer gate', () => {
  for (const who of ['annie', 'bert', 'reiner']) assert.strictEqual(ev('maria-fall').routes.find((r) => r.who === who).path[0], 'outer', `${who} starts in front of the gate`);
});

test('places are where the story puts them', () => {
  assert.strictEqual(region('ragako'), 'rose');
  assert.strictEqual(region('utgard'), 'rose');
  assert.ok(P.ragako[1] > World.C[1] && P.ragako[0] < World.C[0], 'Ragako is in the south-west of Wall Rose');
  assert.strictEqual(region('forest'), 'maria'); // the Forest of Giant Trees lies in Maria territory
  assert.strictEqual(region('cadetCamp'), 'rose');
  for (const k of ['krugerWall', 'landing', 'shore', 'harbor', 'northShore']) { assert.strictEqual(region(k), 'outside', k + ' is on land'); assert.ok(World.coastDist(P[k]) < 12, k + ' is on the coast'); }
  for (const k of ['ship', 'harborSea', 'sea']) assert.strictEqual(region(k), 'sea', k + ' is at sea');
  assert.ok(P.krugerWall[1] > World.C[1] + World.R.maria, "Marley's sea wall is on the south coast");
});
