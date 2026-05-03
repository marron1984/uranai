// 易経
// アルゴリズム: コイン3枚法
//   各爻について 3 枚のコインを投げ、表=3 / 裏=2 を合計
//   合計値 → 6=老陰(変爻 ⚋→⚊), 7=少陽⚊, 8=少陰⚋, 9=老陽(変爻 ⚊→⚋)
//   下から6本の爻を立て、上卦/下卦から64卦を導く。
//   変爻があれば之卦（変化後の卦）も計算する。

// 三爻（八卦）のキー: 0=⚋⚋⚋(坤), 1=⚊⚋⚋(震), 2=⚋⚊⚋(坎), 3=⚊⚊⚋(兌)
//                   4=⚋⚋⚊(艮), 5=⚊⚋⚊(離), 6=⚋⚊⚊(巽), 7=⚊⚊⚊(乾)
// ※ 下から1ビット目=初爻、2ビット目=2爻、3ビット目=3爻（陽=1, 陰=0）

const TRIGRAMS = ["坤", "震", "坎", "兌", "艮", "離", "巽", "乾"];

// 64卦の伝統的順序 (King Wen) を [上卦index, 下卦index] で定義
// MVPでは卦名のみ。indexは下卦*8+上卦 で参照する索引表を持たせる。
// 卦の番号 1..64 と名前
type Hexagram = { num: number; name: string; reading: string; meaning: string };

// 下卦index (0..7) × 上卦index (0..7) → 卦番号
// 出典: 京房64卦排序 / 周易上経下経の順番
// 0=坤,1=震,2=坎,3=兌,4=艮,5=離,6=巽,7=乾
// テーブルは [下卦][上卦]
const KING_WEN_TABLE: number[][] = [
  // 下=坤(0)
  [2, 24, 7, 19, 15, 36, 46, 11],
  // 下=震(1)
  [16, 51, 40, 54, 62, 55, 32, 34],
  // 下=坎(2)
  [8, 3, 29, 60, 39, 63, 48, 5],
  // 下=兌(3)
  [45, 17, 47, 58, 31, 49, 28, 43],
  // 下=艮(4)
  [23, 27, 4, 41, 52, 22, 18, 26],
  // 下=離(5)
  [35, 21, 64, 38, 56, 30, 50, 14],
  // 下=巽(6)
  [20, 42, 59, 61, 53, 37, 57, 9],
  // 下=乾(7)
  [12, 25, 6, 10, 33, 13, 44, 1],
];

