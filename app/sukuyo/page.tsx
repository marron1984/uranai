"use client";

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  MANSIONS,
  birthMansion,
  todayMansion,
  dailyRelation,
  mansionCompat,
  type Mansion,
} from "@/lib/sukuyo";

export default function SukuyoPage() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const myMansion = useMemo(() => birthMansion(OWNER.birth, OWNER.hour), []);
  const tMansion = useMemo(() => (today ? todayMansion(today) : null), [today]);
  const rel = useMemo(() => (tMansion ? dailyRelation(myMansion, tMansion) : null), [myMansion, tMansion]);

  // 家族
  const wifeMansion = useMemo(() => birthMansion(OWNER.family.spouse.birth, 12), []);
  const childMansion = useMemo(() => birthMansion(OWNER.family.child.birth, 12), []);
  const wifeCompat = useMemo(() => mansionCompat(myMansion, wifeMansion), [myMansion, wifeMansion]);
  const childCompat = useMemo(() => mansionCompat(myMansion, childMansion), [myMansion, childMansion]);

  // 任意の相手
  const [otherBirth, setOtherBirth] = useState("");
  const otherMansion = useMemo<Mansion | null>(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(otherBirth)) return null;
    try { return birthMansion(otherBirth, 12); } catch { return null; }
  }, [otherBirth]);
  const otherCompat = useMemo(() => (otherMansion ? mansionCompat(myMansion, otherMansion) : null), [myMansion, otherMansion]);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Sukuyo</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">宿曜占星術</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          27<br />MANSIONS
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          月が刻む二十七の宿。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          出生時の月の恒星黄経 (Meeus 月理論 + Lahiri 歳差補正) から本命宿を算出。
          空海が唐から持ち帰った密教占星術。
        </p>
      </header>

      {/* 本命宿 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">本命宿 ／ Birth Mansion</div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <div className="editorial-display-jp text-5xl sm:text-7xl">{myMansion.name}</div>
          <div>
            <div className="editorial-mono text-xs opacity-60">{myMansion.reading}</div>
            <div className="editorial-display-jp text-lg sm:text-xl mt-1">{myMansion.nature}</div>
          </div>
        </div>
        <p className="text-sm sm:text-base leading-relaxed mt-5">{myMansion.traits}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">適職</div>
            <div className="text-sm mt-1">{myMansion.career}</div>
          </div>
          <div className="border-l-4 border-current pl-4">
            <div className="editorial-mono text-[10px] opacity-60">恋愛</div>
            <div className="text-sm mt-1">{myMansion.love}</div>
          </div>
        </div>
      </section>

      {/* 今日の宿と関係 */}
      {tMansion && rel && (
        <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
          <div className="editorial-chip mb-4 text-[10px] sm:text-xs">今日の運勢 ／ Daily</div>
          <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
            <div>
              <div className="editorial-mono text-[10px] opacity-60">今日の宿</div>
              <div className="editorial-display-jp text-3xl sm:text-4xl">{tMansion.name}</div>
            </div>
            <div className="editorial-display text-2xl opacity-40">→</div>
            <div>
              <div className="editorial-mono text-[10px] opacity-60">本命宿との関係</div>
              <div className="flex items-baseline gap-3">
                <span className="editorial-display-jp text-4xl sm:text-5xl">{rel.name}</span>
                <span className={`editorial-chip text-[10px] ${rel.kind === "大吉" || rel.kind === "吉" ? "editorial-chip-dark" : ""}`}>{rel.kind}</span>
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed mt-5">{rel.meaning}</p>
        </section>
      )}

      {/* 家族の宿 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">家族の宿 ／ Family</div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "妻", m: wifeMansion, c: wifeCompat },
            { label: "子", m: childMansion, c: childCompat },
          ].map(({ label, m, c }) => (
            <div key={label} className="border-2 border-current p-4">
              <div className="editorial-mono text-[10px] opacity-60">{label}</div>
              <div className="editorial-display-jp text-2xl mt-1">{m.name} <span className="text-sm opacity-60">({m.nature})</span></div>
              <p className="text-xs mt-2 opacity-80 leading-relaxed">{c.summary}</p>
              <div className="editorial-mono text-[9px] mt-2 opacity-50">
                あなた→{label}: {c.relation.name} ／ {label}→あなた: {c.reverse.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 任意の相手との相性 */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">相性を調べる ／ Compatibility</div>
        <label className="block max-w-xs">
          <span className="editorial-mono text-[10px] opacity-70">BIRTH ／ 相手の生年月日</span>
          <input
            type="date"
            value={otherBirth}
            onChange={(e) => setOtherBirth(e.target.value)}
            className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
          />
        </label>
        {otherMansion && otherCompat && (
          <div className="mt-5 border-2 border-current p-4">
            <div className="editorial-display-jp text-2xl">{otherMansion.name} <span className="text-sm opacity-60">({otherMansion.nature})</span></div>
            <p className="text-sm mt-2 leading-relaxed">{otherCompat.summary}</p>
            <div className="editorial-mono text-[10px] mt-2 opacity-60">
              あなた→相手: {otherCompat.relation.name} [{otherCompat.relation.kind}] ／ 相手→あなた: {otherCompat.reverse.name} [{otherCompat.reverse.kind}]
            </div>
          </div>
        )}
      </section>

      {/* 27 宿一覧 */}
      <section>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">二十七宿一覧 ／ All Mansions</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MANSIONS.map((m) => (
            <div
              key={m.index}
              className={`border-2 border-current p-3 ${m.index === myMansion.index ? "tab-btn-active" : ""}`}
            >
              <div className="editorial-display-jp text-lg">{m.name}{m.index === myMansion.index && " ★"}</div>
              <div className="editorial-mono text-[9px] opacity-60">{m.nature}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
