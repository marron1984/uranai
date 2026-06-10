// マヤ暦 (Tzolkin / ツォルキン 260 日暦)
// アルゴリズム:
//   KIN = ((JDN - 基準JDN) mod 260) + 1
//   相関定数は GMT 584283 (Goodman-Martinez-Thompson)
//   KIN → 太陽の紋章 (20 種) = (KIN - 1) mod 20
//        銀河の音 (13 種)    = (KIN - 1) mod 13 + 1
//   ウェイブスペル = KIN が属する 13 日周期の起点の紋章
//   関係キン: ガイド / 反対 / 神秘 / 類似

// ====================================================================
// 20 の太陽の紋章
// ====================================================================
export type SolarSeal = {
  index: number;     // 0-19
  name: string;      // 赤い龍 など
  maya: string;      // IMIX など
  color: "赤" | "白" | "青" | "黄";
  keyword: string;   // キーワード 3 つ
  traits: string;    // 性格特性
};

export const SOLAR_SEALS: SolarSeal[] = [
  { index: 0, name: "赤い龍", maya: "IMIX", color: "赤", keyword: "誕生・育成・存在", traits: "母性的な生命力の根源。新しいものを生み出し育てる力に溢れ、家族や仲間を守る本能が強い。" },
  { index: 1, name: "白い風", maya: "IK", color: "白", keyword: "伝達・呼吸・精神", traits: "風のように言葉と精神を運ぶメッセンジャー。繊細な感受性と表現力で人の心に息を吹き込む。" },
  { index: 2, name: "青い夜", maya: "AKBAL", color: "青", keyword: "夢・直感・豊かさ", traits: "夢を現実化する力を持つ夜の住人。内なる世界が豊かで、直感とイメージ力で豊かさを引き寄せる。" },
  { index: 3, name: "黄色い種", maya: "KAN", color: "黄", keyword: "開花・気づき・目覚め", traits: "可能性の種を蒔き、開花の時を待てる人。納得するまで掘り下げる探求心と、人を目覚めさせる力。" },
  { index: 4, name: "赤い蛇", maya: "CHICCHAN", color: "赤", keyword: "生命力・情熱・本能", traits: "強烈な生命エネルギーと身体感覚の持ち主。情熱的で、本能の声に従う時に最大の力を発揮する。" },
  { index: 5, name: "白い世界の橋渡し", maya: "CIMI", color: "白", keyword: "橋渡し・手放し・機会", traits: "異なる世界を繋ぐ橋。手放すことで新しい機会を生み、人と人・此岸と彼岸を結ぶ役割を持つ。" },
  { index: 6, name: "青い手", maya: "MANIK", color: "青", keyword: "癒し・遂行・知る", traits: "手を通じて癒しと創造を行う人。体験から学び、手がけたことを完遂する職人的な力を持つ。" },
  { index: 7, name: "黄色い星", maya: "LAMAT", color: "黄", keyword: "美・調和・芸術", traits: "美と調和の体現者。洗練された感性で場を美しく整え、芸術的な輝きを放つ星。" },
  { index: 8, name: "赤い月", maya: "MULUC", color: "赤", keyword: "浄化・流れ・水", traits: "月の引力のように感情の流れを司る。浄化の力が強く、新しい流れを生み出す改革者。" },
  { index: 9, name: "白い犬", maya: "OC", color: "白", keyword: "忠誠・愛・家族", traits: "誠実で愛情深い忠義の人。家族や仲間への愛が行動原理で、信頼の絆を何より大切にする。" },
  { index: 10, name: "青い猿", maya: "CHUEN", color: "青", keyword: "遊び・魔術・ユーモア", traits: "遊び心の天才。ユーモアと創造性で場を変容させる魔術師。楽しんでいる時に奇跡を起こす。" },
  { index: 11, name: "黄色い人", maya: "EB", color: "黄", keyword: "自由意志・道・知恵", traits: "自分の道を自分で選ぶ自由人。経験から得た知恵で人に影響を与え、感化する力を持つ。" },
  { index: 12, name: "赤い空歩く人", maya: "BEN", color: "赤", keyword: "探求・成長・勇気", traits: "天と地を繋ぐ柱。境界を越えて探求し、人の成長を助ける教育者・ガイドの資質。" },
  { index: 13, name: "白い魔法使い", maya: "IX", color: "白", keyword: "魅惑・受容・永遠", traits: "時を超える魔法使い。ありのままを受容する力で人を魅了し、心を開かせる不思議な引力。" },
  { index: 14, name: "青い鷲", maya: "MEN", color: "青", keyword: "ビジョン・俯瞰・創造", traits: "高みから全体を見るビジョナリー。先見性と戦略眼で、人が見えないものを見る。" },
  { index: 15, name: "黄色い戦士", maya: "CIB", color: "黄", keyword: "知性・挑戦・問いかけ", traits: "恐れを知らぬ知性の戦士。困難に挑み、問い続けることで道を切り拓く。" },
  { index: 16, name: "赤い地球", maya: "CABAN", color: "赤", keyword: "シンクロ・舵取り・共時性", traits: "地球のリズムと共鳴する人。シンクロニシティを呼び込み、流れの舵取りが上手い。" },
  { index: 17, name: "白い鏡", maya: "ETZNAB", color: "白", keyword: "映し出す・秩序・果てしなさ", traits: "真実を映す鏡。曖昧さを嫌い、物事の本質を冷静に映し出す。秩序と美意識の人。" },
  { index: 18, name: "青い嵐", maya: "CAUAC", color: "青", keyword: "変容・エネルギー・再生", traits: "嵐のような変容のエネルギー。周囲を巻き込み変えていく強大な熱量と再生力を持つ。" },
  { index: 19, name: "黄色い太陽", maya: "AHAU", color: "黄", keyword: "完成・無条件の愛・照らす", traits: "存在そのものが太陽。無条件の愛で周囲を照らし、いるだけで場が明るくなる完成の紋章。" },
];

