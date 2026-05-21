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

// ============================================================
// 小アルカナ 56枚 (Wands / Cups / Swords / Pentacles 各14枚)
// ============================================================
// num: 大アルカナと衝突しないよう 100+ にオフセット
//   Wands:     100-113 (Ace, 2-10, Page, Knight, Queen, King)
//   Cups:      200-213
//   Swords:    300-313
//   Pentacles: 400-413

// suit ごとに領域別の文脈を生成 — 同じカードでも、恋愛/仕事/総合で異なる解釈
const SUIT_CONTEXT: Record<string, {
  element: string;
  domain: string;
  loveAngle: string;
  workAngle: string;
  adviceVerb: string;
}> = {
  ワンド: {
    element: "火",
    domain: "情熱・行動・創造のフィールド",
    loveAngle: "情熱的な恋・スピード感・主導権",
    workAngle: "起業・営業・プロジェクト立ち上げ・リーダーシップ",
    adviceVerb: "行動に移す",
  },
  カップ: {
    element: "水",
    domain: "感情・関係・霊性のフィールド",
    loveAngle: "感情の深さ・絆・心の通い合い",
    workAngle: "対人サービス・芸術・カウンセリング・癒し",
    adviceVerb: "感じ取る",
  },
  ソード: {
    element: "風",
    domain: "知性・思考・判断・葛藤のフィールド",
    loveAngle: "理性的な選択・言葉のすれ違い・決断",
    workAngle: "意思決定・交渉・分析・法務・契約",
    adviceVerb: "明確に言語化する",
  },
  ペンタクル: {
    element: "地",
    domain: "物質・お金・身体・実務のフィールド",
    loveAngle: "現実的な相性・経済的安定・長期的な関係",
    workAngle: "蓄積・投資・実務・健康・キャリア",
    adviceVerb: "地に足をつけて積み上げる",
  },
};

function mkMinor(
  num: number,
  name: string,
  en: string,
  suit: string,
  upright: string,
  reversed: string,
  keywords: string[]
): TarotCard {
  const ctx = SUIT_CONTEXT[suit];
  const element = ctx?.element ?? "";
  const domain = ctx?.domain ?? suit;
  const loveAngle = ctx?.loveAngle ?? "";
  const workAngle = ctx?.workAngle ?? "";
  const adviceVerb = ctx?.adviceVerb ?? "意識する";
  return {
    num,
    name,
    en,
    upright,
    reversed,
    keywords,
    uprightDetail:
      `${upright} ${suit}（${element}のエネルギー）が${domain}で具体的な形を取って現れる時。` +
      `${keywords.join("・")}のテーマが日常の選択や出来事の中に滲み出る数日〜数週間。` +
      `自分の中の${element}を意識的に活かすと、運の流れが加速する。`,
    reversedDetail:
      `${reversed} ${suit}の${element}が歪み、本来の力が出ない・出し過ぎる・方向を間違えている状態。` +
      `${keywords[0]}が過剰になるか、逆に枯渇しているかのどちらかで、バランスの再調整が必要。` +
      `焦って状況を変えようとせず、まず自分の${element}の使い方を点検すること。`,
    loveUpright:
      `${upright} 恋愛・パートナーシップにおいては、${loveAngle}の側面が前面に出る。` +
      `${keywords[0]}のテーマが二人の関係に影響し、新しい局面を作る可能性。`,
    loveReversed:
      `${reversed} 恋愛では${loveAngle}が裏目に出やすい時期。` +
      `${keywords[0]}が崩れたり、過剰になったりして、関係に歪みを生む。冷静さと対話で軌道修正を。`,
    workUpright:
      `${upright} 仕事では${workAngle}の領域に追い風。` +
      `${keywords[0]}を発揮できる場面が増え、評価や成果に繋がりやすい。`,
    workReversed:
      `${reversed} 仕事の${workAngle}領域で停滞・摩擦・誤算が生じやすい。` +
      `${keywords[0]}を見直し、ペースを落として基盤を固め直すタイミング。`,
    advice:
      `${keywords[0]}と${keywords[1] ?? ""}を意識して${adviceVerb}。` +
      `${suit}（${element}）の流れに逆らわず、しかし主体性を失わずに動くと、運命の歯車が回る。`,
  };
}

