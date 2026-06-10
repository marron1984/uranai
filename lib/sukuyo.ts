// 宿曜占星術 (Sukuyō / 27宿)
// アルゴリズム:
//   出生時の月の恒星黄経 (サイデリアル) から 27 宿を導出。
//   nakshatra index = floor(sidereal_moon_longitude / (360/27))
//   sidereal = tropical (Meeus 算出) - ayanamsa (歳差補正)
//   ayanamsa は Lahiri 近似: 23.85° (2000 年) + 年差 0.0139°/年
//
//   日々の運勢: 本命宿から当日宿までの距離で
//   命・栄・衰・安・危・成・壊・友・親 (3×9 = 27 関係) を判定。

import { moonLongitude } from "@/lib/astronomy";

// ====================================================================
// 27 宿の基本データ
// ====================================================================
export type Mansion = {
  index: number;       // 0-26
  name: string;        // 宿名 (例: 昴宿)
  reading: string;     // 読み
  nature: string;      // 性質の一言
  traits: string;      // 性格特性
  career: string;      // 適職
  love: string;        // 恋愛傾向
};

export const MANSIONS: Mansion[] = [
  { index: 0, name: "昴宿", reading: "ぼうしゅく", nature: "気品と聡明", traits: "上品で頭脳明晰、礼節を重んじる貴人の宿。プライドが高く、権威に愛される。", career: "学者・官僚・伝統文化・宝飾", love: "理想が高く晩婚傾向。尊敬できる相手とのみ深く結ばれる。" },
  { index: 1, name: "畢宿", reading: "ひっしゅく", nature: "堅実と蓄財", traits: "粘り強く誠実、コツコツ蓄える堅実派。動きは遅いが最後に勝つ大器晩成。", career: "金融・不動産・農業・蔵元", love: "一途で家庭的。結婚後に愛情が深まる典型。" },
  { index: 2, name: "觜宿", reading: "ししゅく", nature: "言葉と知略", traits: "弁舌の才に長け、情報を制する軍師タイプ。口の鋭さが武器にも刃にもなる。", career: "ジャーナリスト・弁護士・営業・批評家", love: "言葉で口説き、言葉で傷つける。対話できる相手が最良。" },
  { index: 3, name: "参宿", reading: "さんしゅく", nature: "豪胆と冒険", traits: "大胆不敵な行動派。リスクを恐れず突き進む開拓者で、波乱も多いが運も強い。", career: "起業家・軍人・探検家・スポーツ", love: "情熱的で衝動的。退屈な関係は続かない。" },
  { index: 4, name: "井宿", reading: "せいしゅく", nature: "理知と探求", traits: "深く考える知性派。物事の本質を掘り下げる研究者気質で、論理が通らないと動かない。", career: "研究者・エンジニア・医師・作家", love: "理屈っぽいが誠実。理解し合える知的な相手と長続き。" },
  { index: 5, name: "鬼宿", reading: "きしゅく", nature: "直感と霊性", traits: "27 宿で最も霊感が強いとされる宿。人の心を読み、見えないものを感じ取る。", career: "占術家・カウンセラー・宗教家・医療", love: "深い精神的結びつきを求める。魂の伴侶を探す旅人。" },
  { index: 6, name: "柳宿", reading: "りゅうしゅく", nature: "情念と魅力", traits: "強い情念と色気を持つ宿。愛憎が深く、ハマったものにはとことん没入する。", career: "芸能・芸術・水商売・外科医", love: "愛が深い分、嫉妬も深い。情熱の制御が課題。" },
  { index: 7, name: "星宿", reading: "せいしゅく", nature: "孤高と実力", traits: "一匹狼の実力者。群れず、自分の道を突き進む。孤独に強く、晩年に大成する。", career: "専門職・職人・パイロット・独立業", love: "自立した者同士の対等な関係が理想。束縛は破局のもと。" },
  { index: 8, name: "張宿", reading: "ちょうしゅく", nature: "華やぎと人望", traits: "陽気で華があり、人を惹きつける人気者の宿。場の中心に立つことで運が回る。", career: "経営者・政治家・芸能・接客業", love: "モテるが本命は一人。祝福される派手な結婚に縁。" },
  { index: 9, name: "翼宿", reading: "よくしゅく", nature: "誠実と奉仕", traits: "翼のように人を支える献身の宿。真面目で信用が厚く、組織に不可欠な存在。", career: "公務員・教育・医療・秘書", love: "尽くす愛。相手に恵まれれば最高の家庭を築く。" },
  { index: 10, name: "軫宿", reading: "しんしゅく", nature: "移動と商才", traits: "車輪の宿。移動・運搬・流通に縁が深く、動けば動くほど財を成す。", career: "貿易・運輸・旅行業・商社", love: "遠距離や旅先の出会いに縁。動きのある関係を好む。" },
  { index: 11, name: "角宿", reading: "かくしゅく", nature: "若さと社交", traits: "永遠の青年。明るく社交的で、新しいものへの感度が高い。流行の発信源。", career: "ファッション・メディア・企画・美容", love: "恋多き宿。結婚後も恋人のような関係を望む。" },
  { index: 12, name: "亢宿", reading: "こうしゅく", nature: "正義と剛直", traits: "曲がったことが許せない正義漢。剛直さが信頼を呼ぶが、敵も作りやすい。", career: "法曹・警察・監査・武道", love: "誠実一筋。駆け引きできず、不器用だが深い愛。" },
  { index: 13, name: "氐宿", reading: "ていしゅく", nature: "土台と信用", traits: "大地のような安定感。信用を積み上げ、組織の土台となる縁の下の力持ち。", career: "建設・銀行・総務・伝統工芸", love: "安定志向。家と家族を守る堅実な愛。" },
  { index: 14, name: "房宿", reading: "ぼうしゅく", nature: "福徳と繁栄", traits: "27 宿屈指の福運の宿。財・地位・家庭の三拍子に恵まれやすい天性の果報者。", career: "経営者・資産家・政治家・名家継承", love: "良縁に恵まれる。家柄の良い相手との縁が深い。" },
  { index: 15, name: "心宿", reading: "しんしゅく", nature: "人心掌握", traits: "人の心を掴む天才。愛されるが、心の内は誰にも見せない複雑な二面性を持つ。", career: "政治家・営業・心理職・芸能", love: "モテるが本心を隠す。心を開けた相手とだけ本物の愛。" },
  { index: 16, name: "尾宿", reading: "びしゅく", nature: "執念と完遂", traits: "尾を掴んだら離さない執念の宿。一つの道を究める職人・求道者の気質。", career: "職人・研究者・伝統芸能・登山家", love: "不器用だが一途。生涯一人を愛し抜くタイプ。" },
  { index: 17, name: "箕宿", reading: "きしゅく", nature: "豪放と自由", traits: "型破りな自由人。常識の枠を吹き飛ばす豪快さで、敵も味方も多い革命児。", career: "起業家・芸術家・冒険家・改革者", love: "自由恋愛主義。束縛しない相手とだけ長続き。" },
  { index: 18, name: "斗宿", reading: "としゅく", nature: "器量と統率", traits: "北斗のように人を導く大器の宿。度量が大きく、晩年に向けて地位が上がり続ける。", career: "経営者・指導者・教育者・宗教家", love: "包容力のある愛。家庭では良き家長。" },
  { index: 19, name: "女宿", reading: "じょしゅく", nature: "勤勉と内助", traits: "細やかな気配りと勤勉さの宿。表より裏方で輝き、組織や家庭を内側から支える。", career: "経理・看護・編集・サポート職", love: "支える愛に幸せを感じる。内助の功の典型。" },
  { index: 20, name: "虚宿", reading: "きょしゅく", nature: "感性と空想", traits: "現実と夢の間に生きる感性の人。芸術的才能と、どこか掴めない神秘性を持つ。", career: "芸術家・音楽家・デザイナー・占術", love: "ロマンチスト。現実より理想の愛を追う傾向。" },
  { index: 21, name: "危宿", reading: "きしゅく", nature: "スリルと才覚", traits: "危険な橋を渡るほど冴える勝負師。頭の回転が速く、ピンチをチャンスに変える。", career: "投資家・勝負師・救急医療・芸能", love: "刺激的な恋を好む。安定すると逃げたくなる癖に注意。" },
  { index: 22, name: "室宿", reading: "しっしゅく", nature: "闘志と突破", traits: "強烈な闘争心で壁を突破する宿。攻めの人生で、守りに入ると運気が落ちる。", career: "軍人・格闘家・営業・外科医", love: "猛アタックで射止める。結婚後も主導権を握る。" },
  { index: 23, name: "壁宿", reading: "へきしゅく", nature: "学問と継承", traits: "知の壁 (書庫) の宿。学問・記録・伝承に縁が深く、知識を次代に渡す役割を持つ。", career: "学者・図書館・出版・アーカイブ", love: "穏やかで誠実。知的な会話が愛を育てる。" },
  { index: 24, name: "奎宿", reading: "けいしゅく", nature: "文芸と気品", traits: "文の神に守られた宿。文章・芸術の才と上品な人柄で、文化の世界で輝く。", career: "作家・書道家・教育・文化事業", love: "プラトニック寄りの上品な愛。手紙や言葉が愛を運ぶ。" },
  { index: 25, name: "婁宿", reading: "ろうしゅく", nature: "機敏と世渡り", traits: "身軽で機転が利く世渡り上手。複数のことを並行処理するマルチタスクの達人。", career: "コンサル・仲介業・MC・調整役", love: "気配り上手でモテる。八方美人と誤解されない誠実さが鍵。" },
  { index: 26, name: "胃宿", reading: "いしゅく", nature: "胆力と決断", traits: "何でも呑み込む胆力の宿。決断が速く、修羅場に強い。", career: "経営者・料理人・金融・危機管理", love: "決めたら迷わない。スピード婚の縁。" },
];

