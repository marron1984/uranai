// MBTI 16タイプの占断データ
// 各タイプは 4 軸 (E/I, S/N, T/F, J/P) の組み合わせで定義され、
// 認知機能 (Cognitive Functions) のスタックを持つ。
// 占いとの統合: 命式・数秘・タロットと響き合うことで、
// 性格傾向の多面的な確認ができる。

export type MbtiType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type CognitiveFunction =
  | "Ni" | "Ne" | "Si" | "Se"
  | "Ti" | "Te" | "Fi" | "Fe";

export type MbtiAxis = "E/I" | "S/N" | "T/F" | "J/P";

export type MbtiProfile = {
  type: MbtiType;
  name: string;          // 日本語名 (例: 提唱者)
  nickname: string;      // キャッチコピー
  populationRate: string; // 人口比 (例: "1.5%")
  group: "分析家" | "外交官" | "番人" | "探検家";
  groupColor: string;    // 表示用
  oneLine: string;       // 1行サマリ
  description: string;   // 総合解説 (1段落)
  // 4軸の傾向を 1-100 スケールで保存 (内的なバランスの可視化用)
  axes: { ei: number; sn: number; tf: number; jp: number }; // 100 = 後者(I/N/F/P)寄り
  // 認知機能スタック: dominant -> auxiliary -> tertiary -> inferior
  cognitive: { dominant: CognitiveFunction; auxiliary: CognitiveFunction; tertiary: CognitiveFunction; inferior: CognitiveFunction };
  strengths: string[];
  weaknesses: string[];
  careers: string[];      // 向いている職業
  loveStyle: string;      // 恋愛・パートナーシップでの傾向
  parentingStyle: string; // 親としての傾向
  stressors: string[];    // ストレスを感じる状況
  growthPath: string;     // 成長の方向性
  shadow: string;         // 影 (未熟・ストレス時に出やすい傾向)
  famousPeople: string[]; // 有名人例
  bestMatch: MbtiType[];  // 相性が特に良いタイプ
  goodMatch: MbtiType[];  // 相性が良いタイプ
  challenging: MbtiType[];// 課題が多いが学びも深いタイプ
};

// ========================================================
// 認知機能の解説
// ========================================================
export const COGNITIVE_FUNCTION_NAMES: Record<CognitiveFunction, { name: string; full: string; description: string }> = {
  Ni: { name: "Ni", full: "内向直観", description: "未来の本質・パターン・象徴を直感的に捉える機能。点と点をつないで全体像を見通す力。" },
  Ne: { name: "Ne", full: "外向直観", description: "外界からの刺激でアイデアを次々に展開する機能。可能性の探索・連想・水平思考。" },
  Si: { name: "Si", full: "内向感覚", description: "過去の経験を蓄積し参照する機能。具体的・身体的・伝統的な記憶を頼りに動く。" },
  Se: { name: "Se", full: "外向感覚", description: "今・ここの五感情報を即座にキャッチする機能。瞬発力・現場感・身体性。" },
  Ti: { name: "Ti", full: "内向思考", description: "自分の中で論理を組み立てる機能。原理原則・矛盾の発見・概念の精密化。" },
  Te: { name: "Te", full: "外向思考", description: "外界に対して論理を実装する機能。効率・組織化・KPI・実行管理。" },
  Fi: { name: "Fi", full: "内向感情", description: "自分の中の価値観・倫理に従って判断する機能。本物・誠実・個人の信念。" },
  Fe: { name: "Fe", full: "外向感情", description: "他者の感情・場の空気を読み取り調和を作る機能。共感・気配り・チームワーク。" },
};

