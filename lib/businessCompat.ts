// ビジネス相性チェッカー
// 任意の人物（生年月日・性別・氏名）を入力 → 吉田俊輔さんとの
// ビジネス相性を多軸で算出する。

import { OWNER, ownerAge, calcAge } from "@/lib/owner";
import { getSunSign, ZODIAC, type Zodiac } from "@/lib/astrology";
import {
  honmeiStar,
  STAR_NAME,
  STAR_ELEMENT,
  starRelation,
  type StarNumber,
} from "@/lib/kyusei";
import { lifePathNumber } from "@/lib/numerology";
import { tongbianStar, type TongbianStar } from "@/lib/shichu";
import { zodiacCompat } from "@/lib/compat";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

// 吉田さんの日柱基準で相手の日干を算出
export function partnerDayStem(birth: string): string {
  const [y, m, d] = birth.split("-").map(Number);
  const baseUTC = Date.UTC(1984, 4, 2); // 戊申
  const targetUTC = Date.UTC(y, m - 1, d);
  const days = Math.floor((targetUTC - baseUTC) / 86400000);
  const stemIdx = ((4 + days) % 10 + 10) % 10;
  return STEMS[stemIdx];
}

// 相手の年支（生まれ年の干支：簡易立春2/4境）
export function partnerYearBranch(birth: string): string {
  const [y, m, d] = birth.split("-").map(Number);
  const eff = m < 2 || (m === 2 && d < 4) ? y - 1 : y;
  const idx = ((eff - 4) % 12 + 12) % 12;
  return BRANCHES[idx];
}

// 干支の関係（吉田=子年と相手の年支）
export function branchInteraction(yourBranch: string, theirBranch: string): {
  type: "三合" | "六合" | "沖" | "害" | "刑" | "なし";
  text: string;
  score: number; // 1-5
} {
  // 三合
  const trine = [
    ["申", "子", "辰"],
    ["寅", "午", "戌"],
    ["巳", "酉", "丑"],
    ["亥", "卯", "未"],
  ];
  for (const t of trine) {
    if (t.includes(yourBranch) && t.includes(theirBranch) && yourBranch !== theirBranch) {
      return { type: "三合", text: "三合の関係。最強の結びつき、長期の協力に最適", score: 5 };
    }
  }
  // 六合
  const six: Record<string, string> = {
    子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯",
    辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午",
  };
  if (six[yourBranch] === theirBranch) {
    return { type: "六合", text: "六合の関係。穏やかで調和的、信頼を育てやすい", score: 5 };
  }
  // 沖
  const opposites: Record<string, string> = {
    子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
    卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
  };
  if (opposites[yourBranch] === theirBranch) {
    return { type: "沖", text: "沖の関係。緊張感あり、対立しやすいが刺激にもなる", score: 2 };
  }
  // 害
  const harm: Record<string, string> = {
    子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
    卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
  };
  if (harm[yourBranch] === theirBranch) {
    return { type: "害", text: "害の関係。小さな摩擦が積み重なりやすい、距離感に注意", score: 2 };
  }
  return { type: "なし", text: "干支間の特殊な関係はなし。中立的な相性", score: 3 };
}

// 相手の日干に応じたビジネス役割（戊土のYoshidaから見た補完）
const ROLE_BY_DAY_MASTER: Record<string, { role: string; complement: string }> = {
  甲: { role: "ビジョン提示・新規開拓のパイオニア", complement: "あなたの土壌に伸びる大樹。ビジネスの種を最初に植える役" },
  乙: { role: "渉外・調整・ソフト営業", complement: "柔らかな蔓のように人と人を繋ぐ役。摩擦を吸収する潤滑油" },
  丙: { role: "ブランド構築・広告・PR・対外発信", complement: "太陽のように事業を照らす。組織の顔・スポークスパーソン" },
  丁: { role: "職人・技術専門家・ナイト型実装者", complement: "灯火のような深い専門性で、内側で本質を磨く役" },
  戊: { role: "ナンバー2・地ならし・基盤構築", complement: "同じ山として相互補完。大組織の二頭体制に向く" },
  己: { role: "サポート・運用・カスタマーサクセス・人事", complement: "田畑のように丁寧に育てる役。長期メンテナンスに強い" },
  庚: { role: "改革・切り込み・営業先鋒・難局突破", complement: "鉄のような決断力。あなたの慎重さを補う斬り込み隊長" },
  辛: { role: "プロデュース・ブランド・美意識・品質管理", complement: "宝石のような繊細な品格。差別化と高級化の鍵" },
  壬: { role: "流通・人脈・コミュニティ運営・国際展開", complement: "大河のように財と人を流す。スケール役" },
  癸: { role: "リサーチ・分析・経理・知識集約", complement: "雨のように細やかな知性で潤す。データと洞察の番人" },
};

