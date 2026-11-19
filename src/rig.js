/* Figures as small rigs of primitive parts (the design in assets/3d-design/design.json).
   A rig is a tree of joints; every part is a box, sphere, capsule or cone hanging from its joint.
   A clip moves joints with sine channels: value = offset + amplitude * sin(2*PI*(harmonic*t + phase)),
   t = 0..1 through one cycle. Rotations are degrees (Euler XYZ) added to the joint's rest rotation;
   positions are added to where the joint sits on its parent.
   Axes of a figure: +Y up, it faces +Z, +X is its left. Positive rx tips the top of a part forward.
   pose() fills a Float32Array with one 3x4 matrix per joint, in figure space. DOM-free (tested in Node). */
(function (global) {
  'use strict';
  const RAD = Math.PI / 180, TAU = Math.PI * 2;
  const CH = ['rx', 'ry', 'rz', 'px', 'py', 'pz'];
  const SHAPES = ['box', 'sphere', 'capsule', 'cone'];
  const hex = (c) => { const n = parseInt(String(c).replace('#', ''), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const v3 = (a, d = 0) => [0, 1, 2].map((i) => (a && isFinite(a[i]) ? +a[i] : d));
  const chan = (c) => (Array.isArray(c) ? [+c[0] || 0, +c[1] || 0, +c[2] || 0, c[3] === undefined ? 1 : +c[3]] : null);
  const channels = (o) => (o ? CH.map((k) => chan(o[k])) : null);

  // Check and index a rig from the design. Throws on a broken one (unknown parent, child before parent, bad shape).
  function compile(spec, name = 'rig') {
    const ids = new Map(), parts = [];
    for (const p of spec.parts || []) {
      if (!SHAPES.includes(p.shape)) throw new Error(name + ': unknown shape ' + p.shape + ' in ' + p.id);
      const parent = p.parent == null ? -1 : ids.get(p.parent);
      if (parent === undefined) throw new Error(name + ': part ' + p.id + ' comes before its parent ' + p.parent);
      ids.set(p.id, parts.length);
      parts.push({ id: p.id, parent, shape: p.shape, size: v3(p.size, 1), at: v3(p.at), centre: v3(p.centre), rot: v3(p.rot), color: hex(p.color), key: p.color });
    }
    if (!parts.length) throw new Error(name + ': no parts');
    const clips = {};
    for (const [cn, c] of Object.entries(spec.clips || {})) {
      const per = new Array(parts.length).fill(null);
      for (const [id, o] of Object.entries(c.parts || {})) { const i = ids.get(id); if (i !== undefined) per[i] = channels(o); }
      clips[cn] = { period: +c.period || 1, root: channels(c.root), parts: per };
    }
    const attach = {};
    for (const [k, p] of Object.entries(spec.attach || {})) attach[k] = v3(p);
    return { name, parts, clips, height: +spec.height || 1, stride: +spec.stride || 0, attach, n: parts.length };
  }
  const val = (c, t) => (c ? c[0] + c[1] * Math.sin(TAU * (c[3] * t + c[2])) : 0);
  // Channel values of one joint for a clip (or two blended clips) at cycle time t.
  const tmp = new Float64Array(6);
  function sampleInto(chA, tA, chB, tB, w) {
    for (let k = 0; k < 6; k++) {
      let v = chA ? val(chA[k], tA) : 0;
      if (w > 0) v += ((chB ? val(chB[k], tB) : 0) - v) * w;
      tmp[k] = v;
    }
  }
  // out[i*12 .. i*12+11] = rows of the 3x4 matrix of joint i. clipB / tB / w blend a second clip in (w = 0..1).
  function pose(rig, clipA, tA, out, clipB, tB, w = 0) {
    const A = rig.clips[clipA] || null, B = w > 0 ? rig.clips[clipB] || null : null;
    if (!B) w = 0;
    for (let i = 0; i < rig.n; i++) {
      const p = rig.parts[i], o = i * 12;
      sampleInto(A && A.parts[i], tA, B && B.parts[i], tB, w);
      let rx = p.rot[0] + tmp[0], ry = p.rot[1] + tmp[1], rz = p.rot[2] + tmp[2], px = p.at[0] + tmp[3], py = p.at[1] + tmp[4], pz = p.at[2] + tmp[5];
      if (p.parent < 0) { // the root also carries the clip's whole-body movement
        sampleInto(A && A.root, tA, B && B.root, tB, w);
        rx += tmp[0]; ry += tmp[1]; rz += tmp[2]; px += tmp[3]; py += tmp[4]; pz += tmp[5];
      }
      const a = Math.cos(rx * RAD), b = Math.sin(rx * RAD), c = Math.cos(ry * RAD), d = Math.sin(ry * RAD), e = Math.cos(rz * RAD), f = Math.sin(rz * RAD);
      const m00 = c * e, m01 = -c * f, m02 = d, m10 = a * f + b * e * d, m11 = a * e - b * f * d, m12 = -b * c, m20 = b * f - a * e * d, m21 = b * e + a * f * d, m22 = a * c;
      if (p.parent < 0) {
        out[o] = m00; out[o + 1] = m01; out[o + 2] = m02; out[o + 3] = px; out[o + 4] = m10; out[o + 5] = m11; out[o + 6] = m12; out[o + 7] = py; out[o + 8] = m20; out[o + 9] = m21; out[o + 10] = m22; out[o + 11] = pz;
      } else {
        const q = p.parent * 12, p00 = out[q], p01 = out[q + 1], p02 = out[q + 2], p03 = out[q + 3], p10 = out[q + 4], p11 = out[q + 5], p12 = out[q + 6], p13 = out[q + 7], p20 = out[q + 8], p21 = out[q + 9], p22 = out[q + 10], p23 = out[q + 11];
        out[o] = p00 * m00 + p01 * m10 + p02 * m20; out[o + 1] = p00 * m01 + p01 * m11 + p02 * m21; out[o + 2] = p00 * m02 + p01 * m12 + p02 * m22; out[o + 3] = p00 * px + p01 * py + p02 * pz + p03;
        out[o + 4] = p10 * m00 + p11 * m10 + p12 * m20; out[o + 5] = p10 * m01 + p11 * m11 + p12 * m21; out[o + 6] = p10 * m02 + p11 * m12 + p12 * m22; out[o + 7] = p10 * px + p11 * py + p12 * pz + p13;
        out[o + 8] = p20 * m00 + p21 * m10 + p22 * m20; out[o + 9] = p20 * m01 + p21 * m11 + p22 * m21; out[o + 10] = p20 * m02 + p21 * m12 + p22 * m22; out[o + 11] = p20 * px + p21 * py + p22 * pz + p23;
      }
    }
    return out;
  }
  // The lowest and highest points of a posed rig (boxes by their corners, round parts by their extent along Y).
  function extent(rig, mats) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < rig.n; i++) {
      const p = rig.parts[i], o = i * 12, cy = mats[o + 4] * p.centre[0] + mats[o + 5] * p.centre[1] + mats[o + 6] * p.centre[2] + mats[o + 7];
      const ext = p.shape === 'box' ? (Math.abs(mats[o + 4]) * p.size[0] + Math.abs(mats[o + 5]) * p.size[1] + Math.abs(mats[o + 6]) * p.size[2]) / 2 : Math.hypot(mats[o + 4] * p.size[0], mats[o + 5] * p.size[1], mats[o + 6] * p.size[2]) / 2;
      lo = Math.min(lo, cy - ext); hi = Math.max(hi, cy + ext);
    }
    return { lo, hi };
  }
  global.Rig = { compile, pose, extent, SHAPES };
})(typeof window !== 'undefined' ? window : globalThis);
