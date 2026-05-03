// 西洋占星術（簡易版）
// アルゴリズム: 太陽星座は黄道12宮を 30°ごとに区切ったもの。
// 厳密には太陽黄経で判定するが、MVPでは date ranges による近似を使用。

export type Zodiac = {
  key: string;
  name: string;
  en: string;
  symbol: string;
  element: "火" | "地" | "風" | "水";
  quality: "活動" | "不動" | "柔軟";
  ruler: string;
  traits: string[];
  description: string;
};

export const ZODIAC: Zodiac[] = [
  {
    key: "aries",
    name: "牡羊座",
    en: "Aries",
    symbol: "♈",
    element: "火",
    quality: "活動",
    ruler: "火星",
    traits: ["情熱的", "行動派", "リーダー気質"],
    description:
      "12星座の先頭。新しい扉を開く先駆者の星座。直感とスピードで動き、停滞を最も嫌います。",
  },
  {
    key: "taurus",
    name: "牡牛座",
    en: "Taurus",
    symbol: "♉",
    element: "地",
    quality: "不動",
    ruler: "金星",
    traits: ["堅実", "美意識", "粘り強さ"],
    description:
      "五感を大切にし、自分のペースを崩さない地の星座。豊かさと安定を引き寄せる才能の持ち主。",
  },
  {
    key: "gemini",
    name: "双子座",
    en: "Gemini",
    symbol: "♊",
    element: "風",
    quality: "柔軟",
    ruler: "水星",
    traits: ["知的好奇心", "コミュ力", "多才"],
    description:
      "情報と会話の星座。軽やかに二つの視点を行き来し、人と人を繋ぎます。",
  },
  {
    key: "cancer",
    name: "蟹座",
    en: "Cancer",
    symbol: "♋",
    element: "水",
    quality: "活動",
    ruler: "月",
    traits: ["共感力", "家庭的", "感受性"],
    description:
      "感情と記憶の星座。仲間や家族を守る力に長け、月のリズムで揺れる繊細さを持ちます。",
  },
  {
    key: "leo",
    name: "獅子座",
    en: "Leo",
    symbol: "♌",
    element: "火",
    quality: "不動",
    ruler: "太陽",
    traits: ["自尊心", "創造性", "華やかさ"],
    description:
      "舞台の中心が似合う太陽の星座。表現することで本領を発揮し、他者を照らします。",
  },
  {
    key: "virgo",
    name: "乙女座",
    en: "Virgo",
    symbol: "♍",
    element: "地",
    quality: "柔軟",
    ruler: "水星",
    traits: ["几帳面", "分析力", "奉仕の心"],
    description:
      "細部に神を見る星座。地に足のついた観察と改善で、周囲の質を底上げします。",
  },
  {
    key: "libra",
    name: "天秤座",
    en: "Libra",
    symbol: "♎",
    element: "風",
    quality: "活動",
    ruler: "金星",
    traits: ["バランス感覚", "社交性", "美の感覚"],
    description:
      "対人と調和の星座。常に重さを量り、関係性のなかで自分を磨いていきます。",
  },
  {
    key: "scorpio",
    name: "蠍座",
    en: "Scorpio",
    symbol: "♏",
    element: "水",
    quality: "不動",
    ruler: "冥王星",
    traits: ["洞察力", "情熱", "再生"],
    description:
      "深淵を覗く星座。一度決めたことに全身全霊を傾け、変容のなかで強くなります。",
  },
  {
    key: "sagittarius",
    name: "射手座",
    en: "Sagittarius",
    symbol: "♐",
    element: "火",
    quality: "柔軟",
    ruler: "木星",
    traits: ["自由", "理想", "冒険"],
    description:
      "矢を放つ哲学者の星座。遠くを見据え、未知の地平へ意味を求めて旅をします。",
  },
  {
    key: "capricorn",
    name: "山羊座",
    en: "Capricorn",
    symbol: "♑",
    element: "地",
    quality: "活動",
    ruler: "土星",
    traits: ["責任感", "忍耐", "戦略"],
    description:
      "頂を目指す星座。長期視野と規律で、確かな成果を積み上げていきます。",
  },
  {
    key: "aquarius",
    name: "水瓶座",
    en: "Aquarius",
    symbol: "♒",
    element: "風",
    quality: "不動",
    ruler: "天王星",
    traits: ["独創性", "博愛", "未来志向"],
    description:
      "革新と理想の星座。既存の枠を疑い、より良い未来をデザインします。",
  },
  {
    key: "pisces",
    name: "魚座",
    en: "Pisces",
    symbol: "♓",
    element: "水",
    quality: "柔軟",
    ruler: "海王星",
    traits: ["想像力", "優しさ", "直感"],
    description:
      "境界を溶かす星座。芸術や霊性に親和し、深い愛で世界とつながります。",
  },
];