// ========================================================
// 16タイプの詳細データ
// ========================================================
export const MBTI_PROFILES: Record<MbtiType, MbtiProfile> = {
  // ====== NT 群 (分析家) ======
  INTJ: {
    type: "INTJ",
    name: "建築家",
    nickname: "戦略を立てる孤高の設計者",
    populationRate: "2.1%",
    group: "分析家",
    groupColor: "#7c4dff",
    oneLine: "長期視野と戦略思考。一人で構想し、一気に実装する。",
    description: "INTJ は『未来の青写真を描く設計者』。Ni(内向直観) で本質と長期的な未来像を直感し、Te(外向思考) で効率的に実装する。独立志向が極めて強く、合議より自分の判断を信頼する。一見冷たく見えるが、内側には強い理想と倫理がある。",
    axes: { ei: 80, sn: 85, tf: 25, jp: 25 },
    cognitive: { dominant: "Ni", auxiliary: "Te", tertiary: "Fi", inferior: "Se" },
    strengths: ["長期戦略の立案", "本質を見抜く洞察力", "独立した判断", "膨大な情報の整理", "目標達成への執着"],
    weaknesses: ["他者の感情に鈍感", "頑固さ", "完璧主義で動けない", "傲慢に見られがち", "細部の現実対応"],
    careers: ["経営者", "研究者", "戦略コンサルタント", "投資家", "建築家", "システム設計者"],
    loveStyle: "深く長く愛するタイプ。表現は控えめだが、選んだ相手には全人格で向き合う。表面的な恋愛は嫌悪。",
    parentingStyle: "子の自立と思考力を最重視。甘やかさず、論理的に対話する厳格な親。",
    stressors: ["雑談の長時間", "感情論で押される場面", "計画外の変更", "凡庸さの強要"],
    growthPath: "感情への共感力と、現場の身体性 (Se) を意識的に育てる。一人で抱え込まず、信頼できる人に弱さを見せる勇気を。",
    shadow: "ストレス過多になると、衝動的な散財・暴飲暴食・刹那的な享楽 (Se の暴走) に走りやすい。",
    famousPeople: ["イーロン・マスク", "アイザック・ニュートン", "ニコラ・テスラ", "マーク・ザッカーバーグ"],
    bestMatch: ["ENFP", "ENTP"],
    goodMatch: ["INFJ", "INTP", "ENTJ"],
    challenging: ["ESFP", "ESFJ"],
  },
  INTP: {
    type: "INTP",
    name: "論理学者",
    nickname: "真理を求める内なる哲学者",
    populationRate: "3.3%",
    group: "分析家",
    groupColor: "#7c4dff",
    oneLine: "概念の探究者。論理と整合性を世界の何よりも愛する。",
    description: "INTP は『内なる論理体系を組み立てる哲学者』。Ti(内向思考) で精密な論理を作り、Ne(外向直観) で世界の可能性を探索する。理屈っぽいが、根本の探究心は純粋。役職や権威より、整合性を信じる。",
    axes: { ei: 75, sn: 80, tf: 20, jp: 80 },
    cognitive: { dominant: "Ti", auxiliary: "Ne", tertiary: "Si", inferior: "Fe" },
    strengths: ["論理的思考の精度", "概念化能力", "客観性", "独創的アイデア", "問題の核心を見抜く"],
    weaknesses: ["感情表現の苦手さ", "ルーティンへの抵抗", "完成より探究を優先", "社交の疲弊", "現実より理論"],
    careers: ["研究者", "プログラマー", "数学者", "哲学者", "システムアーキテクト", "発明家"],
    loveStyle: "知的に対等な相手を求める。感情表現は不器用だが、深い対話で結ばれる関係を築く。",
    parentingStyle: "子の好奇心と論理思考を伸ばす。質問を歓迎し、一緒に考える。情緒面はやや弱め。",
    stressors: ["感情の押し付け", "非合理な決定", "細かい現実業務", "人間関係の駆け引き"],
    growthPath: "結論を出して実行する勇気と、他者の感情に気づく Fe を育てる。完璧でない原稿を世に出す訓練を。",
    shadow: "ストレス時には Fe の暴走で『誰も自分を理解していない』という被害感情と過剰反応が出る。",
    famousPeople: ["アルベルト・アインシュタイン", "ビル・ゲイツ", "ルネ・デカルト", "チャールズ・ダーウィン"],
    bestMatch: ["ENTJ", "ENFJ"],
    goodMatch: ["INTJ", "INFJ", "ENTP"],
    challenging: ["ESFJ", "ESTJ"],
  },
  ENTJ: {
    type: "ENTJ",
    name: "指揮官",
    nickname: "ビジョンを実行する指導者",
    populationRate: "1.8%",
    group: "分析家",
    groupColor: "#7c4dff",
    oneLine: "戦略と実行力の権化。組織を動かし、結果を出す。",
    description: "ENTJ は『天性のリーダー』。Te(外向思考) で組織と数字を動かし、Ni(内向直観) で長期の勝ち筋を描く。決断が速く、効率を絶対視する。冷徹に見えるが、ビジョン実現への情熱は誰よりも熱い。",
    axes: { ei: 25, sn: 85, tf: 25, jp: 25 },
    cognitive: { dominant: "Te", auxiliary: "Ni", tertiary: "Se", inferior: "Fi" },
    strengths: ["卓越したリーダーシップ", "決断力", "戦略実行", "組織化", "目標達成"],
    weaknesses: ["傲慢に見られる", "他者の感情軽視", "せっかち", "他人の遅さに苛立つ", "弱みを認めない"],
    careers: ["CEO", "経営戦略", "投資銀行", "政治家", "起業家", "M&Aアドバイザー"],
    loveStyle: "対等にチャレンジしてくれる相手を好む。愛情表現は行動で示すタイプ。",
    parentingStyle: "子に高い目標を設定し、達成を期待する。厳しいが公正な親。",
    stressors: ["無能・非効率", "感情論", "細かい指示を受ける", "決められない人"],
    growthPath: "他者の感情を尊重する Fi を育てる。勝つだけでなく『誰を犠牲にしているか』を意識する。",
    shadow: "ストレス時には Fi の暴走で、突然の感情爆発・自己嫌悪・引きこもりが起きる。",
    famousPeople: ["スティーブ・ジョブズ", "ナポレオン・ボナパルト", "マーガレット・サッチャー", "ゴードン・ラムゼイ"],
    bestMatch: ["INTP", "INFP"],
    goodMatch: ["ENFJ", "ENTJ", "INTJ"],
    challenging: ["ISFP", "INFP"],
  },
  ENTP: {
    type: "ENTP",
    name: "討論者",
    nickname: "常識を撃ち抜く知的なエンジン",
    populationRate: "3.2%",
    group: "分析家",
    groupColor: "#7c4dff",
    oneLine: "アイデアの嵐。あらゆる前提を疑い、新しい可能性を開く。",
    description: "ENTP は『可能性の探索者』。Ne(外向直観) で次々と新しい着想を生み、Ti(内向思考) で論理的に磨く。議論を愛し、退屈を最も恐れる。型破りで、しばしば誤解されるが、世界を進歩させる役を担う。",
    axes: { ei: 30, sn: 80, tf: 30, jp: 80 },
    cognitive: { dominant: "Ne", auxiliary: "Ti", tertiary: "Fe", inferior: "Si" },
    strengths: ["独創的な発想", "議論・討論", "柔軟性", "前提を疑う力", "リスクテイク"],
    weaknesses: ["飽きっぽさ", "ルーティン軽視", "詰めの甘さ", "挑発的になりがち", "実行が苦手"],
    careers: ["起業家", "クリエイティブディレクター", "弁護士", "発明家", "コンサル", "メディア"],
    loveStyle: "知的刺激のある相手を好む。情熱的だが飽きやすく、関係が惰性化すると離れる。",
    parentingStyle: "子と一緒にアイデアで遊ぶ親。自由を尊重するが、ルーティンは苦手。",
    stressors: ["反復作業", "感情論で締め付けられる", "細部のチェック", "保守的な空気"],
    growthPath: "アイデアを最後まで形にする Si と Te を育てる。途中で飽きずに完成させる訓練。",
    shadow: "ストレス時には Si の暴走で『過去の失敗の反芻』『身体の不調への過剰反応』が起きる。",
    famousPeople: ["レオナルド・ダ・ヴィンチ", "トーマス・エジソン", "マーク・トウェイン", "ロバート・ダウニー・Jr."],
    bestMatch: ["INFJ", "INTJ"],
    goodMatch: ["ENFP", "ENTJ", "ENTP"],
    challenging: ["ISFJ", "ISTJ"],
  },

  // ====== NF 群 (外交官) ======
  INFJ: {
    type: "INFJ",
    name: "提唱者",
    nickname: "静かな預言者・魂の翻訳者",
    populationRate: "1.5%",
    group: "外交官",
    groupColor: "#c8a268",
    oneLine: "深い洞察と理想を持つ稀少な賢者。見えない真実を地上に翻訳する。",
    description: "INFJ は最も希少な型 (人口の約 1.5%)。Ni(内向直観) で本質と未来を見通し、Fe(外向感情) で人と場を温かく包む。内側に強い理想と倫理を持ち、表向きは穏やかでも、譲れない核がある。多くは『なんとなくいつも違和感がある』と感じながら育つが、その違和感こそが鋭い洞察力の源泉。教師・カウンセラー・思想家・芸術家として、人類の魂を磨く役を担う。",
    axes: { ei: 75, sn: 80, tf: 70, jp: 25 },
    cognitive: { dominant: "Ni", auxiliary: "Fe", tertiary: "Ti", inferior: "Se" },
    strengths: ["未来を見通す直感", "深い洞察力", "人を温かく包む共感", "理想を貫く意志", "言葉にできない真実を翻訳する力", "静かなカリスマ", "公正な判断", "創造性"],
    weaknesses: ["完璧主義で動けない", "繊細すぎて消耗", "自分を犠牲にしがち", "本心を言語化するのが遅い", "計画外の変更に弱い", "燃え尽きやすい", "孤独に陥りやすい"],
    careers: ["カウンセラー・心理療法士", "作家・思想家", "教育者・大学教員", "占術家・ヒーラー", "経営者 (理念型)", "コンサル (組織開発)", "宗教家・哲学者", "芸術家"],
    loveStyle: "魂のレベルで繋がれる相手を求める。一目惚れより、深い対話で結ばれる関係。一度愛したら長く、しかし裏切られると静かに完全に去る。",
    parentingStyle: "子の魂を尊重する親。命令より問いかけ、規律と自由のバランスを大事にする。子の本質を見抜き、引き出す才能がある。",
    stressors: ["大人数の浅い社交", "ノイズの多い環境", "倫理に反する場面", "本心を強要される", "結論を急かされる", "自分の理想と現実のギャップ"],
    growthPath: "Se (今・ここの身体性) を意識的に育てる。理想だけでなく身体を動かす、自然と触れる、現場に出る。Ti を磨いて感情と論理のバランスを取る。",
    shadow: "ストレス時には Se の暴走で、突然の衝動買い・暴飲暴食・極端な感覚刺激への没入が起きる。または完全な引きこもりと無感覚化。",
    famousPeople: ["カール・ユング", "プラトン", "ガンディー", "マザー・テレサ", "ニコール・キッドマン", "ナタリー・ポートマン"],
    bestMatch: ["ENFP", "ENTP"],
    goodMatch: ["INFJ", "INTJ", "INFP", "ENFJ"],
    challenging: ["ESTP", "ESTJ"],
  },
  INFP: {
    type: "INFP",
    name: "仲介者",
    nickname: "理想を抱く詩人",
    populationRate: "4.4%",
    group: "外交官",
    groupColor: "#c8a268",
    oneLine: "深い感受性と内なる価値観で生きる、優しい理想主義者。",
    description: "INFP は『内なる価値観の詩人』。Fi(内向感情) で自分の信念に従い、Ne(外向直観) で世界の可能性を見る。表面は柔らかいが、内側には鋼の信念がある。芸術・文学・癒し・社会変革の領域で力を発揮する。",
    axes: { ei: 75, sn: 75, tf: 75, jp: 80 },
    cognitive: { dominant: "Fi", auxiliary: "Ne", tertiary: "Si", inferior: "Te" },
    strengths: ["深い共感力", "創造性", "誠実さ", "理想への忠実", "言葉の繊細さ"],
    weaknesses: ["決断の遅さ", "完璧主義で進まない", "現実より理想", "傷つきやすさ", "実務の苦手さ"],
    careers: ["作家・詩人", "カウンセラー", "アーティスト", "NPO・社会起業", "編集者", "翻訳家"],
    loveStyle: "魂で繋がる深い愛を求める。一度愛したら深く長い。表面的な恋愛は受け付けない。",
    parentingStyle: "子の個性と感受性を尊重する優しい親。自由を与え、心の対話を大事にする。",
    stressors: ["価値観に反する仕事", "数値・KPI 至上主義", "対立・批判", "騒がしい環境"],
    growthPath: "Te を育てて構想を形にする。完璧でなくても発信する勇気を。",
    shadow: "ストレス時には Te の暴走で、突然の独裁的態度・他者への過剰なコントロール欲が出る。",
    famousPeople: ["ウィリアム・シェイクスピア", "J.R.R. トールキン", "オードリー・ヘプバーン", "ジョニー・デップ"],
    bestMatch: ["ENFJ", "ENTJ"],
    goodMatch: ["INFJ", "INFP", "ENFP"],
    challenging: ["ESTJ", "ESTP"],
  },
  ENFJ: {
    type: "ENFJ",
    name: "主人公",
    nickname: "人を導くカリスマ的指導者",
    populationRate: "2.5%",
    group: "外交官",
    groupColor: "#c8a268",
    oneLine: "人の可能性を信じ、引き出し、組織を温かくまとめる天性のリーダー。",
    description: "ENFJ は『人を育てるリーダー』。Fe(外向感情) で場の空気と人の感情を読み、Ni(内向直観) で長期ビジョンを描く。カリスマ性があり、人を動かす言葉の力を持つ。教育者・経営者・政治家として組織を動かす。",
    axes: { ei: 25, sn: 75, tf: 75, jp: 25 },
    cognitive: { dominant: "Fe", auxiliary: "Ni", tertiary: "Se", inferior: "Ti" },
    strengths: ["カリスマ性", "人を引き出す力", "共感力", "ビジョン", "コミュニケーション"],
    weaknesses: ["自己犠牲", "他者の評価に依存", "感情の波", "決断の主観性", "自分の感情後回し"],
    careers: ["教育者", "経営者 (理念型)", "コーチ", "政治家", "牧師", "NPO リーダー"],
    loveStyle: "深く愛するタイプ。相手の成長を支え、相手も自分を高めてくれる関係を理想とする。",
    parentingStyle: "子の可能性を信じ、引き出す情熱的な親。子の自尊心と社会性を育てる。",
    stressors: ["対立・不和", "誰かを傷つける場面", "孤立", "自分の本心がわからなくなる時"],
    growthPath: "Ti を育てて客観的判断を磨く。自分を後回しにせず、自分のケアを優先する。",
    shadow: "ストレス時には Ti の暴走で、批判的・冷たい態度や、すべてを論理で切り捨てる傾向が出る。",
    famousPeople: ["バラク・オバマ", "オプラ・ウィンフリー", "マーティン・ルーサー・キング", "ジョン・F・ケネディ"],
    bestMatch: ["INFP", "ISFP"],
    goodMatch: ["INTP", "INFJ", "ENFJ"],
    challenging: ["ISTP", "INTP"],
  },
  ENFP: {
    type: "ENFP",
    name: "運動家",
    nickname: "可能性を撒く陽気な創造者",
    populationRate: "6.3%",
    group: "外交官",
    groupColor: "#c8a268",
    oneLine: "人とアイデアに恋する自由な魂。場を明るくし、可能性の種を撒く。",
    description: "ENFP は『情熱と可能性の運動家』。Ne(外向直観) で世界の可能性を爆発的に開き、Fi(内向感情) で自分の信念に従う。明るく社交的だが、内側には深い感受性と信念がある。クリエイティブと人との交流が両輪。",
    axes: { ei: 30, sn: 75, tf: 75, jp: 80 },
    cognitive: { dominant: "Ne", auxiliary: "Fi", tertiary: "Te", inferior: "Si" },
    strengths: ["創造性", "人を惹きつける魅力", "共感", "柔軟性", "新しい可能性を見る力"],
    weaknesses: ["飽きっぽさ", "実行力の弱さ", "細部の苦手さ", "感情の波", "確約を嫌う"],
    careers: ["クリエイティブ職", "マーケター", "プロデューサー", "教育者", "ジャーナリスト", "起業家"],
    loveStyle: "情熱的で深い愛。一目惚れも多いが、関係が惰性化すると刺激を求めて離れがち。",
    parentingStyle: "子と一緒に遊び、可能性を一緒に夢見る親。規律よりインスピレーション。",
    stressors: ["ルーティン", "細かい数字", "制約", "保守的な空気"],
    growthPath: "Si と Te を育てて構想を形にする。最後まで完成させる粘り強さを身につける。",
    shadow: "ストレス時には Si の暴走で、過去の失敗の反芻・身体不調への過剰反応・突然の悲観主義が出る。",
    famousPeople: ["ロビン・ウィリアムズ", "ウィル・スミス", "クエンティン・タランティーノ", "サンドラ・ブロック"],
    bestMatch: ["INFJ", "INTJ"],
    goodMatch: ["ENFP", "ENTP", "ENFJ"],
    challenging: ["ISTJ", "ESTJ"],
  },

  // ====== SJ 群 (番人) ======
  ISTJ: {
    type: "ISTJ",
    name: "管理者",
    nickname: "誠実な守護者",
    populationRate: "11.6%",
    group: "番人",
    groupColor: "#4a7c4e",
    oneLine: "伝統と責任を守る、揺るぎない実務家。",
    description: "ISTJ は『約束を絶対に守る誠実な実務家』。Si(内向感覚) で過去の経験と伝統を蓄積し、Te(外向思考) で効率的に実行する。地味だが信頼の塊。組織の屋台骨を支える役。",
    axes: { ei: 80, sn: 25, tf: 30, jp: 25 },
    cognitive: { dominant: "Si", auxiliary: "Te", tertiary: "Fi", inferior: "Ne" },
    strengths: ["責任感", "誠実さ", "実務能力", "計画性", "信頼性"],
    weaknesses: ["変化に弱い", "頑固さ", "感情表現の苦手さ", "新しい発想への抵抗", "完璧主義"],
    careers: ["公務員", "会計士", "監査", "弁護士", "エンジニア", "管理職"],
    loveStyle: "長期安定の関係。派手さはないが、誠実な信頼で結ばれる結婚向きの愛情。",
    parentingStyle: "規律と責任を教える厳格な親。約束を必ず守ることを身をもって示す。",
    stressors: ["突然の変更", "曖昧な指示", "感情の押し付け", "規則違反"],
    growthPath: "Ne を育てて柔軟性を持つ。『正しさ』だけでなく『新しさ』も受け入れる練習を。",
    shadow: "ストレス時には Ne の暴走で、被害妄想的な未来予測・パニック・過剰な悲観が出る。",
    famousPeople: ["ジョージ・ワシントン", "ウォーレン・バフェット", "ナタリー・ポートマン", "アンゲラ・メルケル"],
    bestMatch: ["ESFP", "ESTP"],
    goodMatch: ["ISFJ", "ISTJ", "ESTJ"],
    challenging: ["ENFP", "ENTP"],
  },
  ISFJ: {
    type: "ISFJ",
    name: "擁護者",
    nickname: "静かに人を支える献身者",
    populationRate: "13.8%",
    group: "番人",
    groupColor: "#4a7c4e",
    oneLine: "細やかな気配りと深い思いやりで、家族と職場を支える縁の下の力持ち。",
    description: "ISFJ は『細やかな配慮の達人』。Si(内向感覚) で過去の経験を活かし、Fe(外向感情) で人を温かく支える。表に出ないが、誰よりも家族と組織を支えている。看護師・教師・秘書として最高の力を発揮。",
    axes: { ei: 80, sn: 25, tf: 75, jp: 25 },
    cognitive: { dominant: "Si", auxiliary: "Fe", tertiary: "Ti", inferior: "Ne" },
    strengths: ["細やかな気配り", "責任感", "実務能力", "共感力", "忠誠心"],
    weaknesses: ["自己主張の弱さ", "変化に弱い", "自己犠牲", "ノーと言えない", "我慢のしすぎ"],
    careers: ["看護師", "教師", "秘書", "カウンセラー", "栄養士", "ソーシャルワーカー"],
    loveStyle: "献身的で深い愛。相手の細やかなニーズに気づき、長く支える結婚向きの愛情。",
    parentingStyle: "子の細やかな世話を惜しまない献身的な親。安全基地として最高。",
    stressors: ["対立", "感謝されない場面", "急な変更", "自己主張を求められる時"],
    growthPath: "Ne を育てて新しい可能性を受け入れる。Ti で自分の意見を持つ訓練を。",
    shadow: "ストレス時には Ne の暴走で、過剰な未来不安・パニック・極端な悲観が出る。",
    famousPeople: ["マザー・テレサ", "ローザ・パークス", "ケイト・ミドルトン", "ハル・ベリー"],
    bestMatch: ["ESTP", "ESFP"],
    goodMatch: ["ISFJ", "ISFP", "ESFJ"],
    challenging: ["ENTP", "ENTJ"],
  },
  ESTJ: {
    type: "ESTJ",
    name: "幹部",
    nickname: "秩序を作る実行型リーダー",
    populationRate: "8.7%",
    group: "番人",
    groupColor: "#4a7c4e",
    oneLine: "組織を効率的に動かす実務的リーダー。秩序と結果を両立する。",
    description: "ESTJ は『秩序の番人』。Te(外向思考) で組織と業務を効率化し、Si(内向感覚) で伝統と実績を尊重する。決断が早く、責任を負うことを恐れない。中間管理職・経営幹部・公務員のトップとして力を発揮。",
    axes: { ei: 25, sn: 25, tf: 30, jp: 25 },
    cognitive: { dominant: "Te", auxiliary: "Si", tertiary: "Ne", inferior: "Fi" },
    strengths: ["リーダーシップ", "実行力", "組織化", "責任感", "効率追求"],
    weaknesses: ["頑固さ", "感情の軽視", "型にはまる", "新しい発想への抵抗", "ワーカホリック"],
    careers: ["管理職", "経営者", "軍人", "警察官", "政治家", "プロジェクトマネジャー"],
    loveStyle: "現実的で安定した関係。デート・記念日を大事にする伝統的な愛情表現。",
    parentingStyle: "規律と責任を教える親。子の自立を求め、甘やかさない。",
    stressors: ["非効率", "規則違反", "感情論", "曖昧な指示"],
    growthPath: "Fi を育てて他者の感情を尊重する。『勝つ』だけでなく『誰を尊重するか』を意識。",
    shadow: "ストレス時には Fi の暴走で、感情爆発・突然の引きこもり・自己嫌悪が出る。",
    famousPeople: ["フランク・シナトラ", "ヘンリー・フォード", "ミシェル・オバマ", "ジュディ・ジャッジ"],
    bestMatch: ["ISTP", "ISFP"],
    goodMatch: ["ISTJ", "ESTJ", "ENTJ"],
    challenging: ["INFP", "ISFP"],
  },
  ESFJ: {
    type: "ESFJ",
    name: "領事",
    nickname: "コミュニティの温かい中心",
    populationRate: "12.3%",
    group: "番人",
    groupColor: "#4a7c4e",
    oneLine: "人を結びつけ、場を温め、組織のハートを担う社交家。",
    description: "ESFJ は『コミュニティのハート』。Fe(外向感情) で人と場の空気を温かくまとめ、Si(内向感覚) で伝統と細部を大切にする。誰かのために動くことが原動力で、教育・看護・接客で本領発揮する。",
    axes: { ei: 25, sn: 25, tf: 75, jp: 25 },
    cognitive: { dominant: "Fe", auxiliary: "Si", tertiary: "Ne", inferior: "Ti" },
    strengths: ["社交性", "気配り", "責任感", "コミュニケーション力", "実務能力"],
    weaknesses: ["他者評価への依存", "対立を避けすぎる", "自己犠牲", "感情の波", "保守的"],
    careers: ["教師", "看護師", "ホスピタリティ", "イベント企画", "人事", "営業"],
    loveStyle: "結婚と家族を最重視。記念日・行事を大事にし、家庭を温かく作り上げる。",
    parentingStyle: "細やかな世話と社会性を教える親。子の友人関係も気を配る。",
    stressors: ["対立", "孤立", "感謝されない", "細かい批判を受ける"],
    growthPath: "Ti を育てて客観的判断を磨く。自分の本心を優先する勇気を。",
    shadow: "ストレス時には Ti の暴走で、批判的・冷たい態度や論理で人を切り捨てる傾向が出る。",
    famousPeople: ["テイラー・スウィフト", "ヒュー・ジャックマン", "サリー・フィールド", "アン・ハサウェイ"],
    bestMatch: ["ISFP", "ISTP"],
    goodMatch: ["ESFJ", "ISFJ", "ENFJ"],
    challenging: ["INTP", "INTJ"],
  },

  // ====== SP 群 (探検家) ======
  ISTP: {
    type: "ISTP",
    name: "巨匠",
    nickname: "手と理屈で世界を解く職人",
    populationRate: "5.4%",
    group: "探検家",
    groupColor: "#d4a14a",
    oneLine: "手を動かして問題を解く、寡黙な実践派の職人。",
    description: "ISTP は『手で考える職人』。Ti(内向思考) で論理を組み立て、Se(外向感覚) で今・ここの現実に対応する。寡黙だが、いざという時の問題解決能力は群を抜く。エンジニア・職人・パイロットに多い。",
    axes: { ei: 75, sn: 25, tf: 25, jp: 80 },
    cognitive: { dominant: "Ti", auxiliary: "Se", tertiary: "Ni", inferior: "Fe" },
    strengths: ["問題解決能力", "実践力", "冷静さ", "技術力", "適応力"],
    weaknesses: ["感情表現の苦手さ", "長期計画の苦手さ", "コミット忌避", "孤立傾向", "退屈に弱い"],
    careers: ["エンジニア", "職人", "パイロット", "外科医", "メカニック", "アスリート"],
    loveStyle: "自由を尊重する関係。束縛を嫌うが、選んだ相手には誠実に行動で愛を示す。",
    parentingStyle: "子に手を出さず、自分でやらせる親。実践と現場経験を重視。",
    stressors: ["束縛", "感情の押し付け", "長時間の会議", "ルーティン"],
    growthPath: "Fe を育てて他者の感情に気づく。コミットメントを恐れない訓練を。",
    shadow: "ストレス時には Fe の暴走で、突然の感情爆発・依存・人間関係の急変が起きる。",
    famousPeople: ["クリント・イーストウッド", "マイルス・デイビス", "スカーレット・ヨハンソン", "トム・クルーズ"],
    bestMatch: ["ESFJ", "ESTJ"],
    goodMatch: ["ISTP", "ESTP", "ISFP"],
    challenging: ["ENFJ", "INFJ"],
  },
  ISFP: {
    type: "ISFP",
    name: "冒険家",
    nickname: "美と感性で生きる魂の芸術家",
    populationRate: "8.8%",
    group: "探検家",
    groupColor: "#d4a14a",
    oneLine: "繊細な感性と内なる価値観で、美しい瞬間を生きる芸術家。",
    description: "ISFP は『感性の冒険家』。Fi(内向感情) で自分の価値観に従い、Se(外向感覚) で美と五感を楽しむ。芸術家・デザイナー・料理人として、感性で世界を彩る。表面は穏やかだが、内側には鋼の信念。",
    axes: { ei: 75, sn: 25, tf: 75, jp: 80 },
    cognitive: { dominant: "Fi", auxiliary: "Se", tertiary: "Ni", inferior: "Te" },
    strengths: ["感性", "芸術性", "誠実さ", "適応力", "実践的な美意識"],
    weaknesses: ["決断の遅さ", "競争への弱さ", "実務の苦手さ", "感情の波", "自己主張の弱さ"],
    careers: ["アーティスト", "デザイナー", "料理人", "音楽家", "写真家", "セラピスト"],
    loveStyle: "深く繊細な愛。表現は控えめだが、行動と細やかな気遣いで愛を示す。",
    parentingStyle: "子の個性と感性を尊重する優しい親。一緒に自然や芸術を楽しむ。",
    stressors: ["価値観に反する仕事", "競争", "対立", "批判"],
    growthPath: "Te を育てて構想を形にする。自分の感性を世に出す勇気を。",
    shadow: "ストレス時には Te の暴走で、突然の独裁的態度・他者へのコントロール欲が出る。",
    famousPeople: ["マイケル・ジャクソン", "ボブ・ディラン", "オードリー・ヘプバーン", "リアーナ"],
    bestMatch: ["ESFJ", "ESTJ", "ENFJ"],
    goodMatch: ["ISFP", "ESFP", "INFP"],
    challenging: ["ENTJ", "ESTJ"],
  },
  ESTP: {
    type: "ESTP",
    name: "起業家",
    nickname: "現場で勝負する行動派",
    populationRate: "4.3%",
    group: "探検家",
    groupColor: "#d4a14a",
    oneLine: "今・ここを楽しみ、リスクを取って結果を出す行動派。",
    description: "ESTP は『現場のリーダー』。Se(外向感覚) で今・ここの状況を瞬時に読み、Ti(内向思考) で論理的に判断する。スピード・スリル・現場感を愛し、ビジネス・スポーツ・営業で本領発揮する。",
    axes: { ei: 25, sn: 25, tf: 25, jp: 80 },
    cognitive: { dominant: "Se", auxiliary: "Ti", tertiary: "Fe", inferior: "Ni" },
    strengths: ["瞬発力", "現場対応", "リスクテイク", "社交性", "実践力"],
    weaknesses: ["長期計画の苦手さ", "細部の軽視", "感情の起伏", "退屈に弱い", "衝動性"],
    careers: ["起業家", "営業", "投資家", "アスリート", "救急医", "警察官"],
    loveStyle: "情熱的でスピード感のある恋愛。退屈な関係はすぐ離れる。刺激のある相手を求める。",
    parentingStyle: "子と一緒にアクティブに遊ぶ親。実践と体験を重視する。",
    stressors: ["退屈", "長時間の会議", "規則の縛り", "感情論"],
    growthPath: "Ni を育てて長期視野を持つ。衝動を一旦受け止める習慣を。",
    shadow: "ストレス時には Ni の暴走で、突然の悲観的未来予測・パニック・運命論的な思考が出る。",
    famousPeople: ["ドナルド・トランプ", "アーネスト・ヘミングウェイ", "マドンナ", "ブルース・ウィリス"],
    bestMatch: ["ISFJ", "ISTJ"],
    goodMatch: ["ESTP", "ESFP", "ESTJ"],
    challenging: ["INFJ", "INTJ"],
  },
  ESFP: {
    type: "ESFP",
    name: "エンターテイナー",
    nickname: "場を明るくする太陽",
    populationRate: "8.5%",
    group: "探検家",
    groupColor: "#d4a14a",
    oneLine: "場を盛り上げ、人を笑顔にする陽気な人気者。",
    description: "ESFP は『太陽のような存在』。Se(外向感覚) で今・ここを楽しみ、Fi(内向感情) で自分らしさを表現する。エンターテイナー・接客・芸能で力を発揮し、どこにいても場を明るくする魅力を持つ。",
    axes: { ei: 25, sn: 25, tf: 75, jp: 80 },
    cognitive: { dominant: "Se", auxiliary: "Fi", tertiary: "Te", inferior: "Ni" },
    strengths: ["明るさ", "社交性", "実践力", "現場対応", "魅力"],
    weaknesses: ["長期計画の苦手さ", "深刻な話を避ける", "計画性のなさ", "感情の波", "批判への弱さ"],
    careers: ["俳優", "歌手", "接客業", "営業", "イベントプランナー", "ツアーガイド"],
    loveStyle: "情熱的でスピード感のある恋愛。楽しさと現在を重視する。",
    parentingStyle: "子と一緒に遊び、笑顔を絶やさない陽気な親。",
    stressors: ["孤立", "退屈", "深刻な議論", "ルーティン"],
    growthPath: "Ni を育てて長期視野を持つ。深刻な話題から逃げない訓練を。",
    shadow: "ストレス時には Ni の暴走で、突然の悲観・無力感・運命論的思考が出る。",
    famousPeople: ["マリリン・モンロー", "エルヴィス・プレスリー", "アデル", "ジェイミー・オリヴァー"],
    bestMatch: ["ISFJ", "ISTJ"],
    goodMatch: ["ESFP", "ESTP", "ENFP"],
    challenging: ["INTJ", "INTP"],
  },
};

