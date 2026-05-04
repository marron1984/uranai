// 天文計算: Meeus "Astronomical Algorithms" の簡易版
// 太陽黄経・月黄経・月相・24節気を高精度に算出

const DEG = Math.PI / 180;

function normalize360(x: number): number {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}

function sind(x: number): number { return Math.sin(x * DEG); }
function cosd(x: number): number { return Math.cos(x * DEG); }

// ユリウス通日（UT基準）
export function julianDay(date: Date): number {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D =
    date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let y = Y;
  let m = M;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    D +
    B -
    1524.5
  );
}

// 太陽の黄経（度・0-360）— Meeus Ch.25, 精度 ~0.01°
export function sunLongitude(date: Date): number {
  const JD = julianDay(date);
  const T = (JD - 2451545.0) / 36525;
  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sind(M) +
    (0.019993 - 0.000101 * T) * sind(2 * M) +
    0.000289 * sind(3 * M);
  return normalize360(L0 + C);
}

// 月の黄経（度・0-360）— ELP2000 簡易版、精度 ~0.5°
export function moonLongitude(date: Date): number {
  const JD = julianDay(date);
  const T = (JD - 2451545.0) / 36525;
  const L = normalize360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = normalize360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = normalize360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = normalize360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const F = normalize360(93.272095 + 483202.0175233 * T - 0.0036539 * T * T);

  const lon =
    L +
    6.289 * sind(Mp) -
    1.274 * sind(Mp - 2 * D) +
    0.658 * sind(2 * D) -
    0.214 * sind(2 * Mp) -
    0.186 * sind(M) -
    0.114 * sind(2 * F) +
    0.059 * sind(2 * Mp - 2 * D) +
    0.057 * sind(Mp + M - 2 * D) +
    0.053 * sind(Mp + 2 * D) +
    0.046 * sind(M - 2 * D) +
    0.041 * sind(Mp - M) -
    0.035 * sind(D) -
    0.031 * sind(Mp + M);

  return normalize360(lon);
}

// 月相: 0=新月, 0.25=上弦, 0.5=満月, 0.75=下弦
export function moonPhase(date: Date): {
  phase: number;
  name: string;
  emoji: string;
  age: number;
  illumination: number;
} {
  const sunLon = sunLongitude(date);
  const moonLon = moonLongitude(date);
  const diff = normalize360(moonLon - sunLon);
  const phase = diff / 360;
  const synodic = 29.530589;
  const age = phase * synodic;
  const illumination = (1 - cosd(diff)) / 2;

  let name: string, emoji: string;
  if (phase < 0.0357) { name = "新月"; emoji = "🌑"; }
  else if (phase < 0.2143) { name = "三日月"; emoji = "🌒"; }
  else if (phase < 0.2857) { name = "上弦の月"; emoji = "🌓"; }
  else if (phase < 0.4643) { name = "十三夜（満ちゆく月）"; emoji = "🌔"; }
  else if (phase < 0.5357) { name = "満月"; emoji = "🌕"; }
  else if (phase < 0.7143) { name = "十六夜（欠けゆく月）"; emoji = "🌖"; }
  else if (phase < 0.7857) { name = "下弦の月"; emoji = "🌗"; }
  else if (phase < 0.9643) { name = "晦月（みそかづき）"; emoji = "🌘"; }
  else { name = "新月直前"; emoji = "🌑"; }

  return { phase, name, emoji, age, illumination };
}

// 黄経から星座
const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;
const ZODIAC_NAMES = [
  "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座",
  "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座",
];

export function signFromLongitude(lon: number): {
  key: string;
  name: string;
  degree: number;
} {
  const idx = Math.floor(normalize360(lon) / 30);
  const deg = normalize360(lon) - idx * 30;
  return { key: ZODIAC_SIGNS[idx], name: ZODIAC_NAMES[idx], degree: deg };
}

export function accurateSunSign(date: Date) {
  return signFromLongitude(sunLongitude(date));
}

