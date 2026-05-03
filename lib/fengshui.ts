// 風水（本命卦）
// アルゴリズム:
//  本命卦 (Kua Number)
//   男性: (100 - 西暦下2桁) を 9 で割った余り (0 → 9)
//   女性: (西暦下2桁 + 5) を 9 で割った余り (0 → 9)
//   ※ 立春前生まれは前年扱い (簡易: 2/4)
//   ※ 5 は男=2, 女=8 に置換
//  分類:
//   東四命 (吉方位 = 東/南/北/東南): 1, 3, 4, 9
//   西四命 (吉方位 = 西/西北/西南/東北): 2, 6, 7, 8
//  各本命卦に対する 8 方位の吉凶 (生気/天医/延年/伏位 / 禍害/六殺/五鬼/絶命)

export type Gender = "male" | "female";

const DIRS = ["北", "東北", "東", "東南", "南", "西南", "西", "西北"] as const;
type Dir = (typeof DIRS)[number];

export const KUA_NAMES: Record<number, { name: string; group: "東四命" | "西四命" }> = {
  1: { name: "坎", group: "東四命" },
  2: { name: "坤", group: "西四命" },
  3: { name: "震", group: "東四命" },
  4: { name: "巽", group: "東四命" },
  6: { name: "乾", group: "西四命" },
  7: { name: "兌", group: "西四命" },
  8: { name: "艮", group: "西四命" },
  9: { name: "離", group: "東四命" },
};

// 各本命卦 → 方位 → 吉凶
// 吉: 生気(大吉) / 天医(吉/健康) / 延年(吉/長寿) / 伏位(小吉)
// 凶: 禍害(小凶) / 六殺(中凶) / 五鬼(大凶) / 絶命(最大凶)
export type DirRating =
  | "生気"
  | "天医"
  | "延年"
  | "伏位"
  | "禍害"
  | "六殺"
  | "五鬼"
  | "絶命";

export const RATING_KIND: Record<DirRating, "吉" | "凶"> = {
  生気: "吉", 天医: "吉", 延年: "吉", 伏位: "吉",
  禍害: "凶", 六殺: "凶", 五鬼: "凶", 絶命: "凶",
};

const TABLE: Record<number, Record<Dir, DirRating>> = {
  1: { 北: "伏位", 東北: "五鬼", 東: "天医", 東南: "生気", 南: "延年", 西南: "絶命", 西: "禍害", 西北: "六殺" },
  3: { 北: "天医", 東北: "六殺", 東: "伏位", 東南: "延年", 南: "生気", 西南: "禍害", 西: "絶命", 西北: "五鬼" },
  4: { 北: "生気", 東北: "絶命", 東: "延年", 東南: "伏位", 南: "天医", 西南: "五鬼", 西: "六殺", 西北: "禍害" },
  9: { 北: "延年", 東北: "禍害", 東: "生気", 東南: "天医", 南: "伏位", 西南: "六殺", 西: "五鬼", 西北: "絶命" },
  2: { 北: "絶命", 東北: "生気", 東: "禍害", 東南: "五鬼", 南: "六殺", 西南: "伏位", 西: "天医", 西北: "延年" },
  6: { 北: "六殺", 東北: "天医", 東: "五鬼", 東南: "禍害", 南: "絶命", 西南: "延年", 西: "生気", 西北: "伏位" },
  7: { 北: "禍害", 東北: "延年", 東: "絶命", 東南: "六殺", 南: "五鬼", 西南: "天医", 西: "伏位", 西北: "生気" },
  8: { 北: "五鬼", 東北: "伏位", 東: "六殺", 東南: "絶命", 南: "禍害", 西南: "生気", 西: "延年", 西北: "天医" },
};

export function calcKua(year: number, month: number, day: number, gender: Gender): number {
  const eff = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  const yy = eff % 100;
  let k: number;
  if (gender === "male") {
    k = (100 - yy) % 9;
  } else {
    k = (yy + 5) % 9;
  }
  if (k === 0) k = 9;
  if (k === 5) k = gender === "male" ? 2 : 8;
  return k;
}