// ====================================================================
// 13 の銀河の音
// ====================================================================
export type GalacticTone = {
  num: number;       // 1-13
  name: string;      // 磁気 など
  keyword: string;
  meaning: string;
};

export const GALACTIC_TONES: GalacticTone[] = [
  { num: 1, name: "磁気", keyword: "目的・引き寄せ", meaning: "目的を定めて人やものを引き寄せる起点の音。一点集中で道が開ける。" },
  { num: 2, name: "月", keyword: "二極・挑戦", meaning: "対立や葛藤から学ぶ音。二者択一の場面で本質が磨かれる。" },
  { num: 3, name: "電気", keyword: "奉仕・活性", meaning: "人を結びつけ活性化する音。チームの触媒として輝く。" },
  { num: 4, name: "自己存在", keyword: "形・測定", meaning: "形を定め、地に足をつける音。計画と構造化の才。" },
  { num: 5, name: "倍音", keyword: "輝き・中心", meaning: "場の中心で力を集める音。リーダーシップと存在感。" },
  { num: 6, name: "律動", keyword: "平等・組織", meaning: "リズムを整え、バランスを取る音。マイペースこそ最強。" },
  { num: 7, name: "共振", keyword: "調律・チャネル", meaning: "見えないものと共振する音。直感とインスピレーションの受信機。" },
  { num: 8, name: "銀河", keyword: "調和・モデリング", meaning: "信念と行動を一致させる音。誠実さが信頼を呼ぶ。" },
  { num: 9, name: "太陽", keyword: "意図・脈動", meaning: "大きな意図を実現させる音。粘り強い完遂力。" },
  { num: 10, name: "惑星", keyword: "現出・仕上げ", meaning: "目に見える形に仕上げる音。プロデュースと完成の才。" },
  { num: 11, name: "スペクトル", keyword: "解放・溶解", meaning: "古いものを解き放つ音。手放しと変化の促進者。" },
  { num: 12, name: "水晶", keyword: "協力・普遍化", meaning: "人々の知恵を結集する音。会議と協働の場で輝く。" },
  { num: 13, name: "宇宙", keyword: "超越・持ちこたえ", meaning: "今に在りながら超越する音。最後までやり抜く忍耐と飛躍。" },
];

// ====================================================================
// KIN の算出
// ====================================================================

// ユリウス通日 (グレゴリオ暦・正午基準の整数 JDN)
function jdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export type KinResult = {
  kin: number;            // 1-260
  seal: SolarSeal;        // 太陽の紋章
  tone: GalacticTone;     // 銀河の音
  wavespell: SolarSeal;   // ウェイブスペル (13 日周期の起点紋章)
  guide: SolarSeal;       // ガイドキン
  antipode: SolarSeal;    // 反対キン (挑戦と拡張)
  occult: SolarSeal;      // 神秘キン (隠れた力)
  analog: SolarSeal;      // 類似キン (支え)
};

