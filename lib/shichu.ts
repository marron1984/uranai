// 四柱推命（簡易版）
// アルゴリズム:
//  - 日柱: 西暦日付を通日に変換し、基準日との差分から60干支(甲子=0..癸亥=59)を引く
//    基準: 1900年1月1日 = 庚戌（甲子から数えて46）
//  - 年柱: 立春の前は前年扱い (MVPでは 2/4 を境界に固定)
//          年干 = (西暦 - 4) mod 10, 年支 = (西暦 - 4) mod 12
//  - 月柱: 節入り日固定 (簡易) で月支を決定し、五虎遁の表で月干を決定
//  - 時柱: 時刻 → 時支 (子=23-1, 丑=1-3...) と五鼠遁の表で時干を決定

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export const STEM_ELEMENT: Record<string, string> = {
  甲: "陽木", 乙: "陰木", 丙: "陽火", 丁: "陰火",
  戊: "陽土", 己: "陰土", 庚: "陽金", 辛: "陰金",
  壬: "陽水", 癸: "陰水",
};

export const BRANCH_ELEMENT: Record<string, string> = {
  子: "陽水", 丑: "陰土", 寅: "陽木", 卯: "陰木",
  辰: "陽土", 巳: "陰火", 午: "陽火", 未: "陰土",
  申: "陽金", 酉: "陰金", 戌: "陽土", 亥: "陰水",
};

// 既知の干支文字列（例 "戊申"）から Pillar / FourPillars を構築
export function pillarFromGanzhi(gz: string): Pillar {
  const stem = gz[0];
  const branch = gz[1];
  return {
    stem,
    branch,
    ganzhi: gz,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
  };
}

export function fourPillarsFromGanzhi(
  yearGZ: string,
  monthGZ: string,
  dayGZ: string,
  hourGZ: string | null
): FourPillars {
  const day = pillarFromGanzhi(dayGZ);
  return {
    year: pillarFromGanzhi(yearGZ),
    month: pillarFromGanzhi(monthGZ),
    day,
    hour: hourGZ ? pillarFromGanzhi(hourGZ) : null,
    dayMaster: { stem: day.stem, element: STEM_ELEMENT[day.stem] },
  };
}

export type Pillar = {
  stem: string;
  branch: string;
  ganzhi: string;
  stemElement: string;
  branchElement: string;
};

function pillar(stemIdx: number, branchIdx: number): Pillar {
  const s = STEMS[((stemIdx % 10) + 10) % 10];
  const b = BRANCHES[((branchIdx % 12) + 12) % 12];
  return {
    stem: s,
    branch: b,
    ganzhi: s + b,
    stemElement: STEM_ELEMENT[s],
    branchElement: BRANCH_ELEMENT[b],
  };
}

// 年柱: 立春(2/4 簡易)を境に。実年=立春前は 西暦-1
function yearPillar(year: number, month: number, day: number): Pillar {
  const effectiveYear = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  const stemIdx = (effectiveYear - 4) % 10;
  const branchIdx = (effectiveYear - 4) % 12;
  return pillar(stemIdx, branchIdx);
}

// 月支は節入り (毎月の節気) に従う。簡易版では各月の固定日 (節入り日) を使用。
// 寅=2月節立春, 卯=3月節啓蟄, 辰=4月節清明, 巳=5月節立夏, 午=6月節芒種,
// 未=7月節小暑, 申=8月節立秋, 酉=9月節白露, 戌=10月節寒露, 亥=11月節立冬,
// 子=12月節大雪, 丑=1月節小寒
const MONTH_NODES: { month: number; day: number; branch: number }[] = [
  { month: 1, day: 6, branch: 1 },   // 小寒 → 丑
  { month: 2, day: 4, branch: 2 },   // 立春 → 寅
  { month: 3, day: 6, branch: 3 },   // 啓蟄 → 卯
  { month: 4, day: 5, branch: 4 },   // 清明 → 辰
  { month: 5, day: 6, branch: 5 },   // 立夏 → 巳
  { month: 6, day: 6, branch: 6 },   // 芒種 → 午
  { month: 7, day: 7, branch: 7 },   // 小暑 → 未
  { month: 8, day: 8, branch: 8 },   // 立秋 → 申
  { month: 9, day: 8, branch: 9 },   // 白露 → 酉
  { month: 10, day: 8, branch: 10 }, // 寒露 → 戌
  { month: 11, day: 7, branch: 11 }, // 立冬 → 亥
  { month: 12, day: 7, branch: 0 },  // 大雪 → 子
];

function monthBranchIndex(month: number, day: number): number {
  // 当該月の節入り日に達していなければ前月の支
  for (let i = MONTH_NODES.length - 1; i >= 0; i--) {
    const n = MONTH_NODES[i];
    if (month > n.month || (month === n.month && day >= n.day)) {
      return n.branch;
    }
  }
  return 1; // 1月節入り前 = 丑 (前年12月の子の続き=丑)
}