// === 棒 / ワンド (火・情熱・行動) ===
const WANDS: TarotCard[] = [
  mkMinor(100, "棒のエース", "Ace of Wands", "ワンド", "新しい情熱の点火。創造の種、起業や挑戦の好機。", "やる気の喪失、空回り、決断の遅れ。", ["情熱", "創造", "始動"]),
  mkMinor(101, "棒の2", "Two of Wands", "ワンド", "計画と展望。世界を俯瞰し選択肢を持つ余裕。", "迷い、視野狭窄、決断不能。", ["計画", "選択", "可能性"]),
  mkMinor(102, "棒の3", "Three of Wands", "ワンド", "船出・展開。蒔いた種が育ち始め広がる時。", "遅延、計画変更、見通しの甘さ。", ["展開", "前進", "海外"]),
  mkMinor(103, "棒の4", "Four of Wands", "ワンド", "祝祭と達成。中間ゴールの喜び、結婚・引越し。", "不安定、祝いの欠如、不完全な達成。", ["祝祭", "安定", "コミュニティ"]),
  mkMinor(104, "棒の5", "Five of Wands", "ワンド", "競争・対立。ライバルとの切磋琢磨で成長する時。", "膠着、無用な対立、内輪揉め。", ["競争", "葛藤", "切磋琢磨"]),
  mkMinor(105, "棒の6", "Six of Wands", "ワンド", "勝利と称賛。努力が認められ、リーダーシップが評価される。", "傲慢、見せかけの勝利、評価の不公平。", ["勝利", "称賛", "リーダー"]),
  mkMinor(106, "棒の7", "Seven of Wands", "ワンド", "防衛と粘り。優位を保ち、外圧に屈しない強さ。", "弱気、譲歩、立場の喪失。", ["防衛", "勇気", "粘り"]),
  mkMinor(107, "棒の8", "Eight of Wands", "ワンド", "急展開・スピード。連絡や情報が一気に動く。", "停滞、遅延、誤解、すれ違い。", ["スピード", "連絡", "急展開"]),
  mkMinor(108, "棒の9", "Nine of Wands", "ワンド", "あと一歩の警戒。ここまで来た、最後の踏ん張り。", "燃え尽き、被害妄想、過剰防衛。", ["忍耐", "警戒", "最後の力"]),
  mkMinor(109, "棒の10", "Ten of Wands", "ワンド", "重荷の極み。責任を抱え過ぎ。ゴールは近いが疲労困憊。", "限界突破、手放し、委任。", ["重荷", "責任", "疲弊"]),
  mkMinor(110, "棒のペイジ", "Page of Wands", "ワンド", "若々しい挑戦者。新しい興味と探究心。", "未熟、飽きやすさ、軽率な行動。", ["探究", "好奇心", "始まり"]),
  mkMinor(111, "棒のナイト", "Knight of Wands", "ワンド", "情熱の冒険者。果敢な行動と冒険心。", "向こう見ず、衝動、暴走。", ["冒険", "情熱", "行動"]),
  mkMinor(112, "棒のクイーン", "Queen of Wands", "ワンド", "魅力的なリーダー女性。自信と社交、明るい存在感。", "嫉妬、見栄、自己中心、感情の暴走。", ["魅力", "自信", "社交"]),
  mkMinor(113, "棒のキング", "King of Wands", "ワンド", "ビジョナリーな経営者。情熱と統率で組織を率いる。", "独裁、傲慢、衝動的決断。", ["ビジョン", "統率", "情熱"]),
];

