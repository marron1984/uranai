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
test("四柱推命 日柱", () => fp.day.ganzhi, (v) => v === "戊申");
test("四柱推命 時柱", () => fp.hour?.ganzhi, (v) => v === "己未");
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
test("今日の日柱 2026-05-27", () => todayDayPillar(today).ganzhi);
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
