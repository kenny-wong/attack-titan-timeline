/* World geometry shared by the map builder, the story data, the camera and the crowd simulation.
   Units: 1 world unit = 2 km. North is up. The three Walls are true circles in their real proportions
   (Sina 250 km, Rose 380 km, Maria 480 km radius) around C. Angles are degrees clockwise from east
   (SVG y grows downwards): east 0, south 90, west 180, north -90.
   The coastline (src/world-coast.json) was traced from the layout reference the user supplied.
   DOM-free. */
(function (global) {
  'use strict';
  const W = 1100, H = 1560, C = [500, 770];
  const R = { sina: 125, rose: 190, maria: 240 };
  const DR = { sina: 22, rose: 25, maria: 30 }; // radius of the district bulges (drawn larger than life so gates are visible)
  const DEG = { n: -90, e: 0, s: 90, w: 180 };
  const rad = (d) => (d * Math.PI) / 180;
  const at = (r, deg) => [C[0] + r * Math.cos(rad(deg)), C[1] + r * Math.sin(rad(deg))];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const rOf = (p) => dist(p, C);
  const degOf = (p) => (Math.atan2(p[1] - C[1], p[0] - C[0]) * 180) / Math.PI;

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
    const deg = DEG[d.dir], r = R[d.wall], dr = DR[d.wall];
    return { ...d, deg, base: at(r, deg), r: dr, centre: at(r + dr * 0.45, deg), inner: at(r, deg), outer: at(r + dr, deg), beyond: at(r + dr + 16, deg), within: at(r - 16, deg) };
  });
  const district = (id) => DISTRICTS.find((d) => d.id === id);
  const inDistrict = (p) => DISTRICTS.find((d) => rOf(p) >= R[d.wall] - 0.5 && dist(p, d.base) <= d.r) || null;

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

  const World = { W, H, C, R, DR, DEG, DISTRICTS, at, dist, rOf, degOf, district, inDistrict, inPoly, onLand, coastDist, coastHit, coastAt, regionOf,
    get coast() { return coast; },
    init(poly) { coast = poly; return World; } };
  if (typeof WORLD_COAST !== 'undefined') World.init(WORLD_COAST); // injected by the build
  global.World = World;
})(typeof window !== 'undefined' ? window : globalThis);
