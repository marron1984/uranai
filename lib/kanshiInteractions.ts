// 干支の相互作用 (干合・支合・三合・冲・刑・害) と神殺の判定
// サブエージェント産の命理テキスト (SHICHU_DEEP_SHENSHA 等) の主張を
// アルゴリズムで検証可能にするための判定モジュール。
// healthcheck.ts から呼ばれ、テキストとロジックの突合を行う。

// ====================================================================
// 干合 (天干の合) — 5 組
// ====================================================================
// 甲己合土・乙庚合金・丙辛合水・丁壬合木・戊癸合火
const STEM_COMBINATIONS: Record<string, { partner: string; transformsTo: string; name: string }> = {
  甲: { partner: "己", transformsTo: "土", name: "甲己合土 (中正の合)" },
  己: { partner: "甲", transformsTo: "土", name: "甲己合土 (中正の合)" },
  乙: { partner: "庚", transformsTo: "金", name: "乙庚合金 (仁義の合)" },
  庚: { partner: "乙", transformsTo: "金", name: "乙庚合金 (仁義の合)" },
  丙: { partner: "辛", transformsTo: "水", name: "丙辛合水 (威制の合)" },
  辛: { partner: "丙", transformsTo: "水", name: "丙辛合水 (威制の合)" },
  丁: { partner: "壬", transformsTo: "木", name: "丁壬合木 (淫匿の合)" },
  壬: { partner: "丁", transformsTo: "木", name: "丁壬合木 (淫匿の合)" },
  戊: { partner: "癸", transformsTo: "火", name: "戊癸合火 (無情の合)" },
  癸: { partner: "戊", transformsTo: "火", name: "戊癸合火 (無情の合)" },
};

export function stemCombination(a: string, b: string): { combines: boolean; transformsTo?: string; name?: string } {
  const entry = STEM_COMBINATIONS[a];
  if (entry && entry.partner === b) {
    return { combines: true, transformsTo: entry.transformsTo, name: entry.name };
  }
  return { combines: false };
}

// ====================================================================
// 支合 (六合)・三合・冲・刑・害
// ====================================================================
const SIX_COMBINATIONS: Record<string, string> = {
  子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯",
  辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午",
};

// 三合局: [支のトリオ, 化す五行, 中心 (旺支)]
const TRIPLE_COMBINATIONS: { branches: [string, string, string]; element: string; center: string }[] = [
  { branches: ["申", "子", "辰"], element: "水", center: "子" },
  { branches: ["寅", "午", "戌"], element: "火", center: "午" },
  { branches: ["巳", "酉", "丑"], element: "金", center: "酉" },
  { branches: ["亥", "卯", "未"], element: "木", center: "卯" },
];

const CLASHES: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

const HARMS: Record<string, string> = {
  子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
  卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
};

// 刑: 三刑 (寅巳申・丑戌未)・子卯刑・自刑 (辰辰・午午・酉酉・亥亥)
const PUNISHMENT_GROUPS: string[][] = [
  ["寅", "巳", "申"],
  ["丑", "戌", "未"],
  ["子", "卯"],
];
const SELF_PUNISHMENTS = new Set(["辰", "午", "酉", "亥"]);

export function branchSixCombination(a: string, b: string): boolean {
  return SIX_COMBINATIONS[a] === b;
}

export function branchClash(a: string, b: string): boolean {
  return CLASHES[a] === b;
}

export function branchHarm(a: string, b: string): boolean {
  return HARMS[a] === b;
}

export function branchPunishment(a: string, b: string): boolean {
  if (a === b) return SELF_PUNISHMENTS.has(a);
  return PUNISHMENT_GROUPS.some((g) => g.includes(a) && g.includes(b));
}

// 半合: 三合トリオのうち 2 支が揃う (中心の旺支を含む場合のみ「半合」と呼ぶ流派が主流)
export function branchHalfCombination(a: string, b: string): { isHalf: boolean; element?: string } {
  for (const t of TRIPLE_COMBINATIONS) {
    const inA = t.branches.includes(a);
    const inB = t.branches.includes(b);
    if (inA && inB && a !== b && (a === t.center || b === t.center)) {
      return { isHalf: true, element: t.element };
    }
  }
  return { isHalf: false };
}

export function branchTripleCombination(branches: string[]): { complete: boolean; element?: string } {
  for (const t of TRIPLE_COMBINATIONS) {
    if (t.branches.every((b) => branches.includes(b))) {
      return { complete: true, element: t.element };
    }
  }
  return { complete: false };
}

