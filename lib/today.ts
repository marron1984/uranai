// 今日の占いを深く広く: パーソナルデイ・時間帯運・マントラ・注意事項・人間関係助言
// すべて生年月日と当日の組み合わせで決定論的に算出

import { OWNER } from "@/lib/owner";

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
