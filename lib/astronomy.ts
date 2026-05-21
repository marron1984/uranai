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
export const SOLAR_TERM_VARIANTS: Record<string, string[]> = {
  立春: [
    "春の始まり。1年の幕開けで、東洋占術ではここが新しい暦の起点となる。種まきと再起動の節気で、新しい目標を立てる・新しい習慣を始めるのに最も追い風が吹くタイミング。",
    "氷の下で根が動き始める節気。表面はまだ寒くても、地中では新しい命が確実に動き出している。あなたの中の「これから始まること」が見えなくても、すでに動き始めていると信じて。",
  ],
  雨水: [
    "雪が雨に変わる時。固く凍っていたものが緩み、流れが戻る節気。停滞していた人間関係や仕事に、ふと変化のサインが現れやすい時期。",
    "天からの恵みが「水」というかたちで降りる時。乾いていた魂や疲れた身体に、ゆっくりと潤いが戻ってくる。無理せず、潤いを受け取ることに集中する2週間。",
  ],
  啓蟄: [
    "虫が冬眠から目覚める節気。眠っていたものが動き出す活性化の時で、長く保留にしていたプロジェクトを再開するのに好機。",
    "「あれ、忘れていたかも」と思っていた人やアイデアが、ふと連絡や閃きとして甦る2週間。冬の間に蓄えた力を、いよいよ表に出す時。",
  ],
  春分: [
    "昼夜が等しくなる節気。陰陽のバランスが取れる節目で、自分の中の「進めたいもの」と「止めたいもの」を等しく見直す絶好の機会。",
    "宇宙のレベルでリセットがかかる聖なる節気。1年の前半に向けて軸を立て直すなら、ここで瞑想・祈り・目標再確認を行うと運命が整いやすい。",
  ],
  清明: [
    "万物が清らかに輝く節気。身辺整理と清浄化の時で、部屋・書類・人間関係の埃を払うと運気が澄む。",
    "春の本格化と共に、心の奥にあるモヤモヤも浮上しやすい時期。「クリア」がキーワードで、向き合うべきことに正面から向き合うと光が射す。",
  ],
  穀雨: [
    "穀物を育てる雨が降る節気。育成と忍耐のフェーズで、播いた種を信じてじっくり育てる姿勢が運を呼ぶ。",
    "急がず焦らず、しかし諦めずに続ける2週間。今すぐ結果が出なくても、雨が大地に染み込むように、努力は確実にあなたの中に蓄積されている。",
  ],
  立夏: [
    "夏の始まり。エネルギーが上昇に転じ、外向きの活動・人脈拡大・新しいチャレンジに追い風が吹く節気。",
    "1年の中で陽のエネルギーが最も伸びていく時期の入口。冬の間温めた構想を、いよいよ外に出して試す季節へ。",
  ],
  小満: [
    "万物がやや満ちる節気。実りの兆しが見え始める時で、春に植えたものが「いける」と確信できる瞬間が訪れやすい。",
    "「まだ満ちきっていないが、もう8分目」のエネルギー。完璧を待たず、8割で発信・行動することが運を呼ぶ2週間。",
  ],
  芒種: [
    "種まきの最終期。今年の収穫への最後の準備の節気で、迷っていた決断をここで下すと後半に向けて軌道に乗る。",
    "「これが最後のチャンス」感が漂う節気。先延ばしにしていたことに、覚悟を決めて手をつけるタイミング。",
  ],
  夏至: [
    "陽の極み。最も日が長く、エネルギーが頂点に達する節気。人生の重要な決断・宣言・新規プロジェクトの始動に最大の追い風。",
    "宇宙のレベルで光が最大になる聖なる日。願いを言葉にして空に向かって放つと、宇宙が応えるエネルギー量が普段の倍以上になる。",
  ],
  小暑: [
    "暑さが本格化する節気。耐久と忍耐のフェーズで、夏バテに注意しながら粛々と進む。",
    "外のエネルギーは高いが、内側のクールさを保つことが大事な時期。瞑想・呼吸法・冷たい水で、熱に飲まれない自分を保つ。",
  ],
  大暑: [
    "最も暑い節気。動きを止めて充電する時期で、無理な前進よりも、休養と内省で次の収穫期に備える。",
    "土用の真っ盛り。胃腸を労り、身体の声を最優先に聞く2週間。「休む勇気」が長期的な成功を決める。",
  ],
  立秋: [
    "秋の気配が立つ節気。エネルギーが下降に転じ、収穫期へと切り替わる時。これまでの努力の「形」が見え始める。",
    "暑さの中にふと秋風を感じる節気。1年の後半に向けて、計画を立て直す静かな転換点。",
  ],
  処暑: [
    "暑さが収まる節気。落ち着きを取り戻す時で、夏に激しく動いた身体と心を整え直す。",
    "焦りが抜けて、冷静な判断が戻ってくる2週間。重要な人事・契約の見直しに最適。",
  ],
  白露: [
    "草に露が降りる節気。実りと深まりの時で、これまで積み上げてきたものが「結露」のように形になる。",
    "朝の空気が澄み始める節気。直感・閃き・霊感が普段より冴え、長年の謎が解ける瞬間が訪れる。",
  ],
  秋分: [
    "再び昼夜が等しくなる節気。陰へ転じる節目で、ここから半年は「内側を充実させる」フェーズに入る。",
    "1年の後半のリセット日。春分で立てた目標がどこまで進んだか、ここで冷静に総括し、後半の方針を立て直す。",
  ],
  寒露: [
    "冷たい露が降りる節気。本格的な秋、整理と総括の時で、不要なものを手放すと身体も心も軽くなる。",
    "夏の名残が完全に抜ける2週間。新しい服・新しい考え方への切り替えがスムーズに進むタイミング。",
  ],
  霜降: [
    "霜が降り始める節気。終わりへの準備の時で、1年の収穫を数え、感謝を捧げる時間を意識的に。",
    "土の上に白い結晶が宿る、神聖な時期。先祖供養や、自分のルーツに思いを馳せると、深い充足感が訪れる。",
  ],
  立冬: [
    "冬の始まり。蓄積と内省の季節へ移り、外向きの活動より、内側を深める時間に運気が宿る。",
    "枯葉が地面に還る節気。手放しと感謝の儀式を行うと、深い浄化が進む。読書・瞑想・温泉が吉。",
  ],
  小雪: [
    "わずかに雪が舞う節気。静けさへの導入で、騒がしさから距離を取り、自分の内側に戻る2週間。",
    "1年の振り返りを始めるベストタイミング。来年の方向性を、雪解けの春までに少しずつ描き始める。",
  ],
  大雪: [
    "雪が降り積もる節気。深い内省と充電の時で、無理に動かず、静かに次のサイクルへの種を温める。",
    "白い静寂が世界を包む節気。普段聞こえない内なる声がはっきり届く時期で、人生の大きな問いに向き合うと答えが降りる。",
  ],
  冬至: [
    "陰の極み。最も日が短く、しかしここから陽が戻り始める「新しい陽の始まり」の節気。1年の中で最も神聖な日の1つ。",
    "宇宙のレベルで「再生」が始まる日。次の1年への意図を、静かに紙に書き出すと、見えない力が動き始める。",
  ],
  小寒: [
    "寒さが本格化する節気。耐えて静かに春を待つ時で、表面の動きより、内なる確信を深める2週間。",
    "1年の最も静かな時期。新しい挑戦より、これまでの基盤を確認し直す内省フェーズ。",
  ],
  大寒: [
    "最も寒い節気。底を打って春への転換が始まる時で、「これ以上は下がらない」という確信が運命を変える。",
    "1年で最もエネルギーが内側にこもる時期。新しい年の地ならしが完了し、立春からの飛躍を待つだけ。",
  ],
};

