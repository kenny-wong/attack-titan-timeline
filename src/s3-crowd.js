/* The crowd of the 3D stage: Pure Titans, civilians, riders, boats, Wall cannons and the Wall Titans, as
   small rigs drawn with instancing. Where everyone is comes from population.js; added here in real time:
   figures turn to where they walk and step in time with the distance covered, civilians run from a Titan
   in the same territory, Titans lean and reach towards nearby people, cannons fire when Titans come near,
   and a killed Titan goes up in steam. A person the simulation has given to a Titan (`pop.meals`) is
   snatched from the ground, lifted to the mouth and eaten, with a spray of blood and a stain left on
   the ground. Also the rows of Wall Titans in the Rumbling, and signal flares. */
(function (global) {
  'use strict';
  const S3 = global.S3;
  if (!S3) return;
  const T = S3.T, RAD = Math.PI / 180, TAU = Math.PI * 2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const turn = (from, to, k) => { let d = (to - from) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return from + d * k; };

  function Crowd(ctx) {
    const { scene, World, pop, D, Q, geos, rigs, props, relief } = ctx;
    const { C, R, DISTRICTS } = World, hAt = relief.land, Rig = global.Rig, V = global.View3D;
    const wade = (x, z) => Math.max(-4.4, relief.h(x, z)); // the Wall Titans walk on the sea bed, up to their thighs in water
    const civRig = (a) => rigs[a.variant === 3 ? 'civC' : a.id & 1 ? 'civB' : 'civA']; // every civilian is one person: a man, a woman or a child
    const rigOf = (a) => (a.kind === 'titan' ? rigs[a.crawl ? 'titanCrawl' : a.lying ? 'titanLying' : 'titan' + a.variant] : a.kind === 'wallTitan' ? rigs.wallTitan : a.kind === 'rider' ? rigs.horse : null);
    // capacity: every part of every figure that can be on stage at once
    const need = { box: 40, sphere: 40, capsule: 40, cone: 20 };
    const count = (rig, n = 1) => { for (const p of rig.parts) need[p.shape] += n; };
    for (const a of pop.agents) {
      if (a.kind === 'civ') count(civRig(a));
      else if (a.kind === 'boat') count(props.boat);
      else { count(rigOf(a)); if (a.kind === 'rider') count(rigs.rider); }
    }
    count(props.cannon, pop.cannons.length);
    const nTitans = pop.agents.filter((a) => a.kind === 'titan').length; need.sphere += nTitans * 4; need.box += nTitans * 2; // faces, drawn when the camera is close, and blood round the mouth and on the hand
    // the standing rows: Wall Titans shoulder to shoulder in every Wall and district wall
    const WT = rigs.wallTitan, gapW = Q.rowGap, rows = [];
    const GAP_R = R.maria + 36, GAP_HALF = 11.5;
    for (const wall of ['sina', 'rose', 'maria']) {
      const Rw = R[wall], n = Math.round((TAU * Rw) / gapW), off = wall === 'rose' ? 0.37 : wall === 'maria' ? 0.71 : 0;
      for (let i = 0; i < n; i++) { const deg = ((i + off) / n) * 360 - 180, near = Math.min(...[-90, 0, 90, 180, -180].map((c) => Math.abs(deg - c))); rows.push({ Rw, th: deg * RAD, gap: near < GAP_HALF, ph: (i * 0.37) % 1 }); }
      for (const d of DISTRICTS) if (d.wall === wall) { const m = Math.round((Math.PI * d.r) / gapW); for (let i = 1; i < m; i++) { const a = (d.deg - 90 + (180 * i) / m) * RAD; rows.push({ bulge: d, x: d.base[0] + Math.cos(a) * d.r, z: d.base[1] + Math.sin(a) * d.r, th: a, Rw, ph: (i * 0.53) % 1 }); } }
    }
    count(WT, rows.length);
    const mat = new T.MeshLambertMaterial();
    const batch = S3.Batch(geos, mat, need, { dynamic: true, cast: Q.shadow > 0, receive: false });
    scene.add(batch.group);
    // soft round shadows under the figures where there is no shadow map (phones, and computers that proved too slow for one)
    let blobs = null;
    {
      blobs = new T.InstancedMesh(new T.CircleGeometry(0.5, 12).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: S3.col(D.light.shadow.color), transparent: true, opacity: D.light.shadow.opacity * 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), pop.agents.length + rows.length + 8);
      blobs.frustumCulled = false; blobs.count = 0; blobs.renderOrder = 2; scene.add(blobs);
    }
    const steam = S3.Puffs(Q.puffs, { order: 8 }); scene.add(steam.points);
    const smoke = S3.Puffs(200, { order: 8 }); scene.add(smoke.points);
    const flash = S3.Puffs(pop.cannons.length + 4, { additive: true, order: 9 }); scene.add(flash.points);
    // ---- eating ----
    // The parts of a meal, as shares of its length: bend down and snatch, grip, lift to the mouth, bite and chew, straighten up.
    const EAT = { snatch: 0.2, grip: 0.27, lift: 0.55, chew: 0.9, take0: 0.11, take1: 0.21, burst: 0.11, stain: 0.9 };
    const FB = D.fx.blood || { color: '#a83f32', dark: '#542d29', mist: '#b86552', drops: 12, opacity: 0.82 }, FS = D.fx.bloodStain || { color: '#542d29', size: 2.4, opacity: 0.58 };
    for (const k in rigs) { // where a Titan holds its prey, where its mouth is, and when its head comes down to bite
      const r = rigs[k];
      if (!r.clips.eat || r.head < 0) continue;
      const hp = r.parts[r.head], fi = r.parts.findIndex((p) => p.id === 'forearmR'), fp = r.parts[fi], onAllFours = k === 'titan6';
      r.mouth = [hp.centre[0], hp.centre[1] - 0.2 * hp.size[1], hp.centre[2] + 0.45 * hp.size[2]];
      r.hold = fp && !onAllFours ? { i: fi, p: [fp.centre[0], fp.centre[1] - fp.size[1] / 2, fp.centre[2]] } : { i: r.head, p: r.mouth }; // the abnormal on all fours takes its prey with the mouth
      const c = r.clips.eat.parts[r.head] && r.clips.eat.parts[r.head][0], h = c && c[1] ? Math.max(1, Math.round(c[3])) : 2, peaks = [];
      for (let n = 0; n < h; n++) peaks.push(c && c[1] ? ((((c[1] > 0 ? 0.25 : 0.75) - c[2] + n) / h) % 1 + 1) % 1 : 0.2 + (0.6 * n) / h);
      peaks.sort((x, y) => x - y);
      const first = peaks.find((p) => p >= 0.18) ?? peaks[0];
      r.bites = peaks.filter((p) => p >= first).map((p) => EAT.lift + (EAT.chew - EAT.lift) * p); // as shares of the meal
    }
    const blood = S3.Puffs(Q.shadow > 0 ? 420 : 200, { order: 9, maxPx: 90 }); scene.add(blood.points);
    // blood on the ground: flat blots with a ragged edge, each with its own strength
    const STAINS = 160, stainFx = new T.InstancedBufferAttribute(new Float32Array(STAINS * 3), 3).setUsage(T.DynamicDrawUsage); // strength, its own shape, how dry
    const stainGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2); stainGeo.setAttribute('aFx', stainFx);
    const stainMat = new T.ShaderMaterial({
      uniforms: { uColor: { value: S3.col(FB.color) }, uDry: { value: S3.col(FS.color) }, uLight: { value: new T.Color(1, 1, 1) }, uK: { value: 1 } },
      vertexShader: 'attribute vec3 aFx; varying vec2 vUv; varying vec3 vFx;\nvoid main(){ vUv = uv; vFx = aFx; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uColor; uniform vec3 uDry; uniform vec3 uLight; varying vec2 vUv; varying vec3 vFx;\nvoid main(){ vec2 p = vUv * 2.0 - 1.0; float a = atan(p.y, p.x), r = length(p), s = vFx.y * 40.0;\n float edge = 0.6 + 0.15 * sin(a * 3.0 + s) + 0.1 * sin(a * 7.0 + s * 2.3) + 0.05 * sin(a * 13.0 + s * 5.1);\n float m = smoothstep(edge, edge - 0.2, r) * (0.75 + 0.25 * smoothstep(0.0, edge, r));\n if (m * vFx.x < 0.01) discard;\n gl_FragColor = vec4(mix(uColor, uDry, vFx.z) * uLight, m * vFx.x);\n#include <colorspace_fragment>\n}',
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5,
    });
    const stains = new T.InstancedMesh(stainGeo, stainMat, STAINS); stains.frustumCulled = false; stains.count = 0; stains.renderOrder = 3; scene.add(stains);
    const LINB = { fresh: S3.lin(FB.color), dark: S3.lin(FB.dark), mist: S3.lin(FB.mist) }, hand = [0, 0, 0], mouth = [0, 0, 0], jm = new Float32Array(12);
    const jointPoint = (b, mm, i, p, out) => { S3.mul(jm, 0, b, 0, mm, i * 12); out[0] = jm[0] * p[0] + jm[1] * p[1] + jm[2] * p[2] + jm[3]; out[1] = jm[4] * p[0] + jm[5] * p[1] + jm[6] * p[2] + jm[7]; out[2] = jm[8] * p[0] + jm[9] * p[1] + jm[10] * p[2] + jm[11]; return out; };
    const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    let nBlood = 0;
    // Pose a Titan through its meal (f = 0..1): idle -> grab -> eat -> idle. The chewing is timed by the meal, so a bite is a moment of the story.
    function eatPose(rig, f, t, a) {
      const ti = idleT(rig, t, a), tg = t / rig.clips.grab.period, te = clamp01((f - EAT.lift) / (EAT.chew - EAT.lift));
      if (f < EAT.snatch) Rig.pose(rig, 'idle', ti, mats, 'grab', tg, smooth(f / EAT.snatch));
      else if (f < EAT.grip) Rig.pose(rig, 'grab', tg, mats);
      else if (f < EAT.lift) Rig.pose(rig, 'grab', tg, mats, 'eat', 0, smooth((f - EAT.grip) / (EAT.lift - EAT.grip)));
      else if (f < EAT.chew) Rig.pose(rig, 'eat', te, mats);
      else Rig.pose(rig, 'eat', 1, mats, 'idle', ti, smooth((f - EAT.chew) / (1 - EAT.chew)));
    }
    // The person in the Titan's grip, the spray at each bite and the blood left on mouth and hand. `base` and `mats` hold the Titan as just drawn.
    function eatScene(rig, m, f, t, k, E, yaw) {
      const vr = civRig(m.victim), dv = dyn[m.victim.id], swallow = rig.bites[0], H = rig.height * k;
      jointPoint(base, mats, rig.hold.i, rig.hold.p, hand); jointPoint(base, mats, rig.head, rig.mouth, mouth);
      const gone = smooth((f - swallow + 0.035) / 0.05);
      if (gone < 1) { // still there: on the ground, then in the grip, then into the mouth
        const near = dv.has && Math.hypot(dv.x - m.spot[0], dv.y - m.spot[1]) < 9, gx = near ? dv.x : m.spot[0], gz = near ? dv.y : m.spot[1], gy = hAt(gx, gz);
        const take = smooth((f - EAT.take0) / (EAT.take1 - EAT.take0)), kv = vr.unit * E * (1 - gone * 0.85), root = vr.parts[0].at[1] * kv;
        let px = gx + (hand[0] - gx) * take, py = gy + (hand[1] - root - gy) * take, pz = gz + (hand[2] - gz) * take;
        px += (mouth[0] - px) * gone; py += (mouth[1] - root * 0.5 - py) * gone; pz += (mouth[2] - pz) * gone;
        Rig.pose(vr, 'run', t * 2.2 + m.victim.phase, mats2, 'held', t / ((vr.clips.held && vr.clips.held.period) || 0.5) + m.victim.phase, vr.clips.held ? take : 0);
        S3.place(base2, px, py, pz, yaw + Math.PI + Math.sin(t * 7 + m.victim.phase) * 0.5 * take, kv); S3.pushRig(batch, vr, mats2, base2, 1);
        if (take < 0.5) blob(px, pz, gy, vr.height * kv, 0.9 * kv);
      }
      // a short spray at every bite: drops thrown forward and down, a thin red mist at the mouth
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      for (let b = 0; b < rig.bites.length; b++) {
        const g = (f - rig.bites[b]) / EAT.burst;
        if (g <= 0 || g >= 1 || nBlood > blood.cap - FB.drops - 3) continue;
        for (let j = 0; j < FB.drops; j++) {
          const r1 = hash(m.victim.id * 13 + b * 7 + j), r2 = hash(m.victim.id * 29 + b * 3 + j * 5), r3 = hash(m.victim.id * 5 + b + j * 11), out = (0.25 + r1 * 0.75) * H * 0.42 * g, side = (r2 - 0.5) * H * 0.5 * g, c = g * 0.8;
          blood.set(nBlood++, mouth[0] + fx * out + fz * side, mouth[1] + (0.12 + r3 * 0.3) * H * g - H * 0.75 * g * g, mouth[2] + fz * out - fx * side, H * (0.08 + 0.08 * r3) * (1 - g * 0.4), LINB.fresh[0] + (LINB.dark[0] - LINB.fresh[0]) * c, LINB.fresh[1] + (LINB.dark[1] - LINB.fresh[1]) * c, LINB.fresh[2] + (LINB.dark[2] - LINB.fresh[2]) * c, FB.opacity * Math.min(1, (1 - g) * 2.5));
        }
        for (let j = 0; j < 2; j++) blood.set(nBlood++, mouth[0] + fx * H * 0.08 * (j + g * 2), mouth[1] - H * 0.04 * j, mouth[2] + fz * H * 0.08 * (j + g * 2), H * (0.24 + 0.34 * g), LINB.fresh[0], LINB.fresh[1], LINB.fresh[2], 0.6 * (1 - g) * Math.min(1, g * 6));
      }
      return f > swallow;
    }
    // Blood round the mouth and on the hand of a Titan that has eaten.
    function gore(rig, k, amount) {
      const hp = rig.parts[rig.head], [sx, sy, sz] = hp.size, [cx, cy, cz] = hp.centre, c = LINB.fresh;
      S3.mul(fm, 0, base, 0, mats, rig.head * 12);
      batch.push('sphere', fm, 0, cx, cy - 0.27 * sy, cz + 0.36 * sz, 0.7 * sx * amount, 0.3 * sy * amount, 0.34 * sz, c[0], c[1], c[2]);
      if (rig.hold.i !== rig.head) { const fp = rig.parts[rig.hold.i]; S3.mul(fm, 0, base, 0, mats, rig.hold.i * 12); batch.push('sphere', fm, 0, rig.hold.p[0], rig.hold.p[1] + fp.size[0] * 0.2, rig.hold.p[2], fp.size[0] * 1.25 * amount, fp.size[0] * 1.1 * amount, fp.size[2] * 1.25 * amount, c[0] * 0.85, c[1] * 0.85, c[2] * 0.85); }
    }
    const stainM = new T.Matrix4();
    function drawStains(Tl, E) {
      let n = 0;
      for (const m of pop.meals) {
        const tb = m.T0 + (m.T1 - m.T0) * (m.titanRig ? m.titanRig.bites[0] : 0.6), age = Tl - tb;
        if (age < 0 || age > EAT.stain || n >= STAINS) continue;
        const x = (m.spot[0] + m.stand[0]) / 2, z = (m.spot[1] + m.stand[1]) / 2, size = FS.size * 2.5 * E * (0.75 + 0.5 * hash(m.victim.id)) * (0.55 + 0.45 * smooth(age / 0.05)), yaw = hash(m.victim.id * 3) * TAU, c = Math.cos(yaw) * size, sn = Math.sin(yaw) * size;
        stainM.set(c, 0, sn, x, 0, 1, 0, hAt(x, z) + 0.22, -sn, 0, c, z, 0, 0, 0, 1);
        stains.setMatrixAt(n, stainM);
        stainFx.setXYZ(n, Math.min(1, FS.opacity * 1.6) * smooth(age / 0.012) * (1 - smooth((age - EAT.stain * 0.45) / (EAT.stain * 0.55))), hash(m.victim.id * 7), 0.15 + 0.85 * smooth(age / (EAT.stain * 0.6)));
        n++;
      }
      stains.count = n; stains.instanceMatrix.needsUpdate = true; stainFx.needsUpdate = true;
    }
    for (const m of pop.meals) m.titanRig = rigOf(m.titan).bites ? rigOf(m.titan) : null;

    const LIN = { steam: S3.lin(D.fx.steam.color), wsteam: S3.lin(D.fx.wallSteam.color), dust: S3.lin(D.fx.dust.color), smoke: S3.lin(D.fx.cannonSmoke.color), flash: S3.lin(D.fx.cannonSmoke.flash) };

    // ---- state that lives between frames ----
    const dyn = pop.agents.map((a) => ({ has: false, x: 0, y: 0, yaw: a.phase * 0.63, ph: a.phase, ox: 0, oy: 0, speed: 0, w: 0, reach: 0, h: 0 }));
    const cannonState = pop.cannons.map((c, i) => ({ next: 1 + (i % 5) * 0.37, start: -9, yaw: Math.atan2(Math.cos(Math.atan2(c.y - World.district(c.district).base[1], c.x - World.district(c.district).base[0])), Math.sin(Math.atan2(c.y - World.district(c.district).base[1], c.x - World.district(c.district).base[0]))) }));
    let logicEvery = Q.logicEvery, frameNo = 0, accDt = 0, lastT = -1, titanClock = 0;
    const CELL = 40, grid = new Map(), civGrid = new Map();
    const key = (x, y) => ((x / CELL) | 0) * 4096 + ((y / CELL) | 0);
    const nearestIn = (g, x, y, maxD, region) => {
      let best = null, bd = maxD;
      const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
      for (let i = cx - 1; i <= cx + 1; i++) for (let j = cy - 1; j <= cy + 1; j++) {
        const list = g.get(i * 4096 + j); if (!list) continue;
        for (const o of list) { if (region && o.region !== region) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } }
      }
      return best ? { o: best, d: bd } : null;
    };
    const mats = new Float32Array(16 * 12), mats2 = new Float32Array(16 * 12), base = new Float32Array(12), base2 = new Float32Array(12), tmp = new Float32Array(12), pr = [0, 0, 0];
    const live = [], poses = [0, 1, 2, 3].map(() => new Float32Array(WT.n * 12)), stand = new Float32Array(WT.n * 12);
    let nBlob = 0, nSteam = 0, sunX = -1, sunZ = 0, sunCot = 1.2;
    const blobM = new T.Matrix4();
    function blob(x, z, y, h, wid) { // a shadow stretched away from the sun
      if (ctx.shadowsOn || nBlob >= blobs.instanceMatrix.count) return;
      const len = Math.min(h * sunCot, h * 2.2) + wid, yaw = Math.atan2(-sunX, -sunZ), c = Math.cos(yaw), s = Math.sin(yaw), cx = x - sunX * (len - wid) * 0.5, cz = z - sunZ * (len - wid) * 0.5;
      blobM.set(c * wid, 0, s * len, cx, 0, 1, 0, y + 0.15, -s * wid, 0, c * len, cz, 0, 0, 0, 1);
      blobs.setMatrixAt(nBlob++, blobM);
    }
    // A Titan's face, close up: two dark eyes and the fixed grin.
    const FACE = { eye: S3.lin('#2a1c18'), mouth: S3.lin('#6a2420'), teeth: S3.lin('#f1e9d8') }, fm = new Float32Array(12);
    function face(rig, base) {
      const p = rig.parts[rig.head], [sx, sy, sz] = p.size, [cx, cy, cz] = p.centre;
      S3.mul(fm, 0, base, 0, mats, rig.head * 12);
      for (const e of [-1, 1]) batch.push('sphere', fm, 0, cx + e * 0.21 * sx, cy + 0.1 * sy, cz + 0.43 * sz, 0.2 * sx, 0.15 * sy, 0.14 * sz, FACE.eye[0], FACE.eye[1], FACE.eye[2]);
      batch.push('box', fm, 0, cx, cy - 0.21 * sy, cz + 0.4 * sz, 0.62 * sx, 0.15 * sy, 0.16 * sz, FACE.mouth[0], FACE.mouth[1], FACE.mouth[2]);
      batch.push('box', fm, 0, cx, cy - 0.21 * sy, cz + 0.42 * sz, 0.54 * sx, 0.07 * sy, 0.15 * sz, FACE.teeth[0], FACE.teeth[1], FACE.teeth[2]);
    }
    const roofLift = props.villageHut.height * props.villageHut.unit * ctx.roof.ky * 0.8; // the top of the crushed house, a little sunk in
    const idleT = (rig, t, a) => (t + a.phase * 3) / ((rig.clips.idle && rig.clips.idle.period) || 4);

    function frame(sc, P, wallInfo) {
      const Tl = sc.T, t = sc.t, dt = accDt, o = { reduced: sc.reduced, awake: sc.awake ?? 1 };
      const E = Math.max(1, Math.min(1.7, 1.05 / P.s)); // figures are drawn a little larger when the camera is far away
      titanClock += dt * o.awake;
      grid.clear(); civGrid.clear(); live.length = 0;
      for (let i = 0; i < pop.agents.length; i++) {
        const a = pop.agents[i], d = dyn[i];
        if (Tl < a.t0 || Tl > a.t1) { d.has = false; continue; }
        const s = pop.stateAt(a, Tl, a.kind === 'titan' ? titanClock : t, o); // Titans stand still at night: their clock stops
        if (s.vis < 0.02) { d.has = false; continue; }
        const e = { a, d, s, x: s.x, y: s.y, region: pop.regionOfArea(s.area) };
        live.push(e);
        if (s.dying) continue;
        if (a.kind === 'titan' && !a.lying) { const k = key(s.x, s.y); (grid.get(k) || grid.set(k, []).get(k)).push(e); }
        else if (a.kind === 'civ') { const k = key(s.x, s.y); (civGrid.get(k) || civGrid.set(k, []).get(k)).push(e); }
      }
      batch.begin(); nBlob = 0; nSteam = 0; nBlood = 0;
      const ease = Math.min(1, dt * 3.2), RB = pop.rumble, rho = RB.front(Tl), pad = 90;
      for (const e of live) {
        const { a, d, s } = e;
        if (a.kind === 'civ' && s.caught !== undefined && s.doom.titanRig) continue; // in a Titan's grip: drawn with the Titan
        let tx = 0, ty = 0, scared = false, reaching = false, look = null;
        if (!o.reduced && !s.dying) {
          if (a.kind === 'civ') { // run from a Titan in the same territory
            const n = nearestIn(grid, s.x, s.y, 30, e.region);
            if (n) { const k = ((((30 - n.d) / 30) * 6) / (n.d || 1)) * (s.doom ? clamp01((s.doom.T0 - Tl) / 0.05) : 1); tx = (s.x - n.o.x) * k; ty = (s.y - n.o.y) * k; scared = true; } // the one who will be caught does not get away
          } else if (a.kind === 'titan' && (s.hunt || s.eat)) look = { x: (s.hunt || s.eat).spot[0], y: (s.hunt || s.eat).spot[1] };
          else if (a.kind === 'titan' && !a.lying && !s.moving && o.awake > 0.5) { // lean towards people, even through a Wall
            const n = nearestIn(civGrid, s.x, s.y, 38);
            if (n) { const k = Math.min(5, n.d * 0.5) / (n.d || 1); tx = (n.o.x - s.x) * k; ty = (n.o.y - s.y) * k; reaching = n.o.region !== e.region; look = n.o; }
          }
        }
        d.ox += (tx - d.ox) * ease; d.oy += (ty - d.oy) * ease;
        const x = s.x + d.ox, y = s.y + d.oy;
        let moved = 0, dx = 0, dy = 0;
        if (d.has) { dx = x - d.x; dy = y - d.y; moved = Math.hypot(dx, dy); }
        const jump = moved > 30; // a jump (scrubbing the timeline) is not a step
        if (jump) moved = 0;
        d.x = x; d.y = y;
        d.speed += ((dt > 0 ? moved / dt : 0) - d.speed) * Math.min(1, dt * 6);
        const walking = d.speed > 0.35 && !o.reduced;
        // facing: the way it walks; a reaching Titan faces its prey; a Wall Titan in its Wall faces outwards
        let want = a.roof ? a.roof.yaw : d.yaw;
        if (a.rumble && !(s.marching && moved > 0.004)) want = Math.atan2(Math.cos(a.rumble.th0 * RAD), Math.sin(a.rumble.th0 * RAD));
        else if (a.crawl) { const q = a.crawl.at(Tl + 0.01), q0 = a.crawl.at(Tl); if (Math.hypot(q[0] - q0[0], q[1] - q0[1]) > 1e-5) want = Math.atan2(q[0] - q0[0], q[1] - q0[1]); }
        else if (s.eat && look) want = Math.atan2(look.x - x, look.y - y);
        else if (moved > 0.012) want = Math.atan2(dx, dy);
        else if (look && !walking) want = Math.atan2(look.x - x, look.y - y);
        d.yaw = d.has && !jump ? turn(d.yaw, want, Math.min(1, dt * (a.kind === 'civ' ? 9 : 4.5))) : want;
        d.has = true;
        d.w += ((walking ? 1 : 0) - d.w) * Math.min(1, dt * 7);
        d.reach += ((reaching && !walking ? 1 : 0) - d.reach) * Math.min(1, dt * 3);
        // on screen?
        const gy = (a.kind === 'boat' ? Math.max(0.2, hAt(x, y)) : a.kind === 'wallTitan' ? wade(x, y) : hAt(x, y)) + (a.roof ? roofLift : 0); // the Ragako Titan lies on a roof
        d.h = gy;
        V.project(P, x, y, gy, pr);
        const big = a.kind === 'wallTitan' ? 30 : 16;
        if (pr[2] <= 0 || pr[0] < -pad - big * pr[2] || pr[0] > P.vw + pad + big * pr[2] || pr[1] < -pad || pr[1] > P.vh + pad + big * pr[2] * 2) { if (walking) d.ph += moved / 6; continue; }
        const kill = s.dying && a.kind === 'titan' && s.how === 'kill';
        const vis = kill ? 1 - smooth(s.dying) * 0.55 : smooth(s.vis), tint = kill ? 1 + s.dying * 0.5 : 1;
        if (a.kind === 'civ') {
          const rig = civRig(a), k = rig.unit * E * vis;
          if (walking) d.ph += moved / (rig.stride * rig.unit * E);
          Rig.pose(rig, 'idle', idleT(rig, t, a), mats, s.flee || scared ? 'run' : 'walk', d.ph, d.w);
          S3.place(base, x, gy, y, d.yaw, k); S3.pushRig(batch, rig, mats, base, tint);
          blob(x, y, gy, rig.height * k, 0.9 * k);
        } else if (a.kind === 'boat') {
          const pb = props.boat, k = pb.unit * vis;
          S3.place(base, x, gy - 0.1 + Math.sin(t * 1.3 + a.phase) * 0.06, y, d.yaw, k); S3.pushRig(batch, pb, pb.mats, base, 1);
        } else if (a.kind === 'rider') {
          const hr = rigs.horse, rd = rigs.rider, k = hr.unit * E * vis;
          if (walking) d.ph += moved / (hr.stride * k);
          Rig.pose(hr, 'idle', idleT(hr, t, a), mats, 'walk', d.ph, d.w);
          S3.place(base, x, gy, y, d.yaw, k); S3.pushRig(batch, hr, mats, base, tint);
          // the rider sits on the saddle and moves with the horse's body
          tmp.set([1, 0, 0, hr.saddle[0], 0, 1, 0, hr.saddle[1] - rd.seat, 0, 0, 1, hr.saddle[2]]);
          S3.mul(base2, 0, mats, 0, tmp, 0); S3.mul(tmp, 0, base, 0, base2, 0);
          Rig.pose(rd, 'idle', idleT(rd, t, a), mats2, 'walk', d.ph, d.w);
          S3.pushRig(batch, rd, mats2, tmp, tint);
          blob(x, y, gy, 2.4 * k, 2.2 * k);
        } else {
          const rig = rigOf(a), wt = a.kind === 'wallTitan', k = rig.unit * (wt ? 1 : E) * (wt ? 1 : vis);
          if (walking || (a.crawl && moved > 0)) d.ph += moved / (rig.stride * k || 6);
          let sink = 0;
          if (wt) { // hidden to the chest in its Wall until the front releases it
            const out = Math.hypot(x - a.home0[0], y - a.home0[1]);
            sink = ctx.wallTitanSink * (1 - smooth(out / 7)) + (1 - smooth(s.vis)) * 6;
          } else if (kill) sink = s.dying * rig.height * k * 0.25;
          const meal = s.eat && rig.bites ? s.eat : null;
          if (meal) eatPose(rig, s.eatF, t, a);
          else if (rig.clips.walk && d.w > 0.02) Rig.pose(rig, 'idle', idleT(rig, a.kind === 'titan' ? titanClock : t, a), mats, 'walk', d.ph, a.crawl ? 1 : d.w);
          else Rig.pose(rig, 'idle', idleT(rig, a.kind === 'titan' ? titanClock : t, a), mats, 'reach', (t + a.phase) / ((rig.clips.reach && rig.clips.reach.period) || 3), d.reach);
          S3.place(base, x, gy - sink, y, d.yaw, k); S3.pushRig(batch, rig, mats, base, tint);
          if (!wt && rig.head >= 0 && pr[2] > 2.6) face(rig, base);
          if (meal) { if (eatScene(rig, meal, s.eatF, t, k, E, d.yaw)) d.gore = Tl; }
          if (d.gore !== undefined && rig.bites) { const age = Tl - d.gore; if (age >= -1e-6 && age < 1.2) gore(rig, k, 1 - smooth((age - 0.7) / 0.5)); else if (age < 0 || age > 1.2) d.gore = undefined; } // it stays bloody for a while
          if (!wt || sink < 1) blob(x, y, gy, (a.lying || a.crawl ? 0.25 : 1) * rig.height * k, (a.lying || a.crawl ? 3 : 1.5) * k * (rig.height / 6));
          if (kill && nSteam < steam.cap - 8) { // it goes up in steam
            const H = rig.height * k, F = D.fx.steam;
            for (let j = 0; j < F.puffs; j++) { const f = clamp01(s.dying * 1.25 - j * 0.04), a2 = j * 2.4 + a.phase; steam.set(nSteam++, x + Math.cos(a2) * H * 0.18 * (1 + f), gy + H * (0.3 + 0.1 * j) + f * H * 1.3, y + Math.sin(a2) * H * 0.18 * (1 + f), H * (0.35 + f * 0.9), LIN.steam[0], LIN.steam[1], LIN.steam[2], F.opacity * 1.5 * Math.min(1, f * 6) * (1 - f)); }
          }
        }
      }
      // ---- the Rumbling: the rows standing in the Walls, then one great circle ----
      if (Tl >= pop.wallsFall && wallInfo.fall > 0) {
        const appear = wallInfo.fall, k = WT.unit, stride = WT.stride * k;
        for (let v = 0; v < 4; v++) Rig.pose(WT, 'idle', t / 8 + v * 0.25, poses[v], 'walk', rho / stride + v * 0.25, rho > R.sina ? 1 : 0); // four shared poses, a quarter step apart
        Rig.pose(WT, 'idle', t / 8, stand);
        for (let i = 0; i < rows.length; i++) {
          const rw = rows[i];
          let x, z, sink = ctx.wallTitanSink, marching = false;
          if (rw.bulge) { if (rho > rw.Rw + rw.bulge.r * 0.55) continue; x = rw.x; z = rw.z; }
          else {
            if (rho > rw.Rw) { if (rw.gap && rho < GAP_R) continue; marching = true; }
            const rr = Math.max(rw.Rw, rho);
            if (rr > RB.edge + 60) continue;
            x = C[0] + Math.cos(rw.th) * rr; z = C[1] + Math.sin(rw.th) * rr;
            if (marching) sink *= 1 - smooth((rho - rw.Rw) / 7);
          }
          const gy = wade(x, z);
          V.project(P, x, z, gy, pr);
          if (pr[2] <= 0 || pr[0] < -pad || pr[0] > P.vw + pad || pr[1] < -pad || pr[1] > P.vh + pad + 60 * pr[2]) continue;
          S3.place(base, x, gy - sink - (1 - appear) * 3, z, Math.atan2(Math.cos(rw.th), Math.sin(rw.th)), k);
          S3.pushRig(batch, WT, marching ? poses[i & 3] : stand, base, 1);
          if (marching) blob(x, z, gy, WT.height * k, 4.5);
        }
        // steam above the marching row and dust at its feet
        if (rho > R.sina && rho < RB.edge + 60 && !sc.reduced) {
          const n = Q.ringPuffs, F = D.fx.wallSteam, hh = WT.height * k;
          for (let i = 0; i < n && nSteam < steam.cap - 2; i++) {
            const a2 = (i / n) * TAU + Math.sin(t * 0.2 + i) * 0.01, x = C[0] + Math.cos(a2) * (rho - 3), z = C[1] + Math.sin(a2) * (rho - 3), f = (t * 0.22 + i * 0.618) % 1;
            steam.set(nSteam++, x, hAt(x, z) + hh * (0.9 + f * 0.9), z, 22 + f * 30, LIN.wsteam[0], LIN.wsteam[1], LIN.wsteam[2], F.opacity * 2.2 * (1 - f) * Math.min(1, f * 5));
            steam.set(nSteam++, x - Math.cos(a2) * 6, hAt(x, z) + 2 + f * 5, z - Math.sin(a2) * 6, 16 + f * 18, LIN.dust[0], LIN.dust[1], LIN.dust[2], 0.3 * (1 - f));
          }
        }
      }
      // ---- cannons on the district walls ----
      let nSmoke = 0, nFlash = 0;
      if (Tl < pop.wallsFall) {
        const pc = props.cannon, y0 = ctx.wallBase + ctx.wallH;
        for (let i = 0; i < pop.cannons.length; i++) {
          const c = pop.cannons[i], cs = cannonState[i], n = nearestIn(grid, c.x, c.y, 36);
          if (n && t > cs.next && !o.reduced) { cs.start = t; cs.next = t + 1.4 + ((i * 7919) % 13) * 0.14; }
          if (n) cs.yaw = turn(cs.yaw, Math.atan2(n.o.x - c.x, n.o.y - c.y), Math.min(1, dt * 3));
          const ft = t - cs.start, firing = ft >= 0 && ft < 0.7;
          Rig.pose(pc, firing ? 'fire' : 'none', firing ? ft / 0.7 : 0, mats);
          S3.place(base, c.x, y0, c.y, cs.yaw, pc.unit); S3.pushRig(batch, pc, mats, base, 1);
          if (ft >= 0 && ft < 1.6) {
            const mx = c.x + Math.sin(cs.yaw) * 2.6, mz = c.y + Math.cos(cs.yaw) * 2.6, f = ft / 1.6;
            for (let j = 0; j < 3; j++) smoke.set(nSmoke++, mx + Math.sin(cs.yaw) * (1 + j * 1.6) * f * 3, y0 + 1.6 + f * (2 + j), mz + Math.cos(cs.yaw) * (1 + j * 1.6) * f * 3, 2.5 + f * 7 + j, LIN.smoke[0], LIN.smoke[1], LIN.smoke[2], 0.55 * (1 - f));
            if (ft < 0.1) flash.set(nFlash++, mx, y0 + 1.5, mz, 7, LIN.flash[0], LIN.flash[1], LIN.flash[2], 0.9);
          }
        }
      }
      // ---- signal flares: coloured smoke climbing from the riders ----
      for (const fl of sc.flares || []) {
        const rise = Math.min(1, fl.f / 0.3), Hf = 46 * rise, a = fl.f < 0.7 ? 1 : Math.max(0, (1 - fl.f) / 0.3), c = S3.lin(fl.color), gy = hAt(fl.x, fl.y);
        for (let j = 0; j < 12 && nSmoke < smoke.cap; j++) { const q = j / 11; smoke.set(nSmoke++, fl.x + q * q * 9 * fl.f + Math.sin(j * 1.7) * 0.6, gy + 3 + Hf * q, fl.y - q * 2 * fl.f, 2.6 + q * (3 + 7 * fl.f), c[0], c[1], c[2], 0.82 * a * (j === 11 ? 1 : 0.75)); }
      }
      batch.end();
      drawStains(Tl, E);
      steam.commit(nSteam); smoke.commit(nSmoke); flash.commit(nFlash); blood.commit(nBlood);
      blobs.count = nBlob; blobs.instanceMatrix.needsUpdate = true;
    }

    function update(sc, P, wallInfo, sun) {
      batch.group.visible = !!sc.crowd; steam.points.visible = smoke.points.visible = flash.points.visible = blood.points.visible = stains.visible = !!sc.crowd; blobs.visible = !!sc.crowd && !ctx.shadowsOn;
      if (!sc.crowd) return;
      const hl = Math.hypot(sun.x, sun.z) || 1; sunX = sun.x / hl; sunZ = sun.z / hl; sunCot = hl / Math.max(0.2, sun.y);
      accDt += sc.dt; frameNo++;
      if (frameNo % logicEvery === 0 || Math.abs(sc.T - lastT) > 0.02) { frame(sc, P, wallInfo); accDt = 0; }
      lastT = sc.T;
    }
    // The lying Ragako Titan or the crawling Titan under a screen point (for its explanation).
    function lyingAt(P, px, py) {
      for (let i = 0; i < pop.agents.length; i++) {
        const a = pop.agents[i], d = dyn[i];
        if (!a.lying || !d.has) continue;
        V.project(P, d.x, d.y, d.h + 1, pr);
        if (Math.hypot(px - pr[0], py - pr[1]) < Math.max(16, 9 * pr[2])) return { agent: a, x: d.x, y: d.y };
      }
      return null;
    }
    return { update, lyingAt, slower() { if (logicEvery < 3) logicEvery++; return logicEvery; }, get logicEvery() { return logicEvery; }, puffs: [steam, smoke, flash, blood, { mat: stainMat }], mats: [mat], batch };
  }
  S3.Crowd = Crowd;
})(window);
