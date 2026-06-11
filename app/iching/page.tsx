"use client";

// 易経 — 開いた瞬間に「今日のあなたの卦」(生年月日×日付シードの決定論) を表示。
// 問いを立てて手動で立卦するコイン3枚法も併設。

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  castHexagram,
  hexagramFromYaos,
  changedHexagram,
  changingLineMeanings,
  trigramName,
  type Yao,
} from "@/lib/iching";
import { todayPersonalHexagram } from "@/lib/today";

function HexFigure({ yaos }: { yaos: Yao[] }) {
  // 爻を太いバーで描画 (陽 = 一本線・陰 = 中央が切れた線)
  return (
    <div className="inline-flex flex-col gap-1.5">
      {[...yaos].reverse().map((y, i) => (
        <div key={i} className="flex items-center gap-2">
          {y.isYang ? (
            <span className="inline-block w-24 sm:w-28 h-2.5 bg-current" />
          ) : (
            <span className="inline-flex w-24 sm:w-28 gap-2">
              <span className="inline-block flex-1 h-2.5 bg-current" />
              <span className="inline-block flex-1 h-2.5 bg-current" />
            </span>
          )}
          {y.isChanging && <span className="editorial-mono text-[9px]">変</span>}
        </div>
      ))}
    </div>
  );
}

function HexReading({ yaos, title }: { yaos: Yao[]; title: string }) {
  const hex = hexagramFromYaos(yaos);
  const changed = changedHexagram(yaos);
  const lines = changingLineMeanings(yaos);
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <div className="editorial-mono text-[10px] opacity-60">{title}</div>
        <div className="editorial-display-jp text-3xl mt-1">
          {hex.num}. {hex.name}
        </div>
        <div className="editorial-mono text-[10px] opacity-60">{hex.reading}</div>
        <div className="mt-4"><HexFigure yaos={yaos} /></div>
        <div className="editorial-mono text-[9px] opacity-50 mt-2">
          上卦 {trigramName(yaos, "upper")} ／ 下卦 {trigramName(yaos, "lower")}
        </div>
        <p className="text-sm leading-relaxed mt-4">{hex.meaning}</p>
        {hex.image && <p className="text-xs opacity-70 mt-2 leading-relaxed">象: {hex.image}</p>}
        {hex.judgment && <p className="text-xs opacity-70 mt-1 leading-relaxed">断: {hex.judgment}</p>}
        {hex.advice && (
          <p className="text-sm leading-relaxed mt-3 pt-3 border-t border-current">
            <span className="editorial-mono text-[9px] opacity-60 mr-1.5">助言</span>{hex.advice}
          </p>
        )}
      </div>
      <div className="border-t sm:border-t-0 sm:border-l border-current sm:pl-6 pt-6 sm:pt-0">
        {changed ? (
          <>
            <div className="editorial-mono text-[10px] opacity-60">之卦 (変化の行き先)</div>
            <div className="editorial-display-jp text-3xl mt-1">
              {changed.hex.num}. {changed.hex.name}
            </div>
            <div className="editorial-mono text-[10px] opacity-60">{changed.hex.reading}</div>
            <div className="mt-4"><HexFigure yaos={changed.yaos} /></div>
            <p className="text-sm leading-relaxed mt-4">{changed.hex.meaning}</p>
            {lines.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="editorial-mono text-[10px] opacity-60">変爻の意味</div>
                {lines.map((l) => (
                  <p key={l.pos} className="text-xs leading-relaxed border-l-4 border-current pl-3">
                    <span className="editorial-mono text-[9px] opacity-60 mr-1">第{l.pos}爻</span>{l.text}
                  </p>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="editorial-mono text-[10px] opacity-60">之卦</div>
            <p className="text-sm leading-relaxed mt-3 opacity-70">
              変爻なし ── 卦は安定しており、状況は当面このまま続く。本卦の意味をまっすぐ受け取ること。
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function IChingPage() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  // 今日のパーソナル卦 (決定論)
  const daily = useMemo(() => (today ? todayPersonalHexagram(OWNER.birth, today) : null), [today]);

  // 手動立卦
  const [question, setQuestion] = useState("");
  const [manualYaos, setManualYaos] = useState<Yao[] | null>(null);

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">I Ching</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">易経</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          {daily ? daily.hex.name : "易"}
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          64卦が読む、変化の兆し。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          「今日の卦」は生年月日×日付シードのコイン3枚法 (決定論・同じ日は同じ卦)。
          下段では問いを立てて自分の手で立卦できます。
        </p>
      </header>

      {/* 今日のあなたの卦 */}
      {daily && (
        <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
          <div className="editorial-chip mb-5 text-[10px] sm:text-xs">今日のあなたの卦 ／ Daily Hexagram</div>
          <HexReading yaos={daily.yaos} title="本卦 (今日の状況)" />
        </section>
      )}

      {/* 問いを立てて引く */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">問いを立てて引く ／ Manual Cast</div>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="block flex-1 min-w-[220px] max-w-md">
            <span className="editorial-mono text-[10px] opacity-70">QUESTION ／ 問い (任意)</span>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例: 今の仕事を続けるべきか"
              className="mt-1 w-full border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
            />
          </label>
          <button
            type="button"
            onClick={() => setManualYaos(castHexagram())}
            className="tab-btn border-2 border-current px-5 py-3 editorial-display-jp text-base min-h-[44px]"
          >
            {manualYaos ? "立て直す" : "卦を立てる"}
          </button>
        </div>
        {manualYaos && (
          <div className="mt-6">
            {question && (
              <p className="editorial-mono text-[10px] opacity-70 mb-4">問い: {question}</p>
            )}
            <HexReading yaos={manualYaos} title="本卦 (問いへの答え)" />
          </div>
        )}
        <p className="editorial-mono text-[9px] opacity-50 mt-4">
          コイン3枚法: 裏=2・表=3 の和 (6=老陰・7=少陽・8=少陰・9=老陽)。老陰と老陽が変爻になる。
        </p>
      </section>
    </div>
  );
}
