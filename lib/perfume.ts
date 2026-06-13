// 香水推薦エンジン
// 今日のエネルギー (パーソナルデイ) × 天気 × 時間帯 × 季節 から
// 所有香水の中で最も合う1〜2本を選定する。

import { OWNER } from "@/lib/owner";

type Perfume = (typeof OWNER.perfumes)[number];

export type WeatherTag = "sunny" | "cloudy" | "rainy" | "snow" | "fog" | "thunder" | "hot" | "cold";
export type TimeTag = "morning" | "afternoon" | "evening" | "night";
export type SeasonTag = "spring" | "summer" | "autumn" | "winter";

export function getSeason(month: number): SeasonTag {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function getTimeTag(hour: number): TimeTag {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// 気象コード（Open-Meteo / WMO）+ 気温から天気タグを決定
export function classifyWeather(weatherCode: number, tempC: number): WeatherTag[] {
  const tags: WeatherTag[] = [];
  if (weatherCode === 0) tags.push("sunny");
  if ([1, 2, 3].includes(weatherCode)) tags.push("cloudy");
  if ([45, 48].includes(weatherCode)) tags.push("fog");
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) tags.push("rainy");
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) tags.push("snow");
  if ([95, 96, 99].includes(weatherCode)) tags.push("thunder");
  if (tempC >= 28) tags.push("hot");
  if (tempC <= 8) tags.push("cold");
  return tags;
}

export type PerfumeMatch = {
  perfume: Perfume;
  score: number;
  reasons: string[];
};

// 決定論的な擬似乱数 (0〜1)。seed と文字列キーから安定したハッシュを生成。
// 同じ日 (seed) × 同じ香水 (id) なら常に同じ値 ─ サイトの「同じ日は同じ結果」方針を維持しつつ、
// 日替わりで分散させるための撹拌項に使う。
function seededUnit(seed: number, key: string): number {
  let h = (seed >>> 0) ^ 0x9e3779b9;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193) >>> 0;
  }
  // 追加で1ラウンド混ぜて分布を均す
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  return (h >>> 8) / 0x01000000; // 0〜1
}

export function recommendPerfumes(
  personalDay: number,
  weatherTags: WeatherTag[],
  timeTag: TimeTag,
  seasonTag: SeasonTag,
  topN = 2,
  seed = 0
): PerfumeMatch[] {
  const scored: (PerfumeMatch & { jitter: number; sortKey: number })[] = OWNER.perfumes.map((p) => {
    let score = 0;
    const reasons: string[] = [];

    // パーソナルデイ一致 (重み 5)
    if ((p.energyDays as readonly number[]).includes(personalDay)) {
      score += 5;
      reasons.push(`今日のパーソナルデイ${personalDay}と共鳴`);
    }

    // 天気一致 (重み 3 × タグ数)
    for (const w of weatherTags) {
      if ((p.weather as readonly string[]).includes(w)) {
        score += 3;
        reasons.push(`${weatherLabel(w)}の日に映える`);
      }
    }

    // 時間帯一致 (重み 2)
    if ((p.time as readonly string[]).includes(timeTag)) {
      score += 2;
      reasons.push(`${timeLabel(timeTag)}に最適な時間帯`);
    }

    // 季節一致 (重み 2)
    if ((p.season as readonly string[]).includes(seasonTag)) {
      score += 2;
      reasons.push(`${seasonLabel(seasonTag)}の季節感に合う`);
    }

    // 日替わりの撹拌項 (0〜3.5)。スコア差が同点〜僅差の香水を毎日ローテーションさせる。
    // 最大3.5 のため「真の高スコア (パーソナルデイ+5 等)」の優位は保ちつつ、
    // 横並びの候補群からは日ごとに違う1本が選ばれる。
    const jitter = seededUnit(seed, p.id) * 3.5;

    return { perfume: p, score, reasons, jitter, sortKey: score + jitter };
  });

  scored.sort((a, b) => b.sortKey - a.sortKey);

  // 1本目は最上位。2本目以降はできるだけ異なる香調 (family) を選び、
  // 似た系統ばかりが並ぶのを防いで分散を強める。
  const picked: typeof scored = [];
  const usedFamilies = new Set<string>();
  for (const cand of scored) {
    if (picked.length >= topN) break;
    const fam = (cand.perfume as { family?: string }).family ?? "";
    if (picked.length > 0 && usedFamilies.has(fam)) continue; // 同系統はいったんスキップ
    picked.push(cand);
    usedFamilies.add(fam);
  }
  // 異系統だけでは topN に満たない場合は、残りを sortKey 順で補充
  if (picked.length < topN) {
    for (const cand of scored) {
      if (picked.length >= topN) break;
      if (!picked.includes(cand)) picked.push(cand);
    }
  }

  return picked.map(({ perfume, score, reasons }) => ({ perfume, score, reasons }));
}

function weatherLabel(w: WeatherTag): string {
  const map: Record<WeatherTag, string> = {
    sunny: "晴れ", cloudy: "曇り", rainy: "雨", snow: "雪",
    fog: "霧", thunder: "雷雨", hot: "暑い", cold: "寒い",
  };
  return map[w];
}
function timeLabel(t: TimeTag): string {
  const map: Record<TimeTag, string> = {
    morning: "朝", afternoon: "昼", evening: "夕方", night: "夜",
  };
  return map[t];
}
function seasonLabel(s: SeasonTag): string {
  const map: Record<SeasonTag, string> = {
    spring: "春", summer: "夏", autumn: "秋", winter: "冬",
  };
  return map[s];
}
