const $ = (s) => document.querySelector(s);
const S = { idx: 0, p: 0, playing: false, speed: 1, lang: 'zh', cat: 'all', wall: 'all', actor: null, zoom: 1, lastTime: 0, location: null };
S.pop = (() => {
  try {
    return localStorage.getItem('aot-walls:population:v1') !== 'off';
  } catch (e) {
    return true;
  }
})();
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TXT = {
  zh: {
    spoiler: '全劇劇透',
    kicker: '三道城牆 · 114 年入侵及防衛史',
    hero: '進擊之巨人',
    epigraph: '那一天，人類想起了被巨人支配的恐懼。',
    subtitle: '拖動年份與事件進度，睇巨人進攻、間諜進出、人類防守同城門重建。依照原作故事順序重現重大事件。',
    year: '故事年份',
    mapTitle: '帕拉迪島 · 三道城牆',
    mapHint: '滾輪或雙指縮放 · 拖動地圖 · 播放時鏡頭自動跟隨',
    attack: '進攻',
    defense: '防守',
    covert: '潛入／未確定路線',
    repair: '修復',
    timeline: 'CHRONOLOGY · 事件年表',
    play: '播放',
    pause: '暫停',
    scene: '本事件進度',
    what: '發生甚麼事',
    sequence: '逐步事件 / 動畫',
    status: '三道城牆當時狀態',
    stateHint: '狀態隨年份累積變化',
    cast: '參與角色與互動',
    castHint: '按角色可以突出佢喺地圖上嘅移動路線',
    notes:
      '註：地圖為原創示意插圖，島嶼輪廓、城區位置及地形參考同好繪製嘅地圖重新繪畫，並非官方測繪。路線係概念性視覺化，並非精確定位；原作冇交代嘅入口用虛線及說明標示。畫面為原創示意動畫，並非官方動畫片段。',
    sources: '劇情核對：',
    location: '地點',
    phase: '階段',
    wall: '城牆',
    state: { intact: '完整／守住', lost: '領土失守', breached: '外門受損', collapsed: '已崩塌' },
    category: {
      all: '所有事件',
      attack: '巨人進攻',
      infiltrate: '秘密潛入',
      defend: '防守／奪還',
      reveal: '身份／真相',
      expedition: '探索',
      finale: '最終章',
    },
    wallnames: { all: '全部地區', maria: '瑪利亞', rose: '羅塞', sina: '席納', outside: '牆外／海外' },
    gates: { shigO: '希干希納外門', shigI: '希干希納內門', trostO: '托洛斯特外門' },
    gstates: { intact: '完整', broken: '破口', sealed: '已封閉', collapsed: '消失' },
    shown: '顯示',
    approx: '示意路線',
    allWalls: '三道城牆',
    clickloc: '按地標聚焦相關事件',
    noRoute: '此事件重點係城牆狀態／情報，冇確定嘅移動路線',
    mmTitan: '巨人',
    mmCiv: '平民',
    mmScout: '士兵',
    mmCast: '角色',
    popTitans: '純潔巨人',
    popCivilians: '平民',
    popOn: '人群動態：開',
    popOff: '人群動態：關',
    popNone: '島上已無',
    popSep: '、',
    popZones: {
      outside: '牆外',
      shig: '希干希納',
      maria: '瑪利亞領土',
      trost: '托洛斯特',
      rose: '羅塞領土',
      ragakoFixed: '拉加哥（1，無法行動）',
      sina: '席納領土',
      districts: '其他城區',
    },
    popAbout: '約',
    dayDay: '日間',
    dayDusk: '黃昏／黎明',
    dayNight: '夜晚 · 巨人靜止',
    dayMoon: '月夜 · 巨人異常活動',
    flareInfo: '信號彈：紅＝發現巨人 · 綠＝行進方向 · 黑＝奇行種',
    popWall: '城牆巨人',
    popWallNow: '肩並肩企滿三道城牆同各城區圍牆；直線向外走，合成一個大圓圈推向海外',
    rumbleInfo: '地鳴（模擬）：城牆巨人以最短路線直接向外走，只會繞開牆內嘅城區同村落；出牆後肩並肩合成一個大圓圈，踏平牆外嘅樹林同建築，向海外推進',
    popCrawlTag: '爬行嘅巨人',
    popCrawlInfo: '爬行嘅巨人：手腳太細，行唔到路，只能夠拖住身體由南岸爬向城牆，多年嚟喺地上留低一條長長嘅痕跡。851年調查兵團前往海邊途中發現佢，艾連認出佢係被送去「樂園」嘅同胞，冇殺佢；佢繼續爬行，直到地鳴嘅巨人圓圈到達。',
    camOn: '自動鏡頭：開',
    camOff: '自動鏡頭：關',
    popLyingTag: '拉加哥村的巨人（無法行動）',
    popLyingInfo: '拉加哥村的巨人（無法行動）：調查兵團發現佢倒臥村中，四肢太瘦，無法走動；佢一直留喺度，直到巨人之力消失先變返人。',
  },
  en: {
    spoiler: 'FULL STORY SPOILERS',
    kicker: 'THREE WALLS · 114 YEARS OF CONFLICT',
    hero: 'Attack on Titan',
    epigraph: 'On that day, humanity remembered the terror of being ruled by them.',
    subtitle:
      'Scrub time to follow attacks, infiltration, defense and wall recovery. Explore the story in chronological order, from the formation of the Walls to the aftermath.',
    year: 'STORY YEAR',
    mapTitle: 'PARADIS · THREE WALLS',
    mapHint: 'Scroll or pinch to zoom · drag to pan · the camera follows during playback',
    attack: 'Attack',
    defense: 'Defense',
    covert: 'Undercover / uncertain path',
    repair: 'Recovery',
    timeline: 'CHRONOLOGY · ALL EVENTS',
    play: 'Play',
    pause: 'Pause',
    scene: 'Scene progress',
    what: 'WHAT HAPPENED',
    sequence: 'STEP-BY-STEP SCENE',
    status: 'WALL STATUS AT THIS TIME',
    stateHint: 'Cumulative over time',
    cast: 'CHARACTERS & INTERACTIONS',
    castHint: 'Click a character to highlight their movement route',
    notes:
      'Note: the map is an original illustration; the island outline, district positions and terrain are redrawn after fan-made reference maps and are not an official survey. Routes are schematic rather than GPS-accurate; unconfirmed entry paths are indicated with dashed lines. These are original visual explanations, not official anime clips.',
    sources: 'Story references:',
    location: 'Location',
    phase: 'Phase',
    wall: 'Wall',
    state: { intact: 'Secure', lost: 'Territory lost', breached: 'Outer gate breached', collapsed: 'Collapsed' },
    category: {
      all: 'All events',
      attack: 'Titan attacks',
      infiltrate: 'Infiltration',
      defend: 'Defense / recovery',
      reveal: 'Revelations',
      expedition: 'Expeditions',
      finale: 'Finale',
    },
    wallnames: { all: 'All regions', maria: 'Maria', rose: 'Rose', sina: 'Sina', outside: 'Outside / overseas' },
    gates: { shigO: 'Shiganshina outer', shigI: 'Shiganshina inner', trostO: 'Trost outer' },
    gstates: { intact: 'Intact', broken: 'Breached', sealed: 'Sealed', collapsed: 'Gone' },
    shown: 'Showing',
    approx: 'Schematic path',
    allWalls: 'All three Walls',
    clickloc: 'Click a district to jump to related events',
    noRoute: 'This event concerns a reveal or wall status; no confirmed crossing route',
    mmTitan: 'Titans',
    mmCiv: 'Civilians',
    mmScout: 'Soldiers',
    mmCast: 'Characters',
    popTitans: 'Pure Titans',
    popCivilians: 'Civilians',
    popOn: 'Crowds: on',
    popOff: 'Crowds: off',
    popNone: 'none on the island',
    popSep: ', ',
    popZones: {
      outside: 'outside the Walls',
      shig: 'Shiganshina',
      maria: 'Maria territory',
      trost: 'Trost',
      rose: 'Rose territory',
      ragakoFixed: 'Ragako (1, cannot move)',
      sina: 'Sina territory',
      districts: 'other districts',
    },
    popAbout: 'about',
    dayDay: 'Day',
    dayDusk: 'Dusk / dawn',
    dayNight: 'Night · Titans do not move',
    dayMoon: 'Moonlit night · Titans active (an anomaly)',
    flareInfo: 'Signal flares: red = Titan sighted · green = new heading · black = abnormal',
    popWall: 'Wall Titans',
    popWallNow: 'shoulder to shoulder in all three Walls and every district wall; they walk straight out and form one great circle that sweeps out over the sea',
    rumbleInfo: 'The Rumbling (simulated): the Wall Titans take the shortest way straight out, stepping aside only for the towns and villages inside the Walls; outside they close up into one great circle, shoulder to shoulder, flatten the forests and buildings there and sweep outward',
    popCrawlTag: 'Crawling Titan',
    popCrawlInfo: 'The crawling Titan: its limbs are too small to walk, so it has dragged itself from the south coast towards the Walls for years, leaving a long track. The Scouts find it in 851 on their way to the sea; Eren recognises a compatriot who was sent to “paradise”, and they leave it be. It crawls on until the great circle of the Rumbling reaches it.',
    camOn: 'Auto camera: on',
    camOff: 'Auto camera: off',
    popLyingTag: 'Ragako Titan (cannot move)',
    popLyingInfo:
      'The Ragako Titan (cannot move): the Scouts found it lying in the village, its limbs too thin to walk. It stays there until the Titans’ power ends and it becomes human again.',
  },
  ja: {
    spoiler: '全編ネタバレ',
    kicker: '三つの壁 · 侵入と防衛の114年',
    hero: '進撃の巨人',
    epigraph: 'その日、人類は思い出した。ヤツらに支配されていた恐怖を……',
    subtitle: '年と進行度を動かして、巨人の侵攻、潜入、防衛、門の修復を追う。壁の誕生からその後まで、物語を時系列でたどる。',
    year: '物語の年',
    mapTitle: 'パラディ島 · 三つの壁',
    mapHint: 'ホイールやピンチで拡大縮小 · ドラッグで移動 · 再生中はカメラが自動で追う',
    attack: '侵攻',
    defense: '防衛',
    covert: '潜入／未確定の経路',
    repair: '修復',
    timeline: 'CHRONOLOGY · 出来事年表',
    play: '再生',
    pause: '一時停止',
    scene: 'この出来事の進行',
    what: '何が起きたか',
    sequence: '場面の流れ／アニメーション',
    status: 'この時点の三つの壁',
    stateHint: '状態は年を追って累積',
    cast: '登場人物と関わり',
    castHint: '人物を選ぶと地図上の移動経路を強調',
    notes:
      '注：地図はオリジナルのイラストです。島の輪郭、各区の位置、地形はファン作成の参考地図をもとに描き直したもので、公式の測量図ではありません。経路は概念的なもので正確な位置ではなく、原作で描かれていない入口は破線で示しています。画面はオリジナルの説明用アニメーションで、公式アニメの映像ではありません。',
    sources: '物語の参照元：',
    location: '場所',
    phase: '段階',
    wall: '壁',
    state: { intact: '健在', lost: '領土喪失', breached: '外門破壊', collapsed: '崩壊' },
    category: {
      all: 'すべて',
      attack: '巨人の侵攻',
      infiltrate: '潜入',
      defend: '防衛／奪還',
      reveal: '正体／真相',
      expedition: '壁外調査',
      finale: '最終章',
    },
    wallnames: { all: '全地域', maria: 'マリア', rose: 'ローゼ', sina: 'シーナ', outside: '壁外／海外' },
    gates: { shigO: 'シガンシナ区外門', shigI: 'シガンシナ区内門', trostO: 'トロスト区外門' },
    gstates: { intact: '無傷', broken: '破壊', sealed: '封鎖', collapsed: '消滅' },
    shown: '表示中',
    approx: '概略の経路',
    allWalls: '三つの壁すべて',
    clickloc: '区を選ぶと関連する出来事へ',
    noRoute: 'この出来事は正体の判明や壁の状態に関するもので、確認された越境経路はない',
    mmTitan: '巨人',
    mmCiv: '住民',
    mmScout: '兵士',
    mmCast: '人物',
    popTitans: '無垢の巨人',
    popCivilians: '住民',
    popOn: '群衆表示：オン',
    popOff: '群衆表示：オフ',
    popNone: '島内にはいない',
    popSep: '、',
    popZones: {
      outside: '壁外',
      shig: 'シガンシナ区',
      maria: 'マリア領',
      trost: 'トロスト区',
      rose: 'ローゼ領',
      ragakoFixed: 'ラガコ村（1体、動けない）',
      sina: 'シーナ領',
      districts: 'その他の区',
    },
    popAbout: '約',
    dayDay: '昼',
    dayDusk: '夕暮れ／夜明け',
    dayNight: '夜 · 巨人は動かない',
    dayMoon: '月夜 · 巨人が活動（異常）',
    flareInfo: '信煙弾：赤＝巨人発見 · 緑＝進路変更 · 黒＝奇行種',
    popWall: '壁の巨人',
    popWallNow: '三つの壁と各区の壁に肩を並べて立ち、まっすぐ外へ歩いて一つの大きな円になり、海の向こうへ進む',
    rumbleInfo: '地鳴らし（シミュレーション）：壁の巨人は最短の道をまっすぐ外へ進み、壁の中の町や村だけを避ける。壁の外では肩を並べて一つの大きな円になり、森や建物を踏みつぶして外へ押し進む',
    popCrawlTag: '這う巨人',
    popCrawlInfo: '這う巨人：手足が小さすぎて歩けず、南の海岸から壁へ向かって何年も体を引きずり、長い跡を残してきた。851年、海へ向かう調査兵団が発見する。エレンは「楽園送り」にされた同胞だと気づき、そのままにしておく。地鳴らしの巨人の円が届くまで這い続ける。',
    camOn: '自動カメラ：オン',
    camOff: '自動カメラ：オフ',
    popLyingTag: 'ラガコ村の巨人（動けない）',
    popLyingInfo: 'ラガコ村の巨人（動けない）：調査兵団が村で横たわっているのを発見した。手足が細すぎて歩けず、巨人の力が消えて人間に戻るまでそこに留まる。',
  },
};
const yearText = (y) => (S.lang === 'en' ? y.replace('約', 'c. ') : y); // '約832' is shared by Chinese and Japanese
const tr = (v) => (typeof v === 'string' ? v : (v?.[S.lang] ?? v?.en ?? '')); // a text without the current language falls back to English
// Names of places (used in the story card and on the map).
const labels = {
  south: C('牆外南部（巨人聚集地）', 'South of the Walls (Titan country)', '壁外南部（巨人の集まる地）'),
  shig: C('希干希納', 'Shiganshina', 'シガンシナ区'),
  trost: C('托洛斯特', 'Trost', 'トロスト区'),
  stohess: C('史托黑斯', 'Stohess', 'ストヘス区'),
  karanes: C('卡拉涅斯', 'Karanes', 'カラネス区'),
  orvud: C('奧爾福德', 'Orvud', 'オルブド区'),
  orvudWall: C('奧爾福德', 'Orvud', 'オルブド区'),
  mitras: C('米特拉斯', 'Mitras', '王都ミットラス'),
  ragako: C('拉加哥村', 'Ragako', 'ラガコ村'),
  utgard: C('厄特加爾城', 'Utgard Castle', 'ウトガルド城'),
  forest: C('巨大樹森林', 'Forest of Giant Trees', '巨大樹の森'),
  reiss: C('雷斯家禮拜堂', 'Reiss chapel', 'レイス家礼拝堂'),
  cadetCamp: C('訓練兵團駐地（羅塞之牆內）', 'Cadet camp (inside Wall Rose)', '訓練兵団の駐屯地（ウォール・ローゼ内）'),
  roseLand: C('羅塞之牆內', 'Inside Wall Rose', 'ウォール・ローゼ内'),
  roseSW: C('羅塞之牆頂（西南）', 'Atop Wall Rose (south-west)', 'ウォール・ローゼの上（南西）'),
  shore: C('帕拉迪島南岸', 'South coast of Paradis', 'パラディ島南岸'),
  harbor: C('港口', 'Harbour', '港'),
  krugerWall: C('馬萊海岸壁', 'Marley’s sea wall', 'マーレの海岸壁'),
  sea: C('海外', 'Overseas', '海外'),
};
// Labels drawn on the map: where they sit, and from which zoom level (screen px per world unit) they show.
const MAP_LABELS = (() => {
  const D = World.district, out = [];
  const beside = (id, o = {}) => { const d = D(id); return d.dir === 's' || d.dir === 'n' ? { p: [d.base[0] + d.r, d.centre[1]], dx: 8, dy: 0, align: 'l', ...o } : { p: [d.centre[0], d.base[1] + d.r], dx: 0, dy: 13, align: 'c', ...o }; };
  out.push({ key: 'shig', text: labels.shig, min: 0.3, ...beside('shig') });
  for (const id of ['trost', 'stohess', 'karanes', 'orvud']) out.push({ key: id, text: labels[id], min: 0.62, ...beside(id) });
  out.push({ key: 'mitras', text: labels.mitras, p: World.C, dx: 0, dy: 17, align: 'c', min: 0.3 });
  for (const d of World.DISTRICTS.filter((d) => d.minor)) out.push({ key: d.id, text: C(d.zh, d.en, d.ja), min: 1.25, minor: true, ...beside(d.id) });
  out.push({ key: 'ragako', text: labels.ragako, p: P.ragako, dx: 10, dy: 3, align: 'l', min: 0.9, minor: true });
  out.push({ key: 'utgard', text: labels.utgard, p: P.utgard, dx: -10, dy: 3, align: 'r', min: 0.9, minor: true });
  out.push({ key: 'reiss', text: labels.reiss, p: P.reiss, dx: 10, dy: 0, align: 'l', min: 0.9, minor: true });
  out.push({ key: 'forest', text: labels.forest, p: P.forest, dx: 0, dy: 26, align: 'c', min: 0.75, minor: true });
  out.push({ key: 'harbor', text: labels.harbor, p: P.harbor, dx: -12, dy: 2, align: 'r', min: 0.42, minor: true, since: 'overseas' });
  out.push({ key: 'krugerWall', text: labels.krugerWall, p: P.krugerWall, dx: 0, dy: 15, align: 'c', min: 0.42, minor: true });
  out.push({ key: 'crawl', text: C('爬行巨人嘅痕跡', 'Crawling Titan’s path', '這う巨人の跡'), p: [P.crawlFrom[0] * 0.8 + P.crawlTo[0] * 0.2, P.crawlFrom[1] * 0.8 + P.crawlTo[1] * 0.2], dx: 16, dy: 4, align: 'l', min: 1.5, minor: true, since: 'grisha' });
  out.push({ key: 'south', text: C('巨人聚集地', 'Titan country', '巨人の集まる地'), p: P.south, dx: 46, dy: 0, align: 'l', min: 0.42, max: 1.6, minor: true });
  return out;
})();
// Clickable places and the wall filter they select.
const locations = [
  ['shig', 'maria'], ['trost', 'rose'], ['stohess', 'sina'], ['karanes', 'rose'], ['orvud', 'sina'], ['mitras', 'sina'], ['ragako', 'rose'], ['utgard', 'rose'], ['forest', 'outside'],
].map(([key, wall]) => { const d = World.district(key); return { key, wall, p: d ? d.centre : P[key], r: d ? d.r : key === 'forest' ? 22 : 13 }; });
const routeColors = { attack: '#ff8477', defense: '#6bc8f0', covert: '#ecc985', repair: '#8de5ba', neutral: '#e8e4d7' };
const routeClass = { attack: 'attacking', defense: 'defending', covert: 'infiltrating', repair: 'repairing', neutral: 'neutral' };
// Emblems (SVG symbols from assets/theme) used across the page.
const icon = (id, cls) => `<svg class="${cls}" viewBox="0 0 ${id.startsWith('orn-') ? '32 32' : '64 64'}" aria-hidden="true"><use href="#${id}"/></svg>`;
const CAT_ICON = { attack: 'em-titan', infiltrate: 'orn-key', defend: 'em-garrison', reveal: 'em-royal', expedition: 'em-survey', finale: 'em-wall' };
// Which emblem each character or group carries.
const FACTION = {
  eren: 'survey', mikasa: 'survey', armin: 'survey', arminE: 'survey', levi: 'survey', erwin: 'survey', keith: 'survey', scouts: 'survey', alliance: 'survey',
  garrison: 'garrison', historia: 'royal', karl: 'royal', fried: 'royal', rod: 'royal',
  reiner: 'marley', bert: 'marley', annie: 'marley', marcel: 'marley', zeke: 'marley', pieck: 'marley', porco: 'marley', gabi: 'marley', falco: 'marley', marley: 'marley', yelena: 'marley', ony: 'marley', volunteers: 'marley',
  ymir: 'titan', pure: 'titan', walltitans: 'titan', grisha: 'titan', kruger: 'titan', civ: 'civil',
};
// The picture at the top of the story card: a scene picture where there is one, otherwise manga-style
// panels of the event's main characters.
const SCENE_ART = {
  founding: ['wall-sunset', '50% 30%'], marcel: ['ymir-titan', '70% 40%'], 'maria-fall': ['pure-titans', '50% 22%'], refugees: ['refugee-boats', '50% 45%'],
  reclamation: ['refugee-boats', '40% 78%'], cadets: ['survey-corps', '50% 30%'], 'trost-seal': ['wall-sunset', '50% 62%'], rumbling: ['rumbling', '50% 35%'], alliance: ['alliance', '50% 55%'], rebuild: ['wall-sunset', '50% 70%'],
};
function renderArt(ev) {
  const el = $('#storyArt');
  if (el.dataset.ev === ev.id + S.lang) return;
  el.dataset.ev = ev.id + S.lang;
  el.replaceChildren();
  el.className = 'story-art';
  const scene = SCENE_ART[ev.id];
  if (scene) {
    const img = document.createElement('img');
    img.className = 'art-scene';
    img.alt = '';
    img.decoding = 'async';
    img.style.objectPosition = scene[1];
    img.onerror = () => { el.dataset.ev = ''; delete SCENE_ART[ev.id]; renderArt(ev); }; // no picture file (the page was copied on its own): fall back to the panels
    img.src = 'assets/scenes/' + scene[0] + '.webp';
    el.appendChild(img);
    return;
  }
  const who = ev.characters.map((c) => c[0]).filter((w) => portraits[w]).slice(0, 4);
  const wrap = document.createElement('div');
  wrap.className = 'art-panels n' + who.length;
  for (const w of who) {
    const p = document.createElement('div');
    p.className = 'art-panel' + (teamActors.has(w) ? ' team' : '');
    const img = document.createElement('img');
    img.alt = '';
    img.src = actorPortrait(w, true);
    const name = document.createElement('span');
    name.textContent = tr(cast[w]);
    p.append(img, name);
    wrap.appendChild(p);
  }
  el.appendChild(wrap);
}
const tags = { attack: 'ATTACK', infiltrate: 'INFILTRATION', defend: 'DEFENSE', reveal: 'REVELATION', expedition: 'EXPEDITION', finale: 'FINALE' };
const elem = (t, attrs = {}, parent = null) => {
  let x = document.createElementNS('http://www.w3.org/2000/svg', t);
  Object.entries(attrs).forEach(([k, v]) => x.setAttribute(k, String(v)));
  if (parent) parent.appendChild(x);
  return x;
};
const group = (parent, attrs = {}) => elem('g', attrs, parent);
const coord = (s) => (Array.isArray(s) ? s : P[s] || P.mitras);
// ---- Map: world, crowd, stage and camera ----
const PHONE = innerWidth < 760;
const QUALITY = PHONE || (navigator.deviceMemory && navigator.deviceMemory <= 2) ? 'low' : 'high'; // phones get a lighter map and sprites
const TERRAIN = Terrain.build(TERRAIN_GRID, World);
TERRAIN.places.find((p) => p.id === 'harbor').sinceT = events.findIndex((e) => e.id === 'overseas'); // the harbour is built after 851
const POP = Population.create(events, World, { points: P, protect: TERRAIN.places.map((pl) => pl.p), settle: GROWTH.places.map((g) => g.p), counts: QUALITY === 'low' ? { civilians: 96, riders: 6, wallTitans: 190 } : {} });
// What is built later: railway lines grow between two moments of the story; new places appear at theirs.
const storyT = ([id, p]) => events.findIndex((e) => e.id === id) + p;
TERRAIN.rails = GROWTH.rails.map((rl) => ({ id: rl.id, geo: RouteGeo.build(rl.path, 1), T0: storyT(rl.from), T1: storyT(rl.to), wreck: storyT(rl.from) < POP.wallsFall })); // a line older than the Rumbling is wrecked by it
for (const g of GROWTH.places) TERRAIN.places.push({ id: g.id, kind: g.kind, p: g.p, sea: g.sea, sinceT: storyT(g.at) });
const STAGE = Stage.create($('#stage'), World, TERRAIN, POP, QUALITY);
const MAX_SCALE = QUALITY === 'low' ? 3.4 : 5; // closest zoom, screen px per world unit
const AUTO_MAX = PHONE ? 1.7 : 2.7; // the automatic camera never goes closer than this
// view = what is shown now; target = where the camera is easing to; auto = the camera follows the story.
const CAM = { view: { x: World.W / 2, y: World.H / 2, s: 0.4 }, target: null, auto: true, retarget: true, vw: 1, vh: 1, moved: true, rate: 2.2 };
const toScreen = (p) => [(p[0] - CAM.view.x) * CAM.view.s + CAM.vw / 2, (p[1] - CAM.view.y) * CAM.view.s + CAM.vh / 2];
function wallState(idx, progress = S.p) {
  let w = { maria: 'intact', rose: 'intact', sina: 'intact' },
    g = { shigO: 'intact', shigI: 'intact', trostO: 'intact' };
  for (let i = 0; i < idx; i++) {
    Object.assign(w, events[i].delta?.walls);
    Object.assign(g, events[i].delta?.gates);
  }
  const ev = events[idx];
  if (ev.id === 'maria-fall') {
    if (progress >= 0.35) {
      w.maria = 'breached';
      g.shigO = 'broken';
    }
    if (progress >= 0.67) {
      w.maria = 'lost';
      g.shigI = 'broken';
    }
  } else if (ev.id === 'trost-attack') {
    if (progress >= 0.4) {
      w.rose = 'breached';
      g.trostO = 'broken';
    }
  } else if (ev.id === 'trost-seal') {
    if (progress >= 0.76) {
      w.rose = 'intact';
      g.trostO = 'sealed';
    }
  } else if (ev.id === 'maria-retaken') {
    if (progress >= 0.36) g.shigO = 'sealed';
    if (progress >= 0.55) g.shigI = 'sealed';
    if (progress >= 0.92) w.maria = 'intact';
  } else if (ev.id === 'rumbling') {
    if (progress >= 0.43) {
      Object.assign(w, ev.delta?.walls);
      Object.assign(g, ev.delta?.gates);
    }
  } else {
    Object.assign(w, ev.delta?.walls);
    Object.assign(g, ev.delta?.gates);
  }
  return { w, g };
}
let visible = [];
let displayed = [];
let sceneRoutes = [],
  sceneEffects = [];