// === 聖杯 / カップ (水・感情・関係) ===
const CUPS: TarotCard[] = [
  mkMinor(200, "聖杯のエース", "Ace of Cups", "カップ", "新しい愛と感情の始まり。霊性の目覚め、出会い。", "感情の枯渇、愛の停滞、心の閉鎖。", ["愛", "感情", "始まり"]),
  mkMinor(201, "聖杯の2", "Two of Cups", "カップ", "二人の調和。深い結びつき、相思相愛、契約。", "不和、誤解、関係の冷却。", ["調和", "結びつき", "愛"]),
  mkMinor(202, "聖杯の3", "Three of Cups", "カップ", "仲間との喜び。祝祭、女友達、楽しい集い。", "過剰な飲食、表面的な付き合い、グループ崩壊。", ["仲間", "喜び", "祝祭"]),
  mkMinor(203, "聖杯の4", "Four of Cups", "カップ", "倦怠と内省。差し出された機会に気づかない時。", "新しい興味の回復、内省からの目覚め。", ["倦怠", "内省", "停滞"]),
  mkMinor(204, "聖杯の5", "Five of Cups", "カップ", "喪失と後悔。失ったものに目を向けすぎている。", "回復、許し、未来への切り替え。", ["喪失", "後悔", "悲しみ"]),
  mkMinor(205, "聖杯の6", "Six of Cups", "カップ", "懐かしさと純粋な愛。子供時代の幸福、旧友との再会。", "過去への執着、現実逃避、子供っぽさ。", ["懐古", "純粋", "再会"]),
  mkMinor(206, "聖杯の7", "Seven of Cups", "カップ", "幻想と選択。多くの可能性に迷う、夢想。", "現実的な選択、幻想から覚める。", ["幻想", "選択", "夢"]),
  mkMinor(207, "聖杯の8", "Eight of Cups", "カップ", "離別と旅立ち。満たされない関係を捨て新天地へ。", "戻る決意、関係の再構築、引き返し。", ["離別", "旅立ち", "決別"]),
  mkMinor(208, "聖杯の9", "Nine of Cups", "カップ", "願望成就。物質的・感情的な満足、幸福のゴール。", "うぬぼれ、満たされない満足、過食。", ["願望成就", "満足", "幸福"]),
  mkMinor(209, "聖杯の10", "Ten of Cups", "カップ", "家族の調和。理想の家庭、深い絆、虹のような幸福。", "家族不和、価値観のズレ、理想と現実のギャップ。", ["家族", "調和", "幸福"]),
  mkMinor(210, "聖杯のペイジ", "Page of Cups", "カップ", "繊細な感受性。創造的なメッセンジャー。", "傷つきやすさ、情緒不安定、未熟な感情。", ["感受性", "創造", "純粋"]),
  mkMinor(211, "聖杯のナイト", "Knight of Cups", "カップ", "ロマンティックな求愛者。芸術と愛の使者。", "夢想家、不誠実、現実逃避。", ["ロマンス", "芸術", "誘い"]),
  mkMinor(212, "聖杯のクイーン", "Queen of Cups", "カップ", "深い共感力の女性。直感と母性、ヒーラー。", "感情過多、依存、犠牲的、被害者意識。", ["共感", "直感", "癒し"]),
  mkMinor(213, "聖杯のキング", "King of Cups", "カップ", "情緒の統率者。穏やかさと深い包容力。", "感情操作、冷淡、不誠実な共感。", ["包容", "穏やか", "成熟"]),
];

// === 剣 / ソード (風・知性・葛藤) ===
const SWORDS: TarotCard[] = [
  mkMinor(300, "剣のエース", "Ace of Swords", "ソード", "鋭い知性の閃き。真実の認識、決断、突破口。", "誤った判断、思考の混乱、決断の歪み。", ["知性", "真実", "突破"]),
  mkMinor(301, "剣の2", "Two of Swords", "ソード", "決断不能と均衡。目を覆い選択を保留している状態。", "決断の時、視界が開ける、選択を強いられる。", ["保留", "均衡", "葛藤"]),
  mkMinor(302, "剣の3", "Three of Swords", "ソード", "心の痛み・別離。裏切り、深い悲しみ、辛い真実。", "癒しの始まり、痛みからの回復。", ["痛み", "別離", "悲しみ"]),
  mkMinor(303, "剣の4", "Four of Swords", "ソード", "休息と再生。一時的な引き篭もり、瞑想、療養。", "活動再開の時、引き篭もりすぎ。", ["休息", "瞑想", "回復"]),
  mkMinor(304, "剣の5", "Five of Swords", "ソード", "敗北と屈辱、または虚しい勝利。対立の代償。", "和解、後悔、対立の終わり。", ["敗北", "対立", "屈辱"]),
  mkMinor(305, "剣の6", "Six of Swords", "ソード", "穏やかな移行。困難からの脱出、旅立ち、移住。", "移行の遅延、過去への執着、未解決。", ["移行", "脱出", "旅"]),
  mkMinor(306, "剣の7", "Seven of Swords", "ソード", "策略と狡知。秘密の計画、欺瞞、ずる賢さ。", "陰謀の露呈、誠実への回帰、後悔。", ["策略", "欺瞞", "秘密"]),
  mkMinor(307, "剣の8", "Eight of Swords", "ソード", "束縛と無力感。自ら作った檻、見えない可能性。", "束縛からの解放、視界が開ける、自由。", ["束縛", "無力", "自縛"]),
  mkMinor(308, "剣の9", "Nine of Swords", "ソード", "不安と悪夢。夜中に目覚める心配事、罪悪感。", "不安の解消、現実は思ったより悪くない。", ["不安", "悪夢", "心配"]),
  mkMinor(309, "剣の10", "Ten of Swords", "ソード", "どん底と終焉。背後からの裏切り、絶望、強制終了。", "底打ち、回復の始まり、最悪期を抜ける。", ["終焉", "どん底", "裏切り"]),
  mkMinor(310, "剣のペイジ", "Page of Swords", "ソード", "鋭い好奇心。情報収集、批評眼、機敏。", "口先だけ、批判的すぎる、揚げ足取り。", ["好奇心", "知性", "機敏"]),
  mkMinor(311, "剣のナイト", "Knight of Swords", "ソード", "果敢な攻撃者。情熱的な議論、即断即決の行動。", "暴走、向こう見ず、衝動的な攻撃。", ["攻撃", "即断", "情熱"]),
  mkMinor(312, "剣のクイーン", "Queen of Swords", "ソード", "明晰な判断力の女性。独立、鋭い知性、潔さ。", "辛辣、冷淡、孤立、批判的すぎる。", ["明晰", "独立", "潔癖"]),
  mkMinor(313, "剣のキング", "King of Swords", "ソード", "公正な判断者。理性、論理、公平な権威。", "独善、冷酷、権力の濫用、不公平。", ["公正", "論理", "権威"]),
];

