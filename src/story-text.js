/* Story text for the 29 events in Traditional Chinese, English and Japanese: titles, descriptions, outcomes, step texts, cast roles and the wall/gate state after each event.
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
      ja: '三重の壁の誕生',
    },
    description: {
      zh: '卡爾·弗利茲利用始祖巨人之力建立瑪利亞、羅塞、席納三道城牆。牆身隱藏大量巨人。',
      en: 'Karl Fritz uses the Founding Titan to create Maria, Rose and Sina. Huge numbers of Titans are hidden in the Walls.',
      ja: 'カール・フリッツが始祖の巨人の力でマリア、ローゼ、シーナの三つの壁を築く。壁の中には無数の巨人が隠されている。',
    },
    outcome: {
      zh: '三道城牆從開始就藏有巨人，唔係後來由牆外闖入。',
      en: 'The Wall Titans were present from the start, not later invaders.',
      ja: '壁の巨人は最初から壁の中にいた。後から侵入したものではない。',
    },
    beats: [
      {
        zh: '始祖巨人建立城牆',
        en: 'The Founder creates the Walls',
        ja: '始祖が壁を築く',
      },
      {
        zh: '巨人硬質化形成牆身',
        en: 'Titans harden into fortifications',
        ja: '巨人が硬質化して壁になる',
      },
      {
        zh: '居民以為牆外已無人類',
        en: 'People believe humanity outside is gone',
        ja: '壁外の人類は滅んだと信じられる',
      },
    ],
    characters: [
      [
        'karl',
        {
          zh: '建立城牆',
          en: 'Creates the Walls',
          ja: '壁を築く',
        },
      ],
      [
        'walltitans',
        {
          zh: '隱藏喺牆身',
          en: 'Hidden inside the Walls',
          ja: '壁の中に隠される',
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
      ja: 'グリシャ、ひそかにウォール・マリアへ',
    },
    description: {
      zh: '古利夏取得進擊的巨人後到達牆外，基斯喺希干希納附近發現佢，並帶佢入城。',
      en: 'After inheriting the Attack Titan, Grisha reaches the Walls. Keith finds him near Shiganshina and brings him inside.',
      ja: '進撃の巨人を継承したグリシャが壁にたどり着く。シガンシナ区の近くでキースに見つかり、壁の中へ連れられる。',
    },
    outcome: {
      zh: '佢冇破牆，而係以人類身份長期隱藏巨人能力。',
      en: 'He enters as a human without breaching a gate and conceals his Titan identity.',
      ja: '門を破らず、人間として入り、巨人であることを隠す。',
    },
    beats: [
      {
        zh: '古利夏從海岸方向抵達牆外',
        en: 'Grisha travels inland from the coast',
        ja: 'グリシャが海岸から内陸へ向かう',
      },
      {
        zh: '基斯喺希干希納外發現佢',
        en: 'Keith finds him outside Shiganshina',
        ja: 'シガンシナ区の外でキースが発見',
      },
      {
        zh: '古利夏進入人類社會',
        en: 'Grisha enters human society',
        ja: 'グリシャが壁内の社会に入る',
      },
    ],
    characters: [
      [
        'grisha',
        {
          zh: '潛入／進擊的巨人',
          en: 'Undercover / Attack Titan',
          ja: '潜入／進撃の巨人',
        },
      ],
      [
        'keith',
        {
          zh: '唔知情下帶佢入城',
          en: 'Unknowingly escorts him in',
          ja: '知らずに壁内へ案内',
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
      ja: 'ユミルがマルセルを捕食し、顎の巨人を継承',
    },
    description: {
      zh: '馬賽、萊納、貝爾托特和亞妮登上帕拉迪島。牆外紮營時，純潔巨人尤彌爾襲擊；馬賽推開萊納，自己被吞食。',
      en: 'Marcel, Reiner, Bertholdt and Annie reach Paradis. At their camp outside the Walls, Ymir attacks as a Pure Titan. Marcel pushes Reiner to safety and is devoured.',
      ja: 'マルセル、ライナー、ベルトルト、アニがパラディ島に上陸。壁外の野営地で無垢の巨人だったユミルが襲う。マルセルはライナーをかばって捕食される。',
    },
    outcome: {
      zh: '尤彌爾繼承顎之巨人並恢復人類；她並非戰士小隊成員。其餘三人逃離，之後由萊納堅持繼續任務。地點和路線只作示意。',
      en: 'Ymir inherits the Jaw Titan and regains human form; she is not part of the Warrior team. The three survivors flee, and Reiner later insists on continuing. Locations and routes are schematic.',
      ja: 'ユミルは顎の巨人を継承して人間に戻るが、戦士隊の一員ではない。生き残った三人は逃げ、のちにライナーが作戦続行を主張する。場所と経路は概略。',
    },
    beats: [
      {
        zh: '馬賽、萊納、貝爾托特、亞妮抵達帕拉迪島',
        en: 'Marcel, Reiner, Bertholdt and Annie reach Paradis',
        ja: 'マルセル、ライナー、ベルトルト、アニがパラディ島に到着',
      },
      {
        zh: '馬賽救萊納，被純潔巨人尤彌爾吞食',
        en: 'Marcel saves Reiner and is devoured by Pure Titan Ymir',
        ja: 'マルセルがライナーを救い、無垢の巨人ユミルに捕食される',
      },
      {
        zh: '尤彌爾恢復人類；萊納帶領其餘兩人繼續任務',
        en: 'Ymir regains human form; Reiner leads the other two onward',
        ja: 'ユミルが人間に戻り、ライナーが二人を率いて進む',
      },
    ],
    characters: [
      [
        'marcel',
        {
          zh: '顎之巨人持有者；救萊納而死',
          en: 'Jaw Titan holder; dies saving Reiner',
          ja: '顎の巨人の継承者。ライナーを救って死亡',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人；倖存並堅持任務',
          en: 'Armored Titan; survives and insists on continuing',
          ja: '鎧の巨人。生き残り、続行を主張',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人；倖存者',
          en: 'Colossal Titan; survivor',
          ja: '超大型巨人。生存',
        },
      ],
      [
        'annie',
        {
          zh: '女巨人；倖存者',
          en: 'Female Titan; survivor',
          ja: '女型の巨人。生存',
        },
      ],
      [
        'ymir',
        {
          zh: '純潔巨人 → 繼承顎之巨人；非小隊成員',
          en: 'Pure Titan → Jaw Titan inheritor; not a team member',
          ja: '無垢の巨人 → 顎の巨人を継承。戦士隊ではない',
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
      ja: 'ウォール・マリア陥落：シガンシナ区の両門が破られる',
    },
    description: {
      zh: '亞妮引來純潔巨人；貝爾托特破壞希干希納外城門，萊納再撞破內城門，純潔巨人湧入瑪利亞與羅塞之間嘅領土。',
      en: 'Annie draws Pure Titans. Bertholdt breaks Shiganshina’s outer gate; Reiner breaks the inner gate, allowing Titans into the land between Maria and Rose.',
      ja: 'アニが無垢の巨人を引き寄せる。ベルトルトがシガンシナ区の外門を、ライナーが内門を破壊し、巨人がマリアとローゼの間の土地へなだれ込む。',
    },
    outcome: {
      zh: '瑪利亞領土失守，居民向羅塞撤退。注意係城門被破壞，而唔係整個環狀牆身完全崩毀。',
      en: 'Maria territory is lost and residents retreat to Rose. The gates were breached; the entire circular Wall did not collapse.',
      ja: 'マリアの領土は失われ、住民はローゼへ退く。破られたのは門であり、円形の壁全体が崩れたわけではない。',
    },
    beats: [
      {
        zh: '亞妮引導純潔巨人',
        en: 'Annie draws Pure Titans towards the district',
        ja: 'アニが無垢の巨人を区へ引き寄せる',
      },
      {
        zh: '貝爾托特破壞外城門',
        en: 'Bertholdt breaches the outer gate',
        ja: 'ベルトルトが外門を破る',
      },
      {
        zh: '萊納撞破內城門',
        en: 'Reiner smashes the inner gate',
        ja: 'ライナーが内門を突き破る',
      },
      {
        zh: '居民撤往羅塞之牆',
        en: 'Residents flee towards Wall Rose',
        ja: '住民がウォール・ローゼへ逃げる',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人：引導巨人',
          en: 'Female Titan: draws Titans',
          ja: '女型の巨人：巨人を誘導',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人：外城門',
          en: 'Colossal Titan: outer gate',
          ja: '超大型巨人：外門',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人：內城門',
          en: 'Armored Titan: inner gate',
          ja: '鎧の巨人：内門',
        },
      ],
      [
        'pure',
        {
          zh: '由缺口湧入',
          en: 'Enter through broken gates',
          ja: '破られた門から侵入',
        },
      ],
      [
        'civ',
        {
          zh: '撤退',
          en: 'Evacuate',
          ja: '避難',
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
      ja: '戦士、避難民に紛れてローゼへ',
    },
    description: {
      zh: '萊納、貝爾托特、亞妮轉回人類姿態，隨難民進入羅塞之牆。無需攻破羅塞城門。',
      en: 'Reiner, Bertholdt and Annie return to human form and enter Wall Rose with refugees without breaching its gate.',
      ja: 'ライナー、ベルトルト、アニは人間の姿に戻り、門を破ることなく避難民とともにウォール・ローゼに入る。',
    },
    outcome: {
      zh: '呢次係馬萊最成功嘅長期潛伏：敵人已經成為牆內居民。',
      en: 'The Warriors’ most successful long-term infiltration begins: the enemy is now inside society.',
      ja: '戦士たちの最も成功した長期潜入が始まる。敵はすでに壁内社会の中にいる。',
    },
    beats: [
      {
        zh: '難民由瑪利亞撤退',
        en: 'Refugees flee Maria',
        ja: '避難民がマリアから逃れる',
      },
      {
        zh: '三人藏身難民隊伍',
        en: 'Three Warriors blend into the crowd',
        ja: '三人の戦士が群衆に紛れる',
      },
      {
        zh: '一行人通過羅塞防線',
        en: 'The group enters Rose territory',
        ja: '一行がローゼの領内に入る',
      },
    ],
    characters: [
      [
        'reiner',
        {
          zh: '偽裝難民',
          en: 'Disguised refugee',
          ja: '避難民に偽装',
        },
      ],
      [
        'bert',
        {
          zh: '偽裝難民',
          en: 'Disguised refugee',
          ja: '避難民に偽装',
        },
      ],
      [
        'annie',
        {
          zh: '偽裝難民',
          en: 'Disguised refugee',
          ja: '避難民に偽装',
        },
      ],
      [
        'civ',
        {
          zh: '帶領撤退人流',
          en: 'Refugee evacuation',
          ja: '避難',
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
      ja: 'グリシャ、始祖の巨人を奪う',
    },
    description: {
      zh: '古利夏去到羅塞北部雷斯家領地嘅地下禮拜堂（席納之牆外、奧爾福德附近），從芙莉妲奪取始祖巨人，後來將進擊同始祖巨人力量傳給艾連。',
      en: 'Grisha reaches the Reiss family chapel in northern Rose territory, near Orvud, takes the Founding Titan from Frieda, and later passes both powers to Eren.',
      ja: 'グリシャはローゼ北部、オルブド区近くのレイス家の礼拝堂に向かい、フリーダから始祖の巨人を奪う。のちに二つの力をエレンに託す。',
    },
    outcome: {
      zh: '馬萊戰士以為始祖巨人仍掌握喺王族手上，實際上已轉到艾連身上。',
      en: 'The Warriors seek the Founder without knowing that Eren now holds it.',
      ja: '戦士たちは始祖を探すが、今はエレンが持っていることを知らない。',
    },
    beats: [
      {
        zh: '古利夏前往羅塞北部雷斯家領地',
        en: 'Grisha travels to the Reiss lands in northern Rose',
        ja: 'グリシャがローゼ北部のレイス領へ向かう',
      },
      {
        zh: '喺地下禮拜堂取得始祖能力',
        en: 'He takes the Founding Titan in the chapel',
        ja: '礼拝堂で始祖の巨人を奪う',
      },
      {
        zh: '艾連繼承兩種能力',
        en: 'Eren inherits both powers',
        ja: 'エレンが二つの力を継承',
      },
    ],
    characters: [
      [
        'grisha',
        {
          zh: '進擊／奪取始祖',
          en: 'Attack Titan / takes Founder',
          ja: '進撃の巨人／始祖を奪う',
        },
      ],
      [
        'fried',
        {
          zh: '原始祖巨人',
          en: 'Previous Founding Titan',
          ja: '先代の始祖の巨人',
        },
      ],
      [
        'eren',
        {
          zh: '新繼承者',
          en: 'New inheritor',
          ja: '新たな継承者',
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
      ja: '「ウォール・マリア奪還作戦」：25万人の避難民が壁外へ',
    },
    description: {
      zh: '瑪利亞失陷後一年，牆內糧食不足。王政府以「奪還瑪利亞」為名，將約二十五萬名難民（約佔人口兩成）由托洛斯特送出羅塞之牆，進入滿佈巨人嘅瑪利亞領土。',
      en: 'A year after Maria fell, food inside the Walls ran short. In the name of "retaking Wall Maria", the royal government sent about 250,000 refugees, roughly a fifth of the population, out through Trost into Titan-filled Maria territory.',
      ja: 'マリア陥落から一年、壁内の食糧が不足する。王政府は「ウォール・マリア奪還」の名目で、人口の約二割にあたる避難民およそ25万人を、トロスト区から巨人のあふれるマリア領へ送り出す。',
    },
    outcome: {
      zh: '生還者只有百餘人。呢次唔係敵人入牆，而係人類被送出牆外；牆內嘅糧食壓力因此減輕。',
      en: 'Barely a couple of hundred came back. No enemy entered this time: people were sent out of the Wall, and the food shortage inside eased.',
      ja: '生還者はわずか百数十人。この時は敵が入ったのではなく、人が壁の外へ出された。壁内の食糧不足はこれで和らいだ。',
    },
    beats: [
      {
        zh: '難民喺托洛斯特集結',
        en: 'Refugees gather at Trost',
        ja: '避難民がトロスト区に集まる',
      },
      {
        zh: '由城門進入瑪利亞領土',
        en: 'They march out into Maria territory',
        ja: 'マリア領へ行進する',
      },
      {
        zh: '巨人被人群吸引圍攏',
        en: 'Titans close in on the column',
        ja: '巨人が隊列に群がる',
      },
      {
        zh: '只有極少數人返回',
        en: 'Only a handful return',
        ja: '戻ったのはごくわずか',
      },
    ],
    characters: [
      [
        'civ',
        {
          zh: '被徵召嘅難民',
          en: 'Conscripted refugees',
          ja: '徴用された避難民',
        },
      ],
      [
        'pure',
        {
          zh: '被人群吸引',
          en: 'Drawn to the crowd',
          ja: '人の群れに引き寄せられる',
        },
      ],
      [
        'garrison',
        {
          zh: '守住城門',
          en: 'Holds the gate',
          ja: '門を守る',
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
      ja: '戦士、訓練兵の中に潜む',
    },
    description: {
      zh: '三名戰士加入第104期訓練兵團。尤彌爾亦秘密持有顎之巨人，但佢唔係馬萊間諜。',
      en: 'The three Warriors join the 104th Training Corps. Ymir also secretly holds the Jaw Titan, but is not a Marleyan spy.',
      ja: '三人の戦士が第104期訓練兵団に入る。ユミルもひそかに顎の巨人を持つが、マーレの間者ではない。',
    },
    outcome: {
      zh: '軍隊中已隱藏多名巨人繼承者，敵人唔需要再破牆。',
      en: 'Multiple Titan Shifters now live among soldiers without any new breach.',
      ja: '新たな破壊なしに、複数の巨人化能力者が兵士の中で暮らしている。',
    },
    beats: [
      {
        zh: '戰士融入平民生活',
        en: 'Warriors settle in',
        ja: '戦士たちが壁内に定着',
      },
      {
        zh: '加入第104期訓練兵團',
        en: 'They join the 104th Cadet Corps',
        ja: '第104期訓練兵団に入団',
      },
      {
        zh: '保持巨人身份秘密',
        en: 'Their Titan identities remain secret',
        ja: '巨人の正体は隠されたまま',
      },
    ],
    characters: [
      [
        'reiner',
        {
          zh: '鎧之巨人；偽裝士兵',
          en: 'Armored Titan / cadet',
          ja: '鎧の巨人／訓練兵',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人；偽裝士兵',
          en: 'Colossal Titan / cadet',
          ja: '超大型巨人／訓練兵',
        },
      ],
      [
        'annie',
        {
          zh: '女巨人；偽裝士兵',
          en: 'Female Titan / cadet',
          ja: '女型の巨人／訓練兵',
        },
      ],
      [
        'ymir',
        {
          zh: '非馬萊間諜',
          en: 'Not a Marleyan spy',
          ja: 'マーレの間者ではない',
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
      ja: '超大型巨人、トロスト区の外門を破る',
    },
    description: {
      zh: '貝爾托特變身超大型巨人，破壞托洛斯特外門。純潔巨人進入市區，但內城門守住，所以羅塞主要領土冇陷落。',
      en: 'Bertholdt breaches Trost’s outer gate as the Colossal Titan. Pure Titans enter the district, but the inner gate holds.',
      ja: 'ベルトルトが超大型巨人となってトロスト区の外門を破壊する。無垢の巨人が区内に入るが、内門は守られる。',
    },
    outcome: {
      zh: '羅塞外門損壞；市區發生防衛戰，但中間城牆未被全面突破。',
      en: 'Trost’s outer gate is damaged; the deeper territory of Rose remains protected.',
      ja: 'トロスト区の外門が壊れたが、その奥のローゼ領は守られている。',
    },
    beats: [
      {
        zh: '貝爾托特出現喺外城門',
        en: 'Bertholdt appears outside the gate',
        ja: 'ベルトルトが門の外に現れる',
      },
      {
        zh: '超大型巨人破壞外門',
        en: 'The Colossal Titan breaches it',
        ja: '超大型巨人が門を破る',
      },
      {
        zh: '純潔巨人進入托洛斯特',
        en: 'Pure Titans enter Trost',
        ja: '無垢の巨人がトロスト区に入る',
      },
      {
        zh: '駐紮兵團與訓練兵防守',
        en: 'Garrison and cadets defend',
        ja: '駐屯兵団と訓練兵が防衛',
      },
    ],
    characters: [
      [
        'bert',
        {
          zh: '超大型巨人：破門',
          en: 'Colossal Titan: breach',
          ja: '超大型巨人：破壊',
        },
      ],
      [
        'pure',
        {
          zh: '進入托洛斯特',
          en: 'Enter the district',
          ja: '区内に侵入',
        },
      ],
      [
        'garrison',
        {
          zh: '守住內城門',
          en: 'Defend inner gate',
          ja: '内門を防衛',
        },
      ],
      [
        'eren',
        {
          zh: '展示進擊巨人能力',
          en: 'Reveals Attack Titan power',
          ja: '進撃の巨人の力を現す',
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
      ja: 'エレン、トロスト区の門を塞ぐ',
    },
    description: {
      zh: '駐紮兵團同訓練兵掩護艾連，艾連利用巨石堵住托洛斯特外門。',
      en: 'The Garrison and cadets protect Eren while he carries a boulder to seal Trost’s outer gate.',
      ja: '駐屯兵団と訓練兵に守られながら、エレンが大岩を運んでトロスト区の外門を塞ぐ。',
    },
    outcome: {
      zh: '托洛斯特收復，羅塞防線恢復；內城門全程冇被破壞。',
      en: 'Trost is reclaimed and the Rose perimeter is secured; the inner gate never fell.',
      ja: 'トロスト区は奪還され、ローゼの防衛線が回復する。内門は一度も破られなかった。',
    },
    beats: [
      {
        zh: '士兵制定封門計劃',
        en: 'The defenders devise a sealing plan',
        ja: '兵士たちが門を塞ぐ作戦を立てる',
      },
      {
        zh: '部隊掩護艾連前進',
        en: 'Troops cover Eren’s approach',
        ja: '部隊がエレンの前進を援護',
      },
      {
        zh: '巨石堵住破口',
        en: 'The boulder seals the opening',
        ja: '大岩が穴を塞ぐ',
      },
      {
        zh: '巨人被清除，托洛斯特收復',
        en: 'Titans are cleared and Trost is retaken',
        ja: '巨人を掃討し、トロスト区を奪還',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '進擊的巨人：封門',
          en: 'Attack Titan: seals gate',
          ja: '進撃の巨人：門を塞ぐ',
        },
      ],
      [
        'garrison',
        {
          zh: '防守及支援',
          en: 'Defense and support',
          ja: '防衛と援護',
        },
      ],
      [
        'armin',
        {
          zh: '協調作戰',
          en: 'Helps coordinate',
          ja: '作戦を補佐',
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
      ja: 'アニ、憲兵としてシーナへ',
    },
    description: {
      zh: '亞妮加入憲兵團，取得前往內牆地區嘅合法途徑，喺史托黑斯附近執行任務。',
      en: 'Annie joins the Military Police, gaining legitimate access to the inner Wall and serving in Stohess.',
      ja: 'アニは憲兵団に入り、正規の身分で内地に入ってストヘス区に配属される。',
    },
    outcome: {
      zh: '席納並冇被突破：敵人使用身份同制度進入。',
      en: 'Wall Sina is not breached: the enemy gains entry using a legitimate identity.',
      ja: 'ウォール・シーナは破られていない。敵は正規の身分で中に入った。',
    },
    beats: [
      {
        zh: '訓練結束後加入憲兵團',
        en: 'Annie joins the Military Police',
        ja: 'アニが憲兵団に入団',
      },
      {
        zh: '通過正常城門與軍事關卡',
        en: 'She travels through regular military checkpoints',
        ja: '通常の検問を通って移動',
      },
      {
        zh: '喺內牆隱藏女巨人身份',
        en: 'She remains undercover inside Sina',
        ja: 'シーナの中で潜伏を続ける',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人／憲兵',
          en: 'Female Titan / Military Police',
          ja: '女型の巨人／憲兵',
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
      ja: '女型の巨人、調査兵団を襲う',
    },
    description: {
      zh: '第57次牆外調查由羅塞東面卡拉涅斯出發。亞妮秘密喺牆外變身女巨人，嘗試捕捉艾連。',
      en: 'The 57th expedition leaves Karanes on the eastern Wall Rose perimeter. Annie transforms outside and attempts to capture Eren.',
      ja: '第57回壁外調査はウォール・ローゼ東のカラネス区から出発する。アニは壁外で巨人化し、エレンを捕らえようとする。',
    },
    outcome: {
      zh: '亞妮最後以人類身份返回牆內；具體個人出入關卡並無完整交代。',
      en: 'Annie returns in human form, but her precise individual gate route is not fully shown.',
      ja: 'アニは人間の姿で壁内に戻るが、どの門をどう通ったかは詳しく描かれていない。',
    },
    beats: [
      {
        zh: '調查兵團由卡拉涅斯出牆',
        en: 'Scouts depart via Karanes',
        ja: '調査兵団がカラネス区から出発',
      },
      {
        zh: '女巨人喺牆外出現',
        en: 'The Female Titan appears outside',
        ja: '壁外に女型の巨人が現れる',
      },
      {
        zh: '巨大樹森林中發生追捕',
        en: 'Pursuit in the Forest of Giant Trees',
        ja: '巨大樹の森での追跡',
      },
      {
        zh: '亞妮逃離並返回牆內',
        en: 'Annie escapes and returns inside',
        ja: 'アニが逃れて壁内へ戻る',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人：捕捉艾連',
          en: 'Female Titan: target Eren',
          ja: '女型の巨人：狙いはエレン',
        },
      ],
      [
        'scouts',
        {
          zh: '設陷阱同保護艾連',
          en: 'Set traps and protect Eren',
          ja: '罠を仕掛け、エレンを守る',
        },
      ],
      [
        'eren',
        {
          zh: '被追捕目標',
          en: 'Target',
          ja: '標的',
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
      ja: 'ストヘス区：アニの正体が明らかに',
    },
    description: {
      zh: '亞妮喺席納區域內變成女巨人，同艾連戰鬥並嘗試攀上城牆。米卡莎阻止佢，亞妮最終封住自己於水晶內。',
      en: 'Annie transforms inside Stohess, battles Eren and tries to climb Wall Sina to escape outward. Mikasa stops her and she crystallizes herself.',
      ja: 'アニはストヘス区の中で巨人化してエレンと戦い、ウォール・シーナを登って外へ逃げようとする。ミカサに阻まれ、自らを水晶に閉じ込める。',
    },
    outcome: {
      zh: '冇成功翻越席納。事件亦令藏喺牆身嘅巨人暴露。',
      en: 'She fails to escape over Sina. A Wall Titan is also exposed in the damaged Wall surface.',
      ja: 'シーナを越えて逃げることはできなかった。壊れた壁面から壁の巨人も姿を見せる。',
    },
    beats: [
      {
        zh: '身份被識破',
        en: 'Annie is identified',
        ja: 'アニの正体が見破られる',
      },
      {
        zh: '亞妮喺城內變身',
        en: 'Annie transforms inside',
        ja: 'アニが区内で巨人化',
      },
      {
        zh: '向城牆攀爬被阻止',
        en: 'Her attempted climb is stopped',
        ja: '壁を登ろうとして阻まれる',
      },
      {
        zh: '水晶封存，牆內巨人曝光',
        en: 'Crystal enclosure; Wall Titan revealed',
        ja: '水晶化。壁の中の巨人が露わに',
      },
    ],
    characters: [
      [
        'annie',
        {
          zh: '女巨人：試圖逃走',
          en: 'Female Titan: attempts escape',
          ja: '女型の巨人：逃走を図る',
        },
      ],
      [
        'eren',
        {
          zh: '進擊的巨人：阻止',
          en: 'Attack Titan: confronts her',
          ja: '進撃の巨人：迎え撃つ',
        },
      ],
      [
        'mikasa',
        {
          zh: '阻止佢翻牆',
          en: 'Stops her climb',
          ja: '登るのを阻止',
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
      ja: 'ジーク、ウォール・ローゼの中で巨人を生む',
    },
    description: {
      zh: '吉克、皮克等秘密進入羅塞領土，脊髓液氣體令拉加哥村民受到影響，吉克用叫聲觸發巨人化。',
      en: 'Zeke and Pieck secretly enter Rose territory. Spinal-fluid gas affects Ragako villagers; Zeke’s scream triggers Titan transformation.',
      ja: 'ジークとピークがひそかにローゼ領に入る。脊髄液のガスを吸ったラガコ村の住民が、ジークの叫びで巨人になる。',
    },
    outcome: {
      zh: '士兵搵唔到城牆破口，因為巨人係喺牆內生成。潛入具體入口未明。',
      en: 'The soldiers find no hole in Wall Rose because the Titans were created inside. The precise infiltration route remains unknown.',
      ja: '巨人は壁の中で生まれたため、兵士たちはウォール・ローゼに穴を見つけられない。詳しい潜入経路は不明。',
    },
    beats: [
      {
        zh: '吉克一行人秘密進入',
        en: 'Zeke’s group infiltrates',
        ja: 'ジークの一行が潜入',
      },
      {
        zh: '拉加哥村受到脊髓液影響',
        en: 'Ragako villagers are exposed',
        ja: 'ラガコ村の住民がガスを吸う',
      },
      {
        zh: '村民喺牆內變成巨人',
        en: 'Titans appear from within',
        ja: '巨人が壁の内側に現れる',
      },
      {
        zh: '駐紮兵團搜索城牆，冇發現破口',
        en: 'Soldiers inspect the Walls; no breach exists',
        ja: '兵士が壁を調べるが、穴はない',
      },
    ],
    characters: [
      [
        'zeke',
        {
          zh: '獸之巨人：控制巨人化',
          en: 'Beast Titan: triggers transformation',
          ja: '獣の巨人：巨人化を引き起こす',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人：支援',
          en: 'Cart Titan: support',
          ja: '車力の巨人：支援',
        },
      ],
      [
        'garrison',
        {
          zh: '搜索破口',
          en: 'Search for breach',
          ja: '穴を捜索',
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
      ja: 'ウトガルド城：ユミルが顎の巨人を現す',
    },
    description: {
      zh: '由拉加哥村民變成嘅巨人包圍厄特加爾城，尤彌爾為保護希斯特莉亞及其他人而變身。獸之巨人之後攀過羅塞之牆離開。',
      en: 'The Titans created at Ragako surround Utgard Castle, and Ymir transforms to protect Historia and the others. The Beast Titan later climbs over Wall Rose and leaves.',
      ja: 'ラガコ村で生まれた巨人がウトガルド城を囲み、ユミルはヒストリアたちを守るため巨人化する。獣の巨人はその後ウォール・ローゼをよじ登って去る。',
    },
    outcome: {
      zh: '佢本身已經喺羅塞領土內生活，唔係當日從外面入侵。',
      en: 'She has been living in Rose territory; this is not a new external crossing.',
      ja: 'ユミルは以前からローゼ領で暮らしていた。新たに外から越えてきたわけではない。',
    },
    beats: [
      {
        zh: '拉加哥嘅巨人包圍城堡',
        en: 'Titans from Ragako approach the castle',
        ja: 'ラガコ村の巨人が城に迫る',
      },
      {
        zh: '士兵防守',
        en: 'Soldiers defend',
        ja: '兵士たちが防戦',
      },
      {
        zh: '尤彌爾變身顎之巨人',
        en: 'Ymir transforms into Jaw Titan',
        ja: 'ユミルが顎の巨人になる',
      },
      {
        zh: '獸之巨人攀過羅塞之牆離開',
        en: 'The Beast Titan climbs Wall Rose and leaves',
        ja: '獣の巨人がウォール・ローゼを登って去る',
      },
    ],
    characters: [
      [
        'ymir',
        {
          zh: '顎之巨人：保護同伴',
          en: 'Jaw Titan: protects allies',
          ja: '顎の巨人：仲間を守る',
        },
      ],
      [
        'historia',
        {
          zh: '被保護同伴',
          en: 'Protected companion',
          ja: '守られる仲間',
        },
      ],
      [
        'reiner',
        {
          zh: '識破尤彌爾身份',
          en: 'Recognizes Ymir',
          ja: 'ユミルに気づく',
        },
      ],
      [
        'zeke',
        {
          zh: '獸之巨人：攀牆離開',
          en: 'Beast Titan: climbs out over the Wall',
          ja: '獣の巨人：壁を越えて去る',
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
      ja: 'ライナーとベルトルト、正体を明かす',
    },
    description: {
      zh: '厄特加爾一役後，萊納同貝爾托特喺羅塞之牆頂坦白，變成巨人並帶走艾連、尤彌爾，逃到牆外瑪利亞領土嘅巨大樹森林。',
      en: 'After Utgard, Reiner and Bertholdt reveal their identities atop Wall Rose, transform and carry Eren and Ymir out to a forest of giant trees in former Maria territory.',
      ja: 'ウトガルド城の後、ライナーとベルトルトはウォール・ローゼの上で正体を明かして巨人化し、エレンとユミルを旧マリア領の巨大樹の森へ連れ去る。',
    },
    outcome: {
      zh: '佢哋並無打爛新城門，而係由城牆上方離開。調查兵團最終救返艾連。',
      en: 'No new gate is destroyed: they escape over the Wall, and the Scouts later rescue Eren.',
      ja: '新たに門は壊されていない。二人は壁を越えて逃げ、のちに調査兵団がエレンを奪い返す。',
    },
    beats: [
      {
        zh: '萊納承認自己係鎧之巨人',
        en: 'Reiner reveals the Armored Titan',
        ja: 'ライナーが鎧の巨人だと明かす',
      },
      {
        zh: '兩人喺羅塞牆頂變身',
        en: 'The two transform atop Rose',
        ja: '二人がローゼの上で巨人化',
      },
      {
        zh: '帶同艾連及尤彌爾向外逃',
        en: 'They carry Eren and Ymir outward',
        ja: 'エレンとユミルを壁外へ連れ去る',
      },
      {
        zh: '調查兵團追擊並救回艾連',
        en: 'Scouts pursue and recover Eren',
        ja: '調査兵団が追い、エレンを奪還',
      },
    ],
    characters: [
      [
        'reiner',
        {
          zh: '鎧之巨人：帶人逃離',
          en: 'Armored Titan: abduction',
          ja: '鎧の巨人：連れ去り',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人：掩護',
          en: 'Colossal Titan: cover',
          ja: '超大型巨人：援護',
        },
      ],
      [
        'eren',
        {
          zh: '被擄走、後獲救',
          en: 'Captured then rescued',
          ja: '捕らわれ、救出される',
        },
      ],
      [
        'scouts',
        {
          zh: '追擊',
          en: 'Pursuit',
          ja: '追跡',
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
      ja: 'ロッド・レイス、ウォール・シーナに迫る',
    },
    description: {
      zh: '羅德喺羅塞北部雷斯家禮拜堂地下變成巨人，從城牆外爬向席納北面嘅奧爾福德區，試圖越牆前往王都。',
      en: 'Rod transforms beneath the Reiss chapel in northern Rose territory and crawls to Orvud District on Wall Sina’s north side, trying to climb the Wall towards the capital.',
      ja: 'ロッドはローゼ北部のレイス家礼拝堂の地下で巨人化し、ウォール・シーナ北のオルブド区まで這い進み、壁を越えて王都へ向かおうとする。',
    },
    outcome: {
      zh: '調查兵團成功阻止佢，席納並冇被外敵攻陷。',
      en: 'The Scouts stop him. Wall Sina is not overrun.',
      ja: '調査兵団が阻止する。ウォール・シーナは破られていない。',
    },
    beats: [
      {
        zh: '羅德喺禮拜堂變成巨人',
        en: 'Rod transforms in the chapel',
        ja: 'ロッドが礼拝堂で巨人化',
      },
      {
        zh: '向奧爾福德區移動',
        en: 'He approaches Orvud',
        ja: 'オルブド区に迫る',
      },
      {
        zh: '嘗試攀牆',
        en: 'He attempts to cross the Wall',
        ja: '壁を越えようとする',
      },
      {
        zh: '防守部隊成功阻止',
        en: 'Defenders stop him',
        ja: '守備側が阻止',
      },
    ],
    characters: [
      [
        'rod',
        {
          zh: '純潔巨人：向城牆移動',
          en: 'Pure Titan: approaches Wall',
          ja: '無垢の巨人：壁に迫る',
        },
      ],
      [
        'historia',
        {
          zh: '協助阻止',
          en: 'Helps stop him',
          ja: '阻止に協力',
        },
      ],
      [
        'scouts',
        {
          zh: '城市防守',
          en: 'Defends the district',
          ja: '区を防衛',
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
      ja: 'シガンシナ区でウォール・マリア奪還',
    },
    description: {
      zh: '調查兵團連夜返回希干希納，艾連以硬質化封住外城門破口；獸之巨人隨即擲石堵住內城門，雙方被困城中決戰。萊納、貝爾托特、吉克、皮克迎戰，阿爾敏繼承超大型巨人。',
      en: 'The Scouts return to Shiganshina by night. Eren hardens the hole in the outer gate; the Beast Titan’s thrown boulder then blocks the inner gate, trapping both sides. Reiner, Bertholdt, Zeke and Pieck fight them, and Armin inherits the Colossal Titan.',
      ja: '調査兵団は夜のうちにシガンシナ区へ戻る。エレンが硬質化で外門の穴を塞ぐと、獣の巨人が投げた大岩が内門を塞ぎ、双方が区内に閉じ込められる。ライナー、ベルトルト、ジーク、ピークが迎え撃ち、アルミンが超大型巨人を継承する。',
    },
    outcome: {
      zh: '外城門由艾連封住，內城門被獸之巨人嘅巨石堵住；瑪利亞領土奪回，吉克、萊納、皮克撤退。',
      en: 'The outer gate is sealed by Eren and the inner gate blocked by the Beast Titan’s boulder. Maria territory is reclaimed; Zeke, Reiner and Pieck escape.',
      ja: '外門はエレンが塞ぎ、内門は獣の巨人の大岩で塞がれた。マリア領は奪還され、ジーク、ライナー、ピークは逃れる。',
    },
    beats: [
      {
        zh: '調查兵團由羅塞南下',
        en: 'Scouts travel south from Rose',
        ja: '調査兵団がローゼから南下',
      },
      {
        zh: '艾連封住希干希納外城門',
        en: 'Eren seals the outer gate',
        ja: 'エレンが外門を塞ぐ',
      },
      {
        zh: '獸之巨人擲石堵住內城門，戰士反擊',
        en: 'The Beast Titan’s boulder blocks the inner gate; the Warriors attack',
        ja: '獣の巨人の大岩が内門を塞ぎ、戦士が攻撃',
      },
      {
        zh: '阿爾敏繼承超大型巨人，瑪利亞奪還',
        en: 'Armin inherits the Colossal Titan; Maria is reclaimed',
        ja: 'アルミンが超大型巨人を継承。マリア奪還',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '硬質化封外城門',
          en: 'Hardens the outer gate',
          ja: '外門を硬質化で塞ぐ',
        },
      ],
      [
        'armin',
        {
          zh: '對抗超大型巨人',
          en: 'Confronts the Colossal Titan',
          ja: '超大型巨人と対決',
        },
      ],
      [
        'levi',
        {
          zh: '對抗獸之巨人',
          en: 'Confronts the Beast Titan',
          ja: '獣の巨人と対決',
        },
      ],
      [
        'erwin',
        {
          zh: '率領調查兵團',
          en: 'Leads Survey Corps',
          ja: '調査兵団を指揮',
        },
      ],
      [
        'zeke',
        {
          zh: '獸之巨人：阻止奪還',
          en: 'Beast Titan: opposes operation',
          ja: '獣の巨人：作戦を阻む',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人：藏身城牆突襲',
          en: 'Armored Titan: ambush from the Wall',
          ja: '鎧の巨人：壁から奇襲',
        },
      ],
      [
        'bert',
        {
          zh: '超大型巨人：被擲入城內',
          en: 'Colossal Titan: thrown into the district',
          ja: '超大型巨人：区内へ投げ込まれる',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人：補給及撤退',
          en: 'Cart Titan: supplies and retreat',
          ja: '車力の巨人：補給と撤退',
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
      ja: '調査兵団、マリアを越えて海へ',
    },
    description: {
      zh: '經過奪還戰與巨人清除行動，調查兵團可以走出瑪利亞邊界，直達帕拉迪島海岸。',
      en: 'After the Wall’s recovery and the clearance of Titans, the Scouts travel beyond Maria to the Paradis coast.',
      ja: '壁を取り戻し、巨人を掃討したのち、調査兵団はマリアを越えてパラディ島の海岸にたどり着く。',
    },
    outcome: {
      zh: '人類首次重新踏足城牆外更遠地區；敵人被認知為海洋另一邊嘅世界。',
      en: 'The expedition reveals that the wider world—and the real conflict—lies across the sea.',
      ja: 'より広い世界と本当の争いが海の向こうにあることが明らかになる。',
    },
    beats: [
      {
        zh: '離開瑪利亞領土',
        en: 'Travel beyond Maria',
        ja: 'マリアの外へ',
      },
      {
        zh: '沿島上地區前進',
        en: 'Cross the island',
        ja: '島を横断',
      },
      {
        zh: '抵達海岸',
        en: 'Reach the sea',
        ja: '海に到達',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '前往海邊',
          en: 'Reaches the sea',
          ja: '海にたどり着く',
        },
      ],
      [
        'armin',
        {
          zh: '見到大海',
          en: 'Sees the ocean',
          ja: '海を見る',
        },
      ],
      [
        'scouts',
        {
          zh: '探索外部世界',
          en: 'Explore beyond the Walls',
          ja: '壁の外を探索',
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
      ja: 'マーレの船と義勇兵が到着',
    },
    description: {
      zh: '馬萊偵察船到達帕拉迪海岸；耶蓮娜、歐良果彭等人與島上軍隊接觸，合作背後亦有吉克嘅秘密計劃。',
      en: 'Marleyan reconnaissance vessels reach the coast. Yelena and Onyankopon make contact, while Zeke’s covert plan develops behind the cooperation.',
      ja: 'マーレの調査船が海岸に着く。イェレナとオニャンコポンが接触し、協力の裏でジークの秘策が進む。',
    },
    outcome: {
      zh: '敵方與外來者改為由海路進入，三道牆唔再係唯一防線。',
      en: 'Coastal arrivals bypass the original ringed defenses entirely.',
      ja: '海岸からの来訪者は、輪になった壁の守りをまったく通らない。',
    },
    beats: [
      {
        zh: '偵察船接近海岸',
        en: 'Scouting vessels approach',
        ja: '調査船が近づく',
      },
      {
        zh: '調查兵團攔截船隻',
        en: 'Scouts intercept the vessels',
        ja: '調査兵団が船を捕らえる',
      },
      {
        zh: '義勇兵與帕拉迪接觸',
        en: 'Volunteers contact Paradis',
        ja: '義勇兵がパラディ島と接触',
      },
    ],
    characters: [
      [
        'yelena',
        {
          zh: '義勇兵代表',
          en: 'Volunteer leader',
          ja: '義勇兵の指導者',
        },
      ],
      [
        'ony',
        {
          zh: '協助帕拉迪',
          en: 'Assists Paradis',
          ja: 'パラディ島に協力',
        },
      ],
      [
        'scouts',
        {
          zh: '攔截偵察船',
          en: 'Intercept the ships',
          ja: '船を捕らえる',
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
      ja: 'エレンと調査兵団、海の向こうへ',
    },
    description: {
      zh: '調查兵團前往外部世界，艾連其後以「庫爾迦」嘅假身份獨自在馬萊活動。',
      en: 'The Scouts visit the outside world; Eren later operates in Marley under the assumed name Kruger.',
      ja: '調査兵団が外の世界を訪れる。エレンはその後、クルーガーという偽名でマーレに潜む。',
    },
    outcome: {
      zh: '入侵方向逆轉：而家係帕拉迪嘅巨人繼承者潛入馬萊。',
      en: 'The infiltration direction reverses: a Paradis Titan Shifter infiltrates Marley.',
      ja: '潜入の向きが逆になる。パラディ島の巨人化能力者がマーレに潜入する。',
    },
    beats: [
      {
        zh: '離開帕拉迪',
        en: 'Leave Paradis',
        ja: 'パラディ島を出る',
      },
      {
        zh: '前往海外',
        en: 'Travel overseas',
        ja: '海を渡る',
      },
      {
        zh: '艾連使用假身份潛伏',
        en: 'Eren adopts a false identity',
        ja: 'エレンが偽の身分を名乗る',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '進擊／始祖巨人：偽裝',
          en: 'Attack / Founding Titan undercover',
          ja: '進撃／始祖の巨人、潜入',
        },
      ],
      [
        'scouts',
        {
          zh: '海外調查',
          en: 'Overseas reconnaissance',
          ja: '海外調査',
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
      ja: 'レベリオ襲撃と飛行船での帰還',
    },
    description: {
      zh: '艾連襲擊馬萊並奪取戰鎚巨人，調查兵團乘飛船撤離；吉克、賈碧及法爾可亦到達帕拉迪。',
      en: 'Eren attacks Marley and acquires the War Hammer Titan. The Scouts return by airship, bringing Zeke; Gabi and Falco secretly board.',
      ja: 'エレンがマーレを襲い、戦鎚の巨人を得る。調査兵団はジークを連れて飛行船で戻り、ガビとファルコがひそかに乗り込む。',
    },
    outcome: {
      zh: '新嘅敵對人士直接搭飛船入島，無需穿過任何城門。',
      en: 'New arrivals reach Paradis by airship without using the Wall gates.',
      ja: '新たな者たちが、壁の門を使わず飛行船でパラディ島に入る。',
    },
    beats: [
      {
        zh: '艾連喺馬萊發動襲擊',
        en: 'Eren attacks in Marley',
        ja: 'エレンがマーレで攻撃',
      },
      {
        zh: '調查兵團乘飛船撤離',
        en: 'The Scouts depart by airship',
        ja: '調査兵団が飛行船で離脱',
      },
      {
        zh: '吉克、賈碧、法爾可返回帕拉迪',
        en: 'Zeke, Gabi and Falco reach Paradis',
        ja: 'ジーク、ガビ、ファルコがパラディ島へ',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '戰鎚能力加入',
          en: 'Gains War Hammer power',
          ja: '戦鎚の巨人の力を得る',
        },
      ],
      [
        'armin',
        {
          zh: '超大型巨人',
          en: 'Colossal Titan',
          ja: '超大型巨人',
        },
      ],
      [
        'zeke',
        {
          zh: '獸之巨人：秘密合作',
          en: 'Beast Titan: secret cooperation',
          ja: '獣の巨人：ひそかに協力',
        },
      ],
      [
        'gabi',
        {
          zh: '秘密搭上飛船',
          en: 'Boards secretly',
          ja: 'ひそかに乗り込む',
        },
      ],
      [
        'falco',
        {
          zh: '秘密搭上飛船',
          en: 'Boards secretly',
          ja: 'ひそかに乗り込む',
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
      ja: 'ピークとポルコ、シガンシナ区に潜入',
    },
    description: {
      zh: '皮克偽裝成島上軍人接近艾連，波爾柯早已隱藏，準備喺屋頂位置發動突襲。',
      en: 'Pieck disguises herself as a Paradis soldier and approaches Eren, while Porco waits concealed for an ambush.',
      ja: 'ピークはパラディ島の兵士に変装してエレンに近づき、ポルコは奇襲のために身を潜める。',
    },
    outcome: {
      zh: '兩人嘅精確入城途徑冇完整展示；地圖以虛線示意。',
      en: 'Their exact entry route is not shown; the map uses an approximate dashed route.',
      ja: '二人がどこから入ったかは描かれていない。地図ではおおよその経路を破線で示す。',
    },
    beats: [
      {
        zh: '皮克及波爾柯秘密入城',
        en: 'Pieck and Porco enter covertly',
        ja: 'ピークとポルコがひそかに入る',
      },
      {
        zh: '皮克假裝合作',
        en: 'Pieck feigns cooperation',
        ja: 'ピークが協力を装う',
      },
      {
        zh: '波爾柯展開伏擊',
        en: 'Porco springs the ambush',
        ja: 'ポルコが奇襲',
      },
    ],
    characters: [
      [
        'pieck',
        {
          zh: '車力巨人：偽裝士兵',
          en: 'Cart Titan: in disguise',
          ja: '車力の巨人：変装',
        },
      ],
      [
        'porco',
        {
          zh: '顎之巨人：埋伏',
          en: 'Jaw Titan: ambush',
          ja: '顎の巨人：奇襲',
        },
      ],
      [
        'eren',
        {
          zh: '被設計嘅目標',
          en: 'Target of trap',
          ja: '罠の標的',
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
      ja: 'マーレ、飛行船でシガンシナ区を攻撃',
    },
    description: {
      zh: '馬萊軍用飛船空降進攻，萊納以鎧之巨人加入戰鬥，皮克及波爾柯配合攻擊。',
      en: 'Marley deploys soldiers by airship. Reiner attacks as the Armored Titan, alongside Pieck and Porco.',
      ja: 'マーレが飛行船で兵を降下させる。ライナーが鎧の巨人として、ピーク、ポルコとともに攻撃する。',
    },
    outcome: {
      zh: '軍隊由天空進入希干希納，並唔需要破壞瑪利亞之牆。',
      en: 'The invaders arrive from above rather than breaching Wall Maria.',
      ja: '侵入者はウォール・マリアを破らず、空から来た。',
    },
    beats: [
      {
        zh: '馬萊飛船飛臨希干希納',
        en: 'Marleyan airships arrive',
        ja: 'マーレの飛行船が到着',
      },
      {
        zh: '士兵從空中降落',
        en: 'Soldiers descend',
        ja: '兵士が降下',
      },
      {
        zh: '萊納等巨人進攻',
        en: 'Reiner and the Warriors attack',
        ja: 'ライナーと戦士が攻撃',
      },
      {
        zh: '帕拉迪士兵反擊',
        en: 'Paradis forces counterattack',
        ja: 'パラディ島側が反撃',
      },
    ],
    characters: [
      [
        'marley',
        {
          zh: '空中進攻',
          en: 'Airborne invasion',
          ja: '空からの侵攻',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人',
          en: 'Armored Titan',
          ja: '鎧の巨人',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人',
          en: 'Cart Titan',
          ja: '車力の巨人',
        },
      ],
      [
        'eren',
        {
          zh: '防守及反擊',
          en: 'Defends and counterattacks',
          ja: '防衛と反撃',
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
      ja: 'ジーク、シガンシナ区内で巨人を生む',
    },
    description: {
      zh: '部分士兵之前已攝入吉克脊髓液；吉克叫聲令佢哋喺城內巨人化。法爾可其後取得顎之巨人。',
      en: 'People previously exposed to Zeke’s spinal fluid transform within the district after his scream. Falco later inherits the Jaw Titan.',
      ja: 'ジークの脊髄液を口にしていた人々が、彼の叫びで区内で巨人になる。ファルコはのちに顎の巨人を継承する。',
    },
    outcome: {
      zh: '再次唔需要破城門：巨人喺人群所在位置生成。',
      en: 'Once again no new gate breach is required: Titans appear inside the populated district.',
      ja: '今回も新たに門を破る必要はない。巨人は人の住む区の中に現れる。',
    },
    beats: [
      {
        zh: '吉克抵達附近戰場',
        en: 'Zeke reaches the battlefield',
        ja: 'ジークが戦場に着く',
      },
      {
        zh: '佢嘅叫聲觸發巨人化',
        en: 'His scream triggers transformation',
        ja: '叫びが巨人化を引き起こす',
      },
      {
        zh: '新巨人出現喺城內',
        en: 'Titans appear within the district',
        ja: '区内に巨人が現れる',
      },
    ],
    characters: [
      [
        'zeke',
        {
          zh: '獸之巨人：觸發巨人化',
          en: 'Beast Titan: triggers transformation',
          ja: '獣の巨人：巨人化を引き起こす',
        },
      ],
      [
        'falco',
        {
          zh: '之後繼承顎之巨人',
          en: 'Later inherits Jaw Titan',
          ja: 'のちに顎の巨人を継承',
        },
      ],
      [
        'garrison',
        {
          zh: '面對突發內部威脅',
          en: 'Responds to internal threat',
          ja: '内側の脅威に対処',
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
      ja: '地鳴らし：三つの壁がすべて崩れる',
    },
    description: {
      zh: '艾連動用始祖巨人之力，解除瑪利亞、羅塞、席納牆身嘅硬質化，令隱藏其中嘅巨人向外行進。',
      en: 'Eren uses the Founding Titan to undo the hardening of Maria, Rose and Sina. The hidden Wall Titans march outward.',
      ja: 'エレンが始祖の巨人の力でマリア、ローゼ、シーナの硬質化を解く。壁に隠されていた巨人が外へ進み出す。',
    },
    outcome: {
      zh: '三道城牆從此不再存在為防禦屏障；亞妮嘅水晶亦同時解開。',
      en: 'All three Walls cease to function as barriers; Annie’s crystal also dissolves.',
      ja: '三つの壁はすべて防壁として機能しなくなる。アニの水晶も解ける。',
    },
    beats: [
      {
        zh: '艾連啟動始祖巨人',
        en: 'Eren activates the Founding Titan',
        ja: 'エレンが始祖の巨人を発動',
      },
      {
        zh: '三道牆硬質化解除',
        en: 'The three Walls unharden',
        ja: '三つの壁の硬質化が解ける',
      },
      {
        zh: '城牆巨人步出向外行進',
        en: 'Wall Titans march outward',
        ja: '壁の巨人が外へ進む',
      },
      {
        zh: '巨人離開帕拉迪島',
        en: 'Titans move beyond Paradis',
        ja: '巨人がパラディ島の外へ向かう',
      },
    ],
    characters: [
      [
        'eren',
        {
          zh: '始祖巨人：控制地鳴',
          en: 'Founding Titan: controls Rumbling',
          ja: '始祖の巨人：地鳴らしを操る',
        },
      ],
      [
        'walltitans',
        {
          zh: '由牆身走出',
          en: 'Emerge from the Walls',
          ja: '壁から現れる',
        },
      ],
      [
        'annie',
        {
          zh: '解除水晶封印',
          en: 'Crystal released',
          ja: '水晶から解放',
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
      ja: '連合、地鳴らしを止めるためパラディ島を出る',
    },
    description: {
      zh: '阿爾敏、萊納、亞妮、皮克、法爾可同調查兵團部分成員合作，經港口離島追擊艾連。',
      en: 'Armin, Reiner, Annie, Pieck, Falco and some Scouts join forces, leave via the port and pursue Eren.',
      ja: 'アルミン、ライナー、アニ、ピーク、ファルコと一部の調査兵が手を組み、港から出てエレンを追う。',
    },
    outcome: {
      zh: '昔日敵對嘅巨人繼承者合作；冇城牆再阻礙出入。',
      en: 'Former enemy Titan Shifters cooperate, and the Walls no longer block travel.',
      ja: 'かつて敵同士だった巨人化能力者が協力する。壁はもう行き来を妨げない。',
    },
    beats: [
      {
        zh: '敵對雙方組成聯盟',
        en: 'Former enemies form an alliance',
        ja: 'かつての敵同士が手を組む',
      },
      {
        zh: '聯盟前往港口',
        en: 'They travel to the port',
        ja: '港へ向かう',
      },
      {
        zh: '離開帕拉迪追擊艾連',
        en: 'They leave Paradis in pursuit',
        ja: 'パラディ島を出て追う',
      },
    ],
    characters: [
      [
        'alliance',
        {
          zh: '合作阻止地鳴',
          en: 'Cooperate to stop the Rumbling',
          ja: '地鳴らしを止めるため協力',
        },
      ],
      [
        'armin',
        {
          zh: '超大型巨人',
          en: 'Colossal Titan',
          ja: '超大型巨人',
        },
      ],
      [
        'reiner',
        {
          zh: '鎧之巨人',
          en: 'Armored Titan',
          ja: '鎧の巨人',
        },
      ],
      [
        'annie',
        {
          zh: '女巨人',
          en: 'Female Titan',
          ja: '女型の巨人',
        },
      ],
      [
        'pieck',
        {
          zh: '車力巨人',
          en: 'Cart Titan',
          ja: '車力の巨人',
        },
      ],
      [
        'falco',
        {
          zh: '顎之巨人',
          en: 'Jaw Titan',
          ja: '顎の巨人',
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
      ja: '和平大使、パラディ島に戻る',
    },
    description: {
      zh: '巨人力量消失三年後，阿爾敏、約翰、柯尼、萊納、亞妮、皮克等人以和平使節身份乘船返回帕拉迪。',
      en: 'Three years after Titan powers end, Armin, Jean, Connie, Reiner, Annie and Pieck return to Paradis as peace ambassadors.',
      ja: '巨人の力が消えて三年後、アルミン、ジャン、コニー、ライナー、アニ、ピークが和平大使としてパラディ島に戻る。',
    },
    outcome: {
      zh: '城牆已消失，佢哋亦唔再擁有巨人力量；呢次唔係潛入任務。',
      en: 'The Walls and their Titan powers are gone. This is diplomacy, not infiltration.',
      ja: '壁も巨人の力もなくなった。これは潜入ではなく外交である。',
    },
    beats: [
      {
        zh: '使節乘船接近島嶼',
        en: 'Ambassadors approach by ship',
        ja: '大使たちが船で近づく',
      },
      {
        zh: '返回帕拉迪',
        en: 'They return to Paradis',
        ja: 'パラディ島に戻る',
      },
      {
        zh: '巨人時代結束',
        en: 'The age of Titans is over',
        ja: '巨人の時代は終わった',
      },
    ],
    characters: [
      [
        'armin',
        {
          zh: '和平使節',
          en: 'Peace envoy',
          ja: '和平大使',
        },
      ],
      [
        'reiner',
        {
          zh: '和平使節',
          en: 'Peace envoy',
          ja: '和平大使',
        },
      ],
      [
        'annie',
        {
          zh: '和平使節',
          en: 'Peace envoy',
          ja: '和平大使',
        },
      ],
      [
        'pieck',
        {
          zh: '和平使節',
          en: 'Peace envoy',
          ja: '和平大使',
        },
      ],
    ],
    delta: {},
  },
  {
    id: 'rebuild',
    year: '857+',
    category: 'finale',
    wall: 'outside',
    place: 'mitras',
    title: {
      zh: '857年之後：帕拉迪島越過舊牆界線發展',
      en: 'After 857: Paradis grows beyond the old Wall lines',
      ja: '857年以降：かつての壁を越えて広がるパラディ島',
    },
    description: {
      zh: '城牆同巨人都已消失。人口增長，居民離開舊牆界線，沿住鐵路同海岸建立新市鎮；新港口同鐵路將全島連接起來。',
      en: 'The Walls and the Titans are gone. The population grows and people settle beyond the old Wall lines, in new towns along the railway and the coast. New ports and railway lines link the whole island.',
      ja: '壁も巨人もなくなった。人口が増え、人々はかつての壁の外へ移り住み、鉄道や海岸沿いに新しい町を築く。新しい港と鉄道が島全体を結ぶ。',
    },
    outcome: {
      zh: '再冇人需要越牆。呢一段係示意：原作只係約略交代島上其後嘅發展。',
      en: 'Nobody has a Wall left to cross. This part is schematic: the story only hints at how the island grew afterwards.',
      ja: 'もう越えるべき壁はない。この部分は概略であり、原作はその後の島の発展をわずかに描くだけである。',
    },
    beats: [
      {
        zh: '鐵路向四方延伸',
        en: 'The railway spreads in every direction',
        ja: '鉄道が四方へ延びる',
      },
      {
        zh: '新港口同市鎮落成',
        en: 'New ports and towns are built',
        ja: '新しい港と町ができる',
      },
      {
        zh: '居民遍佈全島',
        en: 'People settle all over the island',
        ja: '人々が島じゅうに広がる',
      },
    ],
    characters: [
      [
        'civ',
        {
          zh: '定居全島',
          en: 'Settle the whole island',
          ja: '島じゅうに定住',
        },
      ],
    ],
    delta: {},
  },
];
