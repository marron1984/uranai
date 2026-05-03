// 数秘術（ピタゴリアン）
// アルゴリズム:
//  - ライフパスナンバー = 生年月日の全数字を1桁になるまで足す
//  - 11, 22, 33 はマスターナンバーとして残す
//  - ソウルナンバー = 氏名（ローマ字）の母音を A=1, E=5, I=9, O=6, U=3, Y=7 で合計後リダクト
//  - パーソナリティナンバー = 子音を A=1, B=2, C=3 ... Z=26 を mod 9 でリダクト

export const LIFE_PATH_MEANINGS: Record<string, { title: string; text: string }> = {
  "1": { title: "リーダー", text: "独立心と開拓力。自分の道を切り拓く先頭打者。" },
  "2": { title: "調整役", text: "繊細さと協調性。誰かを支えることで輝きます。" },
  "3": { title: "表現者", text: "明るさとクリエイティブ。言葉と表現で人を癒します。" },
  "4": { title: "建設者", text: "堅実さと忍耐。基盤をつくり信頼を積み上げる人。" },
  "5": { title: "自由人", text: "好奇心と冒険心。変化を糧にして成長します。" },
  "6": { title: "愛の人", text: "責任感と奉仕。家族・仲間・コミュニティの守り手。" },
  "7": { title: "探求者", text: "知性と直感。一人で深く考える時間が力になる。" },
  "8": { title: "実現者", text: "野心と統率力。物事を大きくスケールさせる才能。" },
  "9": { title: "賢者", text: "博愛と理想。広い視野で世界に貢献します。" },
  "11": { title: "霊感のマスター", text: "鋭い直感とインスピレーション。導き手の素質。" },
  "22": { title: "建築のマスター", text: "理想を形にする力。大きな仕事を成す素質。" },
  "33": { title: "愛のマスター", text: "無条件の愛と奉仕で人々を照らす存在。" },
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const VOWEL_MAP: Record<string, number> = {
  A: 1,
  E: 5,
  I: 9,
  O: 6,
  U: 3,
  Y: 7,
};

function letterValue(ch: string): number {
  // ピタゴリアン: A=1..I=9, J=1..R=9, S=1..Z=8
  const code = ch.toUpperCase().charCodeAt(0) - 64;
  if (code < 1 || code > 26) return 0;
  return ((code - 1) % 9) + 1;
}

function reduceNumber(n: number, keepMaster = true): number {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n)
      .split("")
      .reduce((a, c) => a + Number(c), 0);
  }
  return n;
}

export function lifePathNumber(birth: string): number {
  // birth: "YYYY-MM-DD"
  const digits = birth.replace(/[^0-9]/g, "");
  const sum = digits.split("").reduce((a, c) => a + Number(c), 0);
  return reduceNumber(sum);
}

export function soulNumber(name: string): number {
  const sum = name
    .toUpperCase()
    .split("")
    .filter((c) => VOWELS.has(c) || c === "Y")
    .reduce((a, c) => a + (VOWEL_MAP[c] ?? 0), 0);
  return reduceNumber(sum);
}

export function personalityNumber(name: string): number {
  const sum = name
    .toUpperCase()
    .split("")
    .filter((c) => /[A-Z]/.test(c) && !VOWELS.has(c) && c !== "Y")
    .reduce((a, c) => a + letterValue(c), 0);
  return reduceNumber(sum);
}
