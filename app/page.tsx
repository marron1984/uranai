"use client";

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  getSunSign,
  getDailyFortune,
  LUCKY,
  ZODIAC,
  type Zodiac,
} from "@/lib/astrology";
import { drawCards, SPREAD_LABELS, type DrawnCard } from "@/lib/tarot";
import {
  lifePathNumber,
  soulNumber,
  personalityNumber,
  expressionNumber,
  birthdayNumber,
  personalYear,
  LIFE_PATH_MEANINGS,
  PERSONAL_YEAR_TEXT,
} from "@/lib/numerology";
import {
  castHexagram,
  hexagramFromYaos,
  changedHexagram,
  trigramName,
  yaoSymbol,
  changingLineMeanings,
  type Yao,
} from "@/lib/iching";
import {
  fourPillarsFromGanzhi,
  calcShichuExtras,
  DAY_MASTER_TEXT,
  TONGBIAN_TEXT,
  TWELVE_TEXT,
} from "@/lib/shichu";
import {
  dirRatings,
  KUA_NAMES,
  RATING_TEXT,
  annualDirection,
  type DirRating,
} from "@/lib/fengshui";
import {
  STAR_NAME,
  STAR_ELEMENT,
  STAR_DIRECTION,
  STAR_DEEP,
  type StarNumber,
} from "@/lib/kyusei";
import {
  calcKakusu,
  kichikyo,
  KAKUSU_LABEL,
  NUMBER_DEEP,
} from "@/lib/seimei";
import { birthCards, BIRTH_CARD_DEEP } from "@/lib/birthcard";
import { fullCompat } from "@/lib/compat";
import {
  personalDay,
  personalMonth,
  PERSONAL_DAY_TEXT,
  currentHourTiming,
  todayBestDirection,
  DAY_COLORS,
  todayKeyPerson,
  DAY_CAUTIONS,
  DAY_FOODS,
  todayShadowBlessing,
} from "@/lib/today";
import {
  HERO_SYNTHESIS,
  PERSONALITY_CORE,
  CAREER_DEEP,
  RELATIONSHIP_SPOUSE,
  RELATIONSHIP_CHILD,
  FAMILY_CARE,
  WEALTH_CORE,
  HEALTH_CORE,
  LIFE_ARC,
  FENGSHUI_HOME,
  SPIRITUAL_THEME,
  FINAL_MESSAGE,
  type SynthesisCard,
} from "@/lib/synthesis";

// ==========================================================================
// データ計算
// ==========================================================================

type TodayResults = {
  daily: ReturnType<typeof getDailyFortune>;
  tarot: DrawnCard[];
  iching: {
    yaos: Yao[];
    hex: ReturnType<typeof hexagramFromYaos>;
    changed: ReturnType<typeof changedHexagram>;
    lines: ReturnType<typeof changingLineMeanings>;
  };
};

function todayCompute(zodiacKey: string): TodayResults {
  const yaos = castHexagram();
  return {
    daily: getDailyFortune(zodiacKey, new Date()),
    tarot: drawCards(3),
    iching: {
      yaos,
      hex: hexagramFromYaos(yaos),
      changed: changedHexagram(yaos),
      lines: changingLineMeanings(yaos),
    },
  };
}

function basisData() {
  const d = new Date(OWNER.birth);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const sun = getSunSign(m, day);
  const fp = fourPillarsFromGanzhi(
    OWNER.natal.fourPillars.year,
    OWNER.natal.fourPillars.month,
    OWNER.natal.fourPillars.day,
    OWNER.natal.fourPillars.hour
  );
  const fpExtras = calcShichuExtras(fp);
  const kakusu = calcKakusu([...OWNER.nameSeiKakusu], [...OWNER.nameMeiKakusu]);
  const bc = birthCards(OWNER.birth);
  const numero = {
    life: lifePathNumber(OWNER.birth),
    birthday: birthdayNumber(OWNER.birth),
    expression: expressionNumber(OWNER.nameRoman),
    soul: soulNumber(OWNER.nameRoman),
    persona: personalityNumber(OWNER.nameRoman),
    personal: personalYear(OWNER.birth, new Date().getFullYear()),
  };
  const ratings = dirRatings(OWNER.natal.fengshui.kua);
  const annual = annualDirection(new Date().getFullYear());
  const spouseCompat = fullCompat(
    sun,
    OWNER.natal.kyusei.honmei as StarNumber,
    OWNER.family.spouse.sunSign,
    OWNER.family.spouse.kyusei as StarNumber
  );
  const childCompat = fullCompat(
    sun,
    OWNER.natal.kyusei.honmei as StarNumber,
    OWNER.family.child.sunSign,
    OWNER.family.child.kyusei as StarNumber
  );
  return { sun, fp, fpExtras, kakusu, bc, numero, ratings, annual, spouseCompat, childCompat };
}

// ==========================================================================
// メインページ
// ==========================================================================

