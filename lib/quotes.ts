// 有名人の格言コーナー
// 経営者・思想家・投資家・芸術家・霊性の指導者を中心に厳選。
// INFJ × 戊土 × マスター 11 × 偏土命 (養い育てる) と響き合う人選を優先。

import { pickByDate } from "@/lib/today";

export type QuoteCategory =
  | "経営者"      // 経営者・起業家
  | "投資家"      // 投資家・資産家
  | "思想家"      // 哲学者・思想家
  | "戦略家"      // 戦略家・軍人
  | "芸術家"      // 芸術家・クリエイター
  | "科学者"      // 科学者・発明家
  | "政治家"      // 政治家・指導者
  | "霊性";       // 霊性・宗教指導者

export type Quote = {
  text: string;       // 格言本文 (日本語)
  author: string;     // 著者名
  authorEn?: string;  // 著者名 (英語表記・任意)
  context?: string;   // 一言解説 (どんな状況で / どんな意味か)
  category: QuoteCategory;
  era?: string;       // 時代 (BC 5世紀 / 20世紀 etc.)
  mbtiHint?: string;  // 推定 MBTI (相性確認用)
};

// ====================================================================
// QUOTES: 厳選 120+ 件
// ====================================================================
export const QUOTES: Quote[] = [
  // ===== 経営者・起業家 =====
  {
    text: "ハングリーであれ。愚かであれ。",
    author: "スティーブ・ジョブズ",
    authorEn: "Steve Jobs",
    context: "スタンフォード大卒業式講演 (2005)。常識を疑い、飢えた状態で挑み続ける姿勢を。",
    category: "経営者",
    era: "20-21世紀",
    mbtiHint: "ENTJ",
  },
  {
    text: "リーダーとフォロワーを分けるのは、イノベーションだ。",
    author: "スティーブ・ジョブズ",
    authorEn: "Steve Jobs",
    context: "革新だけが、ただ追随する者から自分を引き離す。",
    category: "経営者",
    mbtiHint: "ENTJ",
  },
  {
    text: "燃える闘魂で誰にも負けない努力を。",
    author: "稲盛和夫",
    context: "京セラ・KDDI 創業者。アメーバ経営と哲学経営の創始者。",
    category: "経営者",
    era: "20-21世紀",
  },
  {
    text: "心が呼ばないものは、現象として現れない。",
    author: "稲盛和夫",
    context: "強烈な思いと願いが、現実を引き寄せるという経営哲学。",
    category: "経営者",
  },
  {
    text: "成功と失敗を分けるのは、能力ではなく考え方だ。",
    author: "稲盛和夫",
    context: "能力×熱意×考え方 という人生方程式の中で、考え方だけが負の値を取りうる。",
    category: "経営者",
  },
  {
    text: "道は無限にある。",
    author: "松下幸之助",
    context: "パナソニック創業者。経営の神様と呼ばれた。",
    category: "経営者",
    era: "20世紀",
  },
  {
    text: "好況よし、不況さらによし。",
    author: "松下幸之助",
    context: "不況は会社の体質を見直す絶好の機会。逆境を歓迎する姿勢。",
    category: "経営者",
  },
  {
    text: "やってみなはれ。やらなわからしまへんで。",
    author: "鳥井信治郎",
    context: "サントリー創業者。挑戦の精神を社風に。",
    category: "経営者",
    era: "20世紀",
  },
  {
    text: "やってみせ、言って聞かせて、させてみせ、ほめてやらねば、人は動かじ。",
    author: "山本五十六",
    context: "海軍大将。リーダーシップの根本原則。戊土の人にとっての教科書的言葉。",
    category: "戦略家",
    era: "20世紀",
  },
  {
    text: "成功には、99% の失敗が必要だ。",
    author: "本田宗一郎",
    context: "ホンダ創業者。失敗を恐れず挑戦することの大切さ。",
    category: "経営者",
    era: "20世紀",
  },
  {
    text: "得手に帆を上げよ。",
    author: "本田宗一郎",
    context: "自分の得意分野で全力を尽くせ。",
    category: "経営者",
  },
  {
    text: "志を高く持て。",
    author: "孫正義",
    context: "ソフトバンク創業者。19歳で人生 50 年計画を立てた。",
    category: "経営者",
    era: "20-21世紀",
    mbtiHint: "ENTJ",
  },
  {
    text: "登りたい山を決める。これで人生の半分が決まる。",
    author: "孫正義",
    context: "目標の質が人生の質を決める。",
    category: "経営者",
  },
  {
    text: "リスクを取らないのが、最大のリスクだ。",
    author: "マーク・ザッカーバーグ",
    authorEn: "Mark Zuckerberg",
    context: "変化する世界で動かないことこそ、最も危険。",
    category: "経営者",
    era: "21世紀",
    mbtiHint: "INTJ",
  },
  {
    text: "私は将来を予測するのが好きではない。私は未来を作る。",
    author: "イーロン・マスク",
    authorEn: "Elon Musk",
    context: "Tesla・SpaceX CEO。未来は予測するものではなく、構築するもの。",
    category: "経営者",
    era: "21世紀",
    mbtiHint: "INTJ",
  },
  {
    text: "失敗は選択肢の一つだ。失敗を経験していなければ、十分に挑戦していない証拠。",
    author: "イーロン・マスク",
    authorEn: "Elon Musk",
    context: "失敗を許容する文化が、革新を生む。",
    category: "経営者",
  },
  {
    text: "Done is better than perfect.",
    author: "シェリル・サンドバーグ",
    authorEn: "Sheryl Sandberg",
    context: "完璧を目指すより、まず終わらせる。Facebook COO の言葉。",
    category: "経営者",
    era: "21世紀",
  },
  {
    text: "経営とは、すでに起こった未来を見ることである。",
    author: "ピーター・ドラッカー",
    authorEn: "Peter Drucker",
    context: "経営学の父。未来は現在の中にすでに芽生えている。",
    category: "思想家",
    era: "20世紀",
    mbtiHint: "INTJ",
  },
  {
    text: "効果的なリーダーシップとは、人々を高みに引き上げることだ。",
    author: "ピーター・ドラッカー",
    authorEn: "Peter Drucker",
    category: "思想家",
  },
  {
    text: "なされるべきことを集中してやれ。",
    author: "ピーター・ドラッカー",
    authorEn: "Peter Drucker",
    context: "選択と集中の原理。",
    category: "思想家",
  },
  {
    text: "強みの上に強みを築け。弱みを直そうとするな。",
    author: "ピーター・ドラッカー",
    authorEn: "Peter Drucker",
    context: "INFJ × 戊土 のキャリア戦略の核心。",
    category: "思想家",
  },

  // ===== 投資家 =====
  {
    text: "他人が貪欲な時に恐れ、他人が恐れている時に貪欲であれ。",
    author: "ウォーレン・バフェット",
    authorEn: "Warren Buffett",
    context: "オマハの賢人。逆張りの哲学。INFJ の直感と相性が良い。",
    category: "投資家",
    era: "20-21世紀",
    mbtiHint: "ISTJ",
  },
  {
    text: "我々が歴史から学ぶのは、人類が歴史から学ばないということだ。",
    author: "ウォーレン・バフェット",
    authorEn: "Warren Buffett",
    context: "市場の周期と人間の心理は、いつも繰り返される。",
    category: "投資家",
  },
  {
    text: "ルール 1: 損をするな。ルール 2: ルール 1 を忘れるな。",
    author: "ウォーレン・バフェット",
    authorEn: "Warren Buffett",
    context: "資本を守ることが、増やすことよりも先。",
    category: "投資家",
  },
  {
    text: "素晴らしい会社を妥当な価格で買うほうが、妥当な会社を素晴らしい価格で買うよりはるかにいい。",
    author: "チャーリー・マンガー",
    authorEn: "Charlie Munger",
    context: "バフェットの相棒。質を取れ、量より。",
    category: "投資家",
    era: "20-21世紀",
  },
  {
    text: "賢明な投資家は、人気のあるものを買うのではなく、価値のあるものを買う。",
    author: "ベンジャミン・グレアム",
    authorEn: "Benjamin Graham",
    context: "バリュー投資の父。バフェットの師。",
    category: "投資家",
    era: "20世紀",
  },

  // ===== 思想家・哲学者 =====
  {
    text: "上善は水の如し。水は万物を利して争わず、衆人の悪む所に処る。",
    author: "老子",
    authorEn: "Lao Tzu",
    context: "最高の善は水のようである。低きを厭わず、すべてを潤す。戊土と水のバランス。",
    category: "思想家",
    era: "BC6世紀",
  },
  {
    text: "千里の道も一歩より始まる。",
    author: "老子",
    authorEn: "Lao Tzu",
    context: "巨大なことも、最初の一歩から。",
    category: "思想家",
  },
  {
    text: "知人者智、自知者明。",
    author: "老子",
    authorEn: "Lao Tzu",
    context: "他人を知る者は智、自分を知る者は明。INFJ の Ni に通じる。",
    category: "思想家",
  },
  {
    text: "学びて時にこれを習う、亦た説ばしからずや。",
    author: "孔子",
    authorEn: "Confucius",
    context: "論語冒頭。学びと実践の喜び。",
    category: "思想家",
    era: "BC5世紀",
  },
  {
    text: "己の欲せざる所、人に施すこと勿れ。",
    author: "孔子",
    authorEn: "Confucius",
    context: "自分が嫌なことを、他人にもするな。倫理の黄金律。",
    category: "思想家",
  },
  {
    text: "三十にして立ち、四十にして惑わず、五十にして天命を知る。",
    author: "孔子",
    authorEn: "Confucius",
    context: "人生のステージ。INFJ × 戊土 の人生軌道に重なる。",
    category: "思想家",
  },
  {
    text: "汝自身を知れ。",
    author: "ソクラテス",
    authorEn: "Socrates",
    context: "デルフォイの神殿の言葉。哲学の出発点。",
    category: "思想家",
    era: "BC5世紀",
  },
  {
    text: "唯一の知は、自分が何も知らないと知ることである。",
    author: "ソクラテス",
    authorEn: "Socrates",
    context: "無知の知。知の出発点としての謙虚さ。",
    category: "思想家",
  },
  {
    text: "考え方が変われば、行動が変わる。行動が変われば、習慣が変わる。習慣が変われば、人格が変わる。",
    author: "アリストテレス",
    authorEn: "Aristotle",
    category: "思想家",
    era: "BC4世紀",
  },
  {
    text: "影なくして、光は存在しない。",
    author: "カール・ユング",
    authorEn: "Carl Jung",
    context: "心理学者。INFJ の深層理論を整備。影との対峙が魂の完成。",
    category: "思想家",
    era: "19-20世紀",
    mbtiHint: "INFJ",
  },
  {
    text: "あなたが内面で意識化していないことは、外側で運命として現れる。",
    author: "カール・ユング",
    authorEn: "Carl Jung",
    context: "投影とシンクロニシティ。占いの根源的な意味。",
    category: "思想家",
    mbtiHint: "INFJ",
  },
  {
    text: "私は、私に起こったことではない。私は、私になることを選んだものである。",
    author: "カール・ユング",
    authorEn: "Carl Jung",
    context: "人生は出来事より、その解釈と選択で決まる。",
    category: "思想家",
    mbtiHint: "INFJ",
  },
  {
    text: "深淵を覗く時、深淵もまた、こちらを覗いている。",
    author: "ニーチェ",
    authorEn: "Friedrich Nietzsche",
    context: "悪と対峙する時の自戒。INFJ の感受性への警告でもある。",
    category: "思想家",
    era: "19世紀",
  },
  {
    text: "「なぜ生きるか」を知っている者は、ほとんど全ての「いかに生きるか」に耐えうる。",
    author: "ニーチェ",
    authorEn: "Friedrich Nietzsche",
    context: "意味があれば、苦難は耐えられる。",
    category: "思想家",
  },
  {
    text: "誰かを批判する前に、その人の靴を履いて 1 マイル歩いてみよ。",
    author: "アメリカン・インディアン格言",
    context: "共感と理解の出発点。INFJ の Fe の核心。",
    category: "思想家",
  },

  // ===== 戦略家 =====
  {
    text: "敵を知り己を知れば、百戦殆うからず。",
    author: "孫子",
    authorEn: "Sun Tzu",
    context: "孫子の兵法。最も引用される戦略原則。",
    category: "戦略家",
    era: "BC5世紀",
  },
  {
    text: "百戦百勝は、善の善なる者に非ず。戦わずして人の兵を屈するは、善の善なる者なり。",
    author: "孫子",
    authorEn: "Sun Tzu",
    context: "最高の勝利は、戦わずに勝つこと。戊土の人の理想形。",
    category: "戦略家",
  },
  {
    text: "兵は拙速を聞くも、未だ巧の久しきを睹ざるなり。",
    author: "孫子",
    authorEn: "Sun Tzu",
    context: "粗くてもスピード優先。長期戦は誰の利にもならない。",
    category: "戦略家",
  },
  {
    text: "勝つとは、必ずしも倒すことではない。",
    author: "宮本武蔵",
    context: "五輪書。剣聖の哲学。",
    category: "戦略家",
    era: "16-17世紀",
  },
  {
    text: "千日の稽古を鍛とし、万日の稽古を錬とす。",
    author: "宮本武蔵",
    context: "鍛錬の漢字の語源。INFJ × 戊土 のコツコツ哲学そのもの。",
    category: "戦略家",
  },
  {
    text: "我れ、事において後悔せず。",
    author: "宮本武蔵",
    context: "独行道二十一箇条より。自分の選択を後悔しない強さ。",
    category: "戦略家",
  },

  // ===== 芸術家・クリエイター =====
  {
    text: "簡潔さは究極の洗練。",
    author: "レオナルド・ダ・ヴィンチ",
    authorEn: "Leonardo da Vinci",
    context: "ルネサンスの巨人。INFJ × 偏印 系の創造者。",
    category: "芸術家",
    era: "15-16世紀",
    mbtiHint: "INFJ",
  },
  {
    text: "学ぶことは、決して心を疲れさせない。",
    author: "レオナルド・ダ・ヴィンチ",
    authorEn: "Leonardo da Vinci",
    category: "芸術家",
  },
  {
    text: "私が最も尊敬するのは、退屈な仕事を毎日続けられる人だ。",
    author: "宮崎駿",
    context: "スタジオジブリ監督。INFJ。コツコツ続けることの威厳。",
    category: "芸術家",
    era: "20-21世紀",
    mbtiHint: "INFJ",
  },
  {
    text: "面倒くさいって思う事を一生懸命やる。それが生きる事だと思う。",
    author: "宮崎駿",
    context: "面倒くささを引き受けることが、人生の質を決める。",
    category: "芸術家",
    mbtiHint: "INFJ",
  },
  {
    text: "創作とは、世界に対する自分の答え。",
    author: "宮崎駿",
    category: "芸術家",
    mbtiHint: "INFJ",
  },
  {
    text: "芸術は嘘である。しかし、真実を語る嘘である。",
    author: "ピカソ",
    authorEn: "Pablo Picasso",
    context: "芸術と真実の関係を見事に。",
    category: "芸術家",
    era: "19-20世紀",
  },
  {
    text: "全ての子供は芸術家だ。問題は、大人になっても芸術家でいられるかだ。",
    author: "ピカソ",
    authorEn: "Pablo Picasso",
    category: "芸術家",
  },

  // ===== 科学者・発明家 =====
  {
    text: "想像力は、知識よりも重要である。知識には限界があるが、想像力は世界を包む。",
    author: "アルバート・アインシュタイン",
    authorEn: "Albert Einstein",
    category: "科学者",
    era: "19-20世紀",
    mbtiHint: "INTP",
  },
  {
    text: "同じことを繰り返しながら、違う結果を望むのは狂気の沙汰だ。",
    author: "アルバート・アインシュタイン",
    authorEn: "Albert Einstein",
    context: "変化したいなら、まず行動を変えよ。",
    category: "科学者",
    mbtiHint: "INTP",
  },
  {
    text: "天才とは、1% のひらめきと 99% の汗である。",
    author: "トーマス・エジソン",
    authorEn: "Thomas Edison",
    category: "科学者",
    era: "19-20世紀",
    mbtiHint: "ENTP",
  },
  {
    text: "私は失敗していない。うまくいかない方法を 1 万通り見つけただけだ。",
    author: "トーマス・エジソン",
    authorEn: "Thomas Edison",
    context: "失敗を学びに変える視点。",
    category: "科学者",
  },

  // ===== 政治家・指導者 =====
  {
    text: "世界に望む変化を、自らが体現せよ。",
    author: "マハトマ・ガンディー",
    authorEn: "Mahatma Gandhi",
    context: "インド独立の父。INFJ の代表的存在。非暴力の哲学。",
    category: "政治家",
    era: "19-20世紀",
    mbtiHint: "INFJ",
  },
  {
    text: "強さは、肉体的な能力からではなく、不屈の意志から生まれる。",
    author: "マハトマ・ガンディー",
    authorEn: "Mahatma Gandhi",
    category: "政治家",
    mbtiHint: "INFJ",
  },
  {
    text: "目には目を、では世界は盲目になる。",
    author: "マハトマ・ガンディー",
    authorEn: "Mahatma Gandhi",
    context: "報復の連鎖を断ち切る勇気。",
    category: "政治家",
    mbtiHint: "INFJ",
  },
  {
    text: "ある人を見出すための最良の方法は、その人に責任を委ねること。",
    author: "リンカーン",
    authorEn: "Abraham Lincoln",
    context: "信頼が人を育てる。",
    category: "政治家",
    era: "19世紀",
  },
  {
    text: "国家があなたに何をしてくれるかを問うのではなく、あなたが国家のために何ができるかを問え。",
    author: "ジョン・F・ケネディ",
    authorEn: "John F. Kennedy",
    category: "政治家",
    era: "20世紀",
  },

  // ===== 霊性 =====
  {
    text: "私たちは皆、大きな海の一部だ。海はあなたの一滴の中にも存在する。",
    author: "マザー・テレサ",
    authorEn: "Mother Teresa",
    context: "INFJ の代表。世界の苦しみを引き受けた人。",
    category: "霊性",
    era: "20世紀",
    mbtiHint: "ISFJ",
  },
  {
    text: "小さなことに、大きな愛を込めなさい。",
    author: "マザー・テレサ",
    authorEn: "Mother Teresa",
    context: "日常の中の聖性。",
    category: "霊性",
  },
  {
    text: "笑顔は、平和の始まり。",
    author: "マザー・テレサ",
    authorEn: "Mother Teresa",
    category: "霊性",
  },
  {
    text: "幸福を求めるなら、目標を持て。人や物に依存するな。",
    author: "ダライ・ラマ 14世",
    authorEn: "Dalai Lama",
    category: "霊性",
    era: "20-21世紀",
  },
  {
    text: "今この瞬間を生きることが、最大の修行である。",
    author: "ダライ・ラマ 14世",
    authorEn: "Dalai Lama",
    category: "霊性",
  },
  {
    text: "あなたが取り組むべき最も重要な人間関係は、自分自身との関係である。",
    author: "ダライ・ラマ 14世",
    authorEn: "Dalai Lama",
    category: "霊性",
  },
  {
    text: "雨にも負けず、風にも負けず。",
    author: "宮沢賢治",
    context: "農芸化学者・詩人。INFJ × 戊土 系の精神性。",
    category: "霊性",
    era: "19-20世紀",
    mbtiHint: "INFJ",
  },
  {
    text: "本当の幸せが何であるか、まだわからない、それでも私たちは本当の幸せを求めて進む。",
    author: "宮沢賢治",
    context: "銀河鉄道の夜。求道の精神。",
    category: "霊性",
    mbtiHint: "INFJ",
  },

  // ===== 経営者 (追加) =====
  {
    text: "情熱がなければ、エネルギーはない。エネルギーがなければ、何もない。",
    author: "ドナルド・トランプ",
    authorEn: "Donald Trump",
    context: "経営においても政治においても情熱が燃料。",
    category: "経営者",
    era: "20-21世紀",
  },
  {
    text: "あなたの最も不満を言う顧客は、最大の学びの源だ。",
    author: "ビル・ゲイツ",
    authorEn: "Bill Gates",
    context: "クレームを資産と捉える視点。",
    category: "経営者",
    era: "20-21世紀",
    mbtiHint: "INTP",
  },
  {
    text: "成功は最悪の教師だ。賢い人を欺き、失敗しないと信じ込ませる。",
    author: "ビル・ゲイツ",
    authorEn: "Bill Gates",
    context: "成功の罠への警鐘。",
    category: "経営者",
  },
  {
    text: "私は、自分の人生を、人生で最高のアスリートと同じ準備で挑む。",
    author: "ジェフ・ベゾス",
    authorEn: "Jeff Bezos",
    context: "Amazon 創業者。長期視野とディテール。",
    category: "経営者",
    era: "20-21世紀",
    mbtiHint: "ENTJ",
  },
  {
    text: "明日の重要な決断は、今日決断しない。72 時間後の自分に判断を任せる。",
    author: "ジェフ・ベゾス",
    authorEn: "Jeff Bezos",
    context: "急がない判断の質。INFJ × 戊土 の意思決定スタイルに共鳴。",
    category: "経営者",
  },

  // ===== 渋沢栄一・日本の近代経営者 =====
  {
    text: "夢七訓: 夢なき者は理想なし、理想なき者は信念なし、信念なき者は計画なし、計画なき者は実行なし、実行なき者は成果なし、成果なき者は幸福なし、ゆえに、幸福を求める者は夢なかるべからず。",
    author: "渋沢栄一",
    context: "日本資本主義の父。500 社を立ち上げた。",
    category: "経営者",
    era: "19-20世紀",
  },
  {
    text: "論語と算盤を両立せよ。",
    author: "渋沢栄一",
    context: "道徳と経済の両立。日本経営の哲学的基盤。",
    category: "経営者",
  },
  {
    text: "四十、五十は鼻たれ小僧。六十、七十は働き盛り。九十になって迎えがきたら百歳まで待てと追い返せ。",
    author: "渋沢栄一",
    context: "大器晩成の励まし。戊土の人生軌道に響く。",
    category: "経営者",
  },
  {
    text: "天は自ら助くる者を助く。",
    author: "サミュエル・スマイルズ",
    authorEn: "Samuel Smiles",
    context: "「自助論」より。明治日本のベストセラー。",
    category: "思想家",
    era: "19世紀",
  },

  // ===== 哲学者 (追加) =====
  {
    text: "我思う、故に我あり。",
    author: "ルネ・デカルト",
    authorEn: "René Descartes",
    context: "近代哲学の起点。",
    category: "思想家",
    era: "16-17世紀",
    mbtiHint: "INTP",
  },
  {
    text: "人間は考える葦である。",
    author: "ブレーズ・パスカル",
    authorEn: "Blaise Pascal",
    context: "弱いが思考する存在としての尊厳。",
    category: "思想家",
    era: "17世紀",
  },
  {
    text: "私の唯一の自由は、私が選ぶことに対する責任である。",
    author: "ジャン=ポール・サルトル",
    authorEn: "Jean-Paul Sartre",
    context: "実存主義。選択と責任の哲学。",
    category: "思想家",
    era: "20世紀",
  },
  {
    text: "幸福は、目的ではなく、副産物である。",
    author: "オルダス・ハクスリー",
    authorEn: "Aldous Huxley",
    category: "思想家",
    era: "20世紀",
  },

  // ===== 心理学者・カウンセラー =====
  {
    text: "人は、自分の意思で変わろうとした時にだけ変わることができる。",
    author: "アルフレッド・アドラー",
    authorEn: "Alfred Adler",
    context: "個人心理学の創始者。「嫌われる勇気」で再評価。",
    category: "思想家",
    era: "19-20世紀",
  },
  {
    text: "全ての悩みは、対人関係の悩みである。",
    author: "アルフレッド・アドラー",
    authorEn: "Alfred Adler",
    category: "思想家",
  },
  {
    text: "クライエントの中に、すでに答えはある。",
    author: "河合隼雄",
    context: "日本の臨床心理学の父。ユング派分析家。",
    category: "思想家",
    era: "20-21世紀",
    mbtiHint: "INFJ",
  },
  {
    text: "ふたつよいこと、さてないものよ。",
    author: "河合隼雄",
    context: "良いことと悪いことは表裏。",
    category: "思想家",
    mbtiHint: "INFJ",
  },

  // ===== 詩人・作家 =====
  {
    text: "今、ここ、自分。",
    author: "禅の格言",
    context: "禅の核心。マインドフルネスの源。",
    category: "霊性",
  },
  {
    text: "山静かにして人意自ずから静かなり。",
    author: "禅の格言",
    context: "戊土の人にとっての理想の境地。",
    category: "霊性",
  },
  {
    text: "人生はクローゼットを整理するように、シンプルに保つべきだ。",
    author: "マリー・コンドー",
    authorEn: "Marie Kondo",
    context: "片付けで人生が変わる。具体と抽象の橋渡し。",
    category: "思想家",
    era: "21世紀",
  },

  // ===== 偉大なる起業家 (海外) =====
  {
    text: "リーダーシップとは、他者に夢を見させる芸術である。",
    author: "リチャード・ブランソン",
    authorEn: "Richard Branson",
    context: "Virgin グループ。陽気な経営者。",
    category: "経営者",
    era: "20-21世紀",
    mbtiHint: "ENFP",
  },
  {
    text: "ビジネスは、まず人の問題を解くこと。",
    author: "リチャード・ブランソン",
    authorEn: "Richard Branson",
    category: "経営者",
  },
  {
    text: "私たちの最大の弱点は、諦めることにある。最も確実な成功の方法は、もう 1 回挑戦することだ。",
    author: "トーマス・エジソン",
    authorEn: "Thomas Edison",
    category: "科学者",
  },
  {
    text: "成功への鍵は、自分が好きなことに集中することだ。",
    author: "オプラ・ウィンフリー",
    authorEn: "Oprah Winfrey",
    category: "経営者",
    era: "20-21世紀",
    mbtiHint: "ENFJ",
  },
  {
    text: "祝福を数えると、人生は変わる。",
    author: "オプラ・ウィンフリー",
    authorEn: "Oprah Winfrey",
    context: "感謝日記の起源の一つ。",
    category: "霊性",
  },

  // ===== もうひと押し =====
  {
    text: "成功とは、失敗を重ねながらも情熱を失わない能力である。",
    author: "ウィンストン・チャーチル",
    authorEn: "Winston Churchill",
    category: "政治家",
    era: "19-20世紀",
  },
  {
    text: "戦争に勝つだけでは不十分だ。平和を勝ち取らねばならない。",
    author: "ウィンストン・チャーチル",
    authorEn: "Winston Churchill",
    category: "政治家",
  },
  {
    text: "悲観主義者はあらゆる機会の中に困難を見いだす。楽観主義者はあらゆる困難の中に機会を見いだす。",
    author: "ウィンストン・チャーチル",
    authorEn: "Winston Churchill",
    category: "政治家",
  },
  {
    text: "何かを始めるためには、語ることを止めて、行動することだ。",
    author: "ウォルト・ディズニー",
    authorEn: "Walt Disney",
    category: "経営者",
    era: "20世紀",
  },
  {
    text: "もし夢を見ることができれば、それを実現できる。",
    author: "ウォルト・ディズニー",
    authorEn: "Walt Disney",
    category: "経営者",
  },
  {
    text: "成功は、決定の後、即座に始まる。",
    author: "ヘンリー・フォード",
    authorEn: "Henry Ford",
    context: "Ford 創業者。決断と実行。",
    category: "経営者",
    era: "19-20世紀",
  },
  {
    text: "できると思えばできる、できないと思えばできない。これは、ゆるぎない絶対的な法則である。",
    author: "ヘンリー・フォード",
    authorEn: "Henry Ford",
    category: "経営者",
  },

  // ===== 日本の伝統 =====
  {
    text: "和を以て貴しとなす。",
    author: "聖徳太子",
    context: "十七条の憲法。日本社会の根本原理。",
    category: "政治家",
    era: "AD6-7世紀",
  },
  {
    text: "至誠にして動かざる者は、未だこれ有らざるなり。",
    author: "吉田松陰",
    context: "誠実は人を動かす最強の力。",
    category: "思想家",
    era: "19世紀",
  },
  {
    text: "夢なき者に理想なし、理想なき者に計画なし、計画なき者に実行なし、実行なき者に成功なし。",
    author: "吉田松陰",
    context: "段階的な目標達成論。",
    category: "思想家",
  },
  {
    text: "敬天愛人。",
    author: "西郷隆盛",
    context: "天を敬い、人を愛す。明治維新の精神的支柱。",
    category: "政治家",
    era: "19世紀",
  },
  {
    text: "何事も成し遂げようと思うなら、千日に渡って毎日続けるべし。",
    author: "宮本武蔵",
    category: "戦略家",
  },

  // ===== 投資家・経済学者 =====
  {
    text: "市場は、賢者の不安を糧に、愚者の恐怖を養分にする。",
    author: "ジョン・テンプルトン",
    authorEn: "John Templeton",
    context: "テンプルトン・グロース・ファンド創業者。",
    category: "投資家",
    era: "20世紀",
  },
  {
    text: "投資で最も大切なのは、Margin of Safety (安全余裕) である。",
    author: "ベンジャミン・グレアム",
    authorEn: "Benjamin Graham",
    category: "投資家",
  },
  {
    text: "市場は、短期的には人気投票、長期的には体重計だ。",
    author: "ベンジャミン・グレアム",
    authorEn: "Benjamin Graham",
    category: "投資家",
  },

  // ===== 自己啓発・人生 =====
  {
    text: "成功とは、欲しいものを手に入れること。幸福とは、手に入れたものを欲すること。",
    author: "デール・カーネギー",
    authorEn: "Dale Carnegie",
    category: "思想家",
    era: "20世紀",
  },
  {
    text: "最大の成功は、失敗を恐れずに挑戦することだ。",
    author: "デール・カーネギー",
    authorEn: "Dale Carnegie",
    category: "思想家",
  },
  {
    text: "重要なことを優先する人だけが、忙しくない。",
    author: "スティーブン・コヴィー",
    authorEn: "Stephen Covey",
    context: "7つの習慣の著者。優先順位の哲学。",
    category: "思想家",
    era: "20-21世紀",
  },
  {
    text: "違いをもたらすのは、能力ではなく選択だ。",
    author: "J.K. ローリング",
    authorEn: "J.K. Rowling",
    context: "ハリー・ポッターの作者。INFJ。",
    category: "芸術家",
    era: "20-21世紀",
    mbtiHint: "INFJ",
  },

  // ===== 名作からの引用 =====
  {
    text: "なくしたものは、また見つかる。だが、過ぎ去った時間だけは、決して戻らない。",
    author: "J.R.R. トールキン",
    authorEn: "J.R.R. Tolkien",
    context: "指輪物語の作者。INFP。時間の貴重さ。",
    category: "芸術家",
    era: "20世紀",
    mbtiHint: "INFP",
  },
  {
    text: "本当に大切なものは、目に見えない。",
    author: "サン=テグジュペリ",
    authorEn: "Antoine de Saint-Exupéry",
    context: "星の王子さま。INFJ の感受性を象徴する一文。",
    category: "芸術家",
    era: "20世紀",
    mbtiHint: "INFJ",
  },

  // ================================================================
  // 追加バッチ (リサーチ・サブエージェント): 日本/海外現代経営者・投資家・経済学者
  // ================================================================
  { text: "すぐやる、必ずやる、出来るまでやる。", author: "永守重信", authorEn: "Shigenobu Nagamori", context: "日本電産 (ニデック) 創業者の行動哲学。実行力こそが成果を生む。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "情熱・熱意・執念のない人間に、いかに能力があっても何もできない。", author: "永守重信", authorEn: "Shigenobu Nagamori", context: "能力よりも熱意を重視する永守流の人材観。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "成功するまで諦めなければ、それは失敗ではない。", author: "柳井正", authorEn: "Tadashi Yanai", context: "ユニクロ会長兼社長。「一勝九敗」の精神。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "安定志向は、即、衰退の道だ。", author: "柳井正", authorEn: "Tadashi Yanai", context: "変化を恐れず挑戦し続けることの重要性。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "Get Things Done. ─ とにかくやり遂げる。", author: "三木谷浩史", authorEn: "Hiroshi Mikitani", context: "楽天創業者。社内に掲げる「成功のコンセプト」の一つ。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "0.01 の改善を毎日続ければ、1 年後には大きな差になる。", author: "三木谷浩史", authorEn: "Hiroshi Mikitani", context: "日々の小さな改善の積み重ねが事業成長につながる。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "金がないから何もできないという人間は、金があっても何もできない人間である。", author: "藤田田", authorEn: "Den Fujita", context: "日本マクドナルド創業者。言い訳をせず行動することの大切さ。", category: "経営者", era: "20世紀", mbtiHint: "ENTP" },
  { text: "人のやらないことをやる、これが私のモットーである。", author: "井深大", authorEn: "Masaru Ibuka", context: "ソニー創業者。技術者として常に未踏領域に挑む。", category: "経営者", era: "20世紀", mbtiHint: "INTP" },
  { text: "独創はひらめきではなく、執念から生まれる。", author: "井深大", authorEn: "Masaru Ibuka", context: "イノベーションには諦めない執着心が必要。", category: "経営者", era: "20世紀", mbtiHint: "INTP" },
  { text: "他人と比較してものを考える習慣は、必ず人を不幸にする。", author: "盛田昭夫", authorEn: "Akio Morita", context: "ソニー共同創業者。独自の道を歩むことの重要性。", category: "経営者", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "市場調査では未来は分からない。市場は創るものだ。", author: "盛田昭夫", authorEn: "Akio Morita", context: "ウォークマン開発時。需要創造型経営の象徴。", category: "経営者", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "私の名刺の肩書には『社長』とありますが、頭の中はゲーム開発者です。心は…ゲーマーです。", author: "岩田聡", authorEn: "Satoru Iwata", context: "任天堂元社長。経営者になっても作り手・遊び手を忘れない姿勢。", category: "経営者", era: "20-21世紀", mbtiHint: "INFJ" },
  { text: "娯楽は他人がやらないことをやってこそ価値がある。", author: "山内溥", authorEn: "Hiroshi Yamauchi", context: "任天堂を花札屋からゲーム王国に育てた中興の祖。", category: "経営者", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "変化への対応と基本の徹底。", author: "鈴木敏文", authorEn: "Toshifumi Suzuki", context: "セブン-イレブン・ジャパンを築いた経営者。", category: "経営者", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "顧客のためにではなく、顧客の立場で考える。", author: "鈴木敏文", authorEn: "Toshifumi Suzuki", context: "「ために」は提供側、「立場で」こそ真の顧客志向。", category: "経営者", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "転んでもただでは起きるな。", author: "安藤百福", authorEn: "Momofuku Ando", context: "日清食品創業者。チキンラーメンとカップヌードルの生みの親。", category: "経営者", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "事業に失敗するこつ十二か条 — 一、旧来の方法が一番よいと信ずる事。", author: "出光佐三", authorEn: "Sazo Idemitsu", context: "出光興産創業者。変化を拒むことが失敗を招くと戒めた逆説。", category: "経営者", era: "20世紀", mbtiHint: "INTJ" },
  { text: "障子を開けてみよ、外は広いぞ。", author: "豊田佐吉", authorEn: "Sakichi Toyoda", context: "トヨタグループの始祖。視野を広く持ち世界に挑め。", category: "経営者", era: "19-20世紀", mbtiHint: "INTJ" },
  { text: "起業とは、崖から飛び降りながら飛行機を組み立てるようなものだ。", author: "リード・ホフマン", authorEn: "Reid Hoffman", context: "LinkedIn 創業者。スタートアップのリスクとスピード感を象徴。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "もし最初のプロダクトに恥ずかしさを感じないなら、リリースが遅すぎる。", author: "リード・ホフマン", authorEn: "Reid Hoffman", context: "リーンスタートアップ的哲学。", category: "経営者", era: "20-21世紀", mbtiHint: "ENTJ" },
  { text: "成功する人と非常に成功する人の違いは、ほぼすべての事柄に対して『ノー』と言えるかどうかだ。", author: "サム・アルトマン", authorEn: "Sam Altman", context: "OpenAI CEO。集中することの重要性。", category: "経営者", era: "21世紀", mbtiHint: "INTJ" },
  { text: "間違ったことに長く頑張るより、正しいことに早く取り組む方がずっと大事だ。", author: "サム・アルトマン", authorEn: "Sam Altman", context: "努力の方向性こそが成果を決める。", category: "経営者", era: "21世紀", mbtiHint: "INTJ" },
  { text: "誰もやっていないからやらない、ではなく、誰もやっていないからこそやる。", author: "パトリック・コリソン", authorEn: "Patrick Collison", context: "Stripe 共同創業者。未開拓領域への挑戦。", category: "経営者", era: "21世紀", mbtiHint: "INTP" },
  { text: "健全な軽視を持て、不可能と言われることに対する。", author: "ラリー・ペイジ", authorEn: "Larry Page", context: "Google 共同創業者。ムーンショット精神。", category: "経営者", era: "20-21世紀", mbtiHint: "INTP" },
  { text: "10 倍良くする方が、10% 良くするより簡単なことが多い。", author: "ラリー・ペイジ", authorEn: "Larry Page", context: "現状改善より根本からの作り直し。Google 流発想。", category: "経営者", era: "20-21世紀", mbtiHint: "INTP" },
  { text: "私たちはコーヒーを売っているのではなく、人と人がつながる場所を売っている。", author: "ハワード・シュルツ", authorEn: "Howard Schultz", context: "スターバックス元 CEO。サードプレイス哲学。", category: "経営者", era: "20-21世紀", mbtiHint: "ENFJ" },
  { text: "会社が成功している時こそ、最も傷つきやすい。", author: "ハワード・シュルツ", authorEn: "Howard Schultz", context: "好調時の慢心への警鐘。", category: "経営者", era: "20-21世紀", mbtiHint: "ENFJ" },
  { text: "成功した企業のほとんどは、自分自身を共食いするのを恐れない。", author: "リード・ヘイスティングス", authorEn: "Reed Hastings", context: "Netflix 創業者。DVD レンタルから動画配信への自己破壊的転換。", category: "経営者", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "今日が人生で最高の日だ、と毎日思え。", author: "ジャック・マー", authorEn: "Jack Ma", context: "アリババ創業者。困難な状況でも前向きに。", category: "経営者", era: "20-21世紀", mbtiHint: "ENFP" },
  { text: "今日は厳しい、明日はもっと厳しい、しかし明後日は素晴らしい。多くの者は明日の夜に死ぬ。", author: "ジャック・マー", authorEn: "Jack Ma", context: "起業家が乗り越えるべき試練。", category: "経営者", era: "20-21世紀", mbtiHint: "ENFP" },
  { text: "痛みは一時的、勝利は永遠だ。", author: "レイ・ダリオ", authorEn: "Ray Dalio", context: "ブリッジウォーター創業者。痛みと内省こそ進化を生む。", category: "投資家", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "痛み + 内省 = 進歩。", author: "レイ・ダリオ", authorEn: "Ray Dalio", context: "『PRINCIPLES』で示された、失敗から学ぶ方程式。", category: "投資家", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "正しいか間違っているかは重要ではない。重要なのは、正しい時にどれだけ稼ぎ、間違った時にどれだけ失うかだ。", author: "ジョージ・ソロス", authorEn: "George Soros", context: "ヘッジファンド界の伝説。期待値こそ投資の本質。", category: "投資家", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "市場は常に不確実性のなかにある。儲け方は、明白なものに賭けるのではなく、予期せぬものに賭けることだ。", author: "ジョージ・ソロス", authorEn: "George Soros", context: "再帰性理論。市場の非合理性を逆手に取る投資観。", category: "投資家", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "未来を予測することはできない。だが備えることはできる。", author: "ハワード・マークス", authorEn: "Howard Marks", context: "オークツリー・キャピタル創業者。リスク管理の本質。", category: "投資家", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "投資で成功する鍵は、他人と違うことをし、しかも正しくあることだ。", author: "ハワード・マークス", authorEn: "Howard Marks", context: "「セカンドレベル・シンキング」の核心。", category: "投資家", era: "20-21世紀", mbtiHint: "INTJ" },
  { text: "干し草の山から針を探すな。干し草の山ごと買え。", author: "ジョン・ボーグル", authorEn: "John C. Bogle", context: "バンガード創業者・インデックス投資の父。", category: "投資家", era: "20-21世紀", mbtiHint: "ISTJ" },
  { text: "投資家の最大の敵は、出費と感情である。", author: "ジョン・ボーグル", authorEn: "John C. Bogle", context: "コストと心理が長期リターンを蝕む。", category: "投資家", era: "20-21世紀", mbtiHint: "ISTJ" },
  { text: "自分が理解できるものに投資せよ。", author: "ピーター・リンチ", authorEn: "Peter Lynch", context: "マゼラン・ファンドを伝説に育てた運用者。", category: "投資家", era: "20-21世紀", mbtiHint: "ENTP" },
  { text: "株価の下落に備えて準備したり、予測したりしようとして失われたお金の方が、下落そのもので失われたお金よりはるかに多い。", author: "ピーター・リンチ", authorEn: "Peter Lynch", context: "市場タイミングを当てようとする愚への戒め。", category: "投資家", era: "20-21世紀", mbtiHint: "ENTP" },
  { text: "長期的には、我々はみな死んでいる。", author: "ケインズ", authorEn: "John Maynard Keynes", context: "古典派への痛烈な皮肉。政府の積極介入を正当化。", category: "思想家", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "事実が変われば、私は考えを変える。あなたはどうですか?", author: "ケインズ", authorEn: "John Maynard Keynes", context: "持論への執着より現実を見て柔軟に。", category: "思想家", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "自由ほど、その濫用によって信用を失ってきた言葉は他にない。", author: "ハイエク", authorEn: "Friedrich Hayek", context: "『隷従への道』。自由の本質を見失うことへの警鐘。", category: "思想家", era: "20世紀", mbtiHint: "INTP" },
  { text: "経済学の興味深い課題は、人々が実際にはほとんど何も知らないと示すことだ。自分が設計できると思い込んでいるものについて。", author: "ハイエク", authorEn: "Friedrich Hayek", context: "計画経済の不可能性 ─ 「知識の問題」。", category: "思想家", era: "20世紀", mbtiHint: "INTP" },
  { text: "創造的破壊こそが資本主義の本質である。", author: "シュンペーター", authorEn: "Joseph Schumpeter", context: "イノベーション理論の創始者。", category: "思想家", era: "20世紀", mbtiHint: "INTJ" },
  { text: "起業家とは、新しい結合を実行する人である。", author: "シュンペーター", authorEn: "Joseph Schumpeter", context: "アントレプレナーシップの本質を新結合と定義。", category: "思想家", era: "20世紀", mbtiHint: "INTJ" },
  { text: "この世にタダの昼飯はない。", author: "ミルトン・フリードマン", authorEn: "Milton Friedman", context: "ノーベル経済学賞受賞者。経済学の根本。", category: "思想家", era: "20世紀", mbtiHint: "ENTP" },
  { text: "インフレーションは、いつでもどこでも貨幣的現象である。", author: "ミルトン・フリードマン", authorEn: "Milton Friedman", context: "マネタリズムの中核命題。", category: "思想家", era: "20世紀", mbtiHint: "ENTP" },

  // ================================================================
  // 追加バッチ: 西洋哲学・科学・芸術・心理学
  // ================================================================
  { text: "万物は流転する。同じ川に二度入ることはできない。", author: "ヘラクレイトス", authorEn: "Heraclitus", context: "変化こそ宇宙の本質と説いた古代ギリシャの哲学者。", category: "思想家", era: "BC5世紀", mbtiHint: "INTP" },
  { text: "人を悩ませるのは出来事ではなく、出来事についての判断である。", author: "エピクテトス", authorEn: "Epictetus", context: "ストア派。内面の自由を重視。", category: "思想家", era: "1世紀", mbtiHint: "INTJ" },
  { text: "今日できることに全力を尽くせ。それが明日への最良の備えである。", author: "マルクス・アウレリウス", authorEn: "Marcus Aurelius", context: "ローマ皇帝にして『自省録』を著したストア派の哲人。", category: "思想家", era: "2世紀", mbtiHint: "INFJ" },
  { text: "生きている限り、生き方を学び続けよ。", author: "セネカ", authorEn: "Seneca", context: "ローマのストア派哲学者。時間の使い方。", category: "思想家", era: "1世紀", mbtiHint: "INFJ" },
  { text: "すべての高貴なものは、稀であると同時に困難である。", author: "スピノザ", authorEn: "Baruch Spinoza", context: "汎神論を唱えたオランダの合理主義哲学者。", category: "思想家", era: "17世紀", mbtiHint: "INTP" },
  { text: "自分の頭で考える勇気を持て。これが啓蒙の標語である。", author: "カント", authorEn: "Immanuel Kant", context: "ドイツ観念論の祖。", category: "思想家", era: "18世紀", mbtiHint: "INTJ" },
  { text: "理性的なものは現実的であり、現実的なものは理性的である。", author: "ヘーゲル", authorEn: "G.W.F. Hegel", context: "弁証法を体系化したドイツ観念論の哲学者。", category: "思想家", era: "19世紀", mbtiHint: "INTJ" },
  { text: "人生とは欲望と退屈のあいだを揺れ動く振り子である。", author: "ショーペンハウアー", authorEn: "Arthur Schopenhauer", context: "意志と表象の世界を説いた厭世哲学者。", category: "思想家", era: "19世紀", mbtiHint: "INTJ" },
  { text: "人生は前を向いて生きねばならぬが、振り返ってのみ理解される。", author: "キェルケゴール", authorEn: "Søren Kierkegaard", context: "実存主義の先駆者。", category: "思想家", era: "19世紀", mbtiHint: "INFJ" },
  { text: "信じることは、可能なものを生み出す力である。", author: "ウィリアム・ジェームズ", authorEn: "William James", context: "アメリカのプラグマティズム哲学者・心理学者。", category: "思想家", era: "19世紀", mbtiHint: "ENFP" },
  { text: "語りえぬものについては、沈黙しなければならない。", author: "ウィトゲンシュタイン", authorEn: "Ludwig Wittgenstein", context: "言語哲学を切り拓いた哲学者。", category: "思想家", era: "20世紀", mbtiHint: "INTP" },
  { text: "他者の顔は、私に倫理を語りかける最初の言葉である。", author: "レヴィナス", authorEn: "Emmanuel Levinas", context: "他者性の倫理を説いたフランスの現象学者。", category: "思想家", era: "20世紀", mbtiHint: "INFJ" },
  { text: "人間とは存在の意味を問う存在である。", author: "ハイデッガー", authorEn: "Martin Heidegger", context: "『存在と時間』で実存の構造を分析。", category: "思想家", era: "20世紀", mbtiHint: "INTJ" },
  { text: "美は見る人の魂の中にある。", author: "ドストエフスキー", authorEn: "Fyodor Dostoevsky", context: "人間の内面を深く描いたロシアの大文豪。", category: "芸術家", era: "19世紀", mbtiHint: "INFJ" },
  { text: "幸福な家庭はみな似たものだが、不幸な家庭はそれぞれに不幸である。", author: "トルストイ", authorEn: "Leo Tolstoy", context: "『戦争と平和』を著したロシアの文豪。", category: "芸術家", era: "19世紀", mbtiHint: "INFJ" },
  { text: "この世に良いも悪いもない、ただ考え方がそうさせるだけだ。", author: "シェイクスピア", authorEn: "William Shakespeare", context: "英国ルネサンス期を代表する劇作家。", category: "芸術家", era: "16世紀", mbtiHint: "ENFP" },
  { text: "有能な人はつねに学ぶ人である。", author: "ゲーテ", authorEn: "Johann Wolfgang von Goethe", context: "『ファウスト』を著したドイツの詩人・思想家。", category: "芸術家", era: "19世紀", mbtiHint: "ENFJ" },
  { text: "鳥は卵から抜け出ようと戦う。卵は世界だ。", author: "ヘッセ", authorEn: "Hermann Hesse", context: "『デミアン』『シッダールタ』のドイツ作家。", category: "芸術家", era: "20世紀", mbtiHint: "INFP" },
  { text: "冬の真っ只中、私は自分の中に揺るぎない夏があることを知った。", author: "カミュ", authorEn: "Albert Camus", context: "不条理の哲学を文学で表現したフランス作家。", category: "芸術家", era: "20世紀", mbtiHint: "INFJ" },
  { text: "自分自身であること、それ以外のすべてを差し置いて、それが最大の業績である。", author: "エマソン", authorEn: "Ralph Waldo Emerson", context: "アメリカ超越主義を代表する思想家・詩人。", category: "芸術家", era: "19世紀", mbtiHint: "INFJ" },
  { text: "もし君が空中に城を築いたとしても、それは無駄にはならない。今度はその下に土台を築けばよい。", author: "ソロー", authorEn: "Henry David Thoreau", context: "『ウォールデン 森の生活』。", category: "芸術家", era: "19世紀", mbtiHint: "INFP" },
  { text: "心の中の解けないものすべてに対して、忍耐強くあれ。問いそのものを愛せ。", author: "リルケ", authorEn: "Rainer Maria Rilke", context: "繊細な内省を綴ったドイツ語圏の詩人。", category: "芸術家", era: "20世紀", mbtiHint: "INFP" },
  { text: "私が遠くを見ることができたのは、巨人の肩の上に立っていたからだ。", author: "ニュートン", authorEn: "Isaac Newton", context: "古典力学を確立した英国の科学者。", category: "科学者", era: "17世紀", mbtiHint: "INTJ" },
  { text: "人生に怖がるものはなにもない。理解すべきものがあるだけだ。", author: "マリー・キュリー", authorEn: "Marie Curie", context: "放射性物質を発見し二度のノーベル賞を受賞。", category: "科学者", era: "20世紀", mbtiHint: "INTJ" },
  { text: "自分自身を欺いてはいけない。あなたは自分自身を最も欺きやすい人間なのだ。", author: "ファインマン", authorEn: "Richard Feynman", context: "量子電磁力学のアメリカの物理学者。", category: "科学者", era: "20世紀", mbtiHint: "ENTP" },
  { text: "足元を見るのではなく、星を見上げることを忘れないで。", author: "ホーキング", authorEn: "Stephen Hawking", context: "ブラックホール研究の理論物理学者。", category: "科学者", era: "20世紀", mbtiHint: "INTJ" },
  { text: "私たちは星屑でできている。星屑が星々について思いをめぐらせているのだ。", author: "カール・セーガン", authorEn: "Carl Sagan", context: "宇宙の魅力を一般に伝えた天文学者。", category: "科学者", era: "20世紀", mbtiHint: "ENFJ" },
  { text: "もし私が大理石の中に天使を見たならば、彼を解放するまで彫り続けよう。", author: "ミケランジェロ", authorEn: "Michelangelo", context: "ルネサンスを代表する彫刻家・画家・建築家。", category: "芸術家", era: "16世紀", mbtiHint: "INFJ" },
  { text: "夢を描くことから始めよ。それから絵を描けばよい。", author: "ゴッホ", authorEn: "Vincent van Gogh", context: "後期印象派を代表するオランダの画家。", category: "芸術家", era: "19世紀", mbtiHint: "INFP" },
  { text: "私が描きたいのは、私と物体のあいだに横たわる空気である。", author: "モネ", authorEn: "Claude Monet", context: "印象派を切り拓いたフランスの画家。", category: "芸術家", era: "19世紀", mbtiHint: "ISFP" },
  { text: "自然を学べ、自然を愛せよ、自然のそばに留まれ。それは決して君を裏切らない。", author: "フランク・ロイド・ライト", authorEn: "Frank Lloyd Wright", context: "有機的建築を提唱したアメリカの建築家。", category: "芸術家", era: "20世紀", mbtiHint: "INTJ" },
  { text: "家は住むための機械である。", author: "ル・コルビュジエ", authorEn: "Le Corbusier", context: "近代建築の三大巨匠の一人。", category: "芸術家", era: "20世紀", mbtiHint: "INTJ" },
  { text: "夢は無意識への王道である。", author: "フロイト", authorEn: "Sigmund Freud", context: "精神分析学を創始した精神科医。", category: "思想家", era: "20世紀", mbtiHint: "INTJ" },
  { text: "人生とは、解決すべき問題ではなく、生きるべき現実である。", author: "エリク・エリクソン", authorEn: "Erik H. Erikson", context: "発達心理学でアイデンティティ概念を確立。", category: "思想家", era: "20世紀", mbtiHint: "INFJ" },
  { text: "ハンマーしか持っていない人には、すべてが釘に見える。", author: "マズロー", authorEn: "Abraham Maslow", context: "欲求階層説で知られるアメリカの心理学者。", category: "思想家", era: "20世紀", mbtiHint: "ENFJ" },
  { text: "ありのままの自分を受け入れたとき、私は変わることができる。", author: "カール・ロジャーズ", authorEn: "Carl Rogers", context: "来談者中心療法を創始した人間性心理学者。", category: "思想家", era: "20世紀", mbtiHint: "INFJ" },
  { text: "人は意味を求める存在である。なぜ生きるかを知る者は、ほとんどあらゆる如何にして生きるかにも耐える。", author: "フランクル", authorEn: "Viktor Frankl", context: "ロゴセラピー (意味療法) を提唱した精神科医。", category: "思想家", era: "20世紀", mbtiHint: "INFJ" },
  { text: "子どもの最初の社会的世界は、母親との絆である。", author: "ボウルビィ", authorEn: "John Bowlby", context: "愛着理論を提唱した英国の精神科医。", category: "思想家", era: "20世紀", mbtiHint: "INFJ" },
  { text: "私たちは速い思考と遅い思考の二つの心を持っている。", author: "カーネマン", authorEn: "Daniel Kahneman", context: "行動経済学の基礎を築いたノーベル経済学賞受賞者。", category: "思想家", era: "21世紀", mbtiHint: "INTP" },

  // ================================================================
  // 追加バッチ: 東洋思想・霊性・戦略家
  // ================================================================
  { text: "すべての行いは心によって導かれる。心が主であり、心がそれを作り出す。", author: "釈迦", authorEn: "Gautama Buddha", context: "仏教の開祖。心が現実を創造するという根本教義。", category: "霊性", era: "BC5世紀", mbtiHint: "INFJ" },
  { text: "空であるからこそ、すべてが成立する。", author: "龍樹", authorEn: "Nagarjuna", context: "中観派の祖、大乗仏教の哲学者。縁起と空の思想。", category: "霊性", era: "2世紀", mbtiHint: "INTJ" },
  { text: "生まれ生まれ生まれ生まれて生の始めに暗く、死に死に死に死んで死の終わりに冥し。", author: "空海", authorEn: "Kukai", context: "真言宗の開祖、弘法大師。輪廻と無明への深い洞察。", category: "霊性", era: "9世紀", mbtiHint: "INFJ" },
  { text: "一隅を照らす、これすなわち国宝なり。", author: "最澄", authorEn: "Saicho", context: "天台宗の開祖、伝教大師。自分の持ち場で光ることの尊さ。", category: "霊性", era: "9世紀", mbtiHint: "INFJ" },
  { text: "仏道をならふというは、自己をならふなり。自己をならふというは、自己をわするるなり。", author: "道元", authorEn: "Dogen", context: "曹洞宗の開祖。万法と一つになる悟りの境地。", category: "霊性", era: "13世紀", mbtiHint: "INFJ" },
  { text: "善人なをもて往生をとぐ、いはんや悪人をや。", author: "親鸞", authorEn: "Shinran", context: "浄土真宗の開祖。悪人正機説、絶対他力の思想。", category: "霊性", era: "13世紀", mbtiHint: "INFP" },
  { text: "門松は冥土の旅の一里塚、めでたくもありめでたくもなし。", author: "一休", authorEn: "Ikkyu Sojun", context: "臨済宗の禅僧、奇行で知られる。生と死を見つめる風狂の精神。", category: "霊性", era: "15世紀", mbtiHint: "ENTP" },
  { text: "動中の工夫は静中に勝ること百千億倍す。", author: "白隠慧鶴", authorEn: "Hakuin Ekaku", context: "臨済宗中興の祖。日常の中の修行こそが本物の修行。", category: "霊性", era: "18世紀", mbtiHint: "INTJ" },
  { text: "禅とは、自己とは何かを発見することである。", author: "鈴木大拙", authorEn: "D.T. Suzuki", context: "禅を世界に紹介した仏教学者。", category: "思想家", era: "20世紀", mbtiHint: "INTP" },
  { text: "初心者の心には多くの可能性があるが、熟達者の心には少ししかない。", author: "鈴木俊隆", authorEn: "Shunryu Suzuki", context: "サンフランシスコ禅センター創設者。初心の大切さ。", category: "霊性", era: "20世紀", mbtiHint: "INFJ" },
  { text: "歩くために歩きなさい。どこかに到着するためではなく。", author: "ティク・ナット・ハン", authorEn: "Thich Nhat Hanh", context: "ベトナム出身の禅僧、マインドフルネスの指導者。", category: "霊性", era: "20-21世紀", mbtiHint: "INFJ" },
  { text: "あなたが抵抗するものは持続する。あなたが受け入れるものは変容する。", author: "エックハルト・トール", authorEn: "Eckhart Tolle", context: "現代のスピリチュアル指導者。「今ここ」の意識。", category: "霊性", era: "21世紀", mbtiHint: "INFJ" },
  { text: "瞑想とは、私たちが本来そうである歓喜と平和の状態を体験することである。", author: "ヨガナンダ", authorEn: "Paramahansa Yogananda", context: "クリヤヨガを西洋に伝えたヨギ。", category: "霊性", era: "20世紀", mbtiHint: "INFJ" },
  { text: "あなたの本性は幸福そのものである。それを外に求めるのは無知である。", author: "ラマナ・マハルシ", authorEn: "Ramana Maharshi", context: "インドの聖者、自己探求の指導者。", category: "霊性", era: "20世紀", mbtiHint: "INFJ" },
  { text: "真理は道なき大地である。", author: "クリシュナムルティ", authorEn: "Jiddu Krishnamurti", context: "既成の宗教や権威からの自由を説いた哲人。", category: "霊性", era: "20世紀", mbtiHint: "INTJ" },
  { text: "人生は解くべき謎ではなく、生きるべき神秘である。", author: "OSHO", authorEn: "Osho", context: "独自の瞑想を説いたインドの神秘家。", category: "霊性", era: "20世紀", mbtiHint: "ENTP" },
  { text: "もしあなたが幸せでないなら、あなたは人生の意味を失っている。", author: "サドグル", authorEn: "Sadhguru", context: "現代インドのヨギ、イシャ財団創設者。", category: "霊性", era: "21世紀", mbtiHint: "ENFJ" },
  { text: "立ち上がれ、目覚めよ、目標に到達するまで止まるな。", author: "ヴィヴェーカーナンダ", authorEn: "Swami Vivekananda", context: "インドの宗教改革者。不屈の精神。", category: "霊性", era: "19世紀", mbtiHint: "ENFJ" },
  { text: "ヨーガとは心の作用を止滅することである。", author: "パタンジャリ", authorEn: "Patanjali", context: "ヨーガ・スートラの編纂者。古典ヨーガの根本定義。", category: "霊性", era: "BC2世紀頃", mbtiHint: "INTJ" },
  { text: "惻隠の心は仁の端なり。", author: "孟子", authorEn: "Mencius", context: "儒家・性善説。他者を憐れむ心こそ仁の始まり。", category: "思想家", era: "BC4世紀", mbtiHint: "ENFJ" },
  { text: "人の性は悪、その善なる者は偽なり。", author: "荀子", authorEn: "Xunzi", context: "儒家・性悪説。礼によって人は善となる。", category: "思想家", era: "BC3世紀", mbtiHint: "INTJ" },
  { text: "賢主は法を以て人を択び、自ら挙げず。", author: "韓非子", authorEn: "Han Feizi", context: "法家の集大成者。君主は法と制度で統治すべし。", category: "思想家", era: "BC3世紀", mbtiHint: "INTJ" },
  { text: "知行合一。", author: "王陽明", authorEn: "Wang Yangming", context: "明代の儒学者、陽明学の祖。知ることと行うことは一体。", category: "思想家", era: "16世紀", mbtiHint: "INFJ" },
  { text: "格物致知。物に格りて知に致る。", author: "朱熹", authorEn: "Zhu Xi", context: "宋代の儒学者、朱子学の大成者。", category: "思想家", era: "12世紀", mbtiHint: "INTJ" },
  { text: "兼愛非攻。すべての人を分け隔てなく愛し、攻撃を否定せよ。", author: "墨子", authorEn: "Mozi", context: "墨家の祖。無差別の愛と反戦の思想。", category: "思想家", era: "BC5世紀", mbtiHint: "INFJ" },
  { text: "天は人の上に人を造らず、人の下に人を造らずと言えり。", author: "福沢諭吉", authorEn: "Fukuzawa Yukichi", context: "明治の啓蒙思想家、慶應義塾創設者。", category: "思想家", era: "19世紀", mbtiHint: "ENTJ" },
  { text: "私は二つの J を愛する。一つは Jesus、もう一つは Japan。", author: "内村鑑三", authorEn: "Uchimura Kanzo", context: "明治のキリスト教思想家、無教会主義。", category: "思想家", era: "19-20世紀", mbtiHint: "INFJ" },
  { text: "武士道とは、義に生きることである。", author: "新渡戸稲造", authorEn: "Nitobe Inazo", context: "教育者・思想家、『武士道』著者。日本精神を世界に伝えた。", category: "思想家", era: "19-20世紀", mbtiHint: "INFJ" },
  { text: "茶道の本質は、不完全なものを崇拝することにある。", author: "岡倉天心", authorEn: "Okakura Tenshin", context: "美術思想家、『茶の本』著者。日本美学を世界に紹介。", category: "思想家", era: "19-20世紀", mbtiHint: "INFJ" },
  { text: "積小為大。小を積みて大と為す。", author: "二宮尊徳", authorEn: "Ninomiya Sontoku", context: "江戸後期の農政家・思想家。小さな努力の積み重ねが大事を成す。", category: "思想家", era: "19世紀", mbtiHint: "ISTJ" },
  { text: "心の楽しみは命の薬なり。", author: "貝原益軒", authorEn: "Kaibara Ekken", context: "江戸時代の儒学者、『養生訓』著者。心身一如の養生観。", category: "思想家", era: "17-18世紀", mbtiHint: "ISFJ" },
  { text: "不可能という言葉は、私の辞書にはない。", author: "ナポレオン", authorEn: "Napoleon Bonaparte", context: "フランス皇帝、軍事戦略家。不屈の意志。", category: "戦略家", era: "18-19世紀", mbtiHint: "ENTJ" },
  { text: "戦争とは、他の手段をもってする政治の継続にほかならない。", author: "クラウゼヴィッツ", authorEn: "Carl von Clausewitz", context: "『戦争論』。戦争と政治の本質的連続性。", category: "戦略家", era: "19世紀", mbtiHint: "INTJ" },
  { text: "完璧な計画を来週立てるより、良い計画を今日激しく実行せよ。", author: "ジョージ・パットン", authorEn: "George S. Patton", context: "米陸軍の名将。速度と決断の重視。", category: "戦略家", era: "20世紀", mbtiHint: "ESTP" },
  { text: "義務は我々の言語で最も崇高な言葉である。", author: "ロバート・E・リー", authorEn: "Robert E. Lee", context: "南北戦争南軍司令官。名誉と義務に生きた将軍。", category: "戦略家", era: "19世紀", mbtiHint: "ISFJ" },
  { text: "道が見つからなければ、道を作る。", author: "ハンニバル", authorEn: "Hannibal Barca", context: "カルタゴの名将、アルプス越えでローマを脅かした。", category: "戦略家", era: "BC3世紀", mbtiHint: "ENTJ" },
  { text: "賽は投げられた。", author: "ユリウス・カエサル", authorEn: "Julius Caesar", context: "ローマの政治家・軍事指導者。後戻りできない決断。", category: "戦略家", era: "BC1世紀", mbtiHint: "ENTJ" },
  { text: "鳴かぬなら殺してしまえホトトギス。", author: "織田信長", authorEn: "Oda Nobunaga", context: "戦国大名、天下布武。革新と決断の象徴。", category: "戦略家", era: "16世紀", mbtiHint: "ENTJ" },
  { text: "人の一生は重荷を負うて遠き道を行くがごとし。急ぐべからず。", author: "徳川家康", authorEn: "Tokugawa Ieyasu", context: "江戸幕府初代将軍。忍耐と長期的視座の哲学。", category: "戦略家", era: "16-17世紀", mbtiHint: "INTJ" },
  { text: "人は城、人は石垣、人は堀、情けは味方、仇は敵なり。", author: "武田信玄", authorEn: "Takeda Shingen", context: "甲斐の戦国大名。人材こそ最大の財産。", category: "戦略家", era: "16世紀", mbtiHint: "INTJ" },
  { text: "運は天にあり、鎧は胸にあり、手柄は足にあり。", author: "上杉謙信", authorEn: "Uesugi Kenshin", context: "越後の戦国大名、軍神。義と実行を重んじた武将。", category: "戦略家", era: "16世紀", mbtiHint: "INFJ" },
  { text: "戦略上は敵を軽視せよ、戦術上は敵を重視せよ。", author: "毛沢東", authorEn: "Mao Zedong", context: "中国革命の指導者、ゲリラ戦理論家。大局と細部の使い分け。", category: "戦略家", era: "20世紀", mbtiHint: "ENTJ" },
  { text: "傷こそが光の入る場所である。", author: "ルーミー", authorEn: "Rumi", context: "ペルシアのスーフィー詩人。苦しみを通じた神の光。", category: "霊性", era: "13世紀", mbtiHint: "INFP" },
  { text: "私は永遠に、あなたの中に住まうあの完全な存在を愛している。", author: "ハーフィズ", authorEn: "Hafiz", context: "ペルシアのスーフィー詩人。神聖な愛の表現者。", category: "霊性", era: "14世紀", mbtiHint: "INFP" },
  { text: "私の心はあらゆる形を受け入れる、ガゼルの牧場、修道僧の修道院。", author: "イブン・アラビー", authorEn: "Ibn Arabi", context: "アンダルシアのスーフィー神秘家。宗教を超えた愛。", category: "霊性", era: "12-13世紀", mbtiHint: "INFJ" },
  { text: "神が見つかる場所は、自分自身を手放したところである。", author: "マイスター・エックハルト", authorEn: "Meister Eckhart", context: "ドイツのキリスト教神秘家。自我の放棄と神との合一。", category: "霊性", era: "13-14世紀", mbtiHint: "INFJ" },
  { text: "汝の心の内にあって、汝より汝に近きものは神なり。", author: "聖アウグスティヌス", authorEn: "Saint Augustine", context: "古代キリスト教神学者、『告白』著者。", category: "霊性", era: "4-5世紀", mbtiHint: "INFJ" },
  { text: "主よ、私を平和の道具としてお使いください。", author: "聖フランシスコ", authorEn: "Saint Francis of Assisi", context: "アッシジの聖人、清貧の修道士。普遍的な愛。", category: "霊性", era: "12-13世紀", mbtiHint: "INFJ" },
  { text: "聖なる輪の中心で、私は世界の調和を見た。", author: "ブラック・エルク", authorEn: "Black Elk", context: "オグララ・ラコタ族の聖者。ネイティブアメリカンの宇宙観。", category: "霊性", era: "19-20世紀", mbtiHint: "INFJ" },
  { text: "大地は人間に属するのではない、人間が大地に属するのだ。", author: "シアトル酋長", authorEn: "Chief Seattle", context: "スクアミッシュ族の首長。自然との一体性。", category: "霊性", era: "19世紀", mbtiHint: "INFJ" },
  { text: "今日は戦うのに良い日だ、今日は死ぬのに良い日だ。", author: "クレイジー・ホース", authorEn: "Crazy Horse", context: "ラコタ族の戦士・指導者。生死を超えた覚悟。", category: "戦略家", era: "19世紀", mbtiHint: "ISTP" },
];

// ====================================================================
// セレクター関数
// ====================================================================

// 全体から日替わりで 1 件
export function todayQuote(date: Date = new Date()): Quote {
  return pickByDate(QUOTES, date, 801);
}

// カテゴリ別に日替わりで 1 件
export function todayQuoteByCategory(category: QuoteCategory, date: Date = new Date()): Quote | null {
  const filtered = QUOTES.filter((q) => q.category === category);
  if (filtered.length === 0) return null;
  return pickByDate(filtered, date, 802);
}

// MBTI ヒントが INFJ など特定型のものから 1 件
export function todayQuoteByMbti(mbti: string, date: Date = new Date()): Quote | null {
  const filtered = QUOTES.filter((q) => q.mbtiHint === mbti);
  if (filtered.length === 0) return null;
  return pickByDate(filtered, date, 803);
}

// カテゴリの全件
export function quotesByCategory(category: QuoteCategory): Quote[] {
  return QUOTES.filter((q) => q.category === category);
}

// 統計
export const QUOTE_STATS = {
  total: QUOTES.length,
  byCategory: Object.fromEntries(
    (["経営者", "投資家", "思想家", "戦略家", "芸術家", "科学者", "政治家", "霊性"] as QuoteCategory[]).map(
      (c) => [c, QUOTES.filter((q) => q.category === c).length]
    )
  ),
};
