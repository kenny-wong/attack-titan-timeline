/* Story text for the 28 events: titles, descriptions, outcomes, step texts, cast roles and the wall/gate state after each event.
   The movement on the map (routes and marks) is in story.js. Scene labels are original editorial summaries, not dialogue. */
const EVENT_TEXT = [
  {
    id: 'founding',
    year: '743',
    category: 'reveal',
    wall: 'all',
    place: 'mitras',
    title: {
      zh: '三道城牆建立',
      en: 'The three Walls are created',
    },
    description: {
      zh: '卡爾·弗利茲利用始祖巨人之力建立瑪利亞、羅塞、席納三道城牆。牆身隱藏大量巨人。',
      en: 'Karl Fritz uses the Founding Titan to create Maria, Rose and Sina. Huge numbers of Titans are hidden in the Walls.',
    },
    outcome: {
      zh: '三道城牆從開始就藏有巨人，唔係後來由牆外闖入。',
      en: 'The Wall Titans were present from the start, not later invaders.',
    },
    beats: [
      {
        zh: '始祖巨人建立城牆',
        en: 'The Founder creates the Walls',
      },
      {
        zh: '巨人硬質化形成牆身',
        en: 'Titans harden into fortifications',
      },
      {
        zh: '居民以為牆外已無人類',
        en: 'People believe humanity outside is gone',
      },
    ],
    characters: [
      [
        'karl',
        {
          zh: '建立城牆',
          en: 'Creates the Walls',
        },
      ],
      [
        'walltitans',
        {
          zh: '隱藏喺牆身',
          en: 'Hidden inside the Walls',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'grisha',
    year: '約832',
    category: 'infiltrate',
    wall: 'maria',
    place: 'shig',
    title: {
      zh: '古利夏秘密進入城牆',
      en: 'Grisha enters Wall Maria secretly',
    },
    description: {
      zh: '古利夏取得進擊的巨人後到達牆外，基斯喺希干希納附近發現佢，並帶佢入城。',
      en: 'After inheriting the Attack Titan, Grisha reaches the Walls. Keith finds him near Shiganshina and brings him inside.',
    },
    outcome: {
      zh: '佢冇破牆，而係以人類身份長期隱藏巨人能力。',
      en: 'He enters as a human without breaching a gate and conceals his Titan identity.',
    },
    beats: [
      {
        zh: '古利夏從海岸方向抵達牆外',
        en: 'Grisha travels inland from the coast',
      },
      {
        zh: '基斯喺希干希納外發現佢',
        en: 'Keith finds him outside Shiganshina',
      },
      {
        zh: '古利夏進入人類社會',
        en: 'Grisha enters human society',
      },
    ],
    characters: [
      [
        'grisha',
        {
          zh: '潛入／進擊的巨人',
          en: 'Undercover / Attack Titan',
        },
      ],
      [
        'keith',
        {
          zh: '唔知情下帶佢入城',
          en: 'Unknowingly escorts him in',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'marcel',
    year: '845',
    category: 'reveal',
    wall: 'outside',
    place: 'south',
    title: {
      zh: '馬賽被尤彌爾吞食，顎之巨人轉移',
      en: 'Ymir devours Marcel and inherits the Jaw Titan',
    },
    description: {
      zh: '馬賽、萊納、貝爾托特和亞妮登上帕拉迪島。牆外紮營時，純潔巨人尤彌爾襲擊；馬賽推開萊納，自己被吞食。',
      en: 'Marcel, Reiner, Bertholdt and Annie reach Paradis. At their camp outside the Walls, Ymir attacks as a Pure Titan. Marcel pushes Reiner to safety and is devoured.',
    },
    outcome: {
      zh: '尤彌爾繼承顎之巨人並恢復人類；她並非戰士小隊成員。其餘三人逃離，之後由萊納堅持繼續任務。地點和路線只作示意。',
      en: 'Ymir inherits the Jaw Titan and regains human form; she is not part of the Warrior team. The three survivors flee, and Reiner later insists on continuing. Locations and routes are schematic.',
    },
    beats: [
      {
        zh: '馬賽、萊納、貝爾托特、亞妮抵達帕拉迪島',
        en: 'Marcel, Reiner, Bertholdt and Annie reach Paradis',
      },
      {
        zh: '馬賽救萊納，被純潔巨人尤彌爾吞食',
        en: 'Marcel saves Reiner and is devoured by Pure Titan Ymir',
      },
      {
        zh: '尤彌爾恢復人類；萊納帶領其餘兩人繼續任務',
        en: 'Ymir regains human form; Reiner leads the other two onward',
      },
    ],
    characters: [
      [
        'marcel',
        {
          zh: '顎之巨人持有者；救萊納而死',
          en: 'Jaw Titan holder; dies saving Reiner',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人；倖存並堅持任務',
          en: 'Armored Titan; survives and insists on continuing',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人；倖存者',
          en: 'Colossal Titan; survivor',
        },
      ],
      [
        'annie',
        {
          zh: '女巨人；倖存者',
          en: 'Female Titan; survivor',
        },
      ],
      [
        'ymir',
        {
          zh: '純潔巨人 → 繼承顎之巨人；非小隊成員',
          en: 'Pure Titan → Jaw Titan inheritor; not a team member',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'maria-fall',
    year: '845',
    category: 'attack',
    wall: 'maria',
    place: 'shig',
    title: {
      zh: '瑪利亞陷落：兩重城門被破壞',
      en: 'Fall of Maria: both Shiganshina gates breached',
    },
    description: {
      zh: '亞妮引來純潔巨人；貝爾托特破壞希干希納外城門，萊納再撞破內城門，純潔巨人湧入瑪利亞與羅塞之間嘅領土。',
      en: 'Annie draws Pure Titans. Bertholdt breaks Shiganshina’s outer gate; Reiner breaks the inner gate, allowing Titans into the land between Maria and Rose.',
    },
    outcome: {
      zh: '瑪利亞領土失守，居民向羅塞撤退。注意係城門被破壞，而唔係整個環狀牆身完全崩毀。',
      en: 'Maria territory is lost and residents retreat to Rose. The gates were breached; the entire circular Wall did not collapse.',
    },
    beats: [
      {
        zh: '亞妮引導純潔巨人',
        en: 'Annie draws Pure Titans towards the district',
      },
      {
        zh: '貝爾托特破壞外城門',
        en: 'Bertholdt breaches the outer gate',
      },
      {
        zh: '萊納撞破內城門',
        en: 'Reiner smashes the inner gate',
      },
      {
        zh: '居民撤往羅塞之牆',
        en: 'Residents flee towards Wall Rose',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人：引導巨人',
          en: 'Female Titan: draws Titans',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人：外城門',
          en: 'Colossal Titan: outer gate',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人：內城門',
          en: 'Armored Titan: inner gate',
        },
      ],
      [
        'pure',
        {
          zh: '由缺口湧入',
          en: 'Enter through broken gates',
        },
      ],
      [
        'civ',
        {
          zh: '撤退',
          en: 'Evacuate',
        },
      ],
    ],
    delta: {
      walls: {
        maria: 'lost',
      },
      gates: {
        shigO: 'broken',
        shigI: 'broken',
      },
    },
  },
  {
    id: 'refugees',
    year: '845',
    category: 'infiltrate',
    wall: 'rose',
    place: 'trost',
    title: {
      zh: '戰士混入難民，進入羅塞',
      en: 'Warriors enter Rose disguised as refugees',
    },
    description: {
      zh: '萊納、貝爾托特、亞妮轉回人類姿態，隨難民進入羅塞之牆。無需攻破羅塞城門。',
      en: 'Reiner, Bertholdt and Annie return to human form and enter Wall Rose with refugees without breaching its gate.',
    },
    outcome: {
      zh: '呢次係馬萊最成功嘅長期潛伏：敵人已經成為牆內居民。',
      en: 'The Warriors’ most successful long-term infiltration begins: the enemy is now inside society.',
    },
    beats: [
      {
        zh: '難民由瑪利亞撤退',
        en: 'Refugees flee Maria',
      },
      {
        zh: '三人藏身難民隊伍',
        en: 'Three Warriors blend into the crowd',
      },
      {
        zh: '一行人通過羅塞防線',
        en: 'The group enters Rose territory',
      },
    ],
    characters: [
      [
        'reiner',
        {
          zh: '偽裝難民',
          en: 'Disguised refugee',
        },
      ],
      [
        'bert',
        {
          zh: '偽裝難民',
          en: 'Disguised refugee',
        },
      ],
      [
        'annie',
        {
          zh: '偽裝難民',
          en: 'Disguised refugee',
        },
      ],
      [
        'civ',
        {
          zh: '帶領撤退人流',
          en: 'Refugee evacuation',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'founder-transfer',
    year: '845',
    category: 'reveal',
    wall: 'rose',
    place: 'reiss',
    title: {
      zh: '古利夏前往雷斯家禮拜堂，始祖巨人轉移',
      en: 'Grisha takes the Founding Titan',
    },
    description: {
      zh: '古利夏去到羅塞北部雷斯家領地嘅地下禮拜堂（席納之牆外、奧爾福德附近），從芙莉妲奪取始祖巨人，後來將進擊同始祖巨人力量傳給艾連。',
      en: 'Grisha reaches the Reiss family chapel in northern Rose territory, near Orvud, takes the Founding Titan from Frieda, and later passes both powers to Eren.',
    },
    outcome: {
      zh: '馬萊戰士以為始祖巨人仍掌握喺王族手上，實際上已轉到艾連身上。',
      en: 'The Warriors seek the Founder without knowing that Eren now holds it.',
    },
    beats: [
      {
        zh: '古利夏前往羅塞北部雷斯家領地',
        en: 'Grisha travels to the Reiss lands in northern Rose',
      },
      {
        zh: '喺地下禮拜堂取得始祖能力',
        en: 'He takes the Founding Titan in the chapel',
      },
      {
        zh: '艾連繼承兩種能力',
        en: 'Eren inherits both powers',
      },
    ],
    characters: [
      [
        'grisha',
        {
          zh: '進擊／奪取始祖',
          en: 'Attack Titan / takes Founder',
        },
      ],
      [
        'fried',
        {
          zh: '原始祖巨人',
          en: 'Previous Founding Titan',
        },
      ],
      [
        'eren',
        {
          zh: '新繼承者',
          en: 'New inheritor',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'reclamation',
    year: '846',
    category: 'defend',
    wall: 'rose',
    place: 'trost',
    title: {
      zh: '瑪利亞奪還作戰：二十五萬難民被送出牆外',
      en: 'The "reclamation" of Maria: 250,000 refugees sent outside',
    },
    description: {
      zh: '瑪利亞失陷後一年，牆內糧食不足。王政府以「奪還瑪利亞」為名，將約二十五萬名難民（約佔人口兩成）由托洛斯特送出羅塞之牆，進入滿佈巨人嘅瑪利亞領土。',
      en: 'A year after Maria fell, food inside the Walls ran short. In the name of "retaking Wall Maria", the royal government sent about 250,000 refugees, roughly a fifth of the population, out through Trost into Titan-filled Maria territory.',
    },
    outcome: {
      zh: '生還者只有百餘人。呢次唔係敵人入牆，而係人類被送出牆外；牆內嘅糧食壓力因此減輕。',
      en: 'Barely a couple of hundred came back. No enemy entered this time: people were sent out of the Wall, and the food shortage inside eased.',
    },
    beats: [
      {
        zh: '難民喺托洛斯特集結',
        en: 'Refugees gather at Trost',
      },
      {
        zh: '由城門進入瑪利亞領土',
        en: 'They march out into Maria territory',
      },
      {
        zh: '巨人被人群吸引圍攏',
        en: 'Titans close in on the column',
      },
      {
        zh: '只有極少數人返回',
        en: 'Only a handful return',
      },
    ],
    characters: [
      [
        'civ',
        {
          zh: '被徵召嘅難民',
          en: 'Conscripted refugees',
        },
      ],
      [
        'pure',
        {
          zh: '被人群吸引',
          en: 'Drawn to the crowd',
        },
      ],
      [
        'garrison',
        {
          zh: '守住城門',
          en: 'Holds the gate',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'cadets',
    year: '847–849',
    category: 'infiltrate',
    wall: 'rose',
    place: 'cadetCamp',
    title: {
      zh: '馬萊戰士以訓練兵身份生活',
      en: 'Warriors hide among the cadets',
    },
    description: {
      zh: '三名戰士加入第104期訓練兵團。尤彌爾亦秘密持有顎之巨人，但佢唔係馬萊間諜。',
      en: 'The three Warriors join the 104th Training Corps. Ymir also secretly holds the Jaw Titan, but is not a Marleyan spy.',
    },
    outcome: {
      zh: '軍隊中已隱藏多名巨人繼承者，敵人唔需要再破牆。',
      en: 'Multiple Titan Shifters now live among soldiers without any new breach.',
    },
    beats: [
      {
        zh: '戰士融入平民生活',
        en: 'Warriors settle in',
      },
      {
        zh: '加入第104期訓練兵團',
        en: 'They join the 104th Cadet Corps',
      },
      {
        zh: '保持巨人身份秘密',
        en: 'Their Titan identities remain secret',
      },
    ],
    characters: [
      [
        'reiner',
        {
          zh: '鎧之巨人；偽裝士兵',
          en: 'Armored Titan / cadet',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人；偽裝士兵',
          en: 'Colossal Titan / cadet',
        },
      ],
      [
        'annie',
        {
          zh: '女巨人；偽裝士兵',
          en: 'Female Titan / cadet',
        },
      ],
      [
        'ymir',
        {
          zh: '非馬萊間諜',
          en: 'Not a Marleyan spy',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'trost-attack',
    year: '850',
    category: 'attack',
    wall: 'rose',
    place: 'trost',
    title: {
      zh: '托洛斯特外城門被攻破',
      en: 'Colossal Titan breaches Trost outer gate',
    },
    description: {
      zh: '貝爾托特變身超大型巨人，破壞托洛斯特外門。純潔巨人進入市區，但內城門守住，所以羅塞主要領土冇陷落。',
      en: 'Bertholdt breaches Trost’s outer gate as the Colossal Titan. Pure Titans enter the district, but the inner gate holds.',
    },
    outcome: {
      zh: '羅塞外門損壞；市區發生防衛戰，但中間城牆未被全面突破。',
      en: 'Trost’s outer gate is damaged; the deeper territory of Rose remains protected.',
    },
    beats: [
      {
        zh: '貝爾托特出現喺外城門',
        en: 'Bertholdt appears outside the gate',
      },
      {
        zh: '超大型巨人破壞外門',
        en: 'The Colossal Titan breaches it',
      },
      {
        zh: '純潔巨人進入托洛斯特',
        en: 'Pure Titans enter Trost',
      },
      {
        zh: '駐紮兵團與訓練兵防守',
        en: 'Garrison and cadets defend',
      },
    ],
    characters: [
      [
        'bert',
        {
          zh: '超大型巨人：破門',
          en: 'Colossal Titan: breach',
        },
      ],
      [
        'pure',
        {
          zh: '進入托洛斯特',
          en: 'Enter the district',
        },
      ],
      [
        'garrison',
        {
          zh: '守住內城門',
          en: 'Defend inner gate',
        },
      ],
      [
        'eren',
        {
          zh: '展示進擊巨人能力',
          en: 'Reveals Attack Titan power',
        },
      ],
    ],
    delta: {
      walls: {
        rose: 'breached',
      },
      gates: {
        trostO: 'broken',
      },
    },
  },
  {
    id: 'trost-seal',
    year: '850',
    category: 'defend',
    wall: 'rose',
    place: 'trost',
    title: {
      zh: '艾連以巨石封住托洛斯特',
      en: 'Eren seals the Trost gate',
    },
    description: {
      zh: '駐紮兵團同訓練兵掩護艾連，艾連利用巨石堵住托洛斯特外門。',
      en: 'The Garrison and cadets protect Eren while he carries a boulder to seal Trost’s outer gate.',
    },
    outcome: {
      zh: '托洛斯特收復，羅塞防線恢復；內城門全程冇被破壞。',
      en: 'Trost is reclaimed and the Rose perimeter is secured; the inner gate never fell.',
    },
    beats: [
      {
        zh: '士兵制定封門計劃',
        en: 'The defenders devise a sealing plan',
      },
      {
        zh: '部隊掩護艾連前進',
        en: 'Troops cover Eren’s approach',
      },
      {
        zh: '巨石堵住破口',
        en: 'The boulder seals the opening',
      },
      {
        zh: '巨人被清除，托洛斯特收復',
        en: 'Titans are cleared and Trost is retaken',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '進擊的巨人：封門',
          en: 'Attack Titan: seals gate',
        },
      ],
      [
        'garrison',
        {
          zh: '防守及支援',
          en: 'Defense and support',
        },
      ],
      [
        'armin',
        {
          zh: '協調作戰',
          en: 'Helps coordinate',
        },
      ],
    ],
    delta: {
      walls: {
        rose: 'intact',
      },
      gates: {
        trostO: 'sealed',
      },
    },
  },
  {
    id: 'annie-mp',
    year: '850',
    category: 'infiltrate',
    wall: 'sina',
    place: 'stohess',
    title: {
      zh: '亞妮以憲兵身份進入席納',
      en: 'Annie enters Sina as Military Police',
    },
    description: {
      zh: '亞妮加入憲兵團，取得前往內牆地區嘅合法途徑，喺史托黑斯附近執行任務。',
      en: 'Annie joins the Military Police, gaining legitimate access to the inner Wall and serving in Stohess.',
    },
    outcome: {
      zh: '席納並冇被突破：敵人使用身份同制度進入。',
      en: 'Wall Sina is not breached: the enemy gains entry using a legitimate identity.',
    },
    beats: [
      {
        zh: '訓練結束後加入憲兵團',
        en: 'Annie joins the Military Police',
      },
      {
        zh: '通過正常城門與軍事關卡',
        en: 'She travels through regular military checkpoints',
      },
      {
        zh: '喺內牆隱藏女巨人身份',
        en: 'She remains undercover inside Sina',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人／憲兵',
          en: 'Female Titan / Military Police',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'female-forest',
    year: '850',
    category: 'attack',
    wall: 'rose',
    place: 'forest',
    title: {
      zh: '女巨人喺牆外襲擊調查兵團',
      en: 'Female Titan ambushes the Scouts',
    },
    description: {
      zh: '第57次牆外調查由羅塞東面卡拉涅斯出發。亞妮秘密喺牆外變身女巨人，嘗試捕捉艾連。',
      en: 'The 57th expedition leaves Karanes on the eastern Wall Rose perimeter. Annie transforms outside and attempts to capture Eren.',
    },
    outcome: {
      zh: '亞妮最後以人類身份返回牆內；具體個人出入關卡並無完整交代。',
      en: 'Annie returns in human form, but her precise individual gate route is not fully shown.',
    },
    beats: [
      {
        zh: '調查兵團由卡拉涅斯出牆',
        en: 'Scouts depart via Karanes',
      },
      {
        zh: '女巨人喺牆外出現',
        en: 'The Female Titan appears outside',
      },
      {
        zh: '巨大樹森林中發生追捕',
        en: 'Pursuit in the Forest of Giant Trees',
      },
      {
        zh: '亞妮逃離並返回牆內',
        en: 'Annie escapes and returns inside',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人：捕捉艾連',
          en: 'Female Titan: target Eren',
        },
      ],
      [
        'scouts',
        {
          zh: '設陷阱同保護艾連',
          en: 'Set traps and protect Eren',
        },
      ],
      [
        'eren',
        {
          zh: '被追捕目標',
          en: 'Target',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'stohess',
    year: '850',
    category: 'reveal',
    wall: 'sina',
    place: 'stohess',
    title: {
      zh: '史托黑斯：亞妮身份暴露',
      en: 'Stohess: Annie’s identity is exposed',
    },
    description: {
      zh: '亞妮喺席納區域內變成女巨人，同艾連戰鬥並嘗試攀上城牆。米卡莎阻止佢，亞妮最終封住自己於水晶內。',
      en: 'Annie transforms inside Stohess, battles Eren and tries to climb Wall Sina to escape outward. Mikasa stops her and she crystallizes herself.',
    },
    outcome: {
      zh: '冇成功翻越席納。事件亦令藏喺牆身嘅巨人暴露。',
      en: 'She fails to escape over Sina. A Wall Titan is also exposed in the damaged Wall surface.',
    },
    beats: [
      {
        zh: '身份被識破',
        en: 'Annie is identified',
      },
      {
        zh: '亞妮喺城內變身',
        en: 'Annie transforms inside',
      },
      {
        zh: '向城牆攀爬被阻止',
        en: 'Her attempted climb is stopped',
      },
      {
        zh: '水晶封存，牆內巨人曝光',
        en: 'Crystal enclosure; Wall Titan revealed',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人：試圖逃走',
          en: 'Female Titan: attempts escape',
        },
      ],
      [
        'eren',
        {
          zh: '進擊的巨人：阻止',
          en: 'Attack Titan: confronts her',
        },
      ],
      [
        'mikasa',
        {
          zh: '阻止佢翻牆',
          en: 'Stops her climb',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'ragako',
    year: '850',
    category: 'infiltrate',
    wall: 'rose',
    place: 'ragako',
    title: {
      zh: '吉克令拉加哥村民喺牆內變巨人',
      en: 'Zeke creates Titans inside Wall Rose',
    },
    description: {
      zh: '吉克、皮克等秘密進入羅塞領土，脊髓液氣體令拉加哥村民受到影響，吉克用叫聲觸發巨人化。',
      en: 'Zeke and Pieck secretly enter Rose territory. Spinal-fluid gas affects Ragako villagers; Zeke’s scream triggers Titan transformation.',
    },
    outcome: {
      zh: '士兵搵唔到城牆破口，因為巨人係喺牆內生成。潛入具體入口未明。',
      en: 'The soldiers find no hole in Wall Rose because the Titans were created inside. The precise infiltration route remains unknown.',
    },
    beats: [
      {
        zh: '吉克一行人秘密進入',
        en: 'Zeke’s group infiltrates',
      },
      {
        zh: '拉加哥村受到脊髓液影響',
        en: 'Ragako villagers are exposed',
      },
      {
        zh: '村民喺牆內變成巨人',
        en: 'Titans appear from within',
      },
      {
        zh: '駐紮兵團搜索城牆，冇發現破口',
        en: 'Soldiers inspect the Walls; no breach exists',
      },
    ],
    characters: [
      [
        'zeke',
        {
          zh: '獸之巨人：控制巨人化',
          en: 'Beast Titan: triggers transformation',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人：支援',
          en: 'Cart Titan: support',
        },
      ],
      [
        'garrison',
        {
          zh: '搜索破口',
          en: 'Search for breach',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'utgard',
    year: '850',
    category: 'defend',
    wall: 'rose',
    place: 'utgard',
    title: {
      zh: '厄特加爾：尤彌爾展示顎之巨人',
      en: 'Utgard: Ymir reveals Jaw Titan',
    },
    description: {
      zh: '由拉加哥村民變成嘅巨人包圍厄特加爾城，尤彌爾為保護希斯特莉亞及其他人而變身。獸之巨人之後攀過羅塞之牆離開。',
      en: 'The Titans created at Ragako surround Utgard Castle, and Ymir transforms to protect Historia and the others. The Beast Titan later climbs over Wall Rose and leaves.',
    },
    outcome: {
      zh: '佢本身已經喺羅塞領土內生活，唔係當日從外面入侵。',
      en: 'She has been living in Rose territory; this is not a new external crossing.',
    },
    beats: [
      {
        zh: '拉加哥嘅巨人包圍城堡',
        en: 'Titans from Ragako approach the castle',
      },
      {
        zh: '士兵防守',
        en: 'Soldiers defend',
      },
      {
        zh: '尤彌爾變身顎之巨人',
        en: 'Ymir transforms into Jaw Titan',
      },
      {
        zh: '獸之巨人攀過羅塞之牆離開',
        en: 'The Beast Titan climbs Wall Rose and leaves',
      },
    ],
    characters: [
      [
        'ymir',
        {
          zh: '顎之巨人：保護同伴',
          en: 'Jaw Titan: protects allies',
        },
      ],
      [
        'historia',
        {
          zh: '被保護同伴',
          en: 'Protected companion',
        },
      ],
      [
        'reiner',
        {
          zh: '識破尤彌爾身份',
          en: 'Recognizes Ymir',
        },
      ],
      [
        'zeke',
        {
          zh: '獸之巨人：攀牆離開',
          en: 'Beast Titan: climbs out over the Wall',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'reveal-escape',
    year: '850',
    category: 'attack',
    wall: 'rose',
    place: 'roseSW',
    title: {
      zh: '萊納、貝爾托特公開身份並逃離',
      en: 'Reiner and Bertholdt reveal themselves',
    },
    description: {
      zh: '厄特加爾一役後，萊納同貝爾托特喺羅塞之牆頂坦白，變成巨人並帶走艾連、尤彌爾，逃到牆外瑪利亞領土嘅巨大樹森林。',
      en: 'After Utgard, Reiner and Bertholdt reveal their identities atop Wall Rose, transform and carry Eren and Ymir out to a forest of giant trees in former Maria territory.',
    },
    outcome: {
      zh: '佢哋並無打爛新城門，而係由城牆上方離開。調查兵團最終救返艾連。',
      en: 'No new gate is destroyed: they escape over the Wall, and the Scouts later rescue Eren.',
    },
    beats: [
      {
        zh: '萊納承認自己係鎧之巨人',
        en: 'Reiner reveals the Armored Titan',
      },
      {
        zh: '兩人喺羅塞牆頂變身',
        en: 'The two transform atop Rose',
      },
      {
        zh: '帶同艾連及尤彌爾向外逃',
        en: 'They carry Eren and Ymir outward',
      },
      {
        zh: '調查兵團追擊並救回艾連',
        en: 'Scouts pursue and recover Eren',
      },
    ],
    characters: [
      [
        'reiner',
        {
          zh: '鎧之巨人：帶人逃離',
          en: 'Armored Titan: abduction',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人：掩護',
          en: 'Colossal Titan: cover',
        },
      ],
      [
        'eren',
        {
          zh: '被擄走、後獲救',
          en: 'Captured then rescued',
        },
      ],
      [
        'scouts',
        {
          zh: '追擊',
          en: 'Pursuit',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'rod',
    year: '850',
    category: 'defend',
    wall: 'sina',
    place: 'orvud',
    title: {
      zh: '羅德·雷斯嘗試攀越席納',
      en: 'Rod Reiss approaches Wall Sina',
    },
    description: {
      zh: '羅德喺羅塞北部雷斯家禮拜堂地下變成巨人，從城牆外爬向席納北面嘅奧爾福德區，試圖越牆前往王都。',
      en: 'Rod transforms beneath the Reiss chapel in northern Rose territory and crawls to Orvud District on Wall Sina’s north side, trying to climb the Wall towards the capital.',
    },
    outcome: {
      zh: '調查兵團成功阻止佢，席納並冇被外敵攻陷。',
      en: 'The Scouts stop him. Wall Sina is not overrun.',
    },
    beats: [
      {
        zh: '羅德喺禮拜堂變成巨人',
        en: 'Rod transforms in the chapel',
      },
      {
        zh: '向奧爾福德區移動',
        en: 'He approaches Orvud',
      },
      {
        zh: '嘗試攀牆',
        en: 'He attempts to cross the Wall',
      },
      {
        zh: '防守部隊成功阻止',
        en: 'Defenders stop him',
      },
    ],
    characters: [
      [
        'rod',
        {
          zh: '純潔巨人：向城牆移動',
          en: 'Pure Titan: approaches Wall',
        },
      ],
      [
        'historia',
        {
          zh: '協助阻止',
          en: 'Helps stop him',
        },
      ],
      [
        'scouts',
        {
          zh: '城市防守',
          en: 'Defends the district',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'maria-retaken',
    year: '850',
    category: 'defend',
    wall: 'maria',
    place: 'shig',
    title: {
      zh: '瑪利亞奪還戰：艾連封門',
      en: 'Wall Maria reclaimed at Shiganshina',
    },
    description: {
      zh: '調查兵團連夜返回希干希納，艾連以硬質化封住外城門破口；獸之巨人隨即擲石堵住內城門，雙方被困城中決戰。萊納、貝爾托特、吉克、皮克迎戰，阿爾敏繼承超大型巨人。',
      en: 'The Scouts return to Shiganshina by night. Eren hardens the hole in the outer gate; the Beast Titan’s thrown boulder then blocks the inner gate, trapping both sides. Reiner, Bertholdt, Zeke and Pieck fight them, and Armin inherits the Colossal Titan.',
    },
    outcome: {
      zh: '外城門由艾連封住，內城門被獸之巨人嘅巨石堵住；瑪利亞領土奪回，吉克、萊納、皮克撤退。',
      en: 'The outer gate is sealed by Eren and the inner gate blocked by the Beast Titan’s boulder. Maria territory is reclaimed; Zeke, Reiner and Pieck escape.',
    },
    beats: [
      {
        zh: '調查兵團由羅塞南下',
        en: 'Scouts travel south from Rose',
      },
      {
        zh: '艾連封住希干希納外城門',
        en: 'Eren seals the outer gate',
      },
      {
        zh: '獸之巨人擲石堵住內城門，戰士反擊',
        en: 'The Beast Titan’s boulder blocks the inner gate; the Warriors attack',
      },
      {
        zh: '阿爾敏繼承超大型巨人，瑪利亞奪還',
        en: 'Armin inherits the Colossal Titan; Maria is reclaimed',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '硬質化封外城門',
          en: 'Hardens the outer gate',
        },
      ],
      [
        'armin',
        {
          zh: '對抗超大型巨人',
          en: 'Confronts the Colossal Titan',
        },
      ],
      [
        'levi',
        {
          zh: '對抗獸之巨人',
          en: 'Confronts the Beast Titan',
        },
      ],
      [
        'erwin',
        {
          zh: '率領調查兵團',
          en: 'Leads Survey Corps',
        },
      ],
      [
        'zeke',
        {
          zh: '獸之巨人：阻止奪還',
          en: 'Beast Titan: opposes operation',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人：藏身城牆突襲',
          en: 'Armored Titan: ambush from the Wall',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人：被擲入城內',
          en: 'Colossal Titan: thrown into the district',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人：補給及撤退',
          en: 'Cart Titan: supplies and retreat',
        },
      ],
    ],
    delta: {
      walls: {
        maria: 'intact',
      },
      gates: {
        shigO: 'sealed',
        shigI: 'sealed',
      },
    },
  },
  {
    id: 'sea',
    year: '851',
    category: 'expedition',
    wall: 'outside',
    place: 'shore',
    title: {
      zh: '調查兵團越過瑪利亞，到達大海',
      en: 'Scouts travel beyond Maria to the sea',
    },
    description: {
      zh: '經過奪還戰與巨人清除行動，調查兵團可以走出瑪利亞邊界，直達帕拉迪島海岸。',
      en: 'After the Wall’s recovery and the clearance of Titans, the Scouts travel beyond Maria to the Paradis coast.',
    },
    outcome: {
      zh: '人類首次重新踏足城牆外更遠地區；敵人被認知為海洋另一邊嘅世界。',
      en: 'The expedition reveals that the wider world—and the real conflict—lies across the sea.',
    },
    beats: [
      {
        zh: '離開瑪利亞領土',
        en: 'Travel beyond Maria',
      },
      {
        zh: '沿島上地區前進',
        en: 'Cross the island',
      },
      {
        zh: '抵達海岸',
        en: 'Reach the sea',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '前往海邊',
          en: 'Reaches the sea',
        },
      ],
      [
        'armin',
        {
          zh: '見到大海',
          en: 'Sees the ocean',
        },
      ],
      [
        'scouts',
        {
          zh: '探索外部世界',
          en: 'Explore beyond the Walls',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'ships',
    year: '851',
    category: 'infiltrate',
    wall: 'outside',
    place: 'shore',
    title: {
      zh: '馬萊船隻同義勇兵登島',
      en: 'Marleyan ships and Volunteers arrive',
    },
    description: {
      zh: '馬萊偵察船到達帕拉迪海岸；耶蓮娜、歐良果彭等人與島上軍隊接觸，合作背後亦有吉克嘅秘密計劃。',
      en: 'Marleyan reconnaissance vessels reach the coast. Yelena and Onyankopon make contact, while Zeke’s covert plan develops behind the cooperation.',
    },
    outcome: {
      zh: '敵方與外來者改為由海路進入，三道牆唔再係唯一防線。',
      en: 'Coastal arrivals bypass the original ringed defenses entirely.',
    },
    beats: [
      {
        zh: '偵察船接近海岸',
        en: 'Scouting vessels approach',
      },
      {
        zh: '調查兵團攔截船隻',
        en: 'Scouts intercept the vessels',
      },
      {
        zh: '義勇兵與帕拉迪接觸',
        en: 'Volunteers contact Paradis',
      },
    ],
    characters: [
      [
        'yelena',
        {
          zh: '義勇兵代表',
          en: 'Volunteer leader',
        },
      ],
      [
        'ony',
        {
          zh: '協助帕拉迪',
          en: 'Assists Paradis',
        },
      ],
      [
        'scouts',
        {
          zh: '攔截偵察船',
          en: 'Intercept the ships',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'overseas',
    year: '852–853',
    category: 'expedition',
    wall: 'outside',
    place: 'sea',
    title: {
      zh: '艾連與調查兵團前往海外',
      en: 'Eren and Scouts go overseas',
    },
    description: {
      zh: '調查兵團前往外部世界，艾連其後以「庫爾迦」嘅假身份獨自在馬萊活動。',
      en: 'The Scouts visit the outside world; Eren later operates in Marley under the assumed name Kruger.',
    },
    outcome: {
      zh: '入侵方向逆轉：而家係帕拉迪嘅巨人繼承者潛入馬萊。',
      en: 'The infiltration direction reverses: a Paradis Titan Shifter infiltrates Marley.',
    },
    beats: [
      {
        zh: '離開帕拉迪',
        en: 'Leave Paradis',
      },
      {
        zh: '前往海外',
        en: 'Travel overseas',
      },
      {
        zh: '艾連使用假身份潛伏',
        en: 'Eren adopts a false identity',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '進擊／始祖巨人：偽裝',
          en: 'Attack / Founding Titan undercover',
        },
      ],
      [
        'scouts',
        {
          zh: '海外調查',
          en: 'Overseas reconnaissance',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'liberio',
    year: '854',
    category: 'attack',
    wall: 'outside',
    place: 'harbor',
    title: {
      zh: '雷貝里歐襲擊與飛船返回',
      en: 'Liberio raid and airship return',
    },
    description: {
      zh: '艾連襲擊馬萊並奪取戰鎚巨人，調查兵團乘飛船撤離；吉克、賈碧及法爾可亦到達帕拉迪。',
      en: 'Eren attacks Marley and acquires the War Hammer Titan. The Scouts return by airship, bringing Zeke; Gabi and Falco secretly board.',
    },
    outcome: {
      zh: '新嘅敵對人士直接搭飛船入島，無需穿過任何城門。',
      en: 'New arrivals reach Paradis by airship without using the Wall gates.',
    },
    beats: [
      {
        zh: '艾連喺馬萊發動襲擊',
        en: 'Eren attacks in Marley',
      },
      {
        zh: '調查兵團乘飛船撤離',
        en: 'The Scouts depart by airship',
      },
      {
        zh: '吉克、賈碧、法爾可返回帕拉迪',
        en: 'Zeke, Gabi and Falco reach Paradis',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '戰鎚能力加入',
          en: 'Gains War Hammer power',
        },
      ],
      [
        'armin',
        {
          zh: '超大型巨人',
          en: 'Colossal Titan',
        },
      ],
      [
        'zeke',
        {
          zh: '獸之巨人：秘密合作',
          en: 'Beast Titan: secret cooperation',
        },
      ],
      [
        'gabi',
        {
          zh: '秘密搭上飛船',
          en: 'Boards secretly',
        },
      ],
      [
        'falco',
        {
          zh: '秘密搭上飛船',
          en: 'Boards secretly',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'pieck',
    year: '854',
    category: 'infiltrate',
    wall: 'maria',
    place: 'shig',
    title: {
      zh: '皮克及波爾柯再度潛入希干希納',
      en: 'Pieck and Porco infiltrate Shiganshina',
    },
    description: {
      zh: '皮克偽裝成島上軍人接近艾連，波爾柯早已隱藏，準備喺屋頂位置發動突襲。',
      en: 'Pieck disguises herself as a Paradis soldier and approaches Eren, while Porco waits concealed for an ambush.',
    },
    outcome: {
      zh: '兩人嘅精確入城途徑冇完整展示；地圖以虛線示意。',
      en: 'Their exact entry route is not shown; the map uses an approximate dashed route.',
    },
    beats: [
      {
        zh: '皮克及波爾柯秘密入城',
        en: 'Pieck and Porco enter covertly',
      },
      {
        zh: '皮克假裝合作',
        en: 'Pieck feigns cooperation',
      },
      {
        zh: '波爾柯展開伏擊',
        en: 'Porco springs the ambush',
      },
    ],
    characters: [
      [
        'pieck',
        {
          zh: '車力巨人：偽裝士兵',
          en: 'Cart Titan: in disguise',
        },
      ],
      [
        'porco',
        {
          zh: '顎之巨人：埋伏',
          en: 'Jaw Titan: ambush',
        },
      ],
      [
        'eren',
        {
          zh: '被設計嘅目標',
          en: 'Target of trap',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'marley-854',
    year: '854',
    category: 'attack',
    wall: 'maria',
    place: 'shig',
    title: {
      zh: '馬萊飛船進攻希干希納',
      en: 'Marley attacks Shiganshina by airship',
    },
    description: {
      zh: '馬萊軍用飛船空降進攻，萊納以鎧之巨人加入戰鬥，皮克及波爾柯配合攻擊。',
      en: 'Marley deploys soldiers by airship. Reiner attacks as the Armored Titan, alongside Pieck and Porco.',
    },
    outcome: {
      zh: '軍隊由天空進入希干希納，並唔需要破壞瑪利亞之牆。',
      en: 'The invaders arrive from above rather than breaching Wall Maria.',
    },
    beats: [
      {
        zh: '馬萊飛船飛臨希干希納',
        en: 'Marleyan airships arrive',
      },
      {
        zh: '士兵從空中降落',
        en: 'Soldiers descend',
      },
      {
        zh: '萊納等巨人進攻',
        en: 'Reiner and the Warriors attack',
      },
      {
        zh: '帕拉迪士兵反擊',
        en: 'Paradis forces counterattack',
      },
    ],
    characters: [
      [
        'marley',
        {
          zh: '空中進攻',
          en: 'Airborne invasion',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人',
          en: 'Armored Titan',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人',
          en: 'Cart Titan',
        },
      ],
      [
        'eren',
        {
          zh: '防守及反擊',
          en: 'Defends and counterattacks',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'zeke-scream',
    year: '854',
    category: 'attack',
    wall: 'maria',
    place: 'shig',
    title: {
      zh: '吉克叫聲令島上人類變成巨人',
      en: 'Zeke triggers Titans within Shiganshina',
    },
    description: {
      zh: '部分士兵之前已攝入吉克脊髓液；吉克叫聲令佢哋喺城內巨人化。法爾可其後取得顎之巨人。',
      en: 'People previously exposed to Zeke’s spinal fluid transform within the district after his scream. Falco later inherits the Jaw Titan.',
    },
    outcome: {
      zh: '再次唔需要破城門：巨人喺人群所在位置生成。',
      en: 'Once again no new gate breach is required: Titans appear inside the populated district.',
    },
    beats: [
      {
        zh: '吉克抵達附近戰場',
        en: 'Zeke reaches the battlefield',
      },
      {
        zh: '佢嘅叫聲觸發巨人化',
        en: 'His scream triggers transformation',
      },
      {
        zh: '新巨人出現喺城內',
        en: 'Titans appear within the district',
      },
    ],
    characters: [
      [
        'zeke',
        {
          zh: '獸之巨人：觸發巨人化',
          en: 'Beast Titan: triggers transformation',
        },
      ],
      [
        'falco',
        {
          zh: '之後繼承顎之巨人',
          en: 'Later inherits Jaw Titan',
        },
      ],
      [
        'garrison',
        {
          zh: '面對突發內部威脅',
          en: 'Responds to internal threat',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'rumbling',
    year: '854',
    category: 'finale',
    wall: 'all',
    place: 'mitras',
    title: {
      zh: '地鳴：全部三道城牆解除硬質化',
      en: 'The Rumbling: all three Walls collapse',
    },
    description: {
      zh: '艾連動用始祖巨人之力，解除瑪利亞、羅塞、席納牆身嘅硬質化，令隱藏其中嘅巨人向外行進。',
      en: 'Eren uses the Founding Titan to undo the hardening of Maria, Rose and Sina. The hidden Wall Titans march outward.',
    },
    outcome: {
      zh: '三道城牆從此不再存在為防禦屏障；亞妮嘅水晶亦同時解開。',
      en: 'All three Walls cease to function as barriers; Annie’s crystal also dissolves.',
    },
    beats: [
      {
        zh: '艾連啟動始祖巨人',
        en: 'Eren activates the Founding Titan',
      },
      {
        zh: '三道牆硬質化解除',
        en: 'The three Walls unharden',
      },
      {
        zh: '城牆巨人步出向外行進',
        en: 'Wall Titans march outward',
      },
      {
        zh: '巨人離開帕拉迪島',
        en: 'Titans move beyond Paradis',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '始祖巨人：控制地鳴',
          en: 'Founding Titan: controls Rumbling',
        },
      ],
      [
        'walltitans',
        {
          zh: '由牆身走出',
          en: 'Emerge from the Walls',
        },
      ],
      [
        'annie',
        {
          zh: '解除水晶封印',
          en: 'Crystal released',
        },
      ],
    ],
    delta: {
      walls: {
        maria: 'collapsed',
        rose: 'collapsed',
        sina: 'collapsed',
      },
      gates: {
        shigO: 'collapsed',
        shigI: 'collapsed',
        trostO: 'collapsed',
      },
    },
  },
  {
    id: 'alliance',
    year: '854',
    category: 'finale',
    wall: 'outside',
    place: 'harbor',
    title: {
      zh: '聯盟由帕拉迪出發阻止地鳴',
      en: 'Alliance departs Paradis to stop the Rumbling',
    },
    description: {
      zh: '阿爾敏、萊納、亞妮、皮克、法爾可同調查兵團部分成員合作，經港口離島追擊艾連。',
      en: 'Armin, Reiner, Annie, Pieck, Falco and some Scouts join forces, leave via the port and pursue Eren.',
    },
    outcome: {
      zh: '昔日敵對嘅巨人繼承者合作；冇城牆再阻礙出入。',
      en: 'Former enemy Titan Shifters cooperate, and the Walls no longer block travel.',
    },
    beats: [
      {
        zh: '敵對雙方組成聯盟',
        en: 'Former enemies form an alliance',
      },
      {
        zh: '聯盟前往港口',
        en: 'They travel to the port',
      },
      {
        zh: '離開帕拉迪追擊艾連',
        en: 'They leave Paradis in pursuit',
      },
    ],
    characters: [
      [
        'alliance',
        {
          zh: '合作阻止地鳴',
          en: 'Cooperate to stop the Rumbling',
        },
      ],
      [
        'armin',
        {
          zh: '超大型巨人',
          en: 'Colossal Titan',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人',
          en: 'Armored Titan',
        },
      ],
      [
        'annie',
        {
          zh: '女巨人',
          en: 'Female Titan',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人',
          en: 'Cart Titan',
        },
      ],
      [
        'falco',
        {
          zh: '顎之巨人',
          en: 'Jaw Titan',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'ambassadors',
    year: '857',
    category: 'finale',
    wall: 'outside',
    place: 'harbor',
    title: {
      zh: '和平使節再次返回帕拉迪',
      en: 'Peace ambassadors return to Paradis',
    },
    description: {
      zh: '巨人力量消失三年後，阿爾敏、約翰、柯尼、萊納、亞妮、皮克等人以和平使節身份乘船返回帕拉迪。',
      en: 'Three years after Titan powers end, Armin, Jean, Connie, Reiner, Annie and Pieck return to Paradis as peace ambassadors.',
    },
    outcome: {
      zh: '城牆已消失，佢哋亦唔再擁有巨人力量；呢次唔係潛入任務。',
      en: 'The Walls and their Titan powers are gone. This is diplomacy, not infiltration.',
    },
    beats: [
      {
        zh: '使節乘船接近島嶼',
        en: 'Ambassadors approach by ship',
      },
      {
        zh: '返回帕拉迪',
        en: 'They return to Paradis',
      },
      {
        zh: '巨人時代結束',
        en: 'The age of Titans is over',
      },
    ],
    characters: [
      [
        'armin',
        {
          zh: '和平使節',
          en: 'Peace envoy',
        },
      ],
      [
        'reiner',
        {
          zh: '和平使節',
          en: 'Peace envoy',
        },
      ],
      [
        'annie',
        {
          zh: '和平使節',
          en: 'Peace envoy',
        },
      ],
      [
        'pieck',
        {
          zh: '和平使節',
          en: 'Peace envoy',
        },
      ],
    ],
    delta: {},
  },
];
