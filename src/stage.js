/* The stage: one canvas showing the painted map, the Walls (drawn live, so gates break and the
   Walls fall) and the crowd - Titans, civilians, riders, cannons, steam.
   Quality levels: 'high' (PC) and 'low' (phones) differ in map resolution, pixel ratio and sprite
   detail; the number of Titans is the same on both.
   Crowd behaviour added here in real time: figures face where they walk and step in time with the
   distance covered; civilians run when a Titan is close in the same territory; Titans lean towards
   nearby people; cannons fire when Titans come near; a killed Titan goes up in steam. */
(function (global) {
  'use strict';
  const QUALITY = {
    high: { mapPpu: 2.4, firstPpu: 0.7, dpr: 2, atlasUnit: 3, atlasQuality: 'high', logicEvery: 1, snow: 150, clouds: 8 },
    low: { mapPpu: 1.3, firstPpu: 0.5, dpr: 1.5, atlasUnit: 1.6, atlasQuality: 'low', logicEvery: 2, snow: 50, clouds: 5 }, // crowd logic at half rate on phones
  };
  // World size of the figures: world units per sprite design unit (a Titan is about 30 design units tall).
  const SIZE = { titan: 0.5, wallTitan: 0.62, civ: 0.6, rider: 0.6, cannon: 0.42, steam: 0.5, boat: 0.7 };
  const MIN_PX = { titan: 0.26, wallTitan: 0.3, civ: 0.42, rider: 0.42, cannon: 0.32, steam: 0.26, boat: 0.4 }; // smallest screen px per design unit
  const MAX_PX = 2.6;

  function create(canvas, World, terrain, pop, qualityName) {
    const Q = QUALITY[qualityName] || QUALITY.high, ctx = canvas.getContext('2d', { alpha: false });
    const { C, R, DISTRICTS } = World;
    let vw = 1, vh = 1, dpr = 1, base = null, basePpu = 1, atlas = null, spec = null;

    function resize(w, h) {
      dpr = Math.min(global.devicePixelRatio || 1, Q.dpr);
      vw = Math.max(1, Math.round(w)); vh = Math.max(1, Math.round(h));
      canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    }
    // Paint a quick low-resolution map first, then the full one a moment later.
    function paintMap(onDone) {
      base = global.MapPainter.paint(Q.firstPpu, terrain, World); basePpu = Q.firstPpu;
      setTimeout(() => { base = global.MapPainter.paint(Q.mapPpu, terrain, World); basePpu = Q.mapPpu; if (onDone) onDone(); }, 60);
    }
    function loadSprites() {
      if (!global.Puppets) return;
      try { atlas = global.Puppets.buildAtlas({ quality: Q.atlasQuality, unit: Q.atlasUnit }); spec = global.Puppets.SPEC.sprites; } catch (e) { atlas = null; if (global.console) console.warn('sprites unavailable', e); }
    }

    // ---- Crowd state that lives between frames ----
    const dyn = pop.agents.map(() => ({ has: false, x: 0, y: 0, face: 1, view: 'f', ph: 0, ox: 0, oy: 0, speed: 0 }));
    const cannonState = pop.cannons.map((c, i) => ({ next: 1 + (i % 5) * 0.37, start: -9 }));
    const items = [];
    let logicEvery = Q.logicEvery, frameNo = 0, accDt = 0, lastT = -1, titanClock = 0;
    const CELL = 40, grid = new Map(), civGrid = new Map();
    const key = (x, y) => ((x / CELL) | 0) * 4096 + ((y / CELL) | 0);
    const nearestIn = (g, x, y, maxD, skipRegion) => {
      let best = null, bd = maxD;
      const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
      for (let i = cx - 1; i <= cx + 1; i++) for (let j = cy - 1; j <= cy + 1; j++) {
        const list = g.get(i * 4096 + j); if (!list) continue;
        for (const o of list) { if (skipRegion && o.region !== skipRegion) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } }
      }
      return best ? { o: best, d: bd } : null;
    };
    const SPRITE = (a) => (a.kind === 'titan' ? (a.lying ? 'titanLying' : 'titan' + a.variant) : a.kind === 'civ' ? 'civ' + a.variant : a.kind);

    function crowdFrame(T, t, dt, o) {
      items.length = 0; grid.clear(); civGrid.clear();
      titanClock += dt * o.awake;
      const live = [];
      for (let i = 0; i < pop.agents.length; i++) {
        const a = pop.agents[i], d = dyn[i];
        if (T < a.t0 || T > a.t1) { d.has = false; continue; }
        const s = pop.stateAt(a, T, a.kind === 'titan' ? titanClock : t, o); // Titans stand still at night: their clock stops
        if (s.vis < 0.02) { d.has = false; continue; }
        const e = { a, d, s, x: s.x, y: s.y, region: pop.regionOfArea(s.area) };
        live.push(e);
        if (s.dying) continue;
        if (a.kind === 'titan' && !a.lying) { const k = key(s.x, s.y); (grid.get(k) || grid.set(k, []).get(k)).push(e); }
        else if (a.kind === 'civ') { const k = key(s.x, s.y); (civGrid.get(k) || civGrid.set(k, []).get(k)).push(e); }
      }
      const ease = Math.min(1, dt * 3.2);
      for (const e of live) {
        const { a, d, s } = e;
        let tx = 0, ty = 0, scared = false, reaching = false;
        if (!o.reduced && !s.dying) {
          if (a.kind === 'civ') { // run from a Titan in the same territory
            const n = nearestIn(grid, s.x, s.y, 30, e.region);
            if (n) { const k = ((30 - n.d) / 30) * 6 / (n.d || 1); tx = (s.x - n.o.x) * k; ty = (s.y - n.o.y) * k; scared = true; }
          } else if (a.kind === 'titan' && !a.lying && !s.moving && o.awake > 0.5) { // lean towards people, even through a Wall
            const n = nearestIn(civGrid, s.x, s.y, 38);
            if (n) { const k = Math.min(5, n.d * 0.5) / (n.d || 1); tx = (n.o.x - s.x) * k; ty = (n.o.y - s.y) * k; reaching = n.o.region !== e.region; }
          }
        }
        d.ox += (tx - d.ox) * ease; d.oy += (ty - d.oy) * ease;
        const x = s.x + d.ox, y = s.y + d.oy;
        let moved = 0;
        if (d.has) { const dx = x - d.x, dy = y - d.y; moved = Math.hypot(dx, dy); if (moved > 0.012) { if (Math.abs(dx) > 0.006) d.face = dx > 0 ? 1 : -1; d.view = dy < -Math.abs(dx) * 0.6 ? 'b' : 'f'; } }
        if (moved > 30) moved = 0; // a jump (scrubbing the timeline) is not a step
        d.x = x; d.y = y; d.has = true;
        d.speed += ((dt > 0 ? moved / dt : 0) - d.speed) * Math.min(1, dt * 6);
        const name = SPRITE(a), stride = ((spec && spec[name] && spec[name].stride) || 12) * (SIZE[a.kind] || 0.5);
        const walking = d.speed > 0.35 && !o.reduced;
        if (walking) d.ph += moved / stride;
        let anim = 'idle';
        if (a.kind === 'wallTitan' || a.kind === 'boat') anim = 'walk';
        else if (walking) anim = a.kind === 'civ' && (s.flee || scared) ? 'run' : 'walk';
        else if (reaching) anim = 'reach';
        items.push({ kind: a.kind, name, anim, view: d.view, face: d.face, x, y, ph: d.ph, alpha: s.vis, dying: s.dying, how: s.how, t0: a.phase, agent: a });
      }
      // Cannons: fire now and then while a Titan is within range and the Walls stand.
      if (T < pop.wallsFall) {
        for (let i = 0; i < pop.cannons.length; i++) {
          const c = pop.cannons[i], cs = cannonState[i], n = nearestIn(grid, c.x, c.y, 36);
          if (n && t > cs.next && !o.reduced) { cs.start = t; cs.next = t + 1.4 + ((i * 7919) % 13) * 0.14; }
          items.push({ kind: 'cannon', name: 'cannon', anim: t - cs.start < 0.7 ? 'fire' : 'idle', view: 'f', face: n ? (n.o.x >= c.x ? 1 : -1) : c.face, x: c.x, y: c.y, ph: 0, alpha: 1, fireT: t - cs.start, agent: null });
        }
      }
      items.sort((p, q) => p.y - q.y);
      return items;
    }

    // ---- Drawing ----
    function frameOf(it, t) {
      const set = atlas && atlas.frames[it.name] && (atlas.frames[it.name][it.anim] || atlas.frames[it.name].walk || atlas.frames[it.name].idle);
      if (!set) return null;
      const fr = set[it.view] || set.f; if (!fr || !fr.length) return null;
      let i;
      if (it.anim === 'walk' || it.anim === 'run') i = Math.floor((((it.ph % 1) + 1) % 1) * fr.length);
      else if (it.anim === 'fire') i = Math.min(fr.length - 1, Math.floor((it.fireT / 0.7) * fr.length));
      else { const fps = (atlas.fps[it.name] && atlas.fps[it.name][it.anim]) || 4; i = Math.floor((t + it.t0) * fps) % fr.length; }
      return fr[i];
    }
    function drawFigure(it, sx, sy, s, t) {
      const kind = it.kind, k = Math.min(MAX_PX, Math.max(MIN_PX[kind] || 0.3, (SIZE[kind] || 0.5) * s)) * (it.agent && it.agent.lying ? 1.5 : 1);
      const f = frameOf(it, t);
      if (it.dying && kind === 'titan' && it.how === 'kill') ctx.globalAlpha = Math.max(0, 1 - it.dying * 1.6);
      else ctx.globalAlpha = it.alpha;
      if (ctx.globalAlpha > 0.02) {
        if (f) {
          const u = k / atlas.unit;
          if (it.face < 0) { ctx.save(); ctx.translate(sx, sy); ctx.scale(-1, 1); ctx.drawImage(atlas.canvas, f.x, f.y, f.w, f.h, -f.ax * u, -f.ay * u, f.w * u, f.h * u); ctx.restore(); }
          else ctx.drawImage(atlas.canvas, f.x, f.y, f.w, f.h, sx - f.ax * u, sy - f.ay * u, f.w * u, f.h * u);
        } else fallback(kind, sx, sy, k);
      }
      // a killed Titan evaporates
      if (it.dying && kind === 'titan' && it.how === 'kill') {
        const st = atlas && atlas.frames.steam && atlas.frames.steam.puff && atlas.frames.steam.puff.f;
        ctx.globalAlpha = 1;
        if (st) { const g = st[Math.min(st.length - 1, Math.floor(it.dying * st.length))], u = k / atlas.unit; ctx.drawImage(atlas.canvas, g.x, g.y, g.w, g.h, sx - g.ax * u, sy - g.ay * u, g.w * u, g.h * u); }
        else { ctx.fillStyle = `rgba(255,255,255,${0.6 * (1 - it.dying)})`; ctx.beginPath(); ctx.arc(sx, sy - 14 * k - it.dying * 16 * k, (5 + it.dying * 9) * k, 0, 6.3); ctx.fill(); }
      }
    }
    // Plain shapes used until the designed sprites are loaded.
    function fallback(kind, x, y, k) {
      if (kind === 'boat') { ctx.fillStyle = '#6d5335'; ctx.beginPath(); ctx.ellipse(x, y - 2 * k, 10 * k, 3.4 * k, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#5d7c95'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(x + i * 3.4 * k, y - 5.5 * k, 1.5 * k, 0, 6.3); ctx.fill(); } return; }
      const h = (kind === 'titan' ? 30 : kind === 'wallTitan' ? 46 : kind === 'rider' ? 16 : 11) * k;
      ctx.fillStyle = 'rgba(20,30,20,.3)'; ctx.beginPath(); ctx.ellipse(x, y, h * 0.3, h * 0.09, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = kind === 'titan' ? '#e2b79b' : kind === 'wallTitan' ? '#b5483c' : kind === 'civ' ? '#5d7c95' : kind === 'rider' ? '#3f6b3c' : '#555';
      ctx.beginPath(); ctx.ellipse(x, y - h * 0.42, h * 0.2, h * 0.36, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - h * 0.86, h * 0.16, 0, 6.3); ctx.fill();
    }

    const STONE = '#ece5cf', STONE_EDGE = '#4f493c';
    function drawWalls(view, st, T, t) {
      const s = view.s, X = (p) => (p[0] - view.x) * s + vw / 2, Y = (p) => (p[1] - view.y) * s + vh / 2;
      const fallen = st.w.maria === 'collapsed';
      const fall = fallen ? Math.min(1, (T - pop.wallsFall) / 0.05) : 0; // 0..1 while the Walls come down
      const lw = Math.max(2.2, Math.min(9, 3.6 * s)), cx = X(C), cy = Y(C);
      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      for (const wall of ['maria', 'rose', 'sina']) {
        const state = st.w[wall], rr = R[wall] * s;
        const ds = DISTRICTS.filter((d) => d.wall === wall);
        const path = () => { // ring with the district bulges, as one outline
          ctx.beginPath();
          const sorted = [...ds].sort((a, b) => a.deg - b.deg);
          for (let i = 0; i < sorted.length; i++) {
            const d = sorted[i], nx = sorted[(i + 1) % sorted.length], half = Math.asin(d.r / R[wall] / 1) , a = (d.deg * Math.PI) / 180, an = (nx.deg * Math.PI) / 180 + (i === sorted.length - 1 ? Math.PI * 2 : 0);
            const nh = Math.asin(nx.r / R[wall]);
            ctx.arc(X(d.base), Y(d.base), d.r * s, a - Math.PI / 2, a + Math.PI / 2); // the bulge
            ctx.arc(cx, cy, rr, a + half, an - nh); // the Wall to the next district
          }
          ctx.closePath();
        };
        if (fall >= 1) { // rubble where the Wall stood
          ctx.globalAlpha = 0.55; ctx.setLineDash([lw * 0.9, lw * 2.4]); ctx.strokeStyle = '#8f8873'; ctx.lineWidth = lw * 0.7; path(); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
          continue;
        }
        ctx.globalAlpha = 1 - fall;
        path(); ctx.strokeStyle = 'rgba(30,26,18,.35)'; ctx.lineWidth = lw + 5; ctx.stroke(); // ground shadow
        ctx.strokeStyle = STONE_EDGE; ctx.lineWidth = lw + 1.8; ctx.stroke();
        ctx.strokeStyle = STONE; ctx.lineWidth = lw; ctx.stroke();
        // the inner Wall line across each district (its inner gate sits on it)
        for (const d of ds) { const half = Math.asin(d.r / R[wall]), a = (d.deg * Math.PI) / 180; ctx.beginPath(); ctx.arc(cx, cy, rr, a - half, a + half); ctx.strokeStyle = STONE_EDGE; ctx.lineWidth = lw * 0.75 + 1.6; ctx.stroke(); ctx.strokeStyle = '#ddd5bd'; ctx.lineWidth = lw * 0.75; ctx.stroke(); }
        if (state === 'lost' || state === 'breached') { // territory lost / outer gate breached: a warning tint along the Wall
          ctx.globalAlpha = (state === 'lost' ? 0.75 : 0.5) * (1 - fall); ctx.setLineDash([lw * 1.6, lw * 1.9]); ctx.lineDashOffset = -t * 6;
          ctx.strokeStyle = state === 'lost' ? '#ff8a4a' : '#ffc169'; ctx.lineWidth = Math.max(1.4, lw * 0.42); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.globalAlpha = 1 - fall;
        // gates: a dark doorway on the outer tip and on the inner Wall line of each district
        for (const d of ds) {
          for (const [gp, id] of [[d.outer, d.id === 'shig' ? 'shigO' : d.id === 'trost' ? 'trostO' : null], [d.inner, d.id === 'shig' ? 'shigI' : null]]) {
            const gs = id ? st.g[id] : 'intact', gx = X(gp), gy = Y(gp), gr = Math.max(2.2, lw * 0.62);
            if (gs === 'broken') { const pulse = 0.6 + 0.4 * Math.sin(t * 5); ctx.fillStyle = `rgba(255,96,80,${0.35 * pulse})`; ctx.beginPath(); ctx.arc(gx, gy, gr * 3.2, 0, 6.3); ctx.fill(); ctx.fillStyle = '#2a1512'; ctx.beginPath(); ctx.arc(gx, gy, gr * 1.25, 0, 6.3); ctx.fill(); }
            else if (gs === 'sealed') { ctx.fillStyle = '#bfe9dc'; ctx.strokeStyle = '#3f6f63'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(gx, gy, gr * 1.3, 0, 6.3); ctx.fill(); ctx.stroke(); }
            else { ctx.fillStyle = '#4a3a2a'; ctx.beginPath(); ctx.arc(gx, gy, gr * 0.8, 0, 6.3); ctx.fill(); }
          }
        }
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 1;
    }

    function draw(view, sc) {
      const s = view.s;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = global.MapPainter.PAL.paper; ctx.fillRect(0, 0, vw, vh);
      if (base) {
        const x0 = view.x - vw / 2 / s, y0 = view.y - vh / 2 / s, sx0 = Math.max(0, x0), sy0 = Math.max(0, y0), sx1 = Math.min(World.W, x0 + vw / s), sy1 = Math.min(World.H, y0 + vh / s);
        if (sx1 > sx0 && sy1 > sy0) {
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = s > basePpu ? 'high' : 'medium';
          ctx.drawImage(base, sx0 * basePpu, sy0 * basePpu, (sx1 - sx0) * basePpu, (sy1 - sy0) * basePpu, (sx0 - x0) * s, (sy0 - y0) * s, (sx1 - sx0) * s, (sy1 - sy0) * s);
        }
      }
      // places that appear during the story (the harbour)
      for (const pl of terrain.places) if (pl.sinceT !== undefined && sc.T >= pl.sinceT) { ctx.save(); ctx.translate((pl.p[0] - view.x) * s + vw / 2, (pl.p[1] - view.y) * s + vh / 2); ctx.scale(s, s); global.MapPainter.icon(ctx, pl.kind); ctx.restore(); }
      drawWalls(view, sc.walls, sc.T, sc.t);
      if (sc.crowd) {
        // the crowd's logic may run every 2nd or 3rd frame on slower devices; drawing stays every frame
        accDt += sc.dt; frameNo++;
        if (frameNo % logicEvery === 0 || Math.abs(sc.T - lastT) > 0.02) { crowdFrame(sc.T, sc.t, accDt, { reduced: sc.reduced, awake: sc.awake ?? 1 }); accDt = 0; }
        lastT = sc.T;
        const list = items;
        const pad = 60, hw = vw / 2, hh = vh / 2;
        for (const it of list) {
          const sx = (it.x - view.x) * s + hw, sy = (it.y - view.y) * s + hh;
          if (sx < -pad || sy < -pad || sx > vw + pad || sy > vh + pad * 2) continue;
          drawFigure(it, sx, sy, s, sc.t);
        }
        ctx.globalAlpha = 1;
      }
      weather(view, sc);
      for (const fl of sc.flares || []) drawFlare(view, fl);
      nightfall(view, sc);
      // aged-paper vignette over the whole view
      const vg = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.45, vw / 2, vh / 2, Math.max(vw, vh) * 0.78);
      vg.addColorStop(0, 'rgba(60,40,14,0)'); vg.addColorStop(1, 'rgba(60,40,14,.26)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, vw, vh);
    }
    // ---- Weather: drifting cloud shadows, two rain clouds, snow over the northern mountains ----
    const wr = (() => { let s = 20261117; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); })();
    const clouds = Array.from({ length: Q.clouds }, (_, i) => ({ x: wr() * World.W, y: 80 + wr() * (World.H - 160), r: 70 + wr() * 90, v: 5 + wr() * 7, rain: i < 2 }));
    const flakes = Array.from({ length: Q.snow }, () => ({ x: 120 + wr() * 760, y: 120 + wr() * 420, v: 9 + wr() * 9, ph: wr() * 6.3 }));
    const drops = Array.from({ length: 34 }, () => [wr() * 2 - 1, wr() * 2 - 1, wr()]);
    let shade = null;
    function weather(view, sc) {
      const s = view.s, dt = sc.reduced ? 0 : sc.dt, hw = vw / 2, hh = vh / 2;
      if (!shade) { shade = document.createElement('canvas'); shade.width = shade.height = 128; const g = shade.getContext('2d'), gr = g.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(18,28,40,.9)'); gr.addColorStop(0.6, 'rgba(18,28,40,.5)'); gr.addColorStop(1, 'rgba(18,28,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
      for (const c of clouds) {
        c.x += c.v * dt; if (c.x - c.r > World.W + 60) { c.x = -c.r - 40; c.y = 80 + ((c.y * 7.3) % (World.H - 160)); }
        const sx = (c.x - view.x) * s + hw, sy = (c.y - view.y) * s + hh, rr = c.r * s;
        if (sx + rr < 0 || sy + rr < 0 || sx - rr > vw || sy - rr > vh) continue;
        ctx.globalAlpha = c.rain ? 0.34 : 0.16; ctx.drawImage(shade, sx - rr, sy - rr * 0.7, rr * 2, rr * 1.4);
        if (c.rain && !sc.reduced) { // rain falling under the cloud
          ctx.globalAlpha = 0.5; ctx.strokeStyle = '#cfe3f2'; ctx.lineWidth = Math.max(1, Math.min(1.6, s * 0.7)); ctx.beginPath();
          const len = Math.max(5, Math.min(12, 6 * s));
          for (const [dx, dy, ph] of drops) { const f = (sc.t * 1.6 + ph) % 1, x = sx + dx * rr * 0.72 - f * len * 0.5, y = sy + dy * rr * 0.42 + f * len * 2.2; ctx.moveTo(x, y); ctx.lineTo(x - len * 0.32, y + len); }
          ctx.stroke();
        }
      }
      // snow: only over the northern mountains
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff';
      const size = Math.max(0.9, Math.min(2, s * 1.1));
      for (const f of flakes) {
        f.y += f.v * dt; f.x += Math.sin(sc.t * 0.8 + f.ph) * 3 * dt; if (f.y > 540) f.y = 120;
        const sx = (f.x - view.x) * s + hw, sy = (f.y - view.y) * s + hh;
        if (sx < 0 || sy < 0 || sx > vw || sy > vh) continue;
        ctx.globalAlpha = 0.85 * Math.min(1, (540 - f.y) / 60); ctx.fillRect(sx, sy, size, size);
      }
      ctx.globalAlpha = 1;
    }
    // A signal flare: a coloured smoke trail rising from the riders (f = 0..1 through its life).
    function drawFlare(view, fl) {
      const s = view.s, sx = (fl.x - view.x) * s + vw / 2, sy = (fl.y - view.y) * s + vh / 2;
      const rise = Math.min(1, fl.f / 0.3), H = Math.max(34, Math.min(130, 44 * s)) * rise, a = fl.f < 0.7 ? 1 : Math.max(0, (1 - fl.f) / 0.3), drift = 10 * fl.f;
      ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = fl.color; ctx.lineCap = 'round'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(sx, sy - 6); ctx.quadraticCurveTo(sx + drift * 0.2, sy - H * 0.6, sx + drift, sy - H); ctx.stroke();
      ctx.fillStyle = fl.color;
      for (const [k, r] of [[1, 6 + 9 * fl.f], [0.82, 4 + 6 * fl.f], [0.62, 3 + 4 * fl.f]]) { ctx.globalAlpha = 0.6 * a * k; ctx.beginPath(); ctx.arc(sx + drift * k, sy - H * k, r, 0, 6.3); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    // Night: the scene darkens to moonlit blue, and towns that still have people show their lights.
    function nightfall(view, sc) {
      const night = 1 - (sc.light ?? 1);
      if (night < 0.01) return;
      const mix = (a, b) => Math.round(a + (b - a) * night), s = view.s;
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(' + mix(255, 44) + ',' + mix(255, 60) + ',' + mix(255, 116) + ')'; ctx.fillRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = 'screen';
      const lit = [[C, 15]];
      for (const d of DISTRICTS) if (!(d.wall === 'maria' && (sc.walls.w.maria === 'lost' || sc.walls.w.maria === 'collapsed' && false))) lit.push([d.centre, d.r * 0.8]);
      for (const [p, r] of lit) {
        const sx = (p[0] - view.x) * s + vw / 2, sy = (p[1] - view.y) * s + vh / 2, rr = Math.max(7, r * s * 1.5);
        if (sx + rr < 0 || sy + rr < 0 || sx - rr > vw || sy - rr > vh) continue;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr); g.addColorStop(0, 'rgba(255,196,96,' + 0.55 * night + ')'); g.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.fillStyle = g; ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    // The figure under a screen point, if it is the lying Ragako Titan (for its explanation).
    function lyingAt(view, px, py) {
      for (let i = 0; i < pop.agents.length; i++) {
        const a = pop.agents[i], d = dyn[i];
        if (!a.lying || !d.has) continue;
        const sx = (d.x - view.x) * view.s + vw / 2, sy = (d.y - view.y) * view.s + vh / 2;
        if (Math.hypot(px - sx, py - (sy - 6)) < Math.max(16, 14 * view.s)) return { agent: a, x: d.x, y: d.y };
      }
      return null;
    }
    return { resize, paintMap, loadSprites, draw, lyingAt, slower() { if (logicEvery < 3) logicEvery++; return logicEvery; }, get logicEvery() { return logicEvery; }, get size() { return [vw, vh]; }, get hasSprites() { return !!atlas; }, get atlas() { return atlas; }, quality: qualityName };
  }
  global.Stage = { create, QUALITY };
})(window);
