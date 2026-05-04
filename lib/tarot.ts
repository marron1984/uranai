// タロット
// アルゴリズム: 78枚のカード（大アルカナ22 + 小アルカナ56）から
// Fisher–Yates でシャッフルし、各カードに 50% で正逆位置を割り当てる。
// MVPでは大アルカナ22枚を意味データとして実装。

export type TarotCard = {
  num: number;
  name: string;
  en: string;
  upright: string;          // 1行サマリ
  reversed: string;         // 1行サマリ
  keywords: string[];
  // 拡張: 詳細解釈
  uprightDetail: string;    // 正位置の総合解釈
  reversedDetail: string;   // 逆位置の総合解釈
  loveUpright: string;      // 恋愛 正位置
  loveReversed: string;     // 恋愛 逆位置
  workUpright: string;      // 仕事 正位置
  workReversed: string;     // 仕事 逆位置
  advice: string;           // 出たカードからの実践的助言
};

export const MAJOR_ARCANA: TarotCard[] = [
  {
    num: 0, name: "愚者", en: "The Fool",
    upright: "新たな旅立ち、可能性、自由。",
    reversed: "無謀、軽率、優柔不断。",
    keywords: ["始まり", "冒険", "無限の可能性"],
    uprightDetail: "白紙の一歩。経験値ゼロのまま崖に立つが、その身軽さこそが新しい現実を開く力。常識・前例・恐れを脇に置き、衝動的とも見える純粋な好奇心で動くとき、運命が大きく動き出す。",
    reversedDetail: "準備不足のまま見切り発車したり、逆に怖くて踏み出せず時間だけが過ぎている状態。軽率さと臆病さは表裏一体。思考停止での「えいや」と、過剰な分析麻痺の両方を警告している。",
    loveUpright: "予想外の出会いや、既存の関係を白紙に戻して再スタートするチャンス。型にはまらない自由な恋。",
    loveReversed: "気持ちが定まらず相手に振り回されるか、無責任に距離を取る。決断の先送りが関係を冷やす。",
    workUpright: "未経験分野への挑戦、起業、転職、ベンチャー参画など、ゼロから始めることに追い風。",
    workReversed: "計画が甘く実行が空回り。アイデアだけが先走り、形にならない焦り。基礎の積み上げが必要。",
    advice: "完璧な準備を待つな。70%でいい、まず一歩。失敗は始まった人だけに与えられる勲章。",
  },
  {
    num: 1, name: "魔術師", en: "The Magician",
    upright: "創造、意志、行動力。",
    reversed: "技量不足、口先だけ、優柔。",
    keywords: ["創造", "意志", "顕在化"],
    uprightDetail: "あなたの中に必要な道具はすでに揃っている。意志を一点に集中させ、言葉と行動を一致させたとき、思考は現実に変わる。今が顕在化のタイミング。アイデアを形にする好機。",
    reversedDetail: "言葉と行動がバラバラで、口だけが先走るか、能力はあるのに自信不足で出さない状態。技術を磨き直すか、伝え方を見直す必要がある。",
    loveUpright: "あなたの魅力を最大限発揮できる時。意中の相手に積極的に動けば実りやすい。",
    loveReversed: "相手の言葉と行動が一致せず、不信感が募る。または自分が誇張して見せて疲れる。",
    workUpright: "プレゼン・営業・企画立ち上げ・資格取得。スキルを公に表す機会で成功しやすい。",
    workReversed: "実力不足が露呈する場面。背伸びより、いま持っている力を磨き直す時期。",
    advice: "意志は具体的な言葉と行動で現実化する。今日決めた1つを今日中に動かす。それが魔法の作法。",
  },
  {
    num: 2, name: "女教皇", en: "The High Priestess",
    upright: "直感、知性、内なる声。",
    reversed: "感情の不安定、秘密、自己欺瞞。",
    keywords: ["直感", "知恵", "静謐"],
    uprightDetail: "理屈では届かない深い知恵。沈黙の中で耳を澄ますと、答えがすでに自分の内側にあると気づく。研究・学び・霊的な探究に追い風。表に出さず内側で熟成させる時期。",
    reversedDetail: "直感を無視して理屈で動こうとしている、もしくは秘密が露見しそうな緊張感。情報を隠していることが関係を歪ませているケースも。",
    loveUpright: "言葉にしない理解で結ばれる神秘的な関係。プラトニック、または魂のレベルでつながる相手。",
    loveReversed: "気持ちを言葉にできず誤解が深まる。または相手に隠し事があり違和感を感じる。",
    workUpright: "研究・編集・カウンセリング・占術・教育など、知性と直感を使う仕事に好機。",
    workReversed: "情報の選別を誤り、判断にブレが出る。一人で抱え込まず信頼できる相談相手を。",
    advice: "答えは外ではなく内側にある。今夜10分、画面を消して静寂の中で問いを置いてみよ。",
  },
  {
    num: 3, name: "女帝", en: "The Empress",
    upright: "豊かさ、母性、創造性。",
    reversed: "依存、浪費、停滞。",
    keywords: ["豊穣", "愛", "受容"],
    uprightDetail: "豊かさの女神が微笑んでいる。愛・お金・才能・人脈、すべてが循環し増えていく時期。母性の発露、出産、創作物の完成、関係の成熟。今の自分を信じて受け取る勇気を。",
    reversedDetail: "依存・過保護・浪費・停滞。豊かさが甘やかしに変わり、本来の力が眠ってしまう。または妊娠・出産・健康面でのケアが必要。",
    loveUpright: "深い愛、結婚、安定した関係、妊娠。女性性の魅力が花開く時。",
    loveReversed: "母性が重荷になる、過保護で相手の自立を妨げる。あるいは経済的にもたれかかる関係。",
    workUpright: "創作・出産・農業・美容・接客・芸術。育てる・もてなす仕事で実りが大きい。",
    workReversed: "怠惰、努力不足、現状維持。豊かさにあぐらをかいているサイン。",
    advice: "受け取り上手は与え上手の前提。遠慮せずに今ある豊かさを満喫し、それから分け与えよ。",
  },
  {
    num: 4, name: "皇帝", en: "The Emperor",
    upright: "支配、責任、安定。",
    reversed: "横暴、頑固、未熟。",
    keywords: ["権威", "秩序", "実行力"],
    uprightDetail: "リーダーシップと現実構築の力。混沌に秩序をもたらし、長期計画を実行する。男性性、父性、社会的成功、仕事での昇進や立ち上げに最適なエネルギー。",
    reversedDetail: "横暴・独裁・頑固・未熟。力で押し通そうとして反発を招くか、責任を放棄して逃げている状態。",
    loveUpright: "頼りがいのある相手、社会的に成功している人、結婚への現実的な前進。",
    loveReversed: "支配的・抑圧的な関係。力関係のアンバランスが歪みを生む。",
    workUpright: "昇進、独立、組織運営、管理職への抜擢。実力で評価される時期。",
    workReversed: "ワンマン経営の失敗、判断ミス、部下からの離反。柔軟性を取り戻す必要がある。",
    advice: "本物の権威は、責任を引き受ける覚悟から生まれる。命令ではなく、模範を示せ。",
  },
  {
    num: 5, name: "教皇", en: "The Hierophant",
    upright: "伝統、教え、結婚、信頼。",
    reversed: "形式主義、束縛、誤った教え。",
    keywords: ["導き", "信頼", "コミュニティ"],
    uprightDetail: "正統な道、社会的に認められた選択、教師や指導者との出会い。結婚・契約・入学・組織加入など、形を整えることで運勢が安定する。誠実さが鍵。",
    reversedDetail: "古い慣習に縛られすぎて自由を失う、もしくは反逆して規律から外れる。形式と本質のバランスを取り戻す時。",
    loveUpright: "誠実な恋愛、結婚への合意、家族公認の関係、年上の相手。",
    loveReversed: "結婚を急ぎすぎる、または反対される関係。形だけの夫婦関係に注意。",
    workUpright: "資格取得、教育職、宗教関連、伝統産業、組織内での昇格。長く続く道を選ぶ時。",
    workReversed: "古いやり方に固執して時代に取り残される。新しい風を入れる勇気が必要。",
    advice: "伝統は守るためにあるのではなく、活かすためにある。学んだことを自分の言葉で再翻訳せよ。",
  },
  {
    num: 6, name: "恋人", en: "The Lovers",
    upright: "愛、結びつき、選択。",
    reversed: "不和、誘惑、別離。",
    keywords: ["愛", "選択", "調和"],
    uprightDetail: "魂のレベルでの結びつき、運命的な選択、本当に大切なものを見極める瞬間。恋愛だけでなく、人生の岐路で「自分の心が歓ぶ方」を選ぶ勇気が試される。",
    reversedDetail: "誘惑・浮気・関係の不和、または間違った選択への恐れ。今の自分にとって本当に必要なものを見直す必要がある。",
    loveUpright: "理想の相手との出会い、関係の進展、プロポーズ、深い精神的なつながり。",
    loveReversed: "三角関係、浮気、価値観の不一致、別離の予感。",
    workUpright: "理想の仕事との出会い、適性のある分野への転職、信頼できるパートナーシップ。",
    workReversed: "選択ミス、人間関係のもつれ、契約条件の見直し。",
    advice: "頭で選ぶか、心で選ぶか迷ったら、5年後の自分が笑って振り返れる方を選べ。",
  },
  {
    num: 7, name: "戦車", en: "The Chariot",
    upright: "勝利、前進、自制。",
    reversed: "暴走、敗北、停滞。",
    keywords: ["前進", "勝利", "意志力"],
    uprightDetail: "明確な目標と強い意志で困難を突破する時。相反する2つの力（黒白の馬）を制御し、自分の意志で運命を切り拓く。受験・試合・プレゼン・転職など、勝負どころで力を発揮。",
    reversedDetail: "暴走・コントロール喪失・敗北。勢いだけで突っ走り障害物を見落としているか、目的を見失って空回りしている。立ち止まって地図を確認する時。",
    loveUpright: "積極的なアプローチが成功、長距離恋愛・遠距離からの再会、関係の前進。",
    loveReversed: "押しすぎて引かれる、衝動的な行動が誤解を生む、感情の暴走。",
    workUpright: "プロジェクト推進、目標達成、出張・転勤・移動が運を運ぶ。",
    workReversed: "計画頓挫、競合に敗れる、エネルギー不足。戦線縮小も選択肢。",
    advice: "勝利の鍵はスピードではなく方向。アクセルを踏む前にハンドルを握り直せ。",
  },
  {
    num: 8, name: "力", en: "Strength",
    upright: "勇気、忍耐、優しさ。",
    reversed: "弱気、自信喪失、激情。",
    keywords: ["勇気", "克己", "優しさ"],
    uprightDetail: "獅子（情熱・本能）を優しく手なずける乙女の姿。力ずくではなく愛情で困難を乗り越える時。怒りや欲望をなだめ、忍耐強く取り組むことで本物の強さが育つ。",
    reversedDetail: "自信喪失、感情のコントロール不能、自分の弱さに飲まれている状態。あるいは強がって本心を抑え込みすぎている。",
    loveUpright: "粘り強い愛情、相手のすべてを受け入れる優しさ、長期的な信頼関係。",
    loveReversed: "感情のもつれ、嫉妬、執着。冷静さを取り戻す時間が必要。",
    workUpright: "困難な仕事を地道にこなして信頼を獲得、後輩育成、ストレス耐性を試される時。",
    workReversed: "プレッシャー過多で潰れそう、または自分の力を過信して失敗。",
    advice: "本当の強さは、優しくいられる強さ。荒ぶる感情に名前をつけ、対話を試みよ。",
  },
  {
    num: 9, name: "隠者", en: "The Hermit",
    upright: "内省、探求、慎重。",
    reversed: "孤立、頑迷、迷い。",
    keywords: ["内省", "知恵", "孤独"],
    uprightDetail: "灯火を掲げて山に登る賢者。一人になる時間で、本当に大切なものを見極める。喧騒から離れ、瞑想・読書・旅・自然に身を置くことで答えが見えてくる。",
    reversedDetail: "孤立・引きこもり・固執。一人の時間が癒しから逃避に変わっている。または逆に静かに考える時間が足りずに迷走している。",
    loveUpright: "じっくり育てる関係、年齢差のある相手、精神的なつながり、片思いの熟成。",
    loveReversed: "孤独感が募る、相手と心の距離が広がる、独占欲。",
    workUpright: "研究・専門職・コンサル。一人で集中する仕事で成果。資格取得・学び直しに最適。",
    workReversed: "孤独な作業に疲弊、チームから孤立、頑なに自分のやり方を変えない。",
    advice: "答えは外の喧騒の中ではなく、自分の足音だけが響く道で見つかる。一人の時間を作れ。",
  },
  {
    num: 10, name: "運命の輪", en: "Wheel of Fortune",
    upright: "転機、好機、循環。",
    reversed: "悪い流れ、停滞、運の低迷。",
    keywords: ["転機", "運命", "循環"],
    uprightDetail: "運命の歯車が大きく回る瞬間。自分の意志を超えた流れに乗ることで、思いがけない幸運が舞い込む。タイミングが来た。動くか、流れに乗るかの選択を。",
    reversedDetail: "下降運。流れに逆らうほど傷つく時期、無理に動かず守りに徹する。じきに歯車は回り、また上昇する。",
    loveUpright: "予期せぬ出会い、再会、関係の急展開、運命的な縁。",
    loveReversed: "別れ、すれ違い、タイミングの悪さ。今は動かない方が良い。",
    workUpright: "転職・抜擢・受賞・ビジネスチャンス。流れに乗れば一気に飛躍。",
    workReversed: "プロジェクト中止、評価の低下、トレンドからの取り残され。",
    advice: "運は実力の対義語ではなく、実力の一部。準備した者にだけ運の歯車は噛み合う。",
  },
  {
    num: 11, name: "正義", en: "Justice",
    upright: "公平、決断、真実、因果応報。",
    reversed: "不公平、偏見、ごまかし。",
    keywords: ["公平", "判断", "真実"],
    uprightDetail: "天秤と剣を持つ正義の女神。曖昧さを許さず、真実と公平に基づいて決断する時。契約・裁判・査定・評価など、公的な判断で正当な結果が出る。これまでの行いの結果が形になる。",
    reversedDetail: "不公平な扱い、偏った判断、責任逃れ。または自分が他者に公平でなかったツケが回ってくる。バランスを取り戻すことが急務。",
    loveUpright: "対等な関係、誠実な約束、誤解の解消、結婚への合意。",
    loveReversed: "片思いの破綻、不誠実な相手、感情の偏り。冷静な判断が必要。",
    workUpright: "正当な評価、契約成立、裁判・交渉での勝利、公平な人事。",
    workReversed: "不当な評価、契約トラブル、責任の押し付け合い。",
    advice: "感情ではなく事実で測れ。あなたの行いと選択は、必ず時間差で結果として返ってくる。",
  },
  {
    num: 12, name: "吊るされた男", en: "The Hanged Man",
    upright: "犠牲、忍耐、視点の転換、降伏。",
    reversed: "停滞、徒労、執着、無駄な犠牲。",
    keywords: ["忍耐", "転換", "受容"],
    uprightDetail: "逆さ吊りの姿勢で得られる新しい視点。今は動けない、動かない方が良い時期。受け入れと諦めの間にある「降伏」が、次の扉を開く。痛みの先に気づきがある。",
    reversedDetail: "意味のない忍耐を続けている、または自己犠牲が美徳化している。手放すべきものを抱え込んだままになっていないか確認を。",
    loveUpright: "片思いの忍耐、関係の停滞期、相手のために尽くす時期。",
    loveReversed: "報われない献身、執着、別れる勇気が必要なのに留まる。",
    workUpright: "結果が出ないが続ける時期、修行期、転換のための準備期間。",
    workReversed: "無駄な努力、徒労感、続ける意味を失った仕事への執着。",
    advice: "今動けないのは怠惰ではなく、タイミング。世界を逆さに見るからこそ気づくものがある。",
  },
  {
    num: 13, name: "死神", en: "Death",
    upright: "終わりと始まり、変容、再生。",
    reversed: "停滞、変化への抵抗、執着。",
    keywords: ["変容", "終焉", "再生"],
    uprightDetail: "本物の終わりは新しい始まりの前提。古い関係・職場・自己イメージが終わるが、その喪失は次のステージへの脱皮。怖がらず手放した先に、これまでの自分では行けなかった場所が待つ。",
    reversedDetail: "変化への抵抗。終わったものにしがみついて、新しい流れを止めている状態。死神は怖いが、抵抗する方がもっと辛い。",
    loveUpright: "古い関係の終わり、別離、または関係の質的な変化（友人→恋人など）。",
    loveReversed: "終わった関係への未練、復縁への執着、新しい出会いを拒む心。",
    workUpright: "退職、独立、業界転換、ライフワークの発見。古い役割を脱ぐ。",
    workReversed: "辞めるべき仕事を続けている、変化への恐れ、停滞感。",
    advice: "終わりは敗北ではなく卒業。火葬されるのは過去の自分、生き残るのは本質。",
  },
  {
    num: 14, name: "節制", en: "Temperance",
    upright: "調和、節度、融合、忍耐。",
    reversed: "不調和、浪費、衝突、極端。",
    keywords: ["調和", "中庸", "融合"],
    uprightDetail: "二つの杯の間で水を行き来させる天使。相反するものを丁寧に混ぜ合わせ、第三の何かを生み出す力。バランス・節度・対話・統合の時期。急がずゆっくり。",
    reversedDetail: "極端に振れる、不節制、衝突、衝動的な決断。心と体・仕事と家庭など、何かが偏っているサイン。",
    loveUpright: "穏やかで安定した関係、相互理解、結婚生活の調和。",
    loveReversed: "感情の起伏が激しい、価値観のぶつかり、距離の取り方を間違える。",
    workUpright: "チームワーク、合併・提携、長期プロジェクトの安定運営、健康と仕事の両立。",
    workReversed: "ワークライフバランスの崩壊、過剰投資、無計画な散財。",
    advice: "極端を避け、真ん中を歩け。中庸は妥協ではなく、最も持続可能な強さの形。",
  },
  {
    num: 15, name: "悪魔", en: "The Devil",
    upright: "欲望、執着、束縛、官能。",
    reversed: "解放、覚醒、束縛からの自由。",
    keywords: ["執着", "誘惑", "影"],
    uprightDetail: "鎖で繋がれた男女の絵だが、よく見ると鎖は緩く外せる。自分を縛っているのは外的状況ではなく、自分自身の欲望や思い込みかもしれない。お金・性・依存・支配欲が前面に。",
    reversedDetail: "鎖を外し、自由を取り戻す時。長く悩んだ依存から脱する転機、自分を縛る思考パターンに気づく覚醒。",
    loveUpright: "強烈な肉体的・感情的な引力、不倫、執着、抜け出せない関係。",
    loveReversed: "悪縁を切る決意、依存からの卒業、健全な距離感の獲得。",
    workUpright: "金銭欲が強くなる、ブラック企業、欲望に駆動される成功（諸刃）。",
    workReversed: "悪い慣習からの脱却、転職、毒のある人間関係の整理。",
    advice: "あなたの鎖は外せる。誰が鍵を持っているか、目を凝らせ。鏡に映っているのは自分自身。",
  },
  {
    num: 16, name: "塔", en: "The Tower",
    upright: "崩壊、衝撃、解放、覚醒。",
    reversed: "回避、内的崩壊、変化への恐れ。",
    keywords: ["崩壊", "覚醒", "突発"],
    uprightDetail: "雷に打たれて崩れる塔。今まで築いてきたものが突然壊れる衝撃の出来事だが、それは虚構の上に建てられた塔だったから。痛みの先に解放と真実が待つ。逃げずに向き合う勇気を。",
    reversedDetail: "崩壊を先延ばしにしている、または小さな崩壊が連続して起きている。一気に壊れる前に、自分から手放す決断もある。",
    loveUpright: "衝撃的な別れ、相手の真実を知る、関係の急変。",
    loveReversed: "別れる踏ん切りがつかない、関係の劣化を見て見ぬふり。",
    workUpright: "リストラ、会社倒産、突然の異動、価値観の崩壊。",
    workReversed: "辞めるべき仕事に留まる、内部崩壊が進む、改革の遅れ。",
    advice: "崩れたのではなく、解放されたのだ。瓦礫の下から、本物だけが姿を現す。",
  },
  {
    num: 17, name: "星", en: "The Star",
    upright: "希望、霊感、癒し、未来。",
    reversed: "失望、疲弊、自信喪失。",
    keywords: ["希望", "理想", "癒し"],
    uprightDetail: "嵐（塔）の後の静かな夜空に輝く星。傷ついた魂を癒し、長期的な希望と理想を取り戻す時。創造性・芸術性・霊感が冴え、本当に望むものが見えてくる。",
    reversedDetail: "希望を失っている、または夢ばかり見て現実が動いていない。エネルギー回復のための休息と、現実への小さな一歩のバランスを。",
    loveUpright: "理想の相手との出会い、関係の癒し、未来への希望が見える時期。",
    loveReversed: "理想と現実のギャップで疲弊、片思いの長期化、夢見がち。",
    workUpright: "クリエイティブな仕事、長期ビジョンの設定、SNS・PR活動が当たる。",
    workReversed: "ビジョンの不在、モチベーション低下、目立たない働きが認められない。",
    advice: "夜が深いほど星は輝く。今の暗闇は永遠ではない。願いを言葉にし続けよ。",
  },
  {
    num: 18, name: "月", en: "The Moon",
    upright: "不安、無意識、幻想、直感。",
    reversed: "不安の解消、真実の発見、目覚め。",
    keywords: ["不安", "幻", "潜在意識"],
    uprightDetail: "月光に照らされた幻の風景。何が真実で何が幻想か区別がつかない時期。不安や疑念が大きくなりやすい。直感に耳を澄まし、結論を急がないこと。",
    reversedDetail: "霧が晴れて真実が見える、不安の正体に気づく。秘密が明らかになる、または自分が抱えていた幻想を手放す時。",
    loveUpright: "不安定な関係、嘘・隠し事、片思いの不安、嫉妬。",
    loveReversed: "誤解の解消、真実が見える、不安からの解放。",
    workUpright: "情報の混乱、判断ミスのリスク、不誠実な相手との取引に注意。",
    workReversed: "詐欺やトラブルが明るみに出る、隠れていた問題が解決へ向かう。",
    advice: "暗闇の中で答えを焦るな。月が満ちる頃、霧は自然に晴れる。今は感じることが仕事。",
  },
  {
    num: 19, name: "太陽", en: "The Sun",
    upright: "成功、喜び、生命力、達成。",
    reversed: "停滞、虚しさ、エネルギー不足。",
    keywords: ["成功", "生命", "歓喜"],
    uprightDetail: "輝く太陽の下、子どもが裸で笑う絵。すべてが明るく開かれ、努力が祝福され、命のエネルギーが満ち溢れる。妊娠・誕生・結婚・成功・受賞など、明るいニュースの予兆。",
    reversedDetail: "輝きが曇っている、達成感が薄い、成功の後のバーンアウト。エネルギー回復が必要。",
    loveUpright: "公明正大な恋愛、結婚、妊娠、純粋な喜びに満ちた関係。",
    loveReversed: "見せかけの幸せ、虚しさを感じる関係、お互いに本心を出せない。",
    workUpright: "プロジェクト成功、昇進、独立成功、表彰。仕事が楽しい時期。",
    workReversed: "燃え尽き症候群、表面上は順調だが内側で疲弊、評価が空回り。",
    advice: "喜びを遠慮するな。子どものように声を上げて笑える瞬間こそ、人生の本番。",
  },
  {
    num: 20, name: "審判", en: "Judgement",
    upright: "復活、決断、再出発、覚醒。",
    reversed: "後悔、停滞、誤判、過去への執着。",
    keywords: ["再生", "覚醒", "召命"],
    uprightDetail: "天使のラッパで死者が蘇る絵。眠っていた才能・夢・関係が再び呼び覚まされる時。過去を振り返り、本当にやりたかったことに気づく。中断していたものを再開する好機。",
    reversedDetail: "過去の失敗にとらわれて動けない、自分を許せない、決断を先延ばし。今のままでは変われないと頭で分かっていても踏み出せない状態。",
    loveUpright: "復縁の好機、別れた相手との再会、関係の再評価、結婚への決断。",
    loveReversed: "過去の恋への執着、後悔、許せない気持ちが新しい愛を阻む。",
    workUpright: "中断していたプロジェクトの再開、転職での復活、過去の経験が活きる。",
    workReversed: "選択ミスの後悔、変化を拒む、リスタートを切れない。",
    advice: "ラッパの音はもう鳴っている。聞こえているのに動けないのは、決断していないだけ。",
  },
  {
    num: 21, name: "世界", en: "The World",
    upright: "完成、達成、統合、成就。",
    reversed: "未完、停滞、不足、最後の一歩。",
    keywords: ["完成", "統合", "達成"],
    uprightDetail: "踊る人物を四方の象徴が囲む絵。長く取り組んできたものが完成する時。一つのサイクルの終わりであり、次のサイクルの完璧な始まり。世界とのつながりを実感する瞬間。",
    reversedDetail: "あと一歩で完成しないもどかしさ、もしくは「これで本当に完成か？」という迷い。最後の詰めに集中するか、完璧主義を手放すかの判断を。",
    loveUpright: "理想の関係の完成、結婚、長期パートナーシップの安定、世界中で誇れる愛。",
    loveReversed: "結婚の踏み切れなさ、関係の最後の一押しが足りない、地理的な距離。",
    workUpright: "プロジェクト完了、卒業、定年、ライフワークの完成、海外展開。",
    workReversed: "ゴール直前の停滞、最後の課題、海外案件のトラブル。",
    advice: "完成は終わりではなく、扉。一周回ったあなたは、最初のあなたとは別人だ。",
  },
];

