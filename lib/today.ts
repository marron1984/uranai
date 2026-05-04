// 今日の占いを深く広く: パーソナルデイ・時間帯運・マントラ・注意事項・人間関係助言
// すべて生年月日と当日の組み合わせで決定論的に算出

import { OWNER } from "@/lib/owner";
import { tongbianStar, TONGBIAN_TEXT, type TongbianStar } from "@/lib/shichu";
import { hexagramFromYaos, changedHexagram, changingLineMeanings, type Yao } from "@/lib/iching";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

function digitSum(n: number): number {
  return String(n)
    .split("")
    .reduce((a, c) => a + Number(c), 0);
}
function reduce1to9(n: number): number {
  while (n > 9) n = digitSum(n);
  return n;
}

// ==== パーソナルデイ・パーソナルマンス ====
// パーソナルマンス = パーソナルイヤー + 当月
// パーソナルデイ = パーソナルマンス + 当日
export function personalMonth(birth: string, year: number, month: number): number {
  const [, m, d] = birth.split("-").map(Number);
  const py = reduce1to9(
    digitSum(m ?? 0) + digitSum(d ?? 0) + digitSum(year)
  );
  return reduce1to9(py + month);
}

export function personalDay(birth: string, year: number, month: number, day: number): number {
  const pm = personalMonth(birth, year, month);
  return reduce1to9(pm + day);
}

export const PERSONAL_DAY_TEXT: Record<number, {
  energy: string;
  do: string[];
  avoid: string[];
  mantra: string;
}> = {
  1: {
    energy: "始動と独立のエネルギー。新しいことを始めるのに最適な日。意志を明確にし、自分から動くことで運が開く。",
    do: ["新規プロジェクトの第一歩", "メールや連絡の発信", "リーダーシップを発揮", "自己投資"],
    avoid: ["他人任せ", "決断の先送り", "受け身"],
    mantra: "私が動くことで、世界が動き始める。",
  },
  2: {
    energy: "協力と直感の日。一人より誰かと組む、聞く、感じる。繊細な感受性が冴える。",
    do: ["対話を深める", "パートナーとの時間", "感謝を伝える", "瞑想"],
    avoid: ["独走", "強引な決断", "感情の爆発"],
    mantra: "受け取ることで、私は与えられる。",
  },
  3: {
    energy: "表現と社交の日。創造性が高まり、楽しいことが運を呼ぶ。SNSや人前での発信に追い風。",
    do: ["創作・SNS投稿", "新しい人と会う", "笑う・遊ぶ", "おしゃれをする"],
    avoid: ["内にこもる", "深刻になりすぎる", "悲観的な言葉"],
    mantra: "喜びこそが、私の最強の武器。",
  },
  4: {
    energy: "基盤づくりと実務の日。地味だが大切な作業をコツコツ進める。健康・整理整頓に好機。",
    do: ["書類整理", "計画立案", "健康管理", "ルーティン強化"],
    avoid: ["派手な投資", "衝動買い", "サボり"],
    mantra: "今日の小さな一歩が、明日の大樹を作る。",
  },
  5: {
    energy: "変化と自由の日。新しい体験・出会い・移動が運を運ぶ。固定観念を捨てる勇気。",
    do: ["新しい場所に行く", "未知の人と話す", "旅・出張", "変化を歓迎"],
    avoid: ["同じ場所に留まる", "古い習慣", "言い訳"],
    mantra: "変化こそ、私の本質。",
  },
  6: {
    energy: "愛と責任の日。家族・パートナー・コミュニティに目を向ける。誰かを大切にすることで自分も満たされる。",
    do: ["家族との時間", "プレゼント", "家を整える", "誰かを助ける"],
    avoid: ["自己中心", "責任放棄", "家庭を後回し"],
    mantra: "愛は、与えるほど自分に返ってくる。",
  },
  7: {
    energy: "内省と学びの日。一人時間で深い洞察が降りてくる。読書・瞑想・スピリチュアルに最適。",
    do: ["読書", "瞑想", "一人の散歩", "学び直し"],
    avoid: ["騒がしい場所", "浅い社交", "焦った決断"],
    mantra: "答えは、私の内側にすでにある。",
  },
  8: {
    energy: "達成と豊かさの日。仕事・お金・地位に追い風。リーダーシップとビジネス的判断が冴える。",
    do: ["大きな決断", "ビジネス交渉", "投資判断", "存在感を示す"],
    avoid: ["遠慮", "他人任せ", "自分を小さく見せる"],
    mantra: "豊かさを、私は正面から受け取る。",
  },
  9: {
    energy: "完了と手放しの日。古いものを終え、新しいスペースを作る。慈善や奉仕にも追い風。",
    do: ["不要なものを捨てる", "感謝を伝える", "ボランティア", "総括"],
    avoid: ["新規スタート", "重要契約", "執着"],
    mantra: "手放した先に、本物が残る。",
  },
};