// GMT 584283 相関: 紀元 0.0.0.0.0 (4 Ahau 8 Cumku) = JDN 584283
// KIN 1 (IMIX, tone 1) からの通日: JDN 584283 は KIN 160 に当たることが知られている。
// 実用式: KIN = ((JDN + 5) mod 260) + 1  …検証用に既知日付で合わせる
//   2012-12-21 (JDN 2456283) = KIN 207 (青い水晶の手) が広く知られる基準。
//   (2456283 + X) mod 260 + 1 = 207 → X mod 260 = (206 - 2456283) mod 260
function kinNumber(year: number, month: number, day: number): number {
  const j = jdn(year, month, day);
  // 2012-12-21 = KIN 207 を基準とした offset
  const refJdn = jdn(2012, 12, 21);
  const refKin = 207;
  const kin = (((j - refJdn) + (refKin - 1)) % 260 + 260) % 260 + 1;
  return kin;
}

export function kinFromDate(birthIso: string): KinResult {
  const [y, m, d] = birthIso.split("-").map(Number);
  const kin = kinNumber(y, m, d);
  const sealIdx = (kin - 1) % 20;
  const toneNum = ((kin - 1) % 13) + 1;
  const seal = SOLAR_SEALS[sealIdx];
  const tone = GALACTIC_TONES[toneNum - 1];

  // ウェイブスペル: 13 日周期の起点 KIN の紋章
  const wsStartKin = kin - (toneNum - 1);
  const wsIdx = ((wsStartKin - 1) % 20 + 20) % 20;
  const wavespell = SOLAR_SEALS[wsIdx];

  // ガイドキン: 音によって決まる (1,6,11 → 自分自身 / 2,7,12 → +12 / 3,8,13 → +4 / 4,9 → +16 / 5,10 → +8)
  const guideOffset =
    toneNum === 1 || toneNum === 6 || toneNum === 11 ? 0 :
    toneNum === 2 || toneNum === 7 || toneNum === 12 ? 12 :
    toneNum === 3 || toneNum === 8 || toneNum === 13 ? 4 :
    toneNum === 4 || toneNum === 9 ? 16 : 8;
  const guide = SOLAR_SEALS[(sealIdx + guideOffset) % 20];

  // 反対キン: +10
  const antipode = SOLAR_SEALS[(sealIdx + 10) % 20];
  // 神秘キン: 紋章番号 (1-20) の和が 21 になる相手 → index の和が 19
  const occult = SOLAR_SEALS[(19 - sealIdx + 20) % 20];
  // 類似キン: 紋章番号の和が 19 になる相手 → index の和が 17
  const analog = SOLAR_SEALS[(17 - sealIdx + 20) % 20];

  return { kin, seal, tone, wavespell, guide, antipode, occult, analog };
}

export function todayKin(date: Date = new Date()): KinResult {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return kinFromDate(iso);
}

// ====================================================================
// 相性 (二人の KIN)
// ====================================================================
export function kinCompat(a: KinResult, b: KinResult): { level: "鏡" | "ガイド" | "神秘" | "類似" | "反対" | "同紋章" | "中立"; text: string } {
  if (a.seal.index === b.seal.index) {
    return { level: "同紋章", text: "同じ紋章同士。深く共鳴し、言葉が要らない理解がある。" };
  }
  if (a.guide.index === b.seal.index || b.guide.index === a.seal.index) {
    return { level: "ガイド", text: "ガイドキンの関係。人生の方向を示し合う導きの縁。" };
  }
  if (a.occult.index === b.seal.index) {
    return { level: "神秘", text: "神秘キンの関係。お互いの隠れた力を引き出す不思議な縁。" };
  }
  if (a.analog.index === b.seal.index) {
    return { level: "類似", text: "類似キンの関係。そばにいるだけで安心できる支え合いの縁。" };
  }
  if (a.antipode.index === b.seal.index) {
    return { level: "反対", text: "反対キンの関係。鏡のように課題を映し合い、成長させ合う刺激の縁。" };
  }
  return { level: "中立", text: "穏やかな中立の縁。役割の違いを尊重すれば良い関係に育つ。" };
}
