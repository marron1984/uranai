// 動物占い (個性心理学・60キャラクター)
//
// 番号 = 生まれ日の六十干支番号 (甲子=1 … 癸亥=60)。
// 60キャラ対応表は 2026-06 にサブエージェント並列リサーチで収集
// (サチ活・unkoi・Marisol・pro-shinri・MAQUIA 等の複数ソースを突合)。
// [確] = 複数ソース一致 / それ以外は単一ソース由来 (信頼度は confidence に記録)。

import { dayGanzhi } from "@/lib/koyomi";

export type Animal12 =
  | "狼" | "こじか" | "猿" | "チータ" | "黒ひょう" | "ライオン"
  | "虎" | "たぬき" | "コアラ" | "ゾウ" | "ひつじ" | "ペガサス";

export type AnimalChar = {
  num: number;          // 1-60 (= 干支番号)
  ganzhi: string;
  animal: Animal12;
  name: string;         // キャラクター名
  confidence: "確" | "弱";
};

// 12 動物の基本性格 (個性心理学の一般的な特徴づけ)
export const ANIMAL_TRAITS: Record<Animal12, { group: "地球" | "月" | "太陽"; traits: string; love: string; work: string }> = {
  狼:       { group: "地球", traits: "一人の時間と空間を大切にする職人気質。独自のペースとこだわりを持ち、群れより単独行動を好む。", love: "束縛を嫌い、対等で自立した関係を望む。", work: "専門性を磨く仕事・一人で完結する作業で力を発揮。" },
  こじか:   { group: "月",   traits: "警戒心は強いが、心を許した相手には甘えん坊。平和主義で、安心できる環境の中でこそ才能が育つ。", love: "ゆっくり距離を縮める。信頼関係が何より大事。", work: "安定した環境・味方の多いチームで伸びる。" },
  猿:       { group: "地球", traits: "好奇心旺盛で器用、褒められて伸びるムードメーカー。短期集中の勝負強さと、場を明るくする天性のサービス精神。", love: "楽しさ重視。一緒に笑える相手と長続きする。", work: "テンポの速い実務・営業・企画で活躍。" },
  チータ:   { group: "太陽", traits: "瞬発力と行動力の塊。思い立ったら即行動、新しいものに誰より早く飛びつくハンター。諦めも早いが切替も早い。", love: "追いかける恋に燃える。駆け引きより直球。", work: "スピード勝負の立ち上げ・開拓フェーズに最強。" },
  黒ひょう: { group: "月",   traits: "スマートで新しいもの好き。プライドが高く、傷つきやすい繊細さを優雅さで包む。情報感度と美意識が高い。", love: "ロマンチスト。雑に扱われると静かに心が離れる。", work: "トレンドを扱う仕事・ブランディングで輝く。" },
  ライオン: { group: "太陽", traits: "百獣の王の風格。弱音を見せず、特別扱いに弱い。面倒見が良く、頼られると俄然張り切るリーダー。", love: "プライドを立ててくれる相手と安定する。", work: "裁量と敬意が与えられるポジションで本領発揮。" },
  虎:       { group: "地球", traits: "悠然とした親分肌。曲がったことが嫌いで、面倒見が良く、本音と建前を使い分けない。バランス感覚の人。", love: "対等で誠実な関係を好む。家族を大事にする。", work: "現場を束ねる管理職・経営で信頼を集める。" },
  たぬき:   { group: "地球", traits: "経験と実績を重んじる人情家。場の空気を和ませる天然の愛嬌があり、年長者に可愛がられる得な性分。", love: "安心感で結ばれる。古風で一途。", work: "伝統や信頼が物を言う業界・長期の関係構築で強い。" },
  コアラ:   { group: "月",   traits: "サービス精神と楽天性の人。長期的な視点と計算高さを併せ持ち、のんびり見えて実はちゃっかり者。休息が活力の源。", love: "居心地の良さが全て。一緒にくつろげる相手と。", work: "ホスピタリティ・企画・長期戦略で生きる。" },
  ゾウ:     { group: "太陽", traits: "コツコツ積み上げる努力の人。一度決めたら動じない芯の強さと、プロ意識の高さ。怒らせると一番怖い。", love: "ゆっくり深く愛するタイプ。誠実さで応える。", work: "専門職・職人・大きな組織の中核で大成。", },
  ひつじ:   { group: "月",   traits: "和を重んじる世話焼き。寂しがり屋で仲間意識が強く、相談されると断れない。客観的な視点と公平さを持つ。", love: "二人の時間と記念日を大切にする。", work: "調整役・人事・サポート職で欠かせない存在。" },
  ペガサス: { group: "太陽", traits: "自由奔放な天才肌。ノリと直感で生き、束縛されると魅力が消える。気分の波はあるが、ハマった時の爆発力は随一。", love: "自由を尊重してくれる相手とだけ続く。", work: "発想力を買われるクリエイティブ・変化の多い環境で輝く。" },
};

