// 任意の人物 × 吉田駿成 の相性算出 (UI とスクリプト両用)
// scripts/compat-with-yoshida.ts のロジックを共有ライブラリ化

import { calcFourPillars, tongbianStar, type TongbianStar } from "@/lib/shichu";
import { honmeiStar, starRelation, type StarNumber } from "@/lib/kyusei";
import { lifePathNumber, birthdayNumber } from "@/lib/numerology";
import { birthCards } from "@/lib/birthcard";
import { calcKua, KUA_NAMES } from "@/lib/fengshui";
import { accurateSunSign } from "@/lib/astronomy";
import { zodiacCompat } from "@/lib/compat";
import { branchInteraction } from "@/lib/businessCompat";
import { compatibility as mbtiCompatFn, MBTI_PROFILES, type MbtiType } from "@/lib/mbti";

// 吉田氏の確定キー
export const YOSHIDA_KEYS = {
  dayStem: "戊" as const,
  dayBranch: "申" as const,
  yearBranch: "子" as const,
  honmei: 7 as StarNumber,
  sunSign: "taurus" as const,
  lifePath: 11,
  kua: 6,
  mbti: "INFJ" as MbtiType,
  birthCardPersonality: 11,
  birthCardSoul: 2,
};

const tongbianScoreMap: Record<TongbianStar, number> = {
  印綬: 5, 正官: 5, 正財: 4, 食神: 4, 偏官: 4, 偏財: 4, 偏印: 3, 比肩: 3, 傷官: 3, 劫財: 2,
};

