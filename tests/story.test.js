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

test('there are 29 events and every route and mark point exists', () => {
  assert.strictEqual(E.length, 29);
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

test('the Rumbling has no schematic routes: the Wall Titans are simulated, and the camera shows the whole island', () => {
  const e = ev('rumbling');
  assert.strictEqual(e.routes.length, 0);
  assert.strictEqual(e.frame, 'island');
  assert.ok(e.characters.some((x) => x[0] === 'walltitans'));
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
  for (const k of ['krugerWall', 'landing', 'shore', 'harbor']) { assert.strictEqual(region(k), 'outside', k + ' is on land'); assert.ok(World.coastDist(P[k]) < 12, k + ' is on the coast'); }
  for (const k of ['ship', 'harborSea', 'sea']) assert.strictEqual(region(k), 'sea', k + ' is at sea');
  assert.ok(P.krugerWall[1] > World.C[1] + World.R.maria, "Marley's sea wall is on the south coast");
});

test('the 846 "reclamation" follows the fall of Maria and sends people out through Trost, not a breach', () => {
  const i = E.findIndex((e) => e.id === 'reclamation'), e = E[i];
  assert.strictEqual(e.year, '846');
  assert.ok(i > E.findIndex((x) => x.id === 'refugees') && i === E.findIndex((x) => x.id === 'cadets') - 1);
  const out = e.routes.find((r) => r.who === 'civ').path;
  assert.ok(out.includes('trostI') && out.includes('trostO'), 'the refugees leave by both of Trost gates');
  assert.strictEqual(region(out.at(-1)), 'maria');
  assert.ok(!e.wallDelta || !Object.values(e.wallDelta).some((v) => /breach|lost/.test(String(v))), 'no gate is broken in 846');
});

test('events are in daylight unless the story sets them at night', () => {
  const idx = (id) => E.findIndex((e) => e.id === id);
  assert.strictEqual(c.lightAt(idx('trost-attack'), 0.5), 1);
  assert.strictEqual(c.lightAt(idx('utgard'), 0.4), 0);
  assert.strictEqual(c.lightAt(idx('utgard'), 1), 1); // rescue at dawn
  assert.strictEqual(c.lightAt(idx('maria-retaken'), 0.1), 0); // the Scouts ride in the dark
  assert.strictEqual(c.lightAt(idx('maria-retaken'), 0.6), 1);
  for (const e of E) {
    for (let p = 0; p <= 1.0001; p += 0.05) { const l = c.lightAt(E.indexOf(e), p); assert.ok(l >= 0 && l <= 1, e.id + ' light ' + l); }
    for (let k = 1; k < e.light.length; k++) assert.ok(e.light[k][0] > e.light[k - 1][0], e.id + ': light keys in order');
  }
  // Titans move at night only at Utgard
  assert.strictEqual(E.filter((e) => e.nightActive).map((e) => e.id).join(), 'utgard');
});

test('shifters turn into their Titans only in events they take part in, and every Titan has a picture', () => {
  const fs = require('node:fs'), path = require('node:path');
  const { root } = require('./helpers.js');
  for (const [id, who] of Object.entries(c.TITAN_FORM)) {
    const e = ev(id);
    assert.ok(e, 'unknown event ' + id);
    for (const [name, windows] of Object.entries(who)) {
      assert.ok(e.characters.some((x) => x[0] === name), id + ': ' + name + ' is not in the cast');
      let last = -1;
      for (const [from, to = 1, key] of windows) {
        assert.ok(from >= 0 && from < to && to <= 1 && from >= last, id + '.' + name + ': bad window');
        last = to;
        assert.ok(fs.existsSync(path.join(root, 'assets/portraits/titans', (key || name) + '.webp')), 'no Titan picture for ' + (key || name));
      }
    }
  }
});

test('845: Bertholdt is the Colossal Titan when the outer gate breaks, Reiner the Armored Titan at the inner gate, and both are human again after', () => {
  const e = ev('maria-fall'), outer = e.marks.find((m) => m.point === 'shigO').at, inner = e.marks.find((m) => m.point === 'shigI').at;
  assert.strictEqual(c.titanFormAt('maria-fall', 'bert', 0.1), null);
  assert.strictEqual(c.titanFormAt('maria-fall', 'bert', outer), 'bert');
  assert.strictEqual(c.titanFormAt('maria-fall', 'bert', 0.6), null);
  assert.strictEqual(c.titanFormAt('maria-fall', 'reiner', outer), null);
  assert.strictEqual(c.titanFormAt('maria-fall', 'reiner', inner), 'reiner');
  assert.strictEqual(c.titanFormAt('maria-fall', 'reiner', 0.9), null);
  assert.strictEqual(c.titanFormAt('rumbling', 'eren', 0.5), 'erenFounder');
  assert.strictEqual(c.titanFormAt('refugees', 'reiner', 0.5), null); // they enter Rose as humans
});

test('845: Annie follows the others into Shiganshina only after the outer gate is broken', () => {
  const e = ev('maria-fall'), outer = e.marks.find((m) => m.point === 'shigO').at;
  const routes = e.routes.filter((r) => r.who === 'annie');
  assert.strictEqual(routes.length, 2);
  const [lure, follow] = routes;
  assert.ok(lure.hideAt <= follow.start, 'one Annie marker at a time');
  assert.strictEqual(String(pt(follow.path[0])), String(pt(lure.path.at(-1))), 'she starts where the lure left her');
  assert.ok(follow.start >= outer, 'she goes in after the gate breaks');
  assert.ok(follow.path.includes('shigO'), 'through the outer gate');
  assert.strictEqual(follow.path.at(-1), 'shig'); // where the refugee scene finds the three Warriors
  assert.strictEqual(c.titanFormAt('maria-fall', 'annie', follow.start), null); // on foot, as a human
});

test('Pure Titan routes stay on land', () => {
  for (const e of E) for (const r of e.routes.filter((x) => x.who === 'pure')) for (const p of r.path) assert.ok(World.onLand(pt(p)), e.id + ': a Pure Titan route point is in the sea: ' + p);
});

test('850: Zeke comes from the south coast through lost Maria territory, and the route is marked unconfirmed', () => {
  for (const who of ['zeke', 'pieck']) {
    const r = ev('ragako').routes.find((x) => x.who === who);
    assert.ok(r.uncertain, who + ': the story does not show the route');
    const start = pt(r.path[0]);
    assert.ok(start[1] > P.shigO[1] && World.coastDist(start) < 12, who + ' lands on the south coast');
    for (const p of r.path) assert.ok(pt(p)[1] > World.C[1], who + ' stays in the south');
    assert.ok(r.path.includes('shigO') && r.path.includes('shigI'), 'through the gates broken in 845');
    assert.strictEqual(region(r.path.at(-1)), 'rose');
  }
});

test('key scenes belong to their events, have a caption and pictures, and show a Titan only while someone is that Titan', () => {
  const fs = require('node:fs'), path = require('node:path');
  const { root } = require('./helpers.js');
  let n = 0;
  for (const [id, list] of Object.entries(c.KEY_SCENES)) {
    const e = ev(id);
    assert.ok(e, 'unknown event ' + id);
    let last = 0;
    for (const k of list) {
      n++;
      assert.ok(k.at > last && k.at < 1, id + ': key scenes in order, inside the event');
      last = k.at;
      assert.ok(e.beats[k.beat], id + ': no step ' + k.beat + ' for the caption');
      assert.ok(['breach', 'transform', 'attack', 'seal', 'scene'].includes(k.fx), id + ': unknown motion ' + k.fx);
      assert.ok(k.pics.length >= 1 && k.pics.length <= 2);
      for (const p of k.pics) {
        const [kind, name] = p.split(':');
        assert.ok(fs.existsSync(path.join(root, kind === 'titan' ? 'assets/scenes/titans' : 'assets/scenes', name + '.webp')), 'no picture file for ' + p);
        if (kind === 'titan') {
          assert.ok(fs.existsSync(path.join(root, 'assets/portraits/titans', name + '.webp')), 'no embedded fallback for ' + p);
          if (!k.symbolic) assert.ok(e.characters.some((x) => c.titanFormAt(id, x[0], k.at) === name), id + ' at ' + k.at + ': nobody is the ' + name + ' Titan then');
        }
      }
    }
  }
  assert.ok(n >= 20, 'key scenes: ' + n);
  // a gate breach cut-in comes with the breach itself
  const fall = c.KEY_SCENES['maria-fall'], marks = ev('maria-fall').marks;
  assert.strictEqual(fall[0].at, marks.find((m) => m.point === 'shigO').at);
  assert.strictEqual(fall[1].at, marks.find((m) => m.point === 'shigI').at);
});

test('after 857: railways stay on land, ports sit on the coast, and nothing new is built before its time', () => {
  const G = c.GROWTH, Tof = ([id, p]) => E.findIndex((e) => e.id === id) + p;
  assert.strictEqual(E.at(-1).id, 'rebuild');
  assert.strictEqual(E.at(-1).frame, 'island');
  for (const rl of G.rails) {
    const geo = c.RouteGeo.build(rl.path, 1);
    for (let i = 0; i <= 120; i++) { const q = c.RouteGeo.at(geo.tab, i / 120); assert.ok(World.onLand([q.x, q.y]), rl.id + ': the line runs into the sea'); }
    assert.ok(Tof(rl.to) > Tof(rl.from));
  }
  // only the harbour line, laid with the Volunteers, is older than the closing event
  assert.deepStrictEqual(G.rails.filter((rl) => rl.from[0] !== 'rebuild').map((rl) => rl.id).join(), 'harbour');
  assert.strictEqual(G.rails[0].from[0], 'overseas');
  const ids = new Set();
  for (const g of G.places) {
    assert.ok(!ids.has(g.id)); ids.add(g.id);
    assert.strictEqual(g.at[0], 'rebuild', g.id + ' is built too early');
    assert.ok(World.onLand(g.p), g.id + ' is in the sea');
    if (g.kind === 'port') { assert.ok(World.coastDist(g.p) < 8, g.id + ' is not on the coast'); assert.ok(!World.onLand([g.p[0] + g.sea[0] * 16, g.p[1] + g.sea[1] * 16]), g.id + ': its pier does not reach the sea'); }
    else assert.ok(World.coastDist(g.p) > 12, g.id + ' is too close to the shore');
    for (const d of World.DISTRICTS) assert.ok(Math.hypot(g.p[0] - d.base[0], g.p[1] - d.base[1]) > d.r + 8, g.id + ' sits on ' + d.id);
    // a new place stands on a railway line, or will: within reach of one
    if (g.kind !== 'village') assert.ok(G.rails.some((rl) => rl.path.some((p) => Math.hypot(p[0] - g.p[0], p[1] - g.p[1]) < 1)), g.id + ' has no railway');
  }
  assert.ok(G.places.filter((g) => g.kind === 'port').length >= 3);
});

test('the harbour railway is older than the Rumbling, runs outside the Walls where the great circle wrecks it, and is laid again after 857', () => {
  const G = c.GROWTH, first = G.rails.find((rl) => rl.id === 'harbour'), again = G.rails.find((rl) => rl.id === 'harbour-relaid');
  assert.ok(first && again);
  assert.strictEqual(first.from[0], 'overseas');
  assert.strictEqual(again.from[0], 'rebuild');
  const geo = c.RouteGeo.build(first.path, 1);
  for (let i = 0; i <= 40; i++) { const q = c.RouteGeo.at(geo.tab, i / 40); assert.ok(World.rOf([q.x, q.y]) >= World.R.maria + 29, 'the first harbour line stays outside Wall Maria'); }
  // the new one joins the same two ends
  const ends = (rl) => [rl.path[0], rl.path.at(-1)].map((p) => p.map(Math.round).join()).sort().join(' ');
  assert.strictEqual(ends(again), ends(first));
});
