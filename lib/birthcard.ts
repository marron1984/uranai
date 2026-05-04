// タロット バースカード（11/2 システム）
// 生年月日の数字をすべて足し、22 を超えたら数字和でリダクト。
// その値を「パーソナリティカード」とし、さらに桁和で「ソウルカード」を導く。

import { MAJOR_ARCANA, type TarotCard } from "@/lib/tarot";

export type BirthCardResult = {
  personality: TarotCard;
  soul: TarotCard;
  hidden: TarotCard | null;
};

function digitSum(n: number): number {
  return String(n).split("").reduce((a, c) => a + Number(c), 0);
}

export function birthCards(birth: string): BirthCardResult {
  const sum = birth.replace(/[^0-9]/g, "").split("").reduce((a, c) => a + Number(c), 0);

  let personalityNum = sum;
  while (personalityNum > 22) personalityNum = digitSum(personalityNum);

  let soulNum = personalityNum;
  while (soulNum > 9) soulNum = digitSum(soulNum);

  let hiddenNum: number | null = null;
  if (personalityNum !== soulNum && personalityNum > 9) {
    // 隠れたカード（パーソナリティとソウルの差ではなく、もう一段リダクト時の中間値が無いケース）
    hiddenNum = null;
  }

  const find = (n: number) => MAJOR_ARCANA.find((c) => c.num === n)!;

  return {
    personality: find(personalityNum),
    soul: find(soulNum),
    hidden: hiddenNum !== null ? find(hiddenNum) : null,
  };
}

// 各バースカードの人生テーマ解説（簡易）
export const BIRTH_CARD_THEME: Record<number, string> = {
  0: "自由と冒険を生きる魂。常識から距離を置き、新しい地平を求める。",
  1: "意志と創造の人。アイデアを現実に変える力で道を切り拓く。",
  2: "直感と知恵の人。沈黙のなかで真実を見抜く感性を持つ。",
  3: "豊かさと愛の人。人を育て、場を温かくする才能。",
  4: "秩序と統率の人。責任ある立場で安定をもたらす。",
  5: "伝統と継承の人。学びを伝え、信頼の橋を架ける。",
  6: "愛と選択の人。関係性のなかで自分を完成させる。",
  7: "勝利と意志の人。目標に向かい強く前進する力。",
  8: "勇気と忍耐の人。柔らかさで強さをコントロールする。",
  9: "内省と探求の人。一人の時間で深みを得る。",
  10: "運命と循環の人。流れを読み、好機を掴む。",
  11: "公正と決断の人。バランスと原則で世界を整える。",
  12: "犠牲と転換の人。視点を変えることで新しい意味を見出す。",
  13: "終焉と再生の人。手放すことで本物を残す。",
  14: "調和と中庸の人。混ざり合いから新しいものを作る。",
  15: "欲望と解放の人。執着の正体を知り、自由を獲得する。",
  16: "崩壊と覚醒の人。古い殻を破って真に強くなる。",
  17: "希望と理想の人。導きの星として周囲を照らす。",
  18: "幻と内面の人。無意識の声を作品や知恵に変える。",
  19: "成功と歓びの人。明るさで人と未来を温める。",
  20: "再生と決断の人。過去を統合し新しい使命を歩む。",
  21: "完成と統合の人。多様な要素を一つに昇華する。",
};
