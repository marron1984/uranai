// 全占断エンジンを実行し、各値が正しく計算されているか確認
import { OWNER, calcAge } from "@/lib/owner";
import { calcFourPillars, tongbianStar, twelveStage, generateDaiun, calcRuiun } from "@/lib/shichu";
import { honmeiStar, starRelation } from "@/lib/kyusei";
import { calcKua, dirRatings } from "@/lib/fengshui";
import { lifePathNumber, soulNumber, personalityNumber, birthdayNumber, personalYear } from "@/lib/numerology";
import { birthCards } from "@/lib/birthcard";
import { calcKakusu, kichikyo } from "@/lib/seimei";
import { accurateSunSign, moonPhase, solarTermsOfYear, sunLongitude } from "@/lib/astronomy";
import { drawCardsSeeded, FULL_DECK } from "@/lib/tarot";
import { hexagramFromYaos, castHexagramSeeded } from "@/lib/iching";
import { MBTI_PROFILES, compatibility } from "@/lib/mbti";
import { todayDayPillar, todayTongbianForOwner, todayHourlyChart, todayLuckyHours, todayPersonalHexagram, todayOneLiner, personalDay } from "@/lib/today";
import { calcCompat, buildPartnerProfile, YOSHIDA_KEYS } from "@/lib/compatCheck";
import { calcBusinessCompat } from "@/lib/businessCompat";
import { recommendPerfumes } from "@/lib/perfume";
import { verifyYoshidaShensha } from "@/lib/kanshiInteractions";
import { ANNUAL_2026_DEEP, KYUSEI_2026_ANNUAL, NUMEROLOGY_PERSONAL_CYCLE } from "@/lib/synthesisDeep";
import { ASTRO_TRANSIT_2026 } from "@/lib/synthesis";
import { birthMansion, todayMansion, dailyRelation, MANSIONS } from "@/lib/sukuyo";
import { kinFromDate, SOLAR_SEALS, GALACTIC_TONES } from "@/lib/maya";
import { hiddenStems, hiddenStemTongbian } from "@/lib/shichu";
import { biorhythm, bioCompat } from "@/lib/biorhythm";
import { dayGanzhi, dayTags, rokuyo, lunarDate } from "@/lib/koyomi";
import { dayStar, monthStar, yearStar, luckyStarsFor } from "@/lib/kyuseiBoard";
import { moonLongitude, accurateMoonSign, ascendant, midheaven } from "@/lib/astronomy";
import { ANIMAL_CHARS, animalChar } from "@/lib/animal";

type TestResult = { name: string; ok: boolean; detail: string };
const results: TestResult[] = [];

function test(name: string, fn: () => unknown, expected?: (v: unknown) => boolean) {
  try {
    const v = fn();
    const s = typeof v === "object" ? JSON.stringify(v).slice(0, 80) : String(v);
    const ok = expected ? expected(v) : true;
    results.push({ name, ok, detail: s });
  } catch (e: unknown) {
    results.push({ name, ok: false, detail: "ERROR: " + (e instanceof Error ? e.message : String(e)) });
  }
}

const today = new Date("2026-05-27T12:00:00+09:00");
const [y, m, d] = OWNER.birth.split("-").map(Number);

// ---- 1. owner.ts ----
test("OWNER.displayName", () => OWNER.displayName, (v) => v === "しゅんすけ");
test("OWNER.natal.mbti", () => OWNER.natal.mbti, (v) => v === "INFJ");
test("calcAge", () => calcAge(OWNER.birth), (v) => typeof v === "number" && (v as number) >= 41);

// ---- 2. 四柱推命 ----
const fp = calcFourPillars(y, m, d, OWNER.hour);
test("四柱推命 年柱", () => fp.year.ganzhi, (v) => v === "甲子");
test("四柱推命 月柱", () => fp.month.ganzhi, (v) => v === "戊辰");
test("四柱推命 日柱 (2026-06 外部暦突合で丙申に修正)", () => fp.day.ganzhi, (v) => v === "丙申");
test("四柱推命 時柱 (丙日未時 = 乙未)", () => fp.hour?.ganzhi, (v) => v === "乙未");
test("通変星 戊→甲", () => tongbianStar("戊", "甲"), (v) => v === "偏官");
test("通変星 戊→癸", () => tongbianStar("戊", "癸"), (v) => v === "正財");
test("十二運 戊×申", () => twelveStage("戊", "申"), (v) => v === "病");

