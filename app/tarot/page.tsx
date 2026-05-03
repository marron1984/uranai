"use client";

import { useState } from "react";
import { drawCards, SPREAD_LABELS, type Spread, type DrawnCard } from "@/lib/tarot";

export default function TarotPage() {
  const [spread, setSpread] = useState<Spread>("three");
  const [cards, setCards] = useState<DrawnCard[]>([]);

  const onDraw = () => {
    const n = SPREAD_LABELS[spread].length;
    setCards(drawCards(n));
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-400">
          Tarot
        </div>
        <h1 className="font-serif text-3xl mt-1">タロット</h1>
        <p className="text-sm text-ink-500 mt-2">
          大アルカナ22枚から、心を落ち着けて引きましょう。
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3 mb-8">
        <label className="block">
          <span className="text-xs text-ink-500">スプレッド</span>
          <select
            value={spread}
            onChange={(e) => {
              setSpread(e.target.value as Spread);
              setCards([]);
            }}
            className="block mt-1 rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          >
            <option value="one">ワンオラクル（1枚）</option>
            <option value="three">スリーカード（過去・現在・未来）</option>
          </select>
        </label>
        <button
          onClick={onDraw}
          className="rounded-md bg-ink-900 text-white px-5 py-2 hover:bg-ink-700"
        >
          カードを引く
        </button>
      </div>

      {cards.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <article
              key={i}
              className="rounded-xl border border-ink-100 p-5 flex flex-col"
            >
              <div className="text-xs uppercase tracking-widest text-ink-400">
                {SPREAD_LABELS[spread][i]}
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
        </section>
      )}
    </div>
  );
}

function romanize(n: number): string {
  if (n === 0) return "0";
  const map: [number, string][] = [
    [20, "XX"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
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
