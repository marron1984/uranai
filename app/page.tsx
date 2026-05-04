"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  OWNER,
  ownerAge,
  spouseAge,
  childAge,
  childGradeJP,
  spouseAgeDiff,
  childDisplayName,
} from "@/lib/owner";
import {
  getSunSign,
  getDailyFortune,
  LUCKY,
  ZODIAC,
  type Zodiac,
} from "@/lib/astrology";
import { drawCards, drawCardsSeeded, SPREAD_LABELS, type DrawnCard } from "@/lib/tarot";
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
  castHexagramSeeded,
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
  todayDayPillar,
  todayTongbianForOwner,
  todayHourlyChart,
  todayLuckyHours,
  todayPersonalHexagram,
  todaySynthesis,
  todayFamilyAdvice,
  type HourSlot,
  type TodaySynthesis,
} from "@/lib/today";
import {
  HERO_SYNTHESIS,
  PERSONALITY_CORE,
  CAREER_DEEP,
  FAMILY_CARE,
  WEALTH_CORE,
  HEALTH_CORE,
  lifeArc,
  FENGSHUI_HOME,
  SPIRITUAL_THEME,
  FINAL_MESSAGE,
  COMMUNICATION_STYLE,
  DECISION_STYLE,
  LEADERSHIP_STYLE,
  CONFLICT_PATTERN,
  MONEY_PSYCHOLOGY,
  parentingStyleDeep,
  midlifeTransition,
  BODY_CONSTITUTION,
  MENTAL_PATTERNS,
  SPIRITUAL_PRACTICE,
  PARENT_RELATIONSHIPS,
  legacyQuestion,
  relationshipSpouse,
  relationshipChild,
  type SynthesisCard,
} from "@/lib/synthesis";
import { generateDaiun, type DaiunPeriod } from "@/lib/shichu";
import {
  calcBusinessCompat,
  type BusinessCompatResult,
} from "@/lib/businessCompat";
import { fetchOsakaWeather, type WeatherData } from "@/lib/weather";
import {
  recommendPerfumes,
  classifyWeather,
  getSeason,
  getTimeTag,
  type PerfumeMatch,
} from "@/lib/perfume";
import {
  accurateSunSign,
  accurateMoonSign,
  moonPhase,
  currentSolarTerm,
  sunLongitude,
  moonLongitude,
  SOLAR_TERM_TEXT,
  MOON_PHASE_TEXT,
} from "@/lib/astronomy";
import {
  type JournalEntry,
  type Hit,
  loadAll as loadJournal,
  saveEntry as saveJournalEntry,
  getEntry as getJournalEntry,
  dateKey,
  getRecentEntries,
  aggregateByPersonalDay,
  hitRatesByForecast,
  currentStreak,
  entryCount,
} from "@/lib/journal";
import {
  loadApiKey,
  saveApiKey,
  loadModel,
  saveModel,
  loadThreads,
  saveThreads,
  newThread,
  buildSystemPrompt,
  streamOracle,
  CATEGORY_LABELS,
  MODEL_LABELS,
  type OracleCategory,
  type OracleModel,
  type CompatPerson,
  type ChatThread,
  type ChatMessage,
} from "@/lib/oracle";

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