// ==== 時間帯運（十二時辰） ====
// 時刻ごとの吉凶傾向
export type HourTiming = {
  range: string;
  branch: string;       // 地支
  energy: string;
  recommend: string;    // この時間に向く活動
};

export const HOUR_TIMINGS: HourTiming[] = [
  { range: "23-1", branch: "子", energy: "陰の極み・新生", recommend: "瞑想・睡眠・夢日記。新しい構想が宿る時刻。" },
  { range: "1-3",  branch: "丑", energy: "蓄積と熟成", recommend: "深い眠り。明日への充電。" },
  { range: "3-5",  branch: "寅", energy: "目覚め・始動", recommend: "早朝瞑想・運動。意志を立てる時刻。" },
  { range: "5-7",  branch: "卯", energy: "陽気の上昇", recommend: "起床・軽い運動・朝食。1日のリズムを作る。" },
  { range: "7-9",  branch: "辰", energy: "湿土・受容", recommend: "通勤・準備・人との挨拶。エネルギーを整える。" },
  { range: "9-11", branch: "巳", energy: "陽が動く・知性", recommend: "思考・企画・大事な会議。頭が最も冴える時間。" },
  { range: "11-13",branch: "午", energy: "陽の極み・情熱", recommend: "決断・営業・プレゼン。最大出力で動く時刻。" },
  { range: "13-15",branch: "未", energy: "成熟・楽しみ", recommend: "創作・食事・ゆとりの時間。柔らかな集中。" },
  { range: "15-17",branch: "申", energy: "陰が始まる・実行", recommend: "実務・処理・プロジェクト推進。落ち着いた集中。" },
  { range: "17-19",branch: "酉", energy: "収束・整理", recommend: "1日の振り返り・記録。家族との時間も。" },
  { range: "19-21",branch: "戌", energy: "守り・安らぎ", recommend: "夕食・家庭・休息。重要決断は避ける。" },
  { range: "21-23",branch: "亥", energy: "陰の深まり・休息", recommend: "リラックス・読書・入浴。早めの就寝。" },
];

export function currentHourTiming(date: Date = new Date()): HourTiming {
  const h = date.getHours();
  const i = h >= 23 || h < 1 ? 0 : Math.floor((h + 1) / 2);
  return HOUR_TIMINGS[i];
}

// ==== 今日の方位（簡易・本命卦の吉方優先 + パーソナルデイ補正） ====
export function todayBestDirection(personalDayNum: number): {
  primary: string;
  secondary: string;
  caution: string;
} {
  // 1=北, 2=南西, 3=東, 4=東南, 5=中央(避), 6=北西, 7=西, 8=東北, 9=南
  const map: Record<number, string> = {
    1: "北", 2: "南西", 3: "東", 4: "東南",
    5: "中央", 6: "北西", 7: "西", 8: "東北", 9: "南",
  };
  const primary = map[personalDayNum];
  const secondary = map[((personalDayNum + 2) % 9) || 9];
  const caution = map[((personalDayNum + 4) % 9) || 9];
  return { primary, secondary, caution };
}

