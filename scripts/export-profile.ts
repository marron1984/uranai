// scripts/export-profile.ts
// 吉田駿成氏の全占断値を JSON で出力する。
// 別の人々との相互相性をこの JSON 1 つで計算できる「自己完結プロファイル」。

import { OWNER, calcAge } from "@/lib/owner";
import { calcFourPillars, tongbianStar, twelveStage, generateDaiun, calcRuiun, STEM_ELEMENT, BRANCH_ELEMENT } from "@/lib/shichu";
import { honmeiStar, STAR_NAME, STAR_ELEMENT, STAR_DIRECTION } from "@/lib/kyusei";
import { calcKua, KUA_NAMES, dirRatings } from "@/lib/fengshui";
import { lifePathNumber, soulNumber, personalityNumber, expressionNumber, birthdayNumber, personalYear } from "@/lib/numerology";
import { birthCards } from "@/lib/birthcard";
import { calcKakusu, kichikyo, KAKUSU_LABEL } from "@/lib/seimei";
import { accurateSunSign } from "@/lib/astronomy";
import { MBTI_PROFILES } from "@/lib/mbti";
import * as fs from "fs";
import * as path from "path";

const o = OWNER;
const [y, m, d] = o.birth.split("-").map(Number);
const birthDate = new Date(Date.UTC(y, m - 1, d, o.hour, 0, 0));
const currentYear = new Date().getFullYear();
const age = calcAge(o.birth);

// 四柱推命
const fp = calcFourPillars(y, m, d, o.hour);
const dayMaster = fp.day.stem;

// 通変星 (柱別)
const tongbianByPillar = {
  year: tongbianStar(dayMaster, fp.year.stem),
  month: tongbianStar(dayMaster, fp.month.stem),
  day: "日主",
  hour: fp.hour ? tongbianStar(dayMaster, fp.hour.stem) : null,
};

// 十二運 (柱別)
const twelveByPillar = {
  year: twelveStage(dayMaster, fp.year.branch),
  month: twelveStage(dayMaster, fp.month.branch),
  day: twelveStage(dayMaster, fp.day.branch),
  hour: fp.hour ? twelveStage(dayMaster, fp.hour.branch) : null,
};

// 五行カウント
const fiveCount: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
[fp.year.stem, fp.month.stem, fp.day.stem, fp.hour?.stem].filter(Boolean).forEach((s) => {
  fiveCount[STEM_ELEMENT[s as string]]++;
});
[fp.year.branch, fp.month.branch, fp.day.branch, fp.hour?.branch].filter(Boolean).forEach((b) => {
  fiveCount[BRANCH_ELEMENT[b as string]]++;
});

// 大運
const ruiun = calcRuiun(o.birth, fp.year.stem, o.gender);
const daiun = generateDaiun(fp.month.stem + fp.month.branch, ruiun.startingAge, ruiun.forward, 9, age, dayMaster);

// 九星
const honmei = honmeiStar(y, m, d);
const getsumei = o.natal.kyusei.getsumei;

// 風水 (owner.ts の確定値を優先・サイト全体でこの値を参照)
const kua = o.natal.fengshui.kua;
const kuaComputed = calcKua(y, m, d, o.gender);
const dirs = dirRatings(kua);

// 数秘
const lp = lifePathNumber(o.birth);
const soul = soulNumber(o.nameRoman);
const persona = personalityNumber(o.nameRoman);
const expr = expressionNumber(o.nameRoman);
const bday = birthdayNumber(o.birth);
const py = personalYear(o.birth, currentYear);

// バースカード
const bc = birthCards(o.birth);

// 姓名
const kakusu = calcKakusu([...o.nameSeiKakusu], [...o.nameMeiKakusu]);
const kichikyoAll = {
  ten: kichikyo(kakusu.ten),
  jin: kichikyo(kakusu.jin),
  chi: kichikyo(kakusu.chi),
  gai: kichikyo(kakusu.gai),
  so: kichikyo(kakusu.so),
};

// 西洋占星術
const accurate = accurateSunSign(birthDate);

// MBTI
const mbtiProfile = MBTI_PROFILES[o.natal.mbti];

// 家族
function familyProfile(person: { birth: string; gender?: string }, defaultGender: "male" | "female") {
  const [py, pm, pd] = person.birth.split("-").map(Number);
  const g = (person.gender as "male" | "female") ?? defaultGender;
  const pfp = calcFourPillars(py, pm, pd, null);
  return {
    birth: person.birth,
    fourPillars: {
      year: pfp.year.ganzhi,
      month: pfp.month.ganzhi,
      day: pfp.day.ganzhi,
      hour: null,
    },
    dayStem: pfp.day.stem,
    yearBranch: pfp.year.branch,
    honmei: honmeiStar(py, pm, pd),
    kua: calcKua(py, pm, pd, g),
    lifePath: lifePathNumber(person.birth),
    birthday: birthdayNumber(person.birth),
    birthCards: {
      personality: birthCards(person.birth).personality.num,
      soul: birthCards(person.birth).soul.num,
    },
    // 戊から見た相手の通変星
    tongbianVsYoshida: tongbianStar(dayMaster, pfp.day.stem),
  };
}

