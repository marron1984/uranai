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
  // 立春境界は年によって 2/3〜2/5 に変動 — Meeus で実日付を取得
  let risshunDay = 4;
  try {
    const risshun = solarTermsOfYear(year).find((t) => t.longitude === 315);
    if (risshun) risshunDay = risshun.date.getUTCDate();
  } catch {
    // フォールバック: 固定 2/4
  }
  const effectiveYear =
    month < 2 || (month === 2 && day < risshunDay) ? year - 1 : year;
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

// 主要節気の黄経 → 月支のマッピング
// 立春(315)→寅(2), 啓蟄(345)→卯(3), 清明(15)→辰(4), 立夏(45)→巳(5),
// 芒種(75)→午(6), 小暑(105)→未(7), 立秋(135)→申(8), 白露(165)→酉(9),
// 寒露(195)→戌(10), 立冬(225)→亥(11), 大雪(255)→子(0), 小寒(285)→丑(1)
const TERM_LON_TO_BRANCH: Record<number, number> = {
  315: 2, 345: 3, 15: 4, 45: 5, 75: 6, 105: 7,
  135: 8, 165: 9, 195: 10, 225: 11, 255: 0, 285: 1,
};

function monthBranchIndex(month: number, day: number, year?: number): number {
  // Meeus 算出の節気日付があれば優先利用 (year が渡された場合)
  if (year !== undefined) {
    try {
      const terms = [
        ...solarTermsOfYear(year - 1),
        ...solarTermsOfYear(year),
      ].filter((t) => t.longitude in TERM_LON_TO_BRANCH);
      const target = new Date(Date.UTC(year, month - 1, day));
      // target 以前の最も新しい主要節気を探す
      let latest = terms[0];
      for (const t of terms) {
        if (t.date.getTime() <= target.getTime() && t.date > latest.date) {
          latest = t;
        }
      }
      return TERM_LON_TO_BRANCH[latest.longitude];
    } catch {
      // フォールバックへ
    }
  }
  // フォールバック: 固定日テーブル
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

// 日柱: 1900-01-01 = 丙戌(stem=2, branch=10) を基準に通日差で算出
// （1984-05-02 = 戊申 を真として逆算した値。shichu/page.tsx での
//  任意日付入力時にも正確な日柱が出るよう修正済み）
function dayPillar(year: number, month: number, day: number): Pillar {
  const base = Date.UTC(1900, 0, 1);
  const target = Date.UTC(year, month - 1, day);
  const days = Math.floor((target - base) / (1000 * 60 * 60 * 24));
  const stemIdx = ((2 + days) % 10 + 10) % 10;
  const branchIdx = ((10 + days) % 12 + 12) % 12;
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
  const mbIdx = monthBranchIndex(month, day, year);
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
  比肩: "独立心と自我の星。自分の足で立ち、自分の道を貫く力を表す。仲間意識・同志愛が強い反面、対立や独走になりやすい。経営者・職人・スポーツ選手に多い配置で、命式に強く出ると我が道を行くタイプ。",
  劫財: "競争と協力の星。仲間と切磋琢磨し、ライバルとともに伸びるエネルギー。財を奪い合うように見えるが、実は競争があるからこそ実力が磨かれる。やや攻撃的・賭け事好きの傾向も。",
  食神: "創造と楽しみの星。表現力・芸術・グルメ・遊び心を司る吉星。穏やかで人生を楽しむ才能、衣食住に困らない安定運の象徴。柔らかな魅力で人を惹きつける。",
  傷官: "鋭い才能の星。批評眼・独自性・反骨精神・芸術的センスを表す。常識や権威に楯突く傾向があり、組織内では衝突しやすいが、専門家・クリエイター・批評家として大きく花開く。",
  偏財: "流通する財の星。社交と機転で稼ぐエネルギー。固定収入よりビジネス・副業・投資で動く財。男性命では恋愛運や父との縁を表すことも。気前が良く、お金を循環させる才。",
  正財: "安定した財の星。コツコツ蓄える堅実な財運、家庭運、配偶者運（男性命では妻との縁）。地味だが確実に資産を積み上げる。投機より預金、派手より堅実。",
  偏官: "胆力と決断の星（七殺とも）。困難に立ち向かう強さ、リーダーシップ、武の才。攻撃性と勇気が紙一重で、活かせば英雄、暴走すれば破壊。改革者・軍人・経営者に多い配置。",
  正官: "規律と名誉の星。組織での昇進・社会的地位・公的評価を表す吉星。真面目で品行方正、責任感が強い。女性命では夫との縁、男性命では息子との縁、社会的責任の象徴。",
  偏印: "独自の知性の星。アイデア・直感・副業・特殊技能を司る。表の主流から外れた知性、研究者・占術家・発明家・フリーランスの星。義母との縁を表すことも。",
  印綬: "学問と保護の星。教養・教育・名誉・親（特に母）との縁・宗教的庇護を表す吉星。学問を通じた成功、年長者から愛される徳、人格的な深みの象徴。",
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
  長生: "誕生・育成の段階。新しい命が芽吹くフレッシュなエネルギー。柔らかく素直で、周囲から愛されながら育っていく時期。学びと成長に追い風で、年長者からの引き上げが多い。",
  沐浴: "産湯を浴びる段階。揺らぎ・迷い・探索の時期。色気と移り気が同居し、恋愛運には変化が多い。試行錯誤が多い分、本質を掴む経験ができる。",
  冠帯: "成人式の段階。実力をまとい、社会的な役割を担い始める時。意気軒昂で野心的、外見にも気を使い、自分のスタイルを確立する。挑戦と背伸びが似合う段階。",
  建禄: "自立の段階。自分の城・場・職を築く充実期。実力と地位が安定し、誰かに依存せず生きていける自立した力。家庭を持つ・独立するに最適なエネルギー。",
  帝旺: "頂点の段階。十二運で最も強い気を持ち、最大の力を発揮する時。リーダーシップ・成功・名声がピークに達する。同時に独走・傲慢の危険もあり、自制が運命を分ける。",
  衰: "勢いが緩み始める転換点。頂点を過ぎて落ち着きが訪れる時。派手さは減るが、深みと成熟が増す。教える・伝える役割に向く段階。",
  病: "立ち止まり内省する段階。健康・人間関係・仕事に陰りを感じやすい時期だが、それは魂が休息と再考を要求しているサイン。芸術・学問・スピリチュアルに親和。",
  死: "終焉と再構築への準備の段階。古いものが終わり、新しい何かが宿るための空白期。哲学的・霊的な深まりがあり、転機の年に当たることが多い。",
  墓: "蓄積と内なる充実の段階。地味で動きの少ない時期だが、内面では深い知恵と財が蓄えられる。研究・学問・遺産・先祖供養に縁が深い段階。",
  絶: "切り替わりの段階。古い枠が完全に外れ、新しい流れが始まる前の真空状態。不安定だが自由、何でも始められる白紙状態。リセットとリスタートの段階。",
  胎: "新たな構想が宿る段階。まだ見えないが、内側で新しい命・プロジェクト・関係が育ち始めている時期。表に出る前の準備期間、可能性に満ちた静寂の時。",
  養: "じっくり育てる段階。胎の段階で宿ったものを、丁寧に養い育てる時期。穏やかで安全な環境のなかで、未来の力が静かに蓄えられる。",
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
  陽木: "甲（こうぼく・きのえ）— 大樹の象意。天に向かってまっすぐ伸びる、堂々とした成長力を持つ日干。リーダー気質で、責任感と正義感が強く、組織の柱になる人物。一度根を張った場所で大きく育つため、転職や引っ越しは慎重に。短所は頑固さと融通の利かなさ、剪定（自己批判）を受け入れる柔軟さで一段成熟する。",
  陰木: "乙（いつぼく・きのと）— 草花や蔦の象意。柔軟でしなやか、環境に合わせて美しく育つ日干。繊細な美意識と粘り強さを併せ持ち、表面はソフトだが芯はとても強い。人と人の間を繋ぐ調整役として光るが、相手に巻き付きすぎる依存傾向には注意。風に揺れる柔らかさが武器。",
  陽火: "丙（へいか・ひのえ）— 太陽の象意。明るく熱量があり、周囲を照らすカリスマ性。情熱的で正直、隠し事ができない透明な人柄。大勢の前でこそ輝き、舞台が広いほど力を発揮する。短所は感情の起伏と独善、影に潜む人の気持ちにも目を向ける成熟が課題。",
  陰火: "丁（ていか・ひのと）— 蝋燭・灯火の象意。柔らかく優しい光で、暗闇の中で人の道を照らす日干。繊細で感受性が鋭く、内面に強い情熱を秘める。一対一の深い関係や、専門性で輝く。風に消されないよう、自分の燃料（趣味・休息・愛情）を絶やさないことが大切。",
  陽土: "戊（ぼど・つちのえ）— 山・大地の象意。動かぬ山のような安定感とスケールの大きさを持つ日干。包容力・忍耐力・現実構築力に優れ、誰よりも頼りになる存在。慎重で軽率に動かないため成功は遅咲きだが、一度築いた地位は揺るがない。短所は頑固と腰の重さ、変化を恐れず種をまく勇気が次の山を作る。リーダーや経営者、不動産・金融に縁深い。",
  陰土: "己（きど・つちのと）— 田畑・湿土の象意。栄養を受け入れ、育てる土の優しさ。控えめで親切、誰の言葉にも耳を傾ける受容力が信頼を呼ぶ。教育・介護・サービス業など、人を育てる職に天命がある。短所は他人に巻き込まれやすさ、自分の境界線を持つことで真価を発揮する。",
  陽金: "庚（こうきん・かのえ）— 刀剣・鉄の象意。鋭い決断力と切れ味鋭い行動力。義理人情に厚く、白黒はっきりさせる潔さが魅力。リーダーとして頼られ、武人気質で困難に強い。短所は強引さと不器用さ、研ぎ澄まされた刃も時に鞘に納める柔軟さが必要。",
  陰金: "辛（しんきん・かのと）— 宝石・金属の象意。繊細な輝きと品格、磨けば磨くほど価値が増す日干。プライドが高く美意識が鋭く、自分を高く売る才能を持つ。短所は気難しさと潔癖、傷つきやすい一面もあるが、それも品格の裏返し。芸術家・専門家・ブランド業に向く。",
  陽水: "壬（じんすい・みずのえ）— 大河・海の象意。流れ続ける大水のような包容力とスケール。物事を大きく捉え、知恵と機転で道を作る日干。社交的で世渡り上手、海外や移動と縁が深い。短所は移り気と落ち着きのなさ、深く一つに留まる経験が運命を深める。",
  陰水: "癸（きすい・みずのと）— 雨・霧・露の象意。柔らかく繊細、しかし全てを潤す細やかな知性。直感力・霊感・芸術センスに優れ、見えないものを言語化する才能。短所は気分の波と弱気、コップに溜める時間（自己ケア）を持つことで本領を発揮する。",
};

// ============================================================
// 大運（10年周期のライフサイクル）
// ============================================================

const ALL_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const ALL_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type DaiunPeriod = {
  index: number;
  startAge: number;
  endAge: number;
  ganzhi: string;
  stem: string;
  branch: string;
  stemTongbian: TongbianStar;
  stemElement: string;
  branchElement: string;
  isCurrent: boolean;
  theme: string;
};

const DAIUN_THEMES: Record<TongbianStar, string> = {
  比肩: "独立心と競争のフェーズ。自分軸が確立され、仲間と切磋琢磨する10年。",
  劫財: "出費と試練のフェーズ。仲間・兄弟・友人との関わりが運命を動かす波乱期。",
  食神: "創造と楽しみのフェーズ。表現力と才能が花開き、衣食住も豊かになる黄金期。",
  傷官: "才能と批評のフェーズ。鋭さで頭角を現すが衝突も多い、内省と挑戦の10年。",
  偏財: "流動する財のフェーズ。ビジネス・社交・副業で大きく稼ぐチャンス期。",
  正財: "堅実な財のフェーズ。コツコツ蓄積し、家庭と仕事の安定を築く充実期。",
  偏官: "胆力と挑戦のフェーズ。改革者・経営者として頂点を目指す試練と栄光の10年。",
  正官: "規律と名誉のフェーズ。社会的地位・公的評価が頂点に達する充実期。",
  偏印: "独自の知性のフェーズ。副業・専門性・霊性が深まる、内向きで静かな実りの期。",
  印綬: "学問と人徳のフェーズ。教養・名誉・年長者の庇護が満ちる、人格完成の10年。",
};

// 月柱の干支から大運を生成
// forward: 男+陽干 or 女+陰干 → true（順行）/ それ以外 → false（逆行）
export function generateDaiun(
  monthGZ: string,
  startingAge: number,
  forward: boolean,
  count: number,
  currentAge: number,
  dayStem: string
): DaiunPeriod[] {
  const startStemIdx = ALL_STEMS.indexOf(monthGZ[0] as (typeof ALL_STEMS)[number]);
  const startBranchIdx = ALL_BRANCHES.indexOf(monthGZ[1] as (typeof ALL_BRANCHES)[number]);
  const dir = forward ? 1 : -1;
  const periods: DaiunPeriod[] = [];
  for (let i = 1; i <= count; i++) {
    const stem = ALL_STEMS[((startStemIdx + dir * i) % 10 + 10) % 10];
    const branch = ALL_BRANCHES[((startBranchIdx + dir * i) % 12 + 12) % 12];
    const ganzhi = stem + branch;
    const periodStart = startingAge + (i - 1) * 10;
    const periodEnd = periodStart + 9;
    const tb = tongbianStar(dayStem, stem);
    periods.push({
      index: i,
      startAge: periodStart,
      endAge: periodEnd,
      ganzhi,
      stem,
      branch,
      stemTongbian: tb,
      stemElement: STEM_ELEMENT[stem],
      branchElement: BRANCH_ELEMENT[branch],
      isCurrent: currentAge >= periodStart && currentAge <= periodEnd,
      theme: DAIUN_THEMES[tb],
    });
  }
  return periods;
}

// ============================================================
// 立運（大運起点年齢）の正確な算出
// ============================================================
// 男+陽干 or 女+陰干 → 順行 (next 節入りまでの日数 / 3)
// 男+陰干 or 女+陽干 → 逆行 (prev 節入りからの日数 / 3)

import { solarTermsOfYear } from "@/lib/astronomy";

const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);