// 通変星別スコア（戊から相手の日干へ）
const DECISION_SCORE: Record<TongbianStar, number> = {
  比肩: 3, 劫財: 2, 食神: 4, 傷官: 3, 偏財: 4, 正財: 5, 偏官: 4, 正官: 5, 偏印: 3, 印綬: 5,
};
const FINANCE_SCORE: Record<TongbianStar, number> = {
  比肩: 2, 劫財: 1, 食神: 4, 傷官: 3, 偏財: 5, 正財: 5, 偏官: 3, 正官: 4, 偏印: 3, 印綬: 3,
};
const LONGTERM_SCORE: Record<TongbianStar, number> = {
  比肩: 3, 劫財: 2, 食神: 4, 傷官: 2, 偏財: 3, 正財: 4, 偏官: 3, 正官: 4, 偏印: 3, 印綬: 5,
};
const STEM_EXEC: Record<string, number> = {
  甲: 5, 乙: 4, 丙: 4, 丁: 4, 戊: 3, 己: 3, 庚: 5, 辛: 4, 壬: 5, 癸: 4,
};

export type BusinessCompatInput = {
  name?: string;
  birth: string; // YYYY-MM-DD
  gender: "male" | "female";
};

export type BusinessCompatResult = {
  partner: {
    name: string;
    birth: string;
    gender: "male" | "female";
    age: number;
  };
  data: {
    sunSign: Zodiac;
    starNumber: StarNumber;
    starName: string;
    starElement: string;
    dayMaster: string;
    dayMasterElement: string;
    lifePath: number;
    yearBranch: string;
  };
  // 比較
  zodiacCompat: ReturnType<typeof zodiacCompat>;
  starCompat: ReturnType<typeof starRelation>;
  tongbian: TongbianStar;
  branchInter: ReturnType<typeof branchInteraction>;
  // ビジネス6軸スコア
  scores: {
    overall: number;
    decision: number;
    execution: number;
    communication: number;
    finance: number;
    longTerm: number;
    chemistry: number;
  };
  roles: { you: string; partner: string };
  partnerComplement: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
  detailedAnalysis: string;
};

// （年齢計算は lib/owner.ts の calcAge / ownerAge に統合）

export function calcBusinessCompat(input: BusinessCompatInput): BusinessCompatResult {
  const [, m, d] = input.birth.split("-").map(Number);
  const sun = getSunSign(m, d);
  const star = honmeiStar(
    Number(input.birth.split("-")[0]),
    m,
    d
  );
  const dayStem = partnerDayStem(input.birth);
  const yearBranch = partnerYearBranch(input.birth);
  const lifePath = lifePathNumber(input.birth);
  const age = calcAge(input.birth);

  const stemElementMap: Record<string, string> = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
    己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
  };

  // Yoshida = 戊申, 牡牛座, 七赤, ライフパス11, 子年
  const zc = zodiacCompat("taurus", sun.key);
  const sc = starRelation(7, star);
  const tb = tongbianStar("戊", dayStem);
  const bi = branchInteraction("子", yearBranch);

  // Communication = star compat + zodiac compat
  const communication = Math.round((zc.score + sc.score) / 2);
  const decision = DECISION_SCORE[tb];
  const execution = STEM_EXEC[dayStem];
  const finance = FINANCE_SCORE[tb];
  const longTerm = LONGTERM_SCORE[tb];
  const chemistry = bi.score;
  const overall = Math.round(
    (decision + execution + communication + finance + longTerm + chemistry) / 6
  );

  // 強み・リスク・推奨
  const strengths: string[] = [];
  const risks: string[] = [];

  if (sc.score >= 4) strengths.push(`九星${STAR_NAME[star]}との五行が${sc.relation}。${sc.text}`);
  else if (sc.score <= 2) risks.push(`九星五行が${sc.relation}。${sc.text}`);

  if (zc.score >= 4) strengths.push(`星座: ${zc.text}`);
  else if (zc.score <= 2) risks.push(`星座: ${zc.text}`);

  if (tb === "印綬" || tb === "正官") strengths.push(`通変星「${tb}」: 信頼と規律で長く続く理想の組合せ`);
  else if (tb === "正財" || tb === "食神") strengths.push(`通変星「${tb}」: 堅実な利益と楽しみが両立する好相性`);
  else if (tb === "劫財" || tb === "傷官") risks.push(`通変星「${tb}」: お金や言葉の摩擦に注意。役割分担を明確に`);

  if (bi.type === "三合" || bi.type === "六合") strengths.push(`年支「子」と「${yearBranch}」が${bi.type}: ${bi.text}`);
  else if (bi.type === "沖" || bi.type === "害") risks.push(`年支「子」と「${yearBranch}」が${bi.type}: ${bi.text}`);

  // 役割分担
  const partnerRole = ROLE_BY_DAY_MASTER[dayStem];
  const yourRole = "リーダー・経営判断・基盤構築・最終決裁（戊土の山）";

  // 推奨
  let recommendation = "";
  if (overall >= 5) recommendation = "★★★★★ 天才的なビジネスパートナー。役割を明確にすれば長期で大きな成功を作れる。";
  else if (overall >= 4) recommendation = "★★★★☆ 良好な相性。違いを補完し合えば確かな伸びが期待できる。";
  else if (overall >= 3) recommendation = "★★★☆☆ 中庸。役割と境界線を明文化すれば十分機能する関係。";
  else if (overall >= 2) recommendation = "★★☆☆☆ 課題あり。短期プロジェクトは可能、長期同居型ビジネスは慎重に。";
  else recommendation = "★☆☆☆☆ 相性難。ビジネスより別の関係（顧客・取引先など距離のある関わり）が向く。";

  // 詳細分析
  const detailedAnalysis = generateDetailedAnalysis(
    input.name || "相手",
    sun, star, dayStem, lifePath, yearBranch,
    tb, sc, zc, bi, age
  );

  return {
    partner: {
      name: input.name || "—",
      birth: input.birth,
      gender: input.gender,
      age,
    },
    data: {
      sunSign: sun,
      starNumber: star,
      starName: STAR_NAME[star],
      starElement: STAR_ELEMENT[star],
      dayMaster: dayStem,
      dayMasterElement: stemElementMap[dayStem],
      lifePath,
      yearBranch,
    },
    zodiacCompat: zc,
    starCompat: sc,
    tongbian: tb,
    branchInter: bi,
    scores: {
      overall,
      decision,
      execution,
      communication,
      finance,
      longTerm,
      chemistry,
    },
    roles: { you: yourRole, partner: partnerRole.role },
    partnerComplement: partnerRole.complement,
    strengths,
    risks,
    recommendation,
    detailedAnalysis,
  };
}