// ==== 今日のラッキーカラー（パーソナルデイ × 季節） ====
export const DAY_COLORS: Record<number, { color: string; hex: string; reason: string }> = {
  1: { color: "深紅", hex: "#8b0000", reason: "始まりと意志のエネルギーを強化" },
  2: { color: "ペールピンク", hex: "#f5dadf", reason: "受容と協調を引き寄せる" },
  3: { color: "イエロー", hex: "#f5d33b", reason: "コミュニケーションと創造を活性化" },
  4: { color: "ダークグリーン", hex: "#1f4d3a", reason: "安定と地に足のついた基盤" },
  5: { color: "ターコイズ", hex: "#2eb6b0", reason: "変化と自由を呼ぶ流動性" },
  6: { color: "ローズピンク", hex: "#c8557a", reason: "愛と家族の絆を深める" },
  7: { color: "深紫", hex: "#3b2755", reason: "霊性と内省を深める" },
  8: { color: "ゴールド", hex: "#c5a23a", reason: "達成と豊かさを引き寄せる" },
  9: { color: "ホワイト", hex: "#fafaf7", reason: "完了と浄化、新章への準備" },
};

// ==== 今日のキーパーソン（家族の中で誰と関わるべきか） ====
export function todayKeyPerson(personalDayNum: number): {
  who: string;
  why: string;
} {
  const child = OWNER.family.child;
  const spouse = OWNER.family.spouse;
  // 偶数日は妻、3/9は子供、それ以外は自分
  if ([2, 4, 6, 8].includes(personalDayNum)) {
    return {
      who: `配偶者（${spouse.relation}）`,
      why: "今日のエネルギーは関係性の調整に向く。妻との対話・感謝・ささやかなギフトで家庭の運が整う。",
    };
  }
  if ([3, 9].includes(personalDayNum)) {
    return {
      who: `子供（${child.relation}）`,
      why: "今日は子の成長と表現を支える日。話を聴き、楽しい時間を共有することが家全体の運を引き上げる。",
    };
  }
  if ([1, 5].includes(personalDayNum)) {
    return {
      who: "自分自身",
      why: "今日は自分のために動く日。目標・挑戦・新しい体験に投資する時間が、長期の運を強くする。",
    };
  }
  return {
    who: "古い友人・恩師",
    why: "今日は再会・感謝・原点回帰のエネルギー。連絡が途絶えていた人にメッセージを送ると好機が開く。",
  };
}

// ==== 注意事項（パーソナルデイに応じた具体的なリスク） ====
export const DAY_CAUTIONS: Record<number, string[]> = {
  1: ["独走しすぎて周囲が見えなくなる", "強引なメールや言葉", "睡眠不足の意思決定"],
  2: ["優柔不断で機を逃す", "感情の波に飲まれる", "他人の問題を背負いすぎる"],
  3: ["話しすぎて秘密が漏れる", "見栄での出費", "深い話を避ける癖"],
  4: ["細部にこだわりすぎて全体を見失う", "頑固な判断", "肩こり・腰痛"],
  5: ["衝動的な購入や移動", "予定変更で人を振り回す", "刺激物の摂取過多"],
  6: ["過保護・おせっかい", "家族関係の摩擦", "甘いものの食べ過ぎ"],
  7: ["孤立しすぎる", "SNSとの距離", "頭の使いすぎによる目の疲れ"],
  8: ["プレッシャーで余裕を失う", "金銭判断のミス", "他者を見下す態度"],
  9: ["過去の感情に飲まれる", "新規契約・投資", "別離の場面で感情的になる"],
};

// ==== 今日のラッキー食べ物 ====
export const DAY_FOODS: Record<number, string> = {
  1: "辛味のあるもの・赤い果物（トマト・赤パプリカ）。スパイスで活力を上げる。",
  2: "白い食材・乳製品・卵。柔らかく整える食事で感受性を支える。",
  3: "黄色い果物・蜂蜜・柑橘。明るさと甘さで創造性を刺激。",
  4: "根菜・玄米・味噌汁。地に足のついた一汁三菜の食事。",
  5: "ハーブ・サラダ・新鮮な魚。流動性を持つ軽やかな食事。",
  6: "家族で囲む鍋・煮込み料理。共有することで運が深まる。",
  7: "お茶・水・ハーブティー・軽食。胃を休めて頭を澄ます。",
  8: "上質な肉・濃厚なチョコレート。本物を味わうことで豊かさが倍増。",
  9: "薬膳粥・スープ。身体を浄化し、新章への準備。",
};