function todayCompute(
  zodiacKey: string,
  date: Date = new Date(),
  reshuffleSeed: number = 0
): TodayResults {
  const dateSeed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const birthSeed = OWNER.birth
    .replace(/-/g, "")
    .split("")
    .reduce((a, c) => ((a * 31 + c.charCodeAt(0)) >>> 0), 0);
  const fullSeed = (dateSeed ^ birthSeed ^ (reshuffleSeed * 2654435761)) >>> 0;
  const yaos = castHexagramSeeded(fullSeed);
  return {
    daily: getDailyFortune(zodiacKey, date),
    tarot: drawCardsSeeded(3, fullSeed ^ 0xa5a5a5a5),
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
  // 大運（10年周期）— 1984/05/02 = 戊申, 男+陽干甲 → 順行, 立運1歳
  const currentAge = ownerAge();
  const daiun = generateDaiun("戊辰", 1, true, 8, currentAge, "戊");

  return { sun, fp, fpExtras, kakusu, bc, numero, ratings, annual, spouseCompat, childCompat, daiun, currentAge };
}

// ==========================================================================
// メインページ
// ==========================================================================

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayDiff(a: Date, b: Date): number {
  return Math.round(
    (Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
      Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) /
      86400000
  );
}

export default function Home() {
  const [tab, setTab] = useState<"today" | "basis" | "oracle">("today");
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [reshuffleSeed, setReshuffleSeed] = useState(0);
  const [today, setToday] = useState<TodayResults | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherErr, setWeatherErr] = useState(false);
  const basis = useMemo(basisData, []);

  const realToday = useMemo(() => startOfDay(new Date()), []);
  const isToday = useMemo(() => isSameDay(selectedDate, realToday), [selectedDate, realToday]);
  const offsetDays = useMemo(() => dayDiff(selectedDate, realToday), [selectedDate, realToday]);

  useEffect(() => {
    setToday(todayCompute(basis.sun.key, selectedDate, reshuffleSeed));
  }, [basis.sun.key, selectedDate, reshuffleSeed]);

  // 日付変更時、リシャッフルカウンタをリセット
  useEffect(() => {
    setReshuffleSeed(0);
  }, [selectedDate]);

  // 天気は当日のみ取得
  useEffect(() => {
    if (isToday) {
      fetchOsakaWeather()
        .then(setWeather)
        .catch(() => setWeatherErr(true));
    } else {
      setWeather(null);
      setWeatherErr(false);
    }
  }, [isToday]);

  const dateLabel = `${selectedDate.getFullYear()}年 ${selectedDate.getMonth() + 1}月 ${selectedDate.getDate()}日（${
    ["日", "月", "火", "水", "木", "金", "土"][selectedDate.getDay()]
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

  const pDay = personalDay(
    OWNER.birth,
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    selectedDate.getDate()
  );
  const pMonth = personalMonth(
    OWNER.birth,
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1
  );

  const onPrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    if (dayDiff(next, realToday) >= -14) setSelectedDate(next);
  };
  const onNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (dayDiff(next, realToday) <= 14) setSelectedDate(next);
  };
  const onJumpToday = () => setSelectedDate(realToday);
  const onPickDate = (s: string) => {
    if (!s) return;
    const [y, m, d] = s.split("-").map(Number);
    const next = new Date(y, m - 1, d, 12);
    const diff = dayDiff(next, realToday);
    if (diff >= -14 && diff <= 14) setSelectedDate(next);
  };

  return (
    <div>
      {/* ===== Hero ===== */}
      <Hero
        date={dateLabel}
        greeting={greeting}
        zodiacName={basis.sun.name}
        starName={STAR_NAME[OWNER.natal.kyusei.honmei as StarNumber]}
        dayMaster={basis.fp.dayMaster.stem}
        lifePath={basis.numero.life}
        kua={OWNER.natal.fengshui.kua}
      />

      {/* ===== Tab ===== */}
      <nav className="mt-10 flex gap-1 border-b border-ink-200 overflow-x-auto">
        <TabButton active={tab === "today"} onClick={() => setTab("today")} label="今日の占い" sub="Daily Reading" />
        <TabButton active={tab === "basis"} onClick={() => setTab("basis")} label="基礎の占い" sub="Natal & Synthesis" />
        <TabButton active={tab === "oracle"} onClick={() => setTab("oracle")} label="Oracle" sub="AI 個人相談" />
      </nav>

      <div className="mt-10">
        {tab === "today" ? (
          <>
            <DateNavigator
              selectedDate={selectedDate}
              isToday={isToday}
              offsetDays={offsetDays}
              onPrev={onPrevDay}
              onNext={onNextDay}
              onJumpToday={onJumpToday}
              onPick={onPickDate}
              realToday={realToday}
            />
            <div className="mt-8">
              <TodayTab
                sun={basis.sun}
                today={today}
                selectedDate={selectedDate}
                isToday={isToday}
                personalDay={pDay}
                personalMonth={pMonth}
                personalYear={basis.numero.personal}
                annual={basis.annual}
                weather={weather}
                weatherErr={weatherErr}
                onReshuffle={() => setReshuffleSeed((s) => s + 1)}
              />
            </div>
          </>
        ) : tab === "basis" ? (
          <BasisTab basis={basis} />
        ) : (
          <OracleTab />
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// 日付ナビゲーター（±14日）
// ==========================================================================

function DateNavigator({
  selectedDate,
  isToday,
  offsetDays,
  onPrev,
  onNext,
  onJumpToday,
  onPick,
  realToday,
}: {
  selectedDate: Date;
  isToday: boolean;
  offsetDays: number;
  onPrev: () => void;
  onNext: () => void;
  onJumpToday: () => void;
  onPick: (s: string) => void;
  realToday: Date;
}) {
  const dateStr = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const prevDisabled = offsetDays <= -14;
  const nextDisabled = offsetDays >= 14;
  const minStr = (() => {
    const d = new Date(realToday);
    d.setDate(d.getDate() - 14);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const maxStr = (() => {
    const d = new Date(realToday);
    d.setDate(d.getDate() + 14);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const dow = ["日", "月", "火", "水", "木", "金", "土"][selectedDate.getDay()];
  const tag = isToday
    ? "本日"
    : offsetDays === -1 ? "昨日"
    : offsetDays === 1 ? "明日"
    : offsetDays < 0 ? `${-offsetDays}日前`
    : `${offsetDays}日後`;

  // 横スクロールできる15日タイムライン
  const timeline: { date: Date; offset: number }[] = [];
  for (let i = -14; i <= 14; i++) {
    const d = new Date(realToday);
    d.setDate(d.getDate() + i);
    timeline.push({ date: d, offset: i });
  }

  return (
    <section className="rounded-2xl bg-paper border border-gold-300 p-5 sm:p-6">
      {/* 上段: prev / 中央表示 / next */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onPrev}
          disabled={prevDisabled}
          className="rounded-lg border border-ink-300 px-3 py-2 hover:border-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
            {tag}
          </div>
          <div className="font-display text-2xl sm:text-3xl text-ink-900 mt-0.5">
            {selectedDate.getMonth() + 1}月 {selectedDate.getDate()}日
            <span className="text-sm text-ink-500 ml-2">（{dow}）</span>
          </div>
          <div className="text-xs text-ink-400 mt-0.5">
            {selectedDate.getFullYear()}年
          </div>
        </div>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-lg border border-ink-300 px-3 py-2 hover:border-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
        >
          →
        </button>
      </div>

      {/* 中段: 15日タイムライン */}
      <div className="flex gap-1 overflow-x-auto py-2 -mx-2 px-2 snap-x">
        {timeline.map(({ date, offset }) => {
          const isSelected = isSameDay(date, selectedDate);
          const isReal = isSameDay(date, realToday);
          const dayDow = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const cls = isSelected
            ? "bg-kachi-fade text-sand-50 border-2 border-gold-500 shadow-lg"
            : isReal
            ? "bg-gold-50 border border-gold-400 text-ink-900"
            : "bg-white border border-ink-200 text-ink-700 hover:border-gold-400";
          return (
            <button
              key={offset}
              onClick={() => {
                const s = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                onPick(s);
              }}
              className={`shrink-0 snap-center rounded-md px-3 py-2 text-center transition-colors ${cls}`}
            >
              <div className={`text-[9px] tracking-widest ${isWeekend && !isSelected ? "text-shu-600" : ""}`}>
                {dayDow}
              </div>
              <div className="font-display text-lg tabular-nums">
                {date.getDate()}
              </div>
              {isReal && !isSelected && (
                <div className="text-[8px] text-gold-700 font-medium">本日</div>
              )}
            </button>
          );
        })}
      </div>

      {/* 下段: 日付ピッカー & 本日に戻る */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-ink-200">
        <input
          type="date"
          value={dateStr}
          min={minStr}
          max={maxStr}
          onChange={(e) => onPick(e.target.value)}
          className="rounded-md border border-ink-300 px-3 py-1.5 text-sm focus:outline-none focus:border-gold-500"
        />
        {!isToday && (
          <button
            onClick={onJumpToday}
            className="rounded-md bg-kachi-fade text-sand-50 px-4 py-1.5 text-sm hover:bg-kachi-700 border border-gold-500"
          >
            本日に戻る
          </button>
        )}
      </div>
    </section>
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
  selectedDate,
  isToday,
  personalDay: pDay,
  personalMonth: pMonth,
  personalYear,
  annual,
  weather,
  weatherErr,
  onReshuffle,
}: {
  sun: Zodiac;
  today: TodayResults;
  selectedDate: Date;
  isToday: boolean;
  personalDay: number;
  personalMonth: number;
  personalYear: number;
  annual: ReturnType<typeof annualDirection>;
  weather: WeatherData | null;
  weatherErr: boolean;
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

  // 選択日に基づく高精度データ
  const todayDP = todayDayPillar(selectedDate);
  const todayTB = todayTongbianForOwner(selectedDate);
  const hourlyChart = todayHourlyChart(selectedDate);
  const luckyHours = todayLuckyHours(selectedDate);
  const personalHex = todayPersonalHexagram(OWNER.birth, selectedDate);
  const synthesis = todaySynthesis(pDay, selectedDate);
  const familyAdvice = todayFamilyAdvice(pDay);

  // 香水推薦（天気は当日のみ反映、それ以外は季節+時間+デイのみ）
  const now = new Date();
  const weatherTags = isToday && weather
    ? classifyWeather(weather.weatherCode, weather.tempC)
    : [];
  const perfumeRecs: PerfumeMatch[] = recommendPerfumes(
    pDay,
    weatherTags,
    getTimeTag(now.getHours()),
    getSeason(now.getMonth() + 1),
    2
  );

  return (
    <div className="space-y-12">
      {/* ━━ 0. 大阪の天気（当日のみ） ━━ */}
      {isToday ? (
        <WeatherCard weather={weather} weatherErr={weatherErr} />
      ) : (
        <article className="rounded-2xl bg-sand-50 border border-ink-200 p-5 text-sm text-ink-500 text-center">
          天気は本日のみ表示されます（{selectedDate.getMonth() + 1}/{selectedDate.getDate()} は日付占断のみ）
        </article>
      )}

      {/* ━━ 0.3 天文（コズミック）パネル ━━ */}
      <CosmicPanel date={selectedDate} />

      {/* ━━ 0.5 本日の統合シンセシス（最重要） ━━ */}
      <TodaySynthesisHero
        synthesis={synthesis}
        dayPillar={todayDP}
        tongbian={todayTB}
      />

      {/* ━━ 0.6 ジャーナル（日々の記録） ━━ */}
      <JournalSection date={selectedDate} personalDayNum={pDay} />

      {/* ━━ 0.7 12時辰盤 ━━ */}
      <TwelveHoursChart chart={hourlyChart} luckyHours={luckyHours} />

      {/* ━━ 0.8 本日のパーソナル易卦 ━━ */}
      <PersonalHexSection hex={personalHex} />

      {/* ━━ 0.9 家族への助言 ━━ */}
      <FamilyAdviceSection advice={familyAdvice} />

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

      {/* ━━ 1.5 香水推薦 ━━ */}
      <PerfumeRecommendSection perfumes={perfumeRecs} />

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
      {/* ━━ パターン分析（蓄積データから） ━━ */}
      <PatternsSection />

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

      {/* ━━ 大運（10年周期） ━━ */}
      <NumberedSection num="玖" label="Daiun / Decade Luck" title="大運表 — 10年周期のライフサイクル">
        <DaiunTable periods={basis.daiun} currentAge={basis.currentAge} />
      </NumberedSection>

      {/* ━━ 統合占断シリーズ ━━ */}
      <SectionDivider title="統合占断・性格と行動" />

      <SynthesisBlock num="拾" card={CAREER_DEEP} />
      <SynthesisBlock num="拾壱" card={COMMUNICATION_STYLE} />
      <SynthesisBlock num="拾弐" card={DECISION_STYLE} />
      <SynthesisBlock num="拾参" card={LEADERSHIP_STYLE} />
      <SynthesisBlock num="拾肆" card={CONFLICT_PATTERN} />

      <SectionDivider title="統合占断・関係と家族" />

      <SynthesisBlock
        num="拾伍"
        card={relationshipSpouse(spouseAge(), spouseAgeDiff())}
      />
      <SynthesisBlock
        num="拾陸"
        card={relationshipChild(childAge(), childGradeJP())}
      />
      <SynthesisBlock
        num="拾漆"
        card={parentingStyleDeep(childAge(), childGradeJP())}
      />
      <SynthesisBlock num="拾捌" card={FAMILY_CARE} />
      <SynthesisBlock num="拾玖" card={PARENT_RELATIONSHIPS} />

      {/* ━━ 家族との相性スコア ━━ */}
      <NumberedSection num="弐拾" label="Family Compatibility" title="家族との相性スコア">
        <CompatSection
          spouseCompat={basis.spouseCompat}
          childCompat={basis.childCompat}
        />
      </NumberedSection>

      <SectionDivider title="統合占断・財・健康・心" />

      <SynthesisBlock num="弐拾壱" card={WEALTH_CORE} />
      <SynthesisBlock num="弐拾弐" card={MONEY_PSYCHOLOGY} />
      <SynthesisBlock num="弐拾参" card={HEALTH_CORE} />
      <SynthesisBlock num="弐拾肆" card={BODY_CONSTITUTION} />
      <SynthesisBlock num="弐拾伍" card={MENTAL_PATTERNS} />

      <SectionDivider title="統合占断・人生と魂" />

      <SynthesisBlock num="弐拾陸" card={lifeArc(basis.currentAge)} />
      <SynthesisBlock num="弐拾漆" card={midlifeTransition(basis.currentAge)} />
      <SynthesisBlock num="弐拾捌" card={FENGSHUI_HOME} />
      <SynthesisBlock num="弐拾玖" card={SPIRITUAL_THEME} />
      <SynthesisBlock num="参拾" card={SPIRITUAL_PRACTICE} />
      <SynthesisBlock num="参拾壱" card={legacyQuestion(basis.currentAge)} />

      {/* ━━ ビジネス相性チェッカー ━━ */}
      <SectionDivider title="ビジネス相性チェック" />
      <NumberedSection num="参拾弐" label="Business Compatibility" title="任意の人物とのビジネス相性">
        <BusinessCompatChecker />
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
      <CompatCard
        title={`妻（${spouseAge()}歳・${OWNER.family.spouse.birth}生）`}
        c={spouseCompat}
      />
      <CompatCard
        title={`${childDisplayName()}（${childAge()}歳・${OWNER.family.child.birth}生）`}
        c={childCompat}
      />
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

// ==========================================================================
// 大阪の天気カード
// ==========================================================================

function WeatherCard({
  weather,
  weatherErr,
}: {
  weather: WeatherData | null;
  weatherErr: boolean;
}) {
  if (weatherErr) {
    return (
      <article className="rounded-2xl bg-sand-50 border border-ink-200 p-5 text-sm text-ink-500">
        天気の取得に失敗しました（オフライン or APIブロック中）。
      </article>
    );
  }
  if (!weather) {
    return (
      <article className="rounded-2xl bg-sand-50 border border-ink-200 p-5 text-sm text-ink-400">
        大阪の天気を取得中…
      </article>
    );
  }
  return (
    <article className="rounded-2xl bg-paper border border-gold-300 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
            Osaka Weather ／ 大阪の天気
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-5xl">{weather.icon}</span>
            <div>
              <div className="font-display text-4xl tabular-nums text-ink-900">
                {Math.round(weather.tempC)}
                <span className="text-2xl text-ink-500">℃</span>
              </div>
              <div className="text-xs text-ink-600 mt-0.5">{weather.desc}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs text-ink-600 text-right">
          <div>
            体感 <span className="font-display text-base text-ink-800">{Math.round(weather.feelsLikeC)}℃</span>
          </div>
          <div>
            湿度 <span className="font-display text-base text-ink-800">{weather.humidity}%</span>
          </div>
          <div>
            風速 <span className="font-display text-base text-ink-800">{Math.round(weather.windKmh)}km/h</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ==========================================================================
// 香水レコメンド
// ==========================================================================

function PerfumeRecommendSection({ perfumes }: { perfumes: PerfumeMatch[] }) {
  if (perfumes.length === 0) return null;
  const top = perfumes[0];
  const sub = perfumes[1];
  return (
    <NumberedSection num="壱・五" label="Fragrance Pairing" title="今日の運勢を加速させる香り">
      <div className="space-y-4">
        {/* TOP RECOMMENDATION */}
        <article className="rounded-2xl bg-kachi-fade text-sand-50 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
                  Top Pick ／ 本命の一本
                </div>
                <div className="text-[10px] tracking-widest uppercase text-sand-300 mt-3">
                  {top.perfume.brand}
                </div>
                <h3 className="font-display text-3xl sm:text-4xl mt-1 text-sand-50 leading-tight">
                  {top.perfume.name}
                </h3>
                <div className="text-xs text-gold-200 mt-1">{top.perfume.family}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] tracking-[0.3em] text-gold-300 uppercase">Match</div>
                <div className="font-display text-3xl text-gold-300">{top.score}</div>
                <div className="text-[10px] text-sand-300">score</div>
              </div>
            </div>

            <p className="mt-5 text-sm sm:text-[15px] leading-loose text-sand-100">
              {top.perfume.description}
            </p>

            <div className="mt-5">
              <div className="text-[10px] tracking-[0.3em] uppercase text-gold-300 mb-2">Notes</div>
              <div className="flex flex-wrap gap-1.5">
                {top.perfume.notes.map((n) => (
                  <span
                    key={n}
                    className="text-xs px-2.5 py-1 rounded-full border border-gold-500/40 text-gold-200"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {top.reasons.length > 0 && (
              <div className="mt-5 border-t border-gold-500/30 pt-4">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold-300 mb-2">
                  なぜ今日この一本か
                </div>
                <ul className="space-y-1">
                  {top.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-sand-200 flex gap-2">
                      <span className="text-gold-400">◆</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        {/* ALTERNATIVE */}
        {sub && (
          <article className="rounded-2xl bg-paper border border-gold-300 p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
                  Alternative ／ もう一本の候補
                </div>
                <div className="text-[10px] tracking-widest uppercase text-ink-500 mt-2">
                  {sub.perfume.brand}
                </div>
                <h4 className="font-display text-2xl mt-0.5 text-ink-900">
                  {sub.perfume.name}
                </h4>
                <div className="text-xs text-ink-500">{sub.perfume.family}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] tracking-[0.3em] text-gold-700 uppercase">Match</div>
                <div className="font-display text-2xl text-gold-700">{sub.score}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-700 leading-relaxed">
              {sub.perfume.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {sub.perfume.notes.map((n) => (
                <span
                  key={n}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-gold-300 text-gold-800 bg-white"
                >
                  {n}
                </span>
              ))}
            </div>
          </article>
        )}
      </div>
    </NumberedSection>
  );
}

// ==========================================================================
// 大運表
// ==========================================================================

function DaiunTable({
  periods,
  currentAge,
}: {
  periods: DaiunPeriod[];
  currentAge: number;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
      <div className="text-sm text-ink-600 mb-5">
        現在 <span className="font-display text-2xl text-gold-700">{currentAge}</span> 歳。
        立運1歳から始まる10年周期の流れ。
      </div>
      <div className="space-y-3">
        {periods.map((p) => (
          <DaiunRow key={p.index} period={p} />
        ))}
      </div>
      <p className="mt-5 text-xs text-ink-500 leading-relaxed">
        ※ 大運は四柱推命の核心理論。月柱を起点に10年ごとに干支が進み、各期の通変星が
        その10年の主要テーマを決めます。「現在」マークの期に最も注目してください。
      </p>
    </div>
  );
}

function DaiunRow({ period }: { period: DaiunPeriod }) {
  const cls = period.isCurrent
    ? "bg-gold-fade border-2 border-gold-500 shadow"
    : "bg-sand-50 border border-ink-200";
  return (
    <article className={`rounded-xl p-4 sm:p-5 ${cls}`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <div className="font-display text-2xl text-ink-900">
            {period.startAge}-{period.endAge}歳
          </div>
          <div className="font-display text-3xl text-gold-700">
            {period.ganzhi}
          </div>
          {period.isCurrent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500 text-white font-medium">
              現在
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>{period.stemElement}・{period.branchElement}</span>
          <span className="font-display text-base text-kachi-700">{period.stemTongbian}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-ink-700 leading-relaxed">{period.theme}</p>
    </article>
  );
}

// ==========================================================================
// ビジネス相性チェッカー
// ==========================================================================

function BusinessCompatChecker() {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<BusinessCompatResult | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birth) return;
    setResult(calcBusinessCompat({ name: name || undefined, birth, gender }));
  };

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
      <p className="text-sm text-ink-600 mb-4">
        相手の生年月日と性別を入力すると、しゅんすけさんとの<strong>ビジネス相性</strong>を
        <strong>多軸スコア・役割分担・詳細分析</strong>で表示します。
      </p>

      <form onSubmit={onSubmit} className="rounded-xl bg-sand-50 border border-ink-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] tracking-[0.3em] uppercase text-ink-500">氏名（任意）</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中太郎"
            className="block mt-1 w-full rounded-md border border-ink-300 px-3 py-2 bg-white focus:outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.3em] uppercase text-ink-500">生年月日 *</span>
          <input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            required
            className="block mt-1 w-full rounded-md border border-ink-300 px-3 py-2 bg-white focus:outline-none focus:border-gold-500"
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-[10px] tracking-[0.3em] uppercase text-ink-500 mb-2">性別 *</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" checked={gender === "male"} onChange={() => setGender("male")} />
              <span className="text-sm">男性</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={gender === "female"} onChange={() => setGender("female")} />
              <span className="text-sm">女性</span>
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          className="sm:col-span-2 mt-2 rounded-md bg-kachi-fade text-sand-50 font-display text-lg py-3 hover:bg-kachi-700 border border-gold-500"
        >
          ビジネス相性を診断
        </button>
      </form>

      {result && <BusinessCompatResult result={result} />}
    </div>
  );
}

function BusinessCompatResult({ result }: { result: BusinessCompatResult }) {
  return (
    <div className="mt-8 space-y-6">
      {/* ヘッダー：相手のプロファイル */}
      <article className="rounded-2xl bg-kachi-fade text-sand-50 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="relative">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
            Subject ／ 診断対象
          </div>
          <div className="font-display text-2xl sm:text-3xl mt-2 text-sand-50">
            {result.partner.name}
            <span className="text-sm text-sand-300 ml-3">
              {result.partner.birth}・{result.partner.gender === "male" ? "男性" : "女性"}・{result.partner.age}歳
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <ResultBadge label="太陽星座" value={result.data.sunSign.name} />
            <ResultBadge label="九星" value={result.data.starName} />
            <ResultBadge label="日干" value={`${result.data.dayMaster}（${result.data.dayMasterElement}）`} />
            <ResultBadge label="ライフパス" value={String(result.data.lifePath)} />
            <ResultBadge label="干支" value={`${result.data.yearBranch}年`} />
          </div>
        </div>
      </article>

      {/* スコア6軸 */}
      <article className="rounded-2xl border-2 border-gold-400 bg-gold-fade p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold-700 mb-3">
          Scores ／ 6軸スコア
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="font-display text-7xl text-gold-700 tabular-nums leading-none">
            {result.scores.overall}
          </div>
          <div>
            <div className="text-sm text-ink-600">総合相性</div>
            <Stars value={result.scores.overall} large />
            <div className="font-display text-base mt-1">{result.recommendation}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <ScoreCell label="決断" value={result.scores.decision} />
          <ScoreCell label="実行" value={result.scores.execution} />
          <ScoreCell label="対話" value={result.scores.communication} />
          <ScoreCell label="金銭" value={result.scores.finance} />
          <ScoreCell label="長期" value={result.scores.longTerm} />
          <ScoreCell label="縁" value={result.scores.chemistry} />
        </div>
      </article>

      {/* 役割分担 */}
      <article className="rounded-2xl border border-ink-200 bg-white p-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
          Role Distribution ／ 役割分担の最適配置
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-kachi-fade text-sand-50 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-300">あなた（しゅんすけ）</div>
            <div className="font-display text-lg mt-2">{result.roles.you}</div>
          </div>
          <div className="rounded-lg bg-paper border border-gold-300 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">{result.partner.name}</div>
            <div className="font-display text-lg mt-2">{result.roles.partner}</div>
            <p className="text-xs text-ink-600 mt-2">{result.partnerComplement}</p>
          </div>
        </div>
      </article>

      {/* 強み と リスク */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.strengths.length > 0 && (
          <article className="rounded-2xl border border-gold-300 bg-gold-50/40 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
              Strengths ／ 強み
            </div>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-sm text-ink-800 flex gap-2">
                  <span className="text-gold-600">◎</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
        {result.risks.length > 0 && (
          <article className="rounded-2xl border border-shu-300 bg-shu-50 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-shu-700 mb-3">
              Risks ／ 注意点
            </div>
            <ul className="space-y-2">
              {result.risks.map((s, i) => (
                <li key={i} className="text-sm text-ink-800 flex gap-2">
                  <span className="text-shu-500">⚠</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>

      {/* 詳細分析 */}
      <article className="rounded-2xl bg-paper border border-gold-300 p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
          Detailed Analysis ／ 詳細分析
        </div>
        <div className="text-sm sm:text-[15px] text-ink-800 leading-loose whitespace-pre-line">
          {result.detailedAnalysis}
        </div>
      </article>

      {/* 関係指標の詳細 */}
      <article className="rounded-2xl border border-ink-200 bg-white p-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500 mb-3">
          Relationship Indicators ／ 関係指標
        </div>
        <div className="space-y-3 text-sm">
          <div className="border-l-2 border-gold-400 pl-3">
            <div className="text-xs text-ink-500">星座（牡牛座×{result.data.sunSign.name}）</div>
            <p className="text-ink-700 mt-1">{result.zodiacCompat.text}</p>
          </div>
          <div className="border-l-2 border-kachi-500 pl-3">
            <div className="text-xs text-ink-500">九星五行（七赤金×{result.data.starName}）</div>
            <p className="text-ink-700 mt-1">{result.starCompat.relation} — {result.starCompat.text}</p>
          </div>
          <div className="border-l-2 border-shu-400 pl-3">
            <div className="text-xs text-ink-500">通変星（戊→{result.data.dayMaster}）</div>
            <p className="text-ink-700 mt-1"><span className="font-display text-base">{result.tongbian}</span> の関係</p>
          </div>
          <div className="border-l-2 border-gold-300 pl-3">
            <div className="text-xs text-ink-500">年支の縁（子年×{result.data.yearBranch}年）</div>
            <p className="text-ink-700 mt-1"><span className="font-display text-base">{result.branchInter.type}</span> — {result.branchInter.text}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

function ResultBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gold-500/30 bg-kachi-700/40 backdrop-blur px-3 py-2.5">
      <div className="text-[9px] tracking-[0.3em] uppercase text-gold-300/80">{label}</div>
      <div className="mt-1 font-display text-base text-sand-50">{value}</div>
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white border border-gold-300 p-3 text-center">
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500">{label}</div>
      <div className="font-display text-3xl text-gold-700 mt-1 tabular-nums">{value}</div>
      <div className="text-[10px] text-ink-400">/ 5</div>
    </div>
  );
}

// ==========================================================================
// 本日の統合シンセシス ヒーロー
// ==========================================================================

function TodaySynthesisHero({
  synthesis,
  dayPillar,
  tongbian,
}: {
  synthesis: TodaySynthesis;
  dayPillar: { stem: string; branch: string; ganzhi: string };
  tongbian: { star: string; text: string };
}) {
  return (
    <section className="rounded-2xl bg-kachi-fade text-sand-50 p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute -top-12 right-0 w-96 h-96 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-shu-500/10 blur-3xl" />

      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
          Today's Synthesis ／ 本日の統合占断
        </div>

        {/* 本日の干支 + 通変星 */}
        <div className="mt-5 flex flex-wrap items-baseline gap-3 sm:gap-5">
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-sand-300">日柱</div>
            <div className="font-display text-3xl sm:text-4xl text-sand-50">
              {dayPillar.ganzhi}
            </div>
          </div>
          <div className="text-gold-400">×</div>
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-sand-300">日主 戊 から見て</div>
            <div className="font-display text-3xl sm:text-4xl text-gold-300">
              {tongbian.star}
            </div>
          </div>
        </div>

        <h2 className="mt-6 font-display text-3xl sm:text-5xl tracking-wide leading-tight text-sand-50">
          {synthesis.headline}
        </h2>
        <p className="mt-2 text-gold-200 text-sm sm:text-base">
          {synthesis.subline}
        </p>

        {/* 本日のキーワード3つ */}
        <div className="mt-6 flex flex-wrap gap-2">
          {synthesis.keywords.map((k) => (
            <span
              key={k}
              className="text-xs px-3 py-1.5 rounded-full border border-gold-500/40 text-gold-200 bg-kachi-700/40"
            >
              # {k}
            </span>
          ))}
        </div>

        {/* シンセシス本文 */}
        <div className="mt-7 space-y-4">
          {synthesis.paragraphs.map((p, i) => (
            <p key={i} className="text-sm sm:text-[15px] leading-loose text-sand-100">
              {p}
            </p>
          ))}
        </div>

        {/* アファメーション */}
        <div className="mt-8 rounded-lg bg-kachi-800/60 backdrop-blur border border-gold-500/40 p-5 text-center">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300 mb-2">
            Today's Affirmation
          </div>
          <div className="font-display text-xl sm:text-2xl italic text-gold-200">
            「{synthesis.affirmation}」
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================================================
// 12時辰盤
// ==========================================================================

function TwelveHoursChart({
  chart,
  luckyHours,
}: {
  chart: HourSlot[];
  luckyHours: HourSlot[];
}) {
  const luckyBranches = new Set(luckyHours.map((h) => h.branch));
  return (
    <NumberedSection num="零・八" label="12 Hour Chart" title="本日の十二時辰盤（日主戊から見た吉凶）">
      <div className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {chart.map((h) => {
            const isLucky = luckyBranches.has(h.branch);
            const ratingColor =
              h.rating === "大吉" ? "bg-gold-fade border-2 border-gold-500"
              : h.rating === "吉" ? "bg-gold-50 border border-gold-400"
              : h.rating === "中吉" ? "bg-sand-50 border border-ink-200"
              : "bg-shu-50 border border-shu-300";
            return (
              <div
                key={h.branch}
                className={`rounded-lg p-3 ${ratingColor} ${isLucky ? "ring-2 ring-gold-500" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl text-ink-900">{h.branch}</span>
                  <span className="text-[10px] text-ink-500 tabular-nums">{h.range}</span>
                </div>
                <div className="text-[10px] text-ink-500 mt-1">{h.ganzhi}</div>
                <div className={`mt-2 text-xs font-medium ${
                  h.rating === "大吉" || h.rating === "吉" ? "text-gold-700"
                  : h.rating === "中吉" ? "text-ink-700"
                  : "text-shu-700"
                }`}>
                  {h.rating}
                </div>
                <div className="text-[10px] text-ink-500 mt-0.5">{h.star}</div>
              </div>
            );
          })}
        </div>

        {/* 本日のラッキータイム強調 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {luckyHours.map((h, i) => (
            <article
              key={h.branch}
              className="rounded-xl bg-gold-fade border-2 border-gold-500 p-5"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
                Lucky Hour {i + 1}
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-display text-3xl text-gold-700">{h.branch}</span>
                <span className="font-display text-2xl text-ink-900">{h.range}時</span>
              </div>
              <div className="text-xs text-ink-500 mt-1">
                {h.ganzhi} ／ 通変星「{h.star}」（{h.rating}）
              </div>
              <p className="text-sm text-ink-800 mt-3">{h.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </NumberedSection>
  );
}

// ==========================================================================
// 本日のパーソナル易卦
// ==========================================================================

function PersonalHexSection({
  hex,
}: {
  hex: ReturnType<typeof todayPersonalHexagram>;
}) {
  return (
    <NumberedSection num="零・九" label="Personal I Ching" title="本日のあなた専用の易卦">
      <div className="rounded-2xl border-2 border-gold-300 bg-paper p-6 sm:p-8">
        <div className="text-xs text-ink-500 mb-4">
          ※ 生年月日 {OWNER.birth} と本日の組合せでシードされた、あなただけの本日の卦
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HexBlock
            label="本卦"
            hex={hex.hex}
            yaos={hex.yaos}
            upper={trigramName(hex.yaos, "upper")}
            lower={trigramName(hex.yaos, "lower")}
          />
          {hex.changed && (
            <HexBlock
              label="之卦（本日の変化後）"
              hex={hex.changed.hex}
              yaos={hex.changed.yaos}
              upper={trigramName(hex.changed.yaos, "upper")}
              lower={trigramName(hex.changed.yaos, "lower")}
              isChanged
            />
          )}
        </div>
        {hex.lines.length > 0 && (
          <div className="mt-6 border-t-2 border-gold-300 pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
              本日の変爻メッセージ
            </div>
            <ul className="space-y-2 text-sm">
              {hex.lines.map((l, i) => (
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
  );
}

// ==========================================================================
// 家族への助言
// ==========================================================================

function FamilyAdviceSection({
  advice,
}: {
  advice: { spouse: string; child: string };
}) {
  return (
    <NumberedSection num="壱・〇" label="Family Today" title="家族への今日の関わり方">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article className="rounded-xl bg-gold-fade border border-gold-400 p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">
            妻への接し方
          </div>
          <p className="text-sm text-ink-800 leading-relaxed">{advice.spouse}</p>
        </article>
        <article className="rounded-xl bg-paper border border-ink-200 p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500 mb-2">
            子への接し方
          </div>
          <p className="text-sm text-ink-800 leading-relaxed">{advice.child}</p>
        </article>
      </div>
    </NumberedSection>
  );
}

// ==========================================================================
// Oracle タブ（Claude API 個人相談）
// ==========================================================================

function OracleTab() {
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState<OracleModel>("claude-opus-4-7");
  const [hydrated, setHydrated] = useState(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [category, setCategory] = useState<OracleCategory>("free");
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirth, setPartnerBirth] = useState("");
  const [partnerGender, setPartnerGender] = useState<"male" | "female">("male");

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setApiKey(loadApiKey());
    setModel(loadModel());
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  const active = threads.find((t) => t.id === activeId) || null;

  const isCompat = category.startsWith("compat-");

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages.length, streamText]);

  const onSaveKey = () => {
    saveApiKey(keyInput.trim());
    setApiKey(keyInput.trim());
    setKeyInput("");
  };

  const onClearKey = () => {
    if (!confirm("APIキーを削除しますか？")) return;
    saveApiKey("");
    setApiKey("");
  };

  const onChangeModel = (m: OracleModel) => {
    setModel(m);
    saveModel(m);
  };

  const startNew = () => {
    let partner: CompatPerson | undefined;
    if (isCompat) {
      if (!partnerBirth) {
        alert("相性鑑定の対象には生年月日が必須です");
        return;
      }
      partner = { name: partnerName, birth: partnerBirth, gender: partnerGender };
    }
    const t = newThread(category, partner);
    const next = [t, ...threads];
    setThreads(next);
    saveThreads(next);
    setActiveId(t.id);
  };

  const sendMessage = async () => {
    if (!input.trim() || !active || streaming) return;
    if (!apiKey) {
      setError("APIキーを設定してください");
      return;
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated: ChatThread = {
      ...active,
      messages: [...active.messages, userMsg],
      updatedAt: new Date().toISOString(),
    };
    const newThreads = threads.map((t) => (t.id === active.id ? updated : t));
    setThreads(newThreads);
    saveThreads(newThreads);
    setInput("");
    setStreaming(true);
    setStreamText("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const sysPrompt = buildSystemPrompt(active.category, active.partner);
      let acc = "";
      const full = await streamOracle({
        apiKey,
        model,
        systemPrompt: sysPrompt,
        messages: updated.messages,
        signal: controller.signal,
        onChunk: (t) => {
          acc += t;
          setStreamText(acc);
        },
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: full,
        timestamp: new Date().toISOString(),
      };
      const final: ChatThread = {
        ...updated,
        messages: [...updated.messages, assistantMsg],
        updatedAt: new Date().toISOString(),
      };
      const finalThreads = newThreads.map((t) => (t.id === active.id ? final : t));
      setThreads(finalThreads);
      saveThreads(finalThreads);
      setStreamText("");
    } catch (e: unknown) {
      const err = e as Error;
      if (err.name !== "AbortError") {
        setError(err.message || "通信エラー");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
  };

  const deleteThread = (id: string) => {
    if (!confirm("このスレッドを削除しますか？")) return;
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    saveThreads(next);
    if (activeId === id) setActiveId(null);
  };

  if (!hydrated) {
    return <div className="text-sm text-ink-400 py-12 text-center">読み込み中…</div>;
  }

  // ===== API KEY 未設定 =====
  if (!apiKey) {
    return (
      <section className="rounded-2xl bg-kachi-fade text-sand-50 p-8 sm:p-12">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
          Oracle Setup ／ 初回設定
        </div>
        <h2 className="font-display text-3xl sm:text-4xl mt-3">Claude API キーを登録</h2>
        <p className="mt-4 text-sand-200 text-sm leading-relaxed">
          あなたの命式・大運・五格すべてをコンテキストに、Claude が深い個人相談を行います。
          APIキーは <strong>このブラウザの localStorage</strong> にのみ保存され、外部送信されません。
        </p>
        <p className="mt-3 text-sand-300 text-xs">
          API キーは{" "}
          <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noreferrer"
            className="underline text-gold-300"
          >
            console.anthropic.com
          </a>{" "}
          で取得可能（sk-ant-... で始まる文字列）。
        </p>
        <div className="mt-6 space-y-3">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full rounded-md bg-kachi-700/40 border border-gold-500/30 px-4 py-3 text-sand-50 placeholder:text-sand-400 focus:outline-none focus:border-gold-500"
          />
          <button
            onClick={onSaveKey}
            disabled={!keyInput.trim()}
            className="w-full rounded-md bg-gold-500 text-kachi-900 font-display text-lg py-3 hover:bg-gold-400 disabled:opacity-30"
          >
            保存して開始
          </button>
        </div>
      </section>
    );
  }

  // ===== メインUI =====
  return (
    <div className="space-y-6">
      {/* ヘッダ: モデル選択 / キー管理 */}
      <section className="rounded-xl bg-paper border border-gold-300 p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">Model</div>
          <select
            value={model}
            onChange={(e) => onChangeModel(e.target.value as OracleModel)}
            className="mt-1 w-full rounded-md border border-ink-300 px-3 py-2 bg-white text-sm focus:outline-none focus:border-gold-500"
          >
            {Object.entries(MODEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onClearKey}
          className="text-xs text-ink-400 hover:text-shu-700 underline self-end"
        >
          API キー削除
        </button>
      </section>

      {/* スレッド一覧 + 新規作成 */}
      <section className="rounded-2xl bg-paper border border-gold-300 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700">
              New Thread ／ 新しい相談
            </div>
            <h3 className="font-display text-xl mt-1">カテゴリを選んで開始</h3>
          </div>
        </div>

        {/* カテゴリ選択 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(CATEGORY_LABELS) as [OracleCategory, typeof CATEGORY_LABELS[OracleCategory]][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCategory(k)}
              className={`rounded-lg border p-3 text-left transition-all ${
                category === k
                  ? "bg-gold-fade border-2 border-gold-500 shadow"
                  : "bg-white border-ink-200 hover:border-gold-400"
              }`}
            >
              <div className="text-2xl">{v.emoji}</div>
              <div className="font-display text-sm mt-1">{v.label}</div>
              <div className="text-[10px] text-ink-500">{v.sub}</div>
            </button>
          ))}
        </div>

        {/* 相性カテゴリの場合: 相手情報フォーム */}
        {isCompat && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-sand-50 rounded-lg border border-ink-200">
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-ink-500">名前（任意）</span>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="例: 田中太郎"
                className="mt-1 w-full rounded-md border border-ink-300 px-3 py-2 bg-white text-sm focus:outline-none focus:border-gold-500"
              />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-ink-500">生年月日 *</span>
              <input
                type="date"
                value={partnerBirth}
                onChange={(e) => setPartnerBirth(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink-300 px-3 py-2 bg-white text-sm focus:outline-none focus:border-gold-500"
              />
            </label>
            <fieldset>
              <legend className="text-[10px] tracking-[0.3em] uppercase text-ink-500 mb-2">性別 *</legend>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={partnerGender === "male"} onChange={() => setPartnerGender("male")} />
                  男性
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={partnerGender === "female"} onChange={() => setPartnerGender("female")} />
                  女性
                </label>
              </div>
            </fieldset>
          </div>
        )}

        <button
          onClick={startNew}
          className="mt-5 rounded-md bg-kachi-fade text-sand-50 font-display text-base px-6 py-2.5 hover:bg-kachi-700 border border-gold-500"
        >
          新規スレッド開始
        </button>
      </section>

      {/* スレッドリスト */}
      {threads.length > 0 && (
        <section className="rounded-2xl bg-white border border-ink-200 p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
            Threads ／ 履歴 ({threads.length})
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors ${
                  activeId === t.id ? "bg-gold-fade border border-gold-400" : "hover:bg-sand-50 border border-transparent"
                }`}
                onClick={() => setActiveId(t.id)}
              >
                <div className="text-lg">{CATEGORY_LABELS[t.category].emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{t.title}</div>
                  <div className="text-[10px] text-ink-400">
                    {t.messages.length}件 / {new Date(t.updatedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                  className="text-xs text-ink-400 hover:text-shu-700 px-2"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* チャットエリア */}
      {active && (
        <section className="rounded-2xl bg-white border border-ink-200 overflow-hidden">
          <div className="px-5 py-3 bg-paper border-b border-gold-300 flex items-baseline gap-3">
            <div className="text-2xl">{CATEGORY_LABELS[active.category].emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base">{active.title}</div>
              {active.partner && (
                <div className="text-[10px] text-ink-500">
                  対象: {active.partner.name || "—"} / {active.partner.birth} / {active.partner.gender === "male" ? "男性" : "女性"}
                </div>
              )}
            </div>
          </div>

          <div ref={scrollRef} className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-4">
            {active.messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {streaming && streamText && (
              <MessageBubble
                message={{ role: "assistant", content: streamText, timestamp: "" }}
                streaming
              />
            )}
            {streaming && !streamText && (
              <div className="text-sm text-ink-400">⏳ 占い中…</div>
            )}
            {error && (
              <div className="rounded-md bg-shu-50 border border-shu-300 text-shu-700 text-sm p-3">
                エラー: {error}
              </div>
            )}
          </div>

          <div className="border-t border-ink-200 p-4 bg-sand-50">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  sendMessage();
                }
              }}
              placeholder="質問を入力（⌘/Ctrl + Enter で送信）"
              rows={3}
              disabled={streaming}
              className="w-full rounded-md border border-ink-300 px-3 py-2 bg-white text-sm focus:outline-none focus:border-gold-500"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              {streaming ? (
                <button
                  onClick={stopStream}
                  className="rounded-md bg-shu-500 text-white text-sm px-4 py-2 hover:bg-shu-600"
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="rounded-md bg-kachi-fade text-sand-50 font-display text-sm px-6 py-2 hover:bg-kachi-700 border border-gold-500 disabled:opacity-30"
                >
                  送信
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-kachi-fade text-sand-50"
            : "bg-paper border border-gold-300 text-ink-800"
        }`}
      >
        {message.content}
        {streaming && <span className="inline-block w-2 h-4 bg-gold-500 align-middle animate-pulse ml-1"></span>}
      </div>
    </div>
  );
}

// ==========================================================================
// コズミックパネル（天文・節気・月相）
// ==========================================================================

function CosmicPanel({ date }: { date: Date }) {
  const sunSign = useMemo(() => accurateSunSign(date), [date]);
  const moonSign = useMemo(() => accurateMoonSign(date), [date]);
  const phase = useMemo(() => moonPhase(date), [date]);
  const term = useMemo(() => currentSolarTerm(date), [date]);

  return (
    <section className="rounded-2xl bg-kachi-fade text-sand-50 p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-shu-500/10 blur-3xl" />
      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold-300">
          Cosmic ／ 当日の天文
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <CosmicCell
            label="太陽"
            big={`${sunSign.name}`}
            sub={`${sunSign.degree.toFixed(1)}°`}
          />
          <CosmicCell
            label="月"
            big={`${moonSign.name}`}
            sub={`${moonSign.degree.toFixed(1)}°`}
          />
          <CosmicCell
            label="月相"
            big={`${phase.emoji} ${phase.name}`}
            sub={`${phase.age.toFixed(1)}日齢 / ${(phase.illumination * 100).toFixed(0)}%`}
          />
          <CosmicCell
            label="節気"
            big={term.term}
            sub={`${term.daysSinceStart}日目 → ${term.nextTerm}まで${term.daysUntilNext}日`}
          />
        </div>

        {/* 月相と節気の解説 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="rounded-lg bg-kachi-700/40 backdrop-blur border border-gold-500/30 p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-300">月相のテーマ</div>
            <p className="text-sm text-sand-100 mt-2 leading-relaxed">
              {MOON_PHASE_TEXT[phase.name]}
            </p>
          </div>
          <div className="rounded-lg bg-kachi-700/40 backdrop-blur border border-gold-500/30 p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold-300">節気「{term.term}」のテーマ</div>
            <p className="text-sm text-sand-100 mt-2 leading-relaxed">
              {SOLAR_TERM_TEXT[term.term]}
            </p>
          </div>
        </div>

        <p className="mt-5 text-[11px] text-sand-300/80 text-center">
          Meeus天文計算による太陽黄経 {sunLongitude(date).toFixed(2)}° / 月黄経 {moonLongitude(date).toFixed(2)}°
        </p>
      </div>
    </section>
  );
}

function CosmicCell({ label, big, sub }: { label: string; big: string; sub: string }) {
  return (
    <div className="rounded-lg border border-gold-500/30 bg-kachi-700/40 backdrop-blur px-3 py-2.5">
      <div className="text-[9px] tracking-[0.3em] uppercase text-gold-300/80">{label}</div>
      <div className="mt-1 font-display text-base sm:text-lg text-sand-50">{big}</div>
      <div className="text-[10px] text-sand-300 tabular-nums">{sub}</div>
    </div>
  );
}

// ==========================================================================
// ジャーナル（日々の記録蓄積）
// ==========================================================================

function JournalSection({
  date,
  personalDayNum,
}: {
  date: Date;
  personalDayNum: number;
}) {
  const key = dateKey(date);
  const [entry, setEntry] = useState<JournalEntry>({ date: key });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);

  // 入力欄の状態をセッション内ロード
  useEffect(() => {
    const existing = getJournalEntry(key);
    setEntry(existing ? { ...existing } : { date: key });
    setStreak(currentStreak(getRecentEntries(60)));
    setTotal(entryCount());
  }, [key]);

  const update = (patch: Partial<JournalEntry>) => {
    setEntry((prev) => {
      const next = { ...prev, date: key, ...patch };
      saveJournalEntry(next);
      setSavedAt(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
      setStreak(currentStreak(getRecentEntries(60)));
      setTotal(entryCount());
      return next;
    });
  };

  const setHit = (
    type: keyof NonNullable<JournalEntry["forecastHits"]>,
    value: Hit
  ) => {
    const fh = { ...(entry.forecastHits || {}) };
    fh[type] = fh[type] === value ? null : value;
    update({ forecastHits: fh });
  };

  const moodLabels = ["", "とても低い", "低い", "普通", "良い", "最高"];
  const energyLabels = ["", "枯渇", "低い", "普通", "高い", "全開"];

  return (
    <NumberedSection
      num="零・六"
      label="Journal"
      title="今日の記録（蓄積データ）"
      action={
        <div className="text-xs text-ink-500 text-right">
          <div>📊 累計 {total} 日</div>
          <div>🔥 連続 {streak} 日</div>
        </div>
      }
    >
      <div className="rounded-2xl bg-paper border border-gold-300 p-6 space-y-5">
        <p className="text-xs text-ink-600 leading-relaxed">
          記録を続けるほど、あなた個人のパターンが見えてきます。基礎タブの「パターン分析」で集計結果を見られます。
        </p>

        {/* ムード */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">気分（Mood）</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => update({ mood: v })}
                className={`flex-1 rounded-lg border py-3 transition-all ${
                  entry.mood === v
                    ? "bg-gold-fade border-gold-500 border-2 shadow"
                    : "bg-white border-ink-200 hover:border-gold-400"
                }`}
              >
                <div className="font-display text-2xl">{["😞", "🙁", "😐", "🙂", "😄"][v - 1]}</div>
                <div className="text-[10px] text-ink-500 mt-1">{v}</div>
              </button>
            ))}
          </div>
          {entry.mood && (
            <p className="text-xs text-ink-500 mt-2">→ {moodLabels[entry.mood]}</p>
          )}
        </div>

        {/* エネルギー */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">エネルギー</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => update({ energy: v })}
                className={`flex-1 rounded-lg border py-3 transition-all ${
                  entry.energy === v
                    ? "bg-gold-fade border-gold-500 border-2 shadow"
                    : "bg-white border-ink-200 hover:border-gold-400"
                }`}
              >
                <div className="font-display text-lg">{"⚡".repeat(v)}</div>
                <div className="text-[10px] text-ink-500 mt-1">{v}</div>
              </button>
            ))}
          </div>
          {entry.energy && (
            <p className="text-xs text-ink-500 mt-2">→ {energyLabels[entry.energy]}</p>
          )}
        </div>

        {/* 占断的中フラグ */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">
            占断は当たった？（後で振り返って評価）
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["tarot", "iching", "daily", "synthesis"] as const).map((t) => {
              const label = t === "tarot" ? "タロット" : t === "iching" ? "易経" : t === "daily" ? "本日運勢" : "シンセシス";
              const cur = entry.forecastHits?.[t];
              return (
                <div key={t} className="rounded-lg border border-ink-200 bg-white p-3">
                  <div className="text-[10px] text-ink-500 mb-2">{label}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setHit(t, "hit")}
                      className={`flex-1 rounded text-xs py-1 ${cur === "hit" ? "bg-gold-500 text-white" : "border border-ink-200 hover:bg-gold-50"}`}
                    >
                      ◎
                    </button>
                    <button
                      onClick={() => setHit(t, "miss")}
                      className={`flex-1 rounded text-xs py-1 ${cur === "miss" ? "bg-shu-500 text-white" : "border border-ink-200 hover:bg-shu-50"}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 使用香水 */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">使用した香水</div>
          <select
            value={entry.perfumeUsed || ""}
            onChange={(e) => update({ perfumeUsed: e.target.value || undefined })}
            className="w-full rounded-md border border-ink-300 px-3 py-2 bg-white text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="">— 選択 —</option>
            {OWNER.perfumes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand}・{p.name}
              </option>
            ))}
          </select>
        </div>

        {/* イベント・メモ */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-2">今日のメモ</div>
          <textarea
            value={entry.notes || ""}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="出来事・気づき・誰と会ったか・何を感じたか…"
            rows={3}
            className="w-full rounded-md border border-ink-300 px-3 py-2 bg-white text-sm focus:outline-none focus:border-gold-500"
          />
        </div>

        {savedAt && (
          <p className="text-[10px] text-ink-400 text-right">自動保存 ✓ {savedAt}</p>
        )}
      </div>
    </NumberedSection>
  );
}

// ==========================================================================
// パターン分析（蓄積データの集計表示）
// ==========================================================================

function PatternsSection() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(Object.values(loadJournal()));
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (entries.length === 0) {
    return (
      <NumberedSection num="〇" label="Patterns" title="あなたのパターン分析">
        <article className="rounded-2xl bg-paper border border-gold-300 p-6 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-ink-700">
            まだ記録がありません。
            <br />
            今日タブの「ジャーナル」で気分・エネルギー・占断の的中を記録すると、
            <br />
            ここに<strong>あなた個人の傾向</strong>が見えてきます。
          </p>
        </article>
      </NumberedSection>
    );
  }

  const byPDay = aggregateByPersonalDay(entries, OWNER.birth, personalDay);
  const hits = hitRatesByForecast(entries);
  const streak = currentStreak(entries);

  return (
    <NumberedSection num="〇" label="Patterns" title="あなたのパターン分析（蓄積データから）">
      <div className="rounded-2xl bg-paper border border-gold-300 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap gap-3 items-baseline">
          <div className="font-display text-4xl text-gold-700">{entries.length}</div>
          <div className="text-sm text-ink-700">日分の記録 / 連続 <span className="font-display text-xl text-gold-700">{streak}</span> 日</div>
        </div>

        {/* パーソナルデイ別の平均ムード */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
            パーソナルデイ別の気分傾向
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pd) => {
              const stat = byPDay[pd];
              if (stat.count === 0) {
                return (
                  <div key={pd} className="flex items-center gap-3 text-sm">
                    <div className="w-6 font-display text-lg text-ink-400">{pd}</div>
                    <div className="flex-1 text-xs text-ink-300">未記録</div>
                  </div>
                );
              }
              const moodPct = (stat.avgMood / 5) * 100;
              return (
                <div key={pd} className="flex items-center gap-3 text-sm">
                  <div className="w-6 font-display text-lg text-gold-700">{pd}</div>
                  <div className="flex-1 h-3 bg-ink-100 rounded">
                    <div className="h-3 bg-gold-500 rounded" style={{ width: `${moodPct}%` }} />
                  </div>
                  <div className="w-12 text-right tabular-nums text-xs">{stat.avgMood.toFixed(1)}</div>
                  <div className="w-12 text-right text-[10px] text-ink-500">{stat.count}日</div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-ink-400 mt-2">
            ※ 平均気分 5/5 が最も高い。記録が増えるほど、自分にとって最良/最弱のパーソナルデイがわかる。
          </p>
        </div>

        {/* 占断別の的中率 */}
        <div className="border-t border-gold-300 pt-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold-700 mb-3">
            占断タイプ別の的中率
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HitCell label="タロット" rate={hits.tarot.rate} total={hits.tarot.total} />
            <HitCell label="易経" rate={hits.iching.rate} total={hits.iching.total} />
            <HitCell label="本日運勢" rate={hits.daily.rate} total={hits.daily.total} />
            <HitCell label="シンセシス" rate={hits.synthesis.rate} total={hits.synthesis.total} />
          </div>
          <p className="text-[10px] text-ink-400 mt-2">
            ※ 蓄積が増えるほど、あなたにとって最も精度が高い占術が浮かび上がる（個人キャリブレーション）。
          </p>
        </div>
      </div>
    </NumberedSection>
  );
}

function HitCell({ label, rate, total }: { label: string; rate: number; total: number }) {
  const pct = (rate * 100).toFixed(0);
  return (
    <div className="rounded-lg bg-white border border-ink-200 p-4 text-center">
      <div className="text-[10px] tracking-[0.3em] uppercase text-ink-500">{label}</div>
      <div className="font-display text-3xl text-gold-700 mt-1 tabular-nums">{total > 0 ? pct : "—"}</div>
      <div className="text-[10px] text-ink-400">{total > 0 ? `% / ${total}件` : "未記録"}</div>
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
