"use client";

// 西洋占星術 — 本人の太陽星座を開いた瞬間に表示するパーソナルページ
// (旧: 空の入力フォームのみ → 本人データ自動表示 + 任意の相手の検索を併設)

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import { ZODIAC, LUCKY, getSunSign, getDailyFortune, type Zodiac } from "@/lib/astrology";

function Stars({ value }: { value: number }) {
  return (
    <span className="tracking-widest text-base">
      {"★".repeat(value)}
      <span className="opacity-25">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function zodiacByKey(key: string): Zodiac {
  return ZODIAC.find((z) => z.key === key) ?? ZODIAC[0];
}

export default function AstrologyPage() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const mySign = useMemo(() => zodiacByKey(OWNER.natal.sun), []);
  const myLucky = LUCKY[mySign.key];
  const myFortune = useMemo(() => (today ? getDailyFortune(mySign.key, today) : null), [today, mySign.key]);

  const wifeSign = useMemo(() => zodiacByKey(OWNER.family.spouse.sunSign), []);
  const childSign = useMemo(() => zodiacByKey(OWNER.family.child.sunSign), []);

  // 任意の相手
  const [otherBirth, setOtherBirth] = useState("");
  const other = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    const [, m, d] = otherBirth.split("-").map(Number);
    return getSunSign(m, d);
  }, [otherBirth]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Astrology</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">西洋占星術</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          {mySign.en}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          {mySign.symbol} 太陽は{mySign.name}に。生まれた日の空が、性格の核を語る。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          黄道12宮を太陽の通過日で判定。{OWNER.birth} 生まれ → {mySign.name} ({mySign.element}・{mySign.quality}宮)。
        </p>
      </header>

      {/* あなたの星座 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">あなたの太陽星座 ／ Sun Sign</div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-6xl leading-none">{mySign.symbol}</span>
          <div>
            <div className="editorial-display-jp text-3xl sm:text-5xl">{mySign.name}</div>
            <div className="editorial-mono text-xs opacity-60 mt-1">
              {mySign.element}の{mySign.quality}宮 ／ 守護星 {mySign.ruler}
            </div>
          </div>
        </div>
        <p className="text-sm sm:text-base leading-relaxed mt-5">{mySign.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {mySign.traits.map((t) => (
            <span key={t} className="editorial-chip text-[10px]">{t}</span>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="border-2 border-current p-4">
            <div className="editorial-mono text-[10px] opacity-60 mb-2">強み ／ Strengths</div>
            <ul className="text-sm space-y-1.5">
              {mySign.strengths.map((s) => <li key={s} className="border-l-4 border-current pl-3">{s}</li>)}
            </ul>
          </div>
          <div className="border-2 border-current p-4">
            <div className="editorial-mono text-[10px] opacity-60 mb-2">影 ／ Shadows</div>
            <ul className="text-sm space-y-1.5">
              {mySign.weaknesses.map((s) => <li key={s} className="border-l-4 border-current pl-3 opacity-80">{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {([["恋愛・パートナーシップ", mySign.love], ["仕事・天職", mySign.career], ["人生の課題", mySign.challenge], ["アドバイス", mySign.advice]] as const).map(([label, text]) => (
            <div key={label} className="border-l-4 border-current pl-4">
              <div className="editorial-mono text-[10px] opacity-60">{label}</div>
              <p className="text-sm mt-1 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 今日の運勢 */}
      {myFortune && (
        <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
          <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今日の運勢 ／ Today</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([["総合", myFortune.overall], ["恋愛", myFortune.love], ["仕事", myFortune.work], ["金運", myFortune.money]] as const).map(([label, v]) => (
              <div key={label} className="border-2 border-current p-3">
                <div className="editorial-mono text-[10px] opacity-60">{label}</div>
                <div className="mt-1"><Stars value={v} /></div>
              </div>
            ))}
          </div>
          <p className="text-sm sm:text-base leading-relaxed mt-5">{myFortune.message}</p>
        </section>
      )}

      {/* ラッキー要素 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">ラッキー ／ Lucky</div>
        <div className="grid grid-cols-3 gap-3">
          {([["色", myLucky.color], ["数字", String(myLucky.number)], ["アイテム", myLucky.item]] as const).map(([label, v]) => (
            <div key={label} className="border-2 border-current p-3">
              <div className="editorial-mono text-[10px] opacity-60">{label}</div>
              <div className="editorial-display-jp text-base sm:text-xl mt-1 leading-tight">{v}</div>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed mt-4 opacity-90">今月のテーマ: {myLucky.monthlyTheme}</p>
        <p className="editorial-mono text-[9px] opacity-50 mt-2">
          相性の良い星座: {myLucky.compatible.map((k) => zodiacByKey(k).name).join(" ／ ")}
        </p>
      </section>

      {/* 家族の星座 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">家族の星座 ／ Family</div>
        <div className="grid sm:grid-cols-2 gap-4">
          {([["妻", wifeSign], ["子", childSign]] as const).map(([label, sign]) => (
            <div key={label} className="border-2 border-current p-4">
              <div className="editorial-mono text-[10px] opacity-60">{label}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl">{sign.symbol}</span>
                <span className="editorial-display-jp text-2xl">{sign.name}</span>
              </div>
              <p className="text-xs leading-relaxed mt-2 opacity-80">{sign.description}</p>
              {myLucky.compatible.includes(sign.key) && (
                <p className="editorial-mono text-[9px] mt-2 opacity-70">★ {mySign.name}と好相性の星座</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 任意の相手 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">他の生年月日で調べる ／ Lookup</div>
        <label className="block max-w-xs">
          <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 生年月日</span>
          <input
            type="date"
            value={otherBirth}
            onChange={(e) => setOtherBirth(e.target.value)}
            className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
          />
        </label>
        {other && today && (
          <div className="mt-5 border-2 border-current p-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{other.symbol}</span>
              <div>
                <div className="editorial-display-jp text-2xl">{other.name}</div>
                <div className="editorial-mono text-[10px] opacity-60">
                  {other.element}の{other.quality}宮 ／ 守護星 {other.ruler}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mt-3">{other.description}</p>
            <p className="text-xs opacity-70 mt-2">
              {mySign.name}との相性: {myLucky.compatible.includes(other.key) ? "★ 好相性 — エレメントの流れが噛み合う組合せ。" : "中立 — エレメントの違いを尊重すれば良い関係に。"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
