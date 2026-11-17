/* Paints the base map (land, sea, terrain, rivers, towns) onto a canvas at a chosen resolution.
   The Walls are not painted here: the stage draws them live so they can break and collapse.
   Style: an illustrated atlas map - parchment edges, blue sea with a pale coastal glow, bright
   plains, dark forest tufts, grey peaks with snow in the north. Browser only (Canvas 2D). */
(function (global) {
  'use strict';
  const PAL = {
    paper: '#c9a56a', paperLo: '#b38d52', paperHi: '#dcc089', sea: '#3d6f85', glow: '#cfeeee', land: '#b3c655', coast: '#efe3ad',
    cell: { plain: '#bccf5a', forest: '#6b8f3c', hill: '#a8a759', mountain: '#948f6e', snow: '#e9eded', sand: '#e4cf82' },
    river: '#c4e6ec', riverEdge: '#5f93a3',
  };
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

  function coastPath(ctx, coast) {
    const n = coast.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    ctx.beginPath();
    const m0 = mid(coast[n - 1], coast[0]);
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const m = mid(coast[i], coast[(i + 1) % n]); ctx.quadraticCurveTo(coast[i][0], coast[i][1], m[0], m[1]); }
    ctx.closePath();
  }
  // A small pre-drawn picture (in world units, anchor at 0,0) that is stamped many times.
  function stamp(ppu, x0, y0, x1, y1, draw) {
    const k = ppu * 1.7, c = mk((x1 - x0) * k, (y1 - y0) * k), g = c.getContext('2d');
    g.scale(k, k); g.translate(-x0, -y0); draw(g);
    return { c, x0, y0, w: x1 - x0, h: y1 - y0 };
  }
  const put = (ctx, st, x, y, s) => ctx.drawImage(st.c, x + st.x0 * s, y + st.y0 * s, st.w * s, st.h * s);
  const poly = (g, pts, fill) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = fill; g.fill(); };
  const ell = (g, x, y, rx, ry, fill) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); };

  function stamps(ppu) {
    const shadow = 'rgba(24,44,26,.30)';
    const tree = stamp(ppu, -4, -9, 4, 1.4, (g) => {
      ell(g, 0.5, 0, 3.1, 1.05, shadow);
      g.fillStyle = '#5a482b'; g.fillRect(-0.4, -2.4, 0.8, 2.4);
      ell(g, 0.2, -4.4, 3.0, 2.9, '#3c6a31'); ell(g, -0.7, -5.0, 2.2, 2.1, '#588a3b'); ell(g, -1.3, -5.7, 1.15, 1.05, '#8ab254');
    });
    const conifer = stamp(ppu, -3.6, -9.6, 3.6, 1.4, (g) => {
      ell(g, 0.5, 0, 2.7, 0.95, shadow);
      g.fillStyle = '#51402a'; g.fillRect(-0.35, -1.8, 0.7, 1.8);
      poly(g, [[0, -9.2], [2.9, -1.5], [-2.9, -1.5]], '#2c5837'); poly(g, [[0, -9.2], [0, -1.5], [-2.9, -1.5]], '#467a45'); poly(g, [[0, -9.2], [-0.9, -6.2], [-1.9, -6.4]], '#79a45a');
    });
    const giant = stamp(ppu, -5.2, -13.4, 5.2, 1.6, (g) => {
      ell(g, 0.7, 0, 4.1, 1.3, 'rgba(20,38,22,.36)');
      g.fillStyle = '#5f4a2e'; g.fillRect(-0.75, -6, 1.5, 6); g.fillStyle = '#7b6240'; g.fillRect(-0.75, -6, 0.6, 6);
      ell(g, 0.3, -8.3, 4.3, 4.0, '#2f5f2f'); ell(g, -0.9, -9.2, 3.1, 2.9, '#4b8038'); ell(g, -1.8, -10.3, 1.6, 1.4, '#7dab4f');
    });
    const hill = stamp(ppu, -8, -7.2, 8.6, 1.2, (g) => {
      ell(g, 1.2, 0, 7.2, 1.1, 'rgba(40,50,24,.22)');
      const gr = g.createLinearGradient(-7, -6, 7, 0); gr.addColorStop(0, '#c3c477'); gr.addColorStop(0.55, '#a3a559'); gr.addColorStop(1, '#7f8447');
      g.beginPath(); g.moveTo(-7, 0); g.bezierCurveTo(-5.4, -5.6, -1.8, -6.8, 0.6, -6.2); g.bezierCurveTo(3.4, -5.4, 5.8, -2.8, 7, 0); g.closePath(); g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(70,78,40,.45)'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(-2.4, -3.2); g.quadraticCurveTo(-0.6, -4.6, 1.2, -3.6); g.stroke();
    });
    const peak = (snow) => stamp(ppu, -12.5, -17, 13, 1.8, (g) => {
      ell(g, 1.6, 0, 11.6, 1.6, 'rgba(36,40,30,.26)');
      const P = [-1, -16], L = [-11, 0], Rr = [11, 0], M = [2, 0], Q = [0.5, -7];
      poly(g, [L, P, Q, M], snow ? '#b9b596' : '#b4ac88'); poly(g, [P, Rr, M, Q], snow ? '#787461' : '#77705b');
      poly(g, [[-7.4, -5.8], [-5.2, -4.2], [-6.2, 0], [-9.4, 0]], 'rgba(255,255,255,.10)');
      if (snow) {
        poly(g, [P, [-6.25, -7.6], [-4.2, -9.0], [-2.6, -7.4], [0.2, -8.8]], '#f6f8f8');
        poly(g, [P, [0.2, -8.8], [2.4, -7.4], [3.9, -8.9], [5.45, -7.4]], '#bcc6ce');
      }
      g.strokeStyle = 'rgba(52,48,38,.55)'; g.lineWidth = 0.32; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(L[0], L[1]); g.lineTo(P[0], P[1]); g.lineTo(Rr[0], Rr[1]); g.moveTo(P[0], P[1]); g.lineTo(Q[0], Q[1]); g.lineTo(M[0], M[1]); g.stroke();
    });
    return { tree, conifer, giant, hill, peak: peak(false), snowPeak: peak(true) };
  }

  function icon(g, kind, pl) {
    const wallc = '#d9d1ba', roof = '#8c5038', dark = 'rgba(45,38,30,.75)';
    g.lineWidth = 0.35; g.strokeStyle = dark; g.lineJoin = 'round';
    const box = (x, y, w, h, f) => { g.fillStyle = f; g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h); };
    const tri = (pts, f) => { poly(g, pts, f); g.stroke(); };
    if (kind === 'capital') {
      ell(g, 0, 0.6, 9, 2, 'rgba(30,40,24,.3)');
      box(-6, -5.5, 12, 5.5, wallc); box(-7.6, -8.5, 3.2, 8.5, '#cfc7ae'); box(4.4, -8.5, 3.2, 8.5, '#cfc7ae'); box(-1.8, -11.5, 3.6, 11.5, '#e3dcc6');
      tri([[-8.2, -8.5], [-6, -11.8], [-3.8, -8.5]], roof); tri([[3.8, -8.5], [6, -11.8], [8.2, -8.5]], roof); tri([[-2.6, -11.5], [0, -15.5], [2.6, -11.5]], roof);
      g.fillStyle = '#5a4634'; g.fillRect(-1, -3.2, 2, 3.2);
    } else if (kind === 'village') {
      ell(g, 0, 0.5, 6.5, 1.5, 'rgba(30,40,24,.26)');
      for (const [x, s] of [[-4, 1], [0.2, 1.25], [4, 0.9]]) { box(x - 1.5 * s, -2.4 * s, 3 * s, 2.4 * s, wallc); tri([[x - 2 * s, -2.4 * s], [x, -4.4 * s], [x + 2 * s, -2.4 * s]], roof); }
    } else if (kind === 'ruin') {
      ell(g, 0, 0.5, 5.5, 1.4, 'rgba(30,40,24,.28)');
      g.fillStyle = '#aaa593'; g.beginPath(); g.moveTo(-3.6, 0); g.lineTo(-3.6, -6.2); g.lineTo(-2.2, -5); g.lineTo(-1, -7.6); g.lineTo(0.4, -5.6); g.lineTo(1.6, -8.4); g.lineTo(3.2, -4.6); g.lineTo(3.2, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#6f6a5c'; g.fillRect(-0.8, -2.8, 1.6, 2.8);
    } else if (kind === 'chapel') {
      ell(g, 0, 0.5, 5.5, 1.4, 'rgba(30,40,24,.28)');
      box(-3.4, -4, 6.8, 4, wallc); tri([[-4, -4], [0, -7.6], [4, -4]], '#6d6f78'); box(-0.7, -10.4, 1.4, 3.4, '#e3dcc6'); tri([[-1.2, -10.4], [0, -12.6], [1.2, -10.4]], '#6d6f78');
    } else if (kind === 'harbor') {
      g.strokeStyle = '#6d5335'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-2, -1.5); g.lineTo(-2, 9); g.moveTo(3.5, -1); g.lineTo(3.5, 7); g.stroke();
      g.strokeStyle = dark; g.lineWidth = 0.35;
      for (const x of [-6.5, 0.6]) { box(x, -5.2, 5, 3.6, wallc); tri([[x - 0.6, -5.2], [x + 2.5, -7.6], [x + 5.6, -5.2]], roof); }
      for (const [x, y] of [[-7.5, 8], [8, 6.5]]) { poly(g, [[x - 3, y], [x + 3, y], [x + 2, y + 1.6], [x - 2, y + 1.6]], '#7a5a3c'); g.stroke(); poly(g, [[x, y - 4.4], [x + 2.4, y - 0.6], [x, y - 0.6]], '#efe7d2'); g.stroke(); }
    } else if (kind === 'town') {
      // a new town: more houses, and a chimney for the new industry
      ell(g, 0, 0.6, 9.5, 2, 'rgba(30,40,24,.28)');
      for (const [x, k, rf] of [[-6.2, 0.95, roof], [-2.6, 1.3, '#5f6f7c'], [1.6, 1.05, roof], [5.2, 1.2, roof]]) { box(x - 1.5 * k, -2.4 * k, 3 * k, 2.4 * k, wallc); tri([[x - 2 * k, -2.4 * k], [x, -4.4 * k], [x + 2 * k, -2.4 * k]], rf); }
      box(7.6, -7, 1.2, 7, '#9a8f84');
      g.fillStyle = 'rgba(244,244,238,.8)'; g.beginPath(); g.arc(8.6, -8.4, 1.3, 0, 6.3); g.arc(10, -9.9, 1, 0, 6.3); g.fill();
    } else if (kind === 'port') {
      // warehouses and a crane on the shore, a pier and a steamer towards the sea (pl.sea points out to sea)
      const sx = pl && pl.sea ? pl.sea[0] : 0, sy = pl && pl.sea ? pl.sea[1] : 1;
      g.strokeStyle = '#6d5335'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx * 1.5, sy * 1.5); g.lineTo(sx * 11, sy * 11); g.stroke();
      g.strokeStyle = dark; g.lineWidth = 0.35;
      const bx = -sx * 5, by = -sy * 5;
      for (const dx of [-3.4, 2.2]) { box(bx + dx - 2.4, by - 3.4, 4.8, 3.4, wallc); tri([[bx + dx - 3, by - 3.4], [bx + dx, by - 5.8], [bx + dx + 3, by - 3.4]], '#5f6f7c'); }
      g.strokeStyle = '#3d3a36'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(sx * 3, sy * 3); g.lineTo(sx * 3, sy * 3 - 6); g.lineTo(sx * 3 + 3.6, sy * 3 - 4.6); g.stroke();
      g.strokeStyle = dark; g.lineWidth = 0.35;
      const hx = sx * 13.5, hy = sy * 13.5;
      poly(g, [[hx - 3.6, hy - 0.6], [hx + 3.6, hy - 0.6], [hx + 2.5, hy + 1.3], [hx - 2.5, hy + 1.3]], '#4d5b66'); g.stroke();
      box(hx - 1.2, hy - 2.3, 2.2, 1.7, '#e3dcc6'); box(hx + 0.1, hy - 3.6, 0.8, 1.3, roof);
    } else if (kind === 'seawall') {
      ell(g, 0, 1.2, 21, 1.6, 'rgba(30,40,24,.26)');
      const gr = g.createLinearGradient(0, -5, 0, 0); gr.addColorStop(0, '#e6dfc9'); gr.addColorStop(1, '#a9a28c');
      g.fillStyle = gr; g.fillRect(-20, -4.6, 40, 4.6); g.strokeRect(-20, -4.6, 40, 4.6);
      g.beginPath(); for (let x = -16; x <= 16; x += 4) { g.moveTo(x, -4.6); g.lineTo(x, 0); } g.strokeStyle = 'rgba(60,52,40,.3)'; g.stroke();
    }
  }

  function paint(ppu, terrain, World) {
    const { W, H, C, R, coast, DISTRICTS } = World, r = rng(9911);
    const cv = mk(W * ppu, H * ppu), ctx = cv.getContext('2d');
    ctx.scale(ppu, ppu);
    // Parchment
    ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 150; i++) {
      const rr = 60 + r() * 150, x = rr + r() * (W - rr * 2), y = rr + r() * (H - rr * 2), g = ctx.createRadialGradient(x, y, 0, x, y, rr), hi = r() < 0.5;
      g.addColorStop(0, hi ? 'rgba(232,206,150,.16)' : 'rgba(150,112,58,.13)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    // Sea: soft blue body around the island, then the pale glow along the coast
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    coastPath(ctx, coast);
    // (the shape is drawn far off-canvas; only its blurred shadow lands on the map)
    ctx.save(); const off = W * ppu * 3; ctx.shadowColor = PAL.sea; ctx.shadowOffsetX = off; ctx.translate(-off / ppu, 0); coastPath(ctx, coast); ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
    for (const [w, blur] of [[120, 46], [84, 34], [44, 20]]) { ctx.shadowBlur = blur * ppu; ctx.lineWidth = w; ctx.stroke(); }
    ctx.restore(); coastPath(ctx, coast);
    for (const [w, a] of [[30, 0.2], [19, 0.28], [10, 0.45], [4.5, 0.7]]) { ctx.strokeStyle = PAL.glow; ctx.globalAlpha = a; ctx.lineWidth = w; ctx.stroke(); }
    ctx.globalAlpha = 1;
    // Land
    ctx.fillStyle = PAL.land; ctx.fill();
    ctx.save(); coastPath(ctx, coast); ctx.clip();
    {
      // one pixel per terrain cell, scaled up smoothly: a soft blend with no visible grid
      const gw = terrain.cols, gh = terrain.rows, small = mk(gw, gh), sg = small.getContext('2d'), img = sg.createImageData(gw, gh), d = img.data;
      const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
      const cols = Object.fromEntries(Object.entries(PAL.cell).map(([k, v]) => [k, rgb(v)]));
      for (const c of terrain.cells) { const o = (c.j * gw + c.i) * 4, col = cols[c.c] || cols.plain, v = 0.94 + r() * 0.12; d[o] = col[0] * v; d[o + 1] = col[1] * v; d[o + 2] = col[2] * v; d[o + 3] = 255; }
      for (let pass = 0; pass < 3; pass++) { // spread land colours into the sea cells so the coast keeps its colour
        const src = new Uint8ClampedArray(d);
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { const o = (y * gw + x) * 4; if (src[o + 3]) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue; const q = (yy * gw + xx) * 4; if (src[q + 3]) { d[o] = src[q]; d[o + 1] = src[q + 1]; d[o + 2] = src[q + 2]; d[o + 3] = 255; break; } } }
      }
      sg.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(small, terrain.origin[0], terrain.origin[1], gw * terrain.cell, gh * terrain.cell);
      // painterly speckle
      for (let i = 0; i < 5200; i++) { const x = r() * W, y = r() * H, light = r() < 0.5; ctx.globalAlpha = 0.05 + r() * 0.05; ctx.fillStyle = light ? '#f3f7c0' : '#3e5a22'; ctx.beginPath(); ctx.ellipse(x, y, 1 + r() * 2.6, 0.7 + r() * 1.6, r() * 3, 0, 6.3); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    // Farmland inside Wall Rose: small field patches where people live
    for (let i = 0; i < 520; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (R.rose - 8), x = C[0] + Math.cos(a) * d, y = C[1] + Math.sin(a) * d;
      ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 1.2);
      ctx.globalAlpha = 0.2 + r() * 0.16; ctx.fillStyle = ['#d3dd74', '#a5c048', '#dccf78', '#c0d262'][Math.floor(r() * 4)];
      ctx.fillRect(-3.5, -2.2, 5 + r() * 4, 3 + r() * 2.4); ctx.restore();
    }
    ctx.globalAlpha = 1;
    // Rivers and the lake
    const riverPaths = terrain.rivers.map((rv) => ({ w: rv.w, p: new Path2D(RouteGeo.build(rv.pts, 1).d) }));
    for (const rv of riverPaths) { ctx.strokeStyle = PAL.riverEdge; ctx.globalAlpha = 0.75; ctx.lineWidth = rv.w + 1.1; ctx.stroke(rv.p); }
    ctx.globalAlpha = 1;
    for (const rv of riverPaths) { ctx.strokeStyle = PAL.river; ctx.lineWidth = rv.w; ctx.stroke(rv.p); }
    const lk = terrain.lake; ell(ctx, lk.c[0], lk.c[1], lk.rx + 0.7, lk.ry + 0.7, PAL.riverEdge); ell(ctx, lk.c[0], lk.c[1], lk.rx, lk.ry, PAL.river); ell(ctx, lk.c[0] - 4, lk.c[1] - 3, lk.rx * 0.45, lk.ry * 0.35, 'rgba(255,255,255,.35)');
    // District towns: pale paving with little roofs
    for (const d of DISTRICTS) {
      const a = (d.deg * Math.PI) / 180;
      ctx.beginPath(); ctx.arc(d.base[0], d.base[1], d.r, a - Math.PI / 2, a + Math.PI / 2); ctx.closePath(); ctx.fillStyle = '#d3c9a4'; ctx.fill();
      for (let i = 0; i < 26; i++) {
        const t = a + (r() - 0.5) * Math.PI * 0.92, dd = 2.5 + r() * (d.r - 5), x = d.base[0] + Math.cos(t) * dd, y = d.base[1] + Math.sin(t) * dd;
        ctx.fillStyle = r() < 0.5 ? '#9c6a4a' : '#b98a5e'; ctx.fillRect(x - 1.1, y - 0.9, 2.2, 1.8);
      }
    }
    // Trees, hills and peaks, back to front
    const st = stamps(ppu), items = [];
    for (const t of terrain.trees) items.push([t.y, t.g ? st.giant : t.k ? st.conifer : st.tree, t.x, t.s]);
    for (const h of terrain.hills) items.push([h.y, st.hill, h.x, h.s]);
    for (const p of terrain.peaks) items.push([p.y, p.snow ? st.snowPeak : st.peak, p.x, p.s]);
    items.sort((a, b) => a[0] - b[0]);
    for (const [y, s, x, k] of items) put(ctx, s, x, y, k);
    ctx.restore();
    // Coast line, then places (the harbour reaches into the sea)
    coastPath(ctx, coast); ctx.strokeStyle = PAL.coast; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = 'rgba(70,84,60,.5)'; ctx.lineWidth = 0.45; ctx.stroke();
    for (const pl of terrain.places) { if (pl.sinceT !== undefined) continue; ctx.save(); ctx.translate(pl.p[0], pl.p[1]); icon(ctx, pl.kind); ctx.restore(); } // places built later are drawn live by the stage
    return cv;
  }
  global.MapPainter = { paint, icon, PAL };
})(window);
