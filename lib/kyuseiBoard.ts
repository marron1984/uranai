// 九星気学 — 日盤・月盤・年盤と方位の吉凶
//
// アルゴリズム (2026-06 リサーチで外部複数ソースと突合済み):
//
// ■ 日盤 (日家九星)
//   陽遁: 冬至に最も近い甲子の日 = 一白として順行 (1→2→…→9→1)
//   陰遁: 夏至に最も近い甲子の日 = 九紫として逆行 (9→8→…→1→9)
//   「最も近い甲子」: 二至当日の干支番号が 0..29 なら直前の甲子、30..59 なら直後の甲子。
//   検証: 2025-12-21 = 陽遁始め (甲子・一白)、2026-06-19 = 陰遁始め (甲子・九紫)、
//         2026-06-11 = 二黒。
//   ※ 閏遁 (約11-12年に一度の60日延長) は未実装 — 切替が二至から30日以上
//     ずれる年は誤差が出る。表示時は注記を出す。
//
// ■ 月盤 (月家九星)
//   年支グループで寅月 (立春〜) の中宮が決まり、節月ごとに 1 ずつ逆行。
//   子午卯酉年 = 寅月八白 / 辰戌丑未年 = 寅月五黄 / 寅巳申亥年 = 寅月二黒。
//   検証: 2026 (丙午年) — 2月=八白, 5月=五黄, 6月=四緑。
//
// ■ 盤の配置 (後天定位の回座)
//   後天定位: 北=1, 南西=2, 東=3, 東南=4, 中=5, 西北=6, 西=7, 東北=8, 南=9。
//   中宮 n の盤: 方位の星 = ((定位星 + n - 6) mod 9) + 1
//
// ■ 方位の吉凶
//   五黄殺 = 五黄の在る方位 / 暗剣殺 = その対面 / 本命殺 = 本命星の方位 /
//   本命的殺 = その対面 / 破 = 日支(月支・年支)の対冲の方位。
//   吉方位 = 本命星と相生・比和の星 (五黄と本命星自身を除く) の方位で凶殺なし。

import { dayGanzhi, dayGanzhiIndex, setsuMonth } from "@/lib/koyomi";
import { solarTermsOfYear } from "@/lib/astronomy";

export const STAR_NAMES = [
  "", "一白水星", "二黒土星", "三碧木星", "四緑木星", "五黄土星",
  "六白金星", "七赤金星", "八白土星", "九紫火星",
] as const;

export type Dir8 = "北" | "東北" | "東" | "東南" | "南" | "西南" | "西" | "西北";
export const DIRS8: Dir8[] = ["北", "東北", "東", "東南", "南", "西南", "西", "西北"];
const OPPOSITE: Record<Dir8, Dir8> = {
  北: "南", 南: "北", 東: "西", 西: "東",
  東北: "西南", 西南: "東北", 東南: "西北", 西北: "東南",
};

// 後天定位 (方位 → 定位星)
const FIXED_STAR: Record<Dir8, number> = {
  北: 1, 西南: 2, 東: 3, 東南: 4, 西北: 6, 西: 7, 東北: 8, 南: 9,
};

// 十二支 → 方位
const BRANCH_DIR: Record<string, Dir8> = {
  子: "北", 丑: "東北", 寅: "東北", 卯: "東", 辰: "東南", 巳: "東南",
  午: "南", 未: "西南", 申: "西南", 酉: "西", 戌: "西北", 亥: "西北",
};

const DAY_MS = 86400000;

function jstDayNum(d: Date): number {
  return Math.floor((d.getTime() + 9 * 3600 * 1000) / DAY_MS);
}

// ====================================================================
// 日盤 (日の九星)
// ====================================================================

// 二至に最も近い甲子の日 (JST 暦日番号で返す)
function tonSwitchDay(solstice: Date): number {
  const sDay = jstDayNum(solstice);
  // その日の干支番号 (甲子=0)
  const probe = new Date(sDay * DAY_MS - 9 * 3600 * 1000 + 12 * 3600 * 1000);
  const g = dayGanzhiIndex(probe);
  return g <= 29 ? sDay - g : sDay + (60 - g);
}

