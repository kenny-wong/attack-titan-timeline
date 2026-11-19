// The 3D figures: the design (assets/3d-design/design.json) and the rig evaluator (rig.js).
const test = require('node:test');
const assert = require('node:assert');
const { load, read } = require('./helpers.js');
const { Rig } = load();
const D = JSON.parse(read('assets/3d-design/design.json'));
const rigs = Object.fromEntries(Object.entries(D.rigs).map(([k, s]) => [k, Rig.compile(s, k)]));
const props = Object.fromEntries(Object.entries(D.props).map(([k, s]) => [k, Rig.compile(s, k)]));
const posed = (rig, clip, t) => Rig.pose(rig, clip, t, new Float32Array(rig.n * 12));
const TITANS = ['titan1', 'titan2', 'titan3', 'titan4', 'titan5'];

test('design: every figure, prop and setting the stage uses is there', () => {
  for (const k of [...TITANS, 'titan6', 'titanLying', 'titanCrawl', 'wallTitan', 'civA', 'civB', 'civC', 'soldier', 'horse', 'rider']) assert.ok(rigs[k], 'rig ' + k);
  for (const k of ['cannon', 'boat', 'locomotive', 'wagon', 'house', 'houseTall', 'castle', 'chapel', 'ruin', 'villageHut', 'warehouse', 'crane', 'pier', 'steamer', 'seawallBlock', 'chimney', 'treeBroadleaf', 'treeConifer', 'treeGiant']) assert.ok(props[k], 'prop ' + k);
  for (const k of TITANS) assert.deepStrictEqual(Object.keys(rigs[k].clips).sort(), ['idle', 'reach', 'walk'], k + ' clips');
  for (const k of ['civA', 'civB', 'civC']) assert.ok(rigs[k].clips.idle && rigs[k].clips.walk && rigs[k].clips.run, k + ' clips');
  for (const k of ['titan6', 'titanCrawl', 'wallTitan', 'horse', 'rider']) assert.ok(rigs[k].clips.idle && rigs[k].clips.walk, k + ' clips');
  assert.ok(props.cannon.clips.fire && rigs.horse.attach.saddle);
  for (const path of ['walls.stone', 'walls.gate.door', 'walls.gateBroken.hole', 'walls.gateSealedCrystal.color', 'walls.warning.lost', 'walls.district.paving', 'terrain.sea.deep', 'terrain.trample', 'terrain.scarEarth', 'terrain.rail.bed', 'light.day.sun', 'light.night.windows', 'light.shadow.color', 'fx.steam.color', 'fx.wallSteam.color', 'fx.dust.color', 'fx.cannonSmoke.flash']) {
    const v = path.split('.').reduce((o, k) => o && o[k], D);
    assert.match(String(v), /^#[0-9a-f]{6}$/i, path);
  }
  assert.ok(D.light.day.sunDir.length === 3 && D.light.day.sunDir[1] > 0, 'the sun is above the horizon');
});

test('design: figures stay within their part budgets and every colour is a colour', () => {
  const max = { civA: 7, civB: 7, civC: 7, soldier: 9, horse: 10, rider: 7 };
  for (const [k, r] of Object.entries(rigs)) assert.ok(r.n <= (max[k] || 13), `${k} has ${r.n} parts`);
  for (const [k, r] of Object.entries(props)) assert.ok(r.n <= 12, `${k} has ${r.n} parts`);
  for (const [k, s] of [...Object.entries(D.rigs), ...Object.entries(D.props)]) for (const p of s.parts) assert.match(p.color, /^#[0-9a-f]{6}$/i, k + '.' + p.id);
});

test('rig: a standing figure stands on the ground and is as tall as the design says', () => {
  for (const k of [...TITANS, 'wallTitan', 'civA', 'civB', 'civC', 'soldier']) {
    const r = rigs[k], e = Rig.extent(r, posed(r, 'none', 0));
    assert.ok(Math.abs(e.lo) < r.height * 0.03, `${k} feet at ${e.lo.toFixed(2)}`);
    assert.ok(Math.abs(e.hi - r.height) < r.height * 0.08, `${k} is ${e.hi.toFixed(2)} tall, design ${r.height}`);
  }
  for (const k of ['titanLying', 'titanCrawl']) { const r = rigs[k], e = Rig.extent(r, posed(r, 'idle', 0.3)); assert.ok(e.hi < r.height * 0.5, k + ' lies low'); }
});

test('rig: walking, the legs are half a stride apart and the feet stay near the ground', () => {
  const val = (c, t) => (c ? c[0] + c[1] * Math.sin(2 * Math.PI * (c[3] * t + c[2])) : 0);
  for (const k of [...TITANS, 'wallTitan', 'civA', 'civB', 'civC', 'soldier']) {
    const r = rigs[k], w = r.clips.walk, iL = r.parts.findIndex((p) => /^(thigh|leg)L$/.test(p.id)), iR = r.parts.findIndex((p) => /^(thigh|leg)R$/.test(p.id));
    assert.ok(iL >= 0 && iR >= 0 && w.parts[iL] && w.parts[iR], k + ' has two legs that move');
    assert.ok(Math.abs(w.parts[iL][0][1]) > 5, k + ' swings its legs');
    for (const t of [0, 0.13, 0.4, 0.77]) assert.ok(Math.abs(val(w.parts[iL][0], t) - val(w.parts[iR][0], t + 0.5)) < 0.5, `${k}: right leg is the left leg half a cycle later`);
    for (let t = 0; t < 1; t += 0.05) { const e = Rig.extent(r, posed(r, 'walk', t)); assert.ok(e.lo > -r.height * 0.07 && e.lo < r.height * 0.09, `${k} feet at ${e.lo.toFixed(2)} at t=${t.toFixed(2)}`); }
    assert.ok(r.stride > 0);
  }
});

test('rig: every clip of every figure gives a finite pose, and an unknown clip gives the rest pose', () => {
  for (const [k, r] of [...Object.entries(rigs), ...Object.entries(props)]) {
    for (const clip of Object.keys(r.clips)) for (const t of [0, 0.31, 0.5, 0.99]) for (const v of posed(r, clip, t)) assert.ok(Number.isFinite(v), `${k}/${clip}`);
    assert.deepStrictEqual(Array.from(posed(r, 'no-such-clip', 0.4)), Array.from(posed(r, 'no-such-clip', 0)));
  }
});

test('rig: blending two clips lies between them, and joints follow their parents', () => {
  const r = rigs.titan1, a = posed(r, 'idle', 0.2), b = posed(r, 'walk', 0.2), half = Rig.pose(r, 'idle', 0.2, new Float32Array(r.n * 12), 'walk', 0.2, 0.5), full = Rig.pose(r, 'idle', 0.2, new Float32Array(r.n * 12), 'walk', 0.2, 1);
  const root = 7; // the root joint's height
  assert.ok(Math.abs(half[root] - (a[root] + b[root]) / 2) < 1e-4);
  for (let i = 0; i < full.length; i++) assert.ok(Math.abs(full[i] - b[i]) < 1e-5);
  // a shin hangs from its thigh's end: the knee stays one thigh-length from the hip in every pose
  const thigh = r.parts.findIndex((p) => p.id === 'thighL'), shin = r.parts.findIndex((p) => p.id === 'shinL'), len = Math.hypot(...r.parts[shin].at);
  for (const t of [0, 0.25, 0.6]) { const m = posed(r, 'walk', t), d = Math.hypot(m[shin * 12 + 3] - m[thigh * 12 + 3], m[shin * 12 + 7] - m[thigh * 12 + 7], m[shin * 12 + 11] - m[thigh * 12 + 11]); assert.ok(Math.abs(d - len) < 1e-3, 'knee distance ' + d); }
});

test('rig: a broken design is refused', () => {
  assert.throws(() => Rig.compile({ parts: [{ id: 'a', parent: 'b', shape: 'box' }, { id: 'b', parent: null, shape: 'box' }] }), /before its parent/);
  assert.throws(() => Rig.compile({ parts: [{ id: 'a', parent: null, shape: 'blob' }] }), /unknown shape/);
  assert.throws(() => Rig.compile({ parts: [] }), /no parts/);
});