let lastBeat = -1;
let lastWallSignature = '';
function filterEvents() {
  visible = events
    .map((_, i) => i)
    .filter((i) => (S.cat === 'all' || events[i].category === S.cat) && (S.wall === 'all' || events[i].wall === S.wall || events[i].wall === 'all'));
  if (!visible.length) {
    S.cat = 'all';
    S.wall = 'all';
    visible = events.map((_, i) => i);
  }
  if (!visible.includes(S.idx)) {
    S.idx = visible[0];
    S.p = 0;
  }
  S.actor = null;
  buildFilters();
  buildCards();
  paintEvent();
}
function buildFilters() {
  for (const [k, opts, tag] of [
    ['cat', Object.keys(TXT.zh.category), 'categoryFilters'],
    ['wall', Object.keys(TXT.zh.wallnames), 'wallFilters'],
  ]) {
    const parent = $('#' + tag);
    parent.replaceChildren();
    for (const v of opts) {
      const b = document.createElement('button');
      b.className = (k === 'cat' ? 'filter' : 'wall-filter') + (S[k] === v ? ' active' : '');
      b.type = 'button';
      b.textContent = k === 'cat' ? TXT[S.lang].category[v] : TXT[S.lang].wallnames[v];
      b.setAttribute('aria-pressed', String(S[k] === v));
      b.onclick = () => {
        S[k] = v;
        filterEvents();
      };
      parent.appendChild(b);
    }
  }
}
function buildCards() {
  const parent = $('#eventCards');
  parent.replaceChildren();
  for (let n = 0; n < visible.length; n++) {
    let ev = events[visible[n]];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'event-tile cat-' + ev.category + (visible[n] === S.idx ? ' active' : '');
    b.innerHTML = `<div class="ey">${yearText(ev.year)}</div><div class="et"></div><div class="ep">${icon(CAT_ICON[ev.category], 'tile-ico')}${tags[ev.category]}</div>`;
    b.querySelector('.et').textContent = tr(ev.title);
    b.onclick = () => selectEvent(visible[n]);
    parent.appendChild(b);
  }
  $('#eventSlider').max = Math.max(0, visible.length - 1);
  $('#eventSlider').value = visible.indexOf(S.idx);
  $('#rangeStart').textContent = yearText(events[visible[0]].year);
  $('#rangeEnd').textContent = yearText(events[visible.at(-1)].year);
}
function selectEvent(i, { keepPlaying = false } = {}) {
  endCut(); // a key scene never outlives its event
  S.idx = i;
  S.p = 0;
  S.actor = null;
  lastBeat = -1;
  S.enterRoutes = true;
  if (!keepPlaying) S.playing = false;
  paintEvent();
  fitView();
}
let lastPainted = -1,
  prevWalls = {};
