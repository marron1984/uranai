// 個人クローズドサイトの利用者データ（吉田俊輔）
// すべての占断結果はこの定数から生成される。

export const OWNER = {
  // ===== 識別情報 =====
  displayName: "吉田俊輔",
  nameSei: "吉田",
  nameMei: "俊輔",
  nameSeiKakusu: [6, 5] as const,    // 吉(6) 田(5)
  nameMeiKakusu: [9, 14] as const,   // 俊(9) 輔(14)
  nameRoman: "YOSHIDA SHUNSUKE",
  birth: "1984-05-02",
  hour: 13,                          // 13:00 出生
  gender: "male" as "male" | "female",
  bloodType: "B",

  // ===== 出生地（西洋占星術用） =====
  birthplace: {
    pref: "大阪府",
    city: "大阪市城東区",
    lat: 34.6913,
    lng: 135.5447,
    tz: "JST (UTC+9)",
  },

  // ===== 現住所（風水・家相用） =====
  residence: {
    pref: "大阪府",
    city: "大阪市天王寺区",
    detail: "筆ヶ崎町2丁目10番 リーバーガーデンタワー筆ヶ崎 2302号室",
    floor: 23,                       // 高層階（陽）
    fromBirthplaceDirection: "南西", // 出生地から見た方角
  },

  // ===== ネイタル（事前算出済みの正式値） =====
  natal: {
    sun: "taurus",
    moonApprox: "射手座〜山羊座圏",
    ascApprox: "獅子座圏",
    mcApprox: "牡牛座圏",
    fourPillars: {
      year: "甲子",
      month: "戊辰",
      day: "戊申",
      hour: "己未",
    },
    kyusei: {
      honmei: 7,
      getsumei: 3,
    },
    fengshui: {
      kua: 6,
    },
    numerology: {
      lifePath: 11,
      birthday: 2,
    },
    birthCard: {
      personality: 11,
      soul: 2,
    },
  },

  // ===== 家族 =====
  family: {
    spouse: {
      relation: "妻",
      birth: "1969-12-21",
      gender: "female" as const,
      sunSign: "sagittarius",
      eto: "酉",
      kyusei: 1,
      lifePath: 4,
    },
    child: {
      relation: "子（中学2年）",
      birth: "2011-11-03",
      gender: null,
      sunSign: "scorpio",
      eto: "卯",
      kyusei: 4,
      lifePath: 9,
    },
  },

  // ===== 香水コレクション (2026/5/4 時点・117本) =====
  // タグ仕様:
  //   energyDays: パーソナルデイ (1-9) と相性が良い数字
  //   weather: "sunny" | "cloudy" | "rainy" | "snow" | "fog" | "thunder" | "hot" | "cold"
  //   time: "morning" | "afternoon" | "evening" | "night"
  //   season: "spring" | "summer" | "autumn" | "winter"
  perfumes: [
    // ===== BVLGARI =====
    { id: "bvl-the-blanc", brand: "BVLGARI", name: "オ・パフメ オーテブラン（白茶）", family: "シトラス・ティー", notes: ["白茶", "ベルガモット", "コリアンダー", "ホワイトムスク"], mood: ["透明", "上品", "清潔"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot", "cloudy"], energyDays: [2, 7], description: "白茶の透明感と気品。瞑想・朝の出社・落ち着いた打合せに。" },
    { id: "bvl-the-vert", brand: "BVLGARI", name: "オ・パフメ オーテヴェール（緑茶）", family: "シトラス・ティー", notes: ["緑茶", "シトラス", "ジャスミン", "シダーウッド"], mood: ["爽快", "知的", "清涼"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot", "cloudy"], energyDays: [3, 5], description: "BVLGARIを代表する万能緑茶。集中したい朝・蒸し暑い夏の日に。" },
    { id: "bvl-the-bleu", brand: "BVLGARI", name: "オ・パフメ オーテブルー（ブルーティー）", family: "アロマティック・ティー", notes: ["ブルーティー", "ラベンダー", "アイリス", "ヴァイオレット"], mood: ["静謐", "知性", "上品"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon", "evening"], weather: ["cloudy", "cold", "rainy"], energyDays: [2, 7], description: "青茶のクールさと紫の知性。曇り空・思考集中・夜の読書に。" },
    { id: "bvl-the-rouge", brand: "BVLGARI", name: "オ・パフメ オーテルージュ（レッドティー）", family: "ウッディ・ティー", notes: ["紅茶", "アンバー", "シナモン", "シダー"], mood: ["温もり", "落ち着き", "深紅"], season: ["autumn", "winter"], time: ["afternoon", "evening"], weather: ["cold", "cloudy", "rainy"], energyDays: [4, 6], description: "紅茶の温もりとスパイス。寒い午後・家族との時間に。" },
    { id: "bvl-black", brand: "BVLGARI", name: "ブラック", family: "ウッディ・ゴム", notes: ["ラバー", "紅茶", "アンバー", "ローズウッド"], mood: ["都会", "ユニーク", "ダーク"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy", "rainy"], energyDays: [1, 8], description: "アスファルトと茶葉のカルト名作。都会的な夜に映える稀有な一本。" },
    { id: "bvl-rose-essentielle", brand: "BVLGARI", name: "ローズ エッセンシャル", family: "フローラル・ローズ", notes: ["ターキッシュローズ", "ブラックベリー", "パチュリ", "ムスク"], mood: ["ロマンティック", "華やか", "上品"], season: ["spring", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 6], description: "ローズの真髄。穏やかな表現と気品が両立する大人のフローラル。" },

    // ===== Byredo =====
    { id: "byr-gypsy-water", brand: "Byredo", name: "ジプシー ウォーター", family: "ウッディ・アロマティック", notes: ["ベルガモット", "インセンス", "パイン", "サンダルウッド", "バニラ"], mood: ["自由", "森", "瞑想"], season: ["spring", "autumn"], time: ["morning", "afternoon", "evening"], weather: ["cloudy", "fog", "cold"], energyDays: [5, 7], description: "森と煙と自由の代名詞。旅・新規探索・穏やかな探究の日に。" },
    { id: "byr-bal-dafrique", brand: "Byredo", name: "バル ダフリック", family: "フローラル・ウッディ", notes: ["ベルガモット", "ネロリ", "バイオレット", "シダー", "ベチバー"], mood: ["エキゾチック", "陽気", "1920年代パリ"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "hot", "cloudy"], energyDays: [3, 5], description: "1920年代パリのアフリカ熱を思わせる自由の香り。社交・パーティー・新規開拓の日に。" },
    { id: "byr-mojave-ghost", brand: "Byredo", name: "モハーヴェ ゴースト", family: "ウッディ・フローラル", notes: ["アンブレット", "ヴァイオレット", "サンダルウッド", "アンバー"], mood: ["乾いた", "静謐", "砂漠"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon"], weather: ["sunny", "hot", "cloudy"], energyDays: [2, 7], description: "砂漠に咲く花のような乾いた静謐。暑い日・透明感が欲しい朝に。" },
    { id: "byr-blanche", brand: "Byredo", name: "ブランシュ", family: "フローラル・ムスキー", notes: ["アルデヒド", "ホワイトローズ", "ピオニー", "ムスク"], mood: ["清潔", "白", "シンプル"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 6], description: "洗いたてのシーツのような白い香り。リフレッシュ・癒し・家族との穏やかな日に。" },
    { id: "byr-super-cedar", brand: "Byredo", name: "スーパー シダー", family: "ウッディ", notes: ["シダーウッド", "バージニアシダー", "ムスク", "ローズ"], mood: ["森", "落ち着き", "シャープ"], season: ["autumn", "winter"], time: ["afternoon", "evening", "night"], weather: ["cold", "cloudy", "rainy"], energyDays: [4, 7], description: "シダーの研ぎ澄まされた木質。寒い日・集中したい時・男性的な威厳を。" },
    { id: "byr-rose-of-no-mans-land", brand: "Byredo", name: "ローズ オブ ノー マンズ ランド", family: "フローラル・ローズ", notes: ["ピンクペッパー", "ターキッシュローズ", "パピルス", "ホワイトアンバー"], mood: ["優しさ", "看護", "白い愛"], season: ["spring", "autumn", "winter"], time: ["afternoon", "evening"], weather: ["cloudy", "cold", "rainy"], energyDays: [2, 6], description: "戦地の看護師に捧げるローズ。守りたい人がいる日・家族の介護を担う日に。" },

    // ===== CHANEL =====
    { id: "chanel-bleu-edp", brand: "CHANEL", name: "ブルー ドゥ シャネル EDP", family: "ウッディ・アロマティック", notes: ["グレープフルーツ", "インセンス", "ジンジャー", "サンダルウッド", "シダー"], mood: ["端正", "都会的", "知的"], season: ["spring", "summer", "autumn", "winter"], time: ["morning", "afternoon", "evening"], weather: ["sunny", "cloudy", "cold"], energyDays: [3, 5, 6], description: "万能の優等生。フォーマルな会議・写真・正装の日に。獅子座ASCの輝きを支える。" },
    { id: "chanel-no5-eau-premiere", brand: "CHANEL", name: "N°5 オードゥ トワレット (ロー)", family: "アルデヒド・フローラル", notes: ["アルデヒド", "イランイラン", "ジャスミン", "ローズ", "サンダルウッド"], mood: ["伝説", "華麗", "気品"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening", "night"], weather: ["sunny", "cloudy"], energyDays: [3, 8], description: "20世紀最大の傑作の軽やか版。記念日・大切な集まり・自分への祝祭に。" },
    { id: "chanel-chance-splendide", brand: "CHANEL", name: "チャンス オー スプランディド", family: "フルーティ・フローラル", notes: ["ルバーブ", "ジャスミン", "アイリス", "ベチバー"], mood: ["瑞々しい", "明るい", "若々しい"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "明るく弾けるチャンス。若い空気を纏いたい日・気分転換の朝に。" },

    // ===== Clive Christian =====
    { id: "cc-x-masculine", brand: "Clive Christian", name: "X for Men", family: "シプレ・フォーゲール", notes: ["ベルガモット", "オークモス", "ラベンダー", "シダーウッド"], mood: ["クラシック", "威厳", "貴族"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "英国紳士のXY染色体。重要な決断・高位の集まり・貴族的な夜に。" },
    { id: "cc-x-feminine", brand: "Clive Christian", name: "X for Women", family: "オリエンタル・フローラル", notes: ["プラム", "ローズ", "イランイラン", "サンダルウッド"], mood: ["官能", "深紅", "成熟"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "妻と並ぶ夜のための一本。深い愛と成熟した関係に。" },
    { id: "cc-1872-masculine", brand: "Clive Christian", name: "1872 for Men", family: "シトラス・ウッディ", notes: ["ライム", "マンダリン", "ヴァイオレット", "シダー"], mood: ["格調", "明朗", "クラシック"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [1, 4], description: "ヴィクトリア女王御用達ハウスの代表作。朝の重要会議・公式の場に。" },
    { id: "cc-vii-rock-rose", brand: "Clive Christian", name: "VII Rock Rose", family: "オリエンタル・ローズ", notes: ["ロックローズ", "サフラン", "ウード", "アンバー"], mood: ["威厳", "深紅", "贅沢"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "岩に咲くローズの威厳。最重要の夜・自分を完全武装したい時に。" },
    { id: "cc-a-masculine", brand: "Clive Christian", name: "A for Men", family: "オリエンタル・スパイシー", notes: ["カルダモン", "アイリス", "サフラン", "サンダルウッド"], mood: ["重厚", "オリエンタル", "上品"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "東洋的スパイスの重厚さ。寒い夜・深い対話の場面に。" },
    { id: "cc-b-masculine", brand: "Clive Christian", name: "B for Men", family: "アロマティック・フローラル", notes: ["バジル", "ジンジャー", "ジャスミン", "シダー"], mood: ["モダン", "活力", "都会"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [3, 5], description: "モダンな英国紳士の昼間用。プレゼン・営業・元気な交渉に。" },
    { id: "cc-1872-lady", brand: "Clive Christian", name: "1872 for Women", family: "シトラス・フローラル", notes: ["ベルガモット", "ピオニー", "ヘーゼルナッツ", "ムスク"], mood: ["明朗", "上品", "優美"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [3, 6], description: "妻と共有できる明朗なシトラスフローラル。家族イベント・ガーデンパーティーに。" },

    // ===== DIOR =====
    { id: "dior-miss-dior", brand: "DIOR", name: "ミス ディオール", family: "フローラル・シプレ", notes: ["ローズ", "ピオニー", "パチュリ", "ムスク"], mood: ["女性", "華やか", "ロマンティック"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 6], description: "DIORの恋する香り。デート・記念日・特別な午後に。" },
    { id: "dior-sakura", brand: "DIOR", name: "サクラ", family: "フローラル・フルーティ", notes: ["桜", "チェリー", "ホワイトムスク", "ライス"], mood: ["春", "繊細", "日本"], season: ["spring"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 3], description: "和の桜と西洋の優しさの融合。春の朝・お花見・日本的な記念日に。" },
    { id: "dior-bois-dargent", brand: "DIOR", name: "ボア ダルジャン", family: "ウッディ・アンバー", notes: ["インセンス", "ミルラ", "アンバー", "シダー"], mood: ["神秘", "貴族", "古寺"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "fog", "cloudy"], energyDays: [7, 9], description: "銀の森のような神秘。寺社参拝・瞑想・厳粛な夜に。" },
    { id: "dior-riviera", brand: "DIOR", name: "ディオリビエラ", family: "シトラス・アロマティック", notes: ["ベルガモット", "ローズマリー", "イランイラン", "シダー"], mood: ["地中海", "休日", "解放"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [5, 6], description: "南仏リヴィエラの太陽。休日・旅行・家族との外出に。" },
    { id: "dior-the-cachemire", brand: "DIOR", name: "テ カシミア", family: "ウッディ・ティー", notes: ["紅茶", "イチジク", "アンバー", "ムスク"], mood: ["温もり", "知的", "上品"], season: ["autumn", "winter"], time: ["afternoon", "evening"], weather: ["cold", "cloudy"], energyDays: [4, 7], description: "カシミアに包まれた紅茶。寒い書斎・読書・落ち着いた打合せに。" },
    { id: "dior-rose-kabuki", brand: "DIOR", name: "ローズ カブキ", family: "フローラル・ローズ", notes: ["ローズ", "ペッパー", "サフラン", "シダー"], mood: ["艶やか", "和", "舞台"], season: ["spring", "autumn"], time: ["evening", "night"], weather: ["cloudy", "cold"], energyDays: [3, 8], description: "歌舞伎の隈取りのような艶やかなローズ。観劇・特別な夜に。" },
    { id: "dior-lucky", brand: "DIOR", name: "ラッキー", family: "フローラル・ライリー", notes: ["スズラン", "ベルガモット", "ホワイトムスク", "ジャスミン"], mood: ["幸運", "瑞々しい", "希望"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny"], energyDays: [1, 5], description: "勝負の朝に纏う幸運のスズラン。重要な交渉・面接・運を呼びたい日に。" },
    { id: "dior-ambre-nuit", brand: "DIOR", name: "アンブル ニュイ", family: "オリエンタル・アンバー", notes: ["ローズ", "アンバー", "パチュリ", "シダー"], mood: ["夜", "官能", "深紅"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "夜のアンバーとローズ。深い夜・大人の集まり・配偶者との時間に。" },
    { id: "dior-oud-ispahan", brand: "DIOR", name: "ウード イスパハン", family: "オリエンタル・ウード", notes: ["ローズ", "ウード", "サフラン", "サンダルウッド"], mood: ["威厳", "古都", "贅沢"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "ペルシャの古都イスファハン。最高位の夜・特別な決断に纏う。" },
    { id: "dior-cologne-royale", brand: "DIOR", name: "コロン ロワイヤル", family: "シトラス・クラシック", notes: ["シチリアレモン", "ベルガモット", "ペッパー", "ムスク"], mood: ["王室", "クラシック", "清潔"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [1, 4], description: "ロイヤルなシトラス。フォーマルな朝・公式の昼食・気品ある一日に。" },
    { id: "dior-jasmin-des-anges", brand: "DIOR", name: "ジャスミン デ ザンジュ", family: "フローラル・ジャスミン", notes: ["ジャスミン", "シダー", "ベンゾイン", "ハニー"], mood: ["天使", "白い花", "甘美"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 6], description: "天使のジャスミン。春の夕暮れ・恋人との散歩・心満たされる時間に。" },
    { id: "dior-new-look-1947", brand: "DIOR", name: "ニュー ルック 1947", family: "フローラル・ウッディ", notes: ["ピオニー", "ローズ", "ジャスミン", "サンダルウッド"], mood: ["クラシック", "革命", "華麗"], season: ["spring", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 8], description: "DIOR革命の年に捧ぐ白いブーケ。新しい挑戦・節目の日に。" },
    { id: "dior-tobacalor", brand: "DIOR", name: "トバカラー", family: "オリエンタル・タバコ", notes: ["タバコ", "シナモン", "アンバー", "バニラ"], mood: ["重厚", "セクシー", "夜"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "タバコの煙と琥珀。冬の夜・バーでの会話・成熟した自信を纏う日に。" },
    { id: "dior-gris-montaigne", brand: "DIOR", name: "グリ モンテーニュ", family: "シトラス・シプレ", notes: ["ベルガモット", "ローズ", "オリス", "オークモス"], mood: ["パリ", "上品", "気品"], season: ["spring", "autumn"], time: ["afternoon", "evening"], weather: ["cloudy"], energyDays: [4, 7], description: "モンテーニュ通りのグレー。パリの空のような知的な午後に。" },
    { id: "dior-la-colle-noire", brand: "DIOR", name: "ラ コル ノワール", family: "フローラル・ローズ", notes: ["ターキッシュローズ", "メイローズ", "ベルガモット", "ベチバー"], mood: ["故郷", "ロマンス", "ムッシュ・ディオール"], season: ["spring", "autumn"], time: ["afternoon", "evening"], weather: ["cloudy", "sunny"], energyDays: [3, 6], description: "ディオール氏の故郷の薔薇。家・愛・原点回帰の日に。" },
    { id: "dior-gris-dior", brand: "DIOR", name: "グリ ディオール", family: "ウッディ・アロマティック", notes: ["ベルガモット", "ジャスミン", "ローズ", "ホワイトムスク"], mood: ["ニュートラル", "上品", "知性"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [4, 6], description: "万人を惹きつけるグレーの優美。日常を一段上品にする万能ニュアンス。" },
    { id: "dior-purple-oud", brand: "DIOR", name: "パープル ウード", family: "オリエンタル・ウード", notes: ["ウード", "ローズ", "パチュリ", "アンバー"], mood: ["紫", "貴族", "神秘"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "紫の煙のようなウード。最も自分を深めたい夜に。" },
    { id: "dior-balade-sauvage", brand: "DIOR", name: "バラード ソヴァージュ", family: "ウッディ・フローラル", notes: ["ローズ", "ピンクペッパー", "ベチバー", "アンバー"], mood: ["野生", "ロマン", "解放"], season: ["spring", "autumn"], time: ["afternoon", "evening"], weather: ["cloudy", "sunny"], energyDays: [5, 6], description: "野生の散歩道。自由と愛を同時に欲する日に。" },

    // ===== Diptyque =====
    { id: "dpt-fleur-de-peau", brand: "Diptyque", name: "フルール ドゥ ポー", family: "ムスキー・フローラル", notes: ["アンブレット", "アイリス", "ピンクペッパー", "ムスク"], mood: ["素肌", "親密", "ヌード"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening", "night"], weather: ["sunny", "cloudy"], energyDays: [2, 6], description: "素肌のような親密ムスク。恋人と過ごす日・自分を肯定したい朝に。" },
    { id: "dpt-orpheon", brand: "Diptyque", name: "オルフェオン", family: "ウッディ・スモーキー", notes: ["ジュニパー", "ジャスミン", "シダー", "煙"], mood: ["1960年代パリ", "煙", "ジャズ"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 7], description: "パリ夜のジャズバー。大人の集まり・夜の対話に。" },
    { id: "dpt-eau-capitale", brand: "Diptyque", name: "オー キャピタル", family: "シプレ・ローズ", notes: ["ローズ", "ピンクペッパー", "パチュリ", "オークモス"], mood: ["都会", "首都", "ローズ"], season: ["spring", "autumn"], time: ["afternoon", "evening"], weather: ["cloudy"], energyDays: [3, 6], description: "都会のローズシプレ。仕事帰りの一杯・洗練された夕方に。" },
    { id: "dpt-eau-rose", brand: "Diptyque", name: "オー ローズ", family: "フローラル・ローズ", notes: ["ローズ", "リッチェロ", "シダー", "ハニー"], mood: ["瑞々しい", "ナチュラル", "上品"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 6], description: "朝摘みのローズ。春の朝・家族との時間・素直な気持ちの日に。" },
    { id: "dpt-ombre-dans-leau", brand: "Diptyque", name: "ロンブル ダン ロー", family: "グリーン・ローズ", notes: ["カシス", "ブルガリアンローズ", "ペチバー"], mood: ["森", "影", "緑"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["cloudy", "rainy"], energyDays: [2, 7], description: "水辺の影、カシスとローズ。雨上がり・森の散歩・思索の午後に。" },
    { id: "dpt-tam-dao", brand: "Diptyque", name: "タム ダオ", family: "ウッディ・サンダル", notes: ["サンダルウッド", "シダー", "ローズウッド", "アンバー"], mood: ["寺院", "瞑想", "アジア"], season: ["autumn", "winter"], time: ["afternoon", "evening", "night"], weather: ["cold", "fog", "cloudy"], energyDays: [2, 7], description: "ベトナムの寺院の白檀。瞑想・神社参拝・日主戊の本質を引き出す。" },
    { id: "dpt-do-son", brand: "Diptyque", name: "ド ソン", family: "フローラル・チュベローズ", notes: ["チュベローズ", "オレンジリーフ", "イランイラン", "ホワイトムスク"], mood: ["夏の海", "白い花", "ノスタルジー"], season: ["spring", "summer"], time: ["afternoon", "evening"], weather: ["sunny", "hot"], energyDays: [2, 5], description: "ベトナムの海辺のチュベローズ。夏の夜・旅・ノスタルジックな日に。" },
    { id: "dpt-eau-duelle", brand: "Diptyque", name: "オー デュエル", family: "オリエンタル・バニラ", notes: ["バニラ", "サフラン", "ベルガモット", "ジュニパー"], mood: ["決闘", "知的", "スパイス"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "刃と煙、知的な決闘のバニラ。重要な対話・夜の交渉に。" },
    { id: "dpt-oyedo", brand: "Diptyque", name: "オイエド", family: "シトラス・ウッディ", notes: ["ユズ", "マンダリン", "タイム", "シダー"], mood: ["和", "爽快", "江戸"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "江戸のユズと和の柑橘。朝のシャワー後・夏の昼食・気分転換に。" },
    { id: "dpt-olene", brand: "Diptyque", name: "オレーヌ", family: "フローラル・ホワイトフラワー", notes: ["ハニーサックル", "ジャスミン", "ローズウォーター"], mood: ["白い花", "夏の朝", "繊細"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 6], description: "白い花の朝露。繊細で柔らかい一日のスタートに。" },
    { id: "dpt-leau", brand: "Diptyque", name: "ロー（L'EAU）", family: "スパイシー・ハーバル", notes: ["クローブ", "シナモン", "ジェラニウム", "ローズ"], mood: ["中世", "スパイス", "ハーブ"], season: ["autumn", "winter"], time: ["afternoon", "evening"], weather: ["cold", "cloudy"], energyDays: [4, 7], description: "ディプティック創業の起源。中世のスパイスティー。寒い日の午後に。" },
    { id: "dpt-eau-des-lierres", brand: "Diptyque", name: "オー デ リエール", family: "グリーン・ウッディ", notes: ["アイビー", "シダー", "アンバー", "ピンクペッパー"], mood: ["蔦", "壁", "緑の影"], season: ["spring", "autumn"], time: ["morning", "afternoon"], weather: ["cloudy", "rainy"], energyDays: [4, 7], description: "壁を覆う蔦の緑。雨上がりの庭・思索の午後・自然と一体になる時間に。" },
    { id: "dpt-geranium-odorata", brand: "Diptyque", name: "ジェラニウム オドラタ", family: "アロマティック・グリーン", notes: ["ジェラニウム", "ローズ", "シダー", "シソ"], mood: ["ハーブ", "庭", "瑞々しい"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [3, 5], description: "ジェラニウムの瑞々しい緑。ガーデニング・休日の朝・心のリセットに。" },
    { id: "dpt-philosykos", brand: "Diptyque", name: "フィロシコス", family: "グリーン・ウッディ", notes: ["イチジクの葉", "ココナッツ", "シダー", "ホワイトムスク"], mood: ["夏の地中海", "木陰", "瑞々しい"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "夏の地中海の木陰。家族と過ごす休日・カフェでの読書に。" },
    { id: "dpt-ilio", brand: "Diptyque", name: "イリオ", family: "フローラル・ソーラー", notes: ["オレンジブロッサム", "プリックリーペアー", "アンバー"], mood: ["太陽", "白い花", "夏"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "ギリシャの太陽と白い花。夏の旅・解放感ある休日に。" },
    { id: "dpt-eau-papier", brand: "Diptyque", name: "ロー パピエ", family: "ウッディ・パウダリー", notes: ["イモーテル", "リッチェロ", "ホワイトムスク", "シダー"], mood: ["紙", "本", "静寂"], season: ["spring", "autumn", "winter"], time: ["afternoon", "evening"], weather: ["cloudy", "cold", "rainy"], energyDays: [2, 7], description: "古い紙と書物の香り。書斎・図書館・思索の日に。" },

    // ===== Giorgio Armani =====
    { id: "armani-code", brand: "Giorgio Armani", name: "アルマーニ コード", family: "ウッディ・トンカ", notes: ["ベルガモット", "オリーブブロッサム", "トンカ", "ウッド"], mood: ["クラシック", "セクシー", "都会"], season: ["autumn", "winter", "spring"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "アルマーニの古典的な男性美。仕事帰りのバー・成熟した夜に。" },

    // ===== Guerlain =====
    { id: "guerlain-pera-granita", brand: "Guerlain", name: "アクア アレゴリア ペラ グラニータ", family: "シトラス・フルーティ", notes: ["洋梨", "ベルガモット", "ホワイトムスク", "シダー"], mood: ["瑞々しい", "夏", "シャーベット"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "梨のシャーベット。蒸し暑い夏・気分転換のランチタイムに。" },

    // ===== Jo Malone London =====
    { id: "jml-wood-sage", brand: "Jo Malone London", name: "ウッド セージ & シー ソルト", family: "アロマティック・サルティ", notes: ["シーソルト", "セージ", "アンブレット"], mood: ["海岸", "風", "ミネラル"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [5, 7], description: "海岸のセージと塩。休日の散歩・自然とつながる日に。" },
    { id: "jml-emerald-thyme", brand: "Jo Malone London", name: "エメラルド タイム コロン", family: "アロマティック・グリーン", notes: ["タイム", "サフラン", "アンバー"], mood: ["ハーブ", "庭", "知的"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [4, 5], description: "庭園のタイム。クッキング・週末の朝・自然な活力に。" },
    { id: "jml-myrrh-tonka", brand: "Jo Malone London", name: "ミルラ & トンカ", family: "オリエンタル・アンバー", notes: ["ミルラ", "トンカ", "ラベンダー", "オムリ"], mood: ["温もり", "聖なる", "甘美"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [7, 9], description: "聖夜のミルラと甘いトンカ。瞑想・寒い夜・心の温もりに。" },
    { id: "jml-ginger-beer", brand: "Jo Malone London", name: "ジンジャー ビア コロン", family: "スパイシー・シトラス", notes: ["ジンジャー", "ライム", "黒胡椒"], mood: ["スパイシー", "活気", "夏"], season: ["spring", "summer"], time: ["afternoon", "evening"], weather: ["hot", "sunny"], energyDays: [1, 3], description: "炭酸の効いたジンジャービア。元気を出したい昼・夏のパーティーに。" },
    { id: "jml-passiflora", brand: "Jo Malone London", name: "パッシフローラ コロン", family: "フルーティ・トロピカル", notes: ["パッションフルーツ", "オレンジ", "ピンクペッパー"], mood: ["トロピカル", "情熱", "夏"], season: ["spring", "summer"], time: ["afternoon", "evening"], weather: ["hot", "sunny"], energyDays: [3, 5], description: "情熱のトロピカルフルーツ。リゾート・夏の夕方に。" },
    { id: "jml-grapefruit", brand: "Jo Malone London", name: "グレープフルーツ コロン", family: "シトラス", notes: ["グレープフルーツ", "ローズマリー", "ペッパー"], mood: ["瑞々しい", "朝", "活力"], season: ["spring", "summer"], time: ["morning"], weather: ["sunny", "hot"], energyDays: [1, 5], description: "朝のグレープフルーツ。シャワー後・出社前の活力チャージに。" },
    { id: "jml-peony-blush-suede", brand: "Jo Malone London", name: "ピオニー & ブラッシュ スエード", family: "フローラル・スエード", notes: ["ピオニー", "ジャスミン", "スエード"], mood: ["女性的", "柔らか", "ロマンス"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["cloudy", "sunny"], energyDays: [2, 6], description: "ピオニーとスエードの柔らかさ。穏やかなデート・記念日に。" },
    { id: "jml-english-oak-hazelnut", brand: "Jo Malone London", name: "イングリッシュ オーク & ヘーゼルナッツ", family: "ウッディ・ナッツ", notes: ["オーク", "ヘーゼルナッツ", "シダー"], mood: ["森", "秋", "落ち着き"], season: ["autumn", "winter"], time: ["afternoon", "evening"], weather: ["cold", "cloudy"], energyDays: [4, 7], description: "英国の森とナッツ。秋の散歩・読書・落ち着いた午後に。" },
    { id: "jml-yuzu", brand: "Jo Malone London", name: "ユズ ゼスト コロン", family: "シトラス", notes: ["ユズ", "アロマティック", "ジンジャー"], mood: ["和", "爽快", "瑞々しい"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "ユズの皮の和シトラス。和食店・温泉・夏の朝に。" },
    { id: "jml-yellow-hibiscus", brand: "Jo Malone London", name: "イエロー ハイビスカス", family: "フローラル・トロピカル", notes: ["イエローハイビスカス", "オレンジブロッサム", "ジンジャー"], mood: ["陽気", "夏", "エキゾチック"], season: ["spring", "summer"], time: ["afternoon", "evening"], weather: ["hot", "sunny"], energyDays: [3, 5], description: "黄色のハイビスカス。リゾート・夏の夕方・陽気な気分に。" },
    { id: "jml-sunlit-cherimoya", brand: "Jo Malone London", name: "サンリット チェリモヤ", family: "フルーティ・トロピカル", notes: ["チェリモヤ", "ピーチ", "バニラ"], mood: ["甘美", "夏の太陽", "クリーミー"], season: ["spring", "summer"], time: ["afternoon", "evening"], weather: ["sunny", "hot"], energyDays: [3, 6], description: "南国のチェリモヤ。リゾート・甘いひとときに。" },
    { id: "jml-orange-marmalade", brand: "Jo Malone London", name: "オレンジ マーマレード", family: "シトラス・ジャム", notes: ["オレンジ", "シナモン", "アンバー"], mood: ["朝食", "温もり", "甘美"], season: ["autumn", "winter"], time: ["morning", "afternoon"], weather: ["cold", "cloudy"], energyDays: [3, 6], description: "ジャムを塗ったトーストの朝。家庭的な温もりの一日に。" },
    { id: "jml-english-pear-sweet-pea", brand: "Jo Malone London", name: "イングリッシュ ペアー & スイート ピー", family: "フルーティ・フローラル", notes: ["ペアー", "スイートピー", "ホワイトフラワー"], mood: ["優しい", "春", "甘美"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 3], description: "梨と春の花。春の散歩・お祝い事・優しい一日に。" },
    { id: "jml-raspberry-ripple", brand: "Jo Malone London", name: "ラズベリー リップル", family: "フルーティ・グルマン", notes: ["ラズベリー", "バニラ", "ホワイトムスク"], mood: ["甘美", "デザート", "幸福"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 6], description: "ラズベリーバニラのスイーツ。カフェタイム・幸せな午後に。" },
    { id: "jml-aqua-lemon", brand: "Jo Malone London", name: "アクア レモン", family: "シトラス・アクアティック", notes: ["レモン", "ベルガモット", "アクア"], mood: ["瑞々しい", "夏", "プール"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [1, 5], description: "水のレモン。猛暑の朝・プール・気分転換に。" },

    // ===== Lancôme =====
    { id: "lancome-miracle", brand: "Lancôme", name: "ミラクル", family: "フローラル・スパイシー", notes: ["リッチェロ", "ジンジャー", "ジャスミン", "ムスク"], mood: ["奇跡", "明るい", "自信"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 8], description: "奇跡を呼ぶ自信の香り。重要な日・新しい挑戦に。" },

    // ===== LANVIN =====
    { id: "lanvin-eclat-arpege", brand: "LANVIN", name: "エクラ・ドゥ・アルページュ", family: "フローラル・グリーン", notes: ["ライラック", "緑茶", "ピーチ", "シダー"], mood: ["瑞々しい", "明朗", "上品"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 3], description: "緑茶とライラックの瑞々しい朝。フレッシュな日のスタートに。" },

    // ===== Le Labo =====
    { id: "lelabo-patchouli-24", brand: "Le Labo", name: "パチョリ 24", family: "ウッディ・スモーキー", notes: ["パチョリ", "バニラ", "シダー", "スモーク"], mood: ["煙", "重厚", "アーティスト"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "rainy", "cloudy"], energyDays: [4, 8], description: "焚き火と煙のパチョリ。重要な夜・アーティスティックな集まりに。" },
    { id: "lelabo-santal-33", brand: "Le Labo", name: "サンタル 33", family: "ウッディ", notes: ["サンダルウッド", "アイリス", "バイオレット", "カルダモン", "アンバー"], mood: ["落ち着き", "静寂", "知性"], season: ["autumn", "winter", "spring"], time: ["afternoon", "evening"], weather: ["cloudy", "cold", "fog"], energyDays: [2, 7], description: "白檀の静寂と煙の哲学。一人時間・読書・深い対話に。日主戊と最高の親和性。" },
    { id: "lelabo-the-noir-29", brand: "Le Labo", name: "テ ノワール 29", family: "ウッディ・ティー", notes: ["黒茶", "ベイラム", "シダー", "ムスク"], mood: ["渋い", "成熟", "茶寮"], season: ["autumn", "winter"], time: ["afternoon", "evening"], weather: ["cold", "rainy", "cloudy"], energyDays: [4, 7], description: "燻した黒茶の深み。茶寮・知的な集まり・落ち着きの夜に。" },
    { id: "lelabo-another-13", brand: "Le Labo", name: "アナザー 13", family: "ムスキー・アンバー", notes: ["アンブロックス", "イソEスーパー", "ジャスミン", "ムスク"], mood: ["透明", "もう一人の自分", "クリーン"], season: ["spring", "summer", "autumn", "winter"], time: ["morning", "afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [2, 7], description: "もう一人の自分を呼ぶ透明ムスク。万能で繊細、ほぼ毎日使える一本。" },

    // ===== Maison Margiela REPLICA =====
    { id: "mm-sailing-day", brand: "Maison Margiela REPLICA", name: "セーリング デイ", family: "アクアティック", notes: ["シーソルト", "ジュニパーベリー", "セージ", "ムスク"], mood: ["海", "ヨット", "夏"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [5, 6], description: "ヨットの帆と潮風。海の旅・休日・解放感を求める日に。" },
    { id: "mm-lazy-sunday", brand: "Maison Margiela REPLICA", name: "レイジー サンデー モーニング", family: "ホワイトフローラル・ムスキー", notes: ["アルデヒド", "ホワイトムスク", "アイリス", "リリーオブザバレー"], mood: ["シーツ", "日曜の朝", "穏やか"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [2, 6], description: "洗いたてのシーツ。家族と過ごす日曜の朝に。" },
    { id: "mm-by-the-fireplace", brand: "Maison Margiela REPLICA", name: "バイ ザ ファイヤープレイス", family: "ウッディ・スモーキー", notes: ["ピンクペッパー", "クローブ", "栗", "ヴァニラ", "煙"], mood: ["暖炉", "煙", "冬の家"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "snow", "rainy"], energyDays: [4, 6], description: "暖炉と焼き栗。寒い夜・家族と過ごす冬の家に。" },
    { id: "mm-jazz-club", brand: "Maison Margiela REPLICA", name: "ジャズ クラブ", family: "オリエンタル・タバコ", notes: ["ピンクペッパー", "ラム", "タバコリーフ", "ベンゾイン"], mood: ["ジャズ", "ウイスキー", "夜の酒場"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "ニューヨークのジャズバー。ウイスキーとタバコの夜に。" },
    { id: "mm-springtime-park", brand: "Maison Margiela REPLICA", name: "スプリングタイム イン ア パーク", family: "フローラル・グリーン", notes: ["ペアー", "ライラック", "ホワイトフラワー"], mood: ["公園", "春", "ピクニック"], season: ["spring"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [3, 5], description: "春の公園のピクニック。家族との外出・お花見に。" },
    { id: "mm-rain-stops", brand: "Maison Margiela REPLICA", name: "ウェン ザ レイン ストップス", family: "グリーン・フローラル", notes: ["ジャスミン", "オレンジリーフ", "シダー", "雨の余韻"], mood: ["雨上がり", "緑", "再生"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["rainy", "cloudy"], energyDays: [2, 5], description: "雨上がりの清浄な空気。気持ちを切り替えたい日に。" },
    { id: "mm-flower-market", brand: "Maison Margiela REPLICA", name: "フラワー マーケット", family: "フローラル", notes: ["フリージア", "ジャスミン", "ピオニー", "サンダルウッド"], mood: ["花市場", "華やか", "明朗"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [3, 6], description: "パリの花市場の朝。家を花で満たしたい休日に。" },

    // ===== Mancera =====
    { id: "mancera-explicit-vanilla", brand: "Mancera", name: "エクスプリシット バニラ", family: "オリエンタル・バニラ", notes: ["バニラ", "ラム", "アンバー", "サンダルウッド"], mood: ["濃厚", "甘美", "夜"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [6, 8], description: "ラム酒バニラの濃厚な夜。寒い夜・甘いひとときに。" },

    // ===== Narciso Rodriguez =====
    { id: "nr-pure-musc", brand: "Narciso Rodriguez", name: "ナルシソ ピュア ムスク", family: "ムスキー・フローラル", notes: ["ホワイトムスク", "ピンクムスク", "ジャスミン"], mood: ["官能", "透明", "肌の延長"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening", "night"], weather: ["sunny", "cloudy"], energyDays: [2, 6], description: "肌の延長のような純粋ムスク。親密な時間・自分のための日に。" },

    // ===== Salvatore Ferragamo =====
    { id: "ferragamo-10342", brand: "Salvatore Ferragamo", name: "フェラガモ 10342", family: "ウッディ・レザー", notes: ["シダー", "レザー", "アンバー", "サフラン"], mood: ["クラシック", "革", "イタリア"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "イタリアの革の艶。重要な夜・正装の日・クラシックな男性美に。" },

    // ===== SHISEIDO =====
    { id: "shiseido-men-edt", brand: "SHISEIDO", name: "資生堂 メン オードトワレ", family: "アロマティック・フォーゲール", notes: ["ベルガモット", "ローズマリー", "アイリス", "シダー"], mood: ["清潔", "和", "信頼"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon"], weather: ["sunny", "cloudy"], energyDays: [4, 6], description: "和のメンズフレグランス。仕事・通勤・公私問わず使える一本。" },

    // ===== Tom Ford =====
    { id: "tf-lost-cherry", brand: "Tom Ford", name: "ロスト チェリー", family: "フルーティ・グルマン", notes: ["チェリー", "アーモンド", "トンカ", "サンダルウッド"], mood: ["官能", "夜の果実", "甘美"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [3, 8], description: "失われた愛のチェリー。深い夜・大人の集まりに。" },
    { id: "tf-electric-cherry", brand: "Tom Ford", name: "エレクトリック チェリー", family: "フルーティ・モダン", notes: ["チェリー", "メタル", "ピーチ", "ムスク"], mood: ["ポップ", "電気", "未来"], season: ["spring", "summer", "autumn"], time: ["afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 5], description: "電撃のチェリー。ポップな気分・若い感性を呼びたい日に。" },
    { id: "tf-bitter-peach", brand: "Tom Ford", name: "ビター ピーチ", family: "フルーティ・グルマン", notes: ["桃", "カルダモン", "ラム", "パチュリ"], mood: ["官能", "夜の果実", "ビター"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [3, 8], description: "ビターな桃とラム。ロスト チェリーの兄弟、深い夜の一本。" },
    { id: "tf-cafe-rose", brand: "Tom Ford", name: "カフェ ローズ", family: "フローラル・グルマン", notes: ["コーヒー", "ローズ", "サフラン", "パチュリ"], mood: ["カフェ", "ローズ", "深紅"], season: ["autumn", "winter"], time: ["afternoon", "evening"], weather: ["cold", "cloudy"], energyDays: [4, 8], description: "コーヒーとローズの黒。寒い午後のカフェ・深い対話に。" },
    { id: "tf-jasmin-rouge", brand: "Tom Ford", name: "ジャスミン ルージュ", family: "フローラル・スパイシー", notes: ["ジャスミン", "クローブ", "シナモン", "ベチバー"], mood: ["官能", "深紅のジャスミン", "夜"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "深紅のスパイシージャスミン。重要な夜・配偶者との時間に。" },
    { id: "tf-rose-amalfi", brand: "Tom Ford", name: "ローズ ド アマルフィ", family: "フローラル・ローズ", notes: ["アマルフィレモン", "ローズ", "ラズベリー"], mood: ["地中海", "瑞々しいローズ", "陽光"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "アマルフィの陽光に輝くローズ。夏の朝・地中海の旅に。" },
    { id: "tf-rose-chine", brand: "Tom Ford", name: "ローズ ド シーヌ", family: "フローラル・オリエンタル", notes: ["ローズ", "ペッパー", "シダー", "アガーウッド"], mood: ["東洋", "シノワズリ", "深紅"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [7, 9], description: "中国茶寮のローズ。瞑想・茶道・東洋的な夜に。" },
    { id: "tf-rose-prick", brand: "Tom Ford", name: "ローズ プリック", family: "フローラル・スパイシー", notes: ["ローズ", "シチュアン胡椒", "パチュリ", "サンダル"], mood: ["棘", "刺激", "深紅"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [1, 8], description: "棘のあるローズ。攻めの夜・自己主張の場面に。" },
    { id: "tf-neroli-portofino", brand: "Tom Ford", name: "ネロリ ポルトフィーノ", family: "シトラス・ネロリ", notes: ["ネロリ", "ベルガモット", "オレンジ", "アンバー"], mood: ["地中海", "夏", "陽光"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [1, 5], description: "ポルトフィーノの陽光。夏の朝・リゾート・気分転換に。" },
    { id: "tf-soleil-neige", brand: "Tom Ford", name: "ソレイユ ネージュ", family: "ホワイトフローラル", notes: ["アルデヒド", "アイリス", "アンバー", "ホワイトフラワー"], mood: ["雪", "白", "冬の太陽"], season: ["winter"], time: ["afternoon", "evening"], weather: ["snow", "cold"], energyDays: [2, 9], description: "雪の上の冬の太陽。冬のスキー旅行・白い記念日に。" },
    { id: "tf-soleil-blanc", brand: "Tom Ford", name: "ソレイユ ブラン", family: "ソーラー・ココナッツ", notes: ["ココナッツ", "チュベローズ", "ベルガモット"], mood: ["太陽", "ビーチ", "リゾート"], season: ["spring", "summer"], time: ["afternoon", "evening"], weather: ["sunny", "hot"], energyDays: [3, 5], description: "太陽の白いビーチ。リゾート・夏の夕方・解放感に。" },
    { id: "tf-ebene-fume", brand: "Tom Ford", name: "エベーヌ フュメ", family: "ウッディ・スモーキー", notes: ["エボニー", "煙", "シダー", "サンダルウッド"], mood: ["黒檀", "煙", "重厚"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "fog", "cloudy"], energyDays: [4, 8], description: "黒檀と煙の重厚さ。深い夜の決断・男性的な威厳に。" },
    { id: "tf-tobacco-vanille", brand: "Tom Ford", name: "タバコ バニラ", family: "オリエンタル・スパイシー", notes: ["タバコリーフ", "バニラ", "カカオ", "ドライフルーツ", "トンカビーン"], mood: ["重厚", "セクシー", "リッチ"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "snow", "rainy", "cloudy"], energyDays: [4, 8], description: "深く甘いタバコの煙とバニラ。重要な決断・夜の集まり・寒い夜に。戊土と相性◎。" },
    { id: "tf-fucking-fabulous", brand: "Tom Ford", name: "ファッキン ファビュラス", family: "オリエンタル・レザー", notes: ["レザー", "ビターアーモンド", "オリス", "アンバー"], mood: ["威厳", "華麗", "毒気"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [1, 8], description: "圧倒的存在感の一本。最重要の夜・誰にも譲れない場面に。" },
    { id: "tf-vanilla-sex", brand: "Tom Ford", name: "バニラ セックス", family: "オリエンタル・バニラ", notes: ["バニラ", "ピンクペッパー", "ホワイトムスク"], mood: ["官能", "甘美", "親密"], season: ["autumn", "winter", "spring"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [6, 8], description: "親密な夜のバニラ。配偶者との特別な時間に。" },
    { id: "tf-myrrhe-mystere", brand: "Tom Ford", name: "ミルラ ミステール", family: "オリエンタル・インセンス", notes: ["ミルラ", "インセンス", "ベンゾイン", "アンバー"], mood: ["神秘", "聖なる", "瞑想"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "fog"], energyDays: [7, 9], description: "聖なるミルラの神秘。寺社参拝・瞑想・霊性の夜に。" },
    { id: "tf-rose-exposed", brand: "Tom Ford", name: "ローズ エクスポーズド", family: "フローラル・ローズ", notes: ["ターキッシュローズ", "サフラン", "アンバー"], mood: ["剥き出し", "深紅", "情熱"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "剥き出しのローズ。情熱を曝け出す夜に。" },
    { id: "tf-tuscan-leather", brand: "Tom Ford", name: "タスカン レザー", family: "レザー・スエード", notes: ["レザー", "ラズベリー", "サフラン", "ジャスミン"], mood: ["革", "成功", "イタリア"], season: ["autumn", "winter", "spring"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [1, 8], description: "イタリア最高級レザー。ビジネスの大きな勝負・経営者の貫禄に。" },
    { id: "tf-vanille-fatale", brand: "Tom Ford", name: "ヴァニーユ ファタール", family: "オリエンタル・バニラ", notes: ["バニラ", "シダー", "サフラン", "アンバー"], mood: ["官能", "致命的", "深い"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [6, 8], description: "致命的バニラの夜。深い愛・特別な夜の集まりに。" },
    { id: "tf-oud-wood", brand: "Tom Ford", name: "ウード ウッド", family: "ウッディ・ウード", notes: ["ウード", "ローズウッド", "サンダル", "アンバー"], mood: ["東洋", "瞑想", "上品"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [7, 9], description: "ウード入門の傑作。東洋的な威厳・落ち着いた夜に。" },
    { id: "tf-black-orchid", brand: "Tom Ford", name: "ブラック オーキッド", family: "オリエンタル・フローラル", notes: ["黒蘭", "トリュフ", "パチュリ", "ブラックバニラ"], mood: ["黒", "ゴシック", "謎"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "黒い蘭の謎。深い夜・自分を神秘で覆いたい時に。" },
    { id: "tf-mandarino-amalfi", brand: "Tom Ford", name: "マンダリーノ ディ アマルフィ", family: "シトラス", notes: ["マンダリン", "ベルガモット", "ライム", "バジル"], mood: ["地中海", "夏", "陽光"], season: ["spring", "summer"], time: ["morning", "afternoon"], weather: ["sunny", "hot"], energyDays: [1, 5], description: "アマルフィの太陽の柑橘。夏の朝・気分転換に。" },
    { id: "tf-white-suede", brand: "Tom Ford", name: "ホワイト スエード", family: "レザー・ムスキー", notes: ["ホワイトスエード", "ローズ", "サフラン", "ムスク"], mood: ["白い革", "上品", "クリーン"], season: ["spring", "autumn", "winter"], time: ["afternoon", "evening"], weather: ["cloudy", "cold"], energyDays: [2, 6], description: "白いスエードの柔らかさ。フォーマルな場・上品な日に。" },
    { id: "tf-oud-mineral", brand: "Tom Ford", name: "ウード ミネラル", family: "ウッディ・ミネラル", notes: ["ウード", "ミネラル", "海塩", "サンダルウッド"], mood: ["岩", "海", "ストイック"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [4, 7], description: "海岸の岩肌のウード。瞑想・自然と一体になる時間に。" },
    { id: "tf-noir-de-noir", brand: "Tom Ford", name: "ノワール ドゥ ノワール", family: "オリエンタル・ローズ", notes: ["黒トリュフ", "ローズ", "サフラン", "オード"], mood: ["黒のローズ", "贅沢", "深紅"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "黒のなかのローズ。最も贅沢な夜・記念日の決定打に。" },

    // ===== Yves Saint Laurent =====
    { id: "ysl-libre", brand: "Yves Saint Laurent", name: "リブレ", family: "フローラル・アロマティック", notes: ["ラベンダー", "オレンジブロッサム", "ジャスミン", "ムスク"], mood: ["自由", "モダン", "都会"], season: ["spring", "summer", "autumn"], time: ["morning", "afternoon", "evening"], weather: ["sunny", "cloudy"], energyDays: [3, 5], description: "自由を纏う一本。モダンな日々の万能フレグランス。" },
    { id: "ysl-babycat", brand: "Yves Saint Laurent", name: "ベビキャット", family: "オリエンタル・レザー", notes: ["タバコ", "レザー", "ハニー", "アンバー"], mood: ["官能", "毛皮", "夜"], season: ["autumn", "winter"], time: ["evening", "night"], weather: ["cold", "cloudy"], energyDays: [8, 9], description: "深紅の毛皮のような官能。最重要の夜・記憶に残したい場面に。" },
  ],
} as const;