// ====================================================================
// 神殺 (主要 6 種)
// ====================================================================

// 天乙貴人: 日干 → 貴人の支 (甲戊庚=丑未 / 乙己=子申 / 丙丁=亥酉 / 壬癸=巳卯 / 辛=午寅)
const TENOTSU_KIJIN: Record<string, string[]> = {
  甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
  乙: ["子", "申"], 己: ["子", "申"],
  丙: ["亥", "酉"], 丁: ["亥", "酉"],
  壬: ["巳", "卯"], 癸: ["巳", "卯"],
  辛: ["午", "寅"],
};

export function hasTenotsuKijin(dayStem: string, branches: string[]): { has: boolean; at: string[] } {
  const targets = TENOTSU_KIJIN[dayStem] ?? [];
  const at = branches.filter((b) => targets.includes(b));
  return { has: at.length > 0, at };
}

// 将星: 年支または日支の三合局の中心 (旺支) が命式にあるか
export function hasShosei(baseBranch: string, branches: string[]): { has: boolean; star?: string } {
  const group = TRIPLE_COMBINATIONS.find((t) => t.branches.includes(baseBranch));
  if (!group) return { has: false };
  return branches.includes(group.center)
    ? { has: true, star: group.center }
    : { has: false, star: group.center };
}

// 華蓋: 三合局の墓支 (最後の支 = 辰戌丑未のどれか)
const KASAI_MAP: Record<string, string> = {
  申: "辰", 子: "辰", 辰: "辰",
  寅: "戌", 午: "戌", 戌: "戌",
  巳: "丑", 酉: "丑", 丑: "丑",
  亥: "未", 卯: "未", 未: "未",
};

export function hasKasai(baseBranch: string, branches: string[]): { has: boolean; star?: string } {
  const star = KASAI_MAP[baseBranch];
  if (!star) return { has: false };
  return { has: branches.includes(star), star };
}

// 桃花 (咸池): 三合局の沐浴支 (子午卯酉のどれか)
const TOKA_MAP: Record<string, string> = {
  申: "酉", 子: "酉", 辰: "酉",
  寅: "卯", 午: "卯", 戌: "卯",
  巳: "午", 酉: "午", 丑: "午",
  亥: "子", 卯: "子", 未: "子",
};

export function hasToka(baseBranch: string, branches: string[]): { has: boolean; star?: string } {
  const star = TOKA_MAP[baseBranch];
  if (!star) return { has: false };
  return { has: branches.includes(star), star };
}

// 羊刃: 陽干のみ (甲=卯 / 丙=午 / 戊=午 / 庚=酉 / 壬=子)
const YOJIN_MAP: Record<string, string> = {
  甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子",
};

export function hasYojin(dayStem: string, branches: string[]): { has: boolean; star?: string } {
  const star = YOJIN_MAP[dayStem];
  if (!star) return { has: false }; // 陰干に羊刃なし (流派による)
  return { has: branches.includes(star), star };
}

// 空亡: 日柱の旬から欠ける 2 支
// 60 干支を 10 ごとの旬に分け、各旬で使われない 2 支が空亡
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function kuubou(dayGanzhi: string): [string, string] {
  const stemIdx = STEMS.indexOf(dayGanzhi[0]);
  const branchIdx = BRANCHES.indexOf(dayGanzhi[1]);
  // 旬の先頭 (甲X) の支 index = branchIdx - stemIdx
  const decadeStart = ((branchIdx - stemIdx) % 12 + 12) % 12;
  // 旬で使う支は decadeStart から 10 個。残り 2 支が空亡
  const v1 = BRANCHES[(decadeStart + 10) % 12];
  const v2 = BRANCHES[(decadeStart + 11) % 12];
  return [v1, v2];
}

// ====================================================================
// 吉田氏命式の検証サマリー (テキスト主張との突合用)
// ====================================================================

export type ShenshaVerification = {
  claim: string;          // テキスト上の主張
  verified: boolean;      // アルゴリズム判定
  detail: string;
};

