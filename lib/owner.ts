// 個人クローズドサイトの利用者データ（吉田俊輔）
// すべての占断結果はこの定数から生成される。

export const OWNER = {
  // ===== 識別情報 =====
  displayName: "吉田俊輔",
  nameSei: "吉田",
  nameMei: "俊輔",
  nameSeiKakusu: [6, 5] as const,    // 吉(6) 田(5)
  nameMeiKakusu: [9, 14] as const,   // 俊(9) 輔(14)
  nameRoman: "YOSHIDA SHUNSUKE",
  birth: "1984-05-02",
  hour: 13,                          // 13:00 出生
  gender: "male" as "male" | "female",
  bloodType: "B",

  // ===== 出生地（西洋占星術用） =====
  birthplace: {
    pref: "大阪府",
    city: "大阪市城東区",
    lat: 34.6913,
    lng: 135.5447,
    tz: "JST (UTC+9)",
  },

  // ===== 現住所（風水・家相用） =====
  residence: {
    pref: "大阪府",
    city: "大阪市天王寺区",
    detail: "筆ヶ崎町2丁目10番 リーバーガーデンタワー筆ヶ崎 2302号室",
    floor: 23,                       // 高層階（陽）
    fromBirthplaceDirection: "南西", // 出生地から見た方角
  },

  // ===== ネイタル（事前算出済みの正式値） =====
  natal: {
    // 西洋占星術
    sun: "taurus",
    moonApprox: "射手座〜山羊座圏",      // 月星座（精密計算には ephemeris が必要なので概算）
    ascApprox: "獅子座圏",                // 13:00 出生に基づく概算
    mcApprox: "牡牛座圏",

    // 四柱推命（正式な命式）
    fourPillars: {
      year: "甲子",
      month: "戊辰",
      day: "戊申",
      hour: "己未",
    },

    // 九星気学
    kyusei: {
      honmei: 7,    // 七赤金星
      getsumei: 3,  // 三碧木星
    },

    // 風水
    fengshui: {
      kua: 6,       // 乾（西四命）※男・1984年
    },

    // 数秘術
    numerology: {
      lifePath: 11, // マスターナンバー
      birthday: 2,
    },

    // タロット バースカード（11/2システム）
    birthCard: {
      personality: 11, // 正義
      soul: 2,         // 女教皇
    },
  },

  // ===== 家族 =====
  family: {
    spouse: {
      relation: "妻",
      birth: "1969-12-21",
      gender: "female" as const,
      sunSign: "sagittarius",
      eto: "酉",
      kyusei: 1,   // 一白水星
      lifePath: 4,
    },
    child: {
      relation: "子（中学2年）",
      birth: "2011-11-03",
      gender: null,
      sunSign: "scorpio",
      eto: "卯",
      kyusei: 4,   // 四緑木星
      lifePath: 9,
    },
  },

  // ===== 香水コレクション =====
  // ⚠️ 実際の所有香水に編集してください。
  //  - energyDays: パーソナルデイ番号 (1-9) と相性が良い数字
  //  - weather: "sunny" | "cloudy" | "rainy" | "snow" | "fog" | "thunder" | "hot" | "cold"
  //  - time: "morning" | "afternoon" | "evening" | "night"
  //  - season: "spring" | "summer" | "autumn" | "winter"
  perfumes: [
    {
      id: "tf-tobacco-vanille",
      brand: "Tom Ford",
      name: "Tobacco Vanille",
      family: "オリエンタル・スパイシー",
      notes: ["タバコリーフ", "バニラ", "カカオ", "ドライフルーツ", "トンカビーン"],
      mood: ["重厚", "セクシー", "リッチ"],
      season: ["autumn", "winter"],
      time: ["evening", "night"],
      weather: ["cold", "snow", "rainy", "cloudy"],
      energyDays: [4, 8],
      description: "深く甘いタバコの煙とバニラの抱擁。重要な決断・夜の集まり・寒い夜にあなたを神秘的にする。戊土と相性が良い濃厚オリエンタル。",
    },
    {
      id: "creed-aventus",
      brand: "Creed",
      name: "Aventus",
      family: "シプレ・フルーティ",
      notes: ["パイナップル", "ベルガモット", "バーチ", "ジャスミン", "ムスク"],
      mood: ["勝負", "成功", "自信"],
      season: ["spring", "summer", "autumn"],
      time: ["morning", "afternoon"],
      weather: ["sunny", "hot", "cloudy"],
      energyDays: [1, 8],
      description: "勝者のフルーティ・スモーク。プレゼン・交渉・大きな決断のある日に。あなたの七赤金星×頭領運23画と最も共鳴する一本。",
    },
    {
      id: "mfk-baccarat-rouge",
      brand: "Maison Francis Kurkdjian",
      name: "Baccarat Rouge 540",
      family: "アンバー・ウッディ",
      notes: ["サフラン", "アンバーグリス", "シダーウッド", "ジャスミン"],
      mood: ["神秘", "高貴", "華やか"],
      season: ["autumn", "winter", "spring"],
      time: ["evening", "night"],
      weather: ["cold", "cloudy", "rainy"],
      energyDays: [7, 9],
      description: "金色の光のような神秘の香り。マスター11と女教皇カードに最もふさわしい。瞑想・特別な夜・自分を高みに置きたい時に。",
    },
    {
      id: "lelabo-santal-33",
      brand: "Le Labo",
      name: "Santal 33",
      family: "ウッディ",
      notes: ["サンダルウッド", "アイリス", "バイオレット", "カルダモン", "アンバー"],
      mood: ["落ち着き", "静寂", "知性"],
      season: ["autumn", "winter", "spring"],
      time: ["afternoon", "evening"],
      weather: ["cloudy", "cold", "fog"],
      energyDays: [2, 7],
      description: "白檀の静寂と煙の哲学。一人時間・読書・深い対話を引き寄せる。日主『戊（山）』の本質に響くウッディ。",
    },
    {
      id: "hermes-terre",
      brand: "Hermès",
      name: "Terre d'Hermès",
      family: "ウッディ・シトラス",
      notes: ["オレンジ", "グレープフルーツ", "ペッパー", "ベチバー", "シダー"],
      mood: ["大地", "信頼", "安定"],
      season: ["spring", "summer", "autumn"],
      time: ["morning", "afternoon"],
      weather: ["sunny", "hot", "cloudy"],
      energyDays: [4, 6],
      description: "大地と空気の香り。商談・会議・出張・通勤など『信頼を運ぶ』日に。戊土の本領を補強する代表作。",
    },
    {
      id: "chanel-bleu",
      brand: "Chanel",
      name: "Bleu de Chanel EDP",
      family: "ウッディ・アロマティック",
      notes: ["グレープフルーツ", "インセンス", "ジンジャー", "サンダルウッド"],
      mood: ["端正", "都会的", "知的"],
      season: ["spring", "summer", "autumn", "winter"],
      time: ["morning", "afternoon", "evening"],
      weather: ["sunny", "cloudy", "cold"],
      energyDays: [3, 5, 6],
      description: "万能の優等生。フォーマルな場・社内会議・写真撮影など『きちんと整える』日に。獅子座ASCの輝きを支える。",
    },
    {
      id: "diptyque-philosykos",
      brand: "Diptyque",
      name: "Philosykos",
      family: "グリーン・ウッディ",
      notes: ["イチジクの葉", "ココナッツ", "シダー", "ホワイトムスク"],
      mood: ["透明", "瑞々しい", "リラックス"],
      season: ["spring", "summer"],
      time: ["morning", "afternoon"],
      weather: ["sunny", "hot", "cloudy"],
      energyDays: [3, 5],
      description: "夏の地中海の木陰。家族と過ごす休日・カフェでの読書・軽やかな外出に。子供との時間にも合う。",
    },
    {
      id: "byredo-bal",
      brand: "Byredo",
      name: "Bal d'Afrique",
      family: "フローラル・ウッディ",
      notes: ["ベルガモット", "ネロリ", "バイオレット", "シダー", "ベチバー"],
      mood: ["エキゾチック", "自由", "陽気"],
      season: ["spring", "summer", "autumn"],
      time: ["afternoon", "evening"],
      weather: ["sunny", "hot", "cloudy"],
      energyDays: [3, 5],
      description: "1920年代パリのアフリカ熱を想起させる自由の香り。旅・新規開拓・人と会う日に。",
    },
    {
      id: "frederic-malle-portrait",
      brand: "Frederic Malle",
      name: "Portrait of a Lady",
      family: "オリエンタル・ローズ",
      notes: ["ターキッシュローズ", "パチュリ", "インセンス", "ベンゾイン"],
      mood: ["威厳", "深紅", "強烈"],
      season: ["autumn", "winter"],
      time: ["evening", "night"],
      weather: ["cold", "rainy", "cloudy"],
      energyDays: [8, 9],
      description: "深紅のローズと煙の威厳。重要な夜・人生の節目・自分を完全武装したい時に。",
    },
    {
      id: "penhaligons-halfeti",
      brand: "Penhaligon's",
      name: "Halfeti",
      family: "オリエンタル・ウッディ",
      notes: ["ベルガモット", "サフラン", "ジャスミン", "ローズ", "ウード"],
      mood: ["神秘", "東洋", "深い"],
      season: ["autumn", "winter"],
      time: ["evening", "night"],
      weather: ["cold", "cloudy", "fog", "rainy"],
      energyDays: [7, 9],
      description: "トルコの黒バラ伝説。瞑想・神社参拝・家族との静かな夜に。マスター11の霊性を引き出す。",
    },
    {
      id: "acqua-di-parma-colonia",
      brand: "Acqua di Parma",
      name: "Colonia",
      family: "シトラス・クラシック",
      notes: ["シチリアレモン", "ベルガモット", "ローズマリー", "ラベンダー", "ベチバー"],
      mood: ["清潔", "クラシック", "上品"],
      season: ["spring", "summer"],
      time: ["morning", "afternoon"],
      weather: ["sunny", "hot"],
      energyDays: [1, 4, 6],
      description: "イタリア紳士の代名詞。朝の出社・夏の打合せ・正装の日に。爽やかさと品格の最大公約数。",
    },
    {
      id: "aesop-hwyl",
      brand: "Aesop",
      name: "Hwyl",
      family: "ウッディ・スモーキー",
      notes: ["インセンス", "ヒノキ", "ベチバー", "ジュニパーベリー"],
      mood: ["禅", "瞑想的", "落ち着き"],
      season: ["autumn", "winter", "spring"],
      time: ["morning", "afternoon", "evening"],
      weather: ["cold", "cloudy", "fog", "rainy"],
      energyDays: [2, 7],
      description: "古社の境内のような清浄な煙。瞑想・内省・静かな仕事に。日主戊と最も親和性が高い香り。",
    },
  ],
} as const;
