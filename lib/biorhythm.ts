// バイオリズム (Biorhythm)
// アルゴリズム:
//   各リズムは出生からの経過日数 t を用いた正弦波で表される。
//     value(t) = sin(2π · t / P)        （-1.0 〜 +1.0、表示は ×100 の整数 %）
//   P = 周期 (日)。古典的 3 リズム + 拡張 4 リズム。
//   表は一切使わず純粋な数式から決定論的に算出する（検証ハーネスで値を保証）。
//
//   経過日数 t は「日付の差」。タイムゾーン非依存にするため UTC 0:00 基準で日数差を取る。
//   要注意日 (critical day): リズムがゼロ線を横切る日。
//     前日と当日、または当日と翌日とで符号が変わる日を「不安定日」とする。

export type CycleKey = "physical" | "emotional" | "intellectual" | "intuition" | "aesthetic" | "awareness" | "spiritual";

export type CycleDef = {
  key: CycleKey;
  name: string;       // 日本語名
  enName: string;     // 英語名
  period: number;     // 周期 (日)
  color: string;      // 表示色
  primary: boolean;   // 古典 3 リズムか
  high: string;       // 高調期の意味
  low: string;        // 低調期の意味
  critical: string;   // 要注意日の意味
};

export const CYCLES: CycleDef[] = [
  { key: "physical",     name: "身体",   enName: "Physical",     period: 23, color: "#ff5c5c", primary: true,
    high: "体力・スタミナ・行動力が充実。運動や勝負ごと、力仕事に最適。", low: "疲れやすく無理が利かない。休養と体調管理を優先する時期。", critical: "怪我・事故・体調急変に注意。激しい運動や徹夜は避ける。" },
  { key: "emotional",    name: "感情",   enName: "Emotional",    period: 28, color: "#5c9eff", primary: true,
    high: "気分が前向きで人付き合いが円滑。創造性と共感力が高まる。", low: "気分が沈みがち。苛立ちや孤独感に流されず静かに過ごす。", critical: "感情の起伏が激しく対人トラブルの恐れ。重要な判断や口論は避ける。" },
  { key: "intellectual", name: "知性",   enName: "Intellectual", period: 33, color: "#ffb800", primary: true,
    high: "思考が冴え、判断・記憶・分析力が高い。勉強や交渉、企画に好機。", low: "集中が続かずミスが増える。新しい挑戦より復習・整理向き。", critical: "判断ミス・うっかりに注意。契約や重要な決断は先送りが無難。" },
  { key: "intuition",    name: "直感",   enName: "Intuition",    period: 38, color: "#a86bff", primary: false,
    high: "ひらめき・第六感が鋭い。芸術や着想、危険察知に冴える。", low: "勘が鈍り迷いやすい。データと理屈で補って判断する。", critical: "直感が当てにならない日。ギャンブル的な賭けは控える。" },
  { key: "aesthetic",    name: "美容",   enName: "Aesthetic",    period: 43, color: "#ff7ac0", primary: false,
    high: "美的感覚と表現力が高まる。装い・創作・センスを活かす好機。", low: "美意識が乱れがち。背伸びせず手入れと基本に立ち返る。", critical: "見た目や印象の判断がぶれる日。大きなイメチェンは避ける。" },
  { key: "awareness",    name: "意識",   enName: "Awareness",    period: 48, color: "#1fc7a0", primary: false,
    high: "自己認識と気づきが深い。内省や学び、目標設定に向く。", low: "視野が狭まりがち。一人で抱えず周囲の声に耳を傾ける。", critical: "思い込みで突っ走りやすい日。立ち止まって確認を。" },
  { key: "spiritual",    name: "精神",   enName: "Spiritual",    period: 53, color: "#8a9bb8", primary: false,
    high: "精神的に安定し胆力がある。困難にも動じず信念を貫ける。", low: "心が揺らぎやすい。瞑想や休息で内面を整える。", critical: "精神的に不安定な日。重い決断や無理は禁物。" },
];

export const PRIMARY_CYCLES = CYCLES.filter((c) => c.primary);

const DAY_MS = 86400000;

// 出生から対象日までの経過日数 (タイムゾーン非依存・UTC 0:00 基準)
export function daysSinceBirth(birthIso: string, date: Date): number {
  const [y, m, d] = birthIso.split("-").map(Number);
  const b = Date.UTC(y, m - 1, d);
  const t = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((t - b) / DAY_MS);
}

// 連続値 (-1.0〜1.0)
export function rawValue(t: number, period: number): number {
  return Math.sin((2 * Math.PI * t) / period);
}

// パーセント表示 (-100〜100 の整数)
export function percentValue(t: number, period: number): number {
  return Math.round(rawValue(t, period) * 100);
}

export type Phase = "上昇" | "下降" | "ピーク" | "ボトム";

function phaseOf(t: number, period: number): Phase {
  const v = rawValue(t, period);
  const next = rawValue(t + 1, period);
  if (v > 0.985) return "ピーク";
  if (v < -0.985) return "ボトム";
  return next >= v ? "上昇" : "下降";
}

