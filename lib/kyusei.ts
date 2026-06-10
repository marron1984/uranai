// 九星気学（Kyusei Kigaku / Nine Star Ki）
// アルゴリズム:
//  本命星 = 11 - (西暦の各桁を1桁になるまで足した値)（負/0なら +9 補正）
//  ※立春以前生まれは前年扱い（簡易: 2/4 を境界に固定）
//  月命星 = 本命星のグループ × 月（節入り）から月命星表で導出
//  五行: 一白=水 / 二黒=土 / 三碧=木 / 四緑=木 / 五黄=土 /
//        六白=金 / 七赤=金 / 八白=土 / 九紫=火

export type StarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const STAR_NAME: Record<StarNumber, string> = {
  1: "一白水星",
  2: "二黒土星",
  3: "三碧木星",
  4: "四緑木星",
  5: "五黄土星",
  6: "六白金星",
  7: "七赤金星",
  8: "八白土星",
  9: "九紫火星",
};

export const STAR_ELEMENT: Record<StarNumber, "水" | "土" | "木" | "金" | "火"> = {
  1: "水", 2: "土", 3: "木", 4: "木", 5: "土",
  6: "金", 7: "金", 8: "土", 9: "火",
};

export const STAR_DIRECTION: Record<StarNumber, string> = {
  1: "北", 2: "南西", 3: "東", 4: "東南",
  5: "中央", 6: "北西", 7: "西", 8: "東北", 9: "南",
};

export type StarDeep = {
  trait: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  career: string;
  fortune: string;       // 金運・健康運
  advice: string;
};