// ========================================================
// 4軸の解説
// ========================================================
export const AXIS_EXPLAIN: Record<MbtiAxis, { left: string; right: string; description: string }> = {
  "E/I": {
    left: "外向 (E)",
    right: "内向 (I)",
    description: "エネルギーの源泉が外界 (人・刺激) にあるか、内界 (思考・想像) にあるか。",
  },
  "S/N": {
    left: "現実 (S)",
    right: "直観 (N)",
    description: "情報を五感で具体的に捉えるか、パターン・象徴・可能性で抽象的に捉えるか。",
  },
  "T/F": {
    left: "思考 (T)",
    right: "感情 (F)",
    description: "判断の基準が論理・効率にあるか、価値観・調和にあるか。",
  },
  "J/P": {
    left: "判断 (J)",
    right: "知覚 (P)",
    description: "外界に対して計画・決定で臨むか、柔軟・探索で臨むか。",
  },
};

export function getMbti(type: MbtiType): MbtiProfile {
  return MBTI_PROFILES[type];
}

export function compatibility(t1: MbtiType, t2: MbtiType): { level: "best" | "good" | "neutral" | "challenging"; reason: string } {
  const p1 = MBTI_PROFILES[t1];
  if (p1.bestMatch.includes(t2)) return { level: "best", reason: "認知機能が補完し合い、深い理解と成長を生む最高の相性。" };
  if (p1.goodMatch.includes(t2)) return { level: "good", reason: "共通点が多く、安定した良好な関係を築きやすい。" };
  if (p1.challenging.includes(t2)) return { level: "challenging", reason: "対照的な機能スタックで衝突しやすいが、お互いの成長に大きな学びがある。" };
  return { level: "neutral", reason: "極端な共鳴も衝突もない、穏やかな相性。" };
}