const ruiun = calcRuiun(OWNER.birth, fp.year.stem, OWNER.gender);
const daiun = generateDaiun(fp.month.ganzhi, ruiun.startingAge, ruiun.forward, 9, calcAge(OWNER.birth), fp.day.stem);
test("立運", () => ruiun.startingAge, (v) => typeof v === "number" && (v as number) >= 0);
test("大運 9 期", () => daiun.length, (v) => v === 9);
test("大運 現在期", () => daiun.find((p) => p.isCurrent)?.ganzhi);

// ---- 3. 九星気学 ----
test("本命星 1984", () => honmeiStar(1984, 5, 2), (v) => v === 7);
test("九星関係 7×4", () => starRelation(7, 4).relation, (v) => v === "相剋(摩擦)");

// ---- 4. 風水 ----
test("calcKua 1984男", () => calcKua(1984, 5, 2, "male"), (v) => v === 7);
test("OWNER kua (override)", () => OWNER.natal.fengshui.kua, (v) => v === 6);
test("dirRatings kua=6", () => dirRatings(6).length, (v) => v === 8);

// ---- 5. 数秘術 ----
test("ライフパス 1984-05-02", () => lifePathNumber("1984-05-02"), (v) => v === 11);
test("ソウル YOSHIDA SHUNSUKE", () => soulNumber("YOSHIDA SHUNSUKE"));
test("誕生日数 02", () => birthdayNumber("1984-05-02"), (v) => v === 2);
test("パーソナルイヤー 2026", () => personalYear(OWNER.birth, 2026), (v) => v === 8);

// ---- 6. バースカード ----
const bc = birthCards("1984-05-02");
test("バースカード Personality", () => bc.personality.num, (v) => v === 11);
test("バースカード Soul", () => bc.soul.num, (v) => v === 2);

// ---- 7. 姓名判断 ----
const kak = calcKakusu([6, 5], [17, 7]);
test("姓名 天格", () => kak.ten, (v) => v === 11);
test("姓名 人格", () => kak.jin, (v) => v === 22);
test("姓名 地格", () => kak.chi, (v) => v === 24);
test("姓名 外格", () => kak.gai, (v) => v === 13);
test("姓名 総格", () => kak.so, (v) => v === 35);
test("姓名吉凶 22", () => kichikyo(22), (v) => v === "凶");
test("姓名吉凶 35", () => kichikyo(35), (v) => v === "吉");

// ---- 8. 西洋占星術 + 天文 ----
const sunSign = accurateSunSign(new Date(Date.UTC(1984, 4, 2, 4)));
test("太陽星座", () => sunSign.key, (v) => v === "taurus");
test("太陽黄経", () => Math.round(sunLongitude(new Date("2026-03-20T15:00:00Z")) * 10) / 10, (v) => typeof v === "number" && Math.abs((v as number) - 0) < 1);
test("月相", () => moonPhase(today).name);
const terms = solarTermsOfYear(2026);
test("24節気 2026", () => terms.length, (v) => v === 24);

// ---- 9. タロット ----
test("タロット全 78 枚", () => FULL_DECK.length, (v) => v === 78);
const drawn = drawCardsSeeded(3, 123);
test("タロット seeded draw", () => drawn.length, (v) => v === 3);

// ---- 10. 易経 ----
const yaos = castHexagramSeeded(456);
test("易経 6 爻", () => yaos.length, (v) => v === 6);
test("易経 卦導出", () => hexagramFromYaos(yaos).name);

// ---- 11. MBTI ----
test("MBTI 16 タイプ", () => Object.keys(MBTI_PROFILES).length, (v) => v === 16);
test("MBTI INFJ プロファイル", () => MBTI_PROFILES.INFJ.name, (v) => v === "提唱者");
test("MBTI 相性 INFJ×ENFP", () => compatibility("INFJ", "ENFP").level, (v) => v === "best");

// ---- 12. today.ts ----
test("今日の日柱 2026-05-27", () => todayDayPillar(today).ganzhi, (v) => v === "辛丑");
test("今日の通変星", () => todayTongbianForOwner(today).star);
test("12 時辰盤", () => todayHourlyChart(today).length, (v) => v === 12);
test("ラッキー時間 2", () => todayLuckyHours(today).length, (v) => v === 2);
test("パーソナル易卦", () => todayPersonalHexagram(OWNER.birth, today).hex.name);
test("PersonalDay 2026-05-27", () => personalDay(OWNER.birth, 2026, 5, 27), (v) => v === 4);

