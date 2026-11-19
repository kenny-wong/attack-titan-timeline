/* The three Walls of the 3D stage: stone rings with their half-round district walls, the gates
   (intact, broken, sealed with crystal or with the boulder), the warning band of a breached or lost
   Wall, and their fall in the Rumbling. */
(function (global) {
  'use strict';
  const S3 = global.S3;
  if (!S3) return;
  const T = S3.T, RAD = Math.PI / 180, TAU = Math.PI * 2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function Walls(ctx) {
    const { scene, World, pop, D, Q, geos } = ctx;
    const { C, R, DISTRICTS } = World, WD = D.walls;
    const Hw = ctx.wallH, TH = ctx.wallT, G0 = ctx.wallBase; // height, thickness, ground level under the Walls
    const rnd = S3.rng(4411);

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
    // One length of Wall along points { x, z, nx, nz } (n = outward): outer face, inner face and the walkway on top.
    function strip(pts, th, h, into) {
      const half = th / 2, start = into.pos.length / 3;
      let len = 0;
      const lens = pts.map((p, i) => (i ? (len += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z)) : 0));
      const face = (side, y0, y1, flat) => { // side: +1 outer, -1 inner, 0 top
        const base = into.pos.length / 3;
        pts.forEach((p, i) => {
          const u = lens[i] / (h * 1.6);
          if (flat) { into.pos.push(p.x - p.nx * half, y1, p.z - p.nz * half, p.x + p.nx * half, y1, p.z + p.nz * half); into.nor.push(0, 1, 0, 0, 1, 0); into.uv.push(u, 0.02, u, 0.02); }
          else { const x = p.x + p.nx * half * side, z = p.z + p.nz * half * side; into.pos.push(x, y0, z, x, y1, z); into.nor.push(p.nx * side, 0, p.nz * side, p.nx * side, 0, p.nz * side); into.uv.push(u, 0, u, 1); }
        });
        for (let i = 0; i < pts.length - 1; i++) { const a = base + i * 2, b = a + 1, c = a + 2, d = a + 3; if (side < 0 || flat) into[flat ? 'top' : 'idx'].push(a, c, b, b, c, d); else into.idx.push(a, b, c, b, d, c); }
      };
      face(1, -3, h); face(-1, -3, h); face(0, 0, h, true);
      return start;
    }
    const arc = (cx, cz, r, a0, a1, stepDeg) => { const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / (stepDeg * RAD))), out = []; for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, nx: Math.cos(a), nz: Math.sin(a) }); } return out; };
    const topMatBase = new T.MeshLambertMaterial({ color: S3.col(WD.top) });
    const walls = {};
    for (const wall of ['maria', 'rose', 'sina']) {
      const Rw = R[wall], ds = DISTRICTS.filter((d) => d.wall === wall).sort((a, b) => a.deg - b.deg), into = { pos: [], nor: [], uv: [], idx: [], top: [] };
      ds.forEach((d, i) => {
        const nx = ds[(i + 1) % ds.length], a = d.deg * RAD, an = nx.deg * RAD + (i === ds.length - 1 ? TAU : 0), half = Math.asin(d.r / Rw), nh = Math.asin(nx.r / Rw);
        strip(arc(d.base[0], d.base[1], d.r, a - Math.PI / 2, a + Math.PI / 2, 5), TH, Hw, into); // the half-round district wall
        strip(arc(C[0], C[1], Rw, a + half - 0.004, an - nh + 0.004, 1.5), TH, Hw, into); // the Wall to the next district
        strip(arc(C[0], C[1], Rw, a - half, a + half, 1.5), TH * 0.9, Hw, into); // the Wall line across the district (its inner gate is on it)
      });
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(into.pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(into.nor, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(into.uv, 2));
      geo.setIndex([...into.idx, ...into.top]); geo.addGroup(0, into.idx.length, 0); geo.addGroup(into.idx.length, into.top.length, 1);
      const side = new T.MeshLambertMaterial({ map: stoneTex }), top = topMatBase.clone();
      const mesh = new T.Mesh(geo, [side, top]);
      mesh.position.y = G0; mesh.castShadow = Q.shadow > 0; mesh.receiveShadow = true; mesh.frustumCulled = false;
      scene.add(mesh);
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
    const stoneC = new T.Color(1, 1, 1), rubbleC = S3.col(WD.rubble[1]), warnC = { breached: S3.col(WD.warning.breached), lost: S3.col(WD.warning.lost) };

    // ---------- Gates ----------
    const GW = ctx.gateW, GH = ctx.gateH, gates = [];
    for (const d of DISTRICTS) {
      gates.push({ d, p: d.outer, id: d.id === 'shig' ? 'shigO' : d.id === 'trost' ? 'trostO' : null, th: TH });
      gates.push({ d, p: d.inner, id: d.id === 'shig' ? 'shigI' : null, th: TH * 0.9 });
    }
    const gmat = new T.MeshLambertMaterial();
    const batch = S3.Batch(geos, gmat, { box: gates.length * 14, sphere: gates.length * 8, cone: 3 * 14 }, { dynamic: true, cast: Q.shadow > 0, receive: true });
    scene.add(batch.group);
    const glow = S3.Puffs(16, { additive: true, order: 6 }); scene.add(glow.points);
    const dust = S3.Puffs(260, { order: 5 }); scene.add(dust.points);
    const LIN = { door: S3.lin(WD.gate.door), frame: S3.lin(WD.gate.frame), emblem: S3.lin(WD.gate.emblem), hole: S3.lin(WD.gateBroken.hole), rub: WD.gateBroken.rubble.map(S3.lin), crystal: S3.lin(WD.gateSealedCrystal.color), boulder: S3.lin(WD.gateSealedBoulder.color), glow: S3.lin(WD.gateBroken.glow), dust: S3.lin(D.fx.dust.color) };
    const m = new Float32Array(12), bits = gates.map(() => Array.from({ length: 7 }, () => [rnd() * 2 - 1, rnd() * 2 - 1, 0.6 + rnd() * 0.9, rnd() * TAU, rnd()]));
    function drawGates(st, keepK) {
      batch.begin();
      if (keepK > 0.04) gates.forEach((gt, gi) => {
        const yaw = Math.atan2(Math.cos(gt.d.deg * RAD), Math.sin(gt.d.deg * RAD)), x = gt.p[0], z = gt.p[1], deep = gt.th + 0.7, state = gt.id ? st.g[gt.id] : 'intact';
        S3.place(m, x, G0, z, yaw, 1, keepK); // local +Z looks out through the gate
        const put = (sh, cx, cy, cz, sx, sy, sz, c, k = 1) => batch.push(sh, m, 0, cx, cy, cz, sx, sy, sz, c[0] * k, c[1] * k, c[2] * k);
        // the stone frame with its round arch, and the relief above it
        put('box', 0, GH * 0.36, 0, GW + 1.5, GH * 0.72, deep - 0.25, LIN.frame);
        put('sphere', 0, GH * 0.72, 0, GW + 1.5, GW * 0.86, deep - 0.25, LIN.frame);
        put('sphere', 0, GH * 0.72 + GW * 0.6, 0, GW * 0.34, GW * 0.34, deep + 0.15, LIN.emblem);
        if (state === 'broken') {
          put('box', 0, GH * 0.37, 0, GW * 1.02, GH * 0.74, deep + 0.3, LIN.hole); put('sphere', 0.3, GH * 0.7, 0, GW * 1.2, GW * 0.95, deep + 0.3, LIN.hole); // the hole, torn wider than the door was
          for (const [a, b, s, r, c] of bits[gi]) { S3.place(m, x + Math.sin(yaw) * b * 5.5 + Math.cos(yaw) * a * GW * 0.9, G0 + s * 0.5, z + Math.cos(yaw) * b * 5.5 - Math.sin(yaw) * a * GW * 0.9, r, 1, keepK); batch.push('box', m, 0, 0, 0, 0, s * 1.6, s, s * 1.3, ...LIN.rub[c < 0.5 ? 0 : 1]); }
        } else if (state === 'sealed' && gt.id !== 'trostO') { // Shiganshina: hardened crystal fills the gate
          put('box', 0, GH * 0.36, 0, GW, GH * 0.72, deep, LIN.crystal, 0.9);
          for (const [a, b, s, r] of bits[gi].slice(0, 5)) { S3.place(m, x + Math.cos(yaw) * a * GW * 0.42, G0 + GH * (0.25 + 0.3 * Math.abs(b)), z - Math.sin(yaw) * a * GW * 0.42, r, 1, keepK); batch.push('cone', m, 0, 0, 0, 0, s * 2.2, GH * (0.7 + s * 0.3), s * 2.2, LIN.crystal[0] * 1.1, LIN.crystal[1] * 1.1, LIN.crystal[2] * 1.1); }
        } else if (state === 'sealed') { // Trost: the boulder
          put('sphere', 0, GH * 0.45, 0.4, GW * 1.25, GH * 1.0, deep + 2.4, LIN.boulder); put('sphere', -GW * 0.3, GH * 0.2, 1.1, GW * 0.7, GH * 0.5, 2.6, LIN.boulder, 0.86);
        } else {
          put('box', 0, GH * 0.35, 0, GW, GH * 0.7, deep, LIN.door); put('sphere', 0, GH * 0.7, 0, GW, GW * 0.8, deep, LIN.door);
          put('box', 0, GH * 0.36, 0, 0.22, GH * 0.7, deep + 0.12, LIN.frame, 0.55); // where the two leaves meet
        }
      });
      batch.end();
    }

    let sig = '', last = null, bursts = [];
    function update(sc, P) {
      const st = sc.walls, Tl = sc.T, t = sc.t;
      const fallen = st.w.maria === 'collapsed', fall = fallen ? clamp01((Tl - pop.wallsFall) / 0.05) : 0, keepK = 1 - fall * 0.94;
      for (const k in walls) {
        const w = walls[k], state = st.w[k];
        w.mesh.scale.y = keepK;
        w.side.color.copy(stoneC).lerp(rubbleC, fall * 0.75); w.top.color.set(WD.top).lerp(rubbleC, fall * 0.8);
        const warn = (state === 'lost' || state === 'breached') && fall < 1;
        w.band.visible = warn;
        if (warn) { w.band.material.color.copy(warnC[state]); w.band.material.opacity = (state === 'lost' ? 0.85 : 0.6) * (1 - fall) * (0.75 + 0.25 * Math.sin(t * 3)); w.band.material.alphaMap.offset.x = sc.reduced ? 0 : -t * 0.35; w.band.position.y = G0 + Hw * keepK + 0.35; }
      }
      const s = JSON.stringify(st.g) + '|' + keepK.toFixed(2);
      if (s !== sig) {
        // a gate that has just broken throws up dust; so do the Walls when they come down
        if (last && Math.abs(Tl - last.T) < 0.05) {
          for (const gt of gates) if (gt.id && st.g[gt.id] === 'broken' && last.g[gt.id] !== 'broken') bursts.push({ x: gt.p[0], z: gt.p[1], t0: t, r: 9, n: 16 });
          if (fall > 0 && last.fall === 0) for (const k in walls) for (let i = 0; i < 44; i++) { const a = (i / 44) * TAU; bursts.push({ x: C[0] + Math.cos(a) * walls[k].Rw, z: C[1] + Math.sin(a) * walls[k].Rw, t0: t + (i % 5) * 0.12, r: 13, n: 1 }); }
        }
        sig = s; drawGates(st, keepK);
      }
      last = { T: Tl, g: { ...st.g }, fall };
      // embers in a broken gate
      let n = 0;
      if (fall < 0.5) for (const gt of gates) if (gt.id && st.g[gt.id] === 'broken') { const pulse = 0.6 + 0.4 * Math.sin(t * 5); glow.set(n++, gt.p[0], G0 + GH * 0.5, gt.p[1], GW * 4.2, LIN.glow[0], LIN.glow[1], LIN.glow[2], 0.5 * pulse); }
        else if (gt.id && st.g[gt.id] === 'sealed' && gt.id !== 'trostO') glow.set(n++, gt.p[0], G0 + GH * 0.5, gt.p[1], GW * 3, LIN.crystal[0], LIN.crystal[1], LIN.crystal[2], 0.22);
      glow.commit(n);
      n = 0;
      bursts = bursts.filter((b) => t - b.t0 < 3 && t >= b.t0 - 1);
      for (const b of bursts) {
        const f = (t - b.t0) / 3; if (f < 0) continue;
        for (let i = 0; i < b.n && n < dust.cap; i++) { const a = i * 2.4 + b.x, rr = b.r * (0.25 + f * (0.5 + (i % 4) * 0.2)); dust.set(n++, b.x + Math.cos(a) * rr * (b.n > 1 ? 1 : 0.3), G0 + 2 + f * (8 + (i % 3) * 5), b.z + Math.sin(a) * rr * (b.n > 1 ? 1 : 0.3), (b.n > 1 ? 7 : 16) + f * 16, LIN.dust[0], LIN.dust[1], LIN.dust[2], 0.5 * (1 - f) * Math.min(1, f * 8)); }
      }
      dust.commit(n);
      return { fall, keepK };
    }
    return { update, walls, puffs: [glow, dust], mats: [gmat, ...Object.values(walls).flatMap((w) => [w.side, w.top])] };
  }
  S3.Walls = Walls;
})(window);