// ==== 今日の課題と祝福（陰陽） ====
export type TodayShadow = {
  shadow: string;   // 今日特に注意すべき影の側面
  blessing: string; // 今日特に降り注ぐ祝福
};

export function todayShadowBlessing(personalDayNum: number): TodayShadow {
  const map: Record<number, TodayShadow> = {
    1: { shadow: "自我が強くなりすぎ、他者を置き去りにしがち。立ち止まる勇気を。", blessing: "新しい扉が向こうから開く。第一歩を踏み出した者だけに見える景色。" },
    2: { shadow: "繊細さが過敏に振れ、傷つきやすくなる。境界線を意識して。", blessing: "深い直感と、誰かに必要とされる温かさが満ちる日。" },
    3: { shadow: "軽さが浅さに反転しないよう、本音の対話を大切に。", blessing: "笑いと出会いが運を運ぶ。心が広がり、世界も広がる。" },
    4: { shadow: "頑固さで関係を硬直させやすい。柔らかく譲る練習を。", blessing: "地道な努力に静かな確信が宿る。土台が一段強くなる。" },
    5: { shadow: "刺激を求めすぎて散漫になる。一つに集中する瞬間を作る。", blessing: "予期せぬ出会いとチャンスが転がり込む、運命的な日。" },
    6: { shadow: "愛が責任に、責任が義務に変わる瞬間。喜びを忘れずに。", blessing: "誰かのために動いた愛が、別の誰かから返ってくる循環の日。" },
    7: { shadow: "孤独が皮肉や不信に変わらないよう、温かさを保って。", blessing: "深い気づきと、本物の知恵が降りてくる静寂の日。" },
    8: { shadow: "成功の追求が冷酷さに転じやすい。柔らかさも力。", blessing: "実力が形になる収穫の日。誇りを持って受け取って。" },
    9: { shadow: "別れと終わりに過剰反応せず、穏やかに見送る。", blessing: "古いものが終わる清々しさ。新しいスペースが心に空く。" },
  };
  return map[personalDayNum];
}

// ==================================================================
// 今日の日柱（干支）算出
// 1984-05-02 = 戊申（しゅんすけさんの日柱）を基準に、UTC日数差で算出
// ==================================================================

const OWNER_DAY_STEM_IDX = 4;   // 戊
const OWNER_DAY_BRANCH_IDX = 8; // 申

export function todayDayPillar(date: Date = new Date()): {
  stem: string;
  branch: string;
  ganzhi: string;
} {
  const baseUTC = Date.UTC(1984, 4, 2);
  const targetUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((targetUTC - baseUTC) / 86400000);
  const stemIdx = ((OWNER_DAY_STEM_IDX + days) % 10 + 10) % 10;
  const branchIdx = ((OWNER_DAY_BRANCH_IDX + days) % 12 + 12) % 12;
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  return { stem, branch, ganzhi: stem + branch };
}

// ==================================================================
// 今日の日干 vs Yoshida の日主（戊）の通変星
// ==================================================================

export function todayTongbianForOwner(date: Date = new Date()): {
  star: TongbianStar;
  text: string;
} {
  const dp = todayDayPillar(date);
  const star = tongbianStar("戊", dp.stem);
  return { star, text: TONGBIAN_TEXT[star] };
}

// ==================================================================
// 12時辰盤: 今日の日干から各時辰の天干を導き、戊から見た通変星で吉凶を判定
// ==================================================================

const HOUR_STEM_START: Record<string, number> = {
  甲: 0, 己: 0,
  乙: 2, 庚: 2,
  丙: 4, 辛: 4,
  丁: 6, 壬: 6,
  戊: 8, 癸: 8,
};