const ol = todayOneLiner(today);
test("今日の一言 line", () => ol.line, (v) => typeof v === "string" && (v as string).length > 0);
test("今日の一言 reading", () => ol.reading);

// ---- 13. compatCheck (相性) ----
test("YOSHIDA_KEYS mbti", () => YOSHIDA_KEYS.mbti, (v) => v === "INFJ");
const partnerProfile = buildPartnerProfile({ name: "妻", birth: "1969-12-21", gender: "female", mbti: "ENFJ" });
test("妻 PartnerProfile dayStem", () => partnerProfile.dayStem);
const compat = calcCompat({ name: "妻", birth: "1969-12-21", gender: "female", mbti: "ENFJ" });
test("妻との相性 axes", () => compat.axes.length, (v) => v === 7);
test("妻との相性 weightedScore", () => compat.weightedScore, (v) => typeof v === "number" && (v as number) >= 1 && (v as number) <= 5);

// ---- 14. businessCompat ----
const bizCompat = calcBusinessCompat({ name: "テスト", birth: "1990-06-15", gender: "male" });
test("ビジネス相性 overall", () => bizCompat.scores.overall, (v) => typeof v === "number");

// ---- 15. perfume ----
const perfs = recommendPerfumes(4, ["sunny", "hot"], "afternoon", "summer");
test("香水推薦", () => perfs.length, (v) => typeof v === "number" && (v as number) >= 1);
// 決定論: 同シードは同結果
test("香水 決定論 (同シード同結果)", () => {
  const a = recommendPerfumes(4, [], "afternoon", "summer", 2, 111).map((x) => x.perfume.id).join();
  const b = recommendPerfumes(4, [], "afternoon", "summer", 2, 111).map((x) => x.perfume.id).join();
  return a === b;
}, (v) => v === true);
// 分散: 30 日相当のシードでユニーク香水が 20 種以上 (固定化していない)
test("香水 分散 (30シードで20種以上)", () => {
  const set = new Set<string>();
  for (let d = 1; d <= 30; d++) {
    const seed = (2026 * 10000 + 600 + d) ^ 0x9e3779b9;
    const pd = (d % 9) + 1;
    recommendPerfumes(pd, [], "afternoon", "summer", 2, seed).forEach((x) => set.add(x.perfume.id));
  }
  return set.size;
}, (v) => typeof v === "number" && (v as number) >= 20);
// 2本は異なる香調 (family) を優先
test("香水 2本目は別系統優先", () => {
  const r = recommendPerfumes(3, [], "afternoon", "summer", 2, 4242);
  if (r.length < 2) return true;
  const f0 = (r[0].perfume as { family?: string }).family;
  const f1 = (r[1].perfume as { family?: string }).family;
  return f0 !== f1;
}, (v) => v === true);

// ---- 16. 命理主張の突合 (kanshiInteractions) ----
// サブエージェント産テキスト (SHICHU_DEEP_SHENSHA / ANNUAL_2026_DEEP 等) の
// 命理主張をアルゴリズムで検証する
const shenshaResults = verifyYoshidaShensha();
for (const r of shenshaResults) {
  test(`命理: ${r.claim.slice(0, 22)}`, () => r.detail, () => r.verified);
}

// ---- 17. 流年カードの鮮度 ----
const annualCards: { name: string; card: { validUntil?: string } }[] = [
  { name: "ANNUAL_2026_DEEP", card: ANNUAL_2026_DEEP },
  { name: "KYUSEI_2026_ANNUAL", card: KYUSEI_2026_ANNUAL },
  { name: "ASTRO_TRANSIT_2026", card: ASTRO_TRANSIT_2026 },
  { name: "NUMEROLOGY_PERSONAL_CYCLE", card: NUMEROLOGY_PERSONAL_CYCLE },
];
for (const { name, card } of annualCards) {
  test(`流年メタ: ${name}`, () => card.validUntil, (v) => typeof v === "string");
}
// 期限切れの警告 (テスト失敗にはしないが表示)
const expired = annualCards.filter(
  ({ card }) => card.validUntil && new Date() > new Date(card.validUntil + "T23:59:59+09:00")
);
if (expired.length > 0) {
  console.log("\n⚠ 期限切れの流年カード (UI に要更新バッジが表示されています):");
  for (const { name, card } of expired) console.log(`  - ${name} (期限 ${card.validUntil})`);
}