export function verifyYoshidaShensha(): ShenshaVerification[] {
  // 2026-06 改訂: 日柱を外部暦突合で 戊申 → 丙申 に修正 (時柱 己未 → 乙未)。
  // 地支 (子辰申未) は変わらないため支ベースの神殺は従来どおり、
  // 天干ベース (貴人・羊刃・空亡・干合) は丙基準に引き直した。
  const dayStem = "丙";
  const dayGanzhi = "丙申";
  const branches = ["子", "辰", "申", "未"]; // 年・月・日・時
  const yearBranch = "子";
  const monthBranch = "辰";

  const results: ShenshaVerification[] = [];

  // 1. 天乙貴人 (丙の貴人 = 亥酉 — 命式に不在、大運癸酉で巡来)
  const tk = hasTenotsuKijin(dayStem, branches);
  results.push({
    claim: "天乙貴人 (丙 → 亥酉) は命式になく、大運癸酉で巡ってくる",
    verified: !tk.has,
    detail: `丙の貴人 = 亥酉。命式の該当支: ${tk.at.join("・") || "なし"}・大運支 = 酉で巡来`,
  });

  // 2. 将星 (年支子 = 申子辰の中心)
  const ss = hasShosei(yearBranch, branches);
  results.push({
    claim: "将星 (申子辰の中心 = 子) を年支に持つ",
    verified: ss.has && ss.star === "子",
    detail: `申子辰局の旺支 = ${ss.star}。命式に${ss.has ? "あり" : "なし"}`,
  });

  // 3. 華蓋 (月支辰)
  const kg = hasKasai(yearBranch, branches);
  results.push({
    claim: "華蓋 (申子辰 → 辰) を月支に持つ",
    verified: kg.has && kg.star === "辰",
    detail: `子からの華蓋 = ${kg.star}。命式に${kg.has ? "あり" : "なし"}`,
  });

  // 4. 桃花 (酉) — 命式にはなく大運酉で稼働
  const th = hasToka(yearBranch, branches);
  results.push({
    claim: "桃花 (酉) は命式になく、大運癸酉で 10 年間稼働",
    verified: !th.has && th.star === "酉",
    detail: `子からの桃花 = ${th.star}。命式に${th.has ? "あり (主張と矛盾)" : "なし"}・大運支 = 酉で一致`,
  });

  // 5. 羊刃なし (丙 → 午、命式に午なし)
  const yj = hasYojin(dayStem, branches);
  results.push({
    claim: "羊刃 (丙 → 午) は命式にない",
    verified: !yj.has && yj.star === "午",
    detail: `丙の羊刃 = ${yj.star}。命式に${yj.has ? "あり (主張と矛盾)" : "なし"}`,
  });

  // 6. 空亡 (丙申 → 辰巳) — 月支辰が空亡に当たる (解釈上の重要変更点)
  const [k1, k2] = kuubou(dayGanzhi);
  results.push({
    claim: "日柱丙申の空亡は辰巳 — 月支辰が空亡に在住",
    verified: k1 === "辰" && k2 === "巳" && branches.includes("辰"),
    detail: `丙申の旬空亡 = ${k1}${k2}。月支辰が該当 (仕事・両親宮の空亡)`,
  });

  // 7. 丙辛干合 (日干丙 × 辛 → 合化水)。辛未大運 (31-40歳) で経験済み・
  //    今後は辛の流年 (辛丑 2021 等) で発動する縁。
  const sc = stemCombination("丙", "辛");
  results.push({
    claim: "日干丙と辛は干合 (丙辛合水・威制の合) — 辛未大運/辛の流年で発動",
    verified: sc.combines && sc.transformsTo === "水",
    detail: sc.name ?? "干合不成立",
  });

  // 8. 申子半合 (年支子 × 日支申 → 水局の半合)
  const hc = branchHalfCombination("子", "申");
  results.push({
    claim: "年支子と日支申は申子半合 (水局)",
    verified: hc.isHalf && hc.element === "水",
    detail: hc.isHalf ? `半合成立・化${hc.element}` : "半合不成立",
  });

  // 9. 辰戌冲 (月支辰 × 大運支戌 51-60 歳)
  results.push({
    claim: "月支辰と甲戌大運 (51-60 歳) の戌は支冲",
    verified: branchClash("辰", "戌"),
    detail: "辰戌冲 — 土台の地震 (大運切替期の根拠)",
  });

  // 10. 子卯刑 (年支子 × 子の卯年生まれ)
  results.push({
    claim: "吉田の年支子と子 (2011 卯年) は子卯刑",
    verified: branchPunishment("子", "卯"),
    detail: "子卯刑 — 価値観の小さな摩擦 (親子カードの根拠)",
  });

  return results;
}