export type DayStarResult = {
  star: number;            // 1-9
  ton: "陽遁" | "陰遁";
  switchDate: Date;        // 現在の遁の開始日
  daysSinceSwitch: number;
};

export function dayStar(date: Date): DayStarResult {
  const target = jstDayNum(date);
  // 前後 2 年分の二至から切替日を列挙
  const switches: { day: number; ton: "陽遁" | "陰遁" }[] = [];
  for (const y of [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1]) {
    for (const t of solarTermsOfYear(y)) {
      if (t.term === "冬至") switches.push({ day: tonSwitchDay(t.date), ton: "陽遁" });
      if (t.term === "夏至") switches.push({ day: tonSwitchDay(t.date), ton: "陰遁" });
    }
  }
  switches.sort((a, b) => a.day - b.day);
  let cur = switches[0];
  for (const s of switches) {
    if (s.day <= target) cur = s;
    else break;
  }
  const days = target - cur.day;
  const star = cur.ton === "陽遁" ? (days % 9) + 1 : ((9 - (days % 9)) % 9 === 0 ? 9 : 9 - (days % 9));
  return {
    star,
    ton: cur.ton,
    switchDate: new Date(cur.day * DAY_MS - 9 * 3600 * 1000 + 12 * 3600 * 1000),
    daysSinceSwitch: days,
  };
}

// ====================================================================
// 月盤 (月の九星) / 年盤 (年の九星)
// ====================================================================

export function yearStar(year: number, month: number, day: number): number {
  // 立春前は前年扱い (JST の暦日単位)。
  // ⚠ 立春の瞬間は UTC では前日夜になることがある (例: 2026 立春 = 2/3 19:50 UTC = 2/4 04:50 JST)。
  //   UTC 日付で比較すると年に 1 日だけ誤判定するため、JST 日番号に揃えて比較する。
  const risshun = solarTermsOfYear(year).find((t) => t.term === "立春")!.date;
  const targetJstDay = Math.floor((Date.UTC(year, month - 1, day) + 9 * 3600 * 1000) / DAY_MS);
  const risshunJstDay = jstDayNum(risshun);
  const y = targetJstDay < risshunJstDay ? year - 1 : year;
  let star = (11 - (y % 9)) % 9;
  if (star === 0) star = 9;
  return star;
}

export function monthStar(date: Date): { star: number; monthNum: number } {
  const sm = setsuMonth(date);
  // 年支: 立春基準の年
  const y = sm.monthNum >= 1 && date.getMonth() + 1 <= 2 && sm.monthNum >= 11 ? date.getFullYear() - 1 : date.getFullYear();
  // 簡潔に: 節月 11/12 (大雪・小寒) は年末年始跨ぎ。年支は「立春で切替」なので
  // 小寒 (monthNum=12)・1 月の立春前は前年の年支を使う。
  const calYear = (date.getMonth() + 1 === 1 || (date.getMonth() + 1 === 2 && sm.monthNum === 12)) ? date.getFullYear() - 1 : y;
  const branchIdx = ((calYear - 4) % 12 + 12) % 12; // 子=0
  const group = branchIdx % 3; // 子卯午酉=0(子0卯3午6酉9), 丑辰未戌=1, 寅巳申亥=2
  const base = group === 0 ? 8 : group === 1 ? 5 : 2;
  // 寅月 (monthNum=1=立春) を 0 として経過節月
  const offset = sm.monthNum - 1;
  const star = ((base - 1 - offset) % 9 + 9) % 9 + 1;
  return { star, monthNum: sm.monthNum };
}

// ====================================================================
// 盤の生成と吉凶判定
// ====================================================================

export type DirInfo = {
  dir: Dir8;
  star: number;
  starName: string;
  bad: string[];     // 凶殺 (五黄殺・暗剣殺・本命殺・本命的殺・破)
  good: boolean;     // 吉方位 (相生・比和の星で凶殺なし)
};