const HEXAGRAMS: Record<number, Hexagram> = {
  1: { num: 1, name: "乾為天", reading: "けんいてん", meaning: "純粋な創造の力。天の徳をもって積極的に進む時。" },
  2: { num: 2, name: "坤為地", reading: "こんいち", meaning: "受容と従順。柔順に従いつつ大きく育む時。" },
  3: { num: 3, name: "水雷屯", reading: "すいらいちゅん", meaning: "始まりの困難。慎重に基盤を築く時。" },
  4: { num: 4, name: "山水蒙", reading: "さんすいもう", meaning: "未熟。教えを請い学ぶことが吉。" },
  5: { num: 5, name: "水天需", reading: "すいてんじゅ", meaning: "待つ。機が熟すまで誠を保つ。" },
  6: { num: 6, name: "天水訟", reading: "てんすいしょう", meaning: "争い。和解を選ぶが吉。" },
  7: { num: 7, name: "地水師", reading: "ちすいし", meaning: "軍を率いる。規律と正義をもって動く時。" },
  8: { num: 8, name: "水地比", reading: "すいちひ", meaning: "親しみ助け合う。共に和すれば吉。" },
  9: { num: 9, name: "風天小畜", reading: "ふうてんしょうちく", meaning: "小さく蓄える。今は急がず力を養う時。" },
  10: { num: 10, name: "天澤履", reading: "てんたくり", meaning: "礼節を踏んで進む。慎重なら吉。" },
  11: { num: 11, name: "地天泰", reading: "ちてんたい", meaning: "陰陽和合の大吉。万事が通る時。" },
  12: { num: 12, name: "天地否", reading: "てんちひ", meaning: "塞がる。動かず守る時。" },
  13: { num: 13, name: "天火同人", reading: "てんかどうじん", meaning: "同志と志を共にする。協力で大きな成果。" },
  14: { num: 14, name: "火天大有", reading: "かてんたいゆう", meaning: "大いに有つ。豊かさを謙虚に分かつ時。" },
  15: { num: 15, name: "地山謙", reading: "ちざんけん", meaning: "謙虚さの徳。低く構えるほど大成する。" },
  16: { num: 16, name: "雷地豫", reading: "らいちよ", meaning: "喜び楽しむ。順応すれば吉。" },
  17: { num: 17, name: "澤雷随", reading: "たくらいずい", meaning: "随う。時流に従えば道が開ける。" },
  18: { num: 18, name: "山風蠱", reading: "さんぷうこ", meaning: "腐敗を改める。困難な仕事に取り組む時。" },
  19: { num: 19, name: "地澤臨", reading: "ちたくりん", meaning: "臨む。盛運に向かい進む時。" },
  20: { num: 20, name: "風地観", reading: "ふうちかん", meaning: "観る。静かに洞察し本質を捉える時。" },
  21: { num: 21, name: "火雷噬嗑", reading: "からいぜいごう", meaning: "噛み合わせる。障害を断ち切ると通る。" },
  22: { num: 22, name: "山火賁", reading: "さんかひ", meaning: "飾る。形を整えるが、内実を忘れぬよう。" },
  23: { num: 23, name: "山地剥", reading: "さんちはく", meaning: "剥がれ落ちる。動かず受け止める時。" },
  24: { num: 24, name: "地雷復", reading: "ちらいふく", meaning: "復る。陽が一つ戻る再出発の時。" },
  25: { num: 25, name: "天雷无妄", reading: "てんらいむぼう", meaning: "誠を尽くし作為せず。素直さが吉。" },
  26: { num: 26, name: "山天大畜", reading: "さんてんたいちく", meaning: "大いに蓄える。準備を尽くせば大成する。" },
  27: { num: 27, name: "山雷頤", reading: "さんらいい", meaning: "養う。言葉と食を慎んで自他を養う時。" },
  28: { num: 28, name: "澤風大過", reading: "たくふうたいか", meaning: "過ぎる。重荷に注意し原則に立ち返る時。" },
  29: { num: 29, name: "坎為水", reading: "かんいすい", meaning: "重なる険。誠をもって乗り越える時。" },
  30: { num: 30, name: "離為火", reading: "りいか", meaning: "明智の重ね。柔順を保てば大成。" },
  31: { num: 31, name: "澤山咸", reading: "たくざんかん", meaning: "感応。自然と心が通じ合う時。" },
  32: { num: 32, name: "雷風恒", reading: "らいふうこう", meaning: "恒久。続けることで道が定まる。" },
  33: { num: 33, name: "天山遯", reading: "てんざんとん", meaning: "退く。引いて身を保つ時。" },
  34: { num: 34, name: "雷天大壮", reading: "らいてんたいそう", meaning: "大いに壮ん。礼を守って進めば吉。" },
  35: { num: 35, name: "火地晋", reading: "かちしん", meaning: "進む。明らかに昇進する時。" },
  36: { num: 36, name: "地火明夷", reading: "ちかめいい", meaning: "明が傷つく。志を内に秘めて忍ぶ時。" },
  37: { num: 37, name: "風火家人", reading: "ふうかかじん", meaning: "家を整える。家庭と内側を治める時。" },
  38: { num: 38, name: "火澤睽", reading: "かたくけい", meaning: "そむく。違いを認め小事から和す。" },
  39: { num: 39, name: "水山蹇", reading: "すいざんけん", meaning: "難に遇う。引いて賢者に問う時。" },
  40: { num: 40, name: "雷水解", reading: "らいすいかい", meaning: "解く。困難が解け始める時。" },
  41: { num: 41, name: "山澤損", reading: "さんたくそん", meaning: "損して益あり。誠あれば道は開ける。" },
  42: { num: 42, name: "風雷益", reading: "ふうらいえき", meaning: "益。動けば利あり、進取の時。" },
  43: { num: 43, name: "澤天夬", reading: "たくてんかい", meaning: "決断。誠と公明をもって決する時。" },
  44: { num: 44, name: "天風姤", reading: "てんぷうこう", meaning: "出会う。誘惑に注意し慎む時。" },
  45: { num: 45, name: "澤地萃", reading: "たくちすい", meaning: "集まる。志を一にし大事を行う時。" },
  46: { num: 46, name: "地風升", reading: "ちふうしょう", meaning: "昇る。徐々に上昇する時。" },
  47: { num: 47, name: "澤水困", reading: "たくすいこん", meaning: "困しむ。誠を保てばやがて通る。" },
  48: { num: 48, name: "水風井", reading: "すいふうせい", meaning: "井戸。改めて整え養う時。" },
  49: { num: 49, name: "澤火革", reading: "たくかかく", meaning: "革まる。古きを改め新しくする時。" },
  50: { num: 50, name: "火風鼎", reading: "かふうてい", meaning: "鼎を据える。新しい体制を整える時。" },
  51: { num: 51, name: "震為雷", reading: "しんいらい", meaning: "雷の響き。驚きを慎んで動じぬ時。" },
  52: { num: 52, name: "艮為山", reading: "ごんいさん", meaning: "止まる。今は静かに自分を保つ時。" },
  53: { num: 53, name: "風山漸", reading: "ふうざんぜん", meaning: "漸進。順を追って進む時。" },
  54: { num: 54, name: "雷澤帰妹", reading: "らいたくきまい", meaning: "妹を嫁す。礼を欠くと災い。" },
  55: { num: 55, name: "雷火豊", reading: "らいかほう", meaning: "盛大。明と動が極まる絶頂期。" },
  56: { num: 56, name: "火山旅", reading: "かざんりょ", meaning: "旅。慎みをもって落ち着いて行う時。" },
  57: { num: 57, name: "巽為風", reading: "そんいふう", meaning: "順う風。柔順に従えば通じる。" },
  58: { num: 58, name: "兌為澤", reading: "だいたく", meaning: "悦び。和し合えば事が通る。" },
  59: { num: 59, name: "風水渙", reading: "ふうすいかん", meaning: "散る。固いものを解き散じる時。" },
  60: { num: 60, name: "水澤節", reading: "すいたくせつ", meaning: "節度。節すれば通じ、苦節は凶。" },
  61: { num: 61, name: "風澤中孚", reading: "ふうたくちゅうふ", meaning: "中の誠。誠あれば豚魚にも通じる。" },
  62: { num: 62, name: "雷山小過", reading: "らいざんしょうか", meaning: "小事に過ぎる。控えめが吉。" },
  63: { num: 63, name: "水火既済", reading: "すいかきせい", meaning: "既に済む。完成のち崩れに注意。" },
  64: { num: 64, name: "火水未済", reading: "かすいびせい", meaning: "未だ済まず。最後まで慎む時。" },
};

