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
  // 1月1日の太陽黄経は約 280°（冬至 12/22=270° の約10日後）
  // 太陽は1日に約 0.9856° 進む
  // 黄経 L の概算日数 = ((L - 280 + 360) mod 360) / 0.9856 + 1
  const approxDay =
    ((normalize360(targetLon) - 280 + 360) % 360) * (365.2422 / 360) + 1;
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

// ============================================================
// 恒星時・アセンダント・MC・惑星
// ============================================================

// グリニッジ平均恒星時 GMST (度)
export function gmst(date: Date): number {
  const JD = julianDay(date);
  const T = (JD - 2451545.0) / 36525;
  const g =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalize360(g);
}

// 局所恒星時 LST (度)
export function lst(date: Date, longitudeEast: number): number {
  return normalize360(gmst(date) + longitudeEast);
}

// 黄道傾斜角 ε (度)
export function obliquity(date: Date): number {
  const JD = julianDay(date);
  const T = (JD - 2451545.0) / 36525;
  return 23.4392911 - 0.0130042 * T - 0.0000001639 * T * T;
}

// アセンダント (黄経 度)
// 公式: tan(ASC) = cos(RAMC) / (-sin(RAMC)*cos(ε) - tan(φ)*sin(ε))
// atan2 の半周ずれを回避するため (y, x) を正符号側で渡す。
export function ascendant(date: Date, longitude: number, latitude: number): number {
  const lstDeg = lst(date, longitude);
  const eps = obliquity(date);
  const lstRad = lstDeg * DEG;
  const epsRad = eps * DEG;
  const latRad = latitude * DEG;
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
  return normalize360(Math.atan2(y, x) / DEG);
}

// MC（天頂）— 黄経 度
export function midheaven(date: Date, longitude: number): number {
  const lstDeg = lst(date, longitude);
  const eps = obliquity(date);
  const y = Math.sin(lstDeg * DEG);
  const x = Math.cos(lstDeg * DEG) * Math.cos(eps * DEG);
  return normalize360(Math.atan2(y, x) / DEG);
}

// ============================================================
// 惑星位置 (Schlyter's algorithm, 精度 ~0.1-1°)
// ============================================================

type OrbitalElements = {
  N: (d: number) => number; // 昇交点黄経
  i: (d: number) => number; // 軌道傾斜
  w: (d: number) => number; // 近日点引数
  a: (d: number) => number; // 半長径 (AU)
  e: (d: number) => number; // 離心率
  M: (d: number) => number; // 平均近点角
};

// epoch: JD 2451543.5 (1999/12/31 00:00 UT)
const PLANETS: Record<string, OrbitalElements> = {
  mercury: {
    N: (d) => 48.3313 + 3.24587e-5 * d,
    i: (d) => 7.0047 + 5.0e-8 * d,
    w: (d) => 29.1241 + 1.01444e-5 * d,
    a: () => 0.387098,
    e: (d) => 0.205635 + 5.59e-10 * d,
    M: (d) => 168.6562 + 4.0923344368 * d,
  },
  venus: {
    N: (d) => 76.6799 + 2.46590e-5 * d,
    i: (d) => 3.3946 + 2.75e-8 * d,
    w: (d) => 54.891 + 1.38374e-5 * d,
    a: () => 0.72333,
    e: (d) => 0.006773 - 1.302e-9 * d,
    M: (d) => 48.0052 + 1.6021302244 * d,
  },
  mars: {
    N: (d) => 49.5574 + 2.11081e-5 * d,
    i: (d) => 1.8497 - 1.78e-8 * d,
    w: (d) => 286.5016 + 2.92961e-5 * d,
    a: () => 1.523688,
    e: (d) => 0.093405 + 2.516e-9 * d,
    M: (d) => 18.6021 + 0.5240207766 * d,
  },
  jupiter: {
    N: (d) => 100.4542 + 2.76854e-5 * d,
    i: (d) => 1.303 - 1.557e-7 * d,
    w: (d) => 273.8777 + 1.64505e-5 * d,
    a: () => 5.20256,
    e: (d) => 0.048498 + 4.469e-9 * d,
    M: (d) => 19.895 + 0.0830853001 * d,
  },
  saturn: {
    N: (d) => 113.6634 + 2.3898e-5 * d,
    i: (d) => 2.4886 - 1.081e-7 * d,
    w: (d) => 339.3939 + 2.97661e-5 * d,
    a: () => 9.55475,
    e: (d) => 0.055546 - 9.499e-9 * d,
    M: (d) => 316.967 + 0.0334442282 * d,
  },
};

