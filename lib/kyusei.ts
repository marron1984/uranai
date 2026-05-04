// 九星気学（Kyusei Kigaku / Nine Star Ki）
// アルゴリズム:
//  本命星 = 11 - (西暦の各桁を1桁になるまで足した値)（負/0なら +9 補正）
//  ※立春以前生まれは前年扱い（簡易: 2/4 を境界に固定）
//  月命星 = 本命星のグループ × 月（節入り）から月命星表で導出
//  五行: 一白=水 / 二黒=土 / 三碧=木 / 四緑=木 / 五黄=土 /
//        六白=金 / 七赤=金 / 八白=土 / 九紫=火

export type StarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const STAR_NAME: Record<StarNumber, string> = {
  1: "一白水星",
  2: "二黒土星",
  3: "三碧木星",
  4: "四緑木星",
  5: "五黄土星",
  6: "六白金星",
  7: "七赤金星",
  8: "八白土星",
  9: "九紫火星",
};

export const STAR_ELEMENT: Record<StarNumber, "水" | "土" | "木" | "金" | "火"> = {
  1: "水", 2: "土", 3: "木", 4: "木", 5: "土",
  6: "金", 7: "金", 8: "土", 9: "火",
};

export const STAR_DIRECTION: Record<StarNumber, string> = {
  1: "北", 2: "南西", 3: "東", 4: "東南",
  5: "中央", 6: "北西", 7: "西", 8: "東北", 9: "南",
};

export const STAR_TRAIT: Record<StarNumber, string> = {
  1: "柔軟・知性・水のような適応力。一見穏やかだが芯が強い。",
  2: "受容・忍耐・母性。地道な努力を惜しまない縁の下の力持ち。",
  3: "進取・スピード・若々しさ。発信と立ち上げに強い。",
  4: "信用・調整・縁。風のように人と人を結ぶ社交家。",
  5: "中央・帝王・破壊と再生。良くも悪くも極端さを内包する。",
  6: "完璧主義・指導者・天の徳。責任ある立場で輝く。",
  7: "社交・話術・楽しみ。お金と楽しみを引き寄せる星。",
  8: "蓄積・継承・変化の節目。山のように動かない芯。",
  9: "華やかさ・知性・名声。光と影が際立つ表現者の星。",
};

export function honmeiStar(year: number, month: number, day: number): StarNumber {
  const eff = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  let s = 0;
  let y = eff;
  while (y > 0) {
    s += y % 10;
    y = Math.floor(y / 10);
  }
  while (s > 9) {
    let s2 = 0;
    while (s > 0) {
      s2 += s % 10;
      s = Math.floor(s / 10);
    }
    s = s2;
  }
  let h = 11 - s;
  if (h > 9) h -= 9;
  if (h < 1) h += 9;
  return h as StarNumber;
}

// 九星同士の五行関係（相生・比和・相剋）
export type FiveRelation = "相生(発展)" | "比和(調和)" | "相剋(摩擦)" | "洩気(消耗)" | "受剋(被害)";

export function starRelation(a: StarNumber, b: StarNumber): {
  relation: FiveRelation;
  score: number; // 1-5（5が最良）
  text: string;
} {
  const ea = STAR_ELEMENT[a];
  const eb = STAR_ELEMENT[b];
  const generates: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const controls: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
  if (ea === eb) {
    return { relation: "比和(調和)", score: 4, text: "同じ五行同士。安定して理解し合える関係。" };
  }
  if (generates[ea] === eb) {
    return { relation: "洩気(消耗)", score: 3, text: "あなたが相手を生む立場。気を与えるが疲れやすい。" };
  }
  if (generates[eb] === ea) {
    return { relation: "相生(発展)", score: 5, text: "相手があなたを生かしてくれる関係。発展的・吉。" };
  }
  if (controls[ea] === eb) {
    return { relation: "相剋(摩擦)", score: 2, text: "あなたが相手を抑える立場。指導は通るが圧迫しがち。" };
  }
  if (controls[eb] === ea) {
    return { relation: "受剋(被害)", score: 1, text: "相手から抑えられる立場。配慮と距離感が必要。" };
  }
  return { relation: "比和(調和)", score: 3, text: "中立的な関係。" };
}