export const SOLAR_TERM_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(SOLAR_TERM_VARIANTS).map(([k, v]) => [k, v[0]])
) as Record<string, string>;

export function solarTermText(term: string, date: Date = new Date()): string {
  const variants = SOLAR_TERM_VARIANTS[term];
  if (!variants) return SOLAR_TERM_TEXT[term] ?? "";
  const k = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return variants[k % variants.length];
}

// 月相のテーマ解説
export const MOON_PHASE_VARIANTS: Record<string, string[]> = {
  新月: [
    "新月は始まりのエネルギー。意図を立て、種をまくのに最適な日。願いを書き出すと宇宙が動き始め、約2週間かけて満月で結果が見える。",
    "宇宙がリセットを許してくれる日。過去を一旦脇に置き、「次の1ヶ月をどう生きるか」を3つだけ紙に書き出すと、見えない手が動き始める。",
  ],
  三日月: [
    "意図が芽吹き始める時。小さな一歩を踏み出して、形にしていく時期。新月で立てた目標の最初のアクションを起こすと、勢いがつく。",
    "希望の象徴。空に細い銀の弧が見える夜、自分の願いに微かな現実味を感じられる。焦らず、最初の小さな成果を喜ぶこと。",
  ],
  上弦の月: [
    "決断と前進の時。途中で投げ出さず、勢いに乗って進むことで運が動く。半月が空に立つ姿のように、覚悟を立てる節目。",
    "「やるか、やらないか」を問われる月相。曖昧さに耐えられなくなるエネルギーが宿るので、ここで明確に方向を選ぶことが、満月の結実に繋がる。",
  ],
  "十三夜（満ちゆく月）": [
    "成果に近づく充実期。最後の調整と集中で、満月の収穫に備える。あと一歩の踏ん張りが、結果の質を決める。",
    "「もうすぐ満ちる」予感が強まる夜。普段見ない月を、今日だけはバルコニーに出て眺めてみると、自分の中の「あと少し」が見えてくる。",
  ],
  満月: [
    "完成と収穫のエネルギー。1ヶ月前にまいた種が実る日。感謝と完了を意識し、結果を素直に受け取る器を整える。",
    "宇宙のレベルで「祝福」が降り注ぐ夜。月光浴・満月の水・満月の祈り — どんな小さな儀式でも、深く効く。感情が揺れやすいので、優しく自分を見守ること。",
  ],
  "十六夜（欠けゆく月）": [
    "手放しの始まり。不要なものを整理し、次のサイクルへ向けて空白を作る2週間の幕開け。",
    "「もう十分」と腹落ちさせる月相。満ちきった月が静かに欠け始める姿が、執着を解く優しいリマインダーになる。",
  ],
  下弦の月: [
    "再評価と方向修正の時。何が必要で何が不要か、冷静に見直す。半月が反対側に立つ姿のように、視点を切り替える節目。",
    "断捨離と整理の最適日。クローゼット・引き出し・人間関係 — どこか1ヶ所でも整えると、月のエネルギーが浄化を後押ししてくれる。",
  ],
  "晦月（みそかづき）": [
    "深い内省と休息の時。次の新月へ向けて、静かに準備する2-3日。情報を遮断し、内側に戻る勇気を。",
    "月が空からほぼ姿を消す時期。世界は静まり、自分の核と向き合う絶好のタイミング。眠る時間を多めに、夢のメッセージを書き留めると吉。",
  ],
  新月直前: [
    "サイクルの最終段階。すべてを手放し、新しい願いの直前の静寂。「無」になることが、次の「有」を生む。",
    "宇宙の呼吸が「吐く」から「吸う」に切り替わる聖なる夜。何もせず、ただ静かに座って自分を整えるだけで、運命の歯車が次に向かい始める。",
  ],
};

export const MOON_PHASE_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(MOON_PHASE_VARIANTS).map(([k, v]) => [k, v[0]])
) as Record<string, string>;

export function moonPhaseText(phase: string, date: Date = new Date()): string {
  const variants = MOON_PHASE_VARIANTS[phase];
  if (!variants) return MOON_PHASE_TEXT[phase] ?? "";
  const k = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return variants[k % variants.length];
}

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
