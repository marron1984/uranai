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

const STEM_ELEMENT: Record<string, string> = {
  甲: "陽木", 乙: "陰木", 丙: "陽火", 丁: "陰火",
  戊: "陽土", 己: "陰土", 庚: "陽金", 辛: "陰金",
  壬: "陽水", 癸: "陰水",
};

const BRANCH_ELEMENT: Record<string, string> = {
  子: "陽水", 丑: "陰土", 寅: "陽木", 卯: "陰木",
  辰: "陽土", 巳: "陰火", 午: "陽火", 未: "陰土",
  申: "陽金", 酉: "陰金", 戌: "陽土", 亥: "陰水",
};

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