// 通変星 → 吉凶ランク（Yoshida 戊土から見た）
function rateTongbian(star: TongbianStar): {
  rating: "大吉" | "吉" | "中吉" | "注意" | "凶";
  desc: string;
} {
  const map: Record<TongbianStar, { rating: "大吉" | "吉" | "中吉" | "注意" | "凶"; desc: string }> = {
    印綬: { rating: "大吉", desc: "学び・人徳・名誉が育つ時間" },
    正官: { rating: "大吉", desc: "規律と評価が手に入る時間" },
    正財: { rating: "吉", desc: "堅実な収入と結果" },
    食神: { rating: "吉", desc: "創造性と楽しみ" },
    比肩: { rating: "中吉", desc: "自分のペースで進める" },
    偏官: { rating: "中吉", desc: "決断と挑戦の好機" },
    偏財: { rating: "中吉", desc: "流動的な利益・社交" },
    偏印: { rating: "中吉", desc: "独自のアイデアが冴える" },
    劫財: { rating: "注意", desc: "出費・競合に注意" },
    傷官: { rating: "注意", desc: "言葉と対人衝突に注意" },
  };
  return map[star];
}

const BRANCH_HOURS: Record<string, string> = {
  子: "23-1", 丑: "1-3", 寅: "3-5", 卯: "5-7", 辰: "7-9", 巳: "9-11",
  午: "11-13", 未: "13-15", 申: "15-17", 酉: "17-19", 戌: "19-21", 亥: "21-23",
};

export type HourSlot = {
  branch: string;
  range: string;
  stem: string;
  ganzhi: string;
  star: TongbianStar;
  rating: "大吉" | "吉" | "中吉" | "注意" | "凶";
  desc: string;
};

export function todayHourlyChart(date: Date = new Date()): HourSlot[] {
  const dp = todayDayPillar(date);
  const start = HOUR_STEM_START[dp.stem];
  return BRANCHES.map((br, i) => {
    const stemIdx = (start + i) % 10;
    const stem = STEMS[stemIdx];
    const star = tongbianStar("戊", stem);
    const r = rateTongbian(star);
    return {
      branch: br,
      range: BRANCH_HOURS[br],
      stem,
      ganzhi: stem + br,
      star,
      rating: r.rating,
      desc: r.desc,
    };
  });
}

// 今日のラッキー時間帯（最も吉な時辰のトップ2）
export function todayLuckyHours(date: Date = new Date()): HourSlot[] {
  const chart = todayHourlyChart(date);
  const order: Record<string, number> = { 大吉: 5, 吉: 4, 中吉: 3, 注意: 2, 凶: 1 };
  return [...chart].sort((a, b) => order[b.rating] - order[a.rating]).slice(0, 2);
}

// 今日の注意時間帯
export function todayCautionHours(date: Date = new Date()): HourSlot[] {
  const chart = todayHourlyChart(date);
  const order: Record<string, number> = { 大吉: 5, 吉: 4, 中吉: 3, 注意: 2, 凶: 1 };
  return [...chart].sort((a, b) => order[a.rating] - order[b.rating]).slice(0, 2);
}