// === 金貨 / ペンタクル (地・物質・実務) ===
const PENTACLES: TarotCard[] = [
  mkMinor(400, "金貨のエース", "Ace of Pentacles", "ペンタクル", "豊かさの種。新規事業、財運、健康の好機。", "機会の逸失、財運の停滞、物質の欠乏。", ["豊かさ", "始動", "財"]),
  mkMinor(401, "金貨の2", "Two of Pentacles", "ペンタクル", "バランスとやりくり。複数の役割を器用に回す。", "過負荷、バランス崩壊、優先順位の混乱。", ["バランス", "器用", "やりくり"]),
  mkMinor(402, "金貨の3", "Three of Pentacles", "ペンタクル", "協働の成果。専門技能、チームワーク、職人技。", "技量不足、協力欠如、仕事の質低下。", ["協働", "技能", "成果"]),
  mkMinor(403, "金貨の4", "Four of Pentacles", "ペンタクル", "保守と蓄積。安定確保、所有、財の保全。", "ケチ、執着、流れの停滞、出し惜しみ。", ["保守", "蓄積", "安定"]),
  mkMinor(404, "金貨の5", "Five of Pentacles", "ペンタクル", "物質的困窮。経済難、孤立、助けが見えない時。", "回復の兆し、助けの出現、困窮の終わり。", ["困窮", "孤立", "貧"]),
  mkMinor(405, "金貨の6", "Six of Pentacles", "ペンタクル", "施しと分配。寛大さ、援助の授受、公平な分配。", "不公平な施し、依存、貸し借りのトラブル。", ["分配", "寛大", "援助"]),
  mkMinor(406, "金貨の7", "Seven of Pentacles", "ペンタクル", "忍耐と評価。種まきから収穫までの中間、見直し。", "焦り、努力の徒労感、早すぎる判断。", ["忍耐", "評価", "成長"]),
  mkMinor(407, "金貨の8", "Eight of Pentacles", "ペンタクル", "勤勉と修行。技を磨く時、専門性の向上。", "怠慢、技の停滞、形だけの作業。", ["勤勉", "修行", "技能"]),
  mkMinor(408, "金貨の9", "Nine of Pentacles", "ペンタクル", "経済的自立。優雅な独立、努力の結実、自己実現。", "孤独、形だけの豊かさ、内なる満たされなさ。", ["自立", "豊かさ", "優雅"]),
  mkMinor(409, "金貨の10", "Ten of Pentacles", "ペンタクル", "家門の繁栄。財の継承、家族の永続的豊かさ。", "家族間の財争い、伝統の崩壊、財の停滞。", ["継承", "繁栄", "家族"]),
  mkMinor(410, "金貨のペイジ", "Page of Pentacles", "ペンタクル", "勤勉な学習者。新しい技能の習得、現実的な始まり。", "怠惰、不真面目、機会の浪費。", ["学習", "勤勉", "現実"]),
  mkMinor(411, "金貨のナイト", "Knight of Pentacles", "ペンタクル", "着実な実行者。粘り強さ、職人気質、信頼性。", "頑固、退屈、変化を嫌う、保守的すぎる。", ["着実", "粘り", "信頼"]),
  mkMinor(412, "金貨のクイーン", "Queen of Pentacles", "ペンタクル", "豊かさを育む女性。実務能力、家庭的、母性的経営。", "物質執着、過保護、嫉妬深さ。", ["豊穣", "実務", "母性"]),
  mkMinor(413, "金貨のキング", "King of Pentacles", "ペンタクル", "成功した実業家。財の支配、安定、現実的な統率。", "強欲、保守的、変化を恐れる、お金至上主義。", ["成功", "実業", "安定"]),
];

// 78枚フルデッキ
export const FULL_DECK: TarotCard[] = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES,
];

// フルデッキ版の引き直し関数
export function drawCardsFull(n: number): DrawnCard[] {
  return shuffle(FULL_DECK)
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

export function drawCardsFullSeeded(n: number, seed: number): DrawnCard[] {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const a = FULL_DECK.slice();
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
