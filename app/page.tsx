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
import { drawCards, drawCardsSeeded, drawCardsFullSeeded, SPREAD_LABELS, type DrawnCard } from "@/lib/tarot";
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
  personalDayText,
  todayOneLiner,
  currentHourTiming,
  todayBestDirection,
  DAY_COLORS,
  dayColorOf,
  DAY_ITEMS,
  dayItemOf,
  todayKeyPerson,
  DAY_CAUTIONS,
  dayCautionsOf,
  DAY_FOODS,
  dayFoodOf,
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
  finalMessage,
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
  ASTRO_DEEP_TAURUS,
  ASTRO_DEEP_LEO_ASC,
  ASTRO_DEEP_MOON,
  ASTRO_HOUSES,
  ASTRO_TRANSIT_2026,
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
  ascendant,
  midheaven,
  signFromLongitude,
  fullChart,
  aspectBetween,
  ASPECT_LABEL,
  SOLAR_TERM_TEXT,
  solarTermText,
  MOON_PHASE_TEXT,
  moonPhaseText,
  type PlanetPosition,
  type FullChart,
} from "@/lib/astronomy";
import { dailyKyuseiStar, hourlyKyuseiStar } from "@/lib/kyusei";
import Link from "next/link";
import { MBTI_PROFILES, MBTI_DIVINATION_INTEGRATION } from "@/lib/mbti";
import { ESSENTIAL_CARDS } from "@/lib/essentialDigest";
// 値 (todayQuote 等) は QuoteBlock 内で dynamic import するためここでは型のみ
import type { Quote, QuoteCategory } from "@/lib/quotes";
import dynamic from "next/dynamic";
// OracleTab は Claude API 連携で 749 行と重い。Oracle タブ選択時のみロード
const OracleTab = dynamic(() => import("@/app/OracleTab").then((m) => ({ default: m.OracleTab })), {
  loading: () => (
    <div className="border border-current p-8 text-center opacity-60">
      <div className="editorial-mono text-xs">Loading Oracle ...</div>
    </div>
  ),
  ssr: false,
});
// synthesisDeep の 14 カード本文 + insights は数万字の重量データ。
// 基礎タブで実際に表示する瞬間まで dynamic import で遅延ロードする。
type SynthesisDeepModule = typeof import("@/lib/synthesisDeep");
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
    tarot: drawCardsFullSeeded(3, fullSeed ^ 0xa5a5a5a5),
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
  // 大運（10年周期）— 1984/05/02 = 丙申, 男+陽干甲 → 順行, 立運1歳
  const currentAge = ownerAge();
  const daiun = generateDaiun("戊辰", 1, true, 8, currentAge, "丙");

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
    return <div className="text-sm text-sand-500 py-20 text-center">読み込み中…</div>;
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
      <nav className="mt-10 flex gap-2 overflow-x-auto pb-2">
        <TabButton active={tab === "today"} onClick={() => setTab("today")} label="今日" sub="Today" count={9} />
        <TabButton active={tab === "basis"} onClick={() => setTab("basis")} label="基礎" sub="Basis" count={22} />
        <TabButton active={tab === "oracle"} onClick={() => setTab("oracle")} label="相談" sub="Oracle" count={1} />
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
                onNavigateBasis={(anchorId: string) => {
                  setTab("basis");
                  // タブ切替後の描画を待ってからスクロール
                  setTimeout(() => {
                    document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
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
    <section className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-5 sm:p-6">
      {/* 上段: prev / 中央表示 / next */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onPrev}
          disabled={prevDisabled}
          className="rounded-lg border border-copper-500/30 px-3 py-2 hover:border-copper-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
            {tag}
          </div>
          <div className="font-display text-2xl sm:text-3xl text-sand-50 mt-0.5">
            {selectedDate.getMonth() + 1}月 {selectedDate.getDate()}日
            <span className="text-sm text-sand-400 ml-2">（{dow}）</span>
          </div>
          <div className="text-xs text-sand-500 mt-0.5">
            {selectedDate.getFullYear()}年
          </div>
        </div>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-lg border border-copper-500/30 px-3 py-2 hover:border-copper-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
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
            ? "bg-kachi-fade text-sand-50 border-2 border-copper-500 shadow-lg"
            : isReal
            ? "bg-copper-500/10 border border-copper-400 text-sand-50"
            : "bg-midnight-800/50 backdrop-blur-sm border border-copper-500/20 text-sand-200 hover:border-copper-400";
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
                <div className="text-[8px] text-copper-300 font-medium">本日</div>
              )}
            </button>
          );
        })}
      </div>

      {/* 下段: 日付ピッカー & 本日に戻る */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-copper-500/20">
        <input
          type="date"
          value={dateStr}
          min={minStr}
          max={maxStr}
          onChange={(e) => onPick(e.target.value)}
          className="rounded-md border border-copper-500/30 px-3 py-1.5 text-sm focus:outline-none focus:border-copper-500"
        />
        {!isToday && (
          <button
            onClick={onJumpToday}
            className="rounded-md bg-kachi-fade text-sand-50 px-4 py-1.5 text-sm hover:bg-midnight-700 border border-copper-500"
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
    <section className="relative -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-8 sm:pb-10 border-b border-current overflow-hidden">
      {/* 上部チップ行 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6">
        <div className="editorial-chip text-[10px] sm:text-xs">
          <span>{date}</span>
        </div>
        <div className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">
          <span>Today's Reading</span>
          <span className="editorial-chip-num">(LP {lifePath})</span>
        </div>
      </div>

      {/* メガ・ディスプレイ・ヒーロー */}
      <div className="relative">
        {/* ネオブルータル装飾ステッカー (テーマが neobrutal の時のみ装飾効果が出る) */}
        <span className="nb-sticker nb-sticker-yellow hidden sm:inline-block absolute -top-2 right-32 z-0" style={{ transform: "rotate(8deg)" }}>
          DAILY READING
        </span>
        <span className="nb-sticker nb-sticker-cyan hidden lg:inline-block absolute top-16 right-2 z-0" style={{ transform: "rotate(-5deg)" }}>
          N° 143
        </span>

        <h1 className="relative z-[1] editorial-display text-[15vw] sm:text-[12vw] lg:text-[140px] uppercase break-words">
          OFF TRACK,
          <br />
          ON PURPOSE,
          <br />
          IN LIFE
        </h1>

        {/* サブヘッド */}
        <div className="mt-4 sm:mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
          <div className="editorial-display-jp text-2xl sm:text-5xl leading-tight">
            逸れても、道はある。<br />
            <span className="text-lg sm:text-4xl opacity-80">{greeting}、{OWNER.displayName}さん。</span>
          </div>
          <div className="editorial-mono text-[9px] sm:text-xs leading-relaxed sm:max-w-xs opacity-80">
            FOLLOW INTUITION,
            <br />
            REDEFINE YOUR ROAD
            <br />
            <span className="opacity-60">本日の天・地・命を読み解きます。</span>
          </div>
        </div>

        {/* 回転 EXPLORE バッジ (装飾・モバイルは小さく・見出しの背面) */}
        <div className="absolute top-0 right-0 sm:right-4 lg:right-12 w-14 h-14 sm:w-28 sm:h-28 pointer-events-none z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full editorial-spinner">
            <defs>
              <path id="circle-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text fontSize="11" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="2" fill="currentColor">
              <textPath href="#circle-path">EXPLORE · EXPLORE · EXPLORE · </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-yellow-400 flex items-center justify-center text-[7px] sm:text-[8px] font-bold">★</div>
          </div>
        </div>
      </div>

      {/* 今日の一言 */}
      <OneLinerBlock />

      {/* 今日の格言 */}
      <QuoteBlock />

      {/* バッジチップ群 (モバイル: 横スクロール / sm 以上: グリッド) */}
      <div className="mt-8 sm:mt-10 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto sm:overflow-visible">
        <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 min-w-max sm:min-w-0">
          <BadgeChip label="SUN ／ 太陽星座" value={zodiacName} />
          <BadgeChip label="STAR ／ 本命星" value={starName} />
          <BadgeChip label="DAY ／ 日主" value={dayMaster} />
          <BadgeChip label="LP ／ ライフパス" value={String(lifePath)} mono />
          <BadgeChip label="KUA ／ 本命卦" value={KUA_NAMES[kua]?.name ?? String(kua)} />
        </div>
      </div>
    </section>
  );
}

function OneLinerBlock() {
  // クライアントサイドで日替わりで生成
  const [data, setData] = useState<{ line: string; flavor: string | null; reading: string } | null>(null);
  useEffect(() => {
    setData(todayOneLiner(new Date()));
  }, []);
  if (!data) {
    return <div className="mt-10 h-32 border border-current opacity-40" />;
  }
  return (
    <div className="mt-8 sm:mt-10 border border-current p-4 sm:p-8 relative" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <span className="editorial-chip text-[10px] sm:text-xs">Today's One-Liner ／ 今日の一言</span>
        <span className="editorial-mono text-[9px] sm:text-[10px] opacity-60">{data.reading}</span>
      </div>
      <p className="editorial-display-jp text-xl sm:text-4xl lg:text-5xl" style={{ lineHeight: 1.35 }}>
        {data.line}
      </p>
      {data.flavor && (
        <p className="editorial-display-jp text-sm sm:text-2xl opacity-70 mt-2 sm:mt-3 leading-snug">
          ── {data.flavor}
        </p>
      )}
    </div>
  );
}

// 今日タブの末尾用 — 必読カードへの軽量導線
// (BasisTab の EssentialDigest が full データを使うのに対し、こちらは
//  メタデータのみで synthesisDeep を読み込まずに表示できる)
function EssentialDigestLight({ onNavigateBasis }: { onNavigateBasis?: (anchorId: string) => void }) {
  return (
    <section className="mt-12 border border-current p-5 sm:p-7" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">★ 必読 ／ Essential</span>
          <span className="editorial-mono text-[10px] opacity-60">今月読み返すべき {ESSENTIAL_CARDS.length} 枚</span>
        </div>
        <span className="editorial-mono text-[9px] opacity-50">基礎タブで全文を読む →</span>
      </div>
      <ul className="space-y-3">
        {ESSENTIAL_CARDS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onNavigateBasis?.(c.id)}
              className="block w-full text-left group"
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="editorial-mono text-[9px] opacity-50 tabular-nums">{c.category}</span>
                <div className="editorial-display-jp text-base sm:text-lg leading-snug group-hover:underline flex-1 min-w-0">
                  {c.title}
                </div>
              </div>
              <p className="text-xs sm:text-sm opacity-70 mt-1 leading-relaxed pl-4 border-l-2 border-current/40">
                {c.summary}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuoteBlock() {
  const [data, setData] = useState<Quote | null>(null);
  const [category, setCategory] = useState<QuoteCategory | "all">("all");
  // 256 件の格言ライブラリは初期バンドルから除外して、マウント後に dynamic import
  const quotesLib = useRef<typeof import("@/lib/quotes") | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/quotes").then((mod) => {
      if (cancelled) return;
      quotesLib.current = mod;
      setData(mod.todayQuote(new Date()));
    });
    return () => { cancelled = true; };
  }, []);

  const onCategoryChange = (c: QuoteCategory | "all") => {
    if (!quotesLib.current) return;
    setCategory(c);
    if (c === "all") {
      setData(quotesLib.current.todayQuote(new Date()));
    } else {
      const q = quotesLib.current.todayQuoteByCategory(c, new Date());
      if (q) setData(q);
    }
  };

  if (!data) return <div className="mt-6 h-32 border border-current opacity-40" />;

  const categories: (QuoteCategory | "all")[] = [
    "all", "経営者", "投資家", "思想家", "戦略家", "芸術家", "科学者", "政治家", "霊性",
  ];

  return (
    <div className="mt-6 sm:mt-8 border border-current p-4 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <span className="editorial-chip text-[10px] sm:text-xs">Quote of the Day ／ 今日の格言</span>
        <span className="editorial-mono text-[9px] sm:text-[10px] opacity-60">
          {data.category}{data.era ? " · " + data.era : ""}
        </span>
      </div>

      {/* カテゴリ切替 */}
      <div className="flex gap-1.5 mb-4 sm:mb-5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={`editorial-chip text-[10px] flex-shrink-0 ${category === c ? "editorial-chip-dark" : ""}`}
          >
            {c === "all" ? "ALL" : c}
          </button>
        ))}
      </div>

      {/* 格言本文 */}
      <blockquote className="editorial-display-jp text-lg sm:text-3xl lg:text-4xl leading-[1.3] sm:leading-[1.25] relative pl-4 sm:pl-6 border-l-2 border-current">
        {data.text}
      </blockquote>

      {/* 著者 */}
      <div className="mt-4 sm:mt-5 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <div className="editorial-display-jp text-base sm:text-xl">— {data.author}</div>
          {data.authorEn && (
            <div className="editorial-mono text-[10px] opacity-60 mt-0.5">{data.authorEn}</div>
          )}
        </div>
        {data.mbtiHint && (
          <span className="editorial-chip text-[10px]">
            <span className="editorial-chip-num">推定</span>
            <span>{data.mbtiHint}</span>
          </span>
        )}
      </div>

      {/* コンテキスト */}
      {data.context && (
        <p className="text-xs sm:text-sm mt-4 opacity-70 leading-relaxed border-t border-current/30 pt-3">
          {data.context}
        </p>
      )}
    </div>
  );
}

