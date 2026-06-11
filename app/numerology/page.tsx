"use client";

// 数秘術 — 本人のコアナンバーズを開いた瞬間に表示。
// 任意の生年月日・名前での算出も併設。

import { useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
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

function NumBox({ label, sub, value, big }: { label: string; sub: string; value: number; big?: boolean }) {
  return (
    <div className={`border-2 border-current p-4 ${big ? "sm:col-span-2" : ""}`}>
      <div className="editorial-mono text-[10px] opacity-60">{label}</div>
      <div className="flex items-baseline gap-3 mt-1">
        <span className={`editorial-display leading-none ${big ? "text-6xl sm:text-7xl" : "text-4xl"}`}>{value}</span>
        {(value === 11 || value === 22 || value === 33) && (
          <span className="editorial-chip text-[9px]">マスターナンバー</span>
        )}
      </div>
      <p className="text-xs opacity-70 mt-2 leading-relaxed">{sub}</p>
    </div>
  );
}

export default function NumerologyPage() {
  const year = new Date().getFullYear();

  const me = useMemo(() => ({
    lp: lifePathNumber(OWNER.birth),
    soul: soulNumber(OWNER.nameRoman),
    personality: personalityNumber(OWNER.nameRoman),
    expression: expressionNumber(OWNER.nameRoman),
    birthday: birthdayNumber(OWNER.birth),
    py: personalYear(OWNER.birth, year),
  }), [year]);

  const lpMeaning = LIFE_PATH_MEANINGS[String(me.lp)];
  const pyText = PERSONAL_YEAR_TEXT[me.py];

  // 任意の相手
  const [otherBirth, setOtherBirth] = useState("");
  const [otherName, setOtherName] = useState("");
  const other = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    const lp = lifePathNumber(otherBirth);
    return {
      lp,
      meaning: LIFE_PATH_MEANINGS[String(lp)],
      birthday: birthdayNumber(otherBirth),
      py: personalYear(otherBirth, year),
      soul: otherName.trim() ? soulNumber(otherName) : null,
      expression: otherName.trim() ? expressionNumber(otherName) : null,
    };
  }, [otherBirth, otherName, year]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Numerology</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">数秘術</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          LP {me.lp}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          {lpMeaning.title} ── 数字は、生まれた日に刻まれた設計図。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          {OWNER.birth} ＋ {OWNER.nameRoman} から算出。11 はマスターナンバー (還元しない特別数)。
        </p>
      </header>

      {/* コアナンバーズ */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">コアナンバーズ ／ Core Numbers</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NumBox label="ライフパス ／ Life Path" sub="人生全体のテーマ。生年月日の全数字の和。" value={me.lp} big />
          <NumBox label="バースデー ／ Birthday" sub="生まれ持つ才能のヒント。誕生日の数字。" value={me.birthday} />
          <NumBox label="ソウル ／ Soul Urge" sub="心の奥の欲求。名前の母音の和。" value={me.soul} />
          <NumBox label="パーソナリティ" sub="外から見えるあなた。名前の子音の和。" value={me.personality} />
          <NumBox label="エクスプレッション" sub="表現と使命。名前の全文字の和。" value={me.expression} />
        </div>
      </section>

      {/* ライフパス深掘り */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">ライフパス {me.lp} ／ {lpMeaning.title}</div>
        <p className="text-sm sm:text-base leading-relaxed">{lpMeaning.text}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="border-2 border-current p-4">
            <div className="editorial-mono text-[10px] opacity-60 mb-2">強み ／ Strengths</div>
            <ul className="text-sm space-y-1.5">
              {lpMeaning.strengths.map((s) => <li key={s} className="border-l-4 border-current pl-3">{s}</li>)}
            </ul>
          </div>
          <div className="border-2 border-current p-4">
            <div className="editorial-mono text-[10px] opacity-60 mb-2">影 ／ Shadows</div>
            <ul className="text-sm space-y-1.5">
              {lpMeaning.weaknesses.map((s) => <li key={s} className="border-l-4 border-current pl-3 opacity-80">{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {([["恋愛", lpMeaning.love], ["仕事・天職", lpMeaning.career], ["人生の課題", lpMeaning.challenge], ["アドバイス", lpMeaning.advice]] as const).map(([label, text]) => (
            <div key={label} className="border-l-4 border-current pl-4">
              <div className="editorial-mono text-[10px] opacity-60">{label}</div>
              <p className="text-sm mt-1 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* パーソナルイヤー */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">{year}年のパーソナルイヤー ／ PY {me.py}</div>
        <div className="editorial-display-jp text-2xl sm:text-3xl">{pyText.title}</div>
        <p className="text-sm sm:text-base leading-relaxed mt-3">{pyText.text}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div className="border-2 border-current p-4">
            <div className="editorial-mono text-[10px] opacity-60 mb-2">やるべきこと ／ DO</div>
            <ul className="text-sm space-y-1.5">
              {pyText.doList.map((s) => <li key={s} className="border-l-4 border-current pl-3">{s}</li>)}
            </ul>
          </div>
          <div className="border-2 border-current p-4">
            <div className="editorial-mono text-[10px] opacity-60 mb-2">避けること ／ AVOID</div>
            <ul className="text-sm space-y-1.5">
              {pyText.avoidList.map((s) => <li key={s} className="border-l-4 border-current pl-3 opacity-80">{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">恋愛・家族</div>
            <p className="text-sm mt-1 leading-relaxed">{pyText.loveAdvice}</p>
          </div>
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">仕事</div>
            <p className="text-sm mt-1 leading-relaxed">{pyText.workAdvice}</p>
          </div>
        </div>
      </section>

      {/* 任意の相手 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">他の人を調べる ／ Lookup</div>
        <div className="flex flex-wrap gap-4">
          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 生年月日</span>
            <input
              type="date"
              value={otherBirth}
              onChange={(e) => setOtherBirth(e.target.value)}
              className="mt-1 block border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
            />
          </label>
          <label className="block flex-1 min-w-[200px] max-w-sm">
            <span className="editorial-mono text-[10px] opacity-70">NAME ／ ローマ字氏名 (任意)</span>
            <input
              type="text"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              placeholder="TARO YAMADA"
              className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
            />
          </label>
        </div>
        {other && (
          <div className="mt-5 border-2 border-current p-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="editorial-display text-5xl">LP {other.lp}</span>
              <span className="editorial-display-jp text-xl">{other.meaning.title}</span>
            </div>
            <p className="text-sm leading-relaxed mt-3">{other.meaning.text}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 editorial-mono text-[10px] opacity-70">
              <span>バースデー {other.birthday}</span>
              <span>{year}年 PY {other.py}</span>
              {other.soul !== null && <span>ソウル {other.soul}</span>}
              {other.expression !== null && <span>エクスプレッション {other.expression}</span>}
            </div>
            <p className="text-xs opacity-70 mt-3">
              あなた (LP {me.lp}) との関係: {other.lp === me.lp ? "同じライフパス。歩む課題が重なる同志の縁。" : `${me.lp} と ${other.lp} ── 互いのテーマを補い合える組合せ。相手の数字の課題を尊重して。`}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
