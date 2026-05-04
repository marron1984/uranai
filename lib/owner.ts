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
} as const;
