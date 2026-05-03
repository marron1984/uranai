"use client";

import { useState } from "react";
import Link from "next/link";
import { getSunSign, getDailyFortune, type Zodiac } from "@/lib/astrology";
import { drawCards, SPREAD_LABELS, type DrawnCard } from "@/lib/tarot";
import {
  lifePathNumber,
  soulNumber,
  personalityNumber,
  LIFE_PATH_MEANINGS,
} from "@/lib/numerology";
import {
  castHexagram,
  hexagramFromYaos,
  changedHexagram,
  trigramName,
  yaoSymbol,
  type Yao,
} from "@/lib/iching";
import {
  calcFourPillars,
  DAY_MASTER_TEXT,
  type FourPillars,
} from "@/lib/shichu";
import {
  calcKua,
  dirRatings,
  KUA_NAMES,
  RATING_TEXT,
  type Gender,
  type DirRating,
} from "@/lib/fengshui";

type AllResults = {
  zodiac: Zodiac;
  daily: ReturnType<typeof getDailyFortune>;
  tarot: DrawnCard[];
  numerology: { life: number; soul: number; persona: number; hasName: boolean };
  iching: {
    yaos: Yao[];
    hex: ReturnType<typeof hexagramFromYaos>;
    changed: ReturnType<typeof changedHexagram>;
  };
  shichu: FourPillars;
  fengshui: {
    kua: number;
    ratings: ReturnType<typeof dirRatings>;
  };
  question: string;
};