// ---- 18. 宿曜占星術 ----
test("宿曜 27 宿", () => MANSIONS.length, (v) => v === 27);
const myMansion = birthMansion(OWNER.birth, OWNER.hour);
test("宿曜 本命宿 (吉田)", () => myMansion.name, (v) => typeof v === "string" && (v as string).length > 0);
const tMansion = todayMansion(today);
test("宿曜 今日の宿", () => tMansion.name);
test("宿曜 日々の関係", () => dailyRelation(myMansion, tMansion).name, (v) => ["命","栄","衰","安","危","成","壊","友","親"].includes(v as string));

// ---- 19. マヤ暦 ----
test("マヤ 20 紋章", () => SOLAR_SEALS.length, (v) => v === 20);
test("マヤ 13 音", () => GALACTIC_TONES.length, (v) => v === 13);
const myKin = kinFromDate(OWNER.birth);
test("マヤ KIN (吉田)", () => myKin.kin, (v) => typeof v === "number" && (v as number) >= 1 && (v as number) <= 260);
test("マヤ 基準検証 2012-12-21", () => kinFromDate("2012-12-21").kin, (v) => v === 207);

// ---- 20. 蔵干 (shichu ブラッシュアップ) ----
test("蔵干 申", () => hiddenStems("申").main, (v) => v === "庚");
test("蔵干 辰", () => hiddenStems("辰").all.join(""), (v) => v === "乙癸戊");
test("蔵干通変星 戊×申", () => hiddenStemTongbian("戊", "申").map(h => h.star).join(","), (v) => (v as string).includes("食神"));

// ---- 日干支の外部アンカー突合 (2026-06 リサーチで取得した外部暦の既知日) ----
test("日干支アンカー 2025-12-21", () => dayGanzhi(new Date("2025-12-21T12:00:00+09:00")).ganzhi, (v) => v === "甲子");
test("日干支アンカー 2026-03-05 (天赦日)", () => dayGanzhi(new Date("2026-03-05T12:00:00+09:00")).ganzhi, (v) => v === "戊寅");
test("日干支アンカー 2026-12-16", () => dayGanzhi(new Date("2026-12-16T12:00:00+09:00")).ganzhi, (v) => v === "甲子");

// ---- 暦 (koyomi) ----
const tensha26 = ["2026-03-05", "2026-05-04", "2026-05-20", "2026-07-19", "2026-10-01", "2026-12-16"];
test("天赦日 2026 全6回", () => tensha26.filter((s) => dayTags(new Date(s + "T12:00:00+09:00")).tags.some((t) => t.name === "天赦日")).length, (v) => v === 6);
test("一粒万倍日 2026-06-12", () => dayTags(new Date("2026-06-12T12:00:00+09:00")).tags.some((t) => t.name === "一粒万倍日"), (v) => v === true);
test("六曜 2026-06-11 = 大安", () => rokuyo(new Date("2026-06-11T12:00:00+09:00"))?.name, (v) => v === "大安");
test("旧暦 2026-02-17 = 旧正月", () => JSON.stringify(lunarDate(new Date("2026-02-17T12:00:00+09:00"))), (v) => v === '{"month":1,"day":1,"isLeap":false}');
test("旧暦 2026-06-15 = 旧5/1 (朔)", () => lunarDate(new Date("2026-06-15T12:00:00+09:00"))?.day, (v) => v === 1);

