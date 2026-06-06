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