export default function Home() {
  const [date, setDate] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [hour, setHour] = useState("");
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState<AllResults | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const d = new Date(date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = hour === "" ? null : Number(hour);

    const zodiac = getSunSign(m, day);
    const yaos = castHexagram();

    setResults({
      zodiac,
      daily: getDailyFortune(zodiac.key, new Date()),
      tarot: drawCards(3),
      numerology: {
        life: lifePathNumber(date),
        soul: name ? soulNumber(name) : 0,
        persona: name ? personalityNumber(name) : 0,
        hasName: !!name,
      },
      iching: {
        yaos,
        hex: hexagramFromYaos(yaos),
        changed: changedHexagram(yaos),
      },
      shichu: calcFourPillars(y, m, day, h),
      fengshui: {
        kua: calcKua(y, m, day, gender),
        ratings: dirRatings(calcKua(y, m, day, gender)),
      },
      question,
    });
  };

  return (
    <div>
      <section className="py-10 sm:py-14">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">
          ひとつの入力で、6つの占い。
        </h1>
        <p className="mt-4 text-ink-500 max-w-xl">
          生年月日を入れるだけで、西洋占星術・タロット・数秘術・易経・四柱推命・風水を
          まとめてお届けします。
        </p>
      </section>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-ink-100 p-6 sm:p-8 bg-ink-50/40"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-ink-500">生年月日（必須）</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
            />
          </label>
          <fieldset>
            <legend className="text-xs text-ink-500 mb-1">性別（風水で使用）</legend>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                />
                <span className="text-sm">男性</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                />
                <span className="text-sm">女性</span>
              </label>
            </div>
          </fieldset>
          <label className="block">
            <span className="text-xs text-ink-500">生まれた時刻 0-23（任意 / 四柱推命）</span>
            <input
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="例: 14"
              className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink-500">氏名 ローマ字（任意 / 数秘術）</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: TARO YAMADA"
              className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-ink-500">問い（任意 / 易経・タロット）</span>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例: 今の仕事を続けるべきか"
              className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
            />
          </label>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-ink-900 text-white px-6 py-2.5 hover:bg-ink-700"
          >
            6つの占いを実行
          </button>
          <span className="text-xs text-ink-400">
            すべての計算はブラウザ内で完結します
          </span>
        </div>
      </form>

      {results && (
        <div className="mt-12 space-y-10">
          <AstrologySection result={results} />
          <TarotSection result={results} />
          <NumerologySection result={results} />
          <IChingSection result={results} />
          <ShichuSection result={results} />
          <FengShuiSection result={results} />
        </div>
      )}

      <section className="mt-20">
        <h2 className="font-serif text-xl mb-4">個別ページで詳しく</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ["/astrology", "西洋占星術"],
            ["/tarot", "タロット"],
            ["/numerology", "数秘術"],
            ["/iching", "易経"],
            ["/shichu", "四柱推命"],
            ["/fengshui", "風水"],
          ].map(([href, name]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg border border-ink-100 px-4 py-3 text-sm hover:border-ink-900"
            >
              {name} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

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

function AstrologySection({ result }: { result: AllResults }) {
  const { zodiac: z, daily } = result;
  return (
    <section>
      <SectionHeader en="Astrology" ja="西洋占星術" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{z.symbol}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">
              {z.en}
            </div>
            <div className="font-serif text-2xl">{z.name}</div>
            <div className="text-xs text-ink-500 mt-1">
              {z.element}・{z.quality}宮 / 守護星: {z.ruler}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">
          {z.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {z.traits.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 rounded-full border border-ink-200 text-ink-600"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="border-t border-ink-100 mt-5 pt-5">
          <div className="text-sm font-medium mb-3">本日の運勢</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">総合</span><Stars value={daily.overall} /></div>
            <div className="flex justify-between"><span className="text-ink-500">恋愛</span><Stars value={daily.love} /></div>
            <div className="flex justify-between"><span className="text-ink-500">仕事</span><Stars value={daily.work} /></div>
            <div className="flex justify-between"><span className="text-ink-500">金運</span><Stars value={daily.money} /></div>
          </div>
          <p className="mt-4 text-sm text-ink-700">{daily.message}</p>
        </div>
      </div>
    </section>
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

function TarotSection({ result }: { result: AllResults }) {
  return (
    <section>
      <SectionHeader en="Tarot" ja="タロット（過去・現在・未来）" />
      {result.question && (
        <div className="text-sm text-ink-500 mt-3 ml-1">
          問い: <span className="text-ink-900">{result.question}</span>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {result.tarot.map((c, i) => (
          <article
            key={i}
            className="rounded-xl border border-ink-100 p-5 flex flex-col"
          >
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
              <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                {c.meaning}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NumerologySection({ result }: { result: AllResults }) {
  const { numerology: n } = result;
  const meaning = LIFE_PATH_MEANINGS[String(n.life)];
  return (
    <section>
      <SectionHeader en="Numerology" ja="数秘術" />
      <div className="mt-4 space-y-3">
        <article className="rounded-xl border border-ink-100 p-6 flex gap-6 items-center">
          <div className="font-serif text-6xl tabular-nums">{n.life}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">
              ライフパスナンバー
            </div>
            <div className="text-sm text-ink-500">人生全体の傾向</div>
            {meaning && (
              <>
                <div className="font-serif text-lg mt-2">{meaning.title}</div>
                <p className="text-sm text-ink-700 mt-1">{meaning.text}</p>
              </>
            )}
          </div>
        </article>
        {n.hasName ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SmallNumberCard label="ソウルナンバー" sub="心の奥にある本質" value={n.soul} />
            <SmallNumberCard label="パーソナリティナンバー" sub="周囲に映る印象" value={n.persona} />
          </div>
        ) : (
          <p className="text-xs text-ink-400">
            ※ 氏名（ローマ字）を入力するとソウル/パーソナリティナンバーも計算します。
          </p>
        )}
      </div>
    </section>
  );
}

function SmallNumberCard({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: number;
}) {
  const meaning = LIFE_PATH_MEANINGS[String(value)];
  return (
    <article className="rounded-xl border border-ink-100 p-5 flex gap-5 items-center">
      <div className="font-serif text-4xl tabular-nums">{value}</div>
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-400">
          {label}
        </div>
        <div className="text-xs text-ink-500">{sub}</div>
        {meaning && (
          <div className="font-serif text-sm mt-1">{meaning.title}</div>
        )}
      </div>
    </article>
  );
}

function IChingSection({ result }: { result: AllResults }) {
  const { iching } = result;
  return (
    <section>
      <SectionHeader en="I Ching" ja="易経" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-400">本卦</div>
          <div className="font-serif text-2xl mt-1">
            {iching.hex.num}. {iching.hex.name}
          </div>
          <div className="text-xs text-ink-500">{iching.hex.reading}</div>
          <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6">
            {[...iching.yaos].reverse().map((y, i) => (
              <div key={i}>{yaoSymbol(y)}</div>
            ))}
          </div>
          <div className="text-xs text-ink-400 mt-2 text-right pr-6">
            上卦: {trigramName(iching.yaos, "upper")} / 下卦:{" "}
            {trigramName(iching.yaos, "lower")}
          </div>
          <p className="mt-4 text-sm text-ink-700 leading-relaxed">
            {iching.hex.meaning}
          </p>
        </div>
        {iching.changed && (
          <div className="border-t sm:border-t-0 sm:border-l border-ink-100 sm:pl-6 pt-6 sm:pt-0">
            <div className="text-xs uppercase tracking-widest text-ink-400">
              之卦（変化後）
            </div>
            <div className="font-serif text-2xl mt-1">
              {iching.changed.hex.num}. {iching.changed.hex.name}
            </div>
            <div className="text-xs text-ink-500">{iching.changed.hex.reading}</div>
            <div className="font-mono text-2xl mt-4 leading-relaxed text-right pr-6">
              {[...iching.changed.yaos].reverse().map((y, i) => (
                <div key={i}>{yaoSymbol(y)}</div>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-700 leading-relaxed">
              {iching.changed.hex.meaning}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ShichuSection({ result }: { result: AllResults }) {
  const s = result.shichu;
  return (
    <section>
      <SectionHeader en="Shichu Suimei" ja="四柱推命" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <PillarCell label="時柱" pillar={s.hour} />
          <PillarCell label="日柱" pillar={s.day} highlight />
          <PillarCell label="月柱" pillar={s.month} />
          <PillarCell label="年柱" pillar={s.year} />
        </div>
        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400">
            日主（あなた本人）
          </div>
          <div className="font-serif text-xl mt-1">
            {s.dayMaster.stem} ・ {s.dayMaster.element}
          </div>
          <p className="text-sm text-ink-700 mt-2">
            {DAY_MASTER_TEXT[s.dayMaster.element]}
          </p>
        </div>
      </div>
    </section>
  );
}

function PillarCell({
  label,
  pillar,
  highlight,
}: {
  label: string;
  pillar: { stem: string; branch: string; stemElement: string; branchElement: string } | null;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border ${highlight ? "border-ink-900" : "border-ink-100"} p-4`}>
      <div className="text-xs uppercase tracking-widest text-ink-400">{label}</div>
      {pillar ? (
        <>
          <div className="font-serif text-3xl mt-1">{pillar.stem}</div>
          <div className="text-xs text-ink-500">{pillar.stemElement}</div>
          <div className="font-serif text-3xl mt-2">{pillar.branch}</div>
          <div className="text-xs text-ink-500">{pillar.branchElement}</div>
        </>
      ) : (
        <div className="text-sm text-ink-400 mt-3">—</div>
      )}
    </div>
  );
}

function FengShuiSection({ result }: { result: AllResults }) {
  const f = result.fengshui;
  return (
    <section>
      <SectionHeader en="Feng Shui" ja="風水（本命卦）" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="flex items-center gap-4">
          <div className="font-serif text-5xl tabular-nums">{f.kua}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">本命卦</div>
            <div className="font-serif text-xl">
              {KUA_NAMES[f.kua].name}（{KUA_NAMES[f.kua].group}）
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6 max-w-sm mx-auto">
          <DirCell rating={find(f.ratings, "西北")} dir="西北" />
          <DirCell rating={find(f.ratings, "北")} dir="北" />
          <DirCell rating={find(f.ratings, "東北")} dir="東北" />
          <DirCell rating={find(f.ratings, "西")} dir="西" />
          <div className="aspect-square rounded-lg bg-ink-900 text-white flex items-center justify-center text-xs">中央</div>
          <DirCell rating={find(f.ratings, "東")} dir="東" />
          <DirCell rating={find(f.ratings, "西南")} dir="西南" />
          <DirCell rating={find(f.ratings, "南")} dir="南" />
          <DirCell rating={find(f.ratings, "東南")} dir="東南" />
        </div>
        <div className="mt-8 space-y-2">
          {f.ratings.map((r) => (
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
