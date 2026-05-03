"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadProfile,
  saveProfile,
  clearProfile,
  DEFAULT_PROFILE,
  type Profile,
} from "@/lib/profile";
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
  calcFourPillars,
  calcShichuExtras,
  DAY_MASTER_TEXT,
  TONGBIAN_TEXT,
  TWELVE_TEXT,
  type FourPillars,
  type ShichuExtras,
} from "@/lib/shichu";
import {
  calcKua,
  dirRatings,
  KUA_NAMES,
  RATING_TEXT,
  annualDirection,
  type DirRating,
} from "@/lib/fengshui";

type AllResults = {
  zodiac: Zodiac;
  daily: ReturnType<typeof getDailyFortune>;
  tarot: DrawnCard[];
  numerology: {
    life: number;
    soul: number;
    persona: number;
    expression: number;
    birthday: number;
    personal: number;
    hasName: boolean;
  };
  iching: {
    yaos: Yao[];
    hex: ReturnType<typeof hexagramFromYaos>;
    changed: ReturnType<typeof changedHexagram>;
    lines: ReturnType<typeof changingLineMeanings>;
  };
  shichu: FourPillars;
  shichuExtras: ShichuExtras;
  fengshui: {
    kua: number;
    ratings: ReturnType<typeof dirRatings>;
    annual: ReturnType<typeof annualDirection>;
  };
};

function compute(profile: Profile): AllResults {
  const d = new Date(profile.birth);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = profile.hour;
  const zodiac = getSunSign(m, day);
  const yaos = castHexagram();
  const sp = calcFourPillars(y, m, day, h);
  const thisYear = new Date().getFullYear();

  return {
    zodiac,
    daily: getDailyFortune(zodiac.key, new Date()),
    tarot: drawCards(3),
    numerology: {
      life: lifePathNumber(profile.birth),
      soul: profile.nameRoman ? soulNumber(profile.nameRoman) : 0,
      persona: profile.nameRoman ? personalityNumber(profile.nameRoman) : 0,
      expression: profile.nameRoman ? expressionNumber(profile.nameRoman) : 0,
      birthday: birthdayNumber(profile.birth),
      personal: personalYear(profile.birth, thisYear),
      hasName: !!profile.nameRoman,
    },
    iching: {
      yaos,
      hex: hexagramFromYaos(yaos),
      changed: changedHexagram(yaos),
      lines: changingLineMeanings(yaos),
    },
    shichu: sp,
    shichuExtras: calcShichuExtras(sp),
    fengshui: {
      kua: calcKua(y, m, day, profile.gender),
      ratings: dirRatings(calcKua(y, m, day, profile.gender)),
      annual: annualDirection(thisYear),
    },
  };
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [results, setResults] = useState<AllResults | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setProfile(p);
      setResults(compute(p));
    } else {
      setEditing(true);
    }
    setHydrated(true);
  }, []);

  const onSave = (p: Profile) => {
    saveProfile(p);
    setProfile(p);
    setResults(compute(p));
    setEditing(false);
  };

  const onReshuffle = () => {
    if (!profile) return;
    setResults(compute(profile));
  };

  const onReset = () => {
    if (!confirm("プロフィールを削除して最初からやり直しますか？")) return;
    clearProfile();
    setProfile(null);
    setResults(null);
    setEditing(true);
  };

  if (!hydrated) {
    return <div className="text-sm text-ink-400">読み込み中…</div>;
  }

  return (
    <div>
      {(editing || !profile) && (
        <ProfileForm
          initial={profile ?? DEFAULT_PROFILE}
          onSave={onSave}
          onCancel={profile ? () => setEditing(false) : undefined}
        />
      )}

      {profile && results && !editing && (
        <>
          <Greeting
            profile={profile}
            onEdit={() => setEditing(true)}
            onReshuffle={onReshuffle}
            onReset={onReset}
          />
          <div className="mt-10 space-y-10">
            <AstrologySection result={results} />
            <NumerologySection result={results} />
            <ShichuSection result={results} />
            <FengShuiSection result={results} />
            <TarotSection result={results} />
            <IChingSection result={results} />
          </div>
        </>
      )}
    </div>
  );
}

// ========== Profile Form ==========