// ====================================================================
// 本命宿の算出
// ====================================================================

// Lahiri ayanamsa の近似 (2000 年 = 23.85° 基準で年差 +0.0139°)
function ayanamsa(year: number): number {
  return 23.85 + (year - 2000) * 0.0139;
}

export function mansionFromDate(date: Date): Mansion {
  const tropical = moonLongitude(date);
  const year = date.getUTCFullYear();
  const sidereal = ((tropical - ayanamsa(year)) % 360 + 360) % 360;
  const idx = Math.floor(sidereal / (360 / 27)) % 27;
  return MANSIONS[idx];
}

// 出生日時 (JST) から本命宿
export function birthMansion(birthIso: string, hourJst: number = 12): Mansion {
  const [y, m, d] = birthIso.split("-").map(Number);
  // JST → UTC (-9h)
  const utc = new Date(Date.UTC(y, m - 1, d, hourJst - 9));
  return mansionFromDate(utc);
}

export function todayMansion(date: Date = new Date()): Mansion {
  // 当日正午 JST = 03:00 UTC で判定
  const noon = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 3));
  return mansionFromDate(noon);
}

// ====================================================================
// 日々の関係 (3×9 = 27 サイクル)
// ====================================================================
export type DailyRelation = {
  name: string;        // 命・栄・衰・安・危・成・壊・友・親
  kind: "大吉" | "吉" | "中" | "注意" | "凶";
  meaning: string;
};