const tongbianDesc: Record<TongbianStar, string> = {
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

const lpScoreTable: Record<string, number> = {
  "1": 4, "2": 5, "3": 4, "4": 4, "5": 3, "6": 4,
  "7": 5, "8": 4, "9": 5, "11": 5, "22": 5, "33": 5,
};

const lpDescTable: Record<string, string> = {
  "1": "あなたが彼の独立志向を受け止める",
  "2": "11=2の上位・繊細さの共鳴で親密",
  "3": "霊感×表現・あなたの直感を彼が言葉に",
  "4": "理想×実務・現実家が地に下ろす",
  "5": "深さ×自由・リズム差はあるが学び",
  "6": "霊性×愛・二人で世界を癒す関係",
  "7": "二重の内省・霊性と知性で対話",
  "8": "理想×物質化・彼があなたの理想を世に出す",
  "9": "完了×開示・二人で時代を区切る",
  "11": "鏡 (マスター)・魂のレベルで対話できる稀有な相手",
  "22": "理想×実装・最強ペア",
  "33": "霊性×愛・全マスター数の組合せ",
};

// 本命卦の互換テーブル (吉田=6 乾)
const kuaCompatScore: Record<number, { score: number; desc: string }> = {
  1: { score: 2, desc: "東四 vs 西四・住環境が合わない" },
  2: { score: 5, desc: "同じ西四・延年関係" },
  3: { score: 2, desc: "東四 vs 西四・五鬼関係" },
  4: { score: 2, desc: "東四 vs 西四・禍害関係" },
  6: { score: 4, desc: "同じ乾・伏位・自然な調和" },
  7: { score: 5, desc: "同じ西四・生気関係 ◎" },
  8: { score: 5, desc: "同じ西四・天医関係" },
  9: { score: 2, desc: "東四 vs 西四・絶命関係 注意" },
};

export type PartnerInput = {
  name: string;
  birth: string;         // YYYY-MM-DD
  gender: "male" | "female";
  mbti?: MbtiType;
};

export type PartnerProfile = {
  name: string;
  birth: string;
  gender: "male" | "female";
  dayStem: string;
  yearBranch: string;
  honmei: StarNumber;
  kua: number;
  sunSign: string;
  sunSignName: string;
  lifePath: number;
  birthday: number;
  birthCardPersonality: number;
  birthCardPersonalityName: string;
  birthCardSoul: number;
  birthCardSoulName: string;
  mbti?: MbtiType;
};

export type Axis = {
  id: string;
  label: string;
  score: number;          // 1-5
  weight: number;         // 重み
  detail: string;         // 短い説明
  longDetail?: string;    // 長文説明 (任意)
};

export type CompatResult = {
  partner: PartnerProfile;
  axes: Axis[];
  weightedScore: number;  // 0-5 (小数)
  overall: number;        // 1-5 (整数)
  summary: string;
  narrative: string;      // 占術師目線の総評
};

export function buildPartnerProfile(input: PartnerInput): PartnerProfile {
  const [y, m, d] = input.birth.split("-").map(Number);
  const pfp = calcFourPillars(y, m, d, null);
  const sun = accurateSunSign(new Date(Date.UTC(y, m - 1, d, 12)));
  const bc = birthCards(input.birth);
  return {
    name: input.name || "相手",
    birth: input.birth,
    gender: input.gender,
    dayStem: pfp.day.stem,
    yearBranch: pfp.year.branch,
    honmei: honmeiStar(y, m, d) as StarNumber,
    kua: calcKua(y, m, d, input.gender),
    sunSign: sun.key,
    sunSignName: sun.name,
    lifePath: lifePathNumber(input.birth),
    birthday: birthdayNumber(input.birth),
    birthCardPersonality: bc.personality.num,
    birthCardPersonalityName: bc.personality.name,
    birthCardSoul: bc.soul.num,
    birthCardSoulName: bc.soul.name,
    mbti: input.mbti,
  };
}

function summaryFromScore(s: number): string {
  if (s >= 4.5) return "極めて良好。価値観・気質ともに支え合える稀有な関係";
  if (s >= 4.0) return "良好。違いを受け入れれば長く調和できる";
  if (s >= 3.5) return "やや良好。意識的な歩み寄りで深まる";
  if (s >= 3.0) return "中庸。相互理解の努力で十分良い関係に育つ";
  if (s >= 2.5) return "課題あり。距離感とコミュニケーションが鍵";
  if (s >= 2.0) return "刺激的だが摩擦が多い。意識的な歩み寄りが必要";
  return "学びの相性。違いを受け止める覚悟があれば人生の鏡になる";
}

export function calcCompat(input: PartnerInput): CompatResult {
  const partner = buildPartnerProfile(input);

  // 1) 通変星
  const tb = tongbianStar(YOSHIDA_KEYS.dayStem, partner.dayStem);

  // 2) 年支
  const branch = branchInteraction(YOSHIDA_KEYS.yearBranch, partner.yearBranch);

  // 3) 九星
  const star = starRelation(YOSHIDA_KEYS.honmei, partner.honmei);

  // 4) 星座
  const zodiac = zodiacCompat(YOSHIDA_KEYS.sunSign, partner.sunSign);

  // 5) ライフパス
  const lpKey = String(partner.lifePath);
  const lpScore = lpScoreTable[lpKey] ?? 3;
  const lpDesc = lpDescTable[lpKey] ?? "中立的な相性";

  // 6) 本命卦
  const kuaC = kuaCompatScore[partner.kua] ?? { score: 3, desc: "中立" };

  // 7) MBTI
  let mbtiLevel: ReturnType<typeof mbtiCompatFn> | null = null;
  let mbtiScore: number | null = null;
  if (partner.mbti) {
    mbtiLevel = mbtiCompatFn(YOSHIDA_KEYS.mbti, partner.mbti);
    mbtiScore = ({ best: 5, good: 4, neutral: 3, challenging: 2 } as Record<string, number>)[mbtiLevel.level];
  }

  const axes: Axis[] = [
    {
      id: "tongbian",
      label: `通変星 (戊→${partner.dayStem}=${tb})`,
      score: tongbianScoreMap[tb] ?? 3,
      weight: 1.0,
      detail: tongbianDesc[tb],
    },
    {
      id: "branch",
      label: `年支 (子×${partner.yearBranch}=${branch.type})`,
      score: branch.score,
      weight: 1.0,
      detail: branch.text,
    },
    {
      id: "kyusei",
      label: `九星 (7×${partner.honmei}=${star.relation})`,
      score: star.score,
      weight: 0.8,
      detail: star.text,
    },
    {
      id: "zodiac",
      label: `星座 (牡牛×${partner.sunSignName})`,
      score: zodiac.score,
      weight: 0.6,
      detail: zodiac.text,
    },
    {
      id: "lifepath",
      label: `LP (11×${partner.lifePath})`,
      score: lpScore,
      weight: 0.7,
      detail: lpDesc,
    },
    {
      id: "kua",
      label: `本命卦 (6×${partner.kua})`,
      score: kuaC.score,
      weight: 0.5,
      detail: kuaC.desc,
    },
  ];

  if (partner.mbti && mbtiLevel && mbtiScore !== null) {
    axes.push({
      id: "mbti",
      label: `MBTI (INFJ×${partner.mbti}=${mbtiLevel.level})`,
      score: mbtiScore,
      weight: 0.8,
      detail: mbtiLevel.reason,
    });
  }

  const wSum = axes.reduce((a, x) => a + x.weight, 0);
  const weightedScore = axes.reduce((a, x) => a + x.score * x.weight, 0) / wSum;
  const overall = Math.round(weightedScore);
  const summary = summaryFromScore(weightedScore);

  // narrative: 一番強いポジティブ軸と最大の課題軸を抽出して語る
  const sorted = [...axes].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const narrative =
    `${partner.name} さんとの最大の強みは「${best.label}」。${best.detail}。` +
    `一方で意識的に整える必要があるのは「${worst.label}」で、${worst.detail}。` +
    `総合的に見ると ${summary.replace(/。$/, "")}な関係性です。`;

  return {
    partner,
    axes,
    weightedScore: Math.round(weightedScore * 100) / 100,
    overall,
    summary,
    narrative,
  };
}

// MBTI 推測 (任意・本気で当てるのは難しいが大まかな目安)
// ライフパス + 星座 + 太陽星座のエレメントから推定
export function guessMbti(profile: PartnerProfile): MbtiType {
  // ざっくり: 火/風 → E 傾向, 地/水 → I 傾向
  // 直感系 LP (3/5/7/9/11/22) → N, 実務系 (1/2/4/6/8) → S
  // 火 + マスター数 → ENFP, 地 + 4 → ISTJ など
  const fireAir = ["aries", "leo", "sagittarius", "gemini", "libra", "aquarius"];
  const isE = fireAir.includes(profile.sunSign);
  const isN = [3, 5, 7, 9, 11, 22, 33].includes(profile.lifePath);
  const isF = ["cancer", "pisces", "scorpio", "taurus", "libra"].includes(profile.sunSign);
  const isP = [3, 5, 7].includes(profile.lifePath);
  const type = (isE ? "E" : "I") + (isN ? "N" : "S") + (isF ? "F" : "T") + (isP ? "P" : "J");
  return type as MbtiType;
}
