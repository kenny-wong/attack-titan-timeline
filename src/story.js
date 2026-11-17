/* Story geometry: named places and, for every event, the movement drawn on the map.
   Coordinates are world units (see world.js): the Walls are true circles around World.C,
   north is up, and places follow the layout reference the user supplied (districts at the
   compass points, the Titans' landing coast in the south, Ragako and Utgard in the south-west
   of Wall Rose, the Reiss chapel near Orvud in the north).
   The text of each event is in story-text.js. */
const C = (zh, en) => ({ zh, en });
const P = (() => {
  const { at, district: D, coastAt } = World;
  return {
    mitras: World.C,
    // Wall Maria: Shiganshina (south)
    shigI: D('shig').inner, shig: D('shig').centre, shigO: D('shig').outer, outer: at(288, 90),
    // Wall Rose: Trost (south) and Karanes (east)
    trostI: D('trost').inner, trost: D('trost').centre, trostO: D('trost').outer,
    karanes: D('karanes').centre,
    // Wall Sina
    ehrmich: D('ehrmich').centre, stohess: D('stohess').centre, orvud: D('orvud').centre, orvudWall: at(147, -90),
    // Inside the Walls
    between: at(228, 84), // Maria territory just outside Trost
    roseLand: at(160, 78), // inside Wall Rose, behind Trost
    cadetCamp: at(170, 98), // 104th training camp, south of Wall Rose's interior
    reiss: at(168, -77), // Reiss chapel: northern Rose territory, near Orvud, outside Wall Sina
    ragako: at(172, 114), utgard: at(177, 136), roseSW: at(190, 141), // south-west of Wall Rose
    forestSW: at(214, 133), // giant-tree forest of the Reiner and Bertholdt escape (Maria territory)
    forest: at(214, 42), // Forest of Giant Trees of the 57th expedition (south-east Maria territory)
    zekeForest: at(214, 30), // the forest where Levi guarded Zeke in 854
    outerEast: at(222, 14), // Maria territory just outside Karanes
    zekeN: [528, 975], // Maria side of Shiganshina's inner gate
    // Outside the Walls
    south: [512, 1118], // titan country between Shiganshina and the south coast
    krugerWall: coastAt(84, -5), // Marley's sea wall on the south coast, where exiles were turned into Titans
    landing: coastAt(81, -5), // where the Warriors came ashore in 845
    shore: coastAt(78, -3), // the beach the Scouts reached in 851
    ship: coastAt(78, 46), // just off that beach
    harbor: coastAt(104, -5), harborSea: coastAt(104, 46), // the harbour built with the Volunteers
    sea: coastAt(100, 185), // open sea towards the continent
    northShore: coastAt(-82, -6), // possible landing of Zeke's party in 850 (unconfirmed)
  };
})();
function actorPortrait(who) {
  if (events[S.idx].id === 'marcel' && who === 'marcel') return marcelMissionPortrait;
  return events[S.idx].id === 'marcel' && who === 'ymir' && S.p < 2 / 3 ? ymirPurePortrait : portraits[who];
}
let castPortraitPhase = -1;
const teamActors = new Set(['pure', 'civ', 'garrison', 'scouts', 'marley', 'walltitans', 'alliance', 'volunteers']);
const cast = {
  karl: C('卡爾·弗利茲', 'Karl Fritz'),
  grisha: C('古利夏', 'Grisha'),
  keith: C('基斯', 'Keith Shadis'),
  kruger: C('庫爾迦', 'Eren Kruger'),
  reiner: C('萊納', 'Reiner'),
  bert: C('貝爾托特', 'Bertholdt'),
  annie: C('亞妮', 'Annie'),
  marcel: C('馬賽', 'Marcel'),
  ymir: C('尤彌爾', 'Ymir'),
  eren: C('艾連', 'Eren'),
  armin: C('阿爾敏', 'Armin'),
  mikasa: C('米卡莎', 'Mikasa'),
  fried: C('芙莉妲', 'Frieda Reiss'),
  pure: C('純潔巨人', 'Pure Titans'),
  civ: C('難民', 'Refugees'),
  garrison: C('駐紮兵團', 'Garrison'),
  scouts: C('調查兵團', 'Survey Corps'),
  zeke: C('吉克', 'Zeke'),
  pieck: C('皮克', 'Pieck'),
  historia: C('希斯特莉亞', 'Historia'),
  rod: C('羅德·雷斯', 'Rod Reiss'),
  levi: C('里維', 'Levi'),
  erwin: C('艾爾文', 'Erwin'),
  yelena: C('耶蓮娜', 'Yelena'),
  ony: C('歐良果彭', 'Onyankopon'),
  marley: C('馬萊軍', 'Marleyan forces'),
  porco: C('波爾柯', 'Porco'),
  gabi: C('賈碧', 'Gabi'),
  falco: C('法爾可', 'Falco'),
  walltitans: C('城牆巨人', 'Wall Titans'),
  alliance: C('聯盟', 'Alliance'),
  volunteers: C('義勇兵', 'Volunteers'),
  arminE: C('阿爾敏／超大型巨人', 'Armin / Colossal Titan'),
};
// A route: who moves, how it is drawn (attack / defense / covert / repair / neutral), the path
// (place names or [x, y]), when within the scene (0..1) and whether the story leaves it unconfirmed.
const r = (who, type, path, start = 0.05, end = 0.9, uncertain = false) => ({ who, type, path, start, end, uncertain });
const SCENES = (() => {
  const { at, coastAt } = World;
  const enc = P.south; // where Ymir attacks the Warriors
  return {
    founding: { routes: [], marks: [{ point: 'mitras', kind: 'reveal' }] },
    grisha: {
      routes: [r('grisha', 'covert', ['krugerWall', [522, 1135], 'outer', 'shigO', 'shig'], 0, 0.92, true), { ...r('keith', 'defense', ['shigO', 'outer', 'shigO', 'shig'], 0.34, 0.92), offset: [-26, 0] }],
      marks: [{ point: 'shig', kind: 'infiltrate' }],
    },
    marcel: {
      routes: [
        { ...r('marcel', 'neutral', ['landing', enc], 0, 0.3, true), hideAt: 0.5, offset: [0, -18] },
        ...[['reiner', [-30, 12]], ['bert', [2, 28]], ['annie', [34, 12]]].flatMap(([who, offset]) => [
          { ...r(who, 'covert', ['landing', enc], 0, 0.3, true), hideAt: 2 / 3, offset },
          { ...r(who, 'covert', [enc, 'outer'], 2 / 3, 1, true), offset },
        ]),
        { ...r('ymir', 'attack', [[432, 1096], enc], 1 / 3, 0.48, true), offset: [16, -25] },
      ],
      marks: [{ point: enc, kind: 'reveal', at: 0.5 }],
    },
    'maria-fall': {
      routes: [
        { ...r('annie', 'attack', ['outer', [466, 1070]], 0, 0.22), offset: [-6, 4] },
        r('pure', 'attack', [[418, 1152], [462, 1096], 'outer'], 0.06, 0.44),
        { ...r('bert', 'attack', ['outer', 'shigO'], 0.08, 0.34), offset: [17, 7] },
        r('reiner', 'attack', ['outer', 'shigO', 'shigI'], 0.26, 0.66),
        r('pure', 'attack', ['shigO', 'shigI', 'between'], 0.48, 1),
      ],
      marks: [
        { point: 'shigO', kind: 'breach', at: 0.35, label: C('外城門', 'Outer gate') },
        { point: 'shigI', kind: 'breach', at: 0.67, label: C('內城門', 'Inner gate') },
      ],
    },
    refugees: {
      routes: [
        r('civ', 'defense', ['shigI', 'trostO', 'trostI', 'roseLand'], 0, 0.94),
        { ...r('reiner', 'covert', ['shig', 'shigI', 'trostO', 'trostI'], 0.13, 0.88, true), offset: [-22, 0] },
        { ...r('bert', 'covert', ['shig', 'shigI', 'trostO', 'trostI'], 0.22, 0.94, true), offset: [22, 0] },
        { ...r('annie', 'covert', ['shig', 'shigI', 'trostO', 'trostI'], 0.3, 1, true), offset: [0, 22] },
      ],
      marks: [{ point: 'trostI', kind: 'infiltrate' }],
    },
    'founder-transfer': {
      routes: [
        r('grisha', 'covert', ['shigI', 'trostI', at(160, 62), at(158, 10), at(162, -42), 'reiss'], 0, 0.7, true),
        r('grisha', 'neutral', ['reiss', at(162, -42), at(158, 10), at(160, 62), 'trostI'], 0.71, 0.9, true),
      ],
      marks: [{ point: 'reiss', kind: 'reveal' }],
    },
    reclamation: {
      routes: [
        r('civ', 'defense', ['roseLand', 'trostI', 'trost', 'trostO', 'between', at(232, 68)], 0.04, 0.62),
        { ...r('garrison', 'defense', ['roseLand', 'trostI', 'trost'], 0, 0.3), offset: [24, 0] },
        r('pure', 'attack', [at(226, 56), at(230, 66), 'between'], 0.34, 0.8),
        r('civ', 'neutral', ['between', 'trostO', 'trost'], 0.84, 1),
      ],
      marks: [{ point: 'between', kind: 'attack', at: 0.56 }],
    },
    cadets: {
      routes: [r('reiner', 'covert', ['trostI', 'cadetCamp'], 0, 0.65, true), { ...r('annie', 'covert', ['trostI', 'cadetCamp'], 0.2, 0.75, true), offset: [24, 0] }],
      marks: [{ point: 'cadetCamp', kind: 'infiltrate' }],
    },
    'trost-attack': {
      routes: [r('bert', 'attack', ['between', 'trostO'], 0, 0.39), r('pure', 'attack', ['between', 'trostO', 'trost'], 0.3, 0.92), r('garrison', 'defense', ['roseLand', 'trostI', 'trost'], 0.12, 0.85)],
      marks: [{ point: 'trostO', kind: 'breach', at: 0.4, label: C('托洛斯特外門', 'Trost outer gate') }],
    },
    'trost-seal': {
      routes: [r('eren', 'repair', ['roseLand', 'trostI', 'trost', 'trostO'], 0.05, 0.75), { ...r('garrison', 'defense', ['roseLand', 'trostI', 'trost'], 0, 0.73), offset: [24, 0] }],
      marks: [{ point: 'trostO', kind: 'repair', at: 0.76, label: C('巨石封門', 'Boulder seal') }],
    },
    'annie-mp': { routes: [r('annie', 'covert', ['cadetCamp', 'ehrmich', at(86, 42), 'stohess'], 0, 0.94, true)], marks: [{ point: 'stohess', kind: 'infiltrate' }] },
    'female-forest': {
      routes: [
        r('scouts', 'defense', ['karanes', 'outerEast', 'forest'], 0, 0.78),
        { ...r('annie', 'attack', ['outerEast', 'forest'], 0.22, 0.74, true), offset: [22, -10] },
        r('annie', 'covert', ['forest', 'outerEast', 'karanes'], 0.75, 1, true),
      ],
      marks: [{ point: 'forest', kind: 'attack' }],
    },
    stohess: {
      routes: [r('annie', 'attack', [at(120, 6), 'stohess', at(148, -7)], 0.04, 0.86), { ...r('eren', 'defense', [at(170, 3), 'stohess'], 0.14, 0.78), offset: [0, 22] }],
      marks: [{ point: 'stohess', kind: 'reveal' }],
    },
    ragako: {
      routes: [
        r('zeke', 'covert', ['northShore', at(268, -128), at(262, 178), at(228, 150), 'roseSW', 'ragako'], 0, 0.48, true),
        { ...r('pieck', 'covert', ['northShore', at(268, -128), at(262, 178), at(228, 150), 'roseSW', 'ragako'], 0.03, 0.5, true), offset: [20, 14] },
        r('pure', 'attack', ['ragako', at(160, 104)], 0.5, 1),
      ],
      marks: [{ point: 'ragako', kind: 'attack', at: 0.52 }],
    },
    utgard: {
      routes: [r('pure', 'attack', ['ragako', 'utgard'], 0, 0.67), r('ymir', 'defense', [at(170, 131), 'utgard'], 0.44, 0.7), r('zeke', 'covert', ['utgard', 'roseSW', at(226, 145)], 0.74, 1)],
      marks: [{ point: 'utgard', kind: 'defend' }],
    },
    'reveal-escape': {
      routes: [r('reiner', 'attack', ['roseSW', 'forestSW'], 0.08, 0.72), { ...r('bert', 'attack', ['roseSW', at(207, 137)], 0.08, 0.6), offset: [20, -12] }, r('scouts', 'defense', [at(186, 112), 'roseSW', 'forestSW'], 0.35, 1)],
      marks: [{ point: 'roseSW', kind: 'reveal' }],
    },
    rod: {
      routes: [r('rod', 'attack', ['reiss', at(158, -83), 'orvudWall'], 0, 0.8), { ...r('scouts', 'defense', ['reiss', at(166, -86), at(151, -92)], 0.1, 0.85), offset: [-22, 0] }],
      marks: [{ point: 'orvudWall', kind: 'defend' }],
    },
    'maria-retaken': {
      routes: [
        r('scouts', 'defense', ['trostI', 'trostO', 'shigI'], 0, 0.4),
        r('eren', 'repair', ['shigI', 'shig', 'shigO'], 0.12, 0.36),
        { ...r('reiner', 'attack', ['shigI', 'shig'], 0.36, 0.5), offset: [22, -8] },
        r('zeke', 'attack', ['zekeN', [516, 994]], 0.4, 0.54),
        { ...r('bert', 'attack', ['zekeN', 'shig'], 0.5, 0.66), offset: [-22, 10] },
        r('pieck', 'covert', ['zekeN', at(246, 112), at(300, 118)], 0.84, 1, true),
      ],
      marks: [
        { point: 'shigO', kind: 'repair', at: 0.36, label: C('外城門硬質化', 'Outer gate hardened') },
        { point: 'shigI', kind: 'repair', at: 0.55, label: C('內城門被獸之巨人擲石堵住', 'Inner gate blocked by the Beast Titan’s boulder') },
      ],
    },
    sea: { routes: [r('scouts', 'defense', ['shigI', 'shigO', 'outer', [528, 1140], 'krugerWall', 'shore'], 0, 0.93)], marks: [{ point: 'shore', kind: 'reveal' }] },
    ships: {
      routes: [r('marley', 'covert', ['sea', 'ship', 'shore'], 0, 0.86, true), { ...r('scouts', 'defense', ['shigO', 'outer', [528, 1140], 'shore'], 0.2, 0.88), offset: [-24, -6] }],
      marks: [{ point: 'shore', kind: 'infiltrate' }],
    },
    overseas: { routes: [r('eren', 'covert', ['harbor', 'harborSea', 'sea'], 0, 1, true)], marks: [{ point: 'harborSea', kind: 'infiltrate' }] },
    liberio: {
      routes: [
        r('scouts', 'defense', ['sea', 'harborSea', 'harbor'], 0.18, 0.93, true),
        { ...r('zeke', 'covert', ['sea', 'harborSea', 'harbor'], 0.32, 0.94, true), offset: [-24, 6] },
        { ...r('gabi', 'covert', ['sea', 'harborSea', 'harbor'], 0.48, 0.96, true), offset: [24, 6] },
      ],
      marks: [{ point: 'harbor', kind: 'infiltrate' }],
    },
    pieck: {
      routes: [r('pieck', 'covert', ['outer', 'shigO', 'shig'], 0, 0.8, true), { ...r('porco', 'attack', ['outer', 'shigO', 'shig'], 0.1, 0.92, true), offset: [22, 6] }],
      marks: [{ point: 'shig', kind: 'attack' }],
    },
    'marley-854': {
      routes: [r('marley', 'attack', ['sea', [470, 1205], 'outer', 'shig'], 0, 0.92, true), { ...r('reiner', 'attack', ['outer', 'shig'], 0.25, 0.88), offset: [24, 4] }, { ...r('eren', 'defense', ['shigI', 'shig'], 0.15, 0.9), offset: [-22, -6] }],
      marks: [{ point: 'shig', kind: 'attack' }],
    },
    'zeke-scream': {
      routes: [r('zeke', 'attack', ['zekeForest', at(232, 66), 'zekeN', 'shigI'], 0, 0.65), { ...r('pure', 'attack', ['shig', 'shigI'], 0.45, 1), offset: [0, 0] }],
      marks: [{ point: 'shig', kind: 'attack' }],
    },
    rumbling: {
      // The Wall Titans step out of the Walls and march outward to the sea in every direction.
      routes: [-90, -45, 0, 45, 90, 135, 180, -135].map((deg, i) => r('walltitans', 'attack', [deg === 90 ? 'shigO' : at(240, deg), coastAt(deg, 34)], i % 2 ? 0.47 : 0.45, 1)),
      marks: [
        { point: 'mitras', kind: 'reveal' },
        { point: 'shigI', kind: 'collapse', at: 0.43 },
        { point: 'trostI', kind: 'collapse', at: 0.43 },
        { point: 'stohess', kind: 'collapse', at: 0.43 },
      ],
    },
    alliance: { routes: [r('alliance', 'defense', ['trostI', 'shigI', 'outer', 'harbor', 'harborSea'], 0, 1, true)], marks: [{ point: 'harbor', kind: 'defend' }] },
    ambassadors: { routes: [r('alliance', 'neutral', ['sea', 'harborSea', 'harbor'], 0, 0.95, true)], marks: [{ point: 'harbor', kind: 'reveal' }] },
  };
})();
// Time of day within an event: [progress, light] pairs, 1 = day and 0 = night. Events not listed are in daylight.
// Titans do not move at night - except under the moon at Utgard, the anomaly the soldiers noticed.
const LIGHT = {
  marcel: [[0, 0], [0.24, 0], [0.36, 1]], // the Warriors walk by night and are caught at dawn
  refugees: [[0, 1], [0.6, 0.6], [1, 0.3]], // the evacuation runs into the evening
  'founder-transfer': [[0, 0.3], [0.14, 0], [0.9, 0], [1, 0.25]], // the night of the fall
  utgard: [[0, 0], [0.82, 0], [0.96, 1]], // a night siege; rescue at dawn
  rod: [[0, 0], [0.3, 0], [0.48, 1]], // out of the cavern by night, Orvud at dawn
  'maria-retaken': [[0, 0], [0.24, 0], [0.36, 1]], // the Scouts ride by night because Titans sleep
};
const NIGHT_ACTIVE = new Set(['utgard']);
const events = EVENT_TEXT.map((t) => {
  const scene = SCENES[t.id];
  if (!scene) throw new Error('No scene for event ' + t.id);
  return { ...t, routes: scene.routes, marks: scene.marks, light: LIGHT[t.id] || [[0, 1]], nightActive: NIGHT_ACTIVE.has(t.id) };
});
// Daylight (0..1) at a point of the timeline.
function lightAt(idx, p) {
  const k = events[idx].light;
  if (p <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (p <= k[i][0]) { const f = (p - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * (f * f * (3 - 2 * f)); }
  return k[k.length - 1][1];
}
