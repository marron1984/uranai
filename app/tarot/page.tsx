"use client";

// タロット — 開いた瞬間に「今日の3枚」(本人×日付シードの決定論引き) を表示。
// 自分でシャッフルして引き直す手動スプレッドも併設。

import { useEffect, useMemo, useState } from "react";
import { OWNER } from "@/lib/owner";
import {
  drawCardsFull,
  drawCardsFullSeeded,
  SPREAD_LABELS,
  type Spread,
  type DrawnCard,
} from "@/lib/tarot";

function ownerDateSeed(date: Date): number {
  const birthSeed = OWNER.birth.replace(/-/g, "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  const ds = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return (birthSeed ^ (ds * 2654435761)) >>> 0;
}

function CardBlock({ card, position }: { card: DrawnCard; position: string }) {
  const detail = card.isReversed ? card.reversedDetail : card.uprightDetail;
  const love = card.isReversed ? card.loveReversed : card.loveUpright;
  const work = card.isReversed ? card.workReversed : card.workUpright;
  return (
    <div className="border-2 border-current p-4 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="editorial-chip text-[9px]">{position}</span>
        <span className={`editorial-mono text-[9px] ${card.isReversed ? "opacity-90" : "opacity-50"}`}>
          {card.isReversed ? "逆位置 ▼" : "正位置 ▲"}
        </span>
      </div>
      <div className="mt-3">
        <div className="editorial-display-jp text-2xl leading-tight">{card.name}</div>
        <div className="editorial-mono text-[9px] opacity-60 mt-1">{card.en}</div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {card.keywords.map((k) => (
          <span key={k} className="editorial-mono text-[9px] border border-current px-2 py-0.5">{k}</span>
        ))}
      </div>
      <p className="text-sm leading-relaxed mt-3">{detail}</p>
      <div className="mt-3 space-y-2 text-xs opacity-85">
        <p><span className="editorial-mono text-[9px] opacity-60 mr-1.5">恋愛</span>{love}</p>
        <p><span className="editorial-mono text-[9px] opacity-60 mr-1.5">仕事</span>{work}</p>
      </div>
      <p className="text-xs leading-relaxed mt-3 pt-3 border-t border-current opacity-90">
        <span className="editorial-mono text-[9px] opacity-60 mr-1.5">助言</span>{card.advice}
      </p>
    </div>
  );
}

export default function TarotPage() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  // 今日の3枚 (決定論: 同じ日に開けば同じカード)
  const dailyCards = useMemo(
    () => (today ? drawCardsFullSeeded(3, ownerDateSeed(today)) : null),
    [today]
  );

  // 手動引き
  const [spread, setSpread] = useState<Spread>("three");
  const [manual, setManual] = useState<DrawnCard[] | null>(null);
  const labels = SPREAD_LABELS[spread];

  return (
    <div className="space-y-10">
      <header className="border-b border-current pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="editorial-chip text-[10px] sm:text-xs">Tarot</span>
          <span className="editorial-chip editorial-chip-dark text-[10px] sm:text-xs">タロット</span>
        </div>
        <h1 className="editorial-display text-[16vw] sm:text-[10vw] lg:text-[90px] leading-[0.9] uppercase break-words">
          TAROT
        </h1>
        <p className="editorial-display-jp text-xl sm:text-3xl mt-3 leading-snug">
          78枚が映す、今日のあなたの物語。
        </p>
        <p className="editorial-mono text-[10px] mt-3 opacity-70 max-w-xl leading-relaxed">
          「今日の3枚」は生年月日×日付のシードで引く決定論スプレッド (同じ日は何度開いても同じ)。
          下段では自分の手でシャッフルして引き直せます。
        </p>
      </header>

      {/* 今日の3枚 */}
      {dailyCards && (
        <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="editorial-chip text-[10px] sm:text-xs">今日の3枚 ／ Daily Spread</div>
            <span className="editorial-mono text-[9px] opacity-50">過去 → 現在 → 未来 ／ 日替わり固定</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {dailyCards.map((c, i) => (
              <CardBlock key={`${c.en}-${i}`} card={c} position={SPREAD_LABELS.three[i]} />
            ))}
          </div>
        </section>
      )}

      {/* 手動で引く */}
      <section className="border border-current p-5 sm:p-8" style={{ background: "var(--card-bg-elevated, var(--background))" }}>
        <div className="editorial-chip mb-4 text-[10px] sm:text-xs">自分の手で引く ／ Manual Draw</div>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="block">
            <span className="editorial-mono text-[10px] opacity-70">SPREAD ／ スプレッド</span>
            <select
              value={spread}
              onChange={(e) => setSpread(e.target.value as Spread)}
              className="mt-1 block border border-current px-3 py-3 bg-transparent focus:outline-none editorial-display-jp text-base min-h-[44px]"
            >
              <option value="one">ワンカード（今のあなた）</option>
              <option value="three">スリーカード（過去・現在・未来）</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setManual(drawCardsFull(labels.length))}
            className="tab-btn border-2 border-current px-5 py-3 editorial-display-jp text-base min-h-[44px]"
          >
            {manual ? "引き直す" : "カードを引く"}
          </button>
        </div>
        {manual && (
          <div className={`grid gap-4 mt-6 ${manual.length === 1 ? "sm:max-w-md" : "sm:grid-cols-3"}`}>
            {manual.map((c, i) => (
              <CardBlock key={`${c.en}-${i}-${c.isReversed}`} card={c} position={SPREAD_LABELS[spread][i]} />
            ))}
          </div>
        )}
        <p className="editorial-mono text-[9px] opacity-50 mt-4">
          手動引きは完全ランダム。問いを心に固定して、1呼吸おいてから引くこと。
        </p>
      </section>
    </div>
  );
}