// ==================================================================
// 今日のパーソナル易卦
// 生年月日 + 当日でシードした疑似乱数で6本の爻を生成
// → その日固有の易卦（Yoshida にとっての今日の易）が確定
// ==================================================================

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function todayPersonalHexagram(
  birth: string = OWNER.birth,
  date: Date = new Date()
): {
  yaos: Yao[];
  hex: ReturnType<typeof hexagramFromYaos>;
  changed: ReturnType<typeof changedHexagram>;
  lines: ReturnType<typeof changingLineMeanings>;
} {
  const birthSeed = birth.replace(/-/g, "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rand = seededRand(birthSeed ^ (dateSeed * 2654435761));
  const yaos: Yao[] = [];
  for (let i = 0; i < 6; i++) {
    let sum = 0;
    for (let j = 0; j < 3; j++) sum += rand() < 0.5 ? 2 : 3;
    const value = sum as 6 | 7 | 8 | 9;
    yaos.push({ value, isYang: value === 7 || value === 9, isChanging: value === 6 || value === 9 });
  }
  return {
    yaos,
    hex: hexagramFromYaos(yaos),
    changed: changedHexagram(yaos),
    lines: changingLineMeanings(yaos),
  };
}

// ==================================================================
// 今日の総合シンセシス（複数システムを編み込んだしゅんすけさん専用の今日の物語）
// ==================================================================

export type TodaySynthesis = {
  headline: string;
  subline: string;
  paragraphs: string[];
  keywords: string[];
  affirmation: string;
};

export function todaySynthesis(
  personalDay: number,
  date: Date = new Date()
): TodaySynthesis {
  const dp = todayDayPillar(date);
  const tb = todayTongbianForOwner(date);
  const lucky = todayLuckyHours(date);
  const caution = todayCautionHours(date);
  const hex = todayPersonalHexagram(OWNER.birth, date);

  // 通変星に基づく今日のテーマ
  const tongbianTheme: Record<TongbianStar, { headline: string; sub: string; key: string[] }> = {
    比肩: { headline: "自分のペースで進む日", sub: "独立心と自我が前面に出る、自分主導の一日", key: ["独立", "決断", "自分軸"] },
    劫財: { headline: "競争と協力が交差する日", sub: "ライバルや仲間との関わりが運命を動かす", key: ["競争", "協力", "切磋琢磨"] },
    食神: { headline: "創造と楽しみが咲く日", sub: "表現・グルメ・遊び心が運を呼ぶ柔らかな一日", key: ["創造", "楽しみ", "豊かさ"] },
    傷官: { headline: "鋭い才能が光る日（言葉に注意）", sub: "批評眼と独自性が冴える、しかし衝突しやすい刃の日", key: ["才能", "批評", "刃"] },
    偏財: { headline: "流通する財と社交の日", sub: "人と人の間を流れる金とチャンスが舞い込む", key: ["社交", "流動", "副収入"] },
    正財: { headline: "堅実な蓄積の日", sub: "コツコツ積み上げる仕事・家計・関係が実る", key: ["堅実", "蓄積", "信頼"] },
    偏官: { headline: "胆力と決断の日", sub: "リーダーシップが試される、強気で攻めるべき一日", key: ["胆力", "リーダー", "突破"] },
    正官: { headline: "規律と名誉の日", sub: "公的な評価・組織での昇進・誠実さが光る一日", key: ["規律", "名誉", "公正"] },
    偏印: { headline: "独自の知性が冴える日", sub: "副業・アイデア・スピリチュアルな閃きが降りる", key: ["独創", "閃き", "副業"] },
    印綬: { headline: "学問と保護の日", sub: "学び・教養・年長者からの庇護が運を運ぶ", key: ["学問", "庇護", "人徳"] },
  };

  const theme = tongbianTheme[tb.star];
  const luckyHourLabel = lucky.map((h) => `${h.range}時(${h.branch})`).join(" / ");
  const cautionHourLabel = caution.map((h) => `${h.range}時(${h.branch})`).join(" / ");

  const headline = theme.headline;
  const subline = `今日の日柱「${dp.ganzhi}」が、あなたの日主『戊』に対して『${tb.star}』の関係を結びます。`;

  const paragraphs: string[] = [
    `本日の日柱は ${dp.ganzhi}。あなたの日主『戊（陽土・山）』から見ると ${tb.star}（${theme.sub}）にあたり、${tb.text} 通変星のテーマが今日一日に色濃く現れる流れです。`,
    `パーソナルデイ${personalDay}と通変星${tb.star}の組合せは、${combineThemes(personalDay, tb.star)} 内側のエネルギーと外側の流れが共鳴する、密度の高い24時間です。`,
    `12時辰盤を見ると、本日の最も追い風となる時間帯は ${luckyHourLabel}。逆に注意が必要なのは ${cautionHourLabel} です。重要な意思決定・連絡・移動はラッキータイムに合わせ、注意時間帯は内省・休息・確認作業にあてると吉。`,
    `今日のあなた専用の易卦は『${hex.hex.num}. ${hex.hex.name}』(${hex.hex.reading})。${hex.hex.meaning} ${hex.changed ? `さらに変爻があり『${hex.changed.hex.num}. ${hex.changed.hex.name}』へと変化する流れが示されています。${hex.changed.hex.meaning}` : "今日は爻の変化なく、卦の意味を素直に受け止める日です。"}`,
  ];

  const keywords = theme.key;

  const affirmation = generateAffirmation(personalDay, tb.star);

  return { headline, subline, paragraphs, keywords, affirmation };
}

// パーソナルデイ×通変星の組合せ説明（短文）
function combineThemes(pDay: number, tb: TongbianStar): string {
  const map: Record<number, string> = {
    1: "新しい挑戦のエネルギーが、",
    2: "受容と協調のエネルギーが、",
    3: "創造と表現のエネルギーが、",
    4: "基盤づくりのエネルギーが、",
    5: "変化と自由のエネルギーが、",
    6: "愛と責任のエネルギーが、",
    7: "内省と探求のエネルギーが、",
    8: "達成と豊かさのエネルギーが、",
    9: "完了と手放しのエネルギーが、",
  };
  const tbAdvice: Record<TongbianStar, string> = {
    比肩: "自我主導のテーマと重なります。",
    劫財: "対人競争のテーマと交差します。",
    食神: "楽しみと創造のテーマを倍加させます。",
    傷官: "鋭い表現のテーマを強めます——言葉に注意。",
    偏財: "社交と金運のテーマを増幅します。",
    正財: "堅実な蓄積のテーマと共鳴します。",
    偏官: "決断と挑戦のテーマを際立たせます。",
    正官: "公的な責任と評価のテーマと結びつきます。",
    偏印: "独自の発想のテーマを呼び起こします。",
    印綬: "学びと庇護のテーマを引き寄せます。",
  };
  return `${map[pDay]}${tbAdvice[tb]}`;
}

function generateAffirmation(pDay: number, tb: TongbianStar): string {
  const map: Record<TongbianStar, string> = {
    比肩: "自分の道を、自分の歩幅で。",
    劫財: "競う相手は、昨日の自分。",
    食神: "楽しむことが、最強の戦略。",
    傷官: "鋭さは武器、しかし鞘も大切に。",
    偏財: "金は流れるもの、握りしめず循環させる。",
    正財: "今日の一歩が、明日の塔になる。",
    偏官: "決断こそ、リーダーの存在証明。",
    正官: "誠実は、最も長く続く成功。",
    偏印: "ふと閃いたものは、神様からのメモ。",
    印綬: "学ぶ姿勢が、人を惹きつける。",
  };
  return map[tb];
}

// ==================================================================
// 今日のキーパーソン（家族）への助言（既存を強化）
// ==================================================================

export function todayFamilyAdvice(personalDay: number): {
  spouse: string;
  child: string;
} {
  const spouseMap: Record<number, string> = {
    1: "今日のあなたは独立志向。妻には簡潔に意図を共有し、相手の領域を尊重する日。",
    2: "妻と深い対話を持つ最良の日。感謝の言葉を一つでも増やすと家全体の運が上がる。",
    3: "一緒に楽しい時間を作る日。外食・映画・旅の話など、明るい話題で結びつきを更新。",
    4: "家計や予定など、現実的な話を整える日。一緒に書類仕事や計画を進めると吉。",
    5: "ルーティンを少し変える日。新しいレストラン・コース・話題で関係に風を入れる。",
    6: "結婚の原点を思い出す日。妻の好きなものを思い出し、小さなギフトを。",
    7: "互いに一人時間を尊重する日。寄り添いすぎず、距離があるからこそ深まる愛も。",
    8: "妻の頑張りを正面から称える日。経済・家事・介護への感謝を言葉と行動で。",
    9: "古い不満や感情を手放す日。蒸し返さず、感謝で包み直すと関係が次の章に進む。",
  };
  const childMap: Record<number, string> = {
    1: "子の挑戦を後押しする日。指示より励ましの言葉で。",
    2: "子の話を最後まで聴く日。アドバイスは2割、共感を8割で。",
    3: "一緒に楽しむ日。趣味・ゲーム・冗談で笑いを共有。",
    4: "勉強や生活習慣を一緒に整える日。叱らず仕組みを作る。",
    5: "子の興味を広げる外出の日。新しい場所・経験を共有。",
    6: "親としての愛を行動で示す日。好きな食事・送迎・小さな贈り物を。",
    7: "子の内面を尊重する日。一人で考える時間を保証する。",
    8: "子の成長を本気で評価する日。具体的な努力を言葉で承認。",
    9: "親としての古い完璧主義を手放す日。不完全な親でも、十分に愛は伝わる。",
  };
  return { spouse: spouseMap[personalDay], child: childMap[personalDay] };
}