const RELATION_CYCLE: DailyRelation[] = [
  { name: "命", kind: "中", meaning: "本命の日。自分と向き合う内省日。新規開始より自己メンテナンスに向く。" },
  { name: "栄", kind: "大吉", meaning: "栄える日。昇進・契約・開始事に最良。攻めの行動が実を結ぶ。" },
  { name: "衰", kind: "注意", meaning: "衰える日。エネルギー低下。守りに徹し、休息と整理を優先。" },
  { name: "安", kind: "吉", meaning: "安定の日。日常業務・継続事項が滞りなく進む。家庭との時間に吉。" },
  { name: "危", kind: "凶", meaning: "危うい日。事故・ミス・対人トラブルに注意。重要決定は避ける。" },
  { name: "成", kind: "大吉", meaning: "成就の日。積み重ねてきたことが形になる。仕上げ・納品・発表に最良。" },
  { name: "壊", kind: "凶", meaning: "壊れる日。破談・破損・計画頓挫の暗示。手放すべきものを手放す日と捉えると吉。" },
  { name: "友", kind: "吉", meaning: "友の日。仲間・同僚との連携が幸運を呼ぶ。共同作業・会食に吉。" },
  { name: "親", kind: "大吉", meaning: "親しむ日。目上からの引き立て・支援に恵まれる。相談事・お願い事に最良。" },
];

export function dailyRelation(birthM: Mansion, todayM: Mansion): DailyRelation {
  const dist = (todayM.index - birthM.index + 27) % 27;
  return RELATION_CYCLE[dist % 9];
}

// ====================================================================
// 相性 (二人の本命宿)
// ====================================================================
export function mansionCompat(a: Mansion, b: Mansion): { relation: DailyRelation; reverse: DailyRelation; summary: string } {
  const rel = dailyRelation(a, b);
  const rev = dailyRelation(b, a);
  const score = (r: DailyRelation) => (r.kind === "大吉" ? 5 : r.kind === "吉" ? 4 : r.kind === "中" ? 3 : r.kind === "注意" ? 2 : 1);
  const avg = (score(rel) + score(rev)) / 2;
  const summary =
    avg >= 4.5 ? "栄親の好相性。互いを高め合う理想的な縁。" :
    avg >= 3.5 ? "安定した良縁。穏やかに長続きする関係。" :
    avg >= 2.5 ? "中庸の縁。意識的な歩み寄りで深まる。" :
    "安壊の緊張関係。強く惹かれ合うが消耗もしやすい。距離感が鍵。";
  return { relation: rel, reverse: rev, summary };
}