export default function Home() {
  const [tab, setTab] = useState<"today" | "basis">("today");
  const [today, setToday] = useState<TodayResults | null>(null);
  const basis = useMemo(basisData, []);

  useEffect(() => {
    setToday(todayCompute(basis.sun.key));
  }, [basis.sun.key]);

  const now = new Date();
  const todayLabel = `${now.getFullYear()}年 ${now.getMonth() + 1}月 ${now.getDate()}日（${
    ["日", "月", "火", "水", "木", "金", "土"][now.getDay()]
  }）`;
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "夜更かしですね";
    if (h < 11) return "おはようございます";
    if (h < 18) return "こんにちは";
    return "こんばんは";
  }, []);

  if (!today) {
    return <div className="text-sm text-ink-400 py-20 text-center">読み込み中…</div>;
  }

  const pDay = personalDay(OWNER.birth, now.getFullYear(), now.getMonth() + 1, now.getDate());
  const pMonth = personalMonth(OWNER.birth, now.getFullYear(), now.getMonth() + 1);

  return (
    <div>
      {/* ===== Hero ===== */}
      <Hero
        date={todayLabel}
        greeting={greeting}
        zodiacName={basis.sun.name}
        starName={STAR_NAME[OWNER.natal.kyusei.honmei as StarNumber]}
        dayMaster={basis.fp.dayMaster.stem}
        lifePath={basis.numero.life}
        kua={OWNER.natal.fengshui.kua}
      />

      {/* ===== Tab ===== */}
      <nav className="mt-10 flex gap-1 border-b border-ink-200">
        <TabButton active={tab === "today"} onClick={() => setTab("today")} label="今日の占い" sub="Daily Reading" />
        <TabButton active={tab === "basis"} onClick={() => setTab("basis")} label="基礎の占い" sub="Natal & Synthesis" />
      </nav>

      <div className="mt-10">
        {tab === "today" ? (
          <TodayTab
            sun={basis.sun}
            today={today}
            personalDay={pDay}
            personalMonth={pMonth}
            personalYear={basis.numero.personal}
            annual={basis.annual}
            onReshuffle={() => setToday(todayCompute(basis.sun.key))}
          />
        ) : (
          <BasisTab basis={basis} />
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// Hero
// ==========================================================================

function Hero({
  date,
  greeting,
  zodiacName,
  starName,
  dayMaster,
  lifePath,
  kua,
}: {
  date: string;
  greeting: string;
  zodiacName: string;
  starName: string;
  dayMaster: string;
  lifePath: number;
  kua: number;
}) {
  return (
    <section className="rounded-2xl bg-kachi-fade text-sand-50 p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-shu-500/10 blur-3xl" />
      <div className="relative">
        <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold-300 uppercase">
          {date}
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl tracking-wide leading-tight">
          {greeting}、<br className="sm:hidden" />
          {OWNER.displayName}さん。
        </h1>
        <p className="mt-3 text-sand-200 text-sm sm:text-base">
          本日の天と地、あなたの命を読み解きます。
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <BadgeChip label="太陽星座" value={zodiacName} />
          <BadgeChip label="本命星" value={starName} />
          <BadgeChip label="日主" value={dayMaster} />
          <BadgeChip label="ライフパス" value={String(lifePath)} mono />
          <BadgeChip label="本命卦" value={KUA_NAMES[kua]?.name ?? String(kua)} />
        </div>
      </div>
    </section>
  );
}

function BadgeChip({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-gold-500/30 bg-kachi-700/40 backdrop-blur px-3 py-2.5">
      <div className="text-[9px] tracking-[0.3em] uppercase text-gold-300/80">{label}</div>
      <div className={`mt-1 font-display text-base sm:text-lg ${mono ? "tabular-nums" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-5 sm:px-8 py-3 text-left transition-all ${
        active
          ? "border-b-2 border-gold-500 text-ink-900"
          : "border-b-2 border-transparent text-ink-400 hover:text-ink-700"
      }`}
    >
      <div className={`font-display text-lg ${active ? "text-ink-900" : ""}`}>{label}</div>
      <div className="text-[10px] tracking-[0.3em] uppercase mt-0.5">{sub}</div>
    </button>
  );
}

// ==========================================================================
// 今日の占いタブ
// ==========================================================================

function TodayTab({
  sun,
  today,
  personalDay: pDay,
  personalMonth: pMonth,
  personalYear,
  annual,
  onReshuffle,
}: {
  sun: Zodiac;
  today: TodayResults;
  personalDay: number;
  personalMonth: number;
  personalYear: number;
  annual: ReturnType<typeof annualDirection>;
  onReshuffle: () => void;
}) {
  const lucky = LUCKY[sun.key];
  const py = PERSONAL_YEAR_TEXT[personalYear];
  const pdText = PERSONAL_DAY_TEXT[pDay];
  const dayColor = DAY_COLORS[pDay];
  const direction = todayBestDirection(pDay);
  const keyPerson = todayKeyPerson(pDay);
  const cautions = DAY_CAUTIONS[pDay];
  const food = DAY_FOODS[pDay];
  const sb = todayShadowBlessing(pDay);
  const timing = currentHourTiming();

  return (
    <div className="space-y-12">
      {/* ━━ 1. パーソナルデイ（最重要） ━━ */}
      <NumberedSection num="壱" label="Today's Energy" title="今日のエネルギー" >
        <div className="rounded-2xl bg-gold-fade border-2 border-gold-400 p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="font-display text-7xl sm:text-8xl text-gold-700 tabular-nums leading-none">
              {pDay}
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
                Personal Day Number
              </div>
              <div className="font-display text-2xl mt-1 text-ink-900">
                パーソナルデイ {pDay}
              </div>
              <div className="text-xs text-ink-600 mt-1">
                個人月 {pMonth} / 個人年 {personalYear}
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm sm:text-base text-ink-800 leading-loose">
            {pdText.energy}
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ListBox title="今日やるべき" items={pdText.do} variant="positive" />
            <ListBox title="今日避けるべき" items={pdText.avoid} variant="negative" />
          </div>
          <div className="mt-6 rounded-lg bg-ink-900 text-sand-50 p-4 text-center">
            <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
              Today's Mantra
            </div>
            <div className="font-display text-xl mt-2 italic">「{pdText.mantra}」</div>
          </div>
        </div>
      </NumberedSection>

      {/* ━━ 2. 影と祝福 ━━ */}
      <NumberedSection num="弐" label="Shadow & Blessing" title="今日の影と祝福">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article className="rounded-xl border-l-4 border-shu-500 bg-shu-50 p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-shu-700 mb-2">
              Shadow ／ 影
            </div>
            <p className="text-sm leading-relaxed text-ink-800">{sb.shadow}</p>
          </article>
          <article className="rounded-xl border-l-4 border-gold-500 bg-gold-50 p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">
              Blessing ／ 祝福
            </div>
            <p className="text-sm leading-relaxed text-ink-800">{sb.blessing}</p>
          </article>
        </div>
      </NumberedSection>

      {/* ━━ 3. 本日の運勢スコア ━━ */}
      <NumberedSection num="参" label="Daily Fortune Score" title="本日の運勢スコア">
        <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ScoreBig label="総合" value={today.daily.overall} />
            <ScoreBig label="恋愛" value={today.daily.love} />
            <ScoreBig label="仕事" value={today.daily.work} />
            <ScoreBig label="金運" value={today.daily.money} />
          </div>
          <div className="mt-6 border-t border-ink-100 pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400 mb-2">
              Today's Message
            </div>
            <p className="font-display text-lg sm:text-xl text-ink-900 leading-relaxed">
              {today.daily.message}
            </p>
          </div>
        </div>
      </NumberedSection>

      {/* ━━ 4. ラッキー要素 ━━ */}
      <NumberedSection num="肆" label="Today's Lucky" title="今日のラッキー">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article className="rounded-xl border border-ink-200 p-6 bg-white">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">Color</div>
            <div className="flex items-center gap-4 mt-3">
              <div
                className="w-16 h-16 rounded-full border-2 border-ink-200 shrink-0"
                style={{ backgroundColor: dayColor.hex }}
              />
              <div>
                <div className="font-display text-2xl">{dayColor.color}</div>
                <p className="text-xs text-ink-500 mt-1">{dayColor.reason}</p>
              </div>
            </div>
          </article>
          <article className="rounded-xl border border-ink-200 p-6 bg-white">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">Number</div>
            <div className="font-display text-5xl tabular-nums mt-2 text-ink-900">{lucky.number}</div>
            <div className="text-xs text-ink-500 mt-2">{sun.name}の守護数</div>
          </article>
          <article className="rounded-xl border border-ink-200 p-6 bg-white">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">Item</div>
            <div className="font-display text-xl mt-2">{lucky.item}</div>
          </article>
          <article className="rounded-xl border border-ink-200 p-6 bg-white">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">Food</div>
            <p className="text-sm mt-2 leading-relaxed">{food}</p>
          </article>
        </div>
      </NumberedSection>

      {/* ━━ 5. 今日の方位 ━━ */}
      <NumberedSection num="伍" label="Today's Direction" title="今日の吉方位">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DirCard label="最良方位" value={direction.primary} variant="best" desc="重要事項・新規挑戦・大事な打合せはこの方角で" />
          <DirCard label="次善方位" value={direction.secondary} variant="good" desc="日常の用事・買い物・軽い外出向き" />
          <DirCard label="注意方位" value={direction.caution} variant="warn" desc="この方角への大きな移動は控えめに" />
        </div>
      </NumberedSection>

      {/* ━━ 6. 時間帯運 ━━ */}
      <NumberedSection num="陸" label="Hourly Timing" title="今この時刻のエネルギー">
        <div className="rounded-xl border border-ink-200 bg-sand-50 p-6">
          <div className="flex items-baseline gap-4">
            <div className="font-display text-4xl text-kachi-800">{timing.range}時</div>
            <div className="text-sm text-ink-600">
              <span className="font-display text-xl text-gold-700">{timing.branch}</span>の刻
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">エネルギー</div>
            <p className="text-sm mt-1 text-ink-800">{timing.energy}</p>
          </div>
          <div className="mt-3 border-t border-ink-200 pt-3">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">推奨される活動</div>
            <p className="text-sm mt-1 text-ink-800">{timing.recommend}</p>
          </div>
        </div>
      </NumberedSection>

      {/* ━━ 7. キーパーソン ━━ */}
      <NumberedSection num="漆" label="Key Person" title="今日のキーパーソン">
        <article className="rounded-xl bg-paper border border-ink-200 p-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
            今日大切にすべき関係
          </div>
          <div className="font-display text-2xl mt-2 text-ink-900">{keyPerson.who}</div>
          <p className="mt-3 text-sm text-ink-700 leading-relaxed">{keyPerson.why}</p>
        </article>
      </NumberedSection>

      {/* ━━ 8. 注意事項 ━━ */}
      <NumberedSection num="捌" label="Caution" title="今日特に気をつけること">
        <div className="rounded-xl border-l-4 border-shu-400 bg-white p-6">
          <ul className="space-y-2">
            {cautions.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-800">
                <span className="text-shu-500 font-bold">⚠</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </NumberedSection>

      {/* ━━ 9. 流年方位 ━━ */}
      <NumberedSection num="玖" label="Annual Direction" title={`${annual.year}年の年運（${annual.starName}）`}>
        <div className="rounded-xl border border-ink-200 bg-white p-6 space-y-3 text-sm">
          <DangerLine label="歳破方位" value={annual.saiha} desc="引っ越し・大事業・転職を避けるべき方位" />
          <DangerLine label="五黄殺" value={annual.gokou} desc="自滅の方位、重要事項を持ち込まない" />
          <DangerLine label="暗剣殺" value={annual.anken} desc="他者からの災いを呼ぶ方位、慎重に" />
        </div>
      </NumberedSection>

      {/* ━━ 10. 今月のテーマ ━━ */}
      <NumberedSection num="拾" label="This Month" title="今月のテーマ">
        <div className="rounded-xl bg-white border border-ink-200 p-6">
          <p className="font-display text-lg leading-relaxed text-ink-800">
            {lucky.monthlyTheme}
          </p>
        </div>
      </NumberedSection>

      {/* ━━ 11. 今年のパーソナルイヤー ━━ */}
      {py && (
        <NumberedSection num="拾壱" label="This Year" title={`${new Date().getFullYear()}年のテーマ`}>
          <article className="rounded-2xl border-2 border-gold-400 bg-gold-fade p-6 sm:p-8">
            <div className="flex gap-6 items-center">
              <div className="font-display text-6xl tabular-nums text-gold-700">{personalYear}</div>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
                  Personal Year
                </div>
                <div className="font-display text-2xl mt-1">{py.title}</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-ink-800 leading-loose">{py.text}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ListBox title="今年やるべき" items={py.doList} variant="positive" />
              <ListBox title="今年避けるべき" items={py.avoidList} variant="negative" />
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DimensionText title="恋愛・家庭" text={py.loveAdvice} />
              <DimensionText title="仕事・キャリア" text={py.workAdvice} highlight />
            </div>
          </article>
        </NumberedSection>
      )}

      {/* ━━ 12. タロット ━━ */}
      <NumberedSection num="拾弐" label="Tarot" title="今日のタロット（過去・現在・未来）" action={
        <button
          onClick={onReshuffle}
          className="text-xs px-4 py-2 rounded-md border border-ink-300 hover:border-ink-900"
        >
          再シャッフル
        </button>
      }>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {today.tarot.map((c, i) => (
            <TarotCard key={i} card={c} position={SPREAD_LABELS.three[i]} />
          ))}
        </div>
      </NumberedSection>

      {/* ━━ 13. 易経 ━━ */}
      <NumberedSection num="拾参" label="I Ching" title="今日の易経">
        <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HexBlock
              label="本卦"
              hex={today.iching.hex}
              yaos={today.iching.yaos}
              upper={trigramName(today.iching.yaos, "upper")}
              lower={trigramName(today.iching.yaos, "lower")}
            />
            {today.iching.changed && (
              <HexBlock
                label="之卦（変化後）"
                hex={today.iching.changed.hex}
                yaos={today.iching.changed.yaos}
                upper={trigramName(today.iching.changed.yaos, "upper")}
                lower={trigramName(today.iching.changed.yaos, "lower")}
                isChanged
              />
            )}
          </div>
          {today.iching.lines.length > 0 && (
            <div className="mt-6 border-t-2 border-gold-300 pt-5">
              <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
                変爻のメッセージ
              </div>
              <ul className="space-y-2 text-sm">
                {today.iching.lines.map((l, i) => (
                  <li key={i} className="flex gap-3 bg-sand-50 rounded-md p-3">
                    <span className="font-display text-base text-gold-700 w-14 shrink-0">
                      第{l.pos}爻
                    </span>
                    <span className="text-ink-800">{l.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </NumberedSection>
    </div>
  );
}

// ==========================================================================
// 基礎の占いタブ
// ==========================================================================

function BasisTab({ basis }: { basis: ReturnType<typeof basisData> }) {
  return (
    <div className="space-y-12">
      {/* ━━ 統合占断 ヒーロー ━━ */}
      <SynthesisHero />

      {/* ━━ 統合: 性格の核 ━━ */}
      <SynthesisBlock num="壱" card={PERSONALITY_CORE} />

      {/* ━━ ネイタル + 太陽星座詳細 ━━ */}
      <NumberedSection num="弐" label="Astrology" title="ネイタルチャート（西洋占星術）">
        <NatalChartSection sun={basis.sun} />
      </NumberedSection>

      {/* ━━ 四柱推命 ━━ */}
      <NumberedSection num="参" label="Shichu Suimei" title="四柱推命（命式）">
        <ShichuFullSection fp={basis.fp} fpExtras={basis.fpExtras} />
      </NumberedSection>

      {/* ━━ 九星気学 ━━ */}
      <NumberedSection num="肆" label="Nine Star Ki" title="九星気学">
        <KyuseiSection />
      </NumberedSection>

      {/* ━━ 数秘術 ━━ */}
      <NumberedSection num="伍" label="Numerology" title="数秘術（フル）">
        <NumerologyFullSection numero={basis.numero} />
      </NumberedSection>

      {/* ━━ 姓名判断 ━━ */}
      <NumberedSection num="陸" label="Seimei Handan" title="姓名判断（五格）">
        <SeimeiSection kakusu={basis.kakusu} />
      </NumberedSection>

      {/* ━━ バースカード ━━ */}
      <NumberedSection num="漆" label="Birth Card" title="タロット バースカード">
        <BirthCardSection bc={basis.bc} />
      </NumberedSection>

      {/* ━━ 風水 ━━ */}
      <NumberedSection num="捌" label="Feng Shui" title="風水（本命卦）">
        <FengShuiFullSection ratings={basis.ratings} />
      </NumberedSection>

      {/* ━━ 統合占断シリーズ ━━ */}
      <SectionDivider title="統合占断" />

      <SynthesisBlock num="玖" card={CAREER_DEEP} />
      <SynthesisBlock num="拾" card={RELATIONSHIP_SPOUSE} />
      <SynthesisBlock num="拾壱" card={RELATIONSHIP_CHILD} />
      <SynthesisBlock num="拾弐" card={FAMILY_CARE} />
      <SynthesisBlock num="拾参" card={WEALTH_CORE} />
      <SynthesisBlock num="拾肆" card={HEALTH_CORE} />
      <SynthesisBlock num="拾伍" card={LIFE_ARC} />
      <SynthesisBlock num="拾陸" card={FENGSHUI_HOME} />
      <SynthesisBlock num="拾漆" card={SPIRITUAL_THEME} />

      {/* ━━ 家族との相性（既存） ━━ */}
      <NumberedSection num="拾捌" label="Family Compatibility" title="家族との相性スコア">
        <CompatSection
          spouseCompat={basis.spouseCompat}
          childCompat={basis.childCompat}
        />
      </NumberedSection>

      {/* ━━ 最終メッセージ ━━ */}
      <FinalMessage />
    </div>
  );
}

// ==========================================================================
// Hero & Synthesis Components
// ==========================================================================

function SynthesisHero() {
  return (
    <section className="relative">
      <div className="rounded-2xl bg-kachi-fade text-sand-50 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
            Synthesis ／ 統合占断
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-4xl leading-tight tracking-wide">
            {HERO_SYNTHESIS.headline}
          </h2>
          <p className="mt-3 text-gold-200 text-sm sm:text-base">
            {HERO_SYNTHESIS.subline}
          </p>
          <div className="mt-8 space-y-4">
            {HERO_SYNTHESIS.paragraphs.map((p, i) => (
              <p key={i} className="text-sm sm:text-[15px] leading-loose text-sand-100">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SynthesisBlock({ num, card }: { num: string; card: SynthesisCard }) {
  return (
    <NumberedSection num={num} label="Synthesis" title={card.title}>
      <article className="rounded-2xl bg-paper border border-gold-300 p-6 sm:p-8">
        <p className="text-sm sm:text-[15px] leading-loose text-ink-800">{card.body}</p>
        {card.insights && card.insights.length > 0 && (
          <div className="mt-6 border-t border-gold-300 pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
              Key Insights
            </div>
            <ul className="space-y-2">
              {card.insights.map((it, i) => (
                <li
                  key={i}
                  className="text-sm text-ink-700 leading-relaxed pl-4 border-l-2 border-gold-400"
                >
                  {it}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </NumberedSection>
  );
}

function FinalMessage() {
  return (
    <section className="rounded-2xl bg-kachi-fade text-sand-50 p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
          Final Message
        </div>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl leading-tight tracking-wide">
          {FINAL_MESSAGE.title}
        </h2>
        <p className="mt-6 text-sm sm:text-[15px] leading-loose text-sand-100">
          {FINAL_MESSAGE.body}
        </p>
      </div>
    </section>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="divider-decorative my-8">
      <span>{title}</span>
    </div>
  );
}

// ==========================================================================
// Section / Layout primitives
// ==========================================================================

function NumberedSection({
  num,
  label,
  title,
  children,
  action,
}: {
  num: string;
  label: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section>
      <header className="flex items-end justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="font-display text-2xl text-gold-700 w-10 text-center">
            {num}
          </div>
          <div className="border-l-2 border-ink-900 pl-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">
              {label}
            </div>
            <h2 className="font-display text-xl sm:text-2xl mt-0.5 leading-tight">
              {title}
            </h2>
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

// ==========================================================================
// 各セクション本体
// ==========================================================================

function NatalChartSection({ sun }: { sun: Zodiac }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-5">
        <div className="text-6xl">{sun.symbol}</div>
        <div className="flex-1">
          <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">{sun.en}</div>
          <div className="font-display text-3xl mt-1">{sun.name}</div>
          <div className="text-xs text-ink-500 mt-1">
            {sun.element}・{sun.quality}宮 / 守護星: {sun.ruler}
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm sm:text-[15px] leading-loose text-ink-800">
        {sun.description}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        <DimensionBox title="強み・才能" items={sun.strengths} />
        <DimensionBox title="影・弱点" items={sun.weaknesses} variant="warn" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <DimensionText title="恋愛・パートナー" text={sun.love} />
        <DimensionText title="仕事・天職" text={sun.career} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <DimensionText title="人生の課題" text={sun.challenge} />
        <DimensionText title="助言" text={sun.advice} highlight />
      </div>
      <div className="mt-6 pt-5 border-t border-ink-200">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400 mb-3">
          ネイタル要素
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Kv k="月星座" v={OWNER.natal.moonApprox} />
          <Kv k="アセンダント" v={OWNER.natal.ascApprox} />
          <Kv k="MC" v={OWNER.natal.mcApprox} />
          <Kv k="出生地" v={OWNER.birthplace.city} />
        </div>
      </div>
    </div>
  );
}

function ShichuFullSection({
  fp,
  fpExtras,
}: {
  fp: ReturnType<typeof fourPillarsFromGanzhi>;
  fpExtras: ReturnType<typeof calcShichuExtras>;
}) {
  const total = Object.values(fpExtras.five).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <PillarCell label="時柱" pillar={fp.hour} tongbian={fpExtras.tongbian.hour} twelve={fpExtras.twelve.hour} />
        <PillarCell label="日柱" pillar={fp.day} twelve={fpExtras.twelve.day} highlight />
        <PillarCell label="月柱" pillar={fp.month} tongbian={fpExtras.tongbian.month} twelve={fpExtras.twelve.month} />
        <PillarCell label="年柱" pillar={fp.year} tongbian={fpExtras.tongbian.year} twelve={fpExtras.twelve.year} />
      </div>

      <div className="mt-6 pt-5 border-t-2 border-gold-300">
        <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">日主</div>
        <div className="font-display text-3xl mt-1">{fp.dayMaster.stem} ・ {fp.dayMaster.element}</div>
        <p className="text-sm text-ink-800 mt-3 leading-relaxed">{DAY_MASTER_TEXT[fp.dayMaster.element]}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-ink-200">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400 mb-3">通変星</div>
        <ul className="space-y-2 text-sm">
          <TbLine label="年柱" star={fpExtras.tongbian.year} />
          <TbLine label="月柱" star={fpExtras.tongbian.month} />
          {fpExtras.tongbian.hour && <TbLine label="時柱" star={fpExtras.tongbian.hour} />}
        </ul>
      </div>

      <div className="mt-6 pt-5 border-t border-ink-200">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400 mb-3">十二運</div>
        <ul className="space-y-2 text-sm">
          <TwLine label="日柱" stage={fpExtras.twelve.day} />
          <TwLine label="月柱" stage={fpExtras.twelve.month} />
          <TwLine label="年柱" stage={fpExtras.twelve.year} />
          {fpExtras.twelve.hour && <TwLine label="時柱" stage={fpExtras.twelve.hour} />}
        </ul>
      </div>

      <div className="mt-6 pt-5 border-t border-ink-200">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400 mb-3">五行バランス</div>
        <div className="space-y-2">
          {(["木", "火", "土", "金", "水"] as const).map((e) => {
            const v = fpExtras.five[e];
            const pct = total ? (v / total) * 100 : 0;
            const isHigh = v >= 3;
            return (
              <div key={e} className="flex items-center gap-3 text-sm">
                <div className="w-8 font-display text-lg text-ink-700">{e}</div>
                <div className="flex-1 h-3 bg-ink-100 rounded">
                  <div
                    className={`h-3 rounded ${isHigh ? "bg-gold-500" : "bg-ink-700"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 tabular-nums text-right font-display text-lg">{v}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ink-500 mt-3">※ 金色のバーは命式に多く含まれる主要五行</p>
      </div>
    </div>
  );
}

function TbLine({ label, star }: { label: string; star: keyof typeof TONGBIAN_TEXT }) {
  return (
    <li className="flex flex-col sm:flex-row sm:gap-3 border-l-2 border-gold-300 pl-3">
      <div className="flex items-center gap-2">
        <span className="text-ink-500 text-xs">{label}</span>
        <span className="font-display text-base text-kachi-800">{star}</span>
      </div>
      <span className="text-ink-700 text-xs sm:text-sm leading-relaxed">{TONGBIAN_TEXT[star]}</span>
    </li>
  );
}

function TwLine({ label, stage }: { label: string; stage: keyof typeof TWELVE_TEXT }) {
  return (
    <li className="flex flex-col sm:flex-row sm:gap-3 border-l-2 border-kachi-400 pl-3">
      <div className="flex items-center gap-2">
        <span className="text-ink-500 text-xs">{label}</span>
        <span className="font-display text-base text-kachi-800">{stage}</span>
      </div>
      <span className="text-ink-700 text-xs sm:text-sm leading-relaxed">{TWELVE_TEXT[stage]}</span>
    </li>
  );
}

function KyuseiSection() {
  const honmei = OWNER.natal.kyusei.honmei as StarNumber;
  const getsumei = OWNER.natal.kyusei.getsumei as StarNumber;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <StarCard role="本命星（生涯の核）" star={honmei} />
      <StarCard role="月命星（性格・対人傾向）" star={getsumei} />
    </div>
  );
}

function StarCard({ role, star }: { role: string; star: StarNumber }) {
  const deep = STAR_DEEP[star];
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">{role}</div>
      <div className="font-display text-3xl mt-1">{STAR_NAME[star]}</div>
      <div className="text-xs text-ink-500 mt-1">
        五行: {STAR_ELEMENT[star]} / 定位方位: {STAR_DIRECTION[star]}
      </div>
      <p className="text-sm text-ink-800 mt-4 leading-relaxed">{deep.trait}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <DimensionBox title="強み" items={deep.strengths} />
        <DimensionBox title="弱点" items={deep.weaknesses} variant="warn" />
      </div>
      <div className="mt-3 space-y-2">
        <DimensionText title="恋愛" text={deep.love} />
        <DimensionText title="仕事" text={deep.career} />
        <DimensionText title="金運・健康" text={deep.fortune} />
        <DimensionText title="助言" text={deep.advice} highlight />
      </div>
    </article>
  );
}

function NumerologyFullSection({
  numero,
}: {
  numero: ReturnType<typeof basisData>["numero"];
}) {
  const lifeMeaning = LIFE_PATH_MEANINGS[String(numero.life)];
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border-2 border-gold-400 bg-gold-fade p-6 sm:p-8">
        <div className="flex gap-6 items-center">
          <div className="font-display text-7xl tabular-nums text-gold-700">{numero.life}</div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
              ライフパスナンバー
            </div>
            <div className="text-sm text-ink-600">人生全体の傾向（マスターナンバー）</div>
            {lifeMeaning && (
              <>
                <div className="font-display text-2xl mt-2">{lifeMeaning.title}</div>
                <p className="text-sm text-ink-800 mt-1 leading-relaxed">{lifeMeaning.text}</p>
              </>
            )}
          </div>
        </div>
        {lifeMeaning && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DimensionBox title="強み・才能" items={lifeMeaning.strengths} />
            <DimensionBox title="影・弱点" items={lifeMeaning.weaknesses} variant="warn" />
            <DimensionText title="恋愛" text={lifeMeaning.love} />
            <DimensionText title="仕事" text={lifeMeaning.career} />
            <DimensionText title="課題" text={lifeMeaning.challenge} />
            <DimensionText title="助言" text={lifeMeaning.advice} highlight />
          </div>
        )}
      </article>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SmallNum label="誕生日数" value={numero.birthday} />
        <SmallNum label="表現数" value={numero.expression} />
        <SmallNum label="ソウル数" value={numero.soul} />
        <SmallNum label="人格数" value={numero.persona} />
      </div>
    </div>
  );
}

function SmallNum({ label, value }: { label: string; value: number }) {
  const meaning = LIFE_PATH_MEANINGS[String(value)];
  return (
    <article className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">{label}</div>
      <div className="font-display text-3xl tabular-nums mt-1">{value}</div>
      {meaning && <div className="text-xs text-ink-500 mt-1">{meaning.title}</div>}
    </article>
  );
}

function SeimeiSection({ kakusu }: { kakusu: ReturnType<typeof calcKakusu> }) {
  const items: { key: keyof typeof KAKUSU_LABEL; n: number }[] = [
    { key: "ten", n: kakusu.ten },
    { key: "jin", n: kakusu.jin },
    { key: "chi", n: kakusu.chi },
    { key: "gai", n: kakusu.gai },
    { key: "so", n: kakusu.so },
  ];
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
      <div className="text-sm text-ink-600 mb-5 font-display">
        {OWNER.nameSei}（{OWNER.nameSeiKakusu.join("+")}）/ {OWNER.nameMei}（
        {OWNER.nameMeiKakusu.join("+")}）
      </div>
      <div className="space-y-5">
        {items.map(({ key, n }) => {
          const lab = KAKUSU_LABEL[key];
          const k = kichikyo(n);
          const deep = NUMBER_DEEP[n];
          return (
            <div key={key} className="border-b border-ink-100 pb-5 last:border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="font-display text-lg w-12">{lab.label}</div>
                <div className="font-display text-3xl tabular-nums w-14 text-gold-700">{n}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  k === "大吉" ? "bg-gold-500 text-white" :
                  k === "吉" ? "bg-gold-100 text-gold-800 border border-gold-400" :
                  k === "半吉" ? "border border-ink-300 text-ink-500" :
                  k === "凶" ? "bg-shu-100 text-shu-700" :
                  "bg-shu-500 text-white"
                }`}>{k}</span>
                <div className="text-ink-500 text-xs">{lab.sub}</div>
              </div>
              {deep && (
                <div className="ml-3">
                  <p className="text-sm text-ink-800 leading-relaxed">{deep.meaning}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    <DimensionText title="仕事面" text={deep.career} />
                    <DimensionText title="家庭・恋愛面" text={deep.love} />
                    <DimensionText title="注意点" text={deep.caution} variant="warn" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BirthCardSection({ bc }: { bc: ReturnType<typeof birthCards> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BCard role="パーソナリティカード（社会的な役割）" card={bc.personality} />
      <BCard role="ソウルカード（魂の本質）" card={bc.soul} />
    </div>
  );
}

function BCard({ role, card }: { role: string; card: { num: number; name: string; en: string } }) {
  const deep = BIRTH_CARD_DEEP[card.num];
  return (
    <article className="rounded-2xl border-2 border-gold-300 bg-paper p-6">
      <div className="flex gap-5 items-start">
        <div className="aspect-[2/3] w-20 rounded-lg bg-kachi-fade text-gold-300 flex items-center justify-center text-3xl font-display shrink-0 shadow-md">
          {romanize(card.num)}
        </div>
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">{role}</div>
          <div className="font-display text-2xl mt-1">
            {card.name}
          </div>
          <div className="text-[10px] tracking-widest text-ink-400 mt-0.5">{card.en}</div>
          <p className="text-sm text-ink-800 mt-3 leading-relaxed">{deep.theme}</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <DimensionText title="ギフト（与えられた才能）" text={deep.gift} />
        <DimensionText title="レッスン（学ぶ課題）" text={deep.lesson} highlight />
        <DimensionText title="影の側面" text={deep.shadow} variant="warn" />
      </div>
    </article>
  );
}

function FengShuiFullSection({
  ratings,
}: {
  ratings: ReturnType<typeof dirRatings>;
}) {
  const kua = OWNER.natal.fengshui.kua;
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-5">
        <div className="font-display text-6xl tabular-nums text-gold-700">{kua}</div>
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">本命卦</div>
          <div className="font-display text-2xl">
            {KUA_NAMES[kua].name}（{KUA_NAMES[kua].group}）
          </div>
          <div className="text-xs text-ink-500 mt-1 leading-relaxed">
            現住所: {OWNER.residence.city} / {OWNER.residence.floor}階（高層階・陽）
            <br />
            出生地から見た方位: {OWNER.residence.fromBirthplaceDirection}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-6 max-w-sm mx-auto">
        <DirCell rating={find(ratings, "西北")} dir="西北" />
        <DirCell rating={find(ratings, "北")} dir="北" />
        <DirCell rating={find(ratings, "東北")} dir="東北" />
        <DirCell rating={find(ratings, "西")} dir="西" />
        <div className="aspect-square rounded-lg bg-kachi-fade text-gold-300 flex items-center justify-center text-xs font-display">中央</div>
        <DirCell rating={find(ratings, "東")} dir="東" />
        <DirCell rating={find(ratings, "西南")} dir="西南" />
        <DirCell rating={find(ratings, "南")} dir="南" />
        <DirCell rating={find(ratings, "東南")} dir="東南" />
      </div>
      <div className="mt-8 space-y-2">
        {ratings.map((r) => (
          <div key={r.dir} className="flex items-start gap-3 text-sm border-b border-ink-100 pb-3 last:border-0">
            <div className="w-12 text-ink-500 font-display">{r.dir}</div>
            <div className={`w-14 font-medium text-xs px-2 py-0.5 rounded-full text-center ${
              r.kind === "吉" ? "bg-gold-100 text-gold-800" : "bg-shu-100 text-shu-700"
            }`}>
              {r.rating}
            </div>
            <div className="flex-1 text-ink-700">{RATING_TEXT[r.rating]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompatSection({
  spouseCompat,
  childCompat,
}: {
  spouseCompat: ReturnType<typeof fullCompat>;
  childCompat: ReturnType<typeof fullCompat>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CompatCard title={`妻（${OWNER.family.spouse.birth}生）`} c={spouseCompat} />
      <CompatCard title={`${OWNER.family.child.relation}（${OWNER.family.child.birth}生）`} c={childCompat} />
    </div>
  );
}

function CompatCard({ title, c }: { title: string; c: ReturnType<typeof fullCompat> }) {
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">{title}</div>
      <div className="flex items-baseline gap-3 mt-1">
        <div className="font-display text-2xl">{c.zodiac.partner.name}</div>
        <div className="text-sm text-ink-500">/ {c.star.name}</div>
      </div>
      <div className="mt-3">
        <Stars value={c.overallScore} large />
        <span className="text-xs text-ink-500 ml-2">総合 {c.overallScore}/5</span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="border-l-2 border-gold-400 pl-3">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">星座 ({c.zodiac.compat.score}/5)</div>
          <p className="text-sm text-ink-700 mt-1">{c.zodiac.compat.text}</p>
        </div>
        <div className="border-l-2 border-kachi-500 pl-3">
          <div className="text-[10px] tracking-[0.3em] uppercase text-kachi-700">九星・五行 ({c.star.relation.score}/5)</div>
          <p className="text-sm text-ink-700 mt-1">
            {c.star.relation.relation} — {c.star.relation.text}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm font-display text-ink-900 border-t border-ink-100 pt-4 italic">
        {c.summary}
      </p>
    </article>
  );
}

// ==========================================================================
// 共通 UI atoms
// ==========================================================================

function Stars({ value, large }: { value: number; large?: boolean }) {
  return (
    <span className={`tracking-widest ${large ? "text-lg" : ""}`}>
      <span className="text-gold-500">{"★".repeat(value)}</span>
      <span className="text-ink-200">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function ScoreBig({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center bg-sand-50 rounded-lg border border-ink-200 p-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500">{label}</div>
      <div className="mt-2"><Stars value={value} large /></div>
      <div className="text-xs text-ink-400 mt-1">{value}/5</div>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-400">{k}</div>
      <div className="text-sm mt-1 font-display">{v}</div>
    </div>
  );
}

function DimensionBox({
  title,
  items,
  variant,
}: {
  title: string;
  items: readonly string[];
  variant?: "warn";
}) {
  const isWarn = variant === "warn";
  return (
    <div className={`rounded-lg border p-4 ${isWarn ? "border-shu-200 bg-shu-50/40" : "border-gold-200 bg-gold-50/40"}`}>
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-2 ${isWarn ? "text-shu-700" : "text-gold-700"}`}>
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className={`text-xs px-2.5 py-1 rounded-full ${
              isWarn
                ? "border border-shu-300 text-shu-700 bg-white"
                : "border border-gold-300 text-gold-800 bg-white"
            }`}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function DimensionText({
  title,
  text,
  highlight,
  variant,
}: {
  title: string;
  text: string;
  highlight?: boolean;
  variant?: "warn";
}) {
  const cls = highlight
    ? "border-2 border-gold-400 bg-gold-50"
    : variant === "warn"
    ? "border border-shu-200 bg-shu-50/40"
    : "border border-ink-200 bg-white";
  const titleCls = highlight ? "text-gold-700" : variant === "warn" ? "text-shu-700" : "text-ink-400";
  return (
    <div className={`rounded-lg p-4 ${cls}`}>
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-1 ${titleCls}`}>
        {title}
      </div>
      <p className="text-sm text-ink-800 leading-relaxed">{text}</p>
    </div>
  );
}

function ListBox({
  title,
  items,
  variant,
}: {
  title: string;
  items: readonly string[];
  variant: "positive" | "negative";
}) {
  const isPositive = variant === "positive";
  return (
    <div className={`rounded-lg p-4 ${isPositive ? "bg-gold-50 border border-gold-300" : "bg-shu-50 border border-shu-200"}`}>
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-2 ${isPositive ? "text-gold-700" : "text-shu-700"}`}>
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="text-sm text-ink-800 flex gap-2">
            <span className={isPositive ? "text-gold-600" : "text-shu-500"}>
              {isPositive ? "◎" : "✕"}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DirCard({
  label,
  value,
  desc,
  variant,
}: {
  label: string;
  value: string;
  desc: string;
  variant: "best" | "good" | "warn";
}) {
  const cls =
    variant === "best"
      ? "bg-gold-fade border-2 border-gold-500"
      : variant === "good"
      ? "bg-white border border-gold-300"
      : "bg-shu-50 border border-shu-300";
  const valueCls =
    variant === "warn" ? "text-shu-700" : "text-gold-700";
  return (
    <article className={`rounded-xl p-5 ${cls}`}>
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500">{label}</div>
      <div className={`font-display text-4xl mt-2 ${valueCls}`}>{value}</div>
      <p className="text-xs text-ink-700 mt-3 leading-relaxed">{desc}</p>
    </article>
  );
}

function DangerLine({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-ink-100 last:border-0">
      <div className="text-[10px] tracking-[0.3em] uppercase text-shu-700 w-20 shrink-0 pt-1">
        {label}
      </div>
      <div className="font-display text-lg w-16 shrink-0 text-shu-700">{value}</div>
      <div className="text-sm text-ink-700 flex-1">{desc}</div>
    </div>
  );
}

function PillarCell({
  label,
  pillar,
  tongbian,
  twelve,
  highlight,
}: {
  label: string;
  pillar: { stem: string; branch: string; stemElement: string; branchElement: string } | null;
  tongbian?: string | null;
  twelve?: string | null;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? "bg-gold-fade border-2 border-gold-500" : "bg-sand-50 border border-ink-200"}`}>
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500">{label}</div>
      {pillar ? (
        <>
          {tongbian && <div className="text-[10px] text-gold-700 mt-1 font-medium">{tongbian}</div>}
          <div className="font-display text-3xl mt-1">{pillar.stem}</div>
          <div className="text-xs text-ink-500">{pillar.stemElement}</div>
          <div className="font-display text-3xl mt-2">{pillar.branch}</div>
          <div className="text-xs text-ink-500">{pillar.branchElement}</div>
          {twelve && <div className="text-[10px] text-kachi-700 mt-2">{twelve}</div>}
        </>
      ) : (
        <div className="text-sm text-ink-400 mt-3">—</div>
      )}
    </div>
  );
}

function find(ratings: ReturnType<typeof dirRatings>, dir: string) {
  return ratings.find((r) => r.dir === dir)!;
}

function DirCell({ dir, rating }: { dir: string; rating: { rating: DirRating; kind: "吉" | "凶" } }) {
  return (
    <div
      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs p-1 ${
        rating.kind === "吉" ? "bg-gold-50 border-2 border-gold-400" : "bg-shu-50 border border-shu-200"
      }`}
    >
      <div className="text-ink-500 text-[10px]">{dir}</div>
      <div className={`font-medium font-display text-sm mt-1 ${rating.kind === "吉" ? "text-gold-700" : "text-shu-700"}`}>
        {rating.rating}
      </div>
    </div>
  );
}

function TarotCard({ card, position }: { card: DrawnCard; position: string }) {
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 flex flex-col">
      <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">{position}</div>
      <div
        className={`mt-3 aspect-[2/3] rounded-lg bg-kachi-fade text-gold-300 flex items-center justify-center text-5xl font-display shadow-md ${
          card.isReversed ? "rotate-180" : ""
        }`}
      >
        {romanize(card.num)}
      </div>
      <div className="mt-4">
        <div className="font-display text-xl">
          {card.name}
          {card.isReversed && <span className="ml-2 text-xs text-shu-600">逆位置</span>}
        </div>
        <div className="text-[10px] tracking-widest text-ink-400">{card.en}</div>
        <p className="mt-3 text-sm text-ink-800 leading-relaxed">
          {card.isReversed ? card.reversedDetail : card.uprightDetail}
        </p>
        <div className="mt-3 space-y-2">
          <div className="text-xs">
            <span className="text-gold-700 font-medium">恋愛: </span>
            <span className="text-ink-700">
              {card.isReversed ? card.loveReversed : card.loveUpright}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-gold-700 font-medium">仕事: </span>
            <span className="text-ink-700">
              {card.isReversed ? card.workReversed : card.workUpright}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-900 italic border-t-2 border-gold-300 pt-3">
          助言: {card.advice}
        </p>
      </div>
    </article>
  );
}

function HexBlock({
  label,
  hex,
  yaos,
  upper,
  lower,
  isChanged,
}: {
  label: string;
  hex: { num: number; name: string; reading: string; meaning: string; image?: string; judgment?: string; advice?: string };
  yaos: Yao[];
  upper: string;
  lower: string;
  isChanged?: boolean;
}) {
  return (
    <div>
      <div className={`text-[10px] tracking-[0.3em] uppercase ${isChanged ? "text-kachi-700" : "text-gold-700"}`}>
        {label}
      </div>
      <div className="font-display text-3xl mt-1">
        {hex.num}. {hex.name}
      </div>
      <div className="text-xs text-ink-500">{hex.reading}</div>
      <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6 bg-sand-50 rounded-lg p-4">
        {[...yaos].reverse().map((y, i) => (
          <div key={i}>{yaoSymbol(y)}</div>
        ))}
      </div>
      <div className="text-xs text-ink-500 mt-2 text-right pr-6">
        上卦: {upper} / 下卦: {lower}
      </div>
      <p className="mt-4 text-sm text-ink-800 leading-relaxed">{hex.meaning}</p>
      {hex.image && (
        <div className="mt-3 text-xs">
          <span className="text-gold-700 font-medium">象: </span>
          <span className="text-ink-700">{hex.image}</span>
        </div>
      )}
      {hex.judgment && (
        <div className="mt-2 text-xs">
          <span className="text-gold-700 font-medium">卦辞: </span>
          <span className="text-ink-700">{hex.judgment}</span>
        </div>
      )}
      {hex.advice && (
        <div className="mt-3 rounded-lg bg-gold-50 border border-gold-300 p-3 text-sm">
          <span className="text-gold-700 font-medium text-xs">助言: </span>
          <span className="text-ink-800">{hex.advice}</span>
        </div>
      )}
    </div>
  );
}

function romanize(n: number): string {
  if (n === 0) return "0";
  const map: [number, string][] = [
    [20, "XX"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let s = "";
  let v = n;
  for (const [num, sym] of map) {
    while (v >= num) {
      s += sym;
      v -= num;
    }
  }
  return s;
}