export const STAR_DEEP: Record<StarNumber, StarDeep> = {
  1: {
    trait: "柔軟・知性・水のような適応力を持つ星。一見穏やかで控えめだが、芯はとても強く、目立たぬところで深く考え続ける思索家。困難な状況でも姿を変えて流れを見出す才能を持ち、孤独な時間に最も深い知恵を得る。",
    strengths: ["適応力", "知性", "粘り強さ", "包容力", "直感"],
    weaknesses: ["優柔不断", "暗くなりやすい", "依存", "秘密主義", "内向きすぎる"],
    love: "深く長く愛するタイプ。相手の心の機微を察する繊細さで信頼関係を築く。短期の派手な恋愛よりも、時間をかけて深まる関係に向く。秘密を抱えやすいので、信頼できる相手にだけ本音を見せる。",
    career: "研究・コンサル・カウンセラー・水商売・流通・物流・教師など、知性と適応力が活きる仕事。一見地味だが本質を掴む仕事で頭角を現す。",
    fortune: "金運は地道に貯める堅実型。健康面では腎臓・耳・婦人科系・冷えに注意。",
    advice: "あなたの真価は静かな時間に育つ。焦って明るく振る舞う必要はない。深い水のように、信頼する人にだけ本心を見せていけば良い。",
  },
  2: {
    trait: "受容・忍耐・母性を象徴する星。地道な努力を惜しまない縁の下の力持ちで、柔らかな土のように人を受け入れ、育てる才能を持つ。表に立つよりサポート役で本領発揮するが、その存在なしでは何事も成り立たない欠かせない柱。",
    strengths: ["忍耐", "包容力", "誠実さ", "実務能力", "サポート力"],
    weaknesses: ["優柔不断", "心配性", "腰が重い", "自己主張不足", "犠牲精神"],
    love: "尽くす愛情、家庭的で真面目な関係を築く。長続きしやすく結婚向き。情熱的なロマンスより日常の穏やかさを大切にする。我慢しすぎて爆発する瞬間があるので、適度に本音を出す練習を。",
    career: "事務・経理・人事・教育・介護・農業・不動産・主婦業など、地味だが重要な役割で輝く。組織の屋台骨として欠かせない存在。",
    fortune: "金運は堅実な貯蓄型。コツコツ蓄えれば年齢とともに豊かに。健康面では消化器・胃腸・腰に注意。",
    advice: "あなたの献身は本物の宝。ただし犠牲ではなく選択として与えることで、エネルギーが枯渇せず続く。",
  },
  3: {
    trait: "進取・スピード・若々しさを象徴する星。雷のように一気に立ち上がる行動力と、新しいものを生み出す発信力を持つ。スタートダッシュの天才で、退屈と停滞を最も嫌う。エネルギーに満ちている時の輝きは圧倒的。",
    strengths: ["行動力", "発信力", "若々しさ", "情熱", "アイデア"],
    weaknesses: ["せっかち", "持続不足", "短気", "後先考えず", "気分屋"],
    love: "情熱的で電撃的な恋愛をする。冷めるのも早い場合があり、長続きには相手を尊重する成熟が必要。会話の刺激と共通の活動が関係を活気づける。",
    career: "営業・起業・メディア・IT・プロデューサー・スポーツ・音楽。ゼロから立ち上げる仕事に天命がある。組織のルーティンワークは苦手。",
    fortune: "金運は波があるが、一気に大きく稼ぐ可能性も。健康面では肝臓・神経系・足のケガに注意。",
    advice: "あなたの瞬発力は宝物。ただし全力疾走の後は必ず休息を。短距離走と長距離走を使い分けると本物の成果が積み上がる。",
  },
  4: {
    trait: "信用・調整・縁を象徴する星。風のように軽やかに人と人を結び、信頼で道を作る社交家。柔らかく見えて意外と頑固な一面もあり、約束と義理を大切にする情の深さを持つ。「縁」の星で、人間関係から運が開ける。",
    strengths: ["社交性", "調整力", "信用", "気配り", "情の深さ"],
    weaknesses: ["八方美人", "決断遅い", "迷い多い", "情に流される", "押しに弱い"],
    love: "穏やかで長く続く関係を求める。結婚運は良好で、家庭的な温かさを築く。優しいだけでなく決断する勇気も必要、「No」が言える成熟が関係の質を上げる。",
    career: "営業・接客・PR・人材・教育・旅行・流通など、人と人を繋ぐ仕事で輝く。ネットワークと信頼が最大の資産。",
    fortune: "金運は人脈経由で訪れるタイプ。コツコツ＋人縁。健康面では呼吸器・気管支・坐骨神経に注意。",
    advice: "あなたが信頼で繋いだ人脈は人生最大の財産。ただし全員を喜ばせようとせず、本当に大切な縁にエネルギーを集中することで本領発揮。",
  },
  5: {
    trait: "中央・帝王・破壊と再生を象徴する強力な星。良くも悪くも極端さを内包し、強烈な個性とカリスマで人を引きつける。傍観者ではいられない宿命を持ち、人生の大波を経験することで魂が磨かれる。",
    strengths: ["カリスマ性", "存在感", "決断力", "強運", "再生力"],
    weaknesses: ["独裁的", "極端", "破滅的", "強引", "孤独"],
    love: "熱烈で支配的な愛情。一度好きになると圧倒的なエネルギーで愛するが、コントロールしようとして衝突も多い。対等に渡り合える芯のある相手とでないと続かない。",
    career: "経営者・政治家・タレント・教祖・棟梁・改革者など、人の上に立つ仕事に天命がある。中庸では収まりきらない宿命。",
    fortune: "金運は波が大きい。大成功と大損失を経験することがある。健康面では成人病・心臓・腰に注意。",
    advice: "あなたは中央に立つ星。逃げても結局舞台に呼び戻される。覚悟を決めて、責任を引き受けたとき本物の力が発揮される。",
  },
  6: {
    trait: "完璧主義・指導者・天の徳を象徴する星。秩序と責任を大切にし、長期視野で物事を判断するリーダー気質。プライドが高く品格を保ち、ぶれない軸を持つ。年長者・権威者・社会的地位と縁が深く、組織で頂点まで登る素質。",
    strengths: ["責任感", "決断力", "品格", "戦略眼", "長期視野"],
    weaknesses: ["完璧主義", "頑固", "プライド過多", "感情を抑える", "孤高"],
    love: "誠実で責任ある愛情。プロポーズや結婚への決断は遅いが、決めれば一生大切にする。プライドが高いため、対等で尊敬できる相手を選ぶ。",
    career: "経営者・公務員・医師・士業・スポーツ指導者・宗教家など、責任と権威を伴う仕事で輝く。年齢とともに評価が上がる遅咲き型。",
    fortune: "金運は大器晩成型。地道な蓄積で晩年に大きく実る。健康面では頭部・心肺・骨に注意。",
    advice: "頂点を目指すあなたに必要なのは、頂上の景色を共有する仲間。一人で完璧を目指すより、不完全を許す優しさが本物のリーダーシップを完成させる。",
  },
  7: {
    trait: "社交・話術・楽しみを象徴する星。お金と楽しみを自然に引き寄せる華やかさを持ち、人を喜ばせる才能と話術が抜群。表面的な軽やかさの裏に、繊細な感受性と本物への目利きを秘めている。お金・恋愛・口コミがキーワード。",
    strengths: ["社交性", "話術", "金運", "美意識", "場を作る力"],
    weaknesses: ["浪費", "口先だけ", "色恋トラブル", "見栄", "飽きっぽい"],
    love: "華やかでドラマチックな恋愛が多い。話術と魅力で人を惹きつけるが、本気の関係には慎重さも必要。経済力と趣味の良さを共有できる相手と長続き。",
    career: "営業・芸能・接客・飲食・金融・ブランド・コンサルなど、口と魅力で稼ぐ仕事で輝く。お金と縁が深く、副業や投資にも適性。",
    fortune: "金運は良好。ただし入る分出るので管理が課題。健康面では口腔・歯・肺・呼吸器に注意。",
    advice: "あなたの華やかさは天賦の才。ただし浮ついた成功で満足せず、本物の価値を選ぶ目を養うと、軽やかさに芯が通る。",
  },
  8: {
    trait: "蓄積・継承・変化の節目を象徴する星。山のように動かない芯と、長期にわたって積み上げる粘り強さを持つ。家・財産・事業・伝統など、形あるものを継承し発展させる才能。変化の境目で活躍し、人生の節目で成長する。",
    strengths: ["蓄積力", "粘り強さ", "信頼性", "改革力", "継承力"],
    weaknesses: ["頑固", "保守的", "変化を嫌う", "計算高い", "自己中心"],
    love: "じっくり育てる愛情。結婚への決断は慎重だが、一度結ぶと家・家族を大切にする。家業や不動産など、形あるもので関係を支える傾向。",
    career: "不動産・建築・製造・継承業・銀行・行政・コンサル。形あるものを管理・発展させる仕事で輝く。",
    fortune: "金運は蓄財型で安定。不動産・資産形成に強い。健康面では関節・腰・背中に注意。",
    advice: "あなたは時間を味方につける星。短期的な成果に焦らず、10年単位で考えると本物の財が積み上がる。",
  },
  9: {
    trait: "華やかさ・知性・名声を象徴する星。光と影が際立つ表現者の星で、頭の回転が速く、美的センスに優れる。注目を浴びる才能と、人を見抜く鋭さを併せ持つ。芸術・学問・名誉と縁が深く、隠し事や曖昧さは苦手な明朗な性質。",
    strengths: ["知性", "美意識", "華やかさ", "情熱", "判断力"],
    weaknesses: ["短気", "気まぐれ", "見栄", "感情的", "白黒思考"],
    love: "情熱的で華やかな恋愛を好む。プライドが高く、見栄えと知性のある相手を選ぶ。感情の起伏が激しく、ドラマチックな展開になりやすい。",
    career: "芸術・学問・メディア・美容・ファッション・教育・占術など、知性と美と表現が問われる仕事で輝く。",
    fortune: "金運は華やかな分野で大きく稼ぐ可能性。一発当てるタイプ。健康面では目・心臓・血管に注意。",
    advice: "あなたの知性と美意識は本物。ただし他者を裁く鋭さは時に自分を傷つける刃。優しさで包む技術が、知性をより深いものにする。",
  },
};

