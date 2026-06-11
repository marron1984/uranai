// 暦注 (こよみ) — 開運日・六曜・旧暦
//
// アルゴリズム (2026-06 リサーチで規則を外部複数ソースと突合済み):
//
// ■ 開運日 (日干支 + 節気から決定論的に算出)
//   天赦日: 季節 (節切り) × 日干支。春(立春〜)=戊寅 / 夏(立夏〜)=甲午 /
//           秋(立秋〜)=戊申 / 冬(立冬〜)=甲子。年5-6回。
//           検証: 2026年 = 3/5・5/4・5/20・7/19・10/1・12/16。
//   一粒万倍日: 節月ごとの2つの日支。正月=丑午, 二月=寅酉, 三月=子卯, 四月=卯辰,
//           五月=巳午, 六月=午酉, 七月=子未, 八月=卯申, 九月=午酉, 十月=酉戌,
//           十一月=亥子, 十二月=子卯。
//   寅の日 / 巳の日 / 己巳の日 / 甲子の日: 日支・日干支そのもの。
//
// ■ 旧暦 (天保暦方式・簡易組み立て)
//   朔 (新月) を含む日 = 旧暦各月の1日。中気 (太陽黄経 30° の倍数) を含む月で
//   月名が決まる (雨水330°=1月, 春分0°=2月, …, 冬至270°=11月)。中気を含まない月は閏月。
//   検証: 2026年旧正月 = 新暦 2/17、2026-06-15 = 旧5/1 (朔)。
//   ※ 2033年問題 (月名が一意に決まらない年) は未対応 — 2030年代前半は表示注意。
//
// ■ 六曜: (旧暦月 + 旧暦日) mod 6 → 0=大安, 1=赤口, 2=先勝, 3=友引, 4=先負, 5=仏滅。
//   検証: 2026-06-11 = 旧4/26 → (4+26)%6=0 → 大安。
//
// ■ 不成就日: 旧暦月ごとの8日周期 (1・7月=3日起点, 2・8月=2日, 3・9月=1日,
//   4・10月=4日, 5・11月=5日, 6・12月=6日)。閏月は前月と同じ扱い。

import { sunLongitude, moonLongitude, solarTermsOfYear } from "@/lib/astronomy";

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const DAY_MS = 86400000;

// ====================================================================
// 日干支 (shichu.ts と同じアンカー: 1900-01-01 = 甲戌)
// ====================================================================
export function dayGanzhiIndex(date: Date): number {
  const base = Date.UTC(1900, 0, 1);
  const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((target - base) / DAY_MS);
  // 甲戌 = index 10 (甲子=0)
  return ((days + 10) % 60 + 60) % 60;
}

export function dayGanzhi(date: Date): { stem: string; branch: string; ganzhi: string; index: number } {
  const idx = dayGanzhiIndex(date);
  return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12], ganzhi: STEMS[idx % 10] + BRANCHES[idx % 12], index: idx };
}

// ====================================================================
// 節月 (節切り) — 立春起点の月番号 1..12 (正月=立春〜啓蟄前)
// ====================================================================
const SETSU_NAMES = ["立春", "啓蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"];

