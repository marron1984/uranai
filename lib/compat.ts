// 相性鑑定: 西洋占星術（エレメント）+ 九星気学（五行）の総合判定

import { ZODIAC, type Zodiac } from "@/lib/astrology";
import { starRelation, STAR_NAME, type StarNumber } from "@/lib/kyusei";

export type ZodiacCompat = {
  score: number; // 1-5
  text: string;
};

const ELEM: Record<string, "火" | "地" | "風" | "水"> = {};
ZODIAC.forEach((z) => (ELEM[z.key] = z.element));

// 12星座の対向（180度）と三分（120度）グループ
const TRINE: string[][] = [
  ["aries", "leo", "sagittarius"],   // 火
  ["taurus", "virgo", "capricorn"],  // 地
  ["gemini", "libra", "aquarius"],   // 風
  ["cancer", "scorpio", "pisces"],   // 水
];
const OPPOSITE: Record<string, string> = {
  aries: "libra", taurus: "scorpio", gemini: "sagittarius",
  cancer: "capricorn", leo: "aquarius", virgo: "pisces",
  libra: "aries", scorpio: "taurus", sagittarius: "gemini",
  capricorn: "cancer", aquarius: "leo", pisces: "virgo",
};

export function zodiacCompat(a: string, b: string): ZodiacCompat {
  if (a === b) return { score: 4, text: "同じ星座。理解しやすいが似た弱点も共有しがち。" };
  if (OPPOSITE[a] === b) return { score: 4, text: "対向サイン。互いに惹かれ合い補完する関係。緊張感もスパイスに。" };
  for (const t of TRINE) {
    if (t.includes(a) && t.includes(b)) {
      return { score: 5, text: "同じエレメントの三分グループ。価値観が共鳴する最良の組合せ。" };
    }
  }
  // 隣接（30度）
  const idxA = ZODIAC.findIndex((z) => z.key === a);
  const idxB = ZODIAC.findIndex((z) => z.key === b);
  const diff = Math.abs(idxA - idxB);
  const cyclic = Math.min(diff, 12 - diff);
  if (cyclic === 1) return { score: 2, text: "隣接サイン。価値観が異なり距離感が必要。" };
  if (cyclic === 2) return { score: 4, text: "セクスタイル(60度)。協力し合いやすい良好な関係。" };
  if (cyclic === 3) return { score: 2, text: "スクエア(90度)。摩擦が多いが成長の刺激にもなる。" };
  if (cyclic === 5) return { score: 3, text: "クインカンクス(150度)。調整が必要だが学びは深い。" };
  return { score: 3, text: "中立的な相性。" };
}

export type FullCompat = {
  zodiac: { partner: Zodiac; compat: ZodiacCompat };
  star: {
    partner: number;
    name: string;
    relation: ReturnType<typeof starRelation>;
  };
  overallScore: number; // 1-5
  summary: string;
};

export function fullCompat(
  selfZodiac: Zodiac,
  selfStar: StarNumber,
  partnerZodiacKey: string,
  partnerStar: StarNumber
): FullCompat {
  const partnerZ = ZODIAC.find((z) => z.key === partnerZodiacKey)!;
  const zc = zodiacCompat(selfZodiac.key, partnerZodiacKey);
  const sr = starRelation(selfStar, partnerStar);
  const overall = Math.round((zc.score + sr.score) / 2);
  const summary =
    overall >= 5 ? "極めて良好。価値観・気質ともに支え合える関係。" :
    overall >= 4 ? "良好。違いを受け入れれば長く調和できる。" :
    overall >= 3 ? "中庸。相互理解の努力で十分良い関係に育つ。" :
    overall >= 2 ? "課題あり。距離感とコミュニケーションが鍵。" :
                    "刺激的だが摩擦が多い。意識的な歩み寄りが必要。";
  return {
    zodiac: { partner: partnerZ, compat: zc },
    star: { partner: partnerStar, name: STAR_NAME[partnerStar], relation: sr },
    overallScore: overall,
    summary,
  };
}