// ========================================================
// 占いとの統合: しゅんすけ氏の命式 × INFJ
// 戊土・マスター11・正義・女教皇との響き合い
// ========================================================
export const MBTI_DIVINATION_INTEGRATION: Record<MbtiType, string[]> = {
  INFJ: [
    "【戊土の山 × Ni】静かに揺るがず、しかし内側で未来の全体像を見通す。INFJ の Ni と戊土の重さが完全に一致する稀有な配置。",
    "【マスター11 × Ni】霊的直感を地上に翻訳する力。マスター数 11 と INFJ の Ni は同じ振動を持ち、見えないものを言葉にする使命を共有する。",
    "【女教皇 × Ni-Fe】沈黙の中の知恵 (女教皇) を、温かい言葉で人に伝える (Fe)。INFJ の認知機能スタックそのものがバースカードと共鳴する。",
    "【正義 × Ti】公正な判断 (正義カード) と、INFJ 第三機能の Ti (論理的整合性) が組み合わさり、感情だけでなく筋の通った決断を下す賢者の構造。",
    "【獅子座ASC × INFJ】外見の堂々さ (獅子座 ASC) と内面の繊細さ (INFJ) のギャップが、深みのあるカリスマを生む。",
    "【偏官 × Ni】内側でビジョンを描き (Ni)、表に出る時は決断と覚悟で動く (偏官)。INFJ の理想主義に、四柱推命の偏官が現実への切り込みを与える。",
    "【牡牛座太陽 × Fe-Se】五感の豊かさ (牡牛座) と他者への共感 (Fe)、そして INFJ の弱点である Se を育てる訓練が、感性と現実の橋を架ける。",
    "【ライフパス11 × INFJ】数秘学の最も精神性の高い数字と、MBTI の最も希少なタイプ。両方を持つあなたは『見えない世界の翻訳者』としての宿命を二重に背負う。",
  ],
  INTJ: [
    "【Ni × 戦略的思考】長期視野で動くタイプ。日柱・月柱に印星があれば学術派、官星があれば組織のトップ向き。",
    "【Te × 実行力】外向思考が強いため、数字と効率で物事を動かす。命式の財星・官星と相性◎。",
    "【Fi × 内なる倫理】表に出さない強い信念。神社・寺院での静寂が魂のチャージとなる。",
  ],
  INTP: [
    "【Ti × 内向思考】概念と論理の精度を愛するタイプ。命式に印星・食傷星があれば学者・研究者として大成。",
    "【Ne × 可能性探求】新しい着想を生む。九星に三碧木星があると相性◎。",
  ],
  ENTJ: [
    "【Te × リーダーシップ】組織を率いる宿命の機能。命式に偏官・正官が強ければ経営者として開花。",
    "【Ni × 長期ビジョン】戦略を描く力。マスター数を持つと最強の経営者素質。",
  ],
  ENTP: [
    "【Ne × 創造性】可能性の連続。命式に食傷星があれば創造者・革新者として開花。",
    "【Ti × 論理精度】議論で本質を磨く。九星に三碧木星があると言葉の運が増す。",
  ],
  INFP: [
    "【Fi × 価値観】内なる信念を貫く詩人。命式に印星・食傷星があれば芸術家・作家として開花。",
    "【Ne × 創造性】可能性の発見。マスター数 11/22 と相性◎。",
  ],
  ENFJ: [
    "【Fe × カリスマ】人を導く天性の機能。命式に正官・印星が強ければ教育者・政治家として大成。",
    "【Ni × ビジョン】長期視野で人を育てる。九星に四緑木星があると人脈運が増す。",
  ],
  ENFP: [
    "【Ne × 情熱】可能性に恋する自由な機能。命式に食傷星があれば芸能・クリエイティブで開花。",
    "【Fi × 内なる信念】自分らしさを貫く。マスター数 11 と相性◎。",
  ],
  ISTJ: [
    "【Si × 伝統】過去と経験を蓄積する機能。命式に正財・正官があれば公務員・士業として開花。",
    "【Te × 実行】効率的に動く。九星に二黒土星・八白土星があると相性◎。",
  ],
  ISFJ: [
    "【Si × 細やかな配慮】伝統と細部を守る機能。命式に印星があれば看護・教育で開花。",
    "【Fe × 共感】人を支える機能。月柱に印星があれば母性的な役割が運命の中心に。",
  ],
  ESTJ: [
    "【Te × 秩序】組織を回す機能。命式に正官・偏官があれば管理職・幹部として開花。",
    "【Si × 実績】過去と伝統を尊重。九星に二黒土星があると組織内で揺るがぬ地位を築く。",
  ],
  ESFJ: [
    "【Fe × コミュニティ】人を結ぶ機能。命式に印星が強ければ教育・接客・人事で開花。",
    "【Si × 細やかさ】伝統を守る。九星に二黒土星・八白土星があると家庭運が安定。",
  ],
  ISTP: [
    "【Ti × 職人気質】手で考える機能。命式に食傷星があれば職人・エンジニアとして開花。",
    "【Se × 現場感】今・ここの瞬発力。九星に七赤金星があると技術と社交の両立が可能。",
  ],
  ISFP: [
    "【Fi × 美意識】感性の機能。命式に食傷星があればアーティスト・デザイナーとして開花。",
    "【Se × 五感】美の現場で本領発揮。九星に三碧木星・四緑木星があると相性◎。",
  ],
  ESTP: [
    "【Se × 行動】今・ここで動く機能。命式に偏財・偏官があれば営業・経営で開花。",
    "【Ti × 論理】現場で論理を組み立てる。九星に七赤金星があるとビジネスで成功しやすい。",
  ],
  ESFP: [
    "【Se × 明るさ】場を盛り上げる機能。命式に食傷星があれば芸能・接客で開花。",
    "【Fi × 自分らしさ】自分を表現する機能。九星に三碧木星・四緑木星があると相性◎。",
  ],
};