export const ANIMAL_CHARS: AnimalChar[] = [
  { num: 1,  ganzhi: "甲子", animal: "チータ",   name: "長距離ランナーのチーター", confidence: "確" },
  { num: 2,  ganzhi: "乙丑", animal: "たぬき",   name: "社交家のたぬき", confidence: "確" },
  { num: 3,  ganzhi: "丙寅", animal: "猿",       name: "落ち着きのない猿", confidence: "弱" },
  { num: 4,  ganzhi: "丁卯", animal: "コアラ",   name: "フットワークの軽い子守熊", confidence: "弱" },
  { num: 5,  ganzhi: "戊辰", animal: "黒ひょう", name: "面倒見のいい黒ひょう", confidence: "確" },
  { num: 6,  ganzhi: "己巳", animal: "虎",       name: "愛情あふれる虎", confidence: "弱" },
  { num: 7,  ganzhi: "庚午", animal: "チータ",   name: "全力疾走するチータ", confidence: "確" },
  { num: 8,  ganzhi: "辛未", animal: "たぬき",   name: "磨き上げられたたぬき", confidence: "確" },
  { num: 9,  ganzhi: "壬申", animal: "猿",       name: "大きな志をもった猿", confidence: "確" },
  { num: 10, ganzhi: "癸酉", animal: "コアラ",   name: "母性豊かな子守熊", confidence: "確" },
  { num: 11, ganzhi: "甲戌", animal: "こじか",   name: "正直なこじか", confidence: "確" },
  { num: 12, ganzhi: "乙亥", animal: "ゾウ",     name: "人気者のゾウ", confidence: "確" },
  { num: 13, ganzhi: "丙子", animal: "狼",       name: "ネアカの狼", confidence: "確" },
  { num: 14, ganzhi: "丁丑", animal: "ひつじ",   name: "協調性のないひつじ", confidence: "確" },
  { num: 15, ganzhi: "戊寅", animal: "猿",       name: "どっしりとした猿", confidence: "弱" },
  { num: 16, ganzhi: "己卯", animal: "コアラ",   name: "コアラの中のコアラ", confidence: "弱" },
  { num: 17, ganzhi: "庚辰", animal: "こじか",   name: "強い意志をもったこじか", confidence: "弱" },
  { num: 18, ganzhi: "辛巳", animal: "ゾウ",     name: "デリケートなゾウ", confidence: "弱" },
  { num: 19, ganzhi: "壬午", animal: "狼",       name: "放浪の狼", confidence: "弱" },
  { num: 20, ganzhi: "癸未", animal: "ひつじ",   name: "物静かなひつじ", confidence: "弱" },
  { num: 21, ganzhi: "甲申", animal: "ペガサス", name: "落ち着きのあるペガサス", confidence: "弱" },
  { num: 22, ganzhi: "乙酉", animal: "ペガサス", name: "強靭な翼をもつペガサス", confidence: "確" },
  { num: 23, ganzhi: "丙戌", animal: "ひつじ",   name: "無邪気なひつじ", confidence: "弱" },
  { num: 24, ganzhi: "丁亥", animal: "狼",       name: "クリエイティブな狼", confidence: "弱" },
  { num: 25, ganzhi: "戊子", animal: "狼",       name: "穏やかな狼", confidence: "弱" },
  { num: 26, ganzhi: "己丑", animal: "ひつじ",   name: "粘り強いひつじ", confidence: "弱" },
  { num: 27, ganzhi: "庚寅", animal: "ペガサス", name: "波乱に満ちたペガサス", confidence: "弱" },
  { num: 28, ganzhi: "辛卯", animal: "ペガサス", name: "優雅なペガサス", confidence: "弱" },
  { num: 29, ganzhi: "壬辰", animal: "ひつじ",   name: "チャレンジ精神旺盛なひつじ", confidence: "確" },
  { num: 30, ganzhi: "癸巳", animal: "狼",       name: "順応性のある狼", confidence: "弱" },
  { num: 31, ganzhi: "甲午", animal: "ゾウ",     name: "リーダーとなるゾウ", confidence: "弱" },
  { num: 32, ganzhi: "乙未", animal: "こじか",   name: "しっかり者のこじか", confidence: "弱" },
  { num: 33, ganzhi: "丙申", animal: "コアラ",   name: "活動的な子守熊", confidence: "弱" },
  { num: 34, ganzhi: "丁酉", animal: "猿",       name: "気分屋の猿", confidence: "弱" },
  { num: 35, ganzhi: "戊戌", animal: "ひつじ",   name: "頼られると嬉しいひつじ", confidence: "弱" },
  { num: 36, ganzhi: "己亥", animal: "狼",       name: "好感のもたれる狼", confidence: "弱" },
  { num: 37, ganzhi: "庚子", animal: "ゾウ",     name: "まっしぐらに突き進むゾウ", confidence: "弱" },
  { num: 38, ganzhi: "辛丑", animal: "こじか",   name: "華やかなこじか", confidence: "弱" },
  { num: 39, ganzhi: "壬寅", animal: "コアラ",   name: "夢とロマンの子守熊", confidence: "弱" },
  { num: 40, ganzhi: "癸卯", animal: "猿",       name: "尽くす猿", confidence: "弱" },
  { num: 41, ganzhi: "甲辰", animal: "たぬき",   name: "大器晩成のたぬき", confidence: "弱" },
  { num: 42, ganzhi: "乙巳", animal: "チータ",   name: "足腰の強いチータ", confidence: "弱" },
  { num: 43, ganzhi: "丙午", animal: "虎",       name: "動きまわる虎", confidence: "弱" },
  { num: 44, ganzhi: "丁未", animal: "黒ひょう", name: "情熱的な黒ひょう", confidence: "弱" },
  { num: 45, ganzhi: "戊申", animal: "コアラ",   name: "サービス精神旺盛な子守熊", confidence: "確" },
  { num: 46, ganzhi: "己酉", animal: "猿",       name: "守りの猿", confidence: "弱" },
  { num: 47, ganzhi: "庚戌", animal: "たぬき",   name: "人間味あふれるたぬき", confidence: "弱" },
  { num: 48, ganzhi: "辛亥", animal: "チータ",   name: "品格のあるチータ", confidence: "弱" },
  { num: 49, ganzhi: "壬子", animal: "虎",       name: "ゆったりとした悠然の虎", confidence: "弱" },
  { num: 50, ganzhi: "癸丑", animal: "黒ひょう", name: "落ち込みの激しい黒ひょう", confidence: "弱" },
  { num: 51, ganzhi: "甲寅", animal: "ライオン", name: "我が道を行くライオン", confidence: "確" },
  { num: 52, ganzhi: "乙卯", animal: "ライオン", name: "統率力のあるライオン", confidence: "確" },
  { num: 53, ganzhi: "丙辰", animal: "黒ひょう", name: "感情豊かな黒ひょう", confidence: "確" },
  { num: 54, ganzhi: "丁巳", animal: "虎",       name: "楽天的な虎", confidence: "弱" },
  { num: 55, ganzhi: "戊午", animal: "虎",       name: "パワフルな虎", confidence: "弱" },
  { num: 56, ganzhi: "己未", animal: "黒ひょう", name: "気どらない黒ひょう", confidence: "弱" },
  { num: 57, ganzhi: "庚申", animal: "ライオン", name: "感情的なライオン", confidence: "弱" },
  { num: 58, ganzhi: "辛酉", animal: "ライオン", name: "傷つきやすいライオン", confidence: "弱" },
  { num: 59, ganzhi: "壬戌", animal: "黒ひょう", name: "束縛を嫌う黒ひょう", confidence: "弱" },
  { num: 60, ganzhi: "癸亥", animal: "虎",       name: "慈悲深い虎", confidence: "弱" },
];