// 後方互換のため STAR_TRAIT も残す（短文版）
export const STAR_TRAIT: Record<StarNumber, string> = {
  1: STAR_DEEP[1].trait,
  2: STAR_DEEP[2].trait,
  3: STAR_DEEP[3].trait,
  4: STAR_DEEP[4].trait,
  5: STAR_DEEP[5].trait,
  6: STAR_DEEP[6].trait,
  7: STAR_DEEP[7].trait,
  8: STAR_DEEP[8].trait,
  9: STAR_DEEP[9].trait,
};

export function honmeiStar(year: number, month: number, day: number): StarNumber {
  // 立春境界は年により 2/3〜2/5 に変動。Meeus 算出の実日付を優先 (フォールバック 2/4)
  let risshunDay = 4;
  try {
    const risshun = solarTermsOfYear(year).find((t) => t.longitude === 315);
    if (risshun) risshunDay = risshun.date.getUTCDate();
  } catch { /* fallback */ }
  const eff = month < 2 || (month === 2 && day < risshunDay) ? year - 1 : year;
  let s = 0;
  let y = eff;
  while (y > 0) {
    s += y % 10;
    y = Math.floor(y / 10);
  }
  while (s > 9) {
    let s2 = 0;
    while (s > 0) {
      s2 += s % 10;
      s = Math.floor(s / 10);
    }
    s = s2;
  }
  let h = 11 - s;
  if (h > 9) h -= 9;
  if (h < 1) h += 9;
  return h as StarNumber;
}