// ---- 九星 日盤・月盤 ----
test("日盤 2025-12-21 = 陽遁始め一白", () => dayStar(new Date("2025-12-21T12:00:00+09:00")).star, (v) => v === 1);
test("日盤 2026-06-11 = 二黒", () => dayStar(new Date("2026-06-11T12:00:00+09:00")).star, (v) => v === 2);
test("日盤 2026-06-19 = 陰遁始め九紫", () => { const r = dayStar(new Date("2026-06-19T12:00:00+09:00")); return r.star === 9 && r.ton === "陰遁"; }, (v) => v === true);
test("月盤 2026-06 = 四緑", () => monthStar(new Date("2026-06-11T12:00:00+09:00")).star, (v) => v === 4);
test("月盤 2026-05 = 五黄", () => monthStar(new Date("2026-05-10T12:00:00+09:00")).star, (v) => v === 5);
test("年盤 2026 = 一白", () => yearStar(2026, 6, 11), (v) => v === 1);
// 立春の JST 日境界 (2026 立春 = 2/3 19:50 UTC = 2/4 04:50 JST — UTC 日付比較だと 2/3 を誤判定する)
test("年盤 立春境界 2026-02-03 = 二黒 (前年)", () => yearStar(2026, 2, 3), (v) => v === 2);
test("年盤 立春境界 2026-02-04 = 一白", () => yearStar(2026, 2, 4), (v) => v === 1);
test("年盤 立春境界 2025-02-02 = 三碧 (前年)", () => yearStar(2025, 2, 2), (v) => v === 3);
test("七赤の吉星 = 1,2,6,8", () => luckyStarsFor(7).join(","), (v) => v === "1,2,6,8");

// ---- 月星座・ASC (天文計算) ----
const natalDate = new Date("1984-05-02T13:00:00+09:00");
test("月黄経 1984-05-02 (外部値 53.8°±0.5)", () => Math.round(moonLongitude(natalDate) * 10) / 10, (v) => Math.abs((v as number) - 53.8) < 0.5);
test("月星座 = 牡牛座", () => accurateMoonSign(natalDate).key, (v) => v === "taurus");
test("ASC 1984-05-02 13:00 大阪 (151.5°±1)", () => Math.round(ascendant(natalDate, 135.5447, 34.6913) * 10) / 10, (v) => Math.abs((v as number) - 151.5) < 1);
test("MC = 牡牛座 28°前後", () => Math.round(midheaven(natalDate, 135.5447) * 10) / 10, (v) => Math.abs((v as number) - 58.0) < 1);

// ---- 動物占い ----
test("動物 60 キャラ", () => ANIMAL_CHARS.length, (v) => v === 60);
test("動物 干支整合 (全60)", () => ANIMAL_CHARS.every((c, i) => c.num === i + 1), (v) => v === true);
test("動物 本人 (丙申=33)", () => animalChar(OWNER.birth).name, (v) => v === "活動的な子守熊");
test("動物 No.45 戊申", () => ANIMAL_CHARS[44].name, (v) => v === "サービス精神旺盛な子守熊");

// ---- バイオリズム (2026-05-27 基準) ----
const bio = biorhythm(OWNER.birth, today);
test("バイオ 経過日数 (1984-05-02→2026-05-27)", () => bio.days, (v) => v === 15365);
test("バイオ 身体 (周期23)", () => bio.cycles.find(c => c.def.key === "physical")?.value, (v) => v === 27);
test("バイオ 感情 (周期28)", () => bio.cycles.find(c => c.def.key === "emotional")?.value, (v) => v === -100);
test("バイオ 知性 (周期33)", () => bio.cycles.find(c => c.def.key === "intellectual")?.value, (v) => v === -62);
test("バイオ 総合 (3リズム平均)", () => bio.composite, (v) => v === Math.round((27 + -100 + -62) / 3));
test("バイオ 拡張含め 7 リズム", () => bio.cycles.length, (v) => v === 7);
const bioWife = bioCompat(OWNER.birth, OWNER.family.spouse.birth);
test("バイオ 妻との総合同調度", () => bioWife.overall, (v) => v === Math.round((85 + -62 + 98) / 3));
test("バイオ 妻 身体同調度", () => bioWife.cycles.find(c => c.def.key === "physical")?.sync, (v) => v === 85);

// ---- 出力 ----
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log("=".repeat(70));
console.log(`占断エンジン全 ${results.length} 項目のヘルスチェック`);
console.log("=".repeat(70));
for (const r of results) {
  const mark = r.ok ? "✅" : "❌";
  console.log(`${mark}  ${r.name.padEnd(30)} → ${r.detail.slice(0, 50)}`);
}
console.log("");
console.log(`合計: ${passed}/${results.length} pass`);
if (failed.length > 0) {
  console.log("失敗項目:");
  for (const f of failed) console.log("  - " + f.name + ": " + f.detail);
  process.exit(1);
}
