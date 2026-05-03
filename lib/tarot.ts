// タロット
// アルゴリズム: 78枚のカード（大アルカナ22 + 小アルカナ56）から
// Fisher–Yates でシャッフルし、各カードに 50% で正逆位置を割り当てる。
// MVPでは大アルカナ22枚を意味データとして実装。

export type TarotCard = {
  num: number;
  name: string;
  en: string;
  upright: string;
  reversed: string;
  keywords: string[];
};

export const MAJOR_ARCANA: TarotCard[] = [
  { num: 0, name: "愚者", en: "The Fool", upright: "新たな旅立ち、可能性、自由。", reversed: "無謀、軽率、優柔不断。", keywords: ["始まり", "冒険"] },
  { num: 1, name: "魔術師", en: "The Magician", upright: "創造、意志、行動力。", reversed: "技量不足、口先だけ、優柔。", keywords: ["創造", "意志"] },
  { num: 2, name: "女教皇", en: "The High Priestess", upright: "直感、知性、内なる声。", reversed: "感情の不安定、秘密。", keywords: ["直感", "知恵"] },
  { num: 3, name: "女帝", en: "The Empress", upright: "豊かさ、母性、創造性。", reversed: "依存、浪費、停滞。", keywords: ["豊穣", "愛"] },
  { num: 4, name: "皇帝", en: "The Emperor", upright: "支配、責任、安定。", reversed: "横暴、頑固、未熟。", keywords: ["権威", "秩序"] },
  { num: 5, name: "教皇", en: "The Hierophant", upright: "伝統、教え、結婚。", reversed: "形式主義、束縛。", keywords: ["導き", "信頼"] },
  { num: 6, name: "恋人", en: "The Lovers", upright: "愛、結びつき、選択。", reversed: "不和、誘惑、別離。", keywords: ["愛", "選択"] },
  { num: 7, name: "戦車", en: "The Chariot", upright: "勝利、前進、自制。", reversed: "暴走、敗北、停滞。", keywords: ["前進", "勝利"] },
  { num: 8, name: "力", en: "Strength", upright: "勇気、忍耐、優しさ。", reversed: "弱気、自信喪失。", keywords: ["勇気", "克己"] },
  { num: 9, name: "隠者", en: "The Hermit", upright: "内省、探求、慎重。", reversed: "孤立、頑迷、迷い。", keywords: ["内省", "知恵"] },
  { num: 10, name: "運命の輪", en: "Wheel of Fortune", upright: "転機、好機、循環。", reversed: "悪い流れ、停滞。", keywords: ["転機", "運命"] },
  { num: 11, name: "正義", en: "Justice", upright: "公平、決断、真実。", reversed: "不公平、偏見。", keywords: ["公平", "判断"] },
  { num: 12, name: "吊るされた男", en: "The Hanged Man", upright: "犠牲、忍耐、視点の転換。", reversed: "停滞、徒労、執着。", keywords: ["忍耐", "転換"] },
  { num: 13, name: "死神", en: "Death", upright: "終わりと始まり、変容。", reversed: "停滞、変化への抵抗。", keywords: ["変容", "終焉"] },
  { num: 14, name: "節制", en: "Temperance", upright: "調和、節度、融合。", reversed: "不調和、浪費、衝突。", keywords: ["調和", "中庸"] },
  { num: 15, name: "悪魔", en: "The Devil", upright: "欲望、執着、束縛。", reversed: "解放、覚醒。", keywords: ["執着", "誘惑"] },
  { num: 16, name: "塔", en: "The Tower", upright: "崩壊、衝撃、解放。", reversed: "回避、内的崩壊。", keywords: ["崩壊", "覚醒"] },
  { num: 17, name: "星", en: "The Star", upright: "希望、霊感、癒し。", reversed: "失望、疲弊。", keywords: ["希望", "理想"] },
  { num: 18, name: "月", en: "The Moon", upright: "不安、無意識、幻想。", reversed: "不安の解消、真実の発見。", keywords: ["不安", "幻"] },
  { num: 19, name: "太陽", en: "The Sun", upright: "成功、喜び、生命力。", reversed: "停滞、虚しさ。", keywords: ["成功", "生命"] },
  { num: 20, name: "審判", en: "Judgement", upright: "復活、決断、再出発。", reversed: "後悔、停滞、誤判。", keywords: ["再生", "覚醒"] },
  { num: 21, name: "世界", en: "The World", upright: "完成、達成、統合。", reversed: "未完、停滞、不足。", keywords: ["完成", "統合"] },
];

export type DrawnCard = {
  num: number;
  name: string;
  en: string;
  keywords: string[];
  isReversed: boolean;
  meaning: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(n: number): DrawnCard[] {
  return shuffle(MAJOR_ARCANA)
    .slice(0, n)
    .map((c) => {
      const isReversed = Math.random() < 0.5;
      return {
        num: c.num,
        name: c.name,
        en: c.en,
        keywords: c.keywords,
        isReversed,
        meaning: isReversed ? c.reversed : c.upright,
      };
    });
}

export const SPREAD_LABELS = {
  one: ["今のあなた"],
  three: ["過去", "現在", "未来"],
} as const;

export type Spread = keyof typeof SPREAD_LABELS;
