// 相手の生年月日から、吉田氏との相互相性を算出するサンプル
//
// 使い方:
//   npx tsx scripts/compat-with-yoshida.ts 1990-06-15 male yamada-taro
//
// 出力: 各軸スコア + 総合相性 + 解説

import { calcFourPillars, tongbianStar } from "@/lib/shichu";
import { honmeiStar } from "@/lib/kyusei";
import { lifePathNumber, birthdayNumber } from "@/lib/numerology";
import { birthCards } from "@/lib/birthcard";
import { calcKua } from "@/lib/fengshui";
import { accurateSunSign } from "@/lib/astronomy";
import { zodiacCompat } from "@/lib/compat";
import { starRelation } from "@/lib/kyusei";
import { branchInteraction } from "@/lib/businessCompat";
import { compatibility as mbtiCompat, type MbtiType } from "@/lib/mbti";
import { OWNER } from "@/lib/owner";

type Args = {
  birth: string;
  gender: "male" | "female";
  name?: string;
  mbti?: MbtiType;
};

function parseArgs(): Args {
  const a = process.argv.slice(2);
  if (a.length < 2) {
    console.error("usage: tsx scripts/compat-with-yoshida.ts YYYY-MM-DD male|female [name] [MBTI]");
    process.exit(1);
  }
  return { birth: a[0], gender: a[1] as "male" | "female", name: a[2], mbti: a[3] as MbtiType | undefined };
}

const args = parseArgs();
const [y, m, d] = args.birth.split("-").map(Number);
const pfp = calcFourPillars(y, m, d, null);
const partner = {
  name: args.name ?? "相手",
  birth: args.birth,
  dayStem: pfp.day.stem,
  yearBranch: pfp.year.branch,
  honmei: honmeiStar(y, m, d),
  kua: calcKua(y, m, d, args.gender),
  sunSign: accurateSunSign(new Date(Date.UTC(y, m - 1, d, 12))).key,
  lifePath: lifePathNumber(args.birth),
  birthday: birthdayNumber(args.birth),
  birthCards: birthCards(args.birth),
  mbti: args.mbti,
};

// ----- 軸ごとのスコア計算 -----
const yoshidaDayStem = "戊";
const yoshidaYearBranch = "子";
const yoshidaHonmei = 7 as 1|2|3|4|5|6|7|8|9;
const yoshidaSunSign = "taurus";
const yoshidaLifePath = 11;
const yoshidaMbti: MbtiType = "INFJ";

// 1) 通変星 (戊 → 相手の日干)
const tb = tongbianStar(yoshidaDayStem, partner.dayStem);
const tongbianScores: Record<string, number> = {
  印綬:5, 正官:5, 正財:4, 食神:4, 偏官:4, 偏財:4, 偏印:3, 比肩:3, 傷官:3, 劫財:2,
};

// 2) 年支関係
const branch = branchInteraction(yoshidaYearBranch, partner.yearBranch);

// 3) 九星
const star = starRelation(yoshidaHonmei, partner.honmei as 1|2|3|4|5|6|7|8|9);

// 4) 星座
const zodiac = zodiacCompat(yoshidaSunSign, partner.sunSign);

// 5) ライフパス相性 (簡易テーブル)
const lpScoreTable: Record<string, number> = {
  "1": 4, "2": 5, "3": 4, "4": 4, "5": 3, "6": 4, "7": 5, "8": 4, "9": 5, "11": 5, "22": 5, "33": 5,
};
const lpScore = lpScoreTable[String(partner.lifePath)] ?? 3;

// 6) MBTI (任意)
const mbti = partner.mbti ? mbtiCompat(yoshidaMbti, partner.mbti) : null;
const mbtiScore = mbti ? ({ best: 5, good: 4, neutral: 3, challenging: 2 } as Record<string, number>)[mbti.level] : null;

// ----- 重み付き総合 -----
const axes = [
  { name: "通変星 (戊→" + partner.dayStem + "=" + tb + ")", weight: 1.0, score: tongbianScores[tb] ?? 3 },
  { name: "年支 (子×" + partner.yearBranch + "=" + branch.type + ")", weight: 1.0, score: branch.score },
  { name: "九星 (7×" + partner.honmei + "=" + star.relation + ")", weight: 0.8, score: star.score },
  { name: "星座 (taurus×" + partner.sunSign + ")", weight: 0.6, score: zodiac.score },
  { name: "LP (11×" + partner.lifePath + ")", weight: 0.7, score: lpScore },
];
if (mbtiScore !== null) {
  axes.push({ name: "MBTI (INFJ×" + partner.mbti + "=" + mbti!.level + ")", weight: 0.8, score: mbtiScore });
}

const wSum = axes.reduce((a, x) => a + x.weight, 0);
const score = axes.reduce((a, x) => a + x.score * x.weight, 0) / wSum;
const overall = Math.round(score * 10) / 10;

// ----- 出力 -----
console.log("─".repeat(60));
console.log("  吉田駿成 × " + partner.name + " 相性鑑定");
console.log("─".repeat(60));
console.log("");
console.log("【相手プロファイル】");
console.log("  生年月日:", partner.birth);
console.log("  日干 / 年支:", partner.dayStem, "/", partner.yearBranch);
console.log("  九星本命:", partner.honmei);
console.log("  本命卦:", partner.kua);
console.log("  太陽星座:", partner.sunSign);
console.log("  ライフパス:", partner.lifePath);
console.log("  バースカード:", partner.birthCards.personality.name + " (" + partner.birthCards.personality.num + ") + " + partner.birthCards.soul.name + " (" + partner.birthCards.soul.num + ")");
if (partner.mbti) console.log("  MBTI:", partner.mbti);
console.log("");
console.log("【軸別スコア】");
for (const ax of axes) {
  const stars = "★".repeat(ax.score) + "☆".repeat(5 - ax.score);
  console.log("  " + stars + " (w=" + ax.weight + ")  " + ax.name);
}
console.log("");
console.log("  総合相性:", "★".repeat(Math.round(overall)) + "☆".repeat(5 - Math.round(overall)), `(${overall.toFixed(1)} / 5)`);
console.log("");
const tongbianDesc: Record<string, string> = {
  比肩: "対等な同志・切磋琢磨",
  劫財: "競合・出費に注意",
  食神: "穏やかな楽しみと豊かさの共有",
  傷官: "鋭知の交換・衝突も刺激も多い",
  偏財: "流動的な財・社交運",
  正財: "堅実な財・長期信頼",
  偏官: "決断と挑戦・修羅場の伴侶",
  正官: "規律と公正・組織パートナー",
  偏印: "独創とアイデアの交換",
  印綬: "学び・人徳・名誉を授ける師",
};
console.log("【一言】");
console.log("  通変星 " + tb + ":", tongbianDesc[tb]);
console.log("  年支 " + branch.type + ":", branch.text);
console.log("  九星:", star.text);
console.log("  星座:", zodiac.text);
if (mbti) console.log("  MBTI:", mbti.reason);
console.log("");
