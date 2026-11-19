/* The 3D stage (three.js): the island as a landscape seen by a tilted camera - height-field ground, sea,
   forests and towns (s3-land.js), the Walls and gates (s3-walls.js) and the crowd (s3-crowd.js) - lit by
   a low sun that throws shadows, with day and night. It offers the same calls as the flat canvas stage
   (stage.js), which the page falls back to where WebGL is not available.
   The look - figures, buildings, colours, light - is the design in assets/3d-design/design.json (DESIGN3D).
   Sizes: real sizes would be invisible on a 2,200 km island, so heights are compressed: a 1.7 m person
   stands 3.4 units tall, a 15 m Titan 9.6, the 50 m Wall 17 (see `U`). */
(function (global) {
  'use strict';
  const QUALITY = {
    high: { dpr: 2, mapPpu: 2.4, firstPpu: 0.6, meshStride: 1, shadow: 2048, detail: 'high', logicEvery: 1, snow: 150, clouds: 8, rowGap: 6.2, puffs: 900, ringPuffs: 150, antialias: true },
    low: { dpr: 1.5, mapPpu: 1.3, firstPpu: 0.5, meshStride: 2, shadow: 0, detail: 'low', logicEvery: 2, snow: 50, clouds: 5, rowGap: 12, puffs: 420, ringPuffs: 70, antialias: false }, // phones: no shadow map, crowd at half rate
  };
  // World size of a thing of real size m metres: big things are compressed more than small ones.
  const U = (m) => 2.64 * Math.pow(m, 0.476);
  const WALL_H = U(50), WALL_T = 3.2;
  // Props are sized by one of their dimensions, in world units.
  const PROP_SIZE = { house: ['y', 7.8], houseTall: ['y', 10.4], castle: ['y', 22], chapel: ['y', 10], ruin: ['y', 10], villageHut: ['y', 5.6], warehouse: ['y', 6.2], crane: ['y', 10], pier: ['z', 13], steamer: ['z', 13], seawallBlock: ['y', 6.5], chimney: ['y', 14], boat: ['z', 7], locomotive: ['z', 4.8], wagon: ['z', 4.6], cannon: ['z', 3.6], treeBroadleaf: ['y', 1], treeConifer: ['y', 1], treeGiant: ['y', 1], stump: ['z', 3], boulder: ['y', 8] };

  function create(canvas, World, terrain, pop, qualityName, extra) {
    const T = global.THREE, S3 = global.S3, V = global.View3D, Rig = global.Rig;
    if (!T || !S3 || !extra || !extra.design) throw new Error('3D stage unavailable');
    const Q = QUALITY[qualityName] || QUALITY.high, D = extra.design, relief = extra.relief;
    const renderer = new T.WebGLRenderer({ canvas, antialias: Q.antialias, alpha: false, powerPreference: 'high-performance' }); // throws without WebGL
    renderer.shadowMap.enabled = Q.shadow > 0; renderer.shadowMap.type = T.PCFShadowMap;
    if (D.camera) Object.assign(V.cfg, { fov: D.camera.fov || V.cfg.fov, pitchFar: D.camera.pitchFar || V.cfg.pitchFar, pitchNear: D.camera.pitchNear || V.cfg.pitchNear });
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(V.cfg.fov, 1, 1, 5000);
    scene.fog = new T.Fog(0xffffff, 100, 1000);
    let vw = 1, vh = 1, dpr = 1, dprCap = Q.dpr;

    // ---- the design's figures and props, ready to draw ----
    const prep = (spec, name) => { const r = Rig.compile(spec, name); for (const p of r.parts) p.lin = S3.lin(p.key); return r; };
    const rigs = {}, props = {};
    for (const [k, spec] of Object.entries(D.rigs)) { const r = (rigs[k] = prep(spec, k)); r.unit = U(r.height) / r.height; r.head = r.parts.findIndex((p) => p.id === 'head'); }
    const human = U(1.7) / 1.7;
    for (const k of ['civA', 'civB', 'civC', 'soldier', 'horse', 'rider']) if (rigs[k]) rigs[k].unit = human; // a child stays a child; horse and rider share a scale
    rigs.wallTitan.unit = WALL_H / 50; // the story's 50 m Wall to 60 m Wall Titan
    for (const k of ['titanLying', 'titanCrawl']) rigs[k].unit *= 1.5; // lying flat, they would be lost in the grass at their true size
    const sad = (D.rigs.horse.attach && D.rigs.horse.attach.saddle) || [0, 1.8, 0], hroot = rigs.horse.parts[0].at;
    rigs.horse.saddle = [sad[0] - hroot[0], sad[1] - hroot[1], sad[2] - hroot[2]]; rigs.rider.seat = rigs.rider.parts[0].at[1];
    for (const [k, spec] of Object.entries(D.props)) {
      const r = (props[k] = prep(spec, k)); r.mats = Rig.pose(r, 'rest', 0, new Float32Array(r.n * 12));
      let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      for (let i = 0; i < r.n; i++) { const p = r.parts[i], o = i * 12; for (let a = 0; a < 3; a++) { const c = r.mats[o + a * 4] * p.centre[0] + r.mats[o + a * 4 + 1] * p.centre[1] + r.mats[o + a * 4 + 2] * p.centre[2] + r.mats[o + a * 4 + 3], e = (Math.abs(r.mats[o + a * 4]) * p.size[0] + Math.abs(r.mats[o + a * 4 + 1]) * p.size[1] + Math.abs(r.mats[o + a * 4 + 2]) * p.size[2]) / 2; lo[a] = Math.min(lo[a], c - e); hi[a] = Math.max(hi[a], c + e); } }
      r.height = hi[1] - Math.min(0, lo[1]);
      const [axis, size] = PROP_SIZE[k] || ['y', U(r.height)];
      r.unit = size / (axis === 'z' ? hi[2] - lo[2] : r.height);
    }
    const flatAt = World.at(World.R.maria, 45);
    const ctx = { T, scene, renderer, World, terrain, relief, pop, Q, D, U, rigs, props, geos: S3.unitGeometries(Q.detail), geosSmall: S3.unitGeometries('tiny'), geosBuild: S3.unitGeometries('build'), wallH: WALL_H, wallT: WALL_T, wallBase: relief.land(flatAt[0], flatAt[1]) - 0.05, gateW: 5, gateH: 7.6, wallTitanSink: 10 * (WALL_H / 50), crowdOn: true, shadowsOn: Q.shadow > 0 };

    // ---- light ----
    const L = D.light, dayC = { sun: S3.col(L.day.sun), sky: S3.col(L.day.sky), ground: S3.col(L.day.ground), fog: S3.col(L.day.fog) }, nightC = { sun: S3.col(L.night.sun), sky: S3.col(L.night.sky), ground: S3.col(L.night.ground), fog: S3.col(L.night.fog) };
    const hemi = new T.HemisphereLight(0xffffff, 0x444444, 1), sun = new T.DirectionalLight(0xffffff, 1);
    scene.add(hemi, sun, sun.target);
    if (Q.shadow) { sun.castShadow = true; sun.shadow.mapSize.set(Q.shadow, Q.shadow); sun.shadow.bias = -0.0006; }
    // The camera looks north, so the sun stands behind it (south) to light the faces we see; the design's bearing is kept east-west.
    const dirOf = (d) => new T.Vector3(d[0], d[1], Math.abs(d[2])).normalize();
    const dayDir = dirOf(L.day.sunDir), nightDir = dirOf(L.night.sunDir), sunDir = new T.Vector3(), unlit = new T.Color();
    const GAIN = 1.32; // the design's light levels are for a tone-mapped picture; this page shows the painted colours as they are

    const land = S3.Land(ctx), walls = S3.Walls(ctx), crowd = S3.Crowd(ctx);
    const puffs = [...land.puffs, ...walls.puffs, ...crowd.puffs];
    let atlas = null, spec = null, lastPose = null;

    function resize(w, h) {
      dpr = Math.min(global.devicePixelRatio || 1, dprCap);
      vw = Math.max(1, Math.round(w)); vh = Math.max(1, Math.round(h));
      renderer.setPixelRatio(dpr); renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
    }
    function draw(view, sc) {
      const P = (lastPose = V.pose(view, vw, vh, sc.yaw || 0)), day = sc.light ?? 1, night = 1 - day;
      camera.position.set(P.cam[0], P.cam[1], P.cam[2]); camera.lookAt(view.x, 0, view.y);
      camera.near = Math.max(2, P.d * 0.12); camera.far = P.d * 7 + 600; camera.updateProjectionMatrix();
      // day and night
      sun.color.copy(nightC.sun).lerp(dayC.sun, day); sun.intensity = (L.night.sunIntensity + (L.day.sunIntensity - L.night.sunIntensity) * day) * GAIN;
      hemi.color.copy(nightC.sky).lerp(dayC.sky, day); hemi.groundColor.copy(nightC.ground).lerp(dayC.ground, day); hemi.intensity = (L.night.hemiIntensity + (L.day.hemiIntensity - L.night.hemiIntensity) * day) * GAIN * 1.15;
      scene.fog.color.copy(nightC.fog).lerp(dayC.fog, day); scene.fog.near = P.d * 1.15; scene.fog.far = P.d * 4.2;
      renderer.setClearColor(scene.fog.color);
      sunDir.copy(nightDir).lerp(dayDir, day).normalize();
      sun.target.position.set(view.x, 0, view.y); sun.position.copy(sun.target.position).addScaledVector(sunDir, 2200);
      if (Q.shadow) { // the shadow map covers what is on screen
        let rv = 60;
        for (const c of V.corners(P)) rv = Math.max(rv, Math.hypot(c[0] - view.x, c[1] - view.y));
        rv = Math.min(1500, rv * 1.04 + 30);
        const cam = sun.shadow.camera;
        cam.left = -rv; cam.right = rv; cam.top = rv; cam.bottom = -rv; cam.near = 200; cam.far = 4400; cam.updateProjectionMatrix();
        sun.shadow.normalBias = Math.min(3, (rv * 2 / Q.shadow) * 2.2);
      }
      unlit.setRGB(0.3 + 0.7 * day, 0.36 + 0.64 * day, 0.52 + 0.48 * day); // things that light themselves (sea, smoke) darken with the night
      land.seaU.uLight.value.copy(unlit); land.seaU.uFog.value.copy(scene.fog.color); land.seaU.uFogNear.value = scene.fog.near; land.seaU.uFogFar.value = scene.fog.far;
      for (const pf of puffs) { pf.mat.uniforms.uK.value = P.k * dpr; if (pf.mat.blending !== T.AdditiveBlending) pf.mat.uniforms.uLight.value.copy(unlit); }
      ctx.crowdOn = !!sc.crowd;
      land.update(sc, P);
      const info = walls.update(sc, P);
      crowd.update(sc, P, info, sunDir);
      renderer.render(scene, camera);
    }
    // The first, quick ground texture is already up; paint the full one a moment later.
    function paintMap(onDone) { land.paintFull(onDone); }
    // The small figures in the page's key and status rows still come from the drawn sprite sheet.
    function loadSprites() {
      if (!global.Puppets) return;
      try { atlas = global.Puppets.buildAtlas({ quality: 'low', unit: 1.6 }); spec = global.Puppets.SPEC.sprites; } catch (e) { atlas = null; }
    }
    return {
      is3d: true, resize, paintMap, loadSprites, draw, renderer, scene, camera, ctx, land, walls, crowd,
      lyingAt(view, px, py) { return lastPose ? crowd.lyingAt(lastPose, px, py) : null; },
      // Frames stayed slow: give up the shadow map first, then the extra pixels of a dense screen, then run the crowd at a lower rate.
      slower() {
        if (ctx.shadowsOn) { ctx.shadowsOn = false; sun.castShadow = false; return 'no shadow map'; }
        if (dprCap > 1 && (global.devicePixelRatio || 1) > 1) { dprCap = 1; resize(vw, vh); return 'fewer pixels'; }
        return crowd.slower();
      },
      get logicEvery() { return crowd.logicEvery; }, get size() { return [vw, vh]; }, get hasSprites() { return !!atlas; }, get atlas() { return atlas; }, quality: qualityName,
    };
  }
  global.Stage3D = { create, QUALITY, U, WALL_H };
})(window);