export type DrawnCard = {
  num: number;
  name: string;
  en: string;
  keywords: string[];
  isReversed: boolean;
  meaning: string;            // 簡易（1行）
  uprightDetail: string;
  reversedDetail: string;
  loveUpright: string;
  loveReversed: string;
  workUpright: string;
  workReversed: string;
  advice: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(n: number): DrawnCard[] {
  return shuffle(MAJOR_ARCANA)
    .slice(0, n)
    .map((c) => {
      const isReversed = Math.random() < 0.5;
      return {
        num: c.num,
        name: c.name,
        en: c.en,
        keywords: c.keywords,
        isReversed,
        meaning: isReversed ? c.reversed : c.upright,
        uprightDetail: c.uprightDetail,
        reversedDetail: c.reversedDetail,
        loveUpright: c.loveUpright,
        loveReversed: c.loveReversed,
        workUpright: c.workUpright,
        workReversed: c.workReversed,
        advice: c.advice,
      };
    });
}

// シード付きシャッフル（同じシードなら同じ結果）
export function drawCardsSeeded(n: number, seed: number): DrawnCard[] {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const a = MAJOR_ARCANA.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n).map((c) => {
    const isReversed = rnd() < 0.5;
    return {
      num: c.num,
      name: c.name,
      en: c.en,
      keywords: c.keywords,
      isReversed,
      meaning: isReversed ? c.reversed : c.upright,
      uprightDetail: c.uprightDetail,
      reversedDetail: c.reversedDetail,
      loveUpright: c.loveUpright,
      loveReversed: c.loveReversed,
      workUpright: c.workUpright,
      workReversed: c.workReversed,
      advice: c.advice,
    };
  });
}

export const SPREAD_LABELS = {
  one: ["今のあなた"],
  three: ["過去", "現在", "未来"],
} as const;

export type Spread = keyof typeof SPREAD_LABELS;
