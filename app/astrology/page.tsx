"use client";

import { useState } from "react";
import { getSunSign, getDailyFortune } from "@/lib/astrology";

function Stars({ value }: { value: number }) {
  return (
    <span className="tracking-widest">
      {"★".repeat(value)}
      <span className="text-ink-200">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function AstrologyPage() {
  const [date, setDate] = useState("");
  const [result, setResult] = useState<ReturnType<typeof getSunSign> | null>(
    null
  );
  const [fortune, setFortune] = useState<ReturnType<typeof getDailyFortune> | null>(
    null
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const d = new Date(date);
    const sign = getSunSign(d.getMonth() + 1, d.getDate());
    setResult(sign);
    setFortune(getDailyFortune(sign.key, new Date()));
  };

  return (
    <div>
      <header className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-400">
          Astrology
        </div>
        <h1 className="font-serif text-3xl mt-1">西洋占星術</h1>
        <p className="text-sm text-ink-500 mt-2">
          生年月日から太陽星座を導き、本日の運勢を占います。
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end mb-10">
        <label className="block">
          <span className="text-xs text-ink-500">生年月日</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="block mt-1 rounded-md border border-ink-200 px-3 py-2 focus:outline-none focus:border-ink-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-ink-900 text-white px-5 py-2 hover:bg-ink-700"
        >
          占う
        </button>
      </form>

      {result && fortune && (
        <section className="rounded-xl border border-ink-100 p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{result.symbol}</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-400">
                {result.en}
              </div>
              <div className="font-serif text-2xl">{result.name}</div>
              <div className="text-xs text-ink-500 mt-1">
                {result.element}・{result.quality}宮 / 守護星: {result.ruler}
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink-700">
            {result.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {result.traits.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full border border-ink-200 text-ink-600"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="border-t border-ink-100 mt-6 pt-6">
            <div className="text-sm font-medium mb-3">本日の運勢</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">総合</span>
                <Stars value={fortune.overall} />
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">恋愛</span>
                <Stars value={fortune.love} />
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">仕事</span>
                <Stars value={fortune.work} />
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">金運</span>
                <Stars value={fortune.money} />
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-700">{fortune.message}</p>
          </div>
        </section>
      )}
    </div>
  );
}