const profile = {
  $schema: "uranai-yoshida-profile-v1",
  generatedAt: new Date().toISOString(),

  identity: {
    displayName: o.displayName,
    nameSei: o.nameSei,
    nameMei: o.nameMei,
    nameRoman: o.nameRoman,
    birth: o.birth,
    hour: o.hour,
    age,
    gender: o.gender,
    bloodType: o.bloodType,
    birthplace: o.birthplace,
    residence: o.residence,
  },

  // ----- 西洋占星術 -----
  astrology: {
    sunSign: {
      key: accurate.key,
      name: accurate.name,
      degree: accurate.degree,
    },
    // 月星座・ASC は手動確定値 (出生時刻と緯度経度から計算可能)
    approx: {
      moon: o.natal.moonApprox,
      asc: o.natal.ascApprox,
      mc: o.natal.mcApprox,
    },
  },

  // ----- 四柱推命 -----
  shichu: {
    fourPillars: {
      year:  { ganzhi: fp.year.ganzhi,  stem: fp.year.stem,  branch: fp.year.branch,  element: STEM_ELEMENT[fp.year.stem],  branchElement: BRANCH_ELEMENT[fp.year.branch] },
      month: { ganzhi: fp.month.ganzhi, stem: fp.month.stem, branch: fp.month.branch, element: STEM_ELEMENT[fp.month.stem], branchElement: BRANCH_ELEMENT[fp.month.branch] },
      day:   { ganzhi: fp.day.ganzhi,   stem: fp.day.stem,   branch: fp.day.branch,   element: STEM_ELEMENT[fp.day.stem],   branchElement: BRANCH_ELEMENT[fp.day.branch] },
      hour:  fp.hour ? { ganzhi: fp.hour.ganzhi, stem: fp.hour.stem, branch: fp.hour.branch, element: STEM_ELEMENT[fp.hour.stem], branchElement: BRANCH_ELEMENT[fp.hour.branch] } : null,
    },
    dayMaster: { stem: dayMaster, element: STEM_ELEMENT[dayMaster] },
    tongbianByPillar,
    twelveByPillar,
    fiveElementCount: fiveCount,
    isOverbalanced: { element: "土", description: "偏土命 (土が三柱以上)" },
    ruiun: {
      startingAge: ruiun.startingAge,
      forward: ruiun.forward,
      daysToTerm: ruiun.daysToTerm,
    },
    daiun: daiun.map((p) => ({
      index: p.index,
      ageRange: [p.startAge, p.endAge],
      ganzhi: p.ganzhi,
      stem: p.stem,
      branch: p.branch,
      tongbian: p.stemTongbian,
      stemElement: p.stemElement,
      branchElement: p.branchElement,
      isCurrent: p.isCurrent,
      theme: p.theme,
    })),
  },

  // ----- 九星気学 -----
  kyusei: {
    honmei: { num: honmei, name: STAR_NAME[honmei], element: STAR_ELEMENT[honmei], direction: STAR_DIRECTION[honmei] },
    getsumei: { num: getsumei, name: STAR_NAME[getsumei as 1|2|3|4|5|6|7|8|9], element: STAR_ELEMENT[getsumei as 1|2|3|4|5|6|7|8|9] },
  },

  // ----- 風水 -----
  fengshui: {
    kua,                            // 6 (owner.ts 確定値・サイトで実際に使用)
    kuaAlgorithm: kuaComputed,      // 7 (calcKua 算出値・参考)
    name: KUA_NAMES[kua]?.name,
    group: KUA_NAMES[kua]?.group,
    directions: dirs,
  },

  // ----- 数秘術 -----
  numerology: {
    lifePath: lp,
    birthday: bday,
    soul,
    personality: persona,
    expression: expr,
    personalYear: { year: currentYear, value: py },
  },

  // ----- バースカード -----
  birthCard: {
    personality: { num: bc.personality.num, name: bc.personality.name, en: bc.personality.en },
    soul: { num: bc.soul.num, name: bc.soul.name, en: bc.soul.en },
  },

  // ----- 姓名判断 -----
  seimei: {
    kakusu,
    kichikyo: kichikyoAll,
    detail: Object.fromEntries(
      Object.entries(kakusu).map(([k, v]) => [
        k,
        { value: v, label: KAKUSU_LABEL[k as keyof typeof kakusu].label, sub: KAKUSU_LABEL[k as keyof typeof kakusu].sub, kichikyo: kichikyoAll[k as keyof typeof kakusu] },
      ])
    ),
  },

  // ----- MBTI -----
  mbti: {
    type: o.natal.mbti,
    name: mbtiProfile.name,
    nickname: mbtiProfile.nickname,
    populationRate: mbtiProfile.populationRate,
    group: mbtiProfile.group,
    cognitive: mbtiProfile.cognitive,
    axes: mbtiProfile.axes,
    bestMatch: mbtiProfile.bestMatch,
    goodMatch: mbtiProfile.goodMatch,
    challenging: mbtiProfile.challenging,
  },

  // ----- 家族 (既存データ + 計算値) -----
  family: {
    spouse: familyProfile(o.family.spouse, "female"),
    child:  familyProfile(o.family.child,  "male"),
  },

  // ----- 相互相性算出用の主要キー -----
  // 他人 (新規) との相性計算は ↓ のキーで OK
  compatKeys: {
    dayStem: dayMaster,             // 戊
    dayBranch: fp.day.branch,        // 申
    yearBranch: fp.year.branch,      // 子
    honmei,                          // 7 (七赤金)
    sunSign: accurate.key,           // taurus
    lifePath: lp,                    // 11
    kua,                             // 6 (乾)
    mbti: o.natal.mbti,              // INFJ
    birthCardPersonality: bc.personality.num,  // 11 (正義)
    birthCardSoul: bc.soul.num,                // 2 (女教皇)
  },
};

// kua 値を上書き
profile.compatKeys.kua = kua;

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync(path.join("docs", "yoshida-profile.json"), JSON.stringify(profile, null, 2));
console.log("✅ wrote docs/yoshida-profile.json", (JSON.stringify(profile).length / 1024).toFixed(1), "KB");