export type CycleState = {
  def: CycleDef;
  value: number;       // -100〜100
  phase: Phase;
  level: "高調" | "中立" | "低調";
  critical: boolean;   // 当日が要注意日 (ゼロ通過)
  text: string;        // 当日の解説
};

function sign(x: number): number {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

// 当日がゼロ通過 (要注意日) か: 前日↔当日 もしくは 当日↔翌日 で符号が変わる
export function isCritical(t: number, period: number): boolean {
  const prev = sign(rawValue(t - 1, period));
  const cur = sign(rawValue(t, period));
  const next = sign(rawValue(t + 1, period));
  if (cur === 0) return true;
  return prev !== cur || cur !== next;
}

export function cycleState(t: number, def: CycleDef): CycleState {
  const value = percentValue(t, def.period);
  const phase = phaseOf(t, def.period);
  const critical = isCritical(t, def.period);
  const level = critical ? "中立" : value >= 30 ? "高調" : value <= -30 ? "低調" : "中立";
  const text = critical ? def.critical : level === "高調" ? def.high : level === "低調" ? def.low : `${def.high.split("。")[0]}と${def.low.split("。")[0]}の中間。流れの変わり目で、無理せず様子を見る時期。`;
  return { def, value, phase, level, critical, text };
}

export type BiorhythmResult = {
  days: number;            // 経過日数
  cycles: CycleState[];    // 全リズム
  primary: CycleState[];   // 古典 3 リズム
  composite: number;       // 古典 3 リズムの平均 (-100〜100)
};

export function biorhythm(birthIso: string, date: Date): BiorhythmResult {
  const days = daysSinceBirth(birthIso, date);
  const cycles = CYCLES.map((c) => cycleState(days, c));
  const primary = cycles.filter((c) => c.def.primary);
  const composite = Math.round(primary.reduce((s, c) => s + c.value, 0) / primary.length);
  return { days, cycles, primary, composite };
}

// ====================================================================
// グラフ用の時系列 (中心日付の前後)
// ====================================================================
export type SeriesPoint = { offset: number; date: Date } & Record<CycleKey, number>;

export function series(birthIso: string, center: Date, before: number, after: number): SeriesPoint[] {
  const base = daysSinceBirth(birthIso, center);
  const pts: SeriesPoint[] = [];
  for (let off = -before; off <= after; off++) {
    const t = base + off;
    const d = new Date(center.getFullYear(), center.getMonth(), center.getDate() + off);
    const p = { offset: off, date: d } as SeriesPoint;
    for (const c of CYCLES) p[c.key] = rawValue(t, c.period);
    pts.push(p);
  }
  return pts;
}

// 今後 n 日間の要注意日 (古典 3 リズム)
export type CriticalDay = { date: Date; offset: number; cycles: string[] };

export function upcomingCriticalDays(birthIso: string, from: Date, days: number): CriticalDay[] {
  const base = daysSinceBirth(birthIso, from);
  const out: CriticalDay[] = [];
  for (let off = 0; off <= days; off++) {
    const t = base + off;
    const hit = PRIMARY_CYCLES.filter((c) => isCritical(t, c.period)).map((c) => c.name);
    if (hit.length > 0) {
      out.push({ date: new Date(from.getFullYear(), from.getMonth(), from.getDate() + off), offset: off, cycles: hit });
    }
  }
  return out;
}

// ====================================================================
// 相性 (二人の出生日差から各リズムの同調度を算出)
//   同調度 = cos(2π · Δ日 / P) → +100 で完全同調、-100 で完全逆位相
// ====================================================================
export type CompatCycle = { def: CycleDef; sync: number };
export type BioCompat = { cycles: CompatCycle[]; overall: number; text: string };

export function bioCompat(birthA: string, birthB: string): BioCompat {
  const [ay, am, ad] = birthA.split("-").map(Number);
  const [by, bm, bd] = birthB.split("-").map(Number);
  const delta = Math.abs(Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / DAY_MS));
  const cycles = CYCLES.map((def) => ({ def, sync: Math.round(Math.cos((2 * Math.PI * delta) / def.period) * 100) }));
  const primary = cycles.filter((c) => c.def.primary);
  const overall = Math.round(primary.reduce((s, c) => s + c.sync, 0) / primary.length);
  const text =
    overall >= 60 ? "リズムがよく噛み合う相性。一緒にいると自然に波長が合い、ペースを乱されにくい。" :
    overall >= 20 ? "おおむね調和する相性。違う波の日もあるが、補い合える関係。" :
    overall >= -20 ? "波の合う日と合わない日が半々の相性。互いのリズムを尊重すると良い。" :
    overall >= -60 ? "リズムがずれやすい相性。相手が高調の時に自分が低調になりがち。距離感が鍵。" :
    "波が逆位相になりやすい相性。だからこそ片方が支え役に回れる補完関係にもなれる。";
  return { cycles, overall, text };
}
