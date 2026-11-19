/* Building blocks of the 3D stage (three.js): batches of instanced primitive shapes, ribbons laid on the
   ground, soft particles and small canvas textures. Scene axes: X = world x, Y = up, Z = world y. */
(function (global) {
  'use strict';
  const T = global.THREE;
  if (!T) return;
  const SHAPES = ['box', 'sphere', 'capsule', 'cone'];
  const col = (c) => new T.Color(c);
  const lin = (c) => { const k = new T.Color(c); return [k.r, k.g, k.b]; }; // '#rrggbb' -> linear rgb, as the renderer wants instance colours
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

  // Unit shapes: 1 wide, 1 high, 1 deep, centred. The capsule's round ends are true half-spheres when it is three times as long as wide.
  function unitGeometries(detail) {
    const hi = detail === 'high', tiny = detail === 'tiny';
    const capsule = new T.CapsuleGeometry(0.5, 2, tiny ? 1 : hi ? 3 : 2, tiny ? 5 : hi ? 8 : 6); capsule.scale(1, 1 / 3, 1);
    if (detail === 'build') return { box: new T.BoxGeometry(1, 1, 1), sphere: new T.SphereGeometry(0.5, 8, 6), capsule, cone: new T.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4) }; // a cone with a square base: a tower roof
    return { box: new T.BoxGeometry(1, 1, 1), sphere: new T.SphereGeometry(0.5, tiny ? 6 : hi ? 10 : 7, tiny ? 4 : hi ? 7 : 5), capsule, cone: new T.ConeGeometry(0.5, 1, tiny ? 6 : hi ? 8 : 6) };
  }

  /* A batch: one InstancedMesh per shape, refilled with push(). `m` is a 3x4 joint matrix (12 numbers at offset o),
     the shape sits at centre c in that joint's space with size s. */
  function Batch(geos, material, caps, opts = {}) {
    const meshes = {}, n = {};
    for (const sh of SHAPES) {
      const cap = caps[sh] || 0;
      if (!cap) continue;
      const mesh = new T.InstancedMesh(geos[sh], material, cap);
      mesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
      mesh.instanceMatrix.setUsage(opts.dynamic ? T.DynamicDrawUsage : T.StaticDrawUsage);
      mesh.instanceColor.setUsage(opts.dynamic ? T.DynamicDrawUsage : T.StaticDrawUsage);
      mesh.frustumCulled = false; mesh.count = 0; mesh.castShadow = !!opts.cast; mesh.receiveShadow = !!opts.receive;
      mesh.matrixAutoUpdate = false;
      meshes[sh] = mesh; n[sh] = 0;
    }
    const group = new T.Group();
    for (const sh in meshes) group.add(meshes[sh]);
    return {
      group, meshes,
      begin() { for (const sh in n) n[sh] = 0; },
      count(sh) { return n[sh]; },
      // returns the index used, or -1 when the batch is full
      push(sh, m, o, cx, cy, cz, sx, sy, sz, r, g, b) {
        const mesh = meshes[sh];
        if (!mesh || n[sh] >= mesh.instanceMatrix.count) return -1;
        const i = n[sh]++, a = mesh.instanceMatrix.array, q = i * 16, c = mesh.instanceColor.array;
        const m00 = m[o], m01 = m[o + 1], m02 = m[o + 2], m10 = m[o + 4], m11 = m[o + 5], m12 = m[o + 6], m20 = m[o + 8], m21 = m[o + 9], m22 = m[o + 10];
        a[q] = m00 * sx; a[q + 1] = m10 * sx; a[q + 2] = m20 * sx; a[q + 3] = 0;
        a[q + 4] = m01 * sy; a[q + 5] = m11 * sy; a[q + 6] = m21 * sy; a[q + 7] = 0;
        a[q + 8] = m02 * sz; a[q + 9] = m12 * sz; a[q + 10] = m22 * sz; a[q + 11] = 0;
        a[q + 12] = m00 * cx + m01 * cy + m02 * cz + m[o + 3]; a[q + 13] = m10 * cx + m11 * cy + m12 * cz + m[o + 7]; a[q + 14] = m20 * cx + m21 * cy + m22 * cz + m[o + 11]; a[q + 15] = 1;
        c[i * 3] = r; c[i * 3 + 1] = g; c[i * 3 + 2] = b;
        return i;
      },
      end() {
        for (const sh in meshes) {
          const mesh = meshes[sh];
          mesh.count = n[sh];
          for (const [at, k] of [[mesh.instanceMatrix, 16], [mesh.instanceColor, 3]]) { at.clearUpdateRanges(); at.addUpdateRange(0, n[sh] * k); at.needsUpdate = true; }
        }
      },
    };
  }
  // 3x4 matrix helpers (rows; 12 numbers). M = translate(x,y,z) * rotateY(yaw) * scale(k): a figure standing at a place, turned and sized.
  function place(out, x, y, z, yaw, k, ky) {
    const c = Math.cos(yaw) * k, s = Math.sin(yaw) * k;
    out[0] = c; out[1] = 0; out[2] = s; out[3] = x; out[4] = 0; out[5] = ky === undefined ? k : ky; out[6] = 0; out[7] = y; out[8] = -s; out[9] = 0; out[10] = c; out[11] = z;
    return out;
  }
  // out = a * b (both 3x4, offsets ao / bo / oo)
  function mul(out, oo, a, ao, b, bo) {
    for (let r = 0; r < 3; r++) {
      const a0 = a[ao + r * 4], a1 = a[ao + r * 4 + 1], a2 = a[ao + r * 4 + 2], a3 = a[ao + r * 4 + 3];
      out[oo + r * 4] = a0 * b[bo] + a1 * b[bo + 4] + a2 * b[bo + 8];
      out[oo + r * 4 + 1] = a0 * b[bo + 1] + a1 * b[bo + 5] + a2 * b[bo + 9];
      out[oo + r * 4 + 2] = a0 * b[bo + 2] + a1 * b[bo + 6] + a2 * b[bo + 10];
      out[oo + r * 4 + 3] = a0 * b[bo + 3] + a1 * b[bo + 7] + a2 * b[bo + 11] + a3;
    }
    return out;
  }
  // Put every part of a compiled rig (posed in `mats`, standing at `base`) into a batch. tint multiplies the colours.
  const scratch = new Float32Array(12);
  function pushRig(batch, rig, mats, base, tint, pal) {
    for (let i = 0; i < rig.n; i++) {
      const p = rig.parts[i], c = pal ? pal[i] : p.lin;
      mul(scratch, 0, base, 0, mats, i * 12);
      batch.push(p.shape, scratch, 0, p.centre[0], p.centre[1], p.centre[2], p.size[0], p.size[1], p.size[2], c[0] * tint, c[1] * tint, c[2] * tint);
    }
  }

  /* A ribbon lying on the ground along a line of points [x, z]: `half` wide each side, lifted `lift` above the land.
     Returns a geometry whose index can be cut with setDrawRange (6 indices per segment). */
  function ribbon(pts, half, heightAt, lift = 0.25, uvScale = 1) {
    const n = pts.length, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
    let len = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], p = pts[i];
      let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      if (i) len += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      for (let s = 0; s < 2; s++) {
        const k = s ? -half : half, x = p[0] - tz * k, z = p[1] + tx * k, o = (i * 2 + s) * 3;
        pos[o] = x; pos[o + 1] = heightAt(x, z) + lift; pos[o + 2] = z;
        uv[(i * 2 + s) * 2] = len * uvScale; uv[(i * 2 + s) * 2 + 1] = s;
      }
      if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // A soft round dot for particles and glows.
  function dotTexture(size = 64, hard = 0.15) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(hard, 'rgba(255,255,255,.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,.38)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    return t;
  }
  /* Soft particles with their own size (world units), colour and opacity: steam, dust, smoke, snow, lights.
     set(i, x, y, z, size, r, g, b, a) each frame, then commit(n). */
  function Puffs(cap, opts = {}) {
    const pos = new Float32Array(cap * 3), size = new Float32Array(cap), rgba = new Float32Array(cap * 4);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3).setUsage(T.DynamicDrawUsage));
    g.setAttribute('aSize', new T.BufferAttribute(size, 1).setUsage(T.DynamicDrawUsage));
    g.setAttribute('aColor', new T.BufferAttribute(rgba, 4).setUsage(T.DynamicDrawUsage));
    const mat = new T.ShaderMaterial({
      uniforms: { uMap: { value: opts.map || dotTexture() }, uK: { value: 500 }, uMax: { value: opts.maxPx || 220 }, uLight: { value: new T.Color(1, 1, 1) } },
      vertexShader: 'attribute float aSize; attribute vec4 aColor; varying vec4 vColor; uniform float uK; uniform float uMax;\nvoid main(){ vColor = aColor; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(uMax, aSize * uK / max(0.001, -mv.z)); }',
      fragmentShader: 'uniform sampler2D uMap; uniform vec3 uLight; varying vec4 vColor;\nvoid main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vColor.rgb * uLight, vColor.a * t.a);\n#include <colorspace_fragment>\n}',
      transparent: true, depthWrite: false, blending: opts.additive ? T.AdditiveBlending : T.NormalBlending,
    });
    const points = new T.Points(g, mat);
    points.frustumCulled = false; points.renderOrder = opts.order || 5;
    g.setDrawRange(0, 0);
    return {
      points, cap, mat,
      set(i, x, y, z, s, r, gg, b, a) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; size[i] = s; rgba[i * 4] = r; rgba[i * 4 + 1] = gg; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a; },
      commit(n) { g.setDrawRange(0, n); for (const k of ['position', 'aSize', 'aColor']) g.attributes[k].needsUpdate = true; },
    };
  }
  global.S3 = { T, SHAPES, col, lin, rng, unitGeometries, Batch, place, mul, pushRig, ribbon, dotTexture, Puffs };
})(window);