// 生年月日 → キャラクター
export function animalChar(birthIso: string): AnimalChar {
  const [y, m, d] = birthIso.split("-").map(Number);
  const g = dayGanzhi(new Date(Date.UTC(y, m - 1, d, 3))); // 正午 JST
  return ANIMAL_CHARS[g.index]; // index 0 = 甲子 = num 1
}

// 簡易相性: 同じ動物 > 同じグループ (地球/月/太陽) > 異グループ
export function animalCompat(a: AnimalChar, b: AnimalChar): { level: string; text: string } {
  if (a.num === b.num) return { level: "同キャラ", text: "60分の1の同キャラ同士。行動原理がそっくりで、言葉のいらない理解がある。" };
  if (a.animal === b.animal) return { level: "同動物", text: "同じ動物同士。基本の価値観が近く、互いの長所も短所も手に取るように分かる。" };
  const ga = ANIMAL_TRAITS[a.animal].group;
  const gb = ANIMAL_TRAITS[b.animal].group;
  if (ga === gb) return { level: `同グループ (${ga})`, text: "同じ志向グループ。物事の優先順位が似ていて、自然と歩調が合う。" };
  return { level: "異グループ", text: `${ga}グループと${gb}グループ。視点の違いが新鮮な刺激にも、すれ違いの種にもなる。違いを面白がるのが鍵。` };
}