// 九星同士の五行関係（相生・比和・相剋）
export type FiveRelation = "相生(発展)" | "比和(調和)" | "相剋(摩擦)" | "洩気(消耗)" | "受剋(被害)";

export function starRelation(a: StarNumber, b: StarNumber): {
  relation: FiveRelation;
  score: number; // 1-5（5が最良）
  text: string;
} {
  const ea = STAR_ELEMENT[a];
  const eb = STAR_ELEMENT[b];
  const generates: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const controls: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
  if (ea === eb) {
    return { relation: "比和(調和)", score: 4, text: "同じ五行同士。安定して理解し合える関係。" };
  }
  if (generates[ea] === eb) {
    return { relation: "洩気(消耗)", score: 3, text: "あなたが相手を生む立場。気を与えるが疲れやすい。" };
  }
  if (generates[eb] === ea) {
    return { relation: "相生(発展)", score: 5, text: "相手があなたを生かしてくれる関係。発展的・吉。" };
  }
  if (controls[ea] === eb) {
    return { relation: "相剋(摩擦)", score: 2, text: "あなたが相手を抑える立場。指導は通るが圧迫しがち。" };
  }
  if (controls[eb] === ea) {
    return { relation: "受剋(被害)", score: 1, text: "相手から抑えられる立場。配慮と距離感が必要。" };
  }
  return { relation: "比和(調和)", score: 3, text: "中立的な関係。" };
}

// ============================================================
// 日盤九星 + 時盤九星
// ============================================================
// 冬至 → 夏至: 陽遁 (forward 1→2→...→9→1)
// 夏至 → 冬至: 陰遁 (backward 9→8→...→1→9)
//
// 三元甲子の正確な実装は複雑なので、簡易版を使用:
//   冬至 (or 夏至) を起点に「最も近い甲子の日」を九星=1 (陽遁) または 9 (陰遁) として
//   そこから日数で計算する
// 注: 厳密な三元判定 (上元・中元・下元) は省略しており、
//     180年周期内での近似値 (誤差数日以内)

import { solarTermsOfYear } from "@/lib/astronomy";

// 1984-05-02 を 戊申 (cycle 44) として、任意日のサイクル位置 (0=甲子)
function dayCycleIndex(date: Date): number {
  const baseUTC = Date.UTC(1984, 4, 2);
  const targetUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const days = Math.floor((targetUTC - baseUTC) / 86400000);
  return ((44 + days) % 60 + 60) % 60;
}

// 該当日の前の甲子日 (cycle index 0) を探し、そこからの経過日数を返す
function daysSinceLastKoshi(date: Date): number {
  const idx = dayCycleIndex(date);
  return idx;
}

