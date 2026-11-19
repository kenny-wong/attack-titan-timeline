/* Terrain layout: turns the coarse terrain grid (assets/map-designs/world-terrain.json) into the
   list of things the map painter draws - ground colour cells, trees, peaks, hills, rivers, a lake and
   places. Deterministic (seeded) and DOM-free. The landscape follows the style reference the user
   supplied: snowy mountains in the north, forest bands, open plains, sand near the south coast. */
(function (global) {
  'use strict';
  const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

  function build(grid, World) {
    const { C, R, DR, at, atTrue, dist, rOf, onLand, coastDist, coastAt, inDistrict, DISTRICTS } = World;
    const road = (wall, deg, k) => at(R[wall] + DR[wall][1] * k, deg); // a point on the road through a district: k = 0 at its inner gate, 1 at the outer
    const r = rng(74311), names = grid.names, cell = grid.cell, [ox, oy] = grid.origin;
    const cls = (i, j) => { const row = grid.rows[j]; return row && row[i] !== undefined ? names[+row[i]] : 'sea'; };

    // Rivers (world units). The two main rivers cross at Mitras and pass through the districts.
    const rivers = [
      { w: 3.4, pts: [[468, 318], [488, 400], [503, 470], road('maria', -90, 1.2), road('rose', -90, 0.5), road('sina', -90, 0.5), [498, 735], C, [502, 805], road('sina', 90, 0.5), road('rose', 90, 0.5), road('maria', 90, 0.5), [503, 1090], [498, 1150], coastAt(90, 6)] },
      { w: 3.2, pts: [coastAt(180, 6), road('maria', 180, 1.15), road('maria', 180, 0.5), road('rose', 180, 0.5), road('sina', 180, 0.5), [465, 772], C, [535, 768], road('sina', 0, 0.5), road('rose', 0, 0.5), road('maria', 0, 0.5), road('maria', 0, 1.15), coastAt(-2, 6)] },
      { w: 1.8, pts: [[372, 552], [420, 610], [455, 668], [482, 722], C] },
      { w: 1.6, pts: [atTrue(160, -62), [528, 716], [512, 744], [506, 756]] },
      { w: 2.0, pts: [[690, 1000], [742, 1080], [786, 1170], [812, 1262], [828, 1340], coastAt(69, 6)] },
      { w: 1.6, pts: [[640, 1060], [700, 1130], [752, 1215], [786, 1290], [806, 1350]] },
      { w: 1.8, pts: [[352, 398], [300, 440], [246, 474], coastAt(-152, 6)] },
      { w: 1.6, pts: [[660, 430], [706, 470], [760, 500], coastAt(-38, 6)] },
      { w: 1.5, pts: [[330, 1010], [300, 1060], [262, 1090], coastAt(137, 6)] },
    ];
    const lake = { c: atTrue(160, -62), rx: 15, ry: 10 };

    // Named woods from the story (forced forest around them), in addition to the grid's forests.
    const woods = [
      { c: atTrue(214, 42), r: 26, giant: true }, // Forest of Giant Trees (57th expedition), south-east Maria territory
      { c: atTrue(214, 30), r: 18, giant: true }, // the forest where Levi guarded Zeke
      { c: atTrue(214, 133), r: 22, giant: true }, // giant-tree forest of the Reiner and Bertholdt escape
      { c: [482, 1112], r: 20, giant: false }, // woods south of Shiganshina
    ];
    const inWood = (p) => woods.find((w) => dist(p, w.c) < w.r);
    const nearRing = (p, pad) => Object.values(R).some((rr) => Math.abs(rOf(p) - rr) < pad) || DISTRICTS.some((d) => d.sd(p) < pad);
    const nearRiver = (p, pad) => rivers.some((rv) => rv.pts.some((q, i) => i && segDist(p, rv.pts[i - 1], q) < pad));
    function segDist(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return dist(p, [a[0] + dx * t, a[1] + dy * t]); }

    const cells = [], trees = [], peaks = [], hills = [];
    for (let j = 0; j < grid.rows.length; j++) {
      for (let i = 0; i < grid.rows[j].length; i++) {
        const p = [ox + (i + 0.5) * cell, oy + (j + 0.5) * cell];
        let c = cls(i, j);
        if (c === 'sea') continue;
        const inside = rOf(p) < R.maria + 34, wood = inWood(p);
        if (wood) c = 'forest';
        else if (inside && (c === 'mountain' || c === 'sand')) c = 'hill'; // keep the walled land gentle
        if (c === 'hill' && p[1] < 440 && r() < 0.5) c = 'mountain';
        if (c === 'water') c = 'plain';
        const snow = c === 'mountain' && (p[1] < 430 || (p[1] < 520 && r() < 0.35));
        cells.push({ x: p[0], y: p[1], i, j, c: snow ? 'snow' : c });
        if (nearRing(p, 9) && !wood) continue;
        const jit = () => (r() - 0.5) * cell;
        if (c === 'forest') {
          const n = wood ? 4 : inside ? 2 : 3;
          for (let k = 0; k < n; k++) { const q = [p[0] + jit(), p[1] + jit()]; if (onLand(q) && !nearRiver(q, 3.5) && !(nearRing(q, 5) && !wood)) trees.push({ x: q[0], y: q[1], s: (wood && wood.giant ? 1.5 : 0.85) + r() * 0.5, k: p[1] < 520 ? 1 : 0, g: wood && wood.giant ? 1 : 0 }); }
        } else if (c === 'mountain') {
          if (r() < 0.85) { const q = [p[0] + jit() * 0.6, p[1] + jit() * 0.6]; if (onLand(q) && coastDist(q) > 7) peaks.push({ x: q[0], y: q[1], s: 0.8 + r() * 0.7, snow: snow ? 1 : 0 }); }
        } else if (c === 'hill') {
          if (r() < (inside ? 0.22 : 0.42)) { const q = [p[0] + jit() * 0.7, p[1] + jit() * 0.7]; if (onLand(q) && !nearRiver(q, 4) && coastDist(q) > 6) hills.push({ x: q[0], y: q[1], s: 0.7 + r() * 0.6 }); }
        } else if (c === 'plain' && r() < 0.035 && !nearRiver(p, 4)) trees.push({ x: p[0] + jit(), y: p[1] + jit(), s: 0.8 + r() * 0.3, k: 0, g: 0 });
      }
    }
    const byY = (a, b) => a.y - b.y;
    trees.sort(byY); peaks.sort(byY); hills.sort(byY);

    // Places drawn on the map (icons). Story labels are added by the app.
    const places = [
      { id: 'mitras', kind: 'capital', p: C },
      { id: 'ragako', kind: 'village', p: atTrue(172, 114) },
      { id: 'dauper', kind: 'village', p: atTrue(150, 158) },
      { id: 'utgard', kind: 'ruin', p: atTrue(177, 136) },
      { id: 'reiss', kind: 'chapel', p: atTrue(168, -77) },
      { id: 'harbor', kind: 'harbor', p: coastAt(104, -5) },
      { id: 'krugerWall', kind: 'seawall', p: coastAt(84, -3) },
      { id: 'castleRuin', kind: 'ruin', p: [556, 1072] },
    ];
    return { cells, cell, origin: [ox, oy], cols: Math.max(...grid.rows.map((row) => row.length)), rows: grid.rows.length, trees, peaks, hills, rivers, lake, woods, places };
  }
  global.Terrain = { build };
})(typeof window !== 'undefined' ? window : globalThis);