// 五虎遁: 年干 → 寅月の月干 → 月支に応じて月干を決定
function monthStemIndex(yearStem: string, monthBranchIdx: number): number {
  // 年干 → 寅月の天干
  const startMap: Record<string, number> = {
    甲: 2, 己: 2, // 甲己之年丙作首 → 寅=丙
    乙: 4, 庚: 4, // 乙庚之歳戊為頭
    丙: 6, 辛: 6, // 丙辛之歳尋庚起
    丁: 8, 壬: 8, // 丁壬壬位順行流
    戊: 0, 癸: 0, // 戊癸之年甲寅之上好追求 → 寅=甲
  };
  const start = startMap[yearStem];
  // 月支 寅(2) を起点に進む
  const offset = (monthBranchIdx - 2 + 12) % 12;
  return (start + offset) % 10;
}

// 日柱: 1900-01-01 = 庚戌(stem=6, branch=10). 通日からの差で算出
function dayPillar(year: number, month: number, day: number): Pillar {
  const base = Date.UTC(1900, 0, 1);
  const target = Date.UTC(year, month - 1, day);
  const days = Math.floor((target - base) / (1000 * 60 * 60 * 24));
  const stemIdx = (6 + days) % 10;
  const branchIdx = (10 + days) % 12;
  return pillar(stemIdx, branchIdx);
}

// 時柱: 子刻=23:00-1:00, 丑=1-3, 寅=3-5, 卯=5-7, 辰=7-9, 巳=9-11,
//        午=11-13, 未=13-15, 申=15-17, 酉=17-19, 戌=19-21, 亥=21-23
function hourBranchIndex(hour: number): number {
  if (hour >= 23 || hour < 1) return 0;
  return Math.floor((hour + 1) / 2);
}

// 五鼠遁: 日干 → 子刻の時干
function hourStemIndex(dayStem: string, hourBranchIdx: number): number {
  const startMap: Record<string, number> = {
    甲: 0, 己: 0, // 甲己還加甲 → 子刻=甲
    乙: 2, 庚: 2, // 乙庚丙作初
    丙: 4, 辛: 4, // 丙辛從戊起
    丁: 6, 壬: 6, // 丁壬庚子居
    戊: 8, 癸: 8, // 戊癸何方發 壬子是真途
  };
  return (startMap[dayStem] + hourBranchIdx) % 10;
}

export type FourPillars = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  dayMaster: { stem: string; element: string };
};

export function calcFourPillars(
  year: number,
  month: number,
  day: number,
  hour: number | null
): FourPillars {
  const yp = yearPillar(year, month, day);
  const mbIdx = monthBranchIndex(month, day);
  const msIdx = monthStemIndex(yp.stem, mbIdx);
  const mp = pillar(msIdx, mbIdx);
  const dp = dayPillar(year, month, day);
  let hp: Pillar | null = null;
  if (hour !== null) {
    const hbIdx = hourBranchIndex(hour);
    const hsIdx = hourStemIndex(dp.stem, hbIdx);
    hp = pillar(hsIdx, hbIdx);
  }
  return {
    year: yp,
    month: mp,
    day: dp,
    hour: hp,
    dayMaster: { stem: dp.stem, element: STEM_ELEMENT[dp.stem] },
  };
}

// 五行（基本元素）
const STEM_FIVE: Record<string, "木" | "火" | "土" | "金" | "水"> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const BRANCH_FIVE: Record<string, "木" | "火" | "土" | "金" | "水"> = {
  寅: "木", 卯: "木", 巳: "火", 午: "火", 辰: "土",
  戌: "土", 丑: "土", 未: "土", 申: "金", 酉: "金", 子: "水", 亥: "水",
};
const STEM_YANG: Record<string, boolean> = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
};

const FIVE_GENERATES: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const FIVE_CONTROLS: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

// 通変星: 日干 vs 他の干 の関係
export type TongbianStar =
  | "比肩" | "劫財" | "食神" | "傷官" | "偏財"
  | "正財" | "偏官" | "正官" | "偏印" | "印綬";

export function tongbianStar(dayStem: string, otherStem: string): TongbianStar {
  const dE = STEM_FIVE[dayStem];
  const oE = STEM_FIVE[otherStem];
  const dY = STEM_YANG[dayStem];
  const oY = STEM_YANG[otherStem];
  if (dE === oE) return dY === oY ? "比肩" : "劫財";
  if (FIVE_GENERATES[dE] === oE) return dY === oY ? "食神" : "傷官";
  if (FIVE_CONTROLS[dE] === oE) return dY === oY ? "偏財" : "正財";
  if (FIVE_CONTROLS[oE] === dE) return dY === oY ? "偏官" : "正官";
  if (FIVE_GENERATES[oE] === dE) return dY === oY ? "偏印" : "印綬";
  return "比肩";
}

