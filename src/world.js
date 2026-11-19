/* World geometry shared by the map builder, the story data, the camera and the crowd simulation.
   Units: 1 world unit = 2 km. North is up. Angles are degrees clockwise from east (SVG y grows
   downwards): east 0, south 90, west 180, north -90.
   The three Walls are true circles around C, drawn as in the story's own diagram of the Walls (the user's
   choice, 3.4): Wall Maria at its true distance, the two inner Walls much closer to the centre, so that
   the districts can be what they are there: long arches standing out from the Wall, with straight sides
   and a round end. The story's places are still written at their true distances from the centre (Sina
   250 km, Rose 380 km, Maria 480 km) and moved with the Walls: see `drawn` and `atTrue`.
   The coastline (src/world-coast.json) was traced from the layout reference the user supplied.
   DOM-free. */
(function (global) {
  'use strict';
  const W = 1100, H = 1560, C = [500, 770];
  const R = { sina: 60, rose: 125, maria: 240 };
  const TRUE = { sina: 125, rose: 190, maria: 240 }; // the Walls' true distances from the centre (250, 380 and 480 km)
  const DR = { sina: [17, 32], rose: [25, 46], maria: [33, 58] }; // a district's half-width, and how far it stands out from its Wall (larger than life, so towns and gates can be seen)
  const DEG = { n: -90, e: 0, s: 90, w: 180 };
  const rad = (d) => (d * Math.PI) / 180;
  const at = (r, deg) => [C[0] + r * Math.cos(rad(deg)), C[1] + r * Math.sin(rad(deg))];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const rOf = (p) => dist(p, C);
  const degOf = (p) => (Math.atan2(p[1] - C[1], p[0] - C[0]) * 180) / Math.PI;
  // Where a true distance from the centre is drawn: it keeps its share of the way between its two Walls.
  const drawn = (r) => (r <= TRUE.sina ? (r * R.sina) / TRUE.sina : r <= TRUE.rose ? R.sina + ((r - TRUE.sina) * (R.rose - R.sina)) / (TRUE.rose - TRUE.sina) : r <= TRUE.maria ? R.rose + ((r - TRUE.rose) * (R.maria - R.rose)) / (TRUE.maria - TRUE.rose) : r);
  const atTrue = (r, deg) => at(drawn(r), deg);

  // The twelve districts: each bulges outward from its Wall at a compass point.
  const DISTRICTS = [
    { id: 'mariaN', wall: 'maria', dir: 'n', zh: '瑪利亞北區', en: 'Maria north district', ja: 'マリア北の区', minor: true },
    { id: 'holst', wall: 'maria', dir: 'e', zh: '霍爾斯特（推測）', en: 'Holst (unconfirmed)', ja: 'ホルスト区（推定）', minor: true },
    { id: 'shig', wall: 'maria', dir: 's', zh: '希干希納', en: 'Shiganshina', ja: 'シガンシナ区' },
    { id: 'quinta', wall: 'maria', dir: 'w', zh: '昆塔（推測）', en: 'Quinta (unconfirmed)', ja: 'クィンタ区（推定）', minor: true },
    { id: 'utopia', wall: 'rose', dir: 'n', zh: '烏托邦', en: 'Utopia', ja: 'ユトピア区', minor: true },
    { id: 'karanes', wall: 'rose', dir: 'e', zh: '卡拉涅斯', en: 'Karanes', ja: 'カラネス区' },
    { id: 'trost', wall: 'rose', dir: 's', zh: '托洛斯特', en: 'Trost', ja: 'トロスト区' },
    { id: 'klorva', wall: 'rose', dir: 'w', zh: '克羅爾巴', en: 'Klorva', ja: 'クロルバ区', minor: true },
    { id: 'orvud', wall: 'sina', dir: 'n', zh: '奧爾福德', en: 'Orvud', ja: 'オルブド区' },
    { id: 'stohess', wall: 'sina', dir: 'e', zh: '史托黑斯', en: 'Stohess', ja: 'ストヘス区' },
    { id: 'ehrmich', wall: 'sina', dir: 's', zh: '艾爾米哈', en: 'Ehrmich', ja: 'エルミハ区', minor: true },
    { id: 'yarckel', wall: 'sina', dir: 'w', zh: '亞爾克爾', en: 'Yarckel', ja: 'ヤルケル区', minor: true },
  ].map((d) => {
    /* A district is an arch: two straight walls `hw` either side of the road, standing out from the Wall, joined by a half circle
       whose outermost point (`outer`, the outer gate) is `depth` from the Wall line. `base` / `inner` is the inner gate on the Wall line.
       In its own frame u runs across (along `t`) and v outward (along `n`). */
    const deg = DEG[d.dir], r = R[d.wall], [hw, depth] = DR[d.wall], n = [Math.cos(rad(deg)), Math.sin(rad(deg))], t = [-n[1], n[0]];
    const base = at(r, deg), end = at(r + depth - hw, deg), v0 = Math.sqrt(r * r - hw * hw) - r, side = depth - hw - v0, len = 2 * side + Math.PI * hw;
    const o = { ...d, deg, n, t, hw, depth, base, end, len, side, centre: at(r + depth * 0.5, deg), inner: base, outer: at(r + depth, deg), beyond: at(r + depth + 16, deg), within: at(r - 16, deg) };
    const world = (u, v) => [base[0] + t[0] * u + n[0] * v, base[1] + t[1] * u + n[1] * v];
    // how far p is outside the district (negative inside): the distance to the road between the gates, less the half-width; the Wall line closes it on the inner side
    o.cap = (p) => { const k = Math.max(0, Math.min(1, ((p[0] - base[0]) * n[0] + (p[1] - base[1]) * n[1]) / (depth - hw))); return Math.hypot(p[0] - base[0] - n[0] * k * (depth - hw), p[1] - base[1] - n[1] * k * (depth - hw)) - hw; }; // the same without the Wall line
    o.sd = (p) => Math.max(o.cap(p), r - rOf(p));
    // the point of the district wall s units along it (from the foot on the -t side, round the end, to the other foot), and its outward normal
    o.wallAt = (s) => {
      s = Math.max(0, Math.min(len, s));
      if (s <= side) return { p: world(-hw, v0 + s), n: [-t[0], -t[1]], s };
      if (s >= len - side) return { p: world(hw, v0 + (len - s)), n: [t[0], t[1]], s };
      const a = (s - side) / hw, cu = -Math.cos(a), cv = Math.sin(a);
      return { p: world(hw * cu, depth - hw + hw * cv), n: [t[0] * cu + n[0] * cv, t[1] * cu + n[1] * cv], s };
    };
    // the wall as a line of points about `step` apart
    o.outline = (step = 2) => { const k = Math.max(8, Math.ceil(len / step)); return Array.from({ length: k + 1 }, (_, i) => o.wallAt((len * i) / k)); };
    return o;
  });
  const district = (id) => DISTRICTS.find((d) => d.id === id);
  const inDistrict = (p) => DISTRICTS.find((d) => rOf(p) >= R[d.wall] - 0.5 && d.sd(p) <= 0) || null;

  let coast = [];
  const inPoly = (poly, [x, y]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const onLand = (p) => inPoly(coast, p);
  const coastDist = (p) => {
    let m = Infinity;
    for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) {
      const a = coast[j], b = coast[i], dx = b[0] - a[0], dy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
      m = Math.min(m, dist(p, [a[0] + dx * t, a[1] + dy * t]));
    }
    return m;
  };
  // Where a ray from p in direction deg first meets the coast (null if it never does).
  const coastHit = (p, deg) => {
    const d = [Math.cos(rad(deg)), Math.sin(rad(deg))];
    let best = null;
    for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) {
      const a = coast[j], b = coast[i], ex = b[0] - a[0], ey = b[1] - a[1], den = d[0] * ey - d[1] * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den, u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den;
      if (t > 0 && u >= 0 && u <= 1 && (best === null || t < best)) best = t;
    }
    return best === null ? null : { t: best, p: [p[0] + d[0] * best, p[1] + d[1] * best] };
  };
  // A point on the coast seen from the wall centre at angle deg, moved `off` units outward (negative = inland).
  const coastAt = (deg, off = 0) => {
    const h = coastHit(C, deg);
    return at((h ? h.t : 500) + off, deg);
  };
  // Which territory a point lies in: sina, rose, maria (between Maria and Rose), outside (land beyond Maria) or sea.
  const regionOf = (p) => {
    const d = inDistrict(p);
    if (d) return d.id;
    const r = rOf(p);
    if (r < R.sina) return 'sina';
    if (r < R.rose) return 'rose';
    if (r < R.maria) return 'maria';
    return onLand(p) ? 'outside' : 'sea';
  };

  const World = { W, H, C, R, TRUE, DR, DEG, DISTRICTS, at, atTrue, drawn, dist, rOf, degOf, district, inDistrict, inPoly, onLand, coastDist, coastHit, coastAt, regionOf,
    get coast() { return coast; },
    init(poly) { coast = poly; return World; } };
  if (typeof WORLD_COAST !== 'undefined') World.init(WORLD_COAST); // injected by the build
  global.World = World;
})(typeof window !== 'undefined' ? window : globalThis);
