"use client";

// 統合カレンダー — 開運日・要注意日(バイオリズムのゼロ通過)・六曜・節入り・
// パーソナルデイを月カレンダーに集約。今月の勝負日/養生日が一目でわかる。
// すべて決定論的算出。

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import { dayTags, rokuyo } from "@/lib/koyomi";
import { biorhythm, PRIMARY_CYCLES, isCritical, daysSinceBirth } from "@/lib/biorhythm";
import { personalDay } from "@/lib/today";
import { solarTermsOfYear } from "@/lib/astronomy";

const WJP = ["日", "月", "火", "水", "木", "金", "土"];

type DayCell = {
  date: Date;
  day: number;
  inMonth: boolean;
  rokuyoName: string | null;
  lucky: { name: string; kind: "大吉" | "吉" | "凶" }[];
  critical: boolean;          // バイオリズム(古典3)のゼロ通過
  composite: number;          // 本人の総合バイオリズム
  pd: number;
  solarTerm: string | null;
  isToday: boolean;
};

function buildMonth(year: number, month0: number, realToday: Date): DayCell[] {
  const first = new Date(year, month0, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();

  // 節入り (節のみ) の日付マップ
  const terms = solarTermsOfYear(year).filter((t) => t.isMain);
  const termByDate: Record<string, string> = {};
  for (const t of terms) {
    if (t.date.getMonth() === month0) termByDate[t.date.getDate()] = t.term;
  }

  const cells: DayCell[] = [];
  // 前月の余白
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(year, month0, 1 - (startWeekday - i));
    cells.push(emptyCell(d, false, realToday));
  }
  for (let dd = 1; dd <= daysInMonth; dd++) {
    const date = new Date(year, month0, dd);
    const k = dayTags(date);
    const r = rokuyo(date);
    const bio = biorhythm(OWNER.birth, date);
    const t = daysSinceBirth(OWNER.birth, date);
    const critical = PRIMARY_CYCLES.some((c) => isCritical(t, c.period));
    cells.push({
      date, day: dd, inMonth: true,
      rokuyoName: r?.name ?? null,
      lucky: k.tags.map((x) => ({ name: x.name, kind: x.kind })),
      critical,
      composite: bio.composite,
      pd: personalDay(OWNER.birth, year, month0 + 1, dd),
      solarTerm: termByDate[dd] ?? null,
      isToday: sameDay(date, realToday),
    });
  }
  // 翌月の余白 (7 の倍数になるまで)
  let nextd = 1;
  while (cells.length % 7 !== 0) {
    cells.push(emptyCell(new Date(year, month0 + 1, nextd++), false, realToday));
  }
  return cells;
}

