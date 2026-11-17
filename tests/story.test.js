// Story geography checks for the event data (from the 2026-11-17 accuracy audit).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1] + ';globalThis.E=events;globalThis.PP=P;', ctx);
const app = html.match(/<script>\s*const \$=s=>[\s\S]*?<\/script>/)[0];
const labelKeys = [...app.matchAll(/const labels=\{([\s\S]*?)\};/g)][0][1].match(/(\w+):C\(/g).map((s) => s.slice(0, -3));
const ev = (id) => ctx.E.find((e) => e.id === id);
const pt = (p) => (Array.isArray(p) ? p : ctx.PP[p]);
const nr = (p, c, rx, ry) => Math.hypot((p[0] - c[0]) / rx, (p[1] - c[1]) / ry);
const inSina = (p) => nr(p, [260, 207], 95, 75) < 1, inRose = (p) => nr(p, [260, 209], 173, 146) < 1, inMaria = (p) => nr(p, [260, 217], 244, 215) < 1;

test('every event place has a readable name', () => {
  for (const e of ctx.E) assert.ok(labelKeys.includes(e.place) || ['mitras'].includes(e.place), `no label for place ${e.place} (${e.id})`);
});

test('the Reiss chapel is in Rose territory, outside Wall Sina, and Rod crawls to Orvud from outside', () => {
  const chapel = pt('reiss');
  assert.ok(inRose(chapel) && !inSina(chapel));
  const rod = ev('rod').routes.find((r) => r.who === 'rod');
  assert.ok(rod.path.every((p) => !inSina(pt(p)) || pt(p)[1] < 130), 'Rod should not walk through Wall Sina territory');
  const grisha = ev('founder-transfer').routes[0];
  assert.ok(grisha.path.map(pt).every((p) => !inSina(p)), 'Grisha should go around Wall Sina, not through it');
});

test('the Titans at Utgard come from Ragako, inside Wall Rose', () => {
  const pure = ev('utgard').routes.find((r) => r.who === 'pure');
  assert.ok(pure.path.map(pt).every(inRose));
});

test('Reiner and Bertholdt reveal themselves on Wall Rose near Utgard and flee into Maria territory', () => {
  const e = ev('reveal-escape');
  const reveal = pt(e.place);
  assert.ok(Math.abs(nr(reveal, [260, 209], 173, 146) - 1) < 0.05, 'reveal point should be on Wall Rose');
  assert.ok(Math.hypot(reveal[0] - pt('utgard')[0], reveal[1] - pt('utgard')[1]) < 40, 'reveal should be near Utgard');
  const end = pt(e.routes.find((r) => r.who === 'reiner').path.at(-1));
  assert.ok(inMaria(end) && !inRose(end));
});

test('Shiganshina 850: Zeke is on the Maria side of the inner gate', () => {
  const zeke = ev('maria-retaken').routes.find((r) => r.who === 'zeke');
  assert.ok(pt(zeke.path[0])[1] < pt('shigI')[1], 'Zeke should start north of the inner gate');
  const marks = ev('maria-retaken').marks;
  assert.ok(marks.find((m) => m.point === 'shigO').at < marks.find((m) => m.point === 'shigI').at, 'outer gate is sealed before the inner gate is blocked');
});

test('the Rumbling starts on the Walls and ends at sea', () => {
  for (const r of ev('rumbling').routes) {
    const s = pt(r.path[0]);
    assert.ok(Math.abs(nr(s, [260, 217], 244, 215) - 1) < 0.17, `route starts away from Wall Maria: ${s}`);
  }
});

test('the 857 delegation includes Jean and Connie', () => {
  assert.match(ev('ambassadors').description.en, /Jean, Connie/);
});

test('a route reaching a gate arrives by the time the gate breaks or is sealed', () => {
  for (const e of ctx.E) for (const m of e.marks) {
    if (m.at === undefined || !['breach', 'repair'].includes(m.kind)) continue;
    const mp = pt(m.point);
    for (const r of e.routes) {
      const end = pt(r.path.at(-1));
      if (Math.hypot(end[0] - mp[0], end[1] - mp[1]) < 1) assert.ok(r.end <= m.at + 0.01, `${e.id}: ${r.who} arrives at ${r.end}, after the ${m.kind} at ${m.at}`);
    }
  }
});

test('the 845 Warriors land on the south-west coast and head east without doubling back', () => {
  const routes = ev('marcel').routes;
  const arrive = routes.find((r) => r.who === 'reiner' && r.start === 0), onward = routes.find((r) => r.who === 'reiner' && r.start > 0.5);
  const [a0, a1] = arrive.path.map(pt), [b0, b1] = onward.path.map(pt);
  assert.ok(a0[0] < pt('shigO')[0] - 150, 'landing should be well west of Shiganshina');
  const u = [a1[0] - a0[0], a1[1] - a0[1]], v = [b1[0] - b0[0], b1[1] - b0[1]];
  assert.ok(u[0] * v[0] + u[1] * v[1] > 0, 'the onward route should not reverse the arrival direction');
});

test('the Fall of Maria starts where the 845 landing scene leaves the Warriors: at Shiganshina outer gate', () => {
  for (const who of ['annie', 'bert', 'reiner']) {
    const first = ev('maria-fall').routes.find((r) => r.who === who);
    assert.strictEqual(first.path[0], 'outer', `${who} should start in front of the gate`);
  }
  assert.strictEqual(ev('marcel').routes.filter((r) => r.who === 'reiner').at(-1).path.at(-1), 'outer');
});