// 太陽が各宮に入る日付（簡易版・年により1日前後ずれる）
const RANGES: { key: string; from: [number, number]; to: [number, number] }[] = [
  { key: "capricorn", from: [12, 22], to: [1, 19] },
  { key: "aquarius", from: [1, 20], to: [2, 18] },
  { key: "pisces", from: [2, 19], to: [3, 20] },
  { key: "aries", from: [3, 21], to: [4, 19] },
  { key: "taurus", from: [4, 20], to: [5, 20] },
  { key: "gemini", from: [5, 21], to: [6, 21] },
  { key: "cancer", from: [6, 22], to: [7, 22] },
  { key: "leo", from: [7, 23], to: [8, 22] },
  { key: "virgo", from: [8, 23], to: [9, 22] },
  { key: "libra", from: [9, 23], to: [10, 23] },
  { key: "scorpio", from: [10, 24], to: [11, 22] },
  { key: "sagittarius", from: [11, 23], to: [12, 21] },
];

export function getSunSign(month: number, day: number): Zodiac {
  for (const r of RANGES) {
    const [fm, fd] = r.from;
    const [tm, td] = r.to;
    if (fm === tm) {
      if (month === fm && day >= fd && day <= td) {
        return ZODIAC.find((z) => z.key === r.key)!;
      }
    } else if (fm < tm) {
      if (
        (month === fm && day >= fd) ||
        (month === tm && day <= td) ||
        (month > fm && month < tm)
      ) {
        return ZODIAC.find((z) => z.key === r.key)!;
      }
    } else {
      // 山羊座（年をまたぐ）
      if (
        (month === fm && day >= fd) ||
        (month === tm && day <= td) ||
        month > fm ||
        month < tm
      ) {
        return ZODIAC.find((z) => z.key === r.key)!;
      }
    }
  }
  return ZODIAC[0];
}

// 今日の運勢: 日付＋星座キーを seed にした疑似乱数で 1-5 のスコアと一言を生成
export type DailyFortune = {
  overall: number;
  love: number;
  work: number;
  money: number;
  message: string;
};

const MESSAGES = [
  "小さな一歩が大きな扉を開きます。",
  "周囲の声に耳を傾けると幸運が訪れます。",
  "直感を信じて行動するとき。",
  "焦らず、丁寧に過ごすと吉。",
  "新しい出会いに恵まれそうです。",
  "古いものを手放すと流れが変わります。",
  "言葉を選ぶことで運気が整います。",
  "金銭面は慎重に、見栄を張らないこと。",
  "学びの種をまくのに最適な日。",
  "大切な人へ感謝を伝えてみましょう。",
];

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function getDailyFortune(zodiacKey: string, date: Date): DailyFortune {
  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate() +
    zodiacKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRand(seed);
  const score = () => Math.floor(rand() * 5) + 1;
  return {
    overall: score(),
    love: score(),
    work: score(),
    money: score(),
    message: MESSAGES[Math.floor(rand() * MESSAGES.length)],
  };
}