function emptyCell(d: Date, inMonth: boolean, realToday: Date): DayCell {
  return { date: d, day: d.getDate(), inMonth, rokuyoName: null, lucky: [], critical: false, composite: 0, pd: 0, solarTerm: null, isToday: sameDay(d, realToday) };
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const ROKUYO_SHORT: Record<string, string> = { 大安: "大安", 仏滅: "仏滅", 先勝: "先勝", 友引: "友引", 先負: "先負", 赤口: "赤口" };

export default function CalendarPage() {
  const [realToday, setRealToday] = useState<Date | null>(null);
  useEffect(() => setRealToday(new Date()), []);

  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);
  useEffect(() => {
    const n = new Date();
    setYm({ y: n.getFullYear(), m: n.getMonth() });
  }, []);

  const cells = useMemo(() => (ym && realToday ? buildMonth(ym.y, ym.m, realToday) : []), [ym, realToday]);

  // 凡例集計: 今月の勝負日(大吉)・養生日(要注意or仏滅)
  const monthBest = cells.filter((c) => c.inMonth && c.lucky.some((l) => l.kind === "大吉"));
  const monthCare = cells.filter((c) => c.inMonth && (c.critical || c.rokuyoName === "仏滅"));

  if (!ym || !realToday) return <div className="editorial-mono text-xs opacity-50">…</div>;

  const move = (delta: number) => {
    const d = new Date(ym.y, ym.m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Calendar</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">統合カレンダー</span>
        </div>
        <h1 className="editorial-display text-[15vw] sm:text-[10vw] lg:text-[84px] leading-[0.9] uppercase break-words">
          CALENDAR
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          今月の勝負日と、養生日。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          開運日・要注意日 (バイオリズムのゼロ通過)・六曜・節入り・パーソナルデイ・
          あなたの総合リズムを 1 枚に集約。すべて決定論的算出。
        </p>
      </header>

      {/* 月ナビ */}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => move(-1)} className="tab-btn border-2 border-current px-4 py-2 editorial-mono text-xs min-h-[40px]">← 前月</button>
        <div className="editorial-display-jp text-xl sm:text-2xl">{ym.y}年 {ym.m + 1}月</div>
        <button type="button" onClick={() => move(1)} className="tab-btn border-2 border-current px-4 py-2 editorial-mono text-xs min-h-[40px]">翌月 →</button>
      </div>

      {/* カレンダー本体 */}
      <div className="border-2 border-current">
        {/* 曜日ヘッダ */}
        <div className="grid grid-cols-7 border-b-2 border-current">
          {WJP.map((w, i) => (
            <div key={w} className={`text-center py-1.5 editorial-mono text-[10px] ${i === 0 ? "opacity-90" : i === 6 ? "opacity-90" : "opacity-60"} ${i < 6 ? "border-r border-current" : ""}`}>{w}</div>
          ))}
        </div>
        {/* 日セル */}
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const hasBest = c.lucky.some((l) => l.kind === "大吉");
            const hasGood = c.lucky.some((l) => l.kind === "吉");
            const hasBad = c.lucky.some((l) => l.kind === "凶");
            return (
              <div
                key={i}
                className={`min-h-[64px] sm:min-h-[84px] p-1 border-current ${i % 7 < 6 ? "border-r" : ""} ${i < cells.length - 7 ? "border-b" : ""} ${!c.inMonth ? "opacity-30" : ""} ${c.isToday ? "tab-btn-active" : hasBest ? "" : ""}`}
                style={c.isToday ? undefined : hasBest && c.inMonth ? { background: "var(--nb-yellow, rgba(255,230,0,0.18))" } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="editorial-display text-sm leading-none">{c.day}</span>
                  {c.rokuyoName && <span className="editorial-mono text-[7px] opacity-60">{ROKUYO_SHORT[c.rokuyoName]}</span>}
                </div>
                {c.solarTerm && <div className="editorial-mono text-[7px] opacity-70 mt-0.5">{c.solarTerm}</div>}
                {/* 開運/凶タグ (短縮) */}
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {c.lucky.slice(0, 2).map((l) => (
                    <span key={l.name} className={`editorial-mono text-[7px] leading-tight px-0.5 border border-current ${l.kind === "大吉" ? "editorial-chip-dark" : l.kind === "凶" ? "opacity-50" : ""}`}>
                      {shortTag(l.name)}
                    </span>
                  ))}
                </div>
                {/* バイオリズム下帯 */}
                {c.inMonth && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {c.critical && <span className="editorial-mono text-[7px]" title="バイオリズム要注意日">⚠</span>}
                    <span className="editorial-mono text-[7px] opacity-50">P{c.pd}</span>
                    <span className="editorial-mono text-[7px] opacity-40 ml-auto">{c.composite > 0 ? "+" : ""}{c.composite}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="border border-current p-4" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-mono text-[10px] opacity-60 mb-2">凡例 ／ Legend</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 editorial-mono text-[9px]">
          <span><span className="editorial-chip-dark editorial-mono text-[7px] px-1 mr-1">天赦</span>天赦日 (最強の吉日)</span>
          <span>一粒=一粒万倍日 / 寅=寅の日</span>
          <span>⚠ = バイオリズム要注意日</span>
          <span>P数字 = パーソナルデイ</span>
          <span>末尾の数値 = 総合リズム</span>
          <span>黄背景 = 大吉日</span>
        </div>
      </div>

      {/* 今月のサマリー */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border-2 border-current p-4">
          <div className="editorial-chip text-[10px] mb-3">今月の勝負日 ／ Best Days</div>
          {monthBest.length === 0 ? (
            <p className="editorial-mono text-[10px] opacity-50">今月は大吉日なし。</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {monthBest.map((c) => (
                <li key={c.day} className="flex items-baseline gap-2">
                  <span className="editorial-display text-base w-7">{c.day}</span>
                  <span className="editorial-mono text-[9px] opacity-60">{WJP[c.date.getDay()]}</span>
                  <span className="text-xs">{c.lucky.filter((l) => l.kind !== "凶").map((l) => l.name).join("・")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-2 border-current p-4">
          <div className="editorial-chip text-[10px] mb-3">今月の養生日 ／ Care Days</div>
          {monthCare.length === 0 ? (
            <p className="editorial-mono text-[10px] opacity-50">今月は要注意日なし。</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {monthCare.map((c) => (
                <li key={c.day} className="flex items-baseline gap-2">
                  <span className="editorial-display text-base w-7">{c.day}</span>
                  <span className="editorial-mono text-[9px] opacity-60">{WJP[c.date.getDay()]}</span>
                  <span className="text-xs opacity-80">{[c.critical ? "リズム要注意" : null, c.rokuyoName === "仏滅" ? "仏滅" : null].filter(Boolean).join("・")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function shortTag(name: string): string {
  const map: Record<string, string> = {
    天赦日: "天赦", 一粒万倍日: "一粒", 寅の日: "寅", 巳の日: "巳",
    己巳の日: "己巳", 甲子の日: "甲子", 不成就日: "不成",
  };
  return map[name] ?? name;
}