function BadgeChip({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-current px-3 py-2.5 sm:py-3 flex-shrink-0 min-w-[120px] sm:min-w-0" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="editorial-mono text-[9px] opacity-70 truncate">{label}</div>
      <div className={`editorial-display-jp text-lg sm:text-2xl mt-1 ${mono ? "tabular-nums" : ""}`}>
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
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`tab-btn px-3 sm:px-5 py-2 transition-all flex items-center gap-1.5 sm:gap-2 border border-current flex-shrink-0 ${
        active ? "tab-btn-active" : "hover:bg-black/5"
      }`}
    >
      <span className="editorial-mono text-[10px] sm:text-[11px] opacity-90">{sub}</span>
      {count !== undefined && (
        <span className="editorial-mono text-[9px] sm:text-[10px] opacity-70">({count})</span>
      )}
      <span className="editorial-display-jp text-sm sm:text-base">{label}</span>
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
  onNavigateBasis,
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
  onNavigateBasis?: (anchorId: string) => void;
}) {
  const lucky = LUCKY[sun.key];
  const py = PERSONAL_YEAR_TEXT[personalYear];
  const pdText = personalDayText(pDay, selectedDate);
  const dayColor = dayColorOf(pDay, selectedDate);
  const direction = todayBestDirection(pDay);
  const keyPerson = todayKeyPerson(pDay);
  const cautions = dayCautionsOf(pDay, selectedDate);
  const food = dayFoodOf(pDay, selectedDate);
  const sb = todayShadowBlessing(pDay, selectedDate);
  const dayItem = dayItemOf(pDay, selectedDate);
  const timing = currentHourTiming();

  // 選択日に基づく高精度データ
  const todayDP = todayDayPillar(selectedDate);
  const todayTB = todayTongbianForOwner(selectedDate);
  const hourlyChart = todayHourlyChart(selectedDate);
  const luckyHours = todayLuckyHours(selectedDate);
  const personalHex = todayPersonalHexagram(OWNER.birth, selectedDate);
  const synthesis = todaySynthesis(pDay, selectedDate);
  const familyAdvice = todayFamilyAdvice(pDay, selectedDate);

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
        <article className="rounded-2xl bg-midnight-800/40 border border-copper-500/20 p-5 text-sm text-sand-400 text-center">
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
        onNavigateBasis={onNavigateBasis}
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
        <div className="rounded-2xl bg-copper-500/10 border-2 border-copper-400 p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="font-display text-7xl sm:text-8xl text-copper-300 tabular-nums leading-none">
              {pDay}
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
                Personal Day Number
              </div>
              <div className="font-display text-2xl mt-1 text-sand-50">
                パーソナルデイ {pDay}
              </div>
              <div className="text-xs text-sand-300 mt-1">
                個人月 {pMonth} / 個人年 {personalYear}
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm sm:text-base text-sand-100 leading-loose">
            {pdText.energy}
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ListBox title="今日やるべき" items={pdText.do} variant="positive" />
            <ListBox title="今日避けるべき" items={pdText.avoid} variant="negative" />
          </div>
          <div className="mt-6 rounded-lg p-4 text-center" style={{ background: "var(--foreground)", color: "var(--background)" }}>
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">
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
          <article className="rounded-xl border-l-4 border-shu-500 bg-shu-500/12 p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-shu-700 mb-2">
              Shadow ／ 影
            </div>
            <p className="text-sm leading-relaxed text-sand-100">{sb.shadow}</p>
          </article>
          <article className="rounded-xl border-l-4 border-copper-500 bg-copper-500/10 p-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">
              Blessing ／ 祝福
            </div>
            <p className="text-sm leading-relaxed text-sand-100">{sb.blessing}</p>
          </article>
        </div>
      </NumberedSection>

      {/* ━━ 3. 本日の運勢スコア ━━ */}
      <NumberedSection num="参" label="Daily Fortune Score" title="本日の運勢スコア">
        <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ScoreBig label="総合" value={today.daily.overall} />
            <ScoreBig label="恋愛" value={today.daily.love} />
            <ScoreBig label="仕事" value={today.daily.work} />
            <ScoreBig label="金運" value={today.daily.money} />
          </div>
          <div className="mt-6 border-t border-copper-500/10 pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500 mb-2">
              Today's Message
            </div>
            <p className="font-display text-lg sm:text-xl text-sand-50 leading-relaxed">
              {today.daily.message}
            </p>
          </div>
        </div>
      </NumberedSection>

      {/* ━━ 4. ラッキー要素 ━━ */}
      <NumberedSection num="肆" label="Today's Lucky" title="今日のラッキー">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50 backdrop-blur-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">Color</div>
            <div className="flex items-center gap-4 mt-3">
              <div
                className="w-16 h-16 rounded-full border-2 border-copper-500/20 shrink-0"
                style={{ backgroundColor: dayColor.hex }}
              />
              <div>
                <div className="font-display text-2xl">{dayColor.color}</div>
                <p className="text-xs text-sand-400 mt-1">{dayColor.reason}</p>
              </div>
            </div>
          </article>
          <article className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50 backdrop-blur-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">Number</div>
            <div className="font-display text-5xl tabular-nums mt-2 text-sand-50">{lucky.number}</div>
            <div className="text-xs text-sand-400 mt-2">{sun.name}の守護数</div>
          </article>
          <article className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50 backdrop-blur-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">Item</div>
            <div className="font-display text-xl mt-2">{dayItem.item}</div>
            <p className="text-xs text-sand-400 mt-2 leading-relaxed">{dayItem.reason}</p>
          </article>
          <article className="rounded-xl border border-copper-500/20 p-6 bg-midnight-800/50 backdrop-blur-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">Food</div>
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
        <div className="rounded-xl border border-copper-500/20 bg-midnight-800/40 p-6">
          <div className="flex items-baseline gap-4">
            <div className="font-display text-4xl text-kachi-800">{timing.range}時</div>
            <div className="text-sm text-sand-300">
              <span className="font-display text-xl text-copper-300">{timing.branch}</span>の刻
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">エネルギー</div>
            <p className="text-sm mt-1 text-sand-100">{timing.energy}</p>
          </div>
          <div className="mt-3 border-t border-copper-500/20 pt-3">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">推奨される活動</div>
            <p className="text-sm mt-1 text-sand-100">{timing.recommend}</p>
          </div>
        </div>
      </NumberedSection>

      {/* ━━ 7. キーパーソン ━━ */}
      <NumberedSection num="漆" label="Key Person" title="今日のキーパーソン">
        <article className="rounded-xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/20 p-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
            今日大切にすべき関係
          </div>
          <div className="font-display text-2xl mt-2 text-sand-50">{keyPerson.who}</div>
          <p className="mt-3 text-sm text-sand-200 leading-relaxed">{keyPerson.why}</p>
        </article>
      </NumberedSection>

      {/* ━━ 8. 注意事項 ━━ */}
      <NumberedSection num="捌" label="Caution" title="今日特に気をつけること">
        <div className="rounded-xl border-l-4 border-shu-400 bg-midnight-800/50 backdrop-blur-sm p-6">
          <ul className="space-y-2">
            {cautions.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-sand-100">
                <span className="text-shu-500 font-bold">⚠</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </NumberedSection>

      {/* ━━ 9. 流年方位 ━━ */}
      <NumberedSection num="玖" label="Annual Direction" title={`${annual.year}年の年運（${annual.starName}）`}>
        <div className="rounded-xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 space-y-3 text-sm">
          <DangerLine label="歳破方位" value={annual.saiha} desc="引っ越し・大事業・転職を避けるべき方位" />
          <DangerLine label="五黄殺" value={annual.gokou} desc="自滅の方位、重要事項を持ち込まない" />
          <DangerLine label="暗剣殺" value={annual.anken} desc="他者からの災いを呼ぶ方位、慎重に" />
        </div>
      </NumberedSection>

      {/* ━━ 10. 今月のテーマ ━━ */}
      <NumberedSection num="拾" label="This Month" title="今月のテーマ">
        <div className="rounded-xl bg-midnight-800/50 backdrop-blur-sm border border-copper-500/20 p-6">
          <p className="font-display text-lg leading-relaxed text-sand-100">
            {lucky.monthlyTheme}
          </p>
        </div>
      </NumberedSection>

      {/* ━━ 11. 今年のパーソナルイヤー ━━ */}
      {py && (
        <NumberedSection num="拾壱" label="This Year" title={`${new Date().getFullYear()}年のテーマ`}>
          <article className="rounded-2xl border-2 border-copper-400 bg-copper-500/10 p-6 sm:p-8">
            <div className="flex gap-6 items-center">
              <div className="font-display text-6xl tabular-nums text-copper-300">{personalYear}</div>
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
                  Personal Year
                </div>
                <div className="font-display text-2xl mt-1">{py.title}</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-sand-100 leading-loose">{py.text}</p>
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
          className="text-xs px-4 py-2 rounded-md border border-copper-500/30 hover:border-current"
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
        <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
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
            <div className="mt-6 border-t-2 border-copper-500/30 pt-5">
              <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
                変爻のメッセージ
              </div>
              <ul className="space-y-2 text-sm">
                {today.iching.lines.map((l, i) => (
                  <li key={i} className="flex gap-3 bg-midnight-800/40 rounded-md p-3">
                    <span className="font-display text-base text-copper-300 w-14 shrink-0">
                      第{l.pos}爻
                    </span>
                    <span className="text-sand-100">{l.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </NumberedSection>

      {/* ━━ 末尾: 必読カードへの導線 (今日タブ → 基礎タブ) ━━ */}
      <EssentialDigestLight onNavigateBasis={onNavigateBasis} />
    </div>
  );
}

// ==========================================================================
// 基礎の占いタブ
// ==========================================================================

function BasisTab({ basis }: { basis: ReturnType<typeof basisData> }) {
  // synthesisDeep の 14 カードを mount 後に dynamic import
  const [deep, setDeep] = useState<SynthesisDeepModule | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("@/lib/synthesisDeep").then((mod) => { if (!cancelled) setDeep(mod); });
    return () => { cancelled = true; };
  }, []);

  // 目次 (TOC) データ — セクションと項目の構造
  const tocSections: TocSection[] = [
    {
      id: "core",
      label: "01 ／ コア",
      items: [
        { id: "patterns", num: "○", title: "パターン分析 (蓄積データ)" },
        { id: "hero", num: "○", title: "統合占断ヒーロー" },
        { id: "personality", num: "壱", title: "性格の核 (三層構造)" },
        { id: "mbti", num: "壱之弐", title: "MBTI ／ INFJ (提唱者)" },
      ],
    },
    {
      id: "natal",
      label: "02 ／ 命の基礎データ",
      items: [
        { id: "astro", num: "弐", title: "ネイタルチャート (西洋占星術)" },
        { id: "shichu", num: "参", title: "四柱推命 (命式)" },
        { id: "kyusei", num: "肆", title: "九星気学" },
        { id: "numerology", num: "伍", title: "数秘術 (フル)" },
        { id: "seimei", num: "陸", title: "姓名判断 (五格)" },
        { id: "birthcard", num: "漆", title: "タロット バースカード" },
        { id: "fengshui", num: "捌", title: "風水 (本命卦)" },
        { id: "daiun", num: "玖", title: "大運表 (10 年周期)" },
      ],
    },
    {
      id: "deep-shichu",
      label: "03 ／ 四柱推命の深掘り",
      items: [
        { id: "shichu-tongbian", num: "玖之壱", title: "命式の通変星の組合せ" },
        { id: "shichu-twelve", num: "玖之弐", title: "四柱十二運のリズム" },
        { id: "shichu-balance", num: "玖之参", title: "丙火の五行バランスと燃料管理" },
        { id: "shichu-daiun-transition", num: "玖之肆", title: "大運切替期 (41→51)" },
        { id: "shichu-shensha", num: "玖之伍", title: "神殺 (魁罡・天乙貴人 等)" },
      ],
    },
    {
      id: "deep-numerology",
      label: "04 ／ 数秘・バースカードの深掘り",
      items: [
        { id: "num-lp11", num: "伍之壱", title: "マスター数 11 の完全解説" },
        { id: "num-birthday2", num: "伍之弐", title: "誕生日数 2 の二重構造" },
        { id: "num-personal-cycle", num: "伍之参", title: "パーソナルイヤー 9 年周期" },
        { id: "num-birthcard-deep", num: "漆之壱", title: "正義 + 女教皇 の深層" },
        { id: "num-name", num: "陸之壱", title: "YOSHIDA SHUNSUKE 数秘" },
      ],
    },
    {
      id: "deep-astro",
      label: "05 ／ 西洋占星術の深掘り",
      items: [
        { id: "astro-taurus", num: "弐之壱", title: "牡牛座太陽 12° の深層" },
        { id: "astro-leo-asc", num: "弐之弐", title: "獅子座 ASC + 牡牛座 MC" },
        { id: "astro-moon", num: "弐之参", title: "月星座と感情処理" },
        { id: "astro-houses", num: "弐之肆", title: "重要 4 ハウスの活性" },
        { id: "astro-transit-2026", num: "弐之伍", title: "2026 年のトランジット" },
      ],
    },
    {
      id: "deep-fengshui",
      label: "06 ／ 風水・九星気学の深掘り",
      items: [
        { id: "fs-kua6", num: "捌之壱", title: "本命卦 乾 6 (西四命) 完全解説" },
        { id: "fs-room-by-room", num: "捌之弐", title: "23 階の部屋別実践" },
        { id: "ks-7red", num: "肆之壱", title: "七赤金星の完全解説" },
        { id: "ks-2026", num: "肆之弐", title: "2026 年流年方位" },
        { id: "fs-family", num: "捌之参", title: "家族 3 人の方位バランス" },
      ],
    },
    {
      id: "synthesis-character",
      label: "07 ／ 統合・性格と行動",
      items: [
        { id: "career", num: "拾", title: "仕事・天職" },
        { id: "communication", num: "拾壱", title: "コミュニケーションスタイル" },
        { id: "decision", num: "拾弐", title: "決断スタイル" },
        { id: "leadership", num: "拾参", title: "リーダーシップ" },
        { id: "conflict", num: "拾肆", title: "衝突パターン" },
      ],
    },
    {
      id: "synthesis-family",
      label: "08 ／ 関係と家族",
      items: [
        { id: "spouse", num: "拾伍", title: "妻との関係" },
        { id: "child", num: "拾陸", title: "子との関係" },
        { id: "parenting", num: "拾漆", title: "父としての深層" },
        { id: "family-care", num: "拾捌", title: "義母 (認知症) と家族" },
        { id: "parents", num: "拾玖", title: "両親との縁" },
        { id: "family-compat", num: "弐拾", title: "家族との相性スコア" },
        { id: "family-lineage", num: "弐拾之壱", title: "家系図と先祖の物語" },
      ],
    },
    {
      id: "synthesis-wealth-health",
      label: "09 ／ 財・健康・心",
      items: [
        { id: "wealth", num: "弐拾壱", title: "金運・財運の核" },
        { id: "money", num: "弐拾弐", title: "金銭心理" },
        { id: "health", num: "弐拾参", title: "健康・体質" },
        { id: "body", num: "弐拾肆", title: "体質と養生" },
        { id: "mental", num: "弐拾伍", title: "メンタルパターン" },
      ],
    },
    {
      id: "synthesis-life-soul",
      label: "10 ／ 人生と魂",
      items: [
        { id: "lifearc", num: "弐拾陸", title: "人生の三大時期" },
        { id: "midlife", num: "弐拾漆", title: "中年期の転換" },
        { id: "fengshui-home", num: "弐拾捌", title: "住まいの風水" },
        { id: "spiritual", num: "弐拾玖", title: "魂のテーマ" },
        { id: "practice", num: "参拾", title: "霊性の実践" },
        { id: "legacy", num: "参拾壱", title: "次世代に残すもの" },
        { id: "shadow", num: "参拾之壱", title: "影 (シャドウ) の統合" },
        { id: "role-society", num: "参拾之弐", title: "社会的役割" },
        { id: "infj-historical", num: "参拾之参", title: "同型 INFJ の歴史人物" },
        { id: "annual-2026", num: "参拾之肆", title: "2026 年運勢の深掘り" },
      ],
    },
    {
      id: "tools",
      label: "11 ／ ツール",
      items: [
        { id: "business-compat", num: "参拾弐", title: "ビジネス相性チェッカー" },
        { id: "final", num: "○", title: "最終メッセージ" },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {/* ━━ 目次 ━━ */}
      <BasisTOC sections={tocSections} />

      {/* ━━ ★必読カード一覧 (1 行サマリー) ━━ */}
      <EssentialDigest
        items={[
          { id: "annual-2026", card: deep?.ANNUAL_2026_DEEP },
          { id: "shichu-daiun-transition", card: deep?.SHICHU_DEEP_DAIUN_TRANSITION },
          { id: "shichu-balance", card: deep?.SHICHU_DEEP_FIVE_BALANCE },
          { id: "shadow", card: deep?.SHADOW_INTEGRATION },
        ]}
      />

      {/* ━━ パターン分析（蓄積データから） ━━ */}
      <div id="patterns" className="scroll-mt-20"><PatternsSection /></div>

      {/* ━━ 統合占断 ヒーロー ━━ */}
      <div id="hero" className="scroll-mt-20"><SynthesisHero /></div>

      {/* ━━ 統合: 性格の核 ━━ */}
      <SynthesisBlock id="personality" num="壱" card={PERSONALITY_CORE} />

      {/* ━━ MBTI セクション ━━ */}
      <div id="mbti" className="scroll-mt-20"><MbtiSection /></div>

      <SectionDivider title="命の基礎データ ／ Natal Data" />

      {/* ━━ ネイタル + 太陽星座詳細 ━━ */}
      <NumberedSection id="astro" num="弐" label="Astrology" title="ネイタルチャート（西洋占星術）">
        <NatalChartSection sun={basis.sun} />
      </NumberedSection>

      {/* ━━ 四柱推命 ━━ */}
      <NumberedSection id="shichu" num="参" label="Shichu Suimei" title="四柱推命（命式）">
        <ShichuFullSection fp={basis.fp} fpExtras={basis.fpExtras} />
      </NumberedSection>

      {/* ━━ 九星気学 ━━ */}
      <NumberedSection id="kyusei" num="肆" label="Nine Star Ki" title="九星気学">
        <KyuseiSection />
      </NumberedSection>

      {/* ━━ 数秘術 ━━ */}
      <NumberedSection id="numerology" num="伍" label="Numerology" title="数秘術（フル）">
        <NumerologyFullSection numero={basis.numero} />
      </NumberedSection>

      {/* ━━ 姓名判断 ━━ */}
      <NumberedSection id="seimei" num="陸" label="Seimei Handan" title="姓名判断（五格）">
        <SeimeiSection kakusu={basis.kakusu} />
      </NumberedSection>

      {/* ━━ バースカード ━━ */}
      <NumberedSection id="birthcard" num="漆" label="Birth Card" title="タロット バースカード">
        <BirthCardSection bc={basis.bc} />
      </NumberedSection>

      {/* ━━ 風水 ━━ */}
      <NumberedSection id="fengshui" num="捌" label="Feng Shui" title="風水（本命卦）">
        <FengShuiFullSection ratings={basis.ratings} />
      </NumberedSection>

      {/* ━━ 大運（10年周期） ━━ */}
      <NumberedSection id="daiun" num="玖" label="Daiun / Decade Luck" title="大運表 — 10年周期のライフサイクル">
        <DaiunTable periods={basis.daiun} currentAge={basis.currentAge} />
      </NumberedSection>

      {/* ━━━━ 占術深掘りシリーズ (5 エージェント研究) ━━━━ */}
      <SectionDivider title="四柱推命の深掘り ／ Shichu Deep Dive" />

      {/* エージェント 1 (四柱推命) */}
      <DeepCardSlot id="shichu-tongbian" num="玖之壱" label="Shichu Deep" title={deep?.SHICHU_DEEP_TONGBIAN?.title ?? ""} card={deep?.SHICHU_DEEP_TONGBIAN} />
      <DeepCardSlot id="shichu-twelve" num="玖之弐" label="Shichu Deep" title={deep?.SHICHU_DEEP_TWELVE_STAGES?.title ?? ""} card={deep?.SHICHU_DEEP_TWELVE_STAGES} />
      <DeepCardSlot id="shichu-balance" num="玖之参" label="Shichu Deep" title={deep?.SHICHU_DEEP_FIVE_BALANCE?.title ?? ""} card={deep?.SHICHU_DEEP_FIVE_BALANCE} />
      <DeepCardSlot id="shichu-daiun-transition" num="玖之肆" label="Shichu Deep" title={deep?.SHICHU_DEEP_DAIUN_TRANSITION?.title ?? ""} card={deep?.SHICHU_DEEP_DAIUN_TRANSITION} />
      <DeepCardSlot id="shichu-shensha" num="玖之伍" label="Shichu Deep" title={deep?.SHICHU_DEEP_SHENSHA?.title ?? ""} card={deep?.SHICHU_DEEP_SHENSHA} />

      <SectionDivider title="数秘・バースカードの深掘り ／ Numerology Deep" />

      {/* エージェント 2 (数秘・バースカード) */}
      <DeepCardSlot id="num-lp11" num="伍之壱" label="Numerology Deep" title={deep?.NUMEROLOGY_DEEP_LIFEPATH11?.title ?? ""} card={deep?.NUMEROLOGY_DEEP_LIFEPATH11} />
      <DeepCardSlot id="num-birthday2" num="伍之弐" label="Numerology Deep" title={deep?.NUMEROLOGY_DEEP_BIRTHDAY2?.title ?? ""} card={deep?.NUMEROLOGY_DEEP_BIRTHDAY2} />
      <DeepCardSlot id="num-personal-cycle" num="伍之参" label="Numerology Deep" title={deep?.NUMEROLOGY_PERSONAL_CYCLE?.title ?? ""} card={deep?.NUMEROLOGY_PERSONAL_CYCLE} />
      <DeepCardSlot id="num-birthcard-deep" num="漆之壱" label="Birthcard Deep" title={deep?.BIRTHCARD_DEEP_JUSTICE_PRIESTESS?.title ?? ""} card={deep?.BIRTHCARD_DEEP_JUSTICE_PRIESTESS} />
      <DeepCardSlot id="num-name" num="陸之壱" label="Numerology Deep" title={deep?.NUMEROLOGY_NAME?.title ?? ""} card={deep?.NUMEROLOGY_NAME} />

      <SectionDivider title="西洋占星術の深掘り ／ Astrology Deep" />

      {/* エージェント 3 (西洋占星術) */}
      <DeepCardSlot id="astro-taurus" num="弐之壱" label="Astrology Deep" title={ASTRO_DEEP_TAURUS.title} card={ASTRO_DEEP_TAURUS} />
      <DeepCardSlot id="astro-leo-asc" num="弐之弐" label="Astrology Deep" title={ASTRO_DEEP_LEO_ASC.title} card={ASTRO_DEEP_LEO_ASC} />
      <DeepCardSlot id="astro-moon" num="弐之参" label="Astrology Deep" title={ASTRO_DEEP_MOON.title} card={ASTRO_DEEP_MOON} />
      <DeepCardSlot id="astro-houses" num="弐之肆" label="Astrology Deep" title={ASTRO_HOUSES.title} card={ASTRO_HOUSES} />
      <DeepCardSlot id="astro-transit-2026" num="弐之伍" label="Astrology Deep" title={ASTRO_TRANSIT_2026.title} card={ASTRO_TRANSIT_2026} />

      <SectionDivider title="風水・九星気学の深掘り ／ Feng Shui Deep" />

      {/* エージェント 4 (風水・九星) */}
      <DeepCardSlot id="fs-kua6" num="捌之壱" label="Fengshui Deep" title={deep?.FENGSHUI_KUA6_DEEP?.title ?? ""} card={deep?.FENGSHUI_KUA6_DEEP} />
      <DeepCardSlot id="fs-room-by-room" num="捌之弐" label="Fengshui Deep" title={deep?.FENGSHUI_ROOM_BY_ROOM?.title ?? ""} card={deep?.FENGSHUI_ROOM_BY_ROOM} />
      <DeepCardSlot id="ks-7red" num="肆之壱" label="Kyusei Deep" title={deep?.KYUSEI_7RED_DEEP?.title ?? ""} card={deep?.KYUSEI_7RED_DEEP} />
      <DeepCardSlot id="ks-2026" num="肆之弐" label="Kyusei Deep" title={deep?.KYUSEI_2026_ANNUAL?.title ?? ""} card={deep?.KYUSEI_2026_ANNUAL} />
      <DeepCardSlot id="fs-family" num="捌之参" label="Fengshui Deep" title={deep?.FAMILY_FENGSHUI?.title ?? ""} card={deep?.FAMILY_FENGSHUI} />

      <SectionDivider title="統合占断・性格と行動 ／ Character & Action" />

      <SynthesisBlock id="career" num="拾" card={CAREER_DEEP} />
      <SynthesisBlock id="communication" num="拾壱" card={COMMUNICATION_STYLE} />
      <SynthesisBlock id="decision" num="拾弐" card={DECISION_STYLE} />
      <SynthesisBlock id="leadership" num="拾参" card={LEADERSHIP_STYLE} />
      <SynthesisBlock id="conflict" num="拾肆" card={CONFLICT_PATTERN} />

      <SectionDivider title="統合占断・関係と家族 ／ Family & Relations" />

      <SynthesisBlock id="spouse" num="拾伍" card={relationshipSpouse(spouseAge(), spouseAgeDiff())} />
      <SynthesisBlock id="child" num="拾陸" card={relationshipChild(childAge(), childGradeJP())} />
      <SynthesisBlock id="parenting" num="拾漆" card={parentingStyleDeep(childAge(), childGradeJP())} />
      <SynthesisBlock id="family-care" num="拾捌" card={FAMILY_CARE} />
      <SynthesisBlock id="parents" num="拾玖" card={PARENT_RELATIONSHIPS} />

      {/* ━━ 家族との相性スコア ━━ */}
      <NumberedSection id="family-compat" num="弐拾" label="Family Compatibility" title="家族との相性スコア">
        <CompatSection
          spouseCompat={basis.spouseCompat}
          childCompat={basis.childCompat}
        />
      </NumberedSection>

      {/* エージェント 5 (家系) */}
      <DeepCardSlot id="family-lineage" num="弐拾之壱" label="Synthesis Deep" title={deep?.FAMILY_LINEAGE?.title ?? ""} card={deep?.FAMILY_LINEAGE} />

      <SectionDivider title="統合占断・財・健康・心 ／ Wealth, Health, Mind" />

      <SynthesisBlock id="wealth" num="弐拾壱" card={WEALTH_CORE} />
      <SynthesisBlock id="money" num="弐拾弐" card={MONEY_PSYCHOLOGY} />
      <SynthesisBlock id="health" num="弐拾参" card={HEALTH_CORE} />
      <SynthesisBlock id="body" num="弐拾肆" card={BODY_CONSTITUTION} />
      <SynthesisBlock id="mental" num="弐拾伍" card={MENTAL_PATTERNS} />

      <SectionDivider title="統合占断・人生と魂 ／ Life & Soul" />

      <SynthesisBlock id="lifearc" num="弐拾陸" card={lifeArc(basis.currentAge)} />
      <SynthesisBlock id="midlife" num="弐拾漆" card={midlifeTransition(basis.currentAge)} />
      <SynthesisBlock id="fengshui-home" num="弐拾捌" card={FENGSHUI_HOME} />
      <SynthesisBlock id="spiritual" num="弐拾玖" card={SPIRITUAL_THEME} />
      <SynthesisBlock id="practice" num="参拾" card={SPIRITUAL_PRACTICE} />
      <SynthesisBlock id="legacy" num="参拾壱" card={legacyQuestion(basis.currentAge)} />

      {/* エージェント 5 (新規統合カード) */}
      <DeepCardSlot id="shadow" num="参拾之壱" label="Synthesis Deep" title={deep?.SHADOW_INTEGRATION?.title ?? ""} card={deep?.SHADOW_INTEGRATION} />
      <DeepCardSlot id="role-society" num="参拾之弐" label="Synthesis Deep" title={deep?.ROLE_FOR_SOCIETY?.title ?? ""} card={deep?.ROLE_FOR_SOCIETY} />
      <DeepCardSlot id="infj-historical" num="参拾之参" label="Synthesis Deep" title={deep?.INFJ_HISTORICAL_FIGURES?.title ?? ""} card={deep?.INFJ_HISTORICAL_FIGURES} />
      <DeepCardSlot id="annual-2026" num="参拾之肆" label="Synthesis Deep" title={deep?.ANNUAL_2026_DEEP?.title ?? ""} card={deep?.ANNUAL_2026_DEEP} />

      {/* ━━ ビジネス相性チェッカー ━━ */}
      <SectionDivider title="ツール ／ Tools" />
      <NumberedSection id="business-compat" num="参拾弐" label="Business Compatibility" title="任意の人物とのビジネス相性">
        <BusinessCompatChecker />
      </NumberedSection>

      {/* ━━ 最終メッセージ ━━ */}
      <div id="final" className="scroll-mt-20"><FinalMessage age={basis.currentAge} /></div>
    </div>
  );
}

// ==========================================================================
// Hero & Synthesis Components
// ==========================================================================

function SynthesisHero() {
  return (
    <section className="relative border border-current p-6 sm:p-10" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="editorial-chip">Synthesis</span>
        <span className="editorial-chip editorial-chip-dark">統合占断</span>
        <span className="editorial-chip">
          <span className="editorial-chip-num">N°</span>
          <span>001</span>
        </span>
      </div>
      <h2 className="editorial-display-jp text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
        {HERO_SYNTHESIS.headline}
      </h2>
      <p className="editorial-mono text-[11px] sm:text-xs mt-4 opacity-80 leading-relaxed">
        {HERO_SYNTHESIS.subline}
      </p>
      <div className="mt-8 space-y-5 max-w-4xl">
        {HERO_SYNTHESIS.paragraphs.map((p, i) => (
          <p key={i} className="text-sm sm:text-[15px] leading-loose">
            <span className="editorial-mono text-[10px] mr-2 opacity-50">
              ({String(i + 1).padStart(2, "0")})
            </span>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function SynthesisBlock({ num, card, id, label = "Synthesis" }: { num: string; card: SynthesisCard; id?: string; label?: string }) {
  const isExpired = card.validUntil ? new Date() > new Date(card.validUntil + "T23:59:59+09:00") : false;
  return (
    <NumberedSection num={num} label={label} title={card.title} id={id}>
      <article className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 sm:p-8">
        {(card.priority === "essential" || card.validUntil) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {card.priority === "essential" && (
              <span className="editorial-chip editorial-chip-dark text-[10px]">★ 必読</span>
            )}
            {card.validUntil && !isExpired && (
              <span className="editorial-chip text-[10px]">流年情報 ／ {card.validUntil} まで有効</span>
            )}
            {isExpired && (
              <span className="text-[11px] px-3 py-1 rounded-full border border-red-500/60 text-red-400 bg-red-500/10 font-bold">
                ⚠ 要更新 — この流年情報は {card.validUntil} で期限切れ。最新の年運に更新が必要です
              </span>
            )}
          </div>
        )}
        <p className="text-sm sm:text-[15px] leading-loose text-sand-100">{card.body}</p>
        {card.insights && card.insights.length > 0 && (
          <div className="mt-6 border-t border-copper-500/30 pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
              Key Insights
            </div>
            <ul className="space-y-2">
              {card.insights.map((it, i) => (
                <li
                  key={i}
                  className="text-sm text-sand-200 leading-relaxed pl-4 border-l-2 border-copper-400"
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

function FinalMessage({ age }: { age: number }) {
  const msg = finalMessage(age);
  return (
    <section className="rounded-2xl bg-midnight-fade text-sand-50 p-8 sm:p-12 relative overflow-hidden shadow-copper-glow ring-1 ring-copper-500/20">
      <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-copper-500/15 blur-3xl" />
      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">
          Final Message
        </div>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl leading-tight tracking-wide">
          {msg.title}
        </h2>
        <p className="mt-6 text-sm sm:text-[15px] leading-loose text-sand-100">
          {msg.body}
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

// ★必読カードの 1 行サマリー一覧 — 10 万字の基礎タブの「入口」
function EssentialDigest({ items }: { items: { id: string; card: SynthesisCard | undefined }[] }) {
  // synthesisDeep が dynamic import 中の間、card は undefined
  const ready = items.filter((it): it is { id: string; card: SynthesisCard } => Boolean(it.card));
  if (ready.length === 0) {
    return (
      <section className="border border-current p-5 sm:p-7 opacity-50" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-mono text-xs">Loading essential cards ...</div>
      </section>
    );
  }
  return (
    <section className="border border-current p-5 sm:p-7" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">★ 必読 ／ Essential</span>
        <span className="editorial-mono text-[10px] opacity-60">毎月読み返す価値のある {ready.length} 枚</span>
      </div>
      <ul className="space-y-3">
        {ready.map(({ id, card }) => (
          <li key={id}>
            <a href={`#${id}`} className="block group">
              <div className="editorial-display-jp text-base sm:text-lg leading-snug group-hover:underline">
                {card.title}
              </div>
              {card.summary && (
                <p className="text-xs sm:text-sm opacity-70 mt-1 leading-relaxed pl-4 border-l-2 border-current/40">
                  {card.summary}
                </p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 深掘りカードのプレースホルダー or 実カード表示
// card が渡されたら SynthesisBlock として表示、なければ「準備中」表示
function DeepCardSlot({
  id,
  num,
  label,
  title,
  card,
}: {
  id: string;
  num: string;
  label: string;
  title: string;
  card?: SynthesisCard;
}) {
  if (card) {
    return <SynthesisBlock id={id} num={num} card={card} label={label} />;
  }
  return (
    <NumberedSection id={id} num={num} label={label} title={title}>
      <article className="border border-current p-6 sm:p-8 opacity-60" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <p className="text-sm leading-loose italic">
          ── このカードはサブエージェントが現在リサーチ中です。完了後ここに 800-1500 字の本文 + 10-16 個の insights が表示されます。
        </p>
      </article>
    </NumberedSection>
  );
}

function MbtiSection() {
  const ownerType = OWNER.natal.mbti;
  const profile = MBTI_PROFILES[ownerType];
  const integration = MBTI_DIVINATION_INTEGRATION[ownerType];
  return (
    <NumberedSection num="壱之弐" label="MBTI · 16Types" title={`人格の型 — ${ownerType} (${profile.name})`}>
      <article className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 sm:p-8 space-y-5">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <div className="font-display text-2xl">{ownerType} <span className="text-copper-200">— {profile.name}</span></div>
            <p className="text-sm text-sand-300 italic mt-1">"{profile.nickname}"</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-sand-400">人口の {profile.populationRate}</div>
            <div className="text-[10px] text-sand-500 tracking-wider mt-0.5">{profile.group} · 認知機能: {profile.cognitive.dominant}-{profile.cognitive.auxiliary}-{profile.cognitive.tertiary}-{profile.cognitive.inferior}</div>
          </div>
        </div>

        <p className="text-sm sm:text-[15px] leading-loose text-sand-100">{profile.description}</p>

        <div className="border-t border-copper-500/30 pt-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">命式 × 数秘 × タロット との響き合い</div>
          <ul className="space-y-2">
            {integration.map((line, i) => (
              <li key={i} className="text-sm text-sand-200 leading-relaxed pl-4 border-l-2 border-copper-400">{line}</li>
            ))}
          </ul>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl border border-green-500/25 p-4 bg-green-950/15">
            <div className="text-[10px] tracking-[0.3em] uppercase text-green-300 mb-2">強み</div>
            <ul className="space-y-1">
              {profile.strengths.slice(0, 5).map((s) => (
                <li key={s} className="text-xs text-sand-200">・{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-orange-500/25 p-4 bg-orange-950/15">
            <div className="text-[10px] tracking-[0.3em] uppercase text-orange-300 mb-2">成長の方向性</div>
            <p className="text-xs text-sand-200 leading-relaxed">{profile.growthPath}</p>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/mbti" className="inline-block text-xs text-copper-300 hover:text-copper-200 transition-colors tracking-wider">
            → 16タイプを探索する (MBTI 専用ページへ)
          </Link>
        </div>
      </article>
    </NumberedSection>
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
  id,
}: {
  num: string;
  label: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <header className="flex items-end justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="font-display text-2xl text-copper-300 w-10 text-center">
            {num}
          </div>
          <div className="border-l-2 border-copper-500 pl-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">
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

// 基礎タブ目次 (TOC) — 折り畳み式
type TocSection = { id: string; label: string; items: { id: string; num: string; title: string }[] };

function BasisTOC({ sections }: { sections: TocSection[] }) {
  const [open, setOpen] = useState(false);
  const total = sections.reduce((a, s) => a + s.items.length, 0);
  return (
    <div className="border border-current" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="editorial-chip text-[10px] sm:text-xs">Index ／ 目次</span>
          <span className="editorial-mono text-[10px] opacity-60">{sections.length} sections · {total} items</span>
        </div>
        <span className="editorial-mono text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-current px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {sections.map((s) => (
            <div key={s.id}>
              <div className="editorial-mono text-[10px] opacity-70 mb-1.5 border-b border-current/30 pb-1">
                {s.label}
              </div>
              <ul className="space-y-1">
                {s.items.map((it) => (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      onClick={() => setOpen(false)}
                      className="flex gap-2 sm:gap-3 text-sm hover:opacity-100 opacity-80 py-0.5"
                    >
                      <span className="editorial-mono text-[10px] opacity-50 tabular-nums w-8 sm:w-10 flex-shrink-0 text-right">
                        {it.num}
                      </span>
                      <span className="editorial-display-jp leading-snug">{it.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 各セクション本体
// ==========================================================================

function NatalChartSection({ sun }: { sun: Zodiac }) {
  return (
    <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="flex items-start gap-5">
        <div className="text-6xl">{sun.symbol}</div>
        <div className="flex-1">
          <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">{sun.en}</div>
          <div className="font-display text-3xl mt-1">{sun.name}</div>
          <div className="text-xs text-sand-400 mt-1">
            {sun.element}・{sun.quality}宮 / 守護星: {sun.ruler}
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm sm:text-[15px] leading-loose text-sand-100">
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
      <div className="mt-6 pt-5 border-t border-copper-500/20">
        <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500 mb-3">
          ネイタル要素
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Kv k="月星座" v={`牡牛座 ${OWNER.natal.moonDegree}°`} />
          <Kv k="アセンダント" v={`乙女座 ${OWNER.natal.ascDegree}° (獅子座カスプ)`} />
          <Kv k="MC" v={`牡牛座 ${OWNER.natal.mcDegree}°`} />
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
    <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <PillarCell label="時柱" pillar={fp.hour} tongbian={fpExtras.tongbian.hour} twelve={fpExtras.twelve.hour} />
        <PillarCell label="日柱" pillar={fp.day} twelve={fpExtras.twelve.day} highlight />
        <PillarCell label="月柱" pillar={fp.month} tongbian={fpExtras.tongbian.month} twelve={fpExtras.twelve.month} />
        <PillarCell label="年柱" pillar={fp.year} tongbian={fpExtras.tongbian.year} twelve={fpExtras.twelve.year} />
      </div>

      <div className="mt-6 pt-5 border-t-2 border-copper-500/30">
        <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">日主</div>
        <div className="font-display text-3xl mt-1">{fp.dayMaster.stem} ・ {fp.dayMaster.element}</div>
        <p className="text-sm text-sand-100 mt-3 leading-relaxed">{DAY_MASTER_TEXT[fp.dayMaster.element]}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-copper-500/20">
        <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500 mb-3">通変星</div>
        <ul className="space-y-2 text-sm">
          <TbLine label="年柱" star={fpExtras.tongbian.year} />
          <TbLine label="月柱" star={fpExtras.tongbian.month} />
          {fpExtras.tongbian.hour && <TbLine label="時柱" star={fpExtras.tongbian.hour} />}
        </ul>
      </div>

      <div className="mt-6 pt-5 border-t border-copper-500/20">
        <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500 mb-3">十二運</div>
        <ul className="space-y-2 text-sm">
          <TwLine label="日柱" stage={fpExtras.twelve.day} />
          <TwLine label="月柱" stage={fpExtras.twelve.month} />
          <TwLine label="年柱" stage={fpExtras.twelve.year} />
          {fpExtras.twelve.hour && <TwLine label="時柱" stage={fpExtras.twelve.hour} />}
        </ul>
      </div>

      <div className="mt-6 pt-5 border-t border-copper-500/20">
        <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500 mb-3">五行バランス</div>
        <div className="space-y-2">
          {(["木", "火", "土", "金", "水"] as const).map((e) => {
            const v = fpExtras.five[e];
            const pct = total ? (v / total) * 100 : 0;
            const isHigh = v >= 3;
            return (
              <div key={e} className="flex items-center gap-3 text-sm">
                <div className="w-8 font-display text-lg text-sand-200">{e}</div>
                <div className="flex-1 h-3 border border-current rounded">
                  <div
                    className={`h-full rounded bg-current ${isHigh ? "" : "opacity-40"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 tabular-nums text-right font-display text-lg">{v}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-sand-400 mt-3">※ 金色のバーは命式に多く含まれる主要五行</p>
      </div>
    </div>
  );
}

function TbLine({ label, star }: { label: string; star: keyof typeof TONGBIAN_TEXT }) {
  return (
    <li className="flex flex-col sm:flex-row sm:gap-3 border-l-2 border-copper-500/30 pl-3">
      <div className="flex items-center gap-2">
        <span className="text-sand-400 text-xs">{label}</span>
        <span className="font-display text-base text-kachi-800">{star}</span>
      </div>
      <span className="text-sand-200 text-xs sm:text-sm leading-relaxed">{TONGBIAN_TEXT[star]}</span>
    </li>
  );
}

function TwLine({ label, stage }: { label: string; stage: keyof typeof TWELVE_TEXT }) {
  return (
    <li className="flex flex-col sm:flex-row sm:gap-3 border-l-2 border-kachi-400 pl-3">
      <div className="flex items-center gap-2">
        <span className="text-sand-400 text-xs">{label}</span>
        <span className="font-display text-base text-kachi-800">{stage}</span>
      </div>
      <span className="text-sand-200 text-xs sm:text-sm leading-relaxed">{TWELVE_TEXT[stage]}</span>
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
    <article className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">{role}</div>
      <div className="font-display text-3xl mt-1">{STAR_NAME[star]}</div>
      <div className="text-xs text-sand-400 mt-1">
        五行: {STAR_ELEMENT[star]} / 定位方位: {STAR_DIRECTION[star]}
      </div>
      <p className="text-sm text-sand-100 mt-4 leading-relaxed">{deep.trait}</p>
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
      <article className="rounded-2xl border-2 border-copper-400 bg-copper-500/10 p-6 sm:p-8">
        <div className="flex gap-6 items-center">
          <div className="font-display text-7xl tabular-nums text-copper-300">{numero.life}</div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
              ライフパスナンバー
            </div>
            <div className="text-sm text-sand-300">人生全体の傾向（マスターナンバー）</div>
            {lifeMeaning && (
              <>
                <div className="font-display text-2xl mt-2">{lifeMeaning.title}</div>
                <p className="text-sm text-sand-100 mt-1 leading-relaxed">{lifeMeaning.text}</p>
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
    <article className="rounded-xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">{label}</div>
      <div className="font-display text-3xl tabular-nums mt-1">{value}</div>
      {meaning && <div className="text-xs text-sand-400 mt-1">{meaning.title}</div>}
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
    <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="text-sm text-sand-300 mb-5 font-display">
        {OWNER.nameSei}（{OWNER.nameSeiKakusu.join("+")}）/ {OWNER.nameMei}（
        {OWNER.nameMeiKakusu.join("+")}）
      </div>
      <div className="space-y-5">
        {items.map(({ key, n }) => {
          const lab = KAKUSU_LABEL[key];
          const k = kichikyo(n);
          const deep = NUMBER_DEEP[n];
          return (
            <div key={key} className="border-b border-copper-500/10 pb-5 last:border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="font-display text-lg w-12">{lab.label}</div>
                <div className="font-display text-3xl tabular-nums w-14 text-copper-300">{n}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  k === "大吉" ? "bg-copper-500 text-white" :
                  k === "吉" ? "bg-copper-500/15 text-copper-200 border border-copper-400" :
                  k === "半吉" ? "border border-copper-500/30 text-sand-400" :
                  k === "凶" ? "bg-shu-100 text-shu-700" :
                  "bg-shu-500 text-white"
                }`}>{k}</span>
                <div className="text-sand-400 text-xs">{lab.sub}</div>
              </div>
              {deep && (
                <div className="ml-3">
                  <p className="text-sm text-sand-100 leading-relaxed">{deep.meaning}</p>
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
    <article className="rounded-2xl border-2 border-copper-500/30 bg-midnight-700/60 backdrop-blur-sm p-6">
      <div className="flex gap-5 items-start">
        <div className="aspect-[2/3] w-20 rounded-lg bg-kachi-fade text-copper-300 flex items-center justify-center text-3xl font-display shrink-0 shadow-md">
          {romanize(card.num)}
        </div>
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">{role}</div>
          <div className="font-display text-2xl mt-1">
            {card.name}
          </div>
          <div className="text-[10px] tracking-widest text-sand-500 mt-0.5">{card.en}</div>
          <p className="text-sm text-sand-100 mt-3 leading-relaxed">{deep.theme}</p>
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
    <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="flex items-center gap-5">
        <div className="font-display text-6xl tabular-nums text-copper-300">{kua}</div>
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">本命卦</div>
          <div className="font-display text-2xl">
            {KUA_NAMES[kua].name}（{KUA_NAMES[kua].group}）
          </div>
          <div className="text-xs text-sand-400 mt-1 leading-relaxed">
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
        <div className="aspect-square rounded-lg bg-kachi-fade text-copper-300 flex items-center justify-center text-xs font-display">中央</div>
        <DirCell rating={find(ratings, "東")} dir="東" />
        <DirCell rating={find(ratings, "西南")} dir="西南" />
        <DirCell rating={find(ratings, "南")} dir="南" />
        <DirCell rating={find(ratings, "東南")} dir="東南" />
      </div>
      <div className="mt-8 space-y-2">
        {ratings.map((r) => (
          <div key={r.dir} className="flex items-start gap-3 text-sm border-b border-copper-500/10 pb-3 last:border-0">
            <div className="w-12 text-sand-400 font-display">{r.dir}</div>
            <div className={`w-14 font-medium text-xs px-2 py-0.5 rounded-full text-center ${
              r.kind === "吉" ? "bg-copper-500/15 text-copper-200" : "bg-shu-100 text-shu-700"
            }`}>
              {r.rating}
            </div>
            <div className="flex-1 text-sand-200">{RATING_TEXT[r.rating]}</div>
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
    <article className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6">
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">{title}</div>
      <div className="flex items-baseline gap-3 mt-1">
        <div className="font-display text-2xl">{c.zodiac.partner.name}</div>
        <div className="text-sm text-sand-400">/ {c.star.name}</div>
      </div>
      <div className="mt-3">
        <Stars value={c.overallScore} large />
        <span className="text-xs text-sand-400 ml-2">総合 {c.overallScore}/5</span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="border-l-2 border-copper-400 pl-3">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">星座 ({c.zodiac.compat.score}/5)</div>
          <p className="text-sm text-sand-200 mt-1">{c.zodiac.compat.text}</p>
        </div>
        <div className="border-l-2 border-kachi-500 pl-3">
          <div className="text-[10px] tracking-[0.3em] uppercase text-kachi-700">九星・五行 ({c.star.relation.score}/5)</div>
          <p className="text-sm text-sand-200 mt-1">
            {c.star.relation.relation} — {c.star.relation.text}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm font-display text-sand-50 border-t border-copper-500/10 pt-4 italic">
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
      <span className="text-copper-500">{"★".repeat(value)}</span>
      <span className="opacity-25">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function ScoreBig({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center bg-midnight-800/40 rounded-lg border border-copper-500/20 p-4">
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400">{label}</div>
      <div className="mt-2"><Stars value={value} large /></div>
      <div className="text-xs text-sand-500 mt-1">{value}/5</div>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-500">{k}</div>
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
    <div className={`rounded-lg border p-4 ${isWarn ? "border-shu-200 bg-shu-500/10" : "border-copper-500/20 bg-copper-500/8"}`}>
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-2 ${isWarn ? "text-shu-700" : "text-copper-300"}`}>
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className={`text-xs px-2.5 py-1 rounded-full ${
              isWarn
                ? "border border-shu-300 text-shu-700 bg-midnight-800/50 backdrop-blur-sm"
                : "border border-copper-500/30 text-copper-200 bg-midnight-800/50 backdrop-blur-sm"
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
    ? "border-2 border-copper-400 bg-copper-500/10"
    : variant === "warn"
    ? "border border-shu-200 bg-shu-500/10"
    : "border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm";
  const titleCls = highlight ? "text-copper-300" : variant === "warn" ? "text-shu-700" : "text-sand-500";
  return (
    <div className={`rounded-lg p-4 ${cls}`}>
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-1 ${titleCls}`}>
        {title}
      </div>
      <p className="text-sm text-sand-100 leading-relaxed">{text}</p>
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
    <div className={`rounded-lg p-4 ${isPositive ? "bg-copper-500/10 border border-copper-500/30" : "bg-shu-500/12 border border-shu-200"}`}>
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-2 ${isPositive ? "text-copper-300" : "text-shu-700"}`}>
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="text-sm text-sand-100 flex gap-2">
            <span className={isPositive ? "text-copper-400" : "text-shu-500"}>
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
      ? "bg-copper-500/10 border-2 border-copper-500"
      : variant === "good"
      ? "bg-midnight-800/50 backdrop-blur-sm border border-copper-500/30"
      : "bg-shu-500/12 border border-shu-300";
  const valueCls =
    variant === "warn" ? "text-shu-700" : "text-copper-300";
  return (
    <article className={`rounded-xl p-5 ${cls}`}>
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400">{label}</div>
      <div className={`font-display text-4xl mt-2 ${valueCls}`}>{value}</div>
      <p className="text-xs text-sand-200 mt-3 leading-relaxed">{desc}</p>
    </article>
  );
}

function DangerLine({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-copper-500/10 last:border-0">
      <div className="text-[10px] tracking-[0.3em] uppercase text-shu-700 w-20 shrink-0 pt-1">
        {label}
      </div>
      <div className="font-display text-lg w-16 shrink-0 text-shu-700">{value}</div>
      <div className="text-sm text-sand-200 flex-1">{desc}</div>
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
    <div className={`rounded-lg p-4 ${highlight ? "bg-copper-500/10 border-2 border-copper-500" : "bg-midnight-800/40 border border-copper-500/20"}`}>
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400">{label}</div>
      {pillar ? (
        <>
          {tongbian && <div className="text-[10px] text-copper-300 mt-1 font-medium">{tongbian}</div>}
          <div className="font-display text-3xl mt-1">{pillar.stem}</div>
          <div className="text-xs text-sand-400">{pillar.stemElement}</div>
          <div className="font-display text-3xl mt-2">{pillar.branch}</div>
          <div className="text-xs text-sand-400">{pillar.branchElement}</div>
          {twelve && <div className="text-[10px] text-kachi-700 mt-2">{twelve}</div>}
        </>
      ) : (
        <div className="text-sm text-sand-500 mt-3">—</div>
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
        rating.kind === "吉" ? "bg-copper-500/10 border-2 border-copper-400" : "bg-shu-500/12 border border-shu-200"
      }`}
    >
      <div className="text-sand-400 text-[10px]">{dir}</div>
      <div className={`font-medium font-display text-sm mt-1 ${rating.kind === "吉" ? "text-copper-300" : "text-shu-700"}`}>
        {rating.rating}
      </div>
    </div>
  );
}

function TarotCard({ card, position }: { card: DrawnCard; position: string }) {
  return (
    <article className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-5 flex flex-col">
      <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">{position}</div>
      <div
        className={`mt-3 aspect-[2/3] rounded-lg bg-kachi-fade text-copper-300 flex items-center justify-center text-5xl font-display shadow-md ${
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
        <div className="text-[10px] tracking-widest text-sand-500">{card.en}</div>
        <p className="mt-3 text-sm text-sand-100 leading-relaxed">
          {card.isReversed ? card.reversedDetail : card.uprightDetail}
        </p>
        <div className="mt-3 space-y-2">
          <div className="text-xs">
            <span className="text-copper-300 font-medium">恋愛: </span>
            <span className="text-sand-200">
              {card.isReversed ? card.loveReversed : card.loveUpright}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-copper-300 font-medium">仕事: </span>
            <span className="text-sand-200">
              {card.isReversed ? card.workReversed : card.workUpright}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-sand-50 italic border-t-2 border-copper-500/30 pt-3">
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
      <div className={`text-[10px] tracking-[0.3em] uppercase ${isChanged ? "text-kachi-700" : "text-copper-300"}`}>
        {label}
      </div>
      <div className="font-display text-3xl mt-1">
        {hex.num}. {hex.name}
      </div>
      <div className="text-xs text-sand-400">{hex.reading}</div>
      <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6 bg-midnight-800/40 rounded-lg p-4">
        {[...yaos].reverse().map((y, i) => (
          <div key={i}>{yaoSymbol(y)}</div>
        ))}
      </div>
      <div className="text-xs text-sand-400 mt-2 text-right pr-6">
        上卦: {upper} / 下卦: {lower}
      </div>
      <p className="mt-4 text-sm text-sand-100 leading-relaxed">{hex.meaning}</p>
      {hex.image && (
        <div className="mt-3 text-xs">
          <span className="text-copper-300 font-medium">象: </span>
          <span className="text-sand-200">{hex.image}</span>
        </div>
      )}
      {hex.judgment && (
        <div className="mt-2 text-xs">
          <span className="text-copper-300 font-medium">卦辞: </span>
          <span className="text-sand-200">{hex.judgment}</span>
        </div>
      )}
      {hex.advice && (
        <div className="mt-3 rounded-lg bg-copper-500/10 border border-copper-500/30 p-3 text-sm">
          <span className="text-copper-300 font-medium text-xs">助言: </span>
          <span className="text-sand-100">{hex.advice}</span>
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
      <article className="rounded-2xl bg-midnight-800/40 border border-copper-500/20 p-5 text-sm text-sand-400">
        天気の取得に失敗しました（オフライン or APIブロック中）。
      </article>
    );
  }
  if (!weather) {
    return (
      <article className="rounded-2xl bg-midnight-800/40 border border-copper-500/20 p-5 text-sm text-sand-500">
        大阪の天気を取得中…
      </article>
    );
  }
  return (
    <article className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
            Osaka Weather ／ 大阪の天気
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-5xl">{weather.icon}</span>
            <div>
              <div className="font-display text-4xl tabular-nums text-sand-50">
                {Math.round(weather.tempC)}
                <span className="text-2xl text-sand-400">℃</span>
              </div>
              <div className="text-xs text-sand-300 mt-0.5">{weather.desc}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs text-sand-300 text-right">
          <div>
            体感 <span className="font-display text-base text-sand-100">{Math.round(weather.feelsLikeC)}℃</span>
          </div>
          <div>
            湿度 <span className="font-display text-base text-sand-100">{weather.humidity}%</span>
          </div>
          <div>
            風速 <span className="font-display text-base text-sand-100">{Math.round(weather.windKmh)}km/h</span>
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
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-copper-500/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">
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
                <div className="text-[10px] tracking-[0.3em] text-copper-300 uppercase">Match</div>
                <div className="font-display text-3xl text-copper-300">{top.score}</div>
                <div className="text-[10px] text-sand-300">score</div>
              </div>
            </div>

            <p className="mt-5 text-sm sm:text-[15px] leading-loose text-sand-100">
              {top.perfume.description}
            </p>

            <div className="mt-5">
              <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">Notes</div>
              <div className="flex flex-wrap gap-1.5">
                {top.perfume.notes.map((n) => (
                  <span
                    key={n}
                    className="text-xs px-2.5 py-1 rounded-full border border-copper-500/40 text-gold-200"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {top.reasons.length > 0 && (
              <div className="mt-5 border-t border-copper-500/30 pt-4">
                <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">
                  なぜ今日この一本か
                </div>
                <ul className="space-y-1">
                  {top.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-sand-200 flex gap-2">
                      <span className="text-copper-400">◆</span>
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
          <article className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
                  Alternative ／ もう一本の候補
                </div>
                <div className="text-[10px] tracking-widest uppercase text-sand-400 mt-2">
                  {sub.perfume.brand}
                </div>
                <h4 className="font-display text-2xl mt-0.5 text-sand-50">
                  {sub.perfume.name}
                </h4>
                <div className="text-xs text-sand-400">{sub.perfume.family}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] tracking-[0.3em] text-copper-300 uppercase">Match</div>
                <div className="font-display text-2xl text-copper-300">{sub.score}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-sand-200 leading-relaxed">
              {sub.perfume.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {sub.perfume.notes.map((n) => (
                <span
                  key={n}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-copper-500/30 text-copper-200 bg-midnight-800/50 backdrop-blur-sm"
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
    <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="text-sm text-sand-300 mb-5">
        現在 <span className="font-display text-2xl text-copper-300">{currentAge}</span> 歳。
        立運1歳から始まる10年周期の流れ。
      </div>
      <div className="space-y-3">
        {periods.map((p) => (
          <DaiunRow key={p.index} period={p} />
        ))}
      </div>
      <p className="mt-5 text-xs text-sand-400 leading-relaxed">
        ※ 大運は四柱推命の核心理論。月柱を起点に10年ごとに干支が進み、各期の通変星が
        その10年の主要テーマを決めます。「現在」マークの期に最も注目してください。
      </p>
    </div>
  );
}

function DaiunRow({ period }: { period: DaiunPeriod }) {
  const cls = period.isCurrent
    ? "bg-copper-500/10 border-2 border-copper-500 shadow"
    : "bg-midnight-800/40 border border-copper-500/20";
  return (
    <article className={`rounded-xl p-4 sm:p-5 ${cls}`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <div className="font-display text-2xl text-sand-50">
            {period.startAge}-{period.endAge}歳
          </div>
          <div className="font-display text-3xl text-copper-300">
            {period.ganzhi}
          </div>
          {period.isCurrent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-copper-500 text-white font-medium">
              現在
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-sand-400">
          <span>{period.stemElement}・{period.branchElement}</span>
          <span className="font-display text-base text-kachi-700">{period.stemTongbian}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-sand-200 leading-relaxed">{period.theme}</p>
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
    <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6 sm:p-8">
      <p className="text-sm text-sand-300 mb-4">
        相手の生年月日と性別を入力すると、しゅんすけさんとの<strong>ビジネス相性</strong>を
        <strong>多軸スコア・役割分担・詳細分析</strong>で表示します。
      </p>

      <form onSubmit={onSubmit} className="rounded-xl bg-midnight-800/40 border border-copper-500/20 p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] tracking-[0.3em] uppercase text-sand-400">氏名（任意）</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中太郎"
            className="block mt-1 w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm focus:outline-none focus:border-copper-500"
          />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.3em] uppercase text-sand-400">生年月日 *</span>
          <input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            required
            className="block mt-1 w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm focus:outline-none focus:border-copper-500"
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-[10px] tracking-[0.3em] uppercase text-sand-400 mb-2">性別 *</legend>
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
          className="sm:col-span-2 mt-2 rounded-md bg-kachi-fade text-sand-50 font-display text-lg py-3 hover:bg-midnight-700 border border-copper-500"
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
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-copper-500/15 blur-3xl" />
        <div className="relative">
          <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">
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
      <article className="rounded-2xl border-2 border-copper-400 bg-copper-500/10 p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300 mb-3">
          Scores ／ 6軸スコア
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="font-display text-7xl text-copper-300 tabular-nums leading-none">
            {result.scores.overall}
          </div>
          <div>
            <div className="text-sm text-sand-300">総合相性</div>
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
      <article className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
          Role Distribution ／ 役割分担の最適配置
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-kachi-fade text-sand-50 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">あなた（しゅんすけ）</div>
            <div className="font-display text-lg mt-2">{result.roles.you}</div>
          </div>
          <div className="rounded-lg bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">{result.partner.name}</div>
            <div className="font-display text-lg mt-2">{result.roles.partner}</div>
            <p className="text-xs text-sand-300 mt-2">{result.partnerComplement}</p>
          </div>
        </div>
      </article>

      {/* 強み と リスク */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.strengths.length > 0 && (
          <article className="rounded-2xl border border-copper-500/30 bg-copper-500/8 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
              Strengths ／ 強み
            </div>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-sm text-sand-100 flex gap-2">
                  <span className="text-copper-400">◎</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
        {result.risks.length > 0 && (
          <article className="rounded-2xl border border-shu-300 bg-shu-500/12 p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-shu-700 mb-3">
              Risks ／ 注意点
            </div>
            <ul className="space-y-2">
              {result.risks.map((s, i) => (
                <li key={i} className="text-sm text-sand-100 flex gap-2">
                  <span className="text-shu-500">⚠</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>

      {/* 詳細分析 */}
      <article className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 sm:p-8">
        <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
          Detailed Analysis ／ 詳細分析
        </div>
        <div className="text-sm sm:text-[15px] text-sand-100 leading-loose whitespace-pre-line">
          {result.detailedAnalysis}
        </div>
      </article>

      {/* 関係指標の詳細 */}
      <article className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400 mb-3">
          Relationship Indicators ／ 関係指標
        </div>
        <div className="space-y-3 text-sm">
          <div className="border-l-2 border-copper-400 pl-3">
            <div className="text-xs text-sand-400">星座（牡牛座×{result.data.sunSign.name}）</div>
            <p className="text-sand-200 mt-1">{result.zodiacCompat.text}</p>
          </div>
          <div className="border-l-2 border-kachi-500 pl-3">
            <div className="text-xs text-sand-400">九星五行（七赤金×{result.data.starName}）</div>
            <p className="text-sand-200 mt-1">{result.starCompat.relation} — {result.starCompat.text}</p>
          </div>
          <div className="border-l-2 border-shu-400 pl-3">
            <div className="text-xs text-sand-400">通変星（戊→{result.data.dayMaster}）</div>
            <p className="text-sand-200 mt-1"><span className="font-display text-base">{result.tongbian}</span> の関係</p>
          </div>
          <div className="border-l-2 border-copper-500/30 pl-3">
            <div className="text-xs text-sand-400">年支の縁（子年×{result.data.yearBranch}年）</div>
            <p className="text-sand-200 mt-1"><span className="font-display text-base">{result.branchInter.type}</span> — {result.branchInter.text}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

function ResultBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-copper-500/30 bg-midnight-700/60 backdrop-blur px-3 py-2.5">
      <div className="text-[9px] tracking-[0.3em] uppercase text-copper-300/80">{label}</div>
      <div className="mt-1 font-display text-base text-sand-50">{value}</div>
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-midnight-800/50 backdrop-blur-sm border border-copper-500/30 p-3 text-center">
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400">{label}</div>
      <div className="font-display text-3xl text-copper-300 mt-1 tabular-nums">{value}</div>
      <div className="text-[10px] text-sand-500">/ 5</div>
    </div>
  );
}

// ==========================================================================
// 本日の統合シンセシス ヒーロー
// ==========================================================================

// 今日の状態 → 基礎タブの関連深掘りカードへの文脈リンク表
const TONGBIAN_BASIS_LINKS: Record<string, { anchor: string; label: string }[]> = {
  比肩: [{ anchor: "shichu-tongbian", label: "命式の比肩 (月柱) を深く知る" }],
  劫財: [{ anchor: "shichu-tongbian", label: "命式の劫財 (時柱) を深く知る" }],
  食神: [{ anchor: "shichu-balance", label: "土から金へ — 表現の五行を知る" }],
  傷官: [{ anchor: "shichu-balance", label: "傷官の鋭さと丙火の五行バランス" }],
  偏財: [{ anchor: "wealth", label: "金運・財運の核を読み返す" }],
  正財: [{ anchor: "shichu-daiun-transition", label: "現在の正財大運 (癸酉) の全体像" }],
  偏官: [{ anchor: "shichu-daiun-transition", label: "51 歳から始まる偏官大運の予習" }],
  正官: [{ anchor: "role-society", label: "公の役割 — 社会的使命を読み返す" }],
  偏印: [{ anchor: "num-lp11", label: "マスター 11 の直感の使い方" }],
  印綬: [{ anchor: "parents", label: "印 = 母性と学び。両親との縁を読む" }],
};

function TodaySynthesisHero({
  synthesis,
  dayPillar,
  tongbian,
  onNavigateBasis,
}: {
  synthesis: TodaySynthesis;
  dayPillar: { stem: string; branch: string; ganzhi: string };
  tongbian: { star: string; text: string };
  onNavigateBasis?: (anchorId: string) => void;
}) {
  return (
    <section className="rounded-2xl bg-midnight-fade text-sand-50 p-8 sm:p-12 relative overflow-hidden shadow-copper-glow ring-1 ring-copper-500/20">
      <div className="absolute -top-12 right-0 w-96 h-96 rounded-full bg-copper-500/15 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-shu-500/10 blur-3xl" />

      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">
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
          <div className="text-copper-400">×</div>
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-sand-300">日主 戊 から見て</div>
            <div className="font-display text-3xl sm:text-4xl text-copper-300">
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
              className="text-xs px-3 py-1.5 rounded-full border border-copper-500/40 text-gold-200 bg-kachi-700/40"
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
        <div className="mt-8 rounded-lg bg-kachi-800/60 backdrop-blur border border-copper-500/40 p-5 text-center">
          <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300 mb-2">
            Today's Affirmation
          </div>
          <div className="font-display text-xl sm:text-2xl italic text-gold-200">
            「{synthesis.affirmation}」
          </div>
        </div>

        {/* 今日の通変星 → 基礎タブの関連カードへ */}
        {onNavigateBasis && (TONGBIAN_BASIS_LINKS[tongbian.star] ?? []).length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
              深く知る ／ Deep Dive
            </span>
            {(TONGBIAN_BASIS_LINKS[tongbian.star] ?? []).map((link) => (
              <button
                key={link.anchor}
                type="button"
                onClick={() => onNavigateBasis(link.anchor)}
                className="text-xs px-3 py-1.5 rounded-full border border-copper-500/40 text-gold-200 hover:bg-copper-500/15 transition-colors"
              >
                → {link.label}
              </button>
            ))}
          </div>
        )}
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
    <NumberedSection num="零・八" label="12 Hour Chart" title="本日の十二時辰盤（日主丙から見た吉凶）">
      <div className="rounded-2xl border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-5 sm:p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {chart.map((h) => {
            const isLucky = luckyBranches.has(h.branch);
            const ratingColor =
              h.rating === "大吉" ? "bg-copper-500/10 border-2 border-copper-500"
              : h.rating === "吉" ? "bg-copper-500/10 border border-copper-400"
              : h.rating === "中吉" ? "bg-midnight-800/40 border border-copper-500/20"
              : "bg-shu-500/12 border border-shu-300";
            return (
              <div
                key={h.branch}
                className={`rounded-lg p-3 ${ratingColor} ${isLucky ? "ring-2 ring-gold-500" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl text-sand-50">{h.branch}</span>
                  <span className="text-[10px] text-sand-400 tabular-nums">{h.range}</span>
                </div>
                <div className="text-[10px] text-sand-400 mt-1">{h.ganzhi}</div>
                <div className={`mt-2 text-xs font-medium ${
                  h.rating === "大吉" || h.rating === "吉" ? "text-copper-300"
                  : h.rating === "中吉" ? "text-sand-200"
                  : "text-shu-700"
                }`}>
                  {h.rating}
                </div>
                <div className="text-[10px] text-sand-400 mt-0.5">{h.star}</div>
              </div>
            );
          })}
        </div>

        {/* 本日のラッキータイム強調 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {luckyHours.map((h, i) => (
            <article
              key={h.branch}
              className="rounded-xl bg-copper-500/10 border-2 border-copper-500 p-5"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
                Lucky Hour {i + 1}
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-display text-3xl text-copper-300">{h.branch}</span>
                <span className="font-display text-2xl text-sand-50">{h.range}時</span>
              </div>
              <div className="text-xs text-sand-400 mt-1">
                {h.ganzhi} ／ 通変星「{h.star}」（{h.rating}）
              </div>
              <p className="text-sm text-sand-100 mt-3">{h.desc}</p>
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
      <div className="rounded-2xl border-2 border-copper-500/30 bg-midnight-700/60 backdrop-blur-sm p-6 sm:p-8">
        <div className="text-xs text-sand-400 mb-4">
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
          <div className="mt-6 border-t-2 border-copper-500/30 pt-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
              本日の変爻メッセージ
            </div>
            <ul className="space-y-2 text-sm">
              {hex.lines.map((l, i) => (
                <li key={i} className="flex gap-3 bg-midnight-800/40 rounded-md p-3">
                  <span className="font-display text-base text-copper-300 w-14 shrink-0">
                    第{l.pos}爻
                  </span>
                  <span className="text-sand-100">{l.text}</span>
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
  advice: {
    spouse: { headline: string; actions: string[] };
    child: { headline: string; actions: string[] };
  };
}) {
  return (
    <NumberedSection num="壱・〇" label="Family Today" title="家族への今日の関わり方">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article className="rounded-xl bg-copper-500/10 border border-copper-400 p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">
            妻への接し方
          </div>
          <p className="font-display text-base text-sand-50 leading-relaxed mb-3">
            {advice.spouse.headline}
          </p>
          <ul className="space-y-2">
            {advice.spouse.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-sand-100 leading-relaxed">
                <span className="text-copper-300 shrink-0">◆</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/20 p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400 mb-2">
            子への接し方
          </div>
          <p className="font-display text-base text-sand-50 leading-relaxed mb-3">
            {advice.child.headline}
          </p>
          <ul className="space-y-2">
            {advice.child.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-sand-100 leading-relaxed">
                <span className="text-sand-400 shrink-0">◆</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <p className="mt-3 text-[10px] text-sand-500 text-center">
        ※ 各日6つのアクション候補から、日付シードで3つを選定（同じ日は同じ提案、別日は変化）
      </p>
    </NumberedSection>
  );
}

// ==========================================================================
// Oracle タブ（Claude API 個人相談）
// ==========================================================================

function CosmicPanel({ date }: { date: Date }) {
  const sunSign = useMemo(() => accurateSunSign(date), [date]);
  const moonSign = useMemo(() => accurateMoonSign(date), [date]);
  const phase = useMemo(() => moonPhase(date), [date]);
  const term = useMemo(() => currentSolarTerm(date), [date]);
  // 大阪基準のフルチャート（惑星位置・ASC/MC）
  const chart = useMemo(() => fullChart(date, OWNER.birthplace.lng, OWNER.birthplace.lat), [date]);
  const dailyStar = useMemo(() => dailyKyuseiStar(date), [date]);
  const hourlyStar = useMemo(() => hourlyKyuseiStar(date), [date]);

  return (
    <section className="rounded-2xl bg-midnight-fade text-sand-50 p-6 sm:p-8 relative overflow-hidden shadow-copper-glow ring-1 ring-copper-500/20">
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-copper-500/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-shu-500/10 blur-3xl" />
      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">
          Cosmic ／ 当日の天文
        </div>

        {/* 上段: 太陽・月・月相・節気 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <CosmicCell label="太陽" big={sunSign.name} sub={`${sunSign.degree.toFixed(1)}°`} />
          <CosmicCell label="月" big={moonSign.name} sub={`${moonSign.degree.toFixed(1)}°`} />
          <CosmicCell label="月相" big={`${phase.emoji} ${phase.name}`}
            sub={`${phase.age.toFixed(1)}日齢 / ${(phase.illumination * 100).toFixed(0)}%`} />
          <CosmicCell label="節気" big={term.term}
            sub={`${term.daysSinceStart}日目 → ${term.nextTerm}まで${term.daysUntilNext}日`} />
        </div>

        {/* 中段: 惑星 (水星・金星・火星・木星・土星) */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <PlanetCell planet={chart.mercury} />
          <PlanetCell planet={chart.venus} />
          <PlanetCell planet={chart.mars} />
          <PlanetCell planet={chart.jupiter} />
          <PlanetCell planet={chart.saturn} />
        </div>

        {/* 下段: ASC/MC + 日盤・時盤九星 */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CosmicCell label="ASC (大阪基準)" big={chart.asc.sign} sub={`${chart.asc.degree.toFixed(1)}°`} />
          <CosmicCell label="MC (天頂)" big={chart.mc.sign} sub={`${chart.mc.degree.toFixed(1)}°`} />
          <CosmicCell label="日盤九星" big={`${dailyStar}白/黒/碧...`.replace(/\d+.*/, ["", "一白", "二黒", "三碧", "四緑", "五黄", "六白", "七赤", "八白", "九紫"][dailyStar] || "")}
            sub="本日の中央星" />
          <CosmicCell label="時盤九星" big={["", "一白", "二黒", "三碧", "四緑", "五黄", "六白", "七赤", "八白", "九紫"][hourlyStar] || ""}
            sub="現時刻の中央星" />
        </div>

        {/* 月相と節気の解説 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="rounded-lg bg-midnight-700/60 backdrop-blur border border-copper-500/30 p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">月相のテーマ</div>
            <p className="text-sm text-sand-100 mt-2 leading-relaxed">{moonPhaseText(phase.name, date)}</p>
          </div>
          <div className="rounded-lg bg-midnight-700/60 backdrop-blur border border-copper-500/30 p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">節気「{term.term}」のテーマ</div>
            <p className="text-sm text-sand-100 mt-2 leading-relaxed">{solarTermText(term.term, date)}</p>
          </div>
        </div>

        <p className="mt-5 text-[11px] text-sand-300/80 text-center">
          Meeus天文計算 ／ 太陽 {sunLongitude(date).toFixed(2)}° / 月 {moonLongitude(date).toFixed(2)}° / ASC/MC は大阪 (34.69°N, 135.54°E) 基準
        </p>
      </div>
    </section>
  );
}

function PlanetCell({ planet }: { planet: PlanetPosition }) {
  return (
    <div className="rounded-lg border border-copper-500/30 bg-midnight-700/60 backdrop-blur px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <div className="text-[9px] tracking-[0.3em] uppercase text-copper-300/80">{planet.name}</div>
        {planet.retrograde && (
          <span className="text-[9px] text-shu-300" title="逆行">℞</span>
        )}
      </div>
      <div className="mt-1 font-display text-sm text-sand-50">{planet.sign}</div>
      <div className="text-[10px] text-sand-300 tabular-nums">
        {planet.degreeInSign.toFixed(1)}° / {planet.distance.toFixed(2)} AU
      </div>
    </div>
  );
}

function CosmicCell({ label, big, sub }: { label: string; big: string; sub: string }) {
  return (
    <div className="rounded-lg border border-copper-500/30 bg-midnight-700/60 backdrop-blur px-3 py-2.5">
      <div className="text-[9px] tracking-[0.3em] uppercase text-copper-300/80">{label}</div>
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
        <div className="text-xs text-sand-400 text-right">
          <div>📊 累計 {total} 日</div>
          <div>🔥 連続 {streak} 日</div>
        </div>
      }
    >
      <div className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 space-y-5">
        <p className="text-xs text-sand-300 leading-relaxed">
          記録を続けるほど、あなた個人のパターンが見えてきます。基礎タブの「パターン分析」で集計結果を見られます。
        </p>

        {/* ムード */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">気分（Mood）</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => update({ mood: v })}
                className={`flex-1 rounded-lg border py-3 transition-all ${
                  entry.mood === v
                    ? "bg-copper-500/10 border-copper-500 border-2 shadow"
                    : "bg-midnight-800/50 backdrop-blur-sm border-copper-500/20 hover:border-copper-400"
                }`}
              >
                <div className="font-display text-2xl">{["😞", "🙁", "😐", "🙂", "😄"][v - 1]}</div>
                <div className="text-[10px] text-sand-400 mt-1">{v}</div>
              </button>
            ))}
          </div>
          {entry.mood && (
            <p className="text-xs text-sand-400 mt-2">→ {moodLabels[entry.mood]}</p>
          )}
        </div>

        {/* エネルギー */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">エネルギー</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => update({ energy: v })}
                className={`flex-1 rounded-lg border py-3 transition-all ${
                  entry.energy === v
                    ? "bg-copper-500/10 border-copper-500 border-2 shadow"
                    : "bg-midnight-800/50 backdrop-blur-sm border-copper-500/20 hover:border-copper-400"
                }`}
              >
                <div className="font-display text-lg">{"⚡".repeat(v)}</div>
                <div className="text-[10px] text-sand-400 mt-1">{v}</div>
              </button>
            ))}
          </div>
          {entry.energy && (
            <p className="text-xs text-sand-400 mt-2">→ {energyLabels[entry.energy]}</p>
          )}
        </div>

        {/* 占断的中フラグ */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">
            占断は当たった？（後で振り返って評価）
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["tarot", "iching", "daily", "synthesis"] as const).map((t) => {
              const label = t === "tarot" ? "タロット" : t === "iching" ? "易経" : t === "daily" ? "本日運勢" : "シンセシス";
              const cur = entry.forecastHits?.[t];
              return (
                <div key={t} className="rounded-lg border border-copper-500/20 bg-midnight-800/50 backdrop-blur-sm p-3">
                  <div className="text-[10px] text-sand-400 mb-2">{label}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setHit(t, "hit")}
                      className={`flex-1 rounded text-xs py-1 ${cur === "hit" ? "bg-copper-500 text-white" : "border border-copper-500/20 hover:bg-copper-500/10"}`}
                    >
                      ◎
                    </button>
                    <button
                      onClick={() => setHit(t, "miss")}
                      className={`flex-1 rounded text-xs py-1 ${cur === "miss" ? "bg-shu-500 text-white" : "border border-copper-500/20 hover:bg-shu-500/12"}`}
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
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">使用した香水</div>
          <select
            value={entry.perfumeUsed || ""}
            onChange={(e) => update({ perfumeUsed: e.target.value || undefined })}
            className="w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm text-sm focus:outline-none focus:border-copper-500"
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
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-2">今日のメモ</div>
          <textarea
            value={entry.notes || ""}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="出来事・気づき・誰と会ったか・何を感じたか…"
            rows={3}
            className="w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm text-sm focus:outline-none focus:border-copper-500"
          />
        </div>

        {savedAt && (
          <p className="text-[10px] text-sand-500 text-right">自動保存 ✓ {savedAt}</p>
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
        <article className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-sand-200">
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
      <div className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap gap-3 items-baseline">
          <div className="font-display text-4xl text-copper-300">{entries.length}</div>
          <div className="text-sm text-sand-200">日分の記録 / 連続 <span className="font-display text-xl text-copper-300">{streak}</span> 日</div>
        </div>

        {/* パーソナルデイ別の平均ムード */}
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
            パーソナルデイ別の気分傾向
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pd) => {
              const stat = byPDay[pd];
              if (stat.count === 0) {
                return (
                  <div key={pd} className="flex items-center gap-3 text-sm">
                    <div className="w-6 font-display text-lg text-sand-500">{pd}</div>
                    <div className="flex-1 text-xs text-sand-600">未記録</div>
                  </div>
                );
              }
              const moodPct = (stat.avgMood / 5) * 100;
              return (
                <div key={pd} className="flex items-center gap-3 text-sm">
                  <div className="w-6 font-display text-lg text-copper-300">{pd}</div>
                  <div className="flex-1 h-3 bg-midnight-700 rounded">
                    <div className="h-3 bg-copper-500 rounded" style={{ width: `${moodPct}%` }} />
                  </div>
                  <div className="w-12 text-right tabular-nums text-xs">{stat.avgMood.toFixed(1)}</div>
                  <div className="w-12 text-right text-[10px] text-sand-400">{stat.count}日</div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-sand-500 mt-2">
            ※ 平均気分 5/5 が最も高い。記録が増えるほど、自分にとって最良/最弱のパーソナルデイがわかる。
          </p>
        </div>

        {/* 占断別の的中率 */}
        <div className="border-t border-copper-500/30 pt-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
            占断タイプ別の的中率
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HitCell label="タロット" rate={hits.tarot.rate} total={hits.tarot.total} />
            <HitCell label="易経" rate={hits.iching.rate} total={hits.iching.total} />
            <HitCell label="本日運勢" rate={hits.daily.rate} total={hits.daily.total} />
            <HitCell label="シンセシス" rate={hits.synthesis.rate} total={hits.synthesis.total} />
          </div>
          <p className="text-[10px] text-sand-500 mt-2">
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
    <div className="rounded-lg bg-midnight-800/50 backdrop-blur-sm border border-copper-500/20 p-4 text-center">
      <div className="text-[10px] tracking-[0.3em] uppercase text-sand-400">{label}</div>
      <div className="font-display text-3xl text-copper-300 mt-1 tabular-nums">{total > 0 ? pct : "—"}</div>
      <div className="text-[10px] text-sand-500">{total > 0 ? `% / ${total}件` : "未記録"}</div>
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