export const TONGBIAN_TEXT: Record<TongbianStar, string> = {
  比肩: "独立心と自我。自分の道を貫く力。",
  劫財: "競争と協力。仲間との切磋琢磨で伸びる。",
  食神: "創造と楽しみ。表現力・芸術・グルメ。",
  傷官: "鋭い才能。批評眼と独自性、ただし衝突に注意。",
  偏財: "流通する財。社交と機転で得る豊かさ。",
  正財: "安定した財。コツコツ蓄える堅実さ。",
  偏官: "胆力と決断。リーダー型・武の星。",
  正官: "規律と名誉。組織で評価される真面目さ。",
  偏印: "独自の知性。アイデアと直感、副業向き。",
  印綬: "学問と保護。教養と人徳で守られる。",
};

// 十二運: 日干に対する各支のライフステージ
const STAGES = [
  "長生", "沐浴", "冠帯", "建禄", "帝旺", "衰",
  "病", "死", "墓", "絶", "胎", "養",
] as const;

// 各日干 → 長生の支のindex (子=0..亥=11) と 進行方向
// 陽干: 順行 / 陰干: 逆行
const LONG_LIFE: Record<string, { idx: number; forward: boolean }> = {
  甲: { idx: 11, forward: true },  // 亥
  丙: { idx: 2, forward: true },    // 寅
  戊: { idx: 2, forward: true },    // 寅
  庚: { idx: 5, forward: true },    // 巳
  壬: { idx: 8, forward: true },    // 申
  乙: { idx: 6, forward: false },   // 午
  丁: { idx: 9, forward: false },   // 酉
  己: { idx: 9, forward: false },   // 酉
  辛: { idx: 0, forward: false },   // 子
  癸: { idx: 3, forward: false },   // 卯
};

const BRANCH_INDEX: Record<string, number> = {
  子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
  午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
};

export type TwelveStage = (typeof STAGES)[number];

export function twelveStage(dayStem: string, branch: string): TwelveStage {
  const start = LONG_LIFE[dayStem];
  const bIdx = BRANCH_INDEX[branch];
  const offset = start.forward
    ? (bIdx - start.idx + 12) % 12
    : (start.idx - bIdx + 12) % 12;
  return STAGES[offset];
}

export const TWELVE_TEXT: Record<TwelveStage, string> = {
  長生: "誕生・育成。新しい段階の始まり。", 沐浴: "産湯。揺らぎと探索の時。",
  冠帯: "成人。実力をまといはじめる時。", 建禄: "自立。自分の場を築く充実期。",
  帝旺: "頂点。最大の力を発揮する時。", 衰: "勢いが緩み始める転換点。",
  病: "立ち止まり、内省する時。", 死: "終焉と再構築への準備。",
  墓: "蓄積と内なる充実。地味だが深い時。", 絶: "切り替わり。古い枠が外れる時。",
  胎: "新たな構想が宿る時。", 養: "じっくり育てる時。",
};

// 五行バランス（4柱の天干＋地支から数える）
export type FiveCount = Record<"木" | "火" | "土" | "金" | "水", number>;

export function fiveElementBalance(p: FourPillars): FiveCount {
  const c: FiveCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const pillars = [p.year, p.month, p.day, p.hour].filter(
    (x): x is Pillar => x !== null
  );
  for (const pl of pillars) {
    c[STEM_FIVE[pl.stem]]++;
    c[BRANCH_FIVE[pl.branch]]++;
  }
  return c;
}

// 命式に対する補助情報
export type ShichuExtras = {
  tongbian: { year: TongbianStar; month: TongbianStar; hour: TongbianStar | null };
  twelve: { year: TwelveStage; month: TwelveStage; day: TwelveStage; hour: TwelveStage | null };
  five: FiveCount;
};

export function calcShichuExtras(p: FourPillars): ShichuExtras {
  return {
    tongbian: {
      year: tongbianStar(p.day.stem, p.year.stem),
      month: tongbianStar(p.day.stem, p.month.stem),
      hour: p.hour ? tongbianStar(p.day.stem, p.hour.stem) : null,
    },
    twelve: {
      year: twelveStage(p.day.stem, p.year.branch),
      month: twelveStage(p.day.stem, p.month.branch),
      day: twelveStage(p.day.stem, p.day.branch),
      hour: p.hour ? twelveStage(p.day.stem, p.hour.branch) : null,
    },
    five: fiveElementBalance(p),
  };
}

export const DAY_MASTER_TEXT: Record<string, string> = {
  陽木: "甲（こうぼく）。大樹のような大らかさと、まっすぐ伸びる成長力。",
  陰木: "乙（いつぼく）。草花のしなやかさと、繊細な美意識。",
  陽火: "丙（へいか）。太陽の明るさと熱量で周囲を照らす。",
  陰火: "丁（ていか）。灯火のような優しい光、内面の情熱。",
  陽土: "戊（ぼど）。山のような安定と、どっしりした器量。",
  陰土: "己（きど）。畑のように受け入れ育てる力。",
  陽金: "庚（こうきん）。鉄のような強さと決断力。",
  陰金: "辛（しんきん）。宝石のような繊細な輝きと品格。",
  陽水: "壬（じんすい）。大河のような流れと包容力。",
  陰水: "癸（きすい）。雨や霧のような柔らかさと知性。",
};