function setsuDatesAround(date: Date): { name: string; date: Date; monthNum: number }[] {
  // 前年・当年・翌年の 12 節を集める (monthNum: 立春=1 .. 小寒=12)
  const out: { name: string; date: Date; monthNum: number }[] = [];
  for (const y of [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1]) {
    for (const t of solarTermsOfYear(y)) {
      const i = SETSU_NAMES.indexOf(t.term);
      if (i >= 0) out.push({ name: t.term, date: t.date, monthNum: i + 1 });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function setsuMonth(date: Date): { monthNum: number; name: string; since: Date } {
  // 暦注の節月は「日」単位で切替 (節入り日はその時刻に関わらず新しい月の初日扱い)。
  // 例: 2026-03-05 は啓蟄 22:59 だが、3/5 全体が二月節 → 戊寅日は一粒万倍日になる。
  const list = setsuDatesAround(date);
  const targetDay = jstDay(date);
  let cur = list[0];
  for (const s of list) {
    if (jstDay(s.date) <= targetDay) cur = s;
    else break;
  }
  return { monthNum: cur.monthNum, name: cur.name, since: cur.date };
}

// ====================================================================
// 開運日 (吉日) / 凶日
// ====================================================================
export type KoyomiDay = {
  date: Date;
  ganzhi: string;
  tags: { name: string; kind: "大吉" | "吉" | "凶"; desc: string }[];
};

// 天赦日: 節月 1-3=春(戊寅) / 4-6=夏(甲午) / 7-9=秋(戊申) / 10-12=冬(甲子)
const TENSHA_BY_SEASON: Record<number, string> = { 0: "戊寅", 1: "甲午", 2: "戊申", 3: "甲子" };

// 一粒万倍日: 節月 → 日支ペア
const ICHIRYU: Record<number, [string, string]> = {
  1: ["丑", "午"], 2: ["寅", "酉"], 3: ["子", "卯"], 4: ["卯", "辰"],
  5: ["巳", "午"], 6: ["午", "酉"], 7: ["子", "未"], 8: ["卯", "申"],
  9: ["午", "酉"], 10: ["酉", "戌"], 11: ["亥", "子"], 12: ["子", "卯"],
};

export function dayTags(date: Date): KoyomiDay {
  const g = dayGanzhi(date);
  const sm = setsuMonth(date);
  const season = Math.floor((sm.monthNum - 1) / 3); // 0春 1夏 2秋 3冬
  const tags: KoyomiDay["tags"] = [];

  if (g.ganzhi === TENSHA_BY_SEASON[season]) {
    tags.push({ name: "天赦日", kind: "大吉", desc: "暦上最強の吉日。天が万物の罪を赦す日 — 新しい挑戦・開業・入籍に。年5〜6回。" });
  }
  const [b1, b2] = ICHIRYU[sm.monthNum];
  if (g.branch === b1 || g.branch === b2) {
    tags.push({ name: "一粒万倍日", kind: "吉", desc: "一粒の籾が万倍に実る日。種まき・始めごと・投資に吉。借金や人から借りる事は凶。" });
  }
  if (g.branch === "寅") tags.push({ name: "寅の日", kind: "吉", desc: "金運招来。虎は千里を往って千里を還る — 旅立ち・財布の新調に吉。" });
  if (g.branch === "巳") tags.push({ name: "巳の日", kind: "吉", desc: "弁財天の縁日。金運・芸事に吉。" });
  if (g.ganzhi === "己巳") tags.push({ name: "己巳の日", kind: "大吉", desc: "巳の日の中でも特に強い弁財天の吉日 (60日に一度)。" });
  if (g.ganzhi === "甲子") tags.push({ name: "甲子の日", kind: "吉", desc: "干支の始まりの日。大黒天の縁日 — 始めたことが長続きする。" });

  // 不成就日 (旧暦ベース)
  const lunar = lunarDate(date);
  if (lunar) {
    const grp = ((lunar.month - 1) % 6) + 1; // 1..6 (1=1・7月, 2=2・8月, …)
    const FUJOJU_START: Record<number, number> = { 1: 3, 2: 2, 3: 1, 4: 4, 5: 5, 6: 6 };
    const start = FUJOJU_START[grp];
    if ((lunar.day - start) % 8 === 0 && lunar.day >= start) {
      tags.push({ name: "不成就日", kind: "凶", desc: "何事も成就しない日。新しい事始めは避ける。吉日と重なると吉が半減。" });
    }
  }

  return { date, ganzhi: g.ganzhi, tags };
}

// 今後 n 日の開運日 (タグの付く日だけ)
export function upcomingKoyomi(from: Date, days: number): KoyomiDay[] {
  const out: KoyomiDay[] = [];
  for (let i = 0; i <= days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const k = dayTags(d);
    if (k.tags.length > 0) out.push(k);
  }
  return out;
}

// ====================================================================
// 旧暦 (天保暦方式・簡易) と六曜
// ====================================================================

// 月-太陽の離角が 0° を跨ぐ瞬間 (朔) を二分法で求める
function elongation(date: Date): number {
  let e = moonLongitude(date) - sunLongitude(date);
  e = ((e % 360) + 360) % 360;
  return e;
}

// from から先の直近の朔の瞬間
function nextNewMoon(from: Date): Date {
  let t = from.getTime();
  let prev = elongation(new Date(t));
  // 6時間刻みで離角が 360°→0° に折り返す区間を探す
  for (let i = 0; i < 200; i++) {
    const t2 = t + 6 * 3600 * 1000;
    const cur = elongation(new Date(t2));
    if (cur < prev) {
      // 折返し検出 → 二分法
      let lo = t, hi = t2;
      for (let j = 0; j < 40; j++) {
        const mid = (lo + hi) / 2;
        if (elongation(new Date(mid)) < prev && elongation(new Date(mid)) < 180) hi = mid;
        else lo = mid;
      }
      return new Date(hi);
    }
    prev = cur;
    t = t2;
  }
  throw new Error("new moon not found");
}

// JST の暦日に丸める (朔や中気の「含まれる日」判定は JST)
function jstDay(d: Date): number {
  return Math.floor((d.getTime() + 9 * 3600 * 1000) / DAY_MS);
}
function jstDayToDate(day: number): Date {
  return new Date(day * DAY_MS - 9 * 3600 * 1000 + 12 * 3600 * 1000); // 正午
}

export type LunarDate = { month: number; day: number; isLeap: boolean };

// 対象日の旧暦月日を求める (対象日の前後 ±1.2 年の朔列から組み立て)
export function lunarDate(date: Date): LunarDate | null {
  try {
    // 1) 対象日を含む朔望月と、その前後の朔を列挙
    const start = new Date(date.getTime() - 450 * DAY_MS);
    const moons: Date[] = [];
    let m = nextNewMoon(start);
    while (m.getTime() < date.getTime() + 60 * DAY_MS) {
      moons.push(m);
      m = nextNewMoon(new Date(m.getTime() + 20 * DAY_MS));
    }
    // 2) 対象日が属する月 (朔日 ≤ 対象日 < 次朔日)
    const target = jstDay(date);
    let idx = -1;
    for (let i = 0; i < moons.length - 1; i++) {
      if (jstDay(moons[i]) <= target && target < jstDay(moons[i + 1])) { idx = i; break; }
    }
    if (idx < 0) return null;
    const day = target - jstDay(moons[idx]) + 1;

    // 3) 月名: 月内に含まれる中気 (太陽黄経が 30° の倍数になる日) で決定
    //    中気黄経 → 月名: 330=1月, 0=2月, 30=3月, … , 270=11月, 300=12月
    const monthNameOf = (i: number): { month: number; isLeap: boolean } => {
      const d0 = jstDay(moons[i]);
      const d1 = jstDay(moons[i + 1]);
      for (let dd = d0; dd < d1; dd++) {
        const noon = jstDayToDate(dd);
        const lon0 = sunLongitude(new Date(noon.getTime() - 12 * 3600 * 1000 + 9 * 3600 * 1000 - 9 * 3600 * 1000));
        // その暦日の開始/終了の太陽黄経で 30° 倍数跨ぎを判定
        const dayStart = new Date(dd * DAY_MS - 9 * 3600 * 1000);
        const dayEnd = new Date((dd + 1) * DAY_MS - 9 * 3600 * 1000);
        const a = sunLongitude(dayStart);
        const b = sunLongitude(dayEnd);
        const crossed = Math.floor(b / 30) !== Math.floor(a / 30) || b < a; // b<a は 360→0 跨ぎ
        if (crossed) {
          const k = (b < a ? 0 : Math.floor(b / 30) * 30) % 360;
          const month = ((k - 330 + 360) % 360) / 30 + 1; // 330→1
          void lon0;
          return { month, isLeap: false };
        }
      }
      // 中気なし → 閏月 (前月と同名)
      const prev = monthNameOf(i - 1);
      return { month: prev.month, isLeap: true };
    };
    const { month, isLeap } = monthNameOf(idx);
    return { month, day, isLeap };
  } catch {
    return null;
  }
}

export const ROKUYO = ["大安", "赤口", "先勝", "友引", "先負", "仏滅"] as const;
export type Rokuyo = (typeof ROKUYO)[number];

export const ROKUYO_TEXT: Record<Rokuyo, string> = {
  大安: "万事に吉。婚礼・開業・契約に最良の日。",
  赤口: "正午前後のみ吉、他は凶。刃物と火の扱いに注意。",
  先勝: "午前は吉、午後は凶。急ぐことは早めに。",
  友引: "朝晩は吉、昼は凶。慶事は良いが弔事は避ける。",
  先負: "午前は凶、午後は吉。静かに過ごし午後に動く。",
  仏滅: "万事に凶とされる日。新規ごとを避け、整理と仕込みに。",
};

export function rokuyo(date: Date): { name: Rokuyo; lunar: LunarDate } | null {
  const l = lunarDate(date);
  if (!l) return null;
  return { name: ROKUYO[(l.month + l.day) % 6], lunar: l };
}