export type Yao = { value: 6 | 7 | 8 | 9; isYang: boolean; isChanging: boolean };

export function castYao(): Yao {
  // 3枚のコイン, 表=3, 裏=2
  let sum = 0;
  for (let i = 0; i < 3; i++) sum += Math.random() < 0.5 ? 2 : 3;
  const value = sum as 6 | 7 | 8 | 9;
  return {
    value,
    isYang: value === 7 || value === 9,
    isChanging: value === 6 || value === 9,
  };
}

export function castHexagram(): Yao[] {
  // 下から上へ 6 本
  return Array.from({ length: 6 }, () => castYao());
}

function trigramIndex(yaos: Yao[]): number {
  // yaos[0] = 初爻 (LSB)
  let idx = 0;
  for (let i = 0; i < 3; i++) if (yaos[i].isYang) idx |= 1 << i;
  return idx;
}

export function hexagramFromYaos(yaos: Yao[]): Hexagram {
  const lower = trigramIndex(yaos.slice(0, 3));
  const upper = trigramIndex(yaos.slice(3, 6));
  const num = KING_WEN_TABLE[lower][upper];
  return HEXAGRAMS[num];
}

export function changedHexagram(yaos: Yao[]): { yaos: Yao[]; hex: Hexagram } | null {
  if (!yaos.some((y) => y.isChanging)) return null;
  const newYaos: Yao[] = yaos.map((y) => {
    if (!y.isChanging) return y;
    return {
      value: y.isYang ? 8 : 7,
      isYang: !y.isYang,
      isChanging: false,
    };
  });
  return { yaos: newYaos, hex: hexagramFromYaos(newYaos) };
}

export function trigramName(yaos: Yao[], pos: "lower" | "upper"): string {
  const slice = pos === "lower" ? yaos.slice(0, 3) : yaos.slice(3, 6);
  return TRIGRAMS[trigramIndex(slice)];
}

// 変爻のポジション別メッセージ（爻位の一般則）
const LINE_POS_TEXT: Record<number, string> = {
  1: "初爻：物事の始まり。基礎を固め、軽率な動きを避ける段階。",
  2: "二爻：内側の中。柔順に・誠実に動くと通る位置。",
  3: "三爻：内卦の上。岐路。慎重さを欠くと危険。",
  4: "四爻：外卦の入口。表に立ち始める時。動機を確かめる。",
  5: "五爻：尊位（リーダーの位）。徳を持って治めれば大成する。",
  6: "上爻：物事の極み。引き際を読み、次に備える時。",
};

// 変爻位置（下から数えて 1-6）の解釈
export function changingLineMeanings(yaos: Yao[]): { pos: number; isYang: boolean; text: string }[] {
  const out: { pos: number; isYang: boolean; text: string }[] = [];
  yaos.forEach((y, i) => {
    if (y.isChanging) {
      out.push({
        pos: i + 1,
        isYang: y.isYang,
        text: LINE_POS_TEXT[i + 1],
      });
    }
  });
  return out;
}

export function yaoSymbol(y: Yao): string {
  if (y.value === 6) return "⚋ ×"; // 老陰（変）
  if (y.value === 9) return "⚊ ○"; // 老陽（変）
  if (y.value === 7) return "⚊";
  return "⚋";
}