const PLANET_NAMES_JA: Record<string, string> = {
  mercury: "水星",
  venus: "金星",
  mars: "火星",
  jupiter: "木星",
  saturn: "土星",
};

// 太陽からの日数 (Schlyter epoch)
function daysSince19991231(date: Date): number {
  return julianDay(date) - 2451543.5;
}

// ケプラー方程式の数値解
function solveKepler(M_deg: number, e: number): number {
  let E = M_deg + (e * 180) / Math.PI * sind(M_deg) * (1 + e * cosd(M_deg));
  for (let iter = 0; iter < 6; iter++) {
    const dE = (E - (e * 180) / Math.PI * sind(E) - M_deg) / (1 - e * cosd(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

// 地球の太陽中心黄経 (= 太陽の地心黄経 + 180°)
function earthHelioLon(date: Date): number {
  return normalize360(sunLongitude(date) + 180);
}
function earthHelioDistance(date: Date): number {
  // 簡易: 1.0 AU (誤差 ~1.7%)
  const d = daysSince19991231(date);
  const T = d / 36525;
  const M = normalize360(357.52911 + 35999.05029 * T);
  return 1.000001018 * (1 - 0.0167 * cosd(M));
}

export type PlanetPosition = {
  name: string;
  longitude: number; // 地心黄経 (度)
  sign: string;       // 星座名
  degreeInSign: number;
  distance: number;   // 地球からの距離 (AU)
  retrograde: boolean; // 逆行か
};

export function planetPosition(name: keyof typeof PLANETS, date: Date): PlanetPosition {
  const el = PLANETS[name];
  const d = daysSince19991231(date);
  const N = normalize360(el.N(d));
  const i = el.i(d);
  const w = normalize360(el.w(d));
  const a = el.a(d);
  const e = el.e(d);
  const M = normalize360(el.M(d));

  // 太陽中心 (heliocentric) 位置
  const E = solveKepler(M, e);
  const xv = a * (cosd(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * sind(E);
  const v = normalize360((Math.atan2(yv, xv) * 180) / Math.PI);
  const r = Math.sqrt(xv * xv + yv * yv);
  const vw = v + w;
  const xh = r * (cosd(N) * cosd(vw) - sind(N) * sind(vw) * cosd(i));
  const yh = r * (sind(N) * cosd(vw) + cosd(N) * sind(vw) * cosd(i));
  const zh = r * sind(vw) * sind(i);

  // 地球の heliocentric 位置（地球は黄道面上、z=0）
  const earthLon = earthHelioLon(date);
  const R_earth = earthHelioDistance(date);
  const xe = R_earth * cosd(earthLon);
  const ye = R_earth * sind(earthLon);

  // 地心位置 (geocentric)
  const xg = xh - xe;
  const yg = yh - ye;
  const zg = zh;
  const distance = Math.sqrt(xg * xg + yg * yg + zg * zg);
  const lon = normalize360((Math.atan2(yg, xg) * 180) / Math.PI);

  // 逆行判定：1日後の地心黄経と比較
  const dt = 86400000;
  const d2 = daysSince19991231(new Date(date.getTime() + dt));
  const N2 = normalize360(el.N(d2));
  const i2 = el.i(d2);
  const w2 = normalize360(el.w(d2));
  const a2 = el.a(d2);
  const e2 = el.e(d2);
  const M2 = normalize360(el.M(d2));
  const E2 = solveKepler(M2, e2);
  const xv2 = a2 * (cosd(E2) - e2);
  const yv2 = a2 * Math.sqrt(1 - e2 * e2) * sind(E2);
  const v2 = normalize360((Math.atan2(yv2, xv2) * 180) / Math.PI);
  const r2 = Math.sqrt(xv2 * xv2 + yv2 * yv2);
  const vw2 = v2 + w2;
  const xh2 = r2 * (cosd(N2) * cosd(vw2) - sind(N2) * sind(vw2) * cosd(i2));
  const yh2 = r2 * (sind(N2) * cosd(vw2) + cosd(N2) * sind(vw2) * cosd(i2));
  const earthLon2 = earthHelioLon(new Date(date.getTime() + dt));
  const R_earth2 = earthHelioDistance(new Date(date.getTime() + dt));
  const xe2 = R_earth2 * cosd(earthLon2);
  const ye2 = R_earth2 * sind(earthLon2);
  const lon2 = normalize360(
    (Math.atan2(yh2 - ye2, xh2 - xe2) * 180) / Math.PI
  );
  let lonDiff = lon2 - lon;
  while (lonDiff > 180) lonDiff -= 360;
  while (lonDiff < -180) lonDiff += 360;
  const retrograde = lonDiff < 0;

  const sign = signFromLongitude(lon);
  return {
    name: PLANET_NAMES_JA[name],
    longitude: lon,
    sign: sign.name,
    degreeInSign: sign.degree,
    distance,
    retrograde,
  };
}

export type FullChart = {
  sun: { longitude: number; sign: string; degree: number };
  moon: { longitude: number; sign: string; degree: number };
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  asc: { longitude: number; sign: string; degree: number };
  mc: { longitude: number; sign: string; degree: number };
};

export function fullChart(date: Date, longitude: number, latitude: number): FullChart {
  const sun = signFromLongitude(sunLongitude(date));
  const moon = signFromLongitude(moonLongitude(date));
  const ascLon = ascendant(date, longitude, latitude);
  const ascSign = signFromLongitude(ascLon);
  const mcLon = midheaven(date, longitude);
  const mcSign = signFromLongitude(mcLon);
  return {
    sun: { longitude: sunLongitude(date), sign: sun.name, degree: sun.degree },
    moon: { longitude: moonLongitude(date), sign: moon.name, degree: moon.degree },
    mercury: planetPosition("mercury", date),
    venus: planetPosition("venus", date),
    mars: planetPosition("mars", date),
    jupiter: planetPosition("jupiter", date),
    saturn: planetPosition("saturn", date),
    asc: { longitude: ascLon, sign: ascSign.name, degree: ascSign.degree },
    mc: { longitude: mcLon, sign: mcSign.name, degree: mcSign.degree },
  };
}

// アスペクト計算（2惑星間の黄経差）
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition" | "none";
export const ASPECT_LABEL: Record<AspectType, string> = {
  conjunction: "コンジャンクション (0°)",
  sextile: "セクスタイル (60°)",
  square: "スクエア (90°)",
  trine: "トライン (120°)",
  opposition: "オポジション (180°)",
  none: "なし",
};

export function aspectBetween(lon1: number, lon2: number, orb: number = 6): {
  type: AspectType;
  angle: number;
  exactness: number; // |angle - target| (0が最も精密)
} {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  const targets: { type: AspectType; deg: number }[] = [
    { type: "conjunction", deg: 0 },
    { type: "sextile", deg: 60 },
    { type: "square", deg: 90 },
    { type: "trine", deg: 120 },
    { type: "opposition", deg: 180 },
  ];
  for (const t of targets) {
    const ex = Math.abs(diff - t.deg);
    if (ex <= orb) return { type: t.type, angle: diff, exactness: ex };
  }
  return { type: "none", angle: diff, exactness: 0 };
}