// 中宮 n の盤
export function board(center: number): Record<Dir8, number> {
  const out = {} as Record<Dir8, number>;
  for (const dir of DIRS8) {
    out[dir] = ((FIXED_STAR[dir] + center - 6) % 9 + 9) % 9 + 1;
  }
  return out;
}

// 本命星 honmei にとって吉となる星 (相生 + 比和、五黄と本命星自身は除外)
const STAR_ELEMENT: Record<number, "水" | "土" | "木" | "金" | "火"> = {
  1: "水", 2: "土", 3: "木", 4: "木", 5: "土", 6: "金", 7: "金", 8: "土", 9: "火",
};
const GEN: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };

export function luckyStarsFor(honmei: number): number[] {
  const e = STAR_ELEMENT[honmei];
  const out: number[] = [];
  for (let s = 1; s <= 9; s++) {
    if (s === 5 || s === honmei) continue;
    const se = STAR_ELEMENT[s];
    if (GEN[se] === e || GEN[e] === se || se === e) out.push(s);
  }
  return out;
}

export function analyzeBoard(center: number, honmei: number, branch: string | null): DirInfo[] {
  const b = board(center);
  const lucky = luckyStarsFor(honmei);
  const gohoDir = DIRS8.find((d) => b[d] === 5) ?? null;       // 五黄殺
  const ankenDir = gohoDir ? OPPOSITE[gohoDir] : null;          // 暗剣殺
  const honmeiDir = DIRS8.find((d) => b[d] === honmei) ?? null; // 本命殺
  const tekiDir = honmeiDir ? OPPOSITE[honmeiDir] : null;       // 本命的殺
  const haDir = branch ? OPPOSITE[BRANCH_DIR[branch]] : null;   // 破 (支の対冲方位)

  return DIRS8.map((dir) => {
    const bad: string[] = [];
    if (dir === gohoDir) bad.push("五黄殺");
    if (dir === ankenDir) bad.push("暗剣殺");
    if (dir === honmeiDir) bad.push("本命殺");
    if (dir === tekiDir) bad.push("本命的殺");
    if (dir === haDir) bad.push("破");
    const star = b[dir];
    return {
      dir,
      star,
      starName: STAR_NAMES[star],
      bad,
      good: bad.length === 0 && lucky.includes(star),
    };
  });
}

// 今日の日盤・月盤・年盤をまとめて解析
export function todayDirections(date: Date, honmei: number): {
  day: { center: number; ton: "陽遁" | "陰遁"; dirs: DirInfo[]; ganzhi: string };
  month: { center: number; dirs: DirInfo[] };
  year: { center: number; dirs: DirInfo[] };
  luckyStars: number[];
} {
  const g = dayGanzhi(date);
  const ds = dayStar(date);
  const ms = monthStar(date);
  const ys = yearStar(date.getFullYear(), date.getMonth() + 1, date.getDate());

  // 月支: 節月 1(寅)..12(丑)
  const MONTH_BRANCHES = "寅卯辰巳午未申酉戌亥子丑";
  const monthBranch = MONTH_BRANCHES[setsuMonth(date).monthNum - 1];
  // 年支 (暦注の慣例に合わせ立春「日」全体を新年扱い — yearStar と同じ JST 日単位)
  const yearForBranch = (() => {
    const risshun = solarTermsOfYear(date.getFullYear()).find((t) => t.term === "立春")!.date;
    return jstDayNum(date) < jstDayNum(risshun) ? date.getFullYear() - 1 : date.getFullYear();
  })();
  const yearBranch = "子丑寅卯辰巳午未申酉戌亥"[((yearForBranch - 4) % 12 + 12) % 12];

  return {
    day: { center: ds.star, ton: ds.ton, dirs: analyzeBoard(ds.star, honmei, g.branch), ganzhi: g.ganzhi },
    month: { center: ms.star, dirs: analyzeBoard(ms.star, honmei, monthBranch) },
    year: { center: ys, dirs: analyzeBoard(ys, honmei, yearBranch) },
    luckyStars: luckyStarsFor(honmei),
  };
}
