/* The 3D camera's maths, shared by the WebGL stage and the SVG overlay. DOM-free (tested in Node).
   The app keeps a flat view { x, y, s }: the world point the camera looks at and the scale there in
   screen pixels per world unit. From it comes a tilted perspective camera: it stands south of that
   point and looks north and down (or, turned by `yaw` radians, from another side). Zoomed out it looks down steeply (the whole island fits); zoomed in
   it sinks towards the horizon so the Walls and Titans stand up.
   Scene axes: X = world x (east), Y = up, Z = world y (south). */
(function (global) {
  'use strict';
  const RAD = Math.PI / 180;
  const cfg = { fov: 30, pitchFar: 58, pitchNear: 34, sFar: 0.7, sNear: 4.2, bird: 0, pitchBird: 88 }; // bird: 0..1, how far the camera has swung up to look straight down like a map
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Camera pitch (radians below the horizon) for a scale: eased between the far and the near pitch, evenly per zoom step.
  function pitch(s) {
    const f = clamp(Math.log(s / cfg.sFar) / Math.log(cfg.sNear / cfg.sFar), 0, 1), e = f * f * (3 - 2 * f);
    const p = cfg.pitchFar + (cfg.pitchNear - cfg.pitchFar) * e;
    return (p + (cfg.pitchBird - p) * clamp(cfg.bird, 0, 1)) * RAD;
  }
  // Everything needed to project with a view: where the camera is and how it is turned.
  // yaw turns the camera round that point: 0 looks north, a positive yaw turns the picture clockwise.
  function pose(view, vw, vh, yaw = 0) {
    const ph = pitch(view.s), k = vh / (2 * Math.tan((cfg.fov / 2) * RAD)), d = k / view.s, sin = Math.sin(ph), cos = Math.cos(ph), cy = Math.cos(yaw), sy = Math.sin(yaw);
    return { x: view.x, y: view.y, s: view.s, vw, vh, pitch: ph, sin, cos, k, d, yaw, cy, sy, cam: [view.x + d * cos * sy, d * sin, view.y + d * cos * cy], fov: cfg.fov, bird: cfg.bird };
  }
  // World point (x, y, height h) -> [screen x, screen y, pixels per world unit at that depth]. The third value is <= 0 behind the camera.
  function project(P, x, y, h = 0, out = [0, 0, 0]) {
    const ex = x - P.x, ez = y - P.y, dx = ex * P.cy - ez * P.sy, dz = ex * P.sy + ez * P.cy; // across the screen, and towards the camera
    const depth = P.d - h * P.sin - dz * P.cos; // along the view direction
    if (depth <= 1e-6) { out[0] = out[1] = -1e5; out[2] = 0; return out; }
    const k = P.k / depth;
    out[0] = P.vw / 2 + dx * k;
    out[1] = P.vh / 2 - (h * P.cos - dz * P.sin) * k;
    out[2] = k;
    return out;
  }
  // Screen point -> the world point on the plane of height h under it (null when the ray never comes down to it).
  function ground(P, px, py, h = 0) {
    const a = (px - P.vw / 2) / P.k, b = -(py - P.vh / 2) / P.k;
    const dy = b * P.cos - P.sin; // the ray's vertical direction
    if (dy >= -1e-6) return null;
    const t = (P.cam[1] - h) / -dy, u = t * a, v = P.d * P.cos + t * (-b * P.sin - P.cos);
    return [P.x + u * P.cy + v * P.sy, P.y - u * P.sy + v * P.cy];
  }
  // The four corners of the ground that is on screen (top left, top right, bottom right, bottom left).
  function corners(P) {
    return [[0, 0], [P.vw, 0], [P.vw, P.vh], [0, P.vh]].map(([x, y]) => ground(P, x, y) || [P.x, P.y]);
  }
  // Move the view so that world point w lies under screen point (px, py). Exact: the camera only slides.
  function hold(view, vw, vh, w, px, py, yaw = 0) {
    const g = ground(pose(view, vw, vh, yaw), px, py);
    return g ? { x: view.x + w[0] - g[0], y: view.y + w[1] - g[1], s: view.s } : view;
  }
  // The scale at which a world box, looked at in its middle, fits the viewport with `pad` pixels to spare.
  // The near edge is drawn larger than the far one, so the corners are projected and the scale corrected a few times.
  function fit(box, vw, vh, pad = 0) {
    const w = Math.max(1, box.x1 - box.x0), h = Math.max(1, box.y1 - box.y0), cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2, q = [0, 0, 0];
    let s = Math.min((vw - pad * 2) / w, (vh - pad * 2) / h);
    for (let i = 0; i < 5; i++) {
      const P = pose({ x: cx, y: cy, s }, vw, vh);
      let over = 0;
      for (const [x, y] of [[box.x0, box.y0], [box.x1, box.y0], [box.x1, box.y1], [box.x0, box.y1]]) {
        project(P, x, y, 0, q);
        over = Math.max(over, Math.abs(q[0] - vw / 2) / (vw / 2 - pad), Math.abs(q[1] - vh / 2) / (vh / 2 - pad));
      }
      s /= Math.max(0.2, over);
    }
    return s * 0.985;
  }
  // The flat (2D) stage uses the same calls with a camera straight overhead.
  const flat = {
    pose: (view, vw, vh) => ({ x: view.x, y: view.y, s: view.s, vw, vh, flat: true }),
    project: (P, x, y, h, out = [0, 0, 0]) => { out[0] = (x - P.x) * P.s + P.vw / 2; out[1] = (y - P.y) * P.s + P.vh / 2; out[2] = P.s; return out; },
    ground: (P, px, py) => [(px - P.vw / 2) / P.s + P.x, (py - P.vh / 2) / P.s + P.y],
    corners: (P) => [[0, 0], [P.vw, 0], [P.vw, P.vh], [0, P.vh]].map(([x, y]) => flat.ground(P, x, y)),
    hold: (view, vw, vh, w, px, py) => ({ x: w[0] - (px - vw / 2) / view.s, y: w[1] - (py - vh / 2) / view.s, s: view.s }),
    fit: (box, vw, vh, pad = 0) => Math.min((vw - pad * 2) / Math.max(1, box.x1 - box.x0), (vh - pad * 2) / Math.max(1, box.y1 - box.y0)),
  };
  global.View3D = { cfg, pitch, pose, project, ground, corners, hold, fit, flat };
})(typeof window !== 'undefined' ? window : globalThis);