function generateDetailedAnalysis(
  name: string,
  sun: Zodiac,
  star: StarNumber,
  dayStem: string,
  lifePath: number,
  yearBranch: string,
  tb: TongbianStar,
  sc: ReturnType<typeof starRelation>,
  zc: ReturnType<typeof zodiacCompat>,
  bi: ReturnType<typeof branchInteraction>,
  age: number
): string {
  // 吉田さんの実年齢を当日基準で動的計算
  const yoshidaAgeNow = ownerAge();
  const ageDiff = age - yoshidaAgeNow;
  // age (相手) > yoshidaAge → 相手は『年上』 / age < yoshidaAge → 『年下』
  const ageDiffText =
    ageDiff > 0
      ? `あなたより${ageDiff}歳年上`
      : ageDiff < 0
      ? `あなたより${-ageDiff}歳年下`
      : "ほぼ同年代";

  return [
    `${name}さん（${sun.name}・${STAR_NAME[star]}・日干${dayStem}・ライフパス${lifePath}・${yearBranch}年生まれ・${ageDiffText}）との相性を、ビジネス視点で多軸分析しました。`,
    "",
    `【五行相性の核】あなたの日主『戊（陽土）』に対して、${name}さんの日干『${dayStem}』は通変星『${tb}』の関係を結びます。これはビジネスにおいて『${tb}的な役割の相手』として機能することを意味します。`,
    "",
    `【九星の流れ】あなたの七赤金 × ${name}さんの${STAR_NAME[star]}は『${sc.relation}』。${sc.text} 五行レベルで、${
      sc.score >= 4 ? "互いを高め合う" : sc.score >= 3 ? "中立的に共存する" : "摩擦を生みやすい"
    }関係です。`,
    "",
    `【星座のコミュニケーション相性】牡牛座×${sun.name}は「${zc.text}」 — 価値観と感情の表現方法に${
      zc.score >= 4 ? "親和性があり、深い対話が成立しやすい" : "違いがあり、丁寧な擦り合わせが必要"
    }。`,
    "",
    `【年支の縁】あなたの子年 × ${name}さんの${yearBranch}年は『${bi.type}』。${bi.text}`,
    "",
    `【ビジネス上の最適配置】あなたが${
      "リーダー・経営判断・基盤構築"
    }、${name}さんが『${ROLE_BY_DAY_MASTER[dayStem].role}』を担うと、二人の強みが噛み合います。${ROLE_BY_DAY_MASTER[dayStem].complement}`,
    "",
    `【避けるべき罠】${
      tb === "劫財" ? "金銭の取り分・利益配分で揉めやすい。契約書を最初に明文化すること。" :
      tb === "傷官" ? "言葉の鋭さで衝突しやすい。会議は議事録・書面で残し、口頭の感情論を避ける。" :
      tb === "比肩" ? "互いに自我が強く主導権争いになりがち。役割と決裁範囲を明確に分ける。" :
      tb === "偏官" ? "決断のスピード差で不満が溜まる。意思決定プロセスを最初に定義する。" :
      "感情の温度差や時間軸の違い。週次1on1で擦り合わせを習慣化することで防げる。"
    }`,
    "",
    `【長期見通し】${
      LONGTERM_SCORE[tb] >= 4 ? "10年単位で続く関係に向く。共同経営・パートナーシップの素地あり。" :
      LONGTERM_SCORE[tb] >= 3 ? "3〜5年のプロジェクト単位なら好相性。長期は契約と境界線で支える。" :
      "短期プロジェクト型が向く。長期同居型より、案件ごとの提携や顧客関係が安定する。"
    }`,
  ].join("\n");
}