// 主要節気 (月柱境界) の黄経
const MAIN_TERM_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];

export function calcRuiun(birth: string, yearStem: string, gender: "male" | "female"): {
  startingAge: number;
  forward: boolean;
  daysToTerm: number;
} {
  const [y, m, d] = birth.split("-").map(Number);
  const birthDate = new Date(Date.UTC(y, m - 1, d));
  const isYang = YANG_STEMS.has(yearStem);
  const forward = (gender === "male" && isYang) || (gender === "female" && !isYang);

  // 前後の主要節気を集める (前年・当年・翌年)
  const allTerms = [
    ...solarTermsOfYear(y - 1),
    ...solarTermsOfYear(y),
    ...solarTermsOfYear(y + 1),
  ].filter((t) => MAIN_TERM_LONGITUDES.includes(t.longitude));

  let nearestDays = Infinity;
  for (const t of allTerms) {
    const diffDays = (t.date.getTime() - birthDate.getTime()) / 86400000;
    if (forward && diffDays > 0 && diffDays < nearestDays) nearestDays = diffDays;
    if (!forward && diffDays < 0 && Math.abs(diffDays) < nearestDays)
      nearestDays = Math.abs(diffDays);
  }
  if (!isFinite(nearestDays)) nearestDays = 0;
  const startingAge = Math.max(0, Math.round(nearestDays / 3));
  return { startingAge, forward, daysToTerm: nearestDays };
}
