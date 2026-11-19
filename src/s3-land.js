/* The land of the 3D stage: the height-field ground with the painted map draped over it, the sea,
   forests, towns and named places, the railways with their trains, the crawling Titan's furrow,
   cloud shadows, snow and the lights of the towns at night. */
(function (global) {
  'use strict';
  const S3 = global.S3;
  if (!S3) return;
  const T = S3.T, TAU = Math.PI * 2;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function Land(ctx) {
    const { scene, World, terrain, relief, pop, Q, D, props, U, renderer } = ctx;
    const { W, H, C, R, DISTRICTS } = World, RG = global.RouteGeo, hAt = relief.land;
    const rnd = S3.rng(52017), m12 = new Float32Array(12);
    const zones = pop.rumble.zones, hi3 = Q.shadow > 0;

    // ---------- Ground ----------
    const stride = Q.meshStride, gc = Math.floor((relief.cols - 1) / stride) + 1, gr = Math.floor((relief.rows - 1) / stride) + 1;
    const pos = new Float32Array(gc * gr * 3), uv = new Float32Array(gc * gr * 2), index = new Uint32Array((gc - 1) * (gr - 1) * 6);
    for (let j = 0; j < gr; j++) for (let i = 0; i < gc; i++) {
      const o = j * gc + i, x = i * stride * relief.step, z = j * stride * relief.step;
      pos[o * 3] = x; pos[o * 3 + 1] = relief.data[j * stride * relief.cols + i * stride]; pos[o * 3 + 2] = z;
      uv[o * 2] = x / W; uv[o * 2 + 1] = 1 - z / H;
    }
    let q = 0;
    for (let j = 0; j < gr - 1; j++) for (let i = 0; i < gc - 1; i++) { const a = j * gc + i, b = a + 1, c = a + gc, d = c + 1; index[q++] = a; index[q++] = c; index[q++] = b; index[q++] = b; index[q++] = c; index[q++] = d; }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setIndex(new T.BufferAttribute(index, 1));
    geo.computeVertexNormals();
    const maxPpu = Math.min(Q.mapPpu, (renderer.capabilities.maxTextureSize - 2) / H);
    const paintOpt = { ground: true, relief, seabed: D.terrain.sea.deep, paving: '#' + S3.col(D.walls.district.paving).multiplyScalar(0.62).getHexString(), rock: D.terrain.classes.mountain.color, snow: D.terrain.classes.snow.color, farmland: D.terrain.farmland, cell: Object.fromEntries(Object.entries(D.terrain.classes).map(([k, v]) => [k, v.color])) };
    const mkTex = (ppu) => { const t = new T.CanvasTexture(global.MapPainter.paint(ppu, terrain, World, paintOpt)); t.colorSpace = T.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; };
    const U3 = { // what the ground shader needs for the Rumbling and the cloud shadows
      uRho: { value: 0 }, uSina: { value: R.sina }, uMaria: { value: R.maria }, uCentre: { value: new T.Vector2(C[0], C[1]) }, uTrample: { value: S3.col(D.terrain.trample) }, uScar: { value: S3.col(D.terrain.scarEarth) },
      uTrampleK: { value: 0 }, uScarK: { value: 0 }, uZones: { value: Array.from({ length: 40 }, () => new T.Vector3(0, 0, -1)) }, uClouds: { value: Array.from({ length: 8 }, () => new T.Vector4(0, 0, 1, 0)) },
    };
    zones.slice(0, 40).forEach((z, i) => U3.uZones.value[i].set(z.c[0], z.c[1], z.r + 2));
    const ground = new T.Mesh(geo, new T.MeshLambertMaterial({ map: mkTex(Q.firstPpu) }));
    ground.material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U3);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; uniform float uRho, uSina, uMaria, uTrampleK, uScarK; uniform vec2 uCentre; uniform vec3 uTrample, uScar; uniform vec3 uZones[40]; uniform vec4 uClouds[8];')
        .replace('#include <map_fragment>', `#include <map_fragment>
        float rr = distance(vWp.xz, uCentre);
        if (uRho > uSina && rr > uSina && rr < uRho && vWp.y > 0.03) {
          float k = (rr > uMaria + 4.0 ? uScarK : uTrampleK) * smoothstep(uRho, uRho - 5.0, rr);
          for (int i = 0; i < 40; i++) { if (uZones[i].z > 0.0) k *= smoothstep(uZones[i].z - 1.5, uZones[i].z + 1.5, distance(vWp.xz, uZones[i].xy)); }
          diffuseColor.rgb = mix(diffuseColor.rgb, rr > uMaria + 4.0 ? uScar : uTrample, k);
        }
        float cl = 0.0;
        for (int i = 0; i < 8; i++) { vec2 dc = (vWp.xz - uClouds[i].xy) / vec2(uClouds[i].z, uClouds[i].z * 0.7); cl += uClouds[i].w * (1.0 - smoothstep(0.25, 1.0, length(dc))); }
        diffuseColor.rgb *= 1.0 - min(0.4, cl);`);
    };
    ground.receiveShadow = true; ground.castShadow = Q.shadow > 0; ground.matrixAutoUpdate = false;
    scene.add(ground);
    function paintFull(done) { setTimeout(() => { const old = ground.material.map; ground.material.map = mkTex(maxPpu); ground.material.needsUpdate = true; old.dispose(); if (done) done(); }, 80); }

    // ---------- Sea ----------
    const cdTex = (() => {
      const { cols, rows, coastDist, band } = relief, px = new Uint8Array(cols * rows);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) px[(rows - 1 - j) * cols + i] = Math.round(clamp01(coastDist[j * cols + i] / band / 2 + 0.5) * 255); // flipped to match the map's uv
      const t = new T.DataTexture(px, cols, rows, T.RedFormat, T.UnsignedByteType); t.magFilter = t.minFilter = T.LinearFilter; t.needsUpdate = true;
      return t;
    })();
    const seaU = { uTime: { value: 0 }, uDeep: { value: S3.col(D.terrain.sea.deep) }, uShallow: { value: S3.col(D.terrain.sea.shallow) }, uFoam: { value: S3.col(D.terrain.sea.foam) }, uCoast: { value: cdTex }, uBand: { value: relief.band }, uLight: { value: new T.Color(1, 1, 1) }, uFog: { value: new T.Color() }, uFogNear: { value: 1 }, uFogFar: { value: 2 }, uSize: { value: new T.Vector2(W, H) }, uSpeed: { value: D.terrain.sea.waveSpeed * 5 } };
    const sea = new T.Mesh(new T.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), new T.ShaderMaterial({
      uniforms: seaU, transparent: true, depthWrite: false,
      vertexShader: 'varying vec3 vWp; varying float vDepth;\nvoid main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz; vec4 mv = viewMatrix * wp; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: `uniform float uTime, uBand, uFogNear, uFogFar, uSpeed; uniform vec3 uDeep, uShallow, uFoam, uLight, uFog; uniform sampler2D uCoast; uniform vec2 uSize; varying vec3 vWp; varying float vDepth;
      void main(){
        vec2 st = vec2(vWp.x / uSize.x, 1.0 - vWp.z / uSize.y);
        float seaD = -(texture2D(uCoast, clamp(st, 0.0, 1.0)).r * 2.0 - 1.0) * uBand; // distance out from the shore
        float t = uTime * uSpeed;
        float w = sin(vWp.x * 0.11 + vWp.z * 0.07 + t * 0.9) * sin(vWp.x * 0.045 - vWp.z * 0.12 - t * 0.6) + 0.5 * sin(vWp.x * 0.31 + vWp.z * 0.27 + t * 1.7);
        vec3 col = mix(uShallow, uDeep, smoothstep(0.5, uBand * 0.9, seaD)) * (1.0 + 0.04 * w);
        // short wave crests, only where the camera is close enough to tell them apart
        float crest = sin(vWp.x * 0.83 + sin(vWp.z * 0.19 + t * 0.5) * 1.7 + t * 1.3) * sin(vWp.z * 1.37 - vWp.x * 0.29 - t * 0.9);
        float glint = smoothstep(0.72, 1.0, crest) * 0.11 * (1.0 - smoothstep(350.0, 900.0, vDepth));
        float foam = smoothstep(0.55, 0.95, sin(seaD * 1.15 - t * 1.6 + w * 0.6)) * (1.0 - smoothstep(0.8, 6.5, seaD)) * step(-0.4, seaD);
        col = mix(col + glint, uFoam, foam * 0.6) * uLight;
        float alpha = max(smoothstep(-0.6, 8.5, seaD), foam * 0.7); // clear in the shallows, solid further out
        col = mix(col, uFog, smoothstep(uFogNear, uFogFar, vDepth));
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }`,
    }));
    sea.renderOrder = 1; sea.frustumCulled = false;
    scene.add(sea);

    // ---------- Static things: forests, district towns, the capital, villages ----------
    const mat = new T.MeshLambertMaterial();
    const need = { box: 0, sphere: 0, capsule: 0, cone: 0 }, needB = { box: 0, sphere: 0, capsule: 0, cone: 0 };
    const countProp = (name, n = 1) => { for (const p of props[name].parts) needB[p.shape] += n; };
    const treeProp = (t) => props[t.g ? 'treeGiant' : t.k ? 'treeConifer' : 'treeBroadleaf'];
    // Solid trees must not stand in a Wall, and the giant forests are thinned so that what happens under them can be seen.
    const lyingAt = pop.agents.filter((a) => a.lying && !a.crawl).map((a) => a.home0); // no tree stands over the Titan that lies at Ragako
    const trees = terrain.trees.filter((t, i) => { const r = Math.hypot(t.x - C[0], t.y - C[1]); for (const k in R) if (Math.abs(r - R[k]) < (t.g ? 7 : 3.4)) return false; if (lyingAt.some((p) => Math.hypot(t.x - p[0], t.y - p[1]) < 9)) return false; return !(t.g && (i * 7919) % 100 < 42); });
    for (const t of trees) for (const p of treeProp(t).parts) need[p.shape]++;
    // Buildings of a place, as [prop, dx, dz, yaw, scale] around its centre.
    const TOWN = 0.54; // towns are drawn a little smaller than the figure scale so that a district holds a real town
    const layouts = {
      capital: () => { // the palace, and two rings of town houses round it, leaving the four river roads open
        const out = [['castle', 0, 0, 0, 1]];
        for (const [d, n] of [[14.2, 12], [18.4, 16]]) for (let i = 0; i < n; i++) { const a = ((i + 0.5) / n) * TAU; if (Math.min(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))) * d < 2.2) continue; out.push([(i + n) % 3 ? 'house' : 'houseTall', Math.cos(a) * d, Math.sin(a) * d, -a + Math.PI / 2, TOWN]); }
        return out;
      },
      village: () => [['villageHut', -3.6, 0.6, 0.3, 0.8], ['villageHut', 0.4, -1.8, -0.5, 0.95], ['villageHut', 4, 1, 1.1, 0.8], ['villageHut', 0.8, 3.2, 2.4, 0.7]],
      ruin: () => [['ruin', 0, 0, 0.4, 1]],
      chapel: () => [['chapel', 0, 0, 0, 1]],
      town: () => [['house', -5.4, 0.5, 0.2, TOWN * 1.1], ['houseTall', -1.8, -1.6, -0.2, TOWN * 1.1], ['house', 1.8, 1.4, 0.5, TOWN * 1.1], ['houseTall', 5, -0.6, -0.4, TOWN * 1.1], ['house', -2.6, 3.6, 1.6, TOWN], ['warehouse', 3.4, 4.4, 0.1, TOWN], ['chimney', 7.6, 2.2, 0, 0.9]],
      harbor: () => [['warehouse', -5.5, -3.5, 0.15, 0.8], ['warehouse', 1.5, -4, -0.1, 0.8], ['pier', -2, 5, 0, 1], ['pier', 4, 4, 0, 0.8], ['steamer', -7, 9, 1.2, 0.8]],
      port: (pl) => { const sx = pl.sea ? pl.sea[0] : 0, sz = pl.sea ? pl.sea[1] : 1, yaw = Math.atan2(sx, sz); return [['warehouse', -sx * 5 - sz * 3.4, -sz * 5 + sx * 3.4, yaw, 0.8], ['warehouse', -sx * 5 + sz * 2.6, -sz * 5 - sx * 2.6, yaw, 0.8], ['crane', sx * 2 + sz * 2.4, sz * 2 - sx * 2.4, yaw, 0.8], ['pier', sx * 7, sz * 7, yaw, 1], ['steamer', sx * 15 + sz * 3, sz * 15 - sx * 3, yaw + Math.PI / 2, 0.85]]; },
      seawall: () => Array.from({ length: 9 }, (_, i) => ['seawallBlock', (i - 4) * 3.9, 0, 0, 1]),
    };
    const outside = (p) => Math.hypot(p[0] - C[0], p[1] - C[1]) > R.maria + 34 && !zones.some((z) => Math.hypot(p[0] - z.c[0], p[1] - z.c[1]) < z.r + 5);
    const fixed = [], live = []; // live: places that are built during the story, or that the Rumbling destroys
    for (const pl of terrain.places) {
      const items = (layouts[pl.kind] || layouts.village)(pl), entry = { pl, items, wreck: pl.sinceT === undefined && outside(pl.p) };
      (pl.sinceT !== undefined || entry.wreck ? live : fixed).push(entry);
    }
    // Ragako: the Titan that cannot move lies on the roof of a house, which has given way under it.
    for (const a of pop.agents) if (a.roof) fixed.push({ pl: { p: a.home0 }, items: [['villageHut', 0, 0, a.roof.yaw, ctx.roof.k, ctx.roof.ky]] });
    // District towns: rows of houses either side of the street that joins the two gates, filling the arch of the district wall.
    const townHouses = [];
    for (const d of DISTRICTS) {
      const yaw = -((d.deg * Math.PI) / 180 + Math.PI / 2), gapU = hi3 ? 4.9 : 6.4, gapV = hi3 ? 5.3 : 6.8;
      for (let v = 3.4; v < d.depth - 2.4; v += gapV) for (let u = 3.7; u < d.hw - 2; u += gapU) for (const sg of [-1, 1]) {
        const x = d.base[0] + d.t[0] * u * sg + d.n[0] * v + (rnd() - 0.5) * 0.9, z = d.base[1] + d.t[1] * u * sg + d.n[1] * v + (rnd() - 0.5) * 0.9;
        if (d.cap([x, z]) > -3.3 || rnd() < 0.1) continue; // clear of the wall; a yard here and there
        townHouses.push([rnd() < 0.3 ? 'houseTall' : 'house', x, z, yaw + (sg > 0 ? Math.PI : 0) + (rnd() - 0.5) * 0.3, TOWN * (0.85 + rnd() * 0.3), d]); // facing the street
      }
    }
    for (const h of townHouses) countProp(h[0]);
    for (const e of fixed) for (const it of e.items) countProp(it[0]);
    const liveNeed = { box: 8, sphere: 8, capsule: 8, cone: 8 };
    for (const e of live) for (const it of e.items) for (const p of props[it[0]].parts) liveNeed[p.shape]++;
    for (const k of ['locomotive', 'wagon', 'wagon']) for (const p of props[k].parts) liveNeed[p.shape] += 12;

    const still = S3.Batch(ctx.geosSmall, mat, need, { cast: Q.shadow > 0, receive: true }); // thousands of trees: the plainest shapes
    const built = S3.Batch(ctx.geosBuild, mat, needB, { cast: Q.shadow > 0, receive: true }); // buildings: their cones are four-sided roofs
    const pushProp = (batch, name, x, z, yaw, k, tint = 1, ky, y) => {
      const pr = props[name];
      S3.place(m12, x, y === undefined ? hAt(x, z) : y, z, yaw, k * pr.unit, ky === undefined ? undefined : ky * pr.unit);
      S3.pushRig(batch, pr, pr.mats, m12, tint);
    };
    still.begin();
    // trees first, so their instance numbers are known (for flattening them in the Rumbling)
    const treeRef = [];
    for (const t of trees) {
      const pr = treeProp(t), k = (t.g ? 13.5 : t.k ? 7.2 : 6.2) * t.s / (pr.height * pr.unit), first = {};
      for (const sh of S3.SHAPES) first[sh] = still.count(sh);
      pushProp(still, pr.name, t.x, t.y, rnd() * TAU, t.g ? k * 0.6 : k, 0.86 + rnd() * 0.26, t.g ? k : undefined); // giant trees: tall and narrow
      const r = Math.hypot(t.x - C[0], t.y - C[1]);
      if (r > R.maria + 3 && !zones.some((z) => Math.hypot(t.x - z.c[0], t.y - z.c[1]) < z.r + 5)) treeRef.push({ r, y: hAt(t.x, t.y), first, n: Object.fromEntries(S3.SHAPES.map((sh) => [sh, still.count(sh) - first[sh]])), f: 1 });
    }
    still.end();
    built.begin();
    for (const h of townHouses) pushProp(built, h[0], h[1], h[2], h[3], h[4], 0.92 + rnd() * 0.16);
    for (const e of fixed) for (const [name, dx, dz, yaw, k, ky] of e.items) pushProp(built, name, e.pl.p[0] + dx, e.pl.p[1] + dz, yaw, k, ky ? 0.86 : 1, ky);
    built.end();
    scene.add(still.group, built.group);
    // Flattened forest: keep the standing trees' matrices and colours, and squash from them.
    const keep = {}, scarLin = S3.lin(D.terrain.scarEarth);
    for (const sh in still.meshes) keep[sh] = { m: still.meshes[sh].instanceMatrix.array.slice(), c: still.meshes[sh].instanceColor.array.slice() };
    treeRef.sort((a, b) => a.r - b.r);
    function setTree(tr, f) {
      for (const sh in tr.n) {
        const mesh = still.meshes[sh]; if (!mesh) continue;
        const a = mesh.instanceMatrix.array, c = mesh.instanceColor.array, K = keep[sh];
        for (let i = tr.first[sh]; i < tr.first[sh] + tr.n[sh]; i++) {
          const o = i * 16;
          a[o + 4] = K.m[o + 4] * f; a[o + 5] = K.m[o + 5] * f; a[o + 6] = K.m[o + 6] * f; a[o + 13] = tr.y + (K.m[o + 13] - tr.y) * f;
          for (let k = 0; k < 3; k++) c[i * 3 + k] = K.c[i * 3 + k] * f + scarLin[k] * 0.6 * (1 - f);
        }
        mesh.userData.dirty = true;
      }
      tr.f = f;
    }
    const liveBatch = S3.Batch(ctx.geosBuild, mat, liveNeed, { dynamic: true, cast: Q.shadow > 0, receive: true });
    scene.add(liveBatch.group);

    // ---------- Railways ----------
    const railTex = (() => {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32; const g = c.getContext('2d');
      g.fillStyle = D.terrain.rail.bed; g.fillRect(0, 0, 32, 32);
      g.fillStyle = D.terrain.rail.sleeper; for (const x of [2, 18]) g.fillRect(x, 3, 7, 26);
      g.fillStyle = D.terrain.rail.rail; g.fillRect(0, 8, 32, 3); g.fillRect(0, 21, 32, 3);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = T.RepeatWrapping; t.anisotropy = 4;
      return t;
    })();
    const railMat = new T.MeshLambertMaterial({ map: railTex, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    const tornMat = new T.MeshLambertMaterial({ map: railTex, color: 0x8a7a66, side: T.DoubleSide, transparent: true, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    const rails = (terrain.rails || []).map((rl, ri) => {
      const N = Math.max(24, Math.round(rl.geo.total / 5)), pts = [], rad = [];
      for (let i = 0; i <= N; i++) { const p = RG.at(rl.geo.tab, i / N); pts.push([p.x, p.y]); rad.push(Math.hypot(p.x - C[0], p.y - C[1])); }
      const mesh = new T.Mesh(S3.ribbon(pts, 1.25, hAt, 0.32, 0.36), railMat);
      mesh.receiveShadow = true; mesh.visible = false; mesh.matrixAutoUpdate = false; scene.add(mesh);
      let torn = null;
      if (rl.wreck) { // the same line knocked askew, shown where the great circle has passed
        const jr = S3.rng(900 + ri), bent = pts.map((p) => [p[0] + (jr() - 0.5) * 2.6, p[1] + (jr() - 0.5) * 2.6]);
        torn = new T.Mesh(S3.ribbon(bent, 1.05, hAt, 0.28, 0.36), tornMat); torn.visible = false; torn.matrixAutoUpdate = false; scene.add(torn);
      }
      return { rl, N, pts, rad, mesh, torn };
    });
    const glow = S3.Puffs(64, { additive: true, order: 6 }); scene.add(glow.points);

    // ---------- The crawling Titan's furrow ----------
    const crawler = pop.agents.find((a) => a.crawl), FN = 64;
    let furrow = null, furrowEnd = -1;
    if (crawler) {
      furrow = new T.Mesh(S3.ribbon(Array.from({ length: FN + 1 }, (_, i) => [i, 0]), 1, () => 0), new T.MeshLambertMaterial({ color: S3.col(D.terrain.crawlFurrow), side: T.DoubleSide, transparent: true, opacity: 0.62, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      furrow.visible = false; furrow.frustumCulled = false; furrow.matrixAutoUpdate = false; scene.add(furrow);
    }
    function drawFurrow(Tl) {
      if (!furrow) return;
      const c = crawler.crawl, end = Math.min(Tl, c.T2);
      furrow.visible = Tl > c.T0 && ctx.crowdOn;
      if (!furrow.visible || Math.abs(end - furrowEnd) < 0.002) return;
      furrowEnd = end;
      const a = furrow.geometry.attributes.position.array;
      for (let i = 0; i <= FN; i++) {
        const p = c.at(c.T0 + ((end - c.T0) * i) / FN), p2 = c.at(c.T0 + ((end - c.T0) * Math.min(FN, i + 1)) / FN), wob = Math.sin(i * 0.9) * 0.7 * Math.min(1, (FN - i) / 4);
        let tx = p2[0] - p[0], tz = p2[1] - p[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l; if (i === FN) { tx = 0; tz = -1; }
        for (let s = 0; s < 2; s++) { const k = s ? -0.95 : 0.95, x = p[0] + wob - tz * k, z = p[1] + tx * k, o = (i * 2 + s) * 3; a[o] = x; a[o + 1] = hAt(x, z) + 0.22; a[o + 2] = z; }
      }
      furrow.geometry.attributes.position.needsUpdate = true;
    }

    // ---------- Weather and lights ----------
    const wr = S3.rng(20261117);
    const clouds = Array.from({ length: Math.min(8, Q.clouds) }, () => ({ x: wr() * W, y: 80 + wr() * (H - 160), r: 80 + wr() * 100, v: 5 + wr() * 7 }));
    const flakes = Array.from({ length: Q.snow }, () => ({ x: 120 + wr() * 760, z: 120 + wr() * 420, y: wr() * 70, v: 7 + wr() * 7, ph: wr() * 6.3 }));
    const snow = S3.Puffs(Math.max(1, Q.snow), { order: 7, maxPx: 6 }); scene.add(snow.points);
    const lit = [[C, 13, null], ...DISTRICTS.map((d) => [d.centre, d.hw * 0.85, d])];
    const lamps = S3.Puffs(lit.length * 7 + 40, { additive: true, order: 6 }); scene.add(lamps.points);
    const lampSeeds = lit.map(([p, r]) => Array.from({ length: 7 }, (_, i) => { const a = wr() * TAU, d = i ? Math.sqrt(wr()) * r : 0; return [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d, 0.6 + wr() * 0.8]; }));

    let liveSig = '';
    function update(sc, P) {
      const Tl = sc.T, t = sc.t, dt = sc.reduced ? 0 : sc.dt, RB = pop.rumble, rho = RB.front(Tl), rumbling = Tl > RB.T0 && rho > R.sina;
      const healT = pop.T('rebuild', 0), healed = clamp01((Tl - healT) / 0.8);
      seaU.uTime.value = sc.reduced ? 0 : t;
      // the ground the great circle has walked over
      U3.uRho.value = rumbling ? Math.min(rho, RB.edge + 400) : 0;
      U3.uTrampleK.value = 0.3 * clamp01(1 - (Tl - healT) / 0.5);
      U3.uScarK.value = 0.62 * (1 - 0.85 * healed);
      // the forest outside Wall Maria goes down as the row passes, and grows back after 857
      const grow = 0.12 + 0.88 * healed;
      for (const tr of treeRef) { const f = rumbling && tr.r < rho ? grow : 1; if (Math.abs(f - tr.f) > 0.01) setTree(tr, f); }
      for (const sh in still.meshes) { const mesh = still.meshes[sh]; if (mesh.userData.dirty) { mesh.userData.dirty = false; for (const at of [mesh.instanceMatrix, mesh.instanceColor]) { at.clearUpdateRanges(); at.needsUpdate = true; } } }
      // cloud shadows drift east
      const day = sc.light ?? 1;
      clouds.forEach((c, i) => { c.x += c.v * dt; if (c.x - c.r > W + 60) { c.x = -c.r - 40; c.y = 80 + ((c.y * 7.3) % (H - 160)); } U3.uClouds.value[i].set(c.x, c.y, c.r, 0.2 * (0.3 + 0.7 * day)); });
      // snow over the northern mountains
      let n = 0;
      for (const f of flakes) {
        f.y -= f.v * dt; f.x += Math.sin(t * 0.8 + f.ph) * 3 * dt;
        if (f.y < hAt(f.x, f.z)) { f.y = 60 + (f.ph * 7) % 30; f.z = 120 + ((f.z * 1.37 + 71) % 420); }
        snow.set(n++, f.x, f.y, f.z, 1.5, 1, 1, 1, 0.9 * Math.min(1, (540 - f.z) / 60));
      }
      snow.commit(n);
      // places built during the story grow into place; places outside the Walls are trampled
      let sig = '';
      const jobs = [];
      for (const e of live) {
        const since = e.pl.sinceT;
        if (since !== undefined && Tl < since) continue;
        const k = since === undefined ? 1 : since % 1 ? clamp01((Tl - since) / 0.03) : 1;
        const hit = e.wreck && rumbling && Math.hypot(e.pl.p[0] - C[0], e.pl.p[1] - C[1]) < rho;
        jobs.push([e, k, hit]); sig += e.pl.id + ':' + k.toFixed(2) + (hit ? 'x' : '') + '|';
      }
      // trains on the finished lines
      const trains = [];
      n = 0;
      for (let i = 0; i < rails.length; i++) {
        const r = rails[i], rl = r.rl;
        if (Tl <= rl.T0) { r.mesh.visible = false; if (r.torn) r.torn.visible = false; continue; }
        const f = Math.min(1, (Tl - rl.T0) / (rl.T1 - rl.T0));
        let segs = Math.floor(f * r.N), from = 0;
        if (r.torn) {
          const wrecked = rl.wreck && rumbling && rho > R.maria;
          let cut = 0; // segments from `cut` on have been reached by the great circle (the line runs inward from the coast)
          if (wrecked) { cut = r.N; for (let k = 0; k < r.N; k++) if (r.rad[k] < rho && r.rad[k] > R.maria) { cut = k; break; } }
          const gone = clamp01((Tl - healT) / 0.25);
          r.torn.visible = wrecked && gone < 1 && cut < r.N;
          if (r.torn.visible) { r.torn.geometry.setDrawRange(cut * 6, (r.N - cut) * 6); tornMat.opacity = 0.9 * (1 - gone); }
          if (wrecked) segs = Math.min(segs, cut);
          if (wrecked) { r.mesh.visible = segs > 0; r.mesh.geometry.setDrawRange(0, segs * 6); continue; }
        }
        r.mesh.visible = segs > 0; r.mesh.geometry.setDrawRange(from, segs * 6);
        if (f < 1) { const p = RG.at(rl.geo.tab, f), y = hAt(p.x, p.y); glow.set(n++, p.x, y + 1.2, p.y, 9 + 3 * Math.sin(t * 5), 1, 0.78, 0.36, 0.75); continue; } // the railhead, where the building is going on
        if (sc.reduced) continue;
        const L = rl.geo.total, w = ((((t * 46) / L + i * 0.37) % 2) + 2) % 2, u = w < 1 ? w : 2 - w, dir = w < 1 ? 1 : -1;
        for (let k = 0; k < 3; k++) { const p = RG.at(rl.geo.tab, clamp01(u - (dir * k * 5.4) / L)); trains.push([k ? 'wagon' : 'locomotive', p.x, p.y, Math.PI / 2 - p.angle + (dir < 0 ? Math.PI : 0)]); }
      }
      glow.commit(n);
      sig += trains.length ? 'T' + t.toFixed(2) : '';
      if (sig !== liveSig) {
        liveSig = sig;
        liveBatch.begin();
        for (const [e, k, hit] of jobs) for (const [name, dx, dz, yaw, s] of e.items) {
          const x = e.pl.p[0] + dx, z = e.pl.p[1] + dz;
          if (hit) pushProp(liveBatch, name, x, z, yaw, s, 0.62, 0.16 * s); // rubble
          else pushProp(liveBatch, name, x, z, yaw, s * (0.35 + 0.65 * k * (2 - k)), 1, s * k);
        }
        for (const [name, x, z, yaw] of trains) pushProp(liveBatch, name, x, z, yaw, 1, 1, undefined, hAt(x, z) + 0.4);
        liveBatch.end();
      }
      drawFurrow(Tl);
      // lights in the towns that are lived in
      const night = 1 - day;
      n = 0;
      if (night > 0.02) {
        const wl = S3.lin(D.light.night.windows), k = night * 0.8;
        lit.forEach(([p, r, d], i) => {
          if (d && d.wall === 'maria' && (sc.walls.w.maria === 'lost' || sc.walls.w.maria === 'collapsed')) return;
          if (sc.walls.w[d ? d.wall : 'sina'] === 'collapsed' && Tl < healT) return;
          lampSeeds[i].forEach(([x, z, s], j) => lamps.set(n++, x, hAt(x, z) + (j ? 2.5 : 5), z, j ? 5 * s : r * 3.2, wl[0], wl[1], wl[2], j ? k * (0.75 + 0.25 * Math.sin(t * 2 + i + j * 1.7)) : k * 0.35));
        });
      }
      lamps.commit(n);
    }
    return { update, paintFull, ground, sea, seaU, still, puffs: [glow, snow, lamps], mats: [mat, railMat, tornMat, ground.material], pushProp };
  }
  S3.Land = Land;
})(window);
