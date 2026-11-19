/* The three Walls of the 3D stage: stone rings with their half-round district walls, the gates
   (intact, broken, sealed with crystal or with the boulder), the warning band of a breached or lost
   Wall, and their fall in the Rumbling.
   A broken gate is a real hole: the stretch of Wall round each gate that the story breaks is its own
   piece, swapped for a torn one (ragged opening, soot above it, blocks thrown inwards, smoke rising).
   When the Walls fall, every stretch crumbles at its own moment into stumps of different heights and
   blocks tumble to both sides, so a ruin is left and not a low, tidy ring. */
(function (global) {
  'use strict';
  const S3 = global.S3;
  if (!S3) return;
  const T = S3.T, RAD = Math.PI / 180, TAU = Math.PI * 2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };
  const FALL = 0.09; // how long the Walls take to come down, in events

  function Walls(ctx) {
    const { scene, World, pop, D, Q, geos, relief } = ctx;
    const { C, R, DISTRICTS } = World, WD = D.walls;
    const BR = { width: 26, height: 29, edge: '#d8cdb1', scorch: '#55483c', rubbleCount: 32, rubbleSize: [1.2, 4.8], throw: 24, smoke: '#8e8879', smokeHeight: 42, smokeOpacity: 0.28, ...(WD.breach || {}) };
    const RU = { heap: [1.5, 6], colors: WD.rubble, chunkSize: [2, 6], dust: D.fx.dust.color, dustOpacity: 0.34, ...(WD.ruin || {}) };
    const Hw = ctx.wallH, TH = ctx.wallT, G0 = ctx.wallBase; // height, thickness, ground level under the Walls
    const GW = ctx.gateW, GH = ctx.gateH, M = GW / WD.gate.width; // world units per metre at a gate
    const BW = BR.width * M * 0.95, BH = Math.min(Hw * 0.62, BR.height * (GH / WD.gate.height) * 0.76); // the hole torn round a gate: about twice the gate's width and well under the top of the Wall
    const rnd = S3.rng(4411);
    const hi = Q.shadow > 0;

    // Stone courses: broad blocks with shallow joints, a little weathering.
    const stoneTex = (() => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'), rows = WD.blockRows || 6, rh = 256 / rows;
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, WD.stone); gr.addColorStop(1, WD.stoneShade); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(60,50,30,.05)'; g.fillRect(rnd() * 256, rnd() * 256, 3 + rnd() * 16, 2 + rnd() * 5); }
      g.strokeStyle = WD.joint; g.globalAlpha = 0.42; g.lineWidth = 2.2;
      for (let r = 0; r <= rows; r++) { g.beginPath(); g.moveTo(0, r * rh); g.lineTo(256, r * rh); g.stroke(); for (let k = 0; k < 4; k++) { const x = (k + (r % 2) * 0.5) * 64; g.beginPath(); g.moveTo(x, r * rh); g.lineTo(x, (r + 1) * rh); g.stroke(); } }
      g.globalAlpha = 0.5; g.fillStyle = 'rgba(40,36,26,.5)'; g.fillRect(0, 250, 256, 6); // damp foot of the Wall
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = T.RepeatWrapping; t.anisotropy = 4;
      return t;
    })();

    // ---------- Wall pieces ----------
    const heap = [RU.heap[0] / WD.height, RU.heap[1] / WD.height]; // what is left standing, as a share of the height
    // How a stretch comes down: when (0..1 within the fall) and how much of it stays. Whole runs are gone to the ground, most of the rest
    // is a heap, and here and there a tall shard is left standing: a broken line, seen as one even from far away.
    let gapTo = 0, ruinLen = 0;
    const ruinOf = (step) => {
      ruinLen += step;
      if (ruinLen > gapTo + 14 + 30 * rnd()) gapTo = ruinLen + 7 + 12 * rnd(); // the next open run
      const a = rnd(), b = rnd(), c = rnd();
      return [a, ruinLen < gapTo ? 0.01 : b > 0.88 ? 0.3 + c * 0.26 : heap[0] * 2 + (heap[1] * 2 - heap[0] * 2) * c * c];
    };
    const WHITE = [1, 1, 1], soot = S3.lin(BR.scorch), SOOT = soot.map((v) => 0.14 + v * 1.3), SOOT_TOP = soot.map((v) => 0.5 + v * 0.9);
    const newPiece = () => ({ pos: [], nor: [], uv: [], col: [], ruin: [], idx: [], top: [], under: [] });
    const chunkSeeds = [], chunkGap = hi ? 3.4 : 6.5;
    let chunkRun = 0;
    /* One length of Wall along points { x, z, nx, nz } (n = outward): outer face, inner face and the walkway on top.
       `lows` gives, per point, where the stone begins above a hole (-3 = down into the ground); `town` says which side a town lies on (blocks fall short there). */
    function strip(pts, th, h, into, lows, town = 0) {
      const half = th / 2;
      let len = 0;
      const lens = pts.map((p, i) => (i ? (len += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z)) : 0)), cols = pts.map((_, i) => ruinOf(i ? lens[i] - lens[i - 1] : 0));
      const put = (x, y, z, nx, ny, nz, u, v, i, c) => { into.pos.push(x, y, z); into.nor.push(nx, ny, nz); into.uv.push(u, v); into.ruin.push(cols[i][0], cols[i][1]); into.col.push(c[0], c[1], c[2]); };
      for (const side of [1, -1]) {
        const base = into.pos.length / 3;
        pts.forEach((p, i) => {
          const u = lens[i] / (h * 1.6), x = p.x + p.nx * half * side, z = p.z + p.nz * half * side, lo = lows ? lows[i] : -3, holed = lo > -3;
          put(x, lo, z, p.nx * side, 0, p.nz * side, u, Math.max(0, lo) / h, i, holed ? SOOT : WHITE);
          put(x, h, z, p.nx * side, 0, p.nz * side, u, 1, i, holed ? SOOT_TOP : WHITE);
        });
        for (let i = 0; i < pts.length - 1; i++) { const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3; if (side < 0) into.idx.push(a, c, b, b, c, d); else into.idx.push(a, b, c, b, d, c); }
      }
      let base = into.pos.length / 3;
      pts.forEach((p, i) => { const u = lens[i] / (h * 1.6); put(p.x - p.nx * half, h, p.z - p.nz * half, 0, 1, 0, u, 0.02, i, WHITE); put(p.x + p.nx * half, h, p.z + p.nz * half, 0, 1, 0, u, 0.02, i, WHITE); });
      for (let i = 0; i < pts.length - 1; i++) { const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3; into.top.push(a, c, b, b, c, d); }
      if (lows) { // the broken stone over the hole
        base = into.pos.length / 3;
        pts.forEach((p, i) => { const u = lens[i] / (h * 1.6); put(p.x - p.nx * half, lows[i], p.z - p.nz * half, 0, -1, 0, u, 0.3, i, WHITE); put(p.x + p.nx * half, lows[i], p.z + p.nz * half, 0, -1, 0, u, 0.6, i, WHITE); });
        for (let i = 0; i < pts.length - 1; i++) if (lows[i] > -3 || lows[i + 1] > -3) { const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3; into.under.push(a, b, c, b, d, c); }
      }
      // blocks that will tumble from this stretch when the Walls fall
      for (let i = 1; i < pts.length; i++) {
        chunkRun += lens[i] - lens[i - 1];
        while (chunkRun >= chunkGap) { chunkRun -= chunkGap; const p = pts[i]; chunkSeeds.push({ x: p.x, z: p.z, nx: p.nx, nz: p.nz, delay: cols[i][0], half, town }); }
      }
    }
    const arcN = (cx, cz, r, a0, a1, n) => { const out = []; for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, nx: Math.cos(a), nz: Math.sin(a) }); } return out; };
    const arc = (cx, cz, r, a0, a1, stepDeg) => arcN(cx, cz, r, a0, a1, Math.max(2, Math.ceil(Math.abs(a1 - a0) / (stepDeg * RAD))));
    const sideMat = () => new T.MeshLambertMaterial({ map: stoneTex, vertexColors: true });
    const topMatBase = new T.MeshLambertMaterial({ color: S3.col(WD.top) }), underMat = new T.MeshLambertMaterial({ color: S3.col(BR.edge), side: T.DoubleSide });
    const pieces = []; // every mesh of every Wall, for the fall
    function meshOf(into, side, top) {
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(into.pos, 3).setUsage(T.DynamicDrawUsage)); geo.setAttribute('normal', new T.Float32BufferAttribute(into.nor, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(into.uv, 2)); geo.setAttribute('color', new T.Float32BufferAttribute(into.col, 3));
      geo.setIndex([...into.idx, ...into.top, ...into.under]);
      geo.addGroup(0, into.idx.length, 0); geo.addGroup(into.idx.length, into.top.length, 1);
      if (into.under.length) geo.addGroup(into.idx.length + into.top.length, into.under.length, 2);
      const mesh = new T.Mesh(geo, [side, top, underMat]);
      mesh.position.y = G0; mesh.castShadow = Q.shadow > 0; mesh.receiveShadow = true; mesh.frustumCulled = false;
      mesh.userData = { base: Float32Array.from(into.pos), ruin: Float32Array.from(into.ruin) };
      scene.add(mesh); pieces.push(mesh);
      return mesh;
    }
    // The stretch round a gate that can be broken: whole, and torn open (a ragged arch, higher in the middle).
    const BREAKS = { shig: ['shigO', 'shigI'], trost: ['trostO', null] }, sections = {};
    function section(id, pts, th, side, top) {
      const n = pts.length - 1, lows = pts.map((_, i) => { const u = Math.abs(-1 + (2 * i) / n) / 0.86; return u >= 1 ? -3 : Math.max(0.5, Math.min(Hw * 0.9, BH * Math.pow(1 - Math.pow(u, 2.2), 0.5) * (0.84 + 0.3 * rnd()))); });
      const whole = newPiece(), torn = newPiece(), run = chunkRun, seeds = chunkSeeds.length;
      strip(pts, th, Hw, whole);
      chunkRun = run; chunkSeeds.length = seeds; // the same stretch twice: its blocks only once
      strip(pts, th, Hw, torn, lows);
      sections[id] = { whole: meshOf(whole, side, top), torn: meshOf(torn, side, top) };
      sections[id].torn.visible = false;
    }
    const walls = {};
    for (const wall of ['maria', 'rose', 'sina']) {
      const Rw = R[wall], ds = DISTRICTS.filter((d) => d.wall === wall).sort((a, b) => a.deg - b.deg), into = newPiece(), side = sideMat(), top = topMatBase.clone();
      ds.forEach((d, i) => {
        const nx = ds[(i + 1) % ds.length], a = d.deg * RAD, an = nx.deg * RAD + (i === ds.length - 1 ? TAU : 0), half = Math.asin(d.hw / Rw), nh = Math.asin(nx.hw / Rw), br = BREAKS[d.id] || [];
        const cutS = BW / 2 + 0.9, cutI = (BW / 2 + 0.9) / Rw, mid = d.len / 2;
        // a stretch of the district wall (two straight sides and a round end), from s0 to s1 along it
        const run = (s0, s1, n) => Array.from({ length: n + 1 }, (_, j) => { const q = d.wallAt(s0 + ((s1 - s0) * j) / n); return { x: q.p[0], z: q.p[1], nx: q.n[0], nz: q.n[1] }; }), steps = (l) => Math.max(2, Math.ceil(l / 2.2));
        // the district wall (its outer gate is in the middle of the round end)
        if (br[0]) { strip(run(0, mid - cutS, steps(mid - cutS)), TH, Hw, into, null, -1); strip(run(mid + cutS, d.len, steps(mid - cutS)), TH, Hw, into, null, -1); section(br[0], run(mid - cutS, mid + cutS, 22), TH, side, top); }
        else strip(run(0, d.len, steps(d.len)), TH, Hw, into, null, -1);
        strip(arc(C[0], C[1], Rw, a + half - 0.004, an - nh + 0.004, 1.5), TH, Hw, into); // the Wall to the next district
        // the Wall line across the district (its inner gate is on it)
        if (br[1]) { strip(arc(C[0], C[1], Rw, a - half, a - cutI, 1.5), TH * 0.9, Hw, into, null, 1); strip(arc(C[0], C[1], Rw, a + cutI, a + half, 1.5), TH * 0.9, Hw, into, null, 1); section(br[1], arcN(C[0], C[1], Rw, a - cutI, a + cutI, 22), TH * 0.9, side, top); }
        else strip(arc(C[0], C[1], Rw, a - half, a + half, 1.5), TH * 0.9, Hw, into, null, 1);
      });
      const mesh = meshOf(into, side, top);
      // the warning band: a dashed glow running round the top of a breached or lost Wall
      const band = new T.Mesh(new T.RingGeometry(Rw - TH * 0.3, Rw + TH * 0.3, 240, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, side: T.DoubleSide }));
      band.position.set(C[0], G0 + Hw + 0.35, C[1]); band.visible = false; band.renderOrder = 4;
      scene.add(band);
      walls[wall] = { mesh, side, top, band, Rw, state: '' };
    }
    // the band's dashes are drawn in the shader's place by a striped alpha map over the ring's angle
    const dashTex = (() => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 4; const g = c.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, 64, 4); g.fillStyle = '#fff'; g.fillRect(0, 0, 34, 4);
      const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
    })();
    for (const k in walls) {
      const w = walls[k], g = w.band.geometry, uv = g.attributes.uv, p = g.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.atan2(p.getZ(i), p.getX(i)) / TAU) * Math.round(w.Rw * 1.1), 0.5); // u follows the angle; the seam lies at 180 degrees, hidden by the west districts
      w.band.material.alphaMap = dashTex.clone(); w.band.material.alphaMap.needsUpdate = true;
    }
    const stoneC = new T.Color(1, 1, 1), rubbleC = S3.col(RU.colors[2]), tintC = new T.Color(), warnC = { breached: S3.col(WD.warning.breached), lost: S3.col(WD.warning.lost) };

    // ---------- The fall: stumps and tumbling blocks ----------
    let fallNow = -1;
    const chunkCols = RU.colors.map(S3.lin), chunks = chunkSeeds.map((sd) => {
      const sideK = rnd() < 0.5 ? 1 : -1, near = sd.town === sideK, s = (RU.chunkSize[0] + (RU.chunkSize[1] - RU.chunkSize[0]) * rnd() * rnd()) * 0.72, far = sd.half + 0.5 + Math.pow(rnd(), 1.5) * (near ? 2.2 : 10);
      const x = sd.x + sd.nx * sideK * far, z = sd.z + sd.nz * sideK * far;
      return { x0: sd.x + sd.nx * sideK * sd.half, z0: sd.z + sd.nz * sideK * sd.half, x, z, y: relief.land(x, z), y0: G0 + Hw * (0.3 + 0.7 * rnd()), s: [s, s * (0.5 + rnd() * 0.3), s * (0.7 + rnd() * 0.4)], delay: sd.delay * 0.55, yaw: rnd() * TAU, tilt: (rnd() - 0.5) * 0.5, spin: (rnd() - 0.5) * 9, c: chunkCols[(rnd() * chunkCols.length) | 0] };
    });
    const chunkMesh = new T.InstancedMesh(geos.box, new T.MeshLambertMaterial(), Math.max(1, chunks.length));
    chunkMesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(Math.max(1, chunks.length) * 3), 3);
    chunks.forEach((ch, i) => { const k = 0.82 + 0.3 * ((i * 0.618) % 1); chunkMesh.instanceColor.setXYZ(i, ch.c[0] * k, ch.c[1] * k, ch.c[2] * k); });
    chunkMesh.frustumCulled = false; chunkMesh.receiveShadow = true; chunkMesh.castShadow = false; chunkMesh.visible = false; chunkMesh.count = chunks.length;
    scene.add(chunkMesh);
    const cm = new T.Matrix4(), cq = new T.Quaternion(), ce = new T.Euler(), cp = new T.Vector3(), cs = new T.Vector3();
    function applyFall(fall) {
      if (fall === fallNow) return;
      fallNow = fall;
      for (const mesh of pieces) {
        const at = mesh.geometry.attributes.position, a = at.array, { base, ruin } = mesh.userData;
        for (let v = 0, n = a.length / 3; v < n; v++) {
          const by = base[v * 3 + 1];
          if (by <= 0) continue;
          const d = ruin[v * 2] * 0.55;
          a[v * 3 + 1] = Math.min(by, Hw * (1 - (1 - ruin[v * 2 + 1]) * smooth((fall - d) / 0.45)));
        }
        at.needsUpdate = true;
      }
      chunkMesh.visible = fall > 0;
      if (fall > 0) {
        for (let i = 0; i < chunks.length; i++) {
          const ch = chunks[i], g = clamp01((fall - ch.delay) / 0.45);
          if (g <= 0) { cm.makeScale(0, 0, 0); chunkMesh.setMatrixAt(i, cm); continue; }
          const e = 1 - (1 - g) * (1 - g);
          cp.set(ch.x0 + (ch.x - ch.x0) * e, ch.y + ch.s[1] * 0.4 + (ch.y0 - ch.y) * (1 - g * g), ch.z0 + (ch.z - ch.z0) * e);
          ce.set(ch.tilt + ch.spin * (1 - g), ch.yaw + ch.spin * 0.6 * (1 - g), ch.tilt * 0.7); cq.setFromEuler(ce); cs.set(ch.s[0], ch.s[1], ch.s[2]);
          cm.compose(cp, cq, cs); chunkMesh.setMatrixAt(i, cm);
        }
        chunkMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // ---------- Gates ----------
    const gates = [];
    for (const d of DISTRICTS) {
      gates.push({ d, p: d.outer, id: d.id === 'shig' ? 'shigO' : d.id === 'trost' ? 'trostO' : null, th: TH });
      gates.push({ d, p: d.inner, id: d.id === 'shig' ? 'shigI' : null, th: TH * 0.9 });
    }
    // when the story breaks each gate (the same moments as the page's wall state), for the smoke that thins with the years
    const BROKE = { shigO: pop.T('maria-fall', 0.35), shigI: pop.T('maria-fall', 0.67), trostO: pop.T('trost-attack', 0.4) };
    const NR = Math.round(BR.rubbleCount), THROW = BR.throw * M;
    for (const gt of gates) if (gt.id) { // the blocks of a breach: most are thrown inwards, where the blow was heading
      gt.rubble = Array.from({ length: NR }, (_, j) => {
        const inward = j < 4 ? 0 : rnd() < 0.72 ? -1 : 1, dz = j < 4 ? (rnd() - 0.5) * 2 : inward * (gt.th / 2 + 0.8 + Math.pow(rnd(), 1.4) * THROW * (inward < 0 ? 1 : 0.5)), dx = (rnd() - 0.5) * BW * (0.75 + Math.abs(dz) / THROW);
        const s = (BR.rubbleSize[0] + (BR.rubbleSize[1] - BR.rubbleSize[0]) * rnd() * rnd()) * M * 1.25 * (j < 4 ? 1.5 : 1);
        return { dx, dz, s, yaw: rnd() * TAU, c: rnd(), delay: rnd() * 0.25, air: 0.8 + rnd() * 0.7, up: 3 + rnd() * 7 };
      });
    }
    const gmat = new T.MeshLambertMaterial();
    const batch = S3.Batch(geos, gmat, { box: gates.length * 5 + 3 * (NR + 4), sphere: gates.length * 3 + 8, cone: 3 * 12 }, { dynamic: true, cast: Q.shadow > 0, receive: true });
    scene.add(batch.group);
    const glow = S3.Puffs(16, { additive: true, order: 6 }); scene.add(glow.points);
    const dust = S3.Puffs(hi ? 760 : 420, { order: 5 }); scene.add(dust.points);
    const LIN = { door: S3.lin(WD.gate.door), frame: S3.lin(WD.gate.frame), emblem: S3.lin(WD.gate.emblem), rub: [...WD.gateBroken.rubble, BR.edge].map(S3.lin), crystal: S3.lin(WD.gateSealedCrystal.color), boulder: S3.lin(WD.gateSealedBoulder.color), glow: S3.lin(WD.gateBroken.glow), dust: S3.lin(D.fx.dust.color), ruinDust: S3.lin(RU.dust), smoke: S3.lin(BR.smoke) };
    const m = new Float32Array(12), spikes = Array.from({ length: 9 }, () => [rnd() * 2 - 1, rnd(), 0.7 + rnd() * 0.6, rnd() * TAU]);
    function drawGates(st, keep, t) {
      batch.begin();
      if (keep > 0.04) gates.forEach((gt) => {
        const yaw = Math.atan2(Math.cos(gt.d.deg * RAD), Math.sin(gt.d.deg * RAD)), x = gt.p[0], z = gt.p[1], deep = gt.th + 0.7, state = gt.id ? st.g[gt.id] : 'intact', sn = Math.sin(yaw), cs2 = Math.cos(yaw);
        S3.place(m, x, G0, z, yaw, 1, keep); // local +Z looks out through the gate
        const put = (sh, cx, cy, cz, sx, sy, sz, c, k = 1) => batch.push(sh, m, 0, cx, cy, cz, sx, sy, sz, c[0] * k, c[1] * k, c[2] * k);
        if (state === 'intact') { // the stone frame with its round arch, the relief above it, and the two leaves of the door
          put('box', 0, GH * 0.36, 0, GW + 1.5, GH * 0.72, deep - 0.25, LIN.frame);
          put('sphere', 0, GH * 0.72, 0, GW + 1.5, GW * 0.86, deep - 0.25, LIN.frame);
          put('sphere', 0, GH * 0.72 + GW * 0.6, 0, GW * 0.34, GW * 0.34, deep + 0.15, LIN.emblem);
          put('box', 0, GH * 0.35, 0, GW, GH * 0.7, deep, LIN.door); put('sphere', 0, GH * 0.7, 0, GW, GW * 0.8, deep, LIN.door);
          put('box', 0, GH * 0.36, 0, 0.22, GH * 0.7, deep + 0.12, LIN.frame, 0.55); // where the two leaves meet
          return;
        }
        // broken, or broken and plugged: the gate is gone, the Wall round it is torn open (the torn piece), and its blocks lie about
        if (state === 'sealed' && gt.id !== 'trostO') { // Shiganshina: hardened crystal fills the hole
          put('box', 0, BH * 0.36, 0, BW * 0.74, BH * 0.72, deep * 0.9, LIN.crystal, 0.9);
          for (const [a, b, s, r] of spikes) { S3.place(m, x + cs2 * a * BW * 0.36, G0 + BH * (0.3 + 0.24 * b), z - sn * a * BW * 0.36, r, 1, keep); batch.push('cone', m, 0, 0, 0, 0, s * 3.4, BH * (0.75 + s * 0.3) * (1 - Math.abs(a) * 0.35), s * 3.4, LIN.crystal[0] * 1.1, LIN.crystal[1] * 1.1, LIN.crystal[2] * 1.1); }
        } else if (state === 'sealed') { // Trost: the boulder
          put('sphere', 0, BH * 0.44, 0.3, BW * 1.0, BH * 0.98, deep + 3.2, LIN.boulder); put('sphere', -BW * 0.3, BH * 0.2, 1.4, BW * 0.5, BH * 0.45, 3.4, LIN.boulder, 0.86);
        }
        const since = gt.flyT === undefined ? 99 : t - gt.flyT, old = state === 'sealed' ? 0.55 : 1; // years later, part of the rubble has been cleared
        gt.rubble.forEach((rb, j) => {
          if (j >= 4 && rb.c > old) return;
          const g = clamp01((since - rb.delay) / rb.air), e = 1 - (1 - g) * (1 - g), dx = rb.dx * e, dz = rb.dz * e, rx = x + sn * dz + cs2 * dx, rz = z + cs2 * dz - sn * dx;
          const gy = g < 1 ? G0 + BH * 0.35 * (1 - e) + (relief.land(rx, rz) - G0) * e + rb.up * 4 * g * (1 - g) : relief.land(rx, rz);
          S3.place(m, rx, gy + rb.s * 0.28 * keep, rz, rb.yaw + (1 - g) * 7, 1, keep);
          const c = LIN.rub[(rb.c * 3) | 0];
          batch.push('box', m, 0, 0, 0, 0, rb.s * 1.5, rb.s * 0.8, rb.s * 1.2, c[0], c[1], c[2]);
        });
      });
      batch.end();
    }

    let sig = '', last = null, bursts = [], flyUntil = -1;
    function update(sc, P) {
      const st = sc.walls, Tl = sc.T, t = sc.t;
      const fallen = st.w.maria === 'collapsed', fall = fallen ? clamp01((Tl - pop.wallsFall) / FALL) : 0, keepK = 1 - fall * 0.94, gateKeep = 1 - smooth(fall * 2.2);
      applyFall(fall);
      for (const k in walls) {
        const w = walls[k], state = st.w[k];
        const warn = (state === 'lost' || state === 'breached') && fall < 1, glowK = warn ? (state === 'lost' ? 1 : 0.7) * (1 - fall) * (0.88 + 0.12 * Math.sin(t * 3)) : 0;
        // a breached or lost Wall is coloured as such, its top most of all, so it shows on the whole island at a glance
        w.side.color.copy(stoneC); w.top.color.set(WD.top);
        if (warn) { tintC.copy(warnC[state]); w.side.color.lerp(tintC, 0.3 * glowK); w.top.color.lerp(tintC, 0.72 * glowK); }
        w.side.color.lerp(rubbleC, fall * 0.72); w.top.color.lerp(rubbleC, fall * 0.8);
        w.band.visible = warn;
        if (warn) { w.band.material.color.copy(warnC[state]); w.band.material.opacity = (state === 'lost' ? 0.85 : 0.6) * (1 - fall) * (0.75 + 0.25 * Math.sin(t * 3)); w.band.material.alphaMap.offset.x = sc.reduced ? 0 : -t * 0.35; w.band.position.y = G0 + Hw * keepK + 0.35; }
      }
      const s = JSON.stringify(st.g) + '|' + gateKeep.toFixed(2);
      if (s !== sig || t < flyUntil) {
        if (s !== sig) {
          for (const gt of gates) if (gt.id) { const torn = st.g[gt.id] !== 'intact'; sections[gt.id].torn.visible = torn; sections[gt.id].whole.visible = !torn; }
          // a gate that has just been broken throws its blocks and a cloud of dust; so do the Walls when they come down
          const live = last && Math.abs(Tl - last.T) < 0.05 && !sc.reduced;
          for (const gt of gates) if (gt.id && st.g[gt.id] === 'broken' && (!last || last.g[gt.id] !== 'broken')) {
            if (live) { gt.flyT = t; flyUntil = t + 2.2; bursts.push({ x: gt.p[0], z: gt.p[1], t0: t, r: 17, n: 30 }); } else gt.flyT = undefined;
          }
          if (live && fall > 0 && last.fall === 0) for (const k in walls) { const nb = hi ? 70 : 40; for (let i = 0; i < nb; i++) { const a = (i / nb) * TAU; bursts.push({ x: C[0] + Math.cos(a) * walls[k].Rw, z: C[1] + Math.sin(a) * walls[k].Rw, t0: t + (i % 7) * 0.2, r: 15, n: 1 }); } }
        }
        sig = s; drawGates(st, gateKeep, t);
      }
      last = { T: Tl, g: { ...st.g }, fall };
      // embers in a broken gate, the pale light of the crystal in a sealed one. From far away both are drawn larger, so a breach is never lost on the map.
      const farK = Math.max(1, Math.min(3.2, 2.2 / P.s));
      let n = 0;
      if (fall < 0.5) for (const gt of gates) if (gt.id && st.g[gt.id] === 'broken') { const pulse = 0.6 + 0.4 * Math.sin(t * 5), fresh = 1 - 0.6 * smooth((Tl - BROKE[gt.id] - 0.6) / 1.5); glow.set(n++, gt.p[0], G0 + BH * 0.4, gt.p[1], BW * 1.9 * farK, LIN.glow[0], LIN.glow[1], LIN.glow[2], 0.6 * pulse * fresh); }
        else if (gt.id && st.g[gt.id] === 'sealed' && gt.id !== 'trostO') glow.set(n++, gt.p[0], G0 + BH * 0.5, gt.p[1], BW * 1.6, LIN.crystal[0], LIN.crystal[1], LIN.crystal[2], 0.22);
      glow.commit(n);
      n = 0;
      // smoke keeps rising from a broken gate: thick while the breach is fresh, a thin thread in the years after
      if (fall < 0.5) for (const gt of gates) if (gt.id && st.g[gt.id] === 'broken') {
        const fresh = 1 - 0.5 * smooth((Tl - BROKE[gt.id] - 0.6) / 1.5), np = hi ? 14 : 8, top = BR.smokeHeight * M * 2.1 * farK, tt = sc.reduced ? 0 : t;
        for (let j = 0; j < np && n < dust.cap; j++) { const q = (tt * 0.085 + j / np) % 1, sway = Math.sin(tt * 0.5 + j * 1.9) * (1 + q * 3); dust.set(n++, gt.p[0] + (q * q * 9 + sway) * farK, G0 + BH * 0.45 + q * top, gt.p[1] + sway * 0.4, (6 + q * 16) * farK, LIN.smoke[0] * 0.7, LIN.smoke[1] * 0.7, LIN.smoke[2] * 0.7, Math.min(0.85, BR.smokeOpacity * 3) * fresh * Math.sin(Math.PI * Math.pow(q, 0.7)) * (1 - fall * 2)); }
      }
      // dust along every Wall as it comes down
      if (fall > 0 && fall < 1 && !sc.reduced) for (const k in walls) {
        const Rw = walls[k].Rw, np = Math.round((hi ? 120 : 60) * (Rw / R.maria)), a0 = Math.sin(Math.PI * fall);
        for (let i = 0; i < np && n < dust.cap; i++) { const a = ((i + 0.5 * ((i * 7) % 3)) / np) * TAU, rr = Rw + ((i % 5) - 2) * 2.2 * fall; dust.set(n++, C[0] + Math.cos(a) * rr, G0 + Hw * (0.15 + 0.6 * ((i * 0.618) % 1)) * (1 - fall * 0.4), C[1] + Math.sin(a) * rr, (15 + 16 * fall) * Math.max(1, farK * 0.6), LIN.ruinDust[0] * 0.82, LIN.ruinDust[1] * 0.82, LIN.ruinDust[2] * 0.82, Math.min(0.8, RU.dustOpacity * 2.3) * a0); }
      }
      bursts = bursts.filter((b) => t - b.t0 < 3.4 && t >= b.t0 - 2);
      for (const b of bursts) {
        const f = (t - b.t0) / 3.4; if (f < 0) continue;
        for (let i = 0; i < b.n && n < dust.cap; i++) { const a = i * 2.4 + b.x, rr = b.r * (0.25 + f * (0.5 + (i % 4) * 0.2)); dust.set(n++, b.x + Math.cos(a) * rr * (b.n > 1 ? 1 : 0.3), G0 + 2 + f * (8 + (i % 3) * 5), b.z + Math.sin(a) * rr * (b.n > 1 ? 1 : 0.3), (b.n > 1 ? 8 : 17) + f * 17, LIN.dust[0], LIN.dust[1], LIN.dust[2], 0.5 * (1 - f) * Math.min(1, f * 8)); }
      }
      dust.commit(n);
      return { fall, keepK };
    }
    return { update, walls, sections, chunks: chunkMesh, puffs: [glow, dust], mats: [gmat, chunkMesh.material, underMat, ...Object.values(walls).flatMap((w) => [w.side, w.top])] };
  }
  S3.Walls = Walls;
})(window);