export function dirRatings(kua: number): { dir: Dir; rating: DirRating; kind: "吉" | "凶" }[] {
  const map = TABLE[kua];
  return DIRS.map((d) => ({ dir: d, rating: map[d], kind: RATING_KIND[map[d]] }));
}

// 流年（年運）方位: 西暦から「九星」を割り出し、その年に避けるべき方位を返す。
// 簡易ルール:
//   九星 = ((11 - (西暦 mod 9)) % 9) || 9   (1=一白水星 ... 9=九紫火星)
//   五黄殺 (中央に来た五黄が動いた逆方位) と 暗剣殺 を年盤からの近似で算出
// MVPでは「歳破」「五黄」「暗剣」の3方位だけ示す。

const SAIHA_DIR: Record<number, string> = {
  // 西暦の地支（年支）の対冲方位
  // 子(0)→午(南), 丑(1)→未(西南), 寅(2)→申(西), 卯(3)→酉(西), 辰(4)→戌(西北),
  // 巳(5)→亥(西北), 午(6)→子(北), 未(7)→丑(東北), 申(8)→寅(東北), 酉(9)→卯(東),
  // 戌(10)→辰(東南), 亥(11)→巳(東南)
  0: "南", 1: "西南", 2: "西", 3: "西", 4: "西北", 5: "西北",
  6: "北", 7: "東北", 8: "東北", 9: "東", 10: "東南", 11: "東南",
};

// 各九星が中央にいる年の年盤に基づく、五黄／暗剣の所在方位
// 簡易版テーブル: 中央=「九星番号」のとき → [五黄方位, 暗剣方位]
const ANNUAL_TABLE: Record<number, { gokou: string; anken: string }> = {
  1: { gokou: "南東",  anken: "北西" }, // 五黄が南東、その対冲が北西
  2: { gokou: "東",    anken: "西" },
  3: { gokou: "中央",  anken: "—"   }, // 五黄が中央=被害無し
  4: { gokou: "北西",  anken: "南東" },
  5: { gokou: "西",    anken: "東" },
  6: { gokou: "北東",  anken: "南西" },
  7: { gokou: "南",    anken: "北" },
  8: { gokou: "北",    anken: "南" },
  9: { gokou: "南西",  anken: "北東" },
};

export type AnnualDirection = {
  year: number;
  star: number;
  starName: string;
  saiha: string;     // 歳破（避けるべき）
  gokou: string;     // 五黄殺
  anken: string;     // 暗剣殺
};

const STAR_NAMES = [
  "", "一白水星", "二黒土星", "三碧木星", "四緑木星", "五黄土星",
  "六白金星", "七赤金星", "八白土星", "九紫火星",
];

export function annualDirection(year: number): AnnualDirection {
  let star = (11 - (year % 9)) % 9;
  if (star === 0) star = 9;
  const branchIdx = (year - 4 + 12 * 1000) % 12;
  const t = ANNUAL_TABLE[star];
  return {
    year,
    star,
    starName: STAR_NAMES[star],
    saiha: SAIHA_DIR[branchIdx],
    gokou: t.gokou,
    anken: t.anken,
  };
}

export const RATING_TEXT: Record<DirRating, string> = {
  生気: "大吉。発展と活力。仕事・恋愛・新しい挑戦に。",
  天医: "吉。健康と回復。寝室や休息の場所に。",
  延年: "吉。長寿と人間関係。家族の集まりに。",
  伏位: "小吉。安定と平和。書斎や静かな作業場所に。",
  禍害: "小凶。トラブルや小さな災い。長居しない。",
  六殺: "中凶。人間関係のもつれ、ストレス。",
  五鬼: "大凶。盗難や対立。重要な場所に避ける。",
  絶命: "最大凶。健康・運気の大きな低下。寝室は厳禁。",
};