// 「陽遁か陰遁か」 + 該当する起点（冬至・夏至近傍の甲子日）からの日数
function getKyuseiCycleInfo(date: Date): {
  isYouton: boolean;
  daysFromAnchor: number;
} {
  const year = date.getUTCFullYear();
  const ws = solarTermsOfYear(year).find((t) => t.term === "冬至")!.date;
  const wsPrev = solarTermsOfYear(year - 1).find((t) => t.term === "冬至")!.date;
  const ss = solarTermsOfYear(year).find((t) => t.term === "夏至")!.date;

  let nodeDate: Date;
  let isYouton: boolean;
  if (date.getTime() >= ws.getTime()) {
    nodeDate = ws;
    isYouton = true;
  } else if (date.getTime() >= ss.getTime()) {
    nodeDate = ss;
    isYouton = false;
  } else {
    nodeDate = wsPrev;
    isYouton = true;
  }

  // node 周辺で最も近い甲子日（cycle=0）を探す（±9日）
  let anchor = new Date(nodeDate);
  let bestDiff = Infinity;
  for (let off = -9; off <= 9; off++) {
    const d = new Date(nodeDate);
    d.setUTCDate(d.getUTCDate() + off);
    if (dayCycleIndex(d) === 0) {
      const diff = Math.abs(off);
      if (diff < bestDiff) {
        bestDiff = diff;
        anchor = d;
      }
    }
  }
  const daysFromAnchor = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate())) /
      86400000
  );
  return { isYouton, daysFromAnchor };
}

// 日盤九星 (1-9)
export function dailyKyuseiStar(date: Date = new Date()): StarNumber {
  const { isYouton, daysFromAnchor } = getKyuseiCycleInfo(date);
  let star: number;
  if (isYouton) {
    // 甲子=1, 翌日=2, ..., 9, 1, 2... (forward)
    star = ((daysFromAnchor % 9) + 9) % 9;
    if (star === 0) star = 9;
  } else {
    // 甲子=9, 翌日=8, ..., 1, 9, 8... (backward)
    const back = ((9 - (daysFromAnchor % 9) - 1 + 9) % 9) + 1;
    star = back;
  }
  return star as StarNumber;
}

// 時盤九星 (1-9) — 12時辰それぞれの中央星
// 陽遁: 子刻=日盤星, 進行
// 陰遁: 子刻=日盤星, 後退
// (簡易版: 厳密には日干グループで時刻起点が変わる)
export function hourlyKyuseiStar(date: Date = new Date()): StarNumber {
  const day = dailyKyuseiStar(date);
  const hour = date.getHours();
  // 時辰 index (子=0, 丑=1, ..., 亥=11)
  let hourIdx: number;
  if (hour >= 23 || hour < 1) hourIdx = 0;
  else hourIdx = Math.floor((hour + 1) / 2);

  const { isYouton } = getKyuseiCycleInfo(date);
  let star: number;
  if (isYouton) {
    star = (((day - 1 + hourIdx) % 9) + 9) % 9;
    if (star === 0) star = 9;
  } else {
    star = (((day - 1 - hourIdx) % 9) + 9) % 9;
    if (star === 0) star = 9;
  }
  return star as StarNumber;
}

// 月盤九星 (1-9)
export function monthlyKyuseiStar(year: number, month: number): StarNumber {
  // 年盤九星 (本命星と同じロジック)
  let s = 0;
  let y = year;
  while (y > 0) { s += y % 10; y = Math.floor(y / 10); }
  while (s > 9) { let s2 = 0; while (s > 0) { s2 += s % 10; s = Math.floor(s / 10); } s = s2; }
  let yearStar = 11 - s;
  if (yearStar > 9) yearStar -= 9;
  if (yearStar < 1) yearStar += 9;

  // 年盤グループ (1,4,7 / 2,5,8 / 3,6,9) で月起点が決まる
  // 簡易: 寅月 (2月節入り後) を起点に固定
  let monthOffset: number;
  if ([1, 4, 7].includes(yearStar)) monthOffset = 8;       // 寅月=八白
  else if ([2, 5, 8].includes(yearStar)) monthOffset = 5;  // 寅月=五黄
  else monthOffset = 2;                                     // 寅月=二黒 (3,6,9)
  // 月支 index: 寅=2, 卯=3, ..., 丑=1
  // 月から月支への変換 (簡易: 立春≒2/4 基準)
  const branchFromMonth = ((month - 2 + 12) % 12) || 12; // 1..12 (2月→1=寅, 3月→2=卯, ...)
  // 月盤は月支に応じて1ずつ後退 (陰遁)
  let star = monthOffset - (branchFromMonth - 1);
  star = ((star - 1) % 9 + 9) % 9 + 1;
  return star as StarNumber;
}