export function accurateMoonSign(date: Date) {
  return signFromLongitude(moonLongitude(date));
}

// 24節気
type SolarTerm = { lon: number; name: string; season: "spring" | "summer" | "autumn" | "winter"; isMain: boolean };
export const SOLAR_TERMS: SolarTerm[] = [
  { lon: 315, name: "立春", season: "spring", isMain: true },
  { lon: 330, name: "雨水", season: "spring", isMain: false },
  { lon: 345, name: "啓蟄", season: "spring", isMain: true },
  { lon: 0,   name: "春分", season: "spring", isMain: false },
  { lon: 15,  name: "清明", season: "spring", isMain: true },
  { lon: 30,  name: "穀雨", season: "spring", isMain: false },
  { lon: 45,  name: "立夏", season: "summer", isMain: true },
  { lon: 60,  name: "小満", season: "summer", isMain: false },
  { lon: 75,  name: "芒種", season: "summer", isMain: true },
  { lon: 90,  name: "夏至", season: "summer", isMain: false },
  { lon: 105, name: "小暑", season: "summer", isMain: true },
  { lon: 120, name: "大暑", season: "summer", isMain: false },
  { lon: 135, name: "立秋", season: "autumn", isMain: true },
  { lon: 150, name: "処暑", season: "autumn", isMain: false },
  { lon: 165, name: "白露", season: "autumn", isMain: true },
  { lon: 180, name: "秋分", season: "autumn", isMain: false },
  { lon: 195, name: "寒露", season: "autumn", isMain: true },
  { lon: 210, name: "霜降", season: "autumn", isMain: false },
  { lon: 225, name: "立冬", season: "winter", isMain: true },
  { lon: 240, name: "小雪", season: "winter", isMain: false },
  { lon: 255, name: "大雪", season: "winter", isMain: true },
  { lon: 270, name: "冬至", season: "winter", isMain: false },
  { lon: 285, name: "小寒", season: "winter", isMain: true },
  { lon: 300, name: "大寒", season: "winter", isMain: false },
];

// 太陽が指定黄経に達する時刻を二分法で算出
function findSolarTermDate(year: number, targetLon: number): Date {
  // 大まかな日（黄経 0=春分=80日目相当）
  const approxDay = ((normalize360(targetLon) + 285) % 360) / 360 * 365.2422 + 1;
  const approx = new Date(Date.UTC(year, 0, 1));
  approx.setUTCDate(Math.round(approxDay));
  if (approx.getUTCFullYear() !== year) {
    if (approx > new Date(Date.UTC(year, 11, 31))) approx.setUTCFullYear(year);
    if (approx < new Date(Date.UTC(year, 0, 1))) approx.setUTCFullYear(year);
  }

  let lo = new Date(approx);
  lo.setUTCDate(lo.getUTCDate() - 25);
  let hi = new Date(approx);
  hi.setUTCDate(hi.getUTCDate() + 25);

  for (let i = 0; i < 40; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const lon = sunLongitude(mid);
    let diff = lon - targetLon;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    if (diff < 0) lo = mid;
    else hi = mid;
  }
  return new Date((lo.getTime() + hi.getTime()) / 2);
}

export type SolarTermEntry = {
  term: string;
  date: Date;
  longitude: number;
  season: "spring" | "summer" | "autumn" | "winter";
  isMain: boolean;
};