function swapIn(sel) {
  const el = $(sel);
  if (!el || REDUCED) return;
  el.classList.remove('swap');
  void el.offsetWidth;
  el.classList.add('swap');
}
function paintEvent() {
  const ev = events[S.idx],
    t = TXT[S.lang];
  if (lastPainted !== S.idx) {
    lastPainted = S.idx;
    for (const s of ['.story-head', '.story-body', '#castList']) swapIn(s);
  }
  $('#heroYear').textContent = yearText(ev.year);
  $('#chapterTag').textContent = `CHAPTER ${String(S.idx + 1).padStart(2, '0')} / ${events.length}`;
  $('#categoryBadge').innerHTML = icon(CAT_ICON[ev.category], 'tile-ico') + tags[ev.category];
  $('#categoryBadge').className = 'count cat-' + ev.category;
  renderArt(ev);
  $('#storyTitle').textContent = tr(ev.title);
  $('#storyDesc').textContent = tr(ev.description);
  $('#storyOutcome').textContent = tr(ev.outcome);
  $('#storyMeta').replaceChildren();
  for (const s of [t.wall + ': ' + (t.wallnames[ev.wall] || ev.wall), tr(labels[ev.place] || C(ev.place, ev.place)), yearText(ev.year)]) {
    const b = document.createElement('b');
    b.textContent = s;
    $('#storyMeta').appendChild(b);
  }
  $('#eventCount').textContent = `${visible.indexOf(S.idx) + 1} / ${visible.length}`;
  $('#eventSlider').value = visible.indexOf(S.idx);
  $('#sceneSlider').value = Math.round(S.p * 100);
  $('#scenePct').textContent = `${Math.round(S.p * 100)}%`;
  buildCards();
  const tile = $('#eventCards .active');
  if (tile) {
    const cards = $('#eventCards');
    cards.scrollTo({ left: tile.offsetLeft - (cards.clientWidth - tile.offsetWidth) / 2, behavior: 'auto' });
  }
  setMapInfo(ev.id === 'female-forest' ? t.flareInfo : ev.id === 'rumbling' ? t.rumbleInfo : ''); // a note only where the event needs one
  renderSteps();
  renderWallStatus();
  renderCast();
  rebuildMap();
  renderDynamic();
  renderPlaybackButton();
}
function renderSteps() {
  const ev = events[S.idx],
    ul = $('#stepList');
  ul.replaceChildren();
  for (let i = 0; i < ev.beats.length; i++) {
    const li = document.createElement('li');
    const n = document.createElement('span');
    n.className = 'step-num';
    n.textContent = i + 1;
    li.append(n, document.createTextNode(tr(ev.beats[i])));
    ul.appendChild(li);
  }
  refreshSteps();
}
function refreshSteps() {
  const ev = events[S.idx];
  let i = Math.min(ev.beats.length - 1, Math.floor(S.p * ev.beats.length));
  for (const [j, el] of [...$('#stepList').children].entries()) el.className = j === i ? 'current' : j < i ? 'done' : '';
  $('#beatCount').textContent = `${i + 1} / ${ev.beats.length}`;
  $('#beatText').textContent = tr(ev.beats[i]);
  $('#sceneSlider').value = Math.round(S.p * 100);
  $('#scenePct').textContent = `${Math.round(S.p * 100)}%`;
  renderPopStatus();
}
// Status rows: how many Titans are where, and where people live.
let popSig = '';
function spriteIcon(cv) {
  // draws a figure from the sprite atlas into a small icon canvas (a plain dot until sprites exist)
  const g = cv.getContext('2d'), name = cv.dataset.sprite, at = STAGE.atlas;
  g.clearRect(0, 0, cv.width, cv.height);
  const f = at && at.frames[name] && at.frames[name].idle && at.frames[name].idle.f && at.frames[name].idle.f[0];
  if (f) { const k = Math.min(cv.width / f.w, cv.height / f.h); g.drawImage(at.canvas, f.x, f.y, f.w, f.h, (cv.width - f.w * k) / 2, cv.height - f.h * k, f.w * k, f.h * k); }
  else { g.fillStyle = name.startsWith('titan') ? '#e2b79b' : '#5d7c95'; g.beginPath(); g.arc(cv.width / 2, cv.height / 2, cv.width * 0.3, 0, 6.3); g.fill(); }
}
function renderPopStatus(force) {
  const el = $('#popStatus');
  if (!el) return;
  const t = TXT[S.lang], k = POP.counts(S.idx + S.p), order = ['outside', 'shig', 'maria', 'trost', 'rose', 'ragakoFixed', 'sina'];
  const fold = (o) => { const out = {}; for (const [z, n] of Object.entries(o)) { if (z === 'total') continue; const key = order.includes(z) ? z : 'districts'; out[key] = (out[key] || 0) + n; } return out; };
  const tz = fold(k.titan), cz = fold(k.civ);
  const titans = [...order, 'districts'].filter((z) => tz[z]).map((z) => t.popZones[z] + (z === 'ragakoFixed' ? '' : ' ' + tz[z])).join(t.popSep);
  const civs = [...order, 'districts'].filter((z) => cz[z]).map((z) => t.popZones[z]).join(t.popSep);
  const sig = [S.lang, k.titan.total, titans, civs, k.wallTitan > 0, STAGE.hasSprites].join('|');
  if (sig === popSig && !force) return;
  popSig = sig;
  el.replaceChildren();
  const rows = [['titan1', t.popTitans, k.titan.total ? t.popAbout + ' ' + k.titan.total : '', titans || t.popNone], ['civ1', t.popCivilians, '', civs]];
  if (k.wallTitan > 0) rows.push(['wallTitan', t.popWall, '', t.popWallNow]);
  for (const [sprite, label, n, where] of rows) {
    const row = document.createElement('div');
    row.className = 'pop-row';
    row.innerHTML = `<canvas width="30" height="34" data-sprite="${sprite}" aria-hidden="true"></canvas><b></b><span class="n"></span><span class="w"></span>`;
    row.querySelector('b').textContent = label;
    row.querySelector('.n').textContent = n;
    row.querySelector('.w').textContent = where;
    spriteIcon(row.querySelector('canvas'));
    el.appendChild(row);
  }
}
// The note over the map: shown only when there is something to say.
function setMapInfo(text) {
  const el = $('#mapInfo');
  el.textContent = text || '';
  el.hidden = !text;
}
// Tapping the lying Ragako Titan shows a short tag beside it and the full note in the map caption.
let lyingTag = null, lyingTagTimer = 0;
function showLyingTag(hit) {
  const t = TXT[S.lang];
  const crawl = !!hit.agent.crawl; // the crawling Titan has its own note
  setMapInfo(crawl ? t.popCrawlInfo : t.popLyingInfo);
  if (lyingTag) lyingTag.el.remove();
  const g = labelBox($('#pins') || $('#mapSvg'), crawl ? t.popCrawlTag : t.popLyingTag, 'l', 'point-label');
  lyingTag = { el: g, p: [hit.x, hit.y], dx: 22, dy: -6 };
  placePin(lyingTag);
  clearTimeout(lyingTagTimer);
  lyingTagTimer = setTimeout(() => { if (lyingTag) lyingTag.el.remove(); lyingTag = null; }, 6000);
}
function renderPopToggle() {
  const b = $('#popToggle');
  b.textContent = S.pop ? TXT[S.lang].popOn : TXT[S.lang].popOff;
  b.setAttribute('aria-pressed', String(S.pop));
}
function renderWallStatus() {
  const t = TXT[S.lang],
    st = wallState(S.idx),
    p = $('#wallStatus');
  p.replaceChildren();
  for (const id of ['maria', 'rose', 'sina']) {
    const v = st.w[id],
      d = document.createElement('div');
    d.className = 'wall-status ' + v + (prevWalls[id] && prevWalls[id] !== v ? ' changed' : '');
    prevWalls[id] = v;
    d.innerHTML = `<small>WALL</small><b>${id.toUpperCase()}</b><div class="state"></div>`;
    d.querySelector('.state').textContent = t.state[v];
    p.appendChild(d);
  }
  $('#gateStatus').replaceChildren(
    ...Object.keys(st.g).map((id) => {
      const c = document.createElement('span');
      c.className = 'gate-chip ' + st.g[id];
      c.innerHTML = '<i></i>';
      c.append(t.gates[id] + '：' + t.gstates[st.g[id]]);
      return c;
    }),
  );
}
function renderCast() {
  const p = $('#castList');
  p.replaceChildren();
  const ev = events[S.idx];
  $('#castCount').textContent = ev.characters.length;
  for (const [who, role] of ev.characters) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cast-item' + (S.actor === who ? ' active' : '');
    const a = document.createElement('span');
    a.className = 'avatar ' + (ev.routes.find((v) => v.who === who)?.type || '');
    a.classList.toggle('team-avatar', teamActors.has(who));
    a.classList.toggle('flag-avatar', FLAGS.has(who));
    const portrait = document.createElement('img');
    portrait.src = actorPortrait(who);
    portrait.alt = '';
    portrait.width = 48;
    portrait.height = 48;
    a.appendChild(portrait);
    if (FACTION[who]) a.insertAdjacentHTML('beforeend', icon('em-' + FACTION[who], 'faction'));
    const x = document.createElement('span');
    x.innerHTML = '<span class="name"></span><span class="role"></span>';
    x.querySelector('.name').textContent = tr(cast[who]);
    x.querySelector('.role').textContent = tr(role);
    b.append(a, x);
    b.onclick = () => {
      S.actor = S.actor === who ? null : who;
      renderCast();
      renderDynamic();
    };
    p.appendChild(b);
  }
}
// ---- Map overlay (SVG over the canvas) ----
// Routes live in a group that follows the camera; pins (markers, labels, marks) are placed in screen
// pixels so they keep their size at every zoom level.
let pins = [];
function placePin(pn) {
  const [x, y] = toScreen(pn.p);
  pn.el.setAttribute('transform', `translate(${(x + pn.dx).toFixed(1)} ${(y + pn.dy).toFixed(1)})`);
  if (pn.min !== undefined) pn.el.style.display = CAM.view.s >= pn.min && (pn.max === undefined || CAM.view.s <= pn.max) ? '' : 'none';
}
const pin = (el, p, dx = 0, dy = 0, extra = {}) => { const pn = { el, p, dx, dy, ...extra }; pins.push(pn); return pn; };
// A rounded label box around (0,0): align 'l' starts at the anchor, 'r' ends at it, 'c' is centred.
function labelBox(parent, text, align, cls) {
  const w = Math.max(30, [...text].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e7f ? 11.4 : 6.3), 0) + 14);
  const x0 = align === 'l' ? 0 : align === 'r' ? -w : -w / 2, g = group(parent, { class: cls });
  elem('rect', { x: x0, y: -10, width: w, height: 20, rx: 5 }, g);
  const tt = elem('text', { x: x0 + w / 2, y: 0.5 }, g);
  tt.textContent = text;
  return g;
}
// The camera moved: move the route group and every pin.
function applyCamera() {
  const v = CAM.view, fr = $('#frame');
  if (fr) fr.setAttribute('transform', `translate(${(CAM.vw / 2 - v.x * v.s).toFixed(2)} ${(CAM.vh / 2 - v.y * v.s).toFixed(2)}) scale(${v.s.toFixed(4)})`);
  for (const pn of pins) placePin(pn);
  if (lyingTag) placePin(lyingTag);
  const lim = Camera.limits(World, CAM.vw, CAM.vh, MAX_SCALE), sl = $('#zoomSlider');
  if (sl && document.activeElement !== sl) sl.value = Math.round(Camera.scaleToSlider(v.s, lim) * 100);
}
function rebuildMap() {
  const fk = document.activeElement?.closest?.('#mapSvg') ? document.activeElement.dataset.key : null;
  queueMicrotask(() => {
    if (fk) $('#mapSvg [data-key="' + fk + '"]')?.focus({ preventScroll: true });
  });
  const svgEl = $('#mapSvg');
  svgEl.replaceChildren();
  pins = [];
  sceneRoutes = [];
  sceneEffects = [];
  const ev = events[S.idx];
  lastWallSignature = JSON.stringify(wallState(S.idx));
  const defs = elem('defs', {}, svgEl);
  for (const [k, c] of Object.entries(routeColors)) {
    const g = elem('radialGradient', { id: 'halo-' + k }, defs);
    elem('stop', { offset: 0, 'stop-color': c, 'stop-opacity': 0.55 }, g);
    elem('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, g);
  }
  const frame = group(svgEl, { id: 'frame' }),
    hits = group(frame, { id: 'hits' }),
    routesLayer = group(frame, { id: 'routes' }),
    pinLayer = group(svgEl, { id: 'pins' }),
    labelLayer = group(pinLayer, { id: 'labels', 'pointer-events': 'none' }),
    routePins = group(pinLayer, { id: 'routePins', 'pointer-events': 'none' }),
    fxLayer = group(pinLayer, { id: 'effects', 'pointer-events': 'none' }),
    actorsLayer = group(pinLayer, { id: 'actors' });
  // Places you can click to filter events
  for (const loc of locations) {
    const nm = tr(labels[loc.key]);
    const hit = elem('circle', { cx: loc.p[0], cy: loc.p[1], r: loc.r, class: 'place-hit', 'data-key': loc.key, tabindex: '0', role: 'button', 'aria-label': nm + ' — ' + TXT[S.lang].clickloc }, hits);
    const choose = () => chooseLocation(loc.key, loc.wall);
    hit.addEventListener('click', choose);
    hit.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), choose()));
  }
  // Place labels and the three Wall name tags
  for (const L of MAP_LABELS) if (!L.since || S.idx >= events.findIndex((e) => e.id === L.since)) pin(labelBox(labelLayer, tr(L.text), L.align, 'point-label' + (L.minor ? ' minor' : '')), L.p, L.dx, L.dy, { min: L.min, max: L.max });
  for (const [id, zh, en, ja, deg] of [['maria', '瑪利亞之牆', 'Wall Maria', 'ウォール・マリア', -132], ['rose', '羅塞之牆', 'Wall Rose', 'ウォール・ローゼ', -138], ['sina', '席納之牆', 'Wall Sina', 'ウォール・シーナ', -146]]) {
    const g = labelBox(labelLayer, tr(C(zh, en, ja)), 'r', 'wall-tag');
    g.setAttribute('data-wall', id);
    pin(g, World.at(World.R[id], deg), -4, -8, { min: 0.62 });
  }
  if (S.enterRoutes) {
    routesLayer.classList.add('routes-enter');
    S.enterRoutes = false;
  }
  for (let i = 0; i < ev.routes.length; i++) {
    const R = ev.routes[i],
      pts = R.path.map(coord),
      geo = RouteGeo.build(pts, R.uncertain ? 0.7 : 1),
      col = routeColors[R.type] || routeColors.neutral,
      cls = (routeClass[R.type] || 'neutral') + (R.uncertain ? ' uncertain' : '');
    const gr = group(routesLayer, { class: 'route ' + cls, style: '--rc:' + col + ';--d:' + i * 90 + 'ms' });
    elem('path', { d: geo.d, class: 'r-plan-case' }, gr);
    elem('path', { d: geo.d, class: 'r-plan' }, gr);
    const trail = ['r-trail-case', 'r-trail-glow', 'r-trail', 'r-flow'].map((c) => elem('path', { d: '', class: c }, gr));
    const ends = group(routePins, { class: 'route ' + cls, style: '--rc:' + col });
    pin(elem('circle', { r: 3, class: 'r-start' }, ends), pts[0]);
    const endG = group(ends, { class: 'r-end' });
    elem('circle', { r: 5.5, class: 'r-end-ring' }, endG);
    elem('circle', { r: 5.5, class: 'r-end-pulse' }, endG);
    pin(endG, pts[pts.length - 1]);
    const ag = group(actorsLayer, { class: 'actor-bubble ' + cls, 'data-actor': R.who, style: '--rc:' + col });
    elem('circle', { r: 24, class: 'actor-halo', fill: 'url(#halo-' + (R.type in routeColors ? R.type : 'neutral') + ')' }, ag);
    elem('circle', { r: 14, cx: 0, cy: 0, fill: col, stroke: col, 'stroke-width': 3 }, ag);
    const clipId = 'portrait-clip-' + i;
    const clip = elem('clipPath', { id: clipId }, ag);
    elem('circle', { r: 13, cx: 0, cy: 0 }, clip);
    const txt = elem('image', { href: actorPortrait(R.who), x: -13, y: -13, width: 26, height: 26, preserveAspectRatio: teamActors.has(R.who) && !FLAGS.has(R.who) ? 'xMidYMid meet' : 'xMidYMid slice', 'clip-path': 'url(#' + clipId + ')' }, ag);
    elem('circle', { r: 15.6, class: 'actor-ring2' }, ag);
    elem('circle', { r: 15.6, class: 'shift-flash' }, ag);
    const title = elem('title', {}, ag);
    title.textContent = tr(cast[R.who] || C(R.who, R.who));
    sceneRoutes.push({ R, geo, trail, endG, ends, ag, gr, txt, title, lastV: -1, arrived: false });
  }
  for (const m of ev.marks) {
    const gr = group(fxLayer);
    if (m.kind === 'breach' || m.kind === 'repair' || m.kind === 'collapse') {
      elem('circle', { r: 17, class: 'effect-pulse ' + (m.kind === 'repair' ? 'repair' : 'attack') }, gr);
      const ch = elem('text', { y: 7, 'text-anchor': 'middle', fill: m.kind === 'repair' ? '#95ecbc' : '#ff7771', class: 'mark-text' }, gr);
      ch.textContent = m.kind === 'repair' ? '✓' : m.kind === 'collapse' ? '◌' : '×';
    } else {
      elem('circle', { r: 16, class: 'effect-pulse ' + (m.kind === 'reveal' ? 'reveal' : m.kind === 'defend' ? 'defend' : 'attack') }, gr);
      elem('circle', { r: 4, fill: m.kind === 'reveal' ? '#f1ce83' : '#fff' }, gr);
    }
    if (m.label) {
      const title = elem('title', {}, gr);
      title.textContent = tr(m.label);
    }
    pin(gr, coord(m.point));
    sceneEffects.push({ gr, at: m.at ?? 0.07 });
  }
  applyCamera();
}
function chooseLocation(key, wall) {
  S.wall = wall;
  S.cat = 'all';
  filterEvents();
  const i = visible.find((i) => events[i].place === key);
  if (i !== undefined) selectEvent(i);
  setMapInfo(tr(labels[key]) + ' · ' + TXT[S.lang].clickloc);
}
function renderDynamic() {
  const st = wallState(S.idx);
  const sig = JSON.stringify(st);
  if (sig !== lastWallSignature) {
    renderWallStatus();
    lastWallSignature = sig;
  }
  const ev = events[S.idx];
  const flags = S.actor;
  const portraitPhase = (ev.id === 'marcel' ? (S.p < 2 / 3 ? 0 : 1) : -1) + '|' + ev.characters.map(([who]) => titanFormAt(ev.id, who, S.p) || '').join('|'); // human or Titan, per character
  if (portraitPhase !== castPortraitPhase) {
    castPortraitPhase = portraitPhase;
    renderCast();
  }
  for (const entry of sceneRoutes) {
    const { R, geo, trail, endG, ends, ag, gr } = entry;
    const f = (S.p - R.start) / Math.max(0.001, R.end - R.start),
      vis = f >= 0 && (R.hideAt === undefined || S.p < R.hideAt);
    const v = RouteGeo.ease(Math.max(0, Math.min(1, f)));
    const pos = RouteGeo.at(geo.tab, v);
    // marker position in screen pixels, kept inside the map frame
    const [sx, sy] = toScreen([pos.x, pos.y]);
    const x = Math.max(16, Math.min(CAM.vw - 16, sx + (R.offset?.[0] || 0))),
      y = Math.max(16, Math.min(CAM.vh - 16, sy + (R.offset?.[1] || 0)));
    const face = actorPortrait(R.who);
    if (face !== entry.face) {
      // the portrait follows the character's form; a flash marks the transformation
      const titan = !!titanFormAt(ev.id, R.who, S.p);
      entry.txt.setAttribute('href', face);
      if (entry.face !== undefined && titan !== entry.titan && vis && !REDUCED) {
        ag.classList.remove('shift');
        void ag.getBoundingClientRect();
        ag.classList.add('shift');
      }
      entry.face = face;
      entry.titan = titan;
    }
    const moving = f > 0 && f < 1;
    ag.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(moving ? 1.08 : 1) * (entry.titan ? 1.24 : 1)})`);
    ag.style.opacity = vis ? '1' : '0';
    ag.classList.toggle('moving', moving && vis);
    if (Math.abs(v - entry.lastV) > 0.0004) {
      const d = RouteGeo.slice(geo.tab, v);
      for (const p of trail) p.setAttribute('d', d);
      entry.lastV = v;
    }
    const arrived = f >= 1;
    if (arrived !== entry.arrived) {
      entry.arrived = arrived;
      endG.classList.toggle('arrived', arrived);
    }
    const dim = Boolean(flags && flags !== R.who);
    ag.classList.toggle('dim', dim);
    for (const el of [gr, ends]) {
      el.classList.toggle('dim', dim);
      el.classList.toggle('pending', f < 0);
      el.classList.toggle('gone', f >= 0 && !vis);
    }
  }
  for (const { gr, at } of sceneEffects) gr.style.opacity = S.p >= at ? '1' : '0';
  refreshSteps();
}
const LANG_TAG = { zh: 'zh-Hant', en: 'en', ja: 'ja' };
function updateLang() {
  document.documentElement.lang = LANG_TAG[S.lang];
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = TXT[S.lang][el.dataset.i18n];
  for (const b of document.querySelectorAll('#langSwitch [data-lang]')) b.setAttribute('aria-pressed', String(b.dataset.lang === S.lang));
  renderAutoBtn();
  renderMiniKey();
  paintEvent();
  buildFilters();
  renderPopToggle();
  if (typeof fitLayout === 'function') requestAnimationFrame(fitLayout);
}
function renderPlaybackButton() {
  const btn = $('#playBtn');
  btn.innerHTML = (S.playing ? 'Ⅱ ' : '▶ ') + (S.playing ? TXT[S.lang].pause : TXT[S.lang].play);
  btn.setAttribute('aria-pressed', String(S.playing));
}
function advanceEvent(delta) {
  const pos = visible.indexOf(S.idx),
    next = Math.min(visible.length - 1, Math.max(0, pos + delta));
  selectEvent(visible[next]);
}
// ---- Camera: follows the story while playing, yours when you take over ----
// The box the camera should show: the whole event when paused, the action of the moment while playing.
function sceneBox(tracking) {
  const ev = events[S.idx], pts = [];
  if (ev.frame === 'island') {
    // the Rumbling: the whole island when paused; while playing, the Walls first and then outward with the columns
    const reach = tracking ? Math.max(World.R.maria + 70, POP.rumble.front(S.idx + S.p) + 110) : 1e4, c0 = World.C;
    return { x0: Math.max(0, c0[0] - reach), y0: Math.max(0, c0[1] - reach), x1: Math.min(World.W, c0[0] + reach), y1: Math.min(World.H, c0[1] + reach) };
  }
  for (const m of ev.marks) if (!tracking || Math.abs((m.at ?? 0.07) - S.p) < 0.25) pts.push(coord(m.point));
  for (const en of sceneRoutes) {
    const R = en.R;
    if (!tracking) { for (const p of R.path) pts.push(coord(p)); continue; }
    if (S.p < R.start - 0.12 || S.p > R.end + 0.14 || (R.hideAt !== undefined && S.p > R.hideAt)) continue;
    const f = Math.max(0, Math.min(1, (S.p - R.start) / Math.max(0.001, R.end - R.start)));
    for (const ff of [f, Math.min(1, f + 0.3)]) { const q = RouteGeo.at(en.geo.tab, RouteGeo.ease(ff)); pts.push([q.x, q.y]); }
  }
  if (!ev.routes.length || !pts.length) { const r = World.R.maria + 48; return { x0: World.C[0] - r, y0: World.C[1] - r, x1: World.C[0] + r, y1: World.C[1] + r }; } // the three Walls
  return Camera.boxOf(pts, tracking ? 250 : 300);
}
function sceneView(tracking) {
  const v = Camera.frame(sceneBox(tracking), World, CAM.vw, CAM.vh, PHONE ? 34 : 62, MAX_SCALE);
  return Camera.constrain({ ...v, s: Math.min(v.s, AUTO_MAX) }, World, CAM.vw, CAM.vh, MAX_SCALE);
}
function setAuto(on) {
  CAM.auto = on;
  CAM.retarget = on;
  renderAutoBtn();
}
// The auto-camera switch says in words whether the camera follows the story.
function renderAutoBtn() {
  const b = $('#zoomReset');
  b.setAttribute('aria-pressed', String(CAM.auto));
  b.textContent = CAM.auto ? TXT[S.lang].camOn : TXT[S.lang].camOff;
}
// You moved the map: the camera stops following until you switch auto camera back on or press Play.
function userView(v) {
  setAuto(false);
  CAM.target = null;
  CAM.view = Camera.constrain(v, World, CAM.vw, CAM.vh, MAX_SCALE);
  CAM.moved = true;
}
function fitView() {
  if (CAM.auto) CAM.retarget = true;
}
// ---- Mini map: the whole island in the corner, with a coloured dot for everything that moves ----
const MINI = { el: $('#miniMap'), cv: $('#miniCanvas'), tick: 0, drag: false, every: QUALITY === 'low' ? 10 : 6 };
const MINI_COL = { titan: '#ff9b6b', wallTitan: '#ff4d4d', civ: '#7fd0ff', rider: '#8de5ba', boat: '#ffffff', cast: '#ffd24a' };
const MINI_STILL = { reduced: true }; // dots do not need the wandering
function renderMiniKey() {
  const t = TXT[S.lang];
  $('#miniKey').innerHTML = [['titan', t.mmTitan], ['civ', t.mmCiv], ['rider', t.mmScout], ['cast', t.mmCast]].map(([k, label]) => '<span><i style="background:' + MINI_COL[k] + '"></i>' + label + '</span>').join('');
}
function drawMini(T) {
  const cv = MINI.cv, w = cv.clientWidth, h = cv.clientHeight;
  if (!w) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const g = cv.getContext('2d'), k = cv.width / World.W, C0 = World.C;
  g.clearRect(0, 0, cv.width, cv.height);
  // the island
  g.beginPath();
  World.coast.forEach((p, i) => (i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)));
  g.closePath();
  g.fillStyle = '#4a6a44'; g.fill();
  g.strokeStyle = '#a9cdd2'; g.lineWidth = 0.8 * dpr; g.stroke();
  // the railways laid so far
  g.strokeStyle = 'rgba(24,20,18,.85)'; g.lineWidth = 0.9 * dpr;
  for (const rl of TERRAIN.rails) {
    if (T <= rl.T0 || (rl.wreck && POP.rumble.front(T) > World.R.maria + 40)) continue; // wrecked by the Rumbling
    const f = Math.min(1, (T - rl.T0) / (rl.T1 - rl.T0));
    g.beginPath();
    for (let i = 0; i <= 14; i++) { const q = RouteGeo.at(rl.geo.tab, (f * i) / 14); if (i) g.lineTo(q.x * k, q.y * k); else g.moveTo(q.x * k, q.y * k); }
    g.stroke();
  }
  // the three Walls: standing, lost or fallen
  const st = wallState(S.idx);
  g.lineWidth = dpr;
  for (const name of ['maria', 'rose', 'sina']) {
    const fallen = st.w[name] === 'collapsed';
    g.strokeStyle = fallen ? 'rgba(236,229,207,.3)' : st.w[name] === 'lost' ? '#ff8a4a' : st.w[name] === 'breached' ? '#ffc169' : '#f1ead6';
    g.setLineDash(fallen ? [2 * dpr, 3 * dpr] : []);
    g.beginPath(); g.arc(C0[0] * k, C0[1] * k, World.R[name] * k, 0, 6.2832); g.stroke();
  }
  g.setLineDash([]);
  // everything that moves: people first, Titans on top
  if (S.pop) {
    for (const pass of [0, 1]) {
      for (const a of POP.agents) {
        const big = a.kind === 'titan' || a.kind === 'wallTitan';
        if (big !== (pass === 1) || T < a.t0 || T > a.t1) continue;
        const s = POP.stateAt(a, T, 0, MINI_STILL);
        if (s.vis < 0.3) continue;
        const r = (big ? 1.2 : 1) * dpr;
        g.fillStyle = MINI_COL[a.kind] || '#fff';
        g.fillRect(s.x * k - r, s.y * k - r, r * 2, r * 2);
      }
    }
  }
  // the characters on their routes
  for (const en of sceneRoutes) {
    const R = en.R, f = (S.p - R.start) / Math.max(0.001, R.end - R.start);
    if (f < 0 || (R.hideAt !== undefined && S.p >= R.hideAt) || R.who === 'pure' || R.who === 'civ') continue;
    const q = RouteGeo.at(en.geo.tab, RouteGeo.ease(Math.max(0, Math.min(1, f))));
    g.beginPath(); g.arc(q.x * k, q.y * k, 2.6 * dpr, 0, 6.2832);
    g.fillStyle = MINI_COL.cast; g.fill();
    g.strokeStyle = '#201a10'; g.lineWidth = 0.8 * dpr; g.stroke();
  }
  // the part of the map that is on screen
  const v = CAM.view;
  g.strokeStyle = '#ffffff'; g.lineWidth = 1.2 * dpr;
  g.strokeRect((v.x - CAM.vw / 2 / v.s) * k, (v.y - CAM.vh / 2 / v.s) * k, (CAM.vw / v.s) * k, (CAM.vh / v.s) * k);
}
// Click or drag on the mini map to look there.
function miniGo(ev) {
  const r = MINI.cv.getBoundingClientRect();
  userView({ x: ((ev.clientX - r.left) / r.width) * World.W, y: ((ev.clientY - r.top) / r.height) * World.H, s: CAM.view.s });
}
MINI.el.addEventListener('pointerdown', (ev) => {
  ev.stopPropagation(); // not a drag of the big map
  MINI.drag = true;
  MINI.el.setPointerCapture(ev.pointerId);
  miniGo(ev);
});
MINI.el.addEventListener('pointermove', (ev) => MINI.drag && miniGo(ev));
for (const type of ['pointerup', 'pointercancel']) MINI.el.addEventListener(type, () => (MINI.drag = false));
renderMiniKey();
// ---- Key scenes: a cut-in card in the middle of the map, only while the story plays with the auto camera on ----
const CUT = { el: $('#cutin'), active: null, until: 0, out: false, seen: -1 };
const cutSrc = (pic) => (pic.startsWith('titan:') ? 'assets/scenes/titans/' : 'assets/scenes/') + pic.split(':')[1] + '.webp';
const cutFallback = (pic) => (pic.startsWith('titan:') && typeof titanPortraits !== 'undefined' ? titanPortraits[pic.split(':')[1]] : null); // the small embedded picture, when the page was copied on its own
function showCut(ev, k, now) {
  const el = CUT.el, card = document.createElement('div'), frame = document.createElement('div'), inner = document.createElement('div'), pics = document.createElement('div');
  card.className = 'cutin-card fx-' + k.fx + ' n' + k.pics.length;
  frame.className = 'cutin-frame';
  inner.className = 'cutin-inner';
  pics.className = 'cutin-pics';
  for (const p of k.pics) {
    const w = document.createElement('div'), img = document.createElement('img');
    w.className = 'cutin-pic';
    img.alt = '';
    img.onerror = () => {
      const fb = cutFallback(p);
      if (fb && img.src !== fb) img.src = fb;
      else endCut(); // no picture at all: skip the cut-in
    };
    img.src = cutSrc(p);
    w.appendChild(img);
    pics.appendChild(w);
  }
  inner.appendChild(pics);
  inner.insertAdjacentHTML('beforeend', '<div class="cutin-lines"></div><div class="cutin-flash"></div>' + (k.fx === 'transform' ? '<svg class="cutin-bolt" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="54,0 36,46 50,46 38,100 68,38 54,38 64,0"/></svg>' : '') + '<div class="cutin-cap"><span class="cutin-year"></span><strong></strong></div>');
  inner.querySelector('.cutin-year').textContent = yearText(ev.year);
  inner.querySelector('.cutin-cap strong').textContent = tr(ev.beats[k.beat]);
  frame.appendChild(inner);
  card.appendChild(frame);
  card.onclick = endCut; // tap to skip
  el.replaceChildren(card);
  el.className = 'cutin';
  el.hidden = false;
  $('.map-viewport').classList.toggle('quake', k.fx === 'breach');
  CUT.active = k;
  CUT.out = false;
  CUT.until = now + Math.max(1400, Math.min(2800, 2600 / Math.pow(S.speed, 0.6))); // shorter at faster playback
}
function endCut() {
  if (!CUT.active) return;
  CUT.active = null;
  CUT.el.hidden = true;
  CUT.el.replaceChildren();
  $('.map-viewport').classList.remove('quake');
}
// If frames run slow for a while, the crowd's logic steps down to every 2nd, then every 3rd frame.
const LOAD = { ema: 0.016, frames: 0 };
function animate(t) {
  const dt = S.lastTime ? Math.min(0.1, (t - S.lastTime) / 1000) : 0;
  S.lastTime = t;
  if (dt > 0 && dt < 0.07 && t > 5000 && document.visibilityState === 'visible') { // ignore start-up and one-off stalls
    LOAD.ema += (dt - LOAD.ema) * 0.03;
    if (++LOAD.frames > 150 && LOAD.ema > 0.024) { STAGE.slower(); LOAD.frames = 0; LOAD.ema = 0.016; }
  }
  if (CUT.active) {
    // a key scene is on: the story holds until it is over (or playback or the auto camera is switched off)
    if (!S.playing || !CAM.auto || t >= CUT.until) endCut();
    else if (!CUT.out && t >= CUT.until - 320) { CUT.out = true; CUT.el.classList.add('out'); }
  }
  if (CUT.seen !== S.idx) { CUT.seen = S.idx; for (const k of KEY_SCENES[events[S.idx].id] || []) for (const p of k.pics) new Image().src = cutSrc(p); } // have this event's pictures ready
  if (S.playing && !CUT.active) {
    const i0 = S.idx, p0 = S.p;
    S.p += (dt * 1000) / (13000 / (S.speed * (EVENT_PACE[events[S.idx].id] || 1)));
    if (CAM.auto && !REDUCED && S.idx === i0) {
      const k = (KEY_SCENES[events[i0].id] || []).find((c) => p0 < c.at && S.p >= c.at);
      if (k) { S.p = k.at; showCut(events[i0], k, t); }
    }
    if (S.p >= 1) {
      const pos = visible.indexOf(S.idx);
      if (pos < visible.length - 1) selectEvent(visible[pos + 1], { keepPlaying: true });
      else {
        S.p = 1;
        S.playing = false;
        renderPlaybackButton();
      }
    }
  }
  if (CAM.auto && (S.playing || CAM.retarget)) {
    CAM.target = sceneView(S.playing);
    CAM.retarget = false;
  }
  if (CAM.target) {
    const n = REDUCED ? { ...CAM.target, done: true } : Camera.step(CAM.view, CAM.target, dt, CAM.rate);
    CAM.view = { x: n.x, y: n.y, s: n.s };
    if (n.done) CAM.target = null;
    CAM.moved = true;
  }
  if (CAM.moved) applyCamera();
  if (S.playing || CAM.moved) renderDynamic();
  CAM.moved = false;
  const light = lightAt(S.idx, S.p), awake = events[S.idx].nightActive ? 1 : Math.max(0, Math.min(1, (light - 0.2) / 0.4)); // Titans stop at night, except at Utgard
  renderDayChip(light);
  STAGE.draw(CAM.view, { T: S.idx + S.p, t: t / 1000, dt, walls: wallState(S.idx), crowd: S.pop, reduced: REDUCED, light, awake, flares: flaresNow() });
  if (MINI.tick++ % MINI.every === 0) drawMini(S.idx + S.p);
  requestAnimationFrame(animate);
}
// Signal flares of the long-range scouting formation (57th expedition): fired at set moments of the scene.
const FLARES = [[0.2, 44, '#e2473b'], [0.24, 24, '#e2473b'], [0.29, 0, '#59c36a'], [0.36, -32, '#262626'], [0.42, 36, '#e2473b'], [0.47, 0, '#59c36a'], [0.56, -20, '#59c36a'], [0.63, 30, '#262626']];
const NO_FLARES = [];
function flaresNow() {
  if (events[S.idx].id !== 'female-forest') return NO_FLARES;
  const en = sceneRoutes.find((e) => e.R.who === 'scouts');
  if (!en) return NO_FLARES;
  const out = [];
  for (const [p, side, color] of FLARES) {
    const f = (S.p - p) / 0.11;
    if (f < 0 || f > 1) continue;
    const q = RouteGeo.at(en.geo.tab, RouteGeo.ease(Math.max(0, Math.min(1, (p - en.R.start) / (en.R.end - en.R.start)))));
    out.push({ x: q.x - Math.sin(q.angle) * side, y: q.y + Math.cos(q.angle) * side, color, f });
  }
  return out;
}
// Time of day shown on the map.
let dayChipSig = '';
function renderDayChip(light) {
  const t = TXT[S.lang], key = light > 0.75 ? 'dayDay' : light > 0.28 ? 'dayDusk' : events[S.idx].nightActive ? 'dayMoon' : 'dayNight', sig = S.lang + key;
  if (sig === dayChipSig) return;
  dayChipSig = sig;
  const el = $('#dayChip');
  el.textContent = (key === 'dayDay' ? '☀ ' : key === 'dayDusk' ? '◐ ' : '☾ ') + t[key];
  el.className = 'day-chip ' + key;
}
// Short scenes play faster than the rest (multiplies the chosen speed).
const EVENT_PACE = { founding: 2.5, grisha: 2, rumbling: 0.6, rebuild: 0.6 }; // the Rumbling plays slower: there is a lot to watch
$('#playBtn').addEventListener('click', () => {
  if (!S.playing && S.p >= 1) {
    const at = visible.indexOf(S.idx);
    if (at < visible.length - 1) selectEvent(visible[at + 1]);
    else S.p = 0;
  }
  S.playing = !S.playing;
  renderPlaybackButton();
});
$('#prevBtn').onclick = () => advanceEvent(-1);
$('#nextBtn').onclick = () => advanceEvent(1);
// Mouse dragging scrolls the event strip; touch retains native swipe scrolling.
const eventStrip = $('#eventCards');
let stripDrag = null;
let suppressStripClick = false;
eventStrip.addEventListener('pointerdown', (ev) => {
  if (ev.pointerType !== 'mouse' || ev.button !== 0) return;
  suppressStripClick = false;
  stripDrag = { id: ev.pointerId, x: ev.clientX, left: eventStrip.scrollLeft, moved: false };
});
eventStrip.addEventListener('pointermove', (ev) => {
  if (!stripDrag || ev.pointerId !== stripDrag.id) return;
  const dx = ev.clientX - stripDrag.x;
  if (!stripDrag.moved && Math.abs(dx) > 5) {
    stripDrag.moved = true;
    eventStrip.setPointerCapture(ev.pointerId);
    eventStrip.classList.add('dragging');
  }
  if (stripDrag.moved) {
    ev.preventDefault();
    eventStrip.scrollLeft = stripDrag.left - dx;
  }
});
function finishStripDrag(ev) {
  if (!stripDrag || ev.pointerId !== stripDrag.id) return;
  suppressStripClick = stripDrag.moved;
  if (eventStrip.hasPointerCapture(ev.pointerId)) eventStrip.releasePointerCapture(ev.pointerId);
  stripDrag = null;
  eventStrip.classList.remove('dragging');
}
window.addEventListener('pointerup', finishStripDrag);
window.addEventListener('pointercancel', finishStripDrag);
eventStrip.addEventListener(
  'click',
  (ev) => {
    if (suppressStripClick) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      suppressStripClick = false;
    }
  },
  true,
);
$('#eventSlider').oninput = (ev) => selectEvent(visible[Number(ev.target.value)]);
$('#sceneSlider').oninput = (ev) => {
  S.playing = false;
  S.p = Number(ev.target.value) / 100;
  renderPlaybackButton();
  renderDynamic();
};
$('#speedSel').onchange = (ev) => (S.speed = Number(ev.target.value));
$('#langSwitch').onclick = (ev) => {
  const b = ev.target.closest('[data-lang]');
  if (!b || b.dataset.lang === S.lang) return;
  S.lang = b.dataset.lang;
  updateLang();
};
// ---- Zoom and pan: mouse wheel, the zoom slider and buttons, drag, and two-finger pinch ----
const mapViewport = $('.map-viewport');
const viewportPoint = (ev) => {
  const r = mapViewport.getBoundingClientRect();
  return [ev.clientX - r.left, ev.clientY - r.top];
};
function zoomBy(factor, px = CAM.vw / 2, py = CAM.vh / 2) {
  userView(Camera.zoomAt(CAM.view, factor, px, py, World, CAM.vw, CAM.vh, MAX_SCALE));
}
mapViewport.addEventListener(
  'wheel',
  (ev) => {
    ev.preventDefault();
    const [px, py] = viewportPoint(ev);
    zoomBy(Math.exp(-ev.deltaY * (ev.deltaMode === 1 ? 0.05 : 0.0016)), px, py);
  },
  { passive: false },
);
$('#zoomIn').onclick = () => zoomBy(1.35);
$('#zoomOut').onclick = () => zoomBy(1 / 1.35);
$('#zoomReset').onclick = () => {
  if (CAM.auto) CAM.target = null; // switching off leaves the view where it is
  setAuto(!CAM.auto);
};
$('#zoomSlider').oninput = (ev) => {
  const lim = Camera.limits(World, CAM.vw, CAM.vh, MAX_SCALE);
  zoomBy(Camera.sliderToScale(ev.target.value / 100, lim) / CAM.view.s);
};
const pointers = new Map();
let gesture = null,
  suppressMapClick = false;
function startGesture() {
  const pts = [...pointers.values()];
  if (pts.length === 1) gesture = { kind: 'pan', start: pts[0], view: { ...CAM.view }, moved: false };
  else if (pts.length >= 2) {
    const [a, b] = pts;
    gesture = { kind: 'pinch', d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], view: { ...CAM.view }, moved: true };
  }
}
mapViewport.addEventListener('pointerdown', (ev) => {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  pointers.set(ev.pointerId, viewportPoint(ev));
  suppressMapClick = false;
  startGesture();
});
// Dragging the map must never select its labels or start a drag-and-drop: either one cancels the pan.
for (const type of ['selectstart', 'dragstart']) mapViewport.addEventListener(type, (ev) => ev.preventDefault());
mapViewport.addEventListener('pointermove', (ev) => {
  if (!pointers.has(ev.pointerId) || !gesture) return;
  if (ev.pointerType === 'mouse' && !(ev.buttons & 1)) return endPointer(ev); // the button was released outside the map
  pointers.set(ev.pointerId, viewportPoint(ev));
  const pts = [...pointers.values()];
  if (gesture.kind === 'pan' && pts.length === 1) {
    const dx = pts[0][0] - gesture.start[0],
      dy = pts[0][1] - gesture.start[1];
    if (!gesture.moved && Math.hypot(dx, dy) > 5) {
      gesture.moved = true;
      mapViewport.setPointerCapture(ev.pointerId);
      mapViewport.classList.add('panning');
    }
    if (gesture.moved) {
      ev.preventDefault();
      userView({ x: gesture.view.x - dx / gesture.view.s, y: gesture.view.y - dy / gesture.view.s, s: gesture.view.s });
    }
  } else if (gesture.kind === 'pinch' && pts.length >= 2) {
    const [a, b] = pts,
      d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1,
      mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const v = Camera.zoomAt(gesture.view, d / gesture.d, gesture.mid[0], gesture.mid[1], World, CAM.vw, CAM.vh, MAX_SCALE);
    userView({ x: v.x - (mid[0] - gesture.mid[0]) / v.s, y: v.y - (mid[1] - gesture.mid[1]) / v.s, s: v.s });
  }
});
function endPointer(ev) {
  if (!pointers.has(ev.pointerId)) return;
  pointers.delete(ev.pointerId);
  if (gesture && gesture.moved) suppressMapClick = true;
  if (mapViewport.hasPointerCapture(ev.pointerId)) mapViewport.releasePointerCapture(ev.pointerId);
  mapViewport.classList.remove('panning');
  gesture = null;
  if (pointers.size) startGesture();
}
mapViewport.addEventListener('pointerup', endPointer);
mapViewport.addEventListener('pointercancel', endPointer);
mapViewport.addEventListener(
  'click',
  (ev) => {
    if (suppressMapClick) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      suppressMapClick = false;
      return;
    }
    const [px, py] = viewportPoint(ev),
      hit = STAGE.lyingAt(CAM.view, px, py);
    if (hit) showLyingTag(hit);
  },
  true,
);
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement?.tagName)) return;
  if (e.code === 'Space') {
    e.preventDefault();
    $('#playBtn').click();
  }
  if (e.code === 'ArrowRight') advanceEvent(1);
  if (e.code === 'ArrowLeft') advanceEvent(-1);
});
// ---- Start ----
function resizeMap() {
  const w = mapViewport.clientWidth,
    h = mapViewport.clientHeight;
  if (!w || !h) return;
  CAM.vw = w;
  CAM.vh = h;
  STAGE.resize(w, h);
  $('#mapSvg').setAttribute('viewBox', `0 0 ${w} ${h}`);
  CAM.view = Camera.constrain(CAM.view, World, w, h, MAX_SCALE);
  if (CAM.auto) CAM.retarget = true;
  CAM.moved = true;
}
for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = TXT[S.lang][el.dataset.i18n]; // page text comes from TXT
resizeMap();
CAM.view = Camera.whole(World, CAM.vw, CAM.vh); // open on the whole island, then ease to the first scene
filterEvents();
renderPopToggle();
STAGE.paintMap(() => (CAM.moved = true));
setTimeout(() => {
  STAGE.loadSprites();
  document.querySelectorAll('canvas.pop-key').forEach(spriteIcon);
  renderPopStatus(true);
}, 30);
$('#popToggle').onclick = () => {
  S.pop = !S.pop;
  try {
    localStorage.setItem('aot-walls:population:v1', S.pop ? 'on' : 'off');
  } catch (e) {}
  renderPopToggle();
};
$('#playBtn').addEventListener('click', () => {
  if (S.playing) setAuto(true); // pressing Play hands the camera back to the story
});
for (const p of document.querySelectorAll('.panel')) for (const c of ['tl', 'tr', 'bl', 'br']) p.insertAdjacentHTML('beforeend', `<svg class="corner ${c}" viewBox="0 0 40 40" aria-hidden="true"><use href="#orn-corner"/></svg>`);
requestAnimationFrame(animate);
new ResizeObserver(resizeMap).observe(mapViewport);
function fitLayout() {
  const L = $('.layout');
  $('.map-panel').style.setProperty('--tbh', $('.transport-bar').offsetHeight + 'px');
  if (innerWidth < 1121) {
    L.style.removeProperty('--reserve');
    return;
  }
  for (let i = 0; i < 2; i++) {
    const panel = $('.map-panel').getBoundingClientRect(),
      vis = mapViewport.getBoundingClientRect();
    const reserve = Math.round(panel.top + scrollY + (panel.bottom - vis.bottom) + 14);
    if (Math.abs(reserve - (parseFloat(L.style.getPropertyValue('--reserve')) || 0)) < 2) break;
    L.style.setProperty('--reserve', reserve + 'px');
  }
}
fitLayout();
addEventListener('resize', fitLayout);
if (document.fonts) document.fonts.ready.then(fitLayout);