function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Profile;
  onSave: (p: Profile) => void;
  onCancel?: () => void;
}) {
  const [p, setP] = useState<Profile>(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.birth) return;
    onSave(p);
  };

  return (
    <section className="py-6">
      <h1 className="font-serif text-3xl">
        {onCancel ? "プロフィール編集" : "ようこそ。最初に設定しましょう"}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        この情報はあなたのブラウザにのみ保存され、外部には送信されません。
      </p>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-ink-100 p-6 bg-ink-50/40 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <label className="block">
          <span className="text-xs text-ink-500">呼び名</span>
          <input
            type="text"
            value={p.displayName}
            onChange={(e) => setP({ ...p, displayName: e.target.value })}
            placeholder="Yoshida"
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-500">生年月日（必須）</span>
          <input
            type="date"
            value={p.birth}
            onChange={(e) => setP({ ...p, birth: e.target.value })}
            required
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
          />
        </label>
        <fieldset>
          <legend className="text-xs text-ink-500 mb-1">性別</legend>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={p.gender === "male"}
                onChange={() => setP({ ...p, gender: "male" })}
              />
              <span className="text-sm">男性</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={p.gender === "female"}
                onChange={() => setP({ ...p, gender: "female" })}
              />
              <span className="text-sm">女性</span>
            </label>
          </div>
        </fieldset>
        <label className="block">
          <span className="text-xs text-ink-500">生まれた時刻 0-23（任意）</span>
          <input
            type="number"
            min={0}
            max={23}
            value={p.hour ?? ""}
            onChange={(e) =>
              setP({ ...p, hour: e.target.value === "" ? null : Number(e.target.value) })
            }
            placeholder="例: 14"
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-ink-500">氏名 ローマ字（任意）</span>
          <input
            type="text"
            value={p.nameRoman}
            onChange={(e) => setP({ ...p, nameRoman: e.target.value })}
            placeholder="例: TARO YOSHIDA"
            className="block mt-1 w-full rounded-md border border-ink-200 px-3 py-2 bg-white focus:outline-none focus:border-ink-900"
          />
        </label>
        <div className="sm:col-span-2 flex items-center gap-3 mt-2">
          <button
            type="submit"
            className="rounded-md bg-ink-900 text-white px-6 py-2.5 hover:bg-ink-700"
          >
            {onCancel ? "保存" : "保存して占いを開く"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-ink-500 hover:text-ink-900"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

// ========== Greeting ==========

function Greeting({
  profile,
  onEdit,
  onReshuffle,
  onReset,
}: {
  profile: Profile;
  onEdit: () => void;
  onReshuffle: () => void;
  onReset: () => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日（${
      ["日", "月", "火", "水", "木", "金", "土"][d.getDay()]
    }）`;
  }, []);
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "夜更かしですね" :
    hour < 11 ? "おはようございます" :
    hour < 18 ? "こんにちは" :
    "こんばんは";

  return (
    <section className="py-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ink-100">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-400">
          {today}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">
          {greeting}、{profile.displayName}さん。
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          本日の総合的な占断を以下にまとめました。
        </p>
      </div>
      <div className="flex gap-2 text-sm">
        <button
          onClick={onReshuffle}
          className="rounded-md border border-ink-200 px-3 py-1.5 hover:border-ink-900"
        >
          再シャッフル
        </button>
        <button
          onClick={onEdit}
          className="rounded-md border border-ink-200 px-3 py-1.5 hover:border-ink-900"
        >
          プロフィール編集
        </button>
        <button
          onClick={onReset}
          className="rounded-md border border-ink-200 px-3 py-1.5 text-ink-400 hover:text-ink-900"
        >
          リセット
        </button>
      </div>
    </section>
  );
}

// ========== Sections ==========

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
  const lucky = LUCKY[z.key];
  const compats = lucky.compatible
    .map((k) => ZODIAC.find((zz) => zz.key === k))
    .filter((x): x is Zodiac => !!x);
  return (
    <section>
      <SectionHeader en="Astrology" ja="西洋占星術" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{z.symbol}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">{z.en}</div>
            <div className="font-serif text-2xl">{z.name}</div>
            <div className="text-xs text-ink-500 mt-1">
              {z.element}・{z.quality}宮 / 守護星: {z.ruler}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{z.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
          <Kv k="ラッキーカラー" v={lucky.color} />
          <Kv k="ラッキーナンバー" v={String(lucky.number)} />
          <Kv k="ラッキーアイテム" v={lucky.item} />
          <Kv k="相性" v={compats.map((c) => c.name).join("・")} />
        </div>

        <div className="border-t border-ink-100 mt-6 pt-5">
          <div className="text-sm font-medium mb-2">本日の運勢</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">総合</span><Stars value={daily.overall} /></div>
            <div className="flex justify-between"><span className="text-ink-500">恋愛</span><Stars value={daily.love} /></div>
            <div className="flex justify-between"><span className="text-ink-500">仕事</span><Stars value={daily.work} /></div>
            <div className="flex justify-between"><span className="text-ink-500">金運</span><Stars value={daily.money} /></div>
          </div>
          <p className="mt-4 text-sm text-ink-700">{daily.message}</p>
        </div>

        <div className="border-t border-ink-100 mt-5 pt-5">
          <div className="text-xs uppercase tracking-widest text-ink-400">今月のテーマ</div>
          <p className="mt-1 text-sm text-ink-700">{lucky.monthlyTheme}</p>
        </div>
      </div>
    </section>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-ink-400">{k}</div>
      <div className="text-sm">{v}</div>
    </div>
  );
}

function NumerologySection({ result }: { result: AllResults }) {
  const { numerology: n } = result;
  const meaning = LIFE_PATH_MEANINGS[String(n.life)];
  const py = PERSONAL_YEAR_TEXT[n.personal];
  return (
    <section>
      <SectionHeader en="Numerology" ja="数秘術" />
      <div className="mt-4 space-y-3">
        <article className="rounded-xl border border-ink-100 p-6 flex gap-6 items-center">
          <div className="font-serif text-6xl tabular-nums">{n.life}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">ライフパスナンバー</div>
            <div className="text-sm text-ink-500">人生全体の傾向</div>
            {meaning && (
              <>
                <div className="font-serif text-lg mt-2">{meaning.title}</div>
                <p className="text-sm text-ink-700 mt-1">{meaning.text}</p>
              </>
            )}
          </div>
        </article>

        {py && (
          <article className="rounded-xl border border-ink-900 p-6 flex gap-6 items-center bg-ink-50">
            <div className="font-serif text-6xl tabular-nums">{n.personal}</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-400">
                パーソナルイヤー（{new Date().getFullYear()}年）
              </div>
              <div className="font-serif text-lg mt-1">{py.title}</div>
              <p className="text-sm text-ink-700 mt-1">{py.text}</p>
            </div>
          </article>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SmallNum label="誕生日数" value={n.birthday} />
          {n.hasName && <SmallNum label="表現数" value={n.expression} />}
          {n.hasName && <SmallNum label="ソウル数" value={n.soul} />}
          {n.hasName && <SmallNum label="人格数" value={n.persona} />}
        </div>
        {!n.hasName && (
          <p className="text-xs text-ink-400">
            ※ プロフィールに氏名（ローマ字）を入れると、表現数・ソウル数・人格数も計算されます。
          </p>
        )}
      </div>
    </section>
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

function ShichuSection({ result }: { result: AllResults }) {
  const s = result.shichu;
  const x = result.shichuExtras;
  const totalElements = Object.values(x.five).reduce((a, b) => a + b, 0);
  return (
    <section>
      <SectionHeader en="Shichu Suimei" ja="四柱推命" />
      <div className="mt-4 rounded-xl border border-ink-100 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <PillarCell
            label="時柱"
            pillar={s.hour}
            tongbian={x.tongbian.hour}
            twelve={x.twelve.hour}
          />
          <PillarCell
            label="日柱"
            pillar={s.day}
            twelve={x.twelve.day}
            highlight
          />
          <PillarCell
            label="月柱"
            pillar={s.month}
            tongbian={x.tongbian.month}
            twelve={x.twelve.month}
          />
          <PillarCell
            label="年柱"
            pillar={s.year}
            tongbian={x.tongbian.year}
            twelve={x.twelve.year}
          />
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

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">
            通変星（あなたから見た周囲の星）
          </div>
          <ul className="space-y-1 text-sm">
            <li>年柱: <span className="font-medium">{x.tongbian.year}</span> — <span className="text-ink-600">{TONGBIAN_TEXT[x.tongbian.year]}</span></li>
            <li>月柱: <span className="font-medium">{x.tongbian.month}</span> — <span className="text-ink-600">{TONGBIAN_TEXT[x.tongbian.month]}</span></li>
            {x.tongbian.hour && (
              <li>時柱: <span className="font-medium">{x.tongbian.hour}</span> — <span className="text-ink-600">{TONGBIAN_TEXT[x.tongbian.hour]}</span></li>
            )}
          </ul>
        </div>

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">
            十二運（人生段階）
          </div>
          <ul className="space-y-1 text-sm">
            <li>日柱: <span className="font-medium">{x.twelve.day}</span> — <span className="text-ink-600">{TWELVE_TEXT[x.twelve.day]}</span></li>
            <li>月柱: <span className="font-medium">{x.twelve.month}</span> — <span className="text-ink-600">{TWELVE_TEXT[x.twelve.month]}</span></li>
            <li>年柱: <span className="font-medium">{x.twelve.year}</span> — <span className="text-ink-600">{TWELVE_TEXT[x.twelve.year]}</span></li>
            {x.twelve.hour && (
              <li>時柱: <span className="font-medium">{x.twelve.hour}</span> — <span className="text-ink-600">{TWELVE_TEXT[x.twelve.hour]}</span></li>
            )}
          </ul>
        </div>

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-3">
            五行バランス
          </div>
          <div className="space-y-1.5">
            {(["木", "火", "土", "金", "水"] as const).map((e) => {
              const v = x.five[e];
              const pct = totalElements ? (v / totalElements) * 100 : 0;
              return (
                <div key={e} className="flex items-center gap-3 text-sm">
                  <div className="w-6 text-ink-500">{e}</div>
                  <div className="flex-1 h-2 bg-ink-100 rounded">
                    <div
                      className="h-2 bg-ink-900 rounded"
                      style={{ width: `${pct}%` }}
                    />
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
          {tongbian && (
            <div className="text-xs text-ink-500 mt-1">{tongbian}</div>
          )}
          <div className="font-serif text-3xl mt-1">{pillar.stem}</div>
          <div className="text-xs text-ink-500">{pillar.stemElement}</div>
          <div className="font-serif text-3xl mt-2">{pillar.branch}</div>
          <div className="text-xs text-ink-500">{pillar.branchElement}</div>
          {twelve && (
            <div className="text-xs text-ink-500 mt-2">{twelve}</div>
          )}
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
      <SectionHeader en="Feng Shui" ja="風水（本命卦・年運）" />
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

        <div className="border-t border-ink-100 mt-6 pt-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">
            {f.annual.year}年の年運（{f.annual.starName}）
          </div>
          <ul className="space-y-1 text-sm">
            <li>歳破方位: <span className="font-medium text-ink-700">{f.annual.saiha}</span> — 引っ越し・大事業は避ける</li>
            <li>五黄殺: <span className="font-medium text-ink-700">{f.annual.gokou}</span> — 自滅の方位、重要事項を持ち込まない</li>
            <li>暗剣殺: <span className="font-medium text-ink-700">{f.annual.anken}</span> — 他者からの災い、慎重に</li>
          </ul>
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
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {result.tarot.map((c, i) => (
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
          <p className="mt-4 text-sm text-ink-700 leading-relaxed">{iching.hex.meaning}</p>
        </div>
        {iching.changed && (
          <div className="border-t sm:border-t-0 sm:border-l border-ink-100 sm:pl-6 pt-6 sm:pt-0">
            <div className="text-xs uppercase tracking-widest text-ink-400">之卦（変化後）</div>
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
      {iching.lines.length > 0 && (
        <div className="mt-3 rounded-xl border border-ink-100 p-6">
          <div className="text-xs uppercase tracking-widest text-ink-400 mb-2">
            変爻のメッセージ（注目ポイント）
          </div>
          <ul className="space-y-2 text-sm">
            {iching.lines.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-medium w-12">
                  第{l.pos}爻
                </span>
                <span className="text-ink-700">{l.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
