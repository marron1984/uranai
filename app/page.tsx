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
  STAR_TRAIT,
  type StarNumber,
} from "@/lib/kyusei";
import {
  calcKakusu,
  kichikyo,
  KAKUSU_LABEL,
  NUMBER_TEXT,
} from "@/lib/seimei";
import { birthCards, BIRTH_CARD_THEME } from "@/lib/birthcard";
import { fullCompat } from "@/lib/compat";

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

// 基礎データ（一度計算するだけで再計算不要）
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

  const kakusu = calcKakusu(
    [...OWNER.nameSeiKakusu],
    [...OWNER.nameMeiKakusu]
  );

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

  // 家族との相性
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

export default function Home() {
  const [tab, setTab] = useState<"today" | "basis">("today");
  const [today, setToday] = useState<TodayResults | null>(null);
  const basis = useMemo(basisData, []);

  useEffect(() => {
    setToday(todayCompute(basis.sun.key));
  }, [basis.sun.key]);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日（${
      ["日", "月", "火", "水", "木", "金", "土"][d.getDay()]
    }）`;
  }, []);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "夜更かしですね";
    if (h < 11) return "おはようございます";
    if (h < 18) return "こんにちは";
    return "こんばんは";
  }, []);

  if (!today) {
    return <div className="text-sm text-ink-400">読み込み中…</div>;
  }

  return (
    <div>
      <section className="py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ink-100">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-400">
            {todayLabel}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl mt-1">
            {greeting}、{OWNER.displayName}さん。
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {OWNER.bloodType}型・{basis.sun.name}・{STAR_NAME[OWNER.natal.kyusei.honmei as StarNumber]}・日主 {basis.fp.dayMaster.stem}
          </p>
        </div>
      </section>

      <nav className="mt-8 border-b border-ink-100 flex gap-6 text-sm">
        <button
          onClick={() => setTab("today")}
          className={`pb-3 -mb-px ${
            tab === "today"
              ? "border-b-2 border-ink-900 text-ink-900 font-medium"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          今日の占い
        </button>
        <button
          onClick={() => setTab("basis")}
          className={`pb-3 -mb-px ${
            tab === "basis"
              ? "border-b-2 border-ink-900 text-ink-900 font-medium"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          基礎の占い
        </button>
      </nav>

      <div className="mt-8">
        {tab === "today" ? (
          <TodayTab
            sun={basis.sun}
            today={today}
            personal={basis.numero.personal}
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

// ========================================================================
// 今日タブ
// ========================================================================

function TodayTab({
  sun,
  today,
  personal,
  annual,
  onReshuffle,
}: {
  sun: Zodiac;
  today: TodayResults;
  personal: number;
  annual: ReturnType<typeof annualDirection>;
  onReshuffle: () => void;
}) {
  const lucky = LUCKY[sun.key];
  const py = PERSONAL_YEAR_TEXT[personal];
  return (
    <div className="space-y-10">
      {/* 本日の運勢スコア */}
      <section className="rounded-xl border border-ink-900 p-6 bg-ink-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">
              Today's Fortune
            </div>
            <h2 className="font-serif text-2xl mt-1">本日の運勢</h2>
          </div>
          <button
            onClick={onReshuffle}
            className="rounded-md border border-ink-900 px-3 py-1.5 text-sm hover:bg-ink-900 hover:text-white"
          >
            再シャッフル
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
          <ScoreBox label="総合" value={today.daily.overall} />
          <ScoreBox label="恋愛" value={today.daily.love} />
          <ScoreBox label="仕事" value={today.daily.work} />
          <ScoreBox label="金運" value={today.daily.money} />
        </div>
        <p className="mt-5 text-sm text-ink-700">{today.daily.message}</p>
      </section>

      {/* ラッキー要素 */}
      <section>
        <SectionHeader en="Lucky" ja="今日のラッキー要素" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kv k="カラー" v={lucky.color} big />
          <Kv k="ナンバー" v={String(lucky.number)} big />
          <Kv k="アイテム" v={lucky.item} big />
          <Kv k="相性が良い人" v={lucky.compatible.map((k) => ZODIAC.find((z) => z.key === k)!.name).join("・")} big />
        </div>
      </section>

      {/* 今月のテーマ */}
      <section>
        <SectionHeader en="Monthly" ja="今月のテーマ" />
        <p className="mt-3 text-sm text-ink-700 rounded-xl border border-ink-100 p-5">
          {lucky.monthlyTheme}
        </p>
      </section>

      {/* 今年のテーマ（パーソナルイヤー） */}
      {py && (
        <section>
          <SectionHeader en="This Year" ja={`${new Date().getFullYear()}年のテーマ`} />
          <article className="mt-3 rounded-xl border border-ink-100 p-6 flex gap-6 items-center">
            <div className="font-serif text-6xl tabular-nums">{personal}</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-400">
                Personal Year
              </div>
              <div className="font-serif text-lg mt-1">{py.title}</div>
              <p className="text-sm text-ink-700 mt-1">{py.text}</p>
            </div>
          </article>
        </section>
      )}

      {/* 流年方位 */}
      <section>
        <SectionHeader en="Annual Direction" ja={`${annual.year}年の年運（${annual.starName}）`} />
        <ul className="mt-3 space-y-1 text-sm rounded-xl border border-ink-100 p-5">
          <li>歳破方位: <span className="font-medium">{annual.saiha}</span> — 引っ越し・大事業は避ける</li>
          <li>五黄殺: <span className="font-medium">{annual.gokou}</span> — 自滅の方位、重要事項を持ち込まない</li>
          <li>暗剣殺: <span className="font-medium">{annual.anken}</span> — 他者からの災い、慎重に</li>
        </ul>
      </section>

      {/* タロット スリーカード */}
      <section>
        <SectionHeader en="Tarot" ja="今日のタロット（過去・現在・未来）" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {today.tarot.map((c, i) => (
            <article key={i} className="rounded-xl border border-ink-100 p-5 flex flex-col">
              <div className="text-xs uppercase tracking-widest text-ink-400">
                {SPREAD_LABELS.three[i]}
              </div>
              <div
                className={`mt-3 aspect-[2/3] rounded-lg border-2 border-ink-900 flex items-center justify-center text-5xl font-serif ${
                  c.isReversed ? "rotate-180" : ""
                }`}
              >
                {romanize(c.num)}
              </div>
              <div className="mt-4">
                <div className="font-serif text-lg">
                  {c.name}
                  {c.isReversed && (
                    <span className="ml-2 text-xs text-ink-400">逆位置</span>
                  )}
                </div>
                <div className="text-xs text-ink-400">{c.en}</div>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">{c.meaning}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 易経 */}
      <section>
        <SectionHeader en="I Ching" ja="今日の易（コイン3枚法）" />
        <div className="mt-4 rounded-xl border border-ink-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">本卦</div>
            <div className="font-serif text-2xl mt-1">
              {today.iching.hex.num}. {today.iching.hex.name}
            </div>
            <div className="text-xs text-ink-500">{today.iching.hex.reading}</div>
            <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6">
              {[...today.iching.yaos].reverse().map((y, i) => (
                <div key={i}>{yaoSymbol(y)}</div>
              ))}
            </div>
            <div className="text-xs text-ink-400 mt-2 text-right pr-6">
              上卦: {trigramName(today.iching.yaos, "upper")} / 下卦:{" "}
              {trigramName(today.iching.yaos, "lower")}
            </div>
            <p className="mt-4 text-sm text-ink-700 leading-relaxed">{today.iching.hex.meaning}</p>
          </div>
          {today.iching.changed && (
            <div className="border-t sm:border-t-0 sm:border-l border-ink-100 sm:pl-6 pt-6 sm:pt-0">
              <div className="text-xs uppercase tracking-widest text-ink-400">之卦（変化後）</div>
              <div className="font-serif text-2xl mt-1">
                {today.iching.changed.hex.num}. {today.iching.changed.hex.name}
              </div>
              <div className="text-xs text-ink-500">{today.iching.changed.hex.reading}</div>
              <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6">
                {[...today.iching.changed.yaos].reverse().map((y, i) => (
                  <div key={i}>{yaoSymbol(y)}</div>
                ))}
              </div>
              <p className="mt-4 text-sm text-ink-700 leading-relaxed">
                {today.iching.changed.hex.meaning}
              </p>
            </div>
          )}
        </div>
        {today.iching.lines.length > 0 && (
          <div className="mt-3 rounded-xl border border-ink-100 p-6">
            <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">
              変爻のメッセージ
            </div>
            <ul className="space-y-2 text-sm">
              {today.iching.lines.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-medium w-12">第{l.pos}爻</span>
                  <span className="text-ink-700">{l.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

// ========================================================================
// 基礎タブ
// ========================================================================

function BasisTab({ basis }: { basis: ReturnType<typeof basisData> }) {
  return (
    <div className="space-y-10">
      <NatalChartSection sun={basis.sun} />
      <ShichuFullSection fp={basis.fp} fpExtras={basis.fpExtras} />
      <KyuseiSection />
      <NumerologyFullSection numero={basis.numero} />
      <SeimeiSection kakusu={basis.kakusu} />
      <BirthCardSection bc={basis.bc} />
      <FengShuiFullSection ratings={basis.ratings} />
      <CompatSection
        spouseCompat={basis.spouseCompat}
        childCompat={basis.childCompat}
      />
    </div>
  );
}

function NatalChartSection({ sun }: { sun: Zodiac }) {
  return (
    <section>
      <SectionHeader en="Astrology / Natal" ja="ネイタルチャート（西洋占星術）" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{sun.symbol}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">{sun.en}</div>
            <div className="font-serif text-2xl">{sun.name}（太陽星座）</div>
            <div className="text-xs text-ink-500 mt-1">
              {sun.element}・{sun.quality}宮 / 守護星: {sun.ruler}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{sun.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-sm">
          <Kv k="月星座" v={OWNER.natal.moonApprox} />
          <Kv k="アセンダント" v={OWNER.natal.ascApprox} />
          <Kv k="MC" v={OWNER.natal.mcApprox} />
          <Kv k="出生地" v={`${OWNER.birthplace.city}`} />
        </div>
        <p className="mt-3 text-xs text-ink-400">
          ※ 月・ASC・MC は精密な ephemeris 計算なしの概算値です。
        </p>
      </div>
    </section>
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
    <section>
      <SectionHeader en="Shichu Suimei" ja="四柱推命（命式）" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <PillarCell label="時柱" pillar={fp.hour} tongbian={fpExtras.tongbian.hour} twelve={fpExtras.twelve.hour} />
          <PillarCell label="日柱" pillar={fp.day} twelve={fpExtras.twelve.day} highlight />
          <PillarCell label="月柱" pillar={fp.month} tongbian={fpExtras.tongbian.month} twelve={fpExtras.twelve.month} />
          <PillarCell label="年柱" pillar={fp.year} tongbian={fpExtras.tongbian.year} twelve={fpExtras.twelve.year} />
        </div>

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400">日主</div>
          <div className="font-serif text-xl mt-1">
            {fp.dayMaster.stem} ・ {fp.dayMaster.element}
          </div>
          <p className="text-sm text-ink-700 mt-2">
            {DAY_MASTER_TEXT[fp.dayMaster.element]}
          </p>
        </div>

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">通変星</div>
          <ul className="space-y-1 text-sm">
            <li>年柱: <span className="font-medium">{fpExtras.tongbian.year}</span> — <span className="text-ink-600">{TONGBIAN_TEXT[fpExtras.tongbian.year]}</span></li>
            <li>月柱: <span className="font-medium">{fpExtras.tongbian.month}</span> — <span className="text-ink-600">{TONGBIAN_TEXT[fpExtras.tongbian.month]}</span></li>
            {fpExtras.tongbian.hour && (
              <li>時柱: <span className="font-medium">{fpExtras.tongbian.hour}</span> — <span className="text-ink-600">{TONGBIAN_TEXT[fpExtras.tongbian.hour]}</span></li>
            )}
          </ul>
        </div>

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">十二運</div>
          <ul className="space-y-1 text-sm">
            <li>日柱: <span className="font-medium">{fpExtras.twelve.day}</span> — <span className="text-ink-600">{TWELVE_TEXT[fpExtras.twelve.day]}</span></li>
            <li>月柱: <span className="font-medium">{fpExtras.twelve.month}</span> — <span className="text-ink-600">{TWELVE_TEXT[fpExtras.twelve.month]}</span></li>
            <li>年柱: <span className="font-medium">{fpExtras.twelve.year}</span> — <span className="text-ink-600">{TWELVE_TEXT[fpExtras.twelve.year]}</span></li>
            {fpExtras.twelve.hour && (
              <li>時柱: <span className="font-medium">{fpExtras.twelve.hour}</span> — <span className="text-ink-600">{TWELVE_TEXT[fpExtras.twelve.hour]}</span></li>
            )}
          </ul>
        </div>

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-3">五行バランス</div>
          <div className="space-y-1.5">
            {(["木", "火", "土", "金", "水"] as const).map((e) => {
              const v = fpExtras.five[e];
              const pct = total ? (v / total) * 100 : 0;
              return (
                <div key={e} className="flex items-center gap-3 text-sm">
                  <div className="w-6 text-ink-500">{e}</div>
                  <div className="flex-1 h-2 bg-ink-100 rounded">
                    <div className="h-2 bg-ink-900 rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 tabular-nums text-right">{v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function KyuseiSection() {
  const honmei = OWNER.natal.kyusei.honmei as StarNumber;
  const getsumei = OWNER.natal.kyusei.getsumei as StarNumber;
  return (
    <section>
      <SectionHeader en="Nine Star Ki" ja="九星気学" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StarCard role="本命星（生涯の核）" star={honmei} />
        <StarCard role="月命星（性格・対人傾向）" star={getsumei} />
      </div>
    </section>
  );
}

function StarCard({ role, star }: { role: string; star: StarNumber }) {
  return (
    <article className="rounded-xl border border-ink-100 p-6">
      <div className="text-xs uppercase tracking-widest text-ink-400">{role}</div>
      <div className="font-serif text-2xl mt-1">{STAR_NAME[star]}</div>
      <div className="text-xs text-ink-500 mt-1">
        五行: {STAR_ELEMENT[star]} / 定位方位: {STAR_DIRECTION[star]}
      </div>
      <p className="text-sm text-ink-700 mt-3 leading-relaxed">{STAR_TRAIT[star]}</p>
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
    <section>
      <SectionHeader en="Numerology" ja="数秘術（フル）" />
      <div className="mt-4 space-y-3">
        <article className="rounded-xl border border-ink-900 p-6 flex gap-6 items-center bg-ink-50">
          <div className="font-serif text-6xl tabular-nums">{numero.life}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">ライフパスナンバー</div>
            <div className="text-sm text-ink-500">人生全体の傾向（マスターナンバー）</div>
            {lifeMeaning && (
              <>
                <div className="font-serif text-lg mt-2">{lifeMeaning.title}</div>
                <p className="text-sm text-ink-700 mt-1">{lifeMeaning.text}</p>
              </>
            )}
          </div>
        </article>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SmallNum label="誕生日数" value={numero.birthday} />
          <SmallNum label="表現数" value={numero.expression} />
          <SmallNum label="ソウル数" value={numero.soul} />
          <SmallNum label="人格数" value={numero.persona} />
        </div>
      </div>
    </section>
  );
}

function SeimeiSection({
  kakusu,
}: {
  kakusu: ReturnType<typeof calcKakusu>;
}) {
  const items: { key: keyof typeof KAKUSU_LABEL; n: number }[] = [
    { key: "ten", n: kakusu.ten },
    { key: "jin", n: kakusu.jin },
    { key: "chi", n: kakusu.chi },
    { key: "gai", n: kakusu.gai },
    { key: "so", n: kakusu.so },
  ];
  return (
    <section>
      <SectionHeader en="Seimei Handan" ja="姓名判断（五格）" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="text-xs text-ink-500 mb-3">
          {OWNER.nameSei}（{OWNER.nameSeiKakusu.join("+")}）/ {OWNER.nameMei}（
          {OWNER.nameMeiKakusu.join("+")}）
        </div>
        <div className="space-y-3">
          {items.map(({ key, n }) => {
            const lab = KAKUSU_LABEL[key];
            const k = kichikyo(n);
            const txt = NUMBER_TEXT[n];
            return (
              <div key={key} className="grid grid-cols-12 gap-3 items-start text-sm border-b border-ink-100 pb-3">
                <div className="col-span-2 font-medium">{lab.label}</div>
                <div className="col-span-2 font-serif text-2xl tabular-nums">{n}</div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    k === "大吉" ? "bg-ink-900 text-white" :
                    k === "吉" ? "border border-ink-900 text-ink-900" :
                    k === "半吉" ? "border border-ink-300 text-ink-500" :
                    "border border-ink-300 text-ink-400"
                  }`}>{k}</span>
                </div>
                <div className="col-span-6">
                  <div className="text-ink-500 text-xs">{lab.sub}</div>
                  {txt && <div className="text-ink-700 mt-1">{txt}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BirthCardSection({
  bc,
}: {
  bc: ReturnType<typeof birthCards>;
}) {
  return (
    <section>
      <SectionHeader en="Birth Card" ja="タロット バースカード" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BCard role="パーソナリティカード（社会的な役割）" card={bc.personality} />
        <BCard role="ソウルカード（魂の本質）" card={bc.soul} />
      </div>
    </section>
  );
}

function BCard({
  role,
  card,
}: {
  role: string;
  card: { num: number; name: string; en: string };
}) {
  return (
    <article className="rounded-xl border border-ink-100 p-6 flex gap-5 items-center">
      <div className="aspect-[2/3] w-20 rounded-lg border-2 border-ink-900 flex items-center justify-center text-3xl font-serif shrink-0">
        {romanize(card.num)}
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-400">{role}</div>
        <div className="font-serif text-xl mt-1">
          {card.name} <span className="text-xs text-ink-400 font-sans">{card.en}</span>
        </div>
        <p className="text-sm text-ink-700 mt-2">{BIRTH_CARD_THEME[card.num]}</p>
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
    <section>
      <SectionHeader en="Feng Shui" ja="風水（本命卦）" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="flex items-center gap-4">
          <div className="font-serif text-5xl tabular-nums">{kua}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">本命卦</div>
            <div className="font-serif text-xl">
              {KUA_NAMES[kua].name}（{KUA_NAMES[kua].group}）
            </div>
            <div className="text-xs text-ink-500 mt-1">
              現住所: {OWNER.residence.city} / 居住階数 {OWNER.residence.floor}階（高層階・陽）
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
          <div className="aspect-square rounded-lg bg-ink-900 text-white flex items-center justify-center text-xs">中央</div>
          <DirCell rating={find(ratings, "東")} dir="東" />
          <DirCell rating={find(ratings, "西南")} dir="西南" />
          <DirCell rating={find(ratings, "南")} dir="南" />
          <DirCell rating={find(ratings, "東南")} dir="東南" />
        </div>
        <div className="mt-8 space-y-2">
          {ratings.map((r) => (
            <div key={r.dir} className="flex items-start gap-3 text-sm border-b border-ink-100 pb-2">
              <div className="w-12 text-ink-500">{r.dir}</div>
              <div className={`w-12 font-medium ${r.kind === "吉" ? "text-ink-900" : "text-ink-400"}`}>
                {r.rating}
              </div>
              <div className="flex-1 text-ink-600">{RATING_TEXT[r.rating]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <section>
      <SectionHeader en="Family Compatibility" ja="家族との相性" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CompatCard
          title={`妻（${OWNER.family.spouse.birth} 生）`}
          c={spouseCompat}
        />
        <CompatCard
          title={`子（${OWNER.family.child.relation}・${OWNER.family.child.birth} 生）`}
          c={childCompat}
        />
      </div>
    </section>
  );
}

function CompatCard({
  title,
  c,
}: {
  title: string;
  c: ReturnType<typeof fullCompat>;
}) {
  return (
    <article className="rounded-xl border border-ink-100 p-6">
      <div className="text-xs uppercase tracking-widest text-ink-400">{title}</div>
      <div className="flex items-baseline gap-3 mt-1">
        <div className="font-serif text-2xl">{c.zodiac.partner.name}</div>
        <div className="text-sm text-ink-500">/ {c.star.name}</div>
      </div>
      <div className="mt-3 text-sm">
        <Stars value={c.overallScore} /> 総合 {c.overallScore}/5
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div>
          <div className="text-xs text-ink-400">星座（{c.zodiac.compat.score}/5）</div>
          <p className="text-ink-700">{c.zodiac.compat.text}</p>
        </div>
        <div>
          <div className="text-xs text-ink-400">九星気学・五行（{c.star.relation.score}/5）</div>
          <p className="text-ink-700">
            {c.star.relation.relation} — {c.star.relation.text}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-900 border-t border-ink-100 pt-3 italic">
        {c.summary}
      </p>
    </article>
  );
}

// ========================================================================
// Shared UI atoms
// ========================================================================

function SectionHeader({ en, ja }: { en: string; ja: string }) {
  return (
    <header className="border-l-2 border-ink-900 pl-4">
      <div className="text-xs uppercase tracking-widest text-ink-400">{en}</div>
      <h2 className="font-serif text-2xl mt-0.5">{ja}</h2>
    </header>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="tracking-widest">
      {"★".repeat(value)}
      <span className="text-ink-200">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-3">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 text-base"><Stars value={value} /></div>
    </div>
  );
}

function Kv({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className={big ? "rounded-lg border border-ink-100 p-4" : ""}>
      <div className="text-xs text-ink-400">{k}</div>
      <div className="text-sm mt-1">{v}</div>
    </div>
  );
}

function SmallNum({ label, value }: { label: string; value: number }) {
  const meaning = LIFE_PATH_MEANINGS[String(value)];
  return (
    <article className="rounded-xl border border-ink-100 p-4">
      <div className="text-xs uppercase tracking-widest text-ink-400">{label}</div>
      <div className="font-serif text-3xl tabular-nums mt-1">{value}</div>
      {meaning && <div className="text-xs text-ink-500 mt-1">{meaning.title}</div>}
    </article>
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
    <div className={`rounded-lg border ${highlight ? "border-ink-900" : "border-ink-100"} p-4`}>
      <div className="text-xs uppercase tracking-widest text-ink-400">{label}</div>
      {pillar ? (
        <>
          {tongbian && <div className="text-xs text-ink-500 mt-1">{tongbian}</div>}
          <div className="font-serif text-3xl mt-1">{pillar.stem}</div>
          <div className="text-xs text-ink-500">{pillar.stemElement}</div>
          <div className="font-serif text-3xl mt-2">{pillar.branch}</div>
          <div className="text-xs text-ink-500">{pillar.branchElement}</div>
          {twelve && <div className="text-xs text-ink-500 mt-2">{twelve}</div>}
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

function DirCell({
  dir,
  rating,
}: {
  dir: string;
  rating: { rating: DirRating; kind: "吉" | "凶" };
}) {
  return (
    <div
      className={`aspect-square rounded-lg border ${
        rating.kind === "吉" ? "border-ink-900 bg-ink-50" : "border-ink-200 bg-white"
      } flex flex-col items-center justify-center text-xs p-1`}
    >
      <div className="text-ink-500">{dir}</div>
      <div className="font-medium mt-1">{rating.rating}</div>
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