export function solarTermsOfYear(year: number): SolarTermEntry[] {
  return SOLAR_TERMS.map((t) => ({
    term: t.name,
    longitude: t.lon,
    season: t.season,
    isMain: t.isMain,
    date: findSolarTermDate(year, t.lon),
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function currentSolarTerm(date: Date): {
  term: string;
  termDate: Date;
  daysSinceStart: number;
  nextTerm: string;
  nextTermDate: Date;
  daysUntilNext: number;
  season: string;
} {
  const year = date.getUTCFullYear();
  const terms = [
    ...solarTermsOfYear(year - 1),
    ...solarTermsOfYear(year),
    ...solarTermsOfYear(year + 1),
  ];
  let current = terms[0];
  let next = terms[1];
  for (let i = 0; i < terms.length - 1; i++) {
    if (terms[i].date.getTime() <= date.getTime() && date.getTime() < terms[i + 1].date.getTime()) {
      current = terms[i];
      next = terms[i + 1];
      break;
    }
  }
  const dayMs = 86400000;
  const daysSinceStart = Math.floor((date.getTime() - current.date.getTime()) / dayMs);
  const daysUntilNext = Math.ceil((next.date.getTime() - date.getTime()) / dayMs);
  return {
    term: current.term,
    termDate: current.date,
    daysSinceStart,
    nextTerm: next.term,
    nextTermDate: next.date,
    daysUntilNext,
    season: current.season,
  };
}

// 節気のテーマ解説
export const SOLAR_TERM_TEXT: Record<string, string> = {
  立春: "春の始まり。新しいサイクルの幕開け、種まきと再起動の節気。",
  雨水: "雪が雨に変わる時。固いものが緩み、流れが戻る。",
  啓蟄: "虫が冬眠から目覚める。眠っていたものが動き出す活性化の節気。",
  春分: "昼夜が等しくなる。陰陽のバランスが取れる節目。",
  清明: "万物が清らかに輝く。身辺整理と清浄化の時。",
  穀雨: "穀物を育てる雨。育成と忍耐の節気。",
  立夏: "夏の始まり。エネルギーが上昇に転じる。",
  小満: "万物がやや満ちる。実りの兆しが見え始める時。",
  芒種: "種まきの最終期。今年の収穫への最後の準備。",
  夏至: "陽の極み。最も日が長く、エネルギーが頂点。",
  小暑: "暑さが本格化。耐久と忍耐の節気。",
  大暑: "最も暑い時。動きを止めて充電する時期。",
  立秋: "秋の気配。収穫期への切り替え。",
  処暑: "暑さが収まる。落ち着きを取り戻す時。",
  白露: "草に露が降りる。実りと深まりの節気。",
  秋分: "再び昼夜が等しくなる。陰へ転じる節目。",
  寒露: "冷たい露。本格的な秋、整理と総括の時。",
  霜降: "霜が降り始める。終わりへの準備。",
  立冬: "冬の始まり。蓄積と内省の季節へ。",
  小雪: "わずかに雪が舞う。静けさへの導入。",
  大雪: "雪が降り積もる。深い内省と充電の時。",
  冬至: "陰の極み。最も日が短く、新しい陽の始まり。",
  小寒: "寒さが本格化。耐えて静かに春を待つ時。",
  大寒: "最も寒い時。底を打って春への転換が始まる。",
};

// 月相のテーマ解説
export const MOON_PHASE_TEXT: Record<string, string> = {
  新月: "新月は始まりのエネルギー。意図を立て、種をまくのに最適な日。願いを書き出すと宇宙が動く。",
  三日月: "意図が芽吹き始める時。小さな一歩を踏み出して、形にしていく時期。",
  上弦の月: "決断と前進の時。途中で投げ出さず、勢いに乗って進むことで運が動く。",
  "十三夜（満ちゆく月）": "成果に近づく充実期。最後の調整と集中で、満月の収穫に備える。",
  満月: "完成と収穫のエネルギー。1ヶ月前にまいた種が実る。感謝と完了を意識する日。",
  "十六夜（欠けゆく月）": "手放しの始まり。不要なものを整理し、次のサイクルへ向けて空白を作る。",
  下弦の月: "再評価と方向修正の時。何が必要で何が不要か、冷静に見直す。",
  "晦月（みそかづき）": "深い内省と休息の時。次の新月へ向けて、静かに準備する。",
  新月直前: "サイクルの最終段階。すべてを手放し、新しい願いの直前の静寂。",
};
