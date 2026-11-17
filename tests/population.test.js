// Story and geometry checks for the population engine (Pure Titans and civilians).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dataScript = html.match(/<script>([\s\S]*?)<\/script>/)[1]; // first plain <script>: story data
const ctx = {};
vm.createContext(ctx);
vm.runInContext(dataScript + ';globalThis.events=events;', ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'src/population.js'), 'utf8'), ctx);
const coast = JSON.parse(fs.readFileSync(path.join(root, 'assets/map-designs/frame-island.json'), 'utf8')).coastApp;
const pop = ctx.Population.create(ctx.events, coast, null);
const T = (id, p) => ctx.events.findIndex((e) => e.id === id) + p;
const nr = (p, c, rx, ry) => Math.hypot((p[0] - c[0]) / rx, (p[1] - c[1]) / ry);
const inMaria = (p) => nr(p, [260, 217], 244, 215) < 1;
const inRose = (p) => nr(p, [260, 209], 173, 146) < 1;
// Shiganshina and Trost bulge outward from their Walls; count their residents as inside.
const inShig = (p) => Math.hypot(p[0] - 259, p[1] - 447) < 20, inTrostD = (p) => Math.hypot(p[0] - 259, p[1] - 361) < 16;
const mariaLand = (p) => inMaria(p) && !inRose(p) && !inTrostD(p);
const at = (Tl, kind) => pop.agents.filter((a) => a.kind === kind).map((a) => ({ a, s: pop.stateAt(a, Tl, 0, { reduced: true }) })).filter((x) => x.s.vis > 0.5);

test('every figure starts inside its area', () => {
  for (const a of pop.agents) assert.ok(pop.world.inZone(a.zone0, a.home0), `agent ${a.id} (${a.zone0}) at ${a.home0}`);
});

test('routes cross the Walls only at gates (before the Walls collapse)', () => {
  const gates = { maria: [[259, 432]], rose: [[259, 355], [433, 209], [260, 63], [87, 209]], sina: [[259, 282]] };
  const ell = { maria: [[260, 217], 244, 215], rose: [[260, 209], 173, 146], sina: [[260, 207], 95, 75] };
  for (const a of pop.agents) for (const op of a.ops) {
    if (op.type !== 'move' || op.straight || op.T0 >= T('rumbling', 0.43)) continue;
    const pts = op.path.pts;
    for (let i = 1; i < pts.length; i++) {
      // walk each segment finely and look for a change of side of each wall
      for (let k = 1; k <= 20; k++) {
        const p = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * (k - 1) / 20, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * (k - 1) / 20];
        const q = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k / 20, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k / 20];
        for (const w of Object.keys(ell)) {
          const [c, rx, ry] = ell[w];
          if ((nr(p, c, rx, ry) < 1) !== (nr(q, c, rx, ry) < 1))
            assert.ok(gates[w].some((g) => Math.hypot(q[0] - g[0], q[1] - g[1]) < 22), `agent ${a.id} crosses Wall ${w} away from a gate near ${q.map(Math.round)}`);
        }
      }
    }
  }
});

test('wandering stays inside the area', () => {
  for (const a of pop.agents.filter((x) => !x.ops.length)) for (let t = 0; t < 120; t += 1.7) {
    const s = pop.stateAt(a, 0.5, t);
    assert.ok(pop.world.inZone(a.zone0, [s.x, s.y]) || Math.hypot(s.x - a.home0[0], s.y - a.home0[1]) < 30, `agent ${a.id} wandered out of ${a.zone0}`);
  }
});

test('before 845 Titans stay outside Wall Maria and civilians live inside', () => {
  const Tl = T('marcel', 0.5);
  assert.ok(at(Tl, 'titan').length >= 20);
  assert.ok(at(Tl, 'titan').every(({ s }) => !inMaria([s.x, s.y]) && !inShig([s.x, s.y])));
  assert.ok(at(Tl, 'civilian').every(({ s }) => inMaria([s.x, s.y]) || inShig([s.x, s.y])));
});

test('the Fall of Maria: Titans flood Maria territory, civilians retreat behind Wall Rose', () => {
  const Tl = T('refugees', 0.1);
  assert.ok(at(Tl, 'titan').filter(({ s }) => mariaLand([s.x, s.y])).length >= 15);
  assert.strictEqual(at(Tl, 'civilian').filter(({ s }) => mariaLand([s.x, s.y]) || inShig([s.x, s.y])).length, 0);
});

test('Trost: Titans enter the district and are cleared after the seal', () => {
  const inTrost = (s) => Math.hypot(s.x - 259, s.y - 361) < 14;
  assert.ok(at(T('trost-attack', 1), 'titan').filter(({ s }) => inTrost(s)).length >= 5);
  assert.strictEqual(at(T('annie-mp', 0.2), 'titan').filter(({ s }) => inTrost(s)).length, 0);
});

test('Ragako: Titans appear inside Wall Rose without any breach', () => {
  const ragTitans = at(T('ragako', 0.6), 'titan').filter(({ s }) => inRose([s.x, s.y]));
  assert.ok(ragTitans.length >= 5);
  assert.ok(pop.agents.filter((a) => a.zone0 === 'ragako' && a.kind === 'civilian').every((a) => pop.stateAt(a, T('ragako', 0.6), 0, { reduced: true }).vis < 0.5));
});

test('by 851 most Titans are gone and civilians resettle Maria', () => {
  const Tl = T('ships', 0.1);
  assert.ok(at(Tl, 'titan').length <= 1); // the immobile Ragako Titan
  assert.ok(at(Tl, 'civilian').filter(({ s }) => mariaLand([s.x, s.y]) || inShig([s.x, s.y])).length >= 10);
});

test('857: no Titans remain', () => {
  assert.strictEqual(at(T('ambassadors', 1), 'titan').length, 0);
});

test('summary names the areas', () => {
  const s = pop.summary(T('refugees', 0.5));
  assert.ok(s.titan.has('maria'));
  assert.ok(!s.civilian.has('maria'));
  assert.ok(s.civilian.has('rose') && s.civilian.has('sina'));
});

test('from 851 to the Alliance only the immobile Ragako Titan remains inside the Walls, and it is named as such', () => {
  for (const id of ['ships', 'overseas', 'liberio', 'pieck', 'rumbling']) {
    const inside = at(T(id, 0.5), 'titan').filter(({ s }) => inMaria([s.x, s.y]) || inShig([s.x, s.y]));
    if (id === 'rumbling') continue; // Zeke's Titans are in Shiganshina by then
    assert.strictEqual(inside.map(({ a }) => String(!!a.lying)).join(), 'true', id);
  }
  const s = pop.summary(T('ships', 0.5));
  assert.ok(s.titan.has('ragakoFixed') && !s.titan.has('rose'));
  const lying = pop.agents.find((a) => a.lying);
  assert.strictEqual(pop.stateAt(lying, T('alliance', 1), 0, { reduced: true }).vis, 0); // human again at the end
});
